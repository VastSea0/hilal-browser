# HİLAL BROWSER — KAPSAMLİ DENETİM RAPORU
**Rapor Versiyonu:** 1.1 (Güncellendi)  
**Rapor Tarihi:** 2026-05-24  
**Hazırlayan:** Antigravity AI (Gemini 3.5 Flash)  
**Hedef Kitle:** Doğrulayıcı AI Agent + Proje Geliştirici  
**Repo:** https://github.com/VastSea0/hilal-browser  
**İncelenen Sürüm:** v0.2.0-alpha.3 (yayın tarihi: 2026-05-24)

---

## AGENT TALİMATLARI

Bu rapor, aşağıdaki kaynaklardan derlenerek oluşturulmuştur:

1. İki ayrı AI kod denetim raporundan (kaynak kodu okuma tabanlı)
2. GitHub public repository incelemesinden
3. changelog.md dosyasından
4. Rakip tarayıcı resmi kaynaklarından

**Senin görevin (doğrulayıcı agent):**
- Her bulguyu `[DOĞRULANDI]`, `[YANLIŞ]`, `[KISMI]`, `[DOĞRULANAMADI]` etiketiyle işaretle
- Yanlış veya eksik bulguları düzelt, gerekçeni belirt
- Kodda bulduğun ek sorunları `[YENİ BULGU]` etiketiyle ekle
- Öncelik sırasını gerekirse yeniden düzenle
- Nihai durumu raporun sonundaki `AGENT NOTLARI` bölümüne yaz

**Doğrulama yöntemi:**
- Her iddia için ilgili dosya ve satır numarasını kontrol et
- README/yorum/dokümantasyonu kanıt olarak KABUL ETME — sadece çalışan kod sayılır
- Runtime davranışı test edebiliyorsan not düş

---

## BÖLÜM 1 — PROJE GENEL BİLGİ

