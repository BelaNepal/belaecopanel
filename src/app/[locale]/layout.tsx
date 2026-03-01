import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import AuthProvider from '@/components/AuthProvider';
import PagePopup from '@/components/PagePopup';
import ScrollToTop from '@/components/ScrollToTop';
import LanguageCookieConsent from '@/components/LanguageCookieConsent';
import { Toaster } from 'sonner';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const isNepali = locale === 'ne';
  
  const title = isNepali 
    ? 'बेला इको प्यानल्स | टिकाउ निर्माण सामग्री' 
    : 'Bela Eco Panels | Sustainable Building Materials';
    
  const description = isNepali
    ? '२१ औं शताब्दीको लागि दिगो निर्माणको लागि प्रिमियम इको-फ्रेन्डली प्यानलहरू। ऊर्जा कुशल, टिकाऊ र लागत प्रभावी भवन समाधानहरू।'
    : 'Premium eco-friendly panels for sustainable construction in the 21st century. Energy efficient, durable, and cost-effective building solutions.';

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://belaecopanels.com'),
    title: {
      default: title,
      template: `%s | ${isNepali ? 'बेला इको प्यानल्स' : 'Bela Eco Panels'}`,
    },
    description: description,
    keywords: ['eco panels', 'sustainable building', 'construction materials', 'green building', 'insulated panels', 'prefabricated construction'],
    authors: [{ name: 'Bela Eco Panels' }],
    creator: 'Bela Eco Panels',
    publisher: 'Bela Eco Panels',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon.png', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: title,
      description: description,
      url: 'https://belaecopanels.com',
      siteName: isNepali ? 'बेला इको प्यानल्स' : 'Bela Eco Panels',
      images: [
        {
          url: '/og-image.jpg', // Ensure this exists in public/
          width: 1200,
          height: 630,
          alt: 'Bela Eco Panels Showcase',
        },
      ],
      locale: locale === 'ne' ? 'ne_NP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bela Eco Panels',
      description: 'Premium eco-friendly panels for sustainable construction',
      images: ['/og-image.jpg'], // Same as OG
    },
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'ne': '/ne',
      },
    },
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bela Eco Panels',
  url: 'https://belaecopanels.com',
  logo: 'https://belaecopanels.com/logo.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Chhauni-15, Corporate Tower, 5th Floor',
    addressLocality: 'Kathmandu',
    addressCountry: 'NP'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+977-9802375303',
    contactType: 'customer service',
    areaServed: 'NP',
    availableLanguage: ['en', 'ne']
  }
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!['en', 'ne'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <PagePopup serviceTag="ECOPANELS" />
            <LanguageCookieConsent />
            <ScrollToTop />
            {children}
            <Toaster 
              position="top-right" 
              richColors 
              theme="system"
              closeButton
              toastOptions={{
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  fontSize: '0.925rem',
                  fontWeight: 500
                },
                className: 'my-toast-class',
              }}
            />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
