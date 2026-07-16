# Brief: L2a — Dev Server Fix + Standing Session Note
**Project:** FarmMapper (repo: `~/projects/stuff`)
**Coder:** Farmer John
**Planner:** Ceres

---

## Context

Live-server console showed two real, fixable errors after the last brief —
not the earlier unreproduced blank-page flake, this is a specific root
cause:

1. `main.jsx` fails to load: "Expected a JavaScript-or-Wasm module script but
   the server responded with a MIME type of text/jsx." `live-server` is a
   plain static file server — it does not transpile JSX to plain JS. If the
   project is currently serving raw `.jsx` directly to the browser, that's
   the bug. Browsers can't execute untranspiled JSX as a module.
2. 404 on `icons/leaf.svg` — a referenced asset that doesn't exist at that
   path. Minor, but nothing renders far enough to notice it until item 1 is
   fixed.

## Task 1: Fix the JSX serving issue

Diagnose which of these is actually true and fix accordingly:
- If there's no bundler/dev-server step at all and `live-server` is being
  used directly against source `.jsx` files: switch local dev to **Vite**
  (fast, minimal config, standard choice for this). Add it as a dev
  dependency, add a minimal `vite.config.js`, update whatever npm script
  starts local dev to run Vite's dev server instead of `live-server`.
- If a build step already exists but isn't wired into the dev workflow
  correctly (e.g. `live-server` pointed at source instead of build output):
  fix the path/script instead of adding a new tool.

Either way: after the fix, confirm in your report that a fresh
`git clone` + documented setup steps (whatever they are — README, npm
script, etc.) actually loads the app cleanly in a browser with no console
errors. Don't just fix it locally and assume — actually re-verify from
a clean state if you can.

## Task 2: Fix the missing icon

Find what's referencing `icons/leaf.svg`, confirm whether the asset should
exist and was never added, or the path is wrong. Fix whichever it is.

## Task 3: Add standing environment note to CLAUDE.md

Add this as a permanent note in `CLAUDE.md` (create the file if it somehow
doesn't exist yet, though it should from Layer 0):

> **Environment note:** this dev machine shuts down at end of day, which
> cuts any active Claude Code session abruptly with no warning. Commit early
> and often. Don't leave meaningful work uncommitted at the end of a working
> session assuming you'll resume in the same session — assume any session
> may end without notice, and structure work so a clean commit exists at
> as many points as reasonably possible.

---

## Explicit non-goals
- No new features. This is a fix-and-stabilize brief only.
- Don't touch anything from the Layer 2 (notebook sketch map) scope beyond
  what's needed to make the dev server actually run and render.

---

## Report-back template

```
## Farmer John Report — L2a

**Commits:** [hash(es)]

### JSX/dev server fix
- Root cause confirmed: [no bundler at all / misconfigured build step / other]
- Fix applied: [what you did]
- Verified from clean state: [yes/no, how]

### Icon fix
- Root cause: [missing asset / wrong path]
- Fix applied: [...]

### CLAUDE.md
- Standing note added: [yes/no]

### Deviations / open questions
[...]
```
