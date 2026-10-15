'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, ArrowRight, Info, Loader2, RefreshCw, X } from 'lucide-react';
import type { ErrorDetails } from '@/lib/error-mapper';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails | null;
  onRetry?: () => Promise<void> | void;
}

export function ErrorModal({ isOpen, onClose, error, onRetry }: ErrorModalProps) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  // Keyboard accessibility (ESC) and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !error) return null;

  const handleRetry = async () => {
    if (!onRetry) return;
    try {
      setRetrying(true);
      await onRetry();
      onClose();
    } catch {
      // Retrying failed, stay open with error
    } finally {
      setRetrying(false);
    }
  };

  const isWarning = error.code?.includes('RATE_LIMITED') || error.code?.includes('CONFLICT');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-[#E1E3EA] shadow-2xl p-6 sm:p-7 text-left animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog kendala"
          className="absolute top-4 right-4 p-1.5 text-[#55576A] hover:text-[#0D0C22] rounded-lg hover:bg-[#F3F3F4] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Badge */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            isWarning ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {isWarning ? <AlertTriangle className="w-6 h-6 stroke-[2]" /> : <AlertCircle className="w-6 h-6 stroke-[2]" />}
        </div>

        {/* Title */}
        <h2
          id="error-modal-title"
          className="font-['DM_Sans',sans-serif] text-lg sm:text-xl font-bold text-[#0D0C22] tracking-tight"
        >
          {error.title}
        </h2>

        {/* Message */}
        <p id="error-modal-description" className="text-xs sm:text-sm text-[#55576A] mt-1.5 leading-relaxed">
          {error.message}
        </p>

        {/* Suggestion Box */}
        {error.suggestion && (
          <div className="mt-4 p-3 rounded-xl bg-[#F8F9FB] border border-[#E1E3EA] flex items-start gap-2.5 text-xs text-[#262626]">
            <Info className="w-4 h-4 shrink-0 text-[#155DFC] mt-0.5" />
            <span className="leading-relaxed">{error.suggestion}</span>
          </div>
        )}

        {/* Technical Code Badge */}
        {error.code && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8C8E9F] bg-[#F4F5F7] px-2 py-0.5 rounded-md border border-[#E5E7EB]">
              Kode: {error.code}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-[#F0F1F5]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#262626] text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {error.action && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (error.action?.onClick) {
                  error.action.onClick();
                } else if (error.action?.href) {
                  router.push(error.action.href);
                }
              }}
              className="w-full sm:w-auto h-10 px-4 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{error.action.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {(error.retryable || onRetry) && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="w-full sm:w-auto h-10 px-4 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {retrying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mencoba Lagi…</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
