'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const otherLocale = currentLocale === 'en' ? 'tr' : 'en';
  const newPath = pathname.replace(new RegExp(`^/${currentLocale}`), `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <Link
      href={newPath}
      className="text-xs font-semibold px-3 py-1 rounded-[20px] transition-colors hover:bg-[rgba(100,160,255,0.1)]"
      style={{
        color: '#2b5fa8',
        border: '1px solid rgba(100,160,255,0.35)',
        textDecoration: 'none',
      }}
      aria-label={`Switch to ${otherLocale.toUpperCase()}`}
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
}
