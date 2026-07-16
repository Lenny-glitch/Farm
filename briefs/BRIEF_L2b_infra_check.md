# Brief: L2b — Confirm Infra + Status Check
**Project:** FarmMapper (repo: `~/projects/stuff`)
**Coder:** Farmer John
**Planner:** Ceres

---

## Context

Firebase project `farm-e7821` is now aliased to this repo (alias name:
`snufleupagus`, confirmed via `firebase use`). Aliasing the CLI to a project
does not necessarily mean Firestore, Functions, and Hosting are actually
provisioned/enabled under it yet — need to confirm, not assume.

## Task 1: Confirm infra is actually provisioned

Check each of these under `farm-e7821` specifically (not `warhammer-5f2f4` —
double check you're pointed at the right project before touching anything):

- Firestore: enabled? In native mode (not Datastore mode)? Any existing
  data/collections from prior work?
- Cloud Functions: enabled? Any functions currently deployed?
- Hosting: enabled? Anything currently deployed there?

If any of these aren't provisioned, provision them now (`firebase init`
picking the missing pieces, or via `firebase deploy` targets as
appropriate). Don't silently skip a missing piece — either fix it or report
exactly what's missing and why you didn't provision it yourself.

## Task 2: Status check on L2a (dev server fix)

Report current status of the L2a brief (JSX/Vite serving fix, missing icon,
CLAUDE.md standing note): done, in progress, or blocked. If done, confirm
commits exist. If blocked, say on what.

## Task 3: General status

Anything else worth flagging before the next brief lands — broken state,
uncommitted work, open questions sitting unanswered. This is a checkpoint,
not just a rubber stamp — flag anything real even if it's not directly
about infra.

---

## Report-back template

```
## Farmer John Report — L2b

### Infra (farm-e7821)
- Firestore: [status]
- Functions: [status]
- Hosting: [status]
- Actions taken: [...]

### L2a status
- [done/in progress/blocked, commits if done]

### Anything else to flag
- [...]
```
