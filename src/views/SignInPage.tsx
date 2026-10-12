'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthBanner } from '@/components/auth/AuthBanner';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import { ActivePage, AuthState } from '@/types';

function sanitizeRedirect(url: string | null): string | null {
  if (!url) return null;
  if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return null;
  if (url.startsWith('/sign-in') || url.startsWith('/sign-up')) return null;
  return url;
}

interface Props {
  onNavigate?: (page: ActivePage) => void;
  onLoginSuccess?: (user: NonNullable<AuthState['user']>) => void;
}

export const SignInPage: React.FC<Props> = ({ onNavigate, onLoginSuccess }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.signIn(email.trim(), password);
    if (!result.success || !result.user) {
      setError(result.error || 'Email atau kata sandi tidak sesuai.');
      setLoading(false);
      return;
    }

    login(result.user);
    onLoginSuccess?.(result.user);

    const safeRedirect = sanitizeRedirect(redirectParam);
    if (safeRedirect) {
      router.push(safeRedirect);
      return;
    }

    if (result.user.role === 'school') {
      onNavigate?.('school-dashboard');
      router.push('/school/dashboard');
      return;
    }

    onNavigate?.('explore');
    router.push('/explore');
  };

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* Left Column: Auth Form */}
      <section className="flex-1 flex flex-col justify-between min-h-screen lg:min-h-0 lg:h-full px-6 py-6 sm:px-10 sm:py-8 lg:px-12 xl:px-16 lg:py-6 xl:py-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-lg hover:opacity-85 transition-opacity"
            aria-label="Creatorin"
          >
            <img src="/creatorin/logo.svg" alt="" className="h-7 w-8 object-contain" />
            <span className="font-display text-xl font-bold text-[#0D0C22]">Creatorin</span>
          </button>
        </div>

        {/* Center Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-1">
          <h1 className="font-display text-2xl sm:text-[30px] font-bold text-[#0D0C22] tracking-[-0.0135em] leading-tight">
            Selamat datang kembali.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#737373] leading-relaxed">
            Masuk ke akun Creatorin Anda untuk melanjutkan.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-3.5 flex gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEE4E2] p-2.5 text-xs text-[#912018]"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D92D20]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="mt-4 sm:mt-5 space-y-3">
            <div>
              <label htmlFor="signin-email" className="block text-xs font-semibold text-[#262626]">
                Email Address <span className="text-[#FF2056]">*</span>
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1A1] pointer-events-none" />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl bg-[#F3F4F6] border border-transparent pl-10 pr-4 text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1] transition-all focus:bg-white focus:border-[#155DFC] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(21,93,252,0.20)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signin-password" className="block text-xs font-semibold text-[#262626]">
                Password <span className="text-[#FF2056]">*</span>
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1A1] pointer-events-none" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl bg-[#F3F4F6] border border-transparent pl-10 pr-11 text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1] transition-all focus:bg-white focus:border-[#155DFC] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(21,93,252,0.20)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A1A1A1] hover:text-[#0D0C22] transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded-[3px] border border-[#767676] bg-white peer-checked:bg-[#155DFC] peer-checked:border-[#155DFC] flex items-center justify-center transition-colors">
                  {rememberMe && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <span className="text-xs text-[#525252]">Ingat saya</span>
              </label>

              <button
                type="button"
                className="text-xs font-semibold text-[#155DFC] hover:underline transition-colors"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="h-11 sm:h-12 w-full rounded-xl bg-[#155DFC] px-5 text-xs sm:text-sm font-semibold text-white hover:bg-[#1248C7] active:bg-[#0E3A9E] shadow-[0px_2px_4px_-2px_rgba(21,93,252,0.2),0px_4px_6px_-1px_rgba(21,93,252,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memeriksa akun…</span>
                  </>
                ) : (
                  'Masuk Akun'
                )}
              </button>
            </div>
          </form>

          {/* Switch link */}
          <p className="mt-4 sm:mt-5 text-center text-xs text-[#737373]">
            Belum memiliki akun?{' '}
            <button
              type="button"
              onClick={() => {
                const safe = sanitizeRedirect(redirectParam);
                router.push(safe ? `/sign-up?redirect=${encodeURIComponent(safe)}` : '/sign-up');
              }}
              className="font-semibold text-[#155DFC] hover:underline"
            >
              Daftar sekarang
            </button>
          </p>

          {/* Supported By Section */}
          <div className="mt-5 sm:mt-6 pt-4 border-t border-[#F5F5F5] flex flex-col items-center gap-2">
            <span className="text-xs font-bold tracking-[0.06em] text-[#A1A1A1] uppercase">
              Didukung oleh
            </span>
            <div className="flex items-center justify-center gap-5 sm:gap-6">
              <img
                src="/brand/partner-logo-1.png"
                alt="Partner Logo 1"
                className="h-6 w-auto object-contain max-w-[84px]"
              />
              <img
                src="/brand/partner-logo-2.png"
                alt="Partner Logo 2"
                className="h-8 w-auto object-contain max-w-[180px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <p className="text-xs text-[#A1A1A1] text-center">
            © 2026 Creatorin. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </section>

      {/* Right Column: Hero Graphic Banner */}
      <AuthBanner />
    </main>
  );
};
