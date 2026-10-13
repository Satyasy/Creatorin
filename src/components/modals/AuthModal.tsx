'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Lock, Mail, AlertCircle, Loader2, Sparkles, ArrowRight, Bookmark } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: (user: NonNullable<AuthState['user']>) => void;
  redirectUrl?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  title,
  description,
  onSuccess,
  redirectUrl,
}: AuthModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const modalTitle = title || t('auth.loginRequired', 'Masuk ke Akun Creatorin');
  const modalDescription =
    description ||
    t('auth.bookmarkRequired', 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk menyimpan ke koleksi favorit.');

  // Keyboard trap for Escape and scroll lock
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

    // Auto-focus first input for keyboard accessibility
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t('auth.emptyCredentials', 'Harap masukkan email dan kata sandi.'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.signIn(email.trim(), password);
      if (!result.success || !result.user) {
        setError(result.error || t('auth.invalidCredentials', 'Email atau kata sandi tidak valid.'));
        setIsLoading(false);
        return;
      }

      login(result.user);
      onSuccess?.(result.user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.networkError', 'Terjadi kendala jaringan.'));
      setIsLoading(false);
    }
  };

  const currentRedirect = redirectUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/jelajah');
  const fullSignInUrl = `/sign-in?redirect=${encodeURIComponent(currentRedirect)}`;
  const fullSignUpUrl = `/sign-up?redirect=${encodeURIComponent(currentRedirect)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0D0C22]/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-100 shadow-[0_25px_60px_-15px_rgba(21,93,252,0.30)] overflow-hidden p-6 sm:p-7 text-left transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Silhouette Gradient Background with Creatorin Brand Primary Colors */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          {/* Top accent brand gradient line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#155DFC] via-[#03ACFD] to-[#1248C7]" />

          {/* Upper-right primary gradient silhouette orb */}
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#155DFC]/35 via-[#03ACFD]/20 to-transparent blur-3xl opacity-80" />

          {/* Lower-left dark navy / primary gradient silhouette orb */}
          <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-[#155DFC]/25 via-[#0D0C22]/15 to-transparent blur-3xl opacity-75" />

          {/* Artistic vector silhouette mesh overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 400 450"
          >
            <defs>
              <linearGradient id="creatorinModalSiluet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#155DFC" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#03ACFD" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0D0C22" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d="M0,100 C120,30 240,160 400,60 L400,0 L0,0 Z" fill="url(#creatorinModalSiluet)" />
            <circle cx="360" cy="70" r="100" fill="url(#creatorinModalSiluet)" />
            <path d="M0,350 C150,280 260,420 400,320 L400,450 L0,450 Z" fill="url(#creatorinModalSiluet)" />
            <circle cx="40" cy="380" r="110" fill="url(#creatorinModalSiluet)" />
          </svg>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t('action.close', 'Tutup dialog autentikasi')}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100/80 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:outline-hidden z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="relative z-10 flex items-center gap-3.5 mb-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#155DFC] to-[#03ACFD] text-white flex items-center justify-center shadow-md shadow-blue-500/25 ring-4 ring-blue-50/80 shrink-0">
            <Bookmark className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-lg sm:text-xl font-black text-[#0D0C22] leading-snug tracking-tight">
              {modalTitle}
            </h2>
          </div>
        </div>

        <p id="auth-modal-description" className="relative z-10 text-xs sm:text-sm text-neutral-600 mt-1 mb-5 leading-relaxed">
          {modalDescription}
        </p>

        {error && (
          <div
            role="alert"
            className="relative z-10 mb-4 flex items-center gap-2.5 p-3 rounded-xl border border-red-200 bg-red-50 text-xs sm:text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-3.5">
          <div>
            <label htmlFor="auth-modal-email" className="block text-xs font-semibold text-neutral-700 mb-1">
              {t('auth.emailLabel', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                ref={firstInputRef}
                id="auth-modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border border-neutral-300 bg-white placeholder-neutral-400 text-neutral-900 focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:border-transparent focus-visible:outline-hidden transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="auth-modal-password" className="block text-xs font-semibold text-neutral-700">
                {t('auth.passwordLabel', 'Kata Sandi')}
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                id="auth-modal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border border-neutral-300 bg-white placeholder-neutral-400 text-neutral-900 focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:border-transparent focus-visible:outline-hidden transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#1248C7] hover:from-[#1248C7] hover:to-[#0D0C22] active:scale-[0.99] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#155DFC] focus-visible:outline-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('auth.processing', 'Memproses Masuk...')}</span>
              </>
            ) : (
              <span>{t('auth.submitButton', 'Masuk Sekarang')}</span>
            )}
          </button>
        </form>

        <div className="relative z-10 mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <span>{t('auth.noAccount', 'Belum memiliki akun?')}</span>
          <Link
            href={fullSignUpUrl}
            onClick={onClose}
            className="font-bold text-[#155DFC] hover:underline flex items-center gap-1 transition-colors"
          >
            <span>{t('auth.signUpLink', 'Daftar Akun Baru')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
