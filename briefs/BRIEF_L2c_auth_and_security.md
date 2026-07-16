# Brief: L2c — Real Accounts + Security Rules
**Project:** FarmMapper (repo: `~/projects/stuff`)
**Coder:** Farmer John
**Planner:** Ceres

---

## Context

Anonymous Auth (the original Layer 2 plan) doesn't work for testers — it ties
identity to a device/browser, so a new device or a cleared cache means a new,
disconnected identity. Since real testers are now in scope and shouldn't get
their data crossed or lost, this replaces anonymous auth with real accounts,
plus Firestore security rules that actually enforce per-user data isolation
at the database level, not just by convention.

## Non-delegable step (Nox does this first, not Farmer John)

Firebase Authentication needs its sign-in providers enabled in the console —
this is a one-time click-through, not something safely done via API/CLI.
Before starting code work:

1. Go to the Firebase console → `farm-e7821` project → **Authentication**.
2. Click **Get started** if Authentication hasn't been initialized yet.
3. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Email link (passwordless sign-in)**
4. Confirm both show as "Enabled" before handing this brief to Farmer John.

## Task 1: Implement both sign-in methods

- **Email/password** — standard sign up / sign in form.
- **Magic link** — user enters their email, gets a sign-in link, clicking it
  signs them in with no password. Use Firebase's
  `sendSignInLinkToEmail`/`isSignInWithEmailLink`/`signInWithEmailLink` flow.
- Let the user choose either method — don't force one. A simple toggle
  ("use a password" / "email me a link instead") is enough, keep it as
  large, plain-language buttons per the existing tech-literacy-first UI
  direction from Layer 2.
- Optional display name field, nothing else. No profile photos, no social
  login, no additional account complexity.
- No existing user data needs migrating — confirm with Nox whether any real
  anonymous-auth test data exists worth preserving before ripping it out; if
  none, just replace cleanly.

## Task 2: Firestore security rules

Update `firestore.rules` so every read/write under `users/{uid}/...` requires
`request.auth != null && request.auth.uid == uid`. This must be true
regardless of which sign-in method the user used — Firebase issues the same
kind of `uid` either way, so the data model and existing schema don't need to
change, just the rules enforcing who can touch what.

Test this concretely, not just by reading the rules file: create two test
accounts, confirm account A cannot read or write account B's `plots`
collection (try it directly against Firestore, not just through the app UI —
a rules gap wouldn't necessarily show up in normal app usage but would still
be a real hole).

## Task 3: Static catalog data (crops.json/animals.json)

These are public read-only reference data, not user data — don't lock these
behind auth. Confirm the rules allow unauthenticated or any-authenticated-user
read access to whatever collection/path holds the catalog, separate from the
per-user `users/{uid}/...` rules above.

---

## Explicit non-goals
- No password reset flow polish beyond Firebase's default (its built-in flow
  is fine for this scale).
- No social login (Google/Apple/etc.) — out of scope unless asked for later.
- No account deletion/data export UI yet.

---

## Report-back template

```
## Farmer John Report — L2c

**Commits:** [hash(es)]

### Sign-in
- Email/password: [working?]
- Magic link: [working?]
- UI: [describe briefly]

### Security rules
- Rules updated: [yes/no]
- Cross-account isolation test: [how tested, result]
- Catalog read access confirmed separate from per-user rules: [yes/no]

### Deviations / open questions
[...]
```
