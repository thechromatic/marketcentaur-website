#!/usr/bin/env node
// Google Analytics 4 tag for every page, with Google Consent Mode v2 defaults.
//
//   node scripts/seo/ga4.mjs        add or refresh the tag in every HTML page and template
//
// The block sits right after <meta charset="utf-8"> between the GA4 markers, so re-running
// replaces it in place. build-catalog.mjs imports GA4_BLOCK for the pages it generates, and the
// Insights templates in scripts/templates/ carry the same block. audit.mjs fails a page without it.
//
// Consent defaults:
// - Visitors in the EEA, UK and Switzerland: analytics storage denied, so GA sets no cookies there
//   (Google receives cookieless pings only). We show no consent banner, so this stays denied.
// - Everyone else: analytics storage granted.
// - Advertising storage, ad user data and ad personalisation: denied everywhere (we run no ads).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const GA4_ID = 'G-W0SYHJZZX9';
export const GA4_START = '<!-- GA4:start -->';
export const GA4_END = '<!-- GA4:end -->';

const CONSENT_REGIONS = [
  // EU member states
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Rest of the EEA, the UK and Switzerland
  'IS', 'LI', 'NO', 'GB', 'CH',
];

export const GA4_BLOCK = `${GA4_START}
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', region: ${JSON.stringify(CONSENT_REGIONS).replace(/"/g, "'")}});
gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
gtag('js', new Date());
gtag('config', '${GA4_ID}');
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
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
