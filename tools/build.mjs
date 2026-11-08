#!/usr/bin/env node
// Builds the static SEO layer of artofmenu.com. No dependencies: run `node tools/build.mjs`.
//
//   /<lang>/              the 3D homepage with its language fixed and its text already in the HTML
//   /<lang>/<slug>/       one topic page per search intent, from seo/content/<lang>.json (see seo/brief.md)
//   /sitemap.xml, /robots.txt, /llms.txt, /404.html, and the SEO blocks inside /index.html
//
// The copy comes from i18n.js, gun-i18n.js and seo/content/*.json; edit those, then run this again.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://artofmenu.com";
const LANGS = ["tr", "en", "de", "es", "it", "fr"];
const LOCALE = { tr: "tr_TR", en: "en_US", de: "de_DE", es: "es_ES", it: "it_IT", fr: "fr_FR" };
const CURRENCY = { tr: "TRY", en: "USD", de: "EUR", es: "EUR", it: "EUR", fr: "EUR" };
const PRICES = { TRY: { menu: 399, order: 999, smart: 1999 }, EUR: { menu: 9, order: 29, smart: 59 }, USD: { menu: 12, order: 35, smart: 69 } };
const TODAY = new Date().toISOString().slice(0, 10);
const INTENTS = ["qr-menu", "pricing", "restaurant", "cafe", "bar", "design", "smart", "ordering", "multilingual",
  "restaurant-sales", "bar-sales", "cafe-sales", "menu-engineering", "inventory", "how-to"];
const GUIDES = new Set(["restaurant-sales", "bar-sales", "cafe-sales", "menu-engineering", "inventory", "how-to"]);
const UPDATED = { tr: "Güncellendi", en: "Updated", de: "Aktualisiert", es: "Actualizado", it: "Aggiornato", fr: "Mis à jour" };
const TEAM = { tr: "ArtOfMenu ekibi", en: "The ArtOfMenu team", de: "Das ArtOfMenu-Team", es: "El equipo de ArtOfMenu", it: "Il team di ArtOfMenu", fr: "L'équipe ArtOfMenu" };
const TABLE = { tr: "Masa", en: "Table", de: "Tisch", es: "Mesa", it: "Tavolo", fr: "Table" };
const HOW = { tr: "Nasıl çalıştığını görün", en: "See how it works", de: "So funktioniert es", es: "Mira cómo funciona", it: "Guarda come funziona", fr: "Voir comment ça marche" };

// Pictures: one for each page's hero, one for each feature card
const HERO = {
  "qr-menu": "diorama/planet.webp", pricing: "mino-point.webp", restaurant: "diorama/lunch-restaurant.webp",
  cafe: "diorama/morning-cafe.webp", bar: "diorama/night-close.webp", design: "mino-proud.webp",
  smart: "diorama/rain-evening.webp", ordering: "story-order.webp", multilingual: "story-scan.webp",
  "restaurant-sales": "story-pair.webp", "bar-sales": "smart-night.webp", "cafe-sales": "diorama/bakery.webp",
  "menu-engineering": "story-weather.webp", inventory: "mino-wave.webp", "how-to": "hero-phone.webp",
};
const FEATURE_IMG = {
  multilingual: "p-qr.webp", ordering: "p-bell.webp", weather: "p-latte.webp", pairing: "p-cheesecake.webp",
  pricing: "smart-night.webp", pdf: "f-pdf.webp", stock: "f-stock.webp", reports: "f-reports.webp",
  screens: "f-screens.webp", domain: "f-design.webp", global: "p-coins.webp",
};
const DIMS = {
  "diorama/bakery.webp": [1100, 1090], "diorama/lunch-restaurant.webp": [1100, 1088], "diorama/morning-cafe.webp": [1100, 1092],
  "diorama/night-close.webp": [1100, 1082], "diorama/planet.webp": [1100, 1072], "diorama/rain-evening.webp": [1100, 1096],
  "f-design.webp": [451, 413], "f-pdf.webp": [421, 433], "f-reports.webp": [447, 391], "f-screens.webp": [520, 403],
  "f-stock.webp": [332, 469], "hero-phone.webp": [984, 1200], "mino-point.webp": [337, 760], "mino-proud.webp": [311, 760],
  "mino-wave.webp": [367, 760], "p-bell.webp": [373, 315], "p-cheesecake.webp": [458, 344], "p-coins.webp": [316, 303],
  "p-latte.webp": [446, 353], "p-qr.webp": [357, 355], "smart-night.webp": [787, 1200], "story-order.webp": [820, 1200],
  "story-pair.webp": [1200, 896], "story-scan.webp": [782, 1200], "story-weather.webp": [797, 1200],
};

