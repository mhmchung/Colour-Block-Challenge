# ChromaQuest: The Color Challenge

A fast-paced, minimalist colour puzzle: find the “odd one out” in a grid of vibrant tiles before the clock hits zero.

## Local dev

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages (recommended)

This repo includes a GitHub Actions workflow that builds and deploys automatically.

1. Push this repo to GitHub (default branch: `main`)
2. In GitHub: **Settings → Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. Push a commit to `main` (or run the workflow manually)

GitHub will publish the site at:

- `https://<your-username>.github.io/<repo-name>/`

## Notes

- `vite.config.ts` uses `base: './'` so assets work on GitHub Pages without needing repo-name-specific config.
- `dist/` is intentionally not committed; GitHub Actions builds it and deploys it.

