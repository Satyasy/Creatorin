import { ChatConversation, ChatMessage } from '@/types';
import { createClient } from '@/lib/supabase/client';

export const chatService = {
  async getConversations(): Promise<ChatConversation[]> {
    try {
      const res = await fetch('/api/conversations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.conversations) && data.conversations.length > 0) {
          return data.conversations.map((c: any): ChatConversation => ({
            id: c.id,
            creatorId: c.otherParticipant?.id || '',
            name: c.otherParticipant?.fullName || 'Mitra Kolaborasi',
            roleTitle: c.otherParticipant?.role === 'creator' ? 'Creative Talent' : 'Brand UMKM',
            avatar: c.otherParticipant?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
            online: true,
            lastMessage: c.lastMessage || 'Percakapan dimulai.',
            lastMessageTime: new Date(c.lastMessageTime || c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
            messages: [],
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async getMessages(conversationId: string, currentUserId?: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          return data.messages.map((m: any): ChatMessage => ({
            id: m.id,
            senderId: m.senderId,
            text: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: currentUserId ? m.senderId === currentUserId : false,
            status: m.isRead ? 'read' : 'delivered',
            attachment: m.attachmentUrl ? { type: 'file', url: m.attachmentUrl, name: 'Attachment' } : undefined,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async sendMessage(conversationId: string, content: string): Promise<{ success: boolean; message?: any; error?: string }> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
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
