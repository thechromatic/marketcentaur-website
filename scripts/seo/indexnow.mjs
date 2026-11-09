#!/usr/bin/env node
// Tells IndexNow search engines (Bing, which feeds ChatGPT search and Copilot, plus Yandex,
// Seznam, Naver) which pages changed, so they recrawl them within minutes instead of days.
//
//   node scripts/seo/indexnow.mjs <base-sha> <head-sha>   # pages changed between two commits
//   node scripts/seo/indexnow.mjs --all                   # every URL in sitemap.xml
//   add --dry-run to print the URLs without submitting
//
// The key file (<key>.txt in the site root) proves we own the domain. Run by .github/workflows/seo.yml.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HOST = 'marketcentaur.com';
const SITE = `https://${HOST}`;

const DRY = process.argv.includes('--dry-run');
const args = process.argv.slice(2).filter((a) => a !== '--dry-run');
const keyFile = fs.readdirSync(ROOT).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file (<32 hex chars>.txt) not found in the site root');
const key = keyFile.replace(/\.txt$/, '');

function toUrl(file) {
  if (!file.endsWith('.html') || /^(scripts|content|node_modules|\.github)\//.test(file)) return null;
  if (file === 'contact-success.html') return null;
  if (file === 'index.html') return `${SITE}/`;
  if (file.endsWith('/index.html')) return `${SITE}/${file.slice(0, -'index.html'.length)}`;
  return `${SITE}/${file.slice(0, -'.html'.length)}`; // Cloudflare Pages serves pages without .html
}

let urls;
if (args[0] === '--all') {
  urls = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
} else {
  const [base, head] = args;
  if (!base || !head) throw new Error('usage: indexnow.mjs <base-sha> <head-sha> | --all');
  const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', base, head], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
  urls = [...new Set(changed.map(toUrl).filter(Boolean))];
  if (changed.some((f) => f === 'sitemap.xml' || f === 'llms.txt')) urls.push(`${SITE}/sitemap.xml`);
  if (changed.includes('llms.txt')) urls.push(`${SITE}/llms.txt`);
}

if (!urls.length) { console.log('No changed pages to submit.'); process.exit(0); }
if (DRY) { console.log(`Would submit ${urls.length} URL(s):`); urls.forEach((u) => console.log(`  ${u}`)); process.exit(0); }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: submitted ${urls.length} URL(s), HTTP ${res.status}`);
urls.forEach((u) => console.log(`  ${u}`));
// 200/202 = accepted. 422/403 usually means the key file isn't live yet; don't fail the deploy over it.
if (res.status >= 500) process.exit(1);
