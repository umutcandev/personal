import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
        username
      )
    `)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }

  // Transform the data to include username directly
  const transformedData = data?.map(post => ({
    ...post,
    username: post.users?.username || 'Anonim'
  })) ?? [];

  return NextResponse.json(transformedData);
}

export async function POST(request: Request) {
  const { message, signature, user_id } = await request.json();

  const { data, error } = await supabase.from('posts').insert([{ message, signature, user_id }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
} 