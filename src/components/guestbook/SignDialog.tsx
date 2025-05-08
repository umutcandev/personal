import React, { useRef, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
}

type SignDialogProps = {
  user: User;
  onClose: () => void;
  onMessageAdded: () => void;
};

const getTheme = () => {
  if (typeof window === 'undefined') return 'light';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const MAX_MESSAGE_LENGTH = 100;

const SignDialog: React.FC<SignDialogProps> = ({ user, onClose, onMessageAdded }) => {
  const [message, setMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [theme, setTheme] = useState(getTheme());
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const updateTheme = () => {
      const newTheme = getTheme();
      setTheme(newTheme);
      
      // Update canvas colors when theme changes
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update stroke color
      ctx.strokeStyle = newTheme === 'dark' ? '#fff' : '#000';
      
      // Update background color
      ctx.fillStyle = newTheme === 'dark' ? '#181818' : '#f8f8f7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save the new state
      const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawingHistory([newState]);
    };

    window.addEventListener('themechange', updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('themechange', updateTheme);
      observer.disconnect();
    };
  }, []);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set initial canvas state
    ctx.strokeStyle = theme === 'dark' ? '#fff' : '#000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set background color based on theme
    ctx.fillStyle = theme === 'dark' ? '#181818' : '#f8f8f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory([initialState]);
  }, [theme]);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory(prev => [...prev, imageData]);
  }, []);

  const undo = useCallback(() => {
    if (drawingHistory.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Remove current state
    const newHistory = drawingHistory.slice(0, -1);
    setDrawingHistory(newHistory);

    // Restore previous state
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);

    // Update signature
    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
  }, [drawingHistory]);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  const getMousePos = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const drawLine = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const pos = getMousePos(e);
    if (!pos) return;

    setIsDrawing(true);
    setLastPoint(pos);
    saveCanvasState();
  }, [getMousePos, saveCanvasState]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;

    const pos = getMousePos(e);
    if (!pos) return;

    drawLine(lastPoint, pos);
    setLastPoint(pos);
  }, [drawLine, getMousePos, isDrawing, lastPoint]);

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
  }, [isDrawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, [handleEnd, handleMove, handleStart]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Update stroke color
    ctx.strokeStyle = theme === 'dark' ? '#fff' : '#000';
    
    // Clear with theme-appropriate background
    ctx.fillStyle = theme === 'dark' ? '#181818' : '#f8f8f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    
    // Save cleared state
    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory([clearedState]);
  }, [theme]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    if (input.length <= MAX_MESSAGE_LENGTH) {
      setMessage(input);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          signature, 
          user_id: user?.id,
          display_name: user?.user_metadata?.name || user?.user_metadata?.full_name
        }),
      });

      if (response.ok) {
        onMessageAdded(); // Yeni mesaj eklendiğinde listeyi güncelle
        onClose();
      } else {
        alert('Mesaj gönderilirken bir hata oluştu.');
      }
    } catch {
      alert('Mesaj gönderilirken bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fadeIn flex flex-col gap-4 sm:gap-6">
        <button
          className="absolute top-2 sm:top-4 right-2 sm:right-4 text-muted-foreground hover:text-foreground text-2xl font-bold focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl sm:text-2xl font-bold leading-tight mb-2">Ziyaretçi Defterini İmzala</h3>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="message"
              className="block text-sm font-medium"
            >
              Mesajınız
            </label>
            <span className="text-xs text-muted-foreground">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <textarea
            id="message"
            value={message}
            onChange={handleMessageChange}
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            className="block w-full rounded-md border border-border bg-background p-2 text-sm focus:ring-1 focus:outline-none"
            placeholder="Mesajınızı buraya yazın..."
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">
              İmzanız (isteğe bağlı)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={undo}
                className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground border border-border rounded-md"
                disabled={drawingHistory.length <= 1}
              >
                Geri Al
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground border border-border rounded-md"
              >
                Temizle
              </button>
            </div>
          </div>
          <div 
            className="relative border border-border rounded-md w-full h-[150px] sm:h-[180px] overflow-hidden mb-2"
            style={{ touchAction: 'none' }}
          >
            <canvas
              ref={canvasRef}
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
          <button
            onClick={handleSubmit}
            disabled={message.length < 1}
            className={`grow px-4 py-2 rounded-md font-medium ${
              message.length < 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            Gönder
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-background border border-border text-foreground rounded-md hover:bg-muted"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignDialog; 