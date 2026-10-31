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
  pickReleaseFor,
  formatBytes
} from "./utils/github";

import DownloadModal from "./components/DownloadModal";
import ChangelogPage from "./components/ChangelogPage";
import DocsPage from "./components/DocsPage";
import PrivacyPage from "./components/PrivacyPage";
import { DesktopFrame, PhoneFrame, screen } from "./components/DeviceFrames";
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

  const [currentView, setCurrentView] = useState<"home" | "changelog" | "docs" | "privacy">(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/docs" || h === "#docs" || h.startsWith("#docs/") || p === "/mobile" || h === "#mobile") {
        return "docs";
      }
      if (p === "/changelog" || h === "#changelog" || h.startsWith("#v0.")) {
        return "changelog";
      }
      if (p === "/privacy" || h === "#privacy") {
        return "privacy";
      }
    }
    return "home";
  });

  const [releases, setReleases] = useState<GithubRelease[]>([]);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [detectedOS, setDetectedOS] = useState<string>("other");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [androidTab, setAndroidTab] = useState<number>(0);
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  useEffect(() => {
    setDetectedOS(detectOS());

    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/docs" || h === "#docs" || h.startsWith("#docs/") || p === "/mobile" || h === "#mobile") {
        setCurrentView("docs");
      } else if (p === "/changelog" || h === "#changelog" || h.startsWith("#v0.")) {
        setCurrentView("changelog");
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
    const body = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
      body.classList.remove("light");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      body.classList.add("light");
    }
    if (typeof (window as any).ui === "function") {
      try {
        (window as any).ui("mode", theme);
      } catch {}
    }
    localStorage.setItem("hilal-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("hilal-lang", lang);
  }, [lang]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setReleases(await fetchGithubReleases());
      } catch {
        setReleases([]);
      }
    };
    loadData();
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const navigateTo = (view: "home" | "changelog" | "docs" | "privacy", targetId?: string) => {
    setCurrentView(view);
    if (view === "changelog") {
      window.history.pushState(null, "", "#changelog");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (view === "docs") {
      window.history.pushState(null, "", targetId ? `#docs/${targetId}` : "#docs");
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

  const activeRelease =
    pickReleaseFor(releases, detectedOS as any) || (lang === "en" ? FALLBACK_RELEASE_EN : FALLBACK_RELEASE_TR);
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

  const androidFeatures =
    lang === "tr"
      ? [
          { shot: "start", icon: "home", title: "Sade bir başlangıç", description: "Sık ziyaret ettiğiniz siteler ve yer imleriniz, başparmağınızın ulaştığı yerde." },
          { shot: "page", icon: "swipe", title: "Hareketlerle kullanılan adres çubuğu", description: "Sekme değiştirmek için çubuğu sola veya sağa kaydırın, tüm sekmeler için yukarı çekin, hızlı işlemler için basılı tutun." },
          { shot: "search", icon: "bolt", title: "Arama kestirmeleri", description: "!w, !yt ya da !gh yazın; arama doğrudan o sitede açılır. Öneriler klavyenin hemen üstünde." },
          { shot: "tabs", icon: "tab", title: "Sekme genel görünümü", description: "Açık sekmeler, sayfaların küçük resimleriyle. Gizli sekmeler ayrı tutulur." },
          { shot: "private", icon: "visibility_off", title: "Gizli sekmeler", description: "Kapattığınızda geçmişi, çerezleri ve site verilerini unutur. Gizli sekmelerden arama önerisi istenmez." },
          { shot: "settings", icon: "tune", title: "Size ait ayarlar", description: "Arama motoru, tema, duvar kağıdı renkleri, koyu web siteleri ve kapatılabilir anonim istatistik." },
        ]
      : [
          { shot: "start", icon: "home", title: "A calm start page", description: "Your most visited sites and bookmarks, right where your thumb is." },
          { shot: "page", icon: "swipe", title: "An address bar you swipe", description: "Swipe the bar left or right to switch tabs, pull it up for all tabs, and hold it for quick actions." },
          { shot: "search", icon: "bolt", title: "Search shortcuts", description: "Type !w, !yt or !gh and the search opens on that site. Suggestions sit just above the keyboard." },
          { shot: "tabs", icon: "tab", title: "Tab overview", description: "Your open tabs with page previews. Private tabs are kept apart." },
          { shot: "private", icon: "visibility_off", title: "Private tabs", description: "Hilal forgets their history, cookies and site data when you close them, and never requests search suggestions from them." },
          { shot: "settings", icon: "tune", title: "Settings that are yours", description: "Search engine, theme, wallpaper colors, dark websites, and anonymous statistics you can turn off." },
        ];

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
          "Dikey sekmeler, izole çalışma alanları ve dahili reklam engelleyiciyle gelen açık kaynaklı masaüstü ve Android tarayıcısı.",
        downloadBtn: {
          macos: "macOS için İndir",
          windows: "Windows için İndir",
          linux: "Linux için İndir",
          android: "Android için İndir",
          other: "İndir",
        },
        viewAllDownloads: "Tüm platformlar (.dmg, .exe, .deb, .zip)",
      },
      stories: [
        {
          chip: "Özelleştirme",
          title: "Çalışma şeklinize uyum sağlayan arayüz.",
          description:
            "Dikey sekmeli kenar çubuğu ile yatay sekme şeridi arasında istediğiniz an geçin. Her çalışma alanının kendi vurgu rengi var; tarayıcı ve yeni sekme sayfası o renge bürünür.",
          shot: "layout",
          alt: "Yatay sekme düzeni ve turuncu vurgu rengiyle Hilal",
        },
        {
          chip: "Çalışma Alanları",
          title: "İş ve kişisel hesapları birbirinden ayırın.",
          description:
            "Her çalışma alanı kendi çerez ve oturum kapsayıcısında çalışır. Aynı siteye farklı hesaplarla, ayrı pencereler açmadan girebilirsiniz.",
          shot: "workspaces",
          alt: "Hilal'de iş çalışma alanında açık GitHub sekmesi",
        },
        {
          chip: "Gizlilik",
          title: "Dahili uBlock Origin, telemetrisiz masaüstü.",
          description:
            "uBlock Origin kurulu gelir. Dengeli, Sıkı ve Maksimum gizlilik profilleri arasında seçim yapabilirsiniz. Masaüstü sürümü hiçbir kullanım verisi göndermez.",
          shot: "privacy",
          alt: "Hilal ayarlarında gizlilik seviyeleri ve çalışma alanı renkleri",
        },
        {
          chip: "Kestirmeler",
          title: "Aramayı doğrudan hedefine gönderin.",
          description:
            "Adres çubuğuna !w, !yt veya !gh gibi bir kestirme yazın; arama doğrudan Wikipedia, YouTube ya da GitHub'da açılır. Kendi kestirmelerinizi ayarlardan ekleyebilirsiniz.",
          shot: "bangs",
          alt: "Adres çubuğunda !w kestirmesi önerisi",
        },
        {
          chip: "Eklentiler",
          title: "Firefox eklenti ekosistemiyle tam uyumlu.",
          description:
            "addons.mozilla.org'daki eklentileri doğrudan kurup kullanabilirsiniz. Hilal, Firefox ESR'ın Gecko motoru üzerinde çalışır.",
          shot: "addons",
          alt: "Hilal eklenti yöneticisinde uBlock Origin",
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
          {
            name: "Android",
            spec: "GeckoView • APK ve Google Play",
            iconName: "smartphone",
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
            a: "Masaüstü sürümü hiçbir telemetri göndermez. Android uygulaması anonim kurulum ve kullanım istatistikleri gönderir; tarama geçmişi veya kişisel veri toplanmaz ve bu gönderim ayarlardan kapatılabilir. Ayrıntılar Gizlilik Politikası'ndadır.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Projesi. Mozilla Kamu Lisansı (MPL 2.0).",
        authorBy: "Egehan Kahraman",
        source: "Kaynak Kodu",
        docs: "Belgeler",
        privacy: "Gizlilik Politikası",
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
          "An open-source desktop and Android browser with vertical tabs, isolated workspaces, and a built-in ad blocker.",
        downloadBtn: {
          macos: "Download for macOS",
          windows: "Download for Windows",
          linux: "Download for Linux",
          android: "Download for Android",
          other: "Download",
        },
        viewAllDownloads: "All platforms (.dmg, .exe, .deb, .zip)",
      },
      stories: [
        {
          chip: "Customization",
          title: "An interface that adapts to how you work.",
          description:
            "Switch between vertical sidebar tabs and a horizontal tab strip at any time. Each workspace has its own accent color, and the browser and new tab page follow it.",
          shot: "layout",
          alt: "Hilal with horizontal tabs and an orange accent color",
        },
        {
          chip: "Workspaces",
          title: "Keep work and personal accounts separated.",
          description:
            "Each workspace runs in its own cookie and login container, so you can sign in to the same site with different accounts without extra windows.",
          shot: "workspaces",
          alt: "A GitHub tab in Hilal's Work workspace",
        },
        {
          chip: "Privacy",
          title: "Built-in uBlock Origin, no desktop telemetry.",
          description:
            "uBlock Origin comes installed. Choose between the Balanced, Strict and Maximum privacy profiles. The desktop browser sends no usage data at all.",
          shot: "privacy",
          alt: "Privacy levels and workspace colors in Hilal's settings",
        },
        {
          chip: "Shortcuts",
          title: "Send a search straight to the right site.",
          description:
            "Type a shortcut such as !w, !yt or !gh in the address bar and the search opens directly on Wikipedia, YouTube or GitHub. Add your own in settings.",
          shot: "bangs",
          alt: "The !w shortcut suggested in the address bar",
        },
        {
          chip: "Add-ons",
          title: "Compatible with the Firefox add-on ecosystem.",
          description:
            "Install extensions straight from addons.mozilla.org. Hilal runs on the Gecko engine of Firefox ESR.",
          shot: "addons",
          alt: "uBlock Origin in Hilal's add-ons manager",
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
          {
            name: "Android",
            spec: "GeckoView • APK & Google Play",
            iconName: "smartphone",
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
            a: "The desktop browser sends no telemetry. The Android app sends anonymous install and usage statistics, never browsing history or personal data, and you can turn this off in settings. See the Privacy Policy for details.",
          },
        ],
      },
      footer: {
        copyright: "Hilal Browser Project. Mozilla Public License 2.0.",
        authorBy: "Egehan Kahraman",
        source: "Source Code",
        docs: "Docs",
        privacy: "Privacy Policy",
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
              className="relative mt-12 sm:mt-16 max-w-5xl mx-auto sm:pr-16 md:pr-20"
            >
              <DesktopFrame
                src={screen("desktop", theme, "newtab")}
                alt={lang === "tr" ? "Hilal'in yeni sekme sayfası" : "Hilal's new tab page"}
                eager
              />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: 0.45 }}
                className="absolute -bottom-10 right-0 w-[24%] min-w-[110px] max-w-[210px]"
              >
                <PhoneFrame
                  src={screen("android", theme, "start")}
                  alt={lang === "tr" ? "Hilal Android başlangıç ekranı" : "Hilal for Android start page"}
                  eager
                />
              </motion.div>
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
                <div className="lg:col-span-7">
                  <DesktopFrame
                    src={screen("desktop", theme, activeT.stories[activeTab].shot)}
                    alt={activeT.stories[activeTab].alt}
                    eager
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Android */}
          <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6" id="android">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-semibold">
                <i className="material-symbols-outlined text-[14px]">smartphone</i>
                <span>Android 2.0</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--on-surface)]">
                {lang === "tr" ? "Başparmağınızla yönetin." : "Built for your thumb."}
              </h2>
              <p className="text-sm sm:text-base text-[var(--on-surface-variant)] leading-relaxed">
                {lang === "tr"
                  ? "Hilal'in Android uygulaması GeckoView üzerinde, Material 3 Expressive ile sıfırdan yazıldı."
                  : "Hilal for Android is a new app built on GeckoView with Material 3 Expressive."}
              </p>
            </div>

            <div className="p-6 sm:p-10 rounded-[36px] bg-m3-container-low border border-[var(--outline-variant)]/20 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center shadow-lg">
              <div className="md:col-span-7 flex flex-col gap-2">
                {androidFeatures.map((feature, idx) => (
                  <div
                    key={feature.shot}
                    role="button"
                    tabIndex={0}
                    aria-pressed={androidTab === idx}
                    onClick={() => setAndroidTab(idx)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setAndroidTab(idx);
                      }
                    }}
                    className={`text-left px-5 py-4 rounded-[24px] transition-colors cursor-pointer select-none ${
                      androidTab === idx
                        ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                        : "bg-transparent text-[var(--on-surface)] hover:bg-m3-container"
                    }`}
                  >
                    <span className="flex items-center gap-3 text-base font-bold">
                      <i className="material-symbols-outlined text-[22px]">{feature.icon}</i>
                      {feature.title}
                    </span>
                    {androidTab === idx && (
                      <span className="block mt-1.5 pl-[34px] text-sm leading-relaxed">
                        {feature.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="md:col-span-5 flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={androidFeatures[androidTab].shot}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={springTransition}
                    className="w-[230px] sm:w-[260px]"
                  >
                    <PhoneFrame
                      src={screen("android", theme, androidFeatures[androidTab].shot)}
                      alt={androidFeatures[androidTab].title}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
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
              onClick={() => navigateTo("privacy")}
              className="hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
            >
              {activeT.footer.privacy}
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
