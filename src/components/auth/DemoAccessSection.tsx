'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Building2, GraduationCap, Loader2, Palette, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { authService, UserSession } from '@/services/authService';
import { useErrorModal } from '@/providers/ErrorModalProvider';

interface Props {
  onSuccess?: (user: UserSession) => void;
  className?: string;
}

export function DemoAccessSection({ onSuccess, className = '' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login } = useAuth();
  const { showErrorModal } = useErrorModal();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleDemoLogin = async (role: 'creator' | 'business' | 'school') => {
    try {
      setLoadingRole(role);
      const res = await authService.signInDemo(role);

      if (!res.success || !res.user) {
        showErrorModal(res.error || 'Gagal masuk sebagai pengguna demo.');
        return;
      }

      login(res.user);
      onSuccess?.(res.user);

      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        router.push(redirectParam);
        return;
      }

      if (role === 'school') {
        router.push('/school/dashboard');
        return;
      }

      router.push('/');
    } catch (err: unknown) {
      showErrorModal(err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className={`mt-5 sm:mt-6 pt-5 border-t border-[#F0F1F5] ${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="w-4 h-4 text-[#155DFC]" />
        <h3 className="text-xs sm:text-sm font-bold text-[#0D0C22] tracking-tight">
          Coba Demo Berdasarkan Role
        </h3>
      </div>
      <p className="text-[11px] sm:text-xs text-[#737373] leading-relaxed mb-3">
        Eksplorasi platform seketika menggunakan persona akun nyata terverifikasi di PostgreSQL.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Demo Creator */}
        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => handleDemoLogin('creator')}
          className="group relative flex flex-col items-start p-2.5 rounded-xl border border-[#E1E3EA] bg-[#F9FAFB] hover:bg-white hover:border-[#155DFC] hover:shadow-xs transition-all text-left disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#155DFC] flex items-center justify-center">
              {loadingRole === 'creator' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Palette className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50/70 px-1.5 py-0.5 rounded">
              Kreator
            </span>
          </div>
          <span className="text-xs font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors">
            Demo Creator
          </span>
          <span className="text-[10px] text-[#737373] line-clamp-1 mt-0.5">
            Portofolio & Escrow
          </span>
        </button>

        {/* Demo UMKM */}
        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => handleDemoLogin('business')}
          className="group relative flex flex-col items-start p-2.5 rounded-xl border border-[#E1E3EA] bg-[#F9FAFB] hover:bg-white hover:border-[#155DFC] hover:shadow-xs transition-all text-left disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {loadingRole === 'business' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Building2 className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50/70 px-1.5 py-0.5 rounded">
              Bisnis
            </span>
          </div>
          <span className="text-xs font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors">
            Demo UMKM
          </span>
          <span className="text-[10px] text-[#737373] line-clamp-1 mt-0.5">
            Order & Bayar Koin
          </span>
        </button>

        {/* Demo School */}
        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => handleDemoLogin('school')}
          className="group relative flex flex-col items-start p-2.5 rounded-xl border border-[#E1E3EA] bg-[#F9FAFB] hover:bg-white hover:border-[#155DFC] hover:shadow-xs transition-all text-left disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              {loadingRole === 'school' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50/70 px-1.5 py-0.5 rounded">
              Sekolah
            </span>
          </div>
          <span className="text-xs font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors">
            Demo Vokasi
          </span>
          <span className="text-[10px] text-[#737373] line-clamp-1 mt-0.5">
            Dashboard Mitra
          </span>
        </button>
      </div>
    </div>
  );
}
