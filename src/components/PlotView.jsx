import { useState } from 'react'
import { firebaseReady } from '../firebase'
import { useAuth } from '../auth'
import { usePlot, useBeds, createPlot, createBed } from '../data/plots'
import ShapeDrawer, { CANVAS_W, CANVAS_H, roughClosedPath } from './ShapeCanvas'
import BedPanel from './BedPanel'

function centroid(points) {
  const n = points.length
  const x = points.reduce((s, p) => s + p.x, 0) / n
  const y = points.reduce((s, p) => s + p.y, 0) / n
  return [x * CANVAS_W, y * CANVAS_H]
}

export default function PlotView() {
  const { uid, ready, error } = useAuth()
  const { plot, plotId, loading } = usePlot(uid)
  const beds = useBeds(uid, plotId)

  const [drawingBoundary, setDrawingBoundary] = useState(false)
  const [plotName, setPlotName] = useState('My land')
  const [addBedStep, setAddBedStep] = useState(null) // null | 'name' | 'draw'
  const [newBedName, setNewBedName] = useState('')
  const [selectedBedId, setSelectedBedId] = useState(null)

  if (!firebaseReady) {
    return (
      <p className="meta empty-state">
        Firebase isn't connected yet — once a project is wired up in <code>src/firebase-config.js</code>, this is where you'll sketch
        your land.
      </p>
    )
  }

  if (!ready || loading) {
    return <p className="meta empty-state">Loading your land...</p>
  }

  if (error) {
    return <p className="meta empty-state">Couldn't sign you in: {error}</p>
  }

  const selectedBed = beds.find((b) => b.id === selectedBedId) || null

  if (!plot) {
    if (drawingBoundary) {
      return (
        <ShapeDrawer
          title="Sketch your property boundary"
          onCancel={() => setDrawingBoundary(false)}
          onComplete={async (points) => {
            await createPlot(uid, { name: plotName.trim() || 'My land', boundary_points: points })
            setDrawingBoundary(false)
          }}
        />
      )
    }
    return (
      <div className="empty-state">
        <p>Let's sketch your land. Rough shapes are fine — this isn't a survey.</p>
        <label className="plot-name-label">
          What do you want to call it?
          <input className="search-box" value={plotName} onChange={(e) => setPlotName(e.target.value)} />
        </label>
        <button type="button" className="btn-primary" onClick={() => setDrawingBoundary(true)}>
          Start drawing
        </button>
      </div>
    )
  }

  if (addBedStep === 'name') {
    return (
      <div className="empty-state">
        <p>What do you want to call this bed?</p>
        <input
          className="search-box"
          autoFocus
          value={newBedName}
          onChange={(e) => setNewBedName(e.target.value)}
          placeholder="e.g. Back corner bed"
        />
        <div className="drawer-actions">
          <button type="button" className="btn-ghost" onClick={() => setAddBedStep(null)}>
            Cancel
          </button>
          <button type="button" className="btn-primary" disabled={!newBedName.trim()} onClick={() => setAddBedStep('draw')}>
            Next: draw its shape
          </button>
        </div>
      </div>
    )
  }

  if (addBedStep === 'draw') {
    return (
      <ShapeDrawer
        title={`Sketch the shape of "${newBedName}"`}
        hint="Tap inside your land to outline this bed. At least 3 points."
        onCancel={() => setAddBedStep(null)}
        onComplete={async (points) => {
          const bedId = await createBed(uid, plotId, { name: newBedName.trim(), shape_points: points })
          setAddBedStep(null)
          setNewBedName('')
          setSelectedBedId(bedId)
        }}
      />
    )
  }

  return (
    <div className="plot-view">
      <div className="plot-header-row">
        <h2 className="plot-name">{plot.name}</h2>
        <button type="button" className="btn-primary" onClick={() => setAddBedStep('name')}>
          + Add bed
        </button>
      </div>

      <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="shape-canvas plot-canvas">
        <path d={roughClosedPath(plot.boundary_points)} className="map-boundary" />
        {beds.map((bed) => {
          const [cx, cy] = centroid(bed.shape_points)
          return (
            <g key={bed.id} className="map-bed-group" onClick={() => setSelectedBedId(bed.id)}>
              <path d={roughClosedPath(bed.shape_points)} className="map-bed" />
              <text x={cx} y={cy} className="map-bed-label" textAnchor="middle">
                {bed.name}
              </text>
            </g>
          )
        })}
      </svg>

      {beds.length === 0 && <p className="meta">No beds yet — tap "+ Add bed" to sketch one inside your land.</p>}

      {selectedBed && <BedPanel uid={uid} plotId={plotId} bed={selectedBed} onClose={() => setSelectedBedId(null)} />}
    </div>
  )
}
