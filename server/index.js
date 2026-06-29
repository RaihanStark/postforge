// PostForge backend. In dev this runs standalone and Vite proxies /api to it.
// In the packaged Electron app it serves the built frontend from the same origin.
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as generator from './generator.js'
import { FORMATS, TONES, SLIDES } from './formats.js'

const app = express()
const PORT = process.env.PORT || 5174

// App version, read once from the root package.json so the UI can surface it.
const __dir = path.dirname(fileURLToPath(import.meta.url))
const VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dir, '..', 'package.json'), 'utf8')).version || '0.0.0'
  } catch {
    return '0.0.0'
  }
})()

app.use(express.json({ limit: '1mb' }))

// Small helper so every route gets consistent error handling.
const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req))
  } catch (err) {
    console.error(`[${req.method} ${req.path}]`, err.message)
    res.status(500).json({ error: err.message })
  }
}

app.get('/api/health', handle(async () => ({ ok: true, ts: Date.now() })))

app.get('/api/version', handle(async () => ({ version: VERSION })))

// Static metadata the UI can hydrate from (kept in sync with the generator).
app.get('/api/meta', handle(async () => ({
  version: VERSION,
  formats: FORMATS,
  tones: TONES,
  slides: SLIDES,
})))

// Forge a carousel from a brief.
// → { title, slides: [{ type, title, ... }], caption, hashtags[] }
app.post('/api/generate', handle((req) => generator.generate(req.body || {})))

// In the packaged (Electron) app, serve the built frontend from the same origin
// so /api calls need no proxy. POSTFORGE_SERVE_WEB is set by the Electron main.
if (process.env.POSTFORGE_SERVE_WEB) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const webDist = path.join(__dirname, '..', 'web', 'dist')
  app.use(express.static(webDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(webDist, 'index.html'))
  })
}

// Resolves once the server is listening (Electron waits on this before opening the window).
export const started = new Promise((resolve) => {
  app.listen(PORT, () => {
    console.log(`\n  🔥  PostForge server ready → http://localhost:${PORT}\n`)
    resolve(PORT)
  })
})
