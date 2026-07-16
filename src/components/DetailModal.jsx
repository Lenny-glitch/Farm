import { useDetail } from '../context/DetailContext'
import { crops, animals } from '../data/catalog'
import { getKeywordDefinition } from '../data/glossary'
import CropDetail from './CropDetail'
import AnimalDetail from './AnimalDetail'

// Hosts the Layer 1 detail views (reused as-is, not rebuilt) plus a short
// plain-language definition for keyword lookups, in one shared overlay.
export default function DetailModal() {
  const { target, close } = useDetail()
  if (!target) return null

  let heading = null
  let body

  if (target.kind === 'crop') {
    const crop = crops.find((c) => c.id === target.id)
    body = crop ? <CropDetail crop={crop} /> : <p>Not found.</p>
  } else if (target.kind === 'animal') {
    const animal = animals.find((a) => a.id === target.id)
    body = animal ? <AnimalDetail animal={animal} /> : <p>Not found.</p>
  } else {
    const def = getKeywordDefinition(target.id)
    heading = def?.label ?? target.id.replace(/_/g, ' ')
    body = <p>{def?.explanation ?? 'No definition available yet.'}</p>
  }

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="modal-close" onClick={close} aria-label="Close">
          &times;
        </button>
        {heading && <h3 className="modal-keyword-heading">{heading}</h3>}
        {body}
      </div>
    </div>
  )
}
