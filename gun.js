(function () {
  "use strict";

  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, v)); };
  var smoothstep = function (e0, e1, v) { var x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, k) { return a + (b - a) * k; };

  var day = document.getElementById("day");
  var stage = document.getElementById("stage");
  var worlds = Array.prototype.slice.call(stage.querySelectorAll(".world"));
  var chapters = Array.prototype.slice.call(stage.querySelectorAll(".chapter"));
  var LAST = worlds.length - 1;
  var finalAda = document.getElementById("ada-final");

  /* Light for each hour: sky top, sky bottom, orb (sun or moon), whether text turns white */
  var SCENES = [
    { top: "#DCE6FF", bottom: "#F7F8FF", orb: [72, 16, "#FFF2C2", 1], dark: 0, cloud: [1.5, .9] },
    { top: "#BFD5FF", bottom: "#F1F6FF", orb: [80, 20, "#FFF0B8", 1], dark: 0, cloud: [1.5, .85] },
    { top: "#8DBBFF", bottom: "#E6F1FF", orb: [62, 10, "#FFF6D6", 1], dark: 0, cloud: [1.6, .7] },
    { top: "#4E5F86", bottom: "#9EABC6", orb: [70, 18, "#E9ECF5", 0], dark: 1, cloud: [.9, 1] },
    { top: "#2E3279", bottom: "#B49AD6", orb: [78, 22, "#FFE7C2", .7], dark: 1, cloud: [1.1, .5] },
    { top: "#0A1140", bottom: "#28235F", orb: [74, 16, "#EEF0FF", 1], dark: 1, cloud: [.7, .25] },
    { top: "#070B2A", bottom: "#1C1F55", orb: [78, 18, "#EEF0FF", 1], dark: 1, cloud: [.6, .15] }
  ];

  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixHex(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return "rgb(" + Math.round(lerp(x[0], y[0], t)) + "," + Math.round(lerp(x[1], y[1], t)) + "," + Math.round(lerp(x[2], y[2], t)) + ")";
  }
  // Write a style only when it changes. A custom property written on the stage restyles
  // everything inside it, so per-frame values go on the one element that uses them.
  function setOn(el, k, v) {
    var c = el.__style || (el.__style = {});
    if (c[k] === v) return;
    c[k] = v;
    el.style.setProperty(k, v);
  }
  var set = function (k, v) { setOn(stage, k, v); };
  var skyEl = stage.querySelector(".sky"), skyNext = stage.querySelector(".sky-next");
  var orbEl = stage.querySelector(".orb"), cloudsEl = stage.querySelector(".clouds"), starsEl = stage.querySelector(".stars");
  var handBox = stage.querySelector(".hand"), clockEl = stage.querySelector(".clock"), hintEl = stage.querySelector(".hint");
  var copyEl = stage.querySelector(".copy"), chartEl = stage.querySelector(".chart"), rainEl = document.getElementById("rain");
  var pingEl = stage.querySelector(".ping"), screenEl = document.getElementById("screen");
  var brandEl = document.querySelector(".brand"), tabEl = document.querySelector(".tab");

  /* =====================================================
     Phone screen: the live menu changes with the hour
     ===================================================== */

  /* Language: the first supported one in the browser's list, otherwise English */
  var I18N = window.GUN_I18N;
  var lang = (function () {
    // ?lang=en|de|tr previews another language without changing the browser
    var forced = new URLSearchParams(location.search).get("lang");
    if (forced && I18N[forced]) return forced;
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var c = String(list[i]).slice(0, 2).toLowerCase();
      if (I18N[c]) return c;
    }
    return "en";
  })();
  var MAIN = (window.AOM_I18N && window.AOM_I18N[lang]) || {};
  var T = new Proxy(I18N[lang], { get: function (o, k) { return k in o ? o[k] : MAIN[k]; } });
  document.documentElement.lang = lang;
  document.title = T["meta.title"];
  document.getElementById("meta-desc").setAttribute("content", T["meta.desc"]);
  document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = T[el.dataset.t]; });
  document.querySelectorAll("[data-t-aria]").forEach(function (el) { el.setAttribute("aria-label", T[el.dataset.tAria]); });
  if (window.AOM_PRICING) window.AOM_PRICING.init(document.getElementById("plans"), lang, function (k) { return T[k]; });
  document.getElementById("sc-items").textContent = T["ph.items"].replace("{n}", "2");
  document.querySelectorAll("#sc-langs [data-l]").forEach(function (el) { el.classList.toggle("on", el.dataset.l === lang); });
  document.querySelectorAll(".tags .tag").forEach(function (el, i) {
    el.querySelector("span").textContent = T.tags[i][0];
    el.querySelector("b").textContent = T.tags[i][1];
  });

  var IMG = { salep: "p-latte", latte: "p-latte", croissant: "p-croissant", lemonade: "p-lemonade", cheesecake: "p-cheesecake" };
  var ITEMS = {};
  Object.keys(IMG).forEach(function (id) { ITEMS[id] = { name: T.items[id][0], img: IMG[id], price: T.items[id][1] }; });
  var STATES = {
    sun:  { text: T["ph.sunny"], order: ["lemonade", "latte", "croissant", "cheesecake", "salep"], flag: { lemonade: T["ph.flag.cold"] } },
    rain: { text: T["ph.rainy"], order: ["salep", "latte", "croissant", "cheesecake", "lemonade"], flag: { salep: T["ph.flag.hot"] }, low: "lemonade" }
  };
  var ICON = {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#F3B941"/><g stroke="#F3B941" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M7 15a4.5 4.5 0 0 1 .5-9 6 6 0 0 1 11 2.5A3.5 3.5 0 0 1 18 15z" fill="#AEB8D0"/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" stroke="#1F3A9E" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  var list = document.getElementById("sc-list");
  var wBox = document.getElementById("sc-weather");
  var rows = {}, weather = "sun";

  Object.keys(ITEMS).forEach(function (id) {
    var li = document.createElement("li");
    li.className = "sc-item";
    li.innerHTML = '<img src="assets/web/' + ITEMS[id].img + '.webp" alt="" width="60" height="60">' +
      '<span><span class="sc-name">' + ITEMS[id].name + '</span><span class="sc-flag"></span></span>' +
      '<span class="sc-price">' + ITEMS[id].price + "</span>";
    rows[id] = li;
  });
  function paintWeather() {
    var s = STATES[weather];
    s.order.forEach(function (id) { list.appendChild(rows[id]); });
    document.getElementById("sc-wicon").innerHTML = ICON[weather];
    document.getElementById("sc-wtext").textContent = s.text;
    wBox.classList.toggle("is-rain", weather === "rain");
    Object.keys(rows).forEach(function (id) {
      rows[id].querySelector(".sc-flag").textContent = s.flag[id] || "";
      rows[id].classList.toggle("is-low", s.low === id);
    });
  }
  // The phone leans in toward the viewer for a moment, then settles back.
  var handZoom = document.getElementById("hand-zoom");
  function zoomPhone() {
    if (reduceMQ.matches) return;
    var near = "translate3d(-16%, -9%, 0) scale(1.24)";
    handZoom.animate([
      { transform: "none", easing: "cubic-bezier(.22, 1, .36, 1)" },
      { transform: near, offset: .3 },
      { transform: near, offset: .7, easing: "cubic-bezier(.6, 0, .3, 1)" },
      { transform: "none" }
    ], { duration: 2800 });
  }
  function reorder() {
    var first = {};
    Object.keys(rows).forEach(function (id) { first[id] = rows[id].getBoundingClientRect().top; });
    paintWeather();
    if (reduceMQ.matches) return;
    var scale = list.getBoundingClientRect().height / (list.offsetHeight || 1) || 1;
    Object.keys(rows).forEach(function (id) {
      var dy = (first[id] - rows[id].getBoundingClientRect().top) / scale;
      if (Math.abs(dy) > 1) {
        rows[id].animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }],
          { duration: 850, easing: "cubic-bezier(.16, 1, .3, 1)" });
      }
    });
  }
  var reorderTimer = 0;
  function setWeather(next) {
    if (next === weather) return;
    weather = next;
    clearTimeout(reorderTimer);
    if (next === "rain" && !reduceMQ.matches) {
      // lean in first, then let the menu rearrange while it is close
      zoomPhone();
      reorderTimer = setTimeout(reorder, 500);
    } else {
      reorder();
    }
  }
  paintWeather();

  /* =====================================================
     Rain
     ===================================================== */

  var canvas = document.getElementById("rain");
  var ctx = canvas.getContext("2d");
  var drops = [], rainLevel = 0, rainRunning = false, lastT = 0, rainW = 0, rainH = 0;
  // Three opacity groups, one path each: a handful of draw calls instead of one per drop
  var RAIN_ALPHA = [.3, .45, .65];
  function sizeCanvas() {
    // soft streaks do not need retina pixels; a 1x canvas is a quarter of the work on a 2x screen
    rainW = stage.clientWidth; rainH = stage.clientHeight;
    canvas.width = rainW;
    canvas.height = rainH;
    drops = [];
    var n = Math.round(rainW * rainH / 5200);
    for (var i = 0; i < n; i++) {
      drops.push({ x: Math.random() * rainW, y: Math.random() * rainH, l: 10 + Math.random() * 16, v: 700 + Math.random() * 500, g: i % 3 });
    }
  }
  function rainFrame(t) {
    var dt = Math.min(.05, (t - lastT) / 1000 || 0);
    lastT = t;
    var w = rainW, h = rainH;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    ctx.lineWidth = 1.3;
    for (var g = 0; g < 3; g++) {
      ctx.strokeStyle = "rgba(220, 230, 255," + RAIN_ALPHA[g] + ")";
      ctx.beginPath();
      for (var i = g; i < drops.length; i += 3) {
        var d = drops[i];
        d.y += d.v * dt; d.x -= d.v * dt * .18;
        if (d.y > h) { d.y = -d.l; d.x = Math.random() * w * 1.2; }
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * .18, d.y - d.l);
      }
      ctx.stroke();
    }
    if (rainLevel > 0.01 && !reduceMQ.matches) requestAnimationFrame(rainFrame);
    else { rainRunning = false; ctx.clearRect(0, 0, w, h); }
  }
  function startRain() {
    if (rainRunning || reduceMQ.matches) return;
    rainRunning = true; lastT = performance.now(); requestAnimationFrame(rainFrame);
  }

  /* =====================================================
     Scroll timeline
     ===================================================== */

  var target = 0, smooth = 0, inited = false, pending = false, sheetOpen = false, lastFrame = 0;
  var mx = 0, my = 0, tmx = 0, tmy = 0;

  // Hold each world in place for a while, then move on: d in [-1, 1] -> eased travel.
  function travel(d) {
    var a = Math.abs(d), s = d < 0 ? -1 : 1;
    return s * smoothstep(0.12, 1, a);
  }

  function update() {
    pending = false;
    var rm = reduceMQ.matches;
    var runway = day.offsetHeight - window.innerHeight;
    target = clamp(-day.getBoundingClientRect().top / runway) * LAST;
    // same easing per second at any frame rate: a slow frame catches up instead of lagging and then jumping
    var now = performance.now(), frames = Math.min(4, (now - lastFrame) / 16.7 || 1);
    lastFrame = now;
    smooth = (!inited || rm) ? target : lerp(smooth, target, 1 - Math.pow(0.68, frames));
    if (Math.abs(smooth - target) < 0.0005) smooth = target;
    inited = true;
    mx = rm ? 0 : lerp(mx, tmx, 1 - Math.pow(0.92, frames));
    my = rm ? 0 : lerp(my, tmy, 1 - Math.pow(0.92, frames));
    var p = smooth;
    var mobile = window.innerWidth <= 860;

    // Sky and light blend between neighbouring hours
    var i0 = Math.floor(p), i1 = Math.min(LAST, i0 + 1), f = smoothstep(0.45, 0.85, p - i0);
    var A = SCENES[i0], B = SCENES[i1];
    // two fixed gradients crossfade: only opacity changes per frame, nothing repaints
    setOn(skyEl, "background", "linear-gradient(180deg, " + A.top + ", " + A.bottom + ")");
    setOn(skyNext, "background", "linear-gradient(180deg, " + B.top + ", " + B.bottom + ")");
    setOn(skyNext, "opacity", f.toFixed(3));
    // on phones the copy sits on top, so the sun and moon move down between text and world
    var ox = mobile ? 80 : lerp(A.orb[0], B.orb[0], f), oy = mobile ? 44 : lerp(A.orb[1], B.orb[1], f);
    setOn(orbEl, "--opx", (ox * rainW / 100).toFixed(1) + "px");
    setOn(orbEl, "--opy", (oy * rainH / 100).toFixed(1) + "px");
    setOn(orbEl, "--orb-c", mixHex(A.orb[2], B.orb[2], f));
    setOn(orbEl, "--orb-o", lerp(A.orb[3], B.orb[3], f).toFixed(3));
    setOn(orbEl, "--orb-glow", "rgba(255, 240, 200," + (0.55 * (1 - smoothstep(3.6, 4.6, p))).toFixed(3) + ")");
    setOn(cloudsEl, "--cloud-b", lerp(A.cloud[0], B.cloud[0], f).toFixed(3));
    setOn(cloudsEl, "--cloud-o", lerp(A.cloud[1], B.cloud[1], f).toFixed(3));
    setOn(starsEl, "--stars", smoothstep(4.2, 5.2, p).toFixed(3));
    var dark = lerp(A.dark, B.dark, f);
    set("--fg", dark > .5 ? "#F5F5F7" : "#1D1D1F");
    set("--fg-2", dark > .5 ? "rgba(245,245,247,.72)" : "rgba(29,29,31,.62)");
    set("--halo", dark > .5 ? "rgba(10, 14, 50, .7)" : "rgba(220, 230, 255, .8)");

    // Worlds: rise from below the screen edge, then the camera walks into them
    worlds.forEach(function (w, i) {
      var d = p - i;
      // keep a GPU layer only for the worlds next to the current hour
      setOn(w, "will-change", Math.abs(d) < 1.6 ? "transform, opacity" : "auto");
      if (Math.abs(d) >= 1) { setOn(w, "opacity", "0"); setOn(w, "visibility", "hidden"); return; }
      setOn(w, "visibility", "visible");
      var t = travel(d);
      var y = t < 0 ? -t * 70 : t * 8;
      // a small steady push-in so every bit of scroll shows movement, even while an hour holds
      var s = (t < 0 ? 1 + t * 0.15 : 1 + t * 0.6) * (1 + d * 0.05);
      var o = t < 0 ? 1 + t * 1.4 : 1 - t * 1.6;
      var px = mx * -70, py = my * -40;
      // the first planet waits below the hero copy and rises into place as the copy leaves
      if (i === 0) py += heroSink * (1 - smoothstep(0, 0.6, p));
      setOn(w, "opacity", clamp(o).toFixed(3));
      setOn(w, "transform", "translate3d(" + px.toFixed(1) + "px, calc(" + y.toFixed(2) + "svh + " + py.toFixed(1) + "px), 0) rotate(" + (mx * 1.2).toFixed(2) + "deg) scale(" + s.toFixed(3) + ")");
    });

    // Copy for the current hour
    chapters.forEach(function (c, i) {
      var t = travel(p - i);
      var o = clamp(1 - Math.abs(t) * 2.2);
      setOn(c, "opacity", o.toFixed(3));
      setOn(c, "transform", mobile
        ? "translate3d(0," + (t * -40).toFixed(1) + "px,0)"
        : "translate3d(" + (mx * 14).toFixed(1) + "px, calc(-50% + " + (t * -60 + my * 8).toFixed(1) + "px), 0)");
      setOn(c, "visibility", o > 0.01 ? "visible" : "hidden");
    });

    // The guest's hand is in the shot from 08:00 to 20:00
    var hand = 1 - smoothstep(0.55, 0.95, p) * (1 - smoothstep(4.25, 4.7, p));
    setOn(handBox, "--hand", hand.toFixed(3));
    // fully parked below the stage: hide it, or it would show under the stage once it unpins
    setOn(handBox, "visibility", hand > 0.995 ? "hidden" : "visible");
    // depth layers answer the pointer: hand in front moves most, clouds far back move least
    var dl = p - Math.round(p);   // -0.5..0.5 inside the current hour, for scroll parallax
    // Ada stands a little in front of her island: a light extra drift, never a big one.
    // The jumping Ada at the end is mid-air, so she gets a bit more.
    worlds.forEach(function (w, i) {
      var ada = w.querySelector(".ada");
      if (!ada) return;
      var k = ada === finalAda ? 2.2 : 1, d = p - i;
      setOn(ada, "--ax", (mx * -16 * k).toFixed(1) + "px");
      setOn(ada, "--ay", (my * -10 * k + d * -24 * k).toFixed(1) + "px");
    });
    setOn(handBox, "--hx", Math.min(mx * (mobile ? 30 : 90), handMaxX).toFixed(1)); setOn(handBox, "--hy", Math.max(0, 28 + my * 40 + Math.abs(dl) * 70).toFixed(1));
    setOn(cloudsEl, "--cpx", (mx * -30 + p * -60).toFixed(1)); setOn(cloudsEl, "--cpy", (my * -16 + dl * 50).toFixed(1));
    setOn(orbEl, "--ox", (mx * -20).toFixed(1)); setOn(orbEl, "--oy", (my * -12 + dl * 60).toFixed(1));
    setOn(screenEl, "--cart", (smoothstep(1.6, 1.85, p) * (1 - smoothstep(2.3, 2.5, p))).toFixed(3));
    setOn(pingEl, "--ping", (smoothstep(1.75, 1.95, p) * (1 - smoothstep(2.3, 2.5, p))).toFixed(3));
    var sheet = smoothstep(3.7, 3.95, p) * (1 - smoothstep(4.4, 4.6, p));
    setOn(screenEl, "--sheet", sheet.toFixed(3));
    if (sheet > 0.5 && !sheetOpen) { sheetOpen = true; zoomPhone(); }
    if (sheet < 0.2) sheetOpen = false;
    setWeather(p > 2.65 ? "rain" : "sun");

    // Rain around 18:00
    rainLevel = clamp(1 - Math.abs(p - 3) * 1.7);
    setOn(rainEl, "--rain", rainLevel.toFixed(3));
    if (rainLevel > 0.01) startRain();

    // Clock and scroll hint
    setOn(clockEl, "--clock", clamp((p - 1) / 4).toFixed(4));
    setOn(clockEl, "--clock-o", (smoothstep(0.5, 0.9, p) * (1 - smoothstep(5.3, 5.7, p))).toFixed(3));
    setOn(hintEl, "--hint-o", (1 - smoothstep(0.05, 0.3, p)).toFixed(3));
    // 23:00: daily revenue climbs as the visitor scrolls through the smart pricing scene
    var grow = smoothstep(4.45, 5.4, p);
    setOn(chartEl, "--chart", grow.toFixed(4));
    setOn(chartEl, "--chart-o", (smoothstep(4.35, 4.7, p) * (1 - smoothstep(5.45, 5.75, p))).toFixed(3));
    setOn(chartDot, "--dx", (grow * 100).toFixed(2) + "%");
    setOn(chartDot, "--dy", (chartY(grow * 1200) / 6).toFixed(2) + "%");

    // the sky wash behind the copy, only over the first planet
    setOn(copyEl, "--scrim", (1 - smoothstep(0.3, 0.8, p)).toFixed(3));
    var brandO = smoothstep(0.35, 0.7, p);
    [brandEl, tabEl].forEach(function (el) {
      setOn(el, "--brand-o", brandO.toFixed(3));
      setOn(el, "--brand-v", brandO > 0.01 ? "visible" : "hidden");
    });

    var settling = Math.abs(smooth - target) > 0.0005 || Math.abs(mx - tmx) > 0.001 || Math.abs(my - tmy) > 0.001;
    if (settling) request();
  }
  function request() { if (!pending) { pending = true; requestAnimationFrame(update); } }

  // The phone may only drift right until its edge meets the screen edge (the wrist may run off)
  var handEl = stage.querySelector(".hand"), handMaxX = 0;
  // How far the first planet must sink so its top clears the hero copy (only where they overlap)
  var heroSink = 0;
  function measureHero() {
    var c = chapters[0], w = worlds[0], h = w.offsetHeight, ww = w.offsetWidth;
    // on wide screens the copy is centred on its top edge (translateY(-50%))
    var copyBottom = c.offsetTop + c.offsetHeight * (window.innerWidth <= 860 ? 1 : 0.5) + 24;
    var planetTop = w.offsetTop + h * 0.53;
    var planetLeft = w.offsetLeft - ww / 2, planetRight = planetLeft + ww;
    var overlapX = Math.min(c.offsetLeft + c.offsetWidth, planetRight) - Math.max(c.offsetLeft, planetLeft);
    heroSink = overlapX > 0 ? Math.min(Math.max(0, copyBottom - planetTop), h * 0.3) : 0;
  }
  function measureHand() { var w = handEl.offsetWidth; handMaxX = parseFloat(getComputedStyle(handEl).right) + w * 0.135 - 12; }

  // Revenue chart: sample the curve once, then look up the height for any x
  var chartLine = document.getElementById("chart-line"), chartDot = document.getElementById("chart-dot"), chartPts = [];
  (function () {
    var len = chartLine.getTotalLength();
    for (var i = 0; i <= 120; i++) { var pt = chartLine.getPointAtLength(len * i / 120); chartPts.push([pt.x, pt.y]); }
  })();
  function chartY(x) {
    for (var i = 1; i < chartPts.length; i++) {
      if (chartPts[i][0] >= x) { var a = chartPts[i - 1], b = chartPts[i]; return lerp(a[1], b[1], (x - a[0]) / ((b[0] - a[0]) || 1)); }
    }
    return chartPts[chartPts.length - 1][1];
  }

  // While the visitor scrolls the scene is moving anyway, so the idle loops (sway, rocking,
  // Ada's bob, drifting clouds) pause and hand their frame budget to the scroll
  var scrollIdle = 0, lastY = window.scrollY, dir = 1;
  function onScroll() {
    if (!scrollIdle) stage.classList.add("is-scrolling");
    var y = window.scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    clearTimeout(scrollIdle);
    scrollIdle = setTimeout(function () { scrollIdle = 0; stage.classList.remove("is-scrolling"); settle(); }, 140);
    request();
  }
  // When a scroll stops between two hours, finish the move in the direction the visitor was going:
  // a small nudge is enough to reach the next hour, nobody has to push through
  function settle() {
    if (reduceMQ.matches) return;
    var runway = day.offsetHeight - window.innerHeight, top = day.offsetTop;
    var p = (window.scrollY - top) / runway * LAST;
    if (p <= 0 || p >= LAST) return;
    var frac = p - Math.floor(p);
    if (frac < 0.02 || frac > 0.98) return;
    var to = dir > 0 ? (frac > 0.12 ? Math.ceil(p) : Math.floor(p)) : (frac < 0.88 ? Math.floor(p) : Math.ceil(p));
    window.scrollTo({ top: top + to / LAST * runway, behavior: "smooth" });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { sizeCanvas(); measureHand(); measureHero(); request(); });
  measureHand(); measureHero();
  if (document.fonts) document.fonts.ready.then(function () { measureHero(); request(); });
  if (finePointer.matches) {
    window.addEventListener("pointermove", function (e) {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      request();
    }, { passive: true });
  }

  sizeCanvas();
  update();

  // Decode every world up front, so a new hour never stalls the scroll while its image unpacks
  window.addEventListener("load", function () {
    stage.querySelectorAll("img").forEach(function (img) { if (img.decode) img.decode().catch(function () {}); });
  });
})();
