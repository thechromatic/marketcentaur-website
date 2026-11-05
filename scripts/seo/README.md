# SEO / AEO / GEO tooling

| Script | What it does | Runs |
|---|---|---|
| `audit.mjs` | Lints every page: title, meta description, canonical, one H1, valid JSON-LD, og:image file, sitemap entry. Warns on long titles/descriptions and thin pages. | On every pull request (`.github/workflows/seo.yml`) |
| `indexnow.mjs` | Submits changed URLs to IndexNow (Bing, which also feeds ChatGPT search and Copilot, plus Yandex and others). Key file: `/<key>.txt` in the site root. | After every push to `main` and every Build Insights publish |
| `og-images.py` | Draws a 1200×630 share image for any page whose `og:image` points at `/assets/og/<name>.png` and doesn't exist yet. `--force` redraws all. | In Build Insights |

New hand-built pages: give them a canonical, a sitemap entry, JSON-LD, and
`<meta property="og:image" content="https://marketcentaur.com/assets/og/<page-name>.png">` —
the image is drawn automatically from the page's H1.

Manual one-offs: `node scripts/seo/indexnow.mjs --all` (or run the SEO workflow with "Submit every sitemap URL") after a big change.
