import { ProjectListing } from '@/types';
import { MOCK_ALL_UMKM } from '@/data/mockUmkm';
import { apiUrl } from '@/lib/api-config';

export const briefService = {
  async getBriefs(): Promise<ProjectListing[]> {
    try {
      const res = await fetch(apiUrl('/api/briefs'), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.briefs) && data.briefs.length > 0) {
          return data.briefs.map((b: any): ProjectListing => ({
            id: b.id,
            title: b.title,
            clientName: b.companyName || b.businessName || 'Brand Partner',
            clientAvatar: b.businessAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
            clientLocation: b.businessLocation || 'Jakarta, Indonesia',
            category: b.category,
            budgetMin: 500000,
            budgetMax: 2000000,
            formattedBudget: b.budget || 'Rp1.500.000',
            deadline: b.deadline || '7 Hari',
            description: b.description,
            deliverables: b.expectedOutput ? [b.expectedOutput] : ['Output sesuai kesepakatan'],
            requiredSkills: [b.category, 'Revisi minor'],
            proposalsCount: b.applicationsCount || 0,
            postedTimeAgo: 'Baru saja',
            isVerifiedClient: true,
          }));
        }
      }
    } catch {
      // Fallback
    }

    const fallbackListings = MOCK_ALL_UMKM.flatMap((u) => u.activeBriefsList || []);
    return fallbackListings.length > 0 ? fallbackListings : [];
  },

  async getBriefDetail(id: string) {
    try {
      const res = await fetch(apiUrl(`/api/briefs/${id}`), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
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
      const res = await fetch(apiUrl('/api/briefs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(apiUrl(`/api/briefs/${briefId}/apply`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(apiUrl(`/api/briefs/${briefId}/applications/${applicationId}/accept`), {
        method: 'POST',
        credentials: 'include',
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
