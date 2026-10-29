(function () {
  "use strict";

  var I18N = window.AOM_I18N;
  var MONEY = window.AOM_MONEY;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var lang = "tr";

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || I18N.tr[key] || key;
  }
  function money(value) {
    var m = MONEY[lang];
    return new Intl.NumberFormat(m.locale, {
      style: "currency", currency: m.currency,
      minimumFractionDigits: m.digits, maximumFractionDigits: m.digits
    }).format(value);
  }
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, v)); };
  var smoothstep = function (e0, e1, v) { var x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, k) { return a + (b - a) * k; };

  /* =====================================================
     Hero: pointer + scroll parallax on the floating props
     ===================================================== */

  var hero = document.querySelector(".hero");
  var floats = Array.prototype.map.call(document.querySelectorAll(".hero .float"), function (el) {
    return { el: el, k: parseFloat(el.dataset.k) || 1 };
  });
  var mx = 0, my = 0, tmx = 0, tmy = 0, heroPending = false;

  function updateHero() {
    heroPending = false;
    var rm = reduceMQ.matches;
    mx = rm ? 0 : lerp(mx, tmx, 0.08);
    my = rm ? 0 : lerp(my, tmy, 0.08);
    var sy = rm ? 0 : Math.min(window.scrollY, window.innerHeight * 1.2);
    floats.forEach(function (f, i) {
      var x = mx * f.k * 70;
      var y = my * f.k * 50 - sy * f.k * 0.14;
      var tf = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      // The phone and Mino tilt towards the pointer; the props only drift.
      if (i === 0) tf += " rotateY(" + (mx * 14).toFixed(2) + "deg) rotateX(" + (my * -10).toFixed(2) + "deg)";
      else tf += " rotate(" + (mx * f.k * 6).toFixed(2) + "deg)";
      f.el.style.transform = tf;
    });
    if (Math.abs(mx - tmx) > 0.001 || Math.abs(my - tmy) > 0.001) requestHero();
  }
  function requestHero() {
    if (!heroPending) { heroPending = true; requestAnimationFrame(updateHero); }
  }
  if (finePointer.matches) {
    // Track the pointer across the whole window while the hero is on screen.
    window.addEventListener("pointermove", function (e) {
      if (window.scrollY > hero.offsetHeight) return;
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      requestHero();
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", function () { tmx = 0; tmy = 0; requestHero(); });
  }

  /* Marquee words with little 3D props between them */
  var MQ_ICONS = ["p-croissant", "p-latte", "p-coins", "p-cheesecake", "p-lemonade"];
  var marquee = document.getElementById("marquee");
  function buildMarquee() {
    var html = "";
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 1; i <= 5; i++) {
        html += '<span class="mq-item">' + t("mq." + i) +
          '<img src="assets/web/' + MQ_ICONS[i - 1] + '.webp" alt="" width="46" height="46" loading="lazy"></span>';
      }
    }
    marquee.innerHTML = html + html;
  }

  /* =====================================================
     Pinned story: four scenes swapped by scroll
     ===================================================== */

  var story = document.querySelector(".story");
  var stage = document.getElementById("story-stage");
  var chapters = Array.prototype.slice.call(stage.querySelectorAll(".chapter"));
  var scenes = Array.prototype.slice.call(stage.querySelectorAll(".scene"));
  var dots = Array.prototype.slice.call(stage.querySelectorAll(".dots span"));
  var BLOBS = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--c3)"];
  var target = 0, smooth = 0, storyInit = false, storyPending = false, activeCh = -1;

  function updateStory() {
    storyPending = false;
    var runway = story.offsetHeight - window.innerHeight;
    target = clamp(-story.getBoundingClientRect().top / runway) * 4;
    smooth = (!storyInit || reduceMQ.matches) ? target : lerp(smooth, target, 0.14);
    if (Math.abs(smooth - target) < 0.0005) smooth = target;
    storyInit = true;
    var p = smooth, n = chapters.length;

    chapters.forEach(function (ch, i) {
      var enter = i === 0 ? 1 : smoothstep(i - 0.18, i + 0.12, p);
      var exit = i === n - 1 ? 0 : smoothstep(i + 0.82, i + 1.06, p);
      var a = enter * (1 - exit);
      ch.style.setProperty("--o", a.toFixed(3));
      ch.style.setProperty("--y", ((1 - enter) * 50 - exit * 50).toFixed(1) + "px");
      ch.setAttribute("aria-hidden", a > 0.5 ? "false" : "true");

      var sc = scenes[i];
      sc.style.setProperty("--a", a.toFixed(3));
      sc.style.setProperty("--ss", (0.62 + 0.38 * enter + exit * 0.18).toFixed(3));
      sc.style.setProperty("--sr", ((1 - enter) * -14 + exit * 12).toFixed(2) + "deg");
      sc.style.setProperty("--sy", ((1 - enter) * 90 - exit * 70).toFixed(1) + "px");
    });

    var ch = Math.min(n - 1, Math.floor(p + 0.5));
    if (ch !== activeCh) {
      activeCh = ch;
      stage.style.setProperty("--blob", BLOBS[ch]);
      dots.forEach(function (d, i) { d.classList.toggle("on", i === ch); });
    }
    if (Math.abs(smooth - target) > 0.0005) requestStory();
  }
  function requestStory() {
    if (!storyPending) { storyPending = true; requestAnimationFrame(updateStory); }
  }

  /* =====================================================
     Reveals, manifesto, join Mino
     ===================================================== */

  function setupReveals() {
    var items = document.querySelectorAll("[data-reveal]");
    var counts = new Map();
    items.forEach(function (el) {
      var n = counts.get(el.parentNode) || 0;
      counts.set(el.parentNode, n + 1);
      el.style.setProperty("--rd", (n * 0.08).toFixed(2) + "s");
    });
    if (!("IntersectionObserver" in window) || reduceMQ.matches) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  var manifesto = document.querySelector(".manifesto");
  var words = [];
  function splitManifesto() {
    var text = t("trust.manifesto");
    manifesto.textContent = "";
    words = text.split(" ").map(function (w, i, arr) {
      var span = document.createElement("span");
      span.className = "w";
      span.setAttribute("aria-hidden", "true");
      span.textContent = w;
      manifesto.appendChild(span);
      if (i < arr.length - 1) manifesto.appendChild(document.createTextNode(" "));
      return span;
    });
    manifesto.setAttribute("aria-label", text);
  }

  var joinMino = document.querySelector(".join-mino");
  function updateScrollLinked() {
    var vh = window.innerHeight;
    if (reduceMQ.matches) return;
    var r = manifesto.getBoundingClientRect();
    var p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.45));
    var n = words.length;
    words.forEach(function (w, i) {
      w.style.setProperty("--wo", (0.14 + 0.86 * clamp(p * n * 1.15 - i)).toFixed(3));
    });
    var jr = joinMino.getBoundingClientRect();
    var j = clamp((vh - jr.top) / (vh * 0.9));
    var e = 1 - Math.pow(1 - j, 3);
    joinMino.style.setProperty("--jy", ((1 - e) * 160).toFixed(1) + "px");
    joinMino.style.setProperty("--jr", ((1 - e) * 14).toFixed(2) + "deg");
    joinMino.style.setProperty("--js", (0.7 + 0.3 * e).toFixed(3));
  }

  /* =====================================================
     Tomorrow's prices card
     ===================================================== */

  var PRODUCTS = [
    { key: "tm.p.latte", tr: [90, 120, 100, 108], en: [3.8, 4.9, 4.2, 4.5], de: [3.4, 4.4, 3.8, 4.1] },
    { key: "tm.p.choc",  tr: [95, 125, 105, 118], en: [4.0, 5.2, 4.4, 4.9], de: [3.6, 4.8, 4.0, 4.5] },
    { key: "tm.p.lemon", tr: [80, 105, 92, 84],   en: [3.4, 4.4, 3.9, 3.6], de: [3.0, 4.0, 3.5, 3.2] }
  ];
  var MODES = ["approve", "auto", "off"];
  var tomorrow = document.getElementById("tomorrow");
  var tmRows = document.getElementById("tm-rows");
  var tmFoot = document.getElementById("tm-foot");
  var modeGroup = tomorrow.querySelector(".tm-mode");
  var modeButtons = Array.prototype.slice.call(modeGroup.querySelectorAll("[role=radio]"));

  function pct(v, min, max) { return ((v - min) / (max - min)) * 100; }

  function renderTomorrow() {
    tmRows.innerHTML = "";
    PRODUCTS.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "tm-row";
      li.innerHTML =
        '<span class="tm-name"></span>' +
        '<span class="tm-bar" aria-hidden="true"><span class="tm-track"></span><span class="tm-fill"></span>' +
          '<span class="tm-tick"></span><span class="tm-dot"></span>' +
          '<span class="tm-bounds"><span class="tm-min"></span><span class="tm-max"></span></span></span>' +
        '<span class="tm-side"><span class="tm-price"></span></span>';
      tmRows.appendChild(li);
    });
  }

  function paintTomorrow() {
    var mode = tomorrow.dataset.mode;
    Array.prototype.forEach.call(tmRows.children, function (li, i) {
      var p = PRODUCTS[i], r = p[lang];
      var min = r[0], max = r[1], base = r[2];
      var shown = mode === "off" ? base : r[3];
      var down = shown < base;
      li.querySelector(".tm-name").textContent = t(p.key);
      li.querySelector(".tm-tick").style.left = pct(base, min, max) + "%";
      var dot = li.querySelector(".tm-dot");
      dot.style.left = pct(shown, min, max) + "%";
      dot.classList.toggle("is-down", down);
      var fill = li.querySelector(".tm-fill");
      var a = pct(Math.min(base, shown), min, max), b = pct(Math.max(base, shown), min, max);
      fill.style.left = a + "%";
      fill.style.width = (b - a) + "%";
      fill.classList.toggle("is-down", down);
      li.querySelector(".tm-min").textContent = money(min);
      li.querySelector(".tm-max").textContent = money(max);
      li.querySelector(".tm-price").textContent = money(shown);
    });
    tmFoot.textContent = t("tm.foot." + mode);
  }

  function setMode(mode, focus) {
    tomorrow.dataset.mode = mode;
    modeGroup.style.setProperty("--mi", MODES.indexOf(mode));
    modeButtons.forEach(function (b) {
      var on = b.dataset.mode === mode;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    paintTomorrow();
  }
  modeButtons.forEach(function (b, idx) {
    b.addEventListener("click", function () { setMode(b.dataset.mode); });
    b.addEventListener("keydown", function (e) {
      var step = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      setMode(modeButtons[(idx + step + modeButtons.length) % modeButtons.length].dataset.mode, true);
    });
  });

  /* =====================================================
     Language
     ===================================================== */

  function applyLang(next) {
    lang = I18N[next] ? next : "en";
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el === manifesto) return;
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.dataset.i18nAttr.split(",").forEach(function (pair) {
        var parts = pair.split(":");
        el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
    buildMarquee();
    paintTomorrow();
    splitManifesto();
    updateScrollLinked();
    var status = document.getElementById("join-status");
    status.textContent = "";
    status.classList.remove("is-error");
  }
  // The page follows the browser's language: the first supported one in its list, otherwise English.
  function browserLang() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).slice(0, 2).toLowerCase();
      if (I18N[code]) return code;
    }
    return "en";
  }
  window.addEventListener("languagechange", function () { applyLang(browserLang()); });

  /* =====================================================
     Early access form
     ===================================================== */

  var form = document.getElementById("join-form");
  var statusEl = document.getElementById("join-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = form.querySelector("input");
    var email = input.value.trim();
    statusEl.classList.remove("is-error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      statusEl.textContent = t("join.invalid");
      statusEl.classList.add("is-error");
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    var endpoint = form.dataset.endpoint;
    if (!endpoint) {
      // No signup endpoint yet: hand off to the visitor's mail app.
      window.location.href = "mailto:support@artofmenu.com?subject=" +
        encodeURIComponent("ArtOfMenu early access") + "&body=" + encodeURIComponent(email + " (" + lang + ")");
      statusEl.textContent = t("join.mail");
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, lang: lang })
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      statusEl.textContent = t("join.done");
      form.reset();
    }).catch(function () {
      statusEl.textContent = t("join.failed");
      statusEl.classList.add("is-error");
    });
  });

  /* =====================================================
     Start
     ===================================================== */

  renderTomorrow();
  applyLang(browserLang());
  setMode("approve");
  setupReveals();
  updateStory();
  updateHero();
  updateScrollLinked();

  var tick = false;
  window.addEventListener("scroll", function () {
    requestStory();
    requestHero();
    if (!tick) {
      tick = true;
      requestAnimationFrame(function () { tick = false; updateScrollLinked(); });
    }
  }, { passive: true });
  window.addEventListener("resize", function () { requestStory(); updateScrollLinked(); });

  // Entrance choreography. The timeout makes sure nothing stays hidden if frames are throttled.
  function loaded() { document.body.classList.add("is-loaded"); }
  requestAnimationFrame(function () { requestAnimationFrame(loaded); });
  setTimeout(loaded, 300);
})();
