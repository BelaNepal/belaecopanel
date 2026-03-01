"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface PanelItem {
  src: string;
  link?: string;
}

const PANELS: PanelItem[] = [
  {
    src: "https://belanepal.com.np/wp-content/uploads/2025/07/bela-eco-panel.jpg",
    link: "/products",
  },
  {
    src: "https://belanepal.com.np/wp-content/uploads/2025/07/hollowL-panel-20mm.jpg",
    link: "/products",
  },
  {
    src: "https://belanepal.com.np/wp-content/uploads/2025/07/coreT-panel-60mm.jpg",
    link: "/products",
  },
  {
    src: "https://belanepal.com.np/wp-content/uploads/2025/07/coreL-panel-200mm.jpg",
    link: "/products",
  },
  {
    src: "https://belanepal.com.np/wp-content/uploads/2025/07/hollowT-panel-120mm.jpg",
    link: "/products",
  },
];

export default function EcoPanelsCarousel(): JSX.Element {
  const [centerIndex, setCenterIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const total = PANELS.length;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive configuration
  const radius = isMobile ? 160 : 950;
  const angleStep = isMobile ? 55 : 20;
  const spacing = isMobile ? 70 : 50;
  const maxVisible = 2;
  const baseCardSize = isMobile ? 200 : 330;
  const centerScale = isMobile ? 1.15 : 1.5;
  const containerHeight = isMobile ? "h-[300px]" : "h-[550px]";

  const mod = (n: number, m: number): number => ((n % m) + m) % m;

  const move = (direction: number): void => {
    setCenterIndex((prev) => mod(prev + direction, total));
    resetAutoRotate();
  };

  const resetAutoRotate = (): void => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);

    setTimeout(() => {
      autoRotateRef.current = setInterval(() => {
        setCenterIndex((prev) => mod(prev + 1, total));
      }, 5000);
    }, 10000);
  };

  useEffect(() => {
    resetAutoRotate();
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-12 overflow-hidden">
      <div className="relative mx-auto max-w-[1600px] perspective-[2400px] px-4 md:px-12">

        {/* Left Arrow */}
        <button
          aria-label="Previous panel"
          onClick={() => move(-1)}
          className="absolute left-2 md:left-0 top-1/2 z-30 flex h-10 w-10 md:h-14 md:w-14 md:-translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xl md:text-2xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-secondary hover:text-white rounded-none"
        >
          ❮
        </button>

        {/* Right Arrow */}
        <button
          aria-label="Next panel"
          onClick={() => move(1)}
          className="absolute right-2 md:right-0 top-1/2 z-30 flex h-10 w-10 md:h-14 md:w-14 md:translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xl md:text-2xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-secondary hover:text-white rounded-none"
        >
          ❯
        </button>

        {/* Carousel */}
        <div className={`relative flex ${containerHeight} items-center justify-center [transform-style:preserve-3d]`}>
          {PANELS.map((panel, i) => {
            let offset = i - centerIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            if (Math.abs(offset) > maxVisible) return null;

            const angle = offset * angleStep;
            const rad = (angle * Math.PI) / 180;
            const x = Math.sin(rad) * radius + offset * spacing;
            const z = radius - Math.cos(rad) * radius;
            const isCenter = offset === 0;

            return (
              <div
                key={i}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  transform: `
                    translateX(${x}px)
                    translateZ(${-z}px)
                    rotateY(${angle}deg)
                  `,
                  zIndex: maxVisible + 1 - Math.abs(offset),
                }}
              >
                <div
                  className={`
                    overflow-hidden rounded-none bg-white dark:bg-gray-800 shadow-2xl
                    transition-all duration-500
                    ${
                      isCenter
                        ? "hover:-translate-y-3 hover:scale-105 ring-4 ring-secondary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        : "blur-[2px] opacity-60 pointer-events-none grayscale-[30%] scale-y-90"
                    }
                  `}
                  style={{
                    width: `${baseCardSize}px`,
                    height: `${baseCardSize}px`,
                    transform: `scale(${isCenter ? centerScale * 1.2 : 0.85})`,
                    boxShadow: isCenter ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none'
                  }}
                >
                  {panel.link ? (
                    <Link href={panel.link} className="block w-full h-full relative">
                      <Image
                        src={panel.src}
                        alt="Eco Panel"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                      <Image
                        src={panel.src}
                        alt="Eco Panel"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  
                  {/* Overlay Gradient for depth */}
                  {!isCenter && <div className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-[1px]"></div>}
                  
                  {/* TV Glare Effect for Center Card */}
                  {isCenter && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none rounded-none"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
