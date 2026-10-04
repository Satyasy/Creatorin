import { AppNotification } from '@/types';
import { apiUrl } from '@/lib/api-config';

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await fetch(apiUrl('/api/notifications'), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          return data.notifications.map((n: any): AppNotification => ({
            id: n.id,
            type: n.type || 'system',
            title: n.title,
            description: n.body,
            timeAgo: new Date(n.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
            read: Boolean(n.isRead),
            actionUrl: n.linkUrl,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(apiUrl('/api/notifications'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isRead: true }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateSettings(payload: {
    newPassword?: string;
    newEmail?: string;
    location?: string;
    phone?: string;
    fullName?: string;
    notifyEmail?: boolean;
    notifyPush?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(apiUrl('/api/account/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
