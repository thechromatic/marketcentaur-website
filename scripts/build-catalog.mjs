#!/usr/bin/env node
// Builds the 17 practice pages, the practices hub, new industry pages and the catalog
// blocks on existing pages from content/catalog/*.json.
//
//   node scripts/build-catalog.mjs
//
// Edit the JSON, run the script (or push: the Build Insights workflow runs it), commit the
// output. Generated pages carry GENERATOR so the script can tell them from hand-built pages.
// House rule: the catalog never contains prices. The script refuses to build if it finds one.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GA4_BLOCK } from './seo/ga4.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://marketcentaur.com';
const GENERATOR = '<meta name="generator" content="marketcentaur-catalog">';
const today = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const practices = [...read('content/catalog/practices-1.json'), ...read('content/catalog/practices-2.json')];
const { bundles, industries } = read('content/catalog/extras.json');

const GROUPS = ['Strategy & AI', 'Growth & Sales', 'Operations & Data', 'Tech, Risk & People'];
const TYPES = [
  ['diagnose', 'Diagnose', 'Find where AI fits', 'A short, fixed-scope review that ends with a written recommendation.'],
  ['build', 'Build', 'Ship a working change', 'A scoped project that puts something real into use, human-reviewed and handed over.'],
  ['run', 'Run', 'We keep it running', 'An ongoing plan that monitors, maintains and improves what we built, or runs a capability for you.'],
];

