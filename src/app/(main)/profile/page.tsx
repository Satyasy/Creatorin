'use client';

import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { UmkmProfilePage } from '@/views/UmkmProfilePage';
import { creatorService } from '@/services/creatorService';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Creator, UMKMProfile } from '@/types';

export default function MyProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [businessData, setBusinessData] = useState<{ details?: { companyName?: string; businessCategory?: string; description?: string; website?: string }; briefs?: Array<{ id: string; title: string; category: string; description: string; budget: string; deadline: string; businessName: string }> }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'creator' || !user.id) { setLoading(false); return; }
    creatorService.getCreatorDetail(user.id)
      .then(setCreator)
      .catch(() => setCreator(null))
      .finally(() => setLoading(false));
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.role !== 'umkm' || !user.id) return;
    Promise.all([
      fetch('/api/auth/me', { cache: 'no-store' }).then((res) => res.json()),
      fetch(`/api/briefs?businessId=${encodeURIComponent(user.id)}`, { cache: 'no-store' }).then((res) => res.json()),
    ]).then(([account, listings]) => setBusinessData({ details: account.details, briefs: listings.briefs || [] })).catch(() => {});
  }, [user?.id, user?.role]);

  const umkmProfile = useMemo<UMKMProfile | null>(() => {
    if (!user || user.role !== 'umkm') return null;
    const briefs = businessData.briefs || [];
    return {
      id: user.id || '', name: user.name,
      brandName: businessData.details?.companyName || user.name,
      logo: user.avatar || '', coverBanner: '',
      industry: businessData.details?.businessCategory || '',
      category: businessData.details?.businessCategory || '',
      tagline: '', bio: businessData.details?.description || '',
      location: user.location || '', website: businessData.details?.website || '',
      verified: false, joinedDate: '',
      stats: { activeBriefs: briefs.length, completedProjects: 0, totalPaidFormatted: 'Rp0', ratingFromCreators: 0, reviewCount: 0, paymentOnTimeRate: 0, avgResponseHours: 0 },
      activeBriefsList: briefs.map((brief) => ({
        id: brief.id, title: brief.title, clientName: brief.businessName,
        clientLocation: user.location || '', category: brief.category,
        budgetMin: Number(String(brief.budget || '').replace(/\D/g, '')) || 0,
        budgetMax: Number(String(brief.budget || '').replace(/\D/g, '')) || 0,
        formattedBudget: brief.budget, deadline: brief.deadline,
        description: brief.description,
        deliverables: [], requiredSkills: [], proposalsCount: 0, postedTimeAgo: '',
      })),
      completedCollaborations: [], creatorReviews: [],
    };
  }, [user, businessData]);

  // Redirect unauthenticated users to sign-in or school users to school dashboard
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/sign-in');
    } else if (user?.role === 'school') {
      router.replace('/dashboard/school');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  if (!isAuthenticated || !user || user.role === 'school') {
    return null;
  }

  if (user.role === 'umkm') {
    return (
      <UmkmProfilePage
        initialProfile={umkmProfile!}
        currentUser={user}
      />
    );
  }

  if (loading) return <p className="p-8">Memuat profil...</p>;
  if (!creator) return <p className="p-8">Profil belum tersedia. Coba muat ulang halaman.</p>;

  return (
    <CreatorProfilePage
      creator={creator}
      currentUser={user}
      isOwnProfile={true}
    />
  );
}
