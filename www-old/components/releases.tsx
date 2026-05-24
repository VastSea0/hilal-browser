'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { latestRelease, type PlatformKey } from '@/lib/release-data';

function detectPlatform(): PlatformKey | null {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  const value = `${userAgent} ${platform}`;

  if (value.includes('android')) {
    return 'android';
  }
  if (value.includes('mac')) {
    return 'macos';
  }
  if (value.includes('win')) {
    return 'windows';
  }
  if (value.includes('linux')) {
    return 'linux';
  }
  return null;
}

export default function Releases() {
  const t = useTranslations('releases');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformKey | null>(null);
  const changelogItems = t.raw('changelog.items') as string[];

  useEffect(() => {
    setDetectedPlatform(detectPlatform());
  }, []);

  return (
    <section id="releases" className="px-6 py-[64px]">
      <div className="mx-auto max-w-[1040px]">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div
              className="mb-2.5 text-[11px] font-semibold uppercase tracking-[1.2px]"
              style={{ color: '#4a8ef0' }}
            >
              {t('eyebrow')}
            </div>
            <h2
              className="font-display text-[30px] font-bold"
              style={{ color: '#1a2b4a' }}
            >
              {t('title')}
            </h2>
            <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed" style={{ color: '#5a7aaa' }}>
              {t('body', { version: latestRelease.version })}
            </p>
          </div>
          <a
            href={latestRelease.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[8px] px-4 py-2 text-sm font-semibold"
            style={{ background: '#2b5fa8', color: '#fff', textDecoration: 'none' }}
          >
            {t('allReleases')}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {latestRelease.platforms.map((platform) => {
            const isDetected = detectedPlatform === platform.key;
            return (
              <a
                key={platform.key}
                href={platform.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[8px] p-5 transition-transform hover:-translate-y-px"
                style={{
                  background: isDetected ? 'rgba(74,142,240,0.12)' : 'rgba(255,255,255,0.72)',
                  border: isDetected
                    ? '1px solid rgba(74,142,240,0.45)'
                    : '1px solid rgba(180,210,255,0.42)',
                  textDecoration: 'none',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#1a2b4a' }}>
                      {t(`platforms.${platform.key}.name`)}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: '#6c8ab8' }}>
                      {platform.artifact}
                    </div>
                  </div>
                  {isDetected && (
                    <span className="rounded-[999px] px-2 py-1 text-[10px] font-semibold uppercase" style={{ background: '#dcecff', color: '#2b5fa8' }}>
                      {t('detected')}
                    </span>
                  )}
                </div>
                <div className="mt-5 text-[13px]" style={{ color: platform.published ? '#1f8f57' : '#986b1b' }}>
                  {platform.published ? t('status.available') : t('status.pending')}
                </div>
                <div className="mt-2 text-xs leading-relaxed" style={{ color: '#6c8ab8' }}>
                  {platform.updateChannel ? t('channel', { channel: platform.updateChannel }) : t('manualOnly')}
                </div>
              </a>
            );
          })}
        </div>

        <div
          className="mt-5 rounded-[8px] p-5"
          style={{
            background: 'rgba(255,255,255,0.66)',
            border: '1px solid rgba(180,210,255,0.42)',
          }}
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="font-display text-xl font-bold" style={{ color: '#1a2b4a' }}>
              {t('changelog.title')}
            </h3>
            <div className="text-sm" style={{ color: '#6c8ab8' }}>
              {latestRelease.version} · {latestRelease.date}
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {changelogItems.map((item) => (
              <li key={item} className="text-sm leading-relaxed" style={{ color: '#4f6f9d' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
