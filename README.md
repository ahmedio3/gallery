# Gallery

Offline-first mobile gallery web app for photos, videos, and gifs.

- React 18 + TypeScript + Vite
- Material UI v6 (Material 3 design)
- PWA — installable, works offline
- Mobile-first responsive grid
- Files stay on device (object URLs), metadata in localStorage

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

## Push to GitHub

```bash
cd ~/projects/gallery
git init
git add .
git commit -m "Initial commit"
gh repo create gallery --public --source=. --remote=origin --push
```
