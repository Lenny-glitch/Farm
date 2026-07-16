import { useState } from 'react'
import CatalogBrowser from './components/CatalogBrowser'
import CropDetail from './components/CropDetail'
import AnimalDetail from './components/AnimalDetail'
import FirestoreStatus from './components/FirestoreStatus'
import PlotView from './components/PlotView'
import DetailModal from './components/DetailModal'
import { DetailProvider } from './context/DetailContext'
import { crops, animals } from './data/catalog'

export default function App() {
  const [tab, setTab] = useState('map')
  const [view, setView] = useState({ kind: 'list' })

  const selected =
    view.kind === 'crop'
      ? crops.find((c) => c.id === view.id)
      : view.kind === 'animal'
        ? animals.find((a) => a.id === view.id)
        : null

  return (
    <DetailProvider>
      <header className="app-header">
        <h1>🌱 FarmMapper</h1>
        <nav className="main-nav">
          <button className={`nav-tab ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
            My Land
          </button>
          <button className={`nav-tab ${tab === 'catalog' ? 'active' : ''}`} onClick={() => setTab('catalog')}>
            Catalog
          </button>
        </nav>
      </header>

      {tab === 'map' && <PlotView />}

      {tab === 'catalog' && (
        <>
          {view.kind === 'list' && <CatalogBrowser onSelect={(kind, id) => setView({ kind, id })} />}

          {selected && (
            <>
              <button className="back-link" onClick={() => setView({ kind: 'list' })}>
                &larr; Back to catalog
              </button>
              {view.kind === 'crop' ? <CropDetail crop={selected} /> : <AnimalDetail animal={selected} />}
            </>
          )}
        </>
      )}

      <DetailModal />
      <FirestoreStatus />
    </DetailProvider>
  )
}
