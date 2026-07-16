# Brief: L3 — Real Conditions Data via Cloudflare Workers
**Project:** FarmMapper (repo: `~/projects/stuff`)
**Coder:** Farmer John
**Planner:** Ceres

---

## Context

Real weather/soil lookup by zip is wanted, at zero cost. Firebase Cloud
Functions requires enabling the Blaze billing plan to deploy at all
(regardless of actual usage staying free), so it's out. Cloudflare Workers
does the same job — a small server-side step that calls external APIs on
the browser's behalf — with a genuinely free tier and no billing signup
required. This brief adds that piece.

**Why a proxy is needed at all:** browsers block JavaScript on a webpage
from freely calling other companies' servers (CORS) unless that server
explicitly allows it. NWS's weather API doesn't reliably send the headers
that would allow direct browser calls. A small server in between (Worker →
NWS/SoilGrids → Worker → browser) sidesteps this, since server-to-server
calls aren't subject to that browser restriction.

## Non-delegable step (Nox does this first)

Cloudflare Workers needs an account, same shape as the earlier Firebase
login step:
1. Sign up at Cloudflare (free tier, no credit card required) if not already
   done.
2. Install Wrangler CLI: `npm install -g wrangler`
3. `wrangler login` — opens a browser auth flow, same pattern as
   `firebase login`.
4. Confirm login worked: `wrangler whoami`

Send the output of `wrangler whoami` before handing this off, same as the
Firebase project confirmation earlier.

## Task 1: Geocoding — zip → lat/lon

Use the **US Census Bureau Geocoder** (free, public, no API key required,
government source, reliable CORS-free since it's called server-side anyway):
`https://geocoding.geo.census.gov/geocoder/locations/address` or the
one-line address/zip endpoint — check current docs for exact query params.
Worker endpoint: `GET /geocode?zip=99201` → returns `{ lat, lon }`.

## Task 2: Weather — real conditions from NWS

Using the lat/lon from Task 1, call `api.weather.gov`:
1. `GET https://api.weather.gov/points/{lat},{lon}` to get the forecast
   office/grid reference.
2. Follow that to the actual forecast endpoint it returns.
Worker endpoint: `GET /weather?lat=X&lon=Y` → returns a normalized, simplified
object (current conditions + short forecast summary — don't pass through
NWS's full raw structure, extract just what the app's conditions UI needs).

Set a proper `User-Agent` header on the Worker's outbound request identifying
the app (NWS asks for this as a courtesy, and since this call happens
server-side in the Worker, not the browser, setting it is straightforward).

## Task 3: Soil — real data from SoilGrids

Call ISRIC SoilGrids' REST API for the same lat/lon (soil pH, texture class,
organic carbon — check current SoilGrids API docs for exact endpoint/query
shape, this may have changed). Worker endpoint: `GET /soil?lat=X&lon=Y` →
normalized object with just the fields the catalog schema already uses
(`soil_ph_range`, `soil_type_pref` equivalent).

## Task 4: Client integration

On a bed's conditions form (from Layer 2), add a "Look up my area" button
next to the manual sun/soil fields — not replacing manual entry, supplementing
it. Tapping it: geocodes the user's zip (ask for zip if not already known),
calls weather + soil endpoints, pre-fills the conditions fields with the
result, clearly labeled as an estimate the user can still edit
("Estimated from your zip — feel free to correct this"). This stays true to
the notebook framing — a helpful starting guess, not an authoritative
overwrite.

## Task 5: Cache results, don't refetch constantly

Once looked up for a given zip, store the result in Firestore keyed by zip
(this is genuinely slow-changing regional data, not per-second weather) and
reuse it for any bed in the same area rather than re-calling the Worker every
time. A manual "refresh" option is fine for the rare case someone wants to
re-check.

---

## Explicit non-goals for this brief
- No live/hourly weather polling — this is regional/rough conditions data,
  not a live weather app.
- No paid API tiers or API keys requiring payment info anywhere in this
  chain — if a step in current research turns out to require a paid key,
  stop and report back rather than substituting something that costs money.
- No changes to the Layer 1 catalog schema — this only fills in bed
  conditions fields, doesn't touch the static crop/animal data.

---

## Report-back template

```
## Farmer John Report — L3

**Commits:** [hash(es)]

### Cloudflare Worker
- Deployed: [yes/no, URL]
- Endpoints working: [/geocode, /weather, /soil — status of each]

### Client integration
- "Look up my area" button: [working?]
- Estimate vs manual-entry framing: [how you handled it]

### Caching
- Per-zip caching implemented: [yes/no]

### Any API/cost surprises
- [flag anything that required payment info or hit an unexpected paywall]

### Deviations / open questions
[...]
```