/* ---------- inputs ---------- */

const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ["i18n.js", "gun-i18n.js"]) vm.runInContext(read(f), sandbox);
const MAIN = sandbox.window.AOM_I18N, GUN = sandbox.window.GUN_I18N;
const tr = (l) => (k) => (GUN[l] && k in GUN[l] ? GUN[l][k] : MAIN[l] && k in MAIN[l] ? MAIN[l][k] : GUN.en[k] ?? MAIN.en[k]);

const CONTENT = {};
for (const l of LANGS) {
  const f = `seo/content/${l}.json`;
  if (!fs.existsSync(path.join(ROOT, f))) { console.warn(`! ${f} is missing: no topic pages for ${l}`); continue; }
  CONTENT[l] = JSON.parse(read(f));
  const missing = INTENTS.filter((k) => !CONTENT[l].pages[k]);
  if (missing.length) console.warn(`! ${f} has no page for: ${missing.join(", ")}`);
}

// cache-busting: each asset's URL carries a short hash of its content
const hashes = {};
const asset = (p) => (hashes[p] ??= crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, p))).digest("hex").slice(0, 8), `/${p}?v=${hashes[p]}`);

/* ---------- helpers ---------- */

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const home = (l) => `/${l}/`;
const has = (l, k) => !!(CONTENT[l] && CONTENT[l].pages[k]);
const pageUrl = (l, k) => `/${l}/${CONTENT[l].pages[k].slug}/`;
const short = (title) => title.replace(/\s*[|·–—:-]\s*ArtOfMenu\s*$/i, "").replace(/^ArtOfMenu\s*[|·–—:-]\s*/i, "").trim();
const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const img = (file, alt, extra = "") => {
  const [w, h] = DIMS[file] || [800, 800];
  return `<img src="/assets/web/${file}" alt="${esc(alt)}" width="${w}" height="${h}"${extra}>`;
};
const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const GLOBE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
/** Every call to action opens the panel, where a business signs up. */
const APP = "https://app.artofmenu.com/#/signup";
const cta = (label, extra = "") => `<a class="cta" href="${APP}"${extra}><span class="l">${esc(label)}</span><span class="cta-arrow">${ARROW}</span></a>`;

function alternates(urlFor, x) {
  const out = LANGS.filter((l) => urlFor(l)).map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${urlFor(l)}">`);
  if (x) out.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${x}">`);
  return out.join("\n  ");
}

