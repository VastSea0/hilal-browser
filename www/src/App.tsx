import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

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
            iconName: "desktop_mac",
          },
          {
            name: "Windows",
            spec: "Windows 10/11 • 64-bit .exe & Taşınabilir .zip",
            iconName: "desktop_windows",
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian .deb • AppImage • Tarball",
            iconName: "terminal",
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
            iconName: "desktop_mac",
          },
          {
            name: "Windows",
            spec: "Windows 10/11 • 64-bit .exe & Portable .zip",
            iconName: "desktop_windows",
          },
          {
            name: "Linux",
            spec: "Ubuntu / Debian .deb • AppImage • Tarball",
            iconName: "terminal",
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
    <div className="min-h-screen bg-m3-surface text-[var(--on-surface)] selection:bg-[var(--primary-container)] selection:text-[var(--on-primary-container)]">
      {/* 1. M3 Floating Top App Bar - Solid Color, No Glass */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <div className="mx-auto max-w-5xl pointer-events-auto h-14 rounded-full bg-white dark:bg-[#1e2025] border border-[var(--outline-variant)]/30 px-4 sm:px-5 flex items-center justify-between shadow-md transition-all">
          {/* Logo & Name */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("home")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary-container)]/60 flex items-center justify-center p-1.5">
              <img
                src="/default128.png"
                alt="Hilal Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--on-surface)]">
              Hilal
            </span>
          </motion.div>

          {/* Center Nav Links - Clean & Consistent Typography */}
          <div className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollToId("features")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 transition-colors cursor-pointer border-0 bg-transparent"
            >
              {activeT.nav.features}
            </button>
            <button
              type="button"
              onClick={() => scrollToId("architecture")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 transition-colors cursor-pointer border-0 bg-transparent"
            >
              {activeT.nav.architecture}
            </button>
            <button
              type="button"
              onClick={() => navigateTo("docs")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                currentView === "docs"
                  ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                  : "bg-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8"
              }`}
            >
              <span>{activeT.nav.docs}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo("changelog")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                currentView === "changelog"
                  ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                  : "bg-transparent text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8"
              }`}
            >
              <span>{activeT.nav.changelog}</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToId("download")}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 transition-colors cursor-pointer border-0 bg-transparent"
            >
              {activeT.nav.download}
            </button>
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 transition-colors no-underline"
            >
              <span>{activeT.nav.github}</span>
            </a>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-1.5">
            {/* Lang Chip */}
            <button
              type="button"
              onClick={() => setLang(lang === "tr" ? "en" : "tr")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 transition-colors cursor-pointer border-0 bg-transparent"
              title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
            >
              {lang === "tr" ? "EN" : "TR"}
            </button>

            {/* Theme Chip */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 transition-colors cursor-pointer border-0 bg-transparent"
              aria-label="Theme Toggle"
            >
              <i className="text-lg">{isDark ? "light_mode" : "dark_mode"}</i>
            </button>

            {/* CTA Pill Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDownloadOpen(true)}
              className="h-9 px-4 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer ml-1 border-0"
            >
              <i className="text-base">download</i>
              <span>{activeT.nav.getHilal}</span>
            </motion.button>
          </div>
        </div>
      </div>

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
              <motion.div
                variants={m3FadeIn}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-semibold tracking-wide"
              >
                <i className="material-symbols-outlined text-[16px] text-[var(--primary)]">auto_awesome</i>
                <span>{activeT.hero.chip}</span>
              </motion.div>

              {/* M3 Emphasized Display Large Tagline */}
              <motion.h1
                variants={m3FadeIn}
                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[var(--on-surface)] leading-[1.05]"
                style={{ fontStretch: "110%" }}
              >
                {activeT.hero.tagline}
              </motion.h1>

              {/* M3 Body Large Subtitle */}
              <motion.p
                variants={m3FadeIn}
                className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[var(--on-surface-variant)] leading-relaxed font-normal"
              >
                {activeT.hero.subtitle}
              </motion.p>

              {/* M3 Actions (Filled & Tonal Pill Buttons) */}
              <motion.div
                variants={m3FadeIn}
                className="pt-4 flex flex-col items-center gap-4"
              >
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Primary Filled Button - BLUE! */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsDownloadOpen(true)}
                    className="h-14 px-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-0"
                  >
                    <i className="text-xl">
                      {detectedOS === "macos" ? "desktop_mac" : detectedOS === "windows" ? "desktop_windows" : "download"}
                    </i>
                    <span>{getDynamicBtnLabel()}</span>
                  </motion.button>

                  {/* Changelog Pill Button */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigateTo("changelog")}
                    className="h-14 px-7 rounded-full bg-m3-container text-[var(--on-surface)] border border-[var(--outline-variant)]/50 font-semibold text-sm sm:text-base flex items-center gap-2.5 hover:bg-m3-container-high transition-colors cursor-pointer"
                  >
                    <i className="text-xl text-[var(--primary)]">history</i>
                    <span>{activeT.nav.changelog}</span>
                  </motion.button>

                  {/* GitHub Repo Button */}
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    href="https://github.com/VastSea0/hilal-browser"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 px-7 rounded-full bg-m3-container text-[var(--on-surface)] border border-[var(--outline-variant)]/50 font-semibold text-sm sm:text-base flex items-center gap-2.5 hover:bg-m3-container-high transition-colors no-underline"
                  >
                    <GithubIcon className="w-5 h-5" />
                    <span>GitHub Repo</span>
                  </motion.a>
                </div>

                {/* Supporting artifact note */}
                {recommendedAsset && (
                  <p className="text-xs font-mono text-[var(--on-surface-variant)]">
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
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] text-xs font-semibold">
                <i className="material-symbols-outlined text-[14px]">layers</i>
                <span>{lang === "tr" ? "Öne Çıkan Özellikler" : "Key Highlights"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--on-surface)]">
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
                  className={`h-11 px-5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-0 ${
                    activeTab === idx
                      ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                      : "bg-m3-container text-[var(--on-surface-variant)] hover:bg-m3-container-high"
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
                className="p-6 sm:p-10 rounded-[36px] bg-m3-container-low border border-[var(--outline-variant)]/20 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center shadow-lg"
              >
                {/* Story Text Side */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <span className="px-3.5 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-semibold inline-block">
                    {activeT.stories[activeTab].chip}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--on-surface)] leading-snug">
                    {activeT.stories[activeTab].title}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--on-surface-variant)] leading-relaxed font-normal">
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
              className="p-8 sm:p-12 rounded-[36px] bg-m3-container border border-[var(--outline-variant)]/20 text-center space-y-6 shadow-lg"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-semibold">
                <i className="material-symbols-outlined text-[14px]">memory</i>
                <span>{activeT.openSourceSection.chip}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--on-surface)] max-w-2xl mx-auto">
                {activeT.openSourceSection.title}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
                {activeT.openSourceSection.description}
              </p>

              {/* M3 Tonal Interactive Terminal Card */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-m3-container-lowest border border-[var(--outline-variant)]/20 text-xs font-mono text-[var(--on-surface)] shadow-inner">
                  <span className="text-[var(--primary)] font-bold">$</span>
                  <span className="select-all truncate max-w-[260px] sm:max-w-md">
                    git clone https://github.com/VastSea0/hilal-browser.git && cd hilal-browser && ./bin/hil setup
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-m3-container hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-colors cursor-pointer border-0"
                    title="Copy Command"
                  >
                    <i className={`text-base ${copiedClone ? "text-emerald-500" : ""}`}>
                      {copiedClone ? "check" : "content_copy"}
                    </i>
                  </button>
                </div>
              </div>

              {/* Contributors Grid */}
              <div className="pt-6 border-t border-[var(--outline-variant)]/20">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] flex items-center gap-1.5">
                    <i className="text-base text-[var(--primary)]">group</i>
                    <span>{lang === "tr" ? "Projeye Katkıda Bulunanlar" : "Project Contributors"}</span>
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {CONTRIBUTORS_DATA.map((c) => (
                      <a
                        key={c.username}
                        href={c.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-m3-container-lowest hover:bg-m3-container-high border border-[var(--outline-variant)]/30 text-xs transition-all hover:scale-105 group no-underline"
                        title={`${c.name} (@${c.username}) • ${c.contributions} commit`}
                      >
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-[var(--outline-variant)]/40"
                        />
                        <span className="font-semibold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-m3-container text-[var(--on-surface-variant)]">
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
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-semibold mb-3">
              <i className="text-base">inventory_2</i>
              <span>{activeT.downloadSection.chip}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--on-surface)]">
              {activeT.downloadSection.title}
            </h2>
            <p className="mt-2 text-base text-[var(--on-surface-variant)]">
              {activeT.downloadSection.subtitle}
            </p>

            {/* 3 M3 Tonal Container Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {activeT.downloadSection.platforms.map((p, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={springTransition}
                  onClick={() => setIsDownloadOpen(true)}
                  className="p-7 rounded-[32px] bg-m3-container-low hover:bg-m3-container border border-[var(--outline-variant)]/20 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-lg"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <i className="text-2xl">{p.iconName}</i>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--on-surface)]">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--on-surface-variant)] font-normal">
                      {p.spec}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                    <span>{activeT.downloadSection.directDownload}</span>
                    <i className="text-base">arrow_forward</i>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 6. M3 Expressive S.S.S. (FAQ) */}
          <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-semibold">
                <i className="text-base">help_outline</i>
                <span>{activeT.faq.chip}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--on-surface)]">
                {activeT.faq.title}
              </h2>
            </div>

            <div className="space-y-3">
              {activeT.faq.items.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl bg-m3-container-low border border-[var(--outline-variant)]/20 p-5 cursor-pointer transition-all open:bg-m3-container"
                >
                  <summary className="flex items-center justify-between font-semibold text-sm sm:text-base text-[var(--on-surface)] list-none select-none">
                    <span>{item.q}</span>
                    <i className="text-xl text-[var(--on-surface-variant)] transition-transform duration-200 group-open:rotate-180">expand_more</i>
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--on-surface-variant)] leading-relaxed pl-0">
                    {item.a}
                  </p>
                </details>
              ))}
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
  );
}
