import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Send, 
  Paperclip, 
  CheckCheck, 
  ShieldCheck, 
  Briefcase, 
  X,
  Clock,
  Info,
  FileText,
  ExternalLink,
  MessageSquare,
  QrCode
} from 'lucide-react';
import { Navbar } from './Navbar';
import { InvoiceDetailPage } from './InvoiceDetailPage';
import { ActivePage, AuthState, ChatConversation, ChatInvoice, ChatMessage, Creator, CreatorService } from '../types';
import { MOCK_CREATORS } from '../data/mockCreators';

interface ChatPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

// Data awal percakapan yang mencerminkan alur percakapan, negosiasi, dan invoice resmi Creatorin
const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-cr-1',
    creatorId: 'cr-1',
    name: 'Sobakhul Munir Siroj',
    roleTitle: 'Product Designer & Framer Architect',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
    verified: true,
    online: true,
    lastSeen: 'Online',
    lastMessage: 'Berikut invoice resmi untuk pengerjaan project ini.',
    lastMessageTime: '10:45',
    unreadCount: 1,
    rate: 'Rp1.500.000/proyek',
    category: 'UI/UX & Framer',
    messages: [
      {
        id: 'm1-1',
        senderId: 'user',
        text: 'Halo Mas Munir, kami tertarik dengan layanan Premium Figma SaaS Landing Page untuk brand kami.',
        timestamp: '10:30',
        isSelf: true,
        status: 'read',
        serviceInquiry: {
          id: 'srv-1-1',
          title: 'Premium Figma SaaS Landing Page Template',
          price: 1500000,
          formattedPrice: 'Rp1.500.000',
          deliveryDays: '2 Hari Kerja',
          tag: 'Figma Template',
          coverImage: '/creatorin/service-pattern-1.png',
          description: 'Desain antarmuka landing page SaaS modern 20+ komponen responsif, auto-layout rapi, dan panduan variabel warna token.'
        }
      },
      {
        id: 'm1-2',
        senderId: 'cr-1',
        text: 'Halo! Terima kasih sudah menghubungi. Untuk paket ini sudah termasuk 20+ komponen responsif, auto-layout rapi, dan panduan variabel warna.',
        timestamp: '10:35',
        isSelf: false,
        status: 'read'
      },
      {
        id: 'm1-3',
        senderId: 'user',
        text: 'Bagus sekali. Apakah bisa diselaraskan dengan palet warna brand kami?',
        timestamp: '10:38',
        isSelf: true,
        status: 'read'
      },
      {
        id: 'm1-4',
        senderId: 'cr-1',
        text: 'Sangat bisa kak! Saya sudah siapkan style guide terpisah agar tinggal switch token warna.',
        timestamp: '10:42',
        isSelf: false,
        status: 'read',
        attachment: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
          name: 'Preview_Figma_Design_v1.png',
          size: '2.4 MB'
        }
      },
      {
        id: 'm1-5',
        senderId: 'user',
        text: 'Baik Mas Munir, kami sepakat dengan scope pengerjaan dan harganya. Silakan terbitkan invoice ya agar bisa kami proses ke Escrow.',
        timestamp: '10:44',
        isSelf: true,
        status: 'read'
      },
      {
        id: 'm1-6',
        senderId: 'cr-1',
        text: 'Siap kak, terima kasih atas kepercayaannya! Berikut invoice resmi untuk pengerjaan project ini. Setelah pembayaran masuk ke escrow, Collaboration Room akan otomatis aktif.',
        timestamp: '10:45',
        isSelf: false,
        status: 'delivered',
        invoice: {
          id: 'INV-882194',
          serviceTitle: 'Premium Figma SaaS Landing Page Template',
          amount: 'Rp1.500.000',
          status: 'unpaid',
          dueDate: '24 Jam',
          scopeSummary: '1 Proyek • Estimasi 2 Hari Kerja • 20+ Komponen Responsif & Style Guide'
        }
      }
    ]
  },
  {
    id: 'conv-cr-3',
    creatorId: 'cr-3',
    name: 'Maya Angelina',
    roleTitle: 'Beauty & Lifestyle UGC Creator',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    verified: true,
    online: true,
    lastSeen: 'Online',
    lastMessage: 'Draft hook video TikTok sudah saya sesuaikan dengan brief ya.',
    lastMessageTime: 'Kemarin',
    unreadCount: 0,
    rate: 'Rp450.000/video',
    category: 'Video UGC',
    messages: [
      {
        id: 'm3-1',
        senderId: 'user',
        text: 'Halo Maya! Kami ingin diskusi mengenai paket video UGC untuk produk serum brightening.',
        timestamp: '14:10',
        isSelf: true,
        status: 'read',
        serviceInquiry: {
          id: 'srv-3-1',
          title: '1x Video UGC Skincare & Beauty Routine',
          price: 450000,
          formattedPrice: 'Rp450.000',
          deliveryDays: '2 Hari Kerja',
          tag: 'UGC Video',
          coverImage: '/creatorin/service-pattern-4.png'
        }
      },
      {
        id: 'm3-2',
        senderId: 'cr-3',
        text: 'Halo kak! Senang bisa terhubung. Tekstur serumnya pas banget untuk konsep visual morning glow routine.',
        timestamp: '14:20',
        isSelf: false,
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-cr-2',
    creatorId: 'cr-2',
    name: 'Phenomenon Creative',
    roleTitle: 'Brand Strategy & Digital Visual',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=240&auto=format&fit=crop&q=80',
    verified: true,
    online: false,
    lastSeen: '1 jam lalu',
    lastMessage: '3 konsep alternatif identitas visual sudah selesai kami susun.',
    lastMessageTime: '13 Sep',
    unreadCount: 0,
    rate: 'Rp1.200.000/proyek',
    category: 'Branding',
    messages: [
      {
        id: 'm2-1',
        senderId: 'cr-2',
        text: '3 konsep alternatif identitas visual sudah selesai kami susun. Siap kami kirimkan untuk sesi feedback.',
        timestamp: '11:15',
        isSelf: false,
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-cr-4',
    creatorId: 'cr-4',
    name: 'Rian Prasetyo',
    roleTitle: 'FnB & Culinary Storytelling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    verified: true,
    online: false,
    lastSeen: 'Kemarin',
    lastMessage: 'Siap kak, jadwal take video ASMR b-roll kopi sudah saya jadwalkan.',
    lastMessageTime: '12 Sep',
    unreadCount: 0,
    rate: 'Rp350.000/video',
    category: 'FnB Video',
    messages: [
      {
        id: 'm4-1',
        senderId: 'cr-4',
        text: 'Siap kak, jadwal take video ASMR b-roll kopi sudah saya jadwalkan.',
        timestamp: '17:30',
        isSelf: false,
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-cr-5',
    creatorId: 'cr-5',
    name: 'Annisa Putri Rahayu',
    roleTitle: 'Product Catalog Photographer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    verified: false,
    online: false,
    lastSeen: '3 hari lalu',
    lastMessage: 'Hasil foto produk lookbook siap diunduh via Google Drive.',
    lastMessageTime: '10 Sep',
    unreadCount: 0,
    rate: 'Rp250.000/sesi',
    category: 'Fotografi',
    messages: [
      {
        id: 'm5-1',
        senderId: 'cr-5',
        text: 'Hasil foto produk lookbook siap diunduh via Google Drive resolusi penuh.',
        timestamp: '13:00',
        isSelf: false,
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-cr-6',
    creatorId: 'cr-6',
    name: 'Dimas Wicaksono',
    roleTitle: 'Tech Reviewer UGC',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
    verified: true,
    online: false,
    lastSeen: '5 hari lalu',
    lastMessage: 'Unit gadget sudah diterima di studio dengan aman.',
    lastMessageTime: '8 Sep',
    unreadCount: 0,
    rate: 'Rp500.000/video',
    category: 'Tech UGC',
    messages: [
      {
        id: 'm6-1',
        senderId: 'cr-6',
        text: 'Unit gadget sudah diterima di studio dengan aman. Besok langsung masuk tahap unboxing.',
        timestamp: '15:20',
        isSelf: false,
        status: 'read'
      }
    ]
  }
];

export const ChatPage: React.FC<ChatPageProps> = ({
  currentUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isRightSidebarOpenMobile, setIsRightSidebarOpenMobile] = useState(false);
  
  // State untuk modal detail layanan
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<CreatorService | null>(null);

  // State untuk notifikasi sukses masuk Collaboration Room setelah bayar invoice
  const [collaborationNotice, setCollaborationNotice] = useState<{
    invoiceId: string;
    serviceTitle: string;
    amount: string;
  } | null>(null);

  // State untuk Halaman Detail Invoice (Barcode, QRIS & Multi Metode Pembayaran)
  const [activeInvoiceDetail, setActiveInvoiceDetail] = useState<{
    invoice: ChatInvoice;
    messageId: string;
    creatorName: string;
    creatorRole: string;
    creatorAvatar: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = activeChatId ? (conversations.find(c => c.id === activeChatId) || null) : null;
  const activeCreator = activeConversation ? (MOCK_CREATORS.find(cr => cr.id === activeConversation.creatorId) || null) : null;

  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  // Kirim pesan teks sederhana
  const handleSendMessage = (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!messageContent) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      status: 'sent'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          lastMessage: messageContent,
          lastMessageTime: 'Baru saja',
          messages: [...conv.messages, newMessage]
        };
      }
      return conv;
    }));

    setInputText('');

    // Simulasi respon kontekstual kreator
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeChatId) {
          const autoReply: ChatMessage = {
            id: `reply-${Date.now()}`,
            senderId: conv.creatorId,
            text: 'Baik kak, pesan sudah saya terima. Saya pelajari dan segera saya tindak lanjuti.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
            status: 'delivered'
          };
          return {
            ...conv,
            lastMessage: autoReply.text,
            lastMessageTime: 'Baru saja',
            messages: [...conv.messages, autoReply]
          };
        }
        return conv;
      }));
    }, 1200);
  };

  // Masukkan diskusi layanan dari sidebar kanan ke room chat (fokus diskusi & negosiasi, bukan checkout)
  const handleDiscussService = (service: CreatorService) => {
    if (!activeCreator || !activeChatId) return;
    const serviceMessage: ChatMessage = {
      id: `srv-${Date.now()}`,
      senderId: 'user',
      text: `Halo ${activeCreator.name}, saya tertarik mendiskusikan layanan "${service.title}" (${service.formattedPrice}). Apakah slot pengerjaan tersedia dan bisa disesuaikan dengan brief brand kami?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      status: 'sent',
      serviceInquiry: service
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          lastMessage: `Mendiskusikan: ${service.title}`,
          lastMessageTime: 'Baru saja',
          messages: [...conv.messages, serviceMessage]
        };
      }
      return conv;
    }));

    setIsRightSidebarOpenMobile(false);

    // Respon otomatis kreator: menawarkan diskusi brief & siap membuatkan invoice jika deal
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeChatId) {
          const autoReply: ChatMessage = {
            id: `reply-srv-${Date.now()}`,
            senderId: conv.creatorId,
            text: `Halo kak! Untuk layanan "${service.title}" slot pengerjaan tersedia (estimasi ${service.deliveryDays || '2-3 hari kerja'}). Boleh bagikan referensi atau brief detailnya? Jika scope sudah cocok, saya akan langsung terbitkan invoice resmi di sini agar terlindungi Creatorin Escrow.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
            status: 'delivered'
          };
          return {
            ...conv,
            lastMessage: autoReply.text,
            lastMessageTime: 'Baru saja',
            messages: [...conv.messages, autoReply]
          };
        }
        return conv;
      }));
    }, 1200);
  };

  // Creator membuat invoice di room chat ketika kesepakatan tercapai
  const handleCreateDraftInvoice = (service: CreatorService) => {
    if (!activeConversation || !activeChatId) return;
    const invoiceMsg: ChatMessage = {
      id: `inv-${Date.now()}`,
      senderId: activeConversation.creatorId,
      text: `Saya telah menerbitkan invoice resmi untuk pengerjaan "${service.title}". Silakan periksa rincian dan selesaikan pembayaran escrow untuk langsung mengaktifkan Collaboration Room.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
      status: 'delivered',
      invoice: {
        id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        serviceTitle: service.title,
        amount: service.formattedPrice,
        status: 'unpaid',
        dueDate: '24 Jam',
        scopeSummary: `1 Proyek • Estimasi ${service.deliveryDays || '2-3 Hari Kerja'} • Termasuk Revisi Terarah`
      }
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          lastMessage: `Invoice diterbitkan: ${service.title}`,
          lastMessageTime: 'Baru saja',
          messages: [...conv.messages, invoiceMsg]
        };
      }
      return conv;
    }));
  };

  // Membuka Halaman Detail Invoice resmi yang memuat Barcode & Beragam Metode Pembayaran
  const handleOpenInvoiceDetail = (messageId: string, invoice: ChatInvoice) => {
    setActiveInvoiceDetail({
      invoice,
      messageId,
      creatorName: activeConversation?.name || 'Sobakhul Munir Siroj',
      creatorRole: activeConversation?.roleTitle || 'Product Designer & Framer Architect',
      creatorAvatar: activeConversation?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80'
    });
  };

  // UMKM Membayar Invoice di Room Chat -> Masuk ke Escrow & Mengaktifkan Collaboration Room
  const handlePayInvoice = (messageId: string, invoice: ChatInvoice) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        const updatedMessages = conv.messages.map(msg => {
          if (msg.id === messageId && msg.invoice) {
            return {
              ...msg,
              invoice: {
                ...msg.invoice,
                status: 'paid' as const
              }
            };
          }
          return msg;
        });

        const systemNotice: ChatMessage = {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          text: `Pembayaran ${invoice.amount} untuk ${invoice.serviceTitle} telah diamankan di Rekening Escrow Creatorin. Proyek resmi dimulai dan Collaboration Room telah aktif!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          status: 'read'
        };

        return {
          ...conv,
          lastMessage: `Pembayaran invoice ${invoice.id} berhasil`,
          lastMessageTime: 'Baru saja',
          messages: [...updatedMessages, systemNotice]
        };
      }
      return conv;
    }));

    setCollaborationNotice({
      invoiceId: invoice.id,
      serviceTitle: invoice.serviceTitle,
      amount: invoice.amount
    });
  };

  const handleSelectConversation = (id: string) => {
    setActiveChatId(id);
    setIsMobileChatOpen(true);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterUnreadOnly) {
      return matchesSearch && c.unreadCount > 0;
    }
    return matchesSearch;
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="h-screen flex flex-col bg-white text-[#0d0c22] font-sans overflow-hidden">
      {/* Navbar Global */}
      <Navbar
        currentUser={currentUser}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />

      {/* Kontainer 3 Kolom Terstruktur */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        
        {/* ========================================================== */}
        {/* KOLOM 1: SIDEBAR KIRI (DAFTAR PERCAKAPAN - PALING KECIL)   */}
        {/* ========================================================== */}
        <aside className={`w-full md:w-[280px] lg:w-[300px] xl:w-[320px] shrink-0 border-r border-neutral-200 flex flex-col bg-white ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header Sidebar Ringkas */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-neutral-900 tracking-tight">Pesan</h1>
              {totalUnreadCount > 0 && (
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {totalUnreadCount} baru
                </span>
              )}
            </div>

            {/* Filter Toggle Sederhana */}
            <button
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterUnreadOnly 
                  ? 'bg-neutral-900 text-white font-medium' 
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Belum dibaca
            </button>
          </div>

          {/* Kotak Pencarian Bersih */}
          <div className="p-3 border-b border-neutral-100">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari percakapan..."
                className="w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 rounded-lg pl-9 pr-3 py-1.5 border border-neutral-200/80 focus:border-neutral-400 focus:outline-hidden transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Daftar Percakapan Flat & Minimalis */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Tidak ada percakapan ditemukan.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeChatId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-neutral-100 text-neutral-900' 
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {/* Avatar dengan status dot */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                      )}
                    </div>

                    {/* Informasi Teks */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                          {conv.name}
                        </span>
                        <span className="text-[11px] text-neutral-400 shrink-0 font-normal ml-1">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}>
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </aside>

        {/* ========================================================== */}
        {/* KOLOM 2: ROOM CHAT UTAMA ATAU TAMPILAN PREVIEW AWAL       */}
        {/* ========================================================== */}
        {!activeConversation || !activeCreator ? (
          <section className={`flex-1 flex flex-col items-center justify-center bg-white min-w-0 p-6 sm:p-12 text-center select-none ${
            isMobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="max-w-md w-full flex flex-col items-center">
              
              {/* Minimal Clean Icon Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-neutral-100 flex items-center justify-center border border-neutral-200/80 mb-6 shadow-2xs">
                <MessageSquare className="w-8 h-8 sm:w-9 sm:h-9 text-neutral-800" strokeWidth={1.75} />
              </div>

              {/* Creatorin Logo Text with Signature Blue Dot */}
              <div className="flex items-center gap-1.5 justify-center mb-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0d0c22] font-serif italic">
                  Creatorin
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block -ml-0.5 mt-2"></span>
              </div>

              {/* Headline Ringkas & Sederhana */}
              <p className="text-xs sm:text-sm text-neutral-400 font-normal">
                Pilih percakapan di sebelah kiri untuk mulai berkirim pesan
              </p>
            </div>
          </section>
        ) : (
          <section className={`flex-1 flex flex-col bg-white min-w-0 ${
            !isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}>
          
          {/* HEADER CHAT RINGKAS */}
          <header className="h-[60px] px-6 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Tombol kembali mobile */}
              <button
                onClick={() => setIsMobileChatOpen(false)}
                className="md:hidden p-1 -ml-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div 
                onClick={() => {
                  if (onViewCreatorProfile) {
                    onViewCreatorProfile(activeCreator);
                  }
                }}
                className="flex items-center gap-3 cursor-pointer group min-w-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  {activeConversation.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition truncate">
                    {activeConversation.name}
                  </h2>
                  <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1.5">
                    <span className={activeConversation.online ? 'text-emerald-600 font-medium' : 'text-neutral-400'}>
                      {activeConversation.online ? 'Online' : activeConversation.lastSeen}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-neutral-500">{activeConversation.category}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Aksi Sisi Kanan: Tombol Profil & Toggle Layanan di Layar Kecil */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRightSidebarOpenMobile(!isRightSidebarOpenMobile)}
                className="xl:hidden inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
                title="Lihat Layanan Creator"
              >
                <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Layanan</span>
              </button>

              <button
                onClick={() => {
                  if (onViewCreatorProfile) {
                    onViewCreatorProfile(activeCreator);
                  }
                }}
                className="text-xs font-medium text-neutral-700 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
              >
                Lihat Profil
              </button>

              {/* Tombol Tutup Chat untuk Kembali ke Preview Bersih */}
              <button
                onClick={() => {
                  setActiveChatId(null);
                  setIsMobileChatOpen(false);
                }}
                className="hidden sm:inline-flex items-center justify-center p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer ml-1"
                title="Tutup Ruang Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* AREA PESAN CHAT (WHITESPACE LUAS & FOKUS PERCAKAPAN) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-white">
            
            {/* Tanggal Ringkas */}
            <div className="flex items-center justify-center my-2">
              <span className="text-[11px] text-neutral-400 font-normal">
                Hari ini
              </span>
            </div>

            {/* Render Pesan */}
            {activeConversation.messages.map((msg) => {
              if (msg.senderId === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-2 px-4">
                    <div className="max-w-md p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs text-center flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  {/* Bubble Chat Sederhana */}
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    msg.isSelf 
                      ? 'bg-[#0d0c22] text-white rounded-tr-xs' 
                      : 'bg-neutral-100 text-neutral-900 rounded-tl-xs'
                  }`}>
                    
                    {/* Kartu Referensi Layanan Ringkas di Dalam Bubble */}
                    {msg.serviceInquiry && (
                      <div className="mb-2.5 p-2.5 rounded-xl bg-white text-neutral-900 border border-neutral-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {msg.serviceInquiry.coverImage && (
                            <img
                              src={msg.serviceInquiry.coverImage}
                              alt={msg.serviceInquiry.title}
                              className="w-10 h-10 rounded-md object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-900 truncate">
                              {msg.serviceInquiry.title}
                            </p>
                            <p className="text-xs font-medium text-blue-600">
                              {msg.serviceInquiry.formattedPrice}
                              {msg.serviceInquiry.deliveryDays && (
                                <span className="text-neutral-400 font-normal text-[11px] ml-1.5">
                                  • {msg.serviceInquiry.deliveryDays}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedServiceDetail(msg.serviceInquiry!)}
                          className="px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors shrink-0 cursor-pointer"
                        >
                          Detail
                        </button>
                      </div>
                    )}

                    {/* Attachment Gambar Bersih */}
                    {msg.attachment && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-neutral-200/40">
                        {msg.attachment.type === 'image' && (
                          <img
                            src={msg.attachment.url}
                            alt={msg.attachment.name}
                            className="w-full max-h-56 object-cover"
                          />
                        )}
                        <div className="p-1.5 bg-neutral-900/80 text-[11px] text-white flex justify-between">
                          <span className="truncate">{msg.attachment.name}</span>
                          <span className="text-neutral-300 ml-2">{msg.attachment.size}</span>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* INVOICE RESMI CREATORIN DI ROOM CHAT (SETELAH KESEPAKATAN) */}
                    {msg.invoice && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white border border-neutral-200/90 text-neutral-900 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="text-xs font-semibold text-neutral-800">
                              Invoice #{msg.invoice.id}
                            </span>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            msg.invoice.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}>
                            {msg.invoice.status === 'paid' ? '✓ Escrow Terbayar' : 'Menunggu Pembayaran'}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-neutral-900">
                            {msg.invoice.serviceTitle}
                          </p>
                          {msg.invoice.scopeSummary && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {msg.invoice.scopeSummary}
                            </p>
                          )}
                          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-neutral-100">
                            <span className="text-xs text-neutral-500">Total Kesepakatan:</span>
                            <span className="text-sm font-bold text-neutral-900">
                              {msg.invoice.amount}
                            </span>
                          </div>
                        </div>

                        {/* Aksi Pembayaran Escrow atau Buka Collaboration Room */}
                        {msg.invoice.status === 'unpaid' ? (
                          <div className="space-y-1.5 pt-1">
                            <button
                              onClick={() => handleOpenInvoiceDetail(msg.id, msg.invoice!)}
                              className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Bayar Invoice (Escrow Terproteksi)</span>
                            </button>
                            <p className="text-[10px] text-neutral-400 text-center">
                              Termasuk QRIS, Barcode pembayaran, dan Virtual Account Bank.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Dana diamankan di Escrow. Collaboration Room aktif.</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => handleOpenInvoiceDetail(msg.id, msg.invoice!)}
                                className="w-full py-2 px-2.5 rounded-lg text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <FileText className="w-3 h-3 text-neutral-500" />
                                <span>Rincian Tagihan</span>
                              </button>
                              <button
                                onClick={() => onNavigate('collaboration-room')}
                                className="w-full py-2 px-2.5 rounded-lg text-xs font-semibold text-white bg-[#0d0c22] hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <span>Masuk Room</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Timestamp & Status Centang */}
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                    <span>{msg.timestamp}</span>
                    {msg.isSelf && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================== */}
          {/* COMPOSER BERSIH (HANYA ATTACHMENT + INPUT + KIRIM)        */}
          {/* ========================================================== */}
          <footer className="p-3 sm:p-4 border-t border-neutral-200 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Tombol Lampirkan File / Gambar */}
              <button
                type="button"
                onClick={() => alert('Pilih lampiran file atau referensi brief untuk dikirim ke ruang chat.')}
                className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Lampirkan File"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Input Teks Pesan */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Tulis pesan untuk ${activeConversation.name}...`}
                className="flex-1 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 rounded-lg px-3.5 py-2 border border-neutral-200/80 focus:border-neutral-400 focus:outline-hidden transition"
              />

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                  inputText.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <span>Kirim</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </footer>

        </section>
        )}

        {/* ========================================================== */}
        {/* KOLOM 3: SIDEBAR KANAN "LAYANAN CREATOR" (PANEL PENDUKUNG) */}
        {/* ========================================================== */}
        {activeConversation && activeCreator && (
          <aside className={`w-[300px] lg:w-[320px] xl:w-[330px] shrink-0 border-l border-neutral-200 bg-white flex flex-col ${
            isRightSidebarOpenMobile ? 'fixed inset-y-0 right-0 z-40 flex shadow-xl md:shadow-none' : 'hidden xl:flex'
          }`}>
            
            {/* HEADER SIDEBAR KANAN (HANYA SECTION HEADLINE) */}
            <div className="px-4 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                Layanan Creator
              </h3>
              
              {/* Tombol tutup jika di mobile/tablet */}
              <button
                onClick={() => setIsRightSidebarOpenMobile(false)}
                className="xl:hidden p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer"
                title="Tutup sidebar layanan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DAFTAR LAYANAN PENDUKUNG (COMPACT CARDS, TANPA PROFIL/ESCROW BANNER) */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {activeCreator.services && activeCreator.services.length > 0 ? (
                activeCreator.services.map((service) => (
                  <div
                    key={service.id}
                    className="p-3 rounded-xl border border-neutral-200/80 hover:border-neutral-300 bg-white transition-colors text-left space-y-2.5"
                  >
                    {/* Thumbnail & Informasi Ringkas */}
                    <div className="flex items-start gap-2.5">
                      {service.coverImage && (
                        <img
                          src={service.coverImage}
                          alt={service.title}
                          className="w-12 h-12 rounded-lg object-cover ring-1 ring-neutral-100 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-snug">
                          {service.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500">
                          {service.tag && (
                            <span className="font-medium text-neutral-600">{service.tag}</span>
                          )}
                          {service.tag && service.deliveryDays && (
                            <span className="text-neutral-300">•</span>
                          )}
                          {service.deliveryDays && (
                            <span className="text-neutral-400">{service.deliveryDays}</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-neutral-900 mt-1">
                          {service.formattedPrice}
                        </p>
                      </div>
                    </div>

                    {/* CTA: "Lihat Detail" & "Diskusikan" (Bukan Tombol Beli/Order) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => setSelectedServiceDetail(service)}
                        className="flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 text-center transition-colors cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                      <button
                        onClick={() => handleDiscussService(service)}
                        className="flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 text-center transition-colors cursor-pointer"
                      >
                        Diskusikan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                  Belum ada paket layanan terdaftar dari creator ini.
                </div>
              )}

            </div>

          </aside>
        )}

      </div>

      {/* ========================================================== */}
      {/* MODAL LIHAT DETAIL LAYANAN (CLEAN & NON-MARKETPLACE)       */}
      {/* ========================================================== */}
      {selectedServiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-5 shadow-xl animate-in fade-in zoom-in-95 duration-100 space-y-4">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  {selectedServiceDetail.tag || 'Layanan Creator'}
                </span>
                <h3 className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {selectedServiceDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedServiceDetail(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            {selectedServiceDetail.coverImage && (
              <div className="rounded-xl overflow-hidden border border-neutral-100">
                <img
                  src={selectedServiceDetail.coverImage}
                  alt={selectedServiceDetail.title}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            {/* Rincian Harga Referensi & Waktu Pengerjaan */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-400 text-[11px] block">Estimasi Biaya</span>
                <span className="font-semibold text-neutral-900 text-sm">
                  {selectedServiceDetail.formattedPrice}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block">Waktu Pengerjaan</span>
                <span className="font-medium text-neutral-700 text-xs mt-0.5 block">
                  {selectedServiceDetail.deliveryDays || '2-3 Hari Kerja'}
                </span>
              </div>
            </div>

            {/* Deskripsi & Ruang Lingkup */}
            <div className="text-xs text-neutral-600 space-y-1.5 leading-relaxed">
              <p className="font-medium text-neutral-800">Ruang Lingkup & Pengerjaan:</p>
              <p className="text-neutral-500">
                {selectedServiceDetail.description || 
                  'Paket layanan mencakup konsultasi brief kebutuhan, eksplorasi konsep kreatif, revisi terarah, serta penyerahan file deliverable beresolusi tinggi siap pakai.'}
              </p>
            </div>

            {/* Catatan Alur Diskusi */}
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Diskusikan brief dan penyesuaian kebutuhan di room chat. Creator akan membuat invoice resmi setelah kedua pihak sepakat.
              </span>
            </div>

            {/* Tombol Aksi Modal: Hanya Tutup & Diskusikan di Chat */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setSelectedServiceDetail(null)}
                className="px-3.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-md cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleDiscussService(selectedServiceDetail);
                  setSelectedServiceDetail(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
              >
                Diskusikan di Chat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL NOTIFIKASI COLLABORATION ROOM AKTIF (SETELAH BAYAR)  */}
      {/* ========================================================== */}
      {collaborationNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 p-5 shadow-xl animate-in fade-in zoom-in-95 duration-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Collaboration Room Aktif!
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Pembayaran {collaborationNotice.amount} untuk <strong>{collaborationNotice.serviceTitle}</strong> telah diamankan di Rekening Escrow Creatorin.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl text-left text-xs text-neutral-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Nomor Invoice:</span>
                <span className="font-semibold text-neutral-800">#{collaborationNotice.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Status Escrow:</span>
                <span className="font-semibold text-emerald-600">Tersimpan Aman</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Workspace:</span>
                <span className="font-semibold text-neutral-800">Brief & Approval Aktif</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCollaborationNotice(null)}
                className="flex-1 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                Tetap di Chat
              </button>
              <button
                onClick={() => {
                  setCollaborationNotice(null);
                  onNavigate('collaboration-room');
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Ke Collaboration Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL / HALAMAN DETAIL INVOICE (BARCODE & MULTI METODE)   */}
      {/* ========================================================== */}
      {activeInvoiceDetail && (
        <div className="fixed inset-0 z-50 bg-[#f8f9fa] overflow-y-auto animate-in fade-in duration-150">
          <InvoiceDetailPage
            currentUser={currentUser}
            onSignOut={onSignOut}
            onNavigate={(page) => {
              setActiveInvoiceDetail(null);
              onNavigate(page);
            }}
            invoiceData={{
              id: activeInvoiceDetail.invoice.id,
              serviceTitle: activeInvoiceDetail.invoice.serviceTitle,
              amount: activeInvoiceDetail.invoice.amount,
              status: activeInvoiceDetail.invoice.status,
              dueDate: activeInvoiceDetail.invoice.dueDate,
              scopeSummary: activeInvoiceDetail.invoice.scopeSummary,
              creatorName: activeInvoiceDetail.creatorName,
              creatorRole: activeInvoiceDetail.creatorRole,
              creatorAvatar: activeInvoiceDetail.creatorAvatar,
              clientName: currentUser?.name || 'Dimas Wicaksono',
              clientBrand: 'Kopi Kenangan Senja (UMKM)',
              messageId: activeInvoiceDetail.messageId
            }}
            onPaymentSuccess={(invoiceId, messageId) => {
              if (messageId) {
                handlePayInvoice(messageId, activeInvoiceDetail.invoice);
              }
            }}
            onClose={() => setActiveInvoiceDetail(null)}
          />
        </div>
      )}

    </div>
  );
};
