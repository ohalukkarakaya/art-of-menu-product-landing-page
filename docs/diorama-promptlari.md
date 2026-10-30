# ArtOfMenu · "Bir günün menüsü" diorama promptları (ChatGPT)

## Fikir

Kaydırdıkça bir işletmenin bir günü sabahtan geceye akıyor. Her saat ayrı bir **minyatür dünya (diorama)**:
havada süzülen, kenarlarından toprak kesiti görünen yuvarlak bir ada parçası, üstünde bir mekân. Zenly'nin
sitesindeki dünyalar gibi, ama bizim art-toy stilimizde ve kurumsal renklerimizle.

## Katmanları nasıl kuruyoruz (önemli)

ChatGPT'de üst üste tam oturan katmanlar üretmek zor. O yüzden sahneyi **birbirinden bağımsız parçalardan**
kuruyoruz; parçaların birbirine piksel piksel oturması gerekmiyor:

| Parça | Ne | Kim yapıyor |
|---|---|---|
| Gökyüzü ve ışık | Saate göre değişen renk geçişi, güneş, ay, yıldız | Ben, kodla |
| **Diorama adası** | Mekânın kendisi, içinde insan yok | Sen, ChatGPT |
| Ada (karakter) | Önceki turda ürettiğin pozlar adanın üstüne konuyor | Hazır |
| Yüzen nesneler | Latte, kruvasan, zil, para (önceki set) | Hazır |
| **Telefonu tutan el** | Ekranı düz yeşil bir el ve telefon; ekrana canlı menüyü HTML olarak ben koyuyorum | Sen, ChatGPT |
| Yağmur, buhar, sipariş balonları, fiyat etiketleri | Hareketli efektler | Ben, kodla |

Kaydırınca her parça farklı hızda kayıp büyüyerek derinlik hissi veriyor. Adalar arasında tükenmez kalem
mavisi ve beyaz çapraz şeritlerle geçiliyor.

## Nasıl üreteceksin

1. **Önce 03 numarayı (yağmurlu akşam) üret.** İlk prototipi bu sahneyle yapacağım; beğenirsen diğerlerine geçeriz.
2. Her promptun sonuna aşağıdaki **Diorama stili** bloğunu yapıştır. El görseli (08) için **El stili** bloğunu kullan.
3. Tutarlılık için ilk beğendiğin adayı sonraki promptlara referans olarak ekleyip şunu yaz:
   `Use the attached image as the style reference: same island shape, camera angle, scale, materials and lighting.`
4. Boyut: adalar **1536×1024 (yatay)**, el **1024×1536 (dikey)**.
5. Arka plan **şeffaf PNG** olmalı. Değilse şunu yaz: `Make the background fully transparent and export as PNG.`
6. Dosyaları bu isimlerle `assets/img/diorama/` klasörüne koy.

---

## Diorama stili (adaların sonuna ekle)

```
Style: a floating miniature diorama island in the look of premium designer art toys and modern 3D animated feature films. The island is a rounded, slightly oval chunk of ground seen from a three-quarter elevated camera angle (about 30 degrees from above), with a thick, smooth cross-section of layered soil and stone visible on its sides, tapering softly underneath. Everything on top is a cute, slightly chunky miniature: soft rounded edges, matte vinyl, ceramic and painted-wood materials with subtle subsurface scattering, tiny believable details. Soft diffused studio lighting from the upper left, gentle ambient occlusion, a soft cool rim light. Calm, premium color palette: ballpoint-pen blue #1F3A9E as the hero color on awnings, signs, umbrellas and chairs, white and off-white walls, navy #0F1B4D, charcoal, warm light wood, natural greens, and a touch of violet #6B5BD6. No orange and no red except the natural colors of food. No people or characters on the island, leave a small clear open spot in the front middle where a character can stand. No text, no letters, no numbers, no logos. The island fills about 80 percent of the image width, centered, with empty space around it. Fully transparent background, PNG.
```

## El stili (sadece 08 için)

```
Style: stylized 3D render in the look of premium designer art toys and modern 3D animated feature films. Soft matte skin with subtle subsurface scattering, slightly chunky stylized proportions, soft diffused studio lighting from the upper left and a gentle rim light. No text, no logos. Fully transparent background, PNG.
```

---

## 00 · Açılış: küçük gezegen

Dosya: `assets/img/diorama/planet.png` · Boyut: **1536×1536 (kare)**

Bu bir ada değil, tam yuvarlak küçük bir gezegen. Diorama stilinin ilk iki cümlesi yerine bu prompt geçerli,
geri kalan stil cümlelerini ekle.

```
A tiny round planet, a perfect sphere seen slightly from above, its surface covered with soft rounded green lawn, little curving paths and a small blue lake. Around the top half of the planet stand five miniature venues, each a little different: a cozy café with a ballpoint-blue striped awning, a restaurant with an outdoor terrace and white umbrellas, a small bakery with a round display window, a cocktail bar with violet glowing windows, and a tiny street-food kiosk. Small rounded trees, benches and string lights between them. A few soft white clouds float around the planet.
```

## 01 · 08:00 Sabah kafesi

Dosya: `assets/img/diorama/morning-cafe.png` · Boyut: **1536×1024**

