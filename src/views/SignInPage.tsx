'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { AuthState, ActivePage } from '@/types';
import { 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SignInPageProps {
  onNavigate?: (page: ActivePage) => void;
  onLoginSuccess?: (user: NonNullable<AuthState['user']>) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setErrorMessage('Silakan masukkan email atau nama pengguna.');
      return;
    }

    const inputLower = emailOrUsername.toLowerCase();
    const isCreator = inputLower.includes('creator') || inputLower.includes('maya');
    const mockUser: NonNullable<AuthState['user']> = {
      name: isCreator ? 'Maya Angelina' : (emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : 'Qaysar Aqeel'),
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@creatorin.id`,
      role: isCreator ? 'creator' : 'umkm',
      creatorCategory: isCreator ? 'Video' : undefined,
      avatar: isCreator
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80'
    };

    login(mockUser);
    if (onLoginSuccess) onLoginSuccess(mockUser);
    if (onNavigate) onNavigate('explore');
    else router.push('/explore');
  };

  const handleGoogleQuickAuth = () => {
    const mockUser: NonNullable<AuthState['user']> = {
      name: 'Qaysar Aqeel',
      email: 'qaysaraqeel71@gmail.com',
      role: 'umkm',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80'
    };
    login(mockUser);
    if (onLoginSuccess) onLoginSuccess(mockUser);
    if (onNavigate) onNavigate('explore');
    else router.push('/explore');
  };

  return (
    <div className="min-h-screen w-full flex bg-white text-[#0d0c22] font-sans antialiased selection:bg-[#0d0c22] selection:text-white">
      
      {/* SISI KIRI: Form Bersih & Minimalis Ala Dribbble */}
      <div className="w-full lg:w-[68%] xl:w-[72%] min-h-screen flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-20 overflow-y-auto">
        
        {/* Konten Form Terpusat */}
        <div className="w-full max-w-[420px] mx-auto py-8 text-center">
          
          {/* Ikon Emblem Dribbble Style */}
          <div className="mb-6 flex justify-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform hover:scale-105">
              <svg className="w-8 h-8 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#0d0c22] tracking-tight mb-7">
            Selamat datang kembali
          </h1>

          {/* Pesan Error Jika Ada */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tombol Cepat Google (1-Tap Account Card persis referensi) */}
          <button
            type="button"
            onClick={handleGoogleQuickAuth}
            className="w-full p-2.5 px-4 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50/80 transition-all flex items-center justify-between shadow-2xs group cursor-pointer mb-5 text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200"
              />
              <div className="leading-tight">
                <div className="text-xs font-semibold text-[#0d0c22]">Lanjutkan sebagai Qaysar</div>
                <div className="text-[11px] text-neutral-400 font-normal">qaysaraqeel71@gmail.com</div>
              </div>
            </div>
            {/* Google Icon */}
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
          </button>

          {/* Pemisah 'atau' */}
          <div className="text-center my-5">
            <span className="text-xs text-neutral-400 font-normal">atau</span>
          </div>

          {/* Form Login Sederhana */}
          {isForgotPassword ? (
            <div className="space-y-4 text-left">
              <p className="text-xs text-neutral-600 text-center">
                Masukkan email Anda dan kami akan mengirimkan tautan reset kata sandi.
              </p>
              <div>
                <input
                  type="email"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-2xl focus:outline-hidden focus:border-[#0d0c22] focus:ring-1 focus:ring-[#0d0c22] transition-all placeholder:text-neutral-400 text-[#0d0c22]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  alert('Tautan reset kata sandi telah dikirim ke ' + (emailOrUsername || 'email Anda'));
                  setIsForgotPassword(false);
                }}
                className="w-full py-3.5 bg-[#0d0c22] hover:bg-[#2e2d4d] text-white text-sm font-medium rounded-full cursor-pointer transition shadow-xs"
              >
                Kirim Tautan Reset
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-center text-xs text-neutral-500 hover:text-[#0d0c22] cursor-pointer"
              >
                Kembali ke halaman masuk
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {/* Input Email / Username */}
              <div>
                <input
                  type="text"
                  id="signin-email-input"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Masukkan email atau nama pengguna"
                  required
                  className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-2xl focus:outline-hidden focus:border-[#0d0c22] focus:ring-1 focus:ring-[#0d0c22] transition-all placeholder:text-neutral-400 text-[#0d0c22]"
                />
              </div>

              {/* Input Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full px-4 pr-11 py-3 text-sm bg-white border border-neutral-200 rounded-2xl focus:outline-hidden focus:border-[#0d0c22] focus:ring-1 focus:ring-[#0d0c22] transition-all placeholder:text-neutral-400 text-[#0d0c22]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-hidden cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Lupa Kata Sandi */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[11px] text-neutral-400 hover:text-[#0d0c22] transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* Tombol Lanjutkan */}
              <button
                type="submit"
                id="signin-submit-btn"
                className="w-full mt-2 py-3.5 bg-[#0d0c22] hover:bg-[#2b2a45] text-white text-sm font-medium rounded-full transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Lanjutkan</span>
              </button>
            </form>
          )}

          {/* Persetujuan Ketentuan Layanan */}
          <p className="text-[11px] text-neutral-400 mt-6 leading-relaxed">
            Dengan melanjutkan, Anda menyetujui{' '}
            <a href="#" className="underline hover:text-[#0d0c22]">Ketentuan</a> dan{' '}
            <a href="#" className="underline hover:text-[#0d0c22]">Kebijakan Privasi</a> kami.
          </p>

          {/* Link Daftar */}
          <div className="mt-8">
            <p className="text-xs text-neutral-500">
              Belum punya akun?{' '}
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('signup');
                  else router.push('/sign-up');
                }}
                className="text-[#0d0c22] font-semibold hover:underline cursor-pointer ml-0.5"
              >
                Daftar
              </button>
            </p>
          </div>

        </div>

      </div>

      {/* SISI KANAN: Visual Kreatif Artistik 3D Penuh (Persis Gambar Dribbble) */}
      <div className="hidden lg:block lg:w-[32%] xl:w-[28%] min-h-screen relative overflow-hidden bg-[#0a071b]">
        
        {/* Background Image High Aesthetic (Vibrant Neon 3D World) */}
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85"
          alt="Visual Kreatif Creatorin"
          className="w-full h-full object-cover opacity-95"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Verified Score Tag on Artwork */}
        <div className="absolute top-10 right-10 bg-black/40 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-white text-xs font-medium flex items-center gap-2 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Verified Creator Universe</span>
        </div>

        {/* Creator Credit di Pojok Kanan Bawah (persis @glebich pada Dribbble) */}
        <div className="absolute bottom-8 right-8 z-10">
          <a
            href="https://dribbble.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white text-xs font-normal tracking-wide transition-colors drop-shadow-md"
          >
            @creatorin.studio
          </a>
        </div>

      </div>

    </div>
  );
};
