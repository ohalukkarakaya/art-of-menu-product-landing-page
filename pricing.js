// Plan prices, shared by index.html and gun.html.
// Turkey pays in lira, Europe in euro, every other country in US dollars (per branch).
// [monthly, yearly]; yearly is 12 months for the price of 10.
(function () {
  "use strict";

  var PRICES = {
    TRY: { menu: [399, 3990], order: [999, 9990], smart: [1999, 19990] },
    EUR: { menu: [9, 90],     order: [29, 290],   smart: [59, 590] },
    USD: { menu: [12, 120],   order: [35, 350],   smart: [69, 690] }
  };

  // European countries (EU, EEA, UK, Switzerland and the rest of geographic Europe) pay in euro.
  var EUROPE = ("AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GI GR HR HU IE IS IT LI LT LU LV " +
    "MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM UA VA XK").split(" ");

  function currency(lang) {
    var forced = new URLSearchParams(location.search).get("cur");
    if (forced && PRICES[forced]) return forced;
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var region = (String(list[i]).split("-")[1] || "").toUpperCase();
      if (region === "TR") return "TRY";
      if (region && EUROPE.indexOf(region) !== -1) return "EUR";
      if (region) return "USD";
    }
    // No region in the browser language: fall back on the page language.
    return lang === "tr" ? "TRY" : lang === "de" ? "EUR" : "USD";
  }

  function format(value, cur, lang) {
    if (cur === "TRY") return new Intl.NumberFormat("tr-TR").format(value) + " ₺";
    var locale = cur === "EUR" ? (lang === "en" ? "en-IE" : lang === "tr" ? "tr-TR" : "de-DE") : (lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US");
    return new Intl.NumberFormat(locale, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(value);
  }

  var billing = "monthly";

  // root: element containing [data-billing] buttons and [data-price] slots; t: key -> text
  function render(root, lang, t) {
    var cur = currency(lang);
    root.querySelectorAll("[data-price]").forEach(function (el) {
      var p = PRICES[cur][el.dataset.price];
      var yearly = billing === "yearly";
      el.querySelector(".price-amount").textContent = format(yearly ? p[1] : p[0], cur, lang);
      el.querySelector(".price-per").textContent = t(yearly ? "price.perYear" : "price.perMonth");
    });
    root.querySelectorAll("[data-billing]").forEach(function (b) {
      var on = b.dataset.billing === billing;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    var group = root.querySelector(".billing");
    if (group) group.style.setProperty("--bi", billing === "yearly" ? 1 : 0);
  }

  function init(root, lang, t) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-billing]"));
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { billing = b.dataset.billing; render(root, lang, t); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var next = buttons[(i + 1) % buttons.length];
        billing = next.dataset.billing; render(root, lang, t); next.focus();
      });
    });
    render(root, lang, t);
    return function (newLang, newT) { lang = newLang; t = newT; render(root, lang, t); };
  }

  window.AOM_PRICING = { init: init };
})();
