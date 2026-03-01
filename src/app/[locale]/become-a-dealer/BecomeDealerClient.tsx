'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { dealerAPI } from '@/lib/api';
import { useLanguageStore } from '@/stores';
import { en, ne } from '@/locales';
import SuccessModal from '@/components/SuccessModal';
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Shield, 
  Truck, 
  Building2, 
  Users, 
  MapPin, 
  Loader2,
  ArrowRight,
  Briefcase
} from 'lucide-react';

export default function BecomeDealerClient() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = language === 'en' ? en : ne;

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    yearsOfExperience: '',
    message: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError(t.dealer.passwordsDoNotMatch);
      setLoading(false);
      return;
    }

    try {
      // Split contact person into first/last name for backend
      const names = formData.contactPerson.trim().split(' ');
      const firstName = names[0] || formData.contactPerson;
      const lastName = names.length > 1 ? names.slice(1).join(' ') : 'Dealer';

      const payload = {
        ...formData,
        firstName,
        lastName,
        // Backend expects these
        registrationNo: '', // Optional?
      };
      
      await dealerAPI.apply(payload);
      setShowSuccessModal(true);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        yearsOfExperience: '',
        message: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t.dealer.failedToSubmit);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: TrendingUp, title: t.dealer.benefits.growth.title, desc: t.dealer.benefits.growth.desc },
    { icon: Shield, title: t.dealer.benefits.quality.title, desc: t.dealer.benefits.quality.desc },
    { icon: Truck, title: t.dealer.benefits.support.title, desc: t.dealer.benefits.support.desc },
  ];

  return (
    <>
      <Navbar />
      
      {/* Header Section */}
      <section className="relative pt-32 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-pattern-hex opacity-10 animate-pattern-slide"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>

        <div className="container-custom relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-none bg-white/10 border border-white/20 text-secondary text-sm font-medium mb-4 animate-fade-in-up">
            {t.dealer.badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100">
            {language === 'en' ? (
              <>Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-300">Dealer</span></>
            ) : (
              t.dealer.title
            )}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
            {t.dealer.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 -mt-10 pb-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8 relative">
            
            {/* Benefits Sidebar (Left Column - Sticky) */}
            <div className="lg:col-span-1 space-y-6 h-fit lg:sticky lg:top-32 animate-fade-in-up delay-300">
              {/* Benefits Card */}
              <div className="bg-white dark:bg-gray-800 rounded-none p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                
                <h3 className="text-2xl font-bold mb-6 text-primary dark:text-white flex items-center gap-2">
                  <Briefcase className="text-secondary" size={24} />
                  {t.dealer.whyPartner}
                </h3>
                
                <div className="space-y-6">
                  {benefits.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="p-3 rounded-none bg-blue-50 dark:bg-gray-700 text-secondary">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-primary text-white rounded-none p-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-hex opacity-10"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Users className="text-secondary" size={20} />
                  {t.dealer.dealerSupport}
                </h3>
                <p className="text-gray-300 relative z-10 mb-4 text-sm">
                  {t.dealer.dealerSupportDesc}
                </p>
                <div className="relative z-10 flex items-center gap-2 text-secondary font-medium text-sm">
                  <CheckCircle size={16} />
                  <span>{t.dealer.marketingKit}</span>
                </div>
              </div>
            </div>

            {/* Application Form (Right Column - Spans 2) */}
            <div className="lg:col-span-2 animate-fade-in-up delay-400">
              <div className="bg-white dark:bg-gray-800 rounded-none shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-8 md:p-10">
                  <h3 className="text-2xl font-bold mb-2 text-primary dark:text-white">{t.dealer.applicationTitle}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">{t.dealer.applicationDesc}</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-none flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                      </div>
                    )}

                    {/* Company Details */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                          <Building2 size={18} className="text-secondary" />
                          {t.dealer.companyInfo}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.companyName}</label>
                            <input 
                              type="text" 
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.companyNamePlaceholder}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.yearsInBusiness}</label>
                            <input 
                              type="number" 
                              name="yearsOfExperience"
                              value={formData.yearsOfExperience}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.yearsInBusinessPlaceholder}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Person */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                          <Users size={18} className="text-secondary" />
                          {t.dealer.contactPerson}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.fullName}</label>
                            <input 
                              type="text" 
                              name="contactPerson"
                              value={formData.contactPerson}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.fullNamePlaceholder}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.phoneNumber}</label>
                            <input 
                              type="tel" 
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.phoneNumberPlaceholder}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.emailAddress}</label>
                            <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.emailAddressPlaceholder}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                          <MapPin size={18} className="text-secondary" />
                          {t.dealer.locationDetails}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.streetAddress}</label>
                            <input 
                              type="text" 
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.streetAddressPlaceholder}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.city}</label>
                            <input 
                              type="text" 
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.cityPlaceholder}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.state}</label>
                            <input 
                              type="text" 
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.statePlaceholder}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.postalCode}</label>
                            <input 
                              type="text" 
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.postalCodePlaceholder}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Account Security */}
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-primary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                          <Shield size={18} className="text-secondary" />
                          {t.dealer.accountSecurity}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.password}</label>
                            <input 
                              type="password" 
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.passwordPlaceholder}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.form.confirmPassword}</label>
                            <input 
                              type="password" 
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                              placeholder={t.dealer.form.confirmPasswordPlaceholder}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.dealer.additionalMessage}</label>
                        <textarea 
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none"
                          placeholder={t.dealer.additionalMessagePlaceholder}
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-4 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed rounded-none"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {t.dealer.submitting}
                          </>
                        ) : (
                          <>
                            {t.dealer.submitApplication}
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                    </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title={t.dealer.successTitle}
        message={t.dealer.successDesc}
      />
      <Footer />
    </>
  );
}
