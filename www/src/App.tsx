import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Github,
  ChevronDown,
  Download,
  Terminal,
  Apple,
  Laptop,
  Check,
  Copy,
  ArrowRight,
  Layers,
  Sparkles,
  Cpu,
  Boxes,
  GitCommit,
  Users,
  Smartphone,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

import { GithubRelease } from "./types";
import {
  fetchGithubReleases,
  FALLBACK_RELEASE_TR,
  FALLBACK_RELEASE_EN,
  detectOS,
  getRecommendedAsset,
  formatBytes
} from "./utils/github";

import DownloadModal from "./components/DownloadModal";
import ChangelogPage from "./components/ChangelogPage";
import DocsPage from "./components/DocsPage";
import PrivacyPage from "./components/PrivacyPage";
import { CONTRIBUTORS_DATA } from "./data/changelogData";

// M3 Expressive Spring Motion Physics
const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 26
};

const m3FadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition
  }
};

const m3Stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("hilal-theme");
    return saved === "light" ? "light" : "dark";
  });

  const [lang, setLang] = useState<"tr" | "en">(() => {
    const saved = localStorage.getItem("hilal-lang");
    return saved === "en" || saved === "tr" ? saved : "tr";
  });

  const [currentView, setCurrentView] = useState<"home" | "docs" | "changelog" | "privacy">(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/changelog" || h === "#changelog" || h.startsWith("#v0.")) {
        return "changelog";
      }
      if (p === "/docs" || h.startsWith("#docs") || p === "/mobile" || h === "#mobile") {
        return "docs";
      }
      if (p === "/privacy" || h === "#privacy") {
        return "privacy";
      }
    }
    return "home";
  });

  const [release, setRelease] = useState<GithubRelease | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [detectedOS, setDetectedOS] = useState<string>("other");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  useEffect(() => {
    setDetectedOS(detectOS());

    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/changelog" || h === "#changelog" || h.startsWith("#v0.")) {
        setCurrentView("changelog");
      } else if (p === "/docs" || h.startsWith("#docs") || p === "/mobile" || h === "#mobile") {
        setCurrentView("docs");
      } else if (p === "/privacy" || h === "#privacy") {
        setCurrentView("privacy");
      } else {
        setCurrentView("home");
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("hilal-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("hilal-lang", lang);
  }, [lang]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGithubReleases();
        if (data && data.length > 0) {
          setRelease(data[0]);
        } else {
          setRelease(lang === "en" ? FALLBACK_RELEASE_EN : FALLBACK_RELEASE_TR);
        }
      } catch {
        setRelease(lang === "en" ? FALLBACK_RELEASE_EN : FALLBACK_RELEASE_TR);
      }
    };
    loadData();
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const navigateTo = (view: "home" | "docs" | "changelog" | "privacy", targetId?: string) => {
    setCurrentView(view);
    if (view === "docs") {
      window.history.pushState(null, "", targetId ? `#docs/${targetId}` : "#docs");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "changelog") {
      window.history.pushState(null, "", "#changelog");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "privacy") {
      window.history.pushState(null, "", "#privacy");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.history.pushState(null, "", "/");
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const scrollToId = (id: string) => {
    if (currentView !== "home") {
      navigateTo("home", id);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeRelease = release || (lang === "en" ? FALLBACK_RELEASE_EN : FALLBACK_RELEASE_TR);
  const recommendedAsset = activeRelease?.assets
    ? getRecommendedAsset(activeRelease.assets, detectedOS as any)
    : null;

  const handleCopyCommand = () => {
    const cmd = "git clone https://github.com/VastSea0/hilal-browser.git && cd hilal-browser && ./bin/hil setup";
    navigator.clipboard.writeText(cmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const isDark = theme === "dark";

  const t = {
    tr: {
      nav: {
        features: "Özellikler",
        architecture: "Açık Kaynak",
        docs: "Belgeler",
        changelog: "Sürüm Notları",
        download: "İndir",
        github: "GitHub",
        getHilal: "Hilal'i İndir",
      },
      hero: {
        chip: "Açık Kaynak • Alpha",
        tagline: "Web sizin kontrolünüzde.",
        subtitle:
          "Gizlilik odaklı, dikey sekmeli ve konteyner destekli masaüstü ve mobil web tarayıcısı. Açık kaynaklı, hızlı ve bağımsız.",
        downloadBtn: {
          macos: "macOS için İndir",
          windows: "Windows için İndir",
          linux: "Linux için İndir",
          android: "Android için İndir",
          other: "İndir",
        },
        viewAllDownloads: "Tüm platformlar (.dmg, .exe, .deb, .zip, .apk)",
      },
      stories: [
        {
          chip: "Özelleştirme",
          title: "Çalışma şeklinize uyum sağlayan arayüz.",
          description:
            "Dikey sekmeler, gizlenebilir kompakt araç çubuğu ve sol veya sağ kenar çubuğu yerleşimiyle tarayıcınızı istediğiniz gibi düzenleyin.",
          image: isDark ? "/welcome-compact-vertical.png" : "/welcome-standard-vertical.png",
          alt: "Hilal Özelleştirilebilir Arayüz",
        },
        {
          chip: "Çalışma Alanları",
          title: "İş ve kişisel hesapları birbirinden ayırın.",
          description:
            "Her çalışma alanı kendi çerezleri ve oturumlarıyla yalıtılmış ayrı bir konteynerde çalışır. Onlarca pencere açmadan tek tarayıcıda çoklu hesap yönetin.",
          image: "/welcome-workspaces-on.png",
          alt: "Hilal Çalışma Alanları",
        },
        {
          chip: "Gizlilik",
          title: "Dahili uBlock Origin ve sıfır telemetri.",
          description:
            "uBlock Origin tarayıcıya gömülü gelir. Arka planda çalışan takip mekanizmaları ve telemetri uç noktaları tamamen devre dışıdır.",
          image: "/welcome-toolbar-hidden.png",
          alt: "Hilal Gizlilik Koruması",
        },
        {
          chip: "Eklentiler",
          title: "Firefox eklentileriyle tam uyumluluk.",
          description:
            "Gecko motoru sayesinde Firefox Add-ons (AMO) mağazasındaki eklentilerin tamamı hiçbir ek ayar gerektirmeden çalışır.",
          image: "/welcome-home-preview.png",
          alt: "Hilal Eklenti Uyumluluğu",
        },
      ],
      openSourceSection: {
        chip: "Açık Kaynak",
        title: "Firefox üzerinde temiz bir yama katmanı.",
        description:
          "Hilal kopuk bir çatal (fork) değildir. 'hil' Rust yöneticisi aracılığıyla güncel Firefox Gecko motoruna metin tabanlı yamalar uygular, güvenlik güncellemelerini gecikmeden alır.",
        commandLabel: "Depoyu klonlayıp yerel ortamda derleyin:",
      },
      downloadSection: {
        chip: "Resmi Sürümler",
        title: "Hilal'i edinin.",
        subtitle: "İşletim sisteminize uygun derlemeyi seçin.",
        platforms: [
          {
            name: "macOS",
            spec: "Apple Silicon & Intel • Evrensel .dmg",
            icon: <Apple className="w-6 h-6" />,
          },
          {
            name: "Windows",
            spec: "Windows 10/11 • 64-bit .exe ve Taşınabilir .zip",
            icon: <Laptop className="w-6 h-6" />,
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian .deb • AppImage • Tarball",
            icon: <Terminal className="w-6 h-6" />,
          },
          {
            name: "Android",
            spec: "GeckoView 135 • APK ve Google Play",
            icon: <Smartphone className="w-6 h-6" />,
          },
        ],
        directDownload: "İndir",
      },
      faq: {
        chip: "S.S.S.",
        title: "Sıkça Sorulan Sorular",
        items: [
          {
            q: "Hilal Browser nedir?",
            a: "Hilal, Firefox Gecko motoru üzerine geliştirilmiş açık kaynaklı bir web tarayıcısıdır. Çatallama (hard fork) yerine Rust tabanlı yama yöneticisiyle Firefox'un üzerine oturur, böylece güncellemeleri gecikmeksizin alır.",
          },
          {
            q: "Firefox eklentilerimi kullanabilir miyim?",
            a: "Evet. Firefox Add-ons (AMO) mağazasındaki tüm eklentilerle %100 uyumludur. uBlock Origin hazır olarak gelir.",
          },
          {
            q: "Çalışma Alanları (Workspaces) oturumları nasıl ayırır?",
            a: "Firefox Multi-Account Containers altyapısıyla her çalışma alanında çerezler ve oturumlar izole edilir. Farklı profiller açmadan aynı tarayıcıda iş ve kişisel hesaplarınızı yönetebilirsiniz.",
          },
          {
            q: "Telemetri veya veri toplanıyor mu?",
            a: "Hayır. Tarayıcıda tarama geçmişi veya kişisel veri toplanmaz. Yalnızca GeckoView kararlılığı için tamamen anonim teknik kullanım istatistikleri işlenir. Proje yalnızca topluluk sponsorluklarıyla finanse edilir.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Projesi. Mozilla Kamu Lisansı (MPL 2.0).",
        authorBy: "Egehan Kahraman",
        docs: "Belgeler",
        privacy: "Gizlilik Politikası",
        source: "Kaynak Kodu",
        releases: "Sürüm Notları",
        discord: "Discord",
      },
    },
    en: {
      nav: {
        features: "Features",
        architecture: "Open Source",
        docs: "Docs",
        changelog: "Changelog",
        download: "Download",
        github: "GitHub",
        getHilal: "Get Hilal",
      },
      hero: {
        chip: "Open Source • Alpha",
        tagline: "Browse on your terms.",
        subtitle:
          "A privacy-focused desktop & mobile web browser with vertical tabs, isolated workspaces, and zero telemetry. Built on Firefox Gecko.",
        downloadBtn: {
          macos: "Download for macOS",
          windows: "Download for Windows",
          linux: "Download for Linux",
          android: "Download for Android",
          other: "Download",
        },
        viewAllDownloads: "All platforms (.dmg, .exe, .deb, .zip, .apk)",
      },
      stories: [
        {
          chip: "Customization",
          title: "An interface that adapts to how you work.",
          description:
            "Configure vertical tabs, an auto-hiding toolbar, and left or right sidebar placement to match your workflow.",
          image: isDark ? "/welcome-compact-vertical.png" : "/welcome-standard-vertical.png",
          alt: "Hilal Customizable Interface",
        },
        {
          chip: "Workspaces",
          title: "Keep work and personal accounts separated.",
          description:
            "Each workspace runs in an isolated container with its own cookies and logins. Manage multiple accounts without juggling dozens of windows.",
          image: "/welcome-workspaces-on.png",
          alt: "Hilal Workspaces",
        },
        {
          chip: "Privacy",
          title: "Built-in uBlock Origin and zero telemetry.",
          description:
            "uBlock Origin comes pre-installed. Background tracking and telemetry endpoints are completely disabled.",
          image: "/welcome-toolbar-hidden.png",
          alt: "Hilal Privacy Protection",
        },
        {
          chip: "Add-ons",
          title: "Full Firefox add-on compatibility.",
          description:
            "Powered by Gecko, Hilal supports the entire Firefox Add-ons (AMO) catalog with no workarounds required.",
          image: "/welcome-home-preview.png",
          alt: "Hilal Add-on Compatibility",
        },
      ],
      openSourceSection: {
        chip: "Open Source",
        title: "Built as a clean patch layer on Firefox.",
        description:
          "Hilal is not a divergent fork. It applies text-based patches to upstream Firefox Gecko using the 'hil' Rust manager, receiving security updates directly.",
        commandLabel: "Clone and build locally:",
      },
      downloadSection: {
        chip: "Official Builds",
        title: "Get Hilal.",
        subtitle: "Choose the build for your operating system.",
        platforms: [
          {
            name: "macOS",
            spec: "Apple Silicon & Intel • Universal .dmg",
            icon: <Apple className="w-6 h-6" />,
          },
          {
            name: "Windows",
            spec: "Windows 10/11 • 64-bit .exe & Portable .zip",
            icon: <Laptop className="w-6 h-6" />,
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian .deb • AppImage • Tarball",
            icon: <Terminal className="w-6 h-6" />,
          },
          {
            name: "Android",
            spec: "GeckoView 135 • APK & Google Play",
            icon: <Smartphone className="w-6 h-6" />,
          },
        ],
        directDownload: "Download",
      },
      faq: {
        chip: "FAQ",
        title: "Frequently Asked Questions",
        items: [
          {
            q: "What is Hilal Browser?",
            a: "Hilal is an open-source browser built on Firefox Gecko. Rather than maintaining a hard fork, it applies declarative patches to upstream Firefox using the 'hil' Rust manager, staying up to date with upstream security fixes.",
          },
          {
            q: "Can I use standard Firefox extensions?",
            a: "Yes. Hilal supports the full Firefox Add-ons (AMO) ecosystem, and uBlock Origin is pre-installed.",
          },
          {
            q: "How do Workspaces isolate sessions?",
            a: "Each workspace runs in an isolated Multi-Account Container, keeping cookies and logins strictly separated between contexts.",
          },
          {
            q: "Is there any telemetry or tracking?",
            a: "No personal or browsing data is ever collected. Only anonymous technical stats are processed for GeckoView engine stability. The project is funded purely by community sponsors.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Project. Mozilla Public License 2.0.",
        authorBy: "Egehan Kahraman",
        docs: "Docs",
        privacy: "Privacy Policy",
        source: "Source Code",
        releases: "Changelog",
        discord: "Discord",
      },
    },
  };

  const activeT = t[lang] || t.tr;

  const getDynamicBtnLabel = () => {
    if (detectedOS === "macos") return activeT.hero.downloadBtn.macos;
    if (detectedOS === "windows") return activeT.hero.downloadBtn.windows;
    if (detectedOS === "linux") return activeT.hero.downloadBtn.linux;
    if (detectedOS === "android") return activeT.hero.downloadBtn.android;
    return activeT.hero.downloadBtn.other;
  };

  return (
    <div className="min-h-screen bg-m3-surface text-[var(--md-sys-color-on-surface)] selection:bg-[var(--md-sys-color-primary-container)] selection:text-[var(--md-sys-color-on-primary-container)]">
      {/* 1. M3 Floating Top App Bar */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <div className="mx-auto max-w-5xl pointer-events-auto h-14 rounded-full bg-m3-surface/80 dark:bg-m3-container-low/80 backdrop-blur-xl border border-[var(--md-sys-color-outline-variant)]/20 px-4 sm:px-5 flex items-center justify-between shadow-md shadow-black/5 transition-all">
          {/* Logo & Name */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("home")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)]/60 flex items-center justify-center p-1.5">
              <img
                src="/default128.png"
                alt="Hilal Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
              Hilal
            </span>
          </motion.div>

          {/* Center Nav Links - Clean & Unnested */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToId("features")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8 transition-colors cursor-pointer"
            >
              {activeT.nav.features}
            </button>
            <button
              onClick={() => scrollToId("architecture")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8 transition-colors cursor-pointer"
            >
              {activeT.nav.architecture}
            </button>
            <button
              onClick={() => navigateTo("docs")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "docs"
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{activeT.nav.docs}</span>
            </button>
            <button
              onClick={() => navigateTo("changelog")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === "changelog"
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{activeT.nav.changelog}</span>
            </button>
            <button
              onClick={() => scrollToId("download")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8 transition-colors cursor-pointer"
            >
              {activeT.nav.download}
            </button>
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8 transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>{activeT.nav.github}</span>
            </a>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-1.5">
            {/* Lang Chip */}
            <button
              onClick={() => setLang(lang === "tr" ? "en" : "tr")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8 transition-colors cursor-pointer"
              title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
            >
              {lang === "tr" ? "EN" : "TR"}
            </button>

            {/* Theme Chip */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8 transition-colors cursor-pointer"
              aria-label="Theme Toggle"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* CTA Pill Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDownloadOpen(true)}
              className="h-9 px-4 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{activeT.nav.getHilal}</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main View Router */}
      {currentView === "docs" ? (
        <DocsPage
          lang={lang}
          onBack={() => navigateTo("home")}
          onOpenDownload={() => setIsDownloadOpen(true)}
        />
      ) : currentView === "changelog" ? (
        <ChangelogPage
          lang={lang}
          onBack={() => navigateTo("home")}
          onOpenDownload={() => setIsDownloadOpen(true)}
        />
      ) : currentView === "privacy" ? (
        <PrivacyPage
          lang={lang}
          onBack={() => navigateTo("home")}
        />
      ) : (
        <>
          {/* 2. M3 Expressive Hero Section */}
          <section className="pt-36 sm:pt-44 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
            <motion.div
              variants={m3Stagger}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* M3 Assist Chip */}
              <motion.div
                variants={m3FadeIn}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold tracking-wide"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                <span>{activeT.hero.chip}</span>
              </motion.div>

              {/* M3 Emphasized Display Large Tagline */}
              <motion.h1
                variants={m3FadeIn}
                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[var(--md-sys-color-on-surface)] leading-[1.05]"
                style={{ fontStretch: "110%" }}
              >
                {activeT.hero.tagline}
              </motion.h1>

              {/* M3 Body Large Subtitle */}
              <motion.p
                variants={m3FadeIn}
                className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[var(--md-sys-color-on-surface-variant)] leading-relaxed font-normal"
              >
                {activeT.hero.subtitle}
              </motion.p>

              {/* M3 Actions (Filled & Tonal Pill Buttons) */}
              <motion.div
                variants={m3FadeIn}
                className="pt-4 flex flex-col items-center gap-4"
              >
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Primary Filled Button */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsDownloadOpen(true)}
                    className="h-14 px-8 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  >
                    {detectedOS === "macos" && <Apple className="w-5 h-5" />}
                    {detectedOS === "windows" && <Laptop className="w-5 h-5" />}
                    {detectedOS !== "macos" && detectedOS !== "windows" && <Download className="w-5 h-5" />}
                    <span>{getDynamicBtnLabel()}</span>
                  </motion.button>

                  {/* Changelog Pill Button */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigateTo("changelog")}
                    className="h-14 px-7 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/50 font-semibold text-sm sm:text-base flex items-center gap-2.5 hover:bg-m3-container-high transition-colors cursor-pointer"
                  >
                    <GitCommit className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                    <span>{activeT.nav.changelog}</span>
                  </motion.button>

                  {/* GitHub Repo Button */}
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    href="https://github.com/VastSea0/hilal-browser"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 px-7 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/50 font-semibold text-sm sm:text-base flex items-center gap-2.5 hover:bg-m3-container-high transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub Repo</span>
                  </motion.a>
                </div>

                {/* Supporting artifact note */}
                {recommendedAsset && (
                  <p className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                    {recommendedAsset.name} • {formatBytes(recommendedAsset.size)}
                  </p>
                )}
              </motion.div>
            </motion.div>

            {/* Hero Screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
              className="mt-12 sm:mt-16 max-w-5xl mx-auto drop-shadow-2xl"
            >
              <img
                src={isDark ? "/welcome-home-preview-black.png" : "/welcome-home-preview.png"}
                alt="Hilal Browser Interface"
                className="w-full h-auto block select-none pointer-events-none rounded-2xl"
              />
            </motion.div>
          </section>

          {/* 3. M3 Expressive Interactive Stories Showcase */}
          <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6" id="features">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === "tr" ? "Öne Çıkan Özellikler" : "Key Highlights"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
                {lang === "tr" ? "Temel Yetenekler." : "Core Pillars."}
              </h2>
            </div>

            {/* M3 Segmented Navigation Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {activeT.stories.map((story, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(idx)}
                  className={`h-11 px-5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === idx
                      ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md"
                      : "bg-m3-container text-[var(--md-sys-color-on-surface-variant)] hover:bg-m3-container-high"
                  }`}
                >
                  <span>{story.chip}</span>
                </motion.button>
              ))}
            </div>

            {/* Active Tab Story Showcase Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={springTransition}
                className="p-6 sm:p-10 rounded-[36px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center shadow-xl"
              >
                {/* Story Text Side */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3.5 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold inline-block">
                    {activeT.stories[activeTab].chip}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)] leading-snug">
                    {activeT.stories[activeTab].title}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed font-normal">
                    {activeT.stories[activeTab].description}
                  </p>
                </div>

                {/* Story Visual Side */}
                <div className="lg:col-span-7 drop-shadow-xl">
                  <img
                    src={activeT.stories[activeTab].image}
                    alt={activeT.stories[activeTab].alt}
                    className="w-full h-auto block select-none pointer-events-none rounded-2xl"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </section>

          {/* 4. M3 Expressive Architecture & Terminal Section */}
          <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6" id="architecture">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={springTransition}
              className="p-8 sm:p-12 rounded-[36px] bg-m3-container border border-[var(--md-sys-color-outline-variant)]/40 text-center space-y-6 shadow-xl"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>{activeT.openSourceSection.chip}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--md-sys-color-on-surface)] max-w-2xl mx-auto">
                {activeT.openSourceSection.title}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-[var(--md-sys-color-on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
                {activeT.openSourceSection.description}
              </p>

              {/* M3 Tonal Interactive Terminal Card */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/40 text-xs font-mono text-[var(--md-sys-color-on-surface)] shadow-inner">
                  <span className="text-[var(--md-sys-color-primary)] font-bold">$</span>
                  <span className="select-all truncate max-w-[260px] sm:max-w-md">
                    git clone https://github.com/VastSea0/hilal-browser.git && cd hilal-browser && ./bin/hil setup
                  </span>
                  <button
                    onClick={handleCopyCommand}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-m3-container hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-colors cursor-pointer"
                    title="Copy Command"
                  >
                    {copiedClone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contributors Grid */}
              <div className="pt-6 border-t border-[var(--md-sys-color-outline-variant)]/20">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                    <span>{lang === "tr" ? "Projeye Katkıda Bulunanlar" : "Project Contributors"}</span>
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {CONTRIBUTORS_DATA.map((c) => (
                      <a
                        key={c.username}
                        href={c.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-m3-container-lowest hover:bg-m3-container-high border border-[var(--md-sys-color-outline-variant)]/30 text-xs transition-all hover:scale-105 group"
                        title={`${c.name} (@${c.username}) • ${c.contributions} commit`}
                      >
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-[var(--md-sys-color-outline-variant)]/40"
                        />
                        <span className="font-semibold text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-primary)] transition-colors">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface-variant)]">
                          {c.contributions} commit
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* 5. M3 Expressive Platform Download Center */}
          <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 text-center" id="download">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold mb-3">
              <Boxes className="w-3.5 h-3.5" />
              <span>{activeT.downloadSection.chip}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--md-sys-color-on-surface)]">
              {activeT.downloadSection.title}
            </h2>
            <p className="mt-2 text-base text-[var(--md-sys-color-on-surface-variant)]">
              {activeT.downloadSection.subtitle}
            </p>

            {/* 4 M3 Tonal Container Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeT.downloadSection.platforms.map((p, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={springTransition}
                  onClick={() => setIsDownloadOpen(true)}
                  className="p-7 rounded-[32px] bg-m3-container-low hover:bg-m3-container border border-[var(--md-sys-color-outline-variant)]/40 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-lg"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      {p.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)] font-normal">
                      {p.spec}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[var(--md-sys-color-primary)] group-hover:translate-x-1 transition-transform">
                    <span>{activeT.downloadSection.directDownload}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 6. M3 Expressive S.S.S. (FAQ) */}
          <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-m3-container text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold inline-block">
                {activeT.faq.chip}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
                {activeT.faq.title}
              </h2>
            </div>

            <div className="space-y-3">
              {activeT.faq.items.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <motion.div
                    key={idx}
                    className="rounded-[24px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/35 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-base font-semibold text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <div className={`w-8 h-8 rounded-full bg-m3-container flex items-center justify-center shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]" : ""}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={springTransition}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 pt-1 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed border-t border-[var(--md-sys-color-outline-variant)]/20">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* 7. Footer */}
      <footer className="py-12 border-t border-[var(--md-sys-color-outline-variant)]/30 text-xs text-[var(--md-sys-color-on-surface-variant)] bg-m3-container-lowest">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {activeT.footer.copyright}</p>
            <span className="hidden sm:inline opacity-40">•</span>
            <a
              href="https://egehan.is-a.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--md-sys-color-primary)] hover:underline font-semibold"
            >
              {activeT.footer.authorBy}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-5 font-semibold">
            <button
              onClick={() => navigateTo("docs")}
              className="hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              {activeT.footer.docs}
            </button>
            <button
              onClick={() => navigateTo("privacy")}
              className="hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              {activeT.footer.privacy}
            </button>
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              {activeT.footer.source}
            </a>
            <button
              onClick={() => navigateTo("changelog")}
              className="hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              {activeT.footer.releases}
            </button>
            <a
              href="https://discord.gg/JZJ4tmPHFw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              {activeT.footer.discord}
            </a>
          </div>
        </div>
      </footer>

      {/* M3 Expressive Download Dialog */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        release={activeRelease}
        lang={lang}
      />
    </div>
  );
}
