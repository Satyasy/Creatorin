'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UmkmProfilePage } from '@/views/UmkmProfilePage';
import { businessService } from '@/services/businessService';
import type { UMKMProfile } from '@/types';

export default function UmkmRoute() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<UMKMProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    businessService.getBusiness(id)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <p className="p-8">Memuat profil...</p>;
  if (!business) return <p className="p-8">Profil UMKM tidak ditemukan.</p>;
  return <UmkmProfilePage initialProfile={business} />;
}
