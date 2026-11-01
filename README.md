# ArtOfMenu ürün sayfası

Tek sayfalık tanıtım sitesi. Derleme adımı yok; düz HTML, CSS ve JS.

```
python3 -m http.server 5173
```

Sonra http://localhost:5173 adresini açın.

## Dosyalar

- `index.html`: sayfa
- `styles.css`: renkler en üstteki `:root` değişkenlerinde
- `i18n.js`: tüm metinler (TR, EN, DE) ve demo fiyatlarının para birimleri
- `main.js`: dil seçimi, hero parallax'ı, sabitlenen hikâye bölümü, "yarının fiyatı" kartı, form
- `assets/img/`: ChatGPT'de üretilen kaynak görseller (şeffaf PNG). Promptlar `docs/gorsel-promptlari.md` içinde.
- `assets/web/`: sayfanın kullandığı küçültülmüş WebP'ler. Nesne ve ikon sayfaları burada tek tek kesilmiş halde.

## Yeni dil

`i18n.js` içinde bir dil bloğunu kopyalayıp çevirin, `AOM_MONEY`'ye para birimini ekleyin ve
`index.html` içindeki `.lang` grubuna bir düğme ekleyin.

## Yayından önce

- Erken erişim formu: `#join-form` üzerindeki `data-endpoint` boş. Boşken form ziyaretçinin e-posta
  uygulamasını `support@artofmenu.com` adresine açıyor. Kayıt servisi hazır olunca adresi buraya yazın;
  form `{ email, lang }` gövdesiyle JSON POST atar.
- Fiyatlar `pricing.js` içinde (aylık / yıllık, şube başına). Para birimi tarayıcının bölgesine göre seçiliyor:
  Türkiye ₺, Avrupa €, diğer ülkeler $. Denemek için adrese `?cur=TRY`, `?cur=EUR` ya da `?cur=USD` ekleyin.
- Fiyatlarda KDV'nin dahil mi hariç mi olduğu sayfada yazmıyor; muhasebeci onayından sonra not eklenmeli.
