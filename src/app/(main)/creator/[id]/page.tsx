'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { creatorService } from '@/services/creatorService';
import type { Creator } from '@/types';

export default function CreatorRoute() {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    creatorService.getCreatorDetail(id)
      .then(setCreator)
      .catch(() => setCreator(null))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <p className="p-8">Memuat profil...</p>;
  if (!creator) return <p className="p-8">Profil kreator tidak ditemukan.</p>;
  return <CreatorProfilePage creator={creator} />;
}
