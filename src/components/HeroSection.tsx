import React from 'react';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import HeroCounters from './HeroCounters';
import HeroTypingEffect from './HeroTypingEffect';
import Earth3DContainer from './Earth3DContainer';

export default async function HeroSection() {
  const t = await getTranslations('hero');

  return (
    <section className="relative min-h-[92vh] flex flex-col bg-primary">
      {/* Background Wrapper - Handles overflow for bg elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Universe-style space background (behind everything) */}
        <div className="absolute inset-0 -z-20" style={{ background: 'radial-gradient(ellipse at center, #071027 0%, #02030a 45%, #000000 100%)' }} />

        {/* Large blurred nebula sprite that spans the full hero (visible on all screen sizes) */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[1200px] h-[1200px] opacity-70 blur-3xl mix-blend-screen animate-nebula" style={{ backgroundImage: "url('/textures/rad-grad.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>

        {/* Vignette overlay to subtly emphasize left content (non-interactive) */}
        <div className="absolute inset-0 -z-10 hero-vignette" />

        {/* Subtle star overlay (repeats small star sprite) — full bleed */}
        <div className="absolute inset-0 -z-20 opacity-50" style={{ backgroundImage: "url('/textures/circle.png')", backgroundSize: '32px 32px', backgroundRepeat: 'repeat' }} />

        {/* Animated subtle accents (decorative, above background but below content) */}
        <div className="absolute top-[-6%] right-[-4%] w-[420px] h-[420px] bg-secondary/6 rounded-none blur-[120px] animate-pulse -z-10" />
        <div className="absolute bottom-[-6%] left-[-4%] w-[420px] h-[420px] bg-purple-700/6 rounded-none blur-[120px] animate-pulse delay-1000 -z-10" />
      </div>

      <div className="container-custom relative z-10 pt-24 lg:pt-32 pb-20 lg:pb-28 flex-grow flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-secondary animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-none h-2 w-2 bg-secondary"></span>
              </span>
              {t('badge') || 'Building the Future Sustainably'}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight animate-fade-in-up delay-100">
              <span className="text-white block mb-4">Build Smarter with</span>
              <span className="sr-only">Bela Eco Panels</span>
              {/* Client-side typing animation isolated */}
              <HeroTypingEffect />
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed animate-fade-in-up delay-200">
              {t('subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start animate-fade-in-up delay-300">
              <Link href="/contact" className="group bg-secondary hover:bg-secondary/90 text-white px-8 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 rounded-none">
                {t('cta')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="https://belamodularhomes.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group px-8 py-4 font-bold text-lg text-white border border-white/20 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 rounded-none"
              >
                {t('viewBelaHomes') || 'View Bela Homes'}
              </a>
            </div>
          </div>
          
          {/* Right Visual - 3D Earth Component (Client Only) */}
          <div className="relative lg:block animate-fade-in-up delay-300 h-full min-h-[350px] md:min-h-[500px] flex items-center justify-center">
             <Earth3DContainer />
          </div>
        </div>
      </div>

      {/* Counters Section - Overlapping Bottom */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-30 px-4">
        <div className="container-custom">
          <HeroCounters />
        </div>
      </div>
    </section>
  );
}
