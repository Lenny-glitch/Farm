# Brief: Layer 0 (Scaffold) + Layer 1 (Static Catalog)
**Project:** FarmMapper (working name)
**Coder:** Farmer John
**Planner:** Ceres
**Coordinator:** Nox (ferries this brief, reports results back to Ceres)

---

## Context (read this first, don't skip)

This is a personal farm/land planning web app for Nox and friends — 2-acre-scale
hobbyist land planning, not a commercial ag product. Not selling it, not chasing
scientific precision. It's a helpful nudge tool, not a lab report. Users are
offline most of the time (standing in a field), online occasionally.

This project follows the same pattern as Nox's other repo (Warhammer monorepo):
**disk beats chat.** Everything that matters — this brief, your decisions, your
report — lives in the repo, not in conversation history. If you make a call this
brief doesn't cover, write it down in `PROJECT_STATE.md`, don't just remember it.

Sister project naming convention for reference (don't reuse these, just context):
Nyx and Hades are the coder instances for the Warhammer project. You're Farmer
John. The planner Claude instance is Ceres.

---

## Scope for this brief (two layers, one commit each please)

1. **Layer 0** — repo scaffold, Firebase project wiring, deploy pipeline, offline
   persistence proven working.
2. **Layer 1** — static reference catalog (crops + animals) as data files, plus a
   dead-simple browsable UI to view/search them. **No map, no resolver, no grid,
   no game logic yet.** That's Layer 2, a separate future brief. Do not build
   ahead of scope — if you find yourself writing adjacency/spacing logic, stop,
   that's not this brief.

---

## Layer 0: Scaffold

### Repo
- Repo already exists at `~/projects/stuff` — do not create a new repo. Work
  within the existing repository.
- Before doing anything else: inspect the existing repo structure and report
  back what's already there (any existing `CLAUDE.md`, `PROJECT_STATE.md`,
  `briefs/`, `.gitignore`, or prior commits) before making changes. Don't
  assume it's empty just because this is the first brief you've received for
  it.
- If `CLAUDE.md` and `PROJECT_STATE.md` don't already exist, create them
  (session orientation, same spirit as the Warhammer one — explain the
  project, the layer system, the disk-beats-chat rule). If they already exist
  from prior work in this repo, read them first and extend rather than
  overwrite.
