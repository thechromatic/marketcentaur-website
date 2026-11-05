/*
 * MarketCentaur free AI Visibility Check.
 * Runs entirely in the browser: builds buyer-style prompts, opens them in AI assistants,
 * scores the answers the visitor records, and offers an optional emailed snapshot
 * (sent through assets/forms.js via the data-mc-form attribute).
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-ai-check]");
  if (!root) return;

  var setup = root.querySelector("#aic-setup");
  var testArea = root.querySelector("#aic-test");
  var promptList = root.querySelector("#aic-prompts");
  var resultArea = root.querySelector("#aic-result");
  var state = { inputs: null, prompts: [] };

  var OUTCOMES = [
    ["accurate", "Mentioned, accurate", 3],
    ["vague", "Mentioned, vague or wrong", 1],
    ["competitor", "Competitors named instead", 0],
    ["absent", "Not mentioned at all", 0]
  ];

  function val(id) {
    var el = root.querySelector("#" + id);
    return el ? el.value.trim() : "";
  }

  function buildPrompts(i) {
    var where = i.location ? " in " + i.location : "";
    var forWho = i.audience ? " for " + i.audience : "";
    var p = [
      { id: "best", label: "Category recommendation", text: "Who are the best " + i.category + where + forWho + "? Give me a shortlist with reasons." },
      { id: "brand", label: "Brand knowledge", text: "What do you know about " + i.name + (i.website ? " (" + i.website + ")" : "") + "? What do they offer, and who are they a good fit for?" },
      { id: "compare", label: "Comparison", text: i.competitor
          ? "Compare " + i.name + " with " + i.competitor + ". Which would you recommend" + forWho + ", and why?"
          : "Who are the main competitors of " + i.name + ", and how does " + i.name + " compare?" },
      { id: "problem", label: "Problem-led question", text: i.problem ? "I need help with " + i.problem + where + ". Which companies should I contact first, and why?" : "I'm looking for " + i.category + where + ". Which ones should I contact first, and why?" },
      { id: "trust", label: "Reputation", text: "Is " + i.name + " reputable? What do customers say about them?" }
    ];
    return p;
  }

  function enc(s) { return encodeURIComponent(s); }

  function askLinks(text) {
    return [
      ["ChatGPT", "https://chatgpt.com/?q=" + enc(text)],
      ["Perplexity", "https://www.perplexity.ai/search?q=" + enc(text)],
      ["Google AI Mode", "https://www.google.com/search?udm=50&q=" + enc(text)]
    ];
  }

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "className") e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    if (text != null) e.textContent = text;
    return e;
  }

  function renderPrompts() {
    promptList.innerHTML = "";
    state.prompts.forEach(function (p, idx) {
      var box = el("div", { className: "prompt" });
      box.appendChild(el("div", { className: "tag" }, "Question " + (idx + 1) + " · " + p.label));
      box.appendChild(el("p", { className: "q" }, "“" + p.text + "”"));
      var row = el("div", { className: "askrow" });
      askLinks(p.text).forEach(function (l) {
        var a = el("a", { href: l[1], target: "_blank", rel: "noopener" }, "Ask " + l[0] + " ↗");
        row.appendChild(a);
      });
      var copy = el("button", { type: "button" }, "Copy for Gemini / Claude / Copilot");
      copy.addEventListener("click", function () {
        var done = function () { copy.textContent = "Copied ✓"; setTimeout(function () { copy.textContent = "Copy for Gemini / Claude / Copilot"; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p.text).then(done, function () { window.prompt("Copy this question:", p.text); });
        else window.prompt("Copy this question:", p.text);
      });
      row.appendChild(copy);
      box.appendChild(row);
      var fs = el("fieldset");
      fs.appendChild(el("legend", null, "What did the answers say about you?"));
      OUTCOMES.forEach(function (o) {
        var lab = el("label");
        var input = el("input", { type: "radio", name: "aic-" + p.id, value: o[0] });
        lab.appendChild(input);
        lab.appendChild(document.createTextNode(o[1]));
        fs.appendChild(lab);
      });
      box.appendChild(fs);
      promptList.appendChild(box);
    });
  }

  function collectAnswers() {
    var answers = {};
    state.prompts.forEach(function (p) {
      var c = root.querySelector('input[name="aic-' + p.id + '"]:checked');
      answers[p.id] = c ? c.value : "";
    });
    return answers;
  }

  function recommendations(a, score) {
    var r = [];
    var count = function (v) { return Object.keys(a).filter(function (k) { return a[k] === v; }).length; };
    if (a.brand === "absent" || a.brand === "competitor") r.push(["Make your core facts easy for AI to find.", "Publish a clear About page and service pages that state who you are, what you offer, where you operate and who you serve, and add Organization and Service structured data."]);
    if (a.brand === "vague") r.push(["Fix inconsistent or outdated facts.", "Align your name, services, locations and contact details across your website, Google Business Profile, LinkedIn and key directories so AI systems see one consistent story."]);
    if (a.best !== "accurate" || a.problem !== "accurate") r.push(["Answer the questions buyers actually ask.", "Create pages and FAQs that directly answer category and problem-led questions, with specifics such as use cases, industries, locations and outcomes."]);
    if (count("competitor") > 0) r.push(["Study why competitors are recommended.", "Check which sources the AI cited for competitors (reviews, comparison articles, directories, press) and close the biggest gaps first."]);
    if (a.compare !== "accurate") r.push(["Publish honest comparison content.", "A clear page on how you differ from alternatives gives AI assistants something accurate to quote when buyers compare options."]);
    if (a.trust !== "accurate") r.push(["Strengthen third-party proof.", "Encourage reviews on the platforms your buyers use, and keep case studies, awards and partner listings up to date and linkable."]);
    if (score >= 75) r.unshift(["Protect your lead.", "You're visible for most questions. Track the same questions monthly and expand into new services, locations and languages."]);
    return r.slice(0, 5);
  }

  function renderResult() {
    var a = collectAnswers();
    var unanswered = state.prompts.filter(function (p) { return !a[p.id]; }).length;
    var err = root.querySelector("#aic-error");
    if (unanswered > 0) {
      err.textContent = "Record a result for all " + state.prompts.length + " questions to see your score (" + unanswered + " left).";
      return;
    }
    err.textContent = "";
    var points = 0;
    Object.keys(a).forEach(function (k) {
      OUTCOMES.forEach(function (o) { if (o[0] === a[k]) points += o[2]; });
    });
    var score = Math.round(points / (state.prompts.length * 3) * 100);
    var level = score >= 75 ? ["Strong AI visibility", "AI assistants know you and describe you accurately for most buyer questions."]
      : score >= 40 ? ["Partial AI visibility", "AI assistants know some things about you, but you're missing from key questions or described inconsistently."]
      : ["Low AI visibility", "AI assistants rarely mention you for the questions buyers ask, so competitors are likely getting those recommendations."];
    var recs = recommendations(a, score);

    resultArea.innerHTML = "";
    var sb = el("div", { className: "scorebox", role: "status" });
    var s = el("div", { className: "score" }); s.textContent = score; s.appendChild(el("small", null, " / 100"));
    var t = el("div"); t.appendChild(el("h3", null, level[0])); t.appendChild(el("p", null, level[1]));
    sb.appendChild(s); sb.appendChild(t);
    resultArea.appendChild(sb);

    var h = el("h3", { style: "margin:26px 0 4px;font-size:20px" }, "Your top next steps");
    resultArea.appendChild(h);
    var ul = el("ul", { className: "recs" });
    recs.forEach(function (x) { var li = el("li"); li.appendChild(el("b", null, x[0] + " ")); li.appendChild(document.createTextNode(x[1])); ul.appendChild(li); });
    resultArea.appendChild(ul);
    resultArea.appendChild(el("p", { className: "muted small" }, "This is a quick self-assessment based on the answers you recorded. AI answers vary between sessions, users and models, so a full audit tests more questions, several times, across more assistants."));

    // Email capture
    var summary = state.prompts.map(function (p) {
      var label = OUTCOMES.filter(function (o) { return o[0] === a[p.id]; })[0][1];
      return p.label + ": " + label;
    }).join(" | ");
    var form = el("form", { className: "leadbox", "data-mc-form": "", style: "margin-top:24px" });
    var left = el("div");
    left.appendChild(el("div", { className: "eyebrow" }, "Free AI visibility snapshot"));
    left.appendChild(el("h2", null, "Want a person to check these results?"));
    left.appendChild(el("p", null, "We'll re-run your questions across ChatGPT, Gemini, Perplexity and Google AI, and email you a short snapshot with what we found and the three fixes most likely to help. Free, within two business days."));
    var right = el("div", { className: "leadform" });
    function hidden(n, v) { right.appendChild(el("input", { type: "hidden", name: n, value: v })); }
    hidden("_subject", "AI visibility check: " + state.inputs.name + " (" + score + "/100)");
    hidden("_next", "https://marketcentaur.com/contact-success.html?type=ai-snapshot");
    hidden("request_type", "Free AI visibility snapshot");
    hidden("business", state.inputs.name);
    hidden("category", state.inputs.category);
    hidden("location", state.inputs.location);
    hidden("competitor", state.inputs.competitor);
    hidden("self_score", String(score) + "/100 · " + level[0]);
    hidden("answers", summary);
    var hp = el("input", { type: "checkbox", name: "botcheck", tabindex: "-1", autocomplete: "off", style: "display:none" });
    right.appendChild(hp);
    var wl = el("label", { className: "small", "for": "aic-site" }, "Website");
    var wi = el("input", { id: "aic-site", type: "text", name: "website", inputmode: "url", placeholder: "yourcompany.com", value: state.inputs.website || "" });
    var elab = el("label", { className: "small", "for": "aic-email" }, "Email");
    var ei = el("input", { id: "aic-email", type: "email", name: "email", placeholder: "you@company.com", required: "" });
    var btn = el("button", { className: "btn primary", type: "submit" }, "Email me the snapshot");
    var fine = el("p", { className: "fine" });
    fine.innerHTML = 'We use your email only to send the snapshot and one follow-up. See our <a href="/privacy-policy.html" style="text-decoration:underline">Privacy Policy</a>.';
    [wl, wi, elab, ei, btn, fine].forEach(function (x) { right.appendChild(x); });
    form.appendChild(left); form.appendChild(right);
    resultArea.appendChild(form);

    var more = el("p", { style: "margin-top:18px" });
    more.innerHTML = 'Prefer to go straight to a full review? <a class="textlink" href="/services/ai-search-visibility.html">See the AI Search Visibility audit →</a>';
    resultArea.appendChild(more);

    resultArea.hidden = false;
    resultArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  root.querySelector("#aic-start").addEventListener("click", function () {
    var inputs = {
      name: val("aic-name"), website: val("aic-website"), category: val("aic-category"),
      location: val("aic-location"), audience: val("aic-audience"), competitor: val("aic-competitor"),
      problem: val("aic-problem")
    };
    var err = root.querySelector("#aic-setup-error");
    if (!inputs.name || !inputs.category) {
      err.textContent = "Add your business name and what you sell to build your questions.";
      return;
    }
    err.textContent = "";
    state.inputs = inputs;
    state.prompts = buildPrompts(inputs);
    renderPrompts();
    testArea.hidden = false;
    resultArea.hidden = true;
    testArea.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  root.querySelector("#aic-score").addEventListener("click", renderResult);
  root.querySelector("#aic-edit").addEventListener("click", function () {
    setup.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
