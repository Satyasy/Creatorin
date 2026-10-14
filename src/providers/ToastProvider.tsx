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
              className="pointer-events-auto relative overflow-hidden bg-gradient-to-br from-[#0B172E] via-[#0D0C22] to-[#070D19] text-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-10px_rgba(21,93,252,0.40)] border border-[#155DFC]/35 p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 font-sans"
            >
              {/* Silhouette Gradient Background with Creatorin Brand Primary Colors */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
                {/* Top accent brand gradient line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#155DFC] via-[#03ACFD] to-[#1248C7]" />

                {/* Upper-right primary gradient silhouette orb */}
                <div className="absolute -top-16 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-[#155DFC]/40 via-[#03ACFD]/25 to-transparent blur-2xl opacity-90" />

                {/* Lower-left primary gradient silhouette orb */}
                <div className="absolute -bottom-16 -left-14 w-40 h-40 rounded-full bg-gradient-to-tr from-[#155DFC]/30 via-[#03ACFD]/15 to-transparent blur-2xl opacity-80" />

                {/* Artistic vector silhouette mesh overlay */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-15"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  viewBox="0 0 350 150"
                >
                  <defs>
                    <linearGradient id={`toastSiluet-${toast.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#155DFC" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#03ACFD" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#0D0C22" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path d="M0,50 C80,10 180,80 350,20 L350,0 L0,0 Z" fill={`url(#toastSiluet-${toast.id})`} />
                  <circle cx="310" cy="30" r="60" fill={`url(#toastSiluet-${toast.id})`} />
                  <path d="M0,120 C100,90 200,140 350,110 L350,150 L0,150 Z" fill={`url(#toastSiluet-${toast.id})`} />
                </svg>
              </div>

              <div className="relative z-10 flex items-start gap-3.5">
                <div className="shrink-0 mt-0.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#155DFC]/35 to-[#03ACFD]/20 border border-[#155DFC]/40 flex items-center justify-center shadow-xs">
                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isWarning && <AlertCircle className="w-5 h-5 text-amber-300" />}
                    {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                    {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-[#03ACFD]" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  {toast.title && (
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight mb-1">
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
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#03ACFD] hover:from-[#1248C7] hover:to-[#0295DC] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/25 inline-flex items-center gap-1.5 active:scale-95"
                      >
                        <span>{toast.action.label}</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => hideToast(toast.id)}
                  className="shrink-0 -mr-1 -mt-1 p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Animated Progress Line Countdown Indicator */}
              {toast.duration && toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#155DFC] via-[#03ACFD] to-[#1248C7]"
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
