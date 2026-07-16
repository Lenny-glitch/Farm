import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

// Real config, gitignored — see firebase-config.example.js for the template.
// Uses import.meta.glob (not a plain dynamic import) because the file may
// legitimately not exist on disk yet: Vite pre-resolves static-looking
// `import('./literal-path.js')` specifiers at transform time, so a missing
// file 500s before the try/catch around it ever runs. glob() only inspects
// what's actually on disk and returns {} when nothing matches — no error.
const configModules = import.meta.glob('./firebase-config.js', { eager: true })
const firebaseConfig = configModules['./firebase-config.js']?.firebaseConfig ?? null

export const firebaseReady = firebaseConfig !== null

export const app = firebaseReady ? initializeApp(firebaseConfig) : null

// Firestore offline persistence: reads/writes work against a local cache
// and sync automatically on reconnect. This is the reason the project uses
// Firestore instead of Realtime Database — see CLAUDE.md.
export const db = firebaseReady
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  : null

export const functions = firebaseReady ? getFunctions(app) : null

// Anonymous Auth (Layer 2): separates users' plots by uid, no
// email/password or social login. See CLAUDE.md / brief for the reasoning.
export const auth = firebaseReady ? getAuth(app) : null
