## Farmer John Report — L1a Cleanup

### Item 1: key mismatch
- Entries fixed (squash_summer/cucumber): done. Both bad-companion entries
  now use `"explanation"`; text left byte-for-byte unchanged (no rewrite).
- Full `companions.bad[]` audit — total mismatches found: **2** (only the
  two already reported: `squash_summer`→`cucumber` and `cucumber`→
  `squash_summer`). Every other `bad[]` entry (`corn_sweet`↔`tomato`) was
  already correct.
- Full `companions.good[]` audit — total mismatches found: **0**. No
  `good[]` entry uses `explanation` where it should use `note`.
- Any off-enum `reason` values found: **none**. All 4 `bad[]` entries use
  `pest_crossover`, which is in the fixed enum.
- Validation script: built, `scripts/validate-catalog.js`. Checks
  `good[]`/`bad[]` key correctness, `bad[].reason` against the enum, and
  `feeds_after`/`depletes_for` id references resolve to real crop ids. Run
  manually with `node scripts/validate-catalog.js`; not wired into CI (data
  set's small enough that a manual pre-commit run is enough for now). One
  false start: I initially also tried cross-referencing `animals[].
  compatible_with` against catalog ids, but that field is land-use tags
  (`"orchard"`, `"browse_land"`, etc.), not crop/animal ids — pulled that
  check back out rather than leave a check that would always fail.

### Item 2: commit status
- Raw `git status` output (before any action this session):
  ```
  On branch main
  Your branch is up to date with 'origin/main'.

  Changes to be committed:
    (use "git restore --staged <file>..." to unstage)
  	modified:   PROJECT_STATE.md
  	new file:   briefs/REPORT_L0_L1_scaffold_and_catalog.md

  Untracked files:
    (use "git add <file>..." to include in what will be committed)
  	briefs/BRIEF_L1a_cleanup.md
  ```
- Raw `git log -2 --stat` output (before any action this session): showed
  `9b3925f` (Layer 1) and `e8803f2` (Layer 0) — neither commit's file list
  includes `briefs/REPORT_L0_L1_scaffold_and_catalog.md`, and `e8803f2`'s
  `PROJECT_STATE.md` entry is the original 47-line version, not the updated
  one. Confirms the docs were never committed.
- Were L0/L1 docs already committed, or did you commit them now?:
  **They were not committed** — `git status` was right the first time, my
  earlier report's phrasing was just ambiguous about it. They were sitting
  staged in the index (from last session) with no commit made. Committed
  them now, along with this session's further edits to `PROJECT_STATE.md`
  and the new `BRIEF_L1a_cleanup.md`.
- New commit hash(es): two commits, split by concern:
  - `f17e179` — the `note`/`explanation` fix + `scripts/validate-catalog.js`
    (Item 1).
  - `d7f7ae3` — `briefs/REPORT_L0_L1_scaffold_and_catalog.md`,
    `briefs/BRIEF_L1a_cleanup.md`, and `PROJECT_STATE.md` (the leftover
    L0/L1 doc commit plus this cleanup pass's state updates).

  `git status` is now clean; local branch is 2 commits ahead of
  `origin/main` (not pushed — no push was requested).

### Open questions / blockers
- Firebase project still not created — unchanged from the last report,
  still needs Nox to run `firebase login` / project creation interactively.
- No visual browser confirmation of the catalog UI — noted in
  `PROJECT_STATE.md` per your instruction. Didn't attempt to work around
  the `libasound2t64`/sudo issue again this pass. Waiting on Nox to eyeball
  `npm run dev` locally.
- Nothing else outstanding from this brief — both items are done, scope
  stayed inside the brief (no Layer 2 work started).
