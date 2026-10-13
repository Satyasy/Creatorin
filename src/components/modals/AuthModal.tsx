'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Lock, Mail, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
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
  title = 'Masuk ke Akun Creatorin',
  description = 'Masuk untuk melanjutkan tindakan ini dan membuka akses ke seluruh fitur kolaborasi.',
  onSuccess,
  redirectUrl,
}: AuthModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

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
      setError('Harap masukkan email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.signIn(email.trim(), password);
      if (!result.success || !result.user) {
        setError(result.error || 'Email atau kata sandi tidak valid.');
        setIsLoading(false);
        return;
      }

      login(result.user);
      onSuccess?.(result.user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala jaringan.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup dialog autentikasi"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:outline-hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#155DFC] flex items-center justify-center ring-4 ring-blue-50/60">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
              {title}
            </h2>
          </div>
        </div>

        <p id="auth-modal-description" className="text-xs sm:text-sm text-neutral-600 mt-1 mb-5 leading-relaxed">
          {description}
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2.5 p-3 rounded-xl border border-red-200 bg-red-50 text-xs sm:text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="auth-modal-email" className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address
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
                Kata Sandi
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
            className="w-full h-11 mt-2 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] active:scale-[0.99] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#155DFC] focus-visible:outline-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <span>Belum memiliki akun?</span>
          <Link
            href={fullSignUpUrl}
            onClick={onClose}
            className="font-semibold text-[#155DFC] hover:underline flex items-center gap-1"
          >
            <span>Daftar Akun Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
