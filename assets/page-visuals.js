/* Shared interactions for Services and service pages: scroll reveal, package switcher scrollspy */
(function(){
"use strict";
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var hasIO = "IntersectionObserver" in window;
if (!hasIO || reduce) document.documentElement.classList.add("no-io");

/* ---- Tag elements for reveal (skips the hero) ---- */
var GRIDS = ".grid,.cards,.process,.catalog,.fit-grid,.split,.sp-tracks";
document.querySelectorAll("main section").forEach(function(sec){
  Array.prototype.forEach.call(sec.children, function(el){
    if (el.matches(".pkgnav") || el.tagName === "SPAN" || el.tagName === "STYLE") return;
    if (el.matches(GRIDS)) {
      Array.prototype.forEach.call(el.children, function(c, i){
        c.classList.add("reveal"); c.style.setProperty("--rd", Math.min(i, 5) * 0.07 + "s");
      });
    } else {
      el.classList.add("reveal");
    }
  });
});

var targets = document.querySelectorAll(".reveal, .pkg");
if (!hasIO || reduce) {
  targets.forEach(function(el){ el.classList.add("in"); });
} else {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {rootMargin:"0px 0px -6% 0px", threshold:0.08});
  targets.forEach(function(el){ io.observe(el); });
}

/* ---- Package switcher scrollspy ---- */
var nav = document.querySelector(".pkgnav");
if (nav && hasIO) {
  var links = nav.querySelectorAll("a");
  var byId = {};
  links.forEach(function(a){ byId[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      links.forEach(function(a){ a.removeAttribute("aria-current"); });
      var a = byId[e.target.id];
      if (a) {
        a.setAttribute("aria-current", "true");
        var l = a.offsetLeft - nav.offsetLeft;
        if (l < nav.scrollLeft || l + a.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollTo({left:l - 12, behavior: reduce ? "auto" : "smooth"});
      }
    });
  }, {rootMargin:"-35% 0px -55% 0px"});
  Object.keys(byId).forEach(function(id){ var s = document.getElementById(id); if (s) spy.observe(s); });
}
})();
