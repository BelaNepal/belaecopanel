'use client';

import React, { useEffect, useState, useRef } from 'react';
import { testimonialAPI } from '@/lib/api';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials() {
  const { language } = useLanguageStore();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const DURATION = 8000; // Increased duration for better reading time
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchTestimonials = async () => {
      try {
        const res = await testimonialAPI.getAll({ serviceTag: 'ECOPANELS' });
        if (Array.isArray(res.data)) {
          setTestimonials(res.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Failed to fetch testimonials', error);
        // Fallback data for demonstration if API fails or returns empty
        setTestimonials([
          {
            id: 1,
            content: "Bela Eco Panels has revolutionized our construction process. The quality and sustainability of their materials are unmatched in the industry.",
            name: "Sarah Johnson",
            position: "Chief Architect",
            company: "GreenBuild Solutions",
            imageUrl: ""
          },
          {
            id: 2,
            content: "We've seen a 30% reduction in energy costs since switching to these panels. Highly recommended for any eco-conscious business.",
            name: "Michael Chen",
            position: "Director of Operations",
            company: "EcoTech Industries",
            imageUrl: ""
          },
          {
            id: 3,
            content: "Outstanding service and product quality. The team at Bela Eco Panels truly understands the needs of modern sustainable construction.",
            name: "David Smith",
            position: "Project Manager",
            company: "Urban Developments",
            imageUrl: ""
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const currentLang = mounted ? language : 'en';
  const t = currentLang === 'en' ? en : ne;

  useEffect(() => {
    if (testimonials.length === 0) return;

    const startTime = Date.now();
    setProgress(0);
    
    // Reset any existing interval when index changes to restart progress
    if (progressInterval.current) clearInterval(progressInterval.current);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= DURATION) {
        handleNext();
      }
    };

    progressInterval.current = setInterval(animate, 50);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentIndex, testimonials.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom flex justify-center">
          <div className="animate-pulse w-full max-w-4xl h-96 bg-gray-200 dark:bg-gray-800 rounded-none"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];
  if (!current) return null;

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-pattern-rectangles opacity-5 pointer-events-none"></div>
      
      {/* Decorative background blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-none blur-[100px] -z-10"></div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          
          {/* Left Side - Text Box (Overlapping) */}
          <div className="lg:w-5/12 z-20 relative">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 p-10 rounded-sm shadow-2xl border-l-8 border-secondary lg:mr-[-4rem]"
            >
              <div className="inline-block mb-4 px-4 py-1.5 rounded-sm bg-secondary/10 text-secondary text-sm font-medium">
                {t.testimonials.badge || 'Success Stories'}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-primary dark:text-white mb-6 leading-tight">
                {t.testimonials.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {t.testimonials.subtitle}
              </p>
              
              {/* Navigation Buttons - Inside Left Box for Desktop */}
              <div className="hidden lg:flex gap-4">
                <button 
                  onClick={handlePrev}
                  className="w-12 h-12 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="w-12 h-12 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-sm"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Dark Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-8/12 w-full relative mt-8 lg:mt-0"
          >
            
            {/* Mobile Navigation */}
            <div className="flex justify-end gap-2 mb-4 lg:hidden">
              <button onClick={handlePrev} className="bg-secondary text-white p-2 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-sm"><ChevronLeft /></button>
              <button onClick={handleNext} className="bg-secondary text-white p-2 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-sm"><ChevronRight /></button>
            </div>

            <div className="bg-primary text-white p-8 md:p-12 lg:p-20 lg:pl-24 relative h-[550px] flex flex-col justify-center shadow-2xl rounded-sm overflow-hidden">
              
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-20">
                <motion.div 
                  className="h-full bg-secondary" 
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.05 }}
                ></motion.div>
              </div>

              {/* Background Watermark */}
              <div className="absolute right-10 top-10 opacity-10 pointer-events-none z-0">
                <Quote size={180} className="text-white" />
              </div>

              {/* Content */}
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div 
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="relative z-10 flex flex-col h-full justify-center w-full"
                >
                  <div className="flex gap-2 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-5 h-5 ${i < (current.rating || 5) ? 'text-secondary fill-current' : 'text-gray-400/30'}`} 
                        viewBox="0 0 20 20"
                        fill={i < (current.rating || 5) ? "currentColor" : "none"}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <div className="h-48 md:h-56 overflow-y-auto custom-scrollbar mb-8 pr-4">
                    <blockquote className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 leading-relaxed">
                      &quot;{current.content}&quot;
                    </blockquote>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-white/10 pt-8 mt-auto">
                    <div className="flex items-center gap-5">
                      {/* User Image */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary p-1 bg-white/5 flex-shrink-0 relative">
                        {current.imageUrl ? (
                          <Image 
                            src={getImageUrl(current.imageUrl)!} 
                            alt={current.name} 
                            fill
                            className="object-cover rounded-full"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {current.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-white font-bold text-xl mb-1">{current.name}</h4>
                        <p className="text-secondary text-sm font-medium uppercase tracking-wider">
                          {current.position}
                        </p>
                        {current.company && (
                          <p className="text-gray-400 text-sm mt-0.5">{current.company}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
