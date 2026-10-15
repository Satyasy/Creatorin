import { ChatConversation, ChatMessage } from '@/types';
import { createClient } from '@/lib/supabase/client';

const LOCAL_CONVERSATIONS_KEY = 'creatorin_local_conversations';

export const chatService = {
  // Read local conversations from localStorage
  getLocalConversations(): ChatConversation[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save/merge an inquiry conversation into localStorage
  saveLocalInquiryConversation(convData: {
    id: string;
    creatorId: string;
    name: string;
    roleTitle: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    messages: ChatMessage[];
    partnerRole?: string;
  }) {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getLocalConversations();
      const idx = existing.findIndex(c => c.id === convData.id || c.creatorId === convData.creatorId);
      if (idx >= 0) {
        const target = existing[idx];
        const mergedMessages = [...target.messages];
        for (const msg of convData.messages) {
          if (!mergedMessages.some(m => m.id === msg.id)) {
            mergedMessages.push(msg);
          }
        }
        existing[idx] = {
          ...target,
          lastMessage: convData.lastMessage,
          lastMessageTime: convData.lastMessageTime,
          messages: mergedMessages,
        };
      } else {
        existing.unshift({
          id: convData.id,
          creatorId: convData.creatorId,
          partnerId: convData.creatorId,
          partnerRole: convData.partnerRole || 'creator',
          myRole: convData.partnerRole === 'umkm' ? 'creator' : 'umkm',
          name: convData.name,
          roleTitle: convData.roleTitle,
          avatar: convData.avatar,
          online: true,
          lastMessage: convData.lastMessage,
          lastMessageTime: convData.lastMessageTime,
          unreadCount: 0,
          messages: convData.messages,
        });
      }
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Gagal menyimpan percakapan lokal:', e);
    }
  },

  // Add a message to a local conversation
  addLocalMessage(conversationId: string, message: ChatMessage) {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getLocalConversations();
      const idx = existing.findIndex(c => c.id === conversationId);
      if (idx >= 0) {
        if (!existing[idx].messages.some(m => m.id === message.id)) {
          existing[idx].messages.push(message);
        }
        existing[idx].lastMessage = message.text;
        existing[idx].lastMessageTime = message.timestamp;
        localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('Gagal menambah pesan lokal:', e);
    }
  },

  async getConversations(currentUser?: { id?: string; role?: string } | null): Promise<ChatConversation[]> {
    const localConvs = this.getLocalConversations();
    try {
      const res = await fetch('/api/conversations', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat percakapan');
      
      const serverConvs: ChatConversation[] = (data.conversations || []).map((c: any): ChatConversation => {
        const partner = c.partner;
        const partnerRole = partner?.role || 'creator';
        // Determine current user's role in this conversation:
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

      // Merge server conversations with any local conversations not on server
      const combined = [...serverConvs];
      for (const loc of localConvs) {
        if (!combined.some(c => c.id === loc.id || (loc.creatorId && c.creatorId === loc.creatorId))) {
          combined.push(loc);
        }
      }
      return combined;
    } catch {
      return localConvs;
    }
  },

  async getMessages(conversationId: string, currentUserId?: string): Promise<ChatMessage[]> {
    const localConvs = this.getLocalConversations();
    const localTarget = localConvs.find(c => c.id === conversationId);

    // If it's a purely local conversation ID
    if (conversationId.startsWith('conv-') || !conversationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return localTarget?.messages || [];
    }

    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat pesan');
      
      const serverMsgs: ChatMessage[] = (data.messages || []).map((m: any): ChatMessage => {
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
          serviceInquiry: meta.serviceInquiry || undefined,
          metadata: meta,
        };
      });

      if (localTarget && localTarget.messages.length > 0) {
        for (const lm of localTarget.messages) {
          if (!serverMsgs.some(sm => sm.id === lm.id || (sm.text === lm.text && sm.serviceInquiry?.id === lm.serviceInquiry?.id))) {
            serverMsgs.push(lm);
          }
        }
      }

      return serverMsgs;
    } catch {
      return localTarget?.messages || [];
    }
  },

  async sendMessage(
    conversationId: string,
    content: string,
    metadata?: Record<string, any>,
    attachmentUrl?: string
  ): Promise<{ success: boolean; message?: any; error?: string }> {
    if (conversationId.startsWith('conv-')) {
      const localMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'user',
        text: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        status: 'delivered',
        serviceInquiry: metadata?.serviceInquiry,
        metadata,
      };
      this.addLocalMessage(conversationId, localMsg);
      return { success: true, message: localMsg };
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content, metadata, attachmentUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        const localMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: 'user',
          text: content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: true,
          status: 'delivered',
          serviceInquiry: metadata?.serviceInquiry,
          metadata,
        };
        this.addLocalMessage(conversationId, localMsg);
        return { success: true, message: localMsg };
      }
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const localMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'user',
        text: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        status: 'delivered',
        serviceInquiry: metadata?.serviceInquiry,
        metadata,
      };
      this.addLocalMessage(conversationId, localMsg);
      return { success: true, message: localMsg };
    }
  },

  async sendServiceInquiry(payload: {
    creator: { id: string; name: string; username?: string; avatar: string; roleTitle?: string };
    service: {
      id: string;
      title: string;
      price?: number;
      formattedPrice?: string;
      deliveryDays?: string;
      coverImage?: string;
      tag?: string;
      description?: string;
    };
    message: string;
    currentUser?: { id?: string; fullName?: string; role?: string } | null;
  }): Promise<{ success: boolean; conversationId: string; error?: string }> {
    const { creator, service, message, currentUser } = payload;
    let targetConvId = '';

    // 1. Try server API if possible
    try {
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: creator.id }),
      });
      if (convRes.ok) {
        const convData = await convRes.json();
        if (convData.conversation?.id) {
          targetConvId = convData.conversation.id;
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: targetConvId,
              content: message,
              metadata: {
                serviceInquiry: service,
              },
            }),
          });
        }
      }
    } catch {
      // Continue to local sync
    }

    // 2. Always sync to local store
    const fallbackId = targetConvId || `conv-${creator.id}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user',
      text: message,
      timestamp,
      isSelf: true,
      status: 'delivered',
      serviceInquiry: service as any,
    };

    this.saveLocalInquiryConversation({
      id: fallbackId,
      creatorId: creator.id,
      name: creator.name,
      roleTitle: creator.roleTitle || 'Kreator',
      avatar: creator.avatar,
      lastMessage: message,
      lastMessageTime: 'Baru saja',
      messages: [newMsg],
    });

    return { success: true, conversationId: fallbackId };
  },

  async startConversation(recipientId: string): Promise<{ success: boolean; conversation?: any; error?: string }> {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal memulai percakapan' };
      return { success: true, conversation: data.conversation };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },

  async initiateChatWithProfile(
    partner: {
      id: string;
      name: string;
      avatar?: string;
      roleTitle?: string;
      role?: 'creator' | 'umkm';
    },
    currentUser?: { id?: string; role?: string } | null
  ): Promise<{ success: boolean; conversationId: string }> {
    let targetConvId = '';

    // 1. Cek apakah room percakapan lokal sudah pernah ada
    const localConvs = this.getLocalConversations();
    const existingLocal = localConvs.find(
      c => c.creatorId === partner.id || c.partnerId === partner.id || c.id === `conv-${partner.id}`
    );
    if (existingLocal) {
      targetConvId = existingLocal.id;
    }

    // 2. Hubungi endpoint API database (jika online/tersedia)
    if (!targetConvId) {
      try {
        const convRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientId: partner.id }),
        });
        if (convRes.ok) {
          const convData = await convRes.json();
          if (convData.conversation?.id) {
            targetConvId = convData.conversation.id;
          }
        }
      } catch {
        // Fallback ke penyimpanan lokal otomatis
      }
    }

    // 3. Fallback ID percakapan jika mode database offline
    if (!targetConvId) {
      targetConvId = `conv-${partner.id}`;
    }

    // 4. Pastikan data percakapan tersimpan rapi dan room chat siap dibuka
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isCurrentUserCreator = currentUser?.role === 'creator';
    const partnerRole = partner.role || (isCurrentUserCreator ? 'umkm' : 'creator');

    const currentMessages = existingLocal?.messages || [];
    const messagesToSave: ChatMessage[] = currentMessages.length > 0 ? currentMessages : [
      {
        id: `msg-welcome-${Date.now()}`,
        senderId: partner.id,
        text: `Halo! Ruang obrolan telah dibuka. Silakan sampaikan pesan atau kebutuhan proyek Anda di sini.`,
        timestamp,
        isSelf: false,
        status: 'delivered',
      }
    ];

    this.saveLocalInquiryConversation({
      id: targetConvId,
      creatorId: partner.id,
      name: partner.name,
      roleTitle: partner.roleTitle || (partnerRole === 'umkm' ? 'UMKM Brand' : 'Kreator'),
      avatar: partner.avatar || '',
      lastMessage: messagesToSave[messagesToSave.length - 1].text,
      lastMessageTime: 'Baru saja',
      partnerRole,
      messages: messagesToSave,
    });

    return { success: true, conversationId: targetConvId };
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

  async markMessagesAsRead(conversationId: string): Promise<boolean> {
    if (!conversationId || conversationId.startsWith('conv-')) return true;
    try {
      const res = await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  subscribeToMessages(
    conversationId: string,
    onEvent: (event: { type: 'NEW_MESSAGE' | 'MESSAGES_READ' | 'POLL_SYNC'; message?: any; readBy?: string; messageIds?: string[]; messages?: any[] }) => void
  ): () => void {
    if (!conversationId || conversationId.startsWith('conv-')) {
      return () => {};
    }

    let es: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let isCleanedUp = false;

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        es = new EventSource(`/api/messages/stream?conversationId=${encodeURIComponent(conversationId)}`);
        
        es.addEventListener('message', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.type) {
              onEvent(data);
            }
          } catch {}
        });

        es.onerror = () => {
          if (!pollInterval && !isCleanedUp) {
            pollInterval = setInterval(async () => {
              try {
                const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`, { cache: 'no-store' });
                if (res.ok) {
                  const data = await res.json();
                  onEvent({ type: 'POLL_SYNC', messages: data.messages });
                }
              } catch {}
            }, 3500);
          }
        };
      } catch (err) {
        console.warn('[SSE] EventSource init failed:', err);
      }
    }

    return () => {
      isCleanedUp = true;
      if (es) {
        es.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  },
};

