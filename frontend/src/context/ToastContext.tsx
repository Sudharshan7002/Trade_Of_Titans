import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success: (title, msg) => addToast('success', title, msg),
    error: (title, msg) => addToast('error', title, msg),
    warning: (title, msg) => addToast('warning', title, msg),
    info: (title, msg) => addToast('info', title, msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Render Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bgClass = 'bg-[#111111] border-neutral-700 text-white';
          let icon = <Info className="w-5 h-5 text-neutral-400 shrink-0" />;

          if (t.type === 'success') {
            bgClass = 'bg-[#111111] border-[#CCFF00]/50 text-white shadow-[0_0_20px_rgba(204,255,0,0.2)]';
            icon = <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-[#111111] border-[#FF5533]/50 text-white shadow-[0_0_20px_rgba(255,85,51,0.2)]';
            icon = <AlertCircle className="w-5 h-5 text-[#FF5533] shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-[#111111] border-[#FFD000]/50 text-white shadow-[0_0_20px_rgba(255,208,0,0.2)]';
            icon = <AlertTriangle className="w-5 h-5 text-[#FFD000] shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-2xl transition-all duration-300 transform translate-y-0 shadow-xl ${bgClass}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold leading-tight text-white">{t.title}</p>
                {t.message && <p className="text-xs mt-1 text-neutral-400 leading-normal">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-neutral-500 hover:text-white transition-colors shrink-0 p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
