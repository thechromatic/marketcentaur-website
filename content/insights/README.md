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
3. Commit on a branch and open a pull request. The **Build Insights** GitHub Action generates the page and commits it to the branch, and Cloudflare Pages posts a preview link on the pull request.
4. Merge to publish.

Posts with a future `date` stay hidden until that day; the Action runs daily at 06:00 IST to publish them.
Don't edit files in `/insights/` by hand: they are regenerated from this folder. To change the page layout, edit `scripts/templates/`.

To build locally: `npm ci --prefix scripts && node scripts/build-insights.mjs`
