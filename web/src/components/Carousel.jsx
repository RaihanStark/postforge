import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import Slide from './Slide.jsx'
import { THEMES } from '../constants.js'

// A scaled, non-interactive copy of a slide for preview/thumbnail use.
function ScaledSlide({ slide, theme, format, handle, index, total, targetH }) {
  const scale = targetH / format.h
  return (
    <div style={{ width: format.w * scale, height: format.h * scale, flexShrink: 0 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Slide slide={slide} theme={theme} format={format} handle={handle} index={index} total={total} />
      </div>
    </div>
  )
}

export default function Carousel({ carousel, theme, themeId, onTheme, format, handle }) {
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const exportRefs = useRef([])

  const slides = carousel.slides
  const total = slides.length
  const cur = Math.min(index, total - 1)
  const previewH = 520

  const safeName = (carousel.title || 'carousel').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'carousel'

  const shot = (node) => toPng(node, { width: format.w, height: format.h, pixelRatio: 1, cacheBust: true })

  async function downloadOne(i) {
    const node = exportRefs.current[i]
    if (!node) return
    setBusy(true)
    try {
      const url = await shot(node)
      const a = document.createElement('a')
      a.href = url
      a.download = `${safeName}-${String(i + 1).padStart(2, '0')}.png`
      a.click()
    } finally {
      setBusy(false)
    }
  }

  async function downloadAll() {
    setBusy(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < total; i++) {
        const node = exportRefs.current[i]
        if (!node) continue
        const url = await shot(node)
        zip.file(`${safeName}-${String(i + 1).padStart(2, '0')}.png`, url.split(',')[1], { base64: true })
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${safeName}.zip`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="carousel">
      {/* Hidden full-resolution layer that export rasterizes from. */}
      <div className="export-layer" aria-hidden>
        {slides.map((s, i) => (
          <div key={i} ref={(el) => { exportRefs.current[i] = el }}>
            <Slide slide={s} theme={theme} format={format} handle={handle} index={i} total={total} />
          </div>
        ))}
      </div>

      <div className="carousel-bar">
        <div className="theme-picker">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-swatch${t.id === themeId ? ' on' : ''}`}
              title={t.name}
              onClick={() => onTheme(t.id)}
              style={{ background: t.bg }}
            >
              <span style={{ background: t.accent }} />
            </button>
          ))}
        </div>
        <div className="carousel-export">
          <button className="ghost-btn" onClick={() => downloadOne(cur)} disabled={busy}>↓ This slide</button>
          <button className="forge-btn sm" onClick={downloadAll} disabled={busy}>{busy ? 'Exporting…' : `↓ Export all (${total})`}</button>
        </div>
      </div>

      <div className="stage">
        <button className="nav-btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={cur === 0}>‹</button>
        <div className="stage-slide" style={{ width: format.w * (previewH / format.h), height: previewH }}>
          <div style={{ transform: `scale(${previewH / format.h})`, transformOrigin: 'top left' }}>
            <Slide slide={slides[cur]} theme={theme} format={format} handle={handle} index={cur} total={total} />
          </div>
        </div>
        <button className="nav-btn" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))} disabled={cur === total - 1}>›</button>
      </div>

      <div className="filmstrip">
        {slides.map((s, i) => (
          <button key={i} className={`thumb${i === cur ? ' on' : ''}`} onClick={() => setIndex(i)}>
            <ScaledSlide slide={s} theme={theme} format={format} handle={handle} index={i} total={total} targetH={118} />
            <span className="thumb-num">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
