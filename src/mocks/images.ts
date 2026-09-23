/*
 * Offline placeholder images generated as SVG data URIs, so the mock data
 * needs no network and no binary assets.
 */

export type GlyphKind =
  | 'phone'
  | 'laptop'
  | 'headphones'
  | 'tablet'
  | 'cable'
  | 'flash'
  | 'keyboard'
  | 'mouse'
  | 'watch'

const PALETTES: [string, string][] = [
  ['#EAF0FB', '#CFDDF5'],
  ['#FCF1E7', '#F6DCC4'],
  ['#E9F6EE', '#CBE8D6'],
  ['#F2EEFA', '#DDD2F1'],
  ['#F1F2F5', '#DDE0E6'],
  ['#FDEDEE', '#F7D3D6'],
]
const ACCENTS = ['#E07A3C', '#6F8FD8', '#A3ABB9', '#4EA674', '#C9A27A', '#D96B7B']
const INK = '#232838'
const METAL = '#B9BEC8'

const keyboardKeys = Array.from({ length: 3 }, (_, row) =>
  Array.from({ length: 10 }, (_, col) => `<rect x="${39 + col * 12.5}" y="${80 + row * 13}" width="9" height="9" rx="2" fill="#E6E8EE"/>`).join(''),
).join('')

const GLYPHS: Record<GlyphKind, (accent: string) => string> = {
  phone: (a) =>
    `<rect x="68" y="28" width="64" height="144" rx="14" fill="${INK}"/><rect x="74" y="36" width="52" height="128" rx="9" fill="${a}"/><rect x="80" y="44" width="22" height="30" rx="7" fill="${INK}" opacity=".85"/><circle cx="91" cy="52" r="4" fill="#5A6275"/><circle cx="91" cy="66" r="4" fill="#5A6275"/>`,
  laptop: (a) =>
    `<rect x="42" y="52" width="116" height="76" rx="7" fill="${INK}"/><rect x="49" y="59" width="102" height="62" rx="3" fill="${a}" opacity=".8"/><path d="M26 134h148l-9 14H35z" fill="${METAL}"/>`,
  headphones: (a) =>
    `<path d="M52 118V98a48 48 0 0 1 96 0v20" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><rect x="38" y="104" width="30" height="50" rx="12" fill="${a}"/><rect x="132" y="104" width="30" height="50" rx="12" fill="${a}"/>`,
  tablet: (a) =>
    `<rect x="50" y="34" width="100" height="132" rx="12" fill="${INK}"/><rect x="57" y="41" width="86" height="118" rx="6" fill="${a}" opacity=".85"/>`,
  cable: (a) =>
    `<path d="M60 60c0 60 80 20 80 80" fill="none" stroke="${a}" stroke-width="9" stroke-linecap="round"/><rect x="48" y="30" width="24" height="34" rx="5" fill="${INK}"/><rect x="54" y="20" width="12" height="12" rx="2" fill="${METAL}"/><rect x="128" y="136" width="24" height="34" rx="5" fill="${INK}"/><rect x="134" y="168" width="12" height="12" rx="2" fill="${METAL}"/>`,
  flash: (a) =>
    `<rect x="78" y="62" width="44" height="100" rx="10" fill="${a}"/><rect x="86" y="36" width="28" height="30" rx="3" fill="${METAL}"/><rect x="92" y="44" width="5" height="6" fill="${INK}"/><rect x="103" y="44" width="5" height="6" fill="${INK}"/><circle cx="100" cy="140" r="6" fill="${INK}" opacity=".5"/>`,
  keyboard: (a) =>
    `<rect x="30" y="70" width="140" height="62" rx="9" fill="${INK}"/>${keyboardKeys}<rect x="70" y="118" width="60" height="8" rx="2" fill="${a}"/>`,
  mouse: (a) =>
    `<rect x="68" y="40" width="64" height="120" rx="32" fill="${INK}"/><path d="M100 44v38" stroke="#5A6275" stroke-width="3"/><rect x="95" y="56" width="10" height="18" rx="5" fill="${a}"/>`,
  watch: (a) =>
    `<rect x="80" y="24" width="40" height="152" rx="10" fill="${a}"/><rect x="64" y="62" width="72" height="80" rx="18" fill="${INK}"/><rect x="71" y="69" width="58" height="66" rx="12" fill="#3A4256"/><path d="M86 102h28M100 88v14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
}

function toDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`)

export function glyphImage(kind: GlyphKind, variant = 0): string {
  const [from, to] = PALETTES[variant % PALETTES.length]
  const accent = ACCENTS[variant % ACCENTS.length]
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/>${GLYPHS[kind](accent)}</svg>`,
  )
}

const BANNER_THEMES: [string, string, string][] = [
  ['#8FB0F0', '#0B2F73', '#FFFFFF'],
  ['#F6C28B', '#5E2804', '#FFF7EE'],
  ['#9ED8B4', '#0F4227', '#F2FFF6'],
  ['#C6B4F0', '#2A1761', '#FFFFFF'],
  ['#F3A3A8', '#5F0D14', '#FFF5F5'],
]

/** Wide 16:6 banner. */
export function bannerImage(title: string, subtitle: string, variant = 0): string {
  const [bg, ink, pill] = BANNER_THEMES[variant % BANNER_THEMES.length]
  const titleSize = Math.min(120, Math.floor(1400 / Math.max(1, title.length * 0.6)))
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600"><rect width="1600" height="600" fill="${bg}"/><circle cx="140" cy="90" r="160" fill="#fff" opacity=".18"/><circle cx="1480" cy="520" r="220" fill="#fff" opacity=".16"/><circle cx="1300" cy="110" r="36" fill="#fff" opacity=".35"/><circle cx="260" cy="500" r="24" fill="#fff" opacity=".35"/><text x="800" y="250" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${titleSize}" fill="${ink}">${escapeXml(title.toUpperCase())}</text><text x="800" y="345" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="52" fill="${ink}" opacity=".85">${escapeXml(subtitle)}</text><rect x="540" y="410" width="520" height="92" rx="46" fill="${pill}"/><text x="800" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="42" fill="${ink}">osush.com.tm</text></svg>`,
  )
}
