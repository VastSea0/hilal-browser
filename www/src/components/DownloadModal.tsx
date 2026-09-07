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
      downloadBtn: "İndir",
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
      downloadBtn: "Download",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card: Spacious M3 container */}
      <div 
        className="relative z-[102] w-full max-w-2xl lg:max-w-3xl rounded-[32px] bg-m3-container text-[var(--on-surface)] border border-[var(--outline-variant)]/30 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--outline-variant)]/20 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-container)] text-[var(--primary)] flex items-center justify-center shrink-0 shadow-xs">
              <i className="text-2xl">cloud_download</i>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--on-surface)] m-0 leading-tight">
                  {downloadedAsset ? activeT.downloadStarted : activeT.headline}
                </h3>
                {release?.tag_name && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-mono font-semibold">
                    {release.tag_name}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] m-0 mt-1">
                {downloadedAsset ? activeT.downloadDesc : activeT.supportingText}
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--on-surface)]/10 transition-colors cursor-pointer border-0 bg-transparent shrink-0 ml-2" 
            onClick={onClose}
            aria-label={activeT.closeBtn}
          >
            <i className="text-2xl">close</i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="pt-5 overflow-y-auto pr-1">
          {downloadedAsset ? (
            <div className="text-center py-8 px-4 space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <i className="text-4xl text-emerald-500">check_circle</i>
              </div>
              <div>
                <h4 className="text-xl font-bold text-[var(--on-surface)] m-0">
                  {activeT.downloadStarted}
                </h4>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1.5 max-w-md mx-auto">
                  {activeT.downloadDesc}
                </p>
              </div>
              <div className="flex justify-center">
                <div className="px-4 py-2 rounded-full bg-m3-container-high border border-[var(--outline-variant)]/30 text-xs sm:text-sm font-mono text-[var(--on-surface)] flex items-center gap-2 shadow-xs">
                  <i className="text-base text-[var(--primary)]">inventory_2</i>
                  <span className="font-semibold">{downloadedAsset.name}</span>
                  <span className="text-[var(--on-surface-variant)]">•</span>
                  <span>{formatBytes(downloadedAsset.size)}</span>
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
                  className="h-11 px-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] gap-2 cursor-pointer font-semibold text-xs flex items-center border-0 shadow-sm hover:shadow transition-all"
                  onClick={() => handleDownload(downloadedAsset)}
                >
                  <i className="text-base">download</i>
                  <span>{activeT.redownloadBtn}</span>
                </button>
                <button
                  type="button"
                  className="h-11 px-6 rounded-full text-[var(--on-surface)] hover:bg-[var(--on-surface)]/8 cursor-pointer font-semibold text-xs border-0 bg-transparent transition-colors"
                  onClick={onClose}
                >
                  <span>{activeT.closeBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Package list using spacious M3 Expressive cards */}
              <div className="space-y-3.5 max-h-[58vh] overflow-y-auto pr-1 py-1">
                {assets.map((asset) => {
                  const info = getPlatformInfo(asset.name);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleDownload(asset)}
                      className="p-4 sm:p-5 rounded-2xl bg-m3-container-lowest border border-[var(--outline-variant)]/30 hover:border-[var(--primary)] hover:bg-[var(--primary-container)]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all shadow-xs group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-container)] text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                          <i className="text-2xl">{info.iconName}</i>
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-[var(--on-surface)]">
                              {info.label}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-m3-container-high text-[11px] font-mono text-[var(--on-surface-variant)] font-medium">
                              {formatBytes(asset.size)}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-[var(--on-surface-variant)] truncate mt-1">
                            {asset.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0 sm:pl-2">
                        <button
                          type="button"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-semibold text-xs shadow-sm group-hover:shadow group-hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset);
                          }}
                        >
                          <i className="text-lg">download</i>
                          <span>{activeT.downloadBtn}</span>
                        </button>
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