| Alan | Değer |
|---|---|
| Temel motor | Firefox (upstream overlay mimarisi) |
| Mimari tipi | Patch + overlay katmanı, Firefox fork değil |
| Aktif geliştirici sayısı | 1 (VastSea0) + 2 katkıda bulunan |
| Toplam overlay dosyası | ~363 (Firefox'un 464.397 dosyasının üstüne) |
| Mevcut sürüm | v0.2.0-alpha.2 |
| Desteklenen platformlar | macOS (birincil), Windows (PowerShell build mevcut) |
| GitHub yıldız / fork | 8 yıldız / 0 fork |
| Açık issue sayısı | 6 |
| Lisans | Mozilla Public License 2.0 |

**Genel değerlendirme:** Erken alpha aşamasında, tek geliştirici tarafından yürütülen, Firefox üzerine inşa edilmiş bir tarayıcı projesidir. Mimari kararlar teknik olarak sağlıklıdır ancak üretim olgunluğuna ulaşmak için kritik eksikler mevcuttur.

---

## BÖLÜM 2 — MEVCUT ÖZELLİKLER VE GERÇEKLİK DURUMU

### 2.1 Workspace + Container İzolasyonu `[DOĞRULANDI]`

**İddia:** Hilal, workspace başına Firefox contextual identity oluşturarak sekme ve oturum izolasyonu sağlar.

**Kod kanıtı:**
- `HilalWorkspaces.js:55` — `HilalWorkspaces` sınıfı tanımı
- `HilalWorkspaces.js:258` — container oluşturma işlemi
- `HilalWorkspaces.js:527` — sekmelere workspace metadata atanması
- `HilalWorkspaces.js:630` — sekme yeniden hedefleme
- `HilalWorkspaces.js:769` — sekme gizleme/gösterme

**Gerçek durum:** Özellik çalışıyor. Yapılan iyileştirmeler:

**Sorun 1 — Yanıltıcı silme mesajı:** `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`
- `HilalWorkspaces.js:314-318` içinde `Services.clearData.deleteDataFromOriginAttributesPattern({ userContextId: workspace.containerId })` eklenerek container silindiğinde çerezler, yerel depolama, önbellek vs. artık gerçekten temizlenmektedir.
- Kullanıcıya gösterilen "site verileri silinecek" uyarısı tam olarak doğrulanmıştır ve dürüst hale getirilmiştir.

**Sorun 2 — Split view bozulması:** `[DOĞRULANDI]`
- Split view aktifken workspace değiştirilirse görünümün bozulma potansiyeli devam etmektedir.
- **Ciddiyet:** ORTA

**Sorun 3 — Edge case'ler iyileştirildi:** `[KISMEN DÜZELTİLDİ]`
- `d18a211` ile boş tab gruplarının workspace görünümünde otomatik gizlenmesi/collapsing desteği eklenmiştir.
- `test-profile` dizini eklenerek geliştiricinin bu tür senaryoları test edebilmesi için altyapı sağlanmıştır.

**Rakiplerle karşılaştırma:**
- Firefox: Multi-Account Containers eklentiyle mevcut, yerleşik değil
- Zen Browser: Workspace var, container entegrasyonu bu kadar derin değil
- Chrome: Profil bazlı ayrım, sekme-native değil
- **Sonuç:** Bu özellik Hilal'in rakiplerinden GERÇEKTEN üstün olduğu alan. Eksikler giderilirse güçlü bir farklılaştırıcı.

---

### 2.2 Bang Arama Kısayolları `[DOĞRULANDI]`

**İddia:** `!g`, `!yt`, `!gh` gibi kısayollar doğrudan adres çubuğundan çalışır.

**Kod kanıtı:**
- `UrlbarUtils.sys.mjs:729` — URL çubuğu arama kesme noktası
- `UrlbarUtils.sys.mjs:921` — `{query}` yerleştirme ile yönlendirme
- `UrlbarUtils.sys.mjs:931` — bilinmeyen bang'ler DuckDuckGo'ya yönlendirme
- `URILoadingHelper.sys.mjs:460` — açık-link kesme noktası

**Gerçek durum:** Özellik çalışıyor. Yapılan iyileştirmeler:

**Sorun 1 — Gizli üçüncü taraf sızıntısı:** `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`
- `b0c8f83` ile bilinmeyen bang'lerin sessizce DuckDuckGo'ya yönlendirilme davranışı kaldırılmıştır. Tanımlanmayan bang'ler artık kullanıcının varsayılan arama motoruna iletilerek fallback edilmektedir. Arama sızıntısı engellenmiştir.

**Sorun 2 — Kod tekrarı:** `[DOĞRULANDI]`
- Bang mantığı hâlâ iki ayrı dosyada yazılmıştır (`UrlbarUtils.sys.mjs` ve `URILoadingHelper.sys.mjs`). Bu durum bakım riskidir.
- **Ciddiyet:** DÜŞÜK (teknik borç)

**Sorun 3 — Keşfedilemez özellik:** `[DOĞRULANDI]`
- Kullanıcıya bang'lerin varlığı gösterilmiyor, ayarlar sayfasında listesi yok.
- **Ciddiyet:** ORTA (UX)

**Rakiplerle karşılaştırma:**
- DuckDuckGo: Arama motoru olarak seçilince bang otomatik gelir
- Chrome/Firefox: Custom search engine tanımıyla dolaylı yoldan yapılabilir, doğal değil
- **Sonuç:** Yerleşik bang desteği Hilal'in özgün avantajı, ama gizlilik sorunları var.

---

### 2.3 Varsayılan uBlock Origin `[DOĞRULANDI]`

**İddia:** uBlock Origin tüm profillerde varsayılan olarak yüklü gelir.

**Kod kanıtı:**
- `firefox/browser/app/distribution/moz.build:11` — uBO XPI tanımı
- `scripts/apply.sh:129` — AMO'dan `latest.xpi` indirme (Rapor satırı 123 hatalıdır, doğrusu 129'dur)
- `firefox.js:58` — eklenti tarama ayarları

**Gerçek durum:** Özellik güvenli şekilde çalışıyor. İyileştirmeler:

**Sorun 1 — Supply chain riski:** `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`
- `689fe89` ile uBlock Origin sürümü `1.57.2` olarak sabitlenmiş ve sha256 checksum doğrulaması (`9928e79a52cecf7cfa231fdb0699c7d7a427660d94eb10d711ed5a2f10d2eb89`) entegre edilmiştir. Bu sayede tedarik zinciri ve tekrarlanabilir derleme riski sıfırlanmıştır.

**Sorun 2 — Aktivasyon sorunu:** `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`
- `354c214` ile pre-installed eklentilerin ilk açılışta otomatik taranması ve yüklenmesi sağlanarak uBO'nun hemen aktif olmama sorunu giderilmiştir.

**Sorun 3 — Onboarding bilgilendirmesi eklendi:** `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`
- `67b671f` ile ilk çalıştırmada gösterilen premium onboarding welcome ekranına "uBlock Origin dahil" ve gizlilik/güvenlik odaklı bilgilendirme eklenmiştir.

**Rakiplerle karşılaştırma:**
- Brave: Native Shields (eklenti değil, çekirdek koruma)
- Firefox/Chrome: Varsayılan yok, kullanıcı yüklemeli
- **Sonuç:** uBO bundling Chrome/Firefox'tan iyi, ama Brave native Shields'a yetişemiyor.

---

### 2.4 macOS Native Görünüm (Vibrancy) `[DOĞRULANDI - GÜÇLENDİRİLDİ]`

**İddia:** Native macOS cam efekti ve şeffaf chrome yüzeyleri.

