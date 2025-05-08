"use client";
import React from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";
import MobileNavMenu from "../components/MobileNavMenu";
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-0.5">Umutcan K.</h1>
            <h2 className="text-base sm:text-lg text-muted-foreground font-light mb-1">Multidisipliner Ürün Geliştirici</h2>
          </div>
          <div className="self-end sm:self-center mt-2 sm:mt-0 hidden sm:block">
            <ThemeSwitcher />
          </div>
        </div>
        <p className="mt-2 text-sm sm:text-base text-foreground font-normal leading-relaxed">
          Front-end geliştirme, modern forum yazılımları (Flarum, XenForo, Discourse) ve WordPress ile ilgileniyorum. Figma ve Framer gibi araçlarla arayüz ve grafik tasarımı konusunda da deneyimliyim. Kullanıcı odaklı, modern ve açık kaynak ekosistemlerinde aktifim. Projelerim arasında doğa, izcilik ve amatör telsizcilik konularında topluluklara hizmet eden platformlar da bulunuyor.
        </p>
        <p className="mt-2 text-sm sm:text-base text-foreground font-normal leading-relaxed">
          Günümün önemli bir bölümünü ayırdığım, birçoğu ile kullanıcılara hizmet verebilecek yetkinlikte olduğum uğraşılarım: <a href="#" className="underline underline-offset-2">Flarum</a>, <a href="#" className="underline underline-offset-2">XenForo</a>, <a href="#" className="underline underline-offset-2">Discourse</a>, <a href="#" className="underline underline-offset-2">WordPress</a>, <span className="italic">Figma</span>, <span className="italic">Framer</span> ve <span className="italic">İzci Forum</span>.
        </p>
        <div className="my-6 w-full flex justify-start">
          <svg width="60" height="16" viewBox="0 0 60 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8C6 14 10 2 14 8C18 14 22 2 26 8C30 14 34 2 38 8C42 14 46 2 50 8C54 14 58 2 58 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-sm font-normal mt-2">
          <a href="https://x.com/umutcandev" className="flex items-center gap-1 hover:underline" target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            X (Twitter)
          </a>
          <a href="https://github.com/umutcandev" className="flex items-center gap-1 hover:underline" target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            GitHub
          </a>
          <a href="https://izciforum.com" className="flex items-center gap-1 hover:underline" target="_blank" rel="noopener noreferrer">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            İzci Forum
          </a>
        </div>
      </div>
    </motion.section>
  );
}
