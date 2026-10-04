import { CollaborationItem } from '@/types';
import { MOCK_COLLABORATIONS } from '@/data/mockCollaborations';
import { createClient } from '@/lib/supabase/client';
import { apiUrl } from '@/lib/api-config';

export const collabService = {
  async getCollaborations(): Promise<CollaborationItem[]> {
    return MOCK_COLLABORATIONS;
  },

  async getRoomDetail(roomId: string) {
    try {
      const res = await fetch(apiUrl(`/api/collaboration/${roomId}`), {
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

  async submitDraft(roomId: string, notes: string, fileUrls: string[]): Promise<{ success: boolean; submission?: any; error?: string }> {
    try {
      const res = await fetch(apiUrl(`/api/collaboration/${roomId}/submit`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes, fileUrls }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal mengirim draft hasil kerja' };
      return { success: true, submission: data.submission };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async requestRevision(roomId: string, feedback: string): Promise<{ success: boolean; revision?: any; error?: string }> {
    try {
      const res = await fetch(apiUrl(`/api/collaboration/${roomId}/revision`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal mengirim permintaan revisi' };
      return { success: true, revision: data.revision };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async approveCollab(roomId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(apiUrl(`/api/collaboration/${roomId}/approve`), {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Persetujuan gagal diproses' };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async submitReview(payload: {
    creatorId: string;
    roomId?: string;
    projectTitle: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean; review?: any; error?: string }> {
    try {
      const res = await fetch(apiUrl('/api/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal mengirim ulasan' };
      return { success: true, review: data.review };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  subscribeToRoom(roomId: string, onUpdate: (room: any) => void) {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'collaboration_rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload) => {
            onUpdate(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
