# PROJECT_STATE

Live status doc. Update this, don't just remember things. See `CLAUDE.md` for
project orientation.

## Current layer
Layer 0 (scaffold) + Layer 1 (static catalog) — code complete and committed,
brief: `briefs/BRIEF_L0_L1_scaffold_and_catalog (1).md`. Report filed:
`briefs/REPORT_L0_L1_scaffold_and_catalog.md`. Followed by a small cleanup
pass, brief: `briefs/BRIEF_L1a_cleanup.md`. Layer 2 basic map landed
(`9d6b160`). L2a dev-server-fix brief (`briefs/BRIEF_L2a_dev_server_fix.md`)
addressed next — see below.

## Status
- Repo scaffold: done. Committed as `e8803f2` (Layer 0) and `9b3925f`
  (Layer 1).
- `npm run dev` and `npm run build` both verified clean (see report for
  what "verified" means here — no live-browser screenshot was possible in
  this environment, see report's testing notes).
- Firebase project: **created and linked.** `farm-e7821` (alias
  `snufleupagus` in `.firebaserc`, now committed). See L2b entry in History
  for what's actually provisioned under it (Firestore: yes; Hosting: yes,
  nothing deployed yet; Functions: API enabled but deploy blocked on
  billing — see "Open questions / blockers").
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
- **Cloud Functions can't actually deploy: no billing account linked to
  `farm-e7821`** (`billingInfo.billingEnabled: false`). The Cloud Functions
  API is enabled, but Gen 2 functions build via Cloud Build/Artifact
  Registry, which require the project to be on the Blaze (pay-as-you-go)
  plan. Linking a billing account is a financial/account decision — Nox
  needs to do this in the Firebase console (Project Settings → Usage and
  billing → Modify plan) before the placeholder `ping` function (or any
  real function) can deploy. Not urgent: nothing in the app currently
  depends on a live function.
- **Firebase Authentication has never been initialized on this project**
  (`identitytoolkit.googleapis.com/v2/projects/farm-e7821/config` returns
  `404 CONFIGURATION_NOT_FOUND` — this is separate from the Identity
  Toolkit *API* being enabled, which it already is). `src/auth.js`'s
  anonymous sign-in will fail until this is done. In every Firebase
  project this has to be bootstrapped once through the console (Build →
  Authentication → "Get started"), which auto-provisions the tenant
  config — there's no documented REST call to do this cold from the API,
  and guessing at undocumented ones on a live project isn't worth the
  risk. Nox: click "Get started" on the Authentication tab for
  `farm-e7821`, then enable the **Anonymous** sign-in provider. Should
  take under a minute.
- `src/firebase-config.js` (gitignored, real values) has been created
  locally against the `farm-e7821` web app registration (`FarmMapper`,
  appId `1:530278058034:web:f427d2f442814050e7d42b`) — not committed, per
  convention. Anyone else running this repo needs their own copy; values
  are in the Firebase console under Project settings → General → Your
  apps, or ask Farmer John/Nox for this session's copy.

## History
- 2026-07-16 — L2b infra-check brief: found `firebase use` aliased to
  `farm-e7821` but nothing actually provisioned under it yet — Firestore
  and Cloud Functions APIs were both disabled (never touched), Hosting
  was enabled with a default site but zero releases, no billing account
  linked, and no web app registered (no SDK config to hand out). The
  Firebase CLI itself is unreliable in this sandbox (`FetchError: Invalid
  response body ... Premature close` on nearly every authenticated call —
  confirmed it's a firebase-tools/undici issue, not a network block, since
  raw `curl` with the same OAuth token against the same endpoints works
  fine), so all provisioning below was done via direct REST calls against
  the Firebase/Google Cloud management APIs using the CLI's own cached
  token. Asked Nox for a Firestore region preference first since location
  is a permanent, one-time choice — got `us-central1`. Actions taken:
  enabled the Firestore API, created the native-mode database in
  `us-central1`, and deployed `firestore.rules` (compiled clean, no
  changes needed) via the Firebase Rules API directly. Enabled the Cloud
  Functions API (safe/reversible/free to enable), but did **not** attempt
  a function deploy or touch billing — `billingInfo.billingEnabled` is
  `false`, and Cloud Functions Gen 2 needs a Blaze-plan billing account,
  which is a financial decision for Nox to make in the console, not
  something to automate. Registered a web app (`FarmMapper`) to get a
  real SDK config and wrote it to the gitignored `src/firebase-config.js`
  (not committed, per the existing "never commit real keys" convention).
  Also discovered Firebase Authentication itself has never been
  initialized on this project (separate from the Identity Toolkit API
  being enabled) — `auth.js`'s anonymous sign-in will fail until Nox
  visits the Authentication tab once and enables Anonymous sign-in; found
  no safe undocumented API to bootstrap this cold. L2a (dev server fix)
  confirmed done and committed (`bf25032`, `af9eee5`) when asked as part
  of this checkpoint. Housekeeping: committed `.firebaserc` (no longer
  gitignore-exempt-but-untracked now that a real project is linked), and
  gitignored `dev-dist/` (a `vite-plugin-pwa` dev-mode artifact that had
  been left untracked from earlier dev-server testing).
- 2026-07-16 — L2a dev-server-fix brief: diagnosed the reported JSX
  MIME-type and `icons/leaf.svg` 404 errors. Root cause: **not a code bug**
  — Vite was already fully and correctly configured (`npm run dev` serves
  `main.jsx` as `text/javascript` and `public/icons/leaf.svg` resolves
  correctly, confirmed via curl against both the working tree and a fresh
  clean clone). `README.md` had zero setup/run instructions (`# Farm` and
  nothing else), so the app had been tested by pointing a plain static
  server (`live-server`) at raw source instead of running `npm run dev` —
  that's what produced both errors. Fixed by writing real setup/dev/build/
  deploy instructions into `README.md`, including an explicit callout not
  to serve `index.html` with a plain static server. Added the standing
  "commit early and often" environment note to `CLAUDE.md` per the brief.
  Committed as `bf25032`. No headless-browser visual confirmation was
  possible in this sandbox (no `chromium-cli`, no system Chromium —
  same `libasound2t64`/sudo gap noted in the L0/L1 report); verification
  was via `npm run build` (clean) plus curl status/MIME checks against a
  running dev server, both in-place and from a fresh `git clone`.
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
