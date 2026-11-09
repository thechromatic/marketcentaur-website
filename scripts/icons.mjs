// One icon set for category and service cards (24px grid, 2px stroke, currentColor).
// Used by build-catalog.mjs (practice groups) and applied to static cards on the homepage
// and Industries page. The services page's animated .ai-ic icons use the same glyphs.
const svg = (inner, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${inner}</svg>`;

export const ICONS = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/><path d="M11 7.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="currentColor" stroke="none"/>'),
  frontdesk: svg('<path d="M4 5h16v11H9l-5 4z"/><circle cx="8" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="16" cy="10.5" r="1.2" fill="currentColor" stroke="none"/>'),
  content: svg('<rect x="3" y="4" width="18" height="13" rx="3"/><path d="M10 8v5l4-2.5z" fill="currentColor"/><path d="M3 20.5h18"/>'),
  localization: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4.5" ry="9"/>'),
  intelligence: svg('<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  automation: svg('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.5 6h7M7.2 8.2l3.6 7.6M16.8 8.2l-3.6 7.6"/>'),
  strategy: svg('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
  growth: svg('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  operations: svg('<path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/>'),
  governance: svg('<path d="M12 3l8 3v6c0 4.5-3.5 7.8-8 9-4.5-1.2-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
};

// Practice group -> icon
export const GROUP_ICON = { 'Strategy & AI': 'strategy', 'Growth & Sales': 'growth', 'Operations & Data': 'operations', 'Tech, Risk & People': 'governance' };
// Card link -> icon, for static cards
export const HREF_ICON = {
  '/services/ai-search-visibility': 'search',
  '/services/ai-front-desk': 'frontdesk',
  '/services/ai-content-studio': 'content',
  '/services/ai-localization': 'localization',
  '/services/market-competitor-intelligence': 'intelligence',
  '/services#automation-sprint': 'automation',
};
export const iconHtml = (name, cls = 'mc-ic') => `<span class="${cls}" aria-hidden="true">${ICONS[name]}</span>`;
