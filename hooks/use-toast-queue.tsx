import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastColor = 'red' | 'green' | 'blue';

export type ToastItem = {
  id: string;
  message: string;
  color: ToastColor;
};

type ToastContextValue = {
  toasts: ToastItem[];
  addToast: (message: string, color: ToastColor) => void;
};

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((message: string, color: ToastColor) => {
    const id = `t-${Date.now()}-${counter.current++}`;
    setToasts(prev => {
      // Keep at most 3 visible at once (drop oldest)
      const next = prev.length >= 3 ? prev.slice(1) : prev;
      return [...next, { id, message, color }];
    });
    // Remove after 2.8s (matches fade-out timing in ToastOverlay)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToasts() {
  return useContext(ToastContext);
}
