# ArtOfMenu ürün sayfası

Tek sayfalık tanıtım sitesi. Derleme adımı yok; düz HTML, CSS ve JS.

```
python3 -m http.server 5173
```

Sonra http://localhost:5173 adresini açın.

## Dosyalar

- `tools/build.mjs`: dil sayfalarını (`/tr/`, `/en/`, …), 90 konu sayfasını, `sitemap.xml`, `robots.txt` ve `llms.txt`'yi üretir. Metin değişince `node tools/build.mjs` çalıştır. Ayrıntılar `seo/README.md` içinde.

- `index.html`: ana sayfa, 3D "Bir günün menüsü" hikâyesi ve fiyatlar. Stili `gun.css`, davranışı `gun.js`, metinleri `gun-i18n.js`
  (paket metinleri `i18n.js`'ten gelir).
- `classic.html`: eski Apple tarzı sayfa.
- Bütün "Hemen başla" düğmeleri https://app.artofmenu.com adresine gider. Eski "Çıkınca haber verelim" formu kaldırıldı; `waitlist-worker/` artık sayfadan kullanılmıyor.
- `styles.css`: classic sayfanın stili, renkler en üstteki `:root` değişkenlerinde
- `i18n.js`: classic sayfanın tüm metinleri (TR, EN, DE) ve demo fiyatlarının para birimleri
- `main.js`: classic sayfanın dil seçimi, hero parallax'ı, sabitlenen hikâye bölümü, "yarının fiyatı" kartı, form
- `assets/img/`: ChatGPT'de üretilen kaynak görseller (şeffaf PNG). Promptlar `docs/gorsel-promptlari.md` içinde.
- `assets/web/`: sayfanın kullandığı küçültülmüş WebP'ler. Nesne ve ikon sayfaları burada tek tek kesilmiş halde.

## Yeni dil

`i18n.js` içinde bir dil bloğunu kopyalayıp çevirin, `AOM_MONEY`'ye para birimini ekleyin ve
`classic.html` içindeki `.lang` grubuna bir düğme ekleyin.

## Yayından önce

- Erken erişim formu: `#join-form` üzerindeki `data-endpoint` boş. Boşken form ziyaretçinin e-posta
  uygulamasını `support@artofmenu.com` adresine açıyor. Kayıt servisi hazır olunca adresi buraya yazın;
  form `{ email, lang }` gövdesiyle JSON POST atar.
- Fiyatlar `pricing.js` içinde (aylık / yıllık, şube başına). Para birimi tarayıcının bölgesine göre seçiliyor:
  Türkiye ₺, Avrupa €, diğer ülkeler $. Denemek için adrese `?cur=TRY`, `?cur=EUR` ya da `?cur=USD` ekleyin.
- Fiyatlarda KDV'nin dahil mi hariç mi olduğu sayfada yazmıyor; muhasebeci onayından sonra not eklenmeli.


## Yasal sayfalar (statik sitede /legal/)

`artofmenu.com` GitHub Pages üzerinde düz dosya olarak sunuluyor; panelin `/api/v1/legal`
API'si burada bulunmuyor. Bu nedenle yasal sayfalar, backend'deki güncel ve sürümlü
hukuki belgelerin **birebir dosya kopyaları** ile `/legal/`, `/legal/company/`,
`/legal/privacy-guest/` vb. adreslerden sunulur. Altı dil desteklenir
(`?lang=tr|en|de|es|fr|it`); misafir bağlantısında
`?from=menu` yalnız misafirlere açık üç belgeyi listeler.

Backend'de yeni yasal belge sürümü veya `legal/current.json` değiştiğinde,
**iki depo aynı üst klasördeyken** şunu çalıştır:

```bash
node tools/sync-legal.mjs
```

Bu komut `../art-of-menu-backend/legal/<key>/<version>/<lang>.json`
dosyalarını `legal/data/` altına kopyalar ve statik URL sayfalarını
oluşturur. Ardından bu **landing-page** deposunu yayınlamak gerekir;
komut kendi başına commit, push veya deploy yapmaz. Şirketin KEP adresi
`goktiginbilisim@hs01.kep.tr` olarak 12 Kasım 2026 tarihinde eklendi.

Misafir menüsüne ait işletme bazlı veri sorumlusu iletişim bilgileri, üretimde
panel/backend API adresi netleştirilip herkese açık ve güvenli veri erişimi
sağlanana kadar bu statik sayfada dinamik gösterilemez. İşletmeye ait
bildirimler ve hukuki uyumluluk canlı yayından önce ayrıca doğrulanmalıdır.
