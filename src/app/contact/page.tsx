"use client";
import React from "react";
import ThemeSwitcher from "../../components/ThemeSwitcher";
import MobileNavMenu from "../../components/MobileNavMenu";
import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-0 pt-[15px] sm:pt-0 mb-[40px]"
    >
      <div className="max-w-[650px] w-full flex flex-col gap-2 items-start mx-auto relative">
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
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between mt-8 sm:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-0.5">İletişim</h1>
          <div className="self-end sm:self-center mt-2 sm:mt-0 hidden sm:block">
            <ThemeSwitcher />
          </div>
        </div>
        
        <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-1" />
              <div>
                <h3 className="font-medium">E-posta</h3>
                <p className="text-sm text-muted-foreground">iletisim@example.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1" />
              <div>
                <h3 className="font-medium">Telefon</h3>
                <p className="text-sm text-muted-foreground">+90 (555) 123 45 67</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1" />
              <div>
                <h3 className="font-medium">Konum</h3>
                <p className="text-sm text-muted-foreground">İstanbul, Türkiye</p>
              </div>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">İsim</label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Adınız"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">E-posta</label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="ornek@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Mesaj</label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Mesajınız..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
} 