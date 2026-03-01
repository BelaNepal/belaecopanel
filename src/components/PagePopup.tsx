'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, Link } from '@/navigation';
import { popupAPI } from '@/lib/api';
import { X, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import ContactModal from './ContactModal';

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  displayMode: string;
  pagePath: string;
  serviceTag: string;
  type?: 'MODAL' | 'SLIDE_IN';
}

interface PagePopupProps {
  serviceTag?: string;
}

// Helper to check if popup should be shown
const shouldShowPopup = (popup: Popup) => {
  const { id, displayMode } = popup;
  if (displayMode === 'ALWAYS') return true;
  
  if (displayMode === 'ONCE_SESSION') {
    if (typeof sessionStorage === 'undefined') return true; 
    const seen = sessionStorage.getItem(`popup_seen_${id}`);
    return !seen;
  }
  
  if (displayMode === 'ONCE_EVER') {
    if (typeof localStorage === 'undefined') return true;
    const seen = localStorage.getItem(`popup_seen_${id}`);
    return !seen;
  }
  
  return true;
};

// Helper to mark popup as seen
const markPopupAsSeen = (popup: Popup) => {
  const { id, displayMode } = popup;
  if (typeof window === 'undefined') return;

  if (displayMode === 'ONCE_SESSION') {
    sessionStorage.setItem(`popup_seen_${id}`, 'true');
  }
  if (displayMode === 'ONCE_EVER') {
    localStorage.setItem(`popup_seen_${id}`, 'true');
  }
};

