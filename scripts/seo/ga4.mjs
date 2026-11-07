#!/usr/bin/env node
// Google Analytics 4 tag for every page, with Google Consent Mode v2 defaults.
//
//   node scripts/seo/ga4.mjs        add or refresh the tag in every HTML page and template
//
// The block sits right after <meta charset="utf-8"> between the GA4 markers, so re-running
// replaces it in place. build-catalog.mjs imports GA4_BLOCK for the pages it generates, and the
// Insights templates in scripts/templates/ carry the same block. audit.mjs fails a page without it.
//
// Consent (opt-in for every visitor):
// - All consent types default to denied, and gtag.js is NOT loaded, so nothing goes to Google
//   until the visitor accepts in the cookie banner (assets/consent.js).
// - window.mcLoadGa() grants analytics_storage and loads gtag.js. It runs on accept, or straight
//   away on later visits when a stored "granted" choice is under 6 months old.
// - Advertising storage, ad user data and ad personalisation stay denied (we run no ads).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const GA4_ID = 'G-W0SYHJZZX9';
export const GA4_START = '<!-- GA4:start -->';
export const GA4_END = '<!-- GA4:end -->';

const CONSENT_MAX_AGE = 15724800000; // 182 days in ms; keep in sync with assets/consent.js

export const GA4_BLOCK = `${GA4_START}
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
gtag('js', new Date());
gtag('config', '${GA4_ID}');
window.mcLoadGa = function () {
  if (window.mcGaLoaded) return; window.mcGaLoaded = true;
  gtag('consent', 'update', {analytics_storage: 'granted'});
  var s = document.createElement('script'); s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';
  document.head.appendChild(s);
};
try { var c = JSON.parse(localStorage.getItem('mc-consent') || 'null'); if (c && c.v === 1 && c.analytics === 'granted' && Date.now() - c.t < ${CONSENT_MAX_AGE}) window.mcLoadGa(); } catch (e) {}
</script>
<script src="/assets/consent.js" defer></script>
${GA4_END}`;

export function applyGa4(html) {
  const s = html.indexOf(GA4_START);
  const e = html.indexOf(GA4_END);
  if (s !== -1 && e > s) return html.slice(0, s) + GA4_BLOCK + html.slice(e + GA4_END.length);
  const charset = html.match(/<meta charset="utf-8">\n?/i);
  if (charset) {
    const i = charset.index + charset[0].length;
    return `${html.slice(0, i)}${charset[0].endsWith('\n') ? '' : '\n'}${GA4_BLOCK}\n${html.slice(i)}`;
  }
  if (html.includes('</head>')) return html.replace('</head>', `${GA4_BLOCK}\n</head>`);
  throw new Error('no <meta charset> or </head> to anchor the GA4 tag');
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKIP = new Set(['.git', 'node_modules', 'content', 'assets', '.github', 'functions']);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      if (path.relative(ROOT, path.join(dir, e.name)) === 'scripts') { yield* walk(path.join(dir, e.name, 'templates')); continue; }
      yield* walk(path.join(dir, e.name));
    } else if (e.name.endsWith('.html')) yield path.join(dir, e.name);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let changed = 0; let total = 0;
  for (const file of walk(ROOT)) {
    total += 1;
    const before = fs.readFileSync(file, 'utf8');
    const after = applyGa4(before);
    if (after !== before) { fs.writeFileSync(file, after); changed += 1; }
  }
  console.log(`GA4 (${GA4_ID}): updated ${changed} of ${total} HTML files.`);
}
