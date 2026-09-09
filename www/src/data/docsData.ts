export interface DocSubSection {
  id: string;
  title: string;
  description?: string;
  content: string; // Markdown / formatted string with code blocks, tables, callouts
}

export interface DocSection {
  id: string;
  title: string;
  shortTitle: string;
  iconName: string;
  description: string;
  subsections: DocSubSection[];
}

export interface DocsContent {
  meta: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noResults: string;
    backToHome: string;
    onThisPage: string;
    copyCode: string;
    copied: string;
    targetVersion: string;
    engineBase: string;
    licenseBadge: string;
  };
  sections: DocSection[];
}

export const DOCS_DATA: Record<"tr" | "en", DocsContent> = {
  tr: {
    meta: {
      title: "Geliştirici Dokümantasyonu",
      subtitle:
        "Hilal Browser mimarisi, yama ve katman sistemi, yerel derleme adımları ve kaynak kodu organizasyonu.",
      searchPlaceholder: "Dokümantasyonda ara (komut, alt sistem, dosya)...",
      noResults: "Aramanızla eşleşen bir konu bulunamadı.",
      backToHome: "Ana Sayfaya Dön",
      onThisPage: "Bu Bölümde",
      copyCode: "Kopyala",
      copied: "Kopyalandı",
      targetVersion: "Sürüm: 0.3.0-alpha",
      engineBase: "Taban: Mozilla Firefox (Gecko)",
      licenseBadge: "Lisans: MPL 2.0",
    },
    sections: [
      {
        id: "architecture",
        title: "Mimari ve Zihinsel Model",
        shortTitle: "Mimari",
        iconName: "Layers",
        description:
          "Hilal'in Firefox üzerinde bir yama ve katman katmanı olarak nasıl konumlandığı.",
        subsections: [
          {
            id: "dual-tree-model",
            title: "Çift Ağaç (Dual-Tree) Mimarisi",
            description: "Kaynak deposu ile Firefox motorunun ayrımı.",
            content: `Hilal Browser, bağımsız bir tarayıcı motoru veya upstream Firefox'tan koparılmış bir hard-fork **değildir**. Firefox Gecko motorunun üzerine inşa edilmiş deklaratif bir **yama (patch) ve katman (overlay)** projesidir.

Bu yaklaşım, Gecko motorunun güvenlik güncellemelerini, web standartları uyumluluğunu ve performans iyileştirmelerini doğrudan alırken; arayüzü, gizlilik politikalarını ve çalışma alanı davranışını bağımsız olarak geliştirmeyi sağlar.

Sistem iki ayrı ağaç yapısından oluşur:

1. **\`hilal-browser/\` (Kaynak Doğruluğu):** Bu git deposudur. Yalnızca metin tabanlı deklaratif yapılandırmaları (\`manifest.toml\`, \`upstream.lock\`), birleşik yama dosyalarını (\`changes/**/*.patch\`), doğrudan kopyalanan katman dosyalarını (\`changes/**\`) ve derleme betiklerini içerir. Boyutu küçüktür ve tamamen sürümlenmiştir.
2. **\`hilal-browser/engine/\` (Firefox Kaynak Kodu):** Tam Firefox kaynak ağacıdır. Bu repodan **gitignore** edilmiştir. Kendi git geçmişine sahiptir ve \`mozilla-firefox/firefox\` deposunun \`upstream.lock\` içinde belirtilen kesin commit karmasına kilitlidir.

\`\`\`text
                    ./bin/hil apply
hilal-browser/  ─────────────►  engine/         (derleme ve çalıştırma burada yapılır)
   ▲                              │
   │           ./bin/hil refresh  │
   └──────────────────────────────┘
\`\`\`

> **Önemli Kural:** Kaynak kod düzenlemeleri her zaman \`engine/\` dizini içinde yapılır. Değişiklikler test edilip onaylandıktan sonra \`./bin/hil refresh\` ile ana depodaki yama dosyalarına dönüştürülür.`
          },
          {
            id: "repo-structure",
            title: "Dizin Yapısı",
            description: "Depodaki dosya ve klasörlerin görev dağılımı.",
            content: `Deponun ana dizinindeki temel bileşenler şunlardır:

\`\`\`text
hilal-browser/
├── changes/          # Firefox ağacını yansıtan yama (*.patch) ve katman (overlay) dosyaları
│   ├── browser/      # Arayüz, yerelleştirme, temalandırma ve kabuk bileşenleri
│   ├── xpcom/        # Düşük seviye platform uyumluluk yamaları
│   └── ipc/          # Süreçler arası iletişim düzeltmeleri
├── manifest.toml     # Yamaların ve katmanların uygulanma sırasını belirleyen bildirim dosyası
├── upstream.lock     # Kilitli Firefox commit karması ve taban dal bilgisi
├── hil/              # Rust ile yazılmış özel yama yöneticisi (CLI) kaynak kodu
├── bin/hil           # Derlenmiş hil ikili dosyası
├── scripts/          # Platform derleme ve paketleme betikleri (macOS, Linux, Windows)
├── docs/             # Teknik şartnameler ve platform yönergeleri
└── engine/           # (gitignored) Pinned Firefox kaynak deposu
\`\`\``
          },
          {
            id: "patch-manager",
            title: "Hil Yama Yöneticisi (`hil` CLI)",
            description: "Rust ile geliştirilmiş deterministik yama yöneticisi.",
            content: `Firefox'un devasa kod tabanı üzerinde çalışırken git tabanlı yama yönetimini otomatikleştirmek için Rust ile yazılmış \`hil\` yardımcı aracı kullanılır.

\`hil\` aracı harici bağımlılık gerektirmeden çalışır ve şu temel işlevleri yürütür:

| Komut | Açıklama |
| --- | --- |
| \`./bin/hil setup\` | \`upstream.lock\` dosyasındaki commit karmasını \`engine/\` içine çeker ve kilitler. |
| \`./bin/hil apply\` | \`manifest.toml\` sırasına göre tüm yamaları ve katmanları \`engine/\` ağacına damgalar. |
| \`./bin/hil apply --force\` | \`engine/\` ağacını temiz taban commit'e sıfırlar ve yamaları baştan zorla uygular. |
| \`./bin/hil refresh\` | \`engine/\` içindeki commit geçmişini analiz edip \`changes/\` altındaki \`*.patch\` dosyalarını yeniler. |
| \`./bin/hil verify\` | \`engine/\` ağacının geçerli taban commit ile uyuşup uyuşmadığını denetler. |
| \`./bin/hil status\` | Çalışma alanının anlık yama ve katman durumunu özetler. |`
          }
        ]
      },
      {
        id: "quickstart",
        title: "Kurulum ve Hızlı Başlangıç",
        shortTitle: "Kurulum",
        iconName: "Terminal",
        description: "Geliştirme ortamının hazırlanması ve ilk derleme adımları.",
        subsections: [
          {
            id: "prerequisites",
            title: "Sistem Önkoşulları",
            description: "Derleme için gereken asgari paketler ve derleyiciler.",
            content: `Hilal Browser'ı kaynak koddan derlemek için Mozilla Firefox derleme gereksinimleri ve ek olarak Rust derleyicisi şarttır:

1. **Rust & Cargo:** \`rustup\` ile güncel kararlı Rust toolchain kurulu olmalıdır (yama yöneticisini ve Firefox'un dahili Rust bileşenlerini derlemek için).
2. **Python 3:** Mozilla derleme sistemi (\`mach\`) Python 3 ortamında çalışır.
3. **Mozilla Bootstrap:** Platformunuza göre resmi bootstrap betiğini çalıştırın:

\`\`\`bash
curl -L https://raw.githubusercontent.com/mozilla-firefox/firefox/refs/heads/main/python/mozboot/bin/bootstrap.py -O
python3 bootstrap.py
\`\`\`

Bu işlem Xcode Command Line Tools (macOS) veya temel derleme paketlerini (Linux/Windows), sysroot ortamını, \`cargo\` ve \`cbindgen\` bağımlılıklarını otomatik hazırlar.`
          },
          {
            id: "initial-build",
            title: "İlk Derleme Sırası",
            description: "Deponun klonlanmasından ilk çalıştırılabilir tarayıcıya kadar olan adımlar.",
            content: `Adım adım kurulum süreci:

\`\`\`bash
# 1. Kaynak depoyu klonlayın
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# 2. Rust ile hil yöneticisini derleyin ve bin dizinine taşıyın
cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil

# Windows ortamında:
# copy hil\\target\\release\\hil.exe bin\\hil.exe

# 3. Firefox motorunu çekin ve yamaları uygulayın
./bin/hil setup    # engine/ dizinine Firefox'u klonlar (yaklaşık 2-3 GB veri transferi)
./bin/hil apply    # manifest.toml dosyasındaki tüm yama ve katmanları aktarır

# 4. Platform derleme betiğini başlatın (İlk derleme donanıma göre 15-45 dk sürer)
scripts/build-macos.sh    # macOS için
# scripts/build-linux.sh   # Linux için
# .\\scripts\\build-windows.ps1 # Windows PowerShell için

# 5. Derlenen tarayıcıyı çalıştırın
(cd engine && ./mach run)
\`\`\``
          }
        ]
      },
      {
        id: "workflow",
        title: "Geliştirme Döngüsü",
        shortTitle: "Geliştirme",
        iconName: "GitBranch",
        description: "Günlük kod geliştirme, hızlı ön yüz testleri ve yama yenileme döngüsü.",
        subsections: [
          {
            id: "edit-cycle",
            title: "Kod Değiştirme ve Test Döngüsü",
            description: "Firefox kod tabanında değişiklik yapma ve derleme süreci.",
            content: `Geliştirme sürecinin altın kuralı: **Her zaman \`engine/\` dizininde çalışın.**

1. İlgili dosyaları doğrudan \`engine/\` içinde düzenleyin (örneğin \`engine/browser/base/content/hilal/HilalShell.js\`).
2. Değişikliğin türüne göre hızlı artımlı derleme komutunu çalıştırın.
3. Test edin ve memnun kaldığınızda \`engine/\` içinde git ile commit atın.
4. Kök dizine dönüp \`./bin/hil refresh\` komutuyla yamaları güncelleyin.
5. Ana depoda \`git diff\` çıktısını inceleyip commit oluşturun.

\`\`\`bash
# Ön yüz değişikliklerini anında görmek için:
scripts/build-macos.sh faster
(cd engine && ./mach run)
\`\`\``
          },
          {
            id: "fast-iteration",
            title: "Hızlı İterasyon (Build Faster)",
            description: "Tam derleme beklemeden saniyeler içinde ön yüz veya C++/Rust testi.",
            content: `Firefox'un derleme sistemi modülerdir. Her küçük CSS veya JS değişikliği için tüm C++ çekirdeğini yeniden derlemeye gerek yoktur:

| Değişiklik Türü | Komut | Süre |
| --- | --- | --- |
| **Ön Yüz (JS, CSS, XHTML, FTL, .ini)** | \`scripts/build-macos.sh faster\` | ~2-5 saniye |
| **C++ / Rust İkili Kodları** | \`scripts/build-macos.sh binaries\` | ~30-90 saniye |
| **Karışık / Tam Derleme** | \`scripts/build-macos.sh\` | ~2-5 dakika |

Bu komutlar Mozilla'nın dahili \`./mach build faster\` ve \`./mach build binaries\` mekanizmalarını tetikler.

> **İpucu:** Tarayıcı arayüzü JavaScript, CSS ve XHTML dosyalarında yapılan değişikliklerin büyük kısmı \`faster\` derlemesiyle doğrudan omni.ja paketine işlenir ve saniyeler içinde test edilebilir.`
          },
          {
            id: "refreshing-patches",
            title: "Yamaları Yenileme (`hil refresh`)",
            description: "engine/ içindeki commit'lerin changes/ klasörüne aktarılması.",
            content: `\`engine/\` dizininde yaptığınız değişiklikleri commit ettikten sonra, bu değişiklikleri ana depoya aktarmak için kök dizinde şu komutu çalıştırın:

\`\`\`bash
./bin/hil refresh
\`\`\`

Bu komut:
- \`engine/\` içindeki commit yığınını \`upstream-base\` etiketiyle karşılaştırır.
- \`manifest.toml\` içinde tanımlı yama eşleştirmelerini analiz eder.
- \`changes/\` dizinindeki ilgili \`*.patch\` dosyalarını temiz unified diff formatında yeniden üretir.
- Katman dosyaları (PNG, ICO, FTL) doğrudan \`changes/\` diziniyle senkronize edilir.

Oluşan değişiklikleri ana depoda gözden geçirin:

\`\`\`bash
git status
git diff changes/
git commit -am "feat(shell): update sidebar collapse behavior"
\`\`\`

> **Önemli:** Asla \`engine/\` dizinini ana git deposuna eklemeyin. \`engine/\` zaten \`.gitignore\` kapsamındadır.`
          }
        ]
      },
      {
        id: "patches",
        title: "Yama ve Katman Sistemi",
        shortTitle: "Yamalar & Katmanlar",
        iconName: "FileCode",
        description: "manifest.toml sözdizimi, overlay mekanizması ve çakışma çözümü.",
        subsections: [
          {
            id: "manifest-format",
            title: "manifest.toml Yapısı",
            description: "Yamaların ve katmanların sıralı deklarasyonu.",
            content: `\`manifest.toml\` dosyası, Hilal'in Firefox üzerine eklediği tüm bileşenlerin kesin uygulanma sırasını belirler:

\`\`\`toml
[browser]
name = "Hilal Browser"
codename = "hilal"
version = "0.3.0-alpha.6"

[branding]
active_profile = "hilal-default"

# 1. Katman (Overlay) Örneği: Dosyalar doğrudan kopyalanır
[[patches]]
path   = "browser/branding/hilal"
reason = "Hilal branding assets"

# 2. Yama (Patch) Örneği: Unified diff formatında uygulanır
[[patches]]
path   = "browser/base/workspaces.patch"
reason = "Hilal workspace layout and tabs integration"

[[patches]]
path   = "browser/base/content/hilal"
reason = "Hilal custom welcome page assets and scripts"
\`\`\`

- **Eğer \`path\` bir dizin veya doğrudan dosya ise (katman / overlay):** \`changes/<path>\` içeriği doğrudan \`engine/<path>\` hedefine kopyalanır.
- **Eğer \`path\` bir \`.patch\` dosyası ise:** Git apply mekanizması ile sırasıyla uygulanır.`
          },
          {
            id: "conflict-resolution",
            title: "Yama Çakışması Çözümü (Conflict Resolution)",
            description: "Bir yama uygulanamadığında izlenecek 3-way merge yöntemi.",
            content: `Upstream güncellemesinde veya taban commit kaymasında bir yama uygulanamazsa \`./bin/hil apply\` işlemi durur ve hata veren adımı ekrana yazar.

Çözüm süreci:

1. **İlk Adım (Zorla Sıfırlama):**
\`\`\`bash
./bin/hil apply --force
\`\`\`

2. **Git 3-Way Merge ile Çatışmaları Çözme:**
Eğer satır kaymaları nedeniyle yama uyuşmazlığı varsa:
\`\`\`bash
cd engine
git apply --3way ../changes/browser/base/workspaces.patch
\`\`\`

Bu komut \`engine/\` dosyalarına standart Git çatışma işaretçilerini (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) ekler.
- Çatışan dosyaları açın ve çakışmaları elle düzeltin.
- \`./mach build faster\` ile sözdizimini doğrulayın.
- \`engine/\` içinde düzeltmeyi commit veya amend edin:
\`\`\`bash
git commit -am "Fix workspaces patch merge conflicts"
cd ..
./bin/hil refresh
\`\`\`

3. **Geçersiz Kalan Yamaları Çıkarma:**
Eğer Mozilla upstream'de ilgili hatayı bizzat çözdüyse veya ilgili kod tabanı kaldırıldıysa:
\`\`\`bash
git rm changes/path/to/obsolete.patch
$EDITOR manifest.toml   # İlgili [[patches]] girdisini silin
git commit -m "Drop obsolete.patch: superseded by upstream"
\`\`\``
          }
        ]
      },
      {
        id: "build",
        title: "Platform Derleme Kılavuzları",
        shortTitle: "Platform Derleme",
        iconName: "Cpu",
        description: "macOS, Linux ve Windows derleme, paketleme ve imzalama gereksinimleri.",
        subsections: [
          {
            id: "build-macos",
            title: "macOS Derlemesi ve Notarization",
            description: "Apple Silicon & Intel için derleme, .app demeti ve imzalama.",
            content: `macOS üzerinde derleme \`scripts/build-macos.sh\` betiğiyle yönetilir.

\`\`\`bash
# Derleme ve Çalıştırma:
scripts/build-macos.sh
(cd engine && ./mach run)
\`\`\`

Derlenen uygulama paketi şu konumda oluşturulur:
\`\`\`text
engine/obj-aarch64-apple-darwin*/dist/Hilal Browser.app
\`\`\`

### Kod İmzalama (Code Signing) ve Gatekeeper Notu

Yerel geliştirme derlemeleri imzasızdır. macOS Gatekeeper ilk açılışta güvenlik uyarısı verebilir; Finder üzerinden **Sağ Tık → Aç** seçeneğiyle veya terminalden \`./mach run\` ile çalıştırılabilir.

Resmi dağıtım sürümleri için Apple Developer ID Application sertifikası ve Apple Notarization işlemi zorunludur:

\`\`\`bash
# 1. Ortam değişkenlerini tanımlayın
export CODESIGN_IDENTITY="Developer ID Application: Name (TEAMID)"
export APPLE_ID="developer@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAMID"

# 2. Paketi oluşturun, imzalayın ve noter onayını alın
scripts/build-macos.sh package
scripts/sign-macos.sh
\`\`\``
          },
          {
            id: "build-linux",
            title: "Linux & Flatpak Derlemesi",
            description: "Yerel Linux derlemesi ve Flatpak sandbox paketi oluşturma.",
            content: `Linux ortamında derleme için GTK 3, DBus, PulseAudio/ALSA ve Clang geliştirme başlıkları gereklidir.

\`\`\`bash
# Yerel ikili derlemesi:
scripts/build-linux.sh

# Flatpak paketi hazırlama:
# org.mozilla.firefox.BaseApp çalışma zamanını kullanır
flatpak-builder --force-clean flatpak-build flatpak/org.hilal.HilalBrowser.yaml
\`\`\`

Flatpak bildirimi, Wayland/X11 soket izinleri, pulseaudio ve tam sandbox izolasyonu ile yapılandırılmıştır.`
          },
          {
            id: "build-windows",
            title: "Windows Derlemesi",
            description: "MozillaBuild 4.0 ve PowerShell ile yerel Windows derlemesi.",
            content: `Windows ortamında derleme adımları:

1. **MozillaBuild 4.0+** paketini \`C:\\mozilla-build\\\` konumuna kurun.
2. Visual Studio 2022 C++ araçlarını ve Windows SDK bileşenlerini yükleyin.
3. \`start-shell.bat\` ile MozillaBuild terminalini başlatın ve PowerShell betiğini çalıştırın:

\`\`\`powershell
.\\scripts\\build-windows.ps1
\`\`\`

Çıktı \`engine\\obj-x86_64-pc-windows-msvc\\dist\\bin\\hilal.exe\` konumunda üretilir.`
          }
        ]
      },
      {
        id: "subsystems",
        title: "Çekirdek Alt Sistemler",
        shortTitle: "Alt Sistemler",
        iconName: "Boxes",
        description: "Arayüz kabuğu, çalışma alanları, site özelleştirme ve gizlilik motoru.",
        subsections: [
          {
            id: "hilal-shell",
            title: "HilalShell (Arayüz ve Kabuk Mimarisi)",
            description: "Dikey sekmeler, Tahoe yarı saydamlık ve kompakt araç çubuğu.",
            content: `Hilal'in kullanıcı arayüzü \`changes/browser/base/content/hilal/\` dizinindeki modüllerle Firefox UI bileşenlerine enjekte edilir:

- **\`HilalShell.js\` & \`HilalShell.css\`:** Tarayıcı ana penceresinin (\`navigator-toolbox\`) yerleşimini dinamik olarak yönetir. Kenar çubuğunun sol veya sağ hizalanmasını, kompakt modda otomatik gizlenmeyi ve Tahoe teması için DOM ağacına gerekli özniteliklerin eklenmesini sağlar.
- **\`HilalTahoeParent.sys.mjs\` / \`HilalTahoeChild.sys.mjs\`:** Aktif sekmedeki web sayfasının baskın renk paletini JS actor aracılığıyla yakalar ve tarayıcı kenarlıklarına, başlık çubuğuna akıcı bir şekilde uygular.`
          },
          {
            id: "hilal-workspaces",
            title: "HilalWorkspaces (İzole Çalışma Alanları)",
            description: "Multi-Account Container motoruyla güçlendirilmiş çalışma alanları.",
            content: `Hilal'deki çalışma alanları yalnızca görsel sekme grupları **değildir**. Firefox'un yerel \`ContextualIdentityService\` (Konteyner) altyapısını kullanır:

- Her çalışma alanı kendine ait bir container kimliğine (\`userContextId\`) sahiptir.
- Çerezler, yerel depolama (LocalStorage, IndexedDB) ve oturum verileri çalışma alanları arasında kesin olarak ayrıştırılır.
- Pinned sekmeler istenirse tüm çalışma alanlarında ortak paylaşılabilir.
- Sekmeler arası sürükle-bırak desteği doğrudan \`tabbrowser.js\` yama katmanı üzerinden çalışır.`
          },
          {
            id: "hilal-boosts",
            title: "HilalBoosts (Site Özelleştirici ve Element Zapper)",
            description: "Kullanıcı CSS enjeksiyonu, tipografi denetimi ve DOM zapper.",
            content: `Kullanıcıların ziyaret ettikleri siteleri anlık olarak modifiye etmelerini sağlayan alt sistem:

- **\`HilalBoosts.js\`:** Kullanıcının siteye özel yazı tipi, font ölçeği, ters çevirme (smart invert) ve özel CSS kurallarını depolar.
- **\`HilalBoostsActorParent.sys.mjs\` / \`Child.sys.mjs\`:** Güvenlik sandbox'ını ihlal etmeden içeriğe özel stil enjeksiyonu yapar.
- **Element Zapper:** Kullanıcının seçtiği can sıkıcı DOM elemanlarını (yapışkan banner'lar, reklam artıkları) kalıcı olarak DOM'dan kaldırır.`
          },
          {
            id: "hilal-bangs",
            title: "HilalBangs (Adres Çubuğu Kestirmeleri)",
            description: "Hızlı arama motoru yönlendiricisi (!w, !gh, !yt).",
            content: `Adres çubuğuna girilen arama sorgularını hızlandırmak için \`changes/browser/modules/HilalBangs.sys.mjs\` ve \`changes/browser/components/urlbar/bangs.patch\` kullanılır:

- \`!w <sorgu>\`: Doğrudan Wikipedia araması
- \`!gh <sorgu>\`: GitHub depo ve kod araması
- \`!yt <sorgu>\`: YouTube video araması
- \`!ddg <sorgu>\`: DuckDuckGo araması

Kullanıcılar Ayarlar menüsünden kendi özel bang tanımlarını ekleyebilir veya değiştirebilir.`
          }
        ]
      },
      {
        id: "mobile",
        title: "Hilal Android ve Mobil Mimari",
        shortTitle: "Mobil",
        iconName: "Smartphone",
        description: "Mozilla GeckoView 135 motoru, Jetpack Compose Material 3 Expressive mimarisi, Hilal Bangs ve yerel derleme.",
        subsections: [
          {
            id: "mobile-overview",
            title: "Android Mimarisi ve Modül Düzeni",
            description: "Modern çoklu modül hiyerarşisi ve kaynak dizini.",
            content: `Hilal Browser Android sürümü, Chromium veya sistem WebView'ı yerine gerçek **Mozilla GeckoView (Gecko 135)** motoru üzerinde çalışan, modern Android mimari standartlarına tam uyumlu bir mobil web tarayıcısıdır.

Arayüz katmanı tamamen **Jetpack Compose** ve **Material 3 Expressive** tasarım sistemi kullanılarak sıfırdan geliştirilmiştir.

### Modül Hiyerarşisi
Depodaki Android kaynakları \`android/\` dizini altında toplanmıştır:

\`\`\`text
android/
├── app/                      # Ana uygulama modülü, aktiviteler ve ekran gezintisi
│   └── src/main/java/com/vastsea/hilal/
│       ├── MainActivity.kt   # GeckoSession yaşam döngüsü ve kök Scaffold
│       ├── model/            # Sekme, geçmiş, yer imi ve çalışma alanı veri modelleri
│       ├── ui/
│       │   ├── components/   # Omnibox, TabsTray, OptionsBottomSheet, NewTabPage
│       │   ├── screens/      # SettingsScreen, HistoryScreen, BookmarksScreen, BangsScreen
│       │   └── theme/        # Material 3 Expressive renk şemaları, tipografi ve şekiller
│       └── util/             # BangsEngine, arama motoru yönlendiricisi ve yardımcılar
├── core/                     # Çekirdek yardımcılar, veritabanı ve tercihler
└── gradle/                   # Gradle wrapper ve derleme eklentileri
\`\`\`

### Platform Parametreleri
- **Hedef SDK:** Android 15 (API 35/36)
- **Minimum SDK:** Android 8.0 Oreo (API 26)
- **Kotlin Sürümü:** 2.1.0
- **Arayüz:** 100% Jetpack Compose (Material 3 Expressive)
- **Motor:** \`org.mozilla.geckoview:geckoview:135.0.20250216.090000\``
          },
          {
            id: "mobile-geckoview",
            title: "GeckoView 135 ve Oturum Yönetimi",
            description: "Mozilla GeckoView runtime, GeckoSession yaşam döngüsü ve içerik engelleme.",
            content: `GeckoView, Firefox'un tam Gecko motorunu Android uygulamalarına gömen bağımsız bir kütüphanedir. Hilal, sistem WebView'larının getirdiği gizlilik zafiyetlerini ve Chromium tekelini aşmak için doğrudan GeckoView 135 kullanır.

### GeckoRuntime Başlatma
Uygulama yaşam döngüsünde tek bir \`GeckoRuntime\` örneği oluşturulur ve tüm sekmeler tarafından paylaşılır:

\`\`\`kotlin
val runtimeSettings = GeckoRuntimeSettings.Builder()
    .contentBlocking(
        ContentBlocking.Settings.Builder()
            .antiTracking(ContentBlocking.AntiTracking.STRICT)
            .cookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_NON_TRACKERS)
            .enhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.STRICT)
            .build()
    )
    .aboutConfigEnabled(false)
    .build()

val geckoRuntime = GeckoRuntime.create(context, runtimeSettings)
\`\`\`

### Oturum Yaşam Döngüsü ve Sekme İzolasyonu
Her sekme bağımsız bir \`GeckoSession\` nesnesine karşılık gelir. Masaüstündeki Container tabanlı Workspaces mimarisi, mobilde izole oturum parametreleri ve çerez bağlamları ile korunur. Özel gezinti (Private Browsing) modunda açılan sekmeler bellekte tutulur ve sekme kapatıldığında tüm oturum verisi anında bellekten silinir.`
          },
          {
            id: "mobile-ui",
            title: "Jetpack Compose ve Material 3 Expressive",
            description: "M3E gruplu ayar satırları, dinamik renkler ve etkileşimli bileşenler.",
            content: `Hilal Android arayüzü, Google'ın Material 3 Expressive (M3E) kılavuzlarına harfiyen uyar. Masaüstündeki Beer CSS / M3 arayüzü ile tutarlı bir görsel dil sunar.

### Temel Arayüz Bileşenleri

| Bileşen | Dosya | İşlev |
| --- | --- | --- |
| \`Omnibox\` | \`ui/components/Omnibox.kt\` | Dinamik adres çubuğu, yükleme göstergesi, kalkan durumu ve bang algılayıcı. |
| \`TabsTray\` | \`ui/components/TabsTray.kt\` | Kaydırarak sekme kapatma (swipe-to-dismiss), çalışma alanı sekmeleri ve yeni sekme açma. |
| \`OptionsBottomSheet\` | \`ui/components/OptionsBottomSheet.kt\` | Masaüstü modu, sayfada bul, gizlilik kalkanı ve paylaşım eylemleri. |
| \`SettingsScreen\` | \`ui/screens/SettingsScreen.kt\` | M3 Expressive gruplanmış kutu satırları, varsayılan tarayıcı ayarı ve bang yönetimi. |

### Dinamik Renk ve Tema Desteği
Android 12+ cihazlarda sistem duvar kağıdından türetilen Dinamik Renk (Monet) paleti desteklenir. Açık ve koyu tema geçişleri tam Compose yeniden çizim optimizasyonu ile gecikmesiz çalışır.`
          },
          {
            id: "mobile-bangs",
            title: "Hilal Bangs Mobil Arama Motoru",
            description: "Doğrudan arama kestirmeleri ve URL ayrıştırma mantığı.",
            content: `Masaüstü sürümdeki Hilal Bangs sistemi mobil adres çubuğuna doğrudan entegre edilmiştir. Kullanıcı arama sorgusunun başına veya sonuna bir bang eklediğinde, harici bir arama motoru ara sayfası olmadan doğrudan hedef servise yönlendirilir.

### Popüler Dahili Kestirmeler
- \`!w <terim>\` veya \`!wiki <terim>\` -> Doğrudan Vikipedi araması
- \`!gh <terim>\` -> Doğrudan GitHub arama sonuçları
- \`!yt <terim>\` -> YouTube arama sonuçları
- \`!ddg <terim>\` -> DuckDuckGo araması
- \`!reddit <terim>\` -> Reddit araması

### Ayrıştırma ve Yönlendirme
\`BangsEngine.kt\` adres çubuğuna girilen metni anlık olarak inceler, kayıtlı bang anahtarlarını ayıklar ve harici servislerin arama uç noktalarına yönlendirir.`
          },
          {
            id: "mobile-build",
            title: "Kaynak Koddan Derleme ve Paketleme",
            description: "Gradle derleme komutları, debug/release APK ve AAB üretimi.",
            content: `Hilal Android projesini yerel geliştirme makinenizde derlemek için Android SDK (API 35/36) ve JDK 17+ gereklidir.

### Hızlı Derleme Adımları

1. Depo kök dizininden Android klasörüne geçin:
\`\`\`bash
cd android
\`\`\`

2. Debug derlemesi yapın ve bağlı cihaza yükleyin:
\`\`\`bash
./gradlew installDebug
\`\`\`

3. Google Play Store için imzalı Android App Bundle (.aab) üretin:
\`\`\`bash
./gradlew bundleRelease
\`\`\`

4. Doğrudan bağımsız sürüm APK (.apk) üretin:
\`\`\`bash
./gradlew assembleRelease
\`\`\`

> **İmzalama Notu:** Release sürümleri için \`keystore.properties\` dosyası veya CI ortam değişkenleri (\`KEYSTORE_BASE64\`, \`KEYSTORE_PASSWORD\`, \`KEY_ALIAS\`, \`KEY_PASSWORD\`) tanımlanmalıdır. Gizli anahtar dosyaları asla git deposuna commit edilmez.`
          },
          {
            id: "mobile-privacy",
            title: "Mobil Gizlilik ve Şeffaflık Modeli",
            description: "Tamamen açık kaynak, sıfır reklam ve sponsor odaklı yapı.",
            content: `Hilal Browser Android sürümü, ticari tarayıcıların aksine kullanıcıyı bir veri kaynağı olarak görmez.

### Veri Toplama Sınırları
- **Sıfır Kişisel Veri:** Konum, arama geçmişi, form verileri veya cihaz ID'leri asla toplanmaz.
- **Sıfır Reklam Kimliği:** Google Reklam Kimliği (GAID) veya benzeri profilleme araçları uygulamaya dahil edilmemiştir.
- **Yalnızca Anonim İstatistikler:** Hizmet kalitesini ve GeckoView motorunun kararlılığını ölçmek amacıyla yalnızca tamamen anonim sayısal sayaçlar (aktif kurulum sayısı, cihaz modeli ve Android işletim sistemi sürümü) toplanır.
- **Şeffaf ve Denetlenebilir:** Kaynak kod bütünüyle GitHub üzerinde herkese açıktır. Uygulamanın hangi ağ isteklerini yaptığı kaynak koddan satır satır denetlenebilir.

### Gelir Modeli
Hilal Browser'ın hiçbir sürümünde reklam ağı, veri satışı veya sponsorlu arama yerleşimi bulunmaz. Proje bütünüyle açık kaynak topluluğunun bağışları ve kurumsal sponsorluklar ile finanse edilir.`
          }
        ]
      },
      {
        id: "upstream",
        title: "Upstream Senkronizasyonu",
        shortTitle: "Upstream Sync",
        iconName: "RefreshCw",
        description: "Firefox güncellemelerini takip etme ve taban commit'i ilerletme süreci.",
        subsections: [
          {
            id: "rolling-forward",
            title: "Firefox Sürümünü Güncelleme Adımları",
            description: "upstream.lock kilit dosyasını yenileme prosedürü.",
            content: `Mozilla yeni bir güvenlik veya kararlı sürüm yayınladığında Hilal tabanı şu sırayla güncellenir:

1. \`upstream.lock\` dosyasını açın ve yeni Firefox commit karmasını güncelleyin:
\`\`\`toml
[upstream]
repo = "https://github.com/mozilla-firefox/firefox.git"
commit = "yeni-commit-karmasi"
branch = "release"
\`\`\`

2. Motoru yeni commit'e çekin ve yamaları uygulayın:
\`\`\`bash
./bin/hil setup
./bin/hil apply --force
\`\`\`

3. Eğer tüm yamalar hatasız uygulanırsa doğrudan derleme ve test aşamasına geçin:
\`\`\`bash
scripts/build-macos.sh faster
(cd engine && ./mach run)
\`\`\`

4. \`about:\` penceresindeki sürüm dizgilerini ve Hilal arayüz bileşenlerini doğrulayın.`
          }
        ]
      },
      {
        id: "privacy",
        title: "Gizlilik Mimarisi ve Seviyeleri",
        shortTitle: "Gizlilik",
        iconName: "Shield",
        description: "Balanced, Strict ve Maximum profilleri ile teknik takaslar.",
        subsections: [
          {
            id: "privacy-levels",
            title: "Gizlilik Profilleri",
            description: "LibreWolf çizgisi güvenlik sıkılaştırması ve sınırları.",
            content: `Hilal'deki gizlilik seviyeleri anonimlik vaatleri değil; sistem düzeyinde **sıkılaştırma (hardening) profilleridir**.

### Ne Vaat Edilmez?
- Hilal genel IP adresinizi gizlemez (VPN veya Tor yerine geçmez).
- Hilal tüm sitelerde mutlak anonimlik sağlamaz.
- Tüm parmak izi (fingerprinting) yöntemlerini imkansız kılmaz.

### Seviye Karşılaştırma Tablosu

| Özellik / Kural | Balanced (Varsayılan) | Strict | Maximum Local |
| --- | --- | --- | --- |
| **uBlock Origin** | Dahili Aktif | Dahili Aktif | Dahili Aktif |
| **Telemetri** | Tamamen Kapalı | Tamamen Kapalı | Tamamen Kapalı |
| **Resist Fingerprinting (RFP)** | Aktif | Aktif | Aktif |
| **HTTPS-Only Modu** | Aktif | Aktif | Aktif |
| **WebGL** | Parmak izi koruması için Kapalı | Kapalı | Kapalı |
| **WebRTC** | Yerel IP korumalı Aktif | **Tamamen Kapalı** | **Tamamen Kapalı** |
| **First Party Isolation (FPI)** | Kapalı | **Aktif** | **Aktif** |
| **JavaScript** | Açık | Açık | **Devre Dışı** |
| **Kamera / Mikrofon / Konum** | İzne Bağlı | İzne Bağlı | **Varsayılan Olarak Bloklu** |
| **Kapanışta Veri Temizliği** | Çerez & Önbellek | Çerez & Önbellek | **Tüm Geçmiş ve İndirmeler** |

> **Teknik Not:** \`Maximum Local\` profili JavaScript'i tamamen kapattığı için dinamik web uygulamaları ve oturum açma akışları çalışmayabilir. Bu profil yüksek tehdit ortamlarında saf belge okuma amaçlıdır.`
          }
        ]
      },
      {
        id: "design-system",
        title: "Material 3 Expressive Tasarım Sistemi",
        shortTitle: "Tasarım Sistemi",
        iconName: "Palette",
        description: "Hilal Browser genelinde geçerli M3E token'ları, bileşen kuralları ve standartlar.",
        subsections: [
          {
            id: "m3e-foundations",
            title: "Tasarım Felsefesi ve Token Mimarisi",
            description: "Marka tohum rengi, tonlu yüzeyler ve köşe yuvarlatma ölçeği.",
            content: `Hilal Browser arayüzü (web sitesi, \`about:\` sayfaları, çalışma alanları ve tarayıcı kromu), Google'ın **Material 3 Expressive (M3E)** tasarım sistemini temel alır.

### Temel Mimari İlkeler
1. **Marka Mavisi Sabittir:** Resmi tohum rengi **Google / Hilal Mavisi (\`#0b57d0\`)** rengidir. Koyu mod türevi \`#a8c7fa\`'dır.
2. **Cam/Bulanıklık Yok:** Gezinti çubukları, kartlar ve menülerde saydamlık veya \`backdrop-blur\` kullanılmaz; saf ve opak tonlu M3 yüzeyleri (\`surface\`, \`surface-container\`) kullanılır.
3. **Ferah Alan:** Bileşenler, rozetler ve butonlar asla sıkıştırılamaz. Masaüstü pencerelerinde bileşenlerin sığması için ferah alan bırakılır.

### Yüzey ve Renk Token'ları

| Token | Açık Mod | Koyu Mod | Kullanım Alanı |
| --- | --- | --- | --- |
| \`--primary\` | \`#0b57d0\` | \`#a8c7fa\` | Birincil butonlar, aktif sekmeler, vurgular |
| \`--primary-container\` | \`#d3e3fd\` | \`#0842a0\` | Tonal butonlar, rozet arkaplanları |
| \`--surface\` | \`#f8f9ff\` | \`#111318\` | Genel sayfa arkaplanı |
| \`--surface-container-lowest\` | \`#ffffff\` | \`#0c0e12\` | Kartlar, girdi kutuları |
| \`--surface-container\` | \`#eceef5\` | \`#1e2025\` | Modallar, sabit üst çubuklar |
| \`--outline-variant\` | \`#c3c7cf\` | \`#43474e\` | İnce kart ve ayırıcı sınırları |`
          },
          {
            id: "m3e-components",
            title: "Bileşen Standartları ve Kuralları",
            description: "Hap butonlar, genişletilmiş rozetler ve masaüstü diyalog ferahlığı.",
            content: `Arayüz bileşenleri oluşturulurken şu kurallara kesin olarak uyulmalıdır:

### 1. Butonlar (Buttons)
- Tüm butonlar hap biçimli (\`rounded-full\`) olmalıdır. Keskin 90 derece kutu butonlar yasaktır.
- Minimum iç dolgu \`px-5 py-2.5\`, ikon ile metin arası boşluk en az \`gap-2.5\` olmalıdır.

### 2. Rozetler ve Çipler (Chips)
- Metinlerin sınır çizgisine yapışması yasaktır.
- Minimum dolgu \`px-3.5 py-1 rounded-full text-xs font-semibold\` olmalıdır.

### 3. Modallar ve Pop-up'lar
- Masaüstü modalları asla dar \`max-w-lg\` (512px) konteynerlara sıkıştırılamaz; en az \`max-w-2xl\` (672px) veya \`max-w-3xl\` (768px) olmalıdır.
- Liste kartlarında platform başlığı ve dosya boyutu üst satırda, tam dosya adı kırpılmadan alt satırda yer almalıdır.

### 4. İkon Standardı
- Tüm arayüzde yalnızca **Google Material Symbols Outlined** (\`<i>icon_name</i>\`) kullanılır. Karışık ikon kütüphaneleri kullanılamaz.`
          }
        ]
      }
    ]
  },
  en: {
    meta: {
      title: "Developer Documentation",
      subtitle:
        "Hilal Browser architecture, patch & overlay system, local build steps, and source tree organization.",
      searchPlaceholder: "Search docs (command, subsystem, file)...",
      noResults: "No matching documentation topic found.",
      backToHome: "Back to Home",
      onThisPage: "On This Page",
      copyCode: "Copy",
      copied: "Copied",
      targetVersion: "Target: 0.3.0-alpha",
      engineBase: "Base: Mozilla Firefox (Gecko)",
      licenseBadge: "License: MPL 2.0",
    },
    sections: [
      {
        id: "architecture",
        title: "Architecture & Mental Model",
        shortTitle: "Architecture",
        iconName: "Layers",
        description:
          "How Hilal Browser operates as a declarative patch and overlay layer on top of Firefox.",
        subsections: [
          {
            id: "dual-tree-model",
            title: "Dual-Tree Architecture",
            description: "Separation between the source repository and the Firefox engine checkout.",
            content: `Hilal Browser is **not** an independent browser engine, nor is it an unmaintained hard-fork. It is a declarative **patch and overlay layer** running directly on top of upstream Firefox Gecko.

This architecture enables Hilal to inherit upstream security patches, web engine performance, and Gecko standards compliance directly, while maintaining independent interface design, privacy profiles, and container workflows.

The repository is divided into two distinct trees:

1. **\`hilal-browser/\` (Source of Truth):** This git repository. It contains only small, text-based declarative configurations (\`manifest.toml\`, \`upstream.lock\`), unified diff patches (\`changes/**/*.patch\`), direct overlay files (\`changes/**\`), and build scripts.
2. **\`hilal-browser/engine/\` (Firefox Source Tree):** The full Firefox source checkout. It is **gitignored** from this repository and maintains its own git history pinned to the exact upstream commit specified in \`upstream.lock\`.

\`\`\`text
                    ./bin/hil apply
hilal-browser/  ─────────────►  engine/         (build & run from here)
   ▲                              │
   │           ./bin/hil refresh  │
   └──────────────────────────────┘
\`\`\`

> **Core Rule:** Source code edits are always performed directly inside \`engine/\`. Once tested and validated, changes are synced back to the patch repository using \`./bin/hil refresh\`.`
          },
          {
            id: "repo-structure",
            title: "Repository Layout",
            description: "Directory roles and organization.",
            content: `Primary directories in the repository:

\`\`\`text
hilal-browser/
├── changes/          # Patches (*.patch) and overlays mirroring the Firefox source layout
│   ├── browser/      # UI components, branding, localization, and shell scripts
│   ├── xpcom/        # Low-level platform compatibility patches
│   └── ipc/          # Inter-process communication fixes
├── manifest.toml     # Declarative manifest specifying patch and overlay application order
├── upstream.lock     # Pinned Firefox commit hash and upstream metadata
├── hil/              # Rust-based custom patch manager CLI source
├── bin/hil           # Compiled hil binary
├── scripts/          # Platform build and packaging scripts (macOS, Linux, Windows)
├── docs/             # Technical specifications and build guidelines
└── engine/           # (gitignored) Pinned Firefox checkout
\`\`\``
          },
          {
            id: "patch-manager",
            title: "Hil Patch Manager (`hil` CLI)",
            description: "Custom Rust tool for deterministic patch orchestration.",
            content: `To automate and verify patch workflows across the massive Firefox codebase, Hilal uses a standalone Rust utility: \`hil\`.

It runs without heavy external dependencies and coordinates the core operations:

| Command | Description |
| --- | --- |
| \`./bin/hil setup\` | Clones Firefox into \`engine/\` and checks out the commit pinned in \`upstream.lock\`. |
| \`./bin/hil apply\` | Stamps patches and overlays onto \`engine/\` in the exact sequence declared in \`manifest.toml\`. |
| \`./bin/hil apply --force\` | Resets \`engine/\` to the base commit and reapplies all patches from scratch. |
| \`./bin/hil refresh\` | Inspects commits in \`engine/\` against upstream-base and regenerates \`changes/*.patch\` files. |
| \`./bin/hil verify\` | Verifies that the engine tree cleanly matches the expected upstream commit hash. |
| \`./bin/hil status\` | Displays current patch application status and workspace state. |`
          }
        ]
      },
      {
        id: "quickstart",
        title: "Getting Started & Setup",
        shortTitle: "Setup",
        iconName: "Terminal",
        description: "Environment prerequisites and initial build instructions.",
        subsections: [
          {
            id: "prerequisites",
            title: "System Prerequisites",
            description: "Required compilers and toolchains.",
            content: `Compiling Hilal Browser requires standard Firefox build prerequisites plus a working Rust toolchain:

1. **Rust & Cargo:** A modern stable Rust toolchain via \`rustup\` (required to build \`hil\` and Firefox's internal Rust crates).
2. **Python 3:** Mozilla's \`mach\` build orchestration tool runs on Python 3.
3. **Mozilla Bootstrap:** Run Mozilla's official bootstrap script for your platform:

\`\`\`bash
curl -L https://raw.githubusercontent.com/mozilla-firefox/firefox/refs/heads/main/python/mozboot/bin/bootstrap.py -O
python3 bootstrap.py
\`\`\`

This installs Xcode Command Line Tools (on macOS) or standard build packages (on Linux/Windows), compiler toolchains, sysroots, and \`cbindgen\`.`
          },
          {
            id: "initial-build",
            title: "First-Time Build Steps",
            description: "From clone to a running browser instance.",
            content: `Step-by-step setup procedure:

\`\`\`bash
# 1. Clone the patch repository
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# 2. Build the hil manager tool with cargo
cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil

# On Windows:
# copy hil\\target\\release\\hil.exe bin\\hil.exe

# 3. Fetch the engine and apply patches
./bin/hil setup    # Clones Firefox into engine/ (requires ~2-3 GB download)
./bin/hil apply    # Stamps patches and overlays onto engine/

# 4. Run the build script for your platform (takes 15-45 mins on initial compile)
scripts/build-macos.sh    # On macOS
# scripts/build-linux.sh   # On Linux
# .\\scripts\\build-windows.ps1 # On Windows PowerShell

# 5. Launch the compiled binary
(cd engine && ./mach run)
\`\`\``
          }
        ]
      },
      {
        id: "workflow",
        title: "Development Workflow",
        shortTitle: "Workflow",
        iconName: "GitBranch",
        description: "Day-to-day hacking, incremental builds, and regenerating patches.",
        subsections: [
          {
            id: "edit-cycle",
            title: "Source Hacking Cycle",
            description: "How to edit code and test inside the engine.",
            content: `The cardinal rule of Hilal development: **Always edit source code inside \`engine/\`.**

1. Make edits directly in the \`engine/\` tree (e.g. \`engine/browser/base/content/hilal/HilalShell.js\`).
2. Run the appropriate incremental build target.
3. Verify your changes with \`./mach run\`.
4. Stage and commit your changes in the \`engine/\` git history.
5. Return to the repository root and run \`./bin/hil refresh\`.
6. Review the resulting patch diffs in \`changes/\` and commit them in \`hilal-browser/\`.

\`\`\`bash
# Quick front-end iteration:
scripts/build-macos.sh faster
(cd engine && ./mach run)
\`\`\``
          },
          {
            id: "fast-iteration",
            title: "Fast Iteration Targets",
            description: "Avoid full re-compiles with incremental build flags.",
            content: `Firefox's build system provides granular incremental targets. You do not need to recompile C++ when changing JS or CSS:

| Change Scope | Command | Duration |
| --- | --- | --- |
| **Front-End (JS, CSS, XHTML, FTL, .ini)** | \`scripts/build-macos.sh faster\` | ~2-5 seconds |
| **C++ / Rust Binaries** | \`scripts/build-macos.sh binaries\` | ~30-90 seconds |
| **Full / Mixed Build** | \`scripts/build-macos.sh\` | ~2-5 minutes |

These map directly to \`./mach build faster\` and \`./mach build binaries\`.

> **Tip:** Most UI features in Hilal (workspaces, sidebar, boosts, bang handling) are implemented in JavaScript and CSS, making iteration cycles via \`faster\` extremely responsive.`
          },
          {
            id: "refreshing-patches",
            title: "Regenerating Patches (`hil refresh`)",
            description: "Syncing engine commits back to changes/*.patch files.",
            content: `Once your changes are committed within \`engine/\`, run the following in the repository root:

\`\`\`bash
./bin/hil refresh
\`\`\`

This command:
- Compares the \`engine/\` commit stack against the \`upstream-base\` ref.
- Resolves mapping against \`manifest.toml\`.
- Rewrites affected \`changes/**/*.patch\` files in clean unified diff format.
- Automatically mirrors changes to overlay files (PNGs, FTL locales, JSON configurations).

Inspect and commit the regenerated changes:

\`\`\`bash
git status
git diff changes/
git commit -am "feat(shell): update sidebar collapse behavior"
\`\`\`

> **Note:** Never commit the \`engine/\` directory itself; it is strictly ignored by \`.gitignore\`.`
          }
        ]
      },
      {
        id: "patches",
        title: "Patch & Overlay System",
        shortTitle: "Patches & Overlays",
        iconName: "FileCode",
        description: "manifest.toml schema, overlay mechanisms, and conflict resolution.",
        subsections: [
          {
            id: "manifest-format",
            title: "manifest.toml Declarations",
            description: "Deterministic sequencing of overlays and patches.",
            content: `\`manifest.toml\` dictates the exact order in which modifications are applied to Firefox:

\`\`\`toml
[browser]
name = "Hilal Browser"
codename = "hilal"
version = "0.3.0-alpha.6"

[branding]
active_profile = "hilal-default"

# 1. Overlay entry: Files are directly copied onto the target tree
[[patches]]
path   = "browser/branding/hilal"
reason = "Hilal branding assets"

# 2. Patch entry: Applied sequentially via git apply
[[patches]]
path   = "browser/base/workspaces.patch"
reason = "Hilal workspace layout and tabs integration"

[[patches]]
path   = "browser/base/content/hilal"
reason = "Hilal custom welcome page assets and scripts"
\`\`\`

- **If \`path\` is a directory or raw file (overlay):** Contents from \`changes/<path>\` are copied directly to \`engine/<path>\`.
- **If \`path\` ends with \`.patch\`:** Applied sequentially using git's patch engine.`
          },
          {
            id: "conflict-resolution",
            title: "Conflict Resolution (3-Way Merge)",
            description: "How to resolve patch application failures.",
            content: `If an upstream update shifts line offsets or renames methods, \`./bin/hil apply\` will halt and report the failing patch.

Resolution procedure:

1. **Step 1: Force Reset:**
\`\`\`bash
./bin/hil apply --force
\`\`\`

2. **Step 2: 3-Way Merge Resolution:**
If line drift prevents clean application:
\`\`\`bash
cd engine
git apply --3way ../changes/browser/base/workspaces.patch
\`\`\`

This inserts Git conflict markers (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) into the affected files.
- Resolve conflicts manually in your editor.
- Verify with \`./mach build faster\`.
- Commit or amend the fix in \`engine/\`:
\`\`\`bash
git commit -am "Resolve conflicts in workspaces.patch"
cd ..
./bin/hil refresh
\`\`\`

3. **Step 3: Dropping Obsolete Patches:**
If Mozilla has fixed the bug upstream or replaced the targeted subsystem:
\`\`\`bash
git rm changes/path/to/obsolete.patch
$EDITOR manifest.toml   # Remove the corresponding [[patches]] entry
git commit -m "Drop obsolete.patch: superseded by upstream"
\`\`\``
          }
        ]
      },
      {
        id: "build",
        title: "Platform Build Guides",
        shortTitle: "Platform Builds",
        iconName: "Cpu",
        description: "macOS, Linux, and Windows compilation and code signing details.",
        subsections: [
          {
            id: "build-macos",
            title: "macOS Compilation & Notarization",
            description: "Building universal/ARM64 bundles, Gatekeeper notes, and Apple notarization.",
            content: `macOS builds are handled via \`scripts/build-macos.sh\`.

\`\`\`bash
# Build and run:
scripts/build-macos.sh
(cd engine && ./mach run)
\`\`\`

The compiled app bundle lives at:
\`\`\`text
engine/obj-aarch64-apple-darwin*/dist/Hilal Browser.app
\`\`\`

### Code Signing & Gatekeeper

Local development builds are unsigned. Gatekeeper may flag the application on first launch from Finder; use **Right Click → Open** or launch via \`./mach run\`.

Public releases require signing with an Apple Developer ID Application certificate and notarization via \`notarytool\`:

\`\`\`bash
# Set credentials
export CODESIGN_IDENTITY="Developer ID Application: Name (TEAMID)"
export APPLE_ID="developer@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAMID"

# Package, sign, notarize, and staple
scripts/build-macos.sh package
scripts/sign-macos.sh
\`\`\``
          },
          {
            id: "build-linux",
            title: "Linux & Flatpak Builds",
            description: "Native binaries and Flatpak containerized packaging.",
            content: `Compiling on Linux requires GTK 3, DBus, PulseAudio/ALSA, and Clang development headers.

\`\`\`bash
# Native binary build:
scripts/build-linux.sh

# Flatpak package:
# Builds against org.mozilla.firefox.BaseApp runtime
flatpak-builder --force-clean flatpak-build flatpak/org.hilal.HilalBrowser.yaml
\`\`\`

The Flatpak manifest is pre-configured with Wayland/X11 socket permissions, pulseaudio forwarding, and sandbox boundaries.`
          },
          {
            id: "build-windows",
            title: "Windows Build Process",
            description: "PowerShell build script using MozillaBuild 4.0.",
            content: `Windows build requirements:

1. Install **MozillaBuild 4.0+** to \`C:\\mozilla-build\\\`.
2. Install Visual Studio 2022 C++ build tools and the Windows 10/11 SDK.
3. Launch \`start-shell.bat\` from MozillaBuild and run:

\`\`\`powershell
.\\scripts\\build-windows.ps1
\`\`\`

The executable is compiled to \`engine\\obj-x86_64-pc-windows-msvc\\dist\\bin\\hilal.exe\`.`
          }
        ]
      },
      {
        id: "subsystems",
        title: "Core Subsystems",
        shortTitle: "Subsystems",
        iconName: "Boxes",
        description: "UI shell, isolated containers, site customizer, and search bangs.",
        subsections: [
          {
            id: "hilal-shell",
            title: "HilalShell (UI & Chrome Architecture)",
            description: "Vertical tabs, collapsible sidebar, and Tahoe tinting.",
            content: `Hilal's user interface is injected into Firefox chrome via \`changes/browser/base/content/hilal/\`:

- **\`HilalShell.js\` & \`HilalShell.css\`:** Dynamically manages the main \`#navigator-toolbox\` layout. Controls left/right sidebar positioning, auto-hiding toolbar behavior in compact mode, and DOM attributes required for Tahoe styling.
- **\`HilalTahoeParent.sys.mjs\` / \`HilalTahoeChild.sys.mjs\`:** Uses JS actors to extract dominant color palettes from the active web page and smoothly applies matching tinting to window borders and header chrome.`
          },
          {
            id: "hilal-workspaces",
            title: "HilalWorkspaces (Isolated Containers)",
            description: "Container-backed workspaces with independent cookie and session contexts.",
            content: `Workspaces in Hilal are not just visual groupings; they leverage Firefox's native \`ContextualIdentityService\` (Containers):

- Each workspace is assigned a distinct \`userContextId\`.
- Cookies, localStorage, IndexedDB, and active session tokens are strictly partitioned between workspaces.
- Pinned tabs can optionally be shared across all workspaces.
- Tab drag-and-drop between workspaces is integrated directly via patches to \`tabbrowser.js\`.`
          },
          {
            id: "hilal-boosts",
            title: "HilalBoosts (Site Customizer & Element Zapper)",
            description: "Per-site CSS injection, typography scaling, and DOM zapper.",
            content: `Allows users to modify any website persistently:

- **\`HilalBoosts.js\`:** Stores per-domain font selections, text scale, smart invert preferences, and custom CSS overrides.
- **\`HilalBoostsActorParent.sys.mjs\` / \`Child.sys.mjs\`:** Injects stylesheets safely into content documents without bypassing security sandbox boundaries.
- **Element Zapper:** Allows users to click and remove intrusive DOM elements (sticky banners, popups) permanently.`
          },
          {
            id: "hilal-bangs",
            title: "HilalBangs (Address Bar Search Shortcuts)",
            description: "Fast search engine dispatch directly in the urlbar.",
            content: `Search shortcuts implemented in \`changes/browser/modules/HilalBangs.sys.mjs\` and \`changes/browser/components/urlbar/bangs.patch\`:

- \`!w <query>\`: Search Wikipedia directly
- \`!gh <query>\`: Search GitHub repositories
- \`!yt <query>\`: Search YouTube videos
- \`!ddg <query>\`: Search DuckDuckGo

Users can configure custom bangs and modify default mappings via Hilal Preferences.`
          }
        ]
      },
      {
        id: "mobile",
        title: "Hilal Android & Mobile Architecture",
        shortTitle: "Mobile",
        iconName: "Smartphone",
        description: "Mozilla GeckoView 135 runtime, Jetpack Compose Material 3 Expressive UI, Hilal Bangs, and local builds.",
        subsections: [
          {
            id: "mobile-overview",
            title: "Android Architecture & Module Layout",
            description: "Modern multi-module hierarchy and source tree organization.",
            content: `Hilal Browser for Android is built directly on top of the genuine **Mozilla GeckoView (Gecko 135)** engine rather than Chromium or system WebViews, providing an independent rendering engine with native privacy safeguards.

The entire user interface is crafted using **Jetpack Compose** following Google's **Material 3 Expressive** design system.

### Module Hierarchy
All Android source files reside within the \`android/\` directory:

\`\`\`text
android/
├── app/                      # Main application module, activities, and navigation
│   └── src/main/java/com/vastsea/hilal/
│       ├── MainActivity.kt   # GeckoSession lifecycle and root Scaffold
│       ├── model/            # Tab, history, bookmark, and workspace data models
│       ├── ui/
│       │   ├── components/   # Omnibox, TabsTray, OptionsBottomSheet, NewTabPage
│       │   ├── screens/      # SettingsScreen, HistoryScreen, BookmarksScreen, BangsScreen
│       │   └── theme/        # Material 3 Expressive color schemes, typography, and shapes
│       └── util/             # BangsEngine, search router, and utility classes
├── core/                     # Core utilities, preferences, and persistence
└── gradle/                   # Gradle wrapper and build plugins
\`\`\`

### Platform Specifications
- **Target SDK:** Android 15 (API 35/36)
- **Minimum SDK:** Android 8.0 Oreo (API 26)
- **Kotlin Version:** 2.1.0
- **UI Architecture:** 100% Jetpack Compose (Material 3 Expressive)
- **Engine Dependency:** \`org.mozilla.geckoview:geckoview:135.0.20250216.090000\``
          },
          {
            id: "mobile-geckoview",
            title: "GeckoView 135 & Session Management",
            description: "Mozilla GeckoView runtime, session lifecycle, and content protection.",
            content: `GeckoView embeds the full Firefox rendering engine into Android applications as a modular component. Hilal utilizes GeckoView 135 to deliver desktop-class web compatibility and prevent Chromium monoculture.

### GeckoRuntime Initialization
A single singleton \`GeckoRuntime\` instance is created during application launch and shared across all active sessions:

\`\`\`kotlin
val runtimeSettings = GeckoRuntimeSettings.Builder()
    .contentBlocking(
        ContentBlocking.Settings.Builder()
            .antiTracking(ContentBlocking.AntiTracking.STRICT)
            .cookieBehavior(ContentBlocking.CookieBehavior.ACCEPT_NON_TRACKERS)
            .enhancedTrackingProtectionLevel(ContentBlocking.EtpLevel.STRICT)
            .build()
    )
    .aboutConfigEnabled(false)
    .build()

val geckoRuntime = GeckoRuntime.create(context, runtimeSettings)
\`\`\`

### Session Lifecycle and Workspace Isolation
Each browser tab maps to an independent \`GeckoSession\`. The container-based workspace separation from desktop is preserved via isolated cookie and context storage. Private browsing tabs exist strictly in-memory and are purged immediately upon closure.`
          },
          {
            id: "mobile-ui",
            title: "Jetpack Compose & Material 3 Expressive",
            description: "M3 Expressive design tokens, grouped settings rows, and adaptive components.",
            content: `The Hilal Android UI conforms strictly to Google's Material 3 Expressive (M3E) guidelines, providing visual harmony with the desktop Beer CSS design language.

### Core UI Components

| Component | Path | Responsibility |
| --- | --- | --- |
| \`Omnibox\` | \`ui/components/Omnibox.kt\` | Address bar, morphing progress indicator, shield status, and bang detection. |
| \`TabsTray\` | \`ui/components/TabsTray.kt\` | Swipe-to-dismiss tab grid, workspace pagination, and quick tab creation. |
| \`OptionsBottomSheet\` | \`ui/components/OptionsBottomSheet.kt\` | Desktop site toggle, find in page, tracking protection controls, and sharing. |
| \`SettingsScreen\` | \`ui/screens/SettingsScreen.kt\` | M3 Expressive grouped container rows, default browser configuration, and bangs. |

### Dynamic Color & Theming
On Android 12+, Hilal automatically adapts to the user's wallpaper via Dynamic Color (Monet). Both Light and Dark color schemes are fully tuned with high-contrast surfaces and accessible text tokens.`
          },
          {
            id: "mobile-bangs",
            title: "Hilal Bangs Mobile Search Engine",
            description: "Direct search shortcuts and URL parsing logic.",
            content: `The desktop Hilal Bangs search system is integrated natively into the mobile address bar. Prefixing or suffixing a search query with a bang redirects directly to the destination without hitting intermediary tracking search engines.

### Common Built-in Shortcuts
- \`!w <query>\` or \`!wiki <query>\` -> Direct Wikipedia lookup
- \`!gh <query>\` -> Direct GitHub search
- \`!yt <query>\` -> Direct YouTube video search
- \`!ddg <query>\` -> DuckDuckGo search
- \`!reddit <query>\` -> Reddit search

### Parsing and Dispatch
\`BangsEngine.kt\` monitors the query in real-time, extracts registered bang tokens, and constructs direct destination URLs.`
          },
          {
            id: "mobile-build",
            title: "Building from Source & Packaging",
            description: "Gradle build commands, debug, release APK, and App Bundle generation.",
            content: `Building Hilal Android locally requires the Android SDK (API 35/36) and JDK 17+.

### Build Commands

1. Change directory to the Android project root:
\`\`\`bash
cd android
\`\`\`

2. Build and install the debug variant on a connected device:
\`\`\`bash
./gradlew installDebug
\`\`\`

3. Generate a signed Android App Bundle (.aab) for Google Play:
\`\`\`bash
./gradlew bundleRelease
\`\`\`

4. Generate a standalone release APK (.apk):
\`\`\`bash
./gradlew assembleRelease
\`\`\`

> **Signing Notice:** Production builds require signing properties configured via \`keystore.properties\` or CI environment variables (\`KEYSTORE_BASE64\`, \`KEYSTORE_PASSWORD\`, \`KEY_ALIAS\`, \`KEY_PASSWORD\`). Keystores are never tracked in version control.`
          },
          {
            id: "mobile-privacy",
            title: "Privacy Model & Telemetry Transparency",
            description: "Fully open source, zero ad networks, and sponsor-funded model.",
            content: `Hilal Browser on Android treats user privacy as an absolute architectural requirement rather than a feature toggle.

### Data Boundaries
- **Zero Personal Data:** Location, browsing history, form data, and persistent hardware IDs are never collected.
- **Zero Advertising ID:** Google Advertising ID (GAID) and commercial ad SDKs are completely absent from the codebase.
- **Strictly Anonymous Diagnostics:** Only aggregate counts (active installations, device model, and OS version) are processed to measure GeckoView engine stability and rendering compatibility.
- **Auditable Source Code:** The entire application is open source on GitHub. Every network call can be inspected directly in the repository.

### Monetization Model
Hilal Browser contains zero advertising networks, zero affiliate tracking, and zero commercial search placement deals. Development is funded exclusively through community donations and project sponsorships.`
          }
        ]
      },
      {
        id: "upstream",
        title: "Upstream Synchronization",
        shortTitle: "Upstream Sync",
        iconName: "RefreshCw",
        description: "Tracking Mozilla releases and advancing the pinned commit hash.",
        subsections: [
          {
            id: "rolling-forward",
            title: "Rolling Firefox Forward",
            description: "Procedure for updating the pinned upstream base.",
            content: `When Mozilla releases new security updates or stable versions:

1. Update the commit hash in \`upstream.lock\`:
\`\`\`toml
[upstream]
repo = "https://github.com/mozilla-firefox/firefox.git"
commit = "new-target-commit-hash"
branch = "release"
\`\`\`

2. Checkout the new commit and apply patches:
\`\`\`bash
./bin/hil setup
./bin/hil apply --force
\`\`\`

3. If all patches apply cleanly, compile and verify:
\`\`\`bash
scripts/build-macos.sh faster
(cd engine && ./mach run)
\`\`\`

4. Verify branding strings in \`about:\`, workspace isolation, and custom UI components.`
          }
        ]
      },
      {
        id: "privacy",
        title: "Privacy Architecture & Levels",
        shortTitle: "Privacy",
        iconName: "Shield",
        description: "Hardening profiles, LibreWolf alignment, and technical tradeoffs.",
        subsections: [
          {
            id: "privacy-levels",
            title: "Hardening Profiles",
            description: "Detailed breakdown of Balanced, Strict, and Maximum levels.",
            content: `Hilal privacy levels are local **hardening profiles**, not anonymity promises.

### What Hilal Does Not Claim:
- Hilal does not hide your public IP address (it does not replace a VPN or Tor Browser).
- Hilal does not make every website anonymous.
- Hilal does not guarantee site functionality at stricter levels.

### Profile Comparison Matrix

| Feature / Setting | Balanced (Default) | Strict | Maximum Local |
| --- | --- | --- | --- |
| **uBlock Origin** | Bundled & Enabled | Bundled & Enabled | Bundled & Enabled |
| **Telemetry & Analytics** | Completely Disabled | Completely Disabled | Completely Disabled |
| **Resist Fingerprinting (RFP)** | Enabled | Enabled | Enabled |
| **HTTPS-Only Mode** | Enabled | Enabled | Enabled |
| **WebGL** | Disabled for fingerprint defense | Disabled | Disabled |
| **WebRTC** | Enabled (Local host ICE masked) | **Completely Disabled** | **Completely Disabled** |
| **First Party Isolation (FPI)** | Disabled | **Enabled** | **Enabled** |
| **JavaScript** | Enabled | Enabled | **Disabled** |
| **Camera / Mic / Location** | Prompt per site | Prompt per site | **Blocked by default** |
| **Clear on Shutdown** | Cookies & Cache | Cookies & Cache | **All History & Downloads** |

> **Technical Note:** \`Maximum Local\` disables JavaScript entirely. Modern single-page applications and authenticated dashboards will break. This profile is intended for zero-script document reading in high-risk environments.`
          }
        ]
      },
      {
        id: "design-system",
        title: "Material 3 Expressive Design System",
        shortTitle: "Design System",
        iconName: "Palette",
        description: "Official M3E token specifications, component standards, and implementation rules across Hilal Browser.",
        subsections: [
          {
            id: "m3e-foundations",
            title: "Design Philosophy & Token Architecture",
            description: "Brand anchor color, solid surfaces, and shape scale.",
            content: `The Hilal Browser user interface (website, \`about:\` pages, workspace shells, and browser chrome) strictly follows Google's **Material 3 Expressive (M3E)** design system.

### Core Architectural Principles
1. **Brand Anchor:** Official seed color is **Google / Hilal Blue (\`#0b57d0\`)**, with dark mode primary derived as \`#a8c7fa\`.
2. **Solid Surfaces Only:** No glassmorphism or \`backdrop-blur\` on navbars or menus. Surfaces are opaque and tonal.
3. **Breathing Room:** Elements, chips, and buttons must never be squeezed. Adequate padding and space are strictly enforced.

### Surface & Color Tokens

| Token | Light Mode | Dark Mode | Usage |
| --- | --- | --- | --- |
| \`--primary\` | \`#0b57d0\` | \`#a8c7fa\` | Primary filled buttons, active tab indicators, accents |
| \`--primary-container\` | \`#d3e3fd\` | \`#0842a0\` | Tonal pill buttons, active menu backgrounds, badges |
| \`--surface\` | \`#f8f9ff\` | \`#111318\` | Default page background |
| \`--surface-container-lowest\` | \`#ffffff\` | \`#0c0e12\` | Input fields, prominent card surfaces |
| \`--surface-container\` | \`#eceef5\` | \`#1e2025\` | Modals, fixed top navigation bar |
| \`--outline-variant\` | \`#c3c7cf\` | \`#43474e\` | Subtle borders and structural dividers |`
          },
          {
            id: "m3e-components",
            title: "Component Anatomy & Rules",
            description: "Pill buttons, generous chip padding, and spacious desktop dialogs.",
            content: `All UI implementations must adhere to the following rules:

### 1. Buttons
- Buttons must be pill-shaped (\`rounded-full\`). Sharp 90-degree box buttons are forbidden.
- Minimum padding is \`px-5 py-2.5\`, with icon-label spacing of at least \`gap-2.5\`.

### 2. Chips & Badges
- Text must never touch the border outline.
- Explicit minimum padding is \`px-3.5 py-1 rounded-full text-xs font-semibold\`.

### 3. Modals & Dialogs
- Desktop modals must never be squeezed into \`max-w-lg\` (512px); use at least \`max-w-2xl\` (672px) or \`max-w-3xl\` (768px).
- Artifact rows must display platform and size badges on the top line, with the full unclipped filename below.

### 4. Google Material Symbols Only
- Use ONLY Google Material Symbols Outlined (\`<i>icon_name</i>\`). Mixed icon libraries are forbidden.`
          }
        ]
      }
    ]
  }
};
