import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Github,
  Download,
  Menu,
  X,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface NavbarProps {
  lang: "tr" | "en";
  setLang: (lang: "tr" | "en") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenDownload: () => void;
  scrollToSection: (id: string) => void;
}

export default function Navbar({
  lang,
  setLang,
  theme,
  toggleTheme,
  onOpenDownload,
  scrollToSection,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = {
    tr: [
      { label: "Arayüz", id: "features" },
      { label: "Çalışma Alanları", id: "features" },
      { label: "Mimari", id: "architecture" },
      { label: "İndir", id: "download" },
      { label: "S.S.S.", id: "faq" },
    ],
    en: [
      { label: "Interface", id: "features" },
      { label: "Workspaces", id: "features" },
      { label: "Architecture", id: "architecture" },
      { label: "Download", id: "download" },
      { label: "FAQ", id: "faq" },
    ],
  };

  const activeItems = navItems[lang] || navItems.tr;

  const handleNavClick = (id: string) => {
    scrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
      <div
        className={`mx-auto max-w-5xl pointer-events-auto h-16 rounded-full transition-all duration-300 px-4 sm:px-6 flex items-center justify-between border ${
          scrolled
            ? "bg-m3-container/90 backdrop-blur-2xl border-[var(--md-sys-color-outline-variant)]/40 shadow-xl shadow-black/10"
            : "bg-m3-container/70 backdrop-blur-xl border-[var(--md-sys-color-outline-variant)]/25 shadow-md"
        }`}
      >
        {/* Brand Logo & Alpha Badge */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center p-1 shadow-sm">
            <img
              src="/default128.png"
              alt="Hilal Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-[var(--md-sys-color-on-surface)]">
              Hilal
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
              Alpha
            </span>
          </div>
        </motion.div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/20 shadow-inner">
          {activeItems.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              onClick={() => handleNavClick(item.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-secondary-container)]/40 transition-all"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Chip */}
          <button
            onClick={() => setLang(lang === "tr" ? "en" : "tr")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-secondary-container)] transition-colors m3-state-layer"
            title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
          >
            {lang === "tr" ? "EN" : "TR"}
          </button>

          {/* Theme Toggle Chip */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-secondary-container)] transition-colors m3-state-layer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* GitHub Repo Button (Desktop) */}
          <a
            href="https://github.com/VastSea0/hilal-browser"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex w-9 h-9 rounded-full items-center justify-center bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-secondary-container)] transition-colors m3-state-layer"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Primary CTA Pill Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenDownload}
            className="h-10 px-5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{lang === "tr" ? "İndir" : "Download"}</span>
          </motion.button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-m3-container-lowest border border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface)]"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto md:hidden mx-auto mt-2 max-w-5xl rounded-[28px] p-5 bg-m3-container border border-[var(--md-sys-color-outline-variant)]/40 shadow-2xl space-y-3"
          >
            <div className="space-y-1">
              {activeItems.map((item, index) => (
                <button
                  key={`mobile-${item.label}-${index}`}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-secondary-container)] transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">→</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-between">
              <a
                href="https://github.com/VastSea0/hilal-browser"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-[var(--md-sys-color-primary)] px-3 py-2 rounded-xl hover:bg-m3-container-lowest transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => {
                  onOpenDownload();
                  setMobileMenuOpen(false);
                }}
                className="px-5 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs"
              >
                {lang === "tr" ? "Alpha İndir" : "Get Alpha"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
