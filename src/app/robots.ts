import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://belaecopanels.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/en/admin/', 
        '/ne/admin/',
        '/profile/', 
        '/en/profile/',
        '/ne/profile/',
        '/cart/', 
        '/en/cart/',
        '/ne/cart/',
        '/checkout/',
        '/en/checkout/',
        '/ne/checkout/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
