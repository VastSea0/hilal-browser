import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Github,
  Cpu,
  Shield,
  Layers,
  ChevronDown,
  ExternalLink,
  Download,
  Terminal,
  Columns,
  Sparkle,
  BookmarkCheck,
  CodeXml,
  Lock,
  ArrowRight,
  Loader2,
  ListRestart
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

import { GithubRelease, GithubAsset } from "./types";
import {
  fetchGithubReleases,
  FALLBACK_RELEASE_TR,
  FALLBACK_RELEASE_EN,
  formatLocalizedDate,
  parseChangelogToSimpleLines,
  formatBytes,
  detectOS,
  getRecommendedAsset
} from "./utils/github";
import DownloadModal from "./components/DownloadModal";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Default to dark for stellar navy styling
    const saved = localStorage.getItem("hilal-theme");
    return saved === "light" ? "light" : "dark";
  });

  // Language state
  const [lang, setLang] = useState<"tr" | "en">(() => {
    const saved = localStorage.getItem("hilal-lang");
    return (saved === "en" || saved === "tr") ? saved : "tr";
  });

  // Release fetching states
  const [release, setRelease] = useState<GithubRelease | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isApiFallback, setIsApiFallback] = useState<boolean>(false);

  // Modal active state
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [detectedOS, setDetectedOS] = useState<string>("other");

  useEffect(() => {
    setDetectedOS(detectOS());
  }, []);

  // FAQ accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Active navigation highlight (scroll tracker)
  const [activeSection, setActiveSection] = useState<string>("home");

  // Sync theme to root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("hilal-theme", theme);
  }, [theme]);

  // Sync language selection to local storage
  useEffect(() => {
    localStorage.setItem("hilal-lang", lang);
  }, [lang]);

  // Fetch product release metadata from GitHub
  useEffect(() => {
    const loadReleaseData = async () => {
      try {
        setLoading(true);
        const releases = await fetchGithubReleases();
        if (releases && releases.length > 0) {
          setRelease(releases[0]);
          setIsApiFallback(false);
        } else {
          // If empty releases list, use fallback
          setIsApiFallback(true);
        }
      } catch (err) {
        // Fallback gracefully on rate limits or failures
        setIsApiFallback(true);
      } finally {
        setLoading(false);
      }
    };
    loadReleaseData();
  }, []);

  // Monitor scroll height to highlight corresponding navbar items
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const featuresEl = document.getElementById("ozellikler");
      const interfaceEl = document.getElementById("arayuz");
      const releasesEl = document.getElementById("surumler");
      const visionEl = document.getElementById("vizyon");

      if (visionEl && scrollPos >= visionEl.offsetTop) {
        setActiveSection("vizyon");
      } else if (releasesEl && scrollPos >= releasesEl.offsetTop) {
        setActiveSection("surumler");
      } else if (interfaceEl && scrollPos >= interfaceEl.offsetTop) {
        setActiveSection("arayuz");
      } else if (featuresEl && scrollPos >= featuresEl.offsetTop) {
        setActiveSection("ozellikler");
      } else {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Soft scroll trigger helper
  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Toggle theme helper
  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Convert OS assets inside tag for individual rendering icons
  const getOSIconForAsset = (name: string) => {
    const n = name.toLowerCase();
    if (n.endsWith(".exe")) return "❖";
    if (n.endsWith(".dmg")) return "";
    if (n.endsWith(".deb") || n.endsWith(".appimage")) return "🐧";
    return "📦";
  };

  // Localized FAQ database
  const faqs = {
    tr: [
      {
        q: "Hilal Browser hangi altyapıyı kullanıyor?",
        a: "Hilal Browser, kararlı, son derece güvenli ve gizlilik odaklı Firefox (Gecko) motorunu temel alır. Chromium tabanlı tekelleşmenin aksine, web'in açık standartlarını ve kullanıcı özgürlüğünü korumayı amaçlayan bağımsız bir tarayıcı ekolojisini savunur."
      },
      {
        q: "Alpha sürümü ne anlama geliyor?",
        a: "Alpha sürümü, tarayıcımızın erken aşama test sürecinde olduğunu ifade eder. Temel bileşenler entegre edilmiş olup, kullanıcı geri bildirimleriyle kararlı hale getirilmektedir. Sistem kararlılığı artsa da günlük kullanımda küçük kararsızlıklar görülebilir; katkıda bulunmak ve geri bildirim sağlamak için harika bir dönemdir!"
      },
      {
        q: "Eklentilerimi kullanmaya devam edebilir miyim?",
        a: "Evet! Hilal Browser, küresel Firefox Eklentiler (AMO) deposuyla tamamen uyumludur. Sevdiğiniz tüm Firefox eklentilerini doğrudan yükleyebilirsiniz. Ayrıca reklam ve zararlı yazılım izleyici engellemede altın standart olan uBlock Origin eklentisi varsayılan kurulumda gömülü olarak gelir; kuruluma gerek kalmadan reklamlardan arınmış bir web deneyimi yaşatır."
      },
      {
        q: "Dikey sekmeler (Vertical Tabs) nasıl optimize edildi?",
        a: "Geleneksel yatay sekmeler geniş ekranlı modern bilgisayarlarda hem görüş alanını daraltır hem de sekme başlıklarını okunamaz kılar. Hilal, dikey sekme rıhtımı ile sekmelerinizi sol kenarlıkta net isimlerle listeler. Dikey rıhtım alan kazanmak için daraltılabilir, böylece web sayfalarına maksimum nefes alma alanı sunulur."
      }
    ],
    en: [
      {
        q: "What technical engine powers Hilal Browser?",
        a: "Hilal Browser is built on top of the highly secure, privacy-first, and stable Firefox Quantum (Gecko) engine. Unlike Chromium-based mono-cultures, we support a completely independent browser engine ecosystem that values open web standards and absolute user sovereignty."
      },
      {
        q: "What does an Alpha phase represent?",
        a: "An Alpha release means our browser is in its early stages of active development. The essential features are fully implemented, and we are stabilizing major modules through early user feedback. While it is stable enough to test, minor rough edges may surface — making it the perfect time to get involved and contribute!"
      },
      {
        q: "Can I continue to use my standard add-ons?",
        a: "Yes! Hilal Browser is fully compatible with the global Firefox Add-ons (AMO) library. You can immediately install all your favorite plugins. On top of that, uBlock Origin — the undisputed champion of ad-blocking and privacy filtering — comes integrated by default, giving you a clutter-free web experience immediately."
      },
      {
        q: "How are the Vertical Tabs designed and optimized?",
        a: "Traditional horizontal tabs restrict vertical reading space on modern widescreen displays and quickly become unreadable. Hilal reorganizes tabs in a clean vertical dock along the left edge. The side dock is completely collapsible, affording web documents maximum focus and reading space."
      }
    ]
  };

  // Static site translations dictionary
  const tr = {
    nav: {
      features: "Özellikler",
      interface: "Arayüz",
      releases: "Sürümler",
      vision: "Vizyon",
      installBtn: "YÜKLE"
    },
    hero: {
      alphaBadge: "HİLAL BROWSER ALPHA AŞAMASINDA",
      title1: "internette",
      title2: "özgürlüğün",
      title3: "ve",
      title4: "sadeliğin",
      title5: "yeni evresi ile tanışın.",
      desc: "Hilal Browser, hızlı ve güvenli Firefox (Gecko) motorunun sağlamlığı ve varsayılan olarak gömülü gelen uBlock Origin korumasıyla geliştirildi. Dikey sekmelerle donatılmış, reklam yükünden arınmış, sakin bir internet deneyimi sizi bekliyor.",
      downloadBtn: "Alpha Sürümünü İndir",
      sourceBtn: "Kaynak Kodları İncele"
    },
    preview: {
      title: "// Özelleştirilmiş Giriş Sayfası Önizlemesi",
      sub: "Gecko motorunun sakin kalbi"
    },
    features: {
      tag: "Önemli Katkılar",
      title: "Tarayıcınızı yeniden anlamlandırın.",
      desc: "Sadece bir web istemcisi değil; odaklanma ve şeffaflık ilkeleri etrafında kurgulanmış sakin bir pencere.",
      card1Title: "Firefox (Gecko) Gücü",
      card1Desc: "Hilal Browser, gücünü gizlilik savunucusu olan Firefox Quantum (Gecko) motorundan alır. Tüm ekosistem eklentileriyle tam uyum, bellek kontrolü ve sarsılmaz web sayfası kararlılığı tek tıkla elinizde.",
      card1Foot: "Bağımsız Motor Güvencesi",
      card2Title: "Dahili uBlock Origin Kalkanı",
      card2Desc: "Reklamlar, çerez pencereleri ve görünmez analitik takip kodları web sitelerini çöplüğe çevirir. uBlock Origin entegrasyonu sayesinde sayfalarınız gereksiz şişkinlikten anında kurtularak hız kazanır.",
      card2Foot: "Arka planda kesintisiz kalkan",
      card3Title: "Yenilikçi Dikey Sekmeler",
      card3Desc: "Yatay sekmelerin sıkışıklığına elveda deyin. Sol bar içinde yapılandırılan Dikey Sekmeler, sekmelerinizi tam adıyla, hiyerarşik ve temiz bir dizinde tutmanızı sağlar. Sadelik ve alan özgürlüğü bir arada.",
      card3Foot: "Geniş görüş açısı kazanın"
    },
    releases: {
      tag: "GitHub Entegrasyonu",
      title: "Güncel Sürümler ve Yol Haritası",
      fallbackNotice: "⚠️ GitHub API limitleri nedeniyle lokal önbellek verisi sunuluyor.",
      latestAlpha: "GÜNCEL ALPHA",
      binaryTitle: "Kurulum İkili Dosyaları",
      allReleasesLink: "Tüm sürümleri GitHub üzerinde gör",
      changelogTitle: "DEĞİŞİKLİK GÜNLÜĞÜ",
      fallbackChangelog: "Sürüm ayrıntısı yüklenemedi. Detayları incelemek için lütfen resmi Github sayfasını kontrol edin.",
      bugReport: "Hata bildirimi / Geri Bildirim",
      commits: "Commit Geçmişi"
    },
    principles: {
      tag: "Sarsılmaz İlkeler",
      title: "İnternette Sakin ve Bağımsız Bir Duruş",
      card1Title: "%100 Açık Kaynak Kod & Şeffaflık",
      card1Desc: "Hilal Browser'ın hiçbir satırında gizli veri toplama mekanizması barındırılmaz. Tüm geliştirme süreci şeffaftır ve GitHub üzerinde topluluğun denetimine tamamen açıktır.",
      card1Link: "Kaynak kodu GitHub'da inceleyin",
      card2Title: "Sıfır Profilleme & Tam Gizlilik",
      card2Desc: "Arama geçmişiniz, şifreleriniz veya ziyaret ettiğiniz siteler hiçbir sunucuya ulaştırılmaz. Hilal yerel ortamınızda çalışır, çerezleri kısıtlar ve izleyicileri tam güçle engeller. Verileriniz sadece sizindir.",
      card2Foot: "İZLEME KARŞITI VARSAYILAN AKTİF"
    },
    faq: {
      tag: "Sıkça Sorulanlar",
      title: "Akla Takılanlar"
    },
    footer: {
      quote: '"İnternetin daha özgür ve sakin yüzü."',
      install: "Yükle",
      copyright: "Hilal Browser projesi. Bir Firefox (Gecko) çatalıdır.",
      license: "MPL 2.0 Özgür Yazılım Lisansı ile koruma altındadır."
    }
  };

  const en = {
    nav: {
      features: "Features",
      interface: "Interface",
      releases: "Releases",
      vision: "Vision",
      installBtn: "INSTALL"
    },
    hero: {
      alphaBadge: "HILAL BROWSER IS IN ALPHA PHASE",
      title1: "meet the new",
      title2: "freedom",
      title3: "and",
      title4: "simplicity",
      title5: "era of the web.",
      desc: "Hilal Browser is engineered with the robustness of the fast, secure Firefox (Gecko) engine and the built-in shield of uBlock Origin. A peaceful web experience equipped with vertical tabs and free from clutter awaits.",
      downloadBtn: "Download Alpha Build",
      sourceBtn: "Inspect Source Code"
    },
    preview: {
      title: "// Custom Welcome Home Page Preview",
      sub: "The serene core of the Gecko engine"
    },
    features: {
      tag: "Core Contributions",
      title: "Redefine your relationship with browsing.",
      desc: "Not just another web client; a calm window designed strictly around clarity, focus, and transparency principles.",
      card1Title: "Firefox (Gecko) Power",
      card1Desc: "Hilal Browser gains its core strength from the privacy pioneer Firefox Quantum (Gecko) web engine. Full add-on store compatibility, optimized memory control, and unwavering tab stability are yours at a single click.",
      card1Foot: "Independent Web Engine Support",
      card2Title: "In-Built uBlock Origin Shield",
      card2Desc: "Intrusive ads, cookie consent popups, and trackers turn web pages into virtual scrapyards. With native uBlock Origin integration, your pages load instantly without annoying overhead.",
      card2Foot: "Seamless blocker out of the box",
      card3Title: "Innovative Vertical Tabs",
      card3Desc: "Escape horizontal tab overcrowding. Implemented in a neat sidebar dock, Vertical Tabs showcase your tabs hierarchically with readable titles. Reclaims immense screen breathing space.",
      card3Foot: "Gain superior horizontal perspective"
    },
    releases: {
      tag: "GitHub Integration",
      title: "Active Releases and Project Roadmap",
      fallbackNotice: "⚠️ Serving local cached data due to GitHub API rate limiting rules.",
      latestAlpha: "LATEST ALPHA",
      binaryTitle: "Installation Binaries",
      allReleasesLink: "View all releases on GitHub",
      changelogTitle: "CHANGELOG",
      fallbackChangelog: "Release details could not be loaded. Please check the official GitHub repository for detailed release specs.",
      bugReport: "Report Bug / Feedback",
      commits: "Commit History"
    },
    principles: {
      tag: "Unshakable Principles",
      title: "A Calm and Sovereigntist Stance on the Web",
      card1Title: "100% Free Open Source & Transparency",
      card1Desc: "Not a single line of Hilal Browser contains hidden user tracking or data telemetry. The development is transparent and completely open to audit by the community on GitHub.",
      card1Link: "Review source code on GitHub",
      card2Title: "Zero Profiling & Complete Privacy",
      card2Desc: "Your search history, saved keys, or visited sites are never uploaded to any remote server. Hilal operates strictly in your local sandbox, blocks persistent tracking cookies, and enforces total privacy.",
      card2Foot: "ANTI-TRACKING OPTED IN BY DEFAULT"
    },
    faq: {
      tag: "Frequently Asked Questions",
      title: "Curiosities & Deep Dive"
    },
    footer: {
      quote: '"A freer, calmer phase of the web."',
      install: "Install",
      copyright: "Hilal Browser project. A Firefox (Gecko) fork.",
      license: "Protected under the MPL 2.0 Free Software License."
    }
  };

  const activeT = lang === "en" ? en : tr;
  const faqList = faqs[lang] || faqs.tr;

  // Obtain current release metadata securely
  const activeRelease = isApiFallback || !release
    ? (lang === "en" ? FALLBACK_RELEASE_EN : FALLBACK_RELEASE_TR)
    : release;

  // Recommended asset search based on detected OS
  const recommendedAsset = activeRelease?.assets
    ? getRecommendedAsset(activeRelease.assets, detectedOS as any)
    : null;

  const getDynamicDownloadBtnText = () => {
    if (lang === "tr") {
      switch (detectedOS) {
        case "windows":
          return "Windows için Alpha İndir";
        case "macos":
          return "macOS için Alpha İndir";
        case "linux":
          return "Linux için Alpha İndir";
        default:
          return "Alpha Sürümünü İndir";
      }
    } else {
      switch (detectedOS) {
        case "windows":
          return "Download Alpha for Windows";
        case "macos":
          return "Download Alpha for macOS";
        case "linux":
          return "Download Alpha for Linux";
        default:
          return "Download Alpha Build";
      }
    }
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased selection:bg-teal-500/30 transition-colors duration-500 ${
        theme === "dark" ? "bg-[#080B10] text-[#F4F4F5]" : "bg-[#FAF8F5] text-[#1C1917]"
      }`}
      id="root-container"
    >
      {/* Dynamic Background Organic Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[120px]" />
        <div className="absolute top-60 right-1/4 h-[400px] w-[400px] rounded-full bg-sky-500/5 dark:bg-sky-500/5 blur-[100px]" />
        <div className="absolute bottom-1/3 left-10 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[130px] opacity-60" />
      </div>

      {/* 1. Sticky Navigation Bar */}
      <nav
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300 ${
          theme === "dark"
            ? "border-[#1F2937]/40 bg-[#080B10]/80"
            : "border-[#e7e2da]/70 bg-[#FAF8F5]/80"
        }`}
        id="navbar-sticky"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => scrollToId("hero")}
            id="brand-logo-container"
          >
            <img
              src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/branding/hilal/default128.png"
              alt="Hilal Browser Logo"
              className="h-8 w-8 hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F4F4F5]">
              hilal <span className="text-teal-600 dark:text-teal-400 font-light">browser</span>
            </span>
          </div>

          {/* Nav Center Anchor links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            {[
              { label: activeT.nav.features, id: "ozellikler" },
              { label: activeT.nav.interface, id: "arayuz" },
              { label: activeT.nav.releases, id: "surumler" },
              { label: activeT.nav.vision, id: "vizyon" }
            ].map((item) => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => scrollToId(item.id)}
                className={`transition-colors relative py-1 hover:text-teal-600 dark:hover:text-teal-400 ${
                  activeSection === item.id
                    ? "text-teal-600 dark:text-teal-400 font-semibold"
                    : "text-[#1C1917]/70 dark:text-[#E2E8F0]/70"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 h-0.5 w-full bg-teal-600 dark:bg-teal-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-4">
            {/* Language Selector Toggle */}
            <button
              id="language-switcher"
              onClick={() => setLang(prev => (prev === "tr" ? "en" : "tr"))}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-full border transition-all active:scale-95 ${
                theme === "dark"
                  ? "border-[#1F2937] bg-white/5 hover:bg-white/10 text-teal-400 hover:border-teal-500/20"
                  : "border-[#e7e2da] bg-[#FBF9F4] hover:bg-white text-teal-700 hover:border-teal-600/35"
              }`}
              title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
            >
              {lang === "tr" ? "EN" : "TR"}
            </button>

            {/* Theme switcher */}
            <button
              id="theme-toggler"
              onClick={toggleTheme}
              className={`rounded-full p-2.5 border transition-all ${
                theme === "dark"
                  ? "border-gray-800 bg-[#0B0F19] text-[#fbbf24] hover:border-gray-700"
                  : "border-gray-200 bg-white text-[#f59e0b] hover:bg-gray-50"
              }`}
              title={theme === "dark" ? "Aydınlık Mod" : "Karanlık Mod"}
              aria-label="Tema değiştir"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Discord Link */}
            <a
              href="https://discord.gg/JZJ4tmPHFw"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full p-2.5 border transition-all flex items-center justify-center ${
                theme === "dark"
                  ? "border-gray-800 bg-[#0B0F19] text-[#7289da] hover:border-gray-700 hover:text-[#5865f2]"
                  : "border-gray-200 bg-white text-[#5865f2] hover:bg-gray-50 hover:text-[#4752c4]"
              }`}
              title="Discord"
              aria-label="Discord Server"
            >
              <SiDiscord className="h-4.5 w-4.5" />
            </a>

            {/* Minimalist install button */}
            <button
              id="nav-download-button"
              onClick={() => setIsDownloadOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-teal-600 px-4.5 py-2 text-xs font-semibold tracking-wider text-white shadow-lg shadow-teal-600/15 hover:bg-teal-500 hover:shadow-teal-500/20 active:scale-95 transition-all dark:bg-teal-500 dark:text-[#080B10] dark:hover:bg-teal-400"
            >
              <Download className="h-3.5 w-3.5" />
              {activeT.nav.installBtn}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-16 md:pt-24 text-center" id="hero">
        {/* Alpha Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-xs font-medium tracking-wide text-teal-700 dark:text-teal-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          {activeT.hero.alphaBadge}
        </motion.div>

        {/* Serif-Hybrid Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mt-8 font-sans text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-[#1C1917] dark:text-white"
        >
          {lang === "tr" ? (
            <>
              internette{" "}
              <span className="font-serif italic font-light text-teal-600 dark:text-teal-400">
                özgürlüğün
              </span>{" "}
              ve{" "}
              <span className="font-serif italic font-light text-amber-500 dark:text-amber-400">
                sadeliğin
              </span>{" "}
              <div className="mt-2.5">
                <span className="font-serif italic font-light">yeni evresi</span> ile tanışın.
              </div>
            </>
          ) : (
            <>
              {activeT.hero.title1}{" "}
              <span className="font-serif italic font-light text-teal-600 dark:text-teal-400">
                {activeT.hero.title2}
              </span>{" "}
              {activeT.hero.title3}{" "}
              <span className="font-serif italic font-light text-amber-500 dark:text-amber-400">
                {activeT.hero.title4}
              </span>{" "}
              <div className="mt-2.5">
                {activeT.hero.title5}
              </div>
            </>
          )}
        </motion.h1>

        {/* Hero description text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-[#1C1917]/75 dark:text-[#E2E8F0]/80"
        >
          {activeT.hero.desc}
        </motion.p>

        {/* CTA Buttons row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center"
          id="hero-cta-outer-container"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-download-btn"
              onClick={() => setIsDownloadOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-teal-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-teal-600/10 hover:bg-teal-500 hover:shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all dark:bg-teal-500 dark:text-[#080B10] dark:hover:bg-teal-400"
            >
              <Download className="h-4.5 w-4.5" />
              {getDynamicDownloadBtnText()}
            </button>
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-github-btn"
              className={`inline-flex items-center gap-2.5 rounded-2xl border px-7 py-4 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
                theme === "dark"
                  ? "border-[#1F2937] bg-white/5 hover:bg-white/10 text-[#F4F4F5]"
                  : "border-[#e7e2da] bg-[#FBF9F4] hover:bg-white text-[#1C1917]"
              }`}
            >
              <Github className="h-4.5 w-4.5" />
              {activeT.hero.sourceBtn}
            </a>
          </div>

          {recommendedAsset && (
            <p className="mt-4 text-xs font-mono text-[#1C1917]/50 dark:text-[#F4F4F5]/45 select-text" id="hero-detected-os-subtitle">
              {lang === "tr" ? "Sisteminiz için algılanan:" : "Detected for your system:"}{" "}
              <span className="font-semibold text-teal-600 dark:text-teal-400">{recommendedAsset.name}</span>{" "}
              ({formatBytes(recommendedAsset.size)})
            </p>
          )}
        </motion.div>
      </section>

      {/* 3. Welcome Home Interactive Preview Container */}
      <section className="mx-auto max-w-5xl px-6 py-12" id="arayuz">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Clean Screenshot Display - Directly displaying the high-quality browser window screenshot */}
          <div id="browser-preview-container" className="overflow-hidden rounded-2xl">
            <img
              src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/prefs/browser/base/content/hilal/welcome-home-preview.png"
              alt="Hilal Welcome Home Preview Page"
              className="w-full h-auto select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom Monospaced tag */}
          <div className="mt-4 flex justify-between items-center px-2">
            <span className="font-mono text-[11px] tracking-widest text-[#1C1917]/50 dark:text-[#F4F4F5]/50 uppercase">
              {activeT.preview.title}
            </span>
            <span className="hidden sm:inline-block font-sans text-xs text-teal-600 dark:text-teal-400 font-medium italic">
              {activeT.preview.sub}
            </span>
          </div>
        </motion.div>
      </section>

      {/* 4. Feature Highlights Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12" id="ozellikler">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
            {activeT.features.tag}
          </span>
          <h2 className="mt-2.5 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-[#1C1917] dark:text-white">
            {activeT.features.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#1C1917]/70 dark:text-[#E2E8F0]/70">
            {activeT.features.desc}
          </p>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="features-highlights-grid">
          {/* Card 1: Firefox Power */}
          <motion.div
            whileHover={{ y: -6 }}
            className={`p-7 rounded-3xl border flex flex-col items-start text-left transition-all ${
              theme === "dark"
                ? "border-[#1F2937]/50 bg-[#0B0F19] hover:bg-[#111827] hover:border-teal-500/20"
                : "border-[#e7e2da] bg-[#FBF9F4] hover:bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 text-2xl">
              🦊
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#F4F4F5]">
              {activeT.features.card1Title}
            </h3>
            <p className="mt-3.5 text-xs md:text-sm leading-relaxed text-[#1C1917]/70 dark:text-[#F4F4F5]/70">
              {activeT.features.card1Desc}
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider font-sans">
              <span>{activeT.features.card1Foot}</span>
            </div>
          </motion.div>

          {/* Card 2: uBlock Shield */}
          <motion.div
            whileHover={{ y: -6 }}
            className={`p-7 rounded-3xl border flex flex-col items-start text-left transition-all ${
              theme === "dark"
                ? "border-[#1F2937]/50 bg-[#0B0F19] hover:bg-[#111827] hover:border-teal-500/20"
                : "border-[#e7e2da] bg-[#FBF9F4] hover:bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#F4F4F5]">
              {activeT.features.card2Title}
            </h3>
            <p className="mt-3.5 text-xs md:text-sm leading-relaxed text-[#1C1917]/70 dark:text-[#F4F4F5]/70">
              {activeT.features.card2Desc}
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider font-sans">
              <span>{activeT.features.card2Foot}</span>
            </div>
          </motion.div>

          {/* Card 3: Vertical Tabs */}
          <motion.div
            whileHover={{ y: -6 }}
            className={`p-7 rounded-3xl border flex flex-col items-start text-left transition-all ${
              theme === "dark"
                ? "border-[#1F2937]/50 bg-[#0B0F19] hover:bg-[#111827] hover:border-teal-500/20"
                : "border-[#e7e2da] bg-[#FBF9F4] hover:bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-6">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1C1917] dark:text-[#F4F4F5]">
              {activeT.features.card3Title}
            </h3>
            <p className="mt-3.5 text-xs md:text-sm leading-relaxed text-[#1C1917]/70 dark:text-[#F4F4F5]/70">
              {activeT.features.card3Desc}
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-yellow-600 dark:text-amber-400 font-semibold uppercase tracking-wider font-sans">
              <span>{activeT.features.card3Foot}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Dynamic GitHub Releases & Changelog Section */}
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24" id="surumler">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-[#14b8a6] uppercase">
            {activeT.releases.tag}
          </span>
          <h2 className="mt-2.5 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-[#1C1917] dark:text-white">
            {activeT.releases.title}
          </h2>
          {isApiFallback && (
            <p className="mt-3 text-xs italic text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 py-1 px-3.5 inline-block rounded-full">
              {activeT.releases.fallbackNotice}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Release card Left: Info and asset list */}
          <div className="lg:col-span-5 space-y-4">
            {loading ? (
              // Skeleton Loading states
              <div className="p-6 rounded-3xl border border-slate-700/25 bg-slate-800/10 animate-pulse space-y-4">
                <div className="h-4 bg-slate-400/20 rounded w-1/3" />
                <div className="h-8 bg-slate-400/20 rounded w-2/3" />
                <div className="h-4 bg-slate-400/20 rounded w-1/2" />
                <div className="pt-6 space-y-2">
                  <div className="h-10 bg-slate-400/10 rounded w-full" />
                  <div className="h-10 bg-slate-400/10 rounded w-full" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-all ${
                  theme === "dark"
                    ? "border-[#1F2937]/50 bg-[#0B0F19]"
                    : "border-[#e7e2da] bg-[#FBF9F4]"
                }`}
                id="active-release-card"
              >
                {/* Decorative mesh */}
                <span className="absolute -top-10 -right-10 h-28 w-28 bg-teal-500/10 rounded-full blur-xl" />

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-600/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                    {activeT.releases.latestAlpha}
                  </span>
                  <span className="text-xs text-[#1C1917]/50 dark:text-white/50 font-mono">
                    {formatLocalizedDate(activeRelease?.published_at || "", lang)}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-[#1C1917] dark:text-white">
                  {activeRelease?.tag_name || "Bilinmiyor"}
                </h3>
                <p className="mt-1 text-xs text-[#1C1917]/60 dark:text-[#F4F4F5]/60 font-mono">
                  {activeRelease?.name || "İlk Stabil İndirme"}
                </p>

                {/* Download Executable installer buttons mapping */}
                <div className="mt-7 space-y-2.5" id="release-assets-download-list">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]/50 dark:text-white/40 font-sans mb-3">
                    {activeT.releases.binaryTitle}
                  </div>

                  {activeRelease?.assets && activeRelease.assets.length > 0 ? (
                    activeRelease.assets.map((asset) => {
                      const fileExt = asset.name.split(".").pop()?.toUpperCase() || "BIN";
                      return (
                        <button
                          key={asset.id}
                          id={`direct-asset-dl-${asset.id}`}
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setIsDownloadOpen(true);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                            theme === "dark"
                              ? "border-[#1F2937] bg-black/20 hover:bg-neutral-900 hover:border-teal-400/30"
                              : "border-[#e7e2da] bg-white/50 hover:bg-white hover:border-teal-600/30"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg select-none">{getOSIconForAsset(asset.name)}</span>
                            <div>
                              <div className="text-xs font-bold text-[#1C1917] dark:text-white">
                                {asset.name}
                              </div>
                              <div className="text-[10px] text-[#1C1917]/50 dark:text-white/50 font-sans">
                                {fileExt} {lang === "tr" ? "Formatında Paket" : "Format Package"} ({formatBytes(asset.size)})
                              </div>
                            </div>
                          </div>
                          <Download className="h-4 w-4 text-[#1C1917]/40 dark:text-white/40 hover:text-teal-500 animate-pulse" />
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 bg-[#e7e2da]/15 dark:bg-slate-800/10 rounded-2xl">
                      <a
                        href={activeRelease?.html_url || "https://github.com/VastSea0/hilal-browser/releases"}
                        target="_blank"
                        className="text-xs font-semibold text-teal-600 dark:text-teal-400 underline hover:no-underline font-sans"
                      >
                        {activeT.releases.allReleasesLink}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Release card Right: changelog notes */}
          <div className="lg:col-span-7">
            {loading ? (
              // Changelog notes skeleton
              <div className="p-6 md:p-8 space-y-3.5 border border-slate-700/25 bg-slate-800/10 rounded-3xl animate-pulse">
                <div className="h-6 bg-slate-400/20 rounded w-1/4" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-slate-400/10 rounded w-full" />
                  <div className="h-4 bg-slate-400/10 rounded w-11/12" />
                  <div className="h-4 bg-slate-400/10 rounded w-4/5" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 md:p-8 rounded-3xl border transition-all ${
                  theme === "dark"
                    ? "border-[#1F2937]/50 bg-[#0B0F19]/40"
                    : "border-[#e7e2da] bg-[#FBF9F4]/40"
                }`}
                id="changelog-details-box"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 mb-4 uppercase">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>{activeT.releases.changelogTitle}</span>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none text-left font-sans">
                  {activeRelease?.body ? (
                    <div className="space-y-4">
                      {parseChangelogToSimpleLines(activeRelease.body).map((line, idx) => {
                        if (line.type === "header") {
                          return (
                            <h4
                              key={idx}
                              className="font-serif text-base font-semibold text-[#1C1917] dark:text-white border-b border-[#e7e2da]/30 pb-1 mt-5 dark:border-slate-800/30"
                            >
                              {line.text}
                            </h4>
                          );
                        } else if (line.type === "item") {
                          return (
                            <div key={idx} className="flex gap-2 text-xs md:text-sm text-[#1C1917]/80 dark:text-white/85 select-text">
                              <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">•</span>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: line.text
                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold parsing
                                    .replace(/`(.*?)`/g, "<code class='font-mono bg-stone-200 dark:bg-slate-800 px-1 py-0.5 rounded text-teal-600 dark:text-teal-300'>$1</code>") // inline code parsing
                                }}
                              />
                            </div>
                          );
                        } else {
                          return (
                            <p
                              key={idx}
                              className="text-xs md:text-sm text-[#1C1917]/70 dark:text-[#E2E8F0]/70 select-text font-serif italic"
                              dangerouslySetInnerHTML={{
                                  __html: line.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              }}
                            />
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-xs italic text-[#1C1917]/50 dark:text-white/50 text-center py-6">
                      {activeT.releases.fallbackChangelog}
                    </p>
                  )}
                </div>

                {/* Source link footer inside card */}
                <div className="mt-8 pt-4 border-t border-[#e7e2da]/30 dark:border-[#1F2937]/30 flex flex-wrap gap-4 items-center justify-between font-sans">
                  <a
                    href="https://github.com/VastSea0/hilal-browser/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#1C1917]/60 hover:text-teal-600 dark:text-[#F4F4F5]/60 dark:hover:text-teal-400 flex items-center gap-1.5 transition-colors"
                  >
                    {activeT.releases.bugReport}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://discord.gg/JZJ4tmPHFw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#1C1917]/60 hover:text-teal-600 dark:text-[#F4F4F5]/60 dark:hover:text-teal-400 flex items-center gap-1.5 transition-colors"
                  >
                    Discord Chat
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://github.com/VastSea0/hilal-browser/commits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#1C1917]/60 hover:text-teal-600 dark:text-[#F4F4F5]/60 dark:hover:text-teal-400 flex items-center gap-1.5 transition-colors"
                  >
                    {activeT.releases.commits}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Privacy & Open Source Core Values (Bento Grid) */}
      <section className="mx-auto max-w-5xl px-6 py-12" id="vizyon">
        <div className="text-center mb-12 font-sans">
          <span className="text-xs font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
            {activeT.principles.tag}
          </span>
          <h2 className="mt-2.5 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-[#1C1917] dark:text-white">
            {activeT.principles.title}
          </h2>
        </div>

        {/* 2 Spacious Cards Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="core-values-bento">
          {/* Card left: Yüzde Yüz Şeffaflık */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 md:p-10 rounded-3xl border text-left relative overflow-hidden flex flex-col justify-between h-80 transition-all ${
              theme === "dark"
                ? "border-[#1F2937]/40 bg-[#0B0F19]"
                : "border-[#e7e2da] bg-[#FBF9F4]"
            }`}
          >
            {/* Ambient gold background dot */}
            <span className="absolute -bottom-12 -left-12 h-36 w-36 bg-amber-500/10 rounded-full blur-2xl" />

            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                <CodeXml className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1C1917] dark:text-white">
                {activeT.principles.card1Title}
              </h3>
              <p className="mt-4 text-xs md:text-sm leading-relaxed text-[#1C1917]/70 dark:text-[#F4F4F5]/70">
                {activeT.principles.card1Desc}
              </p>
            </div>
            
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 underline hover:no-underline dark:text-amber-400 font-sans"
            >
              {activeT.principles.card1Link}
              <ArrowRight className="h-3 w-3" />
            </a>
          </motion.div>

          {/* Card right: Veri Gizliliği */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-8 md:p-10 rounded-3xl border text-left relative overflow-hidden flex flex-col justify-between h-80 transition-all ${
              theme === "dark"
                ? "border-[#1F2937]/40 bg-[#0B0F19]"
                : "border-[#e7e2da] bg-[#FBF9F4]"
            }`}
          >
            {/* Ambient teal background dot */}
            <span className="absolute -bottom-12 -right-12 h-36 w-36 bg-teal-500/15 rounded-full blur-2xl" />

            <div>
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1C1917] dark:text-white">
                {activeT.principles.card2Title}
              </h3>
              <p className="mt-4 text-xs md:text-sm leading-relaxed text-[#1C1917]/70 dark:text-[#F4F4F5]/70">
                {activeT.principles.card2Desc}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold font-mono">
              <BookmarkCheck className="h-3.5 w-3.5" />
              <span>{activeT.principles.card2Foot}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ Accordion (Akla Takılanlar) */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24" id="faq-section">
        <div className="text-center mb-12 font-sans">
          <span className="text-xs font-bold tracking-widest text-[#14b8a6] uppercase">
            {activeT.faq.tag}
          </span>
          <h2 className="mt-2.5 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-[#1C1917] dark:text-white">
            {activeT.faq.title}
          </h2>
        </div>

        <div className="space-y-4" id="faq-accordion-group">
          {faqList.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className={`rounded-2xl border transition-colors ${
                  theme === "dark"
                    ? "border-[#1F2937]/50 bg-[#0B0F19]/60 hover:border-[#1F2937]"
                    : "border-[#e7e2da] bg-[#FBF9F4] hover:bg-white"
                }`}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-sans text-sm md:text-base font-semibold text-[#1C1917] dark:text-white select-none transition-colors"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4.5 w-4.5 text-[#1C1917]/50 dark:text-white/50" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-3 text-xs md:text-sm leading-relaxed text-[#1C1917]/75 dark:text-[#E2E8F0]/80 border-t border-[#e7e2da]/40 dark:border-[#1F2937]/40 font-sans">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer
        className={`border-t transition-colors ${
          theme === "dark" ? "border-[#1F2937]/40 bg-[#080B10]" : "border-[#e7e2da]/70 bg-[#FAF8F5]"
        }`}
        id="app-footer"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#e7e2da]/30 dark:border-[#1F2937]/30 pb-10">
            {/* Branding left */}
            <div className="flex items-center gap-3 select-none">
              <img
                src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/branding/hilal/default128.png"
                alt="Hilal Logo"
                className="h-7 w-7"
                referrerPolicy="no-referrer"
              />
              <span className="font-sans text-base font-bold text-[#1C1917] dark:text-white">
                hilal <span className="text-teal-600 dark:text-teal-400 font-light">browser</span>
              </span>
            </div>

            {/* Quote signature center */}
            <p className="font-serif italic text-sm text-[#1C1917]/60 dark:text-[#F4F4F5]/60 text-center select-text">
              {activeT.footer.quote}
            </p>

            {/* Quick links right */}
            <div className="flex items-center gap-5">
              <a
                href="https://github.com/VastSea0/hilal-browser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1C1917]/60 hover:text-teal-600 dark:text-[#F4F4F5]/60 dark:hover:text-teal-400 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/JZJ4tmPHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1C1917]/60 hover:text-teal-600 dark:text-[#F4F4F5]/60 dark:hover:text-teal-400 transition-colors flex items-center"
                aria-label="Discord Server"
              >
                <SiDiscord className="h-5 w-5" />
              </a>
              <button
                id="footer-download-btn"
                onClick={() => setIsDownloadOpen(true)}
                className="text-xs font-semibold px-4.5 py-1.5 rounded-full border border-teal-600/20 bg-teal-500/5 text-teal-700 hover:bg-teal-500/10 dark:border-teal-400/20 dark:bg-teal-400/5 dark:text-teal-400 transition-colors font-sans"
              >
                {activeT.footer.install}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <p className="text-xs text-[#1C1917]/40 dark:text-white/40 font-mono select-text">
              &copy; {new Date().getFullYear()} {activeT.footer.copyright}
            </p>
            <p className="text-xs text-[#1C1917]/40 dark:text-white/40 font-mono select-text">
              {activeT.footer.license}
            </p>
          </div>
        </div>
      </footer>

      {/* Download Progress / Operating System Selector Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => {
          setIsDownloadOpen(false);
          setSelectedAssetId(null);
        }}
        release={activeRelease}
        lang={lang}
        initialAssetId={selectedAssetId}
      />
    </div>
  );
}
