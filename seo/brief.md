# ArtOfMenu SEO pages: content brief

Every language gets the same 15 pages, one per search intent. Pages are linked to each other across
languages with hreflang, so the **intent key** is fixed and the **slug** is localized.
The generator (`tools/build.mjs`) turns `seo/content/<lang>.json` into `/<lang>/<slug>/index.html`
using the Apple-style design of `classic.html`.

Google penalises "scaled content" (many near-identical pages made to rank). So each page must answer
its own query with its own angle, sections and FAQ. Never reuse a paragraph between pages, and never
make a page that only swaps one keyword.

## Product facts (the only claims allowed)

ArtOfMenu is a B2B SaaS for cafés, restaurants, bars and bakeries. **It has not launched yet**: the
call to action everywhere is "notify me at launch" (a form: name, email, the business's Google Maps
link, plan of interest). There are no customers, reviews, ratings or results yet, so never claim any.
No invented numbers ("increases sales by 23%"), no testimonials, no "trusted by", no "#1", no
"free" (there is no free plan or trial), no design service, no ready-made themes, no HTML/CSS theme upload.

Features (use exactly these; do not invent others):

- **QR menu**: guests scan the QR on the table; the menu opens automatically in the guest's language,
  with product photos and allergen information. The QR on the table never changes; the owner updates the menu.
- **Multiple languages**: the menu opens in the guest's phone language.
- **PDF upload** (all plans): upload the PDF menu you already have and go live the same day.
- **Own domain**: the menu opens on the business's own domain.
- **216 countries, own currency**: currency, tax display and price rounding set up per country.
- **Anonymous menu statistics**; **menu reports**: flags items that are seen but rarely opened, and
  items opened but never ordered.
- **Table ordering** (Order plan): guests send orders from the menu; the waiter sees them instantly on
  their phone (live waiter screen and notifications). Calling a waiter, asking for water or the bill from the
  table ("call from table") is part of the **Smart** plan.
- **Weather-aware menu order**: when it gets cold, hot drinks move up; cold drinks and items about to run
  out move down. During the day only the order changes, never the price.
- **"Goes well with" suggestions** (Smart): when a guest adds an item, the menu shows the item most often
  ordered with it at that branch.
- **Daily smart pricing** (Smart): every evening it reads the branch location, weather forecast, holidays /
  special days and each item's expected demand (also learning from anonymised behaviour coefficients of
  similar businesses, never their prices) and sets tomorrow's prices **inside the minimum and maximum the
  owner sets**. Prices change at most once a day, before the day starts. Modes: approve each price,
  automatic, or off (base prices). Unapproved prices fall back to the base price.
- **Stock**: simple stock and order reports (Order); recipe-based stock (Smart): when an ingredient runs
  out, every item made with it shows as sold out on its own.
- **Counter screens** (Smart): the menu on monitors behind the counter; several screens turn pages together.
- **Privacy**: no cookies, persistent IDs or stored IPs for guests; prices are never shared between
  businesses; cancel in one step and keep using it until the paid period ends; data stays if you move to
  a smaller plan.

Plans (prices per branch; yearly = 12 months for the price of 10):

| Plan  | Turkey (TRY) | Europe (EUR) | Elsewhere (USD) | Contains |
|-------|--------------|--------------|-----------------|----------|
| Menu  | 399 ₺ / mo   | €9 / mo      | $12 / mo        | QR menu, photos, allergens, languages, own domain, PDF upload, anonymous stats |
| Order | 999 ₺ / mo   | €29 / mo     | $35 / mo        | Menu + table ordering, waiter screen & notifications, simple stock & order reports |
| Smart | 1.999 ₺ / mo | €59 / mo     | $69 / mo        | Order + daily smart pricing & special-days calendar, live ordering & "goes well with", call from table, recipe stock, counter screens |

Turkish pages quote TRY, German / Spanish / Italian / French pages EUR, English pages USD (and may say
"€9 in Europe, 399 ₺ in Turkey").

## Voice

Short, plain, confident sentences, like Apple product pages. Speak to the owner ("you", "siz", "Sie",
"usted"/"tú" as is natural for small hospitality businesses in that market, "voi"/"tu" natural, "vous").
Concrete hospitality detail (a latte, a rainy Tuesday, table 4) beats abstraction.
Avoid AI tells: no "it's not X, it's Y" reveals, no "no X, no Y, no Z" lists, no sentences that trail into
extra comma clauses, no "in today's fast-paced world", no "unlock", "elevate", "seamless", "game-changer".

