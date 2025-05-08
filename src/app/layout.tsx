'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { setupAuthListener } from "../lib/supabaseClient";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Umutcan K.",
  description: "Multidisipliner Ürün Geliştirici",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global auth listener'ı kur
  useEffect(() => {
    const subscription = setupAuthListener();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground font-sans`}
      >
        <main className="flex-1 flex flex-col items-center justify-center w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
