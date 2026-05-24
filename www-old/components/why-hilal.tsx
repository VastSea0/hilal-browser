import { useTranslations } from 'next-intl';

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function WhyHilal() {
  const t = useTranslations('why');

  const features = [
    { key: 'privacy', icon: ShieldIcon },
    { key: 'opensource', icon: CodeIcon },
    { key: 'community', icon: UsersIcon },
    { key: 'turkey', icon: MapPinIcon },
  ] as const;

  return (
    <section className="px-6 py-[60px]">
      <div className="max-w-[860px] mx-auto">
        <div
          className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5"
          style={{ color: '#4a8ef0' }}
        >
          Why Hilal?
        </div>
        <h2
          className="font-display font-bold text-[28px] tracking-[-0.5px] mb-2.5"
          style={{ color: '#1a2b4a' }}
        >
          Built different. For a reason.
        </h2>
        <p
          className="text-[15px] leading-relaxed mb-9 max-w-[520px]"
          style={{ color: '#5a7aaa' }}
        >
          Most browsers are built to watch you. Hilal is built to protect you — open source, community-driven, and rooted in Firefox&apos;s trusted engine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="rounded-[14px] p-[22px_24px]"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(180,210,255,0.4)',
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center mb-3.5"
                style={{
                  background: 'rgba(100,160,255,0.12)',
                  color: '#2b5fa8',
                }}
              >
                <Icon />
              </div>
              <h3
                className="font-display font-semibold text-[15px] mb-1.5"
                style={{ color: '#1a2b4a' }}
              >
                {t(`features.${key}.title`)}
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: '#5a7aaa' }}
              >
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
