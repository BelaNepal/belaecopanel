import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { articleAPI } from '@/lib/api';
import ArticleClient, { Article } from './ArticleClient';

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow generating pages for unknown slugs on demand

export async function generateStaticParams() {
  try {
    const res = await articleAPI.getAll({});
    const articles = Array.isArray(res.data) ? res.data : (res.data.data || []);
    
    const params: { locale: string; slug: string }[] = [];
    // Define locales manually or import from constants
    const locales = ['en', 'ne'];
    
    for (const locale of locales) {
      for (const article of articles) {
        if (article.slug) {
          params.push({ locale, slug: article.slug });
        }
      }
    }
    
    return params;
  } catch (error) {
    console.error('Failed to generate static params for articles:', error);
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await articleAPI.getBySlug(slug);
    const article = res.data;
    
    if (!article) return { title: 'Article Not Found' };

    const images = article.imageUrl 
      ? [
          (article.imageUrl.startsWith('http') || article.imageUrl.startsWith('blob:')) 
            ? article.imageUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${article.imageUrl}`
        ] 
      : [];

    return {
      title: article.title,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        images: images,
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.author ? `${article.author.firstName} ${article.author.lastName}` : 'Bela Eco Panels'],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: images,
      }
    };
  } catch (error) {
    return {
      title: 'Article Not Found | Bela Eco Panels',
      description: 'The requested article could not be found.',
    };
  }
}

export default async function ArticleViewPage({ params }: Props) {
  const { slug } = await params;
  
  let article: Article | null = null;
  
  try {
    const res = await articleAPI.getBySlug(slug);
    article = res.data;
  } catch (error) {
    console.error('Error fetching article:', error);
  }

  if (!article) {
    notFound();
  }

  return <ArticleClient article={article} />;
}