## Each page

- The first sentence of `lead` answers the query directly (this is what AI assistants and featured
  snippets quote).
- `answer`: a 40-70 word self-contained paragraph that defines/answers the topic and names ArtOfMenu
  once, factually. It must make sense when quoted alone.
- Commercial pages: 500-800 words in total. Guide pages (sales, menu engineering, inventory): 900-1400
  words of genuinely useful, practical advice that works even without ArtOfMenu, with ArtOfMenu mentioned
  where it honestly helps. General industry knowledge is fine (e.g. the menu engineering matrix of
  Kasavana & Smith: stars, plowhorses, puzzles, dogs). Do not cite statistics you cannot source.
- Use the market's real search phrases (see `research/google-suggest-2026-11.json`) naturally in the
  title, h1, a heading or two and the FAQ. Do not stuff them.
- FAQ questions are the questions people actually ask in that market; answers 30-80 words, factual.

## The 15 intents

| key | page angle | main queries (adapt per market) |
|-----|-----------|----------------------------------|
| `qr-menu` | Hub: what a QR menu is, what ArtOfMenu's QR menu does, who it is for, links to every other page. | qr menü / qr code menu / QR-Code-Speisekarte / menú QR, carta QR / menu QR code / menu QR code |
| `pricing` | "How much does a QR menu cost": what drives price, what each plan includes, per branch, yearly saving, honest comparison of paying for software vs printing menus. Value for money (uygun fiyatlı / affordable). | qr menü fiyatları, qr menu pricing, Preise, precio, prezzi, prix |
| `restaurant` | QR menu for restaurants: courses, many items, allergens, tourists, table ordering at busy lunch. | restoran qr menü, qr menu for restaurants, … |
| `cafe` | QR menu for cafés and coffee shops (Italy: bar/caffetteria): breakfast rush, seasonal drinks, desserts pairing, weather. | kafe qr menü, qr menu for cafe |
| `bar` | QR menu for bars and pubs (Italy: cocktail bar/pub; Spain: bar de copas/tapas): night service, rounds, calling the waiter, drinks running out. | bar qr menü, qr menu bar |
| `design` | A stylish, beautiful QR menu (şık / havalı): photos, typography, brand, own domain, why design affects orders; honest that there are no ready-made themes, the design is the product's clean layout plus your photos and brand. | qr menü tasarımı / örnekleri, qr menu design, Speisekarte Design, diseño carta |
| `smart` | Smart QR menu: weather-aware order, goes-well-with, daily pricing; what "smart" means concretely. | akıllı qr menü, smart qr menu |
| `ordering` | Table ordering system: how ordering from the table works, waiter screen, calls, who it suits, what it doesn't replace (it is not a POS/payment terminal). | masadan sipariş sistemi, table ordering system, Bestellen am Tisch, pedidos desde la mesa, ordinazioni al tavolo, commande à table |
| `multilingual` | Multilingual menu for tourists: automatic language from the guest's phone, allergens, currency. Strong for TR, ES, IT, FR, DE tourism. | çok dilli menü, multilingual restaurant menu, mehrsprachige Speisekarte, carta multilingüe, menu multilingua, menu multilingue |
| `restaurant-sales` | Guide: how a restaurant earns more (restoranım nasıl daha çok kazanır): menu layout, pricing, average ticket, table turnover, waste, staff; where ArtOfMenu helps. | restoran ciro artırma, how to increase restaurant sales, Restaurant Umsatz steigern, aumentar ventas restaurante, aumentare fatturato ristorante, augmenter chiffre d'affaires restaurant |
| `bar-sales` | Guide: how a bar increases sales: drink menu, happy hour, rounds, speed of service, premium spirits, food pairing, stock. | bar ciro nasıl artırılır, how to increase bar sales, … |
| `cafe-sales` | Guide: how a café increases revenue: morning rush speed, add-ons, pairing, weather, loyalty, waste. | kafe ciro artırma, how to increase cafe sales, … |
| `menu-engineering` | Guide: menu engineering explained (matrix, contribution margin, popularity, layout), step by step, with how menu reports and smart pricing relate. | menü mühendisliği, menu engineering, … |
| `inventory` | Guide: restaurant stock / inventory control: counting, recipe costing, par levels, FIFO, waste; recipe-based stock that marks items sold out. | restoran stok takibi, restaurant inventory management, Warenwirtschaft Gastronomie, control de inventario restaurante, gestione magazzino ristorante, gestion des stocks restaurant |
| `how-to` | How to make a QR menu fast (hızlı qr menü / qr menü nasıl yapılır): step by step, from PDF in minutes, printing the QR, table stands, updating prices. | qr menü nasıl yapılır / oluşturma, how to make a qr menu, digitale Speisekarte erstellen, crear menú QR, creare menu QR, créer menu QR code |

