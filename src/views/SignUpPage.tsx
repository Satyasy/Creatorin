'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Palette,
  User,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthBanner } from '@/components/auth/AuthBanner';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import { ActivePage, AuthState, UserRole } from '@/types';

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

export const SignUpPage: React.FC<Props> = ({ onNavigate, onLoginSuccess }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('umkm');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!termsAccepted) {
      setError('Harap setujui Ketentuan Layanan dan Kebijakan Privasi untuk melanjutkan.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await authService.signUp({
      fullName: name.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (!result.success || !result.user) {
      setError(result.error || 'Gagal mendaftar akun.');
      setLoading(false);
      return;
    }

    if (result.requiresConfirmation) {
      setError('Akun dibuat. Periksa email untuk mengonfirmasi akun, lalu masuk.');
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
      <section className="flex-1 flex flex-col justify-between min-h-screen lg:min-h-0 lg:h-full px-6 py-5 sm:px-10 sm:py-6 lg:px-12 xl:px-16 lg:py-4 xl:py-6">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-3">
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
        <div className="w-full max-w-[420px] mx-auto my-auto py-0.5">
          <h1 className="font-display text-2xl sm:text-[28px] font-bold text-[#0D0C22] tracking-[-0.0135em] leading-tight">
            Buat akun baru.
          </h1>
          <p className="mt-1 text-xs text-[#737373] leading-relaxed">
            Bergabunglah bersama Creatorin dan mulai kolaborasi kreatif impian Anda.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-2.5 flex gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEE4E2] p-2 text-xs text-[#912018]"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D92D20]" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Type Selector (Figma Node 5327:1069) */}
          <div className="mt-2.5 sm:mt-3">
            <label className="block text-xs font-semibold text-[#262626]">
              Pilih Tipe Akun <span className="text-[#FF2056]">*</span>
            </label>
            <div className="mt-1 p-1 bg-[#F3F4F6] rounded-xl grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setRole('umkm')}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  role === 'umkm'
                    ? 'bg-white text-[#0D0C22] shadow-sm'
                    : 'bg-transparent text-[#525252] hover:text-[#0D0C22]'
                }`}
              >
                <Briefcase
                  className={`w-3.5 h-3.5 ${role === 'umkm' ? 'text-[#155DFC]' : 'text-[#737373]'}`}
                />
                <span>Rekruter / UMKM</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  role === 'creator'
                    ? 'bg-white text-[#0D0C22] shadow-sm'
                    : 'bg-transparent text-[#525252] hover:text-[#0D0C22]'
                }`}
              >
                <Palette
                  className={`w-3.5 h-3.5 ${role === 'creator' ? 'text-[#155DFC]' : 'text-[#737373]'}`}
                />
                <span>Kandidat / Kreator</span>
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="mt-2.5 sm:mt-3 space-y-2 sm:space-y-2.5">
            {/* Name Input */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-[#262626]">
                {role === 'umkm' ? 'Nama Brand / Perusahaan' : 'Nama Lengkap'}{' '}
                <span className="text-[#FF2056]">*</span>
              </label>
              <div className="relative mt-0.5 sm:mt-1">
                {role === 'umkm' ? (
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1A1] pointer-events-none" />
                ) : (
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1A1] pointer-events-none" />
                )}
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === 'umkm'
                      ? 'Contoh: PT Kriya Mandiri Kreatif'
                      : 'Contoh: Sarah Azhari'
                  }
                  className="h-9 sm:h-10 w-full rounded-xl bg-[#F3F4F6] border border-transparent pl-9 pr-3 text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1] transition-all focus:bg-white focus:border-[#155DFC] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(21,93,252,0.20)]"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-[#262626]">
                Email Address <span className="text-[#FF2056]">*</span>
              </label>
              <div className="relative mt-0.5 sm:mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1A1] pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-9 sm:h-10 w-full rounded-xl bg-[#F3F4F6] border border-transparent pl-9 pr-3 text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1] transition-all focus:bg-white focus:border-[#155DFC] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(21,93,252,0.20)]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-[#262626]">
                Kata Sandi <span className="text-[#FF2056]">*</span>
              </label>
              <div className="relative mt-0.5 sm:mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1A1] pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="h-9 sm:h-10 w-full rounded-xl bg-[#F3F4F6] border border-transparent pl-9 pr-10 text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1] transition-all focus:bg-white focus:border-[#155DFC] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(21,93,252,0.20)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#A1A1A1] hover:text-[#0D0C22] transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-0.5">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-3.5 h-3.5 rounded-[3px] border border-[#767676] bg-white peer-checked:bg-[#155DFC] peer-checked:border-[#155DFC] flex items-center justify-center transition-colors shrink-0 mt-0.5">
                  {termsAccepted && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
                <span className="text-[11px] sm:text-xs text-[#525252] leading-tight">
                  Saya menyetujui{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/terms')}
                    className="font-semibold text-[#155DFC] hover:underline"
                  >
                    Ketentuan Layanan
                  </button>{' '}
                  dan{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/privacy')}
                    className="font-semibold text-[#155DFC] hover:underline"
                  >
                    Kebijakan Privasi
                  </button>{' '}
                  Creatorin.
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-0.5 sm:pt-1">
              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="h-10 sm:h-11 w-full rounded-xl bg-[#155DFC] px-4 text-xs sm:text-sm font-semibold text-white hover:bg-[#1248C7] active:bg-[#0E3A9E] shadow-[0px_2px_4px_-2px_rgba(21,93,252,0.2),0px_4px_6px_-1px_rgba(21,93,252,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat akun…</span>
                  </>
                ) : (
                  'Buat Akun Baru'
                )}
              </button>
            </div>
          </form>

          {/* Switch link */}
          <p className="mt-2.5 sm:mt-3 text-center text-xs text-[#737373]">
            Sudah memiliki akun?{' '}
            <button
              type="button"
              onClick={() => {
                const safe = sanitizeRedirect(redirectParam);
                router.push(safe ? `/sign-in?redirect=${encodeURIComponent(safe)}` : '/sign-in');
              }}
              className="font-semibold text-[#155DFC] hover:underline"
            >
              Masuk sekarang
            </button>
          </p>

          {/* Supported By Section */}
          <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-[#F5F5F5] flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#A1A1A1] uppercase">
              Didukung oleh
            </span>
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              <img
                src="/brand/partner-logo-1.png"
                alt="Partner Logo 1"
                className="h-5 sm:h-5.5 w-auto object-contain max-w-[76px]"
              />
              <img
                src="/brand/partner-logo-2.png"
                alt="Partner Logo 2"
                className="h-6.5 sm:h-7.5 w-auto object-contain max-w-[160px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-0.5">
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
