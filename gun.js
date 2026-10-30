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

  /* Light for each hour: sky top, sky bottom, orb (sun or moon), whether text turns white */
  var SCENES = [
    { top: "#DCE6FF", bottom: "#F7F8FF", orb: [72, 16, "#FFF2C2", 1], dark: 0, cloud: [1.5, .9] },
    { top: "#BFD5FF", bottom: "#F1F6FF", orb: [80, 20, "#FFF0B8", 1], dark: 0, cloud: [1.5, .85] },
    { top: "#8DBBFF", bottom: "#E6F1FF", orb: [62, 10, "#FFF6D6", 1], dark: 0, cloud: [1.6, .7] },
    { top: "#4E5F86", bottom: "#9EABC6", orb: [70, 18, "#E9ECF5", 0], dark: 1, cloud: [.9, 1] },
    { top: "#2E3279", bottom: "#B49AD6", orb: [78, 22, "#FFE7C2", .7], dark: 1, cloud: [1.1, .5] },
    { top: "#0A1140", bottom: "#28235F", orb: [74, 16, "#EEF0FF", 1], dark: 1, cloud: [.7, .25] },
    { top: "#070B2A", bottom: "#1C1F55", orb: [88, 13, "#EEF0FF", 1], dark: 1, cloud: [.6, .15] }
  ];

  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixHex(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return "rgb(" + Math.round(lerp(x[0], y[0], t)) + "," + Math.round(lerp(x[1], y[1], t)) + "," + Math.round(lerp(x[2], y[2], t)) + ")";
  }
  var set = function (k, v) { stage.style.setProperty(k, v); };

  /* =====================================================
     Phone screen: the live menu changes with the hour
     ===================================================== */

  var ITEMS = {
    salep:      { name: "Salep",              img: "p-latte",      price: "₺110" },
    latte:      { name: "Latte",              img: "p-latte",      price: "₺100" },
    croissant:  { name: "Kruvasan",           img: "p-croissant",  price: "₺85" },
    lemonade:   { name: "Ev yapımı limonata", img: "p-lemonade",   price: "₺90" },
    cheesecake: { name: "San Sebastian",      img: "p-cheesecake", price: "₺180" }
  };
  var STATES = {
    sun:  { text: "Güneşli, 22°", order: ["lemonade", "latte", "croissant", "cheesecake", "salep"], flag: { lemonade: "Sıcakta öne çıktı" } },
    rain: { text: "Yağmurlu, 11°", order: ["salep", "latte", "croissant", "cheesecake", "lemonade"], flag: { salep: "Soğukta öne çıktı" }, low: "lemonade" }
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
  function setWeather(next) {
    if (next === weather) return;
    var first = {};
    Object.keys(rows).forEach(function (id) { first[id] = rows[id].getBoundingClientRect().top; });
    weather = next;
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
  paintWeather();

  /* =====================================================
     Rain
     ===================================================== */

  var canvas = document.getElementById("rain");
  var ctx = canvas.getContext("2d");
  var drops = [], rainLevel = 0, rainRunning = false, lastT = 0;
  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = stage.clientWidth * dpr;
    canvas.height = stage.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drops = [];
    var n = Math.round(stage.clientWidth * stage.clientHeight / 5200);
    for (var i = 0; i < n; i++) {
      drops.push({ x: Math.random() * stage.clientWidth, y: Math.random() * stage.clientHeight, l: 10 + Math.random() * 16, v: 700 + Math.random() * 500, o: .25 + Math.random() * .45 });
    }
  }
  function rainFrame(t) {
    var dt = Math.min(.05, (t - lastT) / 1000 || 0);
    lastT = t;
    var w = stage.clientWidth, h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    ctx.lineWidth = 1.3;
    drops.forEach(function (d) {
      d.y += d.v * dt; d.x -= d.v * dt * .18;
      if (d.y > h) { d.y = -d.l; d.x = Math.random() * w * 1.2; }
      ctx.strokeStyle = "rgba(220, 230, 255," + d.o + ")";
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * .18, d.y - d.l); ctx.stroke();
    });
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

  var target = 0, smooth = 0, inited = false, pending = false;
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
    smooth = (!inited || rm) ? target : lerp(smooth, target, 0.2);
    if (Math.abs(smooth - target) < 0.0005) smooth = target;
    inited = true;
    mx = rm ? 0 : lerp(mx, tmx, 0.08);
    my = rm ? 0 : lerp(my, tmy, 0.08);
    var p = smooth;
    var mobile = window.innerWidth <= 860;

    // Sky and light blend between neighbouring hours
    var i0 = Math.floor(p), i1 = Math.min(LAST, i0 + 1), f = smoothstep(0.45, 0.85, p - i0);
    var A = SCENES[i0], B = SCENES[i1];
    set("--sky-top", mixHex(A.top, B.top, f));
    set("--sky-bottom", mixHex(A.bottom, B.bottom, f));
    set("--orb-x", lerp(A.orb[0], B.orb[0], f) + "%");
    set("--orb-y", lerp(A.orb[1], B.orb[1], f) + "%");
    set("--orb-c", mixHex(A.orb[2], B.orb[2], f));
    set("--orb-o", lerp(A.orb[3], B.orb[3], f).toFixed(3));
    set("--orb-glow", "rgba(255, 240, 200," + (0.55 * (1 - smoothstep(3.6, 4.6, p))).toFixed(3) + ")");
    set("--cloud-b", lerp(A.cloud[0], B.cloud[0], f).toFixed(3));
    set("--cloud-o", lerp(A.cloud[1], B.cloud[1], f).toFixed(3));
    set("--stars", smoothstep(4.2, 5.2, p).toFixed(3));
    var dark = lerp(A.dark, B.dark, f);
    set("--fg", dark > .5 ? "#F5F5F7" : "#1D1D1F");
    set("--fg-2", dark > .5 ? "rgba(245,245,247,.72)" : "rgba(29,29,31,.62)");

    // Worlds: rise from below the screen edge, then the camera walks into them
    worlds.forEach(function (w, i) {
      var d = p - i;
      if (Math.abs(d) >= 1) { w.style.opacity = 0; w.style.visibility = "hidden"; return; }
      w.style.visibility = "visible";
      var t = travel(d);
      var y = t < 0 ? -t * 70 : t * 8;
      // a small steady push-in so every bit of scroll shows movement, even while an hour holds
      var s = (t < 0 ? 1 + t * 0.15 : 1 + t * 0.6) * (1 + d * 0.05);
      var o = t < 0 ? 1 + t * 1.4 : 1 - t * 1.6;
      var px = mx * -40, py = my * -24;
      w.style.opacity = clamp(o).toFixed(3);
      w.style.transform = "translate3d(" + px.toFixed(1) + "px, calc(" + y.toFixed(2) + "svh + " + py.toFixed(1) + "px), 0) scale(" + s.toFixed(3) + ")";
      var ada = w.querySelector(".ada");
      if (ada) ada.style.transform = "translate3d(" + (mx * -36 + t * -40).toFixed(1) + "px," + (my * -14).toFixed(1) + "px,0)";
    });

    // Copy for the current hour
    chapters.forEach(function (c, i) {
      var t = travel(p - i);
      var o = clamp(1 - Math.abs(t) * 2.2);
      c.style.opacity = o.toFixed(3);
      c.style.transform = mobile
        ? "translate3d(0," + (t * -40).toFixed(1) + "px,0)"
        : "translate3d(0, calc(-50% + " + (t * -60).toFixed(1) + "px), 0)";
      c.style.visibility = o > 0.01 ? "visible" : "hidden";
    });

    // The guest's hand is in the shot from 08:00 to 20:00
    var hand = 1 - smoothstep(0.55, 0.95, p) * (1 - smoothstep(4.25, 4.7, p));
    set("--hand", hand.toFixed(3));
    // depth layers answer the pointer: hand in front moves most, clouds far back move least
    set("--hx", (mx * 50).toFixed(1)); set("--hy", (my * 30).toFixed(1));
    set("--cpx", (mx * -14).toFixed(1)); set("--cpy", (my * -8).toFixed(1));
    var screen = document.getElementById("screen");
    screen.style.setProperty("--cart", (smoothstep(1.6, 1.85, p) * (1 - smoothstep(2.3, 2.5, p))).toFixed(3));
    stage.style.setProperty("--ping", (smoothstep(1.75, 1.95, p) * (1 - smoothstep(2.3, 2.5, p))).toFixed(3));
    screen.style.setProperty("--sheet", (smoothstep(3.7, 3.95, p) * (1 - smoothstep(4.4, 4.6, p))).toFixed(3));
    setWeather(p > 2.65 ? "rain" : "sun");

    // Rain around 18:00
    rainLevel = clamp(1 - Math.abs(p - 3) * 1.7);
    set("--rain", rainLevel.toFixed(3));
    if (rainLevel > 0.01) startRain();

    // Clock and scroll hint
    set("--clock", clamp((p - 1) / 4).toFixed(4));
    set("--clock-o", (smoothstep(0.5, 0.9, p) * (1 - smoothstep(5.3, 5.7, p))).toFixed(3));
    set("--hint-o", (1 - smoothstep(0.05, 0.3, p)).toFixed(3));

    var settling = Math.abs(smooth - target) > 0.0005 || Math.abs(mx - tmx) > 0.001 || Math.abs(my - tmy) > 0.001;
    if (settling) request();
  }
  function request() { if (!pending) { pending = true; requestAnimationFrame(update); } }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", function () { sizeCanvas(); request(); });
  if (finePointer.matches) {
    window.addEventListener("pointermove", function (e) {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      request();
    }, { passive: true });
  }

  sizeCanvas();
  update();
})();
