// Local, deterministic scoring — no API calls, no LLM. Compares a bed's
// stated conditions against the Layer 1 catalog's fields and returns a
// plain-language fit assessment. Mirrors the shape of the original
// prototype's "what to grow" picker, not its exact code.

export const SUN_LEVELS = [
  { value: 'full', label: 'Full sun' },
  { value: 'partial', label: 'Partial sun' },
  { value: 'shade', label: 'Shade' }
]

export const SOIL_TYPES = [
  { value: 'loam', label: 'Loam' },
  { value: 'sandy_loam', label: 'Sandy loam' },
  { value: 'clay_loam', label: 'Clay loam' },
  { value: 'loose_loam', label: 'Loose loam' }
]

function sunLabel(v) {
  return SUN_LEVELS.find((s) => s.value === v)?.label.toLowerCase() ?? v
}

function soilLabel(v) {
  return SOIL_TYPES.find((s) => s.value === v)?.label.toLowerCase() ?? v
}

function scoreCrop(entry, bedConditions) {
  const reasons = []
  let score = 0
  let maxScore = 0

  if (bedConditions?.sun) {
    maxScore += 50
    if (entry.sun === bedConditions.sun) {
      score += 50
      reasons.push(`Wants ${sunLabel(entry.sun)} — matches this bed.`)
    } else {
      reasons.push(`Wants ${sunLabel(entry.sun)}, but this bed is ${sunLabel(bedConditions.sun)}.`)
    }
  }

  if (bedConditions?.soil_type) {
    maxScore += 50
    if (entry.soil_type_pref?.includes(bedConditions.soil_type)) {
      score += 50
      reasons.push(`Grows well in ${soilLabel(bedConditions.soil_type)} soil.`)
    } else {
      const wants = entry.soil_type_pref?.map(soilLabel).join(' or ') || 'different soil'
      reasons.push(`Prefers ${wants}, not ${soilLabel(bedConditions.soil_type)}.`)
    }
  }

  return { score, maxScore, reasons }
}

function scoreAnimal(entry, bedConditions) {
  const reasons = []
  let score = 0
  let maxScore = 0

  if (bedConditions?.approx_size_sqft) {
    maxScore += 100
    if (bedConditions.approx_size_sqft >= entry.space_sqft_per_animal) {
      score += 100
      const count = Math.floor(bedConditions.approx_size_sqft / entry.space_sqft_per_animal)
      reasons.push(`Needs ~${entry.space_sqft_per_animal} sqft each — this bed's size could fit about ${count}.`)
    } else {
      reasons.push(`Needs ~${entry.space_sqft_per_animal} sqft per animal — this bed's stated size looks tight.`)
    }
  }

  return { score, maxScore, reasons }
}

// Returns { score: 0-100 | null, grade: string, reasons: string[] }.
// score/grade are null and reasons explains why when there isn't enough
// bed info to say anything — an honest "not sure yet" beats a fake number.
export function scoreCatalogEntry(entry, entryType, bedConditions) {
  const { score, maxScore, reasons } = entryType === 'animal' ? scoreAnimal(entry, bedConditions) : scoreCrop(entry, bedConditions)

  if (maxScore === 0) {
    return {
      score: null,
      grade: 'not sure yet',
      reasons: ['Not enough info to say how well this fits — add sun and soil notes to get a better match.']
    }
  }

  const pct = Math.round((score / maxScore) * 100)
  const grade = pct >= 75 ? 'good fit' : pct >= 40 ? 'okay fit' : 'poor fit'
  return { score: pct, grade, reasons }
}

export function suggestForBed(bedConditions, { crops, animals }) {
  const scored = [
    ...crops.map((entry) => ({ entry, entryType: 'crop', ...scoreCatalogEntry(entry, 'crop', bedConditions) })),
    ...animals.map((entry) => ({ entry, entryType: 'animal', ...scoreCatalogEntry(entry, 'animal', bedConditions) }))
  ]
  return scored.sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
}
