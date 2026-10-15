'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
        className="relative overflow-hidden bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-blue-100/60 p-7 sm:p-8 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top brand gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#155DFC] via-[#03ACFD] to-[#155DFC]" />

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup popup sukses"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-100/80 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scattered ambient glow silhouettes across background */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-[#155DFC]/25 via-[#03ACFD]/20 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full bg-gradient-to-tr from-[#03ACFD]/25 via-[#155DFC]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-6 w-24 h-24 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

        {/* Subtle SVG silhouette gradient curves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 350 300"
        >
          <defs>
            <linearGradient id="successGradSilhouette" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#155DFC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#03ACFD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0D0C22" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M-20,60 Q80,10 180,90 T360,70 Q400,140 400,240 L-20,300 Z" fill="url(#successGradSilhouette)" />
          <circle cx="300" cy="40" r="50" fill="url(#successGradSilhouette)" />
          <circle cx="40" cy="230" r="60" fill="url(#successGradSilhouette)" />
        </svg>

        {/* Centered Smooth Animated Checkmark */}
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#155DFC] to-[#03ACFD] opacity-25 blur-md animate-ping"
            style={{ animationDuration: '2.5s' }}
          />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-50/80 to-sky-50/80 border-2 border-[#155DFC]/30 flex items-center justify-center shadow-inner">
            <svg className="w-12 h-12 text-[#155DFC]" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r="23"
                fill="none"
                stroke="#155DFC"
                strokeWidth="3.5"
                strokeDasharray="145"
                strokeDashoffset="145"
                style={{
                  animation: 'successCircleDraw 0.55s cubic-bezier(0.65, 0, 0.45, 1) forwards',
                }}
              />
              <path
                fill="none"
                stroke="#155DFC"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.5 27.2l7.1 7.2 16.7-16.8"
                strokeDasharray="36"
                strokeDashoffset="36"
                style={{
                  animation: 'successCheckDraw 0.4s 0.35s cubic-bezier(0.65, 0, 0.45, 1) forwards',
                }}
              />
            </svg>
          </div>
        </div>

        <h3 id="success-modal-title" className="relative text-lg font-bold text-[#0D0C22] mb-1.5 tracking-tight">
          {options.title}
        </h3>
        <p className="relative text-xs sm:text-sm text-neutral-500 mb-5 leading-relaxed max-w-sm mx-auto">
          {options.message}
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="relative w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#03ACFD] hover:from-[#124bcf] hover:to-[#0295db] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition cursor-pointer active:scale-98"
        >
          {options.buttonText || 'Tutup'}
        </button>

        {/* Embedded Keyframes for SVG stroke drawing */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes successCircleDraw {
                0% { stroke-dashoffset: 145; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes successCheckDraw {
                0% { stroke-dashoffset: 36; }
                100% { stroke-dashoffset: 0; }
              }
            `,
          }}
        />
      </div>
    </div>
  );
};
