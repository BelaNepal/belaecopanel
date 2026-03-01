'use client';

import React, { useEffect, useState } from 'react';
import { faqAPI } from '@/lib/api';
import { ChevronDown } from 'lucide-react';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const { language } = useLanguageStore();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchFaqs = async () => {
      try {
        const res = await faqAPI.getAll({ serviceTag: 'ECOPANELS' });
        setFaqs(res.data);
      } catch (error) {
        console.error('Failed to fetch FAQs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const currentLang = mounted ? language : 'en';
  const t = currentLang === 'en' ? en : ne;

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="relative py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-pattern-dots pointer-events-none opacity-40"></div>
      
      <div className="container-custom max-w-3xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Support
          </span>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark dark:from-white dark:to-gray-300">
            {t.faq.title}
          </h2>
          <motion.div 
            className="h-1 w-20 bg-primary mx-auto mt-4 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {faqs.map((faq: any) => (
              <motion.div
                key={faq.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-shadow duration-300 ${
                  expandedId === faq.id ? 'shadow-lg ring-1 ring-primary/20' : 'shadow-sm hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <h3 className={`font-semibold text-lg transition-colors ${
                    expandedId === faq.id ? 'text-primary' : 'text-gray-900 dark:text-white'
                  }`}>
                    {faq.question}
                  </h3>
                  <div className={`p-1 rounded-full transition-colors ${
                    expandedId === faq.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${
                        expandedId === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-0 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700/50 mt-2 pt-4 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
