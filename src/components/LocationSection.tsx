"use client"

import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion"
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { MapPin, Phone, Mail, Navigation, Download } from "lucide-react"

// Import Standard Components if ShadCN is not fully set up, or use standard HTML
// Since I don't see a `components/ui` folder, I will write standard Tailwind for Card/Button functionality.

export default function LocationSection() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = mounted ? language : 'en';
  // Note: Using the store's en/ne objects
  const t = currentLang === 'en' ? en : ne;

  // Re-creating the locations data based on the component's requirement and existing translations
  const locations = [
    {
      id: 'head-office',
      name: currentLang === 'en' ? 'Head Office' : 'मुख्य कार्यालय',
      address: t.ourLocations.ktmDesc, // "Chhauni-15, Kathmandu..."
      phone: "+977 9802375303, 01-5922974", // Merged
      email: "info@belanepal.com.np",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.831575822365!2d85.29745307524957!3d27.691519776191635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb188d447f5329%3A0xc3f9a721ba170bd7!2sChhauni%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1709971234567!5m2!1sen!2snp",
      googleMapsLink: "https://maps.app.goo.gl/erZdihnG3TdFjhmPA"
    },
    {
      id: 'factory',
      name: currentLang === 'en' ? 'Factory' : 'कारखाना',
      address: t.ourLocations.factoryDesc, // "Hetauda Industrial Area..."
      phone: "+977 9802375303", 
      email: "info@belanepal.com.np",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3486.618684799363!2d85.03249007539165!3d27.408119976355422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDI0JzI5LjIiTiA4NcKwMDInMDYuMiJF!5e1!3m2!1sen!2snp!4v1770976683885!5m2!1sen!2snp",
      googleMapsLink: "https://maps.app.goo.gl/kZtKh72BPrN6NWhT7"
    }
  ];

  return (
    <section id="locations" className="relative py-12 lg:py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-3xl opacity-50" />
      </div>

      <div className="container-custom relative mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-16"
        >
          <span className="inline-block py-1 px-3 bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20 rounded-none">
            {currentLang === 'en' ? 'Our Presence' : 'हाम्रो उपस्थिति'}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            {t.ourLocations.title}
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
             {t.ourLocations.subtitle}
          </p>
        </motion.div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {locations.map((location, index) => {
            const mapLink = location.googleMapsLink;

            return (
              <motion.div
                key={location.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="h-full"
                >
                  <div 
                    onClick={() => window.open(mapLink, '_blank', 'noopener,noreferrer')}
                    className="group relative h-full flex flex-col bg-white dark:bg-gray-800/50 rounded-none overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
                  >
                
                    {/* Map Section */}
                    <div className="relative h-72 w-full shrink-0 overflow-hidden">
                       <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" /> {/* Loading state placeholder */}
                       <iframe
                        src={location.mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 w-full h-full grayscale-[100%] group-hover:grayscale-0 transition-all duration-700 contrast-[1.1] opacity-90 group-hover:opacity-100 pointer-events-none"
                        title={location.name}
                      />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white dark:from-gray-800/90 via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Location Badge */}
                  <div className="absolute top-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-none border border-white/20 shadow-lg flex items-center gap-2 z-10">
                    <div className="w-2 h-2 rounded-none bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {currentLang === "en" ? "Active" : "सक्रिय"}
                    </span>
                  </div>
                </div>


                {/* Content Section */}
                <div className="relative px-4 lg:px-8 pb-8 -mt-24 z-20 pointer-events-none flex-grow flex flex-col">
                  <div className="pointer-events-auto bg-white dark:bg-gray-900 rounded-none p-6 lg:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-2xl dark:shadow-black/20 border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] group-hover:-translate-y-2 flex-grow flex flex-col">
                    
                    <div className="flex-grow flex flex-col gap-6">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                          {location.name}
                        </h3>
                        {/* Status Dot */}
                        <div className="flex h-3 w-3 relative mt-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-none h-3 w-3 bg-green-500"></span>
                        </div>
                      </div>

                      {/* Location Box */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(mapLink, '_blank', 'noopener,noreferrer')
                        }}
                        className="bg-orange-50/50 dark:bg-gray-800/50 rounded-none p-5 border border-orange-100/50 dark:border-gray-700 group/loc hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-white dark:bg-gray-700 p-2.5 rounded-none shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover/loc:scale-105 transition-transform duration-300">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-orange-600/80 dark:text-orange-400 uppercase tracking-wider mb-1">
                              {currentLang === 'en' ? 'Address' : 'ठेगाना'}
                            </p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                              {location.address}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info - Stacked List Modern Style */}
                      <div className="flex flex-col gap-3">
                         {/* Phone */}
                        {location.phone && (
                          <div className="group/item flex items-start justify-between p-4 rounded-none bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-300">
                            <div className="flex items-start gap-3">
                              <div className="bg-white dark:bg-gray-700 p-2 rounded-none shadow-sm text-gray-500 group-hover/item:text-blue-600 transition-colors mt-0.5">
                                <Phone className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col gap-1">
                                {location.phone.split(',').map((num, i) => (
                                  <a 
                                    key={i}
                                    href={`tel:${num.trim()}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover/item:text-blue-700 transition-colors hover:underline"
                                  >
                                    {num.trim()}
                                  </a>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover/item:text-blue-500 uppercase tracking-wider mt-1.5">
                              {currentLang === 'en' ? 'Call' : 'फोन'}
                            </span>
                          </div>
                        )}

                        {/* Email */}
                        {location.email && (
                          <a 
                            href={`mailto:${location.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="group/item flex items-center justify-between p-4 rounded-none bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 border border-transparent hover:border-purple-100 dark:hover:border-purple-800 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="bg-white dark:bg-gray-700 p-2 rounded-none shadow-sm text-gray-500 group-hover/item:text-purple-600 transition-colors shrink-0">
                                <Mail className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover/item:text-purple-700 transition-colors truncate">
                                {location.email}
                              </span>
                            </div>
                             <span className="text-xs font-bold text-gray-400 group-hover/item:text-purple-500 uppercase tracking-wider ml-2 shrink-0">
                                {currentLang === 'en' ? 'Email' : 'ईमेल'}
                            </span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-gray-100 dark:bg-gray-700/50 my-6" />

                    {/* Button */}
                    <div className="mt-auto">
                      <a 
                        href={location.googleMapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-none bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all duration-300 shadow-lg shadow-gray-200/50 dark:shadow-none group-hover:scale-[1.02] font-semibold"
                      >
                         <Navigation className="w-4 h-4" />
                         <span>{currentLang === 'en' ? 'Get Directions' : 'स्थान हेर्नुहोस्'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  )
}
