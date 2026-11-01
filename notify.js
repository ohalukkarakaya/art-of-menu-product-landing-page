// "Notify me at launch" dialog: name, email, the business on Google Maps and the plan of interest.
// Sends JSON to the Cloudflare Worker in waitlist-worker/ (address and Turnstile key are on the form).
(function () {
  "use strict";

  var dialog = document.getElementById("notify");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var form = document.getElementById("nf-form");
  var done = document.getElementById("nf-done");
  var status = document.getElementById("nf-status");
  var submit = form.querySelector(".nf-submit");
  var endpoint = form.dataset.endpoint, sitekey = form.dataset.sitekey;
  var token = "", widget = null, sending = false;

  function lang() { var l = document.documentElement.lang; return window.GUN_I18N[l] ? l : "en"; }
  function t(key) { return window.GUN_I18N[lang()][key]; }

  // Google Maps place links: maps.app.goo.gl/…, goo.gl/maps/…, g.page/…, share.google/…,
  // g.co/kgs/…, google.<tld>/maps/… and maps.google.<tld>/…
  function isMapsUrl(value) {
    var u;
    try { u = new URL(value.trim()); } catch (e) { return false; }
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    var host = u.hostname.toLowerCase().replace(/^www\./, ""), path = u.pathname;
    if (host === "maps.app.goo.gl" || host === "g.page" || host === "share.google") return true;
    if (host === "goo.gl") return /^\/maps/.test(path);
    if (host === "g.co") return /^\/kgs\//.test(path);
    if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
    return /^google\.[a-z.]+$/.test(host) && /^\/maps/.test(path);
  }

  function say(key, isError) {
    status.textContent = key ? t(key) : "";
    status.classList.toggle("is-error", !!isError);
  }

  // Turnstile is Cloudflare's invisible robot check; it loads only when the dialog first opens
  function loadCheck() {
    if (!sitekey || widget !== null) return;
    widget = false;
    window.aomTurnstileReady = function () {
      widget = window.turnstile.render("#nf-check", {
        sitekey: sitekey, size: "flexible", language: lang(), appearance: "interaction-only",
        callback: function (v) { token = v; },
        "expired-callback": function () { token = ""; },
        "error-callback": function () { token = ""; }
      });
    };
    var s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=aomTurnstileReady";
    s.async = true;
    document.head.appendChild(s);
  }

  function open(plan) {
    form.hidden = false; done.hidden = true; say("");
    if (plan) {
      var radio = form.querySelector('input[name="plan"][value="' + plan + '"]');
      if (radio) radio.checked = true;
    }
    dialog.showModal();
    loadCheck();
  }
  function close() { dialog.close(); }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-notify]");
    if (!trigger) return;
    e.preventDefault();
    open(trigger.dataset.notify);
  });
  dialog.addEventListener("click", function (e) {
    // a click on the dimmed backdrop lands on the dialog itself
    if (e.target === dialog || e.target.closest("[data-nf-close]")) close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    var name = form.fullname.value.trim().replace(/\s+/g, " "), email = form.email.value.trim(), maps = form.maps.value.trim();
    var plan = (form.querySelector('input[name="plan"]:checked') || {}).value || "undecided";
    [form.fullname, form.email, form.maps].forEach(function (f) { f.removeAttribute("aria-invalid"); });
    // first and last name: at least two words
    if (name.length < 3 || name.length > 120 || name.indexOf(" ") < 1) { form.fullname.setAttribute("aria-invalid", "true"); form.fullname.focus(); return say("nf.err.name", true); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { form.email.setAttribute("aria-invalid", "true"); form.email.focus(); return say("nf.err.email", true); }
    if (!isMapsUrl(maps)) { form.maps.setAttribute("aria-invalid", "true"); form.maps.focus(); return say("nf.err.maps", true); }
    if (!form.consent.checked) { form.consent.focus(); return say("nf.err.consent", true); }

    if (!endpoint) {
      // no Worker yet: hand the details to the visitor's mail app
      window.location.href = "mailto:support@artofmenu.com?subject=" + encodeURIComponent("ArtOfMenu launch") +
        "&body=" + encodeURIComponent(name + "\n" + email + "\n" + maps + "\n" + plan + " (" + lang() + ")");
      return;
    }
    if (sitekey && !token) return say("nf.err.check", true);

    sending = true; submit.disabled = true; say("nf.sending");
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, email: email, maps: maps, plan: plan, lang: lang(), consent: true, website: form.website.value, token: token })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, status: res.status, body: body }; });
    }).then(function (r) {
      if (r.ok) { form.hidden = true; done.hidden = false; form.reset(); return; }
      var map = { name: "nf.err.name", email: "nf.err.email", maps: "nf.err.maps", consent: "nf.err.consent", check: "nf.err.check" };
      say(r.status === 429 ? "nf.err.many" : map[r.body.error] || "nf.err.send", true);
    }).catch(function () {
      say("nf.err.send", true);
    }).then(function () {
      sending = false; submit.disabled = false; token = "";
      if (widget && window.turnstile) window.turnstile.reset(widget);
    });
  });
})();
