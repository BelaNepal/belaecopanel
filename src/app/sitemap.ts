import { MetadataRoute } from 'next';
import { articleAPI, productAPI } from '@/lib/api';
import { createProductSlug } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://belaecopanels.com';
const LOCALES = ['en', 'ne'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes = [
    '',
    '/products',
    '/articles',
    '/contact',
    '/become-a-dealer',
  ];

  const routes: MetadataRoute.Sitemap = [];

  // Generate routes for each locale
  for (const locale of LOCALES) {
    for (const route of baseRoutes) {
      routes.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  // Fetch articles
  let articles: MetadataRoute.Sitemap = [];
  try {
    const res = await articleAPI.getAll();
    const articleData = Array.isArray(res.data) ? res.data : (res.data.data || []);
    
    for (const locale of LOCALES) {
      articles.push(...articleData.map((article: any) => ({
        url: `${BASE_URL}/${locale}/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })));
    }
  } catch (error) {
    console.error('Failed to generate sitemap for articles:', error);
  }

  // Fetch products
  let products: MetadataRoute.Sitemap = [];
  try {
    const res = await productAPI.getAll();
    const productData = Array.isArray(res.data) ? res.data : (res.data.data || []);
    
    for (const locale of LOCALES) {
      products.push(...productData.map((product: any) => ({
        url: `${BASE_URL}/${locale}/products/${createProductSlug(product.name, product.id)}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })));
    }
  } catch (error) {
    console.error('Failed to generate sitemap for products:', error);
  }

  return [...routes, ...articles, ...products];
}
