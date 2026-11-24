# Filament Manager — Hyde Eden 3D

Static web app (PWA). Data and accounts live in Supabase; this repo is only the app files.

## Deploy on GitHub Pages

1. In the **HydeEden** organization, create a new **public** repository named `filament-manager`.
2. Upload everything in this folder (including the `assets` folder and the hidden `.nojekyll` file) to the repo root and commit.
3. Repo **Settings → Pages → Build and deployment → Deploy from a branch**, pick `main` / `(root)`, Save.
4. Live in about a minute at **https://hydeeden.github.io/filament-manager/**
5. In Supabase: **Authentication → URL Configuration** — set Site URL to the address above (needed if email confirmation or password reset is ever turned on).

## Updating

Replace the changed files, commit, and Pages redeploys automatically within about a minute.
If the app shell changes, bump `CACHE_NAME` in `sw.js` so installed copies refresh.

## Notes

- `sw.js` lives at the repo root on purpose — a service worker can only control pages at or below its own folder, so the root copy makes offline opening and install-to-homescreen work properly.
- `.nojekyll` tells GitHub Pages to serve the files exactly as uploaded.
- The Supabase key in the app is the publishable key — it is meant to be public. Accounts and per-user row rules protect the data.
