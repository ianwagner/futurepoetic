# Future Poetic

This repository hosts the static site for **Future Poetic**. Each project is exported as a standalone static folder under the repository root.

Currently two projects are published:

- [`zine-viewer/`](zine-viewer/) – the digital zine viewer
- [`middle-archive/`](middle-archive/) – an experimental archive page

The zine viewer is generated from the Next.js source located in [`viewer-src/`](viewer-src/). To rebuild it:

```bash
cd viewer-src
npm install
npm run build
```

The exported files will appear in `viewer-src/out/`. Copy the contents of that directory into the root `zine-viewer/` folder.

The Middle Archive page is maintained separately as `middle-archive/index.html`.
When deploying to GitHub Pages, include an empty `.nojekyll` file at the
repository root. This prevents Jekyll from stripping directories that start
with an underscore, such as the Next.js `_next` folder used by both projects.

When hosting the static site on **Vercel**, add a `vercel.json` file with the
following contents:

```json
{
  "trailingSlash": true
}
```

This ensures requests like `/middle-archive` redirect to `/middle-archive/`,
allowing the relative `_next` asset paths to resolve correctly.

When deploying to GitHub Pages, include an empty `.nojekyll` file at the
repository root. This prevents Jekyll from stripping directories that start
with an underscore, such as the Next.js `_next` folder used by both projects.

