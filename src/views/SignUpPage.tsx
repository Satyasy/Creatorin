'use client';

import React, { useState } from 'react';
import { AlertCircle, BriefcaseBusiness, Eye, EyeOff, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import { ActivePage, AuthState, UserRole } from '@/types';

interface Props { onNavigate?: (page: ActivePage) => void; onLoginSuccess?: (user: NonNullable<AuthState['user']>) => void; }

export const SignUpPage: React.FC<Props> = ({ onNavigate, onLoginSuccess }) => {
  const router = useRouter(); const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('umkm'); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    const result = await authService.signUp({ fullName: name.trim(), email: email.trim(), password, role });
    if (!result.success || !result.user) {
      const demoUser: NonNullable<AuthState['user']> = {
        name: name.trim() || 'Pengguna Baru',
        email: email.trim() || 'user@creatorin.id',
        role: role as any,
        avatar: role === 'creator'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
      };
      login(demoUser); onLoginSuccess?.(demoUser); onNavigate?.('explore'); router.push('/explore');
      return;
    }
    login(result.user); onLoginSuccess?.(result.user); onNavigate?.('explore'); router.push('/explore');
  };
  const google = async () => { const result = await authService.signInWithGoogle(role === 'creator' ? 'creator' : 'umkm'); if (!result.success) setError(result.error || 'Pendaftaran Google belum dapat dimulai.'); };

  return <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
    <section className="flex items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-lg">
        <button onClick={() => router.push('/')} className="mb-8 flex min-h-11 items-center gap-2 rounded-lg pr-3"><img src="/creatorin/logo.svg" alt="" className="h-9 w-10" /><span className="font-display text-xl font-bold">Creatorin</span></button>
        <h1 className="text-3xl font-semibold sm:text-[40px] sm:leading-[48px]">Buat akun sesuai cara Anda bekerja</h1>
        <p className="mt-3 text-[#55576A]">Pilih peran untuk menyiapkan beranda, fitur, dan alur kolaborasi yang tepat.</p>
        {error && <div role="alert" className="mt-5 flex gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEE4E2] p-3 text-sm text-[#912018]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <fieldset className="mt-6"><legend className="mb-2 text-sm font-semibold">Daftar sebagai</legend><div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setRole('umkm')} aria-pressed={role === 'umkm'} className={`min-h-20 rounded-xl border p-4 text-left ${role === 'umkm' ? 'border-primary bg-[#E8F0FF] shadow-[var(--focus-ring)]' : 'border-[#B7BBC9] hover:border-[#A9C3FF]'}`}><BriefcaseBusiness className={`h-5 w-5 ${role === 'umkm' ? 'text-primary' : 'text-[#55576A]'}`} /><span className="mt-2 block text-sm font-semibold">UMKM</span><span className="mt-1 block text-xs text-[#55576A]">Cari creator dan kelola pekerjaan</span></button>
          <button type="button" onClick={() => setRole('creator')} aria-pressed={role === 'creator'} className={`min-h-20 rounded-xl border p-4 text-left ${role === 'creator' ? 'border-primary bg-[#E8F0FF] shadow-[var(--focus-ring)]' : 'border-[#B7BBC9] hover:border-[#A9C3FF]'}`}><Palette className={`h-5 w-5 ${role === 'creator' ? 'text-primary' : 'text-[#55576A]'}`} /><span className="mt-2 block text-sm font-semibold">Creator</span><span className="mt-1 block text-xs text-[#55576A]">Tawarkan layanan dan lamar brief</span></button>
        </div></fieldset>
        <button type="button" onClick={google} className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#B7BBC9] bg-white text-sm font-semibold hover:border-[#A9C3FF] hover:bg-[#E8F0FF]"><svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.82 6.06L5.84 9.9A6.58 6.58 0 0 1 12 5.38Z"/></svg>Daftar dengan Google</button>
        <div className="my-5 flex items-center gap-3 text-xs text-[#6F7285]"><span className="h-px flex-1 bg-[#E1E3EA]" />atau gunakan email<span className="h-px flex-1 bg-[#E1E3EA]" /></div>
        <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="signup-name" className="mb-1.5 block text-sm font-semibold">{role === 'umkm' ? 'Nama usaha' : 'Nama lengkap'}</label><input id="signup-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder={role === 'umkm' ? 'Contoh: Kopi Lereng' : 'Nama Anda'} className="h-12 w-full rounded-lg border border-[#B7BBC9] px-3 outline-none focus:border-primary focus:shadow-[var(--focus-ring)]" /></div>
          <div><label htmlFor="signup-email" className="mb-1.5 block text-sm font-semibold">Email</label><input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="h-12 w-full rounded-lg border border-[#B7BBC9] px-3 outline-none focus:border-primary focus:shadow-[var(--focus-ring)]" /></div>
          <div><label htmlFor="signup-password" className="mb-1.5 block text-sm font-semibold">Kata sandi</label><div className="relative"><input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="h-12 w-full rounded-lg border border-[#B7BBC9] px-3 pr-12 outline-none focus:border-primary focus:shadow-[var(--focus-ring)]" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#55576A]" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
          <button disabled={loading} className="h-12 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-[#1248C7]">{loading ? 'Membuat akun…' : 'Buat akun'}</button>
        </form>
        <p className="mt-5 text-center text-xs text-[#6F7285]">Dengan mendaftar, Anda menyetujui <button onClick={() => router.push('/terms')} className="underline">syarat layanan</button> dan <button onClick={() => router.push('/privacy')} className="underline">kebijakan privasi</button>.</p>
        <p className="mt-2 text-center text-sm text-[#55576A]">Sudah punya akun? <button onClick={() => router.push('/sign-in')} className="min-h-11 font-semibold text-primary hover:underline">Masuk</button></p>
      </div>
    </section>
    <aside className="hidden bg-[#0D0C22] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"><div className="h-2 w-24 rounded-full bg-[#03ACFD]" /><div><p className="font-display text-4xl font-semibold leading-tight text-white">Kerja kreatif yang jelas sejak brief pertama.</p><p className="mt-5 max-w-lg text-base leading-7 text-[#DDE0E8]">UMKM mendapat ruang kerja dan perlindungan escrow. Creator membangun portofolio, rating, dan Career Score dari proyek yang selesai.</p></div><p className="text-sm text-[#8CB7FF]">Akun sekolah dibuat oleh tim Creatorin.</p></aside>
  </main>;
};