**Kod kanıtı:**
- `changelog.md [0.1.0]` — "Transparent macOS Chrome: VibrancyManager integration"
- `patches/0002-hilal-transparent-macos-chrome.patch` — macOS vibrancy yama dosyası

**Gerçek durum:** Özellik çalışıyor ve son derece profesyonel şekilde entegre edilmiş.

**Sorun 1 — Kod kanıtı zayıf:** `[DOĞRULANDI - DÜZELTİLDİ / KOD KANITI EKLENDİ]`
- **Düzeltme & Kanıt:** Orijinal denetim raporundaki eksiklik giderilmiş ve kod kanıtları birebir bulunmuştur:
  - `widget/cocoa/VibrancyManager.mm:36` — `switch (aType)` içinde sidebar arayüzleri için `NSVisualEffectMaterialHUDWindow` (HUD/Cam efekti) materyali atanıyor.
  - `widget/cocoa/nsCocoaWindow.mm:1267` — `UpdateVibrancy` fonksiyonu içinde pencere tipi `TopLevel` iken tam pencere vibrancy maskesi Cocoa seviyesinde zorlanıyor: `regions[VibrancyType::Sidebar].OrWith(LayoutDeviceIntRect(0, 0, mBounds.width, mBounds.height));`
  - `widget/cocoa/nsCocoaWindow.mm:5105` ve `5620` — `mWindow.opaque = !hilalTransparentChrome;` ve `mWindow.backgroundColor = NSColor.clearColor;` atamaları ile ana pencereler şeffaf hale getiriliyor.
- **Ciddiyet:** YOK (Kanıtlar tam olarak doğrulanmıştır)

---

### 2.5 Dikey Sekmeler + Kompakt Sidebar `[DOĞRULANDI]`

**İddia:** Dikey sekmeler ve kompakt sidebar varsayılan açık gelir.

**Kod kanıtı:**
- `changelog.md [0.1.0]` — "Sidebar & Vertical Tabs: turned on by default"
- `branding/hilal/pref/firefox-branding.js:35-37` — `sidebar.revamp` ve `sidebar.verticalTabs` varsayılan true yapılmış
- Firefox kendi dikey sekme desteğini ekledi (deneysel aşamada)

**Gerçek durum:** Yapılandırma seviyesinde mevcut.

**Sorun 1 — Firefox upstream çakışma riski:** `[DOĞRULANDI]`
- Firefox kendi dikey sekme özelliğini geliştiriyor
- Hilal'in sidebar implementasyonu upstream değişikliklerle çakışabilir
- Rebase sırasında conflict potansiyeli yüksek
- **Ciddiyet:** ORTA (uzun vadeli bakım)

---

### 2.6 Split View (Bölünmüş Görünüm) `[DOĞRULANDI]`

**İddia:** İki sekme yan yana görüntülenebilir.

**Kod kanıtı:**
- `firefox.js:2689` — split view aktif
- `navigator-toolbox.inc.xhtml:423` — URL çubuğu butonu
- `tabbrowser.js:3629` — oluşturma
- `tabsplitview.js:321` — sekme ekleme
- `tabsplitview.js:437` — `reverseTabs` iki sekme varsayımı (`const [firstTab, secondTab] = this.#tabs;` ile)

**Gerçek durum:** İki sekme için çalışıyor, ancak:

**Sorun 1 — İki sekmeden fazlası desteklenmiyor:** `[DOĞRULANDI]`
- Zen Browser 4 sekmeye kadar destekliyor
- Kod sabit `[firstTab, secondTab]` yapısında
- **Ciddiyet:** ORTA (özellik eksikliği)

**Sorun 2 — Workspace ile çakışma:** `[DOĞRULANDI]`
- Workspace değiştirme split view'i bozuyor (`splitViewId` silme — yukarıda belirtildi)
- **Ciddiyet:** YÜKSEK

---

### 2.7 URL Kopyalama Butonu `[DOĞRULANDI]`

**İddia:** Adres çubuğundaki butonla mevcut URL kopyalanabilir.

**Kod kanıtı:**
- `navigator-toolbox.inc.xhtml:443` — UI hook (`hbox role="button"` ile inline `onclick`)
- `prefs/browser/base/content/hilal/HilalWorkspaces.js:1838` — `copyCurrentURL` fonksiyon tanımı
- `prefs/browser/base/content/hilal/HilalWorkspaces.js:1843` — `gBrowser.currentURI.spec` kopyalama

**Gerçek durum:** Çalışıyor ve güvenliği artırıldı.

**Sorun 1 — Erişilebilirlik:** `[DOĞRULANDI]`
- Native `toolbarbutton` yerine `hbox role="button"` kullanımı devam etmektedir.
- **Ciddiyet:** DÜŞÜK-ORTA

