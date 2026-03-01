'use client';

import React, { useEffect, useState } from 'react';

export default function HeroTypingEffect() {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fullText = "Bela Eco Panels";

    const animateTyping = async () => {
      // Small initial delay to sync with fade-in
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      while (isMounted) {
        // Reset
        setDisplayText('');
        setShowCursor(true);
        
        // Typing loop
        for (let i = 0; i <= fullText.length; i++) {
          if (!isMounted) return;
          setDisplayText(fullText.slice(0, i));
          // Randomize typing speed slightly for realism
          await new Promise(r => setTimeout(r, 100 + Math.random() * 50));
        }

        // Finished typing - keep cursor blinking for 2 seconds
        await new Promise(r => setTimeout(r, 2000));
        if (!isMounted) return;
        
        setShowCursor(false);

        // Wait 10 seconds before restarting
        await new Promise(r => setTimeout(r, 10000));
      }
    };

    animateTyping();

    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <span aria-hidden="true" className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-300 drop-shadow-lg">
        {displayText}
      </span>
      <span className={`text-secondary inline-block sm:text-7xl font-light animate-pulse ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
        _
      </span>
    </>
  );
}
