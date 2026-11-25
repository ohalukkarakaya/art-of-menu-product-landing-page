// Sales-partner page: plan prices and commissions in the visitor's currency, and the calculator.
// Commission rules are the partner terms' §7 (legal/partner-terms): the first paid invoice only;
// monthly = 100% (Menu) or 50% (Order, Smart) of the net payment; yearly = a fixed amount.
(function () {
  "use strict";
  var body = document.body, lang = document.documentElement.lang;

  // [monthly, yearly] list prices, as pricing.js
  var PRICES = {
    TRY: { menu: [399, 3990], order: [999, 9990], smart: [1999, 19990] },
    EUR: { menu: [9, 90], order: [29, 290], smart: [59, 590] },
    USD: { menu: [12, 120], order: [35, 350], smart: [69, 690] }
  };
  // fixed commission on a first yearly sale, per currency (backend PartnerRules commissionFor)
  var YEARLY = {
    TRY: { menu: 665, order: 1033.45, smart: 3388.14 },
    EUR: { menu: 15, order: 30, smart: 100 },
    USD: { menu: 20, order: 36.21, smart: 116.95 }
  };
  var SHARE = { menu: 1, order: 0.5, smart: 0.5 };
  // A monthly commission is an estimate: the price less 20% tax and about 3% card fee.
  var NET = 0.97 / 1.2;
  var STEP = { TRY: 5, EUR: 1, USD: 1 };
  // Partner-brings-partner: 10% of what we keep from a yearly sale (net price minus the fixed commission).
  var REFERRAL = 0.10, REF_STEP = { TRY: 10, EUR: 1, USD: 1 };

  var EUROPE = ("AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GI GR HR HU IE IS IT LI LT LU LV " +
    "MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM UA VA XK").split(" ");

  /** The visitor's currency, as pricing.js decides it: ?cur=, then the browser's region, then the page. */
  function detect() {
    var forced = new URLSearchParams(location.search).get("cur");
    if (forced && PRICES[forced]) return forced;
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var region = (String(list[i]).split("-")[1] || "").toUpperCase();
      if (region === "TR") return "TRY";
      if (region && EUROPE.indexOf(region) !== -1) return "EUR";
      if (region) return "USD";
    }
    return body.getAttribute("data-cur") || "USD";
  }

  function locale(cur) {
    if (cur === "TRY") return "tr-TR";
    if (lang === "en") return cur === "EUR" ? "en-IE" : "en-US";
    return { tr: "tr-TR", de: "de-DE", es: "es-ES", it: "it-IT", fr: "fr-FR" }[lang] || "en-US";
  }

  function money(v, cur) {
    var whole = Math.round(v * 100) % 100 === 0;
    var opts = { style: "currency", currency: cur, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 };
    if (cur === "TRY") return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: opts.minimumFractionDigits, maximumFractionDigits: opts.maximumFractionDigits }).format(v) + " ₺";
    return new Intl.NumberFormat(locale(cur), opts).format(v);
  }

  function monthlyCut(plan, cur) {
    var raw = PRICES[cur][plan][0] * NET * SHARE[plan], s = STEP[cur];
    return Math.round(raw / s) * s;
  }

  function amount(key, cur) {
    var p = key.split("."), plan = p[0], kind = p[1];
    if (kind === "pm") return PRICES[cur][plan][0];
    if (kind === "py") return PRICES[cur][plan][1];
    if (kind === "cm") return monthlyCut(plan, cur);
    if (kind === "ry") return Math.round((PRICES[cur][plan][1] * NET - YEARLY[cur][plan]) * REFERRAL / REF_STEP[cur]) * REF_STEP[cur];
    return YEARLY[cur][plan];
  }

  var cur = detect();
  var state = { plan: "smart", bill: "y", n: 3 };
  var nOut = document.getElementById("sp-n"), range = document.getElementById("sp-count");

  function renderCalc() {
    var per = state.bill === "y" ? YEARLY[cur][state.plan] : monthlyCut(state.plan, cur);
    var month = Math.round(per * state.n);
    document.getElementById("sp-month").textContent = money(month, cur);
    document.getElementById("sp-year").textContent = (state.bill === "y" ? "" : "≈ ") + money(month * 12, cur);
    document.getElementById("sp-approx").hidden = state.bill === "y";
    if (nOut) nOut.textContent = state.n;
    if (range) range.style.setProperty("--fill", ((state.n - 1) / 19 * 100) + "%");
  }

  function render() {
    document.querySelectorAll("[data-amt]:not(#hp-cy):not(#hp-cm)").forEach(function (el) {
      el.textContent = money(amount(el.getAttribute("data-amt"), cur), cur);
    });
    document.querySelectorAll(".sp-cur [data-cur]").forEach(function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-cur") === cur ? "true" : "false");
    });
    renderCalc();
    if (typeof showPlan === "function" && pick) showPlan(picked);
  }

  document.querySelectorAll(".sp-cur [data-cur]").forEach(function (b) {
    b.addEventListener("click", function () { cur = b.getAttribute("data-cur"); render(); });
  });
  document.querySelectorAll(".sp-seg").forEach(function (seg) {
    var group = seg.getAttribute("data-group");
    seg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        state[group] = b.getAttribute("data-v");
        seg.querySelectorAll("button").forEach(function (o) { o.setAttribute("aria-checked", o === b ? "true" : "false"); });
        renderCalc();
      });
    });
  });
  if (range) range.addEventListener("input", function () { state.n = +range.value; renderCalc(); });

  // Hero: the coin stacks (assets/hairline/coins.js) and the card beside them name the same plan.
  // The figure's read-out says which stack the pointer is on; a tab walks the figure's pointer there.
  var pick = document.querySelector(".sp-pick"), picked = "smart";
  var STACK = { menu: [134, 150], order: [200, 162], smart: [268, 172] };
  function showPlan(plan) {
    if (!pick) return;
    picked = plan;
    var cy = document.getElementById("hp-cy"), cm = document.getElementById("hp-cm");
    cy.setAttribute("data-amt", plan + ".cy"); cm.setAttribute("data-amt", plan + ".cm");
    cy.textContent = money(YEARLY[cur][plan], cur);
    cm.textContent = money(monthlyCut(plan, cur), cur);
    document.getElementById("hp-pct").textContent = pick.getAttribute(plan === "menu" ? "data-p100" : "data-p50");
    pick.querySelectorAll(".sp-pick-tabs button").forEach(function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-v") === plan ? "true" : "false");
    });
    pick.classList.remove("flip"); void pick.offsetWidth; pick.classList.add("flip");
  }
  if (pick) {
    var out = document.querySelector("[data-hl-read]");
    if (out && "MutationObserver" in window) {
      new MutationObserver(function () {
        var name = out.textContent.trim().toLowerCase();
        if (STACK[name] && name !== picked) showPlan(name);
      }).observe(out, { childList: true, characterData: true, subtree: true });
    }
    pick.querySelectorAll(".sp-pick-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        var plan = b.getAttribute("data-v"), stage = document.querySelector("[data-hl-stage]");
        showPlan(plan);
        // a pointer event at that stack's viewBox point: the figure answers as it does to a hand
        if (stage && window.PointerEvent) {
          var r = stage.getBoundingClientRect(), at = STACK[plan];
          stage.dispatchEvent(new PointerEvent("pointermove", {
            clientX: r.left + at[0] / 400 * r.width, clientY: r.top + at[1] / 320 * r.height, pointerType: "mouse", bubbles: true
          }));
        }
      });
    });
  }

  render();
})();
