import { useState, useEffect } from "react";
import {
  Download,
  Apple,
  Laptop,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Package,
  X
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="overlay active blur"
        onClick={onClose}
      />

      {/* Beer CSS Modal Dialog */}
      <dialog className="modal active max-w-lg w-full z-10 bg-m3-container border border-[var(--outline-variant)]/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)]/20">
          <div className="flex items-center gap-2.5">
            <div className="shape sunny tiny tertiary">
              <Package className="w-4 h-4" />
            </div>
            <h5 className="text-xl font-bold tracking-tight text-[var(--on-surface)] m-0">
              {downloadedAsset ? activeT.downloadStarted : activeT.headline}
            </h5>
          </div>
          <button 
            className="circle transparent small" 
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4">
          {downloadedAsset ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {activeT.downloadDesc}
              </p>
              <div className="flex justify-center">
                <div className="chip border">
                  <span>{downloadedAsset.name} • {formatBytes(downloadedAsset.size)}</span>
                </div>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  className="primary small"
                  onClick={() => handleDownload(downloadedAsset)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>{activeT.redownloadBtn}</span>
                </button>
                <button
                  className="transparent small"
                  onClick={onClose}
                >
                  <span>{activeT.closeBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--on-surface-variant)]">
                {activeT.supportingText}
              </p>

              {/* Package list using Beer CSS cards */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {assets.map((asset) => {
                  const info = getPlatformInfo(asset.name);
                  return (
                    <article
                      key={asset.id}
                      onClick={() => handleDownload(asset)}
                      className="border round p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[var(--primary)] transition-all bg-m3-container-lowest m-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
                          {info.icon}
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-sm font-semibold text-[var(--on-surface)] truncate">
                            {info.label}
                          </div>
                          <div className="text-xs font-mono text-[var(--on-surface-variant)] truncate">
                            {asset.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-[var(--on-surface-variant)] hidden sm:inline">
                          {formatBytes(asset.size)}
                        </span>
                        <button
                          className="primary circle small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset);
                          }}
                          aria-label={`Download ${info.label}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[var(--outline-variant)]/20 text-center">
                <a
                  className="button transparent small"
                  href={release?.html_url || "https://github.com/VastSea0/hilal-browser/releases"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{activeT.viewAllOnGh}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
