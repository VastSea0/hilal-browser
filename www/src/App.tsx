import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Github,
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
import { CONTRIBUTORS_DATA } from "./data/changelogData";

import {
  M3eTheme,
  M3eButton,
  M3eIconButton,
  M3eChip,
  M3eCard,
  M3eSegmentedButton,
  M3eButtonSegment,
  M3eAccordion,
  M3eExpansionPanel,
  M3eTooltip
} from "@m3e/react/all";

// M3 Expressive Spring Motion Physics
const springTransition = {
  type: "spring" as const,
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

  const [currentView, setCurrentView] = useState<"home" | "changelog" | "docs">(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/docs" || h === "#docs" || h.startsWith("#docs/")) {
        return "docs";
      }
      if (p === "/changelog" || h === "#changelog" || h.startsWith("#v0.")) {
        return "changelog";
      }
    }
    return "home";
  });

  const [release, setRelease] = useState<GithubRelease | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [detectedOS, setDetectedOS] = useState<string>("other");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  useEffect(() => {
    setDetectedOS(detectOS());

    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/docs" || h === "#docs" || h.startsWith("#docs/")) {
        setCurrentView("docs");
      } else if (p === "/changelog" || h === "#changelog" || h.startsWith("#v0.")) {
        setCurrentView("changelog");
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

  const navigateTo = (view: "home" | "changelog" | "docs", targetId?: string) => {
    setCurrentView(view);
    if (view === "changelog") {
      window.history.pushState(null, "", "#changelog");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "docs") {
      window.history.pushState(null, "", targetId ? `#docs/${targetId}` : "#docs");
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
          "Dikey sekmeler, izole çalışma alanları ve dahili reklam engelleyiciyle gelen açık kaynaklı masaüstü tarayıcısı. Telemetri yok.",
        downloadBtn: {
          macos: "macOS için İndir",
          windows: "Windows için İndir",
          linux: "Linux için İndir",
          other: "İndir",
        },
        viewAllDownloads: "Tüm platformlar (.dmg, .exe, .deb, .zip)",
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
            "Her çalışma alanı bağımsız çerez ve oturum konteynerleri kullanır. Farklı hesaplar için onlarca ayrı pencere açmaya gerek kalmaz.",
          image: "/welcome-workspaces-on.png",
          alt: "Hilal Çalışma Alanları",
        },
        {
          chip: "Gizlilik",
          title: "Dahili uBlock Origin ve sıfır telemetri.",
          description:
            "uBlock Origin varsayılan olarak kurulu gelir. Arka plan izleyicileri ve telemetri sunucuları tamamen devre dışıdır.",
          image: "/welcome-toolbar-hidden.png",
          alt: "Hilal Gizlilik ve Güvenlik",
        },
        {
          chip: "Eklentiler",
          title: "Firefox eklenti ekosistemiyle tam uyumlu.",
          description:
            "Firefox Add-ons mağazasındaki tüm eklentilerinizi doğrudan yükleyip kullanabilirsiniz. uBlock Origin kutudan çıktığı gibi hazır.",
          image: "/welcome-home-preview.png",
          alt: "Hilal Eklenti Uyumu",
        },
      ],
      openSourceSection: {
        chip: "Açık Kaynak",
        title: "Tüm kaynak kodu açık.",
        description:
          "Hilal tamamen açık kaynaklı bir projedir. Gecko altyapısını kullanır ve güvenlik güncellemelerini doğrudan alır. Kaynak kodunu inceleyebilir, derleyebilir ve katkıda bulunabilirsiniz.",
        commandLabel: "Depoyu klonlayıp derleyin:",
      },
      downloadSection: {
        chip: "İndirme Seçenekleri",
        title: "Hilal'i İndirin.",
        subtitle: "İşletim sisteminize uygun derlemeyi seçin.",
        platforms: [
          {
            name: "macOS",
            spec: "Apple Silicon & Intel • Universal .dmg",
            icon: <Apple className="w-6 h-6" />,
          },
          {
            name: "Windows",
            spec: "Windows 10/11 • 64-bit .exe & Taşınabilir .zip",
            icon: <Laptop className="w-6 h-6" />,
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian .deb • AppImage • Tarball",
            icon: <Terminal className="w-6 h-6" />,
          },
        ],
        directDownload: "İndir",
      },
      faq: {
        chip: "Sıkça Sorulanlar",
        title: "Sıkça Sorulan Sorular",
        items: [
          {
            q: "Hilal Browser nedir?",
            a: "Hilal, kişiselleştirilebilir arayüzü, izole çalışma alanları ve gizlilik odaklı yapısıyla öne çıkan açık kaynaklı bir masaüstü web tarayıcısıdır. Altyapısında Gecko motorunu kullanır.",
          },
          {
            q: "Firefox eklentilerimi kullanabilir miyim?",
            a: "Evet. Firefox Add-ons (AMO) mağazasındaki tüm eklentilerle uyumludur. uBlock Origin hazır olarak gelir.",
          },
          {
            q: "Çalışma Alanları oturumları nasıl ayırır?",
            a: "Her çalışma alanında çerezler ve oturum bilgileri birbirinden izole edilir. Aynı tarayıcıda iş ve kişisel hesaplarınızı ayrı profiller açmadan yönetebilirsiniz.",
          },
          {
            q: "Telemetri veya veri toplanıyor mu?",
            a: "Hayır. Telemetri ve arka plan veri gönderimi tamamen devre dışıdır.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Projesi. Mozilla Kamu Lisansı (MPL 2.0).",
        authorBy: "Egehan Kahraman",
        source: "Kaynak Kodu",
        docs: "Belgeler",
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
          "An open-source desktop browser with vertical tabs, isolated workspaces, and a built-in ad blocker. No telemetry.",
        downloadBtn: {
          macos: "Download for macOS",
          windows: "Download for Windows",
          linux: "Download for Linux",
          other: "Download",
        },
        viewAllDownloads: "All platforms (.dmg, .exe, .deb, .zip)",
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
          title: "Compatible with the Firefox add-on ecosystem.",
          description:
            "Install any extension from Firefox Add-ons (AMO) directly. uBlock Origin comes pre-installed out of the box.",
          image: "/welcome-home-preview.png",
          alt: "Hilal Add-on Compatibility",
        },
      ],
      openSourceSection: {
        chip: "Open Source",
        title: "Fully open source.",
        description:
          "Hilal is a fully open-source project. It uses the Gecko engine under the hood and receives security updates directly. You can inspect the source, build it yourself, or contribute.",
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
        ],
        directDownload: "Download",
      },
      faq: {
        chip: "FAQ",
        title: "Frequently Asked Questions",
        items: [
          {
            q: "What is Hilal Browser?",
            a: "Hilal is an open-source desktop browser focused on customization, privacy, and workspace isolation. It uses the Gecko engine under the hood.",
          },
          {
            q: "Can I use Firefox extensions?",
            a: "Yes. Hilal is compatible with the full Firefox Add-ons (AMO) catalog. uBlock Origin is pre-installed.",
          },
          {
            q: "How do Workspaces isolate sessions?",
            a: "Each workspace keeps cookies and logins strictly separated. You can manage work and personal accounts side by side without opening separate profiles.",
          },
          {
            q: "Is there any telemetry or tracking?",
            a: "No. All telemetry and background analytics are disabled.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Project. Mozilla Public License 2.0.",
        authorBy: "Egehan Kahraman",
        source: "Source Code",
        docs: "Docs",
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
    return activeT.hero.downloadBtn.other;
  };

  return (
    <M3eTheme scheme={theme} motion="expressive" strongFocus color="#0b57d0">
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

            {/* Center Nav Links - M3E Buttons */}
            <div className="hidden md:flex items-center gap-1">
              <M3eButton
                variant="text"
                size="small"
                shape="rounded"
                onClick={() => scrollToId("features")}
              >
                {activeT.nav.features}
              </M3eButton>
              <M3eButton
                variant="text"
                size="small"
                shape="rounded"
                onClick={() => scrollToId("architecture")}
              >
                {activeT.nav.architecture}
              </M3eButton>
              <M3eButton
                variant={currentView === "docs" ? "tonal" : "text"}
                size="small"
                shape="rounded"
                onClick={() => navigateTo("docs")}
              >
                <BookOpen slot="icon" className="w-3.5 h-3.5" />
                <span>{activeT.nav.docs}</span>
              </M3eButton>
              <M3eButton
                variant={currentView === "changelog" ? "tonal" : "text"}
                size="small"
                shape="rounded"
                onClick={() => navigateTo("changelog")}
              >
                <GitCommit slot="icon" className="w-3.5 h-3.5" />
                <span>{activeT.nav.changelog}</span>
              </M3eButton>
              <M3eButton
                variant="text"
                size="small"
                shape="rounded"
                onClick={() => scrollToId("download")}
              >
                {activeT.nav.download}
              </M3eButton>
              <M3eButton
                variant="text"
                size="small"
                shape="rounded"
                href="https://github.com/VastSea0/hilal-browser"
                target="_blank"
              >
                <Github slot="icon" className="w-3.5 h-3.5" />
                <span>{activeT.nav.github}</span>
              </M3eButton>
            </div>

            {/* Right Utilities */}
            <div className="flex items-center gap-1">
              {/* Lang Chip */}
              <M3eButton
                variant="text"
                size="small"
                shape="rounded"
                onClick={() => setLang(lang === "tr" ? "en" : "tr")}
                title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
              >
                {lang === "tr" ? "EN" : "TR"}
              </M3eButton>

              {/* Theme Toggle */}
              <M3eIconButton
                variant="standard"
                size="small"
                shape="rounded"
                onClick={toggleTheme}
                aria-label="Theme Toggle"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </M3eIconButton>

              {/* CTA Button */}
              <M3eButton
                variant="filled"
                size="small"
                shape="rounded"
                onClick={() => setIsDownloadOpen(true)}
              >
                <Download slot="icon" className="w-3.5 h-3.5" />
                <span>{activeT.nav.getHilal}</span>
              </M3eButton>
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
              <motion.div variants={m3FadeIn} className="flex justify-center">
                <M3eChip variant="elevated">
                  <Sparkles slot="icon" className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                  <span>{activeT.hero.chip}</span>
                </M3eChip>
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

              {/* M3 Actions (Filled & Tonal M3E Buttons) */}
              <motion.div
                variants={m3FadeIn}
                className="pt-4 flex flex-col items-center gap-4"
              >
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Primary Filled Button */}
                  <M3eButton
                    variant="filled"
                    size="small"
                    shape="rounded"
                    onClick={() => setIsDownloadOpen(true)}
                  >
                    <span slot="icon" className="flex items-center">
                      {detectedOS === "macos" && <Apple className="w-4 h-4" />}
                      {detectedOS === "windows" && <Laptop className="w-4 h-4" />}
                      {detectedOS !== "macos" && detectedOS !== "windows" && <Download className="w-4 h-4" />}
                    </span>
                    <span>{getDynamicBtnLabel()}</span>
                  </M3eButton>

                  {/* Changelog Pill Button */}
                  <M3eButton
                    variant="tonal"
                    size="small"
                    shape="rounded"
                    onClick={() => navigateTo("changelog")}
                  >
                    <GitCommit slot="icon" className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                    <span>{activeT.nav.changelog}</span>
                  </M3eButton>

                  {/* GitHub Repo Button */}
                  <M3eButton
                    variant="outlined"
                    size="small"
                    shape="rounded"
                    href="https://github.com/VastSea0/hilal-browser"
                    target="_blank"
                  >
                    <Github slot="icon" className="w-4 h-4" />
                    <span>GitHub Repo</span>
                  </M3eButton>
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
              <div className="flex justify-center">
                <M3eChip variant="elevated">
                  <Layers slot="icon" className="w-3.5 h-3.5" />
                  <span>{lang === "tr" ? "Öne Çıkan Özellikler" : "Key Highlights"}</span>
                </M3eChip>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
                {lang === "tr" ? "Temel Yetenekler." : "Core Pillars."}
              </h2>
            </div>

            {/* M3 Segmented Navigation Bar */}
            <div className="flex justify-center mb-12">
              <M3eSegmentedButton>
                {activeT.stories.map((story, idx) => (
                  <M3eButtonSegment
                    key={idx}
                    checked={activeTab === idx}
                    onClick={() => setActiveTab(idx)}
                  >
                    {story.chip}
                  </M3eButtonSegment>
                ))}
              </M3eSegmentedButton>
            </div>

            {/* Active Tab Story Showcase Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={springTransition}
              >
                <M3eCard variant="filled" className="w-full">
                  <div slot="content" className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
                    {/* Story Text Side */}
                    <div className="lg:col-span-5 space-y-4 text-left">
                      <M3eChip variant="elevated">
                        {activeT.stories[activeTab].chip}
                      </M3eChip>
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
                  </div>
                </M3eCard>
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
            >
              <M3eCard variant="outlined" className="w-full">
                <div slot="content" className="p-8 sm:p-12 text-center space-y-6">
                  <div className="flex justify-center">
                    <M3eChip variant="elevated">
                      <Cpu slot="icon" className="w-3.5 h-3.5" />
                      <span>{activeT.openSourceSection.chip}</span>
                    </M3eChip>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--md-sys-color-on-surface)] max-w-2xl mx-auto">
                    {activeT.openSourceSection.title}
                  </h2>

                  <p className="text-sm sm:text-base md:text-lg text-[var(--md-sys-color-on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
                    {activeT.openSourceSection.description}
                  </p>

                  {/* M3 Tonal Interactive Terminal Card */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/20 text-xs font-mono text-[var(--md-sys-color-on-surface)] shadow-inner">
                      <span className="text-[var(--md-sys-color-primary)] font-bold">$</span>
                      <span className="select-all truncate max-w-[260px] sm:max-w-md">
                        git clone https://github.com/VastSea0/hilal-browser.git && cd hilal-browser && ./bin/hil setup
                      </span>
                      <M3eIconButton
                        id="copy-term-btn"
                        variant="standard"
                        size="small"
                        shape="rounded"
                        onClick={handleCopyCommand}
                        aria-label="Copy Command"
                      >
                        {copiedClone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </M3eIconButton>
                      <M3eTooltip htmlFor="copy-term-btn">
                        {copiedClone ? (lang === "tr" ? "Kopyalandı" : "Copied") : (lang === "tr" ? "Komutu Kopyala" : "Copy Command")}
                      </M3eTooltip>
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
                </div>
              </M3eCard>
            </motion.div>
          </section>

          {/* 5. M3 Expressive Platform Download Center */}
          <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 text-center" id="download">
            <div className="flex justify-center mb-3">
              <M3eChip variant="elevated">
                <Boxes slot="icon" className="w-3.5 h-3.5" />
                <span>{activeT.downloadSection.chip}</span>
              </M3eChip>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--md-sys-color-on-surface)]">
              {activeT.downloadSection.title}
            </h2>
            <p className="mt-2 text-base text-[var(--md-sys-color-on-surface-variant)]">
              {activeT.downloadSection.subtitle}
            </p>

            {/* 3 M3 Tonal Container Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {activeT.downloadSection.platforms.map((p, idx) => (
                <M3eCard
                  key={idx}
                  variant="filled"
                  actionable
                  onClick={() => setIsDownloadOpen(true)}
                  className="text-left cursor-pointer group"
                >
                  <div slot="content" className="p-7 flex flex-col justify-between h-full">
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
                  </div>
                </M3eCard>
              ))}
            </div>
          </section>

          {/* 6. M3 Expressive S.S.S. (FAQ) */}
          <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 space-y-2">
              <div className="flex justify-center">
                <M3eChip variant="elevated">
                  <span>{activeT.faq.chip}</span>
                </M3eChip>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
                {activeT.faq.title}
              </h2>
            </div>

            <M3eAccordion>
              {activeT.faq.items.map((item, idx) => (
                <M3eExpansionPanel key={idx}>
                  <span slot="header" className="font-semibold text-base text-[var(--md-sys-color-on-surface)]">
                    {item.q}
                  </span>
                  <div className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed py-3">
                    {item.a}
                  </div>
                </M3eExpansionPanel>
              ))}
            </M3eAccordion>
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
          <div className="flex items-center gap-6 font-semibold">
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              {activeT.footer.source}
            </a>
            <button
              onClick={() => navigateTo("docs")}
              className="hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              {activeT.footer.docs}
            </button>
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
  </M3eTheme>
  );
}
