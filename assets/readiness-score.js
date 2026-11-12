(function () {
  "use strict";
  var LEVELS = ["Not at all", "Early", "Partly", "Mostly", "Fully"];
  var DIMS = [
    { id: "strategy", name: "Strategy", rec: ["AI Readiness Scan", "/practices/ai-strategy#ai-readiness-scan", "Get an evidence-based view of where AI fits and what to do first."],
      qs: ["We have named the business problems AI should help with, and who owns them.", "Leaders agree on AI priorities and have set aside time or budget for them."] },
    { id: "data", name: "Data", rec: ["Data Readiness Check", "/practices/data-analytics#data-readiness-check", "Find out which data is reliable enough to use, and what to fix first."],
      qs: ["Our key business data (customers, sales, operations) is in systems, not scattered spreadsheets.", "We trust our reports: definitions are agreed and numbers match across teams."] },
    { id: "processes", name: "Processes", rec: ["Automation Opportunity Audit", "/practices/automation-ai-agents#automation-opportunity-audit", "Map the repetitive work worth automating, ranked by effort and impact."],
      qs: ["Our main workflows are documented well enough that someone new could follow them.", "We already automate some repetitive work (for example lead routing, reminders or reporting)."] },
    { id: "people", name: "People", rec: ["Team AI Bootcamp", "/practices/ai-training-change#team-ai-bootcamp", "A hands-on session that gets your team using AI safely on real work."],
      qs: ["Most of the team uses AI tools in their work at least weekly.", "People know what good AI use looks like and have had some training."] },
    { id: "governance", name: "Governance", rec: ["AI Policy & Use Register", "/practices/ai-governance#ai-policy-use-register", "Set clear rules for AI use and a register of where it's used."],
      qs: ["We have a written policy on which AI tools can be used and with what data.", "Someone reviews AI outputs before they reach customers, and we know where AI is used."] }
  ];
  var TIERS = [
    [0, 39, "Explorer", "You're at the start. A short, focused diagnostic will save you from tool sprawl and false starts."],
    [40, 69, "Builder", "You have foundations. The next step is turning experiments into a few dependable workflows."],
    [70, 100, "Scaler", "You're ready to scale. Focus on agents, measurement and governance so gains compound safely."]
  ];

  var host = document.getElementById("rs-questions"), form = document.getElementById("rs-form");
  var out = document.getElementById("rs-result"), err = document.getElementById("rs-error");
  if (!host || !form) return;

  DIMS.forEach(function (d) {
    var dim = document.createElement("p"); dim.className = "rs-dim"; dim.textContent = d.name; host.appendChild(dim);
    d.qs.forEach(function (q, i) {
      var name = d.id + "-" + i;
      var fs = document.createElement("fieldset"); fs.className = "rs-q";
      var lg = document.createElement("legend"); lg.textContent = q; fs.appendChild(lg);
      var opts = document.createElement("div"); opts.className = "rs-opts";
      LEVELS.forEach(function (lv, n) {
        var lab = document.createElement("label");
        var inp = document.createElement("input"); inp.type = "radio"; inp.name = name; inp.value = String(n);
        inp.addEventListener("change", function () { err.hidden = true; });
        lab.appendChild(inp); lab.appendChild(document.createTextNode(n + " · " + lv)); opts.appendChild(lab);
      });
      fs.appendChild(opts); host.appendChild(fs);
    });
  });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var scores = {}, missing = 0, total = 0;
    DIMS.forEach(function (d) {
      var s = 0;
      d.qs.forEach(function (q, i) {
        var c = form.querySelector('input[name="' + d.id + "-" + i + '"]:checked');
        if (!c) missing++; else s += Number(c.value);
      });
      scores[d.id] = s; total += s;
    });
    if (missing) { err.textContent = "Answer all 10 questions to see your score (" + missing + " left)."; err.hidden = false; return; }
    var pct = Math.round(total / (DIMS.length * 8) * 100);
    var tier = TIERS.filter(function (t) { return pct >= t[0] && pct <= t[1]; })[0];
    var ranked = DIMS.slice().sort(function (a, b) { return scores[a.id] - scores[b.id]; });
    var recs = ranked.filter(function (d) { return scores[d.id] <= 5; }).slice(0, 3);
    if (!recs.length) recs = [{ rec: ["Custom AI Agent Build", "/practices/automation-ai-agents#custom-ai-agent-build", "Put a governed agent to work on a well-defined process."] },
      { rec: ["Fractional AI Officer", "/practices/ai-strategy#fractional-ai-officer", "Senior guidance to scale AI across the organisation."] }];

    var summary = "Score " + pct + "/100 (" + tier[2] + "). " + DIMS.map(function (d) { return d.name + " " + scores[d.id] + "/8"; }).join(", ");
    out.innerHTML =
      '<div class="scorebox"><div><div class="rs-total">' + pct + '</div><div class="muted small">out of 100</div></div>' +
      '<div><div class="eyebrow" style="margin:0 0 6px">' + esc(tier[2]) + '</div><p style="margin:0">' + esc(tier[3]) + '</p></div></div>' +
      '<div class="grid g2" style="margin-top:22px"><div class="card"><h3>By dimension</h3>' +
      DIMS.map(function (d) { var v = Math.round(scores[d.id] / 8 * 100); return '<div style="width:100%"><strong>' + esc(d.name) + '</strong> <span class="muted small">' + scores[d.id] + '/8</span><div class="rs-bar"><i style="width:' + v + '%"></i></div></div>'; }).join("") +
      '</div><div class="card"><h3>Recommended next steps</h3><ul class="mc-includes">' +
      recs.map(function (d) { return '<li><a href="' + d.rec[1] + '">' + esc(d.rec[0]) + '</a>: ' + esc(d.rec[2]) + '</li>'; }).join("") +
      '</ul><a class="btn primary" href="/contact?service=ai-readiness-scan">Book a call about your score</a></div></div>' +
      '<form class="leadbox" style="margin-top:22px" data-mc-form="readiness-score" data-mc-inline novalidate>' +
      '<div><h2>Get your results by email</h2><p>Leave your email and a person will send your score and recommendations within one business day, with help if you want it. No newsletter unless you ask.</p></div>' +
      '<div class="leadform"><input type="hidden" name="_subject" value="AI Readiness Score: new result">' +
      '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">' +
      '<input type="hidden" name="score_summary" value="' + esc(summary) + '">' +
      '<input name="name" placeholder="Your name" autocomplete="name" aria-label="Your name">' +
      '<input name="email" type="email" placeholder="Work email" autocomplete="email" aria-label="Work email" required>' +
      '<input name="company" placeholder="Company (optional)" autocomplete="organization" aria-label="Company">' +
      '<button class="btn primary" type="submit">Email me my results</button><p class="rs-err" hidden></p>' +
      '<p class="fine">See our <a class="textlink" href="/privacy-policy">Privacy Policy</a>.</p></div></form>';
    out.hidden = false;
    if (typeof window.mcTrack === "function") window.mcTrack("tool_complete", { tool_name: "ai-readiness-score" });
    var lead = out.querySelector("form");
    lead.addEventListener("submit", function (ev) {
      var em = lead.querySelector("[name=email]").value.trim(), le = lead.querySelector(".rs-err");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { ev.preventDefault(); ev.stopImmediatePropagation(); le.textContent = "Enter a valid email address."; le.hidden = false; return; }
      le.hidden = true;
    }, true);
    lead.addEventListener("mc:sent", function () { lead.innerHTML = '<div><h2>Thanks.</h2><p>A person will email your results within one business day.</p></div>'; });
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
