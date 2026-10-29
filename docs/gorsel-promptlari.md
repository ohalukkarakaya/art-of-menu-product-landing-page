# ArtOfMenu görsel promptları (ChatGPT)

## Görsel dil

**Pixar tarzı 3D, renkli ve enerjik.** Sayfanın yüzü bir maskot: **Mino**. Mino canlı bir menü kitapçığı;
iri gözlü, sevimli ve hep işletmenin yanında koşturan bir yardımcı. Sitedeki her bölümü o anlatıyor.
Nesneler (latte, kruvasan, zil, QR standı) aynı 3D dünyadan geliyor ve kaydırdıkça sahnede süzülüyor.

Zeminleri görsele gömmüyoruz: **her şey şeffaf PNG**. Renkli zeminleri, kaydırma animasyonlarını
ve yazıları sitede ben veriyorum. Böylece aynı görsel masaüstünde de telefonda da doğru oturuyor.

## Nasıl üreteceksin

1. **Önce 01 numaralı Mino karakter sayfasını üret.** Beğenmediysen beğenene kadar tekrar üret.
   Bütün görseller bu karaktere bağlı.
2. Mino'nun geçtiği her promptta **01 görselini ChatGPT'ye ekle** ve promptun başına şunu yaz:
   `Use the attached image as the character reference for Mino. Keep his design exactly the same.`
3. Her promptun sonuna **Ortak stil** bloğunu ekle (aşağıda, kopyala-yapıştır).
4. Boyutu promptta yazdığım gibi seç. Arka plan şeffaf gelmezse şunu yaz:
   `Make the background fully transparent and export as PNG.`
5. Dosyaları tam bu isimlerle `assets/img/` klasörüne koy. Sayfayı bu isimlere göre kuracağım.

Görselde **yazı istemiyoruz** (telefon ekranı dahil). Yazıları sitede ben koyacağım; yapay zekâ yazıyı
bozuk çizebiliyor.

---

## Ortak stil (her promptun sonuna ekle)

```
Style: Pixar-style 3D animated film render. Soft, rounded, stylized shapes with appealing proportions. Materials are smooth and slightly glossy, like high-end clay and ceramic, with subtle subsurface scattering. Warm cinematic studio lighting: soft key light from the upper left, gentle rim light from behind, soft contact shadows directly under objects only. Vibrant, harmonious color palette: tomato red #FF5A3C, sunflower yellow #FFC83D, mint #7FDCC0, cobalt blue #3D5AFE, blush pink #FFB4C2, warm cream #FFF4E6, deep plum #2A1B3D. Crisp edges, high detail, clean composition. No text, no letters, no numbers, no logos, no watermark. Fully transparent background, PNG.
```

---

## 01 · Mino karakter sayfası

Dosya: `assets/img/mino-sheet.png` · Boyut: **1536×1024 (yatay)**

```
A character design sheet for a Pixar-style 3D mascot named Mino. Mino is a living restaurant menu booklet, about the proportions of a small hardcover book standing upright. His front cover is warm cream with a rounded tomato red spine and a thin sunflower yellow ribbon bookmark hanging from the top like a little antenna. His face is on the cover: big, glossy, expressive dark eyes with bright catchlights, soft rounded eyebrows, rosy blush pink cheeks and a wide friendly smile. He has short, bendy cartoon arms and legs in deep plum with small white gloves and tiny tomato red sneakers. When he opens slightly you can see cream pages inside with colorful abstract food photo shapes, no readable text. Show Mino three times side by side, evenly spaced and not overlapping: on the left waving hello, in the middle standing proudly with hands on hips, on the right pointing up and to the side with an excited expression. Same size, same lighting, front three-quarter view.
```

---

## 02 · Hero: telefon ve Mino

Dosya: `assets/img/hero-phone.png` · Boyut: **1024×1536 (dikey)**

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
A large modern smartphone standing upright, slightly tilted back and turned a little to the left, with rounded edges and a deep plum frame. Its screen glows and shows a cheerful, colorful restaurant menu app made only of abstract shapes: a row of rounded pill tabs at the top, then five stacked rounded cards, each with a small circular food thumbnail on the left (coffee, croissant, lemonade, cheesecake, salad), colored bars in place of text, and a tomato red pill button at the bottom. No readable text. Mino leans casually against the right side of the phone with one elbow on its frame, waving at the viewer with a big smile. The phone fills about 80 percent of the image height, centered.
```

---

## 03 · Masa nesneleri (tek sayfada, ben ayırırım)

Dosya: `assets/img/props-sheet.png` · Boyut: **1536×1024 (yatay)**

```
Eight separate Pixar-style 3D café objects arranged in a neat 4 by 2 grid with generous empty space between them, none touching or overlapping, each floating and shown from a slightly elevated three-quarter angle:
1. A wide latte cup on a saucer, cream foam with a heart latte art, tomato red cup.
2. A plump golden croissant with flaky layers.
3. A slice of Basque burnt cheesecake with a caramelized dark top and creamy inside, on a small mint plate.
4. A tall glass of lemonade with ice cubes, a lemon wheel on the rim and a striped straw.
5. A small stack of three shiny golden coins, slightly tilted.
6. A cute table stand card in cobalt blue holding a white square with an abstract QR-like pattern of blocks.
7. A shiny chrome and tomato red service desk bell.
8. A fresh green basil sprig with three leaves.
```

---

## 04 · Bölüm 1: Okut

Dosya: `assets/img/story-scan.png` · Boyut: **1024×1024**

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
Mino holds a smartphone up with both hands, scanning a cobalt blue QR table stand in front of him. A soft beam of light goes from the phone to the QR stand. Little sparkles pop above the phone. Mino looks delighted and surprised, eyes wide. Small floating speech-bubble icons in sunflower yellow, mint and blush pink around the phone suggest different languages, with no letters inside, only simple dots.
```

