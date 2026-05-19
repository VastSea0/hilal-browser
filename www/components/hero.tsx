import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-hilal-gold/10 text-hilal-gold border border-hilal-gold/20 mb-8">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hilal-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-hilal-gold" />
          </span>
          {t('badge')}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 512 512"
          aria-hidden="true"
          className="text-hilal-gold mb-8"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M352 64c-94 24-164 109-164 210s70 186 164 210c-30 15-64 24-100 24C126 508 24 406 24 280S126 52 252 52c36 0 70 8 100 24Z"
          />
        </svg>

        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-pure-white tracking-tight mb-6">
          {t('title')}
        </h1>

        <p className="text-lg sm:text-xl text-silver max-w-xl leading-relaxed mb-10">
          {t('tagline')}
        </p>

        <a
          href="https://github.com/VastSea0/hilal-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-hilal-gold text-midnight font-semibold text-sm hover:bg-moonlight-gold active:scale-[0.98] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {t('cta')}
        </a>
      </div>
    </section>
  );
}
