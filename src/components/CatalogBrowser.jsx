import { useMemo, useState } from 'react'
import { searchCatalog } from '../data/catalog'

export default function CatalogBrowser({ onSelect }) {
  const [tab, setTab] = useState('crops')
  const [query, setQuery] = useState('')

  const results = useMemo(() => searchCatalog(query), [query])
  const items = tab === 'crops' ? results.crops : results.animals

  return (
    <div>
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
          <button key={item.id} className="card" onClick={() => onSelect(tab === 'crops' ? 'crop' : 'animal', item.id)}>
            <h3>{item.name}</h3>
            <div className="meta">
              {tab === 'crops'
                ? `${item.category} · ${item.family}`
                : `${item.space_sqft_per_animal} sqft · ${item.yield.primary.product}`}
            </div>
          </button>
        ))}
        {items.length === 0 && <p className="meta">No matches.</p>}
      </div>
    </div>
  )
}
