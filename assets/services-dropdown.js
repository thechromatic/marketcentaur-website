(function () {
  "use strict";

  // Grouped menu: fixed-scope sprints, done-for-you AI services, then the wider catalog.
  // Entries with a null href render as group labels.
  var divisions = [
    ["17 practices · 108 services", null],
    ["Browse all practices", "/practices/"],
    ["AI Strategy & Readiness", "/practices/ai-strategy.html"],
    ["Automation & AI Agents", "/practices/automation-ai-agents.html"],
    ["Data, IT, Security & Governance", "/practices/#tech-risk-people"],
    ["Free AI Readiness Score", "/ai-readiness-score.html"],
    ["Growth sprints", null],
    ["Website Conversion Sprint", "/services.html#conversion-sprint"],
    ["B2B Account Intelligence Sprint", "/services.html#account-sprint"],
    ["AI Workflow Automation Sprint", "/services.html#automation-sprint"],
    ["Growth Intelligence Retainer", "/services.html#retainer"],
    ["Done-for-you AI services", null],
    ["AI Search Visibility (GEO)", "/services/ai-search-visibility.html"],
    ["AI Front Desk: phone, WhatsApp & chat", "/services/ai-front-desk.html"],
    ["AI Content & Video Studio", "/services/ai-content-studio.html"],
    ["AI Localization & Translation", "/services/ai-localization.html"],
    ["AI Training & Workshops", "/services/ai-training.html"],
    ["More ways to work with us", null],
    ["Market & Competitor Intelligence", "/services/market-competitor-intelligence.html"],
    ["Strategy & Growth", "/services/strategy-growth.html"],
    ["Operations & Revenue Ops", "/services/business-operations.html"],
    ["Free AI visibility check", "/ai-visibility-check.html"],
    ["Partner & white-label program", "/partners.html"],
    ["Labs: AI agents & new products", "/labs.html"]
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
      if (!item[1]) {
        var label = document.createElement("div");
        label.className = "nav-services-group-label";
        label.textContent = item[0];
        menu.appendChild(label);
      } else {
        menu.appendChild(makeLink(item[0], item[1]));
      }
    });

    menu.appendChild(makeLink("See the full catalog", "/services.html#catalog", "nav-services-all"));
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