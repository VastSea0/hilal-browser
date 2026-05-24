import { routing } from '@/i18n/routing';
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import Releases from '@/components/releases';
import WhyHilal from '@/components/why-hilal';
import History from '@/components/history';
import AlphaNotice from '@/components/alpha-notice';
import Contribute from '@/components/contribute';
import Footer from '@/components/footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Releases />
        <WhyHilal />
        <History />
        <AlphaNotice />
        <Contribute />
      </main>
      <Footer />
    </>
  );
}
