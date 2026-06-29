import { useState } from 'react'
import { FORMATS, THEMES, TONES, MODELS, SLIDE_RANGE } from '../constants.js'

// The brief editor for a carousel. `brief` is the single source of truth, `patch`
// merges a partial update, `onForge` fires the generation.
export default function Composer({ brief, patch, onForge, loading }) {
  const [advanced, setAdvanced] = useState(
    () => !!(brief.audience || brief.cta || brief.brandVoice),
  )

  const canForge = brief.topic.trim() && !loading
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canForge) onForge()
  }

  return (
    <div className="composer">
      <label className="field-label">What's the carousel about?</label>
      <textarea
        className="topic-input"
        placeholder="e.g. 5 mistakes that kill indie app launches — and how to avoid them."
        value={brief.topic}
        onChange={(e) => patch({ topic: e.target.value })}
        onKeyDown={onKeyDown}
        rows={3}
        autoFocus
      />

      <div className="knobs">
        <div className="knob">
          <label className="field-label">Slides</label>
          <div className="stepper">
            <button type="button" onClick={() => patch({ slideCount: Math.max(SLIDE_RANGE.min, brief.slideCount - 1) })} disabled={brief.slideCount <= SLIDE_RANGE.min}>–</button>
            <span>{brief.slideCount}</span>
            <button type="button" onClick={() => patch({ slideCount: Math.min(SLIDE_RANGE.max, brief.slideCount + 1) })} disabled={brief.slideCount >= SLIDE_RANGE.max}>+</button>
          </div>
        </div>

        <div className="knob">
          <label className="field-label">Format</label>
          <div className="segmented">
            {FORMATS.map((f) => (
              <button key={f.id} type="button" className={brief.format === f.id ? 'on' : ''} onClick={() => patch({ format: f.id })}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="knob">
          <label className="field-label">Tone</label>
          <select className="select" value={brief.tone} onChange={(e) => patch({ tone: e.target.value })}>
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="knob">
          <label className="field-label">Model</label>
          <select className="select" value={brief.model} onChange={(e) => patch({ model: e.target.value })}>
            {MODELS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <label className="field-label">Theme</label>
      <div className="theme-row">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`theme-swatch lg${brief.theme === t.id ? ' on' : ''}`}
            title={t.name}
            onClick={() => patch({ theme: t.id })}
            style={{ background: t.bg }}
          >
            <span style={{ background: t.accent }} />
          </button>
        ))}
        <span className="theme-hint">switchable live after generating</span>
      </div>

      <div className="toggles">
        <button type="button" className="advanced-toggle" onClick={() => setAdvanced((v) => !v)}>
          {advanced ? '− Fewer options' : '+ More options'}
        </button>
      </div>

      {advanced && (
        <div className="advanced">
          <div className="knob wide">
            <label className="field-label">Brand handle</label>
            <input className="text-input" placeholder="@yourbrand" value={brief.handle} onChange={(e) => patch({ handle: e.target.value })} />
          </div>
          <div className="knob wide">
            <label className="field-label">Audience</label>
            <input className="text-input" placeholder="e.g. indie developers, busy parents…" value={brief.audience} onChange={(e) => patch({ audience: e.target.value })} />
          </div>
          <div className="knob wide">
            <label className="field-label">Call to action</label>
            <input className="text-input" placeholder="e.g. Save this & follow for more" value={brief.cta} onChange={(e) => patch({ cta: e.target.value })} />
          </div>
          <div className="knob wide">
            <label className="field-label">Brand voice / extra guidance</label>
            <textarea className="text-input" rows={2} placeholder="e.g. Playful but never cheesy. Avoid corporate buzzwords." value={brief.brandVoice} onChange={(e) => patch({ brandVoice: e.target.value })} />
          </div>
        </div>
      )}

      <button className="forge-btn" onClick={onForge} disabled={!canForge}>
        {loading ? 'Forging…' : '🔥 Forge carousel'}
        {!loading && <kbd>⌘↵</kbd>}
      </button>
    </div>
  )
}
