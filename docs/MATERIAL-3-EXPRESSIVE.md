# Hilal Browser — Material 3 Expressive Tasarım Sistemi ve Uygulama Kuralları

Bu doküman, Hilal Browser ekosisteminde (web sitesi `www/`, tarayıcı kromu `chrome://`, `about:` sayfaları, çalışma alanları, karşılama ekranı ve ayarlar) **Material 3 Expressive (M3E)** arayüzünün nasıl uygulanacağını belirleyen kesin ve bağlayıcı standarttır.

Bu kurallar, kod tabanında geliştirme yapan tüm geliştiriciler ve yapay zeka ajanları (Antigravity, Claude vb.) için bağlayıcıdır.

---

## 1. Temel Felsefe ve Mimari İlkeler

1. **Marka ve Tohum Rengi Değiştirilemez:** Hilal Browser'ın resmi tohum rengi **Google / Hilal Mavisi (`#0b57d0`)** rengidir. Koyu modda M3 türetilmiş birincil rengi `#a8c7fa`'dır. Başka hiçbir kütüphanenin varsayılan renk paleti veya rastgele renkler bu tohumun yerine geçirilemez.
2. **Cam/Bulanıklık (Glassmorphism) Yok, Saf Yüzeyler (Solid Surfaces) Var:** Gezinti çubukları, menüler ve kartlar saydam veya `backdrop-blur` yapılmaz. Material 3'ün temel prensibi katı, opak tonlu yüzeylerdir (`surface`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`).
3. **Ferah Alan ve Nefes Alma Boşluğu (Breathing Room):** Bileşenler asla sıkışık olamaz. Masaüstü pencerelerinde bileşenlerin 20 karakterde kırpılmasına (`...`), metinlerin kenarlığa yapışmasına veya butonların birbirine ezilmesine asla izin verilmez.
4. **Tahmin Değil, Görsel Doğrulama:** Bir arayüz bileşeni değiştirildiğinde sadece CSS koduna bakılarak "oldu" denilemez. Gerçek render edilmiş çıktı (Chrome CDP, tarayıcı ekran görüntüsü) ile incelenmeli, hem açık hem koyu modda kontrol edilmelidir.

---

## 2. Tasarım Token'ları (Tokens)

### A. Renk Sistemi (Color System)

| Token Adı | Açık Mod (Light) | Koyu Mod (Dark) | Kullanım Alanı |
|---|---|---|---|
| `--primary` | `#0b57d0` | `#a8c7fa` | Birincil butonlar, aktif sekmeler, vurgular |
| `--on-primary` | `#ffffff` | `#062e6f` | Primary üzeri metin ve ikonlar |
| `--primary-container` | `#d3e3fd` | `#0842a0` | Tonal butonlar, aktif menü arkaplanları, rozetler |
| `--on-primary-container` | `#041e49` | `#d3e3fd` | Primary-container üzeri metin |
| `--surface` | `#f8f9ff` | `#111318` | Sayfa genel arkaplanı |
| `--surface-container-lowest` | `#ffffff` | `#0c0e12` | En alt kartlar, girdi alanları, temiz kutular |
| `--surface-container-low` | `#f2f3fa` | `#191c20` | Kart arkaplanları, rozet arkaplanları |
| `--surface-container` | `#eceef5` | `#1e2025` | Standart diyaloglar, modallar, sabit navbar |
| `--surface-container-high` | `#e6e8ef` | `#282a2f` | Rozetler, vurgulu kart içi bölümler |
| `--surface-container-highest` | `#e0e2e9` | `#33353a` | Hover yüzeyleri, ayrılmış sekmeler |
| `--outline` | `#73777f` | `#8d9199` | Vurgulu sınırlar, ikon konturları |
| `--outline-variant` | `#c3c7cf` | `#43474e` | İnce kart sınırları, ayırıcı çizgiler |

### B. Köşe Yuvarlatma Ölçeği (Shape Scale)

Material 3 Expressive, keskin 90 derece köşeleri reddeder:

* **Pill (Tam Yuvarlak):** `rounded-full` (`9999px`) — Butonlar, rozetler (chips), arama çubukları, etiketler.
* **Extra Large:** `rounded-[32px]` / `rounded-[28px]` — Modallar, diyalog pencereleri, büyük vitrin kartları.
* **Large:** `rounded-2xl` (`16px`) — Liste öğeleri, ayar kartları, kod blokları.
* **Medium:** `rounded-xl` (`12px`) — İkon konteynerları, küçük kartlar, açılır menü öğeleri.
* **Small:** `rounded-lg` (`8px`) — Kod blok kopyalama butonları, tooltip'ler.
* **Yasak:** Köşe yuvarlatması verilmemiş (`rounded-none`, `0px`) kutu butonlar KESİNLİKLE YASAKTIR.

### C. Tipografi (Typography)

* **Gövde Metinleri:** `"Roboto Flex"`, `"Roboto"`, `-apple-system`, `sans-serif`.
* **Kod ve Dosya Adları:** `"JetBrains Mono"`, `ui-monospace`, `monospace`.
* **Başlıklar:** M3 Display ölçeğinde genişletilmiş font streç (`fontStretch: "110%"`) ve sıkı harf aralığı (`tracking-tight`).

