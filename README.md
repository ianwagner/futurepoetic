# Future Poetic

This repository hosts the **Future Poetic** site as a single Next.js app.
All pages are defined in the app itself and exported for GitHub Pages.

## Development

Install dependencies and run the dev server from the repo root:

```bash
npm install
npm run dev
```

## Sanity Studio

The Sanity Studio lives at `website/futurepoetic/studio`.

## Static export (GitHub Pages)

The build is configured for `output: "export"`, so `npm run build` generates
an `out/` folder. GitHub Pages should publish the contents of `out/` (handled
by the workflow in `.github/workflows/`).

The `public/` folder includes:

- `CNAME` for the custom domain
- `.nojekyll` to keep `_next/` assets intact

## Routes

- `/` – landing page
- `/xine-library/` – xine viewer
- `/middle-archive/` – middle archive
- `/note.html` – note to self