---

## 05 · Bölüm 2: Sipariş garsonun cebinde

Dosya: `assets/img/story-order.png` · Boyut: **1024×1024**

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
Mino runs energetically from left to right carrying a round silver tray balanced on one hand, with a latte cup and a slice of cheesecake on it. Behind him, a floating smartphone shows a big tomato red notification bubble with a bell icon and motion lines, as if it just buzzed. Dynamic pose, small dust puffs behind his sneakers.
```

---

## 06 · Bölüm 3: Hava döner, menü döner

Dosya: `assets/img/story-weather.png` · Boyut: **1024×1024**

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
Split mood scene. On the left half a smiling cartoon sun with soft rays and a glass of lemonade with ice; on the right half a fluffy rain cloud with little raindrops and a steaming cup of hot chocolate with a wisp of steam. In the middle Mino stands under a small tomato red umbrella, holding it toward the rainy side, and with his other hand he lifts the hot chocolate up higher than the lemonade, as if rearranging them. Playful and clear.
```

---

## 07 · Bölüm 4: Bununla iyi gider

Dosya: `assets/img/story-pair.png` · Boyut: **1024×1024**

```
A latte cup on a saucer and a slice of Basque cheesecake on a small mint plate sit side by side like best friends. Both have small cute faces with happy closed-eye smiles and rosy cheeks. A small blush pink heart floats above them. A tiny tomato red pill-shaped tag with a plus sign hovers next to the cheesecake, as if it is being added to an order.
```

---

## 08 · Smart: yarının fiyatı bu akşam

Dosya: `assets/img/smart-night.png` · Boyut: **1024×1024**

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
Night-time scene without a background. Mino sits on a crescent moon in sunflower yellow, wearing a tiny sleeping cap, holding a big tear-off calendar page in front of him. The calendar page shows only a big blush pink heart symbol, no numbers. Next to him float a small rain cloud, three tiny stars and two rounded price tags in mint and tomato red, one with a small up arrow and one with a small down arrow, no numbers. Calm, clever, cozy mood.
```

---

## 09 · Özellik ikonları (tek sayfada, ben ayırırım)

Dosya: `assets/img/features-sheet.png` · Boyut: **1536×1024 (yatay)**

```
Six separate Pixar-style 3D objects arranged in a neat 3 by 2 grid with generous empty space between them, none touching or overlapping, each shown from a slightly elevated three-quarter angle, all at similar size:
1. A glass ingredient jar with a mint lid, half full of coffee beans, with a small round gauge stuck on the front whose needle points low into a tomato red zone.
2. Two small flat-screen TV monitors side by side on a counter, both showing the same colorful abstract menu layout made of shapes, no text.
3. A rounded 3D bar chart with four bars in plum, plum, tomato red and plum, and a chunky magnifying glass leaning on it.
4. A paper sheet with a tomato red folded corner and abstract colored lines, flying into a smartphone with a curved dotted motion trail, magic sparkles.
5. A painter's palette in cream with blobs of tomato red, sunflower yellow, mint and cobalt paint, with a chunky brush resting on it.
6. A fat pencil in deep plum with a tomato red eraser, drawing a little star on a menu card.
```

---

## 10 · Kapanış: kutlama

Dosya: `assets/img/join-celebrate.png` · Boyut: **1024×1024**

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
Mino jumps in the air with both arms raised in celebration, huge happy open-mouth smile. Around him burst colorful confetti pieces, a few shiny golden coins and two small hearts, all flying outward. Joyful, high energy, peak of the jump.
```

---

## 11 · Paylaşım görseli (isteğe bağlı)

Dosya: `assets/img/og.png` · Boyut: **1536×1024**. Bunda arka plan ve yazı istiyoruz, ortak stil bloğunun
son cümlesini (`No text...` ve `transparent`) çıkar.

```
Use the attached image as the character reference for Mino. Keep his design exactly the same.
A bold social share banner on a solid cobalt blue #3D5AFE background. On the right, Mino waves next to a floating latte cup and a croissant. On the left, large rounded bold white text reads 'ArtOfMenu' and below it, smaller cream text reads 'Daha çok kazandıran menü'. Text is perfectly spelled.
```

---

## Kontrol listesi

| # | Dosya | Boyut | Mino referansı |
|---|---|---|---|
| 01 | `mino-sheet.png` | 1536×1024 | kendisi |
| 02 | `hero-phone.png` | 1024×1536 | evet |
| 03 | `props-sheet.png` | 1536×1024 | hayır |
| 04 | `story-scan.png` | 1024×1024 | evet |
| 05 | `story-order.png` | 1024×1024 | evet |
| 06 | `story-weather.png` | 1024×1024 | evet |
| 07 | `story-pair.png` | 1024×1024 | hayır |
| 08 | `smart-night.png` | 1024×1024 | evet |
| 09 | `features-sheet.png` | 1536×1024 | hayır |
| 10 | `join-celebrate.png` | 1024×1024 | evet |
| 11 | `og.png` | 1536×1024 | evet (isteğe bağlı) |