const ORG = {
  "@type": "Organization", "@id": `${SITE}/#org`, name: "ArtOfMenu", alternateName: "Art of Menu", url: `${SITE}/`,
  description: "ArtOfMenu makes QR menu, table ordering and smart daily pricing software for cafés, restaurants, bars and bakeries. A product of Göktigin.",
  logo: `${SITE}/assets/brand/icon-512.png`,
  parentOrganization: { "@type": "Organization", name: "Göktigin", url: "https://goktigin.com" },
};
function app(l) {
  const cur = CURRENCY[l], t = tr(l);
  return {
    "@type": "SoftwareApplication", "@id": `${SITE}/#app`, name: "ArtOfMenu", url: `${SITE}${home(l)}`,
    applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: l,
    description: t("meta.desc"), publisher: { "@id": ORG["@id"] },
    offers: ["menu", "order", "smart"].map((p) => ({
      "@type": "Offer", name: p[0].toUpperCase() + p.slice(1), price: String(PRICES[cur][p]), priceCurrency: cur,
      availability: "https://schema.org/PreOrder", description: t(`p.${p}.tag`),
      // a subscription per branch, billed monthly: not a one-off price
      priceSpecification: { "@type": "UnitPriceSpecification", price: String(PRICES[cur][p]), priceCurrency: cur, billingDuration: "P1M", unitText: "per branch per month" },
    })),
  };
}


/* ---------- topic pages ---------- */

