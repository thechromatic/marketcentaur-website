/*
 * MarketCentaur form handler.
 * Sends every site form in the background and shows a "send by email" fallback
 * if the form service is unreachable, so no inquiry is lost during an outage.
 *
 * To switch providers: get a free access key at https://web3forms.com (enter
 * hello@marketcentaur.com) and paste it below. Leave it empty to use FormSubmit.
 */
(function () {
  "use strict";

  var WEB3FORMS_KEY = "3d800508-6435-40ae-9b70-ceffafbda97f";
  var INBOX = "hello@marketcentaur.com";
  var TIMEOUT_MS = 15000;
  // Optional: paste a Make.com (or Zapier) webhook URL to copy every lead into your CRM,
  // Google Sheets or Slack. Leave empty to send email only.
  var MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/g43pd65bjhdrts3x44buemetjmjuzss7";

  function copyToWebhook(payload, form) {
    if (!MAKE_WEBHOOK_URL) return;
    try {
      // Sent as a normal form post so Make.com splits it into fields automatically.
      var body = new URLSearchParams(Object.assign({
        form: form.getAttribute("data-mc-form") || form.id || "form",
        page: location.pathname,
        subject: payload.meta._subject || "",
        submitted_at: new Date().toISOString()
      }, payload.data));
      if (!(navigator.sendBeacon && navigator.sendBeacon(MAKE_WEBHOOK_URL, body))) {
        fetch(MAKE_WEBHOOK_URL, { method: "POST", body: body, keepalive: true, mode: "no-cors" });
      }
    } catch (e) { /* the email copy still goes out */ }
  }

  function isSiteForm(form) {
    return form && form.tagName === "FORM" &&
      (form.hasAttribute("data-mc-form") || /formsubmit\.co/.test(form.getAttribute("action") || ""));
  }

  function collect(form) {
    var data = {}, meta = {};
    new FormData(form).forEach(function (value, key) {
      if (typeof value !== "string") return;
      if (key.charAt(0) === "_") meta[key] = value;
      // Repeated names (checkbox groups) are joined, so every ticked option is kept.
      else data[key] = data[key] ? data[key] + ", " + value : value;
    });
    return { data: data, meta: meta };
  }

  function send(payload) {
    var url, body;
    if (WEB3FORMS_KEY) {
      url = "https://api.web3forms.com/submit";
      body = Object.assign({
        access_key: WEB3FORMS_KEY,
        subject: payload.meta._subject || "MarketCentaur website inquiry",
        from_name: "MarketCentaur website"
      }, payload.data);
      if (payload.data.email) body.replyto = payload.data.email;
    } else {
      url = "https://formsubmit.co/ajax/" + INBOX;
      body = Object.assign({ _subject: payload.meta._subject || "MarketCentaur website inquiry", _template: "table" }, payload.data);
    }
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.json().catch(function () { return {}; }).then(function (json) {
        var ok = res.ok && json.success !== false && json.success !== "false";
        if (!ok) throw new Error("Form service error " + res.status);
      });
    }, function (err) { if (timer) clearTimeout(timer); throw err; });
  }

  function mailtoLink(payload) {
    var lines = Object.keys(payload.data).filter(function (k) { return payload.data[k]; })
      .map(function (k) { return k.replace(/_/g, " ") + ": " + payload.data[k]; });
    var body = lines.join("\n").slice(0, 1800);
    return "mailto:" + INBOX + "?subject=" + encodeURIComponent(payload.meta._subject || "Website inquiry") +
      "&body=" + encodeURIComponent(body);
  }

  function showFallback(form, payload) {
    var box = form.parentNode.querySelector(".mc-form-fallback");
    if (!box) {
      box = document.createElement("div");
      box.className = "mc-form-fallback";
      box.setAttribute("role", "alert");
      box.style.cssText = "margin-top:14px;padding:16px 18px;border:1px solid #f6c77a;border-radius:12px;background:rgba(246,199,122,.08);font-size:14px;line-height:1.6";
      form.parentNode.insertBefore(box, form.nextSibling);
    }
    box.innerHTML = "";
    var title = document.createElement("strong");
    title.textContent = "Sorry, our form service isn't responding right now.";
    var p = document.createElement("p");
    p.style.margin = "6px 0 12px";
    p.textContent = "Your message hasn't been lost. Send it by email instead and we'll reply within one business day.";
    var a = document.createElement("a");
    a.href = mailtoLink(payload);
    a.textContent = "Send by email";
    a.style.cssText = "display:inline-block;padding:10px 16px;border-radius:9px;background:#19D3FF;color:#020C24;font-weight:750;text-decoration:none";
    var alt = document.createElement("p");
    alt.style.margin = "10px 0 0";
    alt.appendChild(document.createTextNode("Or write to us directly at "));
    var addr = document.createElement("a");
    addr.href = "mailto:" + INBOX; addr.textContent = INBOX; addr.style.textDecoration = "underline";
    alt.appendChild(addr); alt.appendChild(document.createTextNode("."));
    box.append(title, p, a, alt);
  }

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!isSiteForm(form) || event.defaultPrevented) return;
    event.preventDefault();
    var payload = collect(form);
    var next = payload.meta._next || "/contact-success.html";
    if (payload.meta._honey || payload.data.botcheck) { window.location.href = next; return; }

    var button = form.querySelector("button[type=submit], button:not([type])");
    var label = button ? button.textContent : "";
    if (button) { button.disabled = true; button.textContent = "Sending…"; }

    copyToWebhook(payload, form);
    send(payload).then(function () {
      // Forms marked data-mc-inline stay on the page (assistant, readiness score).
      if (form.hasAttribute("data-mc-inline")) {
        if (button) { button.disabled = false; button.textContent = label; }
        form.dispatchEvent(new CustomEvent("mc:sent", { bubbles: true }));
        return;
      }
      window.location.href = next;
    }).catch(function () {
      if (button) { button.disabled = false; button.textContent = label; }
      showFallback(form, payload);
    });
  });
})();
