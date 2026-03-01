'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { contractorAPI, dealerAPI } from '@/lib/api';
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

export default function BecomeContractorClient() {
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
    licenseNumber: '',
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
      // Split contact person into first/last name for backend if needed
      const names = formData.contactPerson.trim().split(' ');
      const firstName = names[0] || formData.contactPerson;
      const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

      const payload = {
        ...formData,
        firstName,
        lastName,
        role: 'CONTRACTOR',
      };
      
      await contractorAPI.apply(payload);
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
        licenseNumber: '',
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
      setError(err?.response?.data?.message || 'Failed to submit application. Please try again.');
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
        title="Application Submitted Successfully!"
        message="Thank you for applying to become a Bela Eco Panels Contractor. Our team will review your application and contact you shortly."
      />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-pattern-hex opacity-10 animate-pattern-slide"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/95"></div>
        
        <div className="container-custom relative z-10 text-center px-4">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-secondary text-xs md:text-sm font-medium mb-4 animate-fade-in-up backdrop-blur-sm">
            Join Our Network
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100 leading-tight">
            Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-300">Contractor</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200 leading-relaxed">
            Partner with Nepal's leading eco-friendly panel manufacturer and grow your construction business with sustainable solutions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 relative bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column: Information */}
            <div className="space-y-10 animate-fade-in-left">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 relative inline-block">
                  Why Partner With Us?
                  <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-secondary rounded-full"></span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                  Join a network of professional contractors delivering the future of construction. 
                  Bela Eco Panels offer superior quality, faster installation, and excellent margins.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: <Shield size={24} />, title: "Quality Assured", desc: "ISO 9001:2015 certified products you can trust." },
                    { icon: <TrendingUp size={24} />, title: "Business Growth", desc: "Access to exclusive leads and project opportunities." },
                    { icon: <Users size={24} />, title: "Technical Support", desc: "Dedicated engineering support for your projects." },
                    { icon: <Briefcase size={24} />, title: "Training", desc: "Comprehensive installation training for your team." }
                  ].map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
                      <div className="w-12 h-12 bg-primary/5 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        {item.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-gray-700 animate-fade-in-right relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -mr-10 -mt-10"></div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">Contractor Application</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 relative z-10">Fill out the form below to start your application process.</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 animate-shake">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Constuction Co. Pvt. Ltd."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="+977 9800000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                    placeholder="Street Address, Building No."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Province"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Postal Code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience (Years) *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      required
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="e.g. 5"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Contractor License No."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password for Portal Access *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                    placeholder="Create a password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Message</label>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-400 resize-none"
                    placeholder="Tell us about your business..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/30 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