// ---------- validation ----------
const offers = new Map();
for (const p of practices) {
  if (!GROUPS.includes(p.group)) throw new Error(`${p.slug}: unknown group "${p.group}"`);
  for (const o of p.offers) {
    if (offers.has(o.id)) throw new Error(`Duplicate offer id ${o.id}`);
    if (!TYPES.some((t) => t[0] === o.type)) throw new Error(`${o.id}: unknown type ${o.type}`);
    offers.set(o.id, { ...o, practice: p });
  }
}
const slugs = new Set(practices.map((p) => p.slug));
for (const p of practices) for (const r of p.related) if (!slugs.has(r)) throw new Error(`${p.slug}: unknown related practice ${r}`);
for (const x of [...bundles, ...industries]) for (const id of x.offerIds) if (!offers.has(id)) throw new Error(`${x.slug || x.id}: unknown offer ${id}`);
const priceCheck = JSON.stringify([practices, bundles, industries]);
const priceHit = priceCheck.match(/[$€£₹]\s?\d|\bUSD\b|\bINR\b|\d+\s?% off/);
if (priceHit) throw new Error(`Catalog contains a price ("${priceHit[0]}"). Prices are never published.`);

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (o) => JSON.stringify(o, null, 1).replace(/</g, '\\u003c');
const practiceUrl = (p) => `/practices/${p.slug}.html`;
const offerUrl = (o) => `${practiceUrl(o.practice)}#${o.id}`;
const quoteUrl = (id) => `/contact.html?service=${encodeURIComponent(id)}`;
const typeLabel = (t) => TYPES.find((x) => x[0] === t)[1];
const pageTitle = (href) => {
  const f = path.join(ROOT, href.replace(/^\//, '').replace(/#.*$/, ''));
  if (!fs.existsSync(f)) throw new Error(`Specialist link points to a missing page: ${href}`);
  const t = (fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || href;
  return t.replace(/\s*\|\s*MarketCentaur.*$/, '').replace(/&amp;/g, '&');
};

const NAV = (current) => `<div class="wrap">
  <nav class="nav" aria-label="Main navigation">
    <a class="logo" href="/" aria-label="MarketCentaur home"><img src="/assets/marketcentaur-logo-header.png" alt="MarketCentaur"></a>
    <div class="navlinks"><a href="/services.html"${current === 'services' ? ' aria-current="page"' : ''}>Services</a><a href="/industries.html"${current === 'industries' ? ' aria-current="page"' : ''}>Industries</a><a href="/sample-intelligence-brief.html">Sample brief</a><a href="/labs.html">Labs</a><a href="/insights/">Insights</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></div>
    <a class="btn primary" href="/ai-readiness-score.html">Free AI Readiness Score</a>
  </nav>
</div>`;

const FOOTER = `<div class="wrap">
  <footer class="footer">
    <div><strong>MarketCentaur</strong><br>AI-led digital transformation · For any business, anywhere<br><a href="mailto:hello@marketcentaur.com">hello@marketcentaur.com</a><p class="footnote">AI-assisted work is reviewed by a person before it reaches you. Scope, deliverables and timelines are agreed in writing; business outcomes such as leads, rankings or AI mentions depend on many factors and are not guaranteed.</p></div>
    <div><a href="/practices/">All 17 practices</a> · <a href="/services.html">Services</a> · <a href="/industries.html">Industries</a> · <a href="/recurring-services.html">Ongoing support</a> · <a href="/labs.html">Labs</a> · <a href="/insights/">Insights</a> · <a href="/partners.html">Partners</a><br><a href="/ai-readiness-score.html">Free AI Readiness Score</a> · <a href="/ai-visibility-check.html">Free AI visibility check</a> · <a href="/website-enquiry-readiness.html">Free website check</a> · <a href="/growth-check.html">Growth checks</a><br><a href="/about.html">About</a> · <a href="/how-it-works.html">How we engage</a> · <a href="/faq.html">FAQs</a> · <a href="/contact.html">Contact</a> · <a href="/privacy-policy.html">Privacy</a> · <a href="/terms-of-service.html">Terms</a><br><a href="https://www.linkedin.com/company/marketcentaur" rel="noopener" target="_blank">LinkedIn</a> · <a href="https://www.instagram.com/marketcentaur" rel="noopener" target="_blank">Instagram</a> · <a href="https://x.com/marketcentaur" rel="noopener" target="_blank">X</a></div>
  </footer>
</div>
<script src="/assets/language-selector.js" defer></script>
<script src="/assets/services-dropdown.js" defer></script>
<script src="/assets/forms.js" defer></script>
<script src="/assets/assistant.js" defer></script>`;

function page({ url, title, description, ogName, ogAlt, ld, nav, body }) {
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
${GA4_BLOCK}
${GENERATOR}
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#111827">
<link rel="canonical" href="${SITE}${url}">
<link rel="icon" type="image/png" href="/assets/marketcentaur-mc-option-4-favicon.png">
<link rel="alternate" type="application/rss+xml" title="MarketCentaur Insights" href="/insights/feed.xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MarketCentaur">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${SITE}/assets/og/${ogName}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/og/${ogName}.png">
<script type="application/ld+json">
${jsonLd(ld)}
</script>
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/assets/services-dropdown.css">
<link rel="stylesheet" href="/assets/catalog.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${NAV(nav)}

<main id="main"><div class="wrap">
${body}
</div></main>

${FOOTER}
</body>
</html>
`;
}

const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${item}` })),
});
const faqLd = (faqs) => ({ '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const faqHtml = (faqs) => `  <section id="faq" aria-labelledby="faq-heading">
    <div class="sectionhead"><div class="eyebrow">Questions</div><h2 id="faq-heading">Frequently asked questions</h2></div>
    <div class="faqlist">
${faqs.map((f) => `      <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')}
    </div>
  </section>`;
const ctaHtml = (heading, text, href, label) => `  <section aria-labelledby="next-step-heading" style="border-top:0;padding-top:10px">
    <div class="cta">
      <div><h2 id="next-step-heading">${esc(heading)}</h2><p>${esc(text)}</p></div>
      <a class="btn primary" href="${href}">${esc(label)}</a>
    </div>
  </section>`;

function offerCard(o) {
  const cta = o.type === 'run' ? 'Talk to us' : 'Request a quote';
  return `      <article class="card mc-offer" id="${o.id}"><div class="tag">${typeLabel(o.type)} · ${esc(o.timeline)}</div><h3>${esc(o.name)}</h3><p>${esc(o.summary)}</p><ul class="mc-includes">${o.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul><a class="textlink bottom" href="${quoteUrl(o.id)}">${cta} →</a></article>`;
}

// ---------- practice pages ----------
const written = new Set();
function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.add(rel);
}

for (const p of practices) {
  const url = practiceUrl(p);
  const body = [`  <header class="hero">
    <div class="eyebrow">${esc(p.group)} · Practice ${practices.indexOf(p) + 1} of ${practices.length}</div>
    <h1>${esc(p.headline)}</h1>
    <p class="lead">${esc(p.problem)}</p>
    <div class="actions"><a class="btn primary" href="${quoteUrl(p.slug)}">Request a quote</a><a class="textlink" href="/ai-readiness-score.html">Free AI Readiness Score →</a></div>
    ${p.note ? `<p class="muted small" style="margin-top:14px">${esc(p.note)}</p>` : ''}
  </header>

  <section aria-labelledby="who-heading">
    <div class="problem">
      <div><div class="eyebrow">${esc(p.name)}</div><h2 id="who-heading" class="h2">Who this helps</h2><p>${esc(p.short)} Every engagement is scoped to you and quoted in writing before work starts.</p></div>
      <ul class="checklist" aria-label="Who this helps">${p.whoFor.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
    </div>
  </section>`];

  for (const [type, label, tagline, intro] of TYPES) {
    const list = p.offers.filter((o) => o.type === type);
    if (!list.length) continue;
    body.push(`  <section id="${type}" aria-labelledby="${type}-heading">
    <div class="sectionhead"><div class="eyebrow">${label}</div><h2 id="${type}-heading">${tagline}</h2><p>${intro}</p></div>
    <div class="grid g3">
${list.map(offerCard).join('\n')}
    </div>
  </section>`);
  }

  body.push(`  <section id="more" aria-labelledby="more-heading">
    <div class="sectionhead"><div class="eyebrow">Also useful</div><h2 id="more-heading">Related services and practices</h2></div>
    <div class="pills">${p.specialist.map((h) => `<a href="${h}">${esc(pageTitle(h))}</a>`).join('')}${p.related.map((r) => { const rp = practices.find((x) => x.slug === r); return `<a href="${practiceUrl(rp)}">${esc(rp.name)}</a>`; }).join('')}<a href="/practices/">All 17 practices</a></div>
  </section>`);
  body.push(faqHtml(p.faqs));
  body.push(ctaHtml('Tell us what you want to change.', 'We reply within one business day with a suggested starting point and a written quote. No obligation.', quoteUrl(p.slug), 'Request a quote'));

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE}${url}#service`,
        name: p.name,
        description: p.short,
        url: `${SITE}${url}`,
        provider: { '@id': `${SITE}/#organization` },
        areaServed: 'Worldwide',
        serviceType: p.name,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${p.name} services`,
          itemListElement: p.offers.map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.name, description: o.summary, url: `${SITE}${url}#${o.id}` } })),
        },
      },
      faqLd(p.faqs),
      crumbs([['Home', '/'], ['Practices', '/practices/'], [p.name, url]]),
    ],
  };
  write(`practices/${p.slug}.html`, page({
    url, title: `${p.name} | MarketCentaur`, description: p.short, ogName: `practices-${p.slug}`, ogAlt: p.headline, ld, nav: 'services', body: body.join('\n\n'),
  }));
}

