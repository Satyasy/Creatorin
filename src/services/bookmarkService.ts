export interface BookmarkItem {
  id: string;
  targetType: 'creator' | 'project' | 'service' | 'brief' | string;
  targetId: string;
  createdAt: string;
}

export const bookmarkService = {
  async getBookmarks(targetType?: string): Promise<string[]> {
    try {
      const url = targetType ? `/api/bookmarks?targetType=${encodeURIComponent(targetType)}` : '/api/bookmarks';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.bookmarks || []).map((b: BookmarkItem) => b.targetId);
    } catch {
      return [];
    }
  },

  async toggleBookmark(
    targetType: 'creator' | 'project' | 'service' | 'brief',
    targetId: string
  ): Promise<{ success: boolean; bookmarked: boolean; error?: string }> {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, bookmarked: false, error: data.error || 'Gagal memperbarui bookmark' };
      }
      return { success: true, bookmarked: Boolean(data.bookmarked) };
    } catch (err: any) {
      return { success: false, bookmarked: false, error: err?.message || 'Koneksi ke server terputus' };
    }
  },
};
