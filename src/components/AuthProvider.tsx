'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, []);

  return <>{children}</>;
}
