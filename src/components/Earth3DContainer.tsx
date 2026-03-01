'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Earth3DPlaceholder = () => (
  <div className="w-full h-[350px] md:h-[500px] bg-transparent" />
);

// Dynamically import Earth3D with no SSR
const Earth3D = dynamic(() => import('./Earth3D'), { 
  ssr: false,
  loading: Earth3DPlaceholder
});

export default function Earth3DContainer() {
  return <Earth3D />;
}
