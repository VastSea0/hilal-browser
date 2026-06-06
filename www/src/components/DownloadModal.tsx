import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Loader2, Cpu, ChevronRight } from "lucide-react";
import { GithubRelease, GithubAsset } from "../types";
import { formatBytes, detectOS, getRecommendedAsset } from "../utils/github";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: GithubRelease | null;
  lang: 'tr' | 'en';
  initialAssetId?: number | null;
}

export default function DownloadModal({ isOpen, onClose, release, lang, initialAssetId }: DownloadModalProps) {
  const [selectedAsset, setSelectedAsset] = useState<GithubAsset | null>(null);
  const [downloadStep, setDownloadStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [downloadCompleted, setDownloadCompleted] = useState<boolean>(false);

  const t = {
    tr: {
      alphaTag: "ALPHA YAYIN",
      title: "Hilal'i Yükleyin",
      subtitle: "Sisteminiz için optimize edilmiş güvenli Hilal Browser Alpha paketini belirleyin. uBlock Origin varsayılan olarak dahili gelir.",
      otherPlatforms: "Uygun kurulum paketi listelenemedi. Lütfen ana sayfa üzerindeki indirme linklerini kullanın.",
      footerText: "Güvenli kod imzası tarayıcımız tarafından onaylanmıştır. Kaynak kodları GitHub üzerinden açıktır.",
      loadingTitle: "Yükleme Dosyası Hazırlanıyor",
      loadingFooter: "Dosya indirme kuyruğuna aktarıldığında tarayıcınız tarafından kaydedilecektir. Lütfen pencereyi kapatmayın.",
      successTitle: "İndirme Başlatıldı",
      successDesc: "dosyası tarayıcınızın indirme kuyruğuna başarıyla teslim edildi.",
      downloadOther: "Başka bir platform sürümü seç",
      osWindowsDetail: "Windows x64 Installer",
      osWinZipDetail: "Windows taşınabilir ZIP paketi",
      osMacDetail: "macOS Universal (Apple Silicon & Intel)",
      osDebDetail: "Linux Debian/Ubuntu DEB",
      osAppImageDetail: "Linux AppImage Çalıştırılabilir Paket",
      osTarballDetail: "Linux tar.gz taşınabilir arşivi",
      osSrcDetail: "Hilal Kaynak Kodu Arşivi",
      osOtherDetail: "Geliştirici İkili Dosyası",
      otherVersions: "Diğer Platformlar",
      sourceCode: "Kaynak Kodu",
      simSteps: [
        { label: "Güvenli bağlantı kuruluyor...", duration: 350 },
        { label: "Paket imzaları doğrulanıyor...", duration: 400 },
        { label: "Hilal Alpha paketi derleniyor (Gecko-128)...", duration: 500 },
        { label: "İndirme akışı başlatılıyor...", duration: 250 }
      ]
    },
    en: {
      alphaTag: "ALPHA BUILD",
      title: "Install Hilal",
      subtitle: "Select the secure Hilal Browser Alpha bundle built for your platform. uBlock Origin is integrated by default.",
      otherPlatforms: "No selectable packages found. Please use the homepage links.",
      footerText: "Secure code signature is verified. Source code is openly auditable on GitHub.",
      loadingTitle: "Preparing Package Stream",
      loadingFooter: "Once the stream initializes, the file will be saved by your browser. Please do not close this window.",
      successTitle: "Download Initiated",
      successDesc: "has been successfully dispatched to your browser's download queue.",
      downloadOther: "Select another platform build",
      osWindowsDetail: "Windows x64 Installer",
      osWinZipDetail: "Windows portable ZIP package",
      osMacDetail: "macOS Universal (Apple Silicon & Intel)",
      osDebDetail: "Linux Debian/Ubuntu DEB",
      osAppImageDetail: "Linux AppImage Executable Package",
      osTarballDetail: "Linux tar.gz portable archive",
      osSrcDetail: "Hilal Source Archive",
      osOtherDetail: "Developer Binary Build",
      otherVersions: "Other Targets",
      sourceCode: "Source Code",
      simSteps: [
        { label: "Establishing secure connection...", duration: 350 },
        { label: "Verifying package signatures...", duration: 400 },
        { label: "Assembling Hilal Alpha bundle (Gecko-128)...", duration: 500 },
        { label: "Initiating download stream...", duration: 250 }
      ]
    }
  };

  const activeTranslation = t[lang] || t.tr;
  const simulationSteps = activeTranslation.simSteps;

  useEffect(() => {
    if (!isOpen) {
      setSelectedAsset(null);
      setDownloadStep(0);
      setProgress(0);
      setDownloadCompleted(false);
    } else {
      const activeAssets = release?.assets || [];
      if (initialAssetId) {
        const found = activeAssets.find(a => a.id === initialAssetId);
        if (found) {
          setSelectedAsset(found);
          return;
        }
      }
      
      const os = detectOS();
      const recommended = getRecommendedAsset(activeAssets, os);
      if (recommended) {
        setSelectedAsset(recommended);
      }
    }
  }, [isOpen, initialAssetId, release]);

  useEffect(() => {
    let timer: any;
    if (selectedAsset && downloadStep < simulationSteps.length) {
      const currentStepObj = simulationSteps[downloadStep];
      const stepDuration = currentStepObj.duration;
      const startTime = Date.now();

      const stepInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stepProgress = Math.min((elapsed / stepDuration) * 100, 100);
        const baseProgress = (downloadStep / simulationSteps.length) * 100;
        const currentProgressContribution = stepProgress / simulationSteps.length;
        setProgress(Math.round(baseProgress + currentProgressContribution));
      }, 25);

      timer = setTimeout(() => {
        clearInterval(stepInterval);
        if (downloadStep < simulationSteps.length - 1) {
          setDownloadStep(prev => prev + 1);
        } else {
          setProgress(100);
          setDownloadCompleted(true);
          
          setTimeout(() => {
            window.location.href = selectedAsset.browser_download_url;
          }, 300);
        }
      }, stepDuration);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [selectedAsset, downloadStep, simulationSteps]);

  const getAssetDetails = (filename: string) => {
    const lower = filename.toLowerCase();
    const curr = activeTranslation;
    if (lower.endsWith(".exe")) {
      return { os: "Windows", icon: "WIN", desc: curr.osWindowsDetail };
    }
    if (lower.endsWith(".dmg")) {
      return { os: "macOS", icon: "MAC", desc: curr.osMacDetail };
    }
    if (lower.endsWith(".deb")) {
      return { os: "Linux DEB", icon: "LNX", desc: curr.osDebDetail };
    }
    if (lower.endsWith(".appimage")) {
      return { os: "Linux Portable", icon: "LNX", desc: curr.osAppImageDetail };
    }
    if (lower.endsWith(".tar.gz") || lower.endsWith(".tar.xz")) {
      if (lower.includes("source")) {
        return { os: curr.sourceCode, icon: "SRC", desc: curr.osSrcDetail };
      }
      return { os: "Linux Tarball", icon: "LNX", desc: curr.osTarballDetail };
    }
    if (lower.endsWith(".zip")) {
      if (lower.includes("source")) {
        return { os: curr.sourceCode, icon: "SRC", desc: curr.osSrcDetail };
      }
      return { os: "Windows Portable", icon: "WIN", desc: curr.osWinZipDetail };
    }
    return { os: curr.otherVersions, icon: "BIN", desc: curr.osOtherDetail };
  };

  const activeAssets = release?.assets || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
            id="modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-[#FAF9F6] p-6 shadow-xl dark:border-neutral-900 dark:bg-[#0A0A0A] transition-colors"
            id="download-modal-card"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-neutral-200/50 pb-4 dark:border-neutral-900/50">
              <div>
                <span className="inline-flex items-center rounded border border-neutral-200/80 px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
                  {activeTranslation.alphaTag}
                </span>
                <h3 className="mt-2 font-serif text-lg font-medium text-neutral-900 dark:text-white">
                  {activeTranslation.title}
                </h3>
              </div>
              <button
                id="close-modal-btn"
                onClick={onClose}
                className="rounded-md p-1 border border-transparent hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-850 dark:hover:bg-neutral-950 text-neutral-400 dark:text-neutral-500 transition-all"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="relative mt-4">
              {!selectedAsset ? (
                // Platform build lists
                <div>
                  <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 mb-4">
                    {activeTranslation.subtitle}
                  </p>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1" id="asset-list">
                    {activeAssets.length > 0 ? (
                      activeAssets.map((asset) => {
                        const { os, icon, desc } = getAssetDetails(asset.name);
                        return (
                          <button
                            key={asset.id}
                            id={`download-asset-${asset.id}`}
                            onClick={() => setSelectedAsset(asset)}
                            className="w-full flex items-center justify-between p-3 rounded-md border border-neutral-200/80 bg-neutral-50/50 text-left hover:border-neutral-900 hover:bg-white dark:border-neutral-900 dark:bg-neutral-950/50 dark:hover:border-neutral-100 dark:hover:bg-black group transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[9px] font-bold tracking-widest text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
                                {icon}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                  {os} ({asset.name.split('.').pop()?.toUpperCase()})
                                </div>
                                <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                  {desc}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                                {formatBytes(asset.size)}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                        {activeTranslation.otherPlatforms}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[10px] leading-relaxed text-neutral-400 dark:text-neutral-500 border-t border-neutral-200/50 pt-3 dark:border-neutral-900/50">
                    <Cpu className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span>{activeTranslation.footerText}</span>
                  </div>
                </div>
              ) : (
                // Simulation Loader
                <div className="py-6 text-center" id="downloading-progress">
                  <AnimatePresence mode="wait">
                    {!downloadCompleted ? (
                      <motion.div
                        key="loading-spinner"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex flex-col items-center justify-center"
                      >
                        <div className="relative mb-5 flex items-center justify-center">
                          <Loader2 className="h-10 w-10 animate-spin text-neutral-400 dark:text-neutral-500" />
                          <span className="absolute font-mono text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                            {progress}%
                          </span>
                        </div>

                        <h4 className="font-sans text-xs font-bold tracking-wider uppercase text-neutral-800 dark:text-neutral-200">
                          {activeTranslation.loadingTitle}
                        </h4>
                        
                        <p className="mt-1 h-5 text-xs text-neutral-400 dark:text-neutral-500">
                          {simulationSteps[downloadStep]?.label}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-5 w-full max-w-[240px] overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-900">
                          <motion.div
                            className="h-1 rounded-full bg-neutral-800 dark:bg-neutral-300"
                            style={{ width: `${progress}%` }}
                            transition={{ ease: "easeInOut" }}
                          />
                        </div>

                        <p className="mt-6 text-[10px] text-neutral-400 dark:text-neutral-500 max-w-[240px]">
                          {activeTranslation.loadingFooter}
                        </p>

                        <button
                          id="change-on-loading-btn"
                          onClick={() => setSelectedAsset(null)}
                          className="mt-4 text-[10px] font-mono text-neutral-400 hover:text-neutral-950 dark:hover:text-white underline transition-colors"
                        >
                          {activeTranslation.downloadOther}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success-screen"
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-2"
                      >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
                          <Check className="h-5 w-5 stroke-[2.5px]" />
                        </div>

                        <h4 className="font-serif text-lg font-medium text-neutral-950 dark:text-white">
                          {activeTranslation.successTitle}
                        </h4>

                        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500 max-w-xs leading-relaxed">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedAsset.name}</span> {activeTranslation.successDesc}
                        </p>

                        <button
                          id="reset-modal-btn"
                          onClick={() => setSelectedAsset(null)}
                          className="mt-6 text-[10px] font-mono text-neutral-400 hover:text-neutral-950 dark:hover:text-white underline"
                        >
                          {activeTranslation.downloadOther}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
