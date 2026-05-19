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
      className="text-sm font-medium text-silver hover:text-hilal-gold transition-colors"
      aria-label={`Switch to ${otherLocale.toUpperCase()}`}
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
}
