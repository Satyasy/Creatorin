'use client';

import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { UmkmProfilePage } from '@/views/UmkmProfilePage';
import { creatorService } from '@/services/creatorService';
import { businessService } from '@/services/businessService';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Creator, UMKMProfile } from '@/types';

export default function MyProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [business, setBusiness] = useState<UMKMProfile | null>(null);
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
    if (!user || !user.id || (user.role !== 'umkm' && (user as any)?.role !== 'business')) return;
    const userId = user.id;
    businessService.getBusiness(userId)
      .then((data) => {
        if (data) {
          setBusiness({
            ...data,
            coverBanner: user?.coverUrl || data.coverBanner || (data as any).coverUrl || '',
            logo: user?.avatar || data.logo || '',
          });
        }
      })
      .catch(() => {});

    Promise.all([
      fetch('/api/auth/me', { cache: 'no-store' }).then((res) => res.json()),
      fetch(`/api/briefs?businessId=${encodeURIComponent(userId)}`, { cache: 'no-store' }).then((res) => res.json()),
    ]).then(([account, listings]) => setBusinessData({ details: account.details, briefs: listings.briefs || [] })).catch(() => {});
  }, [user?.id, user?.role, user?.coverUrl, user?.avatar]);

  const umkmProfile = useMemo<UMKMProfile | null>(() => {
    if (!user || (user.role !== 'umkm' && (user as any)?.role !== 'business')) return null;
    const briefs = business?.activeBriefsList || businessData.briefs || [];
    return {
      id: user.id || '', name: user.name,
      brandName: business?.brandName || businessData.details?.companyName || user.name,
      logo: user.avatar || business?.logo || '',
      coverBanner: user.coverUrl || business?.coverBanner || '',
      industry: business?.industry || businessData.details?.businessCategory || '',
      category: business?.category || businessData.details?.businessCategory || '',
      tagline: business?.tagline || '',
      bio: business?.bio || businessData.details?.description || '',
      location: business?.location || user.location || '',
      website: business?.website || businessData.details?.website || '',
      verified: business?.verified || false,
      joinedDate: business?.joinedDate || '',
      stats: business?.stats || { activeBriefs: briefs.length, completedProjects: 0, totalPaidFormatted: 'Rp0', ratingFromCreators: 0, reviewCount: 0, paymentOnTimeRate: 0, avgResponseHours: 0 },
      activeBriefsList: briefs.map((brief) => ({
        id: brief.id, title: brief.title, clientName: (brief as any).clientName || (brief as any).businessName || user.name,
        clientLocation: (brief as any).clientLocation || user.location || '', category: brief.category,
        budgetMin: Number(String((brief as any).budget || (brief as any).budgetMin || '').replace(/\D/g, '')) || 0,
        budgetMax: Number(String((brief as any).budget || (brief as any).budgetMax || '').replace(/\D/g, '')) || 0,
        formattedBudget: (brief as any).formattedBudget || (brief as any).budget || '', deadline: brief.deadline,
        description: brief.description,
        deliverables: (brief as any).deliverables || [], requiredSkills: [], proposalsCount: 0, postedTimeAgo: '',
      })),
      completedCollaborations: business?.completedCollaborations || [],
      creatorReviews: business?.creatorReviews || [],
    };
  }, [user, business, businessData]);

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

  if (user.role === 'umkm' || (user as any)?.role === 'business') {
    return (
      <UmkmProfilePage
        initialProfile={business || umkmProfile!}
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
