'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { MapPin, ArrowRight } from 'lucide-react';

export default function OurLocations() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = mounted ? language : 'en';
  const t = currentLang === 'en' ? en : ne;

  const locations = [
    {
      title: t.ourLocations.ktmTitle,
      description: t.ourLocations.ktmDesc,
      image: "https://belanepal.com.np/wp-content/uploads/2025/06/corporate-location.png",
      mapUrl: "https://maps.app.goo.gl/erZdihnG3TdFjhmPA",
    },
    {
      title: t.ourLocations.factoryTitle,
      description: t.ourLocations.factoryDesc,
      image: "https://belanepal.com.np/wp-content/uploads/2025/06/bela-factory-location.png",
      mapUrl: "https://maps.app.goo.gl/kZtKh72BPrN6NWhT7",
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-[#0f172a] py-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-primary/5 rounded-none blur-[80px]"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-secondary/5 rounded-none blur-[80px]"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-none bg-secondary/10 text-secondary text-sm font-medium mb-4">
            {t.contact.locations.title}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">
            {t.ourLocations.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            {t.ourLocations.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((loc, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={loc.image}
                  alt={loc.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-none shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1">Locate Us</p>
                      <a
                        href={loc.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-secondary flex items-center gap-1 hover:underline"
                      >
                        {t.ourLocations.viewMap} <ArrowRight size={14} />
                      </a>
                   </div>
                </div>
              </div>

              <div className="p-8 relative">
                <div className="absolute -top-8 right-8 bg-secondary text-white p-4 rounded-none shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                  <MapPin size={24} />
                </div>

                <h3 className="text-2xl font-bold text-primary dark:text-white mb-3 pr-12">
                  {loc.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {loc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
