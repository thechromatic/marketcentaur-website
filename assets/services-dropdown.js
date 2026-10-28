(function () {
  "use strict";

  // Broad, inclusive entry points first; none is promoted as a preferred service.
  var divisions = [
    ["Business Strategy & Growth", "/services/strategy-growth.html"],
    ["Marketing & Customer Engagement", "/services/demand-revenue.html"],
    ["Digital Experience & Technology", "/services/digital-presence.html"],
    ["Operations & Automation", "/services/business-operations.html"],
    ["Intelligence & Decision Support", "/services/business-intelligence.html#business-intelligence"],
    ["Content & Creative", "/services/content-creative.html"],
    ["AI & Marketing Automation", "/services/ai-automation.html"],
    ["Analytics & Optimisation", "/services/analytics-optimisation.html"],
    ["Business & Financial Performance", "/services/business-operations.html#performance"],
    ["Customer & People Experience", "/services/business-operations.html#experience"],
    ["Supplier & Partner Intelligence", "/services/business-intelligence.html#supplier-intelligence"],
    ["Risk, Continuity & Sustainability", "/services/business-intelligence.html#risk-sustainability"],
    ["People & Knowledge Operations", "/services/business-intelligence.html#people-operations"],
    ["B2B Growth Intelligence", "/services/b2b-growth-intelligence.html"],
    ["Account & Persona Mapping", "/services/account-persona-mapping.html"],
    ["Market & Competitor Intelligence", "/services/market-competitor-intelligence.html"],
    ["Partner & Channel Discovery", "/services/partner-channel-discovery.html"],
    ["Weekly Growth Signal Watch", "/services/weekly-growth-signal-watch.html"]
  ];
  function makeLink(label, href, extraClass) {
    var link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (extraClass) link.className = extraClass;
    return link;
  }

  function createDropdown(index) {
    var wrapper = document.createElement("div");
    wrapper.className = "nav-services-dropdown";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-services-toggle";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "marketcentaur-services-menu-" + index);
    toggle.innerHTML = 'Services <span class="nav-services-chevron" aria-hidden="true">⌄</span>';

    var menu = document.createElement("div");
    menu.className = "nav-services-menu";
    menu.id = "marketcentaur-services-menu-" + index;
    menu.hidden = true;

    divisions.forEach(function (item) {
      menu.appendChild(makeLink(item[0], item[1]));
    });

    menu.appendChild(makeLink("Explore all services", "/services.html", "nav-services-all"));
    wrapper.appendChild(toggle);
    wrapper.appendChild(menu);

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    toggle.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
        var firstLink = menu.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });
    wrapper.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.focus();
      }
    });

    return wrapper;
  }

  function normalizeNav(nav, index) {
    if (nav.querySelector(".nav-services-dropdown")) return;

    var links = nav.querySelector(".navlinks");
    if (!links) {
      links = document.createElement("div");
      links.className = "navlinks";
      var directAnchors = Array.prototype.filter.call(nav.children, function (child) {
        return child.tagName === "A";
      });
      var brand = directAnchors.length ? directAnchors[0] : null;
      var insertAfter = brand ? brand.nextSibling : nav.firstChild;
      nav.insertBefore(links, insertAfter);
      directAnchors.forEach(function (anchor) {
        if (anchor !== brand && !anchor.classList.contains("btn")) links.appendChild(anchor);
      });
    }

    var children = Array.prototype.filter.call(links.children, function (child) {
      return child.tagName === "A";
    });
    var serviceLinks = children.filter(function (anchor) {
      var href = anchor.getAttribute("href") || "";
      var label = (anchor.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
      return href === "/services.html" ||
        label === "services" ||
        label === "other services" ||
        label === "b2b intelligence";
    });

    var dropdown = createDropdown(index);
    if (serviceLinks.length) {
      links.insertBefore(dropdown, serviceLinks[0]);
      serviceLinks.forEach(function (anchor) { anchor.remove(); });
    } else {
      links.insertBefore(dropdown, links.firstChild);
    }
  }

  function init() {
    var navs = document.querySelectorAll("nav.nav, nav[aria-label='Main navigation']");
    Array.prototype.forEach.call(navs, normalizeNav);

    document.addEventListener("click", function (event) {
      document.querySelectorAll(".nav-services-dropdown").forEach(function (wrapper) {
        if (!wrapper.contains(event.target)) {
          var toggle = wrapper.querySelector(".nav-services-toggle");
          var menu = wrapper.querySelector(".nav-services-menu");
          if (toggle && menu) {
            toggle.setAttribute("aria-expanded", "false");
            menu.hidden = true;
          }
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();