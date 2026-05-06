# webpage_rohan

Personal website built with Astro.

## Commands

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Deployment

GitHub Pages deploys via `.github/workflows/deploy.yml`.
Enable it in GitHub Settings -> Pages -> Source: GitHub Actions.

## Cloudflare Web Analytics

Create a Cloudflare Web Analytics site for `rohand24.github.io`, copy the site token from the JS snippet, and set it in `site.config.json`:

```json
"cloudflareWebAnalyticsToken": "YOUR_TOKEN_HERE"
```

The shared Astro layout only injects Cloudflare's beacon script when this token is set.
