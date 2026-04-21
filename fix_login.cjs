const fs = require('fs')
const path = require('path')

const BASE = String.raw`C:\Users\dnbch\OneDrive\Documents\Simple Genius\Peak Sports\peaksportsgallery`
const file = path.join(BASE, 'src', 'components', 'Login', 'Login.jsx')

let content = fs.readFileSync(file, 'utf8')

const old1 = `    logoIcon: {
      width: 40, height: 40, borderRadius: 10,
      background: '#F0F7EE', border: '1px solid #C4D8BE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20,
    },`

const new1 = `    logoIcon: {
      width: 40, height: 40, borderRadius: 10,
      background: '#000', border: '1px solid #C4D8BE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },`

const old2 = `          <div style={s.logoIcon}>🏔️</div>`

const new2 = `          <div style={s.logoIcon}>
            <img src="https://duxfxzblueyrlzttqtgk.supabase.co/storage/v1/object/public/assets/new%20PEAK.png" alt="Peak Sports" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>`

if (!content.includes(old1)) { console.error('❌ logoIcon block not found'); process.exit(1) }
if (!content.includes(old2)) { console.error('❌ emoji not found'); process.exit(1) }

content = content.replace(old1, new1).replace(old2, new2)
fs.writeFileSync(file, content, 'utf8')
console.log('✅ Login.jsx patched with Peak logo')
