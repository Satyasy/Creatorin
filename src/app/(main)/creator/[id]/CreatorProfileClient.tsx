'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { CreatorProfileSkeleton } from '@/components/common/CreatorProfileSkeleton';
import { creatorService } from '@/services/creatorService';
import type { Creator } from '@/types';

interface CreatorProfileClientProps {
  id: string;
  initialCreator?: Creator | null;
}

export function CreatorProfileClient({ id, initialCreator }: CreatorProfileClientProps) {
  const [creator, setCreator] = useState<Creator | null>(initialCreator || null);
  const [loading, setLoading] = useState<boolean>(!initialCreator);
  const [error, setError] = useState<string | null>(null);

  const fetchCreator = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    creatorService
      .getCreatorDetail(id)
      .then((data) => {
        if (!data) {
          setError('Profil kreator tidak ditemukan.');
        } else {
          setCreator(data);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat profil kreator.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!initialCreator) {
      fetchCreator();
    }
  }, [initialCreator, fetchCreator]);

  if (loading) {
    return <CreatorProfileSkeleton />;
  }

  if (error || !creator) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FDFCFB]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-6 ring-amber-50/50">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Profil Tidak Ditemukan</h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {error || 'Profil kreator ini mungkin telah diubah, dinonaktifkan, atau tautan tidak valid.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={fetchCreator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] text-sm font-semibold text-white transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Jelajahi Kreator Lain</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <CreatorProfilePage creator={creator} />;
}
