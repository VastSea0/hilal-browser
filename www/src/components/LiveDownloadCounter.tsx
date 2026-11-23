import { useEffect, useRef, useState } from "react";
import { DownloadPlatform, DownloadStats } from "../utils/github";

interface AnimatedNumberProps {
  value: number;
  lang: "tr" | "en";
  className?: string;
}

export function AnimatedNumber({ value, lang, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState<number>(value);
  const currentRef = useRef<number>(value);

  useEffect(() => {
    const start = currentRef.current;
    const target = Math.max(0, Math.round(value));
    if (start === target) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      currentRef.current = target;
      setDisplay(target);
      return;
    }

    const duration = Math.abs(target - start) <= 5 ? 320 : 750;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + (target - start) * eased);
      currentRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  const formatted = new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(display);
  return <span className={`tabular-nums ${className || ""}`}>{formatted}</span>;
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

interface LiveDownloadCounterProps {
  stats: DownloadStats;
  lang: "tr" | "en";
  variant: "pill" | "banner";
  onClick?: () => void;
}

const PLATFORM_META: { key: DownloadPlatform; label: string; icon: string }[] = [
  { key: "windows", label: "Windows", icon: "desktop_windows" },
  { key: "macos", label: "macOS", icon: "desktop_mac" },
  { key: "linux", label: "Linux", icon: "terminal" },
  { key: "android", label: "Android", icon: "smartphone" },
];

export default function LiveDownloadCounter({
  stats,
  lang,
  variant,
  onClick,
}: LiveDownloadCounterProps) {
  if (stats.total <= 0) return null;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-m3-container-low hover:bg-m3-container border border-[var(--outline-variant)]/40 text-xs text-[var(--on-surface)] transition-colors cursor-pointer"
        aria-live="polite"
      >
        <span className="font-mono font-bold text-sm text-[var(--primary)]">
          <AnimatedNumber value={stats.total} lang={lang} />
        </span>
        <span className="text-[var(--on-surface-variant)] font-medium">
          {lang === "tr" ? "indirme" : "downloads"}
        </span>
      </button>
    );
  }

  return (
    <div
      className="mt-8 p-6 sm:p-7 rounded-[28px] bg-m3-container-low border border-[var(--outline-variant)]/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-left"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
          <i className="text-2xl">downloading</i>
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--on-surface)] font-mono">
              <AnimatedNumber value={stats.total} lang={lang} />
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <LiveDot />
              <span>{lang === "tr" ? "Canlı" : "Live"}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] m-0 mt-1">
            {lang === "tr"
              ? "GitHub Releases üzerinden toplam tarayıcı indirmesi"
              : "Total browser downloads across GitHub Releases"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
        {PLATFORM_META.map((item) => {
          const count = stats.platforms[item.key];
          return (
            <div
              key={item.key}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-m3-container-lowest border border-[var(--outline-variant)]/25 text-xs"
            >
              <i className="text-base text-[var(--primary)]">{item.icon}</i>
              <span className="font-medium text-[var(--on-surface-variant)]">{item.label}</span>
              <span className="font-mono font-bold text-[var(--on-surface)]">
                <AnimatedNumber value={count} lang={lang} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
