'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import type { ActivePage, AppNotification, AuthState, Creator } from '@/types';
import { notificationService } from '@/services/notificationService';

interface NotificationsPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

type Filter = 'all' | 'unread' | 'messages' | 'transactions' | 'collaboration';

export const NotificationsPage = ({ onNavigate }: NotificationsPageProps) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationService.getNotifications()
      .then(setNotifications)
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Gagal memuat notifikasi'))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'all') return true;
    return item.category === filter;
  }), [filter, notifications]);

  const markAllRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    else setError('Gagal memperbarui notifikasi.');
  };

  const open = async (item: AppNotification) => {
    if (!item.read) {
      const success = await notificationService.markAsRead(item.id);
      if (success) setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    }
    if (item.actionUrl?.startsWith('/')) router.push(item.actionUrl);
    else if (item.targetPage && onNavigate) onNavigate(item.targetPage);
  };

  const icon = (type: AppNotification['type']) => {
    if (type === 'message') return <MessageSquare className="h-4 w-4" />;
    if (type === 'invoice') return <FileText className="h-4 w-4" />;
    return <ShieldCheck className="h-4 w-4" />;
  };

  return <main className="container-creatorin max-w-4xl py-10 sm:py-16">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold text-primary">Aktivitas akun</p><h1 className="mt-1 text-3xl font-semibold">Notifikasi</h1></div>
      <button type="button" onClick={markAllRead} disabled={!notifications.some((item) => !item.read)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--outline)] px-4 text-sm font-semibold disabled:opacity-50"><CheckCheck className="h-4 w-4" /> Tandai semua dibaca</button>
    </div>
    <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
      {([['all', 'Semua'], ['unread', 'Belum dibaca'], ['messages', 'Pesan'], ['transactions', 'Transaksi'], ['collaboration', 'Kolaborasi']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-[#0D0C22] text-white' : 'bg-[#F3F3F4] text-[#55576A]'}`}>{label}</button>)}
    </div>
    {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
    {loading ? <p className="mt-10 text-sm text-[var(--muted)]">Memuat notifikasi...</p> : visible.length ? <div className="mt-6 divide-y divide-[var(--outline)] rounded-2xl border border-[var(--outline)] bg-white">
      {visible.map((item) => <button key={item.id} type="button" onClick={() => open(item)} className={`flex w-full gap-4 p-5 text-left hover:bg-[#F8F9FC] ${item.read ? '' : 'bg-[#F3F7FF]'}`}>
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">{icon(item.type)}</span>
        <span className="min-w-0 flex-1"><span className="block font-semibold text-[var(--ink)]">{item.title}</span><span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{item.description}</span><span className="mt-2 block text-xs text-[#6F7285]">{item.timeAgo}</span></span>
        {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" />}
      </button>)}
    </div> : <div className="mt-10 rounded-2xl border border-[var(--outline)] bg-white p-12 text-center"><Bell className="mx-auto h-7 w-7 text-[#6F7285]" /><p className="mt-3 font-semibold">Belum ada notifikasi.</p></div>}
  </main>;
};
