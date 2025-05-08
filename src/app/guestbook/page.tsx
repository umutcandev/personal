"use client";
import React from "react";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import MobileNavMenu from "../../components/MobileNavMenu";
import MessageList from '../../components/guestbook/MessageList';
import SignDialog from '../../components/guestbook/SignDialog';
import LoginButton from '../../components/guestbook/LoginButton';
import LogoutButton from '../../components/guestbook/LogoutButton';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
}

interface Message {
  id: number;
  username: string;
  display_name?: string;
  message: string;
  created_at: string;
  signature?: string;
}

export default function GuestbookPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const fetchMessages = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages?page=${pageNum}`);
      if (!response.ok) {
        setMessages([]);
        setLoading(false);
        return;
      }
      const text = await response.text();
      if (!text) {
        setMessages([]);
        setLoading(false);
        return;
      }
      const data = JSON.parse(text);
      if (pageNum === 1) {
        setMessages(data);
      } else {
        setMessages(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 10); // Assuming 10 messages per page
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage);
  };

  React.useEffect(() => {
    fetchMessages();
  }, []);

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          if (error.message === "Auth session missing!") {
            console.log("Kullanıcı henüz giriş yapmamış");
            setAuthError(null);
          } else {
            console.error("GitHub kimlik doğrulama hatası:", error.message);
            setAuthError(error.message);
          }
        } else {
          console.log("Kullanıcı bilgileri alındı:", data.user ? "Giriş yapıldı" : "Giriş yapılmadı");
          setUser(data.user);
          setAuthError(null);
        }
      } catch (err) {
        console.error("Beklenmeyen kimlik doğrulama hatası:", err);
        setAuthError("Beklenmeyen bir kimlik doğrulama hatası oluştu.");
      }
    };
    
    getUser();
    
    const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log("Kimlik durumu değişti:", event, session ? "Oturum var" : "Oturum yok");
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthError(null);
      }
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (user) {
      try {
        console.log('Guestbook: Kullanıcı verileri API\'ye gönderiliyor', {
          id: user.id,
          hasEmail: !!user.email,
          hasMetadata: !!user.user_metadata
        });
        
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API yanıt hatası: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Guestbook: Kullanıcı verileri başarıyla kaydedildi', data);
        })
        .catch(error => {
          console.error('Guestbook: Kullanıcı verilerini kaydederken API hatası:', error);
        });
      } catch (error) {
        console.error('Guestbook: Kullanıcı verilerini kaydederken hata:', error);
      }
    }
  }, [user]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      
      if (error) {
        console.error("URL'den kimlik doğrulama hatası:", error);
        setAuthError(error === 'auth_callback_failed' 
          ? "GitHub kimlik doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin." 
          : error);
        
        // URL'yi temizle
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center min-h-[70vh] px-4 sm:px-0 pt-[15px] sm:pt-0 mb-[40px]"
    >
      <div className="max-w-[650px] w-full flex flex-col gap-2 items-start mx-auto relative">
        <div className="w-full mt-[12px]">
          <div className="w-full flex items-center justify-between mb-2">
            <nav className="hidden sm:flex gap-5 text-lg font-light">
              <Link href="/" className="hover:underline">ana sayfa</Link>
              <Link href="/guestbook" className="hover:underline">ziyaretçi defteri</Link>
              <Link href="/contact" className="hover:underline">iletişim</Link>
            </nav>
            <div className="sm:hidden absolute right-0 top-0">
              <MobileNavMenu />
            </div>
          </div>
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 mt-8 sm:mt-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-0.5">Ziyaretçi Defteri</h1>
              <h2 className="text-sm sm:text-lg text-muted-foreground font-light mb-1">Ziyaretçi defterine bir mesaj bırakabilir ve imzanızı ekleyebilirsiniz.</h2>
            </div>
            <div className="flex items-center self-end sm:self-center mt-2 sm:mt-0 hidden sm:flex">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        
        {authError && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{authError}</p>
          </div>
        )}
        
        {!user && !authError && (
          <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
            <p>Ziyaretçi defterini imzalamak için lütfen GitHub ile giriş yapın.</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-6">
          {user ? (
            <>
              <button
                className="bg-background border border-border hover:bg-muted text-foreground px-3 sm:px-4 py-1.5 rounded font-semibold shadow transition-colors text-sm sm:text-base"
                onClick={() => setIsDialogOpen(true)}
              >
                Ziyaretçi Defterini İmzala
              </button>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
        <div className="w-full">
          <MessageList messages={messages} loading={loading} />
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6 sm:mt-8 w-full">
            <button 
              onClick={loadMore}
              className="bg-background border border-border hover:bg-muted text-foreground px-3 sm:px-4 py-1.5 rounded font-semibold shadow transition-colors text-sm sm:text-base"
            >
              Daha Fazla Yükle
            </button>
          </div>
        )}
        {isDialogOpen && user && (
          <SignDialog 
            user={user} 
            onClose={() => setIsDialogOpen(false)} 
            onMessageAdded={fetchMessages}
          />
        )}
      </div>
    </motion.section>
  );
}