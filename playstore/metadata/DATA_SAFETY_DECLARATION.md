# Google Play Store — Veri Güvenliği Beyanı (Data Safety Declaration)

Google Play Console üzerinde **Uygulama İçeriği > Veri Güvenliği (Data Safety)** anketini doldururken aşağıdaki yanıtları kullanın.

---

## 1. Veri Toplama ve Güvenliği Genel Bakış

| Soru | Yanıt | Açıklama |
|---|---|---|
| **Uygulamanız zorunlu veya isteğe bağlı kullanıcı verisi toplar mı?** | **EVET (YES)** | Yalnızca tamamen anonim kullanım ve kararlılık istatistikleri toplanır. |
| **Uygulamanız kullanıcı verilerini üçüncü taraflarla paylaşır mı?** | **HAYIR (NO)** | Veriler hiçbir üçüncü tarafla, reklam ağıyla veya veri komisyoncusuyla paylaşılmaz. |
| **Toplanan tüm veriler aktarım sırasında şifrelenir mi?** | **EVET (YES)** | Tüm ağ trafiği güvenli HTTPS bağlantısı üzerinden şifrelenerek iletilir. |
| **Kullanıcılara verilerinin silinmesini talep edebilecekleri bir yöntem sağlıyor musunuz?** | **EVET (YES)** | Kullanıcılar Ayarlar > "Tarama Verilerini Temizle" seçeneğiyle tüm yerel verileri tek dokunuşla tamamen silebilir. |

---

## 2. Toplanan Veri Kategorileri ve Detayları

Google Play Data Safety formunda yalnızca aşağıdaki **Uygulama Bilgileri ve Performans** kategorisini işaretleyin:

### A. Uygulama Bilgileri ve Performans (App Info and Performance)
1. **Tanılama (Diagnostics) / Diğer Uygulama Performans Verileri:**
   - **Toplanan veri:** Anonim cihaz modeli ve işletim sistemi sürümü (ör. Android 14 / Pixel 7).
   - **Kullanım Amacı:** **Uygulama İşlevselliği (App Functionality)** ve **Analiz (Analytics)** — GeckoView motorunun belirli cihaz ve işletim sistemi sürümlerindeki çökme/render uyumluluk sorunlarını tespit edip gidermek.
   - **Kullanıcı Kimliği ile Bağlantılı mı? (Linked to user?):** **HAYIR (NO)** — Veriler hiçbir kişisel kimlik, e-posta, telefon veya reklam kimliğiyle (GAID) İLİŞKİLENDİRİLMEZ.
   - **İşleme Şekli:** Geçici olarak işlenir / anonim istatistik amacıyla kullanılır.

---

## 3. Toplanmayan Veriler (Tümü "HAYIR" Olarak İşaretlenecek)

Aşağıdaki kategorilerin tamamı için **"Toplanmıyor (Not collected)"** seçilmelidir:
- **Konum (Location):** ❌ Toplanmıyor
- **Kişisel Bilgiler (Ad, e-posta, telefon vb.):** ❌ Toplanmıyor
- **Finansal Bilgiler:** ❌ Toplanmıyor
- **Sağlık ve Fitness:** ❌ Toplanmıyor
- **Mesajlar (SMS vb.):** ❌ Toplanmıyor
- **Fotoğraflar ve Videolar:** ❌ Toplanmıyor
- **Ses Dosyaları:** ❌ Toplanmıyor
- **Dosyalar ve Belgeler:** ❌ Toplanmıyor
- **Kişiler (Rehber):** ❌ Toplanmıyor
- **Web'de Gezinme / Arama Geçmişi:** ❌ Toplanmıyor (Geçmiş, çerezler ve aramalar yalnızca kullanıcının cihazında yerel kalır)
- **Cihaz veya Diğer Kimlikler (Device ID, Advertising ID):** ❌ Toplanmıyor (Reklam kimliği asla okunmaz)

---

## 4. Gelir ve Finansman Beyanı (Ads & Commercial Model)
- **Reklam Durumu:** **Hayır, uygulamamda reklam yok (No, my app does not contain ads)**.
- **Finansman Yöntemi:** Açık kaynaklı topluluk sponsorlukları (GitHub Sponsors) ve bağışlar. Kullanıcı verisi satışı veya ticari reklam geliri kesinlikle bulunmamaktadır.
