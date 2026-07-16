import { createContext, useContext, useState } from 'react'

const DetailContext = createContext(null)

// Backs the "expandable info" requirement: any crop/animal name or notable
// keyword anywhere in the L2 UI can call open({ kind, id }) to pop the
// shared detail modal, without prop-drilling a callback through every
// intermediate component.
export function DetailProvider({ children }) {
  const [target, setTarget] = useState(null)

  return <DetailContext.Provider value={{ target, open: setTarget, close: () => setTarget(null) }}>{children}</DetailContext.Provider>
}

export function useDetail() {
  const ctx = useContext(DetailContext)
  if (!ctx) throw new Error('useDetail must be used within DetailProvider')
  return ctx
}
