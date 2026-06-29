import { timeAgo, THEME_BY_ID } from '../constants.js'

// Left rail: a "New carousel" action over the persisted history of past forges.
export default function Sidebar({ history, activeId, onSelect, onNew, onClear }) {
  return (
    <aside className="sidebar">
      <button className="new-post-btn" onClick={onNew}>＋ New carousel</button>

      <div className="sidebar-head">
        <span>History</span>
        {history.length > 0 && (
          <button className="link-btn" onClick={onClear}>Clear</button>
        )}
      </div>

      <div className="history-list">
        {history.length === 0 && (
          <p className="history-empty">Your forged carousels will show up here.</p>
        )}
        {history.map((h) => {
          const theme = THEME_BY_ID[h.brief?.theme] || THEME_BY_ID.midnight
          return (
            <button
              key={h.id}
              className={`history-item${h.id === activeId ? ' active' : ''}`}
              onClick={() => onSelect(h.id)}
            >
              <div className="history-row">
                <span className="history-dot" style={{ background: theme.bg }} />
                <span className="history-topic">{h.title || h.brief?.topic || 'Untitled carousel'}</span>
              </div>
              <div className="history-meta">
                <span>{h.carousel.slides.length} slides</span>
                <span className="history-time">{timeAgo(h.ts)}</span>
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
