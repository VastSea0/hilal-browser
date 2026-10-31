// Frames for product screenshots. Desktop shots are captured without the
// macOS title bar, so the window frame and its traffic lights are drawn here.

type Theme = "dark" | "light";

export function screen(kind: "desktop" | "android", theme: Theme, name: string) {
  return `/screens/${kind}-${theme}-${name}.webp`;
}

export function DesktopFrame({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] p-[6px] bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/40 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        width={1600}
        height={960}
        loading={eager ? "eager" : "lazy"}
        className="block w-full h-auto rounded-[13px] select-none"
        draggable={false}
      />
    </div>
  );
}

export function PhoneFrame({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={`relative rounded-[44px] p-[9px] bg-[#16171b] ring-1 ring-black/40 shadow-[0_30px_60px_-18px_rgba(0,0,0,0.55)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        width={540}
        height={1200}
        loading={eager ? "eager" : "lazy"}
        className="block w-full h-auto rounded-[36px] select-none"
        draggable={false}
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[18px] -translate-x-1/2 w-[11px] h-[11px] rounded-full bg-black ring-1 ring-white/10"
      />
    </div>
  );
}