function topicPage(l, key) {
  const C = CONTENT[l], ui = C.ui, pg = C.pages[key], t = tr(l), url = pageUrl(l, key), guide = GUIDES.has(key);
  const otherLangs = LANGS.filter((o) => has(o, key));
  const heroFile = HERO[key];
  const plansItems = (p) => (ui.plans?.[p]?.items || []).map((s) => `<li>${esc(s)}</li>`).join("");

  const sections = (pg.sections || []).map((s) => `
      <section data-reveal>
        <h2>${esc(s.h2)}</h2>
        ${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join("\n        ")}
        ${s.bullets && s.bullets.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      </section>`).join("");

  const steps = pg.steps && pg.steps.items && pg.steps.items.length ? `
  <section class="steps" aria-labelledby="steps-title">
    <div class="wrap" data-reveal>
      <h2 id="steps-title">${esc(pg.steps.h2)}</h2>
      <ol>${pg.steps.items.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join("")}</ol>
    </div>
  </section>` : "";

  const feats = (pg.features || []).filter((f) => ui.features?.[f]).map((f) => `
        <article class="feat" data-reveal>${img(FEATURE_IMG[f], "", ' loading="lazy" decoding="async"')}<h3>${esc(ui.features[f].t)}</h3><p>${esc(ui.features[f].d)}</p></article>`).join("");

  const faq = (pg.faq || []).map((f, i) => `
        <details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  const related = (pg.related || []).filter((k) => k !== key && has(l, k)).map((k) => {
    const r = C.pages[k];
    return `<a class="rel" href="${pageUrl(l, k)}"><b>${esc(short(r.title))}</b><span>${esc(r.description)}</span><i>→</i></a>`;
  }).join("");

  const crumbs = [{ name: ui.home, url: home(l) }];
  if (key !== "qr-menu" && has(l, "qr-menu")) crumbs.push({ name: short(C.pages["qr-menu"].title), url: pageUrl(l, "qr-menu") });
  crumbs.push({ name: short(pg.title), url });

  const graph = [
    ORG, app(l),
    { "@type": "WebSite", "@id": `${SITE}/#site`, url: `${SITE}/`, name: "ArtOfMenu", publisher: { "@id": ORG["@id"] }, inLanguage: LANGS },
    {
      "@type": guide ? "Article" : "WebPage", "@id": `${SITE}${url}#page`, url: `${SITE}${url}`, name: pg.title,
      ...(guide ? { headline: pg.h1, author: { "@type": "Organization", name: TEAM[l], url: `${SITE}${home(l)}` }, publisher: { "@id": ORG["@id"] }, datePublished: TODAY, dateModified: TODAY } : {}),
      description: pg.description, inLanguage: l, isPartOf: { "@id": `${SITE}/#site` }, about: { "@id": `${SITE}/#app` },
      breadcrumb: { "@id": `${SITE}${url}#crumbs` }, image: [`${SITE}/assets/web/og-share.jpg`, `${SITE}/assets/web/${heroFile}`],
    },
    { "@type": "BreadcrumbList", "@id": `${SITE}${url}#crumbs`, itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE}${c.url}` })) },
  ];
  if (pg.faq && pg.faq.length) graph.push({ "@type": "FAQPage", "@id": `${SITE}${url}#faq`, mainEntity: pg.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  if (key === "how-to" && pg.steps) graph.push({ "@type": "HowTo", name: pg.steps.h2 || pg.h1, inLanguage: l, step: pg.steps.items.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.t, text: s.d })) });

  const date = new Intl.DateTimeFormat(l, { dateStyle: "long" }).format(new Date(TODAY));
  return `<!doctype html>
<html lang="${l}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(pg.title)}</title>
  <meta name="description" content="${esc(pg.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${SITE}${url}">
  ${alternates((o) => (has(o, key) ? pageUrl(o, key) : null), has("en", key) ? pageUrl("en", key) : null)}
  <meta property="og:type" content="${guide ? "article" : "website"}">
  <meta property="og:site_name" content="ArtOfMenu">
  <meta property="og:title" content="${esc(pg.title)}">
  <meta property="og:description" content="${esc(pg.description)}">
  <meta property="og:url" content="${SITE}${url}">
  <meta property="og:image" content="${SITE}/assets/web/og-share.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta property="og:image:alt" content="ArtOfMenu">
  <meta name="twitter:image" content="${SITE}/assets/web/og-share.jpg">
  <meta property="og:locale" content="${LOCALE[l]}">
  ${otherLangs.filter((o) => o !== l).map((o) => `<meta property="og:locale:alternate" content="${LOCALE[o]}">`).join("\n  ")}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#FBFBFD">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/assets/brand/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" as="image" href="/assets/web/${heroFile}" fetchpriority="high">
  <link rel="stylesheet" href="${asset("assets/seo/seo.css")}">
  <script>document.documentElement.classList.add("js");</script>
  <script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<header class="top">
  <div class="wrap top-in">
    <a class="top-logo" href="${home(l)}" aria-label="ArtOfMenu"><img src="/assets/brand/logo-aom.webp" alt="ArtOfMenu" width="900" height="391"></a>
    <nav class="top-nav" aria-label="ArtOfMenu">
      <a class="hide-s" href="${home(l)}">${esc(ui.home)}</a>
      <a class="hide-s" href="#plans">${esc(ui.pricing)}</a>
      <details class="langs">
        <summary aria-label="${esc(ui.languages)}">${GLOBE}<span>${l.toUpperCase()}</span></summary>
        <ul>${otherLangs.map((o) => `<li><a href="${pageUrl(o, key)}" hreflang="${o}" lang="${o}"${o === l ? ' aria-current="page"' : ""}>${esc(CONTENT[o].ui.langName)}</a></li>`).join("")}</ul>
      </details>
      <a class="cta small" href="${APP}"><span class="l">${esc(ui.notify)}</span><span class="cta-arrow">${ARROW}</span></a>
    </nav>
  </div>
</header>

<main id="main">
  <nav class="wrap crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<li><a href="${c.url}">${esc(c.name)}</a></li>` : `<li aria-current="page">${esc(c.name)}</li>`)).join("")}</ol></nav>

  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="eyebrow"><span class="soon">${esc(ui.soon)}</span>${esc(pg.eyebrow)}</p>
        <h1>${esc(pg.h1)}</h1>
        <p class="lead">${esc(pg.lead)}</p>
        <div class="hero-actions">
          ${cta(ui.notify)}
          <a class="ghost-link" href="${home(l)}">${esc(HOW[l])}</a>
        </div>
      </div>
      <div class="hero-art">${img(heroFile, "", ' fetchpriority="high"')}</div>
    </div>
  </section>

  <section class="answer read" aria-label="${esc(ui.answerLabel)}">
    <div class="answer-card"><b>${esc(ui.answerLabel)}</b><p>${esc(pg.answer)}</p></div>
  </section>

  <article class="body read">${sections}
      ${guide ? `<p class="updated" style="margin-top:40px;font-size:14px;color:var(--muted)">${esc(UPDATED[l])}: <time datetime="${TODAY}">${esc(date)}</time> · ${esc(TEAM[l])}</p>` : ""}
  </article>
