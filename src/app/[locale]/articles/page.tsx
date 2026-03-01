
import { Metadata } from 'next';
import ArticlesClient from './ArticlesClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isNepali = locale === 'ne';

  return {
    title: isNepali ? 'लेख र समाचार | बेला इको प्यानल्स' : 'Articles & News | Bela Eco Panels',
    description: isNepali 
      ? 'बेला इको प्यानल्सबाट नवीनतम समाचार, निर्माण सुझावहरू र जानकारीहरूसँग अपडेट रहनुहोस्।'
      : 'Stay updated with the latest news, construction tips, and insights from Bela Eco Panels.',
    openGraph: {
      title: isNepali ? 'लेख र समाचार | बेला इको प्यानल्स' : 'Articles & News | Bela Eco Panels',
      description: isNepali 
        ? 'पर्यावरण-मैत्री निर्माणमा हाम्रो नवीनतम लेखहरू पढ्नुहोस्।'
        : 'Read our latest articles on eco-friendly construction.',
      url: 'https://belaecopanels.com/articles',
      type: 'website',
      locale: isNepali ? 'ne_NP' : 'en_US',
    },
    alternates: {
      canonical: 'https://belaecopanels.com/articles'
    }
  };
}

export default function ArticlesPage() {
  return <ArticlesClient />;
}
