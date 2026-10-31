# Google Play Console — Adım Adım Yayınlama Rehberi

Bu rehber, Hilal Browser Android uygulamasının Google Play Console üzerinde sıfırdan oluşturulup incelemeye gönderilmesine kadar gereken tüm adımları içerir.

---

## 1. Uygulama Oluşturma (Create App)
1. [Google Play Console](https://play.google.com/console) adresine giriş yapın.
2. **"Uygulama oluştur" (Create App)** butonuna tıklayın.
3. Bilgileri girin:
   - **Uygulama Adı:** `Hilal: Hızlı & Gizli Tarayıcı`
   - **Varsayılan Dil:** Türkçe (tr-TR) *(İkincil dil olarak İngilizce eklenecek)*
   - **Uygulama veya Oyun:** Uygulama (App)
   - **Ücretsiz veya Ücretli:** Ücretsiz (Free)
4. Beyanları onaylayıp **"Uygulama oluştur"** deyin.

---

## 2. Ana Mağaza Girişi (Main Store Listing)
Sol menüden **Büyüme > Mağaza Varlığı > Ana Mağaza Girişi (Main store listing)** bölümüne gidin:

### A. Metinler
- **Uygulama Adı (30 karakter):**
  `Hilal: Hızlı & Gizli Tarayıcı`
- **Kısa Açıklama (80 karakter):**
  `GeckoView ve Material 3 destekli, gizlilik odaklı modern web tarayıcısı.`
- **Tam Açıklama (4000 karakter):**
  [`playstore/metadata/STORE_LISTING_TR.md`](STORE_LISTING_TR.md) dosyasındaki tam metni yapıştırın.
- **İngilizce Dil Çevirisi:**
  Sağ üstteki "Çevirileri Yönet" butonuna tıklayıp **English (United States)** ekleyin ve [`playstore/metadata/STORE_LISTING_EN.md`](STORE_LISTING_EN.md) dosyasındaki metinleri yapıştırın.

### B. Grafik Varlıkları
- **Uygulama Simgesi (App Icon):**
  `playstore/graphics/app_icon/icon_512x512.png` (512x512 PNG) yükleyin.
- **Özellik Grafiği (Feature Graphic):**
  `playstore/graphics/feature_graphic/feature_graphic_tr.png` (1024x500 PNG) yükleyin.
- **Telefon Ekran Görüntüleri (Phone Screenshots):**
  `playstore/graphics/store_screenshots/tr/` klasöründeki 6 adet 1080x2400 ekran görüntüsünü sırayla yükleyin:
  1. `01_home.png` (Modern ve Hızlı Başlangıç)
  2. `02_privacy.png` (Gerçek Gizlilik & Güvenlik)
  3. `03_workspaces.png` (Sekmelerinizi Düzenleyin)
  4. `04_options.png` (Tek Dokunuşla Yönetim)
  5. `05_settings.png` (Koyu Mod ve Esnek Düzen)
  6. `06_bangs.png` (Işık Hızında Doğrudan Arama)
  *(İngilizce mağaza girişi için `store_screenshots/en/` klasöründeki görselleri yükleyin).*

---

## 3. Uygulama İçeriği Beyanları (App Content)
Sol menüden en alttaki **Politika ve Programlar > Uygulama İçeriği (App content)** bölümüne gidin:

1. **Gizlilik Politikası (Privacy Policy):**
   - URL olarak projenin yayındaki gizlilik sayfasını girin:
     `https://hilal-browser.vercel.app/privacy.html`
2. **Reklamlar (Ads):**
   - "Hayır, uygulamamda reklam yok" seçin.
3. **Uygulama Erişimi (App access):**
   - "Tüm işlevler özel erişim kısıtlaması olmadan kullanılabilir" seçin.
4. **İçerik Derecelendirmesi (Content Rating - IARC):**
   - [`playstore/metadata/CONTENT_RATING_IARC.md`](CONTENT_RATING_IARC.md) rehberine göre anketi doldurun. Beklenen sonuç: **PEGI 3 / Herkes**.
5. **Hedef Kitle ve İçerik (Target Audience):**
   - 18 yaş ve üzeri, 13-17 yaş seçin. Çocukları kasıtlı olarak hedeflemediğinizi onaylayın.
6. **Veri Güvenliği (Data Safety):**
   - [`playstore/metadata/DATA_SAFETY_DECLARATION.md`](DATA_SAFETY_DECLARATION.md) rehberine göre doldurun. Uygulama, ayarlardan kapatılabilen anonim kullanım istatistikleri gönderir; bu yüzden form "Veri toplanmıyor" olarak doldurulamaz.
7. **Hükümet / Finans / Sağlık Uygulamaları:**
   - Hepsine "Hayır" deyin.

---

## 4. Sürümü Yükleme ve İncelemeye Gönderme (Release & Publish)

1. Sol menüden **Sürümler > Üretim (Production)** veya **Açık Test (Open Testing)** bölümüne gidin.
2. **"Yeni sürüm oluştur" (Create new release)** butonuna tıklayın.
3. Android Release iş akışının (`.github/workflows/android-release.yml`) ürettiği imzalı **`.aab`** dosyasını sürüm yükleme kutusuna sürükleyip bırakın.
4. **Sürüm Adı:** yayımlanan `android-vX.Y.Z` etiketiyle aynı sürüm.
5. **Sürüm Notları:** `android/release-notes/<sürüm>.md` dosyasındaki notları yapıştırın.
6. **"Kaydet"** ardından **"Sürümü İncele" (Review release)** ve **"Üretime sunmayı başlat" (Start rollout to Production)** butonuna basarak Google Play incelemesine gönderin.
