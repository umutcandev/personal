import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  // Extract the URL from the request
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  
  console.log("Auth callback triggered", { code: code ? "present" : "missing", error, error_description });
  
  if (error) {
    console.error("OAuth error:", error, error_description);
    return NextResponse.redirect(new URL(`/guestbook?error=${encodeURIComponent(error_description || error)}`, request.url));
  }
  
  if (code) {
    // Exchange the code for a session
    try {
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Exchange code error:', sessionError);
        return NextResponse.redirect(new URL(`/guestbook?error=${encodeURIComponent(sessionError.message)}`, request.url));
      }
      
      console.log("Auth successful, redirecting to guestbook");
      // Redirect to the guestbook page after successful authentication
      return NextResponse.redirect(new URL('/guestbook', request.url));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Redirect to an error page or back to the guestbook with an error parameter
      return NextResponse.redirect(new URL('/guestbook?error=auth_callback_failed', request.url));
    }
  }
  
  // If no code is present, redirect back to the guestbook page
  console.log("No auth code present, redirecting to guestbook");
  return NextResponse.redirect(new URL('/guestbook', request.url));
} 