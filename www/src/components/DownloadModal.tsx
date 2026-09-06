import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  X,
  Apple,
  Laptop,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Package
} from "lucide-react";
import { GithubRelease, GithubAsset } from "../types";
import { formatBytes } from "../utils/github";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: GithubRelease | null;
  lang: "tr" | "en";
}

export default function DownloadModal({
  isOpen,
  onClose,
  release,
  lang,
}: DownloadModalProps) {
  const [downloadedAsset, setDownloadedAsset] = useState<GithubAsset | null>(null);

  const t = {
    tr: {
      headline: "Hilal Browser Kurulum Paketleri",
      supportingText: "İşletim sisteminize uygun resmi derleme paketini seçin.",
      downloadStarted: "İndirme Başlatıldı",
      downloadDesc: "Dosya doğrudan GitHub Releases sunucularından aktarılıyor.",
      closeBtn: "Kapat",
      redownloadBtn: "Tekrar İndir",
      viewAllOnGh: "GitHub Releases'de Tümünü Gör",
      platforms: {
        macos: "macOS Universal (.dmg)",
        windowsExe: "Windows Kurulum Paketi (.exe)",
        windowsZip: "Windows Taşınabilir (.zip)",
        linuxDeb: "Linux Debian / Ubuntu (.deb)",
        linuxAppImage: "Linux Evrensel (.AppImage)",
        linuxTar: "Linux Kaynak Paketi (.tar.gz)"
      }
    },
    en: {
      headline: "Download Hilal Browser",
      supportingText: "Select the official build artifact for your system.",
      downloadStarted: "Download Initiated",
      downloadDesc: "Transferring directly from GitHub Releases.",
      closeBtn: "Close",
      redownloadBtn: "Download Again",
      viewAllOnGh: "View All on GitHub Releases",
      platforms: {
        macos: "macOS Universal (.dmg)",
        windowsExe: "Windows Installer (.exe)",
        windowsZip: "Windows Portable (.zip)",
        linuxDeb: "Linux Debian / Ubuntu (.deb)",
        linuxAppImage: "Linux Universal (.AppImage)",
        linuxTar: "Linux Tarball (.tar.gz)"
      }
    }
  };

  const activeT = t[lang] || t.tr;
  const assets = release?.assets || [];

  useEffect(() => {
    if (isOpen) {
      setDownloadedAsset(null);
    }
  }, [isOpen]);

  const handleDownload = (asset: GithubAsset) => {
    setDownloadedAsset(asset);
    window.location.href = asset.browser_download_url;
  };

  function getPlatformInfo(name: string) {
    const n = name.toLowerCase();
    if (n.endsWith(".dmg")) return { label: activeT.platforms.macos, icon: <Apple className="w-5 h-5" /> };
    if (n.endsWith(".installer.exe") || (n.endsWith(".exe") && !n.includes("zip")))
      return { label: activeT.platforms.windowsExe, icon: <Laptop className="w-5 h-5" /> };
    if (n.endsWith(".zip")) return { label: activeT.platforms.windowsZip, icon: <Laptop className="w-5 h-5" /> };
    if (n.endsWith(".deb")) return { label: activeT.platforms.linuxDeb, icon: <Terminal className="w-5 h-5" /> };
    if (n.endsWith(".appimage")) return { label: activeT.platforms.linuxAppImage, icon: <Terminal className="w-5 h-5" /> };
    return { label: activeT.platforms.linuxTar, icon: <Terminal className="w-5 h-5" /> };
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* M3 Scrim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* M3 Expressive Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-lg rounded-[32px] p-6 sm:p-8 bg-m3-container-high text-[var(--md-sys-color-on-surface)] shadow-2xl border border-[var(--md-sys-color-outline-variant)]/20 overflow-hidden"
          >
            {/* Header Icon + Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors m3-state-layer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {downloadedAsset ? (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                  {activeT.downloadStarted}
                </h3>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  {activeT.downloadDesc}
                </p>
                <div className="p-3 rounded-[20px] bg-m3-container text-xs font-mono text-[var(--md-sys-color-on-surface)] inline-block">
                  {downloadedAsset.name} • {formatBytes(downloadedAsset.size)}
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => handleDownload(downloadedAsset)}
                    className="px-6 py-3 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md"
                  >
                    {activeT.redownloadBtn}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-m3-container-lowest text-[var(--md-sys-color-on-surface)] font-medium text-xs hover:bg-m3-container transition-colors"
                  >
                    {activeT.closeBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                    {activeT.headline}
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    {activeT.supportingText}
                  </p>
                </div>

                {/* Package list */}
                <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                  {assets.map((asset) => {
                    const info = getPlatformInfo(asset.name);
                    return (
                      <button
                        key={asset.id}
                        onClick={() => handleDownload(asset)}
                        className="w-full flex items-center justify-between p-4 rounded-[22px] bg-m3-container-lowest hover:bg-[var(--md-sys-color-secondary-container)]/30 border border-[var(--md-sys-color-outline-variant)]/20 transition-all text-left group cursor-pointer m3-state-layer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-m3-container flex items-center justify-center text-[var(--md-sys-color-primary)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors">
                            {info.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                              {info.label}
                            </div>
                            <div className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                              {asset.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                            {formatBytes(asset.size)}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-sm">
                            <Download className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--md-sys-color-outline-variant)]/30 text-center">
                  <a
                    href={release?.html_url || "https://github.com/VastSea0/hilal-browser/releases"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline"
                  >
                    <span>{activeT.viewAllOnGh}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
