#!/usr/bin/env node
// Builds MarketCentaur Studio (done-for-you AI services for individuals and families):
//   /studio            hub page          -> studio.html
//   /studio/<offer-id> one page per offer -> studio/<offer-id>.html
// from content/studio/offers.json. Also refreshes the Studio entries in sitemap.xml and llms.txt.
//
//   node scripts/build-studio.mjs
//
// Pages never show prices. Each offer page has a brief form; forms.js sends it by email, to the
// leads workbook, and to the Studio quotes scenario in Make.com, which emails a quote with
// payment links (see content/studio/README.md).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GA4_BLOCK } from './seo/ga4.mjs';
import { renderNav } from './nav/nav.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://marketcentaur.com';
const { offers } = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/studio/offers.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);

// Guard: no prices on Studio pages.
const PRICE = /(₹|\$|€|£|\bINR\b|\bUSD\b|\bRs\.?\s?\d|\d+\s?%\s?off)/i;
for (const o of offers) {
  const text = JSON.stringify(o);
  if (PRICE.test(text)) { console.error(`build-studio: price-like text in offer "${o.id}"`); process.exit(1); }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lc = (s) => s.toLowerCase().replace(/\bai\b/g, 'AI');
const jsonld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore', 'Saudi Arabia', 'Germany', 'New Zealand', 'Other'];

const FOOTER = `<div class="wrap">
  <footer class="footer">
    <div><strong>MarketCentaur Studio</strong><br>Done-for-you AI services for individuals and families, from <a href="/">MarketCentaur</a><br><a href="mailto:hello@marketcentaur.com">hello@marketcentaur.com</a><p class="footnote">AI-assisted work is reviewed by a person before it reaches you. Each order is quoted by email before you pay. Results such as interview calls, views or matches depend on many factors and are not guaranteed.</p></div>
    <div><a href="/studio">Studio</a> · ${offers.map((o) => `<a href="/studio/${o.id}">${esc(o.short)}</a>`).join(' · ')}<br><a href="/services">Services for businesses</a> · <a href="/about">About</a> · <a href="/faq">FAQs</a> · <a href="/contact">Contact</a> · <a href="/privacy-policy">Privacy</a> · <a href="/terms-of-service">Terms</a><br><a href="https://www.linkedin.com/company/marketcentaur" rel="noopener" target="_blank">LinkedIn</a> · <a href="https://www.instagram.com/marketcentaur" rel="noopener" target="_blank">Instagram</a> · <a href="https://x.com/marketcentaur" rel="noopener" target="_blank">X</a></div>
  </footer>
</div>`;

const STYLE = `<style>
.leadform select{width:100%;padding:12px 14px;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--text);font:inherit;font-size:14px}
.leadform label.small{font-weight:700;margin-top:6px}
.leadform .check{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:var(--muted);line-height:1.5}.leadform .check input{width:auto;margin-top:3px}
.leadform fieldset{border:0;padding:0;margin:6px 0 0;display:grid;gap:8px}.leadform legend{font-size:13px;font-weight:700;margin-bottom:6px}
.leadform .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.brief{background:var(--surface2);border:1px solid var(--line);border-radius:18px;padding:30px;display:grid;grid-template-columns:.9fr 1.1fr;gap:30px;align-items:start}
.brief p{color:var(--muted)}
.sent{display:none;padding:18px 20px;border:1px solid var(--accent);border-radius:12px;font-size:15px;line-height:1.6}
.pay{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 0}.pay span{font-size:13px;padding:7px 12px;border:1px solid var(--line);border-radius:99px;color:var(--muted)}
@media (max-width:820px){.brief{grid-template-columns:1fr;padding:22px}.leadform .row2{grid-template-columns:1fr}}
</style>`;

function head({ title, description, url, ogName, ld }) {
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
${GA4_BLOCK}
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#020C24">
<link rel="canonical" href="${SITE}${url}">
<link rel="icon" type="image/png" href="/assets/marketcentaur-mc-option-4-favicon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MarketCentaur Studio">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${SITE}/assets/og/${ogName}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/og/${ogName}.png">
<link rel="stylesheet" href="/assets/site.css">
<link rel="preload" href="/assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site-nav.css">
${STYLE}
${jsonld(ld)}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<!-- mc-nav: generated by scripts/nav/apply-nav.mjs -->
<div class="mc-header"><div class="wrap">${renderNav(url)}</div></div>
<!-- /mc-nav -->
`;
}

const TAIL = (extra = '') => `${FOOTER}
<script src="/assets/language-selector.js" defer></script>
<script src="/assets/site-nav.js" defer></script>
<script src="/assets/studio.js" defer></script>
<script src="/assets/forms.js" defer></script>
${extra}</body>
</html>
`;

const crumbs = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + url })) });
const faqLd = (faq) => ({ '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const faqHtml = (faq) => `<div class="faqlist">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;

const PAY_CHIPS = '<div class="pay" aria-label="Payment options"><span>UPI</span><span>Cards</span><span>Netbanking</span><span>Razorpay</span><span>Stripe</span><span>PayPal</span><span>Bank transfer</span></div>';

function field(o, f) {
  const id = `f-${o.id}-${f.name}`;
  const req = f.required ? ' required' : '';
  const star = f.required ? ' *' : '';
  const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
  const lab = `<label class="small" for="${id}">${esc(f.label)}${star}</label>`;
  switch (f.type) {
    case 'textarea': return `${lab}<textarea id="${id}" name="${f.name}" rows="4" data-label="${esc(f.label)}"${ph}${req}></textarea>`;
    case 'select': return `${lab}<select id="${id}" name="${f.name}" data-label="${esc(f.label)}"${req}><option value="">Choose…</option>${f.options.map((x) => `<option>${esc(x)}</option>`).join('')}</select>`;
    case 'checkboxes': return `<fieldset data-label="${esc(f.label)}"${f.required ? ' data-required' : ''}><legend>${esc(f.label)}${star}</legend>${f.options.map((x) => `<label class="check"><input type="checkbox" name="${f.name}" value="${esc(x)}"> ${esc(x)}</label>`).join('')}</fieldset>`;
    default: return `${lab}<input id="${id}" type="${f.type}" name="${f.name}" data-label="${esc(f.label)}"${ph}${req}>`;
  }
}

function briefForm(o) {
  return `<form class="leadform" data-mc-form="studio-${o.id}" data-mc-studio data-mc-inline action="https://formsubmit.co/hello@marketcentaur.com" method="POST">
        <input type="hidden" name="_subject" value="Studio brief: ${esc(o.name)}">
        <input type="hidden" name="request_type" value="Studio order">
        <input type="hidden" name="offer_id" value="${o.id}">
        <input type="hidden" name="offer" value="${esc(o.name)}">
        <input type="hidden" name="service" value="Studio: ${esc(o.name)}">
        <input type="hidden" name="service_category" value="Studio">
        <input type="hidden" name="order_ref" value="">
        <input type="hidden" name="message" value="">
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
        <div class="row2"><div><label class="small" for="s-name-${o.id}">Your name *</label><input id="s-name-${o.id}" type="text" name="name" required autocomplete="name"></div>
        <div><label class="small" for="s-email-${o.id}">Email *</label><input id="s-email-${o.id}" type="email" name="email" required autocomplete="email" placeholder="Your quote is sent here"></div></div>
        <div class="row2"><div><label class="small" for="s-wa-${o.id}">WhatsApp or phone (optional)</label><input id="s-wa-${o.id}" type="tel" name="whatsapp" autocomplete="tel" placeholder="With country code"></div>
        <div><label class="small" for="s-country-${o.id}">Country *</label><select id="s-country-${o.id}" name="country" required><option value="">Choose…</option>${COUNTRIES.map((c) => `<option>${c}</option>`).join('')}</select></div></div>
        ${o.fields.map((f) => field(o, f)).join('\n        ')}
        <label class="small" for="s-notes-${o.id}">Anything else? (optional)</label>
        <textarea id="s-notes-${o.id}" name="notes" rows="3" data-label="Other notes"></textarea>
        <label class="check"><input type="checkbox" name="consent" value="yes" required><span>I have the right to share the photos, documents and personal details in this brief, and I agree to the <a class="textlink" href="/terms-of-service">terms</a> and <a class="textlink" href="/privacy-policy">privacy policy</a>. *</span></label>
        <button class="btn primary" type="submit">Send brief and get my quote</button>
        <p class="fine">No payment now. We email your quote with secure payment options, usually within one working day.</p>
      </form>
      <div class="sent" role="status"><strong>Thank you, your brief is in.</strong><br>Your order ref is <strong class="ref"></strong>. We'll email your quote with payment options, usually within one working day. Reply to that email if you'd like to change anything.</div>`;
}

function offerPage(o) {
  const url = `/studio/${o.id}`;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', name: o.name, description: o.description, url: SITE + url, serviceType: o.name, audience: { '@type': 'PeopleAudience', audienceType: 'Individuals and families' }, areaServed: 'Worldwide', provider: { '@id': `${SITE}/#organization` } },
    crumbs([['Home', '/'], ['Studio', '/studio'], [o.short, url]]),
    faqLd(o.faq),
  ] };
  const others = offers.filter((x) => x.id !== o.id).slice(0, 3);
  return `${head({ title: o.title, description: o.description, url, ogName: `studio-${o.id}`, ld })}
<main id="main"><div class="wrap">
  <header class="hero">
    <div class="eyebrow">MarketCentaur Studio · ${esc(o.tag)}</div>
    <h1>${esc(o.headline)}</h1>
    <p class="lead">${esc(o.lead)}</p>
    <div class="actions">
      <a class="btn primary" href="#brief">Send a brief</a>
      <a class="textlink" href="/studio">All Studio services →</a>
    </div>
  </header>

  <section aria-labelledby="gets-heading">
    <div class="grid g2">
      <div><div class="eyebrow">What you get</div><h2 id="gets-heading" style="margin:0 0 16px">${esc(o.name)}, done for you</h2>
        <ul class="list">${o.gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>
      <div><div class="eyebrow">Good for</div><h2 style="margin:0 0 16px">Who it's for</h2>
        <ul class="list">${o.goodFor.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>
    </div>
  </section>

  <section aria-labelledby="how-heading">
    <div class="sectionhead"><div class="eyebrow">How it works</div><h2 id="how-heading">How do I order?</h2>
      <p>Send a short brief. We reply with a quote by email, with secure payment options. Work starts once you've paid, and a person reviews everything before it reaches you.</p></div>
    <div class="grid g3">${o.steps.map(([t, d], i) => `<div class="step"><div class="n">STEP ${i + 1}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
    <p style="color:var(--muted);margin-top:22px"><strong style="color:var(--text)">What we need from you:</strong> ${esc(o.needs)}</p>
  </section>

  <section id="brief" aria-labelledby="brief-heading">
    <div class="brief">
      <div><div class="eyebrow">Send a brief</div><h2 id="brief-heading" style="font-size:28px;margin:0 0 10px">Get your quote for ${esc(lc(o.short))}</h2>
        <p>Fill in what you can. The more detail you share, the more accurate the quote. You don't pay anything now.</p>
        <p>Your quote arrives by email with the price, delivery time and payment options. You can pay by:</p>${PAY_CHIPS}
        <p style="margin-top:18px">Questions first? Write to <a class="textlink" href="mailto:hello@marketcentaur.com">hello@marketcentaur.com</a>.</p></div>
      <div>${briefForm(o)}</div>
    </div>
  </section>

  <section aria-labelledby="faq-heading">
    <div class="sectionhead"><div class="eyebrow">FAQ</div><h2 id="faq-heading">Questions about ${esc(lc(o.short))}</h2></div>
    ${faqHtml(o.faq)}
  </section>

  <section aria-labelledby="more-heading">
    <div class="sectionhead"><div class="eyebrow">More from Studio</div><h2 id="more-heading">You might also like</h2></div>
    <div class="grid g3">${others.map((x) => `<article class="card"><div class="tag">${esc(x.tag)}</div><h3>${esc(x.name)}</h3><p>${esc(x.card)}</p><a class="textlink bottom" href="/studio/${x.id}">See ${esc(lc(x.short))} →</a></article>`).join('')}</div>
  </section>
</div></main>

${TAIL()}`;
}

const HUB_FAQ = [
  ['What is MarketCentaur Studio?', 'Studio is the part of MarketCentaur that makes things for individuals and families: videos, profiles, career documents, channels, study packs and personal AI setups. We use AI tools to work quickly, and a person reviews every piece before it reaches you.'],
  ['Why don\'t you show prices on the website?', 'Every order is a little different: the language, the length, the deadline and the extras all change the work. So you send a short brief and we email an exact quote, with secure payment options, usually within one working day. You pay only if you accept it.'],
  ['How can I pay?', 'Customers in India can pay by UPI, cards or netbanking through Razorpay, or by bank transfer. Customers elsewhere can pay by card through Stripe, by PayPal, or by bank transfer. The options are listed in your quote email.'],
  ['What if I want changes?', 'Each order includes one round of changes after you see the first version. Bigger changes to the brief after work has started may be quoted separately, and we always tell you before doing extra work.'],
  ['Do you work with customers outside India?', 'Yes. We work online with customers anywhere, in English and a growing list of other languages.'],
  ['Is this for businesses too?', 'Studio is for personal orders. For business needs, see our services for businesses: websites, AI front desks, content, automation and more.'],
];

function hubPage() {
  const url = '/studio';
  const title = 'MarketCentaur Studio: Done-for-You AI Services for Individuals';
  const description = 'Occasion videos, career makeovers, profiles, astrology reports, creator channels, AI setup and study packs, made with AI and checked by a person.';
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', name: 'MarketCentaur Studio', description, url: SITE + url, publisher: { '@id': `${SITE}/#organization` },
      mainEntity: { '@type': 'ItemList', itemListElement: offers.map((o, i) => ({ '@type': 'ListItem', position: i + 1, name: o.name, url: `${SITE}/studio/${o.id}` })) } },
    crumbs([['Home', '/'], ['Studio', url]]),
    faqLd(HUB_FAQ),
  ] };
  return `${head({ title, description, url, ogName: 'studio', ld })}
<main id="main"><div class="wrap">
  <header class="hero">
    <div class="eyebrow">MarketCentaur Studio</div>
    <h1>Done-for-you AI services for you and your family.</h1>
    <p class="lead">Videos for your big moments, a CV that gets interviews, a profile that sounds like you, your own channel, a study plan for exams. Tell us what you need; we make it with AI tools and a person checks every piece before it reaches you.</p>
    <div class="actions">
      <a class="btn primary" href="#services">Choose a service</a>
      <a class="textlink" href="/services">Looking for services for your business? →</a>
    </div>
  </header>

  <section id="services" aria-labelledby="services-heading">
    <div class="sectionhead"><div class="eyebrow">Services</div><h2 id="services-heading">What can Studio make for you?</h2>
      <p>Nine services for individuals and families. Each one starts with a short brief and an emailed quote.</p></div>
    <div class="grid g3">${offers.map((o) => `<article class="card"><div class="tag">${esc(o.tag)}</div><h3>${esc(o.name)}</h3><p>${esc(o.card)}</p><a class="btn bottom" href="/studio/${o.id}">See ${esc(lc(o.short))}</a></article>`).join('')}</div>
  </section>

  <section aria-labelledby="how-heading">
    <div class="sectionhead"><div class="eyebrow">How it works</div><h2 id="how-heading">How does ordering work?</h2>
      <p>No sign-up and no payment up front. You see the exact price before you decide.</p></div>
    <div class="grid g3">
      <div class="step"><div class="n">STEP 1</div><h3>Send a brief</h3><p>Pick a service and fill in a short form: what you need, by when, in which language. Share photos or documents by link.</p></div>
      <div class="step"><div class="n">STEP 2</div><h3>Get your quote</h3><p>We email the price, delivery time and secure payment options, usually within one working day.</p></div>
      <div class="step"><div class="n">STEP 3</div><h3>Review and receive</h3><p>Once you've paid, we make it, send a first version for review, make one round of changes and deliver the final files.</p></div>
    </div>
  </section>

  <section aria-labelledby="pay-heading">
    <div class="grid g2">
      <div><div class="eyebrow">Paying</div><h2 id="pay-heading" style="margin:0 0 12px">How can I pay?</h2>
        <p style="color:var(--muted)">Your quote email includes secure payment options for your country. In India: UPI, cards and netbanking through Razorpay, or bank transfer. Elsewhere: cards through Stripe, PayPal, or bank transfer.</p>${PAY_CHIPS}</div>
      <div><div class="eyebrow">Our promise</div><h2 style="margin:0 0 12px">Made with AI, checked by a person</h2>
        <ul class="list"><li>A person reviews every video, document and report before it reaches you</li><li>We use licensed music, fonts and stock, never copyrighted songs or characters</li><li>Photo touch-ups keep you looking like you</li><li>Your files are used only for your order, and deleted on request</li></ul></div>
    </div>
  </section>

  <section aria-labelledby="faq-heading">
    <div class="sectionhead"><div class="eyebrow">FAQ</div><h2 id="faq-heading">Questions about Studio</h2></div>
    ${faqHtml(HUB_FAQ)}
  </section>

  <section aria-labelledby="cta-heading" style="border-top:0;padding-top:10px">
    <div class="cta">
      <div><h2 id="cta-heading">Not sure which service fits?</h2>
        <p>Write to us with what you have in mind and we'll suggest the right option and quote it.</p></div>
      <a class="btn primary" href="mailto:hello@marketcentaur.com?subject=Studio%20question">Email the Studio team</a>
    </div>
  </section>
</div></main>

${TAIL()}`;
}

