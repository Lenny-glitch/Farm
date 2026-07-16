# Brief: Layer 2 — Basic Map (Notebook Sketch, Not a Simulator)
**Project:** FarmMapper (repo: `~/projects/stuff`, dedicated repo)
**Coder:** Farmer John
**Planner:** Ceres
**Coordinator:** Nox (ferries this brief, reports results back to Ceres)

**This brief replaces the earlier Layer 2 draft.** If you have any earlier
version of a Layer 2 brief or partial work based on a precise cell-grid /
spacing-resolver design, discard that direction — it does not match what's
actually wanted. Read this brief in full before starting.

---

## Context (read this first, don't skip)

Layers 0 and 1 are done: repo scaffold, Firestore, offline persistence
proven, static crop/animal catalog with a browsable UI. Read
`PROJECT_STATE.md` for current state before starting.

**What this app actually is, plainly stated:** a planning notebook, not a
simulator. The map should feel like sketching and jotting notes on a page —
rough shapes, free-text notes, approximate sizes — not a precise CAD tool or
a game engine enforcing exact spacing rules. No deterministic conflict
detection, no cell coordinates, no exact geometry. If a feature you're
building starts to feel like it's calculating physics or enforcing hard
rules, that's a sign you've drifted from scope — pull back to "rough and
helpful," not "precise and correct."

**Who this is for:** the target users are not particularly tech-literate.
This governs every UI decision in this layer:
- Large tap targets. Buttons and interactive shapes should be generously
  sized — think "usable by someone unfamiliar with small precise taps," not
  dense desktop-app UI.
- Minimal text density per screen. Short labels, plain language, no jargon
  in the primary UI (jargon is fine *inside* an expanded detail view, since
  that's opt-in).
- Obvious affordances — it should be visually clear what's tappable and what
  a shape or icon does without needing instructions.
- Clean, uncluttered layout. When in doubt, remove an element rather than
  add one.

**Suggestions are local and computed, not live AI.** No calls to the Claude
API or any LLM at runtime. "AI-assisted planning" in this app means: a local
scoring function compares a bed's stated conditions against the Layer 1
catalog's fields (soil type, sun, spacing/size, companions) and surfaces a
fit score with plain-language reasons — the same kind of scoring the original
artifact prototype already had working for its "what to grow" picker. Reuse
that logic's *shape*, not live inference.

---

## Scope for this brief

1. Auth — minimal, just enough to separate users' data (unchanged from
   earlier plan: Firebase Anonymous Auth, no email/password, no social
   login).
2. Property sketch — user roughly draws their land boundary, notebook-style.
3. Beds — rough shapes drawn within the property, each with a name and
   free-text/simple-field notes (not exact dimensions).
4. Plantings — attach a crop or animal from the Layer 1 catalog to a bed,
   with an optional note. No coordinates within the bed — a bed either has
   an item in it or it doesn't, position within the bed doesn't matter at
   this layer.
5. Suggestions — tapping a bed shows catalog crops/animals scored against
   that bed's stated conditions, with plain-language reasons.
6. Expandable info — every crop/animal name and any notable keyword
   (companion reasons, nutrient tags, etc.) anywhere in the UI is tappable,
   opening a detail view with that item's full needs/wants/uses (reuse the
   Layer 1 catalog detail view, don't rebuild it).

---

## Auth (unchanged, not open for reconsideration)

Firebase Anonymous Auth. No email/password, no profile beyond an optional
display name. A user's plots live under their anonymous UID. Known
limitation (new device = new UID = no access to old data) — note in
`PROJECT_STATE.md`, not solved this layer.

## Data model

Shapes are loose point arrays in relative coordinates (0.0–1.0 range, not
pixels), so drawings scale cleanly regardless of screen size and don't need
to be geometrically precise.

