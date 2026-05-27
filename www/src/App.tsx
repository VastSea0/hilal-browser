import React, { useState, useEffect, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
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
  Sparkle,
  BookmarkCheck,
  CodeXml,
  Lock,
  ArrowRight,
  ListRestart
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

import { GithubRelease } from "./types";
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
  // Page view state: "home" or "releases" (dedicated release archives page)
  const [view, setView] = useState<"home" | "releases">("home");

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
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
  const [releases, setReleases] = useState<GithubRelease[]>([]);
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

  // Active navigation highlight
  const [activeSection, setActiveSection] = useState<string>("home");

  // Image comparison slider state and handlers
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isSliderDragging, setIsSliderDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleSliderMouseDown = (e: ReactMouseEvent) => {
    setIsSliderDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleSliderTouchStart = (e: ReactTouchEvent) => {
    setIsSliderDragging(true);
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isSliderDragging) handleSliderMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isSliderDragging && e.touches.length > 0) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    const onMouseUp = () => {
      setIsSliderDragging(false);
    };

    if (isSliderDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [isSliderDragging]);

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("hilal-theme", theme);
  }, [theme]);

  // Sync language selection
  useEffect(() => {
    localStorage.setItem("hilal-lang", lang);
  }, [lang]);

  // Fetch Releases
  useEffect(() => {
    const loadReleaseData = async () => {
      try {
        setLoading(true);
        const releases = await fetchGithubReleases();
        if (releases && releases.length > 0) {
          setReleases(releases);
          setRelease(releases[0]);
          setIsApiFallback(false);
        } else {
          setReleases([]);
          setIsApiFallback(true);
        }
      } catch (err) {
        setReleases([]);
        setIsApiFallback(true);
      } finally {
        setLoading(false);
      }
    };
    loadReleaseData();
  }, []);

  // Monitor Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (view !== "home") {
        setActiveSection("surumler");
        return;
      }
      const scrollPos = window.scrollY + 180;
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
  }, [view]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const getOSIconForAsset = (name: string) => {
    const n = name.toLowerCase();
    if (n.endsWith(".exe")) return "WIN";
    if (n.endsWith(".dmg")) return "MAC";
    if (n.endsWith(".deb") || n.endsWith(".appimage")) return "LNX";
    return "BIN";
  };

  // Translations Setup
  const tr = {
    nav: {
      features: "Özellikler",
      interface: "Arayüz",
      releases: "Sürümler",
      vision: "İlkeler",
      installBtn: "Alpha İndir"
    },
    hero: {
      alphaBadge: "Hilal Browser Alpha Aşamasındadır",
      title1: "İnternette",
      title2: "özgürlüğün",
      title3: "ve",
      title4: "sadeliğin",
      title5: "yeni boyutu.",
      desc: "Firefox (Gecko) motorunun sağlamlığı ve varsayılan dahili uBlock Origin kalkanıyla geliştirilen Hilal Browser; karmaşadan uzak, geniş dikey sekmelerle donatılmış sakin bir internet deneyimi sunar.",
      downloadBtn: "Alpha Sürümünü İndir",
      sourceBtn: "Kaynak Kodu İncele"
    },
    preview: {
      title: "// ARAYÜZ TASARIMI",
      sub: "Gecko motorunun minimal bütünlüğü"
    },
    features: {
      tag: "ÖZELLİKLER",
      title: "Gereksiz her şeyden arınmış bir pencere.",
      desc: "Sadece bir internet tarayıcısı değil; odaklanma ve şeffaflık ilkeleri etrafında kurgulanmış sade bir çalışma alanı.",
      card1Title: "Firefox (Gecko) Altyapısı",
      card1Desc: "Hilal Browser, kararlılık ve bellek yönetimiyle bilinen bağımsız Firefox motorunu kullanır. Firefox eklenti mağazasıyla tam uyumluluk sunar.",
      card1Foot: "Bağımsız Motor",
      card2Title: "Dahili uBlock Origin Kalkanı",
      card2Desc: "Reklamlar, çerez pencereleri ve görünmez analitik takip kodları engellenir. Web sayfaları gereksiz şişkinlikten arınarak hızlıca açılır.",
      card2Foot: "Yerleşik Kalkan",
      card3Title: "Yenilikçi Dikey Sekmeler",
      card3Desc: "Yatay sekmelerin sıkışıklığı yerine sol kenarda dikey listeleme. Dikey rıhtım alan kazanmak için daraltılabilir veya genişletilebilir.",
      card3Foot: "Maksimum Görüş Alanı"
    },
    releases: {
      tag: "SÜRÜMLER",
      title: "Aktif Sürümler ve Değişiklik Günlüğü",
      fallbackNotice: "GitHub API limitleri nedeniyle lokal önbellek verileri sunulmaktadır.",
      latestAlpha: "GÜNCEL YAYIN",
      binaryTitle: "Kurulum Paketleri",
      allReleasesLink: "Tüm sürümleri GitHub üzerinde listele",
      changelogTitle: "DEĞİŞİKLİK NOTLARI",
      timelineTitle: "Sürüm Tarihçesi",
      timelineSubtitle: "GitHub Releases akışından anlık sürüm notları ve platform detayları.",
      buildTypes: "Desteklenen formatlar",
      noBuildAssets: "Yayın paketi bulunamadı",
      currentBuild: "Aktif",
      viewRelease: "GitHub'da İncele",
      fallbackChangelog: "Sürüm detayları şu an yüklenemedi. Ayrıntılar için lütfen resmi GitHub sayfamızı kontrol edin.",
      bugReport: "Geri Bildirim Bildir",
      commits: "Commit Geçmişi"
    },
    principles: {
      tag: "SARSILMAZ İLKELER",
      title: "Sakin, Bağımsız ve Kullanıcı Egemen",
      card1Title: "%100 Açık Kaynak & Şeffaflık",
      card1Desc: "Hilal Browser'da hiçbir gizli veri toplama mekanizması barındırılmaz. Geliştirme süreci tamamen şeffaf ve denetlenebilir şekilde GitHub'dadır.",
      card1Link: "GitHub deposunu ziyaret et",
      card2Title: "Sıfır Profilleme & Yerel Gizlilik",
      card2Desc: "Arama geçmişiniz, parolalarınız veya gezindiğiniz siteler hiçbir sunucuya ulaştırılmaz. Hilal yerel kum havuzunda, izleyicileri tam güçle engelleyerek çalışır.",
      card2Foot: "İZLEME ENGELLEME AKTİF"
    },
    faq: {
      tag: "S.S.S.",
      title: "Sıkça Sorulan Sorular"
    },
    footer: {
      quote: "İnternetin daha özgür, sakin ve sade yüzü.",
      install: "İndir",
      copyright: "Hilal Browser projesi. Bir Firefox (Gecko) katmanıdır.",
      license: "MPL 2.0 Özgür Yazılım Lisansı ile koruma altındadır."
    }
  };

  const en = {
    nav: {
      features: "Features",
      interface: "Interface",
      releases: "Releases",
      vision: "Principles",
      installBtn: "Download Alpha"
    },
    hero: {
      alphaBadge: "Hilal Browser is in Alpha Phase",
      title1: "Meet the new",
      title2: "freedom",
      title3: "and",
      title4: "simplicity",
      title5: "era of the web.",
      desc: "Built on top of the robust, secure Firefox (Gecko) engine and pre-packaged with uBlock Origin. A peaceful web experience equipped with collapsible vertical tabs and completely free from visual clutter.",
      downloadBtn: "Download Alpha Build",
      sourceBtn: "Inspect Source Code"
    },
    preview: {
      title: "// INTERFACE LAYOUT",
      sub: "The serene harmony of the Gecko engine"
    },
    features: {
      tag: "FEATURES",
      title: "A clear view, stripped of noise.",
      desc: "Not just another web client; a calm digital environment designed strictly around clarity, focus, and transparency.",
      card1Title: "Firefox (Gecko) Core",
      card1Desc: "Hilal Browser inherits its core strength from the independent Firefox web engine. Complete compatibility with the massive Firefox add-on store.",
      card1Foot: "Independent Core",
      card2Title: "Built-in uBlock Origin",
      card2Desc: "Intrusive ads, cookie consent prompts, and analytic trackers are blocked. Pages load instantly without annoying data overhead.",
      card2Foot: "Integrated Shield",
      card3Title: "Sleek Vertical Tabs",
      card3Desc: "Ditch horizontal tab clutter for an elegant collapsible vertical sidebar. Showcases readable tab names with hierarchical ordering.",
      card3Foot: "Reclaimed Breathing Space"
    },
    releases: {
      tag: "RELEASES",
      title: "Active Builds and System Changelog",
      fallbackNotice: "Serving cached data due to GitHub API rate limits.",
      latestAlpha: "LATEST BUILD",
      binaryTitle: "Installation Packages",
      allReleasesLink: "View all releases on GitHub",
      changelogTitle: "CHANGELOG DETAILS",
      timelineTitle: "Release History",
      timelineSubtitle: "Live version updates, build targets, and summary notes pulled from GitHub.",
      buildTypes: "Supported formats",
      noBuildAssets: "No build artifacts",
      currentBuild: "Active",
      viewRelease: "Inspect on GitHub",
      fallbackChangelog: "Release details could not be loaded. Please refer to the official GitHub releases for detailed specs.",
      bugReport: "Submit Feedback",
      commits: "Commit History"
    },
    principles: {
      tag: "CORE PRINCIPLES",
      title: "A Calm and Sovereigntist Web Stance",
      card1Title: "100% Open Source & Auditable",
      card1Desc: "Not a single line of Hilal contains hidden user telemetry. All development happens transparently in public view on GitHub.",
      card1Link: "Browse source on GitHub",
      card2Title: "Zero Profiling & Native Privacy",
      card2Desc: "Your history, credentials, or search records are never sent online. Hilal runs strictly in your local sandbox, blocking persistent trackers.",
      card2Foot: "ANTI-TRACKING ENFORCED"
    },
    faq: {
      tag: "F.A.Q.",
      title: "Frequently Asked Questions"
    },
    footer: {
      quote: "A calmer, simpler, and freer phase of the web.",
      install: "Download",
      copyright: "Hilal Browser project. A Firefox (Gecko) overlay.",
      license: "Protected under the MPL 2.0 Free Software License."
    }
  };

  const activeT = lang === "en" ? en : tr;

  // FAQ Accordion Data
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
        a: "Evet! Hilal Browser, küresel Firefox Eklentiler (AMO) deposuyla tamamen uyumludur. Sevdiğiniz tüm Firefox eklentilerini doğrudan yükleyebilirsiniz. Ayrıca reklam ve zararlı yazılım izleyici engellemede altın standart olan uBlock Origin eklentisi varsayılan kurulumda gömülü olarak gelir."
      },
      {
        q: "Dikey sekmeler (Vertical Tabs) nasıl optimize edildi?",
        a: "Geleneksel yatay sekmeler geniş ekranlı modern bilgisayarlarda hem görüş alanını daraltır hem de sekme başlıklarını okunamaz kılar. Hilal, sekmelerinizi sol kenarlıkta net isimlerle listeler. Dikey rıhtım alan kazanmak için daraltılabilir, böylece web sayfalarına maksimum nefes alma alanı sunulur."
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
        a: "Yes! Hilal Browser is fully compatible with the global Firefox Add-ons (AMO) library. You can immediately install all your favorite plugins. On top of that, uBlock Origin — the undisputed champion of ad-blocking and privacy filtering — comes integrated by default."
      },
      {
        q: "How are the Vertical Tabs designed and optimized?",
        a: "Traditional horizontal tabs restrict vertical reading space on modern widescreen displays and quickly become unreadable. Hilal reorganizes tabs in a clean vertical dock along the left edge. The side dock is completely collapsible, affording web documents maximum focus and reading space."
      }
    ]
  };

  const faqList = faqs[lang] || faqs.tr;

  const activeRelease = isApiFallback || !release
    ? (lang === "en" ? FALLBACK_RELEASE_EN : FALLBACK_RELEASE_TR)
    : release;

  const recommendedAsset = activeRelease?.assets
    ? getRecommendedAsset(activeRelease.assets, detectedOS as any)
    : null;

  // Render ALL fetched releases inside the dedicated archive sub-page
  const allReleasesTimeline = isApiFallback || releases.length === 0
    ? [activeRelease]
    : releases;

  const getBuildTypeForAsset = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".mar")) return "Update";
    if (lower.endsWith(".dmg")) return "macOS DMG";
    if (lower.endsWith(".exe")) return "Windows";
    if (lower.endsWith(".deb")) return "Linux DEB";
    if (lower.endsWith(".appimage")) return "Linux AppImage";
    return "Binary";
  };

  const getBuildTypesForRelease = (item: GithubRelease) => {
    const types = new Set<string>();
    for (const asset of item.assets || []) {
      types.add(getBuildTypeForAsset(asset.name));
    }
    return Array.from(types);
  };

  const getReleaseSummaryLines = (body: string) => {
    return parseChangelogToSimpleLines(body)
      .filter(line => line.type === "item" || line.type === "text")
      .slice(0, 3);
  };

  const getDynamicDownloadBtnText = () => {
    if (lang === "tr") {
      switch (detectedOS) {
        case "windows": return "Windows İndir";
        case "macos": return "macOS İndir";
        case "linux": return "Linux İndir";
        default: return "Alpha İndir";
      }
    } else {
      switch (detectedOS) {
        case "windows": return "Download for Windows";
        case "macos": return "Download for macOS";
        case "linux": return "Download for Linux";
        default: return "Download Alpha";
      }
    }
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased selection:bg-neutral-850 selection:text-white transition-colors duration-500 ${
        theme === "dark" ? "bg-[#050505] text-[#D4D4D4]" : "bg-[#FAF9F6] text-[#262626]"
      }`}
      id="root-container"
    >
      {/* 1. Sticky Navigation Bar */}
      <nav
        className="sticky top-0 z-40 w-full border-b border-neutral-200/30 dark:border-neutral-900/30 glass-panel"
        id="navbar-sticky"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => {
              setView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            id="brand-logo-container"
          >
            <img
              src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/branding/hilal/default128.png"
              alt="Hilal Browser Logo"
              className="h-6.5 w-6.5 opacity-90 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-neutral-900 dark:text-neutral-100">
              hilal <span className="text-neutral-400 dark:text-neutral-500 font-light">browser</span>
            </span>
          </div>

          {/* Nav Center Links */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-semibold tracking-wider uppercase">
            {[
              { label: activeT.nav.features, id: "ozellikler" },
              { label: activeT.nav.interface, id: "arayuz" },
              { label: activeT.nav.releases, id: "surumler" },
              { label: activeT.nav.vision, id: "vizyon" }
            ].map((item) => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => {
                  if (item.id === "surumler") {
                    setView("releases");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    setView("home");
                    setTimeout(() => scrollToId(item.id), 50);
                  }
                }}
                className={`transition-colors relative py-1 hover:text-neutral-900 dark:hover:text-white ${
                  activeSection === item.id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 h-0.5 w-full bg-neutral-900 dark:bg-neutral-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <button
              id="language-switcher"
              onClick={() => setLang(prev => (prev === "tr" ? "en" : "tr"))}
              className="px-2.5 py-1 text-[10px] font-semibold tracking-widest rounded-md border border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 dark:border-neutral-800/60 dark:hover:bg-neutral-900 dark:text-neutral-400 transition-colors"
              title={lang === "tr" ? "Switch to English" : "Türkçe"}
            >
              {lang === "tr" ? "EN" : "TR"}
            </button>

            {/* Theme Switcher */}
            <button
              id="theme-toggler"
              onClick={toggleTheme}
              className="rounded-md p-1.5 border border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 dark:border-neutral-800/60 dark:hover:bg-neutral-900 dark:text-neutral-400 transition-colors"
              aria-label="Theme switcher"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Discord Link */}
            <a
              href="https://discord.gg/JZJ4tmPHFw"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-1.5 border border-neutral-200/50 hover:bg-neutral-100 text-neutral-600 dark:border-neutral-800/60 dark:hover:bg-neutral-900 dark:text-neutral-400 transition-colors flex items-center justify-center"
              aria-label="Discord Server"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center">
                <SiDiscord />
              </span>
            </a>

            {/* Minimalist Install CTA */}
            <button
              id="nav-download-button"
              onClick={() => setIsDownloadOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-white hover:opacity-90 dark:bg-white dark:text-neutral-950 transition-opacity"
            >
              <Download className="h-3 w-3" />
              {activeT.footer.install}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container Switcher */}
      <AnimatePresence mode="wait">
        {view === "home" ? (
          // Landing Page View
          <motion.div
            key="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 md:pt-28 text-center" id="hero">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 bg-neutral-50 px-3.5 py-1 text-[9px] font-medium tracking-widest uppercase text-neutral-500 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                {activeT.hero.alphaBadge}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="mt-6 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] text-neutral-950 dark:text-white"
              >
                {lang === "tr" ? (
                  <>
                    İnternette{" "}
                    <span className="font-serif italic font-light text-neutral-600 dark:text-neutral-400">
                      özgürlüğün
                    </span>{" "}
                    ve{" "}
                    <span className="font-serif italic font-light text-neutral-600 dark:text-neutral-400">
                      sadeliğin
                    </span>{" "}
                    <div className="mt-1 font-serif italic font-light">yeni boyutu.</div>
                  </>
                ) : (
                  <>
                    {activeT.hero.title1}{" "}
                    <span className="font-serif italic font-light text-neutral-600 dark:text-neutral-400">
                      {activeT.hero.title2}
                    </span>{" "}
                    {activeT.hero.title3}{" "}
                    <span className="font-serif italic font-light text-neutral-600 dark:text-neutral-400">
                      {activeT.hero.title4}
                    </span>{" "}
                    <div className="mt-1 font-serif italic font-light">
                      {activeT.hero.title5}
                    </div>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="mx-auto mt-6 max-w-xl text-xs md:text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
              >
                {activeT.hero.desc}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-col items-center justify-center"
                id="hero-cta-outer-container"
              >
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    id="hero-download-btn"
                    onClick={() => setIsDownloadOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-neutral-950 px-6.5 py-3.5 text-[10px] font-bold tracking-widest uppercase text-white hover:opacity-90 dark:bg-white dark:text-neutral-950 transition-opacity"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {getDynamicDownloadBtnText()}
                  </button>
                  <a
                    href="https://github.com/VastSea0/hilal-browser"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="hero-github-btn"
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-200 hover:bg-neutral-50 px-6.5 py-3.5 text-[10px] font-bold tracking-widest uppercase text-neutral-900 dark:border-neutral-900 dark:text-white dark:hover:bg-neutral-950 transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    {activeT.hero.sourceBtn}
                  </a>
                </div>

                {recommendedAsset && (
                  <p className="mt-3.5 text-[9px] font-mono text-neutral-400 dark:text-neutral-500" id="hero-detected-os-subtitle">
                    {lang === "tr" ? "Sisteminiz için belirlenen paket:" : "Identified for your system:"}{" "}
                    <span className="font-semibold text-neutral-600 dark:text-neutral-300">{recommendedAsset.name}</span>{" "}
                    ({formatBytes(recommendedAsset.size)})
                  </p>
                )}
              </motion.div>
            </section>

            {/* 3. Welcome Home Interactive Preview (Borderless Overhaul) */}
            <section className="mx-auto max-w-4xl px-6 py-12 md:py-16" id="arayuz">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative"
              >
                {/* Completely BORDERLESS visual slider wrapper */}
                <div
                  id="browser-preview-container"
                  ref={sliderRef}
                  className="relative select-none overflow-hidden rounded-xl shadow-lg cursor-ew-resize bg-neutral-100 dark:bg-neutral-950"
                  onMouseDown={handleSliderMouseDown}
                  onTouchStart={handleSliderTouchStart}
                >
                  <img
                    src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/prefs/browser/base/content/hilal/welcome-home-preview-black.png"
                    alt="Dark Preview"
                    className="w-full h-auto select-none pointer-events-none block"
                    referrerPolicy="no-referrer"
                  />

                  <div
                    className="absolute inset-0 pointer-events-none overflow-hidden z-10"
                    style={{
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                    }}
                  >
                    <img
                      src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/prefs/browser/base/content/hilal/welcome-home-preview.png"
                      alt="Light Preview"
                      className="w-full h-auto select-none pointer-events-none block"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-neutral-300 dark:bg-neutral-700 z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  />

                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 z-30 shadow-md flex items-center justify-center cursor-ew-resize text-neutral-400 select-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <span className="text-[10px] font-bold tracking-tighter">&lt;&gt;</span>
                  </div>

                  <div className="absolute bottom-3 left-3 z-20 px-2.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider rounded bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-neutral-100 select-none uppercase shadow-sm">
                    {lang === "tr" ? "Aydınlık" : "Light"}
                  </div>
                  <div className="absolute bottom-3 right-3 z-20 px-2.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider rounded bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-neutral-100 select-none uppercase shadow-sm">
                    {lang === "tr" ? "Karanlık" : "Dark"}
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center px-1">
                  <span className="font-mono text-[9px] tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                    {activeT.preview.title}
                  </span>
                  <span className="hidden sm:inline-block font-sans text-[10px] text-neutral-400 dark:text-neutral-500 font-medium italic">
                    {activeT.preview.sub}
                  </span>
                </div>
              </motion.div>
            </section>

            {/* 4. Feature Highlights */}
            <section className="mx-auto max-w-5xl px-6 py-12 border-t border-neutral-200/30 dark:border-neutral-900/30" id="ozellikler">
              <div className="text-center mb-16">
                <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase block">
                  {activeT.features.tag}
                </span>
                <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl text-neutral-900 dark:text-white">
                  {activeT.features.title}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
                  {activeT.features.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200/50 dark:divide-neutral-900/50" id="features-highlights-grid">
                <div className="py-6 md:py-0 md:px-8 first:pl-0 last:pr-0 text-left">
                  <span className="font-serif italic font-light text-2xl text-neutral-300 dark:text-neutral-700 block mb-3">01</span>
                  <h3 className="font-sans text-xs font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
                    {activeT.features.card1Title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {activeT.features.card1Desc}
                  </p>
                  <span className="mt-4 inline-block text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-semibold">
                    {activeT.features.card1Foot}
                  </span>
                </div>

                <div className="py-6 md:py-0 md:px-8 first:pl-0 last:pr-0 text-left">
                  <span className="font-serif italic font-light text-2xl text-neutral-300 dark:text-neutral-700 block mb-3">02</span>
                  <h3 className="font-sans text-xs font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
                    {activeT.features.card2Title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {activeT.features.card2Desc}
                  </p>
                  <span className="mt-4 inline-block text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-semibold">
                    {activeT.features.card2Foot}
                  </span>
                </div>

                <div className="py-6 md:py-0 md:px-8 first:pl-0 last:pr-0 text-left">
                  <span className="font-serif italic font-light text-2xl text-neutral-300 dark:text-neutral-700 block mb-3">03</span>
                  <h3 className="font-sans text-xs font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
                    {activeT.features.card3Title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {activeT.features.card3Desc}
                  </p>
                  <span className="mt-4 inline-block text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-semibold">
                    {activeT.features.card3Foot}
                  </span>
                </div>
              </div>
            </section>

            {/* 5. Dynamic GitHub Releases & Changelog Section */}
            <section className="mx-auto max-w-5xl px-6 py-12 md:py-16 border-t border-neutral-200/30 dark:border-neutral-900/30" id="surumler">
              <div className="text-center mb-10">
                <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase block">
                  {activeT.releases.tag}
                </span>
                <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl text-neutral-900 dark:text-white">
                  {activeT.releases.title}
                </h2>
                {isApiFallback && (
                  <p className="mt-2 text-[9px] font-mono text-neutral-400 bg-neutral-100 py-1 px-3 inline-block rounded dark:bg-neutral-950 dark:text-neutral-500">
                    {activeT.releases.fallbackNotice}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  {loading ? (
                    <div className="p-6 rounded-md border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/20 animate-pulse space-y-3">
                      <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
                      <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-md border border-neutral-200 dark:border-neutral-900 bg-neutral-50/20 dark:bg-neutral-950/20"
                      id="active-release-card"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-900/50 pb-3">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 font-mono text-[9px] font-bold tracking-widest uppercase">
                          {activeT.releases.latestAlpha}
                        </span>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono">
                          {formatLocalizedDate(activeRelease?.published_at || "", lang)}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="font-sans text-sm font-bold tracking-wider text-neutral-900 dark:text-white">
                          {activeRelease?.tag_name || "Unknown"}
                        </h3>
                        <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                          {activeRelease?.name || "Initial Alpha Release"}
                        </p>
                      </div>

                      <div className="mt-6" id="release-assets-download-list">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-3.5">
                          {activeT.releases.binaryTitle}
                        </div>

                        <div className="divide-y divide-neutral-200/50 dark:divide-neutral-900/50">
                          {activeRelease?.assets && activeRelease.assets.length > 0 ? (
                            activeRelease.assets.map((asset) => (
                              <button
                                key={asset.id}
                                id={`direct-asset-dl-${asset.id}`}
                                onClick={() => {
                                  setSelectedAssetId(asset.id);
                                  setIsDownloadOpen(true);
                                }}
                                className="w-full flex items-center justify-between py-3 text-left hover:text-neutral-900 dark:hover:text-white transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[9px] tracking-wider text-neutral-400 dark:text-neutral-500 font-bold border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
                                    {getOSIconForAsset(asset.name)}
                                  </span>
                                  <div className="truncate max-w-[180px]">
                                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                                      {asset.name}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                                  {formatBytes(asset.size)}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <a
                                href={activeRelease?.html_url || "https://github.com/VastSea0/hilal-browser/releases"}
                                target="_blank"
                                className="text-[10px] font-semibold text-neutral-400 hover:text-neutral-600 underline font-mono"
                              >
                                {activeT.releases.allReleasesLink}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="lg:col-span-7">
                  {loading ? (
                    <div className="p-6 space-y-3 border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/20 rounded-md animate-pulse">
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
                      <div className="space-y-1.5 pt-3">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-11/12" />
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-md border border-neutral-200 dark:border-neutral-900 bg-neutral-50/10 dark:bg-neutral-950/10"
                      id="changelog-details-box"
                    >
                      <div className="flex items-center gap-2 text-[9px] font-mono font-bold tracking-widest text-neutral-400 dark:text-neutral-500 mb-4 uppercase">
                        <Terminal className="h-3 w-3" />
                        <span>{activeT.releases.changelogTitle}</span>
                      </div>

                      <div className="prose prose-sm dark:prose-invert max-w-none text-left font-sans select-text">
                        {activeRelease?.body ? (
                          <div className="space-y-3.5">
                            {parseChangelogToSimpleLines(activeRelease.body).map((line, idx) => {
                              if (line.type === "header") {
                                return (
                                  <h4
                                    key={idx}
                                    className="font-sans text-xs font-bold tracking-wider text-neutral-900 dark:text-neutral-100 border-b border-neutral-200/50 dark:border-neutral-900/50 pb-1 mt-4 first:mt-0"
                                  >
                                    {line.text}
                                  </h4>
                                );
                              } else if (line.type === "item") {
                                return (
                                  <div key={idx} className="flex gap-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                    <span className="text-neutral-400 dark:text-neutral-600 shrink-0">—</span>
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: line.text
                                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                          .replace(/`(.*?)`/g, "<code class='font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-400'>$1</code>")
                                      }}
                                    />
                                  </div>
                                );
                              } else {
                                return (
                                  <p
                                    key={idx}
                                    className="text-xs text-neutral-400 dark:text-neutral-500 italic"
                                    dangerouslySetInnerHTML={{
                                        __html: line.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                    }}
                                  />
                                );
                              }
                            })}
                          </div>
                        ) : (
                          <p className="text-xs italic text-neutral-400 dark:text-neutral-500 text-center py-6">
                            {activeT.releases.fallbackChangelog}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 pt-4 border-t border-neutral-200/50 dark:border-neutral-900/50 flex flex-wrap gap-5 items-center justify-between text-[10px] font-mono">
                        <a
                          href="https://github.com/VastSea0/hilal-browser/issues"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300 flex items-center gap-1 transition-colors"
                        >
                          {activeT.releases.bugReport}
                        </a>
                        <a
                          href="https://discord.gg/JZJ4tmPHFw"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300 flex items-center gap-1 transition-colors"
                        >
                          Discord
                        </a>
                        <a
                          href="https://github.com/VastSea0/hilal-browser/commits"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300 flex items-center gap-1 transition-colors"
                        >
                          {activeT.releases.commits}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* High-end call-to-action button to switch view to Releases archive */}
              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    setView("releases");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950 px-6 py-3.5 text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-600 dark:text-neutral-400 transition-all active:scale-[0.98]"
                >
                  <ListRestart className="h-3.5 w-3.5" />
                  {lang === "tr" ? "Tüm Sürüm Arşivi ve Tarihçe →" : "Full Release Archive & History →"}
                </button>
              </div>
            </section>

            {/* 6. Principles / Core Values */}
            <section className="mx-auto max-w-4xl px-6 py-12 md:py-16 border-t border-neutral-200/30 dark:border-neutral-900/30" id="vizyon">
              <div className="text-center mb-12">
                <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase block">
                  {activeT.principles.tag}
                </span>
                <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl text-neutral-900 dark:text-white">
                  {activeT.principles.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12" id="core-values-bento">
                <div className="text-left flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded border border-neutral-200 dark:border-neutral-900 flex items-center justify-center mb-4 text-neutral-400 dark:text-neutral-500">
                      <CodeXml className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-sans text-sm font-bold tracking-wider uppercase text-neutral-900 dark:text-white">
                      {activeT.principles.card1Title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {activeT.principles.card1Desc}
                    </p>
                  </div>
                  <a
                    href="https://github.com/VastSea0/hilal-browser"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-neutral-400 hover:text-neutral-955 dark:hover:text-white transition-colors"
                  >
                    {activeT.principles.card1Link}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                <div className="text-left flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded border border-neutral-200 dark:border-neutral-900 flex items-center justify-center mb-4 text-neutral-400 dark:text-neutral-500">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-sans text-sm font-bold tracking-wider uppercase text-neutral-900 dark:text-white">
                      {activeT.principles.card2Title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {activeT.principles.card2Desc}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    <span>{activeT.principles.card2Foot}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. FAQ Accordion */}
            <section className="mx-auto max-w-3xl px-6 py-12 md:py-16 border-t border-neutral-200/30 dark:border-neutral-900/30" id="faq-section">
              <div className="text-center mb-12">
                <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase block">
                  {activeT.faq.tag}
                </span>
                <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight sm:text-3xl text-neutral-900 dark:text-white">
                  {activeT.faq.title}
                </h2>
              </div>

              <div className="divide-y divide-neutral-200/50 dark:divide-neutral-900/50" id="faq-accordion-group">
                {faqList.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={idx}
                      id={`faq-item-${idx}`}
                      className="py-4 first:pt-0 last:pb-0 text-left"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left font-sans text-xs md:text-sm font-bold text-neutral-800 dark:text-neutral-200 py-2 hover:text-neutral-950 dark:hover:text-white transition-colors"
                      >
                        <span>{faq.q}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pb-3 pt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
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
          </motion.div>
        ) : (
          // Dedicated Releases Page View (Complete timeline directory page)
          <motion.main
            key="releases-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl px-6 py-16 md:py-24"
          >
            {/* Back to Home Link */}
            <button
              onClick={() => setView("home")}
              className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-450 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8"
            >
              ← {lang === "tr" ? "Ana Sayfaya Dön" : "Back to Home"}
            </button>

            {/* Releases Header */}
            <div className="mb-12 border-b border-neutral-200/50 dark:border-neutral-900/50 pb-6">
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase block mb-1">
                {activeT.releases.tag}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-normal text-neutral-900 dark:text-white">
                {lang === "tr" ? "Sürüm Arşivi" : "Release History"}
              </h1>
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                {activeT.releases.timelineSubtitle}
              </p>
            </div>

            {/* Full Release Timeline list */}
            <div className="divide-y divide-neutral-200/50 dark:divide-neutral-900/50">
              {allReleasesTimeline.map((item, index) => {
                const buildTypes = getBuildTypesForRelease(item);
                const summaryLines = getReleaseSummaryLines(item.body);
                return (
                  <article
                    key={`${item.id}-${item.tag_name}`}
                    className="py-8 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                            {formatLocalizedDate(item.published_at, lang)}
                          </span>
                          {index === 0 && (
                            <span className="rounded bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                              {activeT.releases.currentBuild}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-sans text-sm font-bold text-neutral-800 dark:text-neutral-200">
                          {item.tag_name} — <span className="font-normal text-neutral-400 dark:text-neutral-500">{item.name || item.tag_name}</span>
                        </h3>
                      </div>
                      <a
                        href={item.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-mono text-neutral-400 hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-white transition-colors"
                      >
                        {activeT.releases.viewRelease}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {buildTypes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {buildTypes.map(type => (
                          <span
                            key={`${item.id}-${type}`}
                            className="rounded border border-neutral-200/70 bg-neutral-50 px-2 py-0.5 text-[9px] font-mono text-neutral-400 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-500"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}

                    {summaryLines.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        {summaryLines.map((line, lineIndex) => (
                          <div
                            key={`${item.id}-line-${lineIndex}`}
                            className="flex gap-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                            <span>{line.text.replace(/\*\*/g, "").replace(/`/g, "")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* 8. Footer Section */}
      <footer
        className="border-t border-neutral-200/30 dark:border-neutral-900/30 py-12"
        id="app-footer"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-200/30 dark:border-neutral-900/30">
            <div className="flex items-center gap-3">
              <img
                src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/branding/hilal/default128.png"
                alt="Hilal Logo"
                className="h-5.5 w-5.5 opacity-80"
                referrerPolicy="no-referrer"
              />
              <span className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-neutral-900 dark:text-neutral-100">
                hilal <span className="text-neutral-400 dark:text-neutral-500 font-light">browser</span>
              </span>
            </div>

            <p className="font-serif italic text-xs text-neutral-400 dark:text-neutral-500 text-center select-text">
              “{activeT.footer.quote}”
            </p>

            <div className="flex items-center gap-4.5">
              <a
                href="https://github.com/VastSea0/hilal-browser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://discord.gg/JZJ4tmPHFw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-colors"
                aria-label="Discord Server"
              >
                <span className="flex h-4.5 w-4.5 items-center justify-center">
                  <SiDiscord />
                </span>
              </a>
              <button
                id="footer-download-btn"
                onClick={() => setIsDownloadOpen(true)}
                className="text-[9px] font-bold tracking-widest uppercase border border-neutral-200 hover:bg-neutral-50 px-3.5 py-1.5 rounded text-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-950 dark:text-neutral-350 transition-colors font-mono"
              >
                {activeT.footer.install}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
            <p className="select-text">
              &copy; {new Date().getFullYear()} {activeT.footer.copyright}
            </p>
            <p className="select-text">
              {activeT.footer.license}
            </p>
          </div>
        </div>
      </footer>

      {/* Download Modal Dialog */}
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
