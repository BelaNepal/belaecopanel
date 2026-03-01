'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import { leadAPI } from '@/lib/api';
import SuccessModal from '@/components/SuccessModal';
import LocationSection from '@/components/LocationSection';

export default function ContactClient() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = language === 'en' ? en : ne;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const mapSubjectToLeadType = (subject: string) => {
    if (subject.includes('Dealer')) return 'DEALERSHIP_APPLICATION';
    if (subject.includes('Quotation')) return 'QUOTATION_REQUEST';
    if (subject.includes('Support')) return 'COMPLAINT'; 
    return 'GENERAL_INQUIRY';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadAPI.create({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        leadType: mapSubjectToLeadType(formData.subject)
      });
      setShowSuccessModal(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      // Optionally handle error state here
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Message Sent Successfully!"
        message="Thank you for contacting us. Our team will get back to you shortly."
      />
      
      {/* Header Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-pattern-hex opacity-10 animate-pattern-slide"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/95"></div>
        
        {/* Decorative Blobs - Made responsive */}
        <div className="absolute top-20 right-0 w-64 h-64 md:w-96 md:h-96 bg-secondary/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-blue-500/10 rounded-full blur-[60px] md:blur-[80px]"></div>

        <div className="container-custom relative z-10 text-center px-4">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-secondary text-xs md:text-sm font-medium mb-4 animate-fade-in-up backdrop-blur-sm">
            {t.contact.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100 leading-tight">
            {language === 'en' ? (
              <>Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-300">Conversation</span></>
            ) : (
              t.contact.title
            )}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light animate-fade-in-up delay-200 px-4">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 -mt-10 pb-16 md:pb-24 px-4 sm:px-6">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 relative">
            
            {/* Contact Info Cards (Left Column - Sticky) */}
            <div className="lg:col-span-1 space-y-6 h-fit lg:sticky lg:top-32 animate-fade-in-up delay-300 order-2 lg:order-1">
              {/* Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group transition-transform hover:-translate-y-1 duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-primary dark:text-white flex items-center gap-2">
                  <MessageSquare className="text-secondary" size={24} />
                  {t.contact.info.title}
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-gray-700 text-secondary shrink-0">
                      <Mail size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">{t.contact.info.email}</p>
                      <a href="mailto:info@belanepal.com.np" className="text-base md:text-lg font-semibold text-gray-900 dark:text-white hover:text-secondary transition-colors break-words block">
                        info@belanepal.com.np
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-gray-700 text-secondary shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">{t.contact.info.phone}</p>
                      <a href="tel:+9779802375303" className="text-base md:text-lg font-semibold text-gray-900 dark:text-white hover:text-secondary transition-colors block leading-snug">
                        +977 9802375303<br/>01-5922974
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-gray-700 text-secondary shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="space-y-4 w-full">
                      <div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">{t.ourLocations.ktmTitle}</p>
                        <p className="text-base md:text-lg text-gray-900 dark:text-white font-medium leading-snug">
                         {t.ourLocations.ktmDesc}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">{t.ourLocations.factoryTitle}</p>
                        <p className="text-base md:text-lg text-gray-900 dark:text-white font-medium leading-snug">
                         {t.ourLocations.factoryDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gradient-to-br from-primary to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl -ml-5 -mb-5"></div>
                
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Clock className="text-secondary" size={20} />
                  </div>
                  {t.contact.businessHours.title}
                </h3>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                      <span className="text-gray-200 text-sm md:text-base">Sun - Fri</span>
                    </div>
                    <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg text-xs md:text-sm">10 AM - 5 PM</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <span className="text-gray-200 text-sm md:text-base">Saturday</span>
                    </div>
                    <span className="font-bold text-red-300 bg-red-500/10 px-3 py-1 rounded-lg text-xs md:text-sm">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (Right Column - Spans 2) */}
            <div className="lg:col-span-2 animate-fade-in-up delay-400 order-1 lg:order-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-primary dark:text-white">{t.contact.form.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{t.contact.form.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t.contact.form.firstName}</label>
                       <div className="relative group">
                          <input
                            required
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all pl-11 text-gray-900 dark:text-white placeholder:text-gray-400"
                            placeholder="Ram"
                          />
                          <div className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-secondary transition-colors">
                             <User size={20} />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t.contact.form.lastName}</label>
                       <input
                         required
                         type="text"
                         name="lastName"
                         value={formData.lastName}
                         onChange={handleChange}
                         className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                         placeholder="Thapa"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t.contact.form.email}</label>
                       <div className="relative group">
                          <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all pl-11 text-gray-900 dark:text-white placeholder:text-gray-400"
                            placeholder="john@example.com"
                          />
                          <div className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-secondary transition-colors">
                             <Mail size={20} />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t.contact.form.phone}</label>
                        <div className="relative group">
                           <input
                             required
                             type="tel"
                             name="phone"
                             value={formData.phone}
                             onChange={handleChange}
                             className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all pl-11 text-gray-900 dark:text-white placeholder:text-gray-400"
                             placeholder="+977 9800000000"
                           />
                           <div className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-secondary transition-colors">
                               <Phone size={20} />
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t.contact.form.subject}</label>
                    <div className="relative group">
                       <select
                         name="subject"
                         value={formData.subject}
                         onChange={handleChange}
                         className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all appearance-none text-gray-900 dark:text-white cursor-pointer"
                       >
                         <option>General Inquiry</option>
                         <option>Project Quotation</option>
                         <option>Become a Dealer</option>
                         <option>Technical Support</option>
                         <option>Visit Request</option>
                       </select>
                       <div className="absolute right-4 top-4 text-gray-400 pointer-events-none group-focus-within:text-secondary transition-colors">
                          <ArrowRight size={18} className="rotate-90" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t.contact.form.message}</label>
                     <textarea
                       required
                       rows={5}
                       name="message"
                       value={formData.message}
                       onChange={handleChange}
                       className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all resize-none text-gray-900 dark:text-white placeholder:text-gray-400 text-base"
                       placeholder={t.contact.form.messagePlaceholder}
                     ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Sending...
                      </>
                    ) : (
                      <>
                        {t.contact.form.submit}
                        <Send size={20} className="transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <LocationSection />

      <Footer />
    </>
  );
}

// Helper component for icon
function User({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    )
}
