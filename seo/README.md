# SEO ve yapay zekâ görünürlüğü

## Site nasıl üretiliyor

Metinleri düzenle, sonra proje klasöründe:

```
node tools/build.mjs
```

Bu komut şunları yeniden yazar (elle düzenleme, bir sonraki çalıştırmada silinir):

| Çıktı | Kaynağı |
|---|---|
| `/<dil>/index.html`: altı dilde 3D ana sayfa, dili sabit, metni HTML'in içinde | `index.html`, `gun-i18n.js`, `i18n.js` |
| `/<dil>/<slug>/index.html`: her dilde 15 konu sayfası | `seo/content/<dil>.json` (kurallar: `seo/brief.md`) |
| `index.html` içindeki `<!--seo:…-->` blokları: canonical, hreflang, yapısal veri, footer linkleri | aynı kaynaklar |
| `sitemap.xml` (hreflang'lı), `robots.txt`, `llms.txt`, `404.html` | `tools/build.mjs` |

Diller: tr, en, de, es, it, fr. Kök adres (`/`) ziyaretçinin diline göre açılır ve `x-default`'tur; dil adresleri (`/tr/`, `/en/`, …) Google'ın her dili ayrı görmesi içindir.

Formun Worker adresi ve Turnstile anahtarı (`data-endpoint`, `data-sitekey`) iki yerde: `index.html` ve `tools/build.mjs` içindeki `dialog()`. İkisini de doldurup yeniden üret.

## Yayından sonra (sırayla)

1. **Google Search Console**: `artofmenu.com` alan adını doğrula (DNS TXT), `https://artofmenu.com/sitemap.xml` gönder. "URL denetimi" ile `/tr/`, `/en/` ve birkaç konu sayfasını dizine eklemeyi iste.
2. **Bing Webmaster Tools**: Search Console'dan içe aktar, aynı site haritasını gönder. ChatGPT'nin web araması ve Copilot büyük ölçüde Bing dizinini kullanır; bu adım yapay zekâ görünürlüğü için Google kadar önemli.
3. **Yandex Webmaster** (Türkiye'de hâlâ kullanılıyor): site haritasını gönder.
4. Search Console'da 2-3 hafta sonra **hreflang hatalarına** ve "Taranmış, şu anda dizine eklenmemiş" sayfalara bak. Dizine girmeyen sayfaların metnini zenginleştir, gerekirse iki zayıf sayfayı birleştir.

## Yapay zekânın ArtOfMenu'yü önermesi için

Site tarafı hazır: `robots.txt` yapay zekâ tarayıcılarına (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) açık; `llms.txt` ürünü, fiyatları ve tüm sayfaları özetliyor; her sayfa ilk cümlesinde soruyu yanıtlıyor ve tek başına alıntılanabilir bir "Kısaca" paragrafı taşıyor; yapısal veri (Organization, SoftwareApplication, FAQPage, BreadcrumbList, Article, HowTo) var.

Asistanlar bir ürünü, **başka sitelerde adı geçtiği** ölçüde önerir. Sitenin dışında yapılacaklar:

- **Lansman günü**: Product Hunt, BetaList; Türkiye için webrazzi/egirisim duyuruları.
- **Yazılım dizinleri** (ürün açıldıktan sonra, gerçek kullanıcı yorumlarıyla): G2, Capterra, GetApp, SaaSHub, AlternativeTo. Yorum satın alma ya da uydurma; dizinler ve Google bunu cezalandırır.
- **Karşılaştırma listeleri**: "best QR menu software 2026" gibi yazıların yazarlarına ürünü tanıt. Ücretli yerleşimler `sponsored` etiketli olmalı.
- **LinkedIn şirket sayfası**, Instagram ve YouTube'da kısa demo videoları; hepsinde aynı ad ("ArtOfMenu"), aynı tek cümlelik tanım ve `artofmenu.com` linki.
- **Göktigin**'in sitesinde ArtOfMenu sayfası ve linki (yapısal veride `parentOrganization` olarak geçiyor).
- Sektör toplulukları: r/restaurateur, r/barowners, Ekşi Sözlük'te ve restoran sahiplerinin Facebook gruplarında, reklam değil gerçekten yardımcı cevaplar.
- Wikidata kaydı ürün bilinir olduktan sonra.

## Ölçüm

- Search Console: dil başına gösterim ve tıklama; hangi sorgu hangi sayfaya geliyor.
- Yapay zekâ görünürlüğü: ayda bir, her dilde 5-10 soru sor ("en iyi QR menü hangisi", "qr menü fiyatları", "how to increase bar sales"…) ChatGPT, Perplexity, Gemini ve Copilot'a; ArtOfMenu adı geçiyor mu, hangi sayfa kaynak gösteriliyor, not al.
- `seo/research/suggest.py` Google'ın öneri listesini tekrar çeker; yeni aramalar çıktıkça `seo/brief.md`'ye yeni bir amaç ve sayfa ekle.

## Kural

Yeni sayfa eklerken `seo/brief.md`'deki ilke geçerli: her sayfa kendi sorusunu kendi açısından, kendi bölümleriyle yanıtlar. Sadece anahtar kelimesi değişen kopya sayfalar Google'ın "toplu üretilmiş içerik" (scaled content abuse) politikasına takılır ve bütün siteyi aşağı çeker.
