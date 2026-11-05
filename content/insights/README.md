# Insights posts

Each file here becomes a page at `marketcentaur.com/insights/<slug>.html`.

## Add a post

1. Create `YYYY-MM-DD-your-slug.md` in this folder.
2. Start it with this block, then write the post in Markdown below it:

   ```
   ---
   title: How to Read a Competitor's Pricing Page
   description: One or two sentences shown in search results and on the Insights page.
   date: 2026-11-12
   category: Competitive intelligence
   ---
   ```

   Optional fields: `author` (defaults to "The MarketCentaur Team"), `slug`, `updated` (YYYY-MM-DD) and `draft: true`.

   Recommended for search and AI answers (the build prints an "AEO warning" when one is missing):
   - `summary:` a 40–60 word direct answer to the post's main question, shown as a "Short answer" box at the top.
   - `seo_title:` a `<title>` under 60 characters when the headline is longer.
   - At least one question-style `## ...?` heading.
   - A `## FAQ` section at the end with 3–5 `### Question?` headings, each followed by a short answer. It's published as FAQPage structured data.
   - A link to a service page or free tool, e.g. `/services/market-competitor-intelligence.html` or `/ai-visibility-check.html`.
3. Commit on a branch and open a pull request. The **Build Insights** GitHub Action generates the page and commits it to the branch, and Cloudflare Pages posts a preview link on the pull request.
4. Merge to publish.

Posts with a future `date` stay hidden until that day; the Action runs daily at 06:00 IST to publish them.
Don't edit files in `/insights/` by hand: they are regenerated from this folder. To change the page layout, edit `scripts/templates/`.

To build locally: `npm ci --prefix scripts && node scripts/build-insights.mjs`

Each post also gets a 1200×630 social share image at `/assets/og/insights-<slug>.png`, drawn by `scripts/seo/og-images.py` during the build.

## Social carousels

Add `content/social/<slug>.json` (same slug as the post's page) to get a 1080×1350 carousel and a LinkedIn PDF at `/assets/social/<slug>/` (`1.png`, `2.png` … and `carousel.pdf`). The format is described at the top of `scripts/build-social.mjs`. The weekly social task uses these for Instagram and LinkedIn drafts in Buffer.
