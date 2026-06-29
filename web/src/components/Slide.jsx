import { forwardRef } from 'react'

// Renders one carousel slide at FULL export resolution (format.w × format.h px).
// The preview scales this node down with a CSS transform on a parent wrapper, so
// the same node is what html-to-image rasterizes — WYSIWYG export.
//
// All sizes are absolute px against the 1080-wide canvas. Layout switches on
// slide.type; theme supplies the palette.
const Slide = forwardRef(function Slide({ slide, theme, format, handle, index, total }, ref) {
  const pad = Math.round(format.w * 0.085)
  const base = {
    width: format.w, height: format.h, background: theme.bg, color: theme.fg,
    padding: pad, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    position: 'relative', overflow: 'hidden',
  }

  const eyebrow = (text) => text ? (
    <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: theme.accent }}>{text}</div>
  ) : null

  const footer = (showSwipe) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 28, color: theme.muted, fontWeight: 600 }}>
      <span>{handle || ''}</span>
      {showSwipe
        ? <span style={{ color: theme.accent, fontWeight: 700 }}>swipe →</span>
        : <span style={{ fontVariantNumeric: 'tabular-nums' }}>{index + 1} / {total}</span>}
    </div>
  )

  // Thin accent rule used as a visual anchor on content slides.
  const rule = <div style={{ width: 96, height: 8, background: theme.accent, borderRadius: 4 }} />

  let body
  if (slide.type === 'cover') {
    body = (
      <>
        {eyebrow(slide.eyebrow)}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
          <h1 style={{ margin: 0, fontSize: 104, lineHeight: 1.04, fontWeight: 800, letterSpacing: -1 }}>{slide.title}</h1>
          {slide.subtitle && <p style={{ margin: 0, fontSize: 40, lineHeight: 1.4, color: theme.muted, fontWeight: 500 }}>{slide.subtitle}</p>}
        </div>
        {footer(true)}
      </>
    )
  } else if (slide.type === 'list') {
    body = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {rule}
          <h2 style={{ margin: 0, fontSize: 64, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.5 }}>{slide.title}</h2>
        </div>
        <ul style={{ flex: 1, listStyle: 'none', margin: '48px 0 0', padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34 }}>
          {slide.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, fontSize: 42, lineHeight: 1.32, fontWeight: 500 }}>
              <span style={{ color: theme.accent, fontWeight: 800, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {footer(false)}
      </>
    )
  } else if (slide.type === 'quote') {
    body = (
      <>
        <div style={{ fontSize: 200, lineHeight: 0.8, fontWeight: 800, color: theme.accent, opacity: 0.9 }}>“</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30 }}>
          <p style={{ margin: 0, fontSize: 76, lineHeight: 1.18, fontWeight: 800, letterSpacing: -0.5 }}>{slide.title}</p>
          {slide.attribution && <p style={{ margin: 0, fontSize: 36, color: theme.muted, fontWeight: 600 }}>— {slide.attribution}</p>}
        </div>
        {footer(false)}
      </>
    )
  } else if (slide.type === 'cta') {
    body = (
      <>
        {rule}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30 }}>
          <h2 style={{ margin: 0, fontSize: 84, lineHeight: 1.08, fontWeight: 800, letterSpacing: -0.5 }}>{slide.title}</h2>
          {slide.body && <p style={{ margin: 0, fontSize: 42, lineHeight: 1.4, color: theme.muted, fontWeight: 500 }}>{slide.body}</p>}
          <div style={{ marginTop: 16 }}>
            <span style={{ display: 'inline-block', background: theme.accent, color: theme.accentFg, fontSize: 38, fontWeight: 800, padding: '22px 44px', borderRadius: 999 }}>
              {slide.handle || handle || 'Follow for more'}
            </span>
          </div>
        </div>
        {footer(false)}
      </>
    )
  } else {
    // point (default)
    body = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {rule}
          <h2 style={{ margin: 0, fontSize: 76, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.5 }}>{slide.title}</h2>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 46, lineHeight: 1.45, fontWeight: 500, color: theme.fg }}>{slide.body}</p>
        </div>
        {footer(false)}
      </>
    )
  }

  return <div ref={ref} className="slide" style={base}>{body}</div>
})

export default Slide