```
A floating diorama island with a cozy neighborhood café at morning. A two-story white café building with a ballpoint-blue striped awning, large glass windows showing a coffee bar inside, potted plants, a chalk-free blank menu board (no writing), and a small outdoor seating area with three round white tables and blue chairs. On the front table: a small ballpoint-blue QR table stand. Fresh morning feeling, soft pale-blue light, a bicycle leaning on the wall, a few birds on the roof.
```

## 02 · 13:00 Öğle, kalabalık restoran

Dosya: `assets/img/diorama/lunch-restaurant.png` · Boyut: **1536×1024**

```
A floating diorama island with a lively restaurant at lunchtime. A wide single-story restaurant with big folding glass doors opened onto a terrace, white umbrellas with ballpoint-blue edges, six round tables set with plates, glasses and steaming dishes, a small open kitchen pass with plates waiting, and a chrome service bell on the counter. Bright, busy midday light, crisp shadows, warm and inviting.
```

## 03 · 18:00 Yağmurlu akşam (ilk prototip)

Dosya: `assets/img/diorama/rain-evening.png` · Boyut: **1536×1024**

```
A floating diorama island with a café terrace in early evening just after rain. A charming corner café with a deep ballpoint-blue awning, warm cozy light glowing from the windows, steam rising from a cup on the windowsill, wet cobblestones with small reflective puddles, a few round tables with tilted-in chairs under the awning, a closed white umbrella leaning on a chair, and a small street lamp with a soft glow. Cool blue-grey evening light outside, warm light inside, wet shiny surfaces. No falling rain in the image (rain will be added separately).
```

## 04 · 20:00 Pastane

Dosya: `assets/img/diorama/bakery.png` · Boyut: **1536×1024**

```
A floating diorama island with a small patisserie at evening. A white bakery with a rounded glass display window filled with cakes, a slice of Basque cheesecake on a stand, croissants and macarons, a ballpoint-blue scalloped awning, a little bench with a blue cushion, string lights overhead and two potted olive trees. Soft, warm golden evening light on a calm blue dusk.
```

## 05 · 23:00 Gece, kapanış

Dosya: `assets/img/diorama/night-close.png` · Boyut: **1536×1024**

```
A floating diorama island with a café-bar at night, closing time. Chairs flipped up on the outdoor tables, a single warm light on inside, glowing violet and ballpoint-blue neon tubes as abstract shapes (no letters), a small counter with a tablet resting on it, a tidy coffee machine, and a cat sleeping on a cushion by the door. Deep navy night lighting with soft violet highlights, calm and cozy.
```

## 06 · Final: ışıkları yanan gezegen

Dosya: `assets/img/diorama/planet-night.png` · Boyut: **1536×1536 (kare)**

00 numaralı gezegeni referans olarak ekle.

```
Use the attached image as the reference: the exact same tiny planet, same venues, same camera angle and composition. Now it is night: deep navy surroundings, warm light glowing from every venue window, little string lights twinkling, soft violet and ballpoint-blue glows, and a few tiny stars around the planet.
```

## 07 · (İsteğe bağlı) Yağmur bulutu

Dosya: `assets/img/diorama/rain-cloud.png` · Boyut: **1024×1024**

```
A single soft, fluffy, stylized rain cloud in grey-blue tones with a gently rounded shape, matte material with subtle subsurface scattering, no raindrops. Centered with empty space around it. Fully transparent background, PNG.
```

## 08 · Telefonu tutan el

Dosya: `assets/img/diorama/hand-phone.png` · Boyut: **1024×1536 (dikey)**

```
A stylized 3D hand rising from the bottom edge of the image, holding a modern smartphone upright and facing the viewer, like a guest about to scan a menu. The forearm is in a white shirt sleeve with the cuff slightly rolled. The phone has a slim black frame and rounded corners. The phone screen is a perfectly flat, uniform, pure chroma green #00FF00 with no reflections, no gradient and no UI, so it can be replaced later. The phone is straight on, not tilted, filling about 55 percent of the image height, centered horizontally. The hand and arm are cut off cleanly at the bottom edge.
```

---

## Kontrol listesi

| # | Dosya | Boyut | Not |
|---|---|---|---|
| 03 | `rain-evening.png` | 1536×1024 | **önce bu**, ilk prototip |
| 08 | `hand-phone.png` | 1024×1536 | ekran düz yeşil olmalı |
| 07 | `rain-cloud.png` | 1024×1024 | isteğe bağlı |
| 00 | `planet.png` | 1536×1536 | açılış |
| 01 | `morning-cafe.png` | 1536×1024 | 03'ü stil referansı olarak ekle |
| 02 | `lunch-restaurant.png` | 1536×1024 | 03'ü stil referansı olarak ekle |
| 04 | `bakery.png` | 1536×1024 | 03'ü stil referansı olarak ekle |
| 05 | `night-close.png` | 1536×1024 | 03'ü stil referansı olarak ekle |
| 06 | `planet-night.png` | 1536×1536 | 00'ı referans olarak ekle |

Prototip için **03 ve 08 yeterli** (07 olursa daha iyi). Ada'nın pozları ve nesneler önceki setten kullanılacak.
