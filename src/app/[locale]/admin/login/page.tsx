'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { authAPI } from '@/lib/api';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setToken, setUser, token, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && user) {
      if (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'DEALER' || user.role === 'ENGINEER' || user.role === 'CONTRACTOR') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login({ email, password });
      
      setToken(res.data.token);
      setUser(res.data.user);
      
      if (redirect) {
        router.push(redirect);
        return; // Return immediately to avoid state updates
      }

      // Redirect based on role
      switch (res.data.user.role) {
        case 'ENGINEER':
          router.push('/admin/engineers/dashboard');
          break;
        case 'CONTRACTOR':
          router.push('/admin/contractors/dashboard');
          break;
        case 'DEALER':
          router.push('/admin/dealers/dashboard');
          break;
        case 'STAFF':
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard'); // Customer dashboard
          break;
      }
      return;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false); // Only set loading false on error. If success, we redirect.
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-[#1e2d4d]">
        <img 
          src="https://images.unsplash.com/photo-1518005052357-e987196dd55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Eco Panels Construction" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e2d4d]/90 to-[#1e2d4d]/70"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          <div>
            <div className="w-48 mb-8 inline-block">
              <img src="/Logo-Bela.png" alt="Bela Eco Panels" className="w-full h-auto" />
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Building the Future<br />
              <span className="text-[#ef7e1a]">With Eco Panels</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Streamline your operations, manage inventory, and track orders with our comprehensive admin solution.
            </p>
          </div>
          
          <div className="flex gap-4 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Bela Nepal Industries</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ef7e1a] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 p-8 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-32 mx-auto mb-6">
              <img src="/Logo-Bela.png" alt="Bela Eco Panels" className="w-full h-auto" />
            </div>
            <h2 className="text-3xl font-bold text-[#1e2d4d] dark:text-white tracking-tight">Portal Login</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Please enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-none shadow-sm flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1e2d4d] dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-none px-4 py-3.5 focus:ring-2 focus:ring-[#ef7e1a]/20 focus:border-[#ef7e1a] outline-none transition-all duration-200"
                    placeholder="admin@belaeco.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e2d4d] dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-none px-4 py-3.5 focus:ring-2 focus:ring-[#ef7e1a]/20 focus:border-[#ef7e1a] outline-none transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded-none border-gray-300 text-[#ef7e1a] focus:ring-[#ef7e1a]" />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-[#ef7e1a] hover:text-[#d66e15] font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ef7e1a] hover:bg-[#d66e15] text-white font-bold py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-none"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

