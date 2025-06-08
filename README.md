# Future Poetic

This repository hosts the static site for **Future Poetic** along with the Next.js source used to generate the zine viewer.

The built viewer lives under [`zine-viewer/`](zine-viewer/). To update the static files:

```bash
cd viewer-src
npm install
npm run build
```

The exported files will appear in `viewer-src/out/`. Copy the contents of that directory into the root `zine-viewer/` folder before committing.

