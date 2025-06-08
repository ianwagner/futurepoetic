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

The exported files will appear in `viewer-src/out/`. Copy the contents of that directory into the root `zine-viewer/` folder. If the Middle Archive page is required, also copy `middle-archive.html` and the generated `_next` assets into a new `middle-archive/` folder.