---

## 3. Bileşen Standartları ve Anatomisi

### A. Butonlar (Buttons)

Tüm butonlar `type="button"` niteliğine ve net dolgulara (`padding`) sahip olmalıdır.

#### 1. Birincil Dolgulu Buton (Primary Filled Pill Button)
```html
<!-- M3 Expressive Primary Filled Button -->
<button
  type="button"
  class="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs sm:text-sm font-semibold transition-all cursor-pointer border-0 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
>
  <i class="text-lg">download</i>
  <span>İndir</span>
</button>
```

#### 2. Tonal / Çerçeveli Buton (Outlined / Tonal Pill Button)
```html
<!-- M3 Expressive Outlined / Tonal Button -->
<button
  type="button"
  class="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full border border-[var(--outline-variant)]/40 bg-m3-container-lowest hover:bg-m3-container text-[var(--on-surface)] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs hover:shadow group"
>
  <i class="text-lg text-[var(--primary)] group-hover:-translate-x-0.5 transition-transform">chevron_left</i>
  <span>Önceki Bölüm</span>
</button>
```

#### 3. Buton Kuralları:
* Buton yüksekliği asla ezilmemeli (minimum `py-2` veya `py-2.5`, yükseklik en az `36px`-`44px`).
* Yatay dolgu (`px-*`) asla metne yapışamaz; en az `px-4` veya `px-5` olmalıdır.
* İkon ve metin arasında daima `gap-2` veya `gap-2.5` boşluk bırakılmalıdır.

---

### B. Rozetler ve Çipler (Chips & Badges)

Rozetlerde metnin kenarlığa temas etmesi en sık yapılan hatadır.

#### Doğru Rozet Anatomisi:
```html
<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border border-[var(--outline-variant)]/40 bg-m3-container-low text-[var(--on-surface-variant)] shadow-xs">
  <i class="text-sm text-[var(--primary)]">info</i>
  <span>Bölüm 1 / 8</span>
</div>
```

#### Rozet Kuralları:
* Daima `inline-flex`, `items-center` ve `rounded-full` kullanılmalıdır.
* Dolgu (padding) değeri **asla** `px-3 py-1` altına düşemez.
* Beer CSS'in yalın `.chip.border` sınıfı Tailwind ile çakışabildiği için doğrudan M3 sınıfları uygulanmalı veya global CSS koruması devrede tutulmalıdır.

---

### C. Kartlar ve Konteynerlar (Cards & Containers)

* **Kart Arka Planı:** Yüzey hiyerarşisine göre `bg-m3-container-lowest` veya `bg-m3-container-low`.
* **Kenarlık:** Hafif ve zarif `border border-[var(--outline-variant)]/25`.
* **Köşe Yuvarlatması:** `rounded-2xl` (standart kartlar) veya `rounded-[28px]` / `rounded-[32px]` (öne çıkan bölümler).
* **İç Dolgu (Padding):** Kart içi içerik kenarlara yapışamaz; masaüstünde `p-6` veya `p-7`, mobil ekranlarda minimum `p-4`.

---

### D. Diyaloglar ve Modallar (Dialogs & Popups)

* **Genişlik Kuralı:** Masaüstü pop-up'ları ASLA `max-w-lg` (512px) ile boğulamaz. Karmaşık paket veya liste içeren diyaloglar **en az `max-w-2xl` (672px) veya `max-w-3xl` (768px)** olmalıdır.
* **İki Satırlı Meta Düzeni:** Liste öğelerinde platform adı, format ve dosya boyutu üst satırda; tam ve kırpılmamış dosya adı alt satırda yer almalıdır.
* **Mobil Uyumluluk:** Kart içi bileşenler mobilde `flex-col`, masaüstünde `sm:flex-row` ile taşmadan sıralanmalıdır.
* **Kapatma Deneyimi:** Hem dış tık (backdrop click), hem `Escape` tuşu, hem de sağ üstteki belirgin M3 kapatma butonu mutlaka çalışmalıdır.

---

### E. İkon Standardı (Material Symbols)

* **Tek Kaynak:** Tüm arayüzde **yalnızca Google Material Symbols Outlined** kullanılır.
* **Karışık Kütüphane Yasağı:** Lucide, FontAwesome, Feather veya özel rastgele SVG ikonlar ile Google ikonları karıştırılamaz.
* **Ligature Kullanımı:**
  ```html
  <i class="material-symbols-outlined text-xl">download</i>
  ```
* **FOUT Önlemi:** Yazı tipi yerel `.woff2` olarak projeye gömülmeli ve `font-display: block` ile tanımlanmalıdır; aksi takdirde ikon yüklenene kadar sayfada "download", "search" gibi çiğ metinler görünür.

---

## 4. Tarayıcı Kromu ve Firefox (Gecko) Ortamında M3 Uygulaması

Tarayıcının iç sayfalarında (`about:welcome`, `about:newtab`, `about:preferences`, tarayıcı pencere kromu) Material 3 uygulanırken Gecko motorunun kurallarına dikkat edilmelidir:

