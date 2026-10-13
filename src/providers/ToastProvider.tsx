'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastOptions {
  id?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number; // ms, default 4500
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: (id?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const hideToast = useCallback((id?: string) => {
    setToasts((prev) => {
      if (!id) {
        // Clear all timers
        timersRef.current.forEach((t) => clearTimeout(t));
        timersRef.current.clear();
        return [];
      }
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const showToast = useCallback(
    ({ id = String(Date.now()), type = 'info', title, message, duration = 4500, action }: ToastOptions) => {
      const toastItem: ToastOptions = { id, type, title, message, duration, action };

      setToasts((prev) => {
        // Keep maximum 3 toasts to prevent screen crowding
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered.slice(-2), toastItem];
      });

      // Clear existing timer for same id
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) clearTimeout(existingTimer);

      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Container Floating Bottom Right */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-70 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((toast) => {
          const durationSec = ((toast.duration || 4500) / 1000).toFixed(2);
          const isWarning = toast.type === 'warning';
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto relative overflow-hidden bg-[#0D0C22] text-white rounded-2xl shadow-2xl border border-neutral-800 p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 font-sans"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                  {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-blue-400" />}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  {toast.title && (
                    <h4 className="text-xs font-bold text-white tracking-tight mb-0.5">
                      {toast.title}
                    </h4>
                  )}
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {toast.message}
                  </p>

                  {toast.action && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          hideToast(toast.id);
                          toast.action?.onClick();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#155DFC] hover:bg-[#1248C7] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <span>{toast.action.label}</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => hideToast(toast.id)}
                  className="shrink-0 -mr-1 -mt-1 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Animated Progress Line Countdown Indicator */}
              {toast.duration && toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#155DFC]"
                    style={{
                      animation: `shrinkToastProgress ${durationSec}s linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
