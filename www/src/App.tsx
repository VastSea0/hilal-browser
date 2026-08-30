import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Terminal,
  ExternalLink,
  Apple,
  Laptop,
  Check,
  Copy,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Lock,
  Cpu,
  Boxes,
  Compass,
  ChevronDown,
  Github
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

import { GithubRelease } from "./types";
import {
  fetchGithubReleases,
  FALLBACK_RELEASE_TR,
  FALLBACK_RELEASE_EN,
  detectOS,
  getRecommendedAsset,
  formatBytes
} from "./utils/github";

import Navbar from "./components/Navbar";
import DownloadModal from "./components/DownloadModal";

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

  const [release, setRelease] = useState<GithubRelease | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [detectedOS, setDetectedOS] = useState<string>("other");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  useEffect(() => {
    setDetectedOS(detectOS());
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

  const scrollToSection = (id: string) => {
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

  // Comprehensive, user-resonant copywriting (TR & EN)
  const t = {
    tr: {
      hero: {
        chip: "Açık Kaynak • Alpha 0.2",
        title: "İnternet, sizin kurallarınızla.",
        subtitle:
          "Daha hızlı, daha sessiz ve tamamen özgür. Hilal; yarı saydam Tahoe kenar çubuğu, izole konteyner çalışma alanları ve dahili reklam engellemesiyle Firefox'un gücünü saf bir deneyime dönüştürür.",
        downloadBtn: {
          macos: "macOS için İndir",
          windows: "Windows için İndir",
          linux: "Linux için İndir",
          other: "Hemen İndir",
        },
        viewAllDownloads: "Tüm platformlar (.dmg, .exe, .deb, .zip)",
      },
      stories: [
        {
          tabLabel: "Tahoe Arayüzü",
          chip: "01 / ODAK VE ZARAFET",
          title: "Sayfalar ön planda, araç çubuğu geri planda.",
          description:
            "Dikey sekmeler dikkatinizi dağıtmadan solda düzenli durur, araç çubuğu yalnızca ihtiyaç duyduğunuzda görünür. Web sitelerinin renk tonlarına zarifçe uyum sağlayan yarı saydam Tahoe kenar çubuğu ile web sayfaları tüm genişliğiyle parlar.",
          image: isDark ? "/welcome-compact-vertical.png" : "/welcome-standard-vertical.png",
          alt: "Hilal Tahoe Sidebar Arayüzü",
        },
        {
          tabLabel: "Çalışma Alanları",
          chip: "02 / İZOLE ALANLAR",
          title: "İş, okul ve kişisel hayat tek bir pencerede.",
          description:
            "Sekmeler sadece görsel olarak gruplanmaz; Multi-Account Containers sayesinde her çalışma alanı bağımsız çerezler ve oturumlar barındırır. İş ve kişisel hesaplarınıza aynı anda giriş yapın, onlarca ayrı pencere açma karmaşasını unutun.",
          image: "/welcome-workspaces-on.png",
          alt: "Hilal İzole Konteyner Çalışma Alanları",
        },
        {
          tabLabel: "Dahili Gizlilik",
          chip: "03 / TAVİZSİZ GİZLİLİK",
          title: "Sıfır izleyici. Dahili uBlock kalkanı.",
          description:
            "Reklamlar ve veri toplayıcılar tarayıcı seviyesinde engellenir. Telemetri tamamen kapalıdır. Sayfadaki rahatsız edici öğeleri Element Zapper ile tek tıkla sonsuza dek yok edin.",
          image: "/welcome-toolbar-hidden.png",
          alt: "Hilal Minimalist Kompakt Mod",
        },
        {
          tabLabel: "Firefox Motoru",
          chip: "04 / GÜVENİLİR MOTOR",
          title: "Bozulmayan, açık ve şeffaf bir Firefox katmanı.",
          description:
            "Hilal, Firefox'tan kopan hantal bir fork değildir. Gecko motoru üzerinde bağımsız bir yama katmanı olarak çalışır; tüm Firefox eklentilerinizle (AMO) tam uyumludur ve güvenlik güncellemelerini anında alır.",
          image: "/welcome-home-preview.png",
          alt: "Hilal Gecko Mimari Yapısı",
        },
      ],
      openSourceSection: {
        chip: "Açık Kaynak Mimarisi",
        title: "Kopan bir fork değil; deklaratif bir Firefox katmanı.",
        description:
          "Hilal, upstream Firefox Gecko motoru üzerinde açık kaynaklı ve deklaratif patch katmanı olarak çalışır. Güvenlik güncellemelerini anında alır ve tüm Firefox eklentileriyle kusursuz uyumludur.",
        commandLabel: "Geliştiriciler için doğrudan derleme:",
      },
      downloadSection: {
        chip: "Resmi Derlemeler",
        title: "Tarayıcınızı Özgürleştirin.",
        subtitle: "Açık kaynaklı, hızlı ve sizin kontrolünüzde bir internet deneyimi.",
        platforms: [
          {
            name: "macOS",
            spec: "Apple Silicon (M1–M4) ve Intel • Evrensel DMG",
            icon: <Apple className="w-6 h-6" />,
          },
          {
            name: "Windows",
            spec: "Windows 10 ve 11 • 64-bit Kurulum veya Taşınabilir ZIP",
            icon: <Laptop className="w-6 h-6" />,
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian (.deb) • Evrensel AppImage • Tarball",
            icon: <Terminal className="w-6 h-6" />,
          },
        ],
        directDownload: "İndir",
      },
      faq: {
        chip: "Merak Edilenler",
        title: "Sıkça Sorulan Sorular",
        items: [
          {
            q: "Hilal Browser diğer tarayıcılardan nasıl ayrışır?",
            a: "Hilal, Chromium tekeline karşı Firefox Gecko motorunu savunur. Yarı saydam dikey sekmeler, konteyner bazlı izole çalışma alanları ve sıfır telemetri politikasıyla hem gizliliği hem de modern arayüzü tek çatı altında sunar.",
          },
          {
            q: "Mevcut Firefox eklentilerim ve şifrelerim çalışır mı?",
            a: "Evet. Firefox Add-ons mağazasındaki (AMO) tüm eklentiler (uBlock Origin, Bitwarden, Dark Reader vb.) tam uyumlulukla çalışır. uBlock Origin varsayılan olarak paketlenmiştir.",
          },
          {
            q: "Çalışma Alanları (Workspaces) oturumları nasıl birbirinden ayırır?",
            a: "Her çalışma alanı Multi-Account Containers altyapısını kullanarak çerezleri ve oturumları izole eder. İş, okul ve kişisel hesaplarınıza aynı tarayıcı penceresinde birbirine karışmadan giriş yapabilirsiniz.",
          },
          {
            q: "Telemetri ve veri toplama durumu nedir?",
            a: "Hilal Browser'da hiçbir telemetri, analitik veya kullanıcı verisi toplanmaz. Tüm arka plan raporlama modülleri patch seviyesinde tamamen kapatılmıştır.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Projesi. Mozilla Kamu Lisansı (MPL 2.0) ile korunmaktadır.",
        authorBy: "Egehan Kahraman tarafından geliştirilmiştir",
        source: "Kaynak Kodu",
        releases: "Sürümler",
        discord: "Discord",
      },
    },
    en: {
      hero: {
        chip: "Open Source • Alpha 0.2",
        title: "The web, on your terms.",
        subtitle:
          "Fast, quiet, and uncompromisingly private. Hilal reimagines Firefox Gecko with a distraction-free translucent Tahoe sidebar, isolated container workspaces, and built-in ad blocking—putting total control back in your hands.",
        downloadBtn: {
          macos: "Download for macOS",
          windows: "Download for Windows",
          linux: "Download for Linux",
          other: "Download Alpha Build",
        },
        viewAllDownloads: "All platforms (.dmg, .exe, .deb, .zip)",
      },
      stories: [
        {
          tabLabel: "Tahoe Interface",
          chip: "01 / FOCUS & ELEGANCE",
          title: "Content in the spotlight. Chrome out of the way.",
          description:
            "Vertical tabs keep your headspace clear while the toolbar hides until summoned. A translucent sidebar softly adapts to dominant page colors, letting web content shine across the entire display.",
          image: isDark ? "/welcome-compact-vertical.png" : "/welcome-standard-vertical.png",
          alt: "Hilal Tahoe Sidebar Interface",
        },
        {
          tabLabel: "Workspaces",
          chip: "02 / ISOLATED WORKSPACES",
          title: "Work, dev, and personal life in one calm window.",
          description:
            "Tabs aren't just colored pills; each workspace partitions cookies and sessions via Multi-Account Containers. Sign into multiple accounts simultaneously without juggling a clutter of windows.",
          image: "/welcome-workspaces-on.png",
          alt: "Hilal Multi-Account Workspaces",
        },
        {
          tabLabel: "Built-in Privacy",
          chip: "03 / UNCOMPROMISED PRIVACY",
          title: "Zero surveillance. Built-in shield.",
          description:
            "uBlock Origin is baked in by default, and telemetry is killed at the engine level. Vaporize annoying cookie banners and intrusive elements forever with the Element Zapper.",
          image: "/welcome-toolbar-hidden.png",
          alt: "Hilal Compact Focused Mode",
        },
        {
          tabLabel: "Gecko Core",
          chip: "04 / DEPENDABLE ENGINE",
          title: "An open, declarative Firefox patch layer.",
          description:
            "Hilal isn't a stale hard fork that rots away. It runs as an auditable patch layer on upstream Gecko—retaining 100% Firefox add-on compatibility and instant security patches.",
          image: "/welcome-home-preview.png",
          alt: "Hilal Gecko Architecture",
        },
      ],
      openSourceSection: {
        chip: "Open Source & Architecture",
        title: "Not a divergent fork. A declarative Firefox layer.",
        description:
          "Hilal runs on top of upstream Firefox Gecko as an auditable, text-only patch layer. Retaining instant security tracking and 100% Firefox add-on compatibility.",
        commandLabel: "Developer one-line setup:",
      },
      downloadSection: {
        chip: "Official Artifacts",
        title: "Free Your Browsing.",
        subtitle: "Open source, fast, and tranquil browsing tailored for you.",
        platforms: [
          {
            name: "macOS",
            spec: "Apple Silicon (M1–M4) & Intel • Universal .dmg",
            icon: <Apple className="w-6 h-6" />,
          },
          {
            name: "Windows",
            spec: "Windows 10/11 • 64-bit Installer & Portable .zip",
            icon: <Laptop className="w-6 h-6" />,
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian (.deb) • Universal AppImage • Tarball",
            icon: <Terminal className="w-6 h-6" />,
          },
        ],
        directDownload: "Download",
      },
      faq: {
        chip: "Need to Know",
        title: "Frequently Asked Questions",
        items: [
          {
            q: "How does Hilal differ from traditional browsers?",
            a: "Hilal champions the independent Gecko engine against the Chromium monoculture. Combining vertical sidebars, isolated container workspaces, and a strict zero-telemetry policy.",
          },
          {
            q: "Can I use all standard Firefox add-ons?",
            a: "Yes. Full compatibility with the Firefox Add-ons ecosystem (AMO) is guaranteed. uBlock Origin comes pre-installed out of the box.",
          },
          {
            q: "How do Workspaces isolate my logins?",
            a: "Each workspace runs inside a distinct Multi-Account Container, strictly partitioning cookies, storage, and sessions.",
          },
          {
            q: "What is the telemetry policy?",
            a: "Strict zero telemetry. All Mozilla tracking pings, metrics, and error reporting endpoints are killed at the engine level.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Project. Licensed under the Mozilla Public License 2.0.",
        authorBy: "Crafted by Egehan Kahraman",
        source: "Source Code",
        releases: "Releases",
        discord: "Discord",
      },
    },
  };

  const activeT = t[lang] || t.tr;

  const getDynamicBtnLabel = () => {
    if (detectedOS === "macos") return activeT.hero.downloadBtn.macos;
    if (detectedOS === "windows") return activeT.hero.downloadBtn.windows;
    if (detectedOS === "linux") return activeT.hero.downloadBtn.linux;
    return activeT.hero.downloadBtn.other;
  };

  return (
    <div className="min-h-screen bg-m3-surface text-[var(--md-sys-color-on-surface)] selection:bg-[var(--md-sys-color-primary-container)] selection:text-[var(--md-sys-color-on-primary-container)]">
      {/* 1. Dedicated, Completely Rewritten Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDownload={() => setIsDownloadOpen(true)}
        scrollToSection={scrollToSection}
      />

      {/* 2. Hero Section */}
      <section className="pt-36 sm:pt-48 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <motion.div
          variants={m3Stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Version Chip */}
          <motion.div
            variants={m3FadeIn}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            <span>{activeT.hero.chip}</span>
          </motion.div>

          {/* Emphasized Title */}
          <motion.h1
            variants={m3FadeIn}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[var(--md-sys-color-on-surface)] leading-[1.04]"
          >
            {activeT.hero.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={m3FadeIn}
            className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[var(--md-sys-color-on-surface-variant)] leading-relaxed font-normal"
          >
            {activeT.hero.subtitle}
          </motion.p>

          {/* CTA Actions */}
          <motion.div
            variants={m3FadeIn}
            className="pt-4 flex flex-col items-center gap-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Primary Action Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsDownloadOpen(true)}
                className="h-14 px-8 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all"
              >
                {detectedOS === "macos" && <Apple className="w-5 h-5" />}
                {detectedOS === "windows" && <Laptop className="w-5 h-5" />}
                {detectedOS !== "macos" && detectedOS !== "windows" && <Download className="w-5 h-5" />}
                <span>{getDynamicBtnLabel()}</span>
              </motion.button>

              {/* Source Link Button */}
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

            {/* Platform indicator */}
            {recommendedAsset && (
              <p className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                {recommendedAsset.name} • {formatBytes(recommendedAsset.size)}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Hero Visual Container */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.2 }}
          className="mt-14 sm:mt-18 p-2 sm:p-3 rounded-[36px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 shadow-2xl overflow-hidden hover-lift"
        >
          <div className="rounded-[28px] overflow-hidden bg-m3-container-lowest">
            <img
              src={isDark ? "/welcome-home-preview-black.png" : "/welcome-home-preview.png"}
              alt="Hilal Browser Tahoe Interface"
              className="w-full h-auto block select-none pointer-events-none"
            />
          </div>
        </motion.div>
      </section>

      {/* 3. Interactive Pillar Showcase */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6" id="features">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] text-xs font-semibold inline-block">
            {lang === "tr" ? "Temel Yetenekler" : "Key Pillars"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
            {lang === "tr" ? "Neden Hilal Browser?" : "Why Hilal Browser?"}
          </h2>
        </div>

        {/* Segmented Navigation Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {activeT.stories.map((story, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(idx)}
              className={`h-11 px-5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === idx
                  ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md"
                  : "bg-m3-container text-[var(--md-sys-color-on-surface-variant)] hover:bg-m3-container-high"
              }`}
            >
              <span>{story.tabLabel}</span>
            </motion.button>
          ))}
        </div>

        {/* Active Tab Story Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={springTransition}
            className="p-6 sm:p-10 rounded-[36px] bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/40 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center shadow-xl"
          >
            {/* Story Text */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="px-3.5 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-bold inline-block">
                {activeT.stories[activeTab].chip}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)] leading-snug">
                {activeT.stories[activeTab].title}
              </h3>
              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed font-normal">
                {activeT.stories[activeTab].description}
              </p>
            </div>

            {/* Story Visual */}
            <div className="lg:col-span-7 rounded-[26px] overflow-hidden bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 shadow-md">
              <img
                src={activeT.stories[activeTab].image}
                alt={activeT.stories[activeTab].alt}
                className="w-full h-auto block select-none"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. Architecture & Terminal Section */}
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

          {/* Terminal Command Line */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/40 text-xs font-mono text-[var(--md-sys-color-on-surface)] shadow-inner">
              <span className="text-[var(--md-sys-color-primary)] font-bold">$</span>
              <span className="select-all truncate max-w-[260px] sm:max-w-md">
                git clone https://github.com/VastSea0/hilal-browser.git && cd hilal-browser && ./bin/hil setup
              </span>
              <button
                onClick={handleCopyCommand}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-m3-container hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition-colors"
                title="Copy Command"
              >
                {copiedClone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. Download Center */}
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

        {/* 3 Platform Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      {/* 6. FAQ Section */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6" id="faq">
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
                  className="w-full flex items-center justify-between p-5 text-left text-base font-semibold text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] transition-colors"
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
          <div className="flex items-center gap-6 font-semibold">
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              {activeT.footer.source}
            </a>
            <a
              href="https://github.com/VastSea0/hilal-browser/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              {activeT.footer.releases}
            </a>
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

      {/* Download Dialog */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        release={activeRelease}
        lang={lang}
      />
    </div>
  );
}
