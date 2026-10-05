import { SummarizeResponseData } from '@/app/api/ai/summarize/route';
import { apiUrl } from '@/lib/api-config';

export interface SummarizeParams {
  roomId: string;
  projectTitle: string;
  creatorName: string;
  businessBrand: string;
  messages?: Array<{ sender: string; text: string; time?: string; role?: string }>;
}

export const aiSummarizeService = {
  async summarizeConversation(params: SummarizeParams): Promise<SummarizeResponseData> {
    try {
      const res = await fetch(apiUrl('/api/ai/summarize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('aiSummarizeService fetch failed, using local fallback:', err);
    }

    // Client fallback reading real messages
    const msgs = params.messages || [];
    const hasMessages = msgs.length > 0;
    const lastMsg = hasMessages ? msgs[msgs.length - 1].text : '';
    
    return {
      executiveSummary: hasMessages
        ? `Obrolan proyek "${params.projectTitle}" antara ${params.businessBrand} dan ${params.creatorName} sedang aktif (${msgs.length} pesan tercatat). Diskusi kesepakatan berjalan secara langsung.`
        : `Belum ada pesan obrolan antara ${params.businessBrand} dan ${params.creatorName}. Silakan mulai obrolan untuk menentukan kesepakatan proyek.`,
      agreements: hasMessages
        ? [
            `Proyek: ${params.projectTitle}`,
            lastMsg ? `Pesan terbaru: "${lastMsg.slice(0, 60)}${lastMsg.length > 60 ? '...' : ''}"` : 'Sedang mendiskusikan rincian pekerjaan.'
          ]
        : ['Belum ada poin kesepakatan yang dicatat.'],
      actionItems: [
        {
          task: hasMessages ? 'Lanjutkan diskusi dan ajukan invoice kesepakatan DP' : 'Mulai percakapan untuk membahas lingkup proyek',
          assignee: params.businessBrand,
          status: 'pending',
        }
      ],
      modelUsed: 'CreatorIn Context Reader',
      generatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
  }
};
