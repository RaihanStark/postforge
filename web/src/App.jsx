import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { usePref } from './prefs.js'
import { FORMAT_BY_ID, THEME_BY_ID, SLIDE_RANGE } from './constants.js'
import Sidebar from './components/Sidebar.jsx'
import Composer from './components/Composer.jsx'
import Carousel from './components/Carousel.jsx'

const DEFAULT_BRIEF = {
  topic: '',
  slideCount: SLIDE_RANGE.default,
  format: 'portrait',
  theme: 'midnight',
  tone: 'Professional',
  handle: '',
  audience: '',
  cta: '',
  brandVoice: '',
  model: 'sonnet',
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export default function App() {
  // The knobs persist (so reopening keeps your defaults); the topic resets.
  const [settings, setSettings] = usePref('settings', DEFAULT_BRIEF)
  const [topic, setTopic] = useState('')
  const brief = useMemo(() => ({ ...DEFAULT_BRIEF, ...settings, topic }), [settings, topic])

  const [history, setHistory] = usePref('history', [])
  const [activeId, setActiveId] = useState(null)
  const [carousel, setCarousel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [version, setVersion] = useState('')

  // Pull canonical format sizes + app version from the server so the export
  // resolution matches and the build version is surfaced in the UI.
  useEffect(() => {
    api('/api/meta')
      .then((meta) => {
        if (meta.version) setVersion(meta.version)
        for (const [id, f] of Object.entries(meta.formats || {})) {
          if (FORMAT_BY_ID[id] && f.w && f.h) { FORMAT_BY_ID[id].w = f.w; FORMAT_BY_ID[id].h = f.h }
        }
      })
      .catch(() => {})
  }, [])

  const patch = (delta) => {
    if ('topic' in delta) setTopic(delta.topic)
    const rest = { ...delta }
    delete rest.topic
    if (Object.keys(rest).length) setSettings((s) => ({ ...s, ...rest }))
  }

  async function forge() {
    setLoading(true)
    setError(null)
    try {
      const result = await api('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      })
      setCarousel(result)
      const entry = { id: newId(), title: result.title, ts: Date.now(), brief, carousel: result }
      setActiveId(entry.id)
      setHistory((h) => [entry, ...h].slice(0, 40))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function selectHistory(id) {
    const entry = history.find((e) => e.id === id)
    if (!entry) return
    setActiveId(id)
    setCarousel(entry.carousel)
    setTopic(entry.brief?.topic || '')
    if (entry.brief) {
      const { topic: _t, ...rest } = entry.brief
      setSettings((s) => ({ ...s, ...rest }))
    }
  }

  function newCarousel() {
    setActiveId(null)
    setCarousel(null)
    setTopic('')
    setError(null)
  }

  function clearHistory() {
    setHistory([])
    setActiveId(null)
  }

  async function copyCaption() {
    if (!carousel) return
    const tags = carousel.hashtags?.length ? '\n\n' + carousel.hashtags.map((h) => `#${h}`).join(' ') : ''
    try {
      await navigator.clipboard.writeText((carousel.caption || '') + tags)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch { /* clipboard blocked */ }
  }

  const format = FORMAT_BY_ID[brief.format] || FORMAT_BY_ID.portrait
  const theme = THEME_BY_ID[brief.theme] || THEME_BY_ID.midnight

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">🔥 PostForge</span>
        <span className="tagline">AI carousel maker — forge swipeable slide posts from a single idea</span>
        {version && <span className="version">v{version}</span>}
      </header>

      <div className="body">
        <Sidebar
          history={history}
          activeId={activeId}
          onSelect={selectHistory}
          onNew={newCarousel}
          onClear={clearHistory}
        />

        <main className="main">
          <Composer brief={brief} patch={patch} onForge={forge} loading={loading} />

          <section className="results">
            {error && <div className="error-banner">⚠ {error}</div>}

            {loading && (
              <div className="results-loading">
                <div className="spinner" />
                <p>Designing your slides…</p>
              </div>
            )}

            {!loading && !carousel && !error && (
              <div className="empty-state">
                <div className="empty-emoji">🖼️</div>
                <h2>No carousel yet</h2>
                <p>Describe your idea, set the slide count &amp; theme, and hit <b>Forge carousel</b>.</p>
              </div>
            )}

            {!loading && carousel && (
              <>
                <div className="results-head">
                  <h2>{carousel.title}</h2>
                  <span className="results-count">{carousel.slides.length} slides · {format.label}</span>
                </div>

                <Carousel
                  carousel={carousel}
                  theme={theme}
                  themeId={brief.theme}
                  onTheme={(id) => patch({ theme: id })}
                  format={format}
                  handle={brief.handle}
                />

                {carousel.caption && (
                  <div className="caption-panel">
                    <div className="caption-head">
                      <span className="field-label">Suggested caption</span>
                      <button className="ghost-btn" onClick={copyCaption}>{copied ? '✓ Copied' : 'Copy caption'}</button>
                    </div>
                    <p className="caption-text">{carousel.caption}</p>
                    {carousel.hashtags?.length > 0 && (
                      <div className="hashtags">
                        {carousel.hashtags.map((h) => <span key={h} className="hashtag">#{h}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
