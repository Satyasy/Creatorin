'use client';

import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmModalOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !options) return null;

  const isDanger = options.variant === 'danger';
  const isWarning = options.variant === 'warning';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center space-y-4 animate-in zoom-in-95 duration-200 border border-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Batalkan dialog konfirmasi"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Circular Badge */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto ring-8 shadow-inner ${
            isDanger
              ? 'bg-rose-50 text-rose-600 ring-rose-50/60'
              : isWarning
              ? 'bg-amber-50 text-amber-600 ring-amber-50/60'
              : 'bg-blue-50 text-[#155DFC] ring-blue-50/60'
          }`}
        >
          {isDanger || isWarning ? (
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          ) : (
            <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          )}
        </div>

        {/* Title */}
        <h3 id="confirm-modal-title" className="text-lg sm:text-xl font-bold text-[#0D0C22] tracking-tight">
          {options.title}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
          {options.message}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            {options.cancelText || 'Batal'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs active:scale-98 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#0B1F3A] hover:bg-[#123B8C]'
            }`}
          >
            {options.confirmText || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};