${steps}
  ${feats ? `<section class="feats" aria-labelledby="feats-title">
    <div class="wrap">
      <h2 id="feats-title" data-reveal>${esc(ui.featuresTitle)}</h2>
      <div class="feat-grid">${feats}
      </div>
    </div>
  </section>` : ""}

  <section class="plans" id="plans" aria-labelledby="plans-title">
    <div class="wrap">
      <h2 id="plans-title" data-reveal>${esc(ui.plansTitle)}</h2>
      <p class="sub">${esc(ui.plansLead)}</p>
      <div class="billing" role="radiogroup" aria-label="${esc(t("price.label"))}">
        <span class="billing-bg" aria-hidden="true"></span>
        <button type="button" role="radio" data-billing="monthly" aria-checked="true">${esc(t("price.monthly"))}</button>
        <button type="button" role="radio" data-billing="yearly" aria-checked="false"><span>${esc(t("price.yearly"))}</span> <span class="billing-save">${esc(t("price.save"))}</span></button>
      </div>
      <div class="plan-grid">
        ${["menu", "order", "smart"].map((p) => `<article class="plan${p === "smart" ? " hl" : ""}" data-reveal>
          <h3>${p[0].toUpperCase() + p.slice(1)}</h3>
          <p class="tag">${esc(ui.plans?.[p]?.tag || t(`p.${p}.tag`))}</p>
          <p class="price" data-price="${p}"><span class="price-amount">${esc(priceText(l, p))}</span><span class="price-per">${esc(t("price.perMonth"))}</span></p>
          <ul>${plansItems(p)}</ul>
        </article>`).join("\n        ")}
      </div>
      <p class="note">${esc(t("plans.note"))}</p>
    </div>
  </section>

  ${faq ? `<section class="faq" aria-labelledby="faq-title">
    <div class="read">
      <h2 id="faq-title" data-reveal>${esc(ui.faqTitle)}</h2>
      <div class="faq-list">${faq}
      </div>
    </div>
  </section>` : ""}

  <section class="closing">
    <div class="wrap closing-in" data-reveal>
      <div>
        <h2>${esc(pg.cta?.h2 || ui.notify)}</h2>
        <p>${esc(pg.cta?.lead || "")}</p>
        ${cta(ui.notify, " data-hl-play")}
      </div>
      <div class="figure"><span class="figure-read" data-hl-read data-word="${esc(TABLE[l])}" aria-hidden="true"></span><div data-hl-stage data-label="${esc(pg.eyebrow)}"></div></div>
    </div>
  </section>

  ${related ? `<section class="related" aria-labelledby="rel-title">
    <div class="wrap">
      <h2 id="rel-title" data-reveal>${esc(ui.relatedTitle)}</h2>
      <div class="rel-grid">${related}</div>
    </div>
  </section>` : ""}
</main>

${footer(l, (o) => (has(o, key) ? pageUrl(o, key) : null))}


