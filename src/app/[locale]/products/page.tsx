import ProductsClient from './ProductsClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isNepali = locale === 'ne';

  return {
    title: isNepali ? 'हाम्रा उत्पादनहरू | बेला इको प्यानल्स' : 'Our Products | Bela Eco Panels',
    description: isNepali 
      ? 'EPS प्यानल, सिमेन्ट बोर्डहरू र पूर्वनिर्मित आवास समाधानहरू सहित हाम्रो दिगो निर्माण सामग्रीहरूको विस्तृत दायरा अन्वेषण गर्नुहोस्।'
      : 'Explore our wide range of sustainable building materials including EPS panels, cement boards, and prefabricated housing solutions.',
    openGraph: {
      title: isNepali ? 'हाम्रा उत्पादनहरू | बेला इको प्यानल्स' : 'Our Products - Bela Eco Panels',
      description: isNepali 
        ? 'EPS प्यानल, सिमेन्ट बोर्डहरू र पूर्वनिर्मित आवास समाधानहरू सहित हाम्रो दिगो निर्माण सामग्रीहरूको विस्तृत दायरा अन्वेषण गर्नुहोस्।'
        : 'Explore our wide range of sustainable building materials including EPS panels, cement boards, and prefabricated housing solutions.',
      images: ['/products-og.jpg'],
      locale: isNepali ? 'ne_NP' : 'en_US',
    }
  };
}

export default function ProductsPage() {
  return <ProductsClient />;
}
