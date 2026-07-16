import { useDetail } from '../context/DetailContext'

// A crop/animal name or keyword rendered as a tappable inline button that
// opens the shared DetailModal. kind: 'crop' | 'animal' | 'keyword'.
export default function InfoLink({ kind, id, children, className }) {
  const { open } = useDetail()
  return (
    <button type="button" className={`info-link ${className || ''}`} onClick={() => open({ kind, id })}>
      {children}
    </button>
  )
}
