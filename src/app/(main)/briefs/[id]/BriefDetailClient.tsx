'use client';

import { useEffect, useState } from 'react';
import { BriefDetailPage } from '@/views/BriefDetailPage';
import type { ProjectListing } from '@/types';

interface BriefDetailClientProps {
  id: string;
  initialBrief?: ProjectListing | null;
}

export function BriefDetailClient({ id, initialBrief }: BriefDetailClientProps) {
  const [brief, setBrief] = useState<ProjectListing | null>(initialBrief || null);
  const [loading, setLoading] = useState(!initialBrief);

  useEffect(() => {
    if (initialBrief) return;

    fetch(`/api/briefs/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Brief tidak ditemukan.');
        const data = await response.json();
        const item = data.brief;
        setBrief({
          id: item.id,
          title: item.title,
          clientName: item.companyName || '',
          clientAvatar: item.businessAvatar || '',
          clientLocation: item.businessLocation || '',
          category: item.category || '',
          budgetMin: Number(String(item.budget || '').replace(/\D/g, '')) || 0,
          budgetMax: Number(String(item.budget || '').replace(/\D/g, '')) || 0,
          formattedBudget: item.budget || '',
          deadline: item.deadline || '',
          description: item.description || '',
          deliverables: item.expectedOutput ? [item.expectedOutput] : [],
          requiredSkills: [],
          proposalsCount: data.applicationsCount || 0,
          postedTimeAgo: '',
        });
      })
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [id, initialBrief]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <p className="text-neutral-500 font-medium animate-pulse">Memuat brief...</p>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <p className="text-neutral-600 font-semibold">Brief tidak ditemukan.</p>
      </div>
    );
  }

  return <BriefDetailPage brief={brief} />;
}
