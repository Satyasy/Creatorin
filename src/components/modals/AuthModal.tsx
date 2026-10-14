'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, AlertCircle, Loader2 } from 'lucide-react';
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
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const modalTitle = title || t('auth.loginRequired', 'Masuk ke akun');
  const modalDescription =
    description ||
    t('auth.bookmarkRequired', 'Masuk ke akun Anda untuk melanjutkan.');

  // Keyboard accessibility & scroll lock
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

  const currentRedirect =
    redirectUrl ||
    (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/jelajah');
  const fullSignUpUrl = `/sign-up?redirect=${encodeURIComponent(currentRedirect)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-[#E1E3EA] shadow-xl p-6 sm:p-7 text-left animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('action.close', 'Tutup dialog')}
          className="absolute top-4 right-4 p-1.5 text-[#55576A] hover:text-[#0D0C22] rounded-lg hover:bg-[#F3F3F4] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
        >
          <X className="size-4.5" />
        </button>

        {/* Header */}
        <div className="pr-8">
          <h2
            id="auth-modal-title"
            className="font-['DM_Sans',sans-serif] text-lg sm:text-xl font-semibold text-[#0D0C22] tracking-tight"
          >
            {modalTitle}
          </h2>
          <p
            id="auth-modal-description"
            className="text-xs sm:text-sm text-[#55576A] mt-1 leading-relaxed"
          >
            {modalDescription}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 p-3 rounded-lg border border-[#FECDCA] bg-[#FEF3F2] text-xs text-[#D92D20]"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="auth-modal-email"
              className="block text-xs font-medium text-[#0D0C22] mb-1.5"
            >
              {t('auth.emailLabel', 'Email')}
            </label>
            <input
              ref={firstInputRef}
              id="auth-modal-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              disabled={isLoading}
              className="w-full h-10 px-3 text-sm rounded-lg border border-[#E1E3EA] bg-white text-[#0D0C22] placeholder:text-[#55576A]/60 focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/15 transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="auth-modal-password"
              className="block text-xs font-medium text-[#0D0C22] mb-1.5"
            >
              {t('auth.passwordLabel', 'Kata sandi')}
            </label>
            <input
              id="auth-modal-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full h-10 px-3 text-sm rounded-lg border border-[#E1E3EA] bg-white text-[#0D0C22] placeholder:text-[#55576A]/60 focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/15 transition-colors disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 mt-1 rounded-lg bg-[#155DFC] hover:bg-[#1248C7] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#155DFC] focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{t('auth.processing', 'Memproses...')}</span>
              </>
            ) : (
              <span>{t('auth.submitButton', 'Masuk')}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#E1E3EA] flex items-center justify-between text-xs text-[#55576A]">
          <span>{t('auth.noAccount', 'Belum punya akun?')}</span>
          <Link
            href={fullSignUpUrl}
            onClick={onClose}
            className="font-medium text-[#155DFC] hover:underline"
          >
            {t('auth.signUpLink', 'Daftar')}
          </Link>
        </div>
      </div>
    </div>
  );
}