## Output format (`seo/content/<lang>.json`)

```json
{
  "lang": "tr",
  "ui": { ...strings, see below... },
  "pages": {
    "qr-menu": {
      "slug": "qr-menu",
      "title": "≤ 60 characters, includes the main query and 'ArtOfMenu'",
      "description": "≤ 155 characters, a reason to click, no clickbait",
      "eyebrow": "2-4 word label above the h1",
      "h1": "main heading, includes the main query naturally",
      "lead": "1-2 sentences; first sentence answers the query",
      "answer": "40-70 words, self-contained definition / answer",
      "sections": [
        { "h2": "…", "body": ["paragraph", "paragraph"], "bullets": ["optional", "list"] }
      ],
      "steps": { "h2": "optional numbered how-to heading", "items": [{ "t": "step title", "d": "step text" }] },
      "features": ["multilingual", "ordering", "weather", "pairing", "pricing", "pdf", "stock", "reports", "screens", "domain", "global"],
      "faq": [{ "q": "…", "a": "…" }],
      "cta": { "h2": "closing heading", "lead": "one sentence" },
      "related": ["pricing", "how-to", "multilingual"]
    }
  }
}
```

- `sections`: 3-6 for commercial pages, 5-9 for guides. `bullets` optional per section.
- `steps`: required for `how-to`, `menu-engineering`, `inventory`; optional elsewhere; omit otherwise.
- `features`: 3-6 keys from the list above, the ones that matter for this page, most relevant first.
- `faq`: 4-6 items. `related`: 3-5 other intent keys.
- Slugs: lowercase ASCII, hyphens, no accents (ş→s, ü→u, é→e, ñ→n, ß→ss), short, built from the market's
  main query (e.g. `qr-menu-fiyatlari`, `qr-code-speisekarte`, `menu-qr-restaurante`).

`ui` strings (all required):

```json
{
  "langName": "Türkçe", "home": "Ana sayfa", "notify": "Çıkınca haber verelim", "pricing": "Fiyatlar",
  "soon": "Yakında", "answerLabel": "Kısaca", "featuresTitle": "ArtOfMenu'de bu sayfayla ilgili",
  "faqTitle": "Sık sorulan sorular", "relatedTitle": "İlgili sayfalar", "allPages": "Tüm sayfalar",
  "plansTitle": "Paketler", "plansLead": "…", "perBranch": "şube başına", "from": "başlayan fiyatlarla",
  "footerTagline": "Kafe, restoran, bar ve pastaneler için QR menü, masadan sipariş ve akıllı fiyatlandırma.",
  "languages": "Diller", "skip": "İçeriğe geç",
  "features": {
    "multilingual": { "t": "…", "d": "…" }, "ordering": { "t": "…", "d": "…" }, "weather": { "t": "…", "d": "…" },
    "pairing": { "t": "…", "d": "…" }, "pricing": { "t": "…", "d": "…" }, "pdf": { "t": "…", "d": "…" },
    "stock": { "t": "…", "d": "…" }, "reports": { "t": "…", "d": "…" }, "screens": { "t": "…", "d": "…" },
    "domain": { "t": "…", "d": "…" }, "global": { "t": "…", "d": "…" }
  },
  "plans": {
    "menu": { "tag": "…", "items": ["…"] }, "order": { "tag": "…", "items": ["…"] }, "smart": { "tag": "…", "items": ["…"] }
  }
}
```

Feature card text: title ≤ 6 words, description one sentence ≤ 22 words.
