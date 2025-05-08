import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { id, email, user_metadata } = await request.json();
  const username = user_metadata?.user_name || user_metadata?.name || email?.split('@')[0];

  // Kullanıcı zaten varsa ekleme
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    await supabase.from('users').insert([
      { id, email, username }
    ]);
  }

  return NextResponse.json({ ok: true });
} 