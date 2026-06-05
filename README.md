# Gallery

Offline-first mobile gallery web app with web image search.

- React 18 + TypeScript + Vite
- Material UI v6 (Material 3 design, dark theme)
- Mobile-first responsive grid
- Pick local photos/videos/gifs from device
- **Search the web** for free images (Wikimedia Commons, 100M+ files, no key, no auth)
- Save web images to IndexedDB — fully offline
- Smooth animations: fade/scale/zoom on load, hover scale, slide transitions
- PWA — installable, custom service worker for offline

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Features

- **My Gallery** tab: local files + saved web images, with thumbnails
- **Search Web** tab: text search, infinite scroll, tap to save
- Search suggestions on empty state
- Fullscreen viewer with metadata + attribution
- Skeleton loaders, progress indicators, animated FAB
- Bottom navigation with slide transition between tabs

## Tech

- **Storage**: IndexedDB (blobs + metadata)
- **Search**: [Wikimedia Commons API](https://commons.wikimedia.org/w/api.php) — open, no API key, no auth, CORS-friendly
- **Offline**: custom service worker (`public/sw.js`)
