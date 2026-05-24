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
    { key: 'issues' as const, icon: GitPullRequestIcon, title: 'Report Issues' },
    { key: 'testing' as const, icon: TestTubeIcon, title: 'Test Builds' },
    { key: 'code' as const, icon: CodeIcon, title: 'Submit Code' },
    { key: 'translate' as const, icon: LanguageIcon, title: 'Translate' },
  ];

  return (
    <section id="contribute" className="px-6 py-[60px]">
      <div className="max-w-[860px] mx-auto text-center">
        <div
          className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5"
          style={{ color: '#4a8ef0' }}
        >
          Contribute
        </div>
        <h2
          className="font-display font-bold text-[28px] tracking-[-0.5px] mb-2.5"
          style={{ color: '#1a2b4a' }}
        >
          {t('title')}
        </h2>
        <p
          className="text-[15px] leading-relaxed mb-9 max-w-[520px] mx-auto"
          style={{ color: '#5a7aaa' }}
        >
          {t('body')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10">
          {ways.map(({ key, icon: Icon, title }) => (
            <div
              key={key}
              className="rounded-[14px] p-[22px_16px] text-center"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(180,210,255,0.4)',
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center mx-auto mb-3.5"
                style={{
                  background: 'rgba(100,160,255,0.12)',
                  color: '#2b5fa8',
                }}
              >
                <Icon />
              </div>
              <h3
                className="font-display font-semibold text-sm mb-1"
                style={{ color: '#1a2b4a' }}
              >
                {title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: '#5a7aaa' }}
              >
                {t(`ways.${key}`)}
              </p>
            </div>
          ))}
        </div>

        <a
          href="https://github.com/VastSea0/hilal-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-[10px] transition-all hover:-translate-y-px"
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
      </div>
    </section>
  );
}
