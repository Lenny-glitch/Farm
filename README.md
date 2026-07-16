# FarmMapper

Personal farm/land planning web app. See `CLAUDE.md` for project context and
`PROJECT_STATE.md` for current status.

## Setup

```
npm install
```

## Local development

```
npm run dev
```

This starts the **Vite** dev server (default `http://localhost:5173`), which
transpiles JSX and serves `public/` assets correctly. Don't serve `index.html`
directly with a plain static file server (e.g. `live-server`) — it won't
transpile `.jsx` and won't know to map `public/` onto the site root, which
breaks the app.

## Production build

```
npm run build
npm run preview   # serve the built dist/ locally to sanity-check
```

## Deploy

```
npm run deploy     # builds and deploys hosting via Firebase
```

Requires a linked Firebase project — see `PROJECT_STATE.md` for status.
