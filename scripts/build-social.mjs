#!/usr/bin/env node
// Renders social media carousels for Insights posts.
//
// Each post can have a slide file at content/social/<slug>.json (slug = the post's page name).
// For every slide file this script writes, under assets/social/<slug>/:
//   1.png … N.png   1080×1350 slides for Instagram carousels (cover, content slides, closing slide)
//   carousel.pdf    the same slides as one PDF, for LinkedIn document posts
//
// Rendering only happens when a slide file, the template, the fonts or the logo changed,
// so daily runs don't create needless commits. `--check` prints whether any rendering is needed.
//
// Slide file format:
// {
//   "eyebrow": "Competitive intelligence",          // small label on the cover
//   "title": "12 competitor signals worth tracking",
//   "subtitle": "(and 5 to ignore)",                 // optional
//   "slides": [
//     { "eyebrow": "Worth tracking", "title": "Pricing & go-to-market",
//       "style": "arrow" | "cross" | "numbered",      // optional, default "arrow"
//       "items": ["Pricing page changes", "…"] }       // 2–5 short lines each
//   ],
//   "cta": { "eyebrow": "Read the full guide", "title": "All 12 signals, explained" }
// }

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'content', 'social');
const OUT = path.join(ROOT, 'assets', 'social');
const MANIFEST = path.join(OUT, 'manifest.json');
const FONTS = path.join(ROOT, 'scripts', 'social', 'fonts');
const LOGO = path.join(ROOT, 'assets', 'marketcentaur-logo-transparent.png');
const SELF = fileURLToPath(import.meta.url);
const W = 1080;
const H = 1350;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

// Anything that changes how every slide looks.
function templateHash() {
  const parts = [fs.readFileSync(SELF), fs.readFileSync(LOGO)];
  for (const f of fs.readdirSync(FONTS).filter((f) => f.endsWith('.otf')).sort()) parts.push(fs.readFileSync(path.join(FONTS, f)));
  return sha(Buffer.concat(parts));
}

function loadDecks() {
  if (!fs.existsSync(SRC)) return [];
  return fs.readdirSync(SRC).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const raw = fs.readFileSync(path.join(SRC, f));
    let deck;
    try { deck = JSON.parse(raw); } catch (e) { throw new Error(`${f}: not valid JSON (${e.message})`); }
    for (const k of ['title', 'slides', 'cta']) if (!deck[k]) throw new Error(`${f}: needs "${k}"`);
    if (!Array.isArray(deck.slides) || deck.slides.length < 1 || deck.slides.length > 8) throw new Error(`${f}: "slides" must have 1–8 entries`);
    deck.slides.forEach((s, i) => {
      if (!s.title || !Array.isArray(s.items) || s.items.length < 1 || s.items.length > 6) throw new Error(`${f}: slide ${i + 1} needs a title and 1–6 items`);
    });
    return { slug: f.replace(/\.json$/, ''), deck, hash: sha(raw) };
  });
}

function fontFaces() {
  const weights = { Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800 };
  return Object.entries(weights).map(([name, w]) => {
    const data = fs.readFileSync(path.join(FONTS, `Inter-${name}.otf`)).toString('base64');
    return `@font-face{font-family:"MC Inter";font-weight:${w};src:url(data:font/otf;base64,${data}) format("opentype")}`;
  }).join('\n');
}

const CSS = `
*{box-sizing:border-box;margin:0}
html,body{background:#111827}
body{font-family:"MC Inter",Inter,sans-serif;color:#f5f7fa}
@page{size:${W}px ${H}px;margin:0}
.s{position:relative;width:${W}px;height:${H}px;padding:96px 88px;display:flex;flex-direction:column;overflow:hidden;page-break-after:always;break-after:page;
 background:radial-gradient(900px 700px at 100% 0%,rgba(127,176,255,.18),transparent 60%),radial-gradient(700px 600px at 0% 100%,rgba(127,176,255,.08),transparent 60%),#111827}
.s:last-child{page-break-after:auto;break-after:auto}
.bar{position:absolute;left:0;top:0;height:10px;background:#7fb0ff}
.head{display:flex;align-items:center;margin-bottom:36px}
.head img{height:120px;display:block;margin-left:-6px}
.mid{margin-top:auto;margin-bottom:auto}
.eyebrow{font-size:28px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#7fb0ff;margin-bottom:28px}
h1{font-size:104px;line-height:1.02;letter-spacing:-.05em;font-weight:800}
h1.long{font-size:88px}
h2{font-size:76px;line-height:1.05;letter-spacing:-.045em;font-weight:800;margin-bottom:56px}
h2.long{font-size:64px}
.sub{font-size:52px;color:#b7c0cc;font-weight:500;margin-top:24px;letter-spacing:-.02em}
ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:22px}
li{background:#1f2937;border:2px solid #374151;border-radius:22px;padding:30px 34px 30px 92px;font-size:40px;line-height:1.25;font-weight:600;position:relative}
li:before{content:"→";position:absolute;left:34px;top:28px;color:#7fb0ff;font-weight:800}
ul.cross li{color:#b7c0cc;font-weight:500}
ul.cross li:before{content:"×";color:#6b7280}
ul.numbered{counter-reset:n}
ul.numbered li{counter-increment:n}
ul.numbered li:before{content:counter(n,decimal-leading-zero);font-size:30px;top:36px;letter-spacing:.05em}
ul.dense li{font-size:34px;padding:24px 30px 24px 84px}
ul.dense li:before{top:22px}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:flex-end;padding-top:40px}
.pg{font-size:28px;color:#b7c0cc;font-weight:700;letter-spacing:.08em}
.swipe{font-size:34px;font-weight:700;color:#7fb0ff}
.cta-box{margin-top:48px;background:#7fb0ff;color:#0b1220;border-radius:24px;padding:36px 40px;font-size:46px;font-weight:800;letter-spacing:-.02em;align-self:flex-start}
.note{font-size:34px;color:#b7c0cc;margin-top:28px;font-weight:600}
`;

