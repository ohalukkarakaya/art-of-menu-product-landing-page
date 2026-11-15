/* Google Ads: consent first, one tag shared by landing and checkout panel.
 * Do not load analytics scripts until the visitor explicitly agrees. */
(function () {
  var id = 'AW-18575145707';
  var name = 'aom_ads_consent';
  var adsCountryUrl = /^localhost$|^127\.0\.0\.1$/.test(location.hostname)
    ? 'http://127.0.0.1:8080/api/v1/ads/geo'
    : 'https://app.artofmenu.com/api/v1/ads/geo';
  function alreadyAllowed() {
    return get() === 'yes' || get() === 'outside';
  }
  function checkCountry() {
    return fetch(adsCountryUrl, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Country lookup unavailable');
        return response.json();
      }).catch(function () { return null; });
  }
  function activateForAd() {
    if (get() === 'yes') { load(); return; }
    if (get() === 'no') return;
    if (!fromAdClick() && get() !== 'outside') return;
    checkCountry().then(function (data) {
      // Unknown country: do not enable tracking and do not disturb the visitor.
      if (!data || !data.known) return;
      if (data.requires_consent) {
        // A visitor who was outside the EEA may later return from a protected
        // region. A country-only exemption must never serve as consent.
        if (get() === 'outside') set('unset');
        banner();
      }
      else {
        set('outside');
        load();
      }
    });
  }
  // A regular visitor must never see this prompt just because they opened the site.
  // Google Ads adds one of these click identifiers to actual ad landing URLs.
  function fromAdClick() {
    var q = new URLSearchParams(window.location.search);
    return ['gclid', 'gbraid', 'wbraid', 'gad_source'].some(function (key) { return q.has(key); });
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
  function load() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }
  function banner() {
    if (document.getElementById('aom-ad-consent')) return;
    var tr = (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('tr');
    var de = (document.documentElement.lang || navigator.language || '').toLowerCase().startsWith('de');
    var message = tr ? 'Reklamların işe yarayıp yaramadığını ölçmek için Google Ads çerezlerine izin verir misin?'
      : de ? 'Dürfen wir Google Ads-Cookies verwenden, um die Wirksamkeit unserer Werbung zu messen?'
      : 'May we use Google Ads cookies to measure the effectiveness of our advertising?';
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
  if (fromAdClick()) activateForAd();
}());
