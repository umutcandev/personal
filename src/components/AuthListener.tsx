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
          console.log('AuthListener: Kullanıcı verileri API\'ye gönderiliyor', {
            id: session.user.id,
            hasEmail: !!session.user.email,
            hasMetadata: !!session.user.user_metadata
          });
          
          // Kullanıcı verilerini API'ye gönder
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session.user),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`API yanıt hatası: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('AuthListener: Kullanıcı verileri başarıyla kaydedildi', data);
          })
          .catch(error => {
            console.error('AuthListener: Kullanıcı verilerini kaydederken API hatası:', error);
          });
          
        } catch (error) {
          console.error('AuthListener: Kullanıcı verilerini kaydederken hata:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
} 