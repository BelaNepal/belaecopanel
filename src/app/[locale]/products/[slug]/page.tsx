import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { productAPI } from '@/lib/api';
import { extractIdFromSlug, createProductSlug } from '@/lib/utils';
import ProductClient, { Product } from './ProductClient';

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await productAPI.getAll({});
    const products = Array.isArray(res.data) ? res.data : (res.data.data || []);
    
    const params: { locale: string; slug: string }[] = [];
    const locales = ['en', 'ne'];
    
    for (const locale of locales) {
      for (const product of products) {
        if (product.id && product.name) {
          const slug = createProductSlug(product.name, product.id);
          params.push({ locale, slug });
        }
      }
    }
    
    return params;
  } catch (error) {
     console.error('Failed to generate static params for products:', error);
     return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  try {
    const res = await productAPI.getById(id);
    const product = res.data;
    
    if (!product) return { title: 'Product Not Found' };

    const images = product.imageUrl 
      ? [
          (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('blob:')) 
            ? product.imageUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${product.imageUrl}`
        ] 
      : [];

    return {
      title: product.name,
      description: product.description || `Buy ${product.name} - ${product.panelType} Panel`,
      openGraph: {
        title: product.name,
        description: product.description || `Premium ${product.panelType} Panel`,
        images: images,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: images,
      }
    };
  } catch (error) {
    return {
      title: 'Product Not Found | Bela Eco Panels',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  
  let product: Product | null = null;
  
  try {
    const res = await productAPI.getById(id);
    product = res.data;
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}