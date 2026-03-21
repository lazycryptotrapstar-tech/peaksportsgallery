export const MEMBERSHIP_TIERS = {
  standard: {
    id: 'standard',
    label: 'Standard',
    color: '#94a3b8',
    bg: '#f8fafc',
    price: 0,
    perks: ['General admission access', 'Standard pricing', 'Mobile ticketing'],
    discount: 0,
  },
  gold: {
    id: 'gold',
    label: 'Gold Member',
    color: '#d97706',
    bg: '#fffbeb',
    price: 99,
    perks: ['Priority access', '10% discount', 'Exclusive sections', 'Free parking (select games)'],
    discount: 0.10,
  },
  platinum: {
    id: 'platinum',
    label: 'Platinum Member',
    color: '#7c3aed',
    bg: '#faf5ff',
    price: 249,
    perks: ['48hr presale access', '20% discount', 'VIP sections unlocked', 'Complimentary parking', 'In-seat delivery'],
    discount: 0.20,
  },
  alumni: {
    id: 'alumni',
    label: 'Alumni Member',
    color: '#886E4C',
    bg: '#fdf8f0',
    price: 149,
    perks: ['Alumni section access', '15% loyalty discount', 'Exclusive alumni events', 'Legacy pricing locked'],
    discount: 0.15,
  },
}

export const BUNDLE_DEALS = [
  { minQty: 2,  label: 'Pair Deal',     discount: 0,    badge: null,              msg: '' },
  { minQty: 4,  label: 'Group of 4',   discount: 0.10, badge: '10% OFF',         msg: 'Save 10% — perfect for families!' },
  { minQty: 6,  label: 'Group of 6+',  discount: 0.15, badge: '15% OFF',         msg: 'Group discount applied!' },
  { minQty: 10, label: 'Group of 10+', discount: 0.20, badge: '20% OFF + PERKS', msg: 'Best value — 20% off + group check-in lane.' },
]

export const getBundleDeal = (qty) => {
  const deals = BUNDLE_DEALS.filter(d => qty >= d.minQty)
  return deals.length ? deals[deals.length - 1] : BUNDLE_DEALS[0]
}
