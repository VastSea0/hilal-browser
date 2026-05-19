import { useTranslations } from 'next-intl';

export default function AlphaNotice() {
  const t = useTranslations('alpha');

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-hilal-gold/20 bg-hilal-gold/5 p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-5">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-hilal-gold flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className="font-display font-semibold text-2xl text-hilal-gold">
              {t('title')}
            </h2>
          </div>

          <p className="text-silver leading-relaxed mb-6">
            {t('body')}
          </p>

          <a
            href="https://github.com/VastSea0/hilal-browser"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-hilal-gold hover:text-moonlight-gold transition-colors"
          >
            {t('cta')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
