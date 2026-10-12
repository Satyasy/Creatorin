'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { UmkmProfilePage } from '@/views/UmkmProfilePage';
import { UmkmProfileSkeleton } from '@/components/common/UmkmProfileSkeleton';
import { businessService } from '@/services/businessService';
import type { UMKMProfile } from '@/types';

export default function UmkmRoute() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<UMKMProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    businessService
      .getBusiness(id)
      .then((data) => {
        if (!data) {
          setError('Profil UMKM tidak ditemukan.');
        } else {
          setBusiness(data);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat profil UMKM.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  if (loading) {
    return <UmkmProfileSkeleton />;
  }

  if (error || !business) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FDFCFB]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-6 ring-amber-50/50">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Profil UMKM Tidak Ditemukan</h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {error || 'Profil brand ini mungkin telah dinonaktifkan atau tautan tidak valid.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={fetchBusiness}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href="/explore?tab=umkm"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] text-sm font-semibold text-white transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Jelajahi UMKM Lain</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <UmkmProfilePage initialProfile={business} />;
}
