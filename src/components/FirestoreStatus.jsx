import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, firebaseReady } from '../firebase'

// Small debug widget, not user-facing product UI. Reads `_meta/ping` to
// prove Firestore offline persistence: create that doc once in the console,
// then throttle the network offline and reload — this should still resolve
// from the local cache instead of hanging or erroring.
export default function FirestoreStatus() {
  const [status, setStatus] = useState(firebaseReady ? 'checking...' : 'no firebase-config.js found')

  useEffect(() => {
    if (!firebaseReady) return
    const ref = doc(db, '_meta', 'ping')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const source = snap.metadata.fromCache ? 'cache' : 'server'
        setStatus(snap.exists() ? `_meta/ping read from ${source}` : `connected, but no _meta/ping doc yet (source: ${source})`)
      },
      (err) => setStatus(`error: ${err.message}`)
    )
    return unsub
  }, [])

  return <div className="footer-status">Firestore: {status}</div>
}