1. **Native Widget Reset:**
   Firefox'un varsayılan GTK/Cocoa widget stillerini ezmek için:
   ```css
   button, input, select {
     -moz-appearance: none !important;
     appearance: none !important;
   }
   ```
2. **HTML Namespace Güvenliği:**
   Tarayıcı kromunda dinamik eleman üretirken XUL yerine daima HTML namespace kullanılmalıdır:
   ```js
   const HTML_NS = "http://www.w3.org/1999/xhtml";
   const btn = document.createElementNS(HTML_NS, "button");
   ```
3. **CSS Değişken Kapsamı:**
   Tarayıcı sayfalarında kök seviyede `--primary: #0b57d0` ve türevleri tanımlanmalı, sistem açık/koyu temasına göre medya sorgusu (`@media (prefers-color-scheme: dark)`) ile dinamik güncellenmelidir.

---

## 5. Beer CSS ve Tailwind Çakışma Tuzakları (Lessons Learned)

Geçmişte yaşanan ve kesinlikle tekrarlanmaması gereken 8 tuzak:

1. **`body.dark` Sızıntısı:** Beer CSS kütüphanesi yüklendiğinde gövdeye sessizce `.dark` sınıfı basabilir. React tema durumu değiştiğinde hem `html` hem `body` senkronize edilmeli ve Beer CSS'e `ui("mode", theme)` bildirilmelidir.
2. **`content-box` Tuzağı:** Beer CSS bazı butonlarda `box-sizing: content-box` kullanır. Bu durum Tailwind'in `border-box` yapısıyla çakışarak buton köşelerinin keskin kutuya dönüşmesine ve metin taşmasına yol açar. Butonlarda daima açık sınıflar (`inline-flex`, `rounded-full`, `px-5 py-2.5`) kullanılmalıdır.
3. **Rozet Padding Kaybı:** `.chip` sınıfları Tailwind resetleri altında dikey dolgusunu yitirebilir. `index.css` içindeki M3 rozet reset kuralları korunmalıdır.
4. **Masaüstünde Dar Modal:** 512px pop-up içine 35+ karakterlik dosya adları, rozet ve aksiyon butonu sığmaz; dosya adı kırpılır. Modal genişliği minimum 672px olmalıdır.
5. **Glassmorphism Kalıntısı:** Navbar üzerinde `backdrop-blur` bırakılmamalı; açık modda opak saf beyaz (`#ffffff`), koyu modda opak yüzey (`#1e2025`) verilmelidir.
6. **Eksik Navbar Ofseti:** Sabit navbar (`fixed top-0`) kullanıldığında sayfa içeriği `pt-28` veya `pt-36` ile ötelenmeli; aksi takdirde navbar içerik başlıklarının üzerine biner.
7. **Eski Sınıf Kalıntıları:** `.secondary-container.small`, `.button.border.small` gibi kütüphane artıkları taranıp temizlenmeli, saf M3 pill sınıfları yazılmalıdır.
8. **Kör Commit Yasağı:** Ekran görüntüsüyle doğrulanmamış hiçbir arayüz kodu commit edilemez.

---

## 6. Zorunlu Arayüz Kontrol Listesi (Pre-Commit Checklist)

Herhangi bir arayüz değişikliği tamamlandığında şu 10 madde denetlenmeden işlem bitirilemez:

- [ ] 1. **Marka Mavisi Korundu mu?** Vurgu ve buton rengi `#0b57d0` (koyu modda `#a8c7fa`) tohumundan sapmadı.
- [ ] 2. **Düz Zeminler:** Navbar ve menülerde cam/bulanıklık (`backdrop-blur`) yok, saf opak renkler kullanıldı.
- [ ] 3. **Rozet ve Çip Dolguları:** Tüm rozetlerde (`chip`) metin sınıra yapışmıyor; yatay en az `px-3.5`, dikey `py-1` boşluk var.
- [ ] 4. **Buton Yuvarlaklığı:** Keskin 90 derece kutu buton yok; tüm butonlar `rounded-full` veya orantılı M3 köşe yuvarlatmasına sahip.
- [ ] 5. **İndirme Pop-up Ferahlığı:** Pop-up en az `max-w-2xl` genişliğinde, dosya adları kırpılmıyor, indirme butonları belirgin.
- [ ] 6. **İkon Bütünlüğü:** Sadece Google Material Symbols kullanıldı, eksik fonttan ötürü çiğ metin düşmesi (FOUT) yok.
- [ ] 7. **Duyarlılık (Responsive):** Mobil ekran genişliğinde (390px) yatay taşma veya üst üste binme yok.
- [ ] 8. **Tema Desteği:** Hem Aydınlık (Light) hem Karanlık (Dark) modda kontrast ve görünürlük kusursuz.
- [ ] 9. **Gezinti ve Scroll:** Bölüm linkleri içerik alanına kayıyor (`scroll-mt-*`), navbar başlıkları kapatmıyor.
- [ ] 10. **Görsel Kanıt:** Değişiklikler tarayıcı ortamında çalıştırıldı, ekran görüntüsü alınarak incelendi ve doğrulandı.