// ---------- practices hub ----------
const bundleHtml = () => `    <div class="grid g3">
${bundles.map((b) => `      <article class="card" id="${b.id}"><div class="tag">Bundle · ${esc(b.timeline)}</div><h3>${esc(b.name)}</h3><p>${esc(b.tagline)}</p><ul class="mc-includes">${b.offerIds.map((id) => { const o = offers.get(id); return `<li><a href="${offerUrl(o)}">${esc(o.name)}</a></li>`; }).join('')}</ul><a class="textlink bottom" href="${quoteUrl(b.id)}">Request a quote →</a></article>`).join('\n')}
    </div>`;

{
  const body = [`  <header class="hero">
    <div class="eyebrow">Practices</div>
    <h1>17 practices. ${offers.size} ways to put AI to work.</h1>
    <p class="lead">Strategy, automation, agents, customer experience, marketing, sales, events, data, documents, web, IT, security, people, governance and operations. Every engagement follows the same Centaur Method: a certified strategist scopes and reviews, and AI researches, builds and tests. For any business, team or organisation, of any size, anywhere.</p>
    <div class="actions"><a class="btn primary" href="/ai-readiness-score.html">Find your starting point</a><a class="textlink" href="/how-it-works.html#engage">How we engage →</a></div>
  </header>`];
  for (const g of GROUPS) {
    const list = practices.filter((p) => p.group === g);
    const id = g.toLowerCase().replace(/[^a-z]+/g, '-');
    body.push(`  <section id="${id}" aria-labelledby="${id}-heading">
    <div class="sectionhead"><div class="eyebrow">${list.length} practices</div><h2 id="${id}-heading">${esc(g)}</h2></div>
    <div class="grid g3">
${list.map((p) => `      <article class="card"><div class="tag">${p.offers.length} services</div><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p><a class="textlink bottom" href="${practiceUrl(p)}">Explore →</a></article>`).join('\n')}
    </div>
  </section>`);
  }
  body.push(`  <section id="bundles" aria-labelledby="bundles-heading">
    <div class="sectionhead"><div class="eyebrow">Bundles</div><h2 id="bundles-heading">Popular combinations, quoted as one engagement</h2></div>
${bundleHtml()}
  </section>`);
  body.push(ctaHtml('Not sure which practice fits?', 'Take the 2-minute AI Readiness Score, ask the assistant in the corner of any page, or tell us what you need.', '/contact.html?service=not-sure', 'Talk to us'));
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: 'MarketCentaur practices', url: `${SITE}/practices/`, isPartOf: { '@id': `${SITE}/#website` }, hasPart: practices.map((p) => ({ '@type': 'Service', name: p.name, url: `${SITE}${practiceUrl(p)}` })) },
      crumbs([['Home', '/'], ['Practices', '/practices/']]),
    ],
  };
  write('practices/index.html', page({
    url: '/practices/', title: `17 AI Transformation Practices, ${offers.size} Services | MarketCentaur`,
    description: `MarketCentaur's 17 practices and ${offers.size} services: AI strategy, automation, agents, growth, sales, data, IT, security, governance and operations.`,
    ogName: 'practices', ogAlt: `17 practices. ${offers.size} ways to put AI to work.`, ld, nav: 'services', body: body.join('\n\n'),
  }));
}

