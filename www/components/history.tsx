import { useTranslations } from 'next-intl';

export default function History() {
  const t = useTranslations('history');

  const eras = [
    { key: 'pyqt' as const, era: 'Chromium' },
    { key: 'electron' as const, era: 'Chromium' },
    { key: 'anka' as const, era: 'Firefox' },
    { key: 'huma' as const, era: 'Firefox' },
    { key: 'hilal' as const, era: 'Firefox' },
  ];

  return (
    <section className="py-20 px-6 bg-charcoal/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-semibold text-3xl sm:text-4xl text-pure-white text-center mb-4">
          {t('title')}
        </h2>
        <p className="text-silver text-center mb-14 max-w-lg mx-auto">
          {t('subtitle')}
        </p>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/10" />

          <div className="space-y-10">
            {eras.map(({ key }, index) => {
              const isLast = index === eras.length - 1;
              return (
                <div key={key} className="relative flex items-start gap-5">
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isLast
                          ? 'bg-hilal-gold border-hilal-gold text-midnight'
                          : 'bg-midnight border-white/20 text-silver'
                      }`}
                    >
                      {isLast ? (
                        <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M352 64c-94 24-164 109-164 210s70 186 164 210c-30 15-64 24-100 24C126 508 24 406 24 280S126 52 252 52c36 0 70 8 100 24Z" />
                        </svg>
                      ) : (
                        <span className="text-xs font-display font-bold">{index + 1}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <h3
                      className={`font-display font-semibold text-lg ${
                        isLast ? 'text-hilal-gold' : 'text-pure-white'
                      }`}
                    >
                      {t(`eras.${key}.name`)}
                    </h3>
                    <p className="text-sm text-silver mt-1">
                      {t(`eras.${key}.note`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
