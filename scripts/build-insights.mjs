#!/usr/bin/env node
// Builds the /insights/ section from Markdown files in content/insights/.
//
// Each post is a Markdown file named YYYY-MM-DD-slug.md with a small front-matter block:
//
//   ---
//   title: Post title
//   description: One or two sentences for search results and cards.
//   date: 2026-11-05
//   category: Competitive intelligence
//   author: The MarketCentaur Team   (optional)
//   draft: true                      (optional; drafts are skipped)
//   ---
//
// Posts dated in the future are skipped until that date, so a daily run publishes them on time.
// The script writes insights/<slug>.html and insights/index.html, and refreshes the
// Insights entries in sitemap.xml and llms.txt. Generated pages are marked so that removing
// a Markdown file also removes its page on the next build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'content', 'insights');
const OUT = path.join(ROOT, 'insights');
const SITE = 'https://marketcentaur.com';
const GENERATOR = '<meta name="generator" content="marketcentaur-insights">';
const DEFAULT_AUTHOR = 'The MarketCentaur Team';

const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function parseFrontMatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter (--- block at the top)`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) throw new Error(`${file}: bad front-matter line "${line}"`);
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    meta[line.slice(0, i).trim().toLowerCase()] = v;
  }
  return { meta, body: m[2] };
}

function loadPosts() {
  if (!fs.existsSync(SRC)) return [];
  const posts = [];
  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.md') && !f.startsWith('_') && f.toLowerCase() !== 'readme.md')) {
    const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(SRC, file), 'utf8'), file);
    for (const k of ['title', 'description', 'date', 'category']) {
      if (!meta[k]) throw new Error(`${file}: front matter needs "${k}"`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${file}: date must be YYYY-MM-DD`);
    if (String(meta.draft).toLowerCase() === 'true') continue;
    if (meta.date > today) { console.log(`Scheduled (not yet published): ${file} on ${meta.date}`); continue; }
    const slug = (meta.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''))
      .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      ...meta,
      author: meta.author || DEFAULT_AUTHOR,
      slug,
      url: `${SITE}/insights/${slug}.html`,
      path: `/insights/${slug}.html`,
      html: marked.parse(body),
      readTime: Math.max(1, Math.round(words / 220)),
    });
  }
  const seen = new Set();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`Two posts share the slug "${p.slug}"`);
    seen.add(p.slug);
  }
  return posts.sort((a, b) => (b.date.localeCompare(a.date)) || a.title.localeCompare(b.title));
}

const dateLabel = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ''));

const addGenerator = (html) => html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n${GENERATOR}`);

const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

function card(p) {
  return `      <a class="card" href="${p.path}"><div class="tag">${esc(p.category)}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="meta"><span>${esc(dateLabel(p.date))}</span><span>${p.readTime} min read</span></div><span class="textlink bottom">Read →</span></a>`;
}

function build() {
  const posts = loadPosts();
  const postTpl = fs.readFileSync(path.join(ROOT, 'scripts', 'templates', 'post.html'), 'utf8');
  const indexTpl = fs.readFileSync(path.join(ROOT, 'scripts', 'templates', 'index.html'), 'utf8');
  fs.mkdirSync(OUT, { recursive: true });

  const written = new Set();
  for (const p of posts) {
    const others = posts.filter((o) => o.slug !== p.slug).slice(0, 3);
    const more = others.length
      ? `  <section aria-labelledby="more-heading">\n    <div class="sectionhead"><h2 id="more-heading">More insights</h2></div>\n    <div class="grid g3">\n${others.map(card).join('\n')}\n    </div>\n  </section>`
      : '';
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      articleSection: p.category,
      url: p.url,
      mainEntityOfPage: p.url,
      author: { '@type': 'Organization', name: 'MarketCentaur', url: `${SITE}/` },
      publisher: { '@id': `${SITE}/#organization` },
      inLanguage: 'en-US',
    };
    const html = addGenerator(fill(postTpl, {
      title: esc(p.title),
      description: esc(p.description),
      url: p.url,
      date: p.date,
      dateLabel: esc(dateLabel(p.date)),
      category: esc(p.category),
      author: esc(p.author),
      readTime: String(p.readTime),
      jsonld: jsonLd(ld),
      body: p.html.trim().split('\n').map((l) => (l ? `      ${l}` : l)).join('\n'),
      more,
    }));
    const file = `${p.slug}.html`;
    fs.writeFileSync(path.join(OUT, file), html);
    written.add(file);
  }

  // Remove pages this script generated earlier whose Markdown source is gone (or is now a draft).
  for (const f of fs.readdirSync(OUT)) {
    if (f === 'index.html' || !f.endsWith('.html') || written.has(f)) continue;
    const content = fs.readFileSync(path.join(OUT, f), 'utf8');
    if (content.includes(GENERATOR)) { fs.unlinkSync(path.join(OUT, f)); console.log(`Removed ${f}`); }
  }

  const indexLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MarketCentaur Insights',
    url: `${SITE}/insights/`,
    publisher: { '@id': `${SITE}/#organization` },
    blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: p.url, datePublished: p.date })),
  };
  const cards = posts.length
    ? posts.map(card).join('\n')
    : '      <p class="muted">New guides are on the way.</p>';
  fs.writeFileSync(path.join(OUT, 'index.html'), addGenerator(fill(indexTpl, { cards, jsonld: jsonLd(indexLd) })));

  updateBetweenMarkers(path.join(ROOT, 'sitemap.xml'), '<!-- insights:start -->', '<!-- insights:end -->',
    [`  <url><loc>${SITE}/insights/</loc><lastmod>${posts[0]?.date || today}</lastmod></url>`,
      ...posts.map((p) => `  <url><loc>${p.url}</loc><lastmod>${p.updated || p.date}</lastmod></url>`)].join('\n'),
    '</urlset>');

  updateBetweenMarkers(path.join(ROOT, 'llms.txt'), '<!-- insights:start -->', '<!-- insights:end -->',
    ['## Insights', `- [Insights hub](${SITE}/insights/): Practical guides on competitive intelligence, B2B growth, AI and automation.`,
      ...posts.map((p) => `- [${p.title}](${p.url}): ${p.description}`)].join('\n'),
    null);

  console.log(`Built ${posts.length} post(s) and the Insights index.`);
}

// Replaces the text between two marker lines. If the markers are missing, they are added
// before `insertBefore` (or at the end of the file when insertBefore is null).
function updateBetweenMarkers(file, start, end, inner, insertBefore) {
  let text = fs.readFileSync(file, 'utf8');
  const block = `${start}\n${inner}\n${end}`;
  const s = text.indexOf(start);
  const e = text.indexOf(end);
  if (s !== -1 && e !== -1 && e > s) {
    text = text.slice(0, s) + block + text.slice(e + end.length);
  } else if (insertBefore && text.includes(insertBefore)) {
    const i = text.lastIndexOf(insertBefore);
    text = `${text.slice(0, i)}  ${block}\n${text.slice(i)}`;
  } else {
    text = `${text.replace(/\s*$/, '')}\n\n${block}\n`;
  }
  fs.writeFileSync(file, text);
}

build();