- Add this brief to `briefs/` (create that directory if it doesn't exist).
- Check `.gitignore` for Firebase config / API key exclusions before creating
  any config file — verify with `git check-ignore -v`, don't assume it's
  covered.

### Firebase
- **Firestore**, not Realtime Database. This is a deliberate deviation from the
  Warhammer project — Firestore has real offline persistence (offline
  reads/writes with sync-on-reconnect), Realtime DB's offline support is thin.
  Offline capability is a hard requirement here, not a nice-to-have.
- **Cloud Functions** — thin proxy layer for any future external API calls
  (not needed yet in Layer 1 since it's static data, but wire up the Functions
  project now so Layer 2+ doesn't need new infra).
- **Hosting** — static frontend, same deploy pattern as Warhammer
  (`firebase deploy --only hosting`).
- Commit a `firebase-config.example.js` template, same as the Warhammer repo
  did after its config leak incident. Do not commit real keys. Ever.

### PWA / offline shell
- Basic service worker, app shell caching, so the app loads and is usable
  (at least read-only against cached Firestore data) with no connection.
- Prove this works: create one test document in Firestore, go offline
  (dev tools network throttling is fine), confirm the app still reads it from
  cache. Note in your report how you tested this.

### Aesthetic
- Clean, minimal, garden aesthetic (green/earth tones, not the grimdark
  Warhammer look — this is a different project, different vibe). Don't overthink
  this for Layer 0/1 — a clean readable UI is enough, polish comes later.

---

## Layer 1: Static Reference Catalog

### Format
JSON files under `data/crops.json` and `data/animals.json` in the repo (not
Firestore for this layer — this is static reference data, ship it with the app,
zero API calls, works fully offline by construction). Firestore is for
user-generated data (their land, their plantings) in later layers, not for this
catalog.

### Schema — crops

```json
{
  "id": "corn_sweet",
  "name": "Sweet Corn",
  "category": "vegetable",
  "family": "Poaceae",
  "days_to_maturity": { "min": 60, "max": 100 },
  "spacing_in": { "row": 30, "plant": 8 },
  "sun": "full",
  "water_in_per_week": 1.5,
  "water_guidance": {
    "underwater_signs": "Curling, greyish-green leaves during hot afternoons.",
    "overwater_signs": "Yellowing lower leaves, shallow weak roots."
  },
  "soil_ph_range": { "min": 5.8, "max": 6.8 },
  "soil_type_pref": ["loam", "sandy_loam"],
  "nutrient_needs": ["nitrogen_heavy", "prefers_manure"],
  "amendment_flags": ["epsom_salt_if_yellowing", "rotate_yearly"],
  "planting": {
    "start_indoors": false,
    "direct_sow_after_last_frost_days": 0,
    "soil_temp_min_f": 60,
    "succession_interval_days": 14
  },
  "companions": {
    "good": [
      { "id": "beans_pole", "reason": "nitrogen_fixing", "note": "Beans fix nitrogen in soil corn depletes heavily." }
    ],
    "bad": [
      { "id": "tomato", "reason": "pest_crossover", "explanation": "Both attract corn earworm/tomato fruitworm — same pest, same species.", "mitigation": "Not toxic to each other. Fine if space-constrained, just monitor both closely for the shared pest." }
    ]
  },
  "spacing_consequences": {
    "too_close": "Competes for light and airflow; increases disease from poor ventilation; stunted ear development.",
    "too_far": "Wastes bed space and weakens wind pollination since corn relies on nearby plants for pollen transfer."
  },
  "feeds_after": ["beans_pole", "peas"],
  "depletes_for": ["tomato", "squash"],
  "common_pests": ["corn_earworm", "cutworm"],
  "common_diseases": ["northern_corn_leaf_blight"],
  "yield_estimate": { "unit": "ears_per_plant", "amount": 1.5 },
  "notes": "Plant in blocks, not rows — wind pollination needs it. Heavy nitrogen feeder, classic Three Sisters companion with beans and squash."
}
```

**`companions.bad[].reason` must be one of a fixed enum** (don't invent new ones
per-crop, keep this bounded so it scales):
`allelopathic`, `nutrient_competition`, `pest_crossover`, `disease_shared`,
`space_competition`. Each reason gets ONE generic explanation template written
once in a shared lookup (`data/companion_reasons.json`), used as the default
`explanation`. Only override with a crop-pair-specific `explanation`/`mitigation`
when it's genuinely notable (like the corn/tomato pest example above) — don't
hand-write prose for every pair, that doesn't scale past a handful of crops.

### Schema — animals

```json
{
  "id": "chicken_laying_hen",
  "name": "Laying Hen",
  "space_sqft_per_animal": 4,
  "space_type": "coop_plus_run",
  "feed": {
    "type": "layer_feed_or_scratch",
    "lbs_per_month": 7.5,
    "self_sufficient_option": {
      "feed_crop": "alfalfa",
      "lbs_yield_per_100sqft_per_month": 25,
      "sqft_needed_per_animal": 30
    }
  },
  "water_gal_per_day": 0.5,
  "maturity_weeks": 20,
  "productive_lifespan_years": 3,
  "yield": {
    "primary": { "product": "eggs", "amount_per_week": 5, "unit": "eggs" },
    "secondary": [{ "product": "meat", "note": "End-of-lay bird, ~4-5 lbs dressed, not the primary use case for a laying breed." }],
    "manure_lbs_per_month": 15
  },
  "uses": ["eggs", "pest_control", "manure_for_compost", "tills_bedding"],
  "byproducts": [
    {
      "id": "manure",
      "raw_use": "unsafe_direct",
      "cure_required_days": 120,
      "cure_method": "Compost in a pile, turning every 1-2 weeks, until it's dark, crumbly, and no longer smells sharp/ammonia-like.",
      "food_crop_min_days_before_harvest": 90,
      "safety_note": "Raw manure carries pathogens and will burn roots with excess nitrogen. Don't apply fresh near anything you'll eat soon."
    }
  ],
  "compatible_with": ["orchard", "garden_offseason"],
  "notes": "Free-range in orchard or fallow beds controls insects and adds nitrogen. Keep off active seedbeds — they'll scratch up new plantings."
}
```

### Content to author
Populate with **8-10 crops** and **4-5 animals**, covering a reasonable spread:
- Crops: at least one from each of heavy-feeder (corn), legume/nitrogen-fixer
  (beans or peas), nightshade (tomato), cucurbit (squash or cucumber), leafy
  green (lettuce or kale), root vegetable (carrot). Include the corn and general
  shape shown above as your reference examples.
- Animals: chickens (given), plus at least goats or rabbits (browse/forage-based
  feed economy is a genuinely different shape than grain-fed poultry — worth
  having both patterns represented), and one more of your choice.
- Source from public-domain/land-grant university extension material and general
  agricultural reference knowledge. This is static, slow-changing information —
  accuracy matters more than speed here, but don't rabbit-hole on any single
  entry. If you're not confident on a specific number, use a reasonable estimate
  and flag it with a `"confidence": "estimated"` field rather than guessing
  silently.

### UI
Simple browse/search page. List crops and animals, click into an entry to see
full detail including the companion reasons in plain English (not just the raw
JSON — this needs to read like something a non-farmer can understand, since
that's the actual point of the reasoning layer). No map, no placement, no
resolver logic. Just a readable reference browser.

---

## Explicit non-goals for this brief
- No map, grid, or tile system.
- No adjacency/companion resolver logic (just the data + a readable display).
- No real-time weather/soil API calls (that's Layer 2+, separate brief).
- No user accounts / multi-user data yet.
- No AI photo diagnosis feature (parked for later, needs its own brief).

If something in this brief is ambiguous or you have to make a judgment call,
write it down in `PROJECT_STATE.md` rather than guessing silently and staying
quiet about it.

---

## Report-back template

When done, please fill this out and hand back to Nox so it comes straight to me:

```
## Farmer John Report — Layer 0 + Layer 1

**Repo:** [path/URL]
**Commits:** [hash(es)]

### Layer 0
- Firestore offline persistence: [confirmed working? how tested?]
- Firebase project set up: [Firestore / Functions / Hosting — all live?]
- Deploy tested: [yes/no, URL if deployed]
- Any deviations from the brief: [...]

### Layer 1
- Crops authored: [count, list of ids]
- Animals authored: [count, list of ids]
- Any schema fields you added/changed from the brief: [...]
- Any entries marked "estimated" confidence: [list them]
- Anything that didn't fit the schema cleanly (this is useful signal for
  Layer 2 planning): [...]

### Open questions / blockers
[...]
```
