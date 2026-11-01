# Çıkınca haber verelim listesi (Cloudflare)

Ana sayfadaki "Çıkınca haber verelim" formu ad soyad, e-posta, işletmenin Google Haritalar bağlantısı ve
ilgilenilen paketi bu Worker'a gönderir. Worker ziyaretçiyi Turnstile ile doğrular, alanları tekrar
kontrol eder ve kaydı Cloudflare D1 veritabanına yazar. Sayfanın içinde hiçbir gizli anahtar yoktur.

Komutları bu klasörde (`waitlist-worker/`) çalıştır. Node kurulu olmalı; `npx` wrangler'ı kendisi indirir.

## 1. Cloudflare'e giriş

```
npx wrangler login
```

Tarayıcı açılır, Cloudflare hesabınla izin ver.

## 2. Veritabanı

```
npx wrangler d1 create aom-waitlist
```

Çıktıdaki `database_id` değerini `wrangler.toml` içindeki `database_id` satırına yapıştır. Sonra tabloyu oluştur:

```
npx wrangler d1 execute aom-waitlist --remote --file=schema.sql
```

## 3. Turnstile (robot doğrulaması)

1. Cloudflare panelinde **Turnstile → Add widget**.
2. Ad: `ArtOfMenu`. Hostname: `artofmenu.com` ve `www.artofmenu.com` (yerelde denemek için `localhost` da ekleyebilirsin).
3. Widget mode: **Managed**.
4. Sana bir **Site Key** ve bir **Secret Key** verir. Site key sayfaya girer, secret key sadece Worker'a.

## 4. Gizli değerler

```
npx wrangler secret put TURNSTILE_SECRET
```

İstendiğinde Turnstile **Secret Key**'i yapıştır.

```
npx wrangler secret put IP_SALT
```

İstendiğinde rastgele uzun bir metin yaz (ör. `openssl rand -hex 32` çıktısı). IP adresleri saklanmaz;
sadece bu tuzla karıştırılmış özetleri, aynı kişinin saatte 5'ten fazla kayıt yapmasını engellemek için tutulur.

## 5. Yayınla

```
npx wrangler deploy
```

Çıktıda Worker'ın adresi yazar, örneğin `https://aom-waitlist.<hesabın>.workers.dev`.

## 6. Formu Worker'a bağla

Sitenin `index.html` dosyasında formu bul:

```html
<form class="nf-form" id="nf-form" novalidate data-endpoint="" data-sitekey="">
```

- `data-endpoint` → 5. adımdaki Worker adresi
- `data-sitekey` → 3. adımdaki Turnstile **Site Key**

Kaydedip siteyi GitHub'a gönder. Bu iki değer boş kaldığı sürece form, bilgileri ziyaretçinin e-posta
uygulamasıyla `support@artofmenu.com` adresine göndermeyi önerir.

Sitenin adresi değişirse (başka alan adı vb.) `wrangler.toml` içindeki `ALLOWED_ORIGINS` listesine ekleyip
`npx wrangler deploy` ile yeniden yayınla. Listede olmayan sitelerden gelen istekleri Worker reddeder.

## Listeyi görmek

Cloudflare panelinde **Workers & Pages → D1 → aom-waitlist → Console**, ya da:

```
npx wrangler d1 execute aom-waitlist --remote --command "SELECT name, email, maps_url, plan, lang, created_at FROM signups ORDER BY created_at DESC"
```

Bir dosyaya kaydetmek için (JSON):

```
npx wrangler d1 execute aom-waitlist --remote --json --command "SELECT name, email, maps_url, plan, lang, created_at FROM signups" > liste.json
```

Bir kişinin silinmesini isterse:

```
npx wrangler d1 execute aom-waitlist --remote --command "DELETE FROM signups WHERE email = 'ornek@alan.com'"
```

## Yerelde denemek

```
printf 'TURNSTILE_SECRET=1x0000000000000000000000000000000AA\nIP_SALT=test\n' > .dev.vars
npx wrangler d1 execute aom-waitlist --local --file=schema.sql
npx wrangler dev --port 8787
```

Formda geçici olarak `data-endpoint="http://127.0.0.1:8787/"` ve `data-sitekey="1x00000000000000000000AA"`
(Cloudflare'in her zaman geçen test anahtarı) kullan. `.dev.vars` git'e girmez.

## Hukuki not

E-posta ve işletme bağlantısı kişisel veri sayılabilir. Formda açık onay kutusu var; sitede ayrıca kısa bir
KVKK/GDPR aydınlatma metni yayınlayıp avukatına onaylatman önerilir. Veriler Cloudflare'in sunucularında (yurt dışı) tutulur.
