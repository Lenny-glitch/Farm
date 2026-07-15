# Farmer John Report — Layer 0 + Layer 1

**Repo:** `~/projects/stuff` (local)
**Commits:** `e8803f2` (Layer 0), `9b3925f` (Layer 1)

### Layer 0
- Firestore offline persistence: **implemented, not yet live-tested.**
  `src/firebase.js` uses `initializeFirestore` + `persistentLocalCache` +
  `persistentMultipleTabManager`, and `FirestoreStatus.jsx` reads
  `_meta/ping` and reports whether the read came from cache or server —
  this is the smoke test the brief asked for, wired and ready. It can't
  actually be exercised (create a doc, throttle network, confirm cache
  read) until a real Firebase project exists — see blockers below.
- Firebase project set up: **not live.** Firestore rules, indexes,
  Functions, and Hosting config are all written and committed
  (`firebase.json`, `firestore.rules`, `firestore.indexes.json`,
  `functions/`), but no `firebase login` / project creation has happened —
  needs a human for the OAuth step.
- Deploy tested: no — blocked on the same Firebase project setup.
- **Build/dev verified working** (this wasn't true before today — see
  "bug found and fixed" below).
- Any deviations from the brief: none beyond the judgment calls already
  logged in `PROJECT_STATE.md` (Vite+React at repo root, `data/*.json` at
  repo root, `persistentLocalCache` as the offline-persistence API, one
  placeholder `ping` Cloud Function).

### Layer 1
- Crops authored (10): `corn_sweet`, `beans_pole`, `peas_snap`, `tomato`,
  `pepper_bell`, `squash_summer`, `cucumber`, `lettuce`, `kale`, `carrot`.
  Covers the requested spread (heavy feeder, two legumes, two nightshades,
  two cucurbits, leafy green, root veg).
- Animals authored (5): `chicken_laying_hen`, `goat_dairy`, `rabbit_meat`,
  `duck_layer`, `honeybee_hive`. Covers grain-fed poultry, browse-based
  (goat), and a genuinely different shape again with the hive.
- Schema fields added beyond the brief: a `"confidence": "estimated"` flag
  on individual numeric fields (yield estimates, self-sufficient-feed
  figures) where the brief asked for exactly this ("flag it... rather than
  guessing silently"), rendered in the UI as a small badge.
- Entries marked "estimated" confidence: `beans_pole` and `peas_snap` yield;
  `goat_dairy` milk yield and pasture self-sufficiency; `rabbit_meat` meat
  yield and feed self-sufficiency; `duck_layer` feed self-sufficiency;
  `honeybee_hive` honey yield and feed self-sufficiency; plus most
  `yield_estimate.confidence` fields on the vegetable crops.
- Anything that didn't fit the schema cleanly: **`honeybee_hive`,
  explicitly flagged in its own `notes` field.** A hive is a colony, not
  one animal — space/water/yield are "per hive." Forage range extends 2-3
  miles beyond any fenced space, so `sqft_needed_per_animal` is set to 0
  rather than a made-up number. Honey yield is really 1-2 seasonal
  harvests, not a weekly trickle. Also `rabbit_meat`: meat yield comes in
  litters every 6-8 weeks, not weekly — `amount_per_week` is a rough
  average, noted inline. Worth designing a better production-cadence
  shape for Layer 2 rather than forcing everything into a weekly rate.

### Bug found and fixed (not in the original brief scope, but blocking)
While verifying the app actually runs, found that `src/firebase.js` was
completely broken for anyone without a real `firebase-config.js` — which is
everyone right now, since that file is correctly gitignored pending Firebase
setup. The code looked defensive (`try { await import('./firebase-config.js') } catch { ... }`)
but Vite pre-resolves literal-path dynamic imports at transform time, before
the try/catch ever runs, so the missing file 500'd the whole module graph:
`npm run dev` served Vite's error overlay instead of the app, and
`npm run build` failed outright. Fixed by switching to
`import.meta.glob('./firebase-config.js', { eager: true })`, which only
looks at what's actually on disk and returns `{}` when nothing matches —
no build-time resolution error. Both `npm run dev` and `npm run build`
are clean now. Logged in `PROJECT_STATE.md`.

### Testing notes (how Layer 1 UI was actually verified)
Confirmed via HTTP against the running dev server that the full module
chain (`main.jsx` → `App.jsx` → `firebase.js`, `FirestoreStatus.jsx`,
`CatalogBrowser.jsx`, `catalog.js` → `data/*.json`) resolves cleanly
(200s, no transform errors, no dev-server console errors) — this is the
same failure mode the firebase-config bug above was producing, so it's a
meaningful check, not a rubber stamp. **Could not get an actual browser
screenshot in this environment**: headless Chromium and Firefox (via
Playwright) both need `libasound2t64`, which requires `sudo` and there's
no passwordless sudo available here. Didn't attempt to work around that
mid-task. If a real visual check matters before this ships, it needs
either a human eyeballing `npm run dev` locally, or the sandbox getting
that system package installed.

### Open questions / blockers
- **Firebase project not yet created.** Needs a human to run
  `firebase login`, create/select the project, and drop real config into
  `src/firebase-config.js` (gitignored). Once that's done: the offline-
  persistence smoke test (create `_meta/ping`, throttle network, confirm
  cache read) and a real hosting deploy can both actually run.
- **Data bug in `data/crops.json`:** the `squash_summer`↔`cucumber`
  bad-companion pair uses a `"note"` key instead of `"explanation"`, so the
  authored "same family (Cucurbitaceae)" detail is silently dropped in
  favor of the generic `pest_crossover` template — `resolveBadCompanion()`
  only reads `explanation`/`mitigation`. Left unfixed pending confirmation
  this is just a rename and not something that should be handled
  differently. Details in `PROJECT_STATE.md`.
