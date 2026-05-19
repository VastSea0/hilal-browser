import { useTranslations } from 'next-intl';

function GitPullRequestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}

function TestTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 7L6.82 21.18a2.83 2.83 0 0 1-3.99 0 2.83 2.83 0 0 1 0-3.99L17 3" />
      <line x1="16" y1="2" x2="18" y2="4" />
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

function LanguageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function Contribute() {
  const t = useTranslations('contribute');

  const ways = [
    { key: 'issues' as const, icon: GitPullRequestIcon },
    { key: 'testing' as const, icon: TestTubeIcon },
    { key: 'code' as const, icon: CodeIcon },
    { key: 'translate' as const, icon: LanguageIcon },
  ];

  return (
    <section className="py-20 px-6 bg-charcoal/50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display font-semibold text-3xl sm:text-4xl text-pure-white mb-4">
          {t('title')}
        </h2>
        <p className="text-silver leading-relaxed mb-12 max-w-xl mx-auto">
          {t('body')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto text-left">
          {ways.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-3 p-4 rounded-lg bg-midnight border border-white/5"
            >
              <div className="w-8 h-8 rounded-md bg-sky-cyan/10 flex items-center justify-center text-sky-cyan flex-shrink-0">
                <Icon />
              </div>
              <span className="text-sm text-silver">{t(`ways.${key}`)}</span>
            </div>
          ))}
        </div>

        <a
          href="https://github.com/VastSea0/hilal-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg border border-hilal-gold/30 text-hilal-gold font-semibold text-sm hover:bg-hilal-gold/10 transition-colors"
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
