// Carousel canvas formats. `w`/`h` are the export pixel sizes; the preview scales
// down from these so what you see is exactly what gets exported.
export const FORMATS = [
  { id: 'portrait', label: 'Portrait 4:5', w: 1080, h: 1350 },
  { id: 'square', label: 'Square 1:1', w: 1080, h: 1080 },
]
export const FORMAT_BY_ID = Object.fromEntries(FORMATS.map((f) => [f.id, f]))

// Visual themes applied at render time (content is generated once, theme is just
// styling — so you can flip themes live without regenerating).
export const THEMES = [
  { id: 'midnight', name: 'Midnight', bg: 'linear-gradient(160deg,#0f172a,#1e293b)', fg: '#f8fafc', muted: '#94a3b8', accent: '#ff6b4a', accentFg: '#1a0c06' },
  { id: 'paper',    name: 'Paper',    bg: '#faf7f2', fg: '#1c1917', muted: '#78716c', accent: '#ea580c', accentFg: '#ffffff' },
  { id: 'mono',     name: 'Mono',     bg: '#ffffff', fg: '#0a0a0a', muted: '#737373', accent: '#0a0a0a', accentFg: '#ffffff' },
  { id: 'vibrant',  name: 'Vibrant',  bg: 'linear-gradient(135deg,#7c3aed,#ec4899 55%,#f59e0b)', fg: '#ffffff', muted: 'rgba(255,255,255,0.82)', accent: '#fde047', accentFg: '#3b0764' },
  { id: 'ocean',    name: 'Ocean',    bg: 'linear-gradient(160deg,#0ea5e9,#2563eb)', fg: '#f0f9ff', muted: 'rgba(255,255,255,0.82)', accent: '#fde047', accentFg: '#0c4a6e' },
  { id: 'forest',   name: 'Forest',   bg: 'linear-gradient(160deg,#065f46,#064e3b)', fg: '#ecfdf5', muted: 'rgba(255,255,255,0.78)', accent: '#a3e635', accentFg: '#1a2e05' },
]
export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t]))

export const TONES = ['Professional', 'Casual', 'Witty', 'Bold', 'Inspirational', 'Educational', 'Friendly', 'Luxurious']

export const SLIDE_RANGE = { min: 3, max: 10, default: 5 }

export const MODELS = [
  { key: 'sonnet', label: 'Sonnet · balanced' },
  { key: 'opus', label: 'Opus · highest quality' },
  { key: 'haiku', label: 'Haiku · fastest' },
]

export function timeAgo(ts) {
  if (!ts) return ''
  const s = (Date.now() - ts) / 1000
  for (const [label, secs] of [['d', 86400], ['h', 3600], ['m', 60]]) {
    const v = Math.floor(s / secs)
    if (v >= 1) return `${v}${label} ago`
  }
  return 'just now'
}
