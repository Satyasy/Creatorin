'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BriefDetailPage } from '@/views/BriefDetailPage';
import type { ProjectListing } from '@/types';

export default function BriefDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const [brief, setBrief] = useState<ProjectListing | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/briefs/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Brief tidak ditemukan.');
        const data = await response.json();
        const item = data.brief;
        setBrief({
          id: item.id, title: item.title, clientName: item.companyName || '',
          clientAvatar: item.businessAvatar || '', clientLocation: item.businessLocation || '',
          category: item.category || '', budgetMin: Number(String(item.budget || '').replace(/\D/g, '')) || 0,
          budgetMax: Number(String(item.budget || '').replace(/\D/g, '')) || 0,
          formattedBudget: item.budget || '', deadline: item.deadline || '',
          description: item.description || '', deliverables: item.expectedOutput ? [item.expectedOutput] : [],
          requiredSkills: [], proposalsCount: data.applicationsCount || 0, postedTimeAgo: '',
        });
      })
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <p className="p-8">Memuat brief...</p>;
  if (!brief) return <p className="p-8">Brief tidak ditemukan.</p>;
  return <BriefDetailPage brief={brief} />;
}
