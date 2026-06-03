import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Packages from '@/components/Packages';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Services />
      <Packages />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
