import { useMemo, useState } from 'react'
import { searchCatalog } from '../data/catalog'
import InfoLink from './InfoLink'

// Deliberately its own small list rather than reusing CatalogBrowser: this
// one attaches an entry to a bed on tap instead of navigating to it, so the
// tap behavior is different enough that sharing one component would need a
// mode flag. "Details" stays available via InfoLink for anyone who wants to
// check before picking.
export default function PlantingPicker({ onPick, onClose }) {
  const [tab, setTab] = useState('crops')
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchCatalog(query), [query])
  const items = tab === 'crops' ? results.crops : results.animals

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h3>Add to this bed</h3>

        <div className="tabs">
          <button className={`tab ${tab === 'crops' ? 'active' : ''}`} onClick={() => setTab('crops')}>
            Crops ({results.crops.length})
          </button>
          <button className={`tab ${tab === 'animals' ? 'active' : ''}`} onClick={() => setTab('animals')}>
            Animals ({results.animals.length})
          </button>
        </div>

        <input
          className="search-box"
          type="search"
          placeholder={`Search ${tab}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="card-list">
          {items.map((item) => (
            <div key={item.id} className="card picker-card">
              <button type="button" className="picker-card-main" onClick={() => onPick(tab === 'crops' ? 'crop' : 'animal', item.id)}>
                <h3>{item.name}</h3>
                <div className="meta">
                  {tab === 'crops' ? `${item.category} · ${item.family}` : `${item.space_sqft_per_animal} sqft per animal`}
                </div>
              </button>
              <InfoLink kind={tab === 'crops' ? 'crop' : 'animal'} id={item.id} className="picker-card-info">
                Details
              </InfoLink>
            </div>
          ))}
          {items.length === 0 && <p className="meta">No matches.</p>}
        </div>
      </div>
    </div>
  )
}