// ---------- new industry pages ----------
for (const ind of industries) {
  const url = `/industries/${ind.slug}.html`;
  const list = ind.offerIds.map((id) => offers.get(id));
  const body = [`  <header class="hero">
    <div class="eyebrow">${esc(ind.name)}</div>
    <h1>${esc(ind.headline)}</h1>
    <p class="lead">${esc(ind.lead)}</p>
    <div class="actions"><a class="btn primary" href="${quoteUrl(ind.slug)}">Discuss your goals</a><a class="textlink" href="/ai-readiness-score.html">Free AI Readiness Score →</a></div>
  </header>

  <section aria-labelledby="pain-heading">
    <div class="problem">
      <div><div class="eyebrow">Where time and growth leak</div><h2 id="pain-heading" class="h2">Common challenges in ${esc(ind.name.toLowerCase())}</h2><p>Every organisation is different, but these come up again and again. Each one has a practical fix.</p></div>
      <ul class="checklist" aria-label="Common challenges">${ind.pains.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
  </section>

  <section id="start" aria-labelledby="start-heading">
    <div class="sectionhead"><div class="eyebrow">Where to start</div><h2 id="start-heading">Five practical starting points</h2><p>Scoped to you and quoted in writing before we begin.</p></div>
    <div class="grid g3">
${list.map((o, i) => `      <article class="card${i === 0 ? ' featured' : ''}"><div class="tag">${typeLabel(o.type)} · ${esc(o.practice.name)}</div><h3>${esc(o.name)}</h3><p>${esc(o.summary)}</p><a class="textlink bottom" href="${offerUrl(o)}">See what's included →</a></article>`).join('\n')}
    </div>
  </section>

  <section id="more" aria-labelledby="more-heading">
    <div class="sectionhead"><div class="eyebrow">Also useful</div><h2 id="more-heading">Related practices</h2></div>
    <div class="pills">${[...new Set(list.map((o) => o.practice))].map((p) => `<a href="${practiceUrl(p)}">${esc(p.name)}</a>`).join('')}<a href="/practices/">All 17 practices</a><a href="/industries.html">All industries</a></div>
  </section>`, faqHtml(ind.faqs), ctaHtml('Have a sector-specific challenge?', "Tell us what you're trying to improve. We reply within one business day with a suggested starting point.", quoteUrl(ind.slug), 'Talk to us')];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: `${ind.name} | MarketCentaur`, url: `${SITE}${url}`, about: ind.name, isPartOf: { '@id': `${SITE}/#website` }, publisher: { '@id': `${SITE}/#organization` } },
      faqLd(ind.faqs),
      crumbs([['Home', '/'], ['Industries', '/industries.html'], [ind.name, url]]),
    ],
  };
  write(`industries/${ind.slug}.html`, page({
    url, title: `${ind.titleName || ind.name}: AI & Growth | MarketCentaur`, description: `${ind.headline} AI, automation and growth support for ${(ind.titleName || ind.name).toLowerCase()}.`, ogName: `industries-${ind.slug}`, ogAlt: ind.headline, ld, nav: 'industries', body: body.join('\n\n'),
  }));
}

