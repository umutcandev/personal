import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  // Extract the URL from the request
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Exchange the code for a session
    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // Redirect to the guestbook page after successful authentication
      return NextResponse.redirect(new URL('/guestbook', request.url));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Redirect to an error page or back to the guestbook with an error parameter
      return NextResponse.redirect(new URL('/guestbook?error=auth_callback_failed', request.url));
    }
  }
  
  // If no code is present, redirect back to the guestbook page
  return NextResponse.redirect(new URL('/guestbook', request.url));
} 