'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { CheckCircle2, Leaf, Zap, ShieldCheck } from 'lucide-react';

export default function HeroCounters() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);
  const currentLang = mounted ? language : 'en';
  const t = currentLang === 'en' ? en : ne;

  const countersData = [
    { icon: <CheckCircle2 size={24} className="text-secondary" />, value: 20000, suffix: '+', label: t.hero.counters?.panels || 'Panels Installed', subtext: 'Across Nepal' },
    { icon: <Leaf size={24} className="text-secondary" />, value: 50, suffix: '%', label: t.hero.counters?.co2 || 'Cost Saved', subtext: 'Vs. Traditional Concrete' },
    { icon: <Zap size={24} className="text-secondary" />, value: 10, suffix: 'x', label: t.hero.counters?.energy || 'Installation Speed', subtext: 'Compared to Brick Work' },
    { icon: <ShieldCheck size={24} className="text-secondary" />, value: 65, suffix: '+', label: t.hero.counters?.warranty || 'Average Lifespan', subtext: 'Years' },
  ];

  const [counts, setCounts] = useState<number[]>(countersData.map(() => 0));

  // Intersection observer: start animation when visible
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    
    // Threshold adjusted for better mobile triggering
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setVisible(true);
      });
    }, { threshold: 0.15 });
    
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!visible) return;
    let rafId = 0;
    let start: number | null = null;
    const duration = 1400;

    const step = (time: number) => {
      if (start === null) start = time;
      const progress = Math.min((time - start) / duration, 1);
      setCounts(countersData.map(c => Math.floor(c.value * progress)));
      if (progress < 1) rafId = requestAnimationFrame(step);
      else setCounts(countersData.map(c => c.value));
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [visible]);

  return (
    <div ref={ref} className="w-full animate-fade-in-up delay-200">
      <div className="relative group">
        {/* Gradient border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-orange-400 rounded-none opacity-50 group-hover:opacity-80 transition duration-500 blur-[2px]"></div>
        
        {/* Card with Company Branding Colors (Primary Background) */}
        <div className="relative w-full bg-primary border border-white/10 rounded-none p-4 sm:p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 shadow-2xl">
          {countersData.map((c, idx) => (
            <div 
              key={idx} 
              className={`
                flex flex-col items-center lg:items-start 
                pl-0 lg:pl-6 
                border-white/10 
                hover:border-secondary/50 transition-colors duration-300
                /* Desktop borders */
                ${idx !== 0 ? 'lg:border-l' : ''}
              `}
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                <div className="text-secondary p-1.5 sm:p-2 bg-white/5 rounded-none shrink-0">
                  {/* Clone icon to enforce size classes if needed, though size prop is set above */}
                  {c.icon}
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider text-center sm:text-left leading-tight">
                  {c.label}
                </span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight text-center sm:text-left">
                {counts[idx].toLocaleString()}
                <span className="text-secondary text-base sm:text-xl lg:text-2xl ml-0.5">{c.suffix}</span>
              </div>
              
              {/* Added Subtext */}
              <div className="text-[10px] sm:text-xs font-medium text-white/50 mt-1 uppercase tracking-widest text-center sm:text-left">
                {c.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