// Remove generated pages whose source entry is gone.
for (const dir of ['practices', 'industries']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    const rel = `${dir}/${f}`;
    if (!f.endsWith('.html') || written.has(rel)) continue;
    if (fs.readFileSync(path.join(ROOT, rel), 'utf8').includes(GENERATOR)) { fs.unlinkSync(path.join(ROOT, rel)); console.log(`Removed ${rel}`); }
  }
}

// ---------- assistant data ----------
const existingIndustries = [...fs.readFileSync(path.join(ROOT, 'industries.html'), 'utf8').matchAll(/<h3>([^<]+)<\/h3><p>[^<]*<\/p><a class="textlink bottom" href="(\/industries\/[^"]+)"/g)]
  .map((m) => ({ name: m[1].replace(/&amp;/g, '&'), url: m[2] }));
fs.writeFileSync(path.join(ROOT, 'assets', 'catalog.json'), JSON.stringify({
  practices: practices.map((p) => ({ slug: p.slug, name: p.name, group: p.group, short: p.short, url: practiceUrl(p),
    offers: p.offers.map((o) => ({ id: o.id, name: o.name, type: o.type, summary: o.summary, url: offerUrl({ ...o, practice: p }) })) })),
  industries: [...existingIndustries, ...industries.map((i) => ({ name: i.name, url: `/industries/${i.slug}.html` }))]
    .filter((v, i, a) => a.findIndex((x) => x.url === v.url) === i),
  bundles: bundles.map((b) => ({ id: b.id, name: b.name, tagline: b.tagline, url: `/practices/#${b.id}` })),
}));

