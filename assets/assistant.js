/*
 * Ask MarketCentaur: a small on-site assistant.
 * - Works with no backend: it matches the visitor's question against /assets/catalog.json
 *   and recommends practices and services with links.
 * - If the Cloudflare Pages Function at /api/ask is configured (ANTHROPIC_API_KEY set), it
 *   uses that for a written answer and still shows the matching services.
 * - Never quotes prices. Leads are sent through /assets/forms.js (Web3Forms + optional webhook).
 */
(function () {
  "use strict";
  if (window.__mcAssistant) return;
  window.__mcAssistant = true;

  var catalog = null, history = [], panel, log, input, aiAvailable = true;

  var SYNONYMS = {
    chatbot: "chat assistant website", bot: "assistant agent", whatsapp: "voice front desk whatsapp", phone: "voice front desk calls",
    calls: "voice front desk", receptionist: "voice front desk", booking: "front desk booking", seo: "search visibility",
    geo: "search visibility ai search", chatgpt: "ai search visibility", google: "search visibility", ranking: "search visibility",
    ads: "paid media", advertising: "paid media", crm: "crm hubspot salesforce zoho", hubspot: "crm", salesforce: "crm",
    leads: "outbound lead intelligence", outreach: "outbound", linkedin: "linkedin", sales: "sales outbound crm",
    website: "website web landing", shopify: "ecommerce store", ecommerce: "ecommerce store marketplace", amazon: "marketplace listings",
    video: "video studio brand video", content: "content engine", newsletter: "email newsletter", email: "email retention newsletter",
    event: "event webinar trade show", webinar: "webinar event", trade: "trade show event", dashboard: "dashboard kpi analytics",
    report: "dashboard analytics report", data: "data analytics", forecast: "forecasting", invoice: "finance invoices document processing",
    accounting: "finance invoices", inventory: "inventory logistics", supplier: "supplier procurement", procurement: "procurement supplier",
    document: "document processing knowledge", contract: "document processing contracts", knowledge: "knowledge assistant",
    translate: "localization", translation: "localization", language: "localization", sop: "process sop",
    microsoft: "microsoft 365 copilot workspace", copilot: "copilot rollout", gemini: "gemini rollout", cloud: "cloud migration",
    it: "it care workplace", security: "security cyber", cyber: "security", gdpr: "privacy gdpr", privacy: "privacy data",
    dpdp: "privacy dpdp", policy: "ai policy governance", governance: "governance", "eu": "eu ai act governance",
    esg: "esg sustainability", training: "training bootcamp workshop", workshop: "workshop", team: "training bootcamp",
    hr: "hr recruiting onboarding", hiring: "hr recruiting", recruiting: "hr recruiting", onboarding: "onboarding hr",
    competitor: "competitor snapshot intelligence", competitors: "competitor snapshot intelligence", market: "market intelligence entry",
    strategy: "strategy roadmap", roadmap: "roadmap strategy", automate: "automation workflow", automation: "automation workflow",
    agent: "agent", agents: "agent", mvp: "mvp internal tool", app: "internal tool portal mvp", portal: "customer portal",
    pitch: "pitch deck business plan", investor: "pitch deck", acquisition: "m&a target screening", partner: "partner channel",
    review: "review reputation", reputation: "reputation reviews"
  };
  var STOP = "a an the and or of to for in on with my our we i me is are be can you do how what need want help about from at it this that".split(" ");

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function words(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9& ]+/g, " ").split(/\s+/).filter(function (w) { return w && STOP.indexOf(w) < 0; });
  }
  function expand(q) {
    var out = words(q);
    out.slice().forEach(function (w) { if (SYNONYMS[w]) out = out.concat(words(SYNONYMS[w])); });
    return out;
  }
  function score(text, terms) {
    var t = " " + text.toLowerCase() + " ", s = 0;
    terms.forEach(function (w) { if (w.length > 2 && t.indexOf(w) >= 0) s += t.indexOf(" " + w) >= 0 ? 2 : 1; });
    return s;
  }
  function match(q) {
    var terms = expand(q), hits = [];
    catalog.practices.forEach(function (p) {
      p.offers.forEach(function (o) {
        var s = score(o.name, terms) * 2 + score(o.summary, terms) + score(p.name + " " + p.short, terms) * 0.6;
        if (s > 0) hits.push({ s: s, o: o, p: p });
      });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    var inds = catalog.industries.filter(function (i) { return score(i.name, terms) > 0; }).slice(0, 2);
    return { offers: hits.slice(0, 4), industries: inds };
  }

  function addMsg(who, node) {
    var m = el("div", "mca-msg " + who);
    if (typeof node === "string") m.textContent = node; else m.appendChild(node);
    log.appendChild(m); log.scrollTop = log.scrollHeight;
    return m;
  }
  function link(text, href) { var a = el("a", null, text); a.href = href; return a; }

  function recommendations(res) {
    var box = el("div");
    if (!res.offers.length) {
      box.appendChild(document.createTextNode("I couldn't match that to a specific service yet. Browse "));
      box.appendChild(link("all 17 practices", "/practices/"));
      box.appendChild(document.createTextNode(", take the "));
      box.appendChild(link("free AI Readiness Score", "/ai-readiness-score.html"));
      box.appendChild(document.createTextNode(", or leave your email and a person will reply within one business day."));
      return box;
    }
    box.appendChild(document.createTextNode("These look like a good fit:"));
    var ul = el("ul");
    res.offers.forEach(function (h) {
      var li = el("li"); li.appendChild(link(h.o.name, h.o.url));
      li.appendChild(document.createTextNode(" (" + h.p.name + "): " + h.o.summary));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    if (res.industries.length) {
      var p = el("p"); p.style.margin = "8px 0 0"; p.appendChild(document.createTextNode("For your sector: "));
      res.industries.forEach(function (i, n) { if (n) p.appendChild(document.createTextNode(" · ")); p.appendChild(link(i.name, i.url)); });
      box.appendChild(p);
    }
    var q = el("p"); q.style.margin = "8px 0 0";
    q.appendChild(document.createTextNode("Every engagement is scoped and quoted for you. "));
    q.appendChild(link("Request a quote", "/contact.html?service=" + encodeURIComponent(res.offers[0].o.id)));
    q.appendChild(document.createTextNode(" or leave your details below."));
    box.appendChild(q);
    return box;
  }

  function leadForm(question) {
    var f = el("form", "mca-lead");
    f.setAttribute("data-mc-form", "assistant");
    f.setAttribute("data-mc-inline", "");
    f.innerHTML = '<input type="hidden" name="_subject" value="Ask MarketCentaur: new lead">' +
      '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">' +
      '<input name="name" placeholder="Your name" autocomplete="name" aria-label="Your name">' +
      '<input name="email" type="email" placeholder="Work email" autocomplete="email" aria-label="Work email">' +
      '<button type="submit">Ask a person to follow up</button><span class="mca-err" hidden></span>';
    var hidden = el("input"); hidden.type = "hidden"; hidden.name = "conversation";
    hidden.value = history.map(function (h) { return (h.role === "user" ? "Visitor: " : "Assistant: ") + h.text; }).join("\n").slice(0, 3000) || question;
    f.appendChild(hidden);
    f.addEventListener("submit", function (e) {
      var email = f.querySelector("[name=email]").value.trim(), err = f.querySelector(".mca-err");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { e.preventDefault(); e.stopImmediatePropagation(); err.textContent = "Enter a valid email so we can reply."; err.hidden = false; return; }
      err.hidden = true;
    }, true);
    f.addEventListener("mc:sent", function () { f.replaceWith(el("p", null, "Thanks. A person will reply within one business day.")); });
    return f;
  }

  function isPriceQuestion(q) { return /\b(price|prices|pricing|cost|costs|how much|fee|fees|rate|rates|budget|quote|cheap|expensive)\b/i.test(q); }

  function answer(q) {
    addMsg("me", q);
    history.push({ role: "user", text: q });
    var res = match(q);
    var thinking = addMsg("bot", "…");
    var finish = function (text) {
      thinking.textContent = "";
      if (text) { var p = el("p", null, text); p.style.margin = "0 0 6px"; thinking.appendChild(p); history.push({ role: "assistant", text: text }); }
      if (isPriceQuestion(q) && !text) {
        thinking.appendChild(el("p", null, "Pricing is tailored to your scope, so we don't publish prices. Tell us what you need and we'll send a written quote within one business day."));
      }
      thinking.appendChild(recommendations(res));
      thinking.appendChild(leadForm(q));
      log.scrollTop = log.scrollHeight;
    };
    if (!aiAvailable) return finish("");
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    fetch("/api/ask", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({ question: q, history: history.slice(-6), matches: res.offers.map(function (h) { return h.o.name + " (" + h.p.name + ")"; }) })
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error("no ai");
      return r.json();
    }).then(function (j) { finish(j && j.answer ? String(j.answer) : ""); })
      .catch(function () { clearTimeout(timer); aiAvailable = false; finish(""); });
  }

  function build() {
    if (!document.querySelector('link[href="/assets/catalog.css"]')) {
      var css = document.createElement("link"); css.rel = "stylesheet"; css.href = "/assets/catalog.css"; document.head.appendChild(css);
    }
    if (!document.querySelector('script[src="/assets/forms.js"]')) {
      var s = document.createElement("script"); s.src = "/assets/forms.js"; s.defer = true; document.body.appendChild(s);
    }
    var btn = el("button", "mca-btn"); btn.type = "button"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "mca-panel");
    btn.innerHTML = '<span aria-hidden="true">✦</span><span class="mca-label"> Ask MarketCentaur</span>';
    btn.setAttribute("aria-label", "Ask MarketCentaur");
    // Collapse to an icon once the visitor scrolls past the first screen, so it covers less content.
    var compact = function () { btn.classList.toggle("mca-compact", window.scrollY > window.innerHeight * 0.6 && panel.hidden); };
    window.addEventListener("scroll", compact, { passive: true });
    panel = el("div", "mca-panel"); panel.id = "mca-panel"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ask MarketCentaur");
    var head = el("div", "mca-head"); head.appendChild(el("strong", null, "Ask MarketCentaur"));
    var close = el("button", "mca-close", "×"); close.type = "button"; close.setAttribute("aria-label", "Close"); head.appendChild(close);
    log = el("div", "mca-log"); log.setAttribute("aria-live", "polite");
    var form = el("form", "mca-form");
    input = el("input"); input.placeholder = "What do you want to improve?"; input.setAttribute("aria-label", "Your question"); input.maxLength = 400;
    var send = el("button", null, "Ask"); send.type = "submit";
    form.appendChild(input); form.appendChild(send);
    var note = el("p", "mca-note", "Automated suggestions from our service catalog. A person reviews every enquiry.");
    panel.appendChild(head); panel.appendChild(log); panel.appendChild(form); panel.appendChild(note);
    document.body.appendChild(panel); document.body.appendChild(btn);

    function open(v) {
      panel.hidden = !v; btn.setAttribute("aria-expanded", String(v)); compact();
      if (v) { ensureCatalog(); setTimeout(function () { input.focus(); }, 30); }
    }
    btn.addEventListener("click", function () { open(panel.hidden); });
    close.addEventListener("click", function () { open(false); btn.focus(); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { open(false); btn.focus(); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim(); if (!q) return;
      input.value = "";
      if (!catalog) { ensureCatalog(function () { answer(q); }); return; }
      answer(q);
    });
  }

  var loading = null;
  function ensureCatalog(cb) {
    if (catalog) { if (cb) cb(); return; }
    if (!loading) {
      loading = fetch("/assets/catalog.json").then(function (r) { return r.json(); }).then(function (j) {
        catalog = j;
        var hello = el("div");
        hello.appendChild(el("p", null, "Hi. Tell me what you want to improve and I'll point you to the right service. MarketCentaur has " +
          j.practices.reduce(function (n, p) { return n + p.offers.length; }, 0) + " services across " + j.practices.length + " practices."));
        var chips = el("div", "mca-chips");
        ["Automate repetitive work", "Answer calls and WhatsApp", "Get found in ChatGPT", "Fix our CRM", "Build a dashboard", "Train my team on AI"].forEach(function (c) {
          var b = el("button", null, c); b.type = "button"; b.addEventListener("click", function () { answer(c); }); chips.appendChild(b);
        });
        hello.appendChild(chips);
        addMsg("bot", hello);
      }).catch(function () { addMsg("bot", "Sorry, I couldn't load the service catalog. Email hello@marketcentaur.com and a person will help."); });
    }
    if (cb) loading.then(cb);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