function slidesHtml(deck, logoUri) {
  const all = [{ kind: 'cover' }, ...deck.slides.map((s) => ({ kind: 'list', ...s })), { kind: 'cta' }];
  const n = all.length;
  return all.map((s, idx) => {
    const i = idx + 1;
    const bar = `<div class="bar" style="width:${Math.round((W * i) / n)}px"></div>`;
    const head = `<div class="head"><img src="${logoUri}" alt="MarketCentaur"></div>`;
    const pg = `<span class="pg">${i}/${n}</span>`;
    let body;
    if (s.kind === 'cover') {
      const long = deck.title.length > 48 ? ' class="long"' : '';
      body = `<div class="mid">${deck.eyebrow ? `<div class="eyebrow">${esc(deck.eyebrow)}</div>` : ''}<h1${long}>${esc(deck.title)}</h1>${deck.subtitle ? `<div class="sub">${esc(deck.subtitle)}</div>` : ''}</div><div class="foot"><span class="swipe">Swipe →</span></div>`;
    } else if (s.kind === 'cta') {
      body = `<div class="mid"><div class="eyebrow">${esc(deck.cta.eyebrow || 'Read the full guide')}</div><h2 style="margin-bottom:0">${esc(deck.cta.title)}</h2><div class="cta-box">marketcentaur.com/insights</div><div class="note">Link in bio</div></div><div class="foot">${pg}</div>`;
    } else {
      const style = ['cross', 'numbered'].includes(s.style) ? s.style : '';
      const dense = s.items.length >= 6 || s.items.some((t) => t.length > 56) ? " dense" : "";
      const long = s.title.length > 26 ? ' class="long"' : '';
      body = `<div class="mid">${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ''}<h2${long}>${esc(s.title)}</h2><ul class="${style}${dense}">${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div><div class="foot">${pg}</div>`;
    }
    return `<section class="s">${bar}${head}${body}</section>`;
  });
}

async function main() {
  const decks = loadDecks();
  const tHash = templateHash();
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  const needed = decks.filter(({ slug, hash }) => {
    const m = manifest[slug];
    return !m || m.hash !== hash || m.template !== tHash || !fs.existsSync(path.join(OUT, slug, 'carousel.pdf'));
  });
  const stale = Object.keys(manifest).filter((slug) => !decks.some((d) => d.slug === slug));

  if (process.argv.includes('--check')) {
    console.log(needed.length || stale.length ? 'needed=true' : 'needed=false');
    return;
  }

  for (const slug of stale) {
    fs.rmSync(path.join(OUT, slug), { recursive: true, force: true });
    delete manifest[slug];
    console.log(`Removed carousel for ${slug}`);
  }

  if (needed.length) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const head = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces()}${CSS}</style></head><body>`;
    const logoUri = `data:image/png;base64,${fs.readFileSync(LOGO).toString('base64')}`;

    for (const { slug, deck, hash } of needed) {
      const dir = path.join(OUT, slug);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const slides = slidesHtml(deck, logoUri);
      for (let i = 0; i < slides.length; i++) {
        await page.setContent(`${head}${slides[i]}</body></html>`);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(dir, `${i + 1}.png`), clip: { x: 0, y: 0, width: W, height: H } });
      }
      await page.setContent(`${head}${slides.join('')}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: path.join(dir, 'carousel.pdf'), width: `${W}px`, height: `${H}px`, printBackground: true, preferCSSPageSize: true });
      manifest[slug] = { hash, template: tHash, slides: slides.length };
      console.log(`Rendered ${slides.length} slides for ${slug}`);
    }
    await browser.close();
  }

  fs.mkdirSync(OUT, { recursive: true });
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  fs.writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
  if (!needed.length && !stale.length) console.log('Carousels are up to date.');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
