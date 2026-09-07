import { useState, useEffect } from "react";
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
      directLinkHint: "İndirme otomatik başlamadıysa doğrudan indirme bağlantısına tıklayın:",
      directDownload: "Doğrudan İndir",
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
      directLinkHint: "If the download didn't start automatically, click the direct download link:",
      directDownload: "Direct Download",
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleDownload = (asset: GithubAsset) => {
    setDownloadedAsset(asset);
    try {
      const link = document.createElement("a");
      link.href = asset.browser_download_url;
      link.download = asset.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(asset.browser_download_url, "_blank");
    }
  };

  function getPlatformInfo(name: string) {
    const n = name.toLowerCase();
    if (n.endsWith(".dmg")) return { label: activeT.platforms.macos, iconName: "desktop_mac" };
    if (n.endsWith(".installer.exe") || (n.endsWith(".exe") && !n.includes("zip")))
      return { label: activeT.platforms.windowsExe, iconName: "desktop_windows" };
    if (n.endsWith(".zip")) return { label: activeT.platforms.windowsZip, iconName: "desktop_windows" };
    if (n.endsWith(".deb")) return { label: activeT.platforms.linuxDeb, iconName: "terminal" };
    if (n.endsWith(".appimage")) return { label: activeT.platforms.linuxAppImage, iconName: "terminal" };
    return { label: activeT.platforms.linuxTar, iconName: "terminal" };
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative z-[102] w-full max-w-lg rounded-[28px] bg-m3-container text-[var(--on-surface)] border border-[var(--outline-variant)]/30 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--outline-variant)]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <i className="text-xl">cloud_download</i>
            </div>
            <div>
              <h5 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--on-surface)] m-0 leading-tight">
                {downloadedAsset ? activeT.downloadStarted : activeT.headline}
              </h5>
              <p className="text-xs text-[var(--on-surface-variant)] m-0 mt-0.5">
                {downloadedAsset ? activeT.downloadDesc : activeT.supportingText}
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/10 transition-colors cursor-pointer border-0 bg-transparent shrink-0 ml-2" 
            onClick={onClose}
            aria-label={activeT.closeBtn}
          >
            <i className="text-xl">close</i>
          </button>
        </div>

        <div className="pt-4 overflow-y-auto pr-1">
          {downloadedAsset ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <i className="text-3xl text-emerald-500">check_circle</i>
              </div>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {activeT.downloadDesc}
              </p>
              <div className="flex justify-center">
                <div className="px-3.5 py-1.5 rounded-full bg-m3-container-high border border-[var(--outline-variant)]/30 text-xs font-mono text-[var(--on-surface)]">
                  <span>{downloadedAsset.name} • {formatBytes(downloadedAsset.size)}</span>
                </div>
              </div>
              <div className="pt-2 text-xs text-[var(--on-surface-variant)]">
                <span>{activeT.directLinkHint} </span>
                <a
                  href={downloadedAsset.browser_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={downloadedAsset.name}
                  className="text-[var(--primary)] font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  {activeT.directDownload}
                </a>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] gap-2 cursor-pointer font-semibold text-xs flex items-center border-0 shadow-sm hover:shadow"
                  onClick={() => handleDownload(downloadedAsset)}
                >
                  <i className="text-base">download</i>
                  <span>{activeT.redownloadBtn}</span>
                </button>
                <button
                  type="button"
                  className="h-10 px-5 rounded-full text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 cursor-pointer font-semibold text-xs border-0 bg-transparent transition-colors"
                  onClick={onClose}
                >
                  <span>{activeT.closeBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Package list using clean M3 Expressive cards */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 py-1">
                {assets.map((asset) => {
                  const info = getPlatformInfo(asset.name);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleDownload(asset)}
                      className="p-4 rounded-2xl bg-m3-container-lowest border border-[var(--outline-variant)]/25 hover:border-[var(--primary)] hover:bg-[var(--primary-container)]/10 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[var(--primary-container)] text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <i className="text-2xl">{info.iconName}</i>
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-sm font-bold text-[var(--on-surface)] truncate">
                            {info.label}
                          </div>
                          <div className="text-xs font-mono text-[var(--on-surface-variant)] truncate mt-0.5">
                            {asset.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-m3-container-high text-[11px] font-mono text-[var(--on-surface-variant)] hidden sm:inline-block">
                          {formatBytes(asset.size)}
                        </span>
                        <div
                          className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-sm group-hover:scale-110 active:scale-95 transition-transform"
                          title={`Download ${info.label}`}
                        >
                          <i className="text-xl">download</i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[var(--outline-variant)]/20 text-center">
                <a
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-container)]/25 transition-colors cursor-pointer no-underline border-0 bg-transparent"
                  href={release?.html_url || "https://github.com/VastSea0/hilal-browser/releases"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{activeT.viewAllOnGh}</span>
                  <i className="text-base">open_in_new</i>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
