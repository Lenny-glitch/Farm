import { useState } from 'react'
import CatalogBrowser from './components/CatalogBrowser'
import CropDetail from './components/CropDetail'
import AnimalDetail from './components/AnimalDetail'
import FirestoreStatus from './components/FirestoreStatus'
import { crops, animals } from './data/catalog'

export default function App() {
  const [view, setView] = useState({ kind: 'list' })

  const selected =
    view.kind === 'crop'
      ? crops.find((c) => c.id === view.id)
      : view.kind === 'animal'
        ? animals.find((a) => a.id === view.id)
        : null

  return (
    <>
      <header className="app-header">
        <h1>🌱 FarmMapper</h1>
        <span className="subtitle">Reference catalog</span>
      </header>

      {view.kind === 'list' && <CatalogBrowser onSelect={(kind, id) => setView({ kind, id })} />}

      {selected && (
        <>
          <button className="back-link" onClick={() => setView({ kind: 'list' })}>
            &larr; Back to catalog
          </button>
          {view.kind === 'crop' ? <CropDetail crop={selected} /> : <AnimalDetail animal={selected} />}
        </>
      )}

      <FirestoreStatus />
    </>
  )
}
