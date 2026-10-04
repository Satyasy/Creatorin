import { AppNotification } from '@/types';

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch('/api/notifications', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat notifikasi');
    return (data.notifications || []).map((n: any): AppNotification => {
      const createdAt = new Date(n.createdAt);
      const age = Date.now() - createdAt.getTime();
      return {
        id: n.id,
        type: n.type || 'system',
        title: n.title,
        description: n.body,
        timeAgo: createdAt.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        read: Boolean(n.isRead),
        actionUrl: n.linkUrl,
        category: n.type === 'message' ? 'messages' : n.type === 'invoice' ? 'transactions' : ['submission', 'approval', 'revision', 'collaboration'].includes(n.type) ? 'collaboration' : 'general',
        timeGroup: age < 86_400_000 ? 'today' : age < 172_800_000 ? 'yesterday' : 'earlier',
      };
    });
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    const res = await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    return res.ok;
  },

  async updateSettings(payload: {
    newPassword?: string;
    newEmail?: string;
    location?: string;
    phone?: string;
    fullName?: string;
    notifyPush?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Gagal menyimpan pengaturan' };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      return { success: false, error: msg };
    }
  },
};
