import { useState } from "react";
import { motion } from "motion/react";
import {
  Smartphone,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Code2,
  FolderTree,
  ArrowLeft,
  Download,
} from "lucide-react";

interface MobileDocsPageProps {
  lang: "tr" | "en";
  onBack?: () => void;
  onOpenDownload?: () => void;
}

const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 26,
};

const m3FadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

const m3Stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export default function MobileDocsPage({ lang, onBack, onOpenDownload }: MobileDocsPageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const t = {
    tr: {
      chip: "Geliştirici Dokümanları",
      title: "Hilal Android Mimarisi",
      subtitle:
        "Mozilla GeckoView ve Jetpack Compose Material 3 Expressive mimarisi üzerine kurulu bağımsız Android web tarayıcısı teknik dokümanları.",
      backHome: "Ana Sayfaya Dön",
      downloadApp: "Uygulamayı İndir",
      nav: {
        overview: "Genel Bakış",
        structure: "Proje Yapısı",
        build: "Kaynak Koddan Derleme",
        architecture: "Motor & Mimari",
        bangs: "Hilal Bangs Motoru",
        telemetry: "Gizlilik & İstatistikler",
      },
      sections: {
        overview: {
          title: "Teknik Genel Bakış",
          desc: "Hilal Android, Chromium tabanlı WebView sarmalayıcılarından farklı olarak, doğrudan Mozilla GeckoView motoru üzerinde çalışan bağımsız bir web tarayıcısıdır.",
          specs: [
            { label: "Paket Adı", val: "com.vastsea.hilal" },
            { label: "Target SDK", val: "API 35 (Android 15)" },
            { label: "Min SDK", val: "API 26 (Android 8.0 Oreo)" },
            { label: "Render Motoru", val: "Mozilla GeckoView 135" },
            { label: "Arayüz Kütüphanesi", val: "Jetpack Compose (Material 3 Expressive 1.4-alpha10)" },
            { label: "Mimari Hedef", val: "arm64-v8a" },
          ],
        },
        structure: {
          title: "Modül ve Kaynak Ağacı",
          desc: "Hilal Android, tek bir Activity (MainActivity.kt) ve reaktif State Hoisting prensibiyle çalışan ayrık UI bileşenlerinden oluşur.",
        },
        build: {
          title: "Kaynak Koddan Derleme",
          desc: "Android derlemesi için JDK 21 ve Android SDK (Platform 35) gereklidir. Gradle wrapper ile doğrudan derlenebilir.",
          reqTitle: "Gereksinimler:",
          reqs: [
            "Java Development Kit (JDK) 21",
            "Android SDK Build-Tools 35.0.0",
            "Android NDK (r26 veya üzeri, arm64-v8a)",
          ],
        },
        architecture: {
          title: "GeckoView & Çoklu Çalışma Alanları",
          desc: "GeckoView ve sekme mimarisinin işleyişi:",
          items: [
            {
              title: "GeckoRuntime & GeckoSession",
              body: "GeckoRuntime uygulama başlatılırken tekil (singleton) olarak yüklenir. Her BrowserTab örneği kendi GeckoSession oturumuna sahiptir; böylece sekmeler arası oturum ve gezinme geçmişi izole edilir.",
            },
            {
              title: "Çalışma Alanları (Workspaces)",
              body: "Sekmeler, Workspace veri modeline göre gruplanır. Alanlar arasında geçiş yapıldığında açık sekmelerin GeckoView oturumları bellekte korunur; sekme yeniden yüklemesi yapılmaksızın pürüzsüz geçiş sağlanır.",
            },
            {
              title: "Material 3 Expressive Arayüz",
              body: "Yüzen adres çubuğu (Floating Omnibox), alt araç çubuğu ve ergonomik seçenekler sayfası, tek elle rahat kullanım için ekranın alt yarısına optimize edilmiştir.",
            },
          ],
        },
        bangs: {
          title: "Hilal Bangs Arama Motoru",
          desc: "Arama çubuğuna yazılan sorguları doğrudan hedef arama motoruna veya web sitesine yönlendiren ön ek mekanizmasıdır.",
          codeDesc: "Örnek Bang sözdizimleri:",
          tableHeaders: ["Ön Ek", "Hedef Servis", "Çözümlenen URL Şablonu"],
          tableRows: [
            ["!g", "Google Arama", "https://www.google.com/search?q=%s"],
            ["!yt", "YouTube", "https://www.youtube.com/results?search_query=%s"],
            ["!w", "Vikipedi (Türkçe)", "https://tr.wikipedia.org/wiki/Special:Search?search=%s"],
            ["!ddg", "DuckDuckGo", "https://duckduckgo.com/?q=%s"],
            ["!gh", "GitHub", "https://github.com/search?q=%s"],
          ],
          customNote: "Kullanıcılar Ayarlar > Hilal Bangs Yönetimi ekranından kendi özel bang kısayollarını ekleyebilir.",
        },
        telemetry: {
          title: "Gizlilik Taahhüdü ve Anonim İstatistikler",
          desc: "Hilal Browser, açık kaynak kodlu ve gizlilik odaklı bir projedir. Tüm kaynak kodlar GitHub üzerinde herkese açıktır.",
          points: [
            "Yalnızca Anonim İstatistikler: Yalnızca hizmetleri ve GeckoView motoru kararlılığını iyileştirmek adına toplam aktif kullanıcı sayısı, cihaz modeli ve Android sürümü tamamen anonim olarak işlenir.",
            "Kişisel Veri Yok: Ad, e-posta, telefon, IP adresi veya Google Reklam Kimliği (GAID) asla toplanmaz.",
            "Tarama Geçmişi Yereldir: Ziyaret edilen web sayfaları, arama sorguları ve çerezler yalnızca kullanıcının fiziksel cihazında saklanır; harici sunuculara iletilmez.",
            "Finansman Yalnızca Sponsorlar: Proje yalnızca açık kaynak sponsorlukları ve bağışlarla finanse edilir; reklam ağı veya kullanıcı verisi satışı kesinlikle yoktur.",
          ],
        },
      },
    },
    en: {
      chip: "Developer Documentation",
      title: "Hilal Android Architecture",
      subtitle:
        "Technical documentation for Hilal Android, an independent mobile web browser powered by Mozilla GeckoView and Jetpack Compose Material 3 Expressive.",
      backHome: "Back to Home",
      downloadApp: "Download App",
      nav: {
        overview: "Overview",
        structure: "Project Structure",
        build: "Build from Source",
        architecture: "Engine & Architecture",
        bangs: "Hilal Bangs Engine",
        telemetry: "Privacy & Telemetry",
      },
      sections: {
        overview: {
          title: "Technical Overview",
          desc: "Unlike commercial browsers built on Android WebView wrappers, Hilal Android is an independent browser running directly on the Mozilla GeckoView engine.",
          specs: [
            { label: "Package Name", val: "com.vastsea.hilal" },
            { label: "Target SDK", val: "API 35 (Android 15)" },
            { label: "Min SDK", val: "API 26 (Android 8.0 Oreo)" },
            { label: "Engine", val: "Mozilla GeckoView 135" },
            { label: "UI Framework", val: "Jetpack Compose (Material 3 Expressive 1.4-alpha10)" },
            { label: "ABI Target", val: "arm64-v8a" },
          ],
        },
        structure: {
          title: "Module & Source Tree",
          desc: "Hilal Android is structured as a single Activity (MainActivity.kt) using reactive State Hoisting with cleanly decoupled Compose components.",
        },
        build: {
          title: "Building from Source",
          desc: "Building Hilal Android requires JDK 21 and the Android SDK (API 35 platform). Build directly using the Gradle wrapper.",
          reqTitle: "Prerequisites:",
          reqs: [
            "Java Development Kit (JDK) 21",
            "Android SDK Build-Tools 35.0.0",
            "Android NDK (r26 or higher, arm64-v8a)",
          ],
        },
        architecture: {
          title: "GeckoView & Tab Workspaces",
          desc: "Engine and workspace mechanics:",
          items: [
            {
              title: "GeckoRuntime & GeckoSession",
              body: "GeckoRuntime is initialized as an application-level singleton. Each BrowserTab retains its own GeckoSession instance, keeping per-tab navigation history and state cleanly isolated.",
            },
            {
              title: "Tab Workspaces",
              body: "Tabs are grouped under distinct Workspace models. Switching workspaces does not reload tabs in memory, enabling seamless context switching between Work and Personal spaces.",
            },
            {
              title: "Material 3 Expressive UI",
              body: "The floating Omnibox, bottom navigation bar, and ergonomic bottom action sheet are positioned for effortless one-handed thumb interaction.",
            },
          ],
        },
        bangs: {
          title: "Hilal Bangs Search Engine",
          desc: "A direct prefix parser that routes omnibox queries straight to the destination website without search intermediary redirection.",
          codeDesc: "Default Bang shortcuts:",
          tableHeaders: ["Prefix", "Destination", "Resolved Query Template"],
          tableRows: [
            ["!g", "Google Search", "https://www.google.com/search?q=%s"],
            ["!yt", "YouTube", "https://www.youtube.com/results?search_query=%s"],
            ["!w", "Wikipedia", "https://en.wikipedia.org/wiki/Special:Search?search=%s"],
            ["!ddg", "DuckDuckGo", "https://duckduckgo.com/?q=%s"],
            ["!gh", "GitHub", "https://github.com/search?q=%s"],
          ],
          customNote: "Users can manage, add, or edit custom bangs via Settings > Hilal Bangs Management.",
        },
        telemetry: {
          title: "Privacy Commitment & Anonymous Stats",
          desc: "Hilal Browser is an open-source project. The full codebase is available on GitHub for independent review.",
          points: [
            "Strictly Anonymous Stats: To diagnose engine crashes and improve GeckoView compatibility, only aggregate active user counts, device model, and OS version are processed.",
            "Zero Personal Data: No names, emails, phone numbers, IP addresses, or Google Advertising IDs (GAID) are collected.",
            "Browsing Stays Local: Visited URLs, search queries, cookies, and bookmarks never leave your device.",
            "Monetization via Sponsors Only: Hilal is funded entirely by open-source community sponsors. We do not run commercial ad networks or sell user data.",
          ],
        },
      },
    },
  };

  const activeT = t[lang] || t.tr;
  const s = activeT.sections;

  return (
    <main className="min-h-screen pt-32 sm:pt-40 pb-28 px-4 sm:px-6 bg-m3-surface text-[var(--md-sys-color-on-surface)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          variants={m3Stagger}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4 mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold hover:bg-m3-container-high transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{activeT.backHome}</span>
            </button>
          </div>

          <motion.div
            variants={m3FadeIn}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold tracking-wide"
          >
            <Smartphone className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            <span>{activeT.chip}</span>
          </motion.div>

          <motion.h1
            variants={m3FadeIn}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--md-sys-color-on-surface)]"
          >
            {activeT.title}
          </motion.h1>

          <motion.p
            variants={m3FadeIn}
            className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--md-sys-color-on-surface-variant)] leading-relaxed font-normal"
          >
            {activeT.subtitle}
          </motion.p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {Object.entries(activeT.nav).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`h-10 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeSection === key
                  ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm"
                  : "bg-m3-container text-[var(--md-sys-color-on-surface-variant)] hover:bg-m3-container-high"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-10">
          {/* 1. Overview */}
          {activeSection === "overview" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    {s.overview.title}
                  </h2>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    GeckoView Engine & Jetpack Compose
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                {s.overview.desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {s.overview.specs.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                      {item.label}
                    </div>
                    <div className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mt-1 font-mono">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 2. Project Structure */}
          {activeSection === "structure" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    {s.structure.title}
                  </h2>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    android/app/src/main/
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                {s.structure.desc}
              </p>

              <div className="p-4 sm:p-5 rounded-2xl bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 font-mono text-xs overflow-x-auto text-[var(--md-sys-color-on-surface)]">
                <pre>{`android/
├── app/
│   ├── build.gradle.kts           # GeckoView 135 & Compose 1.4-alpha10 dependencies
│   └── src/main/
│       ├── AndroidManifest.xml    # Permissions: INTERNET, ACCESS_NETWORK_STATE
│       └── java/com/vastsea/hilal/
│           ├── MainActivity.kt    # Root Compose activity, GeckoView integration
│           ├── model/
│           │   ├── BrowserTab.kt  # Tab state and GeckoSession binding
│           │   ├── Workspace.kt   # Workspaces model (id, name, emoji)
│           │   └── Bang.kt        # Bang shortcut definition
│           ├── search/
│           │   └── HilalBangsEngine.kt  # Prefix parser (!g, !yt, !w)
│           ├── ui/
│           │   ├── components/
│           │   │   ├── Omnibox.kt       # Address bar & suggestions
│           │   │   ├── TabsTray.kt      # Workspace tabs grid
│           │   │   └── OptionsBottomSheet.kt # Bottom action controls
│           │   └── screens/
│           │       ├── SettingsScreen.kt # Theme & privacy configuration
│           │       └── BangsScreen.kt    # Custom Bang manager
│           └── theme/
│               └── Theme.kt       # Material 3 Expressive dynamic color scheme`}</pre>
              </div>
            </motion.section>
          )}

          {/* 3. Build from Source */}
          {activeSection === "build" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    {s.build.title}
                  </h2>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Gradle Wrapper & Toolchain
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                {s.build.desc}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
                  {s.build.reqTitle}
                </div>
                <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] space-y-1">
                  {s.build.reqs.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Build Commands */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 font-mono text-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]"># Debug APK</span>
                    <br />
                    <span className="text-[var(--md-sys-color-primary)] font-bold">$ </span>
                    <span>cd android && ./gradlew assembleDebug</span>
                  </div>
                  <button
                    onClick={() => handleCopy("cd android && ./gradlew assembleDebug", "cmd1")}
                    className="p-2 rounded-full bg-m3-container hover:bg-m3-container-high transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copiedCode === "cmd1" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 font-mono text-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]"># Release App Bundle (.aab) for Google Play</span>
                    <br />
                    <span className="text-[var(--md-sys-color-primary)] font-bold">$ </span>
                    <span>cd android && ./gradlew bundleRelease</span>
                  </div>
                  <button
                    onClick={() => handleCopy("cd android && ./gradlew bundleRelease", "cmd2")}
                    className="p-2 rounded-full bg-m3-container hover:bg-m3-container-high transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copiedCode === "cmd2" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* 4. Architecture */}
          {activeSection === "architecture" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    {s.architecture.title}
                  </h2>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Workspaces & Session Model
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {s.architecture.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30 space-y-2"
                  >
                    <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 5. Bangs */}
          {activeSection === "bangs" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    {s.bangs.title}
                  </h2>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    HilalBangsEngine.kt
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                {s.bangs.desc}
              </p>

              {/* Bangs Table */}
              <div className="overflow-x-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)]/30 bg-m3-container-lowest">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-m3-container border-b border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface)] font-semibold">
                    <tr>
                      {s.bangs.tableHeaders.map((h, i) => (
                        <th key={i} className="p-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20 text-[var(--md-sys-color-on-surface-variant)]">
                    {s.bangs.tableRows.map((r, i) => (
                      <tr key={i} className="hover:bg-m3-container/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[var(--md-sys-color-primary)]">
                          {r[0]}
                        </td>
                        <td className="p-3.5 font-medium text-[var(--md-sys-color-on-surface)]">
                          {r[1]}
                        </td>
                        <td className="p-3.5 font-mono text-xs truncate max-w-xs">{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                {s.bangs.customNote}
              </p>
            </motion.section>
          )}

          {/* 6. Telemetry & Privacy */}
          {activeSection === "telemetry" && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="p-6 sm:p-10 rounded-[32px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-lg space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                    {s.telemetry.title}
                  </h2>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Zero-Knowledge Architecture & Sponsor Model
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                {s.telemetry.desc}
              </p>

              <div className="space-y-3 pt-2">
                {s.telemetry.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-m3-container border border-[var(--md-sys-color-outline-variant)]/30 text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] mt-1.5 shrink-0" />
                    <div>{pt}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/VastSea0/hilal-browser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold transition-all hover:shadow"
                >
                  <Code2 className="w-4 h-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold hover:bg-m3-container-high transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === "tr" ? "Gizlilik Politikası (HTML)" : "Privacy Policy (HTML)"}</span>
                </a>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </main>
  );
}
