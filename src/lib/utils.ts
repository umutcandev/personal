import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Site URL'sini döndürür - tarayıcı ortamında mevcut host kullanılır, sunucu ortamında çevre değişkeni
 * @returns {string} site URL'si
 */
export function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || '';
}
