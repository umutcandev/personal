import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { id, email, user_metadata } = await request.json();
  const username = user_metadata?.user_name || user_metadata?.name || email?.split('@')[0];
  const display_name = user_metadata?.name || user_metadata?.full_name;

  // Kullanıcı zaten varsa güncelle
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    await supabase.from('users').insert([
      { id, email, username, display_name }
    ]);
  } else {
    // Kullanıcı varsa display_name'i güncelle
    await supabase
      .from('users')
      .update({ display_name })
      .eq('id', id);
  }

  return NextResponse.json({ ok: true });
} 