// ---------- blocks on hand-built pages ----------
function updateBetweenMarkers(rel, name, inner, insertBefore) {
  const file = path.join(ROOT, rel);
  let text = fs.readFileSync(file, 'utf8');
  const start = `<!-- catalog:${name}:start -->`;
  const end = `<!-- catalog:${name}:end -->`;
  const block = `${start}\n${inner}\n${end}`;
  const s = text.indexOf(start);
  const e = text.indexOf(end);
  if (s !== -1 && e > s) text = text.slice(0, s) + block + text.slice(e + end.length);
  else if (insertBefore && text.includes(insertBefore)) { const i = text.indexOf(insertBefore); text = `${text.slice(0, i)}${block}\n${text.slice(i)}`; }
  else throw new Error(`${rel}: can't place the ${name} block (anchor not found)`);
  fs.writeFileSync(file, text);
}
function ensureHead(rel, tag) {
  const file = path.join(ROOT, rel);
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes(tag)) { text = text.replace('</head>', `${tag}\n</head>`); fs.writeFileSync(file, text); }
}

const practiceGrid = `<div class="mc-grid">
${practices.map((p) => `<a class="mc-tile" href="${practiceUrl(p)}"><span class="mc-tile-group">${esc(p.group)}</span><strong>${esc(p.name)}</strong><span>${esc(p.short)}</span></a>`).join('\n')}
</div>`;

const homeBlock = `<section id="practices" aria-labelledby="practices-heading" class="mc-section">
<div class="eyebrow">17 practices · ${offers.size} services</div>
<h2 id="practices-heading">Whatever you want to change, there's a practice for it.</h2>
<p class="mc-intro">The sprints above are the quickest way in. Behind them sit 17 practices covering strategy, automation, agents, customer experience, growth, sales, events, data, documents, web, IT, security, people, governance and operations, for any business, of any size, anywhere.</p>
${practiceGrid}
<p class="mc-links"><a href="/practices/">See all ${offers.size} services →</a> <a href="/ai-readiness-score.html">Get your free AI Readiness Score →</a></p>
</section>`;

const servicesBlock = `<section id="practices" aria-labelledby="practices-heading" class="mc-section">
<div class="eyebrow">All practices</div>
<h2 id="practices-heading">17 practices, ${offers.size} services, one way of working.</h2>
<p class="mc-intro">Every practice offers three kinds of engagement: Diagnose (find where AI fits), Build (ship a working change) and Run (we keep it running). Every engagement is scoped and quoted in writing.</p>
${practiceGrid}
<p class="mc-links"><a href="/practices/#bundles">See the bundles →</a> <a href="/how-it-works.html#engage">How we engage →</a></p>
</section>`;

const engageBlock = `<section id="engage" aria-labelledby="engage-heading" class="mc-section">
<h2 id="engage-heading">How we engage: Diagnose, Build, Run</h2>
<p class="mc-intro">You can start anywhere. Every engagement is scoped to you and quoted in writing within one business day of your request.</p>
<div class="mc-grid mc-grid-3">
${TYPES.map(([t, label, tagline, intro]) => `<div class="mc-tile"><span class="mc-tile-group">${label}</span><strong>${tagline}</strong><span>${intro}</span></div>`).join('\n')}
</div>
<h3 class="mc-sub">Bundles, quoted as one engagement</h3>
<div class="mc-grid mc-grid-3">
${bundles.map((b) => `<a class="mc-tile" href="/practices/#${b.id}"><span class="mc-tile-group">${esc(b.timeline)}</span><strong>${esc(b.name)}</strong><span>${esc(b.tagline)}</span></a>`).join('\n')}
</div>
<h3 class="mc-sub">Founding client terms</h3>
<p class="mc-intro">Our first clients get founding client terms in exchange for honest feedback and, only with written approval, a published case study. <a href="/contact.html?service=founding-client">Ask about founding client terms →</a></p>
</section>`;

const industryCards = industries.map((i) => `      <article class="card"><div class="tag">${esc(i.name)}</div><h3>${esc(i.name)}</h3><p>${esc(i.headline)}</p><a class="textlink bottom" href="/industries/${i.slug}.html">Explore →</a></article>`).join('\n');