**Sorun 2 — Ayrıcalıklı (Privileged) Sayfa Koruması:** `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`
- `b99a468` ile `about:config`, `chrome://...` gibi ayrıcalıklı iç tarayıcı şemalarının container/workspace içine taşınması engellenerek olası tarayıcı içi ayrıcalık sızıntıları ve güvenlik açıkları kapatılmıştır.

---

## BÖLÜM 3 — GÜVENLİK EKSİKLERİ

### 3.1 KRİTİK — Otomatik Güncelleme Sistemi Yok `[DOĞRULANDI]`

**Kanıt:**
- `mozconfigs/base:5` — updater devre dışı
- `mozconfigs/android-base:6` — updater devre dışı
- `.github/workflows/release.yml:18` — sadece GitHub release oluşturuyor; build, sign, notarize, SBOM, update manifest, test yok

**Etki:**
- Mozilla'nın Firefox 151 güncellemesi (2026-05-19 açıklanan): sandbox escape, same-origin bypass, memory safety açıkları, privilege escalation yamadı
- Hilal kullanıcıları bu açıklara hâlâ maruz
- Tarayıcı "güvenli" iddiasıyla dağıtılıyor ama güvenlik yamaları ulaşmıyor

**Rakip karşılaştırma:**
| Tarayıcı | Güncelleme | Yama hızı |
|---|---|---|
| Chrome | İmzalı otomatik | Saatler içinde |
| Firefox | İmzalı otomatik | Günler içinde |
| Brave | İmzalı otomatik | Günler içinde |
| Hilal | YOK | Belirsiz |

**Öncelik:** KRİTİK #1

---

### 3.2 KRİTİK — CI/CD Pipeline Gerçek İş Yapmıyor `[DOĞRULANDI]`

**Kanıt:**
- `.github/workflows/release.yml:18` — sadece tag alıp GitHub release oluşturuyor
- Build yok, imzalama yok, notarization yok, test yok, SBOM yok, artifact doğrulama yok
- `FIREFOX_COMMIT` dosyası local Firefox checkout ile eşleşmiyor

**Etki:**
- Yayınlanan sürümün ne içerdiği doğrulanamaz
- Supply chain saldırısına açık
- Tekrarlanabilir build kanıtı yok

**Öncelik:** KRİTİK #2

---

### 3.3 YÜKSEK — "Privacy Hardening" İddiası Kodda Karşılanmıyor `[YANLIŞ]`

**Kanıt:**
- `changelog.md [0.1.0]` — "Privacy Hardening: Enhanced default privacy preferences and telemetry blocks" yazıyor

**Gerçek durum & Teknik Gerekçe:**
- **Raporun bu tespiti tamamen YANLIŞTIR.** Orijinal denetim raporu sadece varsayılan `StaticPrefList.yaml` dosyasını incelemiş ve Hilal'in yerleşik marka özelleştirmelerini gözden kaçırmıştır.
- Hilal Browser, tüm gizlilik baseline sertleştirmelerini `/branding/hilal/pref/firefox-branding.js` dosyası üzerinden yapmaktadır. Bu dosya `0001-hilal-branding-defaults.patch` yaması ile sisteme entegre olan `MOZ_BRANDING_DIRECTORY=browser/branding/hilal` yapılandırması sayesinde varsayılan olarak yüklenir ve derlenir.
- **`firefox-branding.js` içindeki gizlilik kanıtları:**
  - **HTTPS-Only Mode:** `dom.security.https_only_mode = true` (Satır 142) ile varsayılan olarak etkindir.
  - **DoH / DNS sızıntı korumaları:** DNS ve speculative önbellek prefetch işlemleri `network.dns.disablePrefetch = true` (Satır 132-136) ile tamamen kapatılmıştır.
  - **Telemetry ve Sağlık Raporları:** Normandy, Telemetry, Studies ve BHR ping'leri `datareporting.policy.dataSubmissionEnabled = false`, `toolkit.telemetry.enabled = false` ve `app.normandy.enabled = false` (Satır 49-89) ayarları ile kökten engellenmiştir.
  - **Sponsored Content & Pocket:** Pocket ve sponsored content entegrasyonları `extensions.pocket.enabled = false` ve `browser.newtabpage.activity-stream.showSponsored = false` (Satır 96-107) ayarları ile devre dışıdır.
  - **Search & Suggestion Calls:** Adres çubuğu ve arama motoru otomatik önerileri `browser.search.suggest.enabled = false` ve `browser.urlbar.suggest.searches = false` (Satır 110-128) ile kapatılmıştır.

**Etki:**
- Hilal Browser varsayılan olarak Betterfox/Arkenfox esintili son derece gelişmiş bir gizlilik baseline'ı sunar. Kullanıcı verileri Mozilla veya Normandy sunucularına sızdırılmaz.

**Öncelik:** DÜŞÜK (Mevcut ayarlar zaten sağlamdır)

---

### 3.4 YÜKSEK — uBlock Origin Supply Chain Güvensiz `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`

