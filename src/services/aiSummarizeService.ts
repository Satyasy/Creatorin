import { SummarizeResponseData } from '@/app/api/ai/summarize/route';
import { apiUrl } from '@/lib/api-config';

export interface SummarizeParams {
  roomId?: string;
  conversationId?: string;
  projectTitle: string;
  creatorName?: string;
  businessBrand?: string;
  messages?: Array<{ sender: string; text: string; time?: string; role?: string }>;
  forceRefresh?: boolean;
}

export const aiSummarizeService = {
  async getStoredSummary(conversationId?: string, roomId?: string): Promise<{ data: SummarizeResponseData; isOutdated: boolean } | null> {
    try {
      const query = new URLSearchParams();
      if (conversationId) query.set('conversationId', conversationId);
      if (roomId) query.set('roomId', roomId);

      const res = await fetch(apiUrl(`/api/ai/summarize?${query.toString()}`), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            data: json.data,
            isOutdated: Boolean(json.isOutdated),
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  async summarizeConversation(params: SummarizeParams): Promise<SummarizeResponseData> {
    const payload = {
      ...params,
      conversationId: params.conversationId || params.roomId,
    };

    const res = await fetch(apiUrl('/api/ai/summarize'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error || `Gagal menganalisis percakapan (HTTP ${res.status})`);
    }

    return json.data as SummarizeResponseData;
  }
};