```
users/{uid}/plots/{plotId}
  name: string
  boundary_points: [{ x: number, y: number }, ...]   // relative 0-1 coords, rough sketch
  notes: string
  created_at: timestamp

users/{uid}/plots/{plotId}/beds/{bedId}
  name: string
  shape_points: [{ x: number, y: number }, ...]   // rough shape within the plot
  notes: string
  conditions: {
    sun: "full" | "partial" | "shade" | null,
    soil_type: string | null,      // matches Layer 1's soil_type_pref values where possible
    approx_size_sqft: number | null   // optional, rough estimate, not measured
  }
  created_at: timestamp

users/{uid}/plots/{plotId}/beds/{bedId}/plantings/{plantingId}
  entry_id: string           // references crops.json or animals.json id
  entry_type: "crop" | "animal"
  note: string | null
  planted_date: timestamp | null
```

No cell grid, no coordinate-based placement within a bed. A planting belongs
to a bed as a simple list membership.

## Drawing UI

- Freehand or tap-to-place-points polygon drawing for both the property
  boundary and bed shapes — pick whichever is more reliable to implement
  well and is genuinely easy for an unpracticed user to draw with a finger
  or mouse. Tap-to-place-points-then-close-the-shape is probably the more
  forgiving option for shaky/imprecise input; freehand is more
  notebook-like. Your call — note which you chose and why in your report.
  Include an "undo last point" and "clear and restart" control either way,
  since first attempts at drawing on a touchscreen are often bad.
- Soft, hand-drawn visual style for shapes (rounded, slightly irregular
  rendering rather than crisp CAD-style lines) to reinforce the "sketch,"
  not "blueprint," feeling.
- Tapping a drawn bed shape opens its detail panel (notes, conditions,
  plantings, suggestions) rather than requiring a separate "select" mode.

## Suggestion scoring

A local function, not a Function/API call:

```js
// suggestBeds.js
function scoreCatalogEntry(entry, bedConditions) {
  // compare entry.sun, entry.soil_type_pref, entry.soil_ph_range, etc.
  // against bedConditions (sun, soil_type — approx_size_sqft only where relevant, e.g. animal space needs)
  // return { score: 0-100 or a simple grade, reasons: string[] }
}
```

Handle missing bed conditions gracefully — a bed with no stated sun/soil
info should still show suggestions, just with fewer/weaker reasons ("not
enough info to say how well this fits — add sun and soil notes to get a
better match") rather than erroring or showing nothing. Given the target
users, an empty or broken screen is worse than an honest "not sure yet."

## Expandable info

Any crop/animal name or notable keyword (companion reason categories,
nutrient tags, etc.) rendered anywhere in this layer's UI should be tappable
and open the existing Layer 1 detail view for that item, or a short
plain-language definition for a keyword/tag. Reuse existing components,
don't rebuild the detail view from scratch.

---

## Explicit non-goals for this brief
- No cell grid, no exact coordinates, no deterministic spacing-conflict
  math.
- No live AI/LLM calls at runtime.
- No yield/profit estimates.
- No feed/manure economy or byproduct tracking.
- No real weather/soil API integration.
- No multi-plot dashboard — one plot at a time is fine.
- No precise measurement tools (rulers, exact acreage calculation from the
  drawn shape) — `approx_size_sqft` is a number the user types in, not
  something computed from the sketch.

If something's ambiguous, make the call, write it in `PROJECT_STATE.md`, and
flag it in your report rather than guessing silently. When in doubt, choose
the simpler/rougher option — this layer should feel easy to build precisely
because it's not trying to be precise.

---

## Report-back template

```
## Farmer John Report — Layer 2

**Commits:** [hash(es)]

### Auth
- Anonymous auth wired: [yes/no]

### Drawing
- Approach chosen (freehand vs tap-to-place-points): [which, and why]
- Undo/clear controls: [working?]

### Plot, bed, planting
- Property sketch working: [yes/no]
- Bed creation + notes/conditions fields working: [yes/no]
- Planting attach/remove working: [yes/no]

### Suggestions
- Scoring function working: [yes/no]
- How it handles a bed with no/partial conditions info: [...]
- Any catalog entries that scored oddly or didn't fit the scoring logic
  cleanly (useful signal): [...]

### Expandable info
- Crop/animal names tappable everywhere: [yes/no]
- Keyword definitions: [built as full detail view, short tooltip, or
  something else — what you chose]

### UI/accessibility check
- Confirm tap target sizing and text density were considered per the brief:
  [what you did]

### Deviations / open questions
[...]
```
