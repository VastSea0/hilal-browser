import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hilal Browser',
  description: 'Privacy-first, open-source browser built on Firefox. Developed by VastSea, Turkey.',
  openGraph: {
    title: 'Hilal Browser',
    description: 'Privacy-first, open-source browser built on Firefox. Developed by VastSea, Turkey.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
