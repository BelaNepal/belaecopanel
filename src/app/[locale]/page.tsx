import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import WhyBelaeco from '@/components/WhyBelaeco';
import LatestArticles from '@/components/LatestArticles';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import EcoPanelsCarousel from '@/components/EcoPanelsCarousel';
import LocationSection from '@/components/LocationSection';
import { Metadata } from 'next';
import { articleAPI } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Bela Eco Panels | Sustainable Building Materials',
  description: 'Premium eco-friendly panels for the 21st century. High energy efficiency, rapid installation, and sustainable construction solutions.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bela Eco Panels | Sustainable Building Materials',
    description: 'Premium eco-friendly panels for the 21st century.',
    url: 'https://belaecopanels.com',
    type: 'website',
  }
};

export default async function Home() {
  let initialArticles = [];
  try {
    const res = await articleAPI.getAll({ take: 3, serviceTag: 'ECOPANELS' });
    if (res.data && Array.isArray(res.data.data)) {
        initialArticles = res.data.data;
    } else if (res.data && Array.isArray(res.data)) {
        initialArticles = res.data;
    }
  } catch (error: any) {
    // Log only the message to avoid console noise with AggregateError
    console.warn(`Home page SSR: Failed to fetch articles (${error.message || 'Unknown error'})`);
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      <WhyBelaeco />
      <EcoPanelsCarousel />
      <LatestArticles initialArticles={initialArticles} />
      <Testimonials />
      <FAQ />
      <LocationSection />
      <Footer />
    </>
  );
}
