import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabase bağlantı bilgilerini kaydet ve günlüğe yaz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Service role ile RLS bypass edilir - dikkatli kullanın!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Service role varsa onu kullanır, yoksa anon key kullanır
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

// Service key kullanılıp kullanılmadığını günlüğe kaydet
console.log('Messages API: Service role kullanımı:', !!supabaseServiceKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (
        username,
        display_name
      )
    `)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Messages API: Post verileri alınırken hata:', error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }

  // Transform the data to include username and display_name directly
  const transformedData = data?.map(post => ({
    ...post,
    username: post.users?.username || 'Anonim',
    display_name: post.users?.display_name || null
  })) ?? [];

  return NextResponse.json(transformedData);
}

export async function POST(request: Request) {
  try {
    const { message, signature, user_id, display_name } = await request.json();
    
    console.log('Messages API: Yeni mesaj eklenecek:', { 
      hasMessage: !!message, 
      hasSignature: !!signature, 
      userId: user_id,
      display_name
    });

    // First update user's display_name if provided
    if (display_name && user_id) {
      const { error: userError } = await supabase
        .from('users')
        .update({ display_name })
        .eq('id', user_id);
        
      if (userError) {
        console.error('Messages API: Kullanıcı güncelleme hatası:', userError);
      }
    }

    // Then insert the new post
    const { data, error } = await supabase.from('posts').insert([{ 
      message, 
      signature, 
      user_id 
    }]);

    if (error) {
      console.error('Messages API: Mesaj ekleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Messages API: Mesaj başarıyla eklendi');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Messages API: Beklenmeyen hata:', error);
    return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu' }, { status: 500 });
  }
} 