<script src="${asset("i18n.js")}"></script>
<script src="${asset("gun-i18n.js")}"></script>
<script src="${asset("pricing.js")}"></script>
<script src="${asset("assets/seo/seo.js")}"></script>
<script src="${asset("assets/hairline/kernel.js")}"></script>
<script type="module" src="${asset("assets/hairline/stands.js")}"></script>
</body>
</html>
`;
}

function priceText(l, p) {
  const cur = CURRENCY[l], v = PRICES[cur][p];
  if (cur === "TRY") return new Intl.NumberFormat("tr-TR").format(v) + " ₺";
  const loc = cur === "EUR" ? ({ en: "en-IE", tr: "tr-TR" }[l] || `${l}-${l.toUpperCase()}`) : "en-US";
  return new Intl.NumberFormat(loc, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
}

function footer(l, sameIn) {
  const C = CONTENT[l], ui = C.ui;
  const pages = INTENTS.filter((k) => has(l, k)).map((k) => `<li><a href="${pageUrl(l, k)}">${esc(short(C.pages[k].title))}</a></li>`).join("");
  const langs = LANGS.filter((o) => CONTENT[o]).map((o) => `<li><a href="${sameIn(o) || home(o)}" hreflang="${o}" lang="${o}">${esc(CONTENT[o].ui.langName)}</a></li>`).join("");
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div><a class="foot-logo" href="${home(l)}" aria-label="ArtOfMenu"><picture><source srcset="/assets/brand/logo-white.webp" type="image/webp"><img src="/assets/brand/logo-white.png" alt="ArtOfMenu" width="900" height="682" decoding="async"></picture></a><p class="tag">${esc(ui.footerTagline)}</p></div>
      <nav class="foot-pages" aria-label="${esc(ui.allPages)}"><h2>${esc(ui.allPages)}</h2><ul>${pages}</ul></nav>
      <nav aria-label="${esc(ui.languages)}"><h2>${esc(ui.languages)}</h2><ul>${langs}</ul></nav>
    </div>
    <p class="foot-copy">© 2026 <a href="https://goktigin.com" target="_blank" rel="noopener">Göktigin</a> · <a href="/legal/?lang=${l}">${({ tr: "Yasal bilgiler", en: "Legal information", de: "Rechtliche Angaben", es: "Información legal", fr: "Informations légales", it: "Informazioni legali" })[l]}</a></p>
  </div>
</footer>`;
}

/* ---------- homepages ---------- */

// the homepage's own scripts and styles get the same content-hash versions as the topic pages
const stamp = (html) => html.replace(/(\s(?:src|href)=")\/?((?:gun|i18n|gun-i18n|pricing)\.(?:js|css))\?v=[^"]*"/g, (m, a, f) => `${a}${asset(f)}"`);

// index.html carries <!--seo:head-->…<!--/seo:head--> and <!--seo:links-->…<!--/seo:links--> blocks that this fills
const fill = (html, name, body) => html.replace(new RegExp(`<!--seo:${name}-->[\\s\\S]*?<!--/seo:${name}-->`), `<!--seo:${name}-->${body}<!--/seo:${name}-->`);

function homeHead(l, url) {
  const graph = [ORG, app(l), { "@type": "WebSite", "@id": `${SITE}/#site`, url: `${SITE}/`, name: "ArtOfMenu", publisher: { "@id": ORG["@id"] }, inLanguage: LANGS }];
  return `
  <link rel="canonical" href="${SITE}${url}">
  ${alternates((o) => home(o), "/")}
  <meta property="og:url" content="${SITE}${url}">
  <meta property="og:site_name" content="ArtOfMenu">
  <meta property="og:locale" content="${LOCALE[l]}">
  ${LANGS.filter((o) => o !== l).map((o) => `<meta property="og:locale:alternate" content="${LOCALE[o]}">`).join("\n  ")}
  <script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": graph })}</script>
  `;
}
function homeLinks(l) {
  if (!l) {
    // the root page can be read in any language: link every language's guide hub
    return LANGS.filter((o) => has(o, "qr-menu")).map((o) => `<a href="${pageUrl(o, "qr-menu")}" hreflang="${o}" lang="${o}">${esc(short(CONTENT[o].pages["qr-menu"].title))}</a>`).join("");
  }
  return INTENTS.filter((k) => has(l, k)).map((k) => `<a href="${pageUrl(l, k)}">${esc(short(CONTENT[l].pages[k].title))}</a>`).join("");
}

