# FarmMapper — Session Orientation

## What this is
A personal farm/land planning web app for Nox and friends. 2-acre-scale
hobbyist land planning — not a commercial ag product, not chasing scientific
precision. It's a helpful nudge tool, not a lab report. Users are offline most
of the time (standing in a field), online occasionally. Offline capability is
a hard requirement, not a nice-to-have.

## Roles
- **Ceres** — planner. Writes briefs.
- **Nox** — coordinator. Ferries briefs in, ferries reports back to Ceres.
- **Farmer John** — coder (this instance's working name for this project).

This is a sibling setup to Nox's Warhammer monorepo (Nyx/Hades are the coder
instances there). Don't reuse that project's names or aesthetic here — this is
a different project with a different vibe (clean, minimal, green/earth tones).

## Disk beats chat
Everything that matters — briefs, decisions, reports — lives in the repo, not
in conversation history. Judgment calls not covered by a brief get written
down in `PROJECT_STATE.md`, not just remembered. If you're picking up this
project cold, read `PROJECT_STATE.md` first.

## The layer system
Work is scoped into layers, delivered one brief at a time. Don't build ahead
of scope — if a brief for layer N has you reaching for layer N+1 logic, stop.

- **Layer 0** — repo scaffold, Firebase project wiring (Firestore + Functions
  + Hosting), deploy pipeline, PWA offline shell.
- **Layer 1** — static reference catalog (crops + animals) as JSON data files
  shipped with the app, plus a browsable/searchable UI. No map, no resolver,
  no grid, no game logic.
- **Layer 2+** — not yet briefed. Expect map/grid/placement and a companion
  resolver to live here.

## Stack
- **Frontend:** Vite + React. App lives at repo root (`src/`, `index.html`,
  `vite.config.js`).
- **Data:** static JSON in `data/` (crops, animals, companion reason
  templates) — bundled with the app at build time, not stored in Firestore.
  Firestore is reserved for user-generated data (their land, their plantings)
  in later layers.
- **Backend:** Firebase — **Firestore** (not Realtime Database; Firestore has
  real offline read/write persistence with sync-on-reconnect), Cloud
  Functions (`functions/`, thin proxy for future external API calls),
  Hosting (deploys `dist/`).
- **Offline:** service worker + app shell caching (PWA) so the app is usable
  read-only against cached Firestore data with no connection.

## Firebase config
`src/firebase-config.example.js` is the template. Real config lives in
`src/firebase-config.js`, which is gitignored — **never commit real keys**.
This repo previously had no incident, but the Warhammer sibling project did,
which is why the example-file convention exists — keep following it.

## Where things live
- `briefs/` — every brief received, kept for reference.
- `data/` — static reference catalog JSON.
- `functions/` — Cloud Functions source.
- `src/` — React app source.
- `PROJECT_STATE.md` — current status, judgment calls, open questions.
