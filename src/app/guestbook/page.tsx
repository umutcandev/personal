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
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);

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
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (user) {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      window.history.replaceState(null, '', window.location.pathname);
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