import { useState, useEffect } from "react";
import {
  Download,
  Apple,
  Laptop,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Package
} from "lucide-react";
import {
  M3eDialog,
  M3eButton,
  M3eCard,
  M3eChip
} from "@m3e/react/all";
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
    <M3eDialog
      open={isOpen}
      onClosed={onClose}
      dismissible
      className="max-w-lg w-full"
    >
      <div slot="header" className="flex items-center gap-2.5">
        <Package className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
        <span className="text-xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
          {downloadedAsset ? activeT.downloadStarted : activeT.headline}
        </span>
      </div>

      {downloadedAsset ? (
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            {activeT.downloadDesc}
          </p>
          <div className="flex justify-center">
            <M3eChip variant="outlined">
              <span>{downloadedAsset.name} • {formatBytes(downloadedAsset.size)}</span>
            </M3eChip>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <M3eButton
              variant="filled"
              size="small"
              shape="rounded"
              onClick={() => handleDownload(downloadedAsset)}
            >
              <Download slot="icon" className="w-4 h-4" />
              <span>{activeT.redownloadBtn}</span>
            </M3eButton>
            <M3eButton
              variant="text"
              size="small"
              shape="rounded"
              onClick={onClose}
            >
              <span>{activeT.closeBtn}</span>
            </M3eButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            {activeT.supportingText}
          </p>

          {/* Package list using M3E Card */}
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {assets.map((asset) => {
              const info = getPlatformInfo(asset.name);
              return (
                <M3eCard
                  key={asset.id}
                  variant="outlined"
                  actionable
                  onClick={() => handleDownload(asset)}
                  className="w-full text-left cursor-pointer group"
                >
                  <div slot="content" className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
                        {info.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                          {info.label}
                        </div>
                        <div className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)] truncate">
                          {asset.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)] hidden sm:inline">
                        {formatBytes(asset.size)}
                      </span>
                      <M3eButton
                        variant="filled"
                        size="small"
                        shape="rounded"
                      >
                        <Download slot="icon" className="w-3.5 h-3.5" />
                        <span className="sm:hidden">{formatBytes(asset.size)}</span>
                      </M3eButton>
                    </div>
                  </div>
                </M3eCard>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]/20 text-center">
            <M3eButton
              variant="text"
              size="small"
              shape="rounded"
              href={release?.html_url || "https://github.com/VastSea0/hilal-browser/releases"}
              target="_blank"
            >
              <span>{activeT.viewAllOnGh}</span>
              <ExternalLink slot="trailing-icon" className="w-3.5 h-3.5 ml-1" />
            </M3eButton>
          </div>
        </div>
      )}
    </M3eDialog>
  );
}
