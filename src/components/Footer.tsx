'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useLanguageStore } from '@/stores';
import { useTranslations } from 'next-intl';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { newsletterAPI } from '@/lib/api';
import { toast } from 'sonner';
import SuccessModal from './SuccessModal';

const XIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const TikTokIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);


export default function Footer() {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = mounted ? language : 'en';
  const t = useTranslations();

  const footerLocations = [
    {
      name: "Head Office",
      nameNe: "प्रधान कार्यालय",
      address: "Chhauni-15, Kathmandu, Nepal",
      addressNe: "छाउनी-१५, काठमाडौं, नेपाल",
      phone: "+977 9802375303, 01-5922974",
      email: "info@belanepal.com.np"
    },
    {
      name: "Factory",
      nameNe: "कारखाना",
      address: "Hetauda Industrial Estate, Hetauda-8, Nepal",
      addressNe: "हेटौंडा औद्योगिक क्षेत्र, हेटौंडा-८, नेपाल",
      phone: "9801949100"
    }
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('footer.messages.enterEmail'));
      return;
    }

    try {
      setLoading(true);
      await newsletterAPI.subscribe(email);
      setModalState({
        isOpen: true,
        title: currentLang === 'en' ? 'Subscription Successful!' : 'सदस्यता सफल भयो!',
        message: currentLang === 'en' 
          ? 'Thank you for subscribing to our newsletter. You will now receive the latest updates and offers directly in your inbox.' 
          : 'हाम्रो न्यूजलेटर को सदस्यता लिनु भएकोमा धन्यवाद। अब तपाईंले नवीनतम अपडेट र प्रस्तावहरू सिधै आफ्नो इनबक्समा प्राप्त गर्नुहुनेछ।'
      });
      setEmail('');
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      if (error.response && error.response.status === 409) {
        setModalState({
          isOpen: true,
          title: currentLang === 'en' ? 'Already Subscribed' : 'पहिले नै सदस्यता लिइएको छ',
          message: currentLang === 'en' 
            ? 'This email address is already subscribed to our newsletter.'
            : 'यो ईमेल ठेगाना पहिले नै हाम्रो न्यूजलेटरको सदस्यता लिईसकेको छ।'
        });
      } else {
        toast.error(t('footer.messages.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="site-footer" className="relative bg-primary text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-stripes opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary to-black/40 pointer-events-none"></div>

      <div className="container-custom relative z-10 pt-20 pb-10">
        <SuccessModal 
          isOpen={modalState.isOpen}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          title={modalState.title}
          message={modalState.message}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-2">
              <Image src="/Logo-Bela.png" alt="Bela Eco Panels" width={200} height={80} className="h-20 w-auto object-contain mb-4" />
            </div>
            <p className="text-gray-400 leading-relaxed mt-2">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: 'https://www.facebook.com/BelaNepalindustries/' },
                { Icon: Instagram, href: 'https://www.instagram.com/belanepal/' },
                { Icon: TikTokIcon, href: 'https://www.tiktok.com/@belanepal' },
                { Icon: XIcon, href: 'https://twitter.com/BelaNepal' },
                { Icon: Linkedin, href: 'https://www.linkedin.com/in/bela-nepal-0514a532a/' }
              ].map(({ Icon, href }, i) => (
                <a 
                  key={i} 
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white hover:rounded-none group"
                >
                  <Icon size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
<Link
  href="/contact"
  className="inline-block mt-4 bg-[#ef7e2a] hover:bg-[#ff9040] text-white px-6 py-2 transition-all hover:scale-105 rounded-none"
>
  {currentLang === "en" ? "Get in Touch" : "सम्पर्क गर्नुहोस्"}
</Link>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 relative inline-block">
              {t('footer.quickLinks')}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-secondary rounded-none"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/products', label: t('nav.products') },
                { href: '/articles', label: t('nav.articles') },
                { href: '/become-a-dealer', label: t('nav.becomeDealers') },
                { href: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-secondary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-secondary transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <div className="h-1 w-8 bg-[#ef7e2a] rounded-none" />
              {t('footer.contactUs')}
            </h3>
            {footerLocations.map((location, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-semibold text-white/90">{currentLang === "en" ? location.name : location.nameNe}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="h-5 w-5 text-[#ef7e2a] shrink-0" />
                  <span>{currentLang === "en" ? location.address : location.addressNe}</span>
                </div>
                {location.phone && <div className="flex items-center gap-2 text-sm text-gray-400"><Phone className="h-5 w-5 text-[#ef7e2a] shrink-0"/><a href={`tel:${location.phone}`} className="hover:text-[#ef7e2a] transition-colors">{location.phone}</a></div>}
                {location.email && <div className="flex items-center gap-2 text-sm text-gray-400"><Mail className="h-5 w-5 text-[#ef7e2a] shrink-0"/><a href={`mailto:${location.email}`} className="hover:text-[#ef7e2a] transition-colors">{location.email}</a></div>}
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-6 relative inline-block">
              {t('footer.newsletter')}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-secondary rounded-none"></span>
            </h4>
            <p className="text-gray-400 mb-4 text-sm">
              {t('footer.newsletterDesc')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-none bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/90 text-white px-4 py-3 font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed rounded-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('dealer.submitting')}
                  </>
                ) : (
                  <>
                    {t('footer.subscribe')}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t('footer.company')}. {t('footer.rights')}.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.termsOfService')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.sitemap')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

