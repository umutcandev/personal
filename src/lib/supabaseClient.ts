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
    detectSessionInUrl: true,
    flowType: 'pkce', // Daha güvenli kimlik doğrulama akışı kullan
  }
}); 