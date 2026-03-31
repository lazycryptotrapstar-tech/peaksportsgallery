import React, { useState, useRef, useEffect } from 'react'
import { useSchool } from '../../context/SchoolContext'
import { MEMBERSHIP_TIERS, getBundleDeal } from '../../data/tiers'
import { ShieldCheck, CheckCircle2, QrCode, MessageCircle, X, Send } from 'lucide-react'

const N8N_WEBHOOK = 'https://n8n-production-f9c2.up.railway.app/webhook/sales-agent'

// ── Wofford real ticket inventory ────────────────────────────────────────────
// Prices match actual Wofford athletics pricing as of 2025 season
// type: season | single | group | parking

// ── Gibbs Stadium real sections (matches stadium map) ────────────────────────
// H9/H10/H11 = premium bench back boxes (elevated, 50-yd line)
// H1-H8      = home bleacher sections
// V1-V3      = visitor side
// Pricing: Bench Back (H9-H11) $211 season/$40 single | Bench (H1-H8) $135/$30

const FOOTBALL_SECTIONS = [
  // Premium Bench Back — H9, H10, H11 (elevated boxes, 50-yd line area)
  { id: 'H9',      label: 'H9',     zone: 'bench_back', name: 'Section H9 — Bench Back',  price: 40,  seasonPrice: 211, type: 'single', status: 'MED',  desc: 'Premium elevated box · Home sideline · 40-50 yd line · Gibbs Stadium' },
  { id: 'H10',     label: 'H10',    zone: 'bench_back', name: 'Section H10 — Bench Back', price: 40,  seasonPrice: 211, type: 'single', status: 'LOW',  desc: 'Premium elevated box · Home sideline · Center 50 yd line · Gibbs Stadium' },
  { id: 'H11',     label: 'H11',    zone: 'bench_back', name: 'Section H11 — Bench Back', price: 40,  seasonPrice: 211, type: 'single', status: 'MED',  desc: 'Premium elevated box · Home sideline · 40-50 yd line · Gibbs Stadium' },
  // Home Bleacher — H1 through H8
  { id: 'H1',      label: 'H1',     zone: 'bleacher',   name: 'Section H1 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Home bleacher · South end · Gibbs Stadium' },
  { id: 'H2',      label: 'H2',     zone: 'bleacher',   name: 'Section H2 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Home bleacher · South end · Gibbs Stadium' },
  { id: 'H3',      label: 'H3',     zone: 'bleacher',   name: 'Section H3 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'MED',  desc: 'Home bleacher · 30-40 yd line · Gibbs Stadium' },
  { id: 'H4',      label: 'H4',     zone: 'bleacher',   name: 'Section H4 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'MED',  desc: 'Home bleacher · 40-50 yd line · Gibbs Stadium' },
  { id: 'H5',      label: 'H5',     zone: 'bleacher',   name: 'Section H5 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Home bleacher · Center 50 yd line · Gibbs Stadium' },
  { id: 'H6',      label: 'H6',     zone: 'bleacher',   name: 'Section H6 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Home bleacher · 40-50 yd line · Gibbs Stadium' },
  { id: 'H7',      label: 'H7',     zone: 'bleacher',   name: 'Section H7 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'MED',  desc: 'Home bleacher · 30-40 yd line · Gibbs Stadium' },
  { id: 'H8',      label: 'H8',     zone: 'bleacher',   name: 'Section H8 — Bleacher',    price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Home bleacher · North end · Gibbs Stadium' },
  // Visitor side
  { id: 'V1',      label: 'V1',     zone: 'visitor',    name: 'Section V1 — Visitor',     price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Visitor side bleacher · South end · Gibbs Stadium' },
  { id: 'V2',      label: 'V2',     zone: 'visitor',    name: 'Section V2 — Visitor',     price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Visitor side bleacher · Center · Gibbs Stadium' },
  { id: 'V3',      label: 'V3',     zone: 'visitor',    name: 'Section V3 — Visitor',     price: 30,  seasonPrice: 135, type: 'single', status: 'HIGH', desc: 'Visitor side bleacher · North end · Gibbs Stadium' },
  // Season passes (separate purchase type)
  { id: 'FB_SS_BB', label: 'SEASON PASS', zone: 'season_pass', name: 'Bench Back Season Pass', price: 211, type: 'season', status: 'MED',  desc: 'Full 2025 season · H9/H10/H11 premium sections · Best home sideline view' },
  { id: 'FB_SS_B',  label: 'SEASON PASS', zone: 'season_pass', name: 'Bench Season Pass',      price: 135, type: 'season', status: 'HIGH', desc: 'Full 2025 season · H1-H8 home bleacher sections' },
  // Group & Parking
  { id: 'FB_GRP',  label: 'GROUP',  zone: 'group',      name: 'Group Tickets (10+)',      price: 15,  type: 'group',   status: 'LOW',  desc: 'Groups of 10 or more · Youth sports, churches, businesses · Contact rep' },
  { id: 'FB_PARK', label: 'PARK',   zone: 'parking',    name: 'Gameday Parking',          price: 20,  type: 'parking', status: 'MED',  desc: 'Reserved parking · Lots G1 and G4 · Adjacent to Gibbs Stadium' },
]

// ── Jerry Richardson Indoor Stadium sections ──────────────────────────────────
// Premium  = courtside + lower bowl sideline (closest to court)
// Scholar  = scholarship seating (upper sideline)
// Reserved = all other sections (corners, ends, upper)

const BASKETBALL_SECTIONS = [
  // Courtside / Premium lower bowl
  { id: 'CS_N',  label: 'CS-N',  zone: 'premium',    name: 'Courtside North',          price: 22,  seasonPrice: 340, type: 'single', status: 'LOW',  desc: 'Courtside · North sideline · Best seats in Jerry Richardson Indoor Stadium' },
  { id: 'CS_S',  label: 'CS-S',  zone: 'premium',    name: 'Courtside South',          price: 22,  seasonPrice: 340, type: 'single', status: 'LOW',  desc: 'Courtside · South sideline · Jerry Richardson Indoor Stadium' },
  { id: 'LB_N',  label: 'LB-N',  zone: 'premium',    name: 'Lower Bowl North',         price: 22,  seasonPrice: 340, type: 'single', status: 'MED',  desc: 'Lower bowl · North sideline · Premium view · Jerry Richardson Indoor Stadium' },
  { id: 'LB_S',  label: 'LB-S',  zone: 'premium',    name: 'Lower Bowl South',         price: 22,  seasonPrice: 340, type: 'single', status: 'MED',  desc: 'Lower bowl · South sideline · Premium view · Jerry Richardson Indoor Stadium' },
  // Scholarship seating
  { id: 'SCH_N', label: 'SCH-N', zone: 'scholarship', name: 'Scholarship North',        price: 18,  seasonPrice: 240, type: 'single', status: 'MED',  desc: 'Scholarship seating · North upper sideline · Jerry Richardson Indoor Stadium' },
  { id: 'SCH_S', label: 'SCH-S', zone: 'scholarship', name: 'Scholarship South',        price: 18,  seasonPrice: 240, type: 'single', status: 'MED',  desc: 'Scholarship seating · South upper sideline · Jerry Richardson Indoor Stadium' },
  // Reserved — ends and corners
  { id: 'END_E', label: 'END-E', zone: 'reserved',   name: 'East End',                 price: 18,  seasonPrice: 190, type: 'single', status: 'HIGH', desc: 'Reserved · East end · Behind basket · Jerry Richardson Indoor Stadium' },
  { id: 'END_W', label: 'END-W', zone: 'reserved',   name: 'West End',                 price: 18,  seasonPrice: 190, type: 'single', status: 'HIGH', desc: 'Reserved · West end · Behind basket · Jerry Richardson Indoor Stadium' },
  { id: 'CRN_NE',label: 'NE',    zone: 'reserved',   name: 'Corner NE',                price: 18,  seasonPrice: 190, type: 'single', status: 'HIGH', desc: 'Reserved · Northeast corner · Jerry Richardson Indoor Stadium' },
  { id: 'CRN_NW',label: 'NW',    zone: 'reserved',   name: 'Corner NW',                price: 18,  seasonPrice: 190, type: 'single', status: 'HIGH', desc: 'Reserved · Northwest corner · Jerry Richardson Indoor Stadium' },
  { id: 'CRN_SE',label: 'SE',    zone: 'reserved',   name: 'Corner SE',                price: 18,  seasonPrice: 190, type: 'single', status: 'HIGH', desc: 'Reserved · Southeast corner · Jerry Richardson Indoor Stadium' },
  { id: 'CRN_SW',label: 'SW',    zone: 'reserved',   name: 'Corner SW',                price: 18,  seasonPrice: 190, type: 'single', status: 'HIGH', desc: 'Reserved · Southwest corner · Jerry Richardson Indoor Stadium' },
  // Season passes
  { id: 'MBB_SS_P',  label: 'SEASON', zone: 'season_pass', name: 'Premium Season Pass',     price: 340, type: 'season', status: 'LOW',  desc: 'Full 2025-26 season · Courtside and lower bowl · Best seats in arena' },
  { id: 'MBB_SS_SS', label: 'SEASON', zone: 'season_pass', name: 'Scholarship Season Pass',  price: 240, type: 'season', status: 'MED',  desc: 'Full 2025-26 season · Scholarship seating · Priority donor recognition' },
  { id: 'MBB_SS_R',  label: 'SEASON', zone: 'season_pass', name: 'Reserved Season Pass',     price: 190, type: 'season', status: 'HIGH', desc: 'Full 2025-26 season · Reserved general seating · All home games' },
  // Group
  { id: 'MBB_GRP', label: 'GROUP', zone: 'group', name: 'Group Tickets (10+)', price: 10, type: 'group', status: 'LOW', desc: 'Groups of 10 or more · Great for team outings and company events' },
]

// Volleyball uses same Benjamin Johnson Arena — section IDs match basketball map
const VOLLEYBALL_SECTIONS = [
  // Sideline premium (same as MBB courtside/lower bowl zones)
  { id: 'CS_N',   label: 'CS-N',  zone: 'premium',     name: 'Sideline North — Single',      price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Sideline · North · Benjamin Johnson Arena' },
  { id: 'CS_S',   label: 'CS-S',  zone: 'premium',     name: 'Sideline South — Single',      price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Sideline · South · Benjamin Johnson Arena' },
  { id: 'LB_N',   label: 'LB-N',  zone: 'premium',     name: 'Upper Sideline North — Single',price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Upper sideline · North · Benjamin Johnson Arena' },
  { id: 'LB_S',   label: 'LB-S',  zone: 'premium',     name: 'Upper Sideline South — Single',price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Upper sideline · South · Benjamin Johnson Arena' },
  // End zones and corners
  { id: 'END_E',  label: 'END-E', zone: 'reserved',    name: 'East End — Single',            price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'East end · Behind net · Benjamin Johnson Arena' },
  { id: 'END_W',  label: 'END-W', zone: 'reserved',    name: 'West End — Single',            price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'West end · Behind net · Benjamin Johnson Arena' },
  { id: 'CRN_NE', label: 'NE',    zone: 'reserved',    name: 'Corner NE — Single',           price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Northeast corner · Benjamin Johnson Arena' },
  { id: 'CRN_NW', label: 'NW',    zone: 'reserved',    name: 'Corner NW — Single',           price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Northwest corner · Benjamin Johnson Arena' },
  { id: 'CRN_SE', label: 'SE',    zone: 'reserved',    name: 'Corner SE — Single',           price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Southeast corner · Benjamin Johnson Arena' },
  { id: 'CRN_SW', label: 'SW',    zone: 'reserved',    name: 'Corner SW — Single',           price: 10,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'Southwest corner · Benjamin Johnson Arena' },
  // Child single (all sections)
  { id: 'VB_CHILD', label: 'CHILD', zone: 'group',     name: 'Child Ticket — Single (U12)',  price: 5,   seasonPrice: 50,  type: 'single', status: 'LOW',  desc: 'Child ticket under 12 · Any section · Benjamin Johnson Arena' },
  // Season passes
  { id: 'VB_SS_A', label: 'SEASON', zone: 'season_pass', name: 'Adult Season Pass',          price: 100, type: 'season', status: 'LOW',  desc: 'Full season adult ticket · All home matches · Benjamin Johnson Arena' },
  { id: 'VB_SS_C', label: 'SEASON', zone: 'season_pass', name: 'Child Season Pass (U12)',    price: 50,  type: 'season', status: 'LOW',  desc: 'Full season child ticket under 12 · All home matches · Benjamin Johnson Arena' },
  // Group
  { id: 'VB_GRP',  label: 'GROUP',  zone: 'group',      name: 'Group Tickets (10+)',         price: 5,   type: 'group',  status: 'LOW',  desc: 'Groups of 10 or more · Great for school groups and family outings' },
]

const ZONE_LABELS = {
  bench_back:  'Bench Back (Premium)',
  bleacher:    'Home Bleacher',
  visitor:     'Visitor Side',
  season_pass: 'Season Passes',
  group:       'Group Packages',
  parking:     'Parking',
  season:      'Season Tickets',
  single:      'Single Game',
}

const TYPE_BADGE = {
  season:  { label: 'SEASON PASS', color: '#7B3FF2' },
  single:  { label: 'SINGLE GAME', color: '#0ea5e9' },
  group:   { label: 'GROUP 10+',   color: '#16a34a' },
  parking: { label: 'PARKING',     color: '#f59e0b' },
}

const STATUS_COLOR = { HIGH: '#ef4444', MED: '#f59e0b', LOW: '#22c55e' }
const STATUS_LABEL = { HIGH: 'Selling Fast', MED: 'Limited', LOW: 'Available' }



// ── Generic Interactive Stadium Map (used for all non-Wofford schools) ────────
function GenericStadiumMap({ selectedSection, onSelectSection, school }) {
  const c = school.colors

  const GENERIC_SECTIONS = [
    { id: 'GEN_VIP',   label: 'VIP',    zone: 'vip',      name: 'VIP / Premium',      price: 65,  seasonPrice: 340, type: 'single', status: 'LOW',  desc: 'Premium seating · Best view in the venue' },
    { id: 'GEN_SID_N', label: 'SID-N',  zone: 'sideline', name: 'Sideline North',     price: 35,  seasonPrice: 175, type: 'single', status: 'MED',  desc: 'Home sideline · Reserved seating' },
    { id: 'GEN_SID_S', label: 'SID-S',  zone: 'sideline', name: 'Sideline South',     price: 35,  seasonPrice: 175, type: 'single', status: 'MED',  desc: 'Home sideline · Reserved seating' },
    { id: 'GEN_END_E', label: 'END-E',  zone: 'endzone',  name: 'East End Zone',      price: 20,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'End zone · General admission' },
    { id: 'GEN_END_W', label: 'END-W',  zone: 'endzone',  name: 'West End Zone',      price: 20,  seasonPrice: 100, type: 'single', status: 'HIGH', desc: 'End zone · General admission' },
    { id: 'GEN_VIS',   label: 'VIS',    zone: 'visitor',  name: 'Visitor Side',       price: 25,  seasonPrice: 125, type: 'single', status: 'HIGH', desc: 'Visitor sideline · General seating' },
    { id: 'GEN_GRP',   label: 'GROUP',  zone: 'group',    name: 'Group Tickets (10+)', price: 12, seasonPrice: null, type: 'group',  status: 'LOW',  desc: 'Groups of 10 or more · Contact rep for booking' },
  ]

  const getColor = (id) => {
    if (selectedSection?.id === id) return c.accent
    const sec = GENERIC_SECTIONS.find(s => s.id === id)
    if (!sec) return '#333'
    if (sec.zone === 'vip') return '#6B5B2E'
    if (sec.zone === 'sideline') return '#4a4a4a'
    if (sec.zone === 'group') return '#2a5a2a'
    return '#333'
  }

  const handleClick = (id) => {
    const sec = GENERIC_SECTIONS.find(s => s.id === id)
    if (sec) onSelectSection(selectedSection?.id === id ? null : sec)
  }

  const Sec = ({ id, x, y, w, h, label }) => (
    <g onClick={() => handleClick(id)} style={{ cursor: 'pointer' }}>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill={getColor(id)}
        stroke={selectedSection?.id === id ? '#fff' : 'rgba(255,255,255,0.15)'}
        strokeWidth={selectedSection?.id === id ? 2 : 0.8}
        style={{ transition: 'fill 0.15s' }}
      />
      <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
        fill="#fff" fontSize={9} fontFamily="Space Mono, monospace" fontWeight="700">
        {label}
      </text>
    </g>
  )

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          {school.venue?.football?.name || 'Stadium'} · Section Map
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { color: '#6B5B2E', label: 'Premium' },
            { color: '#4a4a4a', label: 'Sideline' },
            { color: '#333',    label: 'End Zone' },
            { color: c.accent,  label: 'Selected' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#888' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 520 280" style={{ width: '100%', borderRadius: 14, background: '#1a1a1a', display: 'block' }}>
        {/* Field */}
        <rect x={100} y={80} width={320} height={130} rx={4} fill="#2d8a2d" />
        <line x1={260} y1={80} x2={260} y2={210} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <line key={i} x1={116+i*36} y1={80} x2={116+i*36} y2={210} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
        ))}
        <text x={260} y={150} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize={22} fontFamily="Arial" fontWeight="900" letterSpacing="4">{school.short.toUpperCase()}</text>

        {/* VIP top center */}
        <Sec id="GEN_VIP"   x={200} y={20} w={120} h={30} label="VIP / PREMIUM" />

        {/* Home sideline sections */}
        <Sec id="GEN_SID_N" x={100} y={56} w={320} h={20} label="SIDELINE NORTH — HOME" />

        {/* Visitor sideline */}
        <Sec id="GEN_VIS"   x={100} y={212} w={320} h={20} label="VISITOR SIDE" />

        {/* End zones */}
        <Sec id="GEN_END_W" x={20}  y={80} w={76}  h={130} label="END ZONE W" />
        <Sec id="GEN_END_E" x={424} y={80} w={76}  h={130} label="END ZONE E" />

        {/* Sideline South (home) */}
        <Sec id="GEN_SID_S" x={100} y={236} w={320} h={20} label="SIDELINE SOUTH — HOME" />

        {/* Tooltip */}
        {selectedSection && (
          <g>
            <rect x={140} y={118} width={240} height={34} rx={6} fill="rgba(0,0,0,0.82)" />
            <text x={260} y={132} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="Space Mono, monospace" fontWeight="700">
              {selectedSection.name}
            </text>
            <text x={260} y={146} textAnchor="middle" fill={c.accent} fontSize={10} fontFamily="Space Mono, monospace">
              ${selectedSection.price}/ticket · {selectedSection.seasonPrice ? `Season $${selectedSection.seasonPrice}` : 'Group pricing available'}
            </text>
          </g>
        )}

        <text x={260} y={14} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={8} fontFamily="Space Mono" letterSpacing="2">HOME SIDE</text>
        <text x={260} y={272} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={8} fontFamily="Space Mono" letterSpacing="2">VISITOR SIDE</text>
      </svg>

      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#666', margin: '6px 0 0', textAlign: 'center' }}>
        Exact section map coming soon · Pricing is representative
      </p>
    </div>
  )
}

// ── Gibbs Stadium Interactive Map ────────────────────────────────────────────
function GibbsStadiumMap({ selectedSection, onSelectSection, school }) {
  const c = school.colors
  const primary = c.primary
  const accent  = c.accent

  // Section layout matches the actual Gibbs Stadium diagram
  // H9/H10/H11 = premium elevated boxes (top row, center)
  // H1-H8      = home bleacher (second row)
  // V1-V3      = visitor side (bottom)
  // Students   = between H1-H3 on home side

  const getSectionColor = (sectionId) => {
    const isSelected = selectedSection?.id === sectionId
    if (isSelected) return accent
    // Bench Back premium sections
    if (['H9','H10','H11'].includes(sectionId)) return '#8B6914'
    // Home bleacher
    if (['H1','H2','H3','H4','H5','H6','H7','H8'].includes(sectionId)) return '#5a5a5a'
    // Visitor
    if (['V1','V2','V3'].includes(sectionId)) return '#374151'
    return '#9ca3af'
  }

  const getTextColor = (sectionId) => {
    return selectedSection?.id === sectionId ? '#fff' : '#fff'
  }

  const handleClick = (sectionId) => {
    const sec = FOOTBALL_SECTIONS.find(s => s.id === sectionId)
    if (sec) onSelectSection(selectedSection?.id === sectionId ? null : sec)
  }

  const SectionRect = ({ id, x, y, w, h, rx = 3, label }) => (
    <g onClick={() => handleClick(id)} style={{ cursor: 'pointer' }}>
      <rect
        x={x} y={y} width={w} height={h} rx={rx}
        fill={getSectionColor(id)}
        stroke={selectedSection?.id === id ? '#fff' : 'rgba(255,255,255,0.15)'}
        strokeWidth={selectedSection?.id === id ? 2 : 1}
        style={{ transition: 'fill 0.15s' }}
      />
      <text x={x + w/2} y={y + h/2 + 4} textAnchor="middle" fill={getTextColor(id)}
        fontSize={w < 28 ? 8 : 10} fontFamily="Space Mono, monospace" fontWeight="700">
        {label || id}
      </text>
    </g>
  )

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Gibbs Stadium · Section Map
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#8B6914' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#888' }}>Bench Back</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#5a5a5a' }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#888' }}>Bleacher</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: accent }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#888' }}>Selected</span>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 520 320" style={{ width: '100%', borderRadius: 14, background: '#1a1a1a', display: 'block' }}>

        {/* ── Field ── */}
        <rect x={80} y={90} width={360} height={160} rx={6} fill="#2d6a2d" />
        <rect x={84} y={94} width={352} height={152} rx={4} fill="#2d8a2d" opacity="0.6" />
        {/* Yard lines */}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
          <line key={i} x1={116 + i*29} y1={94} x2={116 + i*29} y2={246} stroke="rgba(255,255,255,0.2)" strokeWidth={i===5?1.5:0.5} />
        ))}
        {/* WOFFORD text on field */}
        <text x={260} y={175} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={28} fontFamily="Arial" fontWeight="900" letterSpacing="6">WOFFORD</text>

        {/* ── End zones ── */}
        <rect x={20} y={90} width={60} height={160} rx={4} fill="#1e4d1e" />
        <text x={50} y={178} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="Arial" fontWeight="700" transform="rotate(-90, 50, 170)">END ZONE</text>
        <rect x={440} y={90} width={60} height={160} rx={4} fill="#1e4d1e" />
        <text x={470} y={178} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="Arial" fontWeight="700" transform="rotate(90, 470, 170)">TERRIERLAND</text>

        {/* ── HOME SIDE — Top ── */}
        {/* Label */}
        <text x={260} y={16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="Space Mono, monospace" letterSpacing="2">HOME SIDE</text>

        {/* H9 H10 H11 — Premium Bench Back boxes (elevated, center) */}
        <SectionRect id="H9"  x={160} y={22} w={52} h={28} label="H9" />
        <SectionRect id="H10" x={218} y={22} w={52} h={28} label="H10" />
        <SectionRect id="H11" x={276} y={22} w={52} h={28} label="H11" />

        {/* H1-H8 — Home bleacher (row below boxes) */}
        <SectionRect id="H1" x={84}  y={56} w={34} h={26} label="H1" />
        <SectionRect id="H2" x={122} y={56} w={34} h={26} label="H2" />
        <SectionRect id="H3" x={160} y={56} w={34} h={26} label="H3" />
        <SectionRect id="H4" x={198} y={56} w={34} h={26} label="H4" />
        <SectionRect id="H5" x={236} y={56} w={34} h={26} label="H5" />
        <SectionRect id="H6" x={274} y={56} w={34} h={26} label="H6" />
        <SectionRect id="H7" x={312} y={56} w={34} h={26} label="H7" />
        <SectionRect id="H8" x={350} y={56} w={34} h={26} label="H8" />

        {/* Students label under H1-H3 */}
        <text x={143} y={88} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={7} fontFamily="Space Mono, monospace">STUDENTS</text>

        {/* Gate labels */}
        <text x={84}  y={18} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="Space Mono">G1</text>
        <text x={396} y={18} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="Space Mono">G4</text>

        {/* ── VISITOR SIDE — Bottom ── */}
        <text x={260} y={310} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="Space Mono, monospace" letterSpacing="2">VISITOR SIDE</text>
        <SectionRect id="V3" x={160} y={264} w={60} h={32} label="V3" />
        <SectionRect id="V2" x={228} y={264} w={60} h={32} label="V2" />
        <SectionRect id="V1" x={296} y={264} w={60} h={32} label="V1" />
        <text x={358} y={286} textAnchor="start" fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="Space Mono">G5</text>

        {/* ── VERANDAH LOT label ── */}
        <text x={12} y={175} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="Space Mono" transform="rotate(-90,12,175)">VERANDAH LOT</text>

        {/* Selected section highlight tooltip */}
        {selectedSection && ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H11','V1','V2','V3'].includes(selectedSection.id) && (
          <g>
            <rect x={160} y={138} width={200} height={34} rx={6} fill="rgba(0,0,0,0.75)" />
            <text x={260} y={152} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="Space Mono, monospace" fontWeight="700">
              {selectedSection.name}
            </text>
            <text x={260} y={165} textAnchor="middle" fill={accent} fontSize={10} fontFamily="Space Mono, monospace">
              ${selectedSection.price}/ticket · Season ${selectedSection.seasonPrice}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}


// ── Jerry Richardson Indoor Stadium Map ──────────────────────────────────────
function BasketballArenaMap({ selectedSection, onSelectSection, school, sport = 'basketball' }) {
  const c = school.colors
  const accent = c.accent

  const getSectionFill = (id) => {
    if (selectedSection?.id === id) return accent
    const sec = BASKETBALL_SECTIONS.find(s => s.id === id)
    if (!sec) return '#333'
    if (sec.zone === 'premium')     return '#6B5B2E'
    if (sec.zone === 'scholarship') return '#4a4a4a'
    return '#333'
  }

  const handleClick = (id) => {
    const sec = BASKETBALL_SECTIONS.find(s => s.id === id)
    if (sec) onSelectSection(selectedSection?.id === id ? null : sec)
  }

  const Sec = ({ id, points, label, cx, cy }) => (
    <g onClick={() => handleClick(id)} style={{ cursor: 'pointer' }}>
      <polygon
        points={points}
        fill={getSectionFill(id)}
        stroke={selectedSection?.id === id ? '#fff' : 'rgba(255,255,255,0.12)'}
        strokeWidth={selectedSection?.id === id ? 2 : 0.8}
        style={{ transition: 'fill 0.15s' }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fill="#fff" fontSize={8} fontFamily="Space Mono, monospace" fontWeight="700">
        {label}
      </text>
    </g>
  )

  const SecRect = ({ id, x, y, w, h, label }) => (
    <g onClick={() => handleClick(id)} style={{ cursor: 'pointer' }}>
      <rect x={x} y={y} width={w} height={h} rx={2}
        fill={getSectionFill(id)}
        stroke={selectedSection?.id === id ? '#fff' : 'rgba(255,255,255,0.12)'}
        strokeWidth={selectedSection?.id === id ? 2 : 0.8}
        style={{ transition: 'fill 0.15s' }}
      />
      <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
        fill="#fff" fontSize={7.5} fontFamily="Space Mono, monospace" fontWeight="700">
        {label}
      </text>
    </g>
  )

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          {sport === 'volleyball' ? 'Jerry Richardson Indoor Stadium — Volleyball' : 'Jerry Richardson Indoor Stadium — Basketball'}
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[
            { color: '#6B5B2E', label: 'Premium' },
            { color: '#4a4a4a', label: 'Scholarship' },
            { color: '#333',    label: 'Reserved' },
            { color: accent,    label: 'Selected' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#888' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 520 380" style={{ width: '100%', borderRadius: 14, background: '#1a1a1a', display: 'block' }}>

        {/* ── Court ── */}
        <rect x={150} y={110} width={220} height={160} rx={4} fill="#C8A96E" />
        {/* Court lines */}
        <rect x={150} y={110} width={220} height={160} rx={4} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />
        <line x1={260} y1={110} x2={260} y2={270} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        <circle cx={260} cy={190} r={20} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        <circle cx={260} cy={190} r={3} fill="rgba(0,0,0,0.3)" />
        {/* Free throw circles */}
        <ellipse cx={195} cy={190} rx={16} ry={16} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        <ellipse cx={325} cy={190} rx={16} ry={16} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        {/* Paint */}
        <rect x={150} y={162} width={36} height={56} fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        <rect x={334} y={162} width={36} height={56} fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        {/* Logo */}
        <text x={260} y={186} textAnchor="middle" fill="rgba(0,0,0,0.25)" fontSize={18} fontFamily="Arial" fontWeight="900">W</text>
        <text x={260} y={202} textAnchor="middle" fill="rgba(0,0,0,0.2)" fontSize={7} fontFamily="Arial" fontWeight="700" letterSpacing="3">WOFFORD</text>

        {/* ── NORTH SIDE (top) — Premium + Scholarship ── */}
        {/* Courtside North — tight row along court */}
        <SecRect id="CS_N"  x={150} y={90}  w={220} h={16} label="CS-N  COURTSIDE NORTH  $22/game · $340 season" />
        {/* Lower Bowl North */}
        <SecRect id="LB_N"  x={140} y={71}  w={240} h={16} label="LB-N  LOWER BOWL NORTH  $22/game · $340 season" />
        {/* Scholarship North */}
        <SecRect id="SCH_N" x={128} y={52}  w={264} h={16} label="SCH-N  SCHOLARSHIP NORTH  $18/game · $240 season" />
        {/* Upper North */}
        <SecRect id="CRN_NE" x={340} y={28} w={76}  h={20} label="NE" />
        <SecRect id="CRN_NW" x={104} y={28} w={76}  h={20} label="NW" />

        {/* ── SOUTH SIDE (bottom) ── */}
        <SecRect id="CS_S"  x={150} y={274} w={220} h={16} label="CS-S  COURTSIDE SOUTH  $22/game · $340 season" />
        <SecRect id="LB_S"  x={140} y={293} w={240} h={16} label="LB-S  LOWER BOWL SOUTH  $22/game · $340 season" />
        <SecRect id="SCH_S" x={128} y={312} w={264} h={16} label="SCH-S  SCHOLARSHIP SOUTH  $18/game · $240 season" />
        <SecRect id="CRN_SE" x={340} y={332} w={76} h={20} label="SE" />
        <SecRect id="CRN_SW" x={104} y={332} w={76} h={20} label="SW" />

        {/* ── EAST END (right) ── */}
        <SecRect id="END_E"  x={374} y={130} w={72} h={120} label="END-E" />

        {/* ── WEST END (left) ── */}
        <SecRect id="END_W"  x={74}  y={130} w={72} h={120} label="END-W" />

        {/* ── Selected tooltip ── */}
        {selectedSection && (
          <g>
            <rect x={130} y={168} width={260} height={44} rx={6} fill="rgba(0,0,0,0.82)" />
            <text x={260} y={185} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="Space Mono, monospace" fontWeight="700">
              {selectedSection.name}
            </text>
            <text x={260} y={200} textAnchor="middle" fill={accent} fontSize={10} fontFamily="Space Mono, monospace">
              ${selectedSection.price}/game · Season ${selectedSection.seasonPrice}
            </text>
          </g>
        )}

        {/* Labels */}
        <text x={260} y={14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="Space Mono" letterSpacing="2">NORTH</text>
        <text x={260} y={370} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="Space Mono" letterSpacing="2">SOUTH</text>
        <text x={460} y={192} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="Space Mono" letterSpacing="2">EAST</text>
        <text x={60}  y={192} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="Space Mono" letterSpacing="2">WEST</text>
      </svg>
    </div>
  )
}

// ── AI Chat Bubble ────────────────────────────────────────────────────────────
function ChatBubble({ school, sport, selectedSection, qty }) {
  const c = school.colors
  const [open, setOpen]         = useState(false)
  const [visible, setVisible]   = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [pulsing, setPulsing]   = useState(false)
  const sessionRef  = useRef(`th-${school.id}-${Date.now()}`)
  const messagesEnd = useRef(null)
  const initialized = useRef(false)

  // Show bubble after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true)
      setTimeout(() => setPulsing(true), 800)
    }, 4000)
    return () => clearTimeout(t)
  }, [])

  // Scroll to latest message
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Send opener when first opened
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true
      const opener = selectedSection
        ? `Hey! I'm ${school.mascotName}, your ${school.name} ticket assistant. I see you're looking at ${selectedSection.name} — great choice! Want help finding the best deal for ${qty} ticket${qty > 1 ? 's' : ''}?`
        : `Hey! I'm ${school.mascotName}, your ${school.name} ticket assistant. Looking for ${sport} tickets? I can help you find the best seats for your budget!`
      setMessages([{ role: 'assistant', content: opener, ts: Date.now() }])
    }
  }, [open])

  // Update opener context when section changes and chat is closed
  useEffect(() => {
    if (!open) initialized.current = false
  }, [selectedSection?.id])

  const buildContext = () => {
    const sectionCtx = selectedSection
      ? `VIEWING: ${selectedSection.name} · $${selectedSection.price}/ticket · ${selectedSection.desc}`
      : 'VIEWING: Browsing sections (none selected yet)'
    return `[SCHOOL_CONTEXT]
SCHOOL: ${school.name}
AGENT_NAME: ${school.mascotName}
CONFERENCE: ${school.conference}
LOCATION: ${school.location}
FOOTBALL_VENUE: ${school.venue?.football?.name || 'home stadium'}
BASKETBALL_VENUE: ${school.venue?.basketball?.name || 'home arena'}
RIVALS: ${(school.rivals || []).join(', ')}
VIP_ASSETS: ${(school.vip || []).join(', ')}
CAMPAIGN: TICKETS
CONTEXT: Fan is on the Ticket Hub browsing ${sport} tickets
${sectionCtx}
QUANTITY_SELECTED: ${qty}
PRICING (use exact numbers):
Football Season: $211 Bench Back / $135 Bench
Football Single Game: $40 Bench Back / $30 Bench
Football Groups: $15/ticket (min 10)
MBB Season: $340 Premium / $240 Scholarship / $190 Reserved
MBB Single Game: $22 Premium / $18 Reserved
[/SCHOOL_CONTEXT]`
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: text, ts: Date.now() }])
    setInput('')
    setIsTyping(true)

    const attemptFetch = async (attempt = 1) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 45000)
      try {
        const res = await fetch(N8N_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatInput: `${buildContext()}\n\nUSER MESSAGE: ${text}`,
            sessionId: sessionRef.current,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const reply = data?.output || data?.text || data?.message || data?.response || null
        if (!reply && attempt < 2) return attemptFetch(2)
        setMessages(prev => [...prev, { role: 'assistant', content: reply || "Try again in a moment.", ts: Date.now() }])
      } catch {
        clearTimeout(timeout)
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1500))
          return attemptFetch(2)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue — try again in a moment.", ts: Date.now() }])
      } finally {
        setIsTyping(false)
      }
    }
    await attemptFetch()
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes thBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        @keyframes thPulse { 0%,100%{box-shadow:0 0 0 0 ${c.accent}66} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes thSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) {
          .ticket-main-grid { grid-template-columns: 1fr !important; }
          .ticket-order-panel { display: none !important; }
          .ticket-mobile-bar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .ticket-mobile-bar { display: none !important; }
        }
      `}</style>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 220px)', right: 16, zIndex: 1000,
          width: 320, height: 460,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'thSlideUp 0.25s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${c.accent}22`, border: `1px solid ${c.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {school.emoji}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: 'white', lineHeight: 1.1 }}>{school.mascotName}</p>
                <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.accent }}>Ticket Assistant · <span style={{ color: '#3CDB7A' }}>● LIVE</span></p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, background: c.bg }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 2 }}>
                    {school.emoji}
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '8px 12px',
                  borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  background: msg.role === 'user' ? c.primary : 'white',
                  color: msg.role === 'user' ? 'white' : c.primary,
                  fontSize: 13, lineHeight: 1.55,
                  fontFamily: "'Inter',sans-serif",
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{school.emoji}</div>
                <div style={{ padding: '8px 12px', borderRadius: '14px 14px 14px 3px', background: 'white', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c.accent, animation: `thBounce 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', background: 'white', borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask about tickets..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: `1px solid ${c.border}`, fontSize: 13, fontFamily: "'Inter',sans-serif", outline: 'none', background: c.bg, color: c.primary }}
              />
              <button onClick={sendMessage} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: c.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={14} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 148px)', right: 16, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: c.primary, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: pulsing && !open ? 'thPulse 2s 3' : 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
        {!open && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 14, height: 14, borderRadius: '50%',
            background: '#3CDB7A', border: '2px solid white',
          }} />
        )}
      </button>
    </>
  )
}

