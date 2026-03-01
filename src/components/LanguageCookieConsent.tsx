'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from '@/navigation';
import { Globe, Check, ShieldCheck } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function LanguageCookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  useEffect(() => {
    // Check if preference exists in localStorage
    // We use a specific key to track if the USER explicitly made a choice
    const hasConsented = localStorage.getItem('bela_consent_shown');
    
    if (!hasConsented) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelection = (selectedLocale: 'en' | 'ne') => {
    // 1. Save locally that user has consented
    localStorage.setItem('bela_consent_shown', 'true');

    // 2. Set the NEXT_LOCALE cookie which next-intl middleware looks for
    // Max-age: 1 year
    document.cookie = `NEXT_LOCALE=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // 3. Switch language if needed, otherwise just close nicely
    if (selectedLocale !== currentLocale) {
      router.replace(pathname, { locale: selectedLocale });
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center pointer-events-none p-4 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 border-t-4 border-[#ef7e2a] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-lg w-full max-w-lg pointer-events-auto transform animate-fade-in-up">
        
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#ef7e2a]/10 flex items-center justify-center flex-shrink-0 text-[#ef7e2a]">
                    <Globe size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Select Your Language
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Welcome to Bela Eco Panels. Please select your preferred language to continue.
                        <br />
                        <span className="text-gray-400 text-xs mt-1 block">
                            (तपाईंको मनपर्ने भाषा चयन गर्नुहोस्)
                        </span>
                    </p>
                </div>
            </div>

            {/* Language Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => handleSelection('en')}
                    className={`
                        relative group flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left
                        ${currentLocale === 'en' 
                            ? 'border-[#ef7e2a] bg-[#ef7e2a]/5' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-[#ef7e2a]/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                    `}
                >
                    <div className="flex-1">
                        <span className="block font-bold text-gray-900 dark:text-white">English</span>
                        <span className="text-xs text-gray-500">International</span>
                    </div>
                    {currentLocale === 'en' && (
                        <div className="w-6 h-6 rounded-full bg-[#ef7e2a] text-white flex items-center justify-center">
                            <Check size={14} />
                        </div>
                    )}
                </button>

                <button
                    onClick={() => handleSelection('ne')}
                    className={`
                        relative group flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left
                        ${currentLocale === 'ne' 
                            ? 'border-[#ef7e2a] bg-[#ef7e2a]/5' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-[#ef7e2a]/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                    `}
                >
                    <div className="flex-1">
                        <span className="block font-bold text-gray-900 dark:text-white">नेपाली</span>
                        <span className="text-xs text-gray-500">Nepal</span>
                    </div>
                    {currentLocale === 'ne' && (
                        <div className="w-6 h-6 rounded-full bg-[#ef7e2a] text-white flex items-center justify-center">
                            <Check size={14} />
                        </div>
                    )}
                </button>
            </div>

            {/* Footer / Cookie Notice */}
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-[#ef7e2a]" />
                <p>
                    By choosing a language and continuing, you acknowledge our use of cookies to enhance your experience and save your preferences.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
