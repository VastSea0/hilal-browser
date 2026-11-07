import { useEffect, useState } from "react";

// Hilal Browser marks this site's root element with data-hilal-browser (its
// version) and data-hilal-accent (the browser's accent color). Only this site
// gets them; other sites cannot tell they run in Hilal.

export interface HilalBrowserInfo {
  version: string;
  accent: string | null;
}

function read(): HilalBrowserInfo | null {
  const root = document.documentElement;
  const version = root.getAttribute("data-hilal-browser");
  if (version === null) return null;
  const accent = root.getAttribute("data-hilal-accent");
  return { version, accent: accent && /^#[0-9a-f]{6}$/i.test(accent) ? accent : null };
}

export function useHilalBrowser(): HilalBrowserInfo | null {
  const [info, setInfo] = useState<HilalBrowserInfo | null>(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setInfo(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hilal-browser", "data-hilal-accent"],
    });
    return () => observer.disconnect();
  }, []);
  return info;
}

function hexToOklch(hex: string): { c: number; h: number } {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = lin((n >> 16) & 255);
  const g = lin((n >> 8) & 255);
  const b = lin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { c: Math.sqrt(A * A + B * B), h };
}

// The same tonal mapping as the browser's MaterialYouTheme, so the site and
// the browser chrome match.
export function paletteFromAccent(hex: string, dark: boolean): Record<string, string> {
  const { c: raw, h: hue } = hexToOklch(hex);
  const c = Math.max(raw, 0.14);
  const h = hue.toFixed(1);
  const k = (x: number) => (c * x).toFixed(3);
  if (dark) {
    return {
      "--primary": `oklch(0.82 ${k(1)} ${h})`,
      "--on-primary": `oklch(0.22 ${k(0.8)} ${h})`,
      "--primary-container": `oklch(0.34 ${k(0.7)} ${h})`,
      "--on-primary-container": `oklch(0.92 ${k(0.4)} ${h})`,
      "--secondary-container": `oklch(0.32 0.04 ${h})`,
      "--on-secondary-container": `oklch(0.9 0.03 ${h})`,
      "--background": `oklch(0.16 0.012 ${h})`,
      "--surface": `oklch(0.16 0.012 ${h})`,
      "--surface-container-lowest": `oklch(0.13 0.010 ${h})`,
      "--surface-container-low": `oklch(0.19 0.014 ${h})`,
      "--surface-container": `oklch(0.22 0.016 ${h})`,
      "--surface-container-high": `oklch(0.26 0.018 ${h})`,
      "--surface-container-highest": `oklch(0.30 0.020 ${h})`,
      "--outline-variant": `oklch(0.38 0.02 ${h})`,
    };
  }
  return {
    "--primary": `oklch(0.48 ${k(1)} ${h})`,
    "--on-primary": `oklch(0.98 0.005 ${h})`,
    "--primary-container": `oklch(0.88 ${k(0.65)} ${h})`,
    "--on-primary-container": `oklch(0.18 ${k(0.85)} ${h})`,
    "--secondary-container": `oklch(0.88 0.04 ${h})`,
    "--on-secondary-container": `oklch(0.15 0.06 ${h})`,
    "--background": `oklch(0.98 0.008 ${h})`,
    "--surface": `oklch(0.98 0.008 ${h})`,
    "--surface-container-lowest": `oklch(1 0 ${h})`,
    "--surface-container-low": `oklch(0.96 0.010 ${h})`,
    "--surface-container": `oklch(0.93 0.014 ${h})`,
    "--surface-container-high": `oklch(0.89 0.018 ${h})`,
    "--surface-container-highest": `oklch(0.85 0.022 ${h})`,
    "--outline-variant": `oklch(0.80 0.018 ${h})`,
  };
}

const applied = new Set<string>();

// index.css declares the palette with !important, so inline !important is
// needed to override it; clearing restores the site's own colors.
export function applyAccentPalette(palette: Record<string, string> | null) {
  const targets = [document.documentElement, document.body];
  for (const name of applied) {
    for (const el of targets) el.style.removeProperty(name);
  }
  applied.clear();
  if (!palette) return;
  for (const [name, value] of Object.entries(palette)) {
    for (const el of targets) el.style.setProperty(name, value, "important");
    applied.add(name);
  }
}