export default function PagePopup({ serviceTag = 'ECOPANELS' }: PagePopupProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  
  // State for Modal
  const [activeModal, setActiveModal] = useState<Popup | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // Trigger
  const [isModalRendering, setIsModalRendering] = useState(false); // Mount
  const [isModalAnimating, setIsModalAnimating] = useState(false); // Opacity

  // State for Slide-in
  const [activeSlideIn, setActiveSlideIn] = useState<Popup | null>(null);
  const [slideInVisible, setSlideInVisible] = useState(false); // Trigger
  const [isSlideInRendering, setIsSlideInRendering] = useState(false); // Mount
  const [isSlideInAnimating, setIsSlideInAnimating] = useState(false); // Transform

  // State for Contact Modal (End of Page)
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDismissed, setContactDismissed] = useState(false);
  
  // Track if we should listen to scroll
  const [hasScrolled, setHasScrolled] = useState(false);

  // Manage Modal Animations
  useEffect(() => {
    if (modalVisible) {
      setIsModalRendering(true);
      requestAnimationFrame(() => setIsModalAnimating(true));
    } else {
      setIsModalAnimating(false);
      const timer = setTimeout(() => setIsModalRendering(false), 300);
      return () => clearTimeout(timer);
    }
  }, [modalVisible]);

  // Manage Slide-In Animations
  useEffect(() => {
    if (slideInVisible) {
      setIsSlideInRendering(true);
      requestAnimationFrame(() => setIsSlideInAnimating(true));
    } else {
      setIsSlideInAnimating(false);
      const timer = setTimeout(() => setIsSlideInRendering(false), 500);
      return () => clearTimeout(timer);
    }
  }, [slideInVisible]);

  useEffect(() => {
    // Reset state on navigation
    setActiveModal(null);
    setModalVisible(false);
    setActiveSlideIn(null);
    setSlideInVisible(false);
    setHasScrolled(false);
    setShowContactModal(false);
    
    // Check session storage for dismissal state
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('contact_modal_dismissed') === 'true') {
      setContactDismissed(true);
    } else {
      setContactDismissed(false);
    }

    const checkPopups = async () => {
      if (isAdmin) return;

      try {
        const res = await popupAPI.getActive({ 
          pagePath: pathname,
          serviceTag 
        });
        const popups: Popup[] = res.data;
        const matchingPopups = popups.filter(p => p.pagePath === pathname || p.pagePath === '*');

        // 1. Handle Modal
        const modalCandidate = matchingPopups.find(p => (!p.type || p.type === 'MODAL') && shouldShowPopup(p));
        if (modalCandidate) {
          setTimeout(() => {
            setActiveModal(modalCandidate);
            setModalVisible(true);
            markPopupAsSeen(modalCandidate);
          }, 1500);
        }

        // 2. Handle Slide-in (Deferred until scroll)
        const slideInCandidate = matchingPopups.find(p => p.type === 'SLIDE_IN' && shouldShowPopup(p));
        if (slideInCandidate) {
            setActiveSlideIn(slideInCandidate);
        }

      } catch (error) {
        console.error('Error fetching popups:', error);
      }
    };

    if (pathname) {
      checkPopups();
    }
  }, [pathname, serviceTag]);

  // Scroll Listener for Slide-in & Contact Modal
  useEffect(() => {
    if (isAdmin) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // Check for footer to be precise
      const footer = document.getElementById('site-footer');
      let isNearBottom = false;

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        // Trigger only when footer is fully visible or we are at the very end
        isNearBottom = footerRect.bottom <= window.innerHeight + 50 || (docHeight - scrollPosition < 50);
      } else {
         // Fallback: strict check for end of page
         isNearBottom = scrollPosition >= docHeight - 100;
      }

      // 1. Slide-in Logic
      if (activeSlideIn) {
        if (scrollPosition > docHeight * 0.4 && !isNearBottom) {
           setSlideInVisible(true);
           if (!hasScrolled) {
             markPopupAsSeen(activeSlideIn);
             setHasScrolled(true);
           }
        } else {
           setSlideInVisible(false);
        }
      }

      // 2. Contact Modal Logic (End of Page)
      // Only show on home page and if not dismissed in session
      const isHomePage = pathname === '/' || /^\/[a-z]{2}$/.test(pathname || '');
      const isDismissedSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('contact_modal_dismissed') === 'true';

      if (isNearBottom && !contactDismissed && !isDismissedSession && !modalVisible && isHomePage) {
         setShowContactModal(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSlideIn, contactDismissed, modalVisible, hasScrolled, isAdmin, pathname]);

  if (isAdmin) return null;

  return (
    <>
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => {
          setShowContactModal(false);
          setContactDismissed(true);
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('contact_modal_dismissed', 'true');
          }
        }} 
      />

      {/* 1. Modal Implementation */}
      {activeModal && isModalRendering && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-opacity duration-300 ${isModalAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`relative bg-white dark:bg-gray-900 shadow-2xl max-w-md w-full overflow-hidden border-t-4 border-[#ef7e2a] transition-all duration-300 transform ${isModalAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
            <button
              onClick={() => setModalVisible(false)}
              className="absolute top-0 right-0 m-3 text-gray-400 hover:text-gray-900 dark:hover:text-white z-20 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-gray-800 p-2 transition-all duration-200 rounded-none backdrop-blur-sm"
              aria-label="Close popup"
            >
              <X size={24} />
            </button>

            {activeModal.imageUrl && (
              <div className="relative w-full h-64">
                <Image
                  src={activeModal.imageUrl}
                  alt={activeModal.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-md">
                    {activeModal.title}
                  </h2>
                </div>
              </div>
            )}

            <div className="p-8">
              {!activeModal.imageUrl && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-[#ef7e2a]">
                  {activeModal.title}
                </h2>
              )}
              
              {activeModal.content && (
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-base">
                  {activeModal.content}
                </p>
              )}
              
              {activeModal.linkUrl && (
                <Link
                  href={activeModal.linkUrl}
                  onClick={() => setModalVisible(false)}
                  className="group relative flex w-full items-center justify-center overflow-hidden bg-[#ef7e2a] px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-[#d66e1f] hover:shadow-lg hover:shadow-orange-500/25"
                >
                  <span className="relative z-10">{activeModal.linkText || 'Learn More'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Slide-in Implementation */}
      {activeSlideIn && isSlideInRendering && !modalVisible && (
        <div className={`fixed bottom-6 left-6 z-[90] max-w-sm w-full transition-all duration-500 transform ${isSlideInAnimating ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
           <div className="bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-l-4 border-[#ef7e2a] overflow-hidden flex flex-col">
              <div className="p-5 flex gap-4">
                 <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#ef7e2a]/10 flex items-center justify-center text-[#ef7e2a]">
                       <MessageCircle size={24} />
                    </div>
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{activeSlideIn.title}</h3>
                       <button 
                         onClick={() => setSlideInVisible(false)}
                         className="text-gray-400 hover:text-[#ef7e2a] -mt-1 -mr-2 p-1 transition-colors"
                        >
                          <X size={18} />
                       </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-3 leading-relaxed">
                       {activeSlideIn.content}
                    </p>

                    {activeSlideIn.linkUrl && (
                       <Link
                         href={activeSlideIn.linkUrl}
                         onClick={() => setSlideInVisible(false)}
                         className="text-sm font-bold text-[#ef7e2a] hover:text-[#d66e1f] flex items-center gap-1 uppercase tracking-wide transition-colors"
                       >
                         {activeSlideIn.linkText || 'Learn More'} →
                       </Link>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
