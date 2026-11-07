// Single source of truth for the site header.
// Used by scripts/nav/apply-nav.mjs (static pages + Insights templates) and scripts/build-catalog.mjs.
// To change the menu: edit MENU below, then run `node scripts/nav/apply-nav.mjs` from the repo root.

export const CTA = { label: 'Book a scoping call', href: '/contact.html' };

// Each top-level item: id, label, href (overview page), optional panel of columns.
// Column: { title, links: [[label, href, note?]], more?: [label, href] }
export const MENU = [
  {
    id: 'services', label: 'Services', href: '/services.html',
    panel: [
      { title: 'Start with a sprint', links: [
        ['Website Conversion Sprint', '/services.html#conversion-sprint', 'More inquiries from the traffic you have'],
        ['B2B Account Intelligence Sprint', '/services.html#account-sprint', 'Ranked accounts, contacts and angles'],
        ['AI Workflow Automation Sprint', '/services.html#automation-sprint', 'Remove weekly manual admin'],
        ['Growth Intelligence Retainer', '/services.html#retainer', 'Ongoing signals and support'],
      ], more: ['Compare the sprints', '/services.html#sprints'] },
      { title: 'Done-for-you AI', links: [
        ['AI Search Visibility', '/services/ai-search-visibility.html', 'Get recommended by AI assistants'],
        ['AI Front Desk', '/services/ai-front-desk.html', 'Calls, WhatsApp and chat, after hours too'],
        ['AI Content & Video Studio', '/services/ai-content-studio.html', 'Content produced and reviewed for you'],
        ['AI Localization', '/services/ai-localization.html', 'Your site and content in more languages'],
        ['AI Training & Workshops', '/services/ai-training.html', 'Teach your team to use AI well'],
      ] },
      { title: 'Explore everything', links: [
        ['All 17 practices', '/practices/'],
        ['Bundles', '/practices/#bundles'],
        ['Full service catalog', '/services.html#catalog'],
        ['Market & competitor intelligence', '/services/market-competitor-intelligence.html'],
        ['Ongoing support', '/recurring-services.html'],
        ['Labs', '/labs.html'],
        ['Partner & white-label program', '/partners.html'],
      ] },
    ],
  },
  {
    id: 'industries', label: 'Industries', href: '/industries.html',
    panel: [
      { title: 'Local & consumer', links: [
        ['Clinics & wellness', '/industries/healthcare-wellness.html'],
        ['Hospitality & tourism', '/industries/hospitality-tourism.html'],
        ['Real estate', '/industries/real-estate.html'],
        ['Trades & field services', '/industries/trades-field-services.html'],
        ['Multi-location businesses', '/industries/multi-location-businesses.html'],
        ['Education & training', '/industries/education-training.html'],
        ['Ecommerce', '/industries/ecommerce.html'],
        ['Consumer brands', '/industries/consumer-brands.html'],
      ] },
      { title: 'B2B & industrial', links: [
        ['Manufacturing & export', '/industries/manufacturing-distribution.html'],
        ['Logistics & supply chain', '/industries/logistics-supply-chain.html'],
        ['Construction & engineering', '/industries/construction-engineering-architecture.html'],
        ['Energy & sustainability', '/industries/energy-environment.html'],
        ['Telecom & infrastructure', '/industries/telecom-infrastructure.html'],
        ['Automotive & mobility', '/industries/automotive-mobility.html'],
        ['Agriculture & food', '/industries/agriculture-food.html'],
      ] },
      { title: 'Professional & public', links: [
        ['Professional services', '/industries/professional-services.html'],
        ['SaaS & IT', '/industries/saas-technology.html'],
        ['Accounting & financial', '/industries/financial-services.html'],
        ['Legal services', '/industries/legal-services.html'],
        ['Media & entertainment', '/industries/media-entertainment.html'],
        ['Government & public sector', '/industries/government-public-sector.html'],
        ['Nonprofits', '/industries/nonprofits.html'],
      ], more: ['All industries', '/industries.html'] },
    ],
  },
  {
    id: 'resources', label: 'Resources', href: '/samples.html',
    panel: [
      { title: 'See the work', links: [
        ['Sample reports', '/samples.html', 'One full sample for each sprint'],
        ['Sample intelligence brief', '/sample-intelligence-brief.html', 'A sourced market brief'],
        ['How we work', '/how-it-works.html', 'Scope, method and review'],
        ['Editorial standards', '/editorial-standards.html', 'How we source and check facts'],
        ['Sector Briefings', '/briefings.html', 'Signals for your sector by email'],
        ['FAQs', '/faq.html'],
      ] },
      { title: 'Free tools', links: [
        ['Free website audit', '/#free-audit', 'Why visitors are not inquiring'],
        ['AI visibility check', '/ai-visibility-check.html', 'Do AI assistants mention you?'],
        ['AI Readiness Score', '/ai-readiness-score.html', 'Where AI fits in your business'],
        ['Growth checks', '/growth-check.html', 'Local, ecommerce and modernization'],
        ['Free toolkit', '/toolkit.html', 'Six templates to download'],
      ] },
    ],
  },
  { id: 'insights', label: 'Insights', href: '/insights/' },
  { id: 'about', label: 'About', href: '/about.html' },
];

