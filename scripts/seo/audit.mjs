#!/usr/bin/env node
// SEO / AEO / GEO lint for every public page. Run on pull requests by .github/workflows/seo.yml.
//
//   node scripts/seo/audit.mjs
//
// Errors (exit 1): missing <title>, meta description, canonical, exactly one <h1>, valid JSON-LD,
// og:image file, or a page missing from sitemap.xml.
// Warnings: title over 65 chars, description over 160, thin pages (<300 words).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://marketcentaur.com';
const SKIP = new Set(['.git', 'node_modules', 'scripts', 'content', 'assets', '.github']);
const NOINDEX_OK = new Set(['contact-success.html']);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) yield* walk(path.join(dir, e.name)); }
    else if (e.name.endsWith('.html')) yield path.join(dir, e.name);
  }
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
let errors = 0;
let warnings = 0;
const report = [];

for (const file of [...walk(ROOT)].sort()) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const s = fs.readFileSync(file, 'utf8');
  const err = []; const warn = [];
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(s);
  if (noindex) { if (!NOINDEX_OK.has(rel)) warn.push('page is noindex'); continue; }

  const title = decode((s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const desc = decode((s.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const canonical = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const h1s = (s.match(/<h1[\s>]/g) || []).length;
  const og = (s.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  const lds = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  if (!title) err.push('missing <title>'); else if (title.length > 65) warn.push(`title ${title.length} chars`);
  if (!desc) err.push('missing meta description'); else if (desc.length > 160) warn.push(`description ${desc.length} chars`);
  if (!canonical) err.push('missing canonical');
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
