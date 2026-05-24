import { useTranslations } from 'next-intl';

export default function AlphaNotice() {
  const t = useTranslations('alpha');

  return (
    <section className="px-6 py-[60px]">
      <div className="max-w-[860px] mx-auto">
        <div
          className="rounded-2xl p-8 flex items-start gap-5"
          style={{
            background: 'rgba(255,248,240,0.6)',
            border: '1px solid rgba(255,160,80,0.2)',
          }}
        >
          <div className="text-[28px] flex-shrink-0 mt-0.5" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: '#e08e3f' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2
              className="font-display font-bold text-lg mb-2"
              style={{ color: '#1a2b4a' }}
            >
              {t('title')}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#5a7aaa' }}
            >
              {t('body')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
