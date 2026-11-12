/*
 * Conversion events for Google Analytics 4.
 *
 * Loaded on every page from the GA4 block (scripts/seo/ga4.mjs). Events go through gtag(), so
 * they follow the cookie banner: nothing reaches Google unless the visitor accepts analytics
 * (assets/consent.js). No names, emails, messages or tool answers are ever sent; only which
 * form, tool or button was used and on which page.
 *
 * Events:
 * - generate_lead   a site form was sent successfully (fired from assets/forms.js).
 *                   form_name matches the "form" value sent to the leads sheet.
 * - tool_complete   a free tool showed a result. tool_name: ai-readiness-score,
 *                   ai-visibility-check, website-enquiry-readiness, growth-check.
 * - cta_click       a button-style link or any link to /contact was clicked.
 *                   link_text, link_url (path only), cta_location (header, footer or section id).
 * - contact_click   an email (mailto:) link was clicked. method: email.
 *
 * In GA4, mark generate_lead as a key event (Admin → Events). To see the parameters in
 * reports, register form_name, tool_name and cta_location as custom dimensions.
 */
(function () {
  "use strict";

  function track(name, params) {
    try {
      if (typeof window.gtag !== "function") return;
      var p = { page_path: location.pathname };
      for (var k in params || {}) if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k];
      window.gtag("event", name, p);
    } catch (e) { /* analytics must never break the page */ }
  }
  window.mcTrack = track;

  function text(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  }

  function locationOf(el) {
    if (el.closest("nav, .mc-nav, body > header")) return "header";
    if (el.closest("footer")) return "footer";
    var s = el.closest("[id]:not(main):not(body)");
    if (s && s.id) return s.id;
    if (el.closest(".hero")) return "hero";
    if (el.closest(".closer")) return "closer";
    return "page";
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/^mailto:/i.test(href)) {
      track("contact_click", { method: "email", cta_location: locationOf(a) });
      return;
    }
    var isContact = /^\/contact(?:[?#/]|$)/.test(href);
    var isButton = a.classList.contains("btn") || a.classList.contains("mc-cta") || a.classList.contains("experience-btn");
    if (!isContact && !isButton) return;
    track("cta_click", {
      link_text: text(a),
      link_url: href.split("?")[0].slice(0, 100), // drop the query: it can carry tool results
      cta_location: locationOf(a)
    });
  });
})();
