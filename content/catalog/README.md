# Service catalog

`practices-1.json` and `practices-2.json` hold the 17 practices and their services.
`extras.json` holds the bundles and the industry pages added in November 2026.

`scripts/build-catalog.mjs` turns them into:

- `/practices/` (hub) and `/practices/<slug>.html` (one page per practice)
- `/industries/<slug>.html` for each industry in `extras.json`
- `/assets/catalog.json`, which the Ask MarketCentaur assistant reads
- the practice blocks on the homepage, services page, how-it-works page and industries page
- sitemap.xml and llms.txt entries

## Editing

1. Edit the JSON. Each service has an `id`, `name`, `type` (`diagnose`, `build` or `run`),
   `timeline`, `summary` and `includes`.
2. Push. The Build Insights workflow runs the script and commits the pages. To preview
   locally: `node scripts/build-catalog.mjs`.

Never add prices. The script stops with an error if it finds a currency amount or a
"% off" anywhere in the catalog.

## Switches

- **Lead copies to Make.com:** paste a webhook URL into `MAKE_WEBHOOK_URL` in `assets/forms.js`.
- **AI answers in the assistant:** add `ANTHROPIC_API_KEY` under Cloudflare Pages → Settings →
  Environment variables. Without it the assistant matches questions to the catalog in the browser.
