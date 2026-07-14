# PROJECT_STATE

Live status doc. Update this, don't just remember things. See `CLAUDE.md` for
project orientation.

## Current layer
Layer 0 (scaffold) + Layer 1 (static catalog) — in progress, brief:
`briefs/BRIEF_L0_L1_scaffold_and_catalog (1).md`.

## Status
- Repo scaffold: in progress.
- Firebase project: **not yet created**. Nox has an existing Firebase
  account but no project has been created/linked yet for FarmMapper. All
  Firebase config (`firebase.json`, `firestore.rules`, `functions/`) is
  written and ready, but `firebase login` / `firebase projects:create` /
  `firebase use` need to be run interactively by a human (OAuth) before
  anything can actually be tested against a live project or deployed. See
  "Open questions / blockers" below.
- Layer 1 data: crops + animals catalog + UI — see report in
  `briefs/` reports section once filed.

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
