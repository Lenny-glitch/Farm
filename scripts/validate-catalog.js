#!/usr/bin/env node
// Sanity-checks data/crops.json (and animals.json ids) against the schema
// conventions from briefs/BRIEF_L0_L1_scaffold_and_catalog.md. Run manually:
//   node scripts/validate-catalog.js
// Not wired into CI — catalog is small enough that a manual run before
// committing data changes is enough for now.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const crops = JSON.parse(readFileSync(path.join(rootDir, 'data/crops.json'), 'utf8'))
const animals = JSON.parse(readFileSync(path.join(rootDir, 'data/animals.json'), 'utf8'))
// Note: animals.compatible_with is a list of land-use tags (e.g. "orchard",
// "browse_land"), not catalog ids — nothing to cross-reference there yet.

const BAD_REASON_ENUM = new Set([
  'allelopathic',
  'nutrient_competition',
  'pest_crossover',
  'disease_shared',
  'space_competition'
])

const errors = []
const cropIds = new Set(crops.map((c) => c.id))

for (const crop of crops) {
  for (const good of crop.companions?.good ?? []) {
    if ('explanation' in good) {
      errors.push(`${crop.id}: companions.good[${good.id}] uses "explanation" — should use "note"`)
    }
    if (!('note' in good)) {
      errors.push(`${crop.id}: companions.good[${good.id}] is missing "note"`)
    }
    if (!cropIds.has(good.id)) {
      errors.push(`${crop.id}: companions.good[] references unknown crop id "${good.id}"`)
    }
  }

  for (const bad of crop.companions?.bad ?? []) {
    if ('note' in bad) {
      errors.push(`${crop.id}: companions.bad[${bad.id}] uses "note" — should use "explanation"`)
    }
    if (!('explanation' in bad)) {
      errors.push(`${crop.id}: companions.bad[${bad.id}] is missing "explanation"`)
    }
    if (!BAD_REASON_ENUM.has(bad.reason)) {
      errors.push(`${crop.id}: companions.bad[${bad.id}] has off-enum reason "${bad.reason}"`)
    }
    if (!cropIds.has(bad.id)) {
      errors.push(`${crop.id}: companions.bad[] references unknown crop id "${bad.id}"`)
    }
  }

  for (const id of crop.feeds_after ?? []) {
    if (!cropIds.has(id)) errors.push(`${crop.id}: feeds_after references unknown crop id "${id}"`)
  }
  for (const id of crop.depletes_for ?? []) {
    if (!cropIds.has(id)) errors.push(`${crop.id}: depletes_for references unknown crop id "${id}"`)
  }
}

if (errors.length > 0) {
  console.error(`validate-catalog: ${errors.length} problem(s) found:\n`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`validate-catalog: OK (${crops.length} crops, ${animals.length} animals, no issues)`)
