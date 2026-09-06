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
      }
    ]
  }
};
