'use client';

import { useState } from 'react';
import { DEMO_USERS, DEMO_DESTINATIONS } from '@/lib/demo-users';

const ROLE_META: Record<string, { label: string; description: string; icon: string; color: string }> = {
  school: {
    label: 'Sekolah / SMK',
    description: 'Guru pembimbing & koordinator vokasi. Akses approval siswa, rubrik penilaian, dan profil publik sekolah.',
    icon: '🏫',
    color: 'border-[#155DFC] bg-[#E8F0FF] text-[#0D2A75]',
  },
  creator: {
    label: 'Kreator',
    description: 'Kreator konten dan desainer. Akses brief proyek, proposal, dan portofolio.',
    icon: '🎨',
    color: 'border-[#03ACFD] bg-[#E1F6FF] text-[#07557D]',
  },
  umkm: {
    label: 'UMKM / Bisnis',
    description: 'Pemilik usaha yang mencari kreator. Akses pembuatan brief, seleksi proposal, dan manajemen proyek.',
    icon: '🏪',
    color: 'border-[#16803C] bg-[#DCFCE7] text-[#14532D]',
  },
};

export default function DemoPage() {
  const [loading, setLoading] = useState<string | null>(null);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC]">
        <div className="max-w-sm rounded-xl border border-[#E1E3EA] bg-white p-8 text-center">
          <p className="text-sm font-medium text-[#55576A]">Demo mode hanya tersedia saat development.</p>
        </div>
      </div>
    );
  }

  const activate = (role: string) => {
    setLoading(role);
    window.location.href = `/api/auth/demo?role=${role}`;
  };

  const exit = () => {
    setLoading('exit');
    window.location.href = '/api/auth/demo?' + new URLSearchParams({ role: '' }).toString();
    // Simply clear the cookie client-side and go home
    document.cookie = 'creatorin_demo_role=; path=/; max-age=0';
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border border-[#FDE68A] bg-[#FFF4D6] px-3 py-1 text-xs font-semibold text-[#7A2E0E]">
            🛠 Mode Development
          </span>
          <h1 className="mt-3 font-['DM_Sans'] text-2xl font-semibold text-[#0D0C22]">
            Demo Mode Creatorin
          </h1>
          <p className="mt-2 text-sm text-[#55576A]">
            Pilih role untuk langsung masuk ke dashboard tanpa login. Cookie demo berlaku 1 jam.
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {Object.entries(ROLE_META).map(([role, meta]) => {
            const user = DEMO_USERS[role];
            const dest = DEMO_DESTINATIONS[role];
            const isLoading = loading === role;
            return (
              <button
                key={role}
                onClick={() => activate(role)}
                disabled={loading !== null}
                className={`group w-full rounded-xl border-2 p-5 text-left transition-all hover:shadow-[0_4px_12px_rgba(13,12,34,0.10)] disabled:opacity-60 ${meta.color}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-['DM_Sans'] text-base font-semibold text-[#0D0C22]">
                        {meta.label}
                      </span>
                      <span className="shrink-0 text-xs font-mono text-[#55576A]">
                        {isLoading ? '↗ Mengalihkan…' : `→ ${dest}`}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#55576A] leading-relaxed">
                      {meta.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-[#B7BBC9]">
                      <span>👤 {user.name}</span>
                      <span>·</span>
                      <span>✉ {user.email}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Exit & info */}
        <div className="mt-6 rounded-xl border border-[#E1E3EA] bg-white p-4">
          <p className="text-xs text-[#55576A] leading-relaxed">
            <strong className="font-semibold text-[#0D0C22]">Cara kerja:</strong> Mengaktifkan demo
            menyimpan cookie <code className="rounded bg-[#F3F3F4] px-1 py-0.5 font-mono text-[#155DFC]">creatorin_demo_role</code> di browser.
            AuthProvider membaca cookie ini dan inject user tanpa memanggil{' '}
            <code className="rounded bg-[#F3F3F4] px-1 py-0.5 font-mono text-[10px]">/api/auth/me</code>.
            Cookie otomatis expired dalam 1 jam, atau hapus manual lewat DevTools → Application → Cookies.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[#B7BBC9]">
              Hanya berjalan saat <code className="font-mono">NODE_ENV=development</code>
            </span>
            <button
              onClick={exit}
              disabled={loading !== null}
              className="rounded-lg border border-[#E1E3EA] px-3 py-1.5 text-xs font-semibold text-[#55576A] transition-colors hover:border-[#FCA5A5] hover:bg-[#FEE4E2] hover:text-[#D92D20] disabled:opacity-50"
            >
              Keluar dari demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
