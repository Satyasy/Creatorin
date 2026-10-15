'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface SuccessModalOptions {
  title: string;
  message: string;
  buttonText?: string;
  duration?: number; // ms, optional auto-close (default 3000ms if set, 0 = stay until clicked)
  onClose?: () => void;
}

interface SuccessModalProps {
  isOpen: boolean;
  options: SuccessModalOptions | null;
  onDismiss: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  options,
  onDismiss,
}) => {
  useEffect(() => {
    if (!isOpen || !options?.duration || options.duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
      options.onClose?.();
    }, options.duration);
    return () => clearTimeout(timer);
  }, [isOpen, options, onDismiss]);

  if (!isOpen || !options) return null;

  const handleClose = () => {
    onDismiss();
    options.onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-4 animate-in zoom-in-95 duration-200 border border-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup popup sukses"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Creatorin Royal Blue Animated Checkmark Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#155DFC] text-white rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-100/80 shadow-lg shadow-blue-500/20 animate-in zoom-in-75 duration-300">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M20 6L9 17L4 12"
              className="animate-checkmark-draw"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 id="success-modal-title" className="text-lg sm:text-xl font-bold text-[#0D0C22] tracking-tight">
          {options.title}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
          {options.message}
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto min-w-[140px] px-7 py-2.5 rounded-xl bg-[#155DFC] hover:bg-[#1248C4] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs active:scale-98"
          >
            {options.buttonText || 'Selesai'}
          </button>
        </div>
      </div>
    </div>
  );
};
