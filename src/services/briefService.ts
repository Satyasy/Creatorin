import { ProjectListing } from '@/types';

export const briefService = {
  async getBriefs(): Promise<ProjectListing[]> {
      const res = await fetch('/api/briefs', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat brief');
      return (data.briefs || []).map((b: any): ProjectListing => ({
            id: b.id,
            title: b.title,
            clientName: b.companyName || b.businessName || 'Brand Partner',
            clientAvatar: b.businessAvatar || '',
            clientLocation: b.businessLocation || '',
            category: b.category,
            budgetMin: Number(String(b.budget || '').replace(/\D/g, '')) || 0,
            budgetMax: Number(String(b.budget || '').replace(/\D/g, '')) || 0,
            formattedBudget: b.budget || '',
            deadline: b.deadline || '',
            description: b.description,
            deliverables: b.expectedOutput ? [b.expectedOutput] : [],
            requiredSkills: b.category ? [b.category] : [],
            proposalsCount: b.applicationsCount || 0,
            postedTimeAgo: b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID') : '',
            createdAt: b.createdAt || '',
            isVerifiedClient: false,
          }));
  },

  async getBriefDetail(id: string) {
    const res = await fetch(`/api/briefs/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat brief');
    return data;
  },

  async createBrief(payload: {
    title: string;
    category: string;
    description: string;
    budget: string;
    expectedOutput?: string;
    deadline?: string;
  }): Promise<{ success: boolean; brief?: any; error?: string }> {
    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal membuat brief' };
      return { success: true, brief: data.brief };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async applyToBrief(briefId: string, pitch: string, proposedPrice: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/briefs/${briefId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, proposedPrice }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal melamar' };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async acceptApplication(briefId: string, applicationId: string): Promise<{ success: boolean; conversationId?: string; error?: string }> {
    try {
      const res = await fetch(`/api/briefs/${briefId}/applications/${applicationId}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal menerima pelamar' };
      return { success: true, conversationId: data.conversationId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },
};
