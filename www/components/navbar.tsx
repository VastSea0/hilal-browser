'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LocaleSwitcher from './locale-switcher';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 512 512"
            aria-hidden="true"
            className="text-hilal-gold group-hover:text-moonlight-gold transition-colors"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M352 64c-94 24-164 109-164 210s70 186 164 210c-30 15-64 24-100 24C126 508 24 406 24 280S126 52 252 52c36 0 70 8 100 24Z"
            />
          </svg>
          <span className="font-display font-semibold text-lg text-pure-white tracking-tight">
            Hilal
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/VastSea0/hilal-browser"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-silver hover:text-pure-white transition-colors"
          >
            {t('github')}
          </a>
          <div className="w-px h-4 bg-white/10" />
          <LocaleSwitcher currentLocale={locale} />
        </nav>
      </div>
    </header>
  );
}
