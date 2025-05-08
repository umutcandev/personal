import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase'in istemcisini oluştur, geçersiz yapılandırma olmadığını doğrula
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL veya Anonim Anahtar eksik! Lütfen .env.local dosyanızı kontrol edin.');
}

// Sürekli olarak aynı istemciyi kullan - bu performans açısından önemli
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Otomatik oturum açma için URL'de hash'i algıla
  }
});

// Oturum değişikliklerini izleyecek global bir dinleyici başlat
export const setupAuthListener = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth event:', event, session ? 'Oturum var' : 'Oturum yok');
    
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

  return subscription;
}; 