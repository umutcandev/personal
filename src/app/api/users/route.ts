import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { id, email, user_metadata } = userData;
    
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
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      // Yeni kullanıcı oluştur
      await supabase.from('users').insert([
        { id, email, username, display_name }
      ]);
      console.log('API: Yeni GitHub kullanıcısı oluşturuldu');
    } else {
      // Kullanıcı varsa güncellemeleri yap
      await supabase
        .from('users')
        .update({ 
          email,
          username,
          display_name,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
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