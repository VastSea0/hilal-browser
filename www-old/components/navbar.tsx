'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LocaleSwitcher from './locale-switcher';
import { usePathname } from 'next/navigation';
import { HilalLogo } from './logo';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-9 py-[18px]"
      style={{
        background: 'rgba(240,246,255,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(180,210,255,0.3)',
      }}
    >
      <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
        <HilalLogo size={28} />
        <span
          className="font-display font-bold text-[17px] tracking-[-0.3px]"
          style={{ color: '#2b5fa8' }}
        >
          Hilal Browser
        </span>
      </Link>

      <nav className="flex items-center gap-1.5">
        <a
          href="https://github.com/VastSea0/hilal-browser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium px-3.5 py-1.5 rounded-[20px] transition-colors hover:bg-[rgba(100,160,255,0.1)]"
          style={{ color: '#4a6fa5', border: '1px solid transparent', textDecoration: 'none' }}
        >
          {t('github')}
        </a>
        <a
          href="#releases"
          className="text-[13px] font-medium px-3.5 py-1.5 rounded-[20px] transition-colors hover:bg-[rgba(100,160,255,0.1)]"
          style={{ color: '#4a6fa5', border: '1px solid transparent', textDecoration: 'none' }}
        >
          {t('releases')}
        </a>
        <a
          href="#contribute"
          className="text-[13px] font-medium px-3.5 py-1.5 rounded-[20px] transition-colors hover:bg-[rgba(100,160,255,0.1)]"
          style={{ color: '#4a6fa5', border: '1px solid transparent', textDecoration: 'none' }}
        >
          {t('contribute')}
        </a>
        <LocaleSwitcher currentLocale={locale} />
      </nav>
    </header>
  );
}
