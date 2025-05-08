import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  // URL'den kimlik doğrulama kodunu ve olası hataları çıkart
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  
  console.log("GitHub auth callback tetiklendi", { code: code ? "mevcut" : "yok", error, error_description });
  
  // Bir hata varsa, kullanıcıyı hatayı gösterecek şekilde yönlendir
  if (error) {
    console.error("GitHub OAuth hatası:", error, error_description);
    return NextResponse.redirect(new URL(`/guestbook?error=${encodeURIComponent(error_description || error)}`, request.url));
  }
  
  if (code) {
    try {
      // Supabase, code verifier'ı otomatik olarak cookie'den almalıdır
      // Bu yüzden code_verifier parametresini elle sağlamak gerekmez
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Kod değişim hatası:', sessionError);
        return NextResponse.redirect(new URL(`/guestbook?error=${encodeURIComponent(sessionError.message)}`, request.url));
      }
      
      console.log("GitHub kimlik doğrulama başarılı, ziyaretçi defterine yönlendiriliyor");
      
      // Başarılı kimlik doğrulama sonrası, ziyaretçi defterine yönlendir
      return NextResponse.redirect(new URL('/guestbook', request.url));
    } catch (error: unknown) {
      console.error('Kodu oturumla değiştirirken hata:', error);
      
      // Bir hata sayfasına veya hata parametresiyle ziyaretçi defterine yönlendir
      return NextResponse.redirect(new URL('/guestbook?error=auth_callback_failed', request.url));
    }
  }
  
  // Kod yoksa, ziyaretçi defterine geri yönlendir
  console.log("Kimlik doğrulama kodu bulunamadı, ziyaretçi defterine yönlendiriliyor");
  return NextResponse.redirect(new URL('/guestbook', request.url));
} 