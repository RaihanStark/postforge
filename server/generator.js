// Wraps the Claude Agent SDK as a tool-less carousel designer. Given a brief it
// returns STRUCTURED slide content (cover / point / list / quote / cta) plus a
// caption — the web app turns that content into rendered, themeable slide images.
// Auth flows through the user's existing Claude Code login (no API key here).
import { SLIDES, SLIDE_TYPES } from './formats.js'

let _sdk
async function sdk() {
  if (!_sdk) _sdk = await import('@anthropic-ai/claude-agent-sdk')
  return _sdk
}

// Pull a JSON object/array out of a model reply: prefer a fenced ```json block,
// fall back to the first {...}/[...] span. Returns null on any failure.
function extractJson(text) {
  const raw = String(text || '')
  let json = null
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) json = fence[1]
  else {
    const span = raw.match(/[[{][\s\S]*[\]}]/)
    if (span) json = span[0]
  }
  if (!json) return null
  try {
    return JSON.parse(json.trim())
  } catch {
    return null
  }
}

function buildPrompt({ topic, slideCount, tone, audience, cta, brandVoice, handle }) {
  const typeList = Object.entries(SLIDE_TYPES).map(([k, v]) => `- "${k}": ${v}`).join('\n')
  const knobs = [
    `Tone: ${tone}.`,
    `Number of slides: exactly ${slideCount}.`,
    audience ? `Target audience: ${audience}.` : '',
    cta ? `Desired call to action: "${cta}".` : '',
    handle ? `Brand handle: ${handle}.` : '',
    brandVoice ? `Brand voice / extra guidance: ${brandVoice}` : '',
  ].filter(Boolean).join('\n')

  return `You are an elite social media carousel designer. Design a swipeable carousel (Instagram/LinkedIn style) about the topic below. You write the COPY and structure only — a separate renderer handles visuals — so keep every piece of text short, punchy and scannable.

TOPIC / BRIEF:
${topic}

CONSTRAINTS:
${knobs}

SLIDE TYPES you may use:
${typeList}

Structure rules:
- The FIRST slide must be type "cover" (a scroll-stopping hook).
- The LAST slide must be type "cta".
- The middle slides carry the substance — mix "point", "list" and "quote".
- Cover title: max ~7 words. Headings: max ~8 words. Body: max ~2 short sentences. Bullets: max ~7 words each, 2-5 per list slide.
- Make it genuinely valuable and specific — no filler.

Reply with EXACTLY ONE fenced \`\`\`json code block and nothing else, of this exact shape:
{
  "title": "<short internal name for this carousel>",
  "slides": [
    { "type": "cover", "eyebrow": "<2-3 word kicker, optional>", "title": "<hook>", "subtitle": "<optional one-liner>" },
    { "type": "point", "title": "<heading>", "body": "<1-2 sentences>" },
    { "type": "list", "title": "<heading>", "bullets": ["<item>", "<item>"] },
    { "type": "quote", "title": "<bold statement>", "attribution": "<optional source>" },
    { "type": "cta", "title": "<call to action>", "body": "<optional nudge>", "handle": "${handle || '@yourhandle'}" }
  ],
  "caption": "<a ready-to-post caption to accompany the carousel>",
  "hashtags": ["<tag without # >", "..."]
}

Produce exactly ${slideCount} slides in the "slides" array.`
}

const ALLOWED = new Set(Object.keys(SLIDE_TYPES))

// Coerce one model slide into the renderer's expected shape.
function normalizeSlide(raw, isFirst, isLast) {
  let type = ALLOWED.has(raw?.type) ? raw.type : 'point'
  if (isFirst) type = 'cover'
  if (isLast) type = 'cta'
  const str = (v) => (v == null ? '' : String(v).trim())
  let bullets = Array.isArray(raw?.bullets) ? raw.bullets.map(str).filter(Boolean) : []
  bullets = bullets.slice(0, 5)
  return {
    type,
    eyebrow: str(raw?.eyebrow),
    title: str(raw?.title),
    subtitle: str(raw?.subtitle),
    body: str(raw?.body),
    attribution: str(raw?.attribution),
    handle: str(raw?.handle),
    bullets,
  }
}

// Generate a carousel for a brief. Returns { title, slides[], caption, hashtags[] }.
export async function generate(brief) {
  const topic = String(brief.topic || '').trim()
  if (!topic) throw new Error('topic is required')

  const slideCount = Math.min(Math.max(Number(brief.slideCount) || SLIDES.default, SLIDES.min), SLIDES.max)
  const opts = {
    topic,
    slideCount,
    tone: brief.tone || 'Professional',
    audience: (brief.audience || '').trim(),
    cta: (brief.cta || '').trim(),
    brandVoice: (brief.brandVoice || '').trim(),
    handle: (brief.handle || '').trim(),
  }

  const model = brief.model || 'sonnet'
  const prompt = buildPrompt(opts)

  const { query } = await sdk()
  const q = query({
    prompt,
    options: { model, permissionMode: 'bypassPermissions', allowedTools: [], disallowedTools: [] },
  })

  let out = ''
  for await (const msg of q) {
    if (msg.type === 'assistant') {
      for (const b of msg.message?.content ?? []) {
        if (b.type === 'text' && b.text?.trim()) out = b.text.trim()
      }
    } else if (msg.type === 'result' && msg.result) {
      out = msg.result
    }
  }

  const parsed = extractJson(out)
  if (!parsed || !Array.isArray(parsed.slides)) throw new Error('model did not return a usable carousel')

  const rawSlides = parsed.slides
  const slides = rawSlides
    .map((s, i) => normalizeSlide(s, i === 0, i === rawSlides.length - 1))
    .filter((s) => s.title || s.body || s.bullets.length)

  if (!slides.length) throw new Error('model returned no slides')

  const hashtags = Array.isArray(parsed.hashtags)
    ? parsed.hashtags.map((h) => String(h).replace(/^#/, '').trim()).filter(Boolean)
    : []

  return {
    title: String(parsed.title || topic).trim().slice(0, 80),
    slides,
    caption: String(parsed.caption || '').trim(),
    hashtags,
  }
}
