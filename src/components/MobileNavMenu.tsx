import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const MobileNavMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative sm:hidden z-50">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-1 text-foreground px-2 py-1.5 rounded border border-border bg-background shadow"
      >
        <span className="text-sm font-medium">Menü</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-md shadow-md overflow-hidden">
          <div className="py-1">
            <Link 
              href="/" 
              className="block px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/guestbook" 
              className="block px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Ziyaretçi Defteri
            </Link>
            <Link 
              href="/contact" 
              className="block px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              İletişim
            </Link>
            <div className="px-4 py-2 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Tema</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavMenu; 