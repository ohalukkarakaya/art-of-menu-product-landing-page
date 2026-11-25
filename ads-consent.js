/* Google Ads: consent first, one tag shared by landing and checkout panel.
 * Do not load analytics scripts until the visitor explicitly agrees. */
(function () {
  var id = 'AW-18575145707';
  var name = 'aom_ads_consent';
  // Consent is asked of every ad visitor, wherever they are (KVKK and GDPR
  // alike). An older country-only exemption ('outside') never counts as a yes.
  if (get() === 'outside') set('unset');
  function activateForAd() {
    if (get() === 'yes') { load(); return; }
    if (get() === 'no') return;
    if (!fromAdClick()) return;
    banner();
  }
  // A regular visitor must never see this prompt just because they opened the site.
  // Google Ads adds one of these click identifiers to actual ad landing URLs.
  function fromAdClick() {
    var q = new URLSearchParams(window.location.search);
    return ['gclid', 'gbraid', 'wbraid', 'gad_source', 'oppref'].some(function (key) { return q.has(key); });
  }
  function get() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? match[1] : null;
  }
  function set(value) {
    var domain = /(?:^|\.)artofmenu\.com$/.test(location.hostname) ? '; Domain=artofmenu.com' : '';
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + value + '; Max-Age=15552000; Path=/; SameSite=Lax' + domain + secure;
  }
  // The Google tag and consent defaults are initialized in the HTML head.
  // Keep the existing Tag Manager container for any separately configured tags.
  function initializeTag() {
    if (window.aomAdsTagLoaded) return;
    window.aomAdsTagLoaded = true;
    var manager = document.createElement('script');
    manager.async = true;
    manager.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-MVXKJN6B';
    document.head.appendChild(manager);
  }
  function load() {
    initializeTag();
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    // Only persist an ad-click reference after consent, across landing and app.
    var ref = new URLSearchParams(location.search).get('oppref');
    if (ref && /^[A-Za-z0-9._~-]{1,512}$/.test(ref)) {
      var domain = /(?:^|\.)artofmenu\.com$/.test(location.hostname) ? '; Domain=artofmenu.com' : '';
      document.cookie = 'aom_openai_oppref=' + ref + '; Max-Age=2592000; Path=/; SameSite=Lax' +
        domain + (location.protocol === 'https:' ? '; Secure' : '');
    }
    if (!window.aomOpenAiPixelLoaded) {
      window.aomOpenAiPixelLoaded = true;
      (function (w,d,s,u) {
        if (w.oaiq) return;
        var q = function () { q.q.push(arguments); }; q.q = []; w.oaiq = q;
        var j = d.createElement(s); j.async = true; j.src = u;
        var f = d.getElementsByTagName(s)[0]; f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'https://bzrcdn.openai.com/sdk/oaiq.min.js');
      window.oaiq('init', { pixelId: '4xRcQJ5LMEyLucP6C7SMai', debug: false });
    }
  }
  function banner() {
    if (document.getElementById('aom-ad-consent')) return;
    var tr = (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('tr');
    var de = (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('de');
    var message = tr ? 'Reklam performansını ölçmek için Google Ads ve ChatGPT reklam çerezlerine izin verir misin?'
      : de ? 'Dürfen wir Google Ads- und ChatGPT-Werbe-Cookies nutzen, um die Wirksamkeit unserer Werbung zu messen?'
      : 'May we use Google Ads and ChatGPT advertising cookies to measure ad effectiveness?';
    var yes = tr ? 'İzin ver' : de ? 'Zustimmen' : 'Allow';
    var no = tr ? 'Reddet' : de ? 'Ablehnen' : 'Decline';
    var bar = document.createElement('div');
    bar.id = 'aom-ad-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Google Ads');
    bar.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:560px;margin:auto;z-index:2147483000;background:#fff;color:#1d2532;border:1px solid #dfe3ea;border-radius:16px;padding:16px;box-shadow:0 8px 32px #0002;font:14px/1.5 system-ui,sans-serif;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
    var p = document.createElement('span');
    p.textContent = message; p.style.flex = '1 1 240px';
    bar.appendChild(p);
    [[no, 'no'], [yes, 'yes']].forEach(function (choice) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = choice[0];
      b.style.cssText = 'background:' + (choice[1] === 'yes' ? '#283f97' : '#f3f5f8') + ';color:' + (choice[1] === 'yes' ? '#fff' : '#243247') + ';border:0;border-radius:9px;padding:9px 13px;cursor:pointer;font:inherit';
      b.onclick = function () { set(choice[1]); bar.remove(); if (choice[1] === 'yes') load(); };
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
  }
  // Marketing site: only an actual ad click can start attribution or prompt.
  initializeTag();
  if (fromAdClick() || get() === 'yes') activateForAd();
}());

/* Meta ad clicks: carry fbclid from the landing to the panel.
 * Meta adds ?fbclid=… only to the landing URL. The panel reads it from its own
 * address (src/lib/metaPixel.ts) and turns it into _fbc only after consent, so
 * here it is only passed along: no cookie, kept in this tab while the visitor
 * moves between landing pages. */
(function () {
  var KEY = 'aom_fbclid';
  var VALID = /^[A-Za-z0-9_-]{8,500}$/;
  var fbclid = null;
  try {
    var fromUrl = new URLSearchParams(location.search).get('fbclid');
    if (fromUrl && VALID.test(fromUrl)) sessionStorage.setItem(KEY, fromUrl);
    fbclid = sessionStorage.getItem(KEY);
  } catch (e) {
    var direct = new URLSearchParams(location.search).get('fbclid');
    fbclid = direct && VALID.test(direct) ? direct : null;
  }
  if (!fbclid || !VALID.test(fbclid)) return;
  // Signup and the sample panel; a guest menu (/m/…) has nothing to attribute.
  document.querySelectorAll('a[href^="https://app.artofmenu.com/"]').forEach(function (a) {
    var url;
    try { url = new URL(a.href); } catch (e) { return; }
    if (url.pathname.indexOf('/m/') === 0) return;
    url.searchParams.set('fbclid', fbclid);
    a.href = url.toString();
  });
}());

/* Meta Pixel on the landing: counts "landing page views" for Meta ads.
 * Same rule as the panel (src/lib/metaPixel.ts): nothing loads without the
 * visitor's explicit yes, stored in the shared aom_marketing_consent cookie, so
 * a choice made here also holds in the panel and is not asked twice. The bar
 * shows only to visitors arriving from a Meta ad click (?fbclid=…). */
(function () {
  var PIXEL_ID = '1493927772620979';
  var CONSENT = 'aom_marketing_consent';
  var VALID = /^[A-Za-z0-9_-]{8,500}$/;
  var onOurDomain = /(?:^|\.)artofmenu\.com$/.test(location.hostname);
  var domain = onOurDomain ? '; Domain=artofmenu.com' : '';
  var secure = location.protocol === 'https:' ? '; Secure' : '';
  var fbclid = new URLSearchParams(location.search).get('fbclid');
  if (!fbclid || !VALID.test(fbclid)) fbclid = null;

  function read(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function consent() { var v = read(CONSENT); return v === 'yes' || v === 'no' ? v : null; }

  var loaded = false;
  function load() {
    if (loaded || consent() !== 'yes') return;
    loaded = true;
    if (fbclid) {
      var fbc = read('_fbc');
      if (!fbc || fbc.slice(-fbclid.length - 1) !== '.' + fbclid)
        document.cookie = '_fbc=fb.1.' + Date.now() + '.' + fbclid + '; Max-Age=7776000; Path=/; SameSite=Lax' + domain + secure;
    }
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('consent', 'grant');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function choose(value) {
    document.cookie = CONSENT + '=' + value + '; Max-Age=15552000; Path=/; SameSite=Lax' + domain + secure;
    if (value === 'yes') load();
  }

  var TEXT = {
    tr: ['Reklamlarımızın etkisini ölçmek için Meta pazarlama çerezlerini kullanmamıza izin verir misin? Reddetmen siteyi ve kaydı etkilemez.', 'Çerez politikası', 'Reddet', 'İzin ver'],
    en: ['May we use Meta marketing cookies to measure our ads? Declining does not affect the site or sign-up.', 'Cookie policy', 'Decline', 'Allow'],
    de: ['Dürfen wir Meta-Marketing-Cookies nutzen, um unsere Werbung zu messen? Ablehnen beeinflusst weder die Website noch die Registrierung.', 'Cookie-Richtlinie', 'Ablehnen', 'Erlauben'],
    es: ['¿Nos permites usar cookies de marketing de Meta para medir nuestros anuncios? Rechazarlas no afecta al sitio ni al registro.', 'Política de cookies', 'Rechazar', 'Permitir'],
    fr: ['Pouvons-nous utiliser les cookies marketing de Meta pour mesurer nos publicités ? Refuser n’affecte ni le site ni l’inscription.', 'Politique de cookies', 'Refuser', 'Autoriser'],
    it: ['Possiamo usare i cookie di marketing di Meta per misurare i nostri annunci? Rifiutare non influisce sul sito né sulla registrazione.', 'Politica sui cookie', 'Rifiuta', 'Consenti']
  };

  function banner() {
    if (document.getElementById('aom-meta-consent')) return;
    // One bar at a time: wait while the Google Ads bar is on screen.
    if (document.getElementById('aom-ad-consent')) {
      var watch = new MutationObserver(function () {
        if (!document.getElementById('aom-ad-consent')) { watch.disconnect(); if (!consent()) banner(); }
      });
      watch.observe(document.body, { childList: true });
      return;
    }
    var lang = (document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
    var t = TEXT[lang] || TEXT.en;
    var bar = document.createElement('div');
    bar.id = 'aom-meta-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', t[1]);
    bar.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;max-width:560px;margin:auto;z-index:2147483000;background:#fff;color:#1d2532;border:1px solid #dfe3ea;border-radius:14px;padding:12px 14px;box-shadow:0 8px 32px #0002;font:13px/1.45 system-ui,sans-serif;display:flex;gap:10px;align-items:center;flex-wrap:wrap';
    var p = document.createElement('span');
    p.style.flex = '1 1 240px';
    p.textContent = t[0] + ' ';
    var a = document.createElement('a');
    a.href = '/legal/cookies/'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = t[1]; a.style.color = '#283f97';
    p.appendChild(a);
    bar.appendChild(p);
    [[t[2], 'no'], [t[3], 'yes']].forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = c[0];
      b.style.cssText = 'background:' + (c[1] === 'yes' ? '#283f97' : '#f3f5f8') + ';color:' + (c[1] === 'yes' ? '#fff' : '#243247') + ';border:0;border-radius:9px;padding:8px 13px;cursor:pointer;font:inherit';
      b.onclick = function () { choose(c[1]); bar.remove(); };
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
  }

  if (consent() === 'yes') load();
  else if (consent() === null && fbclid) banner();
}());
