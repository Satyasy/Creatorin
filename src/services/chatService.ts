import { ChatConversation, ChatMessage } from '@/types';
import { createClient } from '@/lib/supabase/client';

export const chatService = {
  async getConversations(currentUser?: { id?: string; role?: string } | null): Promise<ChatConversation[]> {
    const res = await fetch('/api/conversations', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat percakapan');
    
    return (data.conversations || []).map((c: any): ChatConversation => {
      const partner = c.partner;
      const partnerRole = partner?.role || 'creator';
      // Determine current user's role in this conversation:
      // If partner is creator, current user is likely UMKM/business, and vice versa.
      let myRole: 'creator' | 'umkm' = 'creator';
      if (currentUser?.role === 'creator') {
        myRole = 'creator';
      } else if (currentUser?.role === 'umkm' || currentUser?.role === 'business') {
        myRole = 'umkm';
      } else if (partnerRole === 'creator') {
        myRole = 'umkm';
      } else {
        myRole = 'creator';
      }

      return {
        id: c.id,
        creatorId: partner?.id || '',
        partnerId: partner?.id || '',
        partnerRole: partnerRole,
        myRole: myRole,
        name: partner?.fullName || 'Mitra Kolaborasi',
        roleTitle: partnerRole === 'creator' ? 'Kreator' : 'UMKM',
        avatar: partner?.avatarUrl || '',
        online: false,
        lastMessage: c.lastMessage || '',
        lastMessageTime: new Date(c.lastMessageTime || c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        messages: [],
      };
    });
  },

  async getMessages(conversationId: string, currentUserId?: string): Promise<ChatMessage[]> {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat pesan');
    
    return (data.messages || []).map((m: any): ChatMessage => {
      const meta = m.metadata || {};
      let attachment = meta.attachment;
      if (!attachment && m.attachmentUrl) {
        attachment = { type: 'file', url: m.attachmentUrl, name: 'Lampiran Berkas' };
      }

      return {
        id: m.id,
        senderId: m.senderId,
        text: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: currentUserId ? m.senderId === currentUserId : false,
        status: m.isRead ? 'read' : 'delivered',
        attachment: attachment || undefined,
        invoice: meta.invoice || undefined,
        metadata: meta,
      };
    });
  },

  async sendMessage(
    conversationId: string,
    content: string,
    metadata?: Record<string, any>,
    attachmentUrl?: string
  ): Promise<{ success: boolean; message?: any; error?: string }> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content, metadata, attachmentUrl }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal mengirim pesan' };
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async createInvoice(payload: {
    businessId: string;
    conversationId: string;
    title: string;
    scopeDescription: string;
    totalAmount: number;
    deadlineDays?: number;
    revisionRules?: string;
  }): Promise<{ success: boolean; invoice?: any; error?: string }> {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal menerbitkan invoice' };
      return { success: true, invoice: data.invoice };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async payInvoice(invoiceId: string): Promise<{ success: boolean; room?: any; error?: string }> {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Pembayaran gagal diproses' };
      return { success: true, room: data.room };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  subscribeToMessages(conversationId: string, onNewMessage: (msg: any) => void) {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            onNewMessage(payload.new);
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
