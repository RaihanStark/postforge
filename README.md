# PostForge

An AI studio for forging on-brand social media posts across every platform at
once — powered by the Claude Agent SDK, authed through your existing Claude Code
login (no API key wrangling).

Describe what you want to say, pick your channels (X, LinkedIn, Instagram,
Facebook, Threads, TikTok), set the tone/length/variations, and PostForge writes
posts tailored to each platform's culture and character limit. Edit them inline,
watch live character counts, copy, or regenerate a single post.

Same stack as [Squadron](https://github.com/RaihanStark/squadron): an Express
backend wrapping the Claude Agent SDK, a Vite + React frontend, all shipped as a
local Electron desktop app.

## Layout

```
electron/   Electron shell (starts the backend, opens the window)
server/     Express API + Claude Agent SDK wrapper (the copywriter)
web/        Vite + React frontend
```

## Develop

```bash
npm run setup     # install root + web deps
npm run dev       # server (5174) + web (5173) with API proxy
```

Open http://localhost:5173. Add `?demo` to explore the UI against canned data
with no backend or Claude login required: http://localhost:5173/?demo

## Desktop app

```bash
npm run electron  # run the packaged shell against the built web bundle
npm run dist      # build an installer (Linux rpm)
```

## API

- `GET  /api/health` — liveness
- `GET  /api/meta` — platform limits, tones, lengths
- `POST /api/generate` — `{ topic, platforms[], tone, length, variations, hashtags, emoji, audience?, cta?, brandVoice?, model? }` → `{ posts: [{ platform, text, hashtags[], limit }] }`
