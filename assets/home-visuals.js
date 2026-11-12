/* Homepage interactions: scroll reveal, leak pipe explorer, sprint finder */
(function(){
"use strict";
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- Scroll reveal ---- */
var revealEls = document.querySelectorAll(".reveal, .timeline");
if (!("IntersectionObserver" in window) || reduce) {
  revealEls.forEach(function(el){ el.classList.add("in"); });
} else {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {rootMargin:"0px 0px -8% 0px", threshold:0.12});
  revealEls.forEach(function(el){ io.observe(el); });
}

/* ---- Leak explorer ---- */
var leaks = [
  {t:"Hours lost to manual work", d:"Copy-paste between systems, approvals chased by email and re-keyed invoices, orders or records take time from every team, not only sales.", l:"AI Workflow Automation Sprint →", h:"/services#automation-sprint"},
  {t:"Data nobody fully trusts", d:"Numbers live in spreadsheets, inboxes and separate tools, so every report takes days and still gets questioned in the meeting.", l:"Data, Analytics & BI practice →", h:"/practices/data-analytics"},
  {t:"Slow answers for the people you serve", d:"Customers, patients, students or citizens wait for replies after hours and at busy times, and simple questions use up skilled staff time.", l:"AI Front Desk →", h:"/services/ai-front-desk"},
  {t:"AI use without guardrails", d:"Staff already use AI tools, often with no agreed policy, training or check on what data goes where. That risk grows quietly.", l:"Governance, Risk & Compliance practice →", h:"/practices/ai-governance"},
  {t:"Hard to find, easy to pass over", d:"Buyers ask AI assistants who to choose or land on your website and leave. Clearer information and fewer points of friction change that.", l:"Website Conversion Sprint →", h:"/services#conversion-sprint"}
];
var tabs = document.querySelectorAll(".leaktabs button");
var panel = document.getElementById("leak-panel");
var markers = document.querySelectorAll(".leakviz .marker");
function selectLeak(i, focus){
  if (!panel) return;
  tabs.forEach(function(b, j){
    var on = j === i;
    b.setAttribute("aria-selected", on ? "true" : "false");
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  });
  markers.forEach(function(m, j){ m.classList.toggle("active", j === i); });
  var k = leaks[i];
  panel.setAttribute("aria-labelledby", tabs[i].id);
  panel.innerHTML = '<div><h3>' + k.t + '</h3><p>' + k.d + '</p></div><a class="textlink" href="' + k.h + '">' + k.l + '</a>';
}
tabs.forEach(function(b, i){
  b.addEventListener("click", function(){ selectLeak(i); });
  b.addEventListener("keydown", function(e){
    var n = tabs.length, to = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i - 1 + n) % n;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = n - 1;
    if (to !== null) { e.preventDefault(); selectLeak(to, true); }
  });
});
markers.forEach(function(m, i){ m.addEventListener("click", function(){ selectLeak(i); }); });
if (tabs.length) selectLeak(0);

/* ---- Sprint finder ---- */
var finder = document.getElementById("sprint-finder");
if (finder) {
  var tracks = {
    t1:{tag:"Track 01 · Website Conversion Sprint", h:"Start with your website", p:"Your answers point to visitors who aren't turning into inquiries or sales. The sprint gives you a conversion audit, a ranked top-10 fix list with rewritten copy, and an AI search visibility check.", href:"/services#conversion-sprint", svc:"conversion-sprint"},
    t2:{tag:"Track 02 · B2B Account Intelligence Sprint", h:"Start with who you target", p:"Your answers point to sharper targeting. The sprint gives you an agreed ideal-customer profile, a ranked account list with sources, a buying-role map and suggested outreach angles.", href:"/services#account-sprint", svc:"account-sprint"},
    t3:{tag:"Track 03 · AI Workflow Automation Sprint", h:"Start with your workflows", p:"Your answers point to time lost on manual work. The sprint maps one or two processes, ranks automation options by effort and risk, and designs a pilot with human approval steps.", href:"/services#automation-sprint", svc:"automation-sprint"}
  };
  var qs = finder.querySelectorAll(".fq");
  var out = document.getElementById("finder-result");
  var bar = out.querySelector(".progress i");
  var body = out.querySelector(".fbody");
  finder.addEventListener("change", function(){
    var score = {t1:0, t2:0, t3:0}, answered = 0, primary = null;
    qs.forEach(function(q, qi){
      var c = q.querySelector("input:checked");
      if (!c) return;
      answered++;
      c.value.split(",").forEach(function(pair){
        var p = pair.split(":"); score[p[0]] += Number(p[1]);
      });
      if (qi === 1) primary = c.value.split(":")[0];
    });
    bar.style.width = Math.round(answered / qs.length * 100) + "%";
    if (answered < qs.length) {
      body.innerHTML = '<div class="tag">' + answered + ' of ' + qs.length + ' answered</div><h3>Your suggested starting point will appear here</h3><p>Answer the remaining question' + (qs.length - answered > 1 ? "s" : "") + ' to see which sprint fits best.</p>';
      out.classList.remove("ready");
      return;
    }
    var best = Object.keys(score).sort(function(a, b){
      return score[b] - score[a] || (b === primary) - (a === primary);
    })[0];
    var t = tracks[best];
    body.innerHTML = '<div class="tag">Suggested starting point</div><h3>' + t.h + '</h3><p><b style="color:var(--text)">' + t.tag + '.</b> ' + t.p + '</p>' +
      '<div class="actions"><a class="btn primary" href="' + t.href + '">See what\'s included</a><a class="btn" href="/contact?service=' + t.svc + '">Talk to us</a></div>' +
      '<p class="fine">This is a starting suggestion. We confirm the right scope with you before any work begins.</p>';
    out.classList.remove("ready"); void out.offsetWidth; out.classList.add("ready");
  });
}
})();
