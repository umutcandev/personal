import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabase bağlantı bilgilerini kaydet ve günlüğe yaz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Service role ile RLS bypass edilir - dikkatli kullanın!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Bağlantı bilgilerine sahip olduğumuzdan emin olalım
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('API: Supabase bilgileri eksik!', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey
  });
}

// API route için yeni bir istemci oluşturalım - service role varsa onu kullanır
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    console.log('API: Kullanıcı kaydetme isteği alındı');
    console.log('API: Service role kullanımı:', !!supabaseServiceKey);
    
    const userData = await request.json();
    console.log('API: Kullanıcı verileri:', JSON.stringify(userData, null, 2));
    
    const { id, email, user_metadata } = userData;
    
    if (!id) {
      console.error('API: Kullanıcı ID eksik!');
      return NextResponse.json(
        { error: 'Kullanıcı ID eksik' },
        { status: 400 }
      );
    }
    
    // GitHub kullanıcı bilgilerinden kullanıcı adını ve görünen adı çıkart
    const username = user_metadata?.user_name || 
                    user_metadata?.preferred_username || 
                    user_metadata?.username || 
                    user_metadata?.name || 
                    email?.split('@')[0] || 
                    'misafir';
                    
    const display_name = user_metadata?.name || 
                        user_metadata?.full_name || 
                        username;
    
    console.log('API: GitHub kullanıcı kaydediliyor:', { id, username, display_name });

    // Kullanıcı zaten varsa güncelle
    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();
      
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('API: Kullanıcı sorgulama hatası:', selectError);
    }

    let result;
    
    if (!existing) {
      // Yeni kullanıcı oluştur
      result = await supabase.from('users').insert([
        { id, email, username, display_name }
      ]);
      
      if (result.error) {
        console.error('API: Yeni kullanıcı oluşturma hatası:', result.error);
        throw result.error;
      }
      
      console.log('API: Yeni GitHub kullanıcısı oluşturuldu');
    } else {
      // Kullanıcı varsa güncellemeleri yap
      result = await supabase
        .from('users')
        .update({ 
          email,
          username, 
          display_name
        })
        .eq('id', id);
      
      if (result.error) {
        console.error('API: Kullanıcı güncelleme hatası:', result.error);
        throw result.error;
      }
      
      console.log('API: Mevcut GitHub kullanıcısı güncellendi');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API: GitHub kullanıcı kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 