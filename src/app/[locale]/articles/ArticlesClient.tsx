'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { articleAPI } from '@/lib/api';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { Calendar, User, ArrowRight, Loader2, FileText, Search, Globe } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface Article {
  id: string;
  slug: string;
  title: string;
  titleNe?: string;
  excerpt: string;
  excerptNe?: string;
  imageUrl?: string;
  publishedAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

export default function ArticlesClient() {
  const { language } = useLanguageStore();
  const t = language === 'en' ? en : ne;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await articleAPI.getAll({ serviceTag: 'ECOPANELS' });
        // Handle various response structures
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (Array.isArray(data)) {
            setArticles(data);
        } else {
            console.error('Unexpected articles data format', data);
            setArticles([]);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    const title = language === 'ne' ? (article.titleNe || article.title) : article.title;
    const excerpt = language === 'ne' ? (article.excerptNe || article.excerpt) : article.excerpt;
    
    return title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Navbar />
      
      {/* Header Section */}
      <section className="relative pt-24 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-pattern-hex opacity-10 animate-pattern-slide"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/20 rounded-none blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-none blur-[80px]"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-none bg-white/10 border border-white/20 text-secondary text-sm font-medium mb-4 animate-fade-in-up">
            {t.articles?.badge || 'Articles'}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100">
            {language === 'en' ? (
              <>Latest <span className="text-secondary">Insights</span> & News</>
            ) : (
              t.articles?.title || 'समाचार र लेखहरू'
            )}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
            {t.articles?.subtitle || 'Learn more about sustainable construction'}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-10 relative animate-fade-in-up delay-300">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder={t.articles?.searchPlaceholder || 'Search articles...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-none bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 -mt-10 pb-20">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px] bg-white dark:bg-gray-800 rounded-none shadow-xl border border-gray-100 dark:border-gray-700">
              <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, idx) => (
                <Link 
                  href={`/articles/${article.slug}`} 
                  key={article.id}
                  className="group bg-white dark:bg-gray-800 rounded-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100 dark:border-gray-700 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {article.imageUrl ? (
                      <Image 
                        src={getImageUrl(article.imageUrl) || ''} 
                        alt={language === 'ne' ? (article.titleNe || article.title) : article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl font-bold opacity-20">BELA</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                    
                    {/* Category Badge (Mock) */}
                    <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-none shadow-lg z-10">
                      {t.articles?.news || (language === 'ne' ? 'समाचार' : 'News')}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow relative">
                    {/* Date & Author */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-none">
                        <Calendar size={12} />
                        {new Date(article.publishedAt).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {article.author?.firstName} {article.author?.lastName}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-primary dark:text-white group-hover:text-secondary transition-colors line-clamp-2">
                      {language === 'ne' ? (article.titleNe || article.title) : article.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 flex-grow">
                      {language === 'ne' ? (article.excerptNe || article.excerpt) : article.excerpt}
                    </p>
                    
                    <div className="flex items-center text-secondary font-bold text-sm group/btn">
                      {t.articles?.readMore || (language === 'ne' ? 'थप पढ्नुहोस्' : 'Read More')}
                      <ArrowRight size={16} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-none shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-none flex items-center justify-center mx-auto mb-6 text-gray-400">
                <FileText size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.articles?.noArticles || 'No articles found'}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t.articles?.noArticlesDesc || 'Check back later for updates.'}
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
