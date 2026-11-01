(function () {
  "use strict";

  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, v)); };
  var smoothstep = function (e0, e1, v) { var x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, k) { return a + (b - a) * k; };

  /* Lite mode: on a GPU that cannot keep up (an integrated chip driving a big retina screen),
     the decorative motion goes and the story stays. Measured, not guessed: see watchFrames().
     ?lite=1 / ?lite=0 force it for testing. */
  var root = document.documentElement;
  var liteParam = new URLSearchParams(location.search).get("lite");
  var lite = liteParam === "1" || (liteParam !== "0" && (function () { try { return sessionStorage.getItem("aom-lite2") === "1"; } catch (e) { return false; } })());
  function setLite() {
    if (lite) return;
    lite = true;
    root.classList.add("lite");
    try { sessionStorage.setItem("aom-lite2", "1"); } catch (e) {}
  }
  if (lite) root.classList.add("lite");

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
  function showIf(el, on) { setOn(el, "visibility", on ? "visible" : "hidden"); }
  var skyCanvas = document.getElementById("sky"), skyCtx = skyCanvas.getContext("2d");
  var starsCanvas = document.getElementById("stars");
  var orbEl = stage.querySelector(".orb"), cloudsEl = stage.querySelector(".clouds");
  var cloudEls = Array.prototype.slice.call(stage.querySelectorAll(".cloud"));
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
     Sky and stars: tiny canvases the GPU stretches to the screen
     ===================================================== */

  var skyKey = "";
  function paintSky(top, bottom) {
    if (top + bottom === skyKey) return;
    skyKey = top + bottom;
    var g = skyCtx.createLinearGradient(0, 0, 0, 16);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    skyCtx.fillStyle = g; skyCtx.fillRect(0, 0, 1, 16);
  }
  var STARS = [[8, 14, 1.6, "#fff"], [22, 32, 1.2, "#fff"], [36, 9, 1.8, "#fff"], [47, 24, 1.2, "#CFC6FF"], [61, 6, 1.6, "#fff"],
    [72, 18, 1.2, "#fff"], [86, 11, 1.8, "#fff"], [93, 34, 1.2, "#CFC6FF"], [15, 58, 1.4, "#fff"], [90, 64, 1.2, "#fff"]];
  function paintStars() {
    var w = Math.max(1, Math.round(stage.clientWidth / 2)), h = Math.max(1, Math.round(stage.clientHeight / 2));
    starsCanvas.width = w; starsCanvas.height = h;
    var c = starsCanvas.getContext("2d");
    STARS.forEach(function (s) { c.fillStyle = s[3]; c.beginPath(); c.arc(s[0] / 100 * w, s[1] / 100 * h, Math.max(.6, s[2] / 3), 0, 6.2832); c.fill(); });
  }

  /* =====================================================
     Scroll tracks: every scroll-linked style written as a function of the hour p (0..6).
     Where the browser has scroll-driven animations (Chrome, Edge, Safari 26+) the tracks are
     handed over as keyframes on a view timeline, so the compositor moves them in step with the
     finger, with no script in between. Elsewhere update() writes the same values every frame.
     The pointer (or finger) parallax rides on top through the separate `translate` property.
     ===================================================== */

  var SDA = typeof window.ViewTimeline === "function" && new URLSearchParams(location.search).get("sda") !== "0";
  var tracks = [], running = [], built = { w: 0, h: 0 };
  var chartClip = stage.querySelector(".chart-clip"), chartInner = stage.querySelector(".chart-inner");
  var clockFill = stage.querySelector(".clock-fill");
  function n(v, d) { return v.toFixed(d === undefined ? 3 : d); }
  function track(el, a, b, fn, pseudo) { if (el) tracks.push({ el: el, a: a, b: b, fn: fn, pseudo: pseudo }); }
  function fadeTrack(el, a, b, fn) { track(el, a, b, function (p) { var o = fn(p); return { opacity: n(o), visibility: o > 0.01 ? "visible" : "hidden" }; }); }

  function scene(p) {
    var i0 = Math.min(LAST - 1, Math.floor(p)), f = smoothstep(0.45, 0.85, p - i0);
    return { A: SCENES[i0], B: SCENES[i0 + 1], f: f };
  }

  function buildTracks() {
    tracks = [];
    var mobile = window.innerWidth <= 860, W = stage.clientWidth, H = stage.clientHeight;

    // Worlds: rise from below the screen edge, then the camera walks into them
    worlds.forEach(function (w, i) {
      var anchor = w.classList.contains("w-planet") ? "translate(-50%, 53%) " : "translate(-50%, 34%) ";
      track(w, Math.max(0, i - 1), Math.min(LAST, i + 1), function (p) {
        var d = p - i;
        if (Math.abs(d) >= 1) return { opacity: "0", visibility: "hidden", transform: anchor + "translate3d(0, 0px, 0) scale(1)" };
        var t = travel(d);
        var y = t < 0 ? -t * 70 : t * 8;
        // a small steady push-in so every bit of scroll shows movement, even while an hour holds
        var s = (t < 0 ? 1 + t * 0.15 : 1 + t * 0.6) * (1 + d * 0.05);
        var o = t < 0 ? 1 + t * 1.4 : 1 - t * 1.6;
        // the first planet waits below the hero copy and rises into place as the copy leaves
        var sink = i === 0 ? heroSink * (1 - smoothstep(0, 0.6, p)) : 0;
        return { opacity: n(clamp(o)), visibility: "visible", transform: anchor + "translate3d(0, calc(" + n(y, 2) + "svh + " + n(sink, 1) + "px), 0) scale(" + n(s) + ")" };
      });
      // Ada stands a little in front of her island and drifts a bit on her own; the jumping Ada
      // at the end is mid-air, so she gets more
      var ada = w.querySelector(".ada"), k = ada === finalAda ? 2.2 : 1;
      track(ada, Math.max(0, i - 1), Math.min(LAST, i + 1), function (p) { return { translate: "0px " + n((p - i) * -24 * k, 1) + "px" }; });
    });

    // Copy for the current hour
    chapters.forEach(function (c, i) {
      track(c, Math.max(0, i - 1), Math.min(LAST, i + 1), function (p) {
        var t = travel(p - i), o = clamp(1 - Math.abs(t) * 2.2);
        return { opacity: n(o), visibility: o > 0.01 ? "visible" : "hidden",
          transform: mobile ? "translate3d(0, " + n(t * -40, 1) + "px, 0)" : "translate3d(0, calc(-50% + " + n(t * -60, 1) + "px), 0)" };
      });
    });

    // The guest's hand is in the shot from 08:00 to 20:00, and dips a little between hours
    track(handBox, 0, LAST, function (p) {
      var hand = 1 - smoothstep(0.55, 0.95, p) * (1 - smoothstep(4.25, 4.7, p));
      var dip = 28 + Math.abs(p - Math.round(p)) * 70;
      return { transform: "translate3d(0, calc(" + n(hand * 115, 2) + "svh + " + n(dip, 1) + "px), 0) rotate(" + n(hand * 8, 2) + "deg)",
        visibility: hand > 0.995 ? "hidden" : "visible" };
    });

    // Sun and moon: place and brightness (colour is painted from update())
    track(orbEl, 0, LAST, function (p) {
      // a gentle bob with the scroll (a smooth wave: the old sawtooth snapped back 60px mid-hour)
      var s = scene(p), dl = Math.sin(p * Math.PI * 2) * 0.25;
      // on phones the copy sits on top, so the sun and moon move down between text and world
      var x = (mobile ? 80 : lerp(s.A.orb[0], s.B.orb[0], s.f)) * W / 100;
      var y = (mobile ? 44 : lerp(s.A.orb[1], s.B.orb[1], s.f)) * H / 100 + dl * 60;
      return { opacity: n(lerp(s.A.orb[3], s.B.orb[3], s.f)), transform: "translate(calc(" + n(x, 1) + "px - 50%), calc(" + n(y, 1) + "px - 50%))" };
    });

    // Clouds slide back as the day goes on
    cloudEls.forEach(function (c) {
      track(c, 0, LAST, function (p) { return { translate: n(p * -60, 1) + "px " + n(Math.sin(p * Math.PI * 2) * 12.5, 1) + "px" }; });
    });

    fadeTrack(starsCanvas, 4, LAST, function (p) { return smoothstep(4.2, 5.2, p); });
    fadeTrack(clockEl, 0, LAST, function (p) { return smoothstep(0.5, 0.9, p) * (1 - smoothstep(5.3, 5.7, p)); });
    track(clockFill, 1, 5, function (p) { return { transform: "scaleX(" + n(clamp((p - 1) / 4), 4) + ")" }; });
    fadeTrack(hintEl, 0, 0.3, function (p) { return 1 - smoothstep(0.05, 0.3, p); });
    fadeTrack(brandEl, 0, 0.7, function (p) { return smoothstep(0.35, 0.7, p); });
    fadeTrack(tabEl, 0, 0.7, function (p) { return smoothstep(0.35, 0.7, p); });
    // the sky wash behind the hero copy
    track(copyEl, 0, 0.8, function (p) { return { opacity: n(1 - smoothstep(0.3, 0.8, p)) }; }, "::before");

    // 23:00: daily revenue climbs as the visitor scrolls through the smart pricing scene
    fadeTrack(chartEl, 4.3, 5.8, function (p) { return smoothstep(4.35, 4.7, p) * (1 - smoothstep(5.45, 5.75, p)); });
    var cw = chartEl.offsetWidth, ch = chartEl.offsetHeight;
    track(chartClip, 4.45, 5.4, function (p) { return { transform: "translate3d(" + n((smoothstep(4.45, 5.4, p) - 1) * 100, 2) + "%, 0, 0)" }; });
    track(chartInner, 4.45, 5.4, function (p) { return { transform: "translate3d(" + n((1 - smoothstep(4.45, 5.4, p)) * 100, 2) + "%, 0, 0)" }; });
    track(chartDot, 4.45, 5.4, function (p) {
      var g = smoothstep(4.45, 5.4, p);
      return { transform: "translate3d(" + n(g * cw, 1) + "px, " + n(chartY(g * 1200) / 600 * ch, 1) + "px, 0)" };
    });

    if (SDA) startTracks();
  }

  // Hand the tracks to the browser as scroll-driven animations on the day's view timeline
  function startTracks() {
    running.forEach(function (a) { a.cancel(); });
    running = [];
    var timeline = new ViewTimeline({ subject: day, axis: "block" });
    tracks.forEach(function (tr) {
      var steps = Math.max(2, Math.ceil((tr.b - tr.a) / 0.04)), frames = [];
      for (var k = 0; k <= steps; k++) {
        var fr = tr.fn(tr.a + (tr.b - tr.a) * k / steps);
        fr.offset = k / steps;
        frames.push(fr);
      }
      var opts = { timeline: timeline, fill: "both", easing: "linear",
        rangeStart: "contain " + n(tr.a / LAST * 100, 4) + "%", rangeEnd: "contain " + n(tr.b / LAST * 100, 4) + "%" };
      if (tr.pseudo) opts.pseudoElement = tr.pseudo;
      try { running.push(tr.el.animate(frames, opts)); } catch (e) { SDA = false; }
    });
    if (!SDA) { running.forEach(function (a) { a.cancel(); }); running = []; }
  }

  // Without scroll-driven animations: write the same values from script
  function applyTracks(p) {
    tracks.forEach(function (tr) {
      var v = tr.fn(clamp(p, tr.a, tr.b));
      Object.keys(v).forEach(function (k) {
        if (tr.pseudo) setOn(tr.el, "--scrim", v[k]);
        else setOn(tr.el, k, v[k]);
      });
    });
  }

  /* =====================================================
     Scroll timeline
     ===================================================== */

  var target = 0, pending = false, sheetOpen = false, lastFrame = 0;
  var mx = 0, my = 0, tmx = 0, tmy = 0;

  // Hold each world in place for a while, then move on: d in [-1, 1] -> eased travel.
  function travel(d) {
    var a = Math.abs(d), s = d < 0 ? -1 : 1;
    return s * smoothstep(0.12, 1, a);
  }

  function update() {
    pending = false;
    var rm = reduceMQ.matches;
    var runway = day.offsetHeight - stage.offsetHeight;   // the stage stays pinned for exactly this distance
    var p = target = clamp(-day.getBoundingClientRect().top / runway) * LAST;
    var now = performance.now(), frames = Math.min(4, (now - lastFrame) / 16.7 || 1);
    lastFrame = now;
    mx = rm || lite ? 0 : lerp(mx, tmx, 1 - Math.pow(0.9, frames));
    my = rm || lite ? 0 : lerp(my, tmy, 1 - Math.pow(0.9, frames));
    watchFrames(now);
    var mobile = window.innerWidth <= 860;

    if (!SDA) applyTracks(p);

    // Colours blend between neighbouring hours (paint, so it stays in script)
    var s = scene(p), A = s.A, B = s.B, f = s.f;
    paintSky(mixHex(A.top, B.top, f), mixHex(A.bottom, B.bottom, f));
    setOn(orbEl, "--orb-c", mixHex(A.orb[2], B.orb[2], f));
    setOn(orbEl, "--orb-glow", "rgba(255, 240, 200," + n(0.55 * (1 - smoothstep(3.6, 4.6, p))) + ")");
    setOn(cloudsEl, "--cloud-b", n(lerp(A.cloud[0], B.cloud[0], f)));
    setOn(cloudsEl, "--cloud-o", n(lerp(A.cloud[1], B.cloud[1], f)));
    var dark = lerp(A.dark, B.dark, f);
    set("--fg", dark > .5 ? "#F5F5F7" : "#1D1D1F");
    set("--fg-2", dark > .5 ? "rgba(245,245,247,.72)" : "rgba(29,29,31,.62)");
    set("--halo", dark > .5 ? "rgba(10, 14, 50, .7)" : "rgba(220, 230, 255, .8)");

    // Pointer (or finger) parallax: the hand in front moves most, the clouds far back least
    var px = n(mx * -70, 1) + "px " + n(my * -40, 1) + "px", rot = n(mx * 1.2, 2) + "deg";
    worlds.forEach(function (w) { setOn(w, "translate", px); setOn(w, "rotate", rot); });
    chapters.forEach(function (c) { setOn(c, "translate", mobile ? "0px 0px" : n(mx * 14, 1) + "px " + n(my * 8, 1) + "px"); });
    setOn(handBox, "translate", n(Math.min(mx * (mobile ? 30 : 90), handMaxX), 1) + "px " + n(my * 40, 1) + "px");
    setOn(orbEl, "translate", n(mx * -20, 1) + "px " + n(my * -12, 1) + "px");
    setOn(cloudsEl, "translate", n(mx * -30, 1) + "px " + n(my * -16, 1) + "px");

    // The live menu on the phone
    setOn(screenEl, "--cart", n(smoothstep(1.6, 1.85, p) * (1 - smoothstep(2.3, 2.5, p))));
    setOn(pingEl, "--ping", n(smoothstep(1.75, 1.95, p) * (1 - smoothstep(2.3, 2.5, p))));
    var sheet = smoothstep(3.7, 3.95, p) * (1 - smoothstep(4.4, 4.6, p));
    setOn(screenEl, "--sheet", n(sheet));
    if (sheet > 0.5 && !sheetOpen) { sheetOpen = true; zoomPhone(); }
    if (sheet < 0.2) sheetOpen = false;
    setWeather(p > 2.65 ? "rain" : "sun");

    // Rain around 18:00
    rainLevel = lite ? 0 : clamp(1 - Math.abs(p - 3) * 1.7);
    setOn(rainEl, "--rain", n(rainLevel));
    showIf(rainEl, rainLevel > 0.001);
    if (rainLevel > 0.01) startRain();

    var settling = Math.abs(mx - tmx) > 0.001 || Math.abs(my - tmy) > 0.001;
    if (settling) request();
  }
  function request() { if (!pending) { pending = true; requestAnimationFrame(update); } }

  // Watch real frame times while the story moves. Only a machine that stays under ~25fps for two
  // stretches of 45 frames gets lite mode for the rest of the visit.
  var frameTimes = [], lastTick = 0, slowRuns = 0;
  function watchFrames(now) {
    if (lite || liteParam === "0") return;
    var dtf = now - lastTick;
    lastTick = now;
    if (dtf <= 0 || dtf > 250) return;   // first frame after a pause, or a background tab
    frameTimes.push(dtf);
    if (frameTimes.length < 45) return;
    var sorted = frameTimes.slice().sort(function (a, b) { return a - b; });
    frameTimes = [];
    slowRuns = sorted[Math.floor(sorted.length * 0.75)] > 40 ? slowRuns + 1 : 0;
    if (slowRuns >= 2) setLite();
  }

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
  var scrollIdle = 0;
  function onScroll() {
    if (!scrollIdle) stage.classList.add("is-scrolling");
    clearTimeout(scrollIdle);
    scrollIdle = setTimeout(function () { scrollIdle = 0; stage.classList.remove("is-scrolling"); }, 140);
    request();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Phones: while the browser's bottom bar is showing, lift the islands, the hand and the hint
  // above it; when it slides away they settle back onto the screen edge
  function dock() {
    var cover = Math.max(0, Math.round(stage.offsetHeight - window.innerHeight));
    set("--dock", (cover < 200 ? cover : 0) + "px");
  }
  function onResize() {
    dock();
    sizeCanvas(); paintStars(); measureHand(); measureHero();
    // the bar coming and going changes only the height of the visible area, not the stage
    if (stage.clientWidth !== built.w || stage.clientHeight !== built.h) {
      built = { w: stage.clientWidth, h: stage.clientHeight };
      buildTracks();
    }
    request();
  }
  window.addEventListener("resize", onResize);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", dock);
  if (document.fonts) document.fonts.ready.then(function () { measureHero(); buildTracks(); request(); });

  if (finePointer.matches) {
    window.addEventListener("pointermove", function (e) {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      request();
    }, { passive: true });
  } else {
    // Touch: the scene leans toward the finger while it is on the glass, and settles when it lifts
    var onTouch = function (e) {
      var t = e.touches[0];
      if (!t) return;
      tmx = (t.clientX / window.innerWidth - 0.5) * 0.8;
      tmy = (t.clientY / window.innerHeight - 0.5) * 0.8;
      request();
    };
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", function () { tmx = 0; tmy = 0; request(); }, { passive: true });
  }

  sizeCanvas();
  paintStars();
  measureHand(); measureHero();
  built = { w: stage.clientWidth, h: stage.clientHeight };
  buildTracks();
  dock();
  update();

  // Decode every world up front, so a new hour never stalls the scroll while its image unpacks
  window.addEventListener("load", function () {
    stage.querySelectorAll("img").forEach(function (img) { if (img.decode) img.decode().catch(function () {}); });
  });
})();
