'use client';

import React, { useState } from 'react';
import { AlertCircle, BriefcaseBusiness, Eye, EyeOff, Palette, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import { ActivePage, AuthState, UserRole } from '@/types';

interface Props {
  onNavigate?: (page: ActivePage) => void;
  onLoginSuccess?: (user: NonNullable<AuthState['user']>) => void;
}

export const SignUpPage: React.FC<Props> = ({ onNavigate, onLoginSuccess }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('umkm');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await authService.signUp({ fullName: name.trim(), email: email.trim(), password, role });
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
    onNavigate?.('explore');
    router.push('/explore');
  };

  return (
    <main className="relative grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)] overflow-hidden font-sans">
      {/* Ambient Radial Mesh Glows */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-gradient-to-br from-blue-500/15 via-sky-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/10 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Form Section */}
      <section className="relative flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12 z-10">
        <div className="w-full max-w-lg">
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

          {/* Glassmorphic Form Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(13,12,34,0.06)]">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Daftar akun Creatorin
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Pilih peran kerja untuk menyesuaikan fitur, workspace, dan kontrak proyek Anda.
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

            {/* Role Selection Tabs */}
            <fieldset className="mt-6">
              <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                Pilih Peran Akun
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole('umkm')}
                  aria-pressed={role === 'umkm'}
                  className={`min-h-20 rounded-2xl border p-4 text-left cursor-pointer transition-all duration-200 ${
                    role === 'umkm'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <BriefcaseBusiness className={`h-5 w-5 ${role === 'umkm' ? 'text-blue-600' : 'text-slate-500'}`} />
                    {role === 'umkm' && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </div>
                  <span className="mt-2 block text-sm font-bold text-slate-900">UMKM / Bisnis</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Buka brief & rekrut kreator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  aria-pressed={role === 'creator'}
                  className={`min-h-20 rounded-2xl border p-4 text-left cursor-pointer transition-all duration-200 ${
                    role === 'creator'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Palette className={`h-5 w-5 ${role === 'creator' ? 'text-blue-600' : 'text-slate-500'}`} />
                    {role === 'creator' && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </div>
                  <span className="mt-2 block text-sm font-bold text-slate-900">Creator Freelance</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Tawarkan jasa & lamar brief</span>
                </button>
              </div>
            </fieldset>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  {role === 'umkm' ? 'Nama Usaha / Bisnis' : 'Nama Lengkap'}
                </label>
                <input
                  id="signup-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'umkm' ? 'Contoh: Kopi Lereng Nusantara' : 'Nama Lengkap Anda'}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Alamat Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/15"
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
                type="submit"
                disabled={loading}
                className="h-12 w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Menyiapkan akun…</span>
                ) : (
                  <>
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Sudah memiliki akun?{' '}
                <button
                  onClick={() => router.push('/sign-in')}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dengan mendaftar, Anda menyetujui{' '}
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

      {/* Right Column: Premium Dark Aside */}
      <aside className="relative hidden bg-gradient-to-br from-[#0B1528] via-[#090D18] to-[#040810] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Accent */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold block">Kolaborasi Terpercaya</span>
            <span className="text-[11px] text-slate-400 block">Ekosistem Industri Kreatif Digital</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto py-8">
          <h2 className="font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
            Kerja kreatif yang transparan sejak brief pertama disepakati.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            UMKM memperoleh kepastian ruang kerja dan proteksi pembayaran escrow. Creator membangun reputasi, Career Score, dan portofolio nyata dari setiap proyek selesai.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Sistem pembayaran Escrow yang aman & transparan',
              'Alur revisi tercatat otomatis di invoice resmi',
              'Sinergi dengan SMK mitra vokasi dan talenta bersertifikasi',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>Akun Sekolah Vokasi dikurasi resmi oleh Creatorin</span>
          <span className="font-medium text-slate-300">© 2026 Creatorin</span>
        </div>
      </aside>
    </main>
  );
};
