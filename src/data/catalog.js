import crops from '../../data/crops.json'
import animals from '../../data/animals.json'
import companionReasons from '../../data/companion_reasons.json'

export { crops, animals }

const cropsById = Object.fromEntries(crops.map((c) => [c.id, c]))
const animalsById = Object.fromEntries(animals.map((a) => [a.id, a]))

export function getCropName(id) {
  return cropsById[id]?.name ?? id
}

// Layer 2: plantings reference a crop or animal by id + entry_type, so
// lookups need to know which catalog to check.
export function getEntry(entryType, id) {
  return entryType === 'animal' ? animalsById[id] : cropsById[id]
}

export function getEntryName(entryType, id) {
  return getEntry(entryType, id)?.name ?? id
}

// A bad-companion entry uses its own explanation/mitigation when the pair is
// genuinely notable; otherwise it falls back to the generic template for its
// reason code, per the brief's "one generic explanation per reason" rule.
export function resolveBadCompanion(entry) {
  const generic = companionReasons[entry.reason]
  return {
    ...entry,
    reasonLabel: generic?.label ?? entry.reason,
    explanation: entry.explanation ?? generic?.explanation ?? '',
    mitigation: entry.mitigation ?? null
  }
}

export function searchCatalog(query) {
  const q = query.trim().toLowerCase()
  if (!q) return { crops, animals }
  return {
    crops: crops.filter(
      (c) => c.name.toLowerCase().includes(q) || c.family?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)
    ),
    animals: animals.filter((a) => a.name.toLowerCase().includes(q))
  }
}
