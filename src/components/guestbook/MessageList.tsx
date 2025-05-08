import React, { useEffect, useState } from 'react';

type Message = {
  id: number;
  username: string;
  message: string;
  signature?: string;
  created_at: string;
};

type MessageListProps = {
  messages: Message[];
  loading?: boolean;
};

const skeletonArray = [1, 2, 3, 4];

const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const getTheme = () => {
      if (typeof window === 'undefined') return 'light';
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    };

    const updateTheme = () => {
      const currentTheme = getTheme();
      setTheme(currentTheme);
    };
    
    // Initial theme detection
    updateTheme();
    
    // Set up listeners for theme changes
    window.addEventListener('themechange', updateTheme);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => {
      window.removeEventListener('themechange', updateTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full">
      {(loading ? skeletonArray : messages).map((msgOrIdx: any, idx: number) => {
        const isLoading = loading;
        const msg = isLoading
          ? null
          : (msgOrIdx as Message);
        return (
          <div
            key={isLoading ? idx : msg!.id}
            className={
              `relative bg-card border border-border rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col min-h-[120px] w-full mx-auto ` +
              (isLoading ? 'animate-pulse' : '')
            }
            style={{ maxWidth: '100%', width: '100%' }}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                <div className="flex flex-col gap-1 mt-auto">
                  <div className="h-3 w-1/2 bg-muted rounded mb-1" />
                  <div className="h-2 w-1/3 bg-muted rounded" />
                </div>
                <div className="absolute bottom-4 right-4 h-8 w-20 bg-muted rounded" />
              </>
            ) : (
              <>
                <div className="text-sm sm:text-base text-card-foreground font-normal mb-3">{msg!.message}</div>
                <div className="flex flex-col gap-0.5 mt-auto">
                  <span className="font-bold text-base sm:text-lg text-card-foreground mb-0.5">{msg!.username || 'Anonim'}</span>
                  <span className="text-xs text-muted-foreground">{new Date(msg!.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                {msg!.signature && mounted && (
                  <img
                    src={msg!.signature}
                    alt="İmza"
                    className="absolute bottom-4 right-4 h-8 sm:h-10 max-w-[100px] sm:max-w-[150px] object-contain opacity-90"
                    style={{
                      filter: theme === 'light' ? 'invert(1) brightness(1.5)' : 'none',
                      backgroundColor: 'transparent'
                    }}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList; 