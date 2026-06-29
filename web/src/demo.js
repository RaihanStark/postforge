// Canned responses so the whole UI is explorable with ?demo — no backend, no
// Claude login required. Returns Promises shaped like the real API.
const META = {
  version: '0.1.0',
  formats: {
    portrait: { label: 'Portrait 4:5', w: 1080, h: 1350 },
    square: { label: 'Square 1:1', w: 1080, h: 1080 },
  },
  tones: ['Professional', 'Casual', 'Witty', 'Bold', 'Inspirational'],
  slides: { min: 3, max: 10, default: 5 },
}

const CAROUSEL = {
  title: 'Indie launch mistakes',
  caption: 'Most indie launches don’t fail at build time — they fail at launch time. Here are 5 mistakes I see over and over (and the fixes). Save this for your next ship 🚀',
  hashtags: ['indiehackers', 'buildinpublic', 'startup', 'productlaunch'],
  slides: [
    { type: 'cover', eyebrow: 'Read this first', title: '5 mistakes that kill indie launches', subtitle: 'And the simple fixes that actually move the needle.', bullets: [] },
    { type: 'point', title: 'Launching to silence', body: 'You shipped to an empty room. Build the audience before the product — even 100 engaged people changes everything.', bullets: [] },
    { type: 'list', title: 'A launch day checklist', bullets: ['Warm up your list a week early', 'Post where your users already hang out', 'Reply to every single comment', 'Have a clear next step ready'], body: '' },
    { type: 'quote', title: 'People don’t buy features. They buy a better version of themselves.', attribution: 'every good landing page', bullets: [] },
    { type: 'cta', title: 'Save this before your next launch', body: 'Follow for no-fluff building-in-public playbooks.', handle: '@postforge', bullets: [] },
  ],
}

export function demoApi(path, opts) {
  if (path === '/api/meta') return Promise.resolve(META)
  if (path === '/api/health') return Promise.resolve({ ok: true, ts: Date.now() })
  if (path === '/api/generate') {
    const brief = JSON.parse(opts?.body || '{}')
    const n = Math.min(Math.max(Number(brief.slideCount) || 5, 3), 10)
    // Pad/trim the canned deck to the requested slide count (keep cover + cta).
    let slides = CAROUSEL.slides
    if (n !== slides.length) {
      const middle = slides.slice(1, -1)
      const body = []
      for (let i = 0; i < n - 2; i++) body.push(middle[i % middle.length])
      slides = [slides[0], ...body, slides[slides.length - 1]]
    }
    const handle = (brief.handle || '@postforge').trim()
    const result = { ...CAROUSEL, slides: slides.map((s) => (s.type === 'cta' ? { ...s, handle } : s)) }
    return new Promise((r) => setTimeout(() => r(result), 900))
  }
  return Promise.reject(new Error(`demo: no stub for ${path}`))
}