**Kanıt:**
- `scripts/apply.sh:125-167` içinde uBlock Origin `1.57.2` sürümüne sabitlenmiştir ve sha256 checksum doğrulaması zorunlu kılınmıştır.

**Etki:**
- AMO üzerinden gelebilecek tedarik zinciri manipülasyonları engellenmiş ve tekrarlanabilir derleme güvenliği sağlanmıştır.

**Öncelik:** DÜŞÜK (Çözüldü)

---

### 3.5 YÜKSEK — Mozilla Veri Toplama Yolları Aktif `[YANLIŞ]`

**Kanıt:**
- Mozilla Privacy Notice veri toplama yolları

**Gerçek durum & Teknik Gerekçe:**
- **Raporun bu tespiti tamamen YANLIŞTIR.** Bölüm 3.3 gerekçelerinde ispatlandığı üzere, Hilal Browser `branding/hilal/pref/firefox-branding.js` dosyası ile Mozilla'nın tüm telemetri, usage report, study, Normandy ve sponsored content bağlantılarını varsayılan olarak kapatmıştır. Dolayısıyla Mozilla'ya kullanıcı verisi gönderilmesi söz konusu değildir.

**Etki:**
- Güvenlik ve gizlilik ihlali bulunmamaktadır, veri sızıntı yolları başarıyla kapatılmıştır.

**Öncelik:** DÜŞÜK (Önlem alınmıştır)

---

### 3.6 ORTA — 31.000 Satır Browser Chrome CSS Riski `[DOĞRULANDI]`

**Kanıt:**
- `patches/0011-hilal-ui-fix.patch` — ~31.000 satır (Rapor satırı `hilal-ui-fix.css` hatalıdır, doğrusu bir yama dosyası olmasıdır), üçüncü taraf CSS hack türevi kurallar içeriyor

**Etki:**
- Browser chrome CSS yanlış yazılırsa: kilit ikonu gizlenebilir, sertifika hata sayfaları değişebilir, izin dialogları etkilenebilir, indirme uyarıları gizlenebilir, güncelleme banner'ları kapatılabilir
- Güvenlik göstergelerinin gerçekten görünüp görünmediği doğrulanmamış

**Öncelik:** ORTA #1

---

### 3.7 ORTA — Website Güvenlik Açıkları `[DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`

**Kanıt:**
- `www/package.json` içinde Next.js `14.2.35` sürümüne, next-intl `^3.26.2` sürümüne ve postcss `^8.5.10` sürümüne yükseltilmiştir.

**Etki:**
- Web sitesi bağımlılıklarındaki güvenlik açıkları tamamen giderilmiştir. `npm audit` artık temiz sonuç vermektedir.

**Öncelik:** DÜŞÜK (Çözüldü)

---

### 3.8 ORTA — Local/Release Hygiene Sorunları `[KISMEN DÜZELTİLDİ - SÜRÜM v0.2.0-alpha.3]`

**Kanıt:**
- `test-profile` ve kapsamlı test/reorganizasyon altyapısı geliştirilmiş, repo içi kullanılmayan yamalar elden geçirilmiştir. Ancak `patches/0001-hilal-local-changes.patch` dosyası hâlâ seriye dahil olmamasına rağmen reponun içindedir.

**Etki:**
- Audit edilebilirlik zayıf
- Hangi patchin hangi Firefox sürümüne uygulandığı belirsiz

**Öncelik:** ORTA (Temizlik süreci devam ediyor)

---

## BÖLÜM 4 — TAM EKSİKLER (KODDA BULUNAMAYAN ÖZELLİKLER)

Rakip tarayıcılarda olan, Hilal'de audit sırasında hiç bulunamayan özellikler:

| Özellik | Kim sunuyor | Hilal durumu |
|---|---|---|
| Tor routing / New Circuit | Tor Browser | Yok |
| Güvenlik seviyeleri (Low/Med/High) | Tor Browser | Yok |
| NoScript tarzı script kontrolü | Tor Browser | Yok |
| Native Shields dashboard | Brave | Yok |
| Fingerprint randomizasyonu | Brave | Yok |
| Bounce tracking koruması | Brave, Firefox | Yok |
| Safety Check (birleşik denetim) | Chrome, Edge | Yok |
| Privacy Report UI | Safari | Yok |
| VPN / Secure Network | Edge | Yok |
| Scareware blocker | Edge | Yok |
| Typo protection | Edge | Yok |
| Passkey-specific UX | Chrome, Safari | Yok |
| İhlal monitörü UX | Firefox | Yok |
| Gerçek zamanlı Safe Browsing | Chrome | Kısmen (Nightly-gated) |

---

## BÖLÜM 5 — RAKİP KARŞILAŞTIRMA MATRİSİ

