import { useTranslations } from 'next-intl';
import { HilalLogo } from './logo';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      className="relative flex flex-col items-center text-center px-6 pt-[72px] pb-[60px] overflow-hidden"
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(180,215,255,0.35) 0%, transparent 70%)',
        }}
      />

      <span
        className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] px-3.5 py-[5px] rounded-[20px] mb-7"
        style={{
          background: 'rgba(180,215,255,0.3)',
          border: '1px solid rgba(100,160,255,0.3)',
          color: '#3567b5',
        }}
      >
        <span
          className="inline-block rounded-full"
          style={{
            width: '6px',
            height: '6px',
            background: '#5b9ef5',
            animation: 'pulse 2s infinite',
          }}
        />
        {t('badge')}
      </span>

      <div className="relative mb-7">
        <HilalLogo size={96} />
      </div>

      <h1
        className="relative font-display font-bold text-[52px] leading-[1.1] tracking-[-1.5px] mb-4"
        style={{ color: '#1a2b4a' }}
      >
        Hilal <span style={{ color: '#4a8ef0' }}>Browser</span>
      </h1>

      <p
        className="relative text-base font-normal leading-relaxed max-w-[480px] mb-9"
        style={{ color: '#5a7aaa' }}
      >
        {t('tagline')}
      </p>

      <a
        href="https://github.com/VastSea0/hilal-browser"
        target="_blank"
        rel="noopener noreferrer"
        className="relative inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-[10px] transition-all hover:-translate-y-px"
        style={{
          background: '#2b5fa8',
          color: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          textDecoration: 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        {t('cta')}
      </a>

    </section>
  );
}