updateBetweenMarkers('index.html', 'home', homeBlock, '<section id="ai-services"');
updateBetweenMarkers('services.html', 'services', servicesBlock, '<section id="sprints"');
updateBetweenMarkers('how-it-works.html', 'engage', engageBlock, '<section><div class="cta"><div><h2>Start with the decis');
updateBetweenMarkers('industries.html', 'industries', industryCards, '    </div>\n  </section>\n\n  <section id="across"');
for (const rel of ['index.html', 'services.html', 'how-it-works.html']) ensureHead(rel, '<link rel="stylesheet" href="/assets/catalog.css">');

const sitemapUrls = [`  <url><loc>${SITE}/practices/</loc><lastmod>${today}</lastmod></url>`,
  ...practices.map((p) => `  <url><loc>${SITE}${practiceUrl(p)}</loc><lastmod>${today}</lastmod></url>`),
  ...industries.map((i) => `  <url><loc>${SITE}/industries/${i.slug}.html</loc><lastmod>${today}</lastmod></url>`),
  `  <url><loc>${SITE}/ai-readiness-score.html</loc><lastmod>${today}</lastmod></url>`];
// Keep lastmod stable when nothing changed, so rebuilding doesn't churn the sitemap.
{
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const old = new Map([...sm.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
  for (let i = 0; i < sitemapUrls.length; i++) {
    const loc = sitemapUrls[i].match(/<loc>([^<]+)/)[1];
    const f = loc === `${SITE}/practices/` ? 'practices/index.html' : loc.replace(`${SITE}/`, '');
    if (old.has(loc) && fs.existsSync(path.join(ROOT, f))) sitemapUrls[i] = sitemapUrls[i].replace(today, old.get(loc));
  }
}
const smFile = path.join(ROOT, 'sitemap.xml');
{
  let sm = fs.readFileSync(smFile, 'utf8');
  const start = '<!-- catalog:start -->', end = '<!-- catalog:end -->';
  const block = `  ${start}\n${sitemapUrls.join('\n')}\n  ${end}`;
  const s = sm.indexOf(`  ${start}`), e = sm.indexOf(end);
  sm = s !== -1 && e > s ? sm.slice(0, s) + block + sm.slice(e + end.length) : sm.replace('</urlset>', `${block}\n</urlset>`);
  fs.writeFileSync(smFile, sm);
}

{
  const f = path.join(ROOT, 'llms.txt');
  let t = fs.readFileSync(f, 'utf8');
  const start = '<!-- catalog:start -->', end = '<!-- catalog:end -->';
  const inner = ['## Practices', `MarketCentaur offers ${offers.size} services across 17 practices. Every engagement is scoped and quoted on request; prices are not published.`,
    `- [All practices and bundles](${SITE}/practices/)`,
    ...practices.map((p) => `- [${p.name}](${SITE}${practiceUrl(p)}): ${p.short} Services: ${p.offers.map((o) => o.name).join('; ')}.`),
    `- [AI Readiness Score](${SITE}/ai-readiness-score.html): free 10-question self-assessment across strategy, data, processes, people and governance.`,
    '', '## More industries', ...industries.map((i) => `- [${i.name}](${SITE}/industries/${i.slug}.html): ${i.headline}`)].join('\n');
  const block = `${start}\n${inner}\n${end}`;
  const s = t.indexOf(start), e = t.indexOf(end);
  t = s !== -1 && e > s ? t.slice(0, s) + block + t.slice(e + end.length) : t.replace('<!-- insights:start -->', `${block}\n\n<!-- insights:start -->`);
  if (!t.includes(start)) t = `${t.replace(/\s*$/, '')}\n\n${block}\n`;
  fs.writeFileSync(f, t);
}

console.log(`Built ${practices.length} practice pages (${offers.size} services), the practices hub and ${industries.length} industry pages.`);
