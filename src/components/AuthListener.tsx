'use client';

import React, { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function AuthListener({ children }: { children: React.ReactNode }) {
  // Global auth listener'ı kur
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('GitHub kimlik durumu değişti:', event, session ? 'Oturum var' : 'Oturum yok');
      
      // Kullanıcı başarıyla giriş yaptığında, veritabanına kaydet
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session.user),
          });
          console.log('Kullanıcı verileri API\'ye gönderildi');
        } catch (error) {
          console.error('Kullanıcı verilerini kaydederken hata:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
} 