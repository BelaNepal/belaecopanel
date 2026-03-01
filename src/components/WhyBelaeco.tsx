'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/stores';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Leaf, Shield, Coins, Sliders, Flame, Thermometer, VolumeX, Hammer, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyBelaeco() {
  const { language } = useLanguageStore();
  const t = useTranslations('whyBelaeco');
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    { 
      title: t('features.ecoFriendly.title'), 
      description: t('features.ecoFriendly.desc'), 
      icon: <Leaf size={24} />,
      details: t('features.ecoFriendly.details')
    },
    { 
      title: t('features.durable.title'), 
      description: t('features.durable.desc'), 
      icon: <Shield size={24} />,
      details: t('features.durable.details')
    },
    {  
      title: t('features.costEffective.title'), 
      description: t('features.costEffective.desc'), 
      icon: <Coins size={24} />,
      details: t('features.costEffective.details')
    },
    { 
      title: t('features.customizable.title'), 
      description: t('features.customizable.desc'), 
      icon: <Sliders size={24} />,
      details: t('features.customizable.details')
    },
    { 
      title: t('features.fireResistant.title'), 
      description: t('features.fireResistant.desc'), 
      icon: <Flame size={24} />,
      details: t('features.fireResistant.details')
    },
    { 
      title: t('features.insulating.title'), 
      description: t('features.insulating.desc'), 
      icon: <Thermometer size={24} />,
      details: t('features.insulating.details')
    },
    { 
      title: t('features.soundproof.title'), 
      description: t('features.soundproof.desc'), 
      icon: <VolumeX size={24} />,
      details: t('features.soundproof.details')
    },
    { 
      title: t('features.easyInstall.title'), 
      description: t('features.easyInstall.desc'), 
      icon: <Hammer size={24} />,
      details: t('features.easyInstall.details')
    },
  ];

  // Track which card is hovered (index) so only that card shows the effect
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section 
      className="relative pt-24 pb-12 bg-gradient-to-b from-gray-50 to-white dark:from-[#050505] dark:to-black overflow-hidden"
    >
      {/* Modern Background Elements with Parallax-like feel */}
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.03] pointer-events-none"></div>
      
      {/* Moving Blobs */}
      <motion.div 
        animate={{ 
          x: [0, 20, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"
      />
      <motion.div 
        animate={{ 
          x: [0, -20, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -z-10"
      />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          
          {/* Left Column: Content & Features */}
          <div className="flex flex-col justify-center h-full space-y-8 group">
            
            {/* Header Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-left space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-secondary/10 text-secondary text-xs font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                {t('badge') || 'Why Choose Us'}
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-primary dark:text-white leading-tight tracking-tight">
                <span className="relative inline-block">
                  {t('title')}
                  <motion.span 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute left-0 bottom-0 h-3 w-full bg-secondary/20 -z-10 origin-left transform -rotate-1"
                  />
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                {t('description')}
              </p>
            </motion.div>

            {/* Feature Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow content-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    group/card relative p-5 
                    bg-white/60 dark:bg-white/5 backdrop-blur-md 
                    border border-gray-200 dark:border-white/10 
                    overflow-hidden flex flex-col justify-center min-h-[140px] 
                    rounded-sm
                    transition-all duration-300
                    hover:shadow-lg hover:border-secondary/30 dark:hover:border-secondary/30 hover:-translate-y-1
                    ${hoveredIndex === index ? 'z-10' : 'z-0'}
                  `}
                >
                  {/* Subtle Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : ''}`}></div>

                  {/* Animated decorative lines */}
                  <div className={`absolute left-0 top-0 h-[3px] w-full origin-left transform ${hoveredIndex === index ? 'scale-x-100' : 'scale-x-0'} transition-transform duration-500 bg-secondary z-20`}></div>
                  <div className={`absolute left-0 top-0 w-[3px] h-full origin-top transform ${hoveredIndex === index ? 'scale-y-100' : 'scale-y-0'} transition-transform duration-500 delay-100 bg-secondary z-20`}></div>
                  <div className={`absolute right-0 bottom-0 h-[3px] w-full origin-right transform ${hoveredIndex === index ? 'scale-x-100' : 'scale-x-0'} transition-transform duration-500 delay-200 bg-primary dark:bg-white z-20`}></div>
                  <div className={`absolute right-0 bottom-0 w-[3px] h-full origin-bottom transform ${hoveredIndex === index ? 'scale-y-100' : 'scale-y-0'} transition-transform duration-500 delay-300 bg-primary dark:bg-white z-20`}></div>

                  
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`
                      shrink-0 w-12 h-12 rounded-sm flex items-center justify-center 
                      transition-all duration-300 
                      ${hoveredIndex === index ? 'bg-secondary text-white scale-110 rotate-3' : 'bg-gray-100 dark:bg-white/5 text-primary dark:text-gray-300'}
                    `}>
                      {React.cloneElement(feature.icon as React.ReactElement, { size: 22 })}
                    </div>
                    <div className="space-y-1.5 flex-1">
                       <h3 className={`font-bold text-base transition-colors duration-300 ${hoveredIndex === index ? 'text-secondary' : 'text-gray-900 dark:text-white'}`}>
                        {feature.title}
                      </h3>
                      <div className="relative overflow-hidden">
                        {/* Current Description */}
                        <div className={`transition-all duration-300 ${hoveredIndex === index ? '-translate-y-full opacity-0 absolute top-0' : 'translate-y-0 opacity-100'}`}>
                           <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                        
                        {/* Hover Detail Slide-In */}
                        <div className={`transition-all duration-300 ${hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 absolute top-0'}`}>
                           <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-snug border-l-2 border-secondary pl-2">
                            {feature.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Video Section - Modern & Interactive */}
          <div className="relative h-full min-h-[400px] lg:min-h-0 flex flex-col justify-end items-center lg:items-end pb-2">
            
            {/* Modern Background Decoration for Right Column */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="absolute inset-0 -z-10"
            >
                {/* Soft Gradient Blob */}
                <div className="absolute top-0 right-[-20%] w-[120%] h-[100%] bg-gradient-to-bl from-gray-100/50 via-transparent to-transparent dark:from-white/5 rounded-full blur-xl transform rotate-3"></div>
                
                {/* Architectural Grid Pattern */}
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.15] dark:opacity-[0.1] mask-image-b-fade" 
                     style={{ 
                       backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                       backgroundSize: '24px 24px',
                       maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                       WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                     }}>
                </div>
            </motion.div>

            {/* Video Section Header */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-[600px] mb-8 text-left z-10 pl-2 sm:pl-0"
            >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Witness</span> the Revolution
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                See how our panels are installed in record time.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-full max-w-[600px] aspect-[4/3] group"
            >
              
              {/* Abstract Background Shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
              
              {/* Main Container */}
              <div className="relative w-full h-full rounded-sm overflow-hidden shadow-2xl border border-white/20 bg-gray-900 z-10 transition-transform duration-500 hover:scale-[1.01]">
                
                {!isPlaying ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors cursor-pointer" onClick={() => setIsPlaying(true)}>
                    <Image 
                      src="https://img.youtube.com/vi/o43uS9hfOcY/maxresdefault.jpg" 
                      alt="Bela Eco Panels" 
                      fill
                      className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Ripple Effect Play Button */}
                    <div className="relative z-30 flex items-center justify-center">
                        <div className="absolute w-20 h-20 bg-white/30 rounded-full animate-ping"></div>
                        <div className="absolute w-24 h-24 bg-white/10 rounded-full animate-ping delay-150"></div>
                        <div className="relative w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg backdrop-blur-md hover:scale-110 transition-transform duration-300">
                          <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                        </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 z-30 text-white">
                        <p className="text-sm font-medium opacity-90 uppercase tracking-widest mb-1">Watch Video</p>
                        <h3 className="text-xl font-bold">See How It's Built</h3>
                    </div>
                  </div>
                ) : (
                  <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/o43uS9hfOcY?autoplay=1" 
                        title="Bela Eco Panels Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen
                        className="absolute inset-0 w-full h-full object-cover"
                    ></iframe>
                )}
              </div>

              {/* Floating Stats Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 md:-left-12 z-20 bg-white dark:bg-gray-800 p-4 rounded-sm shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 max-w-[260px]"
              >
                 <div className="w-12 h-12 rounded-sm bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Leaf size={24} />
                 </div>
                 <div>
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">100%</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recyclable Materials</span>
                 </div>
              </motion.div>
              
              {/* Decorative Corner */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-secondary rounded-tr-3xl -z-10 opacity-60"></div>
              <div className="absolute -bottom-4 -left-3 w-24 h-24 border-b-2 border-l-2 border-primary dark:border-white rounded-bl-3xl -z-10 opacity-60"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
