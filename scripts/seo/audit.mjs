#!/usr/bin/env node
// SEO / AEO / GEO lint for every public page. Run on pull requests by .github/workflows/seo.yml.
//
//   node scripts/seo/audit.mjs
//
// Errors (exit 1): missing <title>, meta description, canonical, exactly one <h1>, valid JSON-LD,
// og:image file, a page missing from sitemap.xml, or a page without the GA4 tag (scripts/seo/ga4.mjs).
// Internal links (errors): a same-site href ending in .html (Cloudflare Pages redirects it, which
// Search Console reports as "Page with redirect") or pointing at a page that does not exist (404).
// Warnings: title over 65 chars, description over 160, thin pages (<300 words).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GA4_BLOCK } from './ga4.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://marketcentaur.com';
const SKIP = new Set(['.git', 'node_modules', 'scripts', 'content', 'assets', '.github']);
const NOINDEX_OK = new Set(['contact-success.html', 'toolkit/download.html']);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) yield* walk(path.join(dir, e.name)); }
    else if (e.name.endsWith('.html')) yield path.join(dir, e.name);
  }
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const ASSET = /\.(css|js|mjs|png|jpe?g|gif|svg|webp|ico|xml|txt|pdf|json|zip|woff2?|csv|md|mp4)$/i;
const POSTS = new Set(fs.readdirSync(path.join(ROOT, 'content', 'insights')).map((f) => (f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/) || [])[1]).filter(Boolean));
// Returns [errors, warnings]. A link to an Insights post that exists in content/insights/ but is not
// built yet (future-dated, or dated today before the daily build) is a warning, not an error.
function linkIssues(rel, s) {
  const out = new Set(); const later = new Set();
  for (const m of s.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    let u = m[1];
    if (u.startsWith(SITE)) u = u.slice(SITE.length) || '/';
    else if (/^(?:[a-z]+:|\/\/|#)/i.test(u)) continue;
    u = u.split('#')[0].split('?')[0];
    if (!u) continue;
    if (!u.startsWith('/')) u = path.posix.join('/', path.posix.dirname(rel), u) + (u.endsWith('/') ? '/' : '');
    if (ASSET.test(u)) { if (!fs.existsSync(path.join(ROOT, u))) out.add(`broken link (404): ${m[1]}`); continue; }
    if (u.endsWith('.html')) { out.add(`link ends in .html; use ${u.replace(/(?:index)?\.html$/, '')} (${m[1]})`); continue; }
    const ok = u.endsWith('/') ? fs.existsSync(path.join(ROOT, u, 'index.html'))
      : fs.existsSync(path.join(ROOT, `${u}.html`)) || fs.existsSync(path.join(ROOT, u, 'index.html'));
    if (!ok) {
      const post = (u.match(/^\/insights\/([a-z0-9-]+)$/) || [])[1];
      if (post && POSTS.has(post)) later.add(`links to an Insights post that is not published yet (404 until then): ${m[1]}`);
      else out.add(`broken link (404): ${m[1]}`);
    }
  }
  return [[...out], [...later]];
}

let errors = 0;
let warnings = 0;
const report = [];

for (const file of [...walk(ROOT)].sort()) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const s = fs.readFileSync(file, 'utf8');
  const err = []; const warn = [];
  if (!s.includes(GA4_BLOCK)) { err.push('missing or outdated GA4 tag (run node scripts/seo/ga4.mjs)'); }
  const [linkErr, linkWarn] = linkIssues(rel, s);
  err.push(...linkErr); warn.push(...linkWarn);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(s);
  if (noindex) {
    if (!NOINDEX_OK.has(rel)) warn.push('page is noindex');
    errors += err.length; warnings += warn.length;
    if (err.length || warn.length) report.push(`${rel}\n${err.map((e) => `  ERROR  ${e}`).concat(warn.map((w) => `  warn   ${w}`)).join('\n')}`);
    continue;
  }

  const title = decode((s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const desc = decode((s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const canonical = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const h1s = (s.match(/<h1[\s>]/g) || []).length;
  const og = (s.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  const lds = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  if (!title) err.push('missing <title>'); else if (title.length > 65) warn.push(`title ${title.length} chars`);
  if (!desc) err.push('missing meta description'); else if (desc.length > 160) warn.push(`description ${desc.length} chars`);
  if (!canonical) err.push('missing canonical');
  else if (/\.html$/.test(canonical)) err.push(`canonical ends in .html; Cloudflare Pages redirects it (${canonical})`);
  else if (!sitemap.includes(`<loc>${canonical}</loc>`)) err.push(`not in sitemap.xml (${canonical})`);
  if (h1s !== 1) err.push(`${h1s} <h1> tags`);
  if (!lds.length) err.push('no JSON-LD structured data');
  for (const ld of lds) { try { JSON.parse(ld); } catch (e) { err.push(`invalid JSON-LD: ${e.message}`); } }
  if (!og) err.push('missing og:image');
  else if (og.startsWith(`${SITE}/assets/`) && !fs.existsSync(path.join(ROOT, og.slice(SITE.length + 1)))) err.push(`og:image file missing: ${og}`);
  if (!/twitter:card" content="summary_large_image"/.test(s)) warn.push('twitter:card is not summary_large_image');

  const body = s.replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 300 && !/^(contact|privacy|terms)/.test(rel)) warn.push(`thin: ${words} words`);

  errors += err.length; warnings += warn.length;
  if (err.length || warn.length) report.push(`${rel}\n${err.map((e) => `  ERROR  ${e}`).concat(warn.map((w) => `  warn   ${w}`)).join('\n')}`);
}

console.log(report.join('\n'));
console.log(`\nSEO audit: ${errors} error(s), ${warnings} warning(s).`);
if (errors) process.exit(1);
