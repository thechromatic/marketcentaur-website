/*
 * MarketCentaur Studio brief forms (pages under /studio).
 * Runs before forms.js sends the form: checks required checkbox groups, adds an order ref,
 * and writes every answer into one readable "message" field, so the email, the leads
 * workbook and the Studio quotes scenario in Make.com all get the full brief.
 */
(function () {
  "use strict";

  function ref() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = "";
    for (var i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return "MCS-" + ymd + "-" + r;
  }

  function summary(form) {
    var lines = [];
    form.querySelectorAll("[data-label]").forEach(function (el) {
      var label = el.getAttribute("data-label"), value = "";
      if (el.tagName === "FIELDSET") {
        value = Array.prototype.map.call(el.querySelectorAll("input:checked"), function (c) { return c.value; }).join(", ");
      } else {
        value = (el.value || "").trim();
      }
      if (value) lines.push(label + ": " + value);
    });
    return lines.join("\n");
  }

  // Capture phase, so this runs before forms.js (which listens in the bubble phase).
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || !form.hasAttribute || !form.hasAttribute("data-mc-studio")) return;

    var missing = null;
    form.querySelectorAll("fieldset[data-required]").forEach(function (fs) {
      if (!missing && !fs.querySelector("input:checked")) missing = fs;
    });
    if (missing) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var first = missing.querySelector("input");
      if (first) {
        first.setCustomValidity("Please choose at least one option.");
        first.reportValidity();
        missing.addEventListener("change", function () { first.setCustomValidity(""); }, { once: true });
      }
      return;
    }

    var refInput = form.querySelector("input[name=order_ref]");
    if (refInput && !refInput.value) refInput.value = ref();
    var msg = form.querySelector("input[name=message]");
    if (msg) msg.value = summary(form);
  }, true);

  document.addEventListener("mc:sent", function (event) {
    var form = event.target;
    if (!form.hasAttribute("data-mc-studio")) return;
    var box = form.parentNode.querySelector(".sent");
    var refInput = form.querySelector("input[name=order_ref]");
    if (box) {
      var r = box.querySelector(".ref");
      if (r && refInput) r.textContent = refInput.value;
      form.setAttribute("style", "display:none"); // not form.style: a field named "style" would shadow it
      box.style.display = "block";
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
