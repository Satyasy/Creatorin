'use client';

import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import { ActivePage, AuthState } from '@/types';

interface Props {
  onNavigate?: (page: ActivePage) => void;
  onLoginSuccess?: (user: NonNullable<AuthState['user']>) => void;
}

export const SignInPage: React.FC<Props> = ({ onNavigate, onLoginSuccess }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    onNavigate?.('explore');
    router.push('/explore');
  };

  return (
    <main className="relative grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)] overflow-hidden font-sans">
      {/* Ambient Radial Mesh Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/15 via-sky-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-indigo-500/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Form Section */}
      <section className="relative flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 z-10">
        <div className="w-full max-w-md">
          {/* Brand Logo */}
          <button
            onClick={() => router.push('/')}
            className="mb-8 inline-flex items-center gap-2.5 rounded-xl text-slate-900 group cursor-pointer transition-transform active:scale-95"
          >
            <div className="relative">
              <img src="/creatorin/logo.svg" alt="Creatorin" className="h-9 w-10 transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm pointer-events-none" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Creatorin</span>
          </button>

          {/* Card Container with subtle gradient & glassmorphism */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(13,12,34,0.06)]">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Masuk ke akun Anda
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola brief, pesan, invoice, dan progres proyek dalam satu alur kerja terpadu.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 animate-in fade-in"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/15"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="signin-password" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kata sandi
                  </label>
                  <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="h-12 w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Memeriksa akun…</span>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Belum memiliki akun?{' '}
                <button
                  onClick={() => router.push('/sign-up')}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dengan masuk, Anda menyetujui{' '}
                <button onClick={() => router.push('/terms')} className="underline hover:text-slate-600 cursor-pointer">
                  syarat layanan
                </button>{' '}
                dan{' '}
                <button onClick={() => router.push('/privacy')} className="underline hover:text-slate-600 cursor-pointer">
                  kebijakan privasi
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Premium Dark Aside with Ambient Glow & Escrow Showcase */}
      <aside className="relative hidden bg-gradient-to-br from-[#0B1528] via-[#090D18] to-[#040810] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold block">Creatorin Escrow</span>
            <span className="text-[11px] text-slate-400 block">Jaminan Keamanan Finansial</span>
          </div>
        </div>

        {/* Center Copy & Card */}
        <div className="relative z-10 my-auto py-8">
          <h2 className="font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
            Dana dan hasil kerja berada dalam alur perlindungan yang sama.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            Koin masuk escrow otomatis setelah invoice disepakati. Creator menerima pembayaran utuh tepat saat UMKM menyetujui hasil akhir.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Nilai Konversi Resmi
              </span>
              <span className="font-mono font-bold text-emerald-400">1 Koin = Rp 1.000</span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>Enkripsi TLS 1.3 &bull; PostgreSql 17</span>
          <span className="font-medium text-slate-300">Platform Resmi Kreator Indonesia</span>
        </div>
      </aside>
    </main>
  );
};
