'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

export default function DashboardRedirect() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    // Redirect based on role
    switch (user.role) {
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
        // Fallback or unauthorized
        router.push('/'); 
        break;
    }
  }, [token, user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-24 h-auto mb-6 opacity-80 animate-pulse">
        <img src="/Logo-Bela.png" alt="Bela Eco Panels" className="w-full h-full object-contain" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">Loading workspace...</p>
      </div>
    </div>
  );
}
