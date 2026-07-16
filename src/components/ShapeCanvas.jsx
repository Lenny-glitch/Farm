import { useRef, useState } from 'react'

// Fixed 4:3 viewBox. Points are stored as pure 0-1 fractions of the
// canvas's actual on-screen width/height (not of these viewBox units), so
// the CSS aspect-ratio on the canvas element is what has to stay in sync
// with this ratio — see .shape-canvas in theme.css.
export const CANVAS_W = 100
export const CANVAS_H = 75

// Turns a loose point array into a closed, rounded SVG path — quadratic
// curves through each edge's midpoint (a standard "smooth a polygon"
// trick) plus a small deterministic per-point jitter, so the shape reads
// as sketched rather than drafted. Deterministic (not random) so a shape
// doesn't visually jump every re-render.
export function roughClosedPath(points, w = CANVAS_W, h = CANVAS_H) {
  if (points.length < 3) return ''

  const pts = points.map((p, i) => {
    const px = p.x * w
    const py = p.y * h
    const jseed = (i * 2654435761) % 1000
    const jx = ((jseed % 100) / 100 - 0.5) * (w * 0.012)
    const jy = ((Math.floor(jseed / 100) % 10) / 10 - 0.5) * (h * 0.012)
    return [px + jx, py + jy]
  })

  const n = pts.length
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const start = mid(pts[n - 1], pts[0])
  let d = `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} `
  for (let i = 0; i < n; i++) {
    const cur = pts[i]
    const next = pts[(i + 1) % n]
    const m = mid(cur, next)
    d += `Q ${cur[0].toFixed(2)} ${cur[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)} `
  }
  return d + 'Z'
}

// Tap-to-place-points drawing: chosen over freehand because it's far more
// forgiving of shaky/imprecise taps (a single bad freehand stroke ruins
// the whole shape; a single bad point here is one undo away). See the L2
// report for the full reasoning.
export default function ShapeDrawer({ title, hint, onComplete, onCancel }) {
  const [points, setPoints] = useState([])
  const svgRef = useRef(null)

  function handlePlace(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    setPoints((pts) => [...pts, { x, y }])
  }

  const pixelPts = points.map((p) => [p.x * CANVAS_W, p.y * CANVAS_H])
  const closed = points.length >= 3

  return (
    <div className="shape-drawer">
      <p className="drawer-title">{title}</p>
      <p className="drawer-hint">{hint || 'Tap to place points around the shape, then tap Done. Aim for at least 3 points.'}</p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="shape-canvas drawer-canvas"
        onPointerDown={handlePlace}
      >
        {closed && <path d={roughClosedPath(points)} className="drawer-shape-preview" />}
        {!closed && pixelPts.length > 1 && (
          <polyline points={pixelPts.map((p) => p.join(',')).join(' ')} className="drawer-guide-line" />
        )}
        {pixelPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} className="drawer-point" />
        ))}
      </svg>

      <div className="drawer-controls">
        <button type="button" className="btn-secondary" onClick={() => setPoints((pts) => pts.slice(0, -1))} disabled={points.length === 0}>
          Undo last point
        </button>
        <button type="button" className="btn-secondary" onClick={() => setPoints([])} disabled={points.length === 0}>
          Clear &amp; restart
        </button>
      </div>

      <div className="drawer-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={() => onComplete(points)} disabled={!closed}>
          Done{points.length > 0 ? ` (${points.length} point${points.length === 1 ? '' : 's'})` : ''}
        </button>
      </div>
    </div>
  )
}
