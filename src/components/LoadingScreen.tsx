'use client';

import React from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-all duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('/assets/cubes.png')] pointer-events-none"></div>
      
      <div className="relative flex flex-col items-center p-8">
        {/* Logo Container */}
        <div className="relative mb-10 overflow-hidden">
          {/* Glowing effect behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 rounded-none blur-3xl animate-pulse"></div>
          
          <Image 
            src="/Logo-Bela.png" 
            alt="Bela Eco Panels" 
            width={500}
            height={140}
            className="h-28 w-auto object-contain relative z-10 animate-fade-in-up" 
            priority
          />
        </div>
        
        {/* Custom Spinner */}
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-none"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
        </div>
        
        {/* Branding Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Bela Eco Panels
          </h2>
          <p className="text-sm text-secondary font-medium animate-pulse">
            Building Sustainable Future...
          </p>
        </div>
      </div>
    </div>
  );
}
