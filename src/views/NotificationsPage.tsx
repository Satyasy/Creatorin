'use client';

import React, { useState } from 'react';
import { 
  CheckCheck, 
  Trash2, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Briefcase,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Check,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ActivePage, AuthState, AppNotification, Creator } from '@/types';

interface NotificationsPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

type NotificationFilter = 'all' | 'unread' | 'collaboration' | 'messages' | 'transactions';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // =================== HARI INI ===================
  {
    id: 'notif-1',
    type: 'message',
    category: 'messages',
    timeGroup: 'today',
    title: 'Pesan baru dari Sobakhul Munir Siroj',
    description: 'Berikut invoice resmi untuk pengerjaan project ini. Setelah pembayaran masuk ke escrow, Collaboration Room akan otomatis aktif.',
    timeAgo: '10 mnt lalu',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
    senderName: 'Sobakhul Munir Siroj',
    targetPage: 'chat'
  },
  {
    id: 'notif-2',
    type: 'invoice',
    category: 'transactions',
    timeGroup: 'today',
    title: 'Invoice #INV-882194 diterbitkan',
    description: 'Invoice senilai Rp1.500.000 untuk "Premium Figma SaaS Landing Page Template" siap dibayarkan ke Rekening Escrow.',
    timeAgo: '25 mnt lalu',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
    senderName: 'Sobakhul Munir Siroj',
    targetPage: 'invoice'
  },
  {
    id: 'notif-3',
    type: 'collaboration',
    category: 'collaboration',
    timeGroup: 'today',
    title: 'Collaboration Room CR-2026-042 Aktif & Siap Ditinjau',
    description: 'Ruang kerja kolaborasi dengan Sobakhul Munir Siroj telah aktif. Draft video v1 telah diunggah dan menunggu review Anda.',
    timeAgo: '2 jam lalu',
    read: false,
    targetPage: 'collaboration-room'
  },
  {
    id: 'notif-4',
    type: 'message',
    category: 'messages',
    timeGroup: 'today',
    title: 'Pesan baru dari Maya Angelina',
    description: 'Draft hook video TikTok sudah saya sesuaikan dengan brief brand serum Anda ya kak.',
    timeAgo: '4 jam lalu',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    senderName: 'Maya Angelina',
    targetPage: 'chat'
  },

  // =================== KEMARIN ===================
  {
    id: 'notif-5',
    type: 'order',
    category: 'transactions',
    timeGroup: 'yesterday',
    title: 'Pembayaran Escrow berhasil diamankan',
    description: 'Dana Rp450.000 untuk pesanan "1x Video UGC Skincare & Beauty Routine" telah aman tersimpan di Rekening Escrow Creatorin.',
    timeAgo: 'Kemarin, 16:30',
    read: true,
    targetPage: 'chat'
  },
  {
    id: 'notif-6',
    type: 'approval',
    category: 'collaboration',
    timeGroup: 'yesterday',
    title: 'Draft identitas visual disetujui klien',
    description: 'Klien telah mengonfirmasi dan menyetujui arah eksplorasi palet warna & tipografi pada Collaboration Room.',
    timeAgo: 'Kemarin, 11:15',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
    senderName: 'Phenomenon Creative',
    targetPage: 'projects'
  },
  {
    id: 'notif-7',
    type: 'revision',
    category: 'collaboration',
    timeGroup: 'yesterday',
    title: 'Permintaan revisi minor diajukan',
    description: 'Catatan revisi framing b-roll kopi dan audio subtitle ditambahkan pada catatan review pengerjaan.',
    timeAgo: 'Kemarin, 09:40',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    senderName: 'Rian Prasetyo',
    targetPage: 'chat'
  },

  // =================== SEBELUMNYA ===================
  {
    id: 'notif-8',
    type: 'order',
    category: 'transactions',
    timeGroup: 'earlier',
    title: 'Penyelesaian proyek & pencairan escrow',
    description: 'Pekerjaan "Product Catalog Photography Lookbook" telah selesai dan disetujui. Dana Rp250.000 telah diteruskan.',
    timeAgo: '10 Sep',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    senderName: 'Annisa Putri Rahayu',
    targetPage: 'services'
  },
  {
    id: 'notif-9',
    type: 'proposal',
    category: 'collaboration',
    timeGroup: 'earlier',
    title: 'Kesepakatan brief kolaborasi disetujui',
    description: 'Dimas Wicaksono telah menyetujui brief "Tech Reviewer UGC Unboxing Gadget". Tahap penyerahan unit dimulai.',
    timeAgo: '8 Sep',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    senderName: 'Dimas Wicaksono',
    targetPage: 'chat'
  },
  {
    id: 'notif-10',
    type: 'system',
    category: 'general',
    timeGroup: 'earlier',
    title: 'Pembaruan proteksi Creatorin Escrow 2.0',
    description: 'Seluruh pembayaran transaksi melalui room chat kini otomatis terlindungi penahanan dana escrow berlapis.',
    timeAgo: '5 Sep',
    read: true,
    targetPage: 'projects'
  }
];

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const navigateTo = (page: ActivePage, path?: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (path) {
      router.push(path);
    } else {
      const routeMap: Record<string, string> = {
        'home': '/',
        'landing': '/landing',
        'explore': '/explore',
        'explore-projects': '/explore/projects',
        'explore-services': '/explore/services',
        'chat': '/chat',
        'collaboration': '/collaboration',
        'collaboration-room': '/collaboration',
        'notifications': '/notifications',
        'briefs': '/briefs',
        'signin': '/sign-in',
        'signup': '/sign-up',
        'invoice': '/invoice/INV-882194',
      };
      router.push(routeMap[page] || '/explore');
    }
  };

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleItemClick = (item: AppNotification) => {
    markItemAsRead(item.id);
    if (item.targetPage) {
      navigateTo(item.targetPage);
    }
  };

  // Filter notifikasi berdasarkan tab aktif
  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'collaboration') return item.category === 'collaboration';
    if (activeFilter === 'messages') return item.category === 'messages';
    if (activeFilter === 'transactions') return item.category === 'transactions';
    return true;
  });

  // Kelompokkan hasil filter berdasarkan waktu
  const todayItems = filteredNotifications.filter(n => n.timeGroup === 'today');
  const yesterdayItems = filteredNotifications.filter(n => n.timeGroup === 'yesterday');
  const earlierItems = filteredNotifications.filter(n => n.timeGroup === 'earlier');

  const renderTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
      case 'invoice':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'order':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'collaboration':
      case 'proposal':
        return <Briefcase className="w-3.5 h-3.5 text-neutral-700" />;
      case 'approval':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'revision':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'system':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  const renderNotificationGroup = (title: string, items: AppNotification[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-1">
        {/* Section Headline Kelompok Waktu */}
        <div className="px-3 pt-3 pb-1">
          <h2 className="text-xs font-semibold text-neutral-400 tracking-wide">
            {title}
          </h2>
        </div>

        {/* Flat List Items */}
        <div className="divide-y divide-neutral-100">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`group px-3 py-3 rounded-xl flex items-start gap-3 cursor-pointer transition-colors ${
                !item.read 
                  ? 'bg-neutral-50/70 hover:bg-neutral-100/70' 
                  : 'hover:bg-neutral-50'
              }`}
            >
              {/* Avatar atau Icon Outline */}
              <div className="relative shrink-0 mt-0.5">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.senderName || 'Avatar'}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200/80"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                    {renderTypeIcon(item.type)}
                  </div>
                )}

                {/* Mini Badge Icon Outline di Sudut Avatar jika ada foto */}
                {item.avatar && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white ring-1 ring-neutral-200 flex items-center justify-center">
                    {renderTypeIcon(item.type)}
                  </span>
                )}
              </div>

              {/* Konten Notifikasi */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className={`text-xs sm:text-sm tracking-tight truncate ${
                    !item.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-800'
                  }`}>
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-neutral-400 shrink-0 font-normal">
                    {item.timeAgo}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Konteks tautan ringkas bila ada target navigasi */}
                {item.targetPage && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-blue-600 transition-colors">
                    <span>Lihat di {item.targetPage === 'chat' ? 'Pesan' : item.targetPage === 'projects' ? 'Proyek' : 'Layanan'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Unread Indicator Titik Biru & Aksi Cepat Hapus */}
              <div className="flex items-center gap-1.5 shrink-0 self-center">
                {!item.read && (
                  <span 
                    className="w-2 h-2 rounded-full bg-blue-600 shrink-0" 
                    title="Belum dibaca"
                  />
                )}

                <button
                  onClick={(e) => deleteNotification(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-opacity cursor-pointer"
                  title="Hapus notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans flex flex-col">
      {/* Navbar rendered by (main) layout */}

      {/* Kontainer Notifikasi Minimalis (Satu Halaman Fokus) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-6 sm:py-8">
        
        {/* ========================================================== */}
        {/* HEADER NOTIFIKASI (CLEAN, MINIMAL, SEJAJAR DENGAN AKSI)    */}
        {/* ========================================================== */}
        <header className="pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
              Notifikasi
            </h1>
            {unreadCount > 0 ? (
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {unreadCount} belum dibaca
              </span>
            ) : (
              <span className="text-[11px] font-normal text-neutral-400">
                Semua terbaca
              </span>
            )}
          </div>

          {/* Aksi Tandai Semua Dibaca */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-blue-600 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-neutral-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Tandai semua sudah dibaca</span>
            </button>
          )}
        </header>

        {/* ========================================================== */}
        {/* FILTER RINGAN (NOTION / INSTAGRAM PILL TABS)               */}
        {/* ========================================================== */}
        <div className="flex items-center gap-1.5 py-3 border-b border-[#E2E8F0] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-[#0B1F3A] text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-[#0B1F3A] text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                activeFilter === 'unread' ? 'bg-[#123B8C] text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('collaboration')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'collaboration'
                ? 'bg-[#0B1F3A] text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Kolaborasi
          </button>

          <button
            onClick={() => setActiveFilter('messages')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'messages'
                ? 'bg-[#0B1F3A] text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Pesan
          </button>

          <button
            onClick={() => setActiveFilter('transactions')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'transactions'
                ? 'bg-[#0B1F3A] text-white font-medium'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Transaksi
          </button>
        </div>

        {/* ========================================================== */}
        {/* DAFTAR NOTIFIKASI TERKELOMPOK WAKTU                       */}
        {/* ========================================================== */}
        <div className="py-2 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 space-y-1">
              <p className="text-xs sm:text-sm font-medium text-neutral-600">
                Tidak ada notifikasi
              </p>
              <p className="text-xs text-neutral-400">
                Semua pembaruan pada filter ini telah dibaca atau belum tersedia.
              </p>
            </div>
          ) : (
            <>
              {renderNotificationGroup('Hari Ini', todayItems)}
              {renderNotificationGroup('Kemarin', yesterdayItems)}
              {renderNotificationGroup('Sebelumnya', earlierItems)}
            </>
          )}
        </div>

      </main>
    </div>
  );
};
