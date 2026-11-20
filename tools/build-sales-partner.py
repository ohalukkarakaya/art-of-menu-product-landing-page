#!/usr/bin/env python3
"""Build the six sales-partner pages from tools/sales-partner/template.html and <lang>.json.

Only writes the partner landing pages, not the main site or sitemap. The /sales-partner/
entry point is a separate, language-detecting static file.

In the strings, {plan.kind} (menu|order|smart . pm|py|cm|cy) becomes an amount that
assets/seo/partner.js keeps in the visitor's currency; the page's own currency is written
in statically so the page reads right without script.
"""
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "tools/sales-partner"
ROUTES = {
    "tr": "tr/satis-ortakligi",
    "en": "en/sales-partner",
    "de": "de/vertriebspartner",
    "es": "es/socios-comerciales",
    "it": "it/partner-commerciali",
    "fr": "fr/partenaires-commerciaux",
}
NAMES = {"tr": "Türkçe", "en": "English", "de": "Deutsch", "es": "Español", "it": "Italiano", "fr": "Français"}
OG_LOCALES = {"tr": "tr_TR", "en": "en_US", "de": "de_DE", "es": "es_ES", "it": "it_IT", "fr": "fr_FR"}
# The currency a page shows before script runs: pricing.js's fallback for the page language.
PAGE_CUR = {"tr": "TRY", "en": "USD", "de": "EUR", "es": "EUR", "it": "EUR", "fr": "EUR"}

# Mirrors assets/seo/partner.js (prices from pricing.js, fixed yearly commissions from the partner terms).
PRICES = {"TRY": {"menu": (399, 3990), "order": (999, 9990), "smart": (1999, 19990)},
          "EUR": {"menu": (9, 90), "order": (29, 290), "smart": (59, 590)},
          "USD": {"menu": (12, 120), "order": (35, 350), "smart": (69, 690)}}
YEARLY = {"TRY": {"menu": 665, "order": 1033.45, "smart": 3388.14},
          "EUR": {"menu": 15, "order": 30, "smart": 100},
          "USD": {"menu": 20, "order": 36.21, "smart": 116.95}}
SHARE = {"menu": 1, "order": 0.5, "smart": 0.5}
NET, STEP = 0.97 / 1.2, {"TRY": 5, "EUR": 1, "USD": 1}


def amount(key, cur):
    plan, kind = key.split(".")
    if kind == "pm":
        return PRICES[cur][plan][0]
    if kind == "py":
        return PRICES[cur][plan][1]
    if kind == "cm":
        s = STEP[cur]
        return round(PRICES[cur][plan][0] * NET * SHARE[plan] / s) * s
    return YEARLY[cur][plan]


def money(v, cur, lang):
    """Close to what Intl gives in partner.js, so nothing jumps when script takes over."""
    cents = round(v * 100) % 100 != 0
    whole, frac = f"{v:,.2f}".split(".")
    dot = lang == "en" and cur != "TRY"
    whole = whole.replace(",", "," if dot else (" " if lang == "fr" and cur != "TRY" else "."))
    num = whole + ((("." if dot else ",") + frac) if cents else "")
    if cur == "TRY":
        return num + " ₺"
    sym = "€" if cur == "EUR" else "$"
    return sym + num if lang == "en" else num + " " + sym


def fill(text, lang):
    cur = PAGE_CUR[lang]
    return re.sub(r"\{(menu|order|smart)\.(pm|py|cm|cy)\}",
                  lambda m: f'<span data-amt="{m[1]}.{m[2]}">{money(amount(m[1] + "." + m[2], cur), cur, lang)}</span>', text)


def short_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


def build():
    template = (SRC / "template.html").read_text(encoding="utf-8")
    versions = {"v.css": short_hash(ROOT / "assets/seo/partner.css"),
                "v.js": short_hash(ROOT / "assets/seo/partner.js"),
                "v.fig": short_hash(ROOT / "assets/hairline/coins.js")}
    hreflang = "\n".join(f'  <link rel="alternate" hreflang="{l}" href="https://artofmenu.com/{r}/">' for l, r in ROUTES.items())
    hreflang += '\n  <link rel="alternate" hreflang="x-default" href="https://artofmenu.com/sales-partner/">'
    tr = json.loads((SRC / "tr.json").read_text(encoding="utf-8"))
    for lang, route in ROUTES.items():
        strings = json.loads((SRC / f"{lang}.json").read_text(encoding="utf-8"))
        missing = sorted(set(tr) - set(strings))
        if missing:
            raise SystemExit(f"{lang}.json is missing: {', '.join(missing)}")
        values = {k: fill(v, lang) for k, v in strings.items()}
        # these sit inside attributes: plain text, escaped
        for k in ("meta.title", "meta.desc", "meta.ogtitle", "meta.ogdesc", "hero.art", "earn.fig"):
            values[k] = html.escape(re.sub(r"<[^>]+>", "", strings[k]), quote=True)
        current = ' aria-current="page"'
        langlinks = "".join(
            f'<li><a href="/{r}/" hreflang="{l}" lang="{l}"{current if l == lang else ""}>{NAMES[l]}</a></li>'
            for l, r in ROUTES.items())
        values.update(versions)
        values.update({"lang": lang, "lang.upper": lang.upper(), "url": f"https://artofmenu.com/{route}/",
                       "og.locale": OG_LOCALES[lang], "cur": PAGE_CUR[lang], "hreflang": hreflang, "langlinks": langlinks})

        def sub(m):
            if m[1] not in values:
                raise SystemExit(f"{lang}: no string for {{{{{m[1]}}}}}")
            return values[m[1]]

        page = re.sub(r"\{\{([a-z0-9.]+)\}\}", sub, template)
        # amount slots in the template are written in too, in the page's currency
        cur = PAGE_CUR[lang]
        page = re.sub(r'(data-amt="(\w+\.\w+)">)(</)',
                      lambda m: m[1] + money(amount(m[2], cur), cur, lang) + m[3], page)
        out = ROOT / route / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page, encoding="utf-8")
        print(f"Wrote /{route}/")


if __name__ == "__main__":
    build()
