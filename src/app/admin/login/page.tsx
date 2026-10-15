'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, BriefcaseBusiness, Loader2, Lock, Mail, ShieldCheck, UsersRound } from 'lucide-react';

const accessPoints = [
  { icon: ShieldCheck, label: 'Akses admin', text: 'Masuk hanya dengan akun yang punya role administrator.' },
  { icon: UsersRound, label: 'Kontrol pengguna', text: 'Kelola peran creator, UMKM, sekolah, dan admin dari satu panel.' },
  { icon: BriefcaseBusiness, label: 'Operasi platform', text: 'Pantau brief, invoice, dan verifikasi sekolah secara terpusat.' },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'creatorin.my.id') {
      window.location.replace('https://api.creatorin.my.id/admin/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login gagal. Periksa kembali email dan kata sandi.');
      }

      if (data.user?.role !== 'admin' && data.user?.email !== 'admin@creatorin.my.id') {
        throw new Error('Akses ditolak. Akun ini tidak memiliki hak akses administrator.');
      }

      if (data.session?.accessToken) {
        localStorage.setItem('creatorin_token', data.session.accessToken);
        localStorage.setItem('creatorin_access_token', data.session.accessToken);
        localStorage.setItem('creatorin_role', data.user.role);
      }

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FC] px-4 py-6 text-[#0D0C22] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#155DFC] text-white shadow-[0_4px_12px_rgba(13,12,34,0.10)]">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-[#0D0C22]">Creatorin</p>
              <p className="text-sm font-medium text-[#55576A]">Admin workspace</p>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="font-display text-5xl font-semibold leading-[1.08] text-[#0D0C22]">
              Panel kendali untuk menjaga alur kolaborasi tetap jelas.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#55576A]">
              Masuk untuk memantau aktivitas platform, meninjau akun, dan menjaga kualitas data operasional Creatorin.
            </p>
          </div>

          <div className="mt-10 grid max-w-xl gap-3">
            {accessPoints.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex gap-4 rounded-2xl border border-[#E1E3EA] bg-white p-4 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F0FF] text-[#155DFC]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0D0C22]">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[#55576A]">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#155DFC] text-white">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-[#0D0C22]">Creatorin</p>
              <p className="text-sm font-medium text-[#55576A]">Admin workspace</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1E3EA] bg-white p-6 shadow-[0_16px_40px_rgba(13,12,34,0.08)] sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-semibold text-[#155DFC]">Masuk admin</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-10 text-[#0D0C22]">Kelola Creatorin</h2>
              <p className="mt-2 text-sm leading-6 text-[#55576A]">
                Gunakan kredensial administrator yang sudah terdaftar.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#FEE4E2] bg-[#FEE4E2] p-3 text-sm text-[#912018]" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-[#0D0C22]">
                  Email administrator
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#55576A]" aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@creatorin.my.id"
                    className="h-12 w-full rounded-xl border border-[#B7BBC9] bg-white pl-10 pr-4 text-sm text-[#0D0C22] placeholder:text-[#6F7285] outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-[#0D0C22]">
                  Kata sandi
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#55576A]" aria-hidden="true" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="h-12 w-full rounded-xl border border-[#B7BBC9] bg-white pl-10 pr-4 text-sm text-[#0D0C22] placeholder:text-[#6F7285] outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(13,12,34,0.10)] transition hover:bg-[#1248C7] active:bg-[#0E3A9E] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Memeriksa akses</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke dashboard</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 border-t border-[#E1E3EA] pt-5 text-center text-sm text-[#55576A]">
              Halaman ini khusus untuk pengelola platform Creatorin.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