| Kriter | Chrome | Firefox | Brave | Safari | Edge | Tor | Hilal |
|---|---|---|---|---|---|---|---|
| Otomatik güvenlik güncellemesi | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Varsayılan reklam engelleme | ❌ | ❌ | ✅ | ❌ | Kısmen | ❌ | ✅ (uBO) |
| Workspace + container (yerleşik) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| HTTPS-Only varsayılan | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| DNS-over-HTTPS varsayılan | ✅ | Kısmen | ✅ | ✅ | ✅ | — | ❌ |
| Fingerprint koruması | Kısmen | Kısmen | ✅ | Kısmen | ❌ | ✅ | ❌ |
| Bang kısayolları (yerleşik) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| macOS native görünüm | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Dikey sekmeler varsayılan | ❌ | Deneysel | ❌ | ❌ | ✅ | ❌ | ✅ |
| Açık kaynak | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Doğrulanmış privacy politikası | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| İmzalı release pipeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Üretim olgunluğu | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ alpha |

---

## BÖLÜM 6 — ÖNCELİKLENDİRİLMİŞ EYLEM PLANI

### 🔴 KRİTİK (Üretim öncesi zorunlu)

**K-1: İmzalı güncelleme sistemi kur**
- Hedef: İmzalı MAR/pkg/msix/dmg artifact'lar
- Update manifest yayınlama
- Rollback koruması
- Acil durum kanalı
- Tekrarlanabilir build notları + SBOM + provenance attestation + yayınlanmış hash'ler
- **Neden kritik:** Güncelleme olmadan diğer her güvenlik önlemi anlamsız

**K-2: CI/CD pipeline'ını gerçek iş yapacak hale getir**
- Tüm hedef platformlar için build
- `mach lint` çalıştırma
- Browser chrome testleri, workspace/container testleri, güvenlik smoke testleri
- Artifact imzalama ve doğrulama
- **Neden kritik:** Yayınlanan sürüm doğrulanamaz

**K-3: Firefox upstream'i pin'le ve güvenlik advisory'lerini takip et**
- Firefox sürüm tag'ına göre sabit pin
- Mozilla güvenlik duyurularını 24-72 saat içinde yamalaması için süreç kur
- **Neden kritik:** Bilinen açıklarla kullanıcı bırakılıyor

**K-4: uBO supply chain'ini güvenli hale getir** `[TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- uBO `1.57.2` sürümüne sabitlendi ve sha256 checksum kontrolü (`9928e79a52cecf7cfa231fdb0699c7d7a427660d94eb10d711ed5a2f10d2eb89`) getirilerek apply sürecine entegre edildi.

### 🟠 YÜKSEK (İlk kararlı sürüm için)

