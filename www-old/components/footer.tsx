'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import LocaleSwitcher from './locale-switcher';
import { HilalLogo } from './logo';

export default function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <footer
      className="px-9 py-8 flex items-center justify-between"
      style={{
        background: 'rgba(255,255,255,0.5)',
        borderTop: '1px solid rgba(180,210,255,0.35)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <HilalLogo size={24} />
        <div>
          <div
            className="font-display font-bold text-sm"
            style={{ color: '#2b5fa8' }}
          >
            Hilal Browser
          </div>
          <div className="text-xs" style={{ color: '#8aaccc' }}>
            {t('developer')} · {new Date().getFullYear()}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-5">
        <a
          href="https://github.com/VastSea0/hilal-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors hover:text-[#2b5fa8]"
          style={{ color: '#5a7aaa', textDecoration: 'none' }}
        >
          {t('source')}
        </a>
        <LocaleSwitcher currentLocale={locale} />
      </nav>
    </footer>
  );
}
