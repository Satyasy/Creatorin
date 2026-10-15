'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useSuccessModal } from '@/providers/SuccessModalProvider';
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
  QrCode,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  ListChecks,
  Handshake,
  Upload,
  Download,
  ArrowRight,
  Plus,
  FileCheck2,
  ShoppingBag
} from 'lucide-react';
import { InvoiceDetailPage } from './InvoiceDetailPage';
import { CollaborationRoomView } from '@/components/collaboration/CollaborationRoomView';
import { ActivePage, AuthState, ChatConversation, ChatInvoice, ChatMessage, Creator, CreatorService } from '@/types';
import { toCreator } from '@/services/creatorService';
import { chatService } from '@/services/chatService';
import { DEFAULT_CREATORS } from '@/data/defaultCreators';
import { aiSummarizeService } from '@/services/aiSummarizeService';
import { formatCoin, formatCoinWithIcon } from '@/lib/coin';
import { AuthModal } from '@/components/modals/AuthModal';
import { startRouteProgress } from '@/components/common/RouteProgressBar';

interface ChatPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get('conversationId');
  const targetCreatorId = searchParams.get('creatorId');
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;
  const { showToast } = useToast();
  const { showSuccessModal } = useSuccessModal();

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) onNavigate(page);
    else router.push(path);
  };

  const handleCreatorClick = (creator: Creator) => {
    if (onViewCreatorProfile) onViewCreatorProfile(creator);
    else {
      startRouteProgress();
      router.push(`/creator/${creator.id}`);
    }
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isRightSidebarOpenMobile, setIsRightSidebarOpenMobile] = useState(false);

  // Tab View Mode: 'chat' | 'collaboration'
  const [activeViewMode, setActiveViewMode] = useState<'chat' | 'collaboration'>('chat');
  const [activePaidInvoice, setActivePaidInvoice] = useState<ChatInvoice | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Invoice DP Modal State (Default: 1.500 Koin = Rp1.500.000)
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [invoiceFormTitle, setInvoiceFormTitle] = useState('');
  const [invoiceFormTotal, setInvoiceFormTotal] = useState('1500');
  const [invoiceFormDpPercent, setInvoiceFormDpPercent] = useState<number>(50);
  const [invoiceFormScope, setInvoiceFormScope] = useState('');
  const [invoiceFormDays, setInvoiceFormDays] = useState<number>(3);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  
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
  const activeCreator = activeConversation ? toCreator({ id: activeConversation.creatorId, fullName: activeConversation.name, avatarUrl: activeConversation.avatar, headline: activeConversation.roleTitle }) : null;

  // Derivasi Role di Percakapan Aktif: Kreator vs UMKM
  const myRole = activeConversation?.myRole || (currentUser?.role === 'creator' ? 'creator' : 'umkm');
  const isCreatorInRoom = myRole === 'creator';
  const isUmkmInRoom = myRole === 'umkm';

  // State untuk AI Summarize Obrolan di Bar Kanan
  const [chatSummaryData, setChatSummaryData] = useState<{
    executiveSummary: string;
    agreements: string[];
    actionItems: { task: string; assignee: string; status: 'pending' | 'in_progress' | 'completed' }[];
    lastRevisionNotes?: string;
    modelUsed: string;
    generatedAt: string;
  } | null>(null);
  const [isChatSummarizing, setIsChatSummarizing] = useState(false);
  const [isChatSummaryCopied, setIsChatSummaryCopied] = useState(false);

  // Generate live summary for active conversation
  const handleGenerateChatSummary = async () => {
    if (!activeConversation) return;
    setIsChatSummarizing(true);
    try {
      const messages = activeConversation.messages.map(m => ({
        sender: m.isSelf ? 'Anda (UMKM)' : activeConversation.name,
        text: m.text,
        time: m.timestamp,
      }));

      const data = await aiSummarizeService.summarizeConversation({
        roomId: activeConversation.id,
        projectTitle: activeConversation.category || 'Diskusi Kolaborasi',
        creatorName: activeConversation.name,
        businessBrand: 'Anda (UMKM)',
        messages,
      });
      setChatSummaryData(data);
    } catch {
      // Fallback
    } finally {
      setIsChatSummarizing(false);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      handleGenerateChatSummary();
    }
  }, [activeChatId]);

  // 1. Fetch conversations from live database with fallback & auto-select from query
  useEffect(() => {
    if (!currentUser) return;
    const partnerNameParam = searchParams.get('name') || '';
    const partnerAvatarParam = searchParams.get('avatar') || '';
    const partnerRoleTitleParam = searchParams.get('roleTitle') || '';
    const partnerRoleParam = searchParams.get('role') || '';

    const ensureConversationInList = (list: ChatConversation[]): { updatedList: ChatConversation[]; matchedId: string } => {
      let finalConvs = [...list];
      let matchedId = '';
      if (targetConvId) {
        const found = finalConvs.find(c => c.id === targetConvId);
        if (found) matchedId = found.id;
        else matchedId = targetConvId;
      }

      if (!matchedId && targetCreatorId) {
        const found = finalConvs.find(c => c.creatorId === targetCreatorId || c.partnerId === targetCreatorId || c.id === `conv-${targetCreatorId}`);
        if (found) matchedId = found.id;
        else matchedId = `conv-${targetCreatorId}`;
      }

      // Pastikan matchedId benar-benar ada di dalam array finalConvs agar activeConversation ter-render sempurna
      if (matchedId && !finalConvs.some(c => c.id === matchedId)) {
        const localMatch = chatService.getLocalConversations().find(
          c => c.id === matchedId || c.creatorId === targetCreatorId || c.partnerId === targetCreatorId
        );
        if (localMatch) {
          finalConvs = [localMatch, ...finalConvs];
        } else {
          const defaultCreator = targetCreatorId ? DEFAULT_CREATORS.find(c => c.id === targetCreatorId) : null;
          const pName = partnerNameParam || defaultCreator?.name || 'Mitra Kolaborasi';
          const pAvatar = partnerAvatarParam || defaultCreator?.avatar || '';
          const pRole = partnerRoleParam || (currentUser?.role === 'creator' ? 'umkm' : 'creator');
          const pRoleTitle = partnerRoleTitleParam || defaultCreator?.roleTitle || (pRole === 'umkm' ? 'UMKM Brand' : 'Kreator');

          const fallbackConv: ChatConversation = {
            id: matchedId,
            creatorId: targetCreatorId || matchedId.replace('conv-', ''),
            partnerId: targetCreatorId || matchedId.replace('conv-', ''),
            partnerRole: pRole,
            myRole: currentUser?.role === 'creator' ? 'creator' : 'umkm',
            name: pName,
            roleTitle: pRoleTitle,
            avatar: pAvatar,
            online: true,
            lastMessage: 'Ruang obrolan telah dibuka. Silakan sampaikan pesan Anda.',
            lastMessageTime: 'Baru saja',
            unreadCount: 0,
            messages: [
              {
                id: `msg-welcome-${Date.now()}`,
                senderId: targetCreatorId || 'partner',
                text: `Halo! Ruang obrolan telah dibuka. Silakan sampaikan pesan atau kebutuhan proyek Anda di sini.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSelf: false,
                status: 'delivered',
              }
            ],
          };
          finalConvs = [fallbackConv, ...finalConvs];
        }
      }

      return { updatedList: finalConvs, matchedId };
    };

    chatService.getConversations(currentUser).then((loadedConvs) => {
      const { updatedList, matchedId } = ensureConversationInList(loadedConvs);
      setConversations(updatedList);
      if (matchedId) {
        setActiveChatId(matchedId);
        setIsMobileChatOpen(true);
      }
    }).catch(() => {
      const localConvs = chatService.getLocalConversations();
      const { updatedList, matchedId } = ensureConversationInList(localConvs);
      setConversations(updatedList);
      if (matchedId) {
        setActiveChatId(matchedId);
        setIsMobileChatOpen(true);
      }
    });
  }, [targetConvId, targetCreatorId, currentUser, searchParams]);

  // 2. Realtime listener for active database conversation and message loader
  useEffect(() => {
    if (!activeChatId) return;

    // Load initial messages (supports both DB and local storage conversations)
    chatService.getMessages(activeChatId, currentUser?.id).then((msgs) => {
      if (msgs && msgs.length > 0) {
        setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: msgs } : c));
      }
      // Mark messages as read upon opening chat
      chatService.markMessagesAsRead(activeChatId);
    });

    const isDbConversation = activeChatId.length > 20 && !activeChatId.startsWith('conv-');
    if (!isDbConversation) return;

    const unsubscribe = chatService.subscribeToMessages(activeChatId, (event) => {
      if (event.type === 'NEW_MESSAGE' && event.message) {
        const raw = event.message;
        const meta = raw.metadata || {};
        const isSelf = raw.sender_id === (currentUser as any)?.id || raw.senderId === (currentUser as any)?.id;
        const incoming: ChatMessage = {
          id: raw.id,
          senderId: raw.sender_id || raw.senderId,
          text: raw.content,
          timestamp: new Date(raw.created_at || raw.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf,
          status: raw.is_read || raw.isRead ? 'read' : 'delivered',
          attachment: meta.attachment || (raw.attachment_url ? { type: 'file', url: raw.attachment_url, name: 'Lampiran' } : undefined),
          invoice: meta.invoice || undefined,
          serviceInquiry: meta.serviceInquiry || undefined,
          metadata: meta,
        };

        setConversations(prev => prev.map(c => {
          if (c.id === activeChatId) {
            return {
              ...c,
              lastMessage: incoming.text,
              lastMessageTime: incoming.timestamp,
              messages: [...c.messages.filter(m => m.id !== incoming.id), incoming],
            };
          }
          return c;
        }));

        // If message is from partner, mark it as read immediately
        if (!isSelf) {
          chatService.markMessagesAsRead(activeChatId);
        }
      } else if (event.type === 'MESSAGES_READ') {
        // Partner read our messages: update ticks to blue
        const readBy = event.readBy;
        if (readBy && readBy !== (currentUser as any)?.id) {
          setConversations(prev => prev.map(c => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: c.messages.map(m => m.isSelf ? { ...m, status: 'read' } : m),
              };
            }
            return c;
          }));
        }
      } else if (event.type === 'POLL_SYNC' && event.messages) {
        const synced: ChatMessage[] = event.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: m.senderId === (currentUser as any)?.id,
          status: m.isRead ? 'read' : 'delivered',
          attachment: m.attachmentUrl ? { type: 'file', url: m.attachmentUrl, name: 'Lampiran' } : undefined,
          metadata: m.metadata || {},
        }));
        setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: synced } : c));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeChatId, currentUser]);

  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  // Kirim pesan teks sederhana
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!messageContent || !activeChatId) return;
    const result = await chatService.sendMessage(activeChatId, messageContent);
    if (!result.success) {
      showToast({
        type: 'error',
        title: 'Gagal Mengirim Pesan',
        message: result.error || 'Terjadi gangguan koneksi saat mengirim pesan.',
      });
      return;
    }

    const newMessage: ChatMessage = {
      id: result.message?.id || `msg-${Date.now()}`,
      senderId: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      status: 'delivered'
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

  };

  // Upload Lampiran Berkas / Foto di Obrolan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    // Reset input agar file yang sama bisa dipilih ulang jika perlu
    e.target.value = '';

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'chat');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast({
          type: 'error',
          title: 'Gagal Mengunggah Berkas',
          message: data.error || 'Berkas tidak dapat disimpan di server.',
        });
        return;
      }

      const isImage = data.fileType === 'image';
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const attachmentPayload = {
        type: isImage ? ('image' as const) : ('file' as const),
        url: data.url,
        name: data.fileName || file.name,
        size: formattedSize,
      };

      const msgText = isImage ? `[Foto: ${file.name}]` : `[Dokumen: ${file.name}]`;
      const result = await chatService.sendMessage(
        activeChatId,
        msgText,
        { type: 'attachment', attachment: attachmentPayload },
        data.url
      );

      const newMessage: ChatMessage = {
        id: result.message?.id || `msg-${Date.now()}`,
        senderId: currentUser?.id || 'user',
        text: msgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        status: 'sent',
        attachment: attachmentPayload,
        metadata: { type: 'attachment', attachment: attachmentPayload },
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeChatId) {
          return {
            ...conv,
            lastMessage: msgText,
            lastMessageTime: 'Baru saja',
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      }));
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Mengunggah Berkas',
        message: err.message || 'Terjadi kendala saat mengunggah berkas.',
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Membuka modal ajukan kesepakatan invoice DP
  const handleOpenCreateInvoiceModal = () => {
    if (!activeConversation) return;
    setInvoiceFormTitle(activeConversation.category ? `Proyek ${activeConversation.category}` : 'Kesepakatan Pengerjaan Proyek');
    setInvoiceFormTotal('1500'); // 1.500 Koin
    setInvoiceFormDpPercent(50);
    setInvoiceFormScope('Pengerjaan konten kreatif sesuai brief yang disepakati, termasuk 2 kali kuota revisi minor.');
    setInvoiceFormDays(3);
    setIsCreateInvoiceModalOpen(true);
  };

  // Mengirim pengajuan invoice DP ke bubble chat dan database
  const handleSendInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !activeConversation) return;

    setIsSendingInvoice(true);
    try {
      const inputVal = parseInt(invoiceFormTotal.replace(/[^0-9]/g, ''), 10) || 1500;
      // Convert to Coin (if user inputted e.g. 1500000, convert to 1500 coins; otherwise use coin value)
      const cleanTotalCoin = inputVal > 50000 ? Math.round(inputVal / 1000) : inputVal;
      const dpCoin = Math.round((cleanTotalCoin * invoiceFormDpPercent) / 100);

      // Partner ID is the business/UMKM recipient
      const partnerId = activeConversation.partnerId || activeConversation.creatorId;

      // Call API to persist invoice in database
      let dbInvoiceId = `INV-${Date.now().toString().slice(-6)}`;
      const apiRes = await chatService.createInvoice({
        businessId: partnerId,
        conversationId: activeChatId,
        title: invoiceFormTitle,
        scopeDescription: `DP ${invoiceFormDpPercent}% (${dpCoin.toLocaleString('id-ID')} Koin) dari Total ${cleanTotalCoin.toLocaleString('id-ID')} Koin. ${invoiceFormScope}`,
        totalAmount: dpCoin,
        deadlineDays: invoiceFormDays,
      });

      if (apiRes.success && apiRes.invoice?.id) {
        dbInvoiceId = apiRes.invoice.id;
      }

      const newInvoice: ChatInvoice = {
        id: dbInvoiceId,
        serviceTitle: invoiceFormTitle,
        amount: `${dpCoin.toLocaleString('id-ID')} Koin`,
        status: 'unpaid',
        dueDate: `${invoiceFormDays} Hari Kerja`,
        scopeSummary: `DP ${invoiceFormDpPercent}% (${dpCoin.toLocaleString('id-ID')} Koin). ${invoiceFormScope}`,
      };

      const msgText = `Pengajuan Kesepakatan: Invoice DP ${invoiceFormDpPercent}% sebesar 🪙 ${dpCoin.toLocaleString('id-ID')} Koin untuk ${invoiceFormTitle}.`;

      // Send chat message with invoice metadata to database
      const result = await chatService.sendMessage(activeChatId, msgText, {
        type: 'invoice',
        invoice: newInvoice,
      });

      const invoiceMessage: ChatMessage = {
        id: result.message?.id || `msg-${Date.now()}`,
        senderId: currentUser?.id || 'user',
        text: msgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
        status: 'delivered',
        invoice: newInvoice,
        metadata: { type: 'invoice', invoice: newInvoice },
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeChatId) {
          return {
            ...conv,
            lastMessage: `Invoice DP ${newInvoice.amount} diajukan`,
            lastMessageTime: 'Baru saja',
            messages: [...conv.messages, invoiceMessage],
          };
        }
        return conv;
      }));

      setIsCreateInvoiceModalOpen(false);
      showSuccessModal({
        title: 'Pengajuan Invoice Terkirim!',
        message: `Invoice DP ${invoiceFormDpPercent}% sebesar 🪙 ${dpCoin.toLocaleString('id-ID')} Koin untuk "${invoiceFormTitle}" telah dikirimkan ke ruang obrolan.`,
        duration: 3500,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Mengajukan Invoice',
        message: err.message || 'Terjadi gangguan saat mengajukan invoice kesepakatan.',
      });
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleDiscussService = (service: CreatorService) => {
    if (!activeCreator || !activeChatId) return;
    void handleSendMessage(`Halo ${activeCreator.name}, saya ingin mendiskusikan layanan "${service.title}" (${service.formattedPrice}).`);
    setIsRightSidebarOpenMobile(false);
  };

  // Membuka Halaman Detail Invoice resmi yang memuat Barcode & Beragam Metode Pembayaran
  const handleOpenInvoiceDetail = (messageId: string, invoice: ChatInvoice) => {
    setActiveInvoiceDetail({
      invoice,
      messageId,
      creatorName: activeConversation?.name || '',
      creatorRole: activeConversation?.roleTitle || '',
      creatorAvatar: activeConversation?.avatar || ''
    });
  };

  // UMKM Membayar Invoice di Room Chat -> Masuk ke Escrow & Mengaktifkan Collaboration Room
  const handlePayInvoice = (messageId: string, invoice: ChatInvoice) => {
    setActivePaidInvoice(invoice);

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
          text: `Pembayaran DP ${invoice.amount} untuk "${invoice.serviceTitle}" telah diamankan di Rekening Escrow CreatorIn. Proyek resmi dimulai dan Collaboration Room telah aktif!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          status: 'read'
        };

        return {
          ...conv,
          lastMessage: `Pembayaran DP invoice ${invoice.id} berhasil diamankan di Escrow`,
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

  if (!currentUser) {
    return (
      <div className="flex-1 w-full min-h-[70vh] flex items-center justify-center p-6 bg-[#FDFCFB]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-md space-y-5">
          <div className="w-14 h-14 bg-blue-50 text-[#155DFC] rounded-2xl flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Masuk untuk Memulai Pesan</h1>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk mengakses pesan, konsultasi, dan ruang kolaborasi proyek.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-sm font-semibold text-white shadow-xs transition cursor-pointer"
          >
            Masuk ke Akun
          </button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          title="Masuk ke Pesan & Kolaborasi"
          description="Masuk untuk membuka percakapan aktif dan ruang kolaborasi proyek Anda."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-0 bg-white text-[#171717] font-sans overflow-hidden h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overscroll-none selection:bg-[#0B1F3A] selection:text-white">
      {/* Kontainer 3 Kolom Terstruktur */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        
        {/* ========================================================== */}
        {/* KOLOM 1: SIDEBAR KIRI (DAFTAR PERCAKAPAN - PALING KECIL)   */}
        {/* ========================================================== */}
        <aside className={`w-full md:w-[280px] lg:w-[300px] xl:w-[320px] shrink-0 border-r border-neutral-200 flex flex-col bg-white h-full overflow-hidden ${
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
          <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-1 space-y-0.5">
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
          <section className={`flex-1 flex flex-col items-center justify-center bg-white min-w-0 p-6 sm:p-12 text-center select-none h-full overflow-hidden ${
            isMobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="max-w-md w-full flex flex-col items-center">
              
              {/* Minimal Clean Icon Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-neutral-100 flex items-center justify-center border border-neutral-200/80 mb-6 shadow-2xs">
                <MessageSquare className="w-8 h-8 sm:w-9 sm:h-9 text-neutral-800" strokeWidth={1.75} />
              </div>

              {/* Official Creatorin Brand Logo */}
              <div className="inline-flex items-center gap-2.5 justify-center mb-3">
                <img
                  src="/creatorin/logo.svg"
                  alt="Creatorin"
                  className="h-8 w-auto shrink-0"
                />
                <span className="text-2xl sm:text-3xl font-medium leading-none tracking-[-0.714px] text-black font-[var(--font-logo)]">
                  Creatorin
                </span>
              </div>

              {/* Headline Ringkas & Sederhana */}
              <p className="text-xs sm:text-sm text-neutral-400 font-normal">
                Pilih percakapan di sebelah kiri untuk mulai berkirim pesan
              </p>
            </div>
          </section>
        ) : (
          <section className={`flex-1 flex flex-col bg-white min-w-0 h-full overflow-hidden ${
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
                  handleCreatorClick(activeCreator);
                }}
                className="flex items-center gap-3 cursor-pointer group min-w-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
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

            {/* Aksi Sisi Kanan: Tab Switcher & Tombol Ajukan DP */}
            <div className="flex items-center gap-2">
              {/* Tab Switcher antara Chat dan Collaboration Room */}
              <div className="hidden sm:flex items-center p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('chat')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeViewMode === 'chat'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Obrolan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('collaboration')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    activeViewMode === 'collaboration'
                      ? 'bg-[#0B1F3A] text-white shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Collaboration</span>
                  {activePaidInvoice && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              </div>

              {/* Tombol Ajukan Invoice DP (Hanya untuk Kreator) */}
              {isCreatorInRoom && (
                <button
                  type="button"
                  onClick={handleOpenCreateInvoiceModal}
                  className="h-8 px-3 rounded-lg bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="Ajukan Kesepakatan / Invoice DP ke Klien"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ajukan Invoice DP</span>
                </button>
              )}

              <button
                onClick={() => setIsRightSidebarOpenMobile(!isRightSidebarOpenMobile)}
                className="xl:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                title="Lihat AI Ringkasan Obrolan"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Ringkasan AI</span>
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

          {activeViewMode === 'collaboration' ? (
            <CollaborationRoomView
              conversation={activeConversation}
              currentUser={currentUser}
              invoice={activePaidInvoice}
              onBackToChat={() => setActiveViewMode('chat')}
              onSendChatMessage={(text) => handleSendMessage(text)}
            />
          ) : (
            <>
              {/* AREA PESAN CHAT (WHITESPACE LUAS & FOKUS PERCAKAPAN) */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 bg-white">
            
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
                      ? 'bg-[#0B1F3A] text-white rounded-tr-xs' 
                      : 'bg-neutral-100 text-[#171717] rounded-tl-xs'
                  }`}>
                    
                    {/* Kartu Referensi & Preview Layanan yang Ditanyakan */}
                    {msg.serviceInquiry && (
                      <div className="mb-2.5 p-3 rounded-xl bg-white text-neutral-900 border border-neutral-200/90 shadow-2xs">
                        {/* Header: Indikator Layanan yang Ditanyakan */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-100">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Menanyakan Layanan</span>
                          </div>
                          {msg.serviceInquiry.tag && (
                            <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                              {msg.serviceInquiry.tag}
                            </span>
                          )}
                        </div>

                        {/* Konten Pratinjau Layanan */}
                        <div
                          onClick={() => setSelectedServiceDetail(msg.serviceInquiry!)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          {msg.serviceInquiry.coverImage && (
                            <img
                              src={msg.serviceInquiry.coverImage}
                              alt={msg.serviceInquiry.title}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-neutral-200/80 group-hover:opacity-90 transition"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-neutral-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {msg.serviceInquiry.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-bold text-blue-600">
                                {msg.serviceInquiry.formattedPrice}
                              </span>
                              {msg.serviceInquiry.deliveryDays && (
                                <>
                                  <span className="text-neutral-300 text-xs">•</span>
                                  <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                                    <span>{msg.serviceInquiry.deliveryDays}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceDetail(msg.serviceInquiry!);
                            }}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                            title="Buka rincian lengkap layanan"
                          >
                            <span>Detail</span>
                            <ExternalLink className="w-3 h-3 text-neutral-500" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Attachment Gambar Bersih */}
                    {/* Attachment Gambar atau Dokumen (Dapat Dilihat & Diunduh) */}
                    {msg.attachment && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-neutral-200/60 bg-white/95 text-neutral-900 shadow-2xs">
                        {msg.attachment.type === 'image' ? (
                          <a
                            href={msg.attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group relative overflow-hidden bg-neutral-100"
                            title="Klik untuk membuka gambar ukuran penuh"
                          >
                            <img
                              src={msg.attachment.url}
                              alt={msg.attachment.name}
                              className="w-full max-h-60 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-medium text-xs">
                              <span className="bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
                                <span>Buka Gambar Penuh</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </a>
                        ) : (
                          <div className="p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-neutral-900 truncate">
                                {msg.attachment.name}
                              </p>
                              <span className="text-[11px] text-neutral-400">
                                {msg.attachment.size || 'Dokumen Proyek'}
                              </span>
                            </div>
                            <a
                              href={msg.attachment.url}
                              download={msg.attachment.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Unduh berkas"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Unduh</span>
                            </a>
                          </div>
                        )}
                        {msg.attachment.type === 'image' && (
                          <div className="px-3 py-1.5 bg-neutral-900/85 text-[11px] text-white flex justify-between items-center">
                            <span className="truncate">{msg.attachment.name}</span>
                            <span className="text-neutral-300 ml-2 text-[10px] shrink-0">{msg.attachment.size}</span>
                          </div>
                        )}
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
                            <span className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                              <span>🪙</span>
                              <span>{msg.invoice.amount}</span>
                            </span>
                          </div>
                        </div>

                        {/* Aksi Pembayaran Escrow atau Buka Collaboration Room (RBAC STRICT) */}
                        {msg.invoice.status === 'unpaid' ? (
                          isUmkmInRoom ? (
                            /* UMKM: Tombol Bayar Invoice ke Halaman Detail */
                            <div className="space-y-1.5 pt-1">
                              <button
                                onClick={() => handleOpenInvoiceDetail(msg.id, msg.invoice!)}
                                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#123B8C] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Bayar Invoice (🪙 Escrow Koin)</span>
                              </button>
                              <p className="text-[10px] text-neutral-400 text-center">
                                Klik untuk melihat rincian saldo koin dan konfirmasi pembayaran escrow.
                              </p>
                            </div>
                          ) : (
                            /* KREATOR: Status Menunggu Pembayaran Klien (TIDAK ADA TOMBOL BAYAR) */
                            <div className="pt-1">
                              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="font-medium text-[11px]">Menunggu Pembayaran dari Klien UMKM</span>
                                </div>
                                <span className="font-bold text-xs">🪙 {msg.invoice.amount}</span>
                              </div>
                            </div>
                          )
                        ) : (
                          /* STATUS PAID: Buka Collaboration Room */
                          <div className="space-y-2 pt-1">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Dana koin diamankan di Escrow. Collaboration Room aktif.</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => handleOpenInvoiceDetail(msg.id, msg.invoice!)}
                                className="w-full py-2 px-2.5 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <FileText className="w-3 h-3 text-neutral-500" />
                                <span>Rincian Tagihan</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActivePaidInvoice(msg.invoice!);
                                  setActiveViewMode('collaboration');
                                }}
                                className="w-full py-2 px-2.5 rounded-xl text-xs font-bold text-white bg-[#0B1F3A] hover:bg-[#123B8C] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Masuk Room</span>
                                <ArrowRight className="w-3.5 h-3.5" />
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
                      <span title={msg.status === 'read' ? 'Dibaca' : 'Terkirim'}>
                        <CheckCheck
                          className={`w-3.5 h-3.5 transition-colors ${
                            msg.status === 'read' ? 'text-blue-600' : 'text-neutral-400'
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================== */}
          {/* COMPOSER REAL FILE UPLOAD + INVOICE SHORTCUT + KIRIM      */}
          {/* ========================================================== */}
          <footer className="p-3 sm:p-4 border-t border-neutral-200 bg-white shrink-0 space-y-2">
            {/* Indikator Sedang Mengunggah File */}
            {isUploadingFile && (
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-2 animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Sedang mengunggah berkas ke ruang obrolan...</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Hidden File Picker untuk Gambar & Dokumen */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/zip,application/x-zip-compressed,.docx,.doc,.txt"
              />

              {/* Tombol Lampirkan File / Gambar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
                className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Unggah Foto atau Dokumen Proyek"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Tombol Cepat Ajukan Kesepakatan / Invoice DP (Kreator Only) */}
              {isCreatorInRoom && (
                <button
                  type="button"
                  onClick={handleOpenCreateInvoiceModal}
                  className="p-2 text-neutral-500 hover:text-[#0B1F3A] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Ajukan Kesepakatan / Invoice DP"
                >
                  <Handshake className="w-4 h-4" />
                </button>
              )}

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
                disabled={!inputText.trim() || isUploadingFile}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                  inputText.trim() && !isUploadingFile
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <span>Kirim</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </footer>
          </>
          )}

        </section>
        )}

        {/* ========================================================== */}
        {/* KOLOM 3: SIDEBAR KANAN "LAYANAN CREATOR" (PANEL PENDUKUNG) */}
        {/* ========================================================== */}
        {activeConversation && activeCreator && (
          <aside className={`w-[300px] lg:w-[320px] xl:w-[330px] shrink-0 border-l border-neutral-200 bg-white flex flex-col h-full overflow-hidden ${
            isRightSidebarOpenMobile ? 'fixed inset-y-0 right-0 z-40 flex shadow-xl md:shadow-none' : 'hidden xl:flex'
          }`}>
            
            {/* HEADER SIDEBAR KANAN (AI SUMMARIZE OBROLAN) */}
            <div className="px-4 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-50 text-primary flex items-center justify-center shrink-0 border border-neutral-100">
                  <Sparkles className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 tracking-tight">
                    Ringkasan Obrolan
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-normal">
                    Diperbarui otomatis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGenerateChatSummary}
                  disabled={isChatSummarizing}
                  className="p-1 rounded-[6px] text-neutral-500 hover:text-primary hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                  title="Perbarui Ringkasan AI"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChatSummarizing ? 'animate-spin text-primary' : ''}`} />
                </button>
                <button
                  onClick={() => setIsRightSidebarOpenMobile(false)}
                  className="xl:hidden p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer"
                  title="Tutup sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DAFTAR RINGKASAN PERCAKAPAN CHAT DENGAN CREATOR */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-3">
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Poin kesepakatan & langkah tindak lanjut bersama <strong className="text-neutral-800 font-medium">{activeConversation.name}</strong>.
              </p>

              {isChatSummarizing ? (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500 py-8">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Menganalisis obrolan...</span>
                </div>
              ) : chatSummaryData ? (
                <div className="space-y-3 text-xs">
                  {/* Executive Summary */}
                  <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 text-neutral-700 leading-relaxed text-[11px]">
                    <span className="font-semibold text-neutral-400 block mb-1 text-[9px] uppercase tracking-wider">
                      Status Kesepakatan
                    </span>
                    {chatSummaryData.executiveSummary}
                  </div>

                  {/* Poin Kesepakatan */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-neutral-800 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Poin yang Disepakati
                    </span>
                    <ul className="space-y-1 pl-1">
                      {chatSummaryData.agreements.map((agr, idx) => (
                        <li key={idx} className="text-[11px] text-neutral-600 flex items-start gap-1.5 leading-snug">
                          <span className="text-neutral-400 font-bold">•</span>
                          <span>{agr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Items */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-neutral-800 text-[11px] flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-primary" />
                      Tindak Lanjut Terdekat
                    </span>
                    <div className="space-y-1.5">
                      {chatSummaryData.actionItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-neutral-50/70 border border-neutral-100 flex items-center justify-between gap-2 text-[10px]"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-neutral-800 block truncate">{item.task}</span>
                            <span className="text-neutral-400">PJ: {item.assignee}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                              item.status === 'in_progress'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200/50'
                            }`}
                          >
                            {item.status === 'in_progress' ? 'Proses' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan Khusus */}
                  {chatSummaryData.lastRevisionNotes && (
                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-950">
                      <span className="font-semibold block text-[10px] text-amber-800 mb-0.5">Catatan Khusus:</span>
                      {chatSummaryData.lastRevisionNotes}
                    </div>
                  )}

                  {/* Footer & Copy */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                    <span>Diperbarui: {chatSummaryData.generatedAt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copyText = `[RINGKASAN OBROLAN CREATORIN - ${activeConversation.name}]\n\n${chatSummaryData.executiveSummary}\n\nPoin Kesepakatan:\n${chatSummaryData.agreements.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nTindak Lanjut:\n${chatSummaryData.actionItems.map((item, i) => `${i + 1}. [${item.status.toUpperCase()}] ${item.task} (PJ: ${item.assignee})`).join('\n')}`;
                        navigator.clipboard.writeText(copyText);
                        setIsChatSummaryCopied(true);
                        setTimeout(() => setIsChatSummaryCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                    >
                      {isChatSummaryCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
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
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-[#123B8C] rounded-xl transition-colors cursor-pointer"
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
                Proyek & Rekening Escrow Aktif!
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
                <span className="text-neutral-400">Pengerjaan:</span>
                <span className="font-semibold text-neutral-800">Brief & Milestone Aktif</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCollaborationNotice(null)}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-[#123B8C] rounded-xl transition-colors cursor-pointer"
              >
                Lanjut di Room Chat
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
              navigateTo(page, page === 'collaboration-room' ? '/contracts' : `/${page}`);
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
      {/* MODAL AJUKAN KESEPAKATAN / INVOICE DP KE ROOM CHAT         */}
      {/* ========================================================== */}
      {isCreateInvoiceModalOpen && activeConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[11px] font-bold text-[#155DFC] uppercase tracking-wider">
                  Escrow Kesepakatan Resmi
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  Ajukan Invoice DP Proyek
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Kirimkan penawaran termin pembayaran bertahap ke <strong>{activeConversation.name}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateInvoiceModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Judul Proyek / Layanan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Produksi 1 Video Reels UGC + Scripting"
                  value={invoiceFormTitle}
                  onChange={(e) => setInvoiceFormTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Total Nilai Proyek (Koin)
                    </label>
                    <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                      1 Koin = Rp1.000
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="1500"
                    value={invoiceFormTotal}
                    onChange={(e) => setInvoiceFormTotal(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Contoh: 1.500 Koin setara dengan Rp1.500.000
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Pilihan Termin DP
                  </label>
                  <div className="flex gap-1.5 pt-0.5">
                    {[30, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setInvoiceFormDpPercent(pct)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          invoiceFormDpPercent === pct
                            ? 'bg-[#0B1F3A] text-white shadow-2xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rincian DP Terhitung dalam Koin */}
              {(() => {
                const rawVal = parseInt(invoiceFormTotal.replace(/[^0-9]/g, ''), 10) || 1500;
                const totalCoin = rawVal > 50000 ? Math.round(rawVal / 1000) : rawVal;
                const dpCoin = Math.round((totalCoin * invoiceFormDpPercent) / 100);
                const remCoin = Math.max(0, totalCoin - dpCoin);
                return (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-blue-700 block font-medium">Nominal DP Terhitung ({invoiceFormDpPercent}%)</span>
                      <span className="font-bold text-sm text-[#0B1F3A] flex items-center gap-1 mt-0.5">
                        <span>🪙</span>
                        <span>{dpCoin.toLocaleString('id-ID')} Koin</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Setara Rp{(dpCoin * 1000).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block">Sisa Pelunasan</span>
                      <span className="text-xs font-semibold text-neutral-700 block mt-0.5">
                        🪙 {remCoin.toLocaleString('id-ID')} Koin
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Rincian Lingkup Kerja & Deliverables
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan format file, resolusi, durasi, dan ketentuan revisi..."
                  value={invoiceFormScope}
                  onChange={(e) => setInvoiceFormScope(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvoice}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Handshake className="w-4 h-4" />
                  <span>{isSendingInvoice ? 'Mengirim...' : 'Kirim Penawaran & Invoice DP'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
