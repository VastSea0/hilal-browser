# Google Play Store — Veri Güvenliği Beyanı (Data Safety Declaration)

Google Play Console üzerinde **Uygulama İçeriği > Veri Güvenliği (Data Safety)** anketini doldururken aşağıdaki yanıtları kullanın.

Bu yanıtlar `android/app/src/main/java/com/vastsea/hilal/telemetry/Telemetry.kt` ve `www/api/telemetry.ts` dosyalarındaki gerçek davranışa dayanır. O dosyalar değişirse bu beyanı ve Play Console'daki formu da güncelleyin.

---

## 1. Genel Bakış

| Soru | Yanıt | Açıklama |
|---|---|---|
| **Uygulamanız kullanıcı verisi toplar mı?** | **EVET (YES)** | Anonim kullanım istatistikleri. Ayarlardan kapatılabilir. |
| **Kullanıcı verilerini üçüncü taraflarla paylaşır mı?** | **HAYIR (NO)** | Veriler, istatistik sunucusunun barındırıldığı hizmetler (Vercel, Google Cloud Firestore) dışında kimseye gönderilmez. Bu hizmetler veriyi yalnızca proje adına işler. |
| **Toplanan veriler aktarım sırasında şifrelenir mi?** | **EVET (YES)** | İstatistikler HTTPS üzerinden gönderilir. |
| **Kullanıcılar verilerinin silinmesini talep edebilir mi?** | **HAYIR (NO)** | Kayıtlar bir kişiye bağlanamadığı için tek bir kullanıcının kayıtları bulunup silinemez. Kullanıcılar istatistik gönderimini ayarlardan kapatabilir. |

---

## 2. Toplanan Veri Kategorileri

### A. Cihaz veya Diğer Kimlikler (Device or other IDs)
- **Toplanan veri:** Uygulama ilk açıldığında rastgele üretilen kurulum kimliği (UUID). Reklam kimliği, Android ID veya donanım kimliği okunmaz.
- **Amaç:** Analiz (Analytics) — kurulum ve günlük aktif kullanım sayılarını tekrar saymadan hesaplamak.
- **Kullanıcıyla ilişkilendiriliyor mu?** HAYIR.
- **Zorunlu mu?** HAYIR — kullanıcı ayarlardan kapatabilir.

### B. Uygulama Etkinliği > Uygulama Etkileşimleri (App activity > App interactions)
- **Toplanan veri:** Seçili arama motoru, tema modu, uBlock Origin'in açık olup olmadığı ve açık sekme sayısı aralığı (1, 2-5, 6-10, 11+).
- **Amaç:** Analiz (Analytics).
- **Kullanıcıyla ilişkilendiriliyor mu?** HAYIR.
- **Zorunlu mu?** HAYIR.

### C. Uygulama Bilgileri ve Performans > Diğer (App info and performance > Other)
- **Toplanan veri:** Uygulama sürümü ve derleme numarası, Android API seviyesi, işlemci mimarisi (ör. `arm64-v8a`) ve sistem dili.
- **Amaç:** Analiz (Analytics) ve uygulama işlevselliği — hangi sürüm ve cihaz türlerinin desteklenmesi gerektiğini görmek.
- **Kullanıcıyla ilişkilendiriliyor mu?** HAYIR.
- **Zorunlu mu?** HAYIR.

İstatistikler günde en fazla bir kez gönderilir. Cihaz modeli, IP adresi, ziyaret edilen adresler ve arama sorguları gönderilmez.

---

## 3. Toplanmayan Veriler

Aşağıdaki kategorilerin tamamı için **"Toplanmıyor (Not collected)"** seçin:

- Konum
- Kişisel bilgiler (ad, e-posta, telefon vb.)
- Finansal bilgiler
- Sağlık ve fitness
- Mesajlar
- Fotoğraflar ve videolar
- Ses dosyaları
- Dosyalar ve belgeler
- Takvim
- Kişiler
- Web'de gezinme ve arama geçmişi (yalnızca cihazda kalır)

Uygulama kamera, mikrofon ve konum izinlerini yalnızca web sitelerinin isteklerini kullanıcıya iletmek için ister. Bu veriler kullanıcının izin verdiği siteye gider, projeye gönderilmez.

---

## 4. Reklam ve Finansman

- **Reklam:** Hayır, uygulamada reklam yok (No, my app does not contain ads).
- **Finansman:** Topluluk bağışları. Kullanıcı verisi satılmaz.