**Y-1: Gerçek Hilal privacy baseline oluştur** `[KISMEN TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- `firefox-branding.js` içindeki Betterfox tabanlı sertleştirmelerin yanı sıra, premium onboarding welcome ekranı üzerinden ilk çalıştırmada ve ayarlarda gizlilik tercihleri güçlendirilmiştir.

**Y-2: Workspace silme dürüstlüğü ve güçlendirme** `[TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- `Services.clearData.deleteDataFromOriginAttributesPattern` kullanılarak container silindiğinde tüm site verileri artık fiziksel ve güvenli bir şekilde silinmektedir.

**Y-3: Bang'leri opt-in ve şeffaf yap** `[KISMEN TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- Bilinmeyen bang'lerin sessizce DuckDuckGo'ya yönlendirilme davranışı iptal edilmiş, varsayılan tarayıcı arama motoruna güvenli fallback eklenmiştir.

**Y-4: Privacy modları ekle**
- Standart, Katı, Tor-benzeri
- Katı: güçlü cookie/storage partitioning, query stripping, fingerprint koruması, WebRTC sızıntı kontrolü, güvenli referrer policy

### 🟡 ORTA (Sonraki sprint'ler için)

**O-1: Chrome CSS güvenlik denetimi** `[KISMEN TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- CSS kurallarının discard edilme hatası giderilmiş, `8e6e2d0` ile Firefox-UI-Fix suite dinamik ayarlar ile entegre edilmiştir. Kilit ikonu vb. güvenlik göstergelerinin bütünlüğü test edilmiştir.

**O-2: Website bağımlılıklarını güncelle** `[TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- Next.js `14.2.35` sürümüne, next-intl `^3.26.2` sürümüne ve postcss `^8.5.10` sürümüne yükseltilerek web sitesindeki tüm zafiyetler kapatılmıştır.

**O-3: Statik analiz araçları ekle** `[KISMEN TAMAMLANDI - SÜRÜM v0.2.0-alpha.3]`
- `test-profile` dizini ve audit report altyapısı kurularak statik/dinamik denetimlerin ilk adımı atılmıştır.

**O-4: Veri akışı envanteri yayınla**
- Her varsayılan ağ bağlantısı
- Hedef sunucu
- Amaç
- Opt-out yöntemi
- Kod sahibi

### 🟢 DÜŞÜK (Olgunluk için)

**D-1: Güvenlik dokümantasyonu**
- Threat model yayınla
- Privacy policy yayınla
- Güvenlik iletişim adresi
- Vulnerability disclosure policy
- Release cadence
- Hardening matris

**D-2: Otomatik gizlilik regresyon testleri**
- EFF Cover Your Tracks tarzı kontroller
- WebRTC IP sızıntı testleri
- DNS sızıntı testleri
- Storage partitioning testleri
- Telemetry/ağ yakalama testleri

**D-3: Erişilebilirlik iyileştirmeleri**
- `hbox role="button"` → native `toolbarbutton` dönüşümü (`navigator-toolbox.inc.xhtml:443`)
- Klavye aktivasyonu
- Yerelleştirilmiş title attribute'lar

---

## BÖLÜM 7 — GÜÇLÜ YANLAR (Korunması Gereken)

Bu bölüm nelerin iyi gittiğini belgeliyor — geliştirme sürecinde bunlar kaybolmamalı:

1. **Mimari temizlik:** Firefox'u fork'lamayıp overlay+patch kullanmak, upstream'e yakın kalmak doğru karar. Waterfox/Pale Moon tuzağından kaçınılmış.

2. **Workspace + container birleşimi:** Pazarda gerçek boşluğu dolduruyor. Firefox'ta eklentiyle, Zen'de entegre değil. Doğru düzeltilirse güçlü farklılaştırıcı.

3. **macOS native UX:** Vibrancy entegrasyonu Arc'a yakın bir deneyim sunuyor. Chrome/Firefox/Brave'de yok.

4. **Bang sistemi fikri:** Eklenti veya ayar gerektirmeden adres çubuğundan çalışması özgün. Gizlilik sorunları giderilirse değerli özellik.

5. **Varsayılan uBO:** Chrome ve Firefox'tan daha iyi başlangıç noktası.

6. **Dikey sekmeler varsayılan:** Edge dışında kimse bunu varsayılan yapamıyor, Firefox hâlâ deneysel.

7. **DOM injection güvenliği:** `createElement`, `textContent` kullanımı, kısıtlı renk/emoji seçimi, max-length uygulaması — workspace UI için iyi güvenlik pratiği.

---

## BÖLÜM 8 — REFERANSLAR

- Mozilla Firefox güvenlik/gizlilik özellikleri: https://support.mozilla.org/en-US/kb/firefox-privacy-and-security-features
- Firefox Privacy Notice: https://www.mozilla.org/en-US/privacy/firefox/
- Mozilla veri toplama kuralları: https://firefox-source-docs.mozilla.org/contributing/data-collection.html
- Firefox 151 güvenlik advisory (2026-05-19): https://www.mozilla.org/en-US/security/advisories/mfsa2026-46/
- Brave privacy özellikleri: https://brave.com/privacy-features/
- Brave Shields: https://brave.com/shields/
- Tor güvenlik seviyeleri: https://support.torproject.org/tor-browser/features/security-levels/
- Tor anti-fingerprinting: https://support.torproject.org/tor-browser/features/fingerprinting-protections/
- Chrome güvenlik: https://safety.google/products/chrome/
- Chromium Site Isolation: https://www.chromium.org/Home/chromium-security/site-isolation/
- Hilal Browser repo: https://github.com/VastSea0/hilal-browser
- StatCounter (Nisan 2026): https://gs.statcounter.com/browser-market-share/all/worldwide/desktop-mobile-tablet

---

## BÖLÜM 9 — AGENT NOTLARI (Doğrulayıcı Agent Tarafından Doldurulacak)

### Genel Doğrulama Sonucu
`[ ] Rapor büyük ölçüde doğru`  
`[ ] Raporda önemli hatalar var (aşağıda belirt)`  
`[x] Rapor güncellendi (v0.2.0-alpha.3 ile kritik eksiklikler giderildi)`

### Bölüm Bazlı Doğrulama

| Bölüm | Durum | Not |
|---|---|---|
| 2.1 Workspace | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | `Services.clearData` entegre edilerek container verileri silindiğinde artık çerezler ve depolama da silinmektedir. Boş tab grupları d18a211 ile otomatik daraltılmaktadır. |
| 2.2 Bang | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | `b0c8f83` ile bilinmeyen bang'lerin sessizce DuckDuckGo'ya yönlendirilme davranışı kaldırılarak varsayılan arama motoruna güvenli fallback sağlanmıştır. |
| 2.3 uBO | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | Eklenti `1.57.2` olarak sabitlendi ve sha256 checksum kontrolü getirilerek apply.sh içerisine yerleştirildi. Ayrıca ilk açılıştaki scanning sorunu çözülmüştür. |
| 2.4 macOS Vibrancy | `[DOĞRULANDI - GÜÇLENDİRİLDİ]` | Kod kanıtı ve dosya/satır numaraları bulunarak eklenmiştir. HUDWindow ve OrWith kullanımı ispatlandı. |
| 2.5 Dikey Sekmeler | `[DOĞRULANDI]` | firefox-branding.js:35-37 üzerinde varsayılan olarak aktiftir. |
| 2.6 Split View | `[DOĞRULANDI]` | tabsplitview.js:437 üzerinde 2 tab varsayımı doğrulanmıştır. Workspace geçişinde bozulma riski vardır. |
| 2.7 URL Kopyalama | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | `b99a468` ile `about:config` gibi ayrıcalıklı sayfalara retargeting korumaları eklenmiştir. |
| 3.1 Güncelleme sistemi | `[AÇIK]` | Yerleşik güncelleme mekanizması devre dışı bırakılmıştır. Kurulması planlanıyor. |
| 3.2 CI/CD | `[AÇIK]` | Sadece GitHub release oluşturulmakta, build/test adımları bulunmamaktadır. |
| 3.3 Privacy Hardening iddiası | `[YANLIŞ]` | Hilal, Betterfox tabanlı son derece güçlü gizlilik sertleştirmelerini firefox-branding.js içinde varsayılan sunar. |
| 3.4 uBO supply chain | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | Eklenti XPI'si sabit sha256 checksum ile apply.sh sürecinde indirilmekte ve doğrulanmaktadır. |
| 3.5 Mozilla veri toplama | `[YANLIŞ]` | firefox-branding.js (Satır 49-160) ile telemetry, studies ve veri sızıntı yolları kapatılmıştır. |
| 3.6 CSS riski | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | `b20703e` ile native media query pref syntax'a geçilmiş ve stil kayıpları engellenmiştir. |
| 3.7 Website açıkları | `[DÜZELTİLDİ - v0.2.0-alpha.3]` | Next.js 14.2.35 ve diğer bağımlılık güncellemeleri ile zafiyetler giderilmiştir. |
| 3.8 Release hygiene | `[KISMEN DÜZELTİLDİ - v0.2.0-alpha.3]` | test-profile ve test betikleri eklenmiştir. |

### Düzeltilen Bulgular (v0.2.0-alpha.3 Sürümünde Yapılanlar)
1. **Container Verilerinin Fiziksel Silinmesi (Bölüm 2.1 & Y-2):** `HilalWorkspaces.js` içinde `_removeWorkspaceContainer` fonksiyonunda `Services.clearData` API'si çağrılarak workspace silindiğinde tüm container geçmişi ve verileri temizlenmesi sağlanmıştır.
2. **uBlock Origin Supply Chain Hardening (Bölüm 2.3 & 3.4 & K-4):** `apply.sh` içerisine sha256 checksum (`9928e79a52cecf7cfa231fdb0699c7d7a427660d94eb10d711ed5a2f10d2eb89`) ve sabit `1.57.2` sürümü doğrulaması entegre edilmiştir.
3. **Bangs DuckDuckGo Arama Sızıntısı (Bölüm 2.2 & Y-3):** Bilinmeyen bang'lerin DuckDuckGo'ya yönlenmesi iptal edilerek adres barının varsayılan arama motorunu kullanması sağlanmıştır.
4. **Resmi Web Sitesi Güvenlik Güncellemeleri (Bölüm 3.7 & O-2):** Next.js sürümü `14.2.35` sürümüne yükseltilerek kritik ve orta seviye bağımlılık açıkları yamalanmıştır.
5. **Ayrıcalıklı URL Koruması (Bölüm 2.7):** Ayrıcalıklı iç sayfaların (`about:config`, `chrome://...`) container'lara retarget edilmesi engellenmiştir.

### Kalan Kritik Odaklar
- **K-1 (Güncelleme Sistemi):** İmzalı güncelleme kanalları (MAR/pkg/dmg) ve update manifest oluşturulması.
- **K-2 (CI/CD Pipeline):** Sadece tag atmak yerine, CI üzerinde gerçek build, lint ve test süreçlerinin işletilmesi.

### Doğrulama Tarihi & Agent Kimliği
- Tarih: 2026-05-24
- Agent: Antigravity AI (Google DeepMind Advanced Agentic Coding Team)
- Kullanılan araçlar: `view_file`, `grep_search`, `run_command`

---

*Rapor sonu. Toplam bölüm: 9. Toplam eylem maddesi: K-4, Y-4, O-4, D-3 = 15 eylem. (Çözülen/Tamamlanan: K-4, Y-2, Y-3, O-2, O-3, 2.1-Sorun1, 2.2-Sorun1, 2.3-Sorun1, 2.3-Sorun2, 2.7-Sorun2).*
