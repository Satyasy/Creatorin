'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  Folder,
  MessageSquare,
  ArrowRight,
  Search,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Star,
  Check,
  ChevronRight,
  ChevronDown,
  Download,
  RefreshCw,
  FileText,
  Clock,
  Play,
  Pause,
  X,
  Send,
  Sparkles,
  Copy,
  ListChecks
} from 'lucide-react';
import { ActivePage, AuthState, CollaborationItem, CollabStage, Creator } from '@/types';
import { MOCK_COLLABORATIONS } from '@/data/mockCollaborations';
import { collabService } from '@/services/collabService';
import { aiSummarizeService } from '@/services/aiSummarizeService';

interface CollaborationRoomPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  initialCollabId?: string;
}

type RoomInnerTab = 'deliverables' | 'brief' | 'revisions' | 'logs';

export const CollaborationRoomPage: React.FC<CollaborationRoomPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  initialCollabId = 'collab-room-4'
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) onNavigate(page);
    else router.push(path);
  };
  // State for collaborations
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>(MOCK_COLLABORATIONS);
  const [selectedCollabId, setSelectedCollabId] = useState<string>(initialCollabId);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomInnerTab, setRoomInnerTab] = useState<RoomInnerTab>('deliverables');

  // Project Switcher Dropdown in Hero
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Media Player Simulation State
  const [isPlaying, setIsPlaying] = useState(false);

  // Modals State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isApproveConfirmModalOpen, setIsApproveConfirmModalOpen] = useState(false);

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingCommunication, setRatingCommunication] = useState(5);
  const [ratingSpeed, setRatingSpeed] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Sangat Profesional',
    'Tepat Waktu',
    'Hasil Sesuai Brief'
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected Active Collaboration
  const activeCollab = useMemo(() => {
    return collaborations.find(c => c.id === selectedCollabId) || collaborations[0];
  }, [collaborations, selectedCollabId]);

  // AI Summarize State
  const [summaryData, setSummaryData] = useState<{
    executiveSummary: string;
    agreements: string[];
    actionItems: { task: string; assignee: string; status: 'pending' | 'in_progress' | 'completed' }[];
    lastRevisionNotes?: string;
    modelUsed: string;
    generatedAt: string;
  } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Generate or Load Summary for activeCollab
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const data = await aiSummarizeService.summarizeConversation({
        roomId: activeCollab.id,
        projectTitle: activeCollab.projectTitle,
        creatorName: activeCollab.creatorName,
        businessBrand: activeCollab.businessBrand,
      });
      setSummaryData(data);
      showToast('Ringkasan percakapan berhasil diperbarui via AI');
    } catch {
      showToast('Gagal memproses ringkasan percakapan');
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    handleGenerateSummary();
  }, [selectedCollabId]);

  const handleCopySummary = () => {
    if (!summaryData) return;
    const text = `[RINGKASAN PERCAKAPAN CREATORIN: ${activeCollab.projectTitle}]
Model: ${summaryData.modelUsed} (${summaryData.generatedAt})

RINGKASAN:
${summaryData.executiveSummary}

KESEPAKATAN:
${summaryData.agreements.map((a, i) => `${i + 1}. ${a}`).join('\n')}

ACTION ITEMS:
${summaryData.actionItems.map((item, i) => `${i + 1}. [${item.status.toUpperCase()}] ${item.task} (PJ: ${item.assignee})`).join('\n')}
${summaryData.lastRevisionNotes ? `\nCATATAN REVISI TERAKHIR:\n${summaryData.lastRevisionNotes}` : ''}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    showToast('Ringkasan berhasil disalin ke clipboard');
  };

  // Filtered Collaborations List
  const filteredCollaborations = useMemo(() => {
    return collaborations.filter(collab => {
      const matchSearch =
        collab.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.businessBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.roomCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [collaborations, searchQuery]);

  // Stepper definition
  const STEPS: { stage: CollabStage; label: string; desc: string; number: number }[] = [
    { stage: 'brief', label: 'Brief & Kickoff', desc: 'Aset disepakati', number: 1 },
    { stage: 'in_progress', label: 'Pengerjaan', desc: 'Produksi aset', number: 2 },
    { stage: 'review', label: 'Review Hasil', desc: 'Draft diunggah', number: 3 },
    { stage: 'revision', label: 'Revisi', desc: 'Catatan perbaikan', number: 4 },
    { stage: 'approval', label: 'Approval', desc: 'Persetujuan UMKM', number: 5 },
    { stage: 'completed', label: 'Selesai', desc: 'Dana dicairkan', number: 6 }
  ];

  const getStageOrder = (stage: CollabStage): number => {
    switch (stage) {
      case 'brief': return 1;
      case 'in_progress': return 2;
      case 'review': return 3;
      case 'revision': return 4;
      case 'approval': return 5;
      case 'completed': return 6;
      default: return 1;
    }
  };

  const currentStageNumber = getStageOrder(activeCollab.currentStage);

  // Helper: Request Revision
  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) return;

    setCollaborations(prev =>
      prev.map(c => {
        if (c.id === activeCollab.id) {
          const newRevision = {
            id: `rev-${Date.now()}`,
            revisionRound: c.revisions.length + 1,
            requestedAt: 'Baru saja',
            feedbackText: revisionFeedback,
            status: 'pending' as const
          };
          const newLog = {
            id: `log-${Date.now()}`,
            senderRole: 'business' as const,
            senderName: c.businessName,
            action: `Mengajukan Permintaan Revisi #${newRevision.revisionRound}`,
            detail: revisionFeedback,
            timestamp: 'Baru saja',
            type: 'revision_requested' as const
          };
          return {
            ...c,
            currentStage: 'revision',
            revisions: [...c.revisions, newRevision],
            activityLogs: [newLog, ...c.activityLogs]
          };
        }
        return c;
      })
    );

    setIsRevisionModalOpen(false);
    setRevisionFeedback('');
    setRoomInnerTab('revisions');
    showToast('Catatan revisi telah dikirim ke kreator.');
  };

  // Helper: Approve Final Project
  const handleConfirmApproval = () => {
    setCollaborations(prev =>
      prev.map(c => {
        if (c.id === activeCollab.id) {
          const approvedLog = {
            id: `log-${Date.now()}`,
            senderRole: 'business' as const,
            senderName: c.businessName,
            action: 'Menyetujui Hasil Karya Akhir (Approved)',
            detail: 'Pihak bisnis menyetujui hasil karya. Sistem menginisiasi pencairan escrow dan penerbitan ke profil UMKM & Kreator.',
            timestamp: 'Baru saja',
            type: 'approved' as const
          };
          const releaseLog = {
            id: `log-release-${Date.now()}`,
            senderRole: 'system' as const,
            senderName: 'Creatorin Escrow',
            action: `Dana Escrow ${c.budgetFormatted} Dicairkan ke Rekening ${c.creatorName}`,
            detail: 'Transaksi escrow selesai terproteksi.',
            timestamp: 'Baru saja',
            type: 'approved' as const
          };
          const portfolioLog = {
            id: `log-portfolio-${Date.now()}`,
            senderRole: 'system' as const,
            senderName: 'Creatorin Portofolio',
            action: 'Proyek Resmi Masuk ke Profil UMKM & Portofolio Kreator',
            detail: 'Karya ini kini tampil di halaman Profil UMKM pada tab Kolaborasi Selesai.',
            timestamp: 'Baru saja',
            type: 'rated' as const
          };

          return {
            ...c,
            currentStage: 'completed',
            progressPercent: 100,
            escrowStatus: 'released_to_creator',
            publishedPortfolioId: `collab-pub-${Date.now()}`,
            activityLogs: [portfolioLog, releaseLog, approvedLog, ...c.activityLogs]
          };
        }
        return c;
      })
    );

    // If connected to a real database room, trigger backend approval
    if (activeCollab.id.length > 20 && !activeCollab.id.startsWith('collab-')) {
      collabService.approveCollab(activeCollab.id).catch(() => {});
    }

    setIsApproveConfirmModalOpen(false);
    setIsRatingModalOpen(true);
    showToast('Proyek disetujui. Dana dicairkan dan karya otomatis terbit ke profil.');
  };

  // Helper: Submit Rating & Testimonial
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    setCollaborations(prev =>
      prev.map(c => {
        if (c.id === activeCollab.id) {
          const ratingData = {
            score: ratingScore,
            aspects: {
              quality: ratingQuality,
              communication: ratingCommunication,
              speed: ratingSpeed
            },
            reviewText: reviewComment || 'Kolaborasi berjalan dengan sangat baik dan hasil kerja memuaskan.',
            tags: selectedTags,
            submittedAt: 'Hari ini'
          };
          const ratingLog = {
            id: `log-rating-${Date.now()}`,
            senderRole: 'business' as const,
            senderName: c.businessName,
            action: `Memberikan Rating ${ratingScore}/5 & Testimoni`,
            detail: ratingData.reviewText,
            timestamp: 'Baru saja',
            type: 'rated' as const
          };
          return {
            ...c,
            rating: ratingData,
            activityLogs: [ratingLog, ...c.activityLogs]
          };
        }
        return c;
      })
    );

    // If connected to a real database creator, persist review
    if (activeCollab.creatorId.length > 20 && !activeCollab.creatorId.startsWith('cr-')) {
      collabService.submitReview({
        creatorId: activeCollab.creatorId,
        roomId: activeCollab.id,
        projectTitle: activeCollab.projectTitle,
        rating: ratingScore,
        comment: reviewComment || 'Kolaborasi berjalan dengan baik.',
      }).catch(() => {});
    }

    setIsRatingModalOpen(false);
    showToast('Rating dan ulasan berhasil dipublikasikan.');
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const AVAILABLE_TAGS = [
    'Sangat Profesional',
    'Tepat Waktu',
    'Hasil Sesuai Brief',
    'Komunikatif',
    'Sesuai Brand Guidelines'
  ];

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#1D4ED8] selection:text-white">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-[14px] shadow-lg flex items-center gap-3 border border-slate-800 text-xs sm:text-sm font-medium">
          <Check className="w-4 h-4 text-[#1D4ED8] shrink-0" />
          <span className="font-normal">{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Desktop SaaS Layout matching reference */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ============================================================== */}
        {/* SECTION B: HERO / PAGE HEADER (MATCHING REFERENCE SCREENSHOT) */}
        {/* ============================================================== */}
        <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-6 sm:p-7 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Folder Icon, Title & Description */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-[#123B8C] border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Folder className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                  Collaboration Room
                </h1>
                <p className="text-xs sm:text-sm font-normal text-[#64748B] max-w-2xl leading-relaxed">
                  Ruang kerja kolaborasi resmi antara Bisnis dan Kreator setelah pembayaran invoice diamankan di Escrow. Pantau proses produksi secara real-time hingga persetujuan akhir.
                </p>
              </div>
            </div>

            {/* Right: Project Dropdown Switcher & Primary Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              
              {/* Project Dropdown */}
              <div className="relative">
                <span className="text-[11px] font-medium text-[#64748B] block mb-1">
                  Pilih Proyek
                </span>
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="h-10 px-3.5 rounded-[12px] bg-white border border-[#E2E8F0] hover:bg-slate-50 flex items-center gap-2.5 text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer min-w-[210px] justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={activeCollab.businessAvatar}
                      alt={activeCollab.businessBrand}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate">{activeCollab.businessBrand}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProjectDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-[14px] border border-[#E2E8F0] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-slate-100">
                      Daftar Proyek Aktif
                    </div>
                    {collaborations.map(collab => (
                      <button
                        key={collab.id}
                        type="button"
                        onClick={() => {
                          setSelectedCollabId(collab.id);
                          setIsProjectDropdownOpen(false);
                          setRoomInnerTab('deliverables');
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          collab.id === activeCollab.id ? 'bg-blue-50/50 font-bold text-[#1D4ED8]' : 'text-[#0F172A]'
                        }`}
                      >
                        <img
                          src={collab.businessAvatar}
                          alt={collab.businessBrand}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{collab.projectTitle}</div>
                          <div className="text-[10px] text-[#64748B] truncate">{collab.businessBrand} • {collab.creatorName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Chat Button */}
              <div className="sm:pt-5">
                <button
                  type="button"
                  onClick={() => navigateTo('chat', '/chat')}
                  className="h-10 px-4 rounded-[12px] bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer w-full sm:w-auto justify-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Buka Chat Room</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN 2-COLUMN LAYOUT: 30% LEFT / 70% RIGHT                     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          
          {/* ------------------------------------------------------------ */}
          {/* SECTION D: LEFT SIDEBAR — DAFTAR PROJECT (30%)               */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Sidebar Card */}
            <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
              
              {/* Header: Title & Count */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Daftar Proyek Kolaborasi
                </h2>
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center justify-center font-mono">
                  {filteredCollaborations.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari proyek atau kreator..."
                  className="h-10 w-full rounded-[12px] bg-white border border-[#E2E8F0] pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-hidden transition-colors"
                />
              </div>

              {/* Project Items List */}
              <div className="space-y-2.5 pt-1">
                {filteredCollaborations.map((collab) => {
                  const isSelected = collab.id === activeCollab.id;
                  const thumbImage =
                    collab.thumbnail ||
                    collab.deliverables[0]?.previewThumbnail ||
                    collab.creatorAvatar;

                  return (
                    <div
                      key={collab.id}
                      onClick={() => {
                        setSelectedCollabId(collab.id);
                        setRoomInnerTab('deliverables');
                      }}
                      className={`p-3.5 rounded-[14px] border transition-all cursor-pointer text-left group flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#1D4ED8] bg-blue-50/40 ring-1 ring-[#1D4ED8]/30 shadow-2xs'
                          : 'border-[#E2E8F0] bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Left: Thumbnail Image */}
                      <img
                        src={thumbImage}
                        alt={collab.projectTitle}
                        className="w-12 h-12 rounded-[10px] object-cover shrink-0 border border-slate-100"
                      />

                      {/* Middle: Title, Subtitle, Date */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h3 className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#1D4ED8] transition-colors">
                          {collab.projectTitle}
                        </h3>
                        <p className="text-[11px] text-[#64748B] font-normal truncate mt-0.5">
                          {collab.businessBrand || collab.creatorName}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-[#64748B] font-normal mt-1">
                          <Calendar className="w-3 h-3 text-[#64748B]" />
                          <span>
                            {collab.startDate.includes('September')
                              ? `${collab.startDate.split(' ')[0]} - ${collab.deadlineDate.split(' ')[0]} Sep 2026`
                              : `${collab.startDate} - ${collab.deadlineDate}`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Chevron Arrow & Price */}
                      <div className="shrink-0 flex flex-col justify-between items-end self-stretch py-0.5">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        <span className="text-xs font-bold text-[#0F172A] font-mono">
                          {collab.budgetFormatted}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredCollaborations.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-[14px] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B]">Tidak ada proyek ditemukan.</p>
                  </div>
                )}
              </div>

            </div>

            {/* AI Conversation Summarize Card (HuggingFace Multilingual / NLP Safe) */}
            <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0 border border-blue-100">
                    <Sparkles className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">AI Summarize Percakapan</h3>
                    <span className="text-[10px] font-semibold text-[#155DFC] bg-blue-50 px-1.5 py-0.5 rounded-[4px] border border-blue-100/80">
                      {summaryData?.modelUsed || 'HuggingFace Multilingual'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="p-1.5 rounded-[8px] bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                  title="Perbarui Ringkasan AI"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin text-[#155DFC]' : ''}`} />
                </button>
              </div>

              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Ringkasan kesepakatan dan tindak lanjut percakapan antara Kreator dan UMKM terfokus tanpa halusinasi.
              </p>

              {/* Summary Content Body */}
              {isSummarizing ? (
                <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center gap-2.5 text-xs text-slate-500 py-6">
                  <div className="w-4 h-4 border-2 border-[#155DFC] border-t-transparent rounded-full animate-spin" />
                  <span>Menganalisis transkrip percakapan...</span>
                </div>
              ) : summaryData ? (
                <div className="space-y-3.5 text-xs">
                  {/* Executive Summary */}
                  <div className="p-3 rounded-[12px] bg-blue-50/50 border border-blue-100/70 text-[#0F172A] leading-relaxed text-[11px]">
                    <span className="font-bold text-[#155DFC] block mb-1 uppercase tracking-wider text-[10px]">
                      Ringkasan Eksekutif
                    </span>
                    {summaryData.executiveSummary}
                  </div>

                  {/* Agreed Points */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-[#0F172A] text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Poin Kesepakatan & Arahan
                    </span>
                    <ul className="space-y-1 pl-1">
                      {summaryData.agreements.map((agr, idx) => (
                        <li key={idx} className="text-[11px] text-[#475569] flex items-start gap-1.5 leading-snug">
                          <span className="text-[#155DFC] font-bold">•</span>
                          <span>{agr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Items */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-[#0F172A] text-[11px] flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-[#155DFC]" />
                      Action Items (Tugas Terdekat)
                    </span>
                    <div className="space-y-1.5">
                      {summaryData.actionItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-[8px] bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-[10px]"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-[#0F172A] block truncate">{item.task}</span>
                            <span className="text-slate-400">PJ: {item.assignee}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded-[4px] font-bold shrink-0 ${
                              item.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.status === 'in_progress' ? 'Proses' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Last Revision Notes if any */}
                  {summaryData.lastRevisionNotes && (
                    <div className="p-2.5 rounded-[10px] bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-950">
                      <span className="font-bold block text-[10px] text-amber-800 mb-0.5">Catatan Revisi Terkini:</span>
                      {summaryData.lastRevisionNotes}
                    </div>
                  )}

                  {/* Card Footer: Timestamp & Copy Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Diperbarui: {summaryData.generatedAt}</span>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="inline-flex items-center gap-1 text-[#155DFC] hover:underline font-bold cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Ringkasan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT MAIN WORKSPACE (70%)                                   */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Master Card */}
            <div className="bg-white rounded-[18px] border border-[#E2E8F0] p-6 sm:p-8 space-y-6 text-left shadow-2xs">
              
              {/* ======================================================== */}
              {/* SECTION E: PROJECT HEADER & ESCROW CARD                  */}
              {/* ======================================================== */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-5 border-b border-[#E2E8F0]">
                
                {/* Left: Project Title & Meta Info */}
                <div className="space-y-2 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-snug">
                    {activeCollab.projectTitle}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] font-normal pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Mulai: {activeCollab.startDate}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Target: {activeCollab.deadlineDate}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{activeCollab.category}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Small Escrow Card */}
                <div className="shrink-0 p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-right space-y-0.5 min-w-[170px]">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748B] block">
                    Nilai di Escrow
                  </span>
                  <div className="text-lg font-bold font-mono text-[#0F172A]">
                    {activeCollab.budgetFormatted}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-[#1D4ED8]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>
                      {activeCollab.escrowStatus === 'held_in_escrow'
                        ? 'Dana Ditahan di Escrow'
                        : 'Dana Telah Dicairkan'}
                    </span>
                  </div>
                </div>

              </div>

              {/* ======================================================== */}
              {/* SECTION F: CREATOR & CLIENT (HORIZONTAL CARD)            */}
              {/* ======================================================== */}
              <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Creator Box */}
                <div className="flex items-center gap-3.5 flex-1">
                  <img
                    src={activeCollab.creatorAvatar}
                    alt={activeCollab.creatorName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      KREATOR
                    </span>
                    <div className="font-bold text-sm text-[#0F172A] truncate">
                      {activeCollab.creatorName}
                    </div>
                    <div className="text-xs text-[#64748B] font-normal flex items-center gap-1.5 mt-0.5">
                      <span>{activeCollab.creatorRole}</span>
                      <span>★</span>
                      <span>{activeCollab.creatorRating}</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-[1px] h-10 bg-[#E2E8F0] mx-4" />

                {/* Client Box */}
                <div className="flex items-center gap-3.5 flex-1">
                  <img
                    src={activeCollab.businessAvatar}
                    alt={activeCollab.businessBrand}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      KLIEN (BISNIS / UMKM)
                    </span>
                    <div className="font-bold text-sm text-[#0F172A] truncate">
                      {activeCollab.businessBrand}
                    </div>
                    <div className="text-xs text-[#64748B] font-normal mt-0.5">
                      PIC: {activeCollab.businessName} (Anda)
                    </div>
                  </div>
                </div>

              </div>

              {/* ======================================================== */}
              {/* SECTION G: COLLABORATION PROGRESS STEPPER                */}
              {/* ======================================================== */}
              <div className="space-y-3 pt-1">
                
                {/* Horizontal Stepper */}
                <div className="relative py-2 overflow-x-auto">
                  
                  {/* Background Track Line */}
                  <div className="absolute top-5.5 left-6 right-6 h-0.5 bg-[#E2E8F0] z-0">
                    <div
                      className="h-full bg-[#1D4ED8] transition-all duration-300"
                      style={{
                        width:
                          activeCollab.currentStage === 'completed'
                            ? '100%'
                            : `${((currentStageNumber - 1) / 5) * 100}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between min-w-[560px] relative z-10">
                    {STEPS.map((step) => {
                      const isPast =
                        step.number < currentStageNumber ||
                        activeCollab.currentStage === 'completed';
                      const isCurrent =
                        step.number === currentStageNumber &&
                        activeCollab.currentStage !== 'completed';

                      return (
                        <div key={step.stage} className="flex flex-col items-center text-center w-22">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isPast
                                ? 'bg-[#1D4ED8] text-white shadow-2xs'
                                : isCurrent
                                ? 'bg-white border-2 border-[#1D4ED8] text-[#1D4ED8] font-bold'
                                : 'bg-white border border-[#E2E8F0] text-[#64748B] font-normal'
                            }`}
                          >
                            {isPast ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.number}
                          </div>
                          <span
                            className={`text-xs mt-2 leading-tight ${
                              isPast || isCurrent
                                ? 'text-[#0F172A] font-bold'
                                : 'text-[#64748B] font-normal'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-normal mt-0.5">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Review Stage Action Notice (If In Review) */}
                {activeCollab.currentStage === 'review' && (
                  <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#0F172A] block">
                        Draft deliverable v1 siap ditinjau.
                      </span>
                      <p className="text-[#64748B] font-normal mt-0.5">
                        Tonton preview di bawah, ajukan revisi jika diperlukan, atau setujui untuk menyelesaikan proyek.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsRevisionModalOpen(true)}
                        className="h-9 px-3.5 rounded-[12px] bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
                      >
                        Minta Revisi
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsApproveConfirmModalOpen(true)}
                        className="h-9 px-4 rounded-[12px] bg-[#1D4ED8] hover:bg-[#123B8C] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui (Approve)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* SECTION H: TABS NAVIGATION                               */}
              {/* ======================================================== */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-8 border-b border-[#E2E8F0] pb-1 text-xs sm:text-sm font-medium overflow-x-auto">
                  
                  <button
                    type="button"
                    onClick={() => setRoomInnerTab('deliverables')}
                    className={`pb-2.5 transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2 ${
                      roomInnerTab === 'deliverables'
                        ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A] font-normal'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Hasil Karya ({activeCollab.deliverables.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomInnerTab('brief')}
                    className={`pb-2.5 transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2 ${
                      roomInnerTab === 'brief'
                        ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A] font-normal'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Brief</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomInnerTab('revisions')}
                    className={`pb-2.5 transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2 ${
                      roomInnerTab === 'revisions'
                        ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A] font-normal'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Revisi ({activeCollab.revisions.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomInnerTab('logs')}
                    className={`pb-2.5 transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0 border-b-2 ${
                      roomInnerTab === 'logs'
                        ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A] font-normal'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Aktivitas ({activeCollab.activityLogs.length})</span>
                  </button>

                </div>

                {/* ====================================================== */}
                {/* SECTION I: DELIVERABLE SECTION (MATCHING SCREENSHOT)   */}
                {/* ====================================================== */}
                {roomInnerTab === 'deliverables' && (
                  <div className="space-y-4">
                    {activeCollab.deliverables.length > 0 ? (
                      activeCollab.deliverables.map((deliv) => (
                        <div
                          key={deliv.id}
                          className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 space-y-4 shadow-2xs"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            
                            {/* Left: Large Media Preview Player */}
                            <div className="md:col-span-7">
                              <div className="relative aspect-video rounded-[14px] overflow-hidden bg-black flex items-center justify-center shadow-inner">
                                <img
                                  src={deliv.previewThumbnail || deliv.url}
                                  alt={deliv.title}
                                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                                    isPlaying ? 'opacity-90' : 'opacity-85 hover:opacity-95'
                                  }`}
                                />

                                {/* Center Play Button */}
                                <button
                                  type="button"
                                  onClick={() => setIsPlaying(!isPlaying)}
                                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-white/40 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10 shadow-md"
                                >
                                  {isPlaying ? (
                                    <Pause className="w-5 h-5 fill-white" />
                                  ) : (
                                    <Play className="w-5 h-5 fill-white ml-0.5" />
                                  )}
                                </button>

                                {/* Bottom Overlay (Time & Resolution) */}
                                <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10">
                                  <span className="text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-[6px]">
                                    00:28
                                  </span>
                                  <span className="text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-[6px]">
                                    1080p
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Title, Upload Date, File Size, Download & Creator Note */}
                            <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                              
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="text-sm sm:text-base font-bold text-[#0F172A]">
                                      {deliv.title.includes('Final Master')
                                        ? deliv.title.split('(')[0].trim()
                                        : deliv.title}
                                    </h4>
                                    {deliv.title.includes('(') && (
                                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] mt-0.5">
                                        ({deliv.title.split('(')[1]}
                                      </p>
                                    )}
                                    <p className="text-xs text-[#64748B] font-normal mt-1.5">
                                      Diunggah: {deliv.uploadedAt} • {deliv.filesize}
                                    </p>
                                  </div>

                                  {/* Download Button */}
                                  {deliv.externalLink && (
                                    <a
                                      href={deliv.externalLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="h-9 px-3.5 rounded-[12px] border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] inline-flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                                    >
                                      <Download className="w-3.5 h-3.5 text-[#1D4ED8]" />
                                      <span>Unduh File</span>
                                    </a>
                                  )}
                                </div>

                                {/* Creator Note Quote Box */}
                                {deliv.creatorNote && (
                                  <div className="mt-4 p-4 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                                    <span className="text-xl font-serif text-[#1D4ED8] leading-none shrink-0 mt-0.5">
                                      “
                                    </span>
                                    <p className="text-xs text-[#0F172A] font-normal leading-relaxed italic">
                                      {deliv.creatorNote}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Review Stage Action Decision Bar (If Active Collab in Review) */}
                              {activeCollab.currentStage === 'review' && (
                                <div className="pt-2 flex items-center gap-2.5 border-t border-[#E2E8F0]">
                                  <button
                                    type="button"
                                    onClick={() => setIsRevisionModalOpen(true)}
                                    className="h-9 px-3.5 rounded-[12px] border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer flex-1"
                                  >
                                    Minta Revisi
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsApproveConfirmModalOpen(true)}
                                    className="h-9 px-4 rounded-[12px] bg-[#1D4ED8] hover:bg-[#123B8C] text-white text-xs font-semibold transition-colors cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Setujui Hasil</span>
                                  </button>
                                </div>
                              )}

                            </div>

                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center rounded-[18px] border border-[#E2E8F0] bg-white space-y-2">
                        <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          Kreator Sedang Memproduksi Aset
                        </h4>
                        <p className="text-xs font-normal text-[#64748B] max-w-sm mx-auto">
                          File karya akan otomatis tampil di sini saat diunggah oleh {activeCollab.creatorName}.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: BRIEF */}
                {roomInnerTab === 'brief' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-5 rounded-[18px] border border-[#E2E8F0] bg-white space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                          Ringkasan Kebutuhan Proyek
                        </span>
                        <p className="text-xs sm:text-sm font-normal text-[#0F172A] mt-1 leading-relaxed">
                          {activeCollab.briefDetails.summary}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                          Ketentuan Konten (Checklist)
                        </span>
                        <ul className="space-y-2">
                          {activeCollab.briefDetails.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#0F172A] font-normal">
                              <Check className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {activeCollab.briefDetails.brandAssets.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                            File Panduan & Aset Brand
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {activeCollab.briefDetails.brandAssets.map((asset, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                                  <span className="font-medium text-[#0F172A] truncate">
                                    {asset.name}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                                  {asset.size}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: REVISI */}
                {roomInnerTab === 'revisions' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-normal text-[#64748B]">
                        Riwayat Revisi (Kuota: 2x Revisi Minor)
                      </span>
                      {activeCollab.currentStage === 'review' && (
                        <button
                          type="button"
                          onClick={() => setIsRevisionModalOpen(true)}
                          className="h-8 px-3 rounded-[10px] bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Buat Catatan Revisi Baru</span>
                        </button>
                      )}
                    </div>

                    {activeCollab.revisions.length > 0 ? (
                      activeCollab.revisions.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-[14px] border border-[#E2E8F0] bg-white space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F172A]">
                              Putaran Revisi #{rev.revisionRound}
                            </span>
                            <span className="text-[#64748B] text-[11px] font-normal">{rev.requestedAt}</span>
                          </div>
                          <p className="text-[#0F172A] bg-[#F8FAFC] p-3 rounded-[10px] border border-slate-100 font-normal leading-relaxed">
                            "{rev.feedbackText}"
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#1D4ED8] font-medium">
                            <Check className="w-3.5 h-3.5" />
                            <span>Status: {rev.status === 'resolved' ? 'Telah Diperbaiki' : 'Sedang Dikerjakan Kreator'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center rounded-[18px] border border-[#E2E8F0] bg-white space-y-1">
                        <p className="text-xs text-[#64748B] font-normal">
                          Belum ada catatan revisi. Draft karya siap ditinjau.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: AKTIVITAS */}
                {roomInnerTab === 'logs' && (
                  <div className="space-y-2.5">
                    {activeCollab.activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-[14px] border border-[#E2E8F0] bg-white flex items-start gap-3.5 text-xs"
                      >
                        <div className="w-7 h-7 rounded-[10px] bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F172A]">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono font-normal">
                              {log.timestamp}
                            </span>
                          </div>
                          {log.detail && (
                            <p className="text-[#64748B] text-[11px] font-normal leading-relaxed">
                              {log.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ============================================================== */}
      {/* MODAL 1: FORM MINTA REVISI                                     */}
      {/* ============================================================== */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1D4ED8]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Ajukan Catatan Revisi Karya
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1 rounded-[8px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A]">
              <span className="font-bold block mb-0.5">Tips Feedback:</span>
              <p className="text-[#64748B] font-normal leading-relaxed text-[11px]">
                Sebutkan detik video atau elemen visual secara spesifik agar memudahkan pengerjaan oleh kreator.
              </p>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">
                  Detail Penyesuaian & Feedback:
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="Contoh: Tolong tambahkan close-up tetesan kopi saat dituang ke es batu di detik ke-6..."
                  className="w-full p-3 rounded-[12px] border border-[#E2E8F0] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] text-xs font-normal text-[#0F172A] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="h-9 px-4 rounded-[12px] border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-[12px] bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Revisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CONFIRM APPROVAL & RELEASE ESCROW                     */}
      {/* ============================================================== */}
      {isApproveConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Setujui Hasil Akhir & Selesaikan Proyek?
                </h3>
                <p className="text-xs font-normal text-[#64748B]">
                  Konfirmasi bahwa Anda puas dengan karya kreator.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs text-[#0F172A]">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
                <span className="font-normal">Dana escrow <strong>{activeCollab.budgetFormatted}</strong> akan dicairkan ke rekening kreator.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
                <span className="font-normal">Proyek otomatis terpublikasi di <strong>Profil UMKM Anda</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
                <span className="font-normal">Anda dapat memberikan rating bintang & testimoni bagi kreator.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsApproveConfirmModalOpen(false)}
                className="h-9 px-4 rounded-[12px] border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tinjau Ulang
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="h-9 px-4 rounded-[12px] bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ya, Setujui & Cairkan Escrow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RATING & REVIEW FOR CREATOR                          */}
      {/* ============================================================== */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#1D4ED8] fill-[#1D4ED8]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Beri Rating & Testimoni Kreator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="p-1 rounded-[8px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Creator Bar */}
            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <img
                src={activeCollab.creatorAvatar}
                alt={activeCollab.creatorName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <span className="font-bold text-[#0F172A] block">
                  {activeCollab.creatorName}
                </span>
                <span className="text-[#64748B] text-[11px] font-normal">
                  {activeCollab.creatorRole}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
              
              {/* Star Rating */}
              <div className="text-center py-1 space-y-1">
                <span className="text-xs font-normal text-[#64748B] block">
                  Seberapa puas Anda dengan hasil kolaborasi ini?
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className="p-1 cursor-pointer transition-colors focus:outline-hidden"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingScore
                            ? 'text-[#1D4ED8] fill-[#1D4ED8]'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1D4ED8] block">
                  {ratingScore === 5 && 'Sangat Memuaskan ★★★★★'}
                  {ratingScore === 4 && 'Bagus & Memuaskan ★★★★☆'}
                  {ratingScore === 3 && 'Cukup Baik ★★★☆☆'}
                  {ratingScore <= 2 && 'Perlu Peningkatan ★★☆☆☆'}
                </span>
              </div>

              {/* Tag Badges */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#0F172A] block">
                  Pilih Label Apresiasi:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-[10px] text-[11px] font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] block">
                  Tulis Ulasan & Testimoni:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda berkolaborasi dengan kreator ini..."
                  className="w-full p-2.5 rounded-[12px] border border-[#E2E8F0] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] text-xs font-normal text-[#0F172A] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <button
                  type="submit"
                  className="w-full h-10 rounded-[12px] bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <span>Kirim Rating & Publikasikan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
