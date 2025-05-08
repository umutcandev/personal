'use client';

import React, { useEffect } from 'react';
import { setupAuthListener } from '../lib/supabaseClient';

export function AuthListener({ children }: { children: React.ReactNode }) {
  // Global auth listener'ı kur
  useEffect(() => {
    const subscription = setupAuthListener();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
} 