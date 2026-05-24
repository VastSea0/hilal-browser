import { useTranslations } from 'next-intl';

export default function History() {
  const t = useTranslations('history');

  const eras = [
    { key: 'pyqt' as const, era: 'Chromium', icon: '\u{1F331}' },
    { key: 'electron' as const, era: 'Chromium', icon: '\u{26A1}' },
    { key: 'anka' as const, era: 'Firefox', icon: '\u{1F985}' },
    { key: 'huma' as const, era: 'Firefox', icon: '\u{1F989}' },
    { key: 'hilal' as const, era: 'Current', icon: '\u{1F319}' },
  ];

  const getTagStyle = (era: string) => {
    if (era === 'Chromium') {
      return { background: 'rgba(100,160,255,0.12)', color: '#3567b5' };
    }
    if (era === 'Firefox') {
      return { background: 'rgba(255,120,80,0.1)', color: '#c04a20' };
    }
    return {
      background: 'rgba(75,142,240,0.15)',
      color: '#2b5fa8',
      border: '1px solid rgba(75,142,240,0.3)',
    };
  };

  return (
    <section
      className="px-6 py-[60px]"
      style={{
        background: 'rgba(255,255,255,0.5)',
        borderTop: '1px solid rgba(180,210,255,0.35)',
        borderBottom: '1px solid rgba(180,210,255,0.35)',
      }}
    >
      <div className="max-w-[860px] mx-auto">
        <div
          className="text-[11px] font-semibold uppercase tracking-[1.2px] mb-2.5"
          style={{ color: '#4a8ef0' }}
        >
          History
        </div>
        <h2
          className="font-display font-bold text-[28px] tracking-[-0.5px] mb-2.5"
          style={{ color: '#1a2b4a' }}
        >
          A journey since 2022
        </h2>
        <p
          className="text-[15px] leading-relaxed mb-9 max-w-[520px]"
          style={{ color: '#5a7aaa' }}
        >
          Same vision, different forms. Each chapter pushed further toward a better, freer browser.
        </p>

        <div className="relative flex flex-col">
          <div
            className="absolute"
            style={{
              left: '19px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: 'rgba(100,160,255,0.2)',
            }}
          />

          {eras.map(({ key, era, icon }, index) => {
            const isLast = index === eras.length - 1;
            const notes: Record<string, string> = {
              pyqt: 'The beginning. Built on PyQtEngine with a Chromium base — a rough first experiment in building something independent.',
              electron: 'Moved to Electron for a richer UI layer, still Chromium underneath. Growing pains, growing ambitions.',
              anka: 'A pivotal shift — abandoned Chromium entirely and rebuilt on Firefox source code. The soul of Hilal was born here.',
              huma: 'Refined, restructured, and deepened. Firefox-based development matured into something more intentional.',
              hilal: 'Rebuilt from scratch on Firefox source. A new name, a new foundation — the most ambitious chapter yet.',
            };
            const years: Record<string, string> = {
              pyqt: '2022',
              electron: '2022 – 2023',
              anka: '2023',
              huma: '2024',
              hilal: 'Now',
            };
            const tags: Record<string, string> = {
              pyqt: 'PyQtEngine \u00B7 Chromium',
              electron: 'Electron \u00B7 Chromium',
              anka: 'Firefox source',
              huma: 'Firefox source',
              hilal: 'Firefox source \u00B7 Current',
            };

            return (
              <div key={key} className="relative flex items-start gap-5 py-[18px]">
                <div
                  className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base"
                  style={{
                    background: isLast
                      ? 'rgba(75,142,240,0.15)'
                      : 'rgba(180,215,255,0.3)',
                    border: isLast
                      ? '2px solid #4a8ef0'
                      : '2px solid rgba(100,160,255,0.3)',
                  }}
                >
                  <span aria-hidden="true">{icon}</span>
                </div>

                <div className="pt-2 flex-1">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.8px] mb-0.5"
                    style={{ color: '#4a8ef0' }}
                  >
                    {years[key]}
                  </div>
                  <h3
                    className="font-display font-semibold text-base mb-[3px]"
                    style={{ color: '#1a2b4a' }}
                  >
                    {t(`eras.${key}.name`)}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: '#5a7aaa' }}
                  >
                    {notes[key]}
                  </p>
                  <span
                    className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-[20px] mt-1.5"
                    style={getTagStyle(era)}
                  >
                    {tags[key]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
