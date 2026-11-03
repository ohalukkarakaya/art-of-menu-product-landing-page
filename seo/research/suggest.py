import json, sys, time, urllib.request, urllib.parse
SEEDS = {
 "tr": ["qr menü", "qr menü fiyat", "qr menü ücretsiz", "qr menü oluşturma", "restoran qr menü", "kafe qr menü", "dijital menü", "qr kod menü", "masadan sipariş", "restoran sipariş sistemi", "restoran nasıl daha çok kazanır", "kafe ciro artırma", "bar ciro nasıl artırılır", "restoran stok takibi", "menü fiyatlandırma", "menü mühendisliği", "akıllı menü", "garson çağırma sistemi", "çok dilli menü", "qr menü programı"],
 "en": ["qr menu", "qr code menu", "qr menu for restaurant", "digital menu for restaurant", "contactless menu", "qr menu free", "qr menu pricing", "table ordering system", "restaurant ordering app", "how to increase restaurant sales", "how to increase bar sales", "how to increase cafe profit", "menu engineering", "dynamic pricing restaurant", "restaurant inventory management", "multilingual menu", "qr menu maker", "best qr menu app"],
 "de": ["qr code speisekarte", "digitale speisekarte", "qr speisekarte kostenlos", "speisekarte qr code erstellen", "digitale speisekarte restaurant", "bestellen am tisch", "tischbestellung app", "restaurant umsatz steigern", "bar umsatz steigern", "café umsatz steigern", "speisekarte mehrsprachig", "warenwirtschaft gastronomie", "dynamische preise gastronomie", "menu engineering"],
 "es": ["menú qr", "carta qr", "menú digital restaurante", "carta digital qr", "menú qr gratis", "pedidos desde la mesa", "cómo aumentar las ventas de un restaurante", "cómo aumentar las ventas de un bar", "ingeniería de menú", "carta digital multilingüe", "control de inventario restaurante"],
 "it": ["menu qr", "menù digitale", "menu digitale ristorante", "menu qr code gratis", "ordinazioni al tavolo", "come aumentare il fatturato di un ristorante", "come aumentare gli incassi di un bar", "menu engineering", "menu multilingua", "gestione magazzino ristorante"],
 "fr": ["menu qr code", "menu digital restaurant", "carte qr code", "menu qr code gratuit", "commande à table", "augmenter chiffre d'affaires restaurant", "augmenter chiffre d'affaires bar", "ingénierie de menu", "menu multilingue restaurant", "gestion des stocks restaurant"],
}
out = {}
for lang, seeds in SEEDS.items():
    res = {}
    for q in seeds:
        url = "https://suggestqueries.google.com/complete/search?client=firefox&hl=%s&q=%s" % (lang, urllib.parse.quote(q))
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=10) as r:
                data = json.loads(r.read().decode("utf-8", "replace"))
            res[q] = data[1]
        except Exception as e:
            res[q] = ["ERR " + str(e)]
        time.sleep(0.25)
    out[lang] = res
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
for lang in out:
    print(lang, sum(len(v) for v in out[lang].values()))
