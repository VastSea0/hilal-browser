'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import LocaleSwitcher from './locale-switcher';

export default function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <footer className="border-t border-white/5 bg-charcoal/30 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 512 512"
              aria-hidden="true"
              className="text-hilal-gold"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M352 64c-94 24-164 109-164 210s70 186 164 210c-30 15-64 24-100 24C126 508 24 406 24 280S126 52 252 52c36 0 70 8 100 24Z"
              />
            </svg>
            <span className="font-display font-semibold text-pure-white">Hilal Browser</span>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="https://github.com/VastSea0/hilal-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-silver hover:text-pure-white transition-colors"
            >
              {t('source')}
            </a>
            <div className="w-px h-4 bg-white/10" />
            <LocaleSwitcher currentLocale={locale} />
          </nav>
        </div>

        <div className="space-y-2 text-xs text-slate leading-relaxed">
          <p>{t('license')}</p>
          <p>
            {t('developer')} ·{' '}
            <Link href={`/${locale}`} className="hover:text-pure-white transition-colors">
              hilal-browser
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
