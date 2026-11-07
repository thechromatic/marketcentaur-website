/* MarketCentaur header behaviour: mega-menu toggles, mobile menu, sticky-header state,
   and visible breadcrumbs built from the page's BreadcrumbList JSON-LD. */
(function () {
  "use strict";
  var nav = document.querySelector(".mc-nav");
  if (!nav) return;
  var header = nav.closest(".mc-header");
  var burger = nav.querySelector(".mc-burger");
  var items = Array.prototype.slice.call(nav.querySelectorAll(".mc-has-panel"));
  var mobile = window.matchMedia("(max-width: 999px)");

  function setItem(item, open) {
    item.classList.toggle("mc-open", open);
    var caret = item.querySelector(".mc-caret");
    if (caret) caret.setAttribute("aria-expanded", String(open));
  }
  function closeAll(except) { items.forEach(function (i) { if (i !== except) setItem(i, false); }); }
  function setMenu(open) {
    nav.classList.toggle("mc-menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("mc-lock", open && mobile.matches);
    if (!open) closeAll();
  }

  items.forEach(function (item) {
    var caret = item.querySelector(".mc-caret");
    caret.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !item.classList.contains("mc-open");
      if (!mobile.matches) closeAll(item);
      setItem(item, open);
      if (open && !mobile.matches) {
        var first = item.querySelector(".mc-panel a");
        if (first && e.detail === 0) first.focus(); // keyboard activation: move into the panel
      }
    });
    // Desktop: a hover-opened panel closes when the pointer leaves.
    item.addEventListener("mouseleave", function () { if (!mobile.matches) setItem(item, false); });
  });

  burger.addEventListener("click", function () { setMenu(!nav.classList.contains("mc-menu-open")); });

  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) { closeAll(); if (mobile.matches) setMenu(false); } });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openItem = items.filter(function (i) { return i.classList.contains("mc-open"); })[0];
    if (openItem) { setItem(openItem, false); openItem.querySelector(".mc-caret").focus(); }
    else if (nav.classList.contains("mc-menu-open")) { setMenu(false); burger.focus(); }
  });
  // Tabbing out of an open panel closes it.
  nav.addEventListener("focusout", function (e) {
    items.forEach(function (i) { if (i.classList.contains("mc-open") && !i.contains(e.relatedTarget) && !mobile.matches) setItem(i, false); });
  });
  var onMq = function () { setMenu(false); };
  if (mobile.addEventListener) mobile.addEventListener("change", onMq); else mobile.addListener(onMq);

  if (header) {
    var onScroll = function () { header.classList.toggle("mc-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    // Expose the header height so in-page menus can stick just below it.
    var setH = function () { document.documentElement.style.setProperty("--mc-header-h", header.offsetHeight + "px"); };
    setH(); window.addEventListener("resize", setH);
  }

  // Scrollbar width, so full-width bands don't overflow on desktop.
  var setSbw = function () { document.documentElement.style.setProperty("--mc-sbw", (window.innerWidth - document.documentElement.clientWidth) + "px"); };
  setSbw(); window.addEventListener("resize", setSbw);

  // Linking to something inside a collapsed <details> opens it first.
  function revealHash() {
    if (!location.hash) return;
    var t; try { t = document.querySelector(location.hash); } catch (err) { return; }
    if (!t) return;
    var d = t.tagName === "DETAILS" ? t : null, n = t;
    while (n) { if (n.tagName === "DETAILS") n.open = true; n = n.parentElement; }
    if (t.tagName === "SECTION") Array.prototype.forEach.call(t.querySelectorAll("details.more-lg"), function (x) { x.open = true; });
    if (d) d.open = true;
  }
  revealHash();
  window.addEventListener("hashchange", revealHash);

  // Filter chips: <div class="mc-filter" data-filter-target="ID"> with buttons [data-filter]; items carry data-group.
  Array.prototype.forEach.call(document.querySelectorAll(".mc-filter[data-filter-target]"), function (bar) {
    var grid = document.getElementById(bar.getAttribute("data-filter-target"));
    var status = document.getElementById(bar.getAttribute("data-filter-target") + "-status");
    if (!grid) return;
    var btns = Array.prototype.slice.call(bar.querySelectorAll("button[data-filter]"));
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]"); if (!b) return;
      var f = b.getAttribute("data-filter"), shown = 0;
      btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      Array.prototype.forEach.call(grid.querySelectorAll("[data-group]"), function (item) {
        var on = f === "all" || item.getAttribute("data-group") === f;
        item.hidden = !on; if (on) shown++;
      });
      if (status) status.textContent = "Showing " + shown + (f === "all" ? " sectors" : " sectors in " + b.firstChild.textContent.trim());
    });
  });

  // In-page section menu: highlight the section currently in view.
  Array.prototype.forEach.call(document.querySelectorAll(".mc-subnav"), function (sub) {
    var links = Array.prototype.slice.call(sub.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    if (!("IntersectionObserver" in window)) return;
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = null;
      targets.forEach(function (t) { if (t && visible[t.id] && !current) current = t.id; });
      links.forEach(function (a) {
        var on = current && a.getAttribute("href") === "#" + current;
        a.classList.toggle("is-active", !!on);
        if (on) { a.setAttribute("aria-current", "true"); if (sub.scrollWidth > sub.clientWidth) sub.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" }); }
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-140px 0px -55% 0px" });
    targets.forEach(function (t) { if (t) io.observe(t); });
  });

  // Visible breadcrumbs for pages two or more levels deep.
  try {
    if (document.querySelector(".mc-crumbs")) return;
    var crumbs = null;
    Array.prototype.forEach.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      if (crumbs) return;
      var data; try { data = JSON.parse(s.textContent); } catch (err) { return; }
      var stack = [data];
      while (stack.length && !crumbs) {
        var node = stack.pop();
        if (Array.isArray(node)) { stack.push.apply(stack, node); continue; }
        if (!node || typeof node !== "object") continue;
        if (node["@type"] === "BreadcrumbList" && Array.isArray(node.itemListElement)) { crumbs = node.itemListElement; break; }
        if (node["@graph"]) stack.push(node["@graph"]);
      }
    });
    if (!crumbs || crumbs.length < 3) return;
    crumbs = crumbs.slice().sort(function (a, b) { return (a.position || 0) - (b.position || 0); });
    var host = document.querySelector("main .wrap") || document.querySelector("main");
    if (!host) return;
    var el = document.createElement("nav");
    el.className = "mc-crumbs"; el.setAttribute("aria-label", "Breadcrumb");
    var ol = document.createElement("ol");
    crumbs.forEach(function (c, idx) {
      var li = document.createElement("li");
      var name = c.name || (c.item && c.item.name) || "";
      var href = typeof c.item === "string" ? c.item : (c.item && (c.item["@id"] || c.item.url));
      if (idx < crumbs.length - 1 && href) {
        var a = document.createElement("a");
        try { var u = new URL(href, location.href); a.href = u.origin === location.origin || /marketcentaur\.com$/.test(u.hostname) ? u.pathname + u.hash : u.href; } catch (err) { a.href = href; }
        a.textContent = name; li.appendChild(a);
      } else {
        var span = document.createElement("span"); span.setAttribute("aria-current", "page"); span.textContent = name; li.appendChild(span);
      }
      ol.appendChild(li);
    });
    el.appendChild(ol);
    host.insertBefore(el, host.firstChild);
  } catch (err) { /* breadcrumbs are an enhancement only */ }
})();
