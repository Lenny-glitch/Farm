import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth, firebaseReady } from './firebase'

// Signs the visitor in anonymously on first load and keeps them signed in
// across reloads (the SDK persists the anonymous session in IndexedDB).
// Known limitation, not solved this layer: a new device/browser gets a new
// uid and can't see old plots — see PROJECT_STATE.md.
export function useAuth() {
  const [state, setState] = useState({ uid: null, ready: false, error: null })

  useEffect(() => {
    if (!firebaseReady) {
      setState({ uid: null, ready: true, error: null })
      return
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({ uid: user.uid, ready: true, error: null })
      } else {
        signInAnonymously(auth).catch((err) => setState({ uid: null, ready: true, error: err.message }))
      }
    })
    return unsub
  }, [])

  return state
}
