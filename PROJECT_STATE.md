# PROJECT_STATE

Live status doc. Update this, don't just remember things. See `CLAUDE.md` for
project orientation.

## Current layer
Layer 0 (scaffold) + Layer 1 (static catalog) — code complete and committed,
brief: `briefs/BRIEF_L0_L1_scaffold_and_catalog (1).md`. Report filed:
`briefs/REPORT_L0_L1_scaffold_and_catalog.md`. Followed by a small cleanup
pass, brief: `briefs/BRIEF_L1a_cleanup.md`.

## Status
- Repo scaffold: done. Committed as `e8803f2` (Layer 0) and `9b3925f`
  (Layer 1).
- `npm run dev` and `npm run build` both verified clean (see report for
  what "verified" means here — no live-browser screenshot was possible in
  this environment, see report's testing notes).
- Firebase project: **not yet created**. Nox has an existing Firebase
  account but no project has been created/linked yet for FarmMapper. All
  Firebase config (`firebase.json`, `firestore.rules`, `functions/`) is
  written and ready, but `firebase login` / `firebase projects:create` /
  `firebase use` need to be run interactively by a human (OAuth) before
  anything can actually be tested against a live project or deployed. See
  "Open questions / blockers" below.
- Layer 1 data: crops + animals catalog + UI — done, see report.
- **Known gap: no visual browser confirmation of the catalog UI yet.**
  Headless Chromium/Firefox need `libasound2t64`, which needs sudo not
  available in the coding sandbox. `npm run build` succeeding and the full
  module import chain resolving cleanly over HTTP is good evidence the app
  isn't broken, but it isn't the same as seeing it render. Nox will eyeball
  `npm run dev` manually rather than working around the sudo issue.
- `scripts/validate-catalog.js` added — manually-run sanity check for the
  catalog's `note`/`explanation` keys, the `companions.bad[].reason` enum,
  and `feeds_after`/`depletes_for` id references. Not wired into CI (catalog
  is small enough that this isn't worth automating yet). Run with
  `node scripts/validate-catalog.js`.

## Judgment calls made (not explicitly covered by a brief)
- Frontend stack: Vite + React, app at repo root (not a `web/` subfolder).
  Confirmed with Nox directly (brief didn't specify).
- `data/*.json` lives at repo root (not `src/data/`) to match the brief's
  literal paths; Vite root defaults to the repo root so `src/` can import
  from `../data/*.json` directly — no fetch, no build-time copy step needed,
  stays bundled/offline-by-construction.
- Firestore offline persistence implemented via the modular SDK's
  `initializeFirestore` + `persistentLocalCache()` (the current recommended
  API, replacing the older `enableIndexedDbPersistence`).
- Cloud Functions scaffold has one placeholder `ping` HTTPS function just to
  prove the Functions project deploys — no real proxy logic yet, none is
  needed until an external API shows up (Layer 2+).
- `src/firebase.js` loads `firebase-config.js` via `import.meta.glob(...)`
  instead of a plain `await import('./firebase-config.js')`. The plain form
  looks fine but isn't: Vite statically pre-resolves literal-path dynamic
  imports at transform time, so a missing file 500s before the wrapping
  try/catch ever runs — this broke `npm run dev` and `npm run build`
  entirely (blank error overlay, build failure) since no `firebase-config.js`
  exists yet. `import.meta.glob` only looks at what's actually on disk and
  returns `{}` when nothing matches, so it degrades gracefully. Found and
  fixed 2026-07-14 while verifying the app actually runs.

## Open questions / blockers
- **Firebase project not yet created.** Everything is scaffolded and ready to
  wire up, but needs a human to run `firebase login`, create/select the
  project, and drop real config into `src/firebase-config.js` (gitignored).
  Nox: when ready, run through the "Firebase setup" section of the latest
  Farmer John report and hand back the project ID / config so this can be
  finished and actually tested (including the offline-persistence proof and
  a real hosting deploy).

## History
- 2026-07-13 — Layer 0 + Layer 1 brief received and started. Repo was empty
  (just `README.md`) prior to this.
- 2026-07-14 — Verified `npm run dev` / `npm run build`, fixed the
  `firebase-config.js` static-import bug that was breaking both, committed
  Layer 0 (`e8803f2`) and Layer 1 (`9b3925f`) as separate commits, filed the
  handback report.
- 2026-07-15 — L1a cleanup brief: fixed the `note`/`explanation` key
  mismatch on the `squash_summer`/`cucumber` bad-companion pair, audited the
  rest of `data/crops.json` for the same issue (none found), added
  `scripts/validate-catalog.js`, verified `PROJECT_STATE.md` and the L0/L1
  report were actually committed.
