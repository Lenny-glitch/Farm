import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

// Layer 2 keeps things to "one plot at a time" (see brief non-goals), so we
// only ever look at the first plot a user has rather than building a
// multi-plot switcher.
export function usePlot(uid) {
  const [state, setState] = useState({ plot: null, plotId: null, loading: true })

  useEffect(() => {
    if (!uid) {
      setState({ plot: null, plotId: null, loading: false })
      return
    }
    const q = query(collection(db, 'users', uid, 'plots'), orderBy('created_at', 'asc'), limit(1))
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setState({ plot: null, plotId: null, loading: false })
        } else {
          const d = snap.docs[0]
          setState({ plot: d.data(), plotId: d.id, loading: false })
        }
      },
      (err) => setState({ plot: null, plotId: null, loading: false, error: err.message })
    )
    return unsub
  }, [uid])

  return state
}

export async function createPlot(uid, { name, boundary_points }) {
  const ref = await addDoc(collection(db, 'users', uid, 'plots'), {
    name,
    boundary_points,
    notes: '',
    created_at: serverTimestamp()
  })
  return ref.id
}

export function updatePlot(uid, plotId, data) {
  return updateDoc(doc(db, 'users', uid, 'plots', plotId), data)
}

export function useBeds(uid, plotId) {
  const [beds, setBeds] = useState([])

  useEffect(() => {
    if (!uid || !plotId) {
      setBeds([])
      return
    }
    const q = query(collection(db, 'users', uid, 'plots', plotId, 'beds'), orderBy('created_at', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setBeds(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [uid, plotId])

  return beds
}

export async function createBed(uid, plotId, { name, shape_points }) {
  const ref = await addDoc(collection(db, 'users', uid, 'plots', plotId, 'beds'), {
    name,
    shape_points,
    notes: '',
    conditions: { sun: null, soil_type: null, approx_size_sqft: null },
    created_at: serverTimestamp()
  })
  return ref.id
}

export function updateBed(uid, plotId, bedId, data) {
  return updateDoc(doc(db, 'users', uid, 'plots', plotId, 'beds', bedId), data)
}

// Firestore doesn't cascade deletes — clear a bed's plantings first so they
// don't become orphaned documents nobody can reach.
export async function deleteBed(uid, plotId, bedId) {
  const plantingsRef = collection(db, 'users', uid, 'plots', plotId, 'beds', bedId, 'plantings')
  const snap = await getDocs(plantingsRef)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, 'users', uid, 'plots', plotId, 'beds', bedId))
  await batch.commit()
}

export function usePlantings(uid, plotId, bedId) {
  const [plantings, setPlantings] = useState([])

  useEffect(() => {
    if (!uid || !plotId || !bedId) {
      setPlantings([])
      return
    }
    const q = query(
      collection(db, 'users', uid, 'plots', plotId, 'beds', bedId, 'plantings'),
      orderBy('created_at', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setPlantings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [uid, plotId, bedId])

  return plantings
}

export function addPlanting(uid, plotId, bedId, { entry_id, entry_type, note }) {
  return addDoc(collection(db, 'users', uid, 'plots', plotId, 'beds', bedId, 'plantings'), {
    entry_id,
    entry_type,
    note: note || null,
    planted_date: null,
    created_at: serverTimestamp()
  })
}

export function removePlanting(uid, plotId, bedId, plantingId) {
  return deleteDoc(doc(db, 'users', uid, 'plots', plotId, 'beds', bedId, 'plantings', plantingId))
}
