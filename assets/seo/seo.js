// Topic pages: prices, reveal on scroll, the call-to-action buttons and the Hairline figure.
(function () {
  "use strict";
  var root = document.documentElement, lang = root.lang;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Prices in the visitor's currency (pricing.js), with the plan texts already in the page
  var plans = document.getElementById("plans");
  if (plans && window.AOM_PRICING) {
    var dict = (window.AOM_I18N && (window.AOM_I18N[lang] || window.AOM_I18N.en)) || {};
    window.AOM_PRICING.init(plans, lang, function (k) { return dict[k]; });
  }

  // Sections ease in once as they reach the screen
  var items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // The language menu closes when you click elsewhere
  var langs = document.querySelector(".langs");
  if (langs) document.addEventListener("click", function (e) { if (!langs.contains(e.target)) langs.open = false; });

  // Call-to-action buttons lean a little toward the pointer, and spring back when it leaves
  if (fine && !still) {
    document.querySelectorAll(".cta").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 8 + "px");
        b.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 6 + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  // The Hairline figure (assets/hairline/): mounted where the page has a [data-hl-stage].
  // Hovering a button marked data-hl-play walks its tour, so the stands answer the button too.
  window.hairline = function (figure) {
    var stage = document.querySelector("[data-hl-stage]");
    if (!stage || !window.HL) return;
    var HL = window.HL, mid = figure.range[1];
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", stage.getAttribute("data-label") || figure.means);
    var svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    var out = stage.parentNode.querySelector("[data-hl-read]"), word = out ? out.getAttribute("data-word") : "";
    var text = "";
    var read = {
      get textContent() { return text; },
      set textContent(v) { text = v == null ? "" : String(v); if (out) out.textContent = text === "rest" || !text ? "" : word + " " + text; }
    };
    figure.mount({ stage: stage, svg: svg, read: read }, mid);
    if (still) return;
    var lap = null;
    function play() { if (!lap) lap = HL.tour(stage, figure.tour || HL.LAP); }
    function stop() { if (lap) { lap.stop(); lap = null; } }
    document.querySelectorAll("[data-hl-play]").forEach(function (b) {
      b.addEventListener("pointerenter", play);
      b.addEventListener("pointerleave", stop);
      b.addEventListener("focus", play);
      b.addEventListener("blur", stop);
    });
    // one lap when the figure first comes into view, then it waits for a hand
    if ("IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        seen.disconnect(); play(); setTimeout(stop, 5200);
      }, { threshold: 0.6 });
      seen.observe(stage);
    }
  };
})();
