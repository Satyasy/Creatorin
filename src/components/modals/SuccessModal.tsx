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
      className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
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

        {/* Emerald Animated Checkmark Badge matching Creatorin Design System */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-inner">
          <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 animate-in zoom-in-50 duration-300 stroke-[2.2]" />
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
            className="w-full sm:w-auto min-w-[140px] px-7 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs active:scale-98"
          >
            {options.buttonText || 'Selesai'}
          </button>
        </div>
      </div>
    </div>
  );
};
