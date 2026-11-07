/*
 * Cookie consent banner for marketcentaur.com.
 *
 * Google Analytics (see scripts/seo/ga4.mjs) is not loaded until the visitor accepts. This script:
 * - shows the banner when there's no stored choice (or the choice is older than 6 months),
 * - stores the choice in localStorage under "mc-consent",
 * - loads Google Analytics on accept (window.mcLoadGa, defined in the GA4 block),
 * - on reject, sets analytics consent to denied and deletes any _ga cookies,
 * - adds a "Cookie settings" link after the footer's Privacy link, and reopens the banner from
 *   any element with a data-cookie-settings attribute.
 */
(function () {
  var KEY = 'mc-consent';
  var MAX_AGE = 15724800000; // 182 days in ms; keep in sync with scripts/seo/ga4.mjs

  function read() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o && o.v === 1 && (o.analytics === 'granted' || o.analytics === 'denied') && Date.now() - o.t < MAX_AGE) return o;
    } catch (e) {}
    return null;
  }

  function save(value) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, analytics: value, t: Date.now() })); } catch (e) {}
  }

  function clearGaCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function apply(value) {
    if (value === 'granted') {
      if (typeof window.mcLoadGa === 'function') window.mcLoadGa();
    } else {
      if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearGaCookies();
    }
  }

  var CSS =
    '.mcc{position:fixed;left:18px;bottom:18px;z-index:80;width:min(440px,calc(100vw - 36px));box-sizing:border-box;' +
    'padding:18px 18px 16px;border:1px solid #374151;border-radius:14px;background:#111827;color:#f5f7fa;' +
    'font:14px/1.55 Manrope,Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 16px 48px rgba(0,0,0,.5)}' +
    '.mcc h2{margin:0 0 6px;font-size:15px;line-height:1.3;font-weight:750;color:#f5f7fa}' +
    '.mcc p{margin:0 0 14px;color:#cbd5e1}' +
    '.mcc a{color:#19d3ff;text-decoration:underline}' +
    '.mcc-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.mcc-actions button{flex:1 1 140px;min-height:44px;padding:10px 14px;border-radius:9px;border:1px solid #7fb0ff;' +
    'background:#142640;color:#f5f7fa;font:700 14px/1.2 inherit;font-family:inherit;cursor:pointer}' +
    '.mcc-actions button:hover{border-color:#19d3ff}' +
    '.mcc-actions button:focus-visible{outline:2px solid #19d3ff;outline-offset:2px}' +
    '@media (max-width:560px){.mcc{left:0;right:0;bottom:0;width:100%;border-radius:14px 14px 0 0;border-bottom:0}}';

  function addStyles() {
    if (document.getElementById('mcc-css')) return;
    var s = document.createElement('style');
    s.id = 'mcc-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function close(el, opener) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (opener && typeof opener.focus === 'function') opener.focus();
  }

  function show(opener) {
    if (document.querySelector('.mcc')) return;
    addStyles();
    var el = document.createElement('section');
    el.className = 'mcc';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-labelledby', 'mcc-title');
    el.innerHTML =
      '<h2 id="mcc-title">Cookies on this site</h2>' +
      '<p>We’d like to use Google Analytics cookies to see which pages are useful and improve the site. ' +
      'They stay off unless you accept, and we never use them for advertising. ' +
      '<a href="/privacy-policy.html#cookies">Privacy policy</a></p>' +
      '<div class="mcc-actions">' +
      '<button type="button" data-mcc="denied">Reject</button>' +
      '<button type="button" data-mcc="granted">Accept analytics</button>' +
      '</div>';
    el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-mcc]') : null;
      if (!b) return;
      var value = b.getAttribute('data-mcc');
      save(value);
      apply(value);
      close(el, opener);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && opener) close(el, opener);
    });
    document.body.appendChild(el);
    if (opener) { var first = el.querySelector('button'); if (first) first.focus(); }
  }

  function addFooterLinks() {
    var links = document.querySelectorAll('footer a[href="/privacy-policy.html"]');
    Array.prototype.forEach.call(links, function (a) {
      if (a.parentNode.querySelector('[data-cookie-settings]')) return;
      var link = document.createElement('a');
      link.href = '#cookie-settings';
      link.setAttribute('data-cookie-settings', '');
      link.textContent = 'Cookie settings';
      a.parentNode.insertBefore(link, a.nextSibling);
      a.parentNode.insertBefore(document.createTextNode(' · '), link);
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
    if (!t) return;
    e.preventDefault();
    show(t);
  });

  window.mcCookieSettings = function () { show(document.activeElement); };

  function init() {
    addFooterLinks();
    if (!read()) show(null);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
