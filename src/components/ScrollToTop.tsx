'use client';

import React, { useEffect, useState } from 'react';
import { ChevronUp, Phone } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled upto given distance
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-center gap-4">
      {/* Scroll To Top Button - Absolute positioning, moves to top of stack */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`
          absolute bottom-0
          flex items-center justify-center w-12 h-12 rounded-full 
          bg-primary text-white shadow-lg transition-all duration-500 ease-in-out
          hover:bg-opacity-90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          ${isVisible ? 'opacity-100 -translate-y-36 scale-100' : 'opacity-0 translate-y-0 scale-50 pointer-events-none'}
        `}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} />
      </button>

      {/* Phone Button */}
      <div className="relative z-10 group">
        {/* Continuous Blink/Ping Animation Layer - Always Active */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#ef7e2a] opacity-75 animate-ping duration-1000"></span>

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold py-2 px-3 rounded-lg shadow-lg whitespace-nowrap relative">
             Call Now
             {/* Arrow */}
             <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45"></div>
          </div>
        </div>

        <a
          href="tel:+977015922974"
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#ef7e2a] text-white shadow-[0_4px_14px_0_rgba(239,126,42,0.39)] transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_6px_20px_rgba(239,126,42,0.23)]"
          aria-label="Call us"
        >
          <Phone size={24} className="fill-current" />
        </a>
      </div>

      {/* WhatsApp Button - Always visible, with modern effects */}
      <div className="relative z-10 group">
        {/* Continuous Blink/Ping Animation Layer - Always Active */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping duration-1000"></span>
        
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold py-2 px-3 rounded-lg shadow-lg whitespace-nowrap relative">
             Chat with us
             {/* Arrow */}
             <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45"></div>
          </div>
        </div>

        <a
          href="https://wa.me/9779802375303"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)]"
          aria-label="Contact us on WhatsApp"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="32" 
            height="32" 
            fill="currentColor"
            className="w-8 h-8 drop-shadow-sm"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
