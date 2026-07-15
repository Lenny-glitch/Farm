# Brief L1a: Cleanup — schema key fix + commit verification

**Project:** FarmMapper — repo `~/projects/stuff`
**Coder:** Farmer John
**Planner:** Ceres
**Follows:** BRIEF_L0_L1_scaffold_and_catalog.md / REPORT_L0_L1_scaffold_and_catalog.md

Small cleanup brief. Two items, both raised by your own L0/L1 report. Nothing
new gets built here — do not start Layer 2 (map/resolver), that's a separate
future brief.

---

## Item 1 — Fix the `note` / `explanation` key mismatch (approved, go ahead)

In `data/crops.json`, two bad-companion entries (`squash_summer` ↔ `cucumber`)
use a `note` key where the schema calls for `explanation`.

**Decision: rename `note` → `explanation` on those entries.** The schema is:

- `companions.good[]` → uses `note`
- `companions.bad[]` → uses `explanation` (+ optional `mitigation`)

This isn't cosmetic. The reason-lookup fallback reads `explanation`; with the
wrong key the authored text silently never displays and the entry falls back to
the generic per-reason template. That's a real (quiet) bug, not a style nit.

Scope of this fix:
- Rename the key only. Do not rewrite, expand, or "improve" the authored text.
- While you're in there: audit **all** `companions.bad[]` entries across
  `data/crops.json` for the same mismatch, not just these two. If the pattern
  slipped twice it may have slipped elsewhere. Report how many you found total.
- Same audit for `companions.good[]` — any entry wrongly using `explanation`
  where it should be `note`.

If it would help prevent recurrence, a tiny validation script
(`scripts/validate-catalog.js` or similar) that checks the catalog against the
expected keys/enums and fails loud is welcome but optional — your call whether
it's worth it at this catalog size. If you build one, wire it so it's easy to
run manually; no CI setup needed.

Reminder: `companions.bad[].reason` must be one of the fixed enum —
`allelopathic`, `nutrient_competition`, `pest_crossover`, `disease_shared`,
`space_competition`. Flag anything off-enum if the audit turns it up.

---

## Item 2 — Verify and clean up commit status (report was ambiguous)

Your report text garbled around whether `PROJECT_STATE.md` and
`briefs/REPORT_L0_L1_scaffold_and_catalog.md` actually made it into commits
`e8803f2` / `9b3925f` or are still sitting uncommitted. Nox and I couldn't tell
from the paste, and I'd rather you check than have us guess.

Please run and report the raw output of:

```
git status
git log -2 --stat
```

Then: if those docs (or anything else from L0/L1) are uncommitted, commit them.
Everything from Layers 0 and 1 should be on disk and committed before we open
Layer 2 — disk beats chat, and that includes the report and state file.

Git operations from the Ubuntu terminal only — never the PowerShell/WSL path.
(Standing rule from the other repo, applies here too.)

---

## Also worth noting in PROJECT_STATE.md

Add a known-gaps line: **no visual browser confirmation of the catalog UI yet.**
Headless Chromium/Firefox need `libasound2t64`, which needs sudo you don't have.
`npm run build` succeeding and the module chain resolving cleanly over HTTP is
good evidence but is not the same as seeing it render. Nox will eyeball
`npm run dev` manually. Don't burn time trying to work around the sudo issue —
it's not worth it, and the manual check is cheap.

For the record: calling that out plainly in your report rather than claiming
more than you'd verified was the right move. Keep doing that.

---

## Report back

```
## Farmer John Report — L1a Cleanup

### Item 1: key mismatch
- Entries fixed (squash_summer/cucumber): [done?]
- Full companions.bad[] audit — total mismatches found: [n, list ids]
- Full companions.good[] audit — total mismatches found: [n, list ids]
- Any off-enum `reason` values found: [...]
- Validation script: [built? path? or skipped — why?]

### Item 2: commit status
- Raw `git status` output: [...]
- Raw `git log -2 --stat` output: [...]
- Were L0/L1 docs already committed, or did you commit them now?: [...]
- New commit hash(es) if any: [...]

### Open questions / blockers
[...]
```