// ── Main Ticketing component ──────────────────────────────────────────────────
export default function Ticketing() {
  const { school, memberTier } = useSchool()
  const [sport, setSport] = useState('football')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [filterZone, setFilterZone] = useState('all')
  const [selectedSection, setSelectedSection] = useState(null)
  const [qty, setQty] = useState(2)
  const [stage, setStage] = useState('browse')

  const SPORT_SECTIONS = { football: FOOTBALL_SECTIONS, basketball: BASKETBALL_SECTIONS, volleyball: VOLLEYBALL_SECTIONS }
  const sections = SPORT_SECTIONS[sport] || FOOTBALL_SECTIONS
  const VOLLEYBALL_VENUE = { name: 'Benjamin Johnson Arena', capacity: 3500 }
  const venueInfo = sport === 'volleyball' ? VOLLEYBALL_VENUE : school.venue?.[sport]
  const tier = MEMBERSHIP_TIERS[memberTier]
  const bundle = getBundleDeal(qty)
  const totalDiscount = Math.max(tier.discount, bundle.discount || 0)

  const zones = [...new Set(sections.filter(s => s.price > 0).map(s => s.zone))]
  const filtered = filterZone === 'all'
    ? sections.filter(s => s.price > 0)
    : sections.filter(s => s.zone === filterZone && s.price > 0)

  const subtotal = selectedSection ? selectedSection.price * qty : 0
  const discountAmt = Math.round(subtotal * totalDiscount * 100) / 100
  const fees = (2.50 + 1.50) * (selectedSection ? qty : 0)
  const total = subtotal - discountAmt + fees

  if (stage === 'success') return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '40px 32px', textAlign: 'center', background: `linear-gradient(135deg, ${school.colors.primary}, ${school.colors.accent})` }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={30} color="white" />
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 32, color: 'white' }}>Purchase Complete!</h2>
          <p style={{ margin: '6px 0 0', fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>GO {school.mascot.toUpperCase()}! {school.emoji}</p>
        </div>
        <div style={{ padding: '32px', background: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Venue', value: venueInfo?.name },
              { label: 'Section', value: selectedSection?.label },
              { label: 'Tickets', value: `${qty} tickets` },
              { label: 'Total Paid', value: `$${total.toFixed(2)}`, accent: true },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: 12, background: school.colors.bg }}>
                <p style={{ margin: '0 0 4px', fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: school.colors.accent }}>{item.label}</p>
                <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: item.accent ? school.colors.accent : '#111' }}>{item.value}</p>
              </div>
            ))}
          </div>
          <QrCode size={72} style={{ display: 'block', margin: '0 auto 16px', color: '#e0e0e0' }} />
          <p style={{ textAlign: 'center', fontSize: 12, color: '#666', marginBottom: 20 }}>Confirmation sent · Tickets delivered to your email</p>
          <button onClick={() => { setStage('browse'); setSelectedSection(null); setQty(2) }}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: school.colors.primary, color: 'white', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            ← Back to Tickets
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: school.colors.accent, marginBottom: 6 }}>{school.name} · Ticket Marketplace</p>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: '#111', margin: 0 }}>Ticket Hub</h2>
        <p style={{ fontSize: 14, color: '#444', marginTop: 4 }}>{venueInfo?.name} · {venueInfo?.capacity?.toLocaleString()} capacity</p>
      </div>

      {/* ── Sale announcement banner — dismisses on tap or scroll ── */}
      {!bannerDismissed && (
        <div style={{
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
          position: 'relative',
          background: school.colors.bg,
          border: `1px solid ${school.colors.border}`,
        }}>
          {/* Gold stud strip top */}
          <div style={{ height: 6, background: `repeating-linear-gradient(90deg, ${school.colors.accent} 0px, ${school.colors.accent} 6px, transparent 6px, transparent 14px)` }} />

          <div style={{ padding: '18px 20px 16px', textAlign: 'center', position: 'relative' }}>
            {/* Dismiss X */}
            <button onClick={() => setBannerDismissed(true)}
              style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: school.colors.accent, fontSize: 18, lineHeight: 1, opacity: 0.6 }}>
              ✕
            </button>

            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 10 }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, color: school.colors.accent, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{school.conference}</span>
              <div style={{ width: 1, height: 14, background: school.colors.border }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, color: school.colors.accent, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{school.short} Athletics</span>
              <div style={{ width: 1, height: 14, background: school.colors.border }} />
              <span style={{ fontSize: 16 }}>{school.emoji}</span>
            </div>

            {/* Headline */}
            <p style={{ margin: '0 0 0px', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 'clamp(13px,2.5vw,17px)', color: school.colors.primary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {school.short} {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </p>
            <p style={{ margin: '0 0 2px', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(30px,7vw,52px)', color: school.colors.primary, letterSpacing: '0.02em', lineHeight: 0.95 }}>
              Season Tickets
            </p>
            <p style={{ margin: '0 0 14px', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(26px,6vw,44px)', color: school.colors.accent, letterSpacing: '0.02em', lineHeight: 1 }}>
              On Sale Now!
            </p>

            {/* Price pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 18px', borderRadius: 24, background: school.colors.primary }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Starting at</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: school.colors.accent, letterSpacing: '0.04em', lineHeight: 1 }}>
                {sport === 'football' ? '$135' : sport === 'basketball' ? '$190' : '$50'}
              </span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>/ season</span>
            </div>
          </div>

          {/* Gold stud strip bottom */}
          <div style={{ height: 6, background: `repeating-linear-gradient(90deg, ${school.colors.accent} 0px, ${school.colors.accent} 6px, transparent 6px, transparent 14px)` }} />
        </div>
      )}

      {/* Sport selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'football',   emoji: '🏈', label: 'Football'   },
          { id: 'basketball', emoji: '🏀', label: 'Basketball' },
          { id: 'volleyball', emoji: '🏐', label: 'Volleyball' },
        ].map(s => (
          <button key={s.id} onClick={() => { setSport(s.id); setSelectedSection(null); setFilterZone('all') }}
            style={{
              padding: '10px 20px', borderRadius: 12, border: `2px solid ${sport === s.id ? school.colors.accent : '#e0e0e0'}`,
              background: sport === s.id ? school.colors.primary : 'white', color: sport === s.id ? 'white' : '#111',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Bundle banner */}
      {qty >= 4 && (
        <div style={{
          background: `linear-gradient(135deg, ${school.colors.primary}, ${school.colors.accent}cc)`,
          borderRadius: 16, padding: '12px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: 'white' }}>{bundle.label}{bundle.badge ? ` — ${bundle.badge}` : ''}</p>
              <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{bundle.msg}</p>
            </div>
          </div>
          {selectedSection && discountAmt > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 14px' }}>
              <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 900, fontSize: 18, color: 'white' }}>Saving ${discountAmt.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {/* Interactive venue maps — school-specific where available, generic fallback otherwise */}
      {sport === 'football' && school.id === 'wofford' && (
        <GibbsStadiumMap
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          school={school}
        />
      )}
      {sport === 'football' && school.id !== 'wofford' && (
        <GenericStadiumMap
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          school={school}
        />
      )}
      {sport === 'basketball' && school.id === 'wofford' && (
        <BasketballArenaMap
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          school={school}
          sport="basketball"
        />
      )}
      {sport === 'basketball' && school.id !== 'wofford' && (
        <GenericStadiumMap
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          school={school}
        />
      )}
      {sport === 'volleyball' && school.id === 'wofford' && (
        <BasketballArenaMap
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          school={school}
          sport="volleyball"
        />
      )}
      {sport === 'volleyball' && school.id !== 'wofford' && (
        <GenericStadiumMap
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          school={school}
        />
      )}

      {/* Zone filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterZone('all')}
          style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filterZone === 'all' ? school.colors.accent : '#f1f5f9', color: filterZone === 'all' ? 'white' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          All Sections
        </button>
        {zones.map(z => (
          <button key={z} onClick={() => setFilterZone(z)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filterZone === z ? school.colors.accent : '#f1f5f9', color: filterZone === z ? 'white' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {ZONE_LABELS[z] || z}
          </button>
        ))}
      </div>

      <div className="ticket-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>
        {/* Section cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(sec => {
            const active = selectedSection?.id === sec.id
            return (
              <button key={sec.id} onClick={() => setSelectedSection(active ? null : sec)}
                style={{
                  textAlign: 'left', borderRadius: 16, border: `2px solid ${active ? school.colors.accent : '#e8eaed'}`,
                  background: active ? school.colors.primary : 'white', cursor: 'pointer',
                  overflow: 'hidden', transition: 'all 0.2s ease',
                  boxShadow: active ? `0 8px 32px ${school.colors.accent}40` : '0 2px 8px rgba(0,0,0,0.04)',
                  transform: active ? 'translateY(-2px)' : 'none',
                }}>
                <div style={{ height: 4, background: active ? school.colors.accent : '#e8eaed' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: active ? 'white' : '#111' }}>{sec.name}</p>
                      <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 10, color: active ? school.colors.accent2 : school.colors.accent }}>{ZONE_LABELS[sec.zone]}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, color: active ? school.colors.accent2 : school.colors.accent }}>${sec.price}</p>
                      <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 9, color: active ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>per ticket</p>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: active ? 'rgba(255,255,255,0.6)' : '#64748b', lineHeight: 1.5 }}>{sec.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {TYPE_BADGE[sec.type] && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${TYPE_BADGE[sec.type].color}18`, color: TYPE_BADGE[sec.type].color }}>
                          {TYPE_BADGE[sec.type].label}
                        </span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${STATUS_COLOR[sec.status]}15`, color: STATUS_COLOR[sec.status] }}>
                        {STATUS_LABEL[sec.status]}
                      </span>
                    </div>
                    {active && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>✓ SELECTED</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Order panel */}
        <div className="ticket-order-panel" style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #e8eaed', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'sticky', top: 80 }}>
          <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, ${school.colors.primary}, ${school.colors.accent}bb)` }}>
            <p style={{ margin: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: 'white' }}>Order Summary</p>
            <p style={{ margin: '2px 0 0', fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{school.name.toUpperCase()} · {sport.toUpperCase()}</p>
          </div>
          <div style={{ padding: '20px 24px', background: 'white' }}>
            {!selectedSection ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: school.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>{school.emoji}</div>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: '#111', margin: '0 0 4px' }}>Select a Section</p>
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Choose from the sections on the left</p>
              </div>
            ) : (
              <div>
                <div style={{ padding: '10px 14px', borderRadius: 10, background: school.colors.bg, border: `1px solid ${school.colors.border}`, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: school.colors.accent }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111' }}>{selectedSection.name}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#444', paddingLeft: 14 }}>{selectedSection.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: tier.bg, border: `1px solid ${tier.color}40`, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: tier.color }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: tier.color }}>{tier.label.toUpperCase()}</span>
                  </div>
                  {tier.discount > 0 && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: tier.color }}>-{(tier.discount * 100).toFixed(0)}% off</span>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: school.colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Quantity</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5,6].map(n => (
                      <button key={n} onClick={() => setQty(n)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, background: qty === n ? school.colors.primary : '#f1f5f9', color: qty === n ? 'white' : '#64748b', transition: 'all 0.15s ease' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ color: '#444' }}>{qty}x {selectedSection.label}</span>
                    <span style={{ fontWeight: 700, color: '#111' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#16a34a', fontWeight: 700 }}>
                      <span>{totalDiscount === tier.discount ? tier.label : bundle.label} discount</span>
                      <span>-${discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#666' }}>
                    <span>Facility fee ({qty}x)</span><span>${(2.50 * qty).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                    <span>Processing ({qty}x)</span><span>${(1.50 * qty).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `3px solid ${school.colors.primary}`, paddingTop: 12, marginTop: 12 }}>
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: '#111' }}>Total</span>
                    <div style={{ textAlign: 'right' }}>
                      {discountAmt > 0 && <p style={{ margin: 0, fontSize: 11, color: '#666', textDecoration: 'line-through' }}>${(subtotal + fees).toFixed(2)}</p>}
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 32, color: school.colors.accent }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStage('success')}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: school.colors.primary, color: 'white', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 10, transition: 'opacity 0.2s ease' }}>
                  Purchase Tickets →
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#f8fafc' }}>
                  <ShieldCheck size={16} color={school.colors.accent} />
                  <p style={{ margin: 0, fontSize: 12, color: '#444', fontWeight: 500 }}>Secure checkout · Official {school.short} tickets</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky order bar — visible only on small screens */}
      <div className="ticket-mobile-bar" style={{
        position: 'fixed', bottom: 72, left: 0, right: 0, zIndex: 90,
        background: 'white', borderTop: '1px solid #e8eaed',
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)',
        display: 'none', flexDirection: 'column', gap: 0,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        {!selectedSection ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 18, color: '#111' }}>
              Select a section above
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Tap any section card</p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedSection.name}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#444' }}>
                {qty} ticket{qty > 1 ? 's' : ''} · <span style={{ fontWeight: 700, color: school.colors.accent }}>${total.toFixed(2)}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e0e0e0', background: '#f9f9f9', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 18, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(6, q + 1))}
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e0e0e0', background: '#f9f9f9', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <button onClick={() => setStage('success')}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: school.colors.primary, color: 'white', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Buy Tickets →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Bubble — appears after 4 seconds, context-aware */}
      <ChatBubble
        school={school}
        sport={sport}
        selectedSection={selectedSection}
        qty={qty}
      />
    </div>
  )
}
