'use client';

import React, { useEffect, useState } from 'react';
import { articleAPI } from '@/lib/api';
import { Link } from '@/navigation';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { useLanguageStore } from '@/stores';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { motion, Variants } from 'framer-motion';

interface LatestArticlesProps {
  initialArticles?: any[];
}

export default function LatestArticles({ initialArticles = [] }: LatestArticlesProps) {
  const { language } = useLanguageStore();
  const t = useTranslations();
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only fetch if no initial articles provided
    if (initialArticles.length === 0) {
      const fetchArticles = async () => {
        try {
          const res = await articleAPI.getAll({ take: 3, serviceTag: 'ECOPANELS' });
          if (res.data && Array.isArray(res.data.data)) {
            setArticles(res.data.data);
          } else {
            setArticles([]);
          }
        } catch (error) {
          console.error('Failed to fetch articles', error);
        } finally {
          setLoading(false);
        }
      };

      fetchArticles();
    } else {
      setLoading(false);
    }
  }, [initialArticles]);

  const currentLang = mounted ? language : 'en';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-pattern-waves opacity-50 pointer-events-none"></div>
      <div className="container-custom relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary dark:text-white">
            {t('latestInsights.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('latestInsights.subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-none h-96 animate-pulse" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {articles.map((article: any) => (
              <motion.div key={article.id} variants={itemVariants} className="h-full">
                <Link key={article.id} href={`/articles/${article.slug}`} className="group h-full block">
                  <div className="bg-white dark:bg-gray-800 rounded-none overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 h-full flex flex-col hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {article.imageUrl ? (
                        <Image 
                          src={getImageUrl(article.imageUrl)!} 
                          alt={article.title}
                          fill
                          className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {t('latestInsights.noImage')}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-1.5 rounded-none text-xs font-bold text-primary dark:text-white uppercase tracking-wider shadow-lg">
                        {t('latestInsights.news')}
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-secondary" />
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                        {article.author && (
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-secondary" />
                            <span>{article.author.firstName}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-2xl mb-4 text-gray-900 dark:text-white group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                        {language === 'ne' ? (article.titleNe || article.title) : article.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                        {language === 'ne' ? (article.excerptNe || article.excerpt) : (article.excerpt || article.content?.substring(0, 100) + '...')}
                      </p>
                      
                      <div className="flex items-center text-primary dark:text-white font-bold text-sm group-hover:text-secondary transition-colors mt-auto">
                        {t('articles.readMore')} <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-none">
            <p className="text-gray-500 dark:text-gray-400">{t('articles.noArticles')}</p>
          </div>
        )}

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-16"
        >
          <Link 
            href="/articles" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-none font-bold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
          >
            {t('articles.viewAll')} <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
