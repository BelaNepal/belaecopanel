'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useThemeStore, useLanguageStore, useAuthStore, useCartStore } from '@/stores';
import { Link, usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Moon, Sun, Globe, LogIn, LogOut, Menu, X, Phone, Mail, User, ShoppingCart, FileText, ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const isHome = pathname === '/';
  const { isDark, toggleDark } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { user, logout, token, checkAuth } = useAuthStore();
  const { totalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const lastScrollY = React.useRef(0);

  // Sync internal state with URL locale
  useEffect(() => {
    if (locale && (locale === 'en' || locale === 'ne')) {
      if (locale !== language) {
        setLanguage(locale as 'en' | 'ne');
      }
    }
  }, [locale, language, setLanguage]);

  const handleLanguageSwitch = (newLang: 'en' | 'ne') => {
    setLanguage(newLang);
    router.replace(pathname, { locale: newLang });
  };


  // Phone number slide logic
  const [phoneIndex, setPhoneIndex] = useState(0);
  const phoneNumbers = [
    { text: '+977 9802375303', href: 'tel:+9779802375303' },
    { text: '01-5922974', href: 'tel:015922974' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhoneIndex((prev) => (prev + 1) % phoneNumbers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Only toggle class on client side
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }

    // Check auth if token exists but user is missing
    if (token && !user) {
      checkAuth();
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Show top bar if scrolling up or at the top
      // Hide top bar if scrolling down and past the top area
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDark]);

  // Use default values until mounted to prevent hydration mismatch
  const currentLang = mounted ? language : 'en';
  const currentIsDark = mounted ? isDark : false;
  const currentUser = mounted ? user : null;
  
  const t = useTranslations('nav');

  // Determine styles based on page and scroll state
  const isTransparent = isHome && !scrolled;
  const isProductPage = pathname === '/products';
  
  // For products page: Transparent on mobile when not scrolled, Opaque on desktop always.
  // When scrolled (modern effect), we use dark blue background and white text.
  
  const navTextColor = isTransparent 
    ? 'text-white drop-shadow-md' 
    : (scrolled) 
      ? 'text-white'
    : (isProductPage && !scrolled) 
      ? 'text-white lg:text-primary lg:dark:text-white' 
      : 'text-primary dark:text-white';
  
  const navHoverColor = 'hover:text-secondary transition-colors';
  
  const borderColor = isTransparent 
    ? 'border-white/20' 
    : (scrolled)
      ? 'border-white/10'
    : (isProductPage && !scrolled) 
      ? 'border-white/10 lg:border-gray-100 lg:dark:border-gray-800' 
      : 'border-gray-100 dark:border-gray-800';
  
  const baseBgClass = 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md';
  const transparentClass = 'bg-gradient-to-b from-black/50 to-transparent shadow-none backdrop-blur-none';
  const scrolledBgClass = 'bg-[#1e2d4d]/95 backdrop-blur-md shadow-md';
  
  let bgClass = baseBgClass;
  if (isTransparent) {
    bgClass = transparentClass;
  } else if (scrolled) {
    bgClass = scrolledBgClass;
  } else if (isProductPage && !scrolled) {
    // Transparent on mobile, Opaque on desktop
    bgClass = 'bg-transparent lg:bg-white/95 lg:dark:bg-gray-900/95 lg:backdrop-blur-md lg:shadow-md';
  }

  // Top Bar classes - Hide on scroll for modern effect
  const topBarClasses = showTopBar 
    ? 'max-h-12 opacity-100 py-2' 
    : 'max-h-0 opacity-0 overflow-hidden';

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${bgClass}`}
      >
        {/* Top Bar - Utilities & Contact */}
        <div className={`hidden lg:block border-b transition-all duration-500 ease-in-out ${borderColor} ${topBarClasses}`}>
          <div className="container-custom flex justify-between items-center text-xs font-medium">
            {/* Left: Contact Info */}
            <div className={`flex items-center gap-6 ${navTextColor}`}>
              <a href="mailto:info@belaecopanels.com.np" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Mail size={14} className="text-secondary" />
                <span>info@belaecopanels.com.np</span>
              </a>
              <div className="flex items-center gap-2 min-w-[140px]">
                <Phone size={14} className="text-secondary" />
                <a 
                   key={phoneIndex}
                   href={phoneNumbers[phoneIndex].href} 
                   className="hover:text-secondary transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  {phoneNumbers[phoneIndex].text}
                </a>
              </div>
            </div>

            {/* Right: Utilities (Lang, Mode, Auth) */}
            <div className={`flex items-center gap-4 ${navTextColor}`}>
              {/* Language Selector */}
              <button
                onClick={() => handleLanguageSwitch(language === 'en' ? 'ne' : 'en')}
                className={`flex items-center gap-1 hover:text-secondary transition-colors`}
                title={t('language')}
              >
                <Globe size={14} />
                <span>{currentLang === 'en' ? 'EN' : 'ने'}</span>
              </button>

              <div className={`h-3 w-px ${isTransparent ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDark}
                className={`flex items-center gap-1 hover:text-secondary transition-colors`}
                title={t('darkMode')}
              >
                {currentIsDark ? <Sun size={14} /> : <Moon size={14} />}
                <span>{currentIsDark ? 'Light' : 'Dark'}</span>
              </button>

              <div className={`h-3 w-px ${isTransparent ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

              {/* Cart/Quote Button */}
              <Link
                href="/cart"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 hover:text-secondary transition-colors relative`}
              >
                {currentUser?.role === 'DEALER' ? <ShoppingCart size={14} /> : <FileText size={14} />}
                <span>{currentUser?.role === 'DEALER' ? 'My Order' : 'My Quote'}</span>
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-none flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>

              <div className={`h-3 w-px ${isTransparent ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

              {/* Login/Dashboard */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={['ADMIN', 'STAFF', 'DEALER'].includes(currentUser.role) ? "/admin" : "/dashboard"}
                    target={['ADMIN', 'STAFF', 'DEALER'].includes(currentUser.role) ? "_blank" : undefined}
                    rel={['ADMIN', 'STAFF', 'DEALER'].includes(currentUser.role) ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-1.5 hover:text-secondary transition-colors font-bold`}
                  >
                    <User size={14} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <div className={`h-3 w-px ${isTransparent ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

                  <div className="flex items-center gap-1.5">
                    <span className={`font-medium ${isTransparent ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
                      {currentUser.firstName || currentUser.name || 'User'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-none uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className={`h-3 w-px ${isTransparent ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <a
                  href={process.env.NEXT_PUBLIC_ADMIN_URL || '/admin/login'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 hover:text-secondary transition-colors`}
                >
                  <LogIn size={14} />
                  <span>Login</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container-custom">
          <nav className={`relative flex items-center justify-between transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
            {/* Logo */}
            <Link href={currentUser?.role === 'ENGINEER' ? '/dashboard' : '/'} className="flex items-center gap-2 group relative z-10">
              <Image 
                src="/Logo-Bela.png" 
                alt="Bela Eco Panels" 
                width={200}
                height={80}
                className={`w-auto object-contain transition-all duration-700 ease-in-out transform group-hover:rotate-[360deg] ${scrolled ? 'h-10' : 'h-20'}`} 
                priority
              />
            </Link>

            {/* Mobile Title */}
            <div className={`lg:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-sm sm:text-base tracking-tight whitespace-nowrap ${navTextColor} transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
              Bela Nepal Industries Pvt. Ltd.
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {[
                { href: currentUser?.role === 'ENGINEER' ? '/dashboard' : '/', label: t('home') },
                { href: '/products', label: t('products') },
                { href: '/articles', label: t('articles') },
                { href: '/become-a-dealer', label: t('becomeDealers') },
                { href: '/become-a-contractor', label: 'Become a Contractor' },
                { href: '/contact', label: t('contact') },
                ...(currentUser && (currentUser.role === 'ENGINEER' || currentUser.role === 'CONTRACTOR') ? [{ href: '/projects', label: 'Projects' }] : []),
              ].map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`text-sm font-bold uppercase tracking-wide ${isActive ? 'text-secondary' : navTextColor} ${navHoverColor} relative group py-2`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-secondary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link href="/contact">
                <button className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2.5 font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-none">
                  Enquiry Form
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`lg:hidden p-2 ${navTextColor}`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
          </nav>
        </div>
      </header>

      {/* Spacer for non-home pages to prevent content overlap */}
      {!isHome && (
        <div className={`w-full bg-gray-50 dark:bg-gray-900 ${pathname === '/products' ? 'hidden lg:block h-[136px] lg:h-[140px]' : 'h-[136px] lg:h-[140px]'}`}></div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          <div className="absolute top-0 right-0 w-[80%] max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <Image src="/Logo-Bela.png" alt="Bela Eco Panels" width={100} height={40} className="h-10 w-auto object-contain" />
              <button  
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {[
                { href: currentUser?.role === 'ENGINEER' ? '/dashboard' : '/', label: t('home') },
                { href: '/products', label: t('products') },
                { href: '/articles', label: t('articles') },
                { href: '/become-a-dealer', label: t('becomeDealers') },
                { href: '/become-a-contractor', label: 'Become a Contractor' },
                { href: '/contact', label: t('contact') },
                ...(currentUser && (currentUser.role === 'ENGINEER' || currentUser.role === 'CONTRACTOR') ? [{ href: '/projects', label: 'Projects' }] : []),
              ].map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`text-lg font-medium py-2 border-b transition-colors ${
                      isActive 
                        ? 'text-secondary border-secondary' 
                        : 'text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-800 hover:text-secondary dark:hover:text-secondary'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-none">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Appearance</span>
                <button
                  onClick={toggleDark}
                  className="p-2 rounded-none bg-white dark:bg-gray-700 shadow-sm"
                >
                  {currentIsDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-none">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Language</span>
                <button
                  onClick={() => handleLanguageSwitch(language === 'en' ? 'ne' : 'en')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-white dark:bg-gray-700 shadow-sm font-medium"
                >
                  <Globe size={18} />
                  <span>{currentLang === 'en' ? 'English' : 'नेपाली'}</span>
                </button>
              </div>

              {user ? (
                <>
                  <Link
                    href={['ADMIN', 'STAFF', 'DEALER'].includes(user.role) ? "/admin" : "/dashboard"}
                    target={['ADMIN', 'STAFF', 'DEALER'].includes(user.role) ? "_blank" : undefined}
                    rel={['ADMIN', 'STAFF', 'DEALER'].includes(user.role) ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-none border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    Dashboard ({user.firstName || user.name || 'User'})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-none border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href={process.env.NEXT_PUBLIC_ADMIN_URL || '/admin/login'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-none border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={20} />
                  Login
                </a>
              )}

              <button className="w-full bg-secondary text-white py-3 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-none">
                {t('getQuote')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

