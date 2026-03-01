
import { Metadata } from 'next';
import ContactClient from './ContactClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isNepali = locale === 'ne';

  return {
    title: isNepali ? 'हामीलाई सम्पर्क गर्नुहोस् | बेला इको प्यानल्स' : 'Contact Us | Bela Eco Panels - Get in Touch',
    description: isNepali 
      ? 'हाम्रो पर्यावरण-मैत्री निर्माण सामग्री, डिलर बन्ने, वा परियोजना उद्धरणहरूको बारेमा सोधपुछको लागि बेला इको प्यानलहरूलाई सम्पर्क गर्नुहोस्। हामीलाई +977 9802375303 मा कल गर्नुहोस्।'
      : 'Contact Bela Eco Panels for inquiries about our eco-friendly building materials, becoming a dealer, or project quotations. Call us at +977 9802375303.',
    keywords: 'contact bela eco panels, building materials nepal, contact number, location, chhauni kathmandu, dealer inquiry',
    openGraph: {
      title: isNepali ? 'हामीलाई सम्पर्क गर्नुहोस् | बेला इको प्यानल्स' : 'Contact Us | Bela Eco Panels',
      description: isNepali 
        ? 'लुम्बिनी, नेपालमा पर्यावरण-मैत्री निर्माण समाधानहरूको लागि हाम्रो टोलीसँग सम्पर्कमा रहनुहोस्।'
        : 'Get in touch with our team for eco-friendly building solutions in Nepal.',
      url: 'https://belaecopanels.com/contact',
      type: 'website',
      locale: isNepali ? 'ne_NP' : 'en_US',
    },
    alternates: {
      canonical: 'https://belaecopanels.com/contact'
    }
  };
}

export default function ContactPage() {
  return <ContactClient />;
}