fs.mkdirSync(path.join(ROOT, 'studio'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'studio.html'), hubPage());
for (const o of offers) fs.writeFileSync(path.join(ROOT, 'studio', `${o.id}.html`), offerPage(o));

// sitemap.xml and llms.txt entries between Studio markers.
function between(file, start, end, body, anchor) {
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8');
  const block = `${start}\n${body}\n${end}`;
  if (s.includes(start)) s = s.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
  else s = anchor(s, block);
  fs.writeFileSync(p, s);
}
const urls = ['/studio', ...offers.map((o) => `/studio/${o.id}`)];
between('sitemap.xml', '<!-- studio:start -->', '<!-- studio:end -->',
  urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n'),
  (s, b) => s.replace('</urlset>', `${b}\n</urlset>`));
between('llms.txt', '<!-- studio:start -->', '<!-- studio:end -->',
  `## MarketCentaur Studio (for individuals and families)\n\nDone-for-you AI services for personal orders, each made with AI tools and reviewed by a person. Customers send a brief and receive a quote by email with payment options (UPI, cards and netbanking via Razorpay in India; Stripe, PayPal or bank transfer elsewhere). Prices are not published. See ${SITE}/studio\n\n${offers.map((o) => `- [${o.name}](${SITE}/studio/${o.id}): ${o.card}`).join('\n')}`,
  (s, b) => `${s.trimEnd()}\n\n${b}\n`);

console.log(`build-studio: wrote studio.html and ${offers.length} offer pages`);