// Which top-level item a URL path belongs to (for aria-current).
export function sectionFor(urlPath) {
  const p = urlPath.replace(/index\.html$/, '');
  if (/^\/(services(\.html|\/)|practices\/|recurring-services|labs|partners)/.test(p)) return 'services';
  if (/^\/industries/.test(p)) return 'industries';
  if (/^\/(samples|sample-intelligence-brief|how-it-works|editorial-standards|briefings|faq|ai-visibility-check|ai-readiness-score|growth-check|website-enquiry-readiness|toolkit)/.test(p)) return 'resources';
  if (/^\/insights\//.test(p)) return 'insights';
  if (/^\/(about|contact)/.test(p)) return 'about';
  return '';
}

const esc = (s) => s.replace(/&/g, '&amp;');

function renderPanel(item) {
  const cols = item.panel.map((col) => {
    const links = col.links.map(([label, href, note]) =>
      `<li><a href="${href}">${esc(label)}${note ? `<span>${esc(note)}</span>` : ''}</a></li>`).join('');
    const more = col.more ? `<a class="mc-more" href="${col.more[1]}">${esc(col.more[0])} →</a>` : '';
    return `<div class="mc-col"><p class="mc-col-title">${esc(col.title)}</p><ul>${links}</ul>${more}</div>`;
  }).join('');
  return `<div class="mc-panel mc-cols-${item.panel.length}" id="mc-panel-${item.id}">${cols}</div>`;
}

export function renderNav(urlPath = '/') {
  const current = sectionFor(urlPath);
  const items = MENU.map((item) => {
    const cur = item.id === current ? ' aria-current="true"' : '';
    if (!item.panel) return `<li class="mc-item"><a class="mc-top" href="${item.href}"${cur}>${item.label}</a></li>`;
    return `<li class="mc-item mc-has-panel"><a class="mc-top" href="${item.href}"${cur}>${item.label}</a>` +
      `<button class="mc-caret" type="button" aria-expanded="false" aria-controls="mc-panel-${item.id}" aria-label="Show ${item.label} menu"></button>` +
      renderPanel(item) + `</li>`;
  }).join('');
  return `<nav class="mc-nav" aria-label="Main navigation">` +
    `<a class="mc-logo" href="/" aria-label="MarketCentaur home"><img src="/assets/marketcentaur-logo-transparent.png" alt="MarketCentaur" width="608" height="308"></a>` +
    `<button class="mc-burger" type="button" aria-expanded="false" aria-controls="mc-menu" aria-label="Open menu"><span aria-hidden="true"></span></button>` +
    `<div class="mc-menu" id="mc-menu"><ul class="mc-items">${items}</ul>` +
    `<a class="mc-cta" href="${CTA.href}">${CTA.label}</a></div>` +
    `</nav>`;
}