function langHome(src, l, root = false) {
  const t = tr(l);
  let html = src.replace(/<html lang="[^"]*"[^>]*>/, root ? `<html lang="${l}">` : `<html lang="${l}" data-lang="${l}">`);
  // the text that gun.js would put in, already in the HTML
  html = html.replace(/(<([a-z0-9]+)\b[^>]*?\sdata-t="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, _txt, close) => {
    const v = t(key);
    return typeof v === "string" ? open + esc(v) + close : m;
  });
  html = html.replace(/(\saria-label=")[^"]*("[^>]*?\sdata-t-aria="([^"]+)")/g, (m, a, b, key) => (typeof t(key) === "string" ? a + esc(t(key)) + b : m));
  // the root, the language-neutral entry, gets a title of its own so it never duplicates /en/
  const title = root ? "ArtOfMenu · " + t("meta.title").replace(/\s*\|\s*ArtOfMenu$/, "") : t("meta.title");
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  // plan prices in the page's own currency, before pricing.js adjusts them to the visitor's region
  html = html.replace(/(<p class="price" data-price="(menu|order|smart)"><span class="price-amount">)[^<]*(<\/span><span class="price-per">)[^<]*(<\/span>)/g,
    (m, a, p, b2, c) => a + esc(priceText(l, p)) + b2 + esc(t("price.perMonth")) + c);
  html = html.replace(/(<meta name="description"[^>]*content=")[^"]*"/, `$1${esc(t("meta.desc"))}"`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(t("meta.desc"))}"`);
  // assets from the site root, since the page lives one folder down
  html = html.replace(/(\s(?:src|href|srcset)=")(?!https?:|#|\/|data:|mailto:)/g, "$1/");
  html = fill(html, "head", homeHead(l, root ? "/" : home(l)));
  html = fill(html, "links", homeLinks(root ? null : l));
  return stamp(html);
}

/* ---------- site files ---------- */

function sitemap() {
  const groups = [];
  groups.push(LANGS.map((l) => ({ l, url: home(l) })).concat([{ l: "x-default", url: "/" }]));
  for (const k of INTENTS) {
    const g = LANGS.filter((l) => has(l, k)).map((l) => ({ l, url: pageUrl(l, k) }));
    if (g.length) groups.push(has("en", k) ? g.concat([{ l: "x-default", url: pageUrl("en", k) }]) : g);
  }
  const entries = [];
  const seen = new Set();
  for (const g of groups) for (const e of g) {
    if (seen.has(e.url)) continue;
    seen.add(e.url);
    entries.push(`  <url>
    <loc>${SITE}${e.url}</loc>
    <lastmod>${TODAY}</lastmod>
${g.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.l}" href="${SITE}${a.url}"/>`).join("\n")}
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
}

function robots() {
  const rules = ["Allow: /", "Disallow: /seo/", "Disallow: /tools/", "Disallow: /waitlist-worker/"].join("\n");
  // AI assistants and their search crawlers are welcome: being read is how ArtOfMenu gets recommended
  const bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User",
    "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "meta-externalagent", "MistralAI-User", "CCBot"];
  return `# ArtOfMenu: QR menus, table ordering and smart daily pricing for cafés, restaurants and bars
User-agent: *
${rules}

${bots.map((b) => `User-agent: ${b}`).join("\n")}
${rules}

Sitemap: ${SITE}/sitemap.xml
`;
}

function llms() {
  const en = tr("en");
  const lines = [
    "# ArtOfMenu",
    "",
    "> ArtOfMenu is a QR menu, table ordering and smart daily pricing service for cafés, restaurants, bars and bakeries, made by Göktigin. It is available now; businesses sign up in the panel at https://app.artofmenu.com.",
    "",
    `Status: available; sign-up at https://app.artofmenu.com. Last updated: ${TODAY}.`,
    "",
    "## Facts",
    "",
    "- Guests scan the QR code on the table and the menu opens automatically in their phone's language, with photos and allergen information. The QR code never changes; the owner updates the menu.",
    "- An existing PDF menu can be put online the same day: the branch's QR code then opens the PDF (one per language; ordering and smart features pause while it is on). The live menu is built in the panel. The menu can run on the business's own domain (every plan).",
    "- Currency, tax display and price rounding are set up for 216 countries.",
    "- Order plan: guests order from the table and waiters see each order instantly on their phones (waiter portal, sign-in by personal link); guests can call the waiter or ask for water or the bill; unlimited tables at no extra cost.",
    "- Smart plan: the menu reorders itself with the weather (hot drinks up when it is cold), suggests the item most often ordered with the one a guest picks, and sets the next day's prices every evening within the minimum and maximum the owner chooses, from the weather forecast, holidays and expected demand. Prices change at most once a day and can be approved one by one, applied automatically, or switched off. Recipe-based stock marks items sold out when an ingredient runs out, and sales reports show what sold.",
    "- Privacy: no cookies, persistent IDs or stored IPs for guests; prices are never shared between businesses. Cancel in one step.",
    "- What it is not: not a POS or payment terminal (it takes no payments), no free plan or trial, no ready-made themes or design service.",
    "",
    "## Plans (per branch, per month; yearly = 12 months for the price of 10)",
    "",
    "- Menu: 399 TRY in Turkey, €9 in Europe, $12 elsewhere. " + en("p.menu.tag") + ".",
    "- Order: 999 TRY, €29, $35. " + en("p.order.tag") + ".",
    "- Smart: 1,999 TRY, €59, $69. " + en("p.smart.tag") + ".",
    "",
    "Pricing pages: " + LANGS.filter((l) => has(l, "pricing")).map((l) => `[${l}](${SITE}${pageUrl(l, "pricing")})`).join(" · "),
    "",
    "## Languages",
    "",
    LANGS.map((l) => `- [${CONTENT[l]?.ui.langName || l}](${SITE}${home(l)})`).join("\n"),
  ];
  for (const l of LANGS) {
    if (!CONTENT[l]) continue;
    lines.push("", `## ${CONTENT[l].ui.langName}`, "");
    for (const k of INTENTS) if (has(l, k)) lines.push(`- [${short(CONTENT[l].pages[k].title)}](${SITE}${pageUrl(l, k)}): ${CONTENT[l].pages[k].description}`);
  }
  return lines.join("\n") + "\n";
}

function notFound() {
  const en = CONTENT.en?.ui, trui = CONTENT.tr?.ui;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ArtOfMenu</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="stylesheet" href="${asset("assets/seo/seo.css")}">
</head>
<body>
<main class="read" style="min-height:80vh;display:grid;place-content:center;gap:18px;text-align:center">
  <img src="/assets/brand/logo-aom.webp" alt="ArtOfMenu" width="900" height="391" style="height:32px;width:auto;margin:auto">
  <h1 style="font-size:40px;letter-spacing:-.04em">404</h1>
  <p style="color:var(--muted)">${LANGS.filter((l) => CONTENT[l]).map((l) => `<a href="${home(l)}" lang="${l}">${esc(CONTENT[l].ui.home)}</a>`).join(" · ")}</p>
</main>
</body>
</html>
`;
}

/* ---------- run ---------- */

const src = read("index.html");
let count = 0;
for (const l of LANGS) {
  if (!GUN[l]) { console.warn(`! gun-i18n.js has no ${l}: no homepage for it`); continue; }
  write(`${l}/index.html`, langHome(src, l)); count++;
  if (!CONTENT[l]) continue;
  for (const k of INTENTS) if (has(l, k)) { write(`${l}/${CONTENT[l].pages[k].slug}/index.html`, topicPage(l, k)); count++; }
}
write("index.html", langHome(src, "en", true));
write("sitemap.xml", sitemap());
write("robots.txt", robots());
write("llms.txt", llms());
write("404.html", notFound());
console.log(`built ${count} pages, sitemap.xml, robots.txt, llms.txt, 404.html`);
