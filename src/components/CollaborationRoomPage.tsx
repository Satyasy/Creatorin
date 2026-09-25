import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  ExternalLink,
  Eye,
  Star,
  Sparkles,
  RefreshCw,
  FileText,
  MessageSquare,
  Send,
  Download,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Search,
  Filter,
  Check,
  X,
  Building2,
  User,
  DollarSign,
  Layers,
  ArrowLeft,
  ChevronDown,
  Award,
  Video,
  Image as ImageIcon,
  CheckSquare
} from 'lucide-react';
import { Navbar } from './Navbar';
import { ActivePage, AuthState, CollaborationItem, CollabStage, Creator } from '../types';
import { MOCK_COLLABORATIONS } from '../data/mockCollaborations';
import { MOCK_CREATORS } from '../data/mockCreators';

interface CollaborationRoomPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  initialCollabId?: string;
}

type FilterTab = 'all' | 'active' | 'review' | 'completed';
type RoomInnerTab = 'deliverables' | 'brief' | 'revisions' | 'logs';

export const CollaborationRoomPage: React.FC<CollaborationRoomPageProps> = ({
  currentUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile,
  initialCollabId = 'collab-room-1'
}) => {
  // State for all collaborations
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>(MOCK_COLLABORATIONS);
  const [selectedCollabId, setSelectedCollabId] = useState<string>(initialCollabId);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomInnerTab, setRoomInnerTab] = useState<RoomInnerTab>('deliverables');

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
    'Hasil Aesthetic'
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

  // Filtered Collaborations List
  const filteredCollaborations = useMemo(() => {
    return collaborations.filter(collab => {
      const matchSearch = collab.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          collab.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          collab.roomCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;

      if (filterTab === 'active') {
        return collab.currentStage !== 'completed';
      }
      if (filterTab === 'review') {
        return collab.currentStage === 'review';
      }
      if (filterTab === 'completed') {
        return collab.currentStage === 'completed';
      }
      return true;
    });
  }, [collaborations, searchQuery, filterTab]);

  // Stepper definition
  const STEPS: { stage: CollabStage; label: string; desc: string; number: number }[] = [
    { stage: 'brief', label: 'Brief & Kickoff', desc: 'Aset & referensi brand disepakati', number: 1 },
    { stage: 'in_progress', label: 'Pengerjaan', desc: 'Produksi aset oleh kreator', number: 2 },
    { stage: 'review', label: 'Review Hasil', desc: 'Draft video/karya diunggah', number: 3 },
    { stage: 'revision', label: 'Revisi Terarah', desc: 'Catatan penyesuaian karya', number: 4 },
    { stage: 'approval', label: 'Approval Bisnis', desc: 'Persetujuan hasil akhir UMKM', number: 5 },
    { stage: 'completed', label: 'Selesai & Terbit', desc: 'Portofolio masuk profil & dana cair', number: 6 },
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

    setCollaborations(prev => prev.map(c => {
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
    }));

    setIsRevisionModalOpen(false);
    setRevisionFeedback('');
    setRoomInnerTab('revisions');
    showToast('Catatan revisi telah dikirim ke kreator secara real-time!');
  };

  // Helper: Approve Final Project
  const handleConfirmApproval = () => {
    setCollaborations(prev => prev.map(c => {
      if (c.id === activeCollab.id) {
        const approvedLog = {
          id: `log-${Date.now()}`,
          senderRole: 'business' as const,
          senderName: c.businessName,
          action: 'Menyetujui Hasil Karya Akhir (Approved)',
          detail: 'Pihak bisnis puas dengan hasil karya. Sistem menginisiasi pencairan escrow dan penerbitan proyek ke profil UMKM & Kreator.',
          timestamp: 'Baru saja',
          type: 'approved' as const
        };
        const releaseLog = {
          id: `log-release-${Date.now()}`,
          senderRole: 'system' as const,
          senderName: 'Creatorin Escrow',
          action: `Dana Escrow ${c.budgetFormatted} Dicairkan ke Rekening ${c.creatorName}`,
          detail: 'Transaksi escrow selesai dengan sukses 100% aman terproteksi.',
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
    }));

    setIsApproveConfirmModalOpen(false);
    setIsRatingModalOpen(true);
    showToast('🎉 Proyek berhasil disetujui! Dana dicairkan dan karya otomatis terbit ke Profil UMKM Anda.');
  };

  // Helper: Submit Rating & Testimonial
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    setCollaborations(prev => prev.map(c => {
      if (c.id === activeCollab.id) {
        const ratingData = {
          score: ratingScore,
          aspects: {
            quality: ratingQuality,
            communication: ratingCommunication,
            speed: ratingSpeed
          },
          reviewText: reviewComment || 'Kolaborasi yang luar biasa! Hasil pengerjaan sangat memuaskan dan profesional.',
          tags: selectedTags,
          submittedAt: 'Hari ini'
        };
        const ratingLog = {
          id: `log-rating-${Date.now()}`,
          senderRole: 'business' as const,
          senderName: c.businessName,
          action: `Memberikan Rating ${ratingScore}/5 & Testimoni Apresiasi`,
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
    }));

    setIsRatingModalOpen(false);
    showToast('🌟 Rating & ulasan Anda berhasil dipublikasikan ke reputasi kreator!');
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
    'Hasil Aesthetic',
    'Komunikatif & Ramah',
    'Sesuai Brand Guidelines',
    'Highly Recommended',
    'Creative Visionary'
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0d0c22] font-sans">
      <Navbar
        currentUser={currentUser}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        activePage="collaboration-room"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d0c22] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1520px] mx-auto px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ============================================================== */}
        {/* HEADER: POV BUSINESS / UMKM & ESCROW WORKFLOW BANNER          */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs p-5 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Brand Identity & Active Room Title */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/60 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>POV Business / UMKM</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Proteksi Rekening Escrow Creatorin</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Room Aktif: {collaborations.filter(c => c.currentStage !== 'completed').length} Proyek
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0d0c22] tracking-tight">
                  Collaboration Room
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl mt-1">
                  Ruang kolaborasi resmi antara Bisnis/UMKM dan Kreator setelah pembayaran invoice terkonfirmasi di Escrow. Pantau proses produksi secara real-time dari brief hingga approval akhir.
                </p>
              </div>
            </div>

            {/* Right: Quick Shortcuts & UMKM Profile Jump */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('umkm-profile')}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/70 text-xs font-bold text-neutral-800 transition flex items-center gap-2 cursor-pointer"
                title="Buka profil UMKM Anda"
              >
                <img
                  src={activeCollab.businessAvatar}
                  alt={activeCollab.businessBrand}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>Profil {activeCollab.businessBrand}</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="px-4 py-2.5 rounded-xl bg-[#0d0c22] hover:bg-neutral-900 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Buka Chat Room</span>
              </button>
            </div>
          </div>

          {/* Platform Workflow Mini Tracker */}
          <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-[11px]">
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">1</div>
              <span>Diskusi & Negosiasi</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">2</div>
              <span>Bayar Invoice ke Escrow</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">3</div>
              <span>Room Kolaborasi Dibuka</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-[10px]">4</div>
              <span>Review & Revisi Draft</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-[10px]">5</div>
              <span>Approval Hasil Akhir</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-[10px]">6</div>
              <span>Terbit Profil & Rating</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TWO COLUMN WORKSPACE: COLLAB LIST & ACTIVE ROOM DETAIL        */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ------------------------------------------------------------ */}
          {/* COLUMN 1 (4 COLS): LIST OF COLLABORATIONS                    */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Filter Tabs & Search Header */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
              
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0d0c22] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Daftar Proyek Kolaborasi</span>
                </h2>
                <span className="text-xs font-bold text-neutral-400">
                  {collaborations.length} Proyek
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama kreator atau judul..."
                  className="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white text-xs text-[#0d0c22] placeholder:text-neutral-400 pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200/80 focus:outline-hidden focus:ring-2 focus:ring-[#0d0c22] transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                    filterTab === 'all'
                      ? 'bg-white text-[#0d0c22] shadow-2xs'
                      : 'text-neutral-500 hover:text-[#0d0c22]'
                  }`}
                >
                  Semua ({collaborations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('review')}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                    filterTab === 'review'
                      ? 'bg-white text-amber-700 shadow-2xs'
                      : 'text-neutral-500 hover:text-[#0d0c22]'
                  }`}
                >
                  <span>Review (1)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('active')}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                    filterTab === 'active'
                      ? 'bg-white text-[#0d0c22] shadow-2xs'
                      : 'text-neutral-500 hover:text-[#0d0c22]'
                  }`}
                >
                  Aktif (3)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('completed')}
                  className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                    filterTab === 'completed'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-neutral-500 hover:text-[#0d0c22]'
                  }`}
                >
                  Selesai (1)
                </button>
              </div>
            </div>

            {/* List of Cards */}
            <div className="space-y-3">
              {filteredCollaborations.map((collab) => {
                const isSelected = collab.id === activeCollab.id;
                
                // Color badges for stages
                const stageBadge = () => {
                  switch (collab.currentStage) {
                    case 'brief':
                      return { text: 'Brief & Kickoff', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
                    case 'in_progress':
                      return { text: 'Pengerjaan', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
                    case 'review':
                      return { text: 'Menunggu Review Anda', bg: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold animate-pulse' };
                    case 'revision':
                      return { text: 'Revisi Berjalan', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
                    case 'completed':
                      return { text: '✓ Selesai & Terbit', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                    default:
                      return { text: collab.currentStage, bg: 'bg-neutral-100 text-neutral-700 border-neutral-200' };
                  }
                };

                const badge = stageBadge();

                return (
                  <div
                    key={collab.id}
                    onClick={() => {
                      setSelectedCollabId(collab.id);
                      setRoomInnerTab('deliverables');
                    }}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                      isSelected
                        ? 'bg-white border-[#0d0c22] shadow-md ring-2 ring-[#0d0c22]/10'
                        : 'bg-white hover:bg-neutral-50/90 border-neutral-200/80 shadow-2xs hover:border-neutral-300'
                    }`}
                  >
                    {/* Top Room Code & Stage Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-mono font-bold text-neutral-400">
                        {collab.roomCode}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border font-bold ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-sm font-extrabold text-[#0d0c22] line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {collab.projectTitle}
                    </h3>

                    {/* Creator Info */}
                    <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-neutral-100">
                      <img
                        src={collab.creatorAvatar}
                        alt={collab.creatorName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#0d0c22] truncate flex items-center gap-1">
                          <span>{collab.creatorName}</span>
                          <span className="text-blue-600 font-bold text-[10px]">✓</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {collab.creatorRole}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[#0d0c22] font-mono shrink-0">
                        {collab.budgetFormatted}
                      </span>
                    </div>

                    {/* Progress Bar & Escrow Tag */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Escrow Aman</span>
                        </span>
                        <span className="font-mono font-bold text-[#0d0c22]">
                          {collab.progressPercent}%
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            collab.currentStage === 'completed'
                              ? 'bg-emerald-500'
                              : collab.currentStage === 'review'
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${collab.progressPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredCollaborations.length === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200/80">
                  <p className="text-xs text-neutral-500">Tidak ada proyek kolaborasi ditemukan.</p>
                </div>
              )}
            </div>

          </div>

          {/* ------------------------------------------------------------ */}
          {/* COLUMN 2 (8 COLS): ACTIVE COLLABORATION ROOM DETAIL          */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Room Master Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs p-6 sm:p-8 space-y-6 text-left">
              
              {/* Top Bar: Room Code & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-neutral-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      ROOM ID: {activeCollab.roomCode}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-xs font-bold text-neutral-600">
                      Invoice: {activeCollab.invoiceNumber}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-[#0d0c22] tracking-tight">
                    {activeCollab.projectTitle}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Mulai: {activeCollab.startDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Target: {activeCollab.deadlineDate}</span>
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-700">
                      Kategori: {activeCollab.category}
                    </span>
                  </div>
                </div>

                {/* Escrow Amount Pill */}
                <div className="shrink-0 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-right space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Nilai Proyek di Escrow
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono text-blue-600">
                    {activeCollab.budgetFormatted}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {activeCollab.escrowStatus === 'held_in_escrow'
                        ? 'Dana Ditahan di Escrow'
                        : 'Dana Telah Dicairkan'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator & Business Parties Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50/70 border border-neutral-100 text-xs">
                {/* Creator */}
                <div className="flex items-center gap-3">
                  <img
                    src={activeCollab.creatorAvatar}
                    alt={activeCollab.creatorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Kreator Penyedia Jasa
                    </span>
                    <div className="font-bold text-[#0d0c22] text-sm truncate flex items-center gap-1">
                      <span>{activeCollab.creatorName}</span>
                      <span className="text-blue-600 font-bold">✓</span>
                    </div>
                    <span className="text-neutral-500 text-[11px]">
                      {activeCollab.creatorRole} • ★ {activeCollab.creatorRating}
                    </span>
                  </div>
                </div>

                {/* Business */}
                <div className="flex items-center gap-3 sm:border-l sm:border-neutral-200/70 sm:pl-4">
                  <img
                    src={activeCollab.businessAvatar}
                    alt={activeCollab.businessBrand}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Pihak Klien (UMKM / Bisnis)
                    </span>
                    <div className="font-bold text-[#0d0c22] text-sm truncate">
                      {activeCollab.businessBrand}
                    </div>
                    <span className="text-neutral-500 text-[11px]">
                      PIC: {activeCollab.businessName} (Anda)
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* STEP PROGRESS TRACKER (REAL-TIME INTERACTIVE WORKFLOW)     */}
              {/* ========================================================== */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-neutral-600" />
                    <span>Real-Time Progress Tracker</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Tahap {currentStageNumber} dari 6
                  </span>
                </div>

                {/* Step Circles & Connectors */}
                <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-100 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[580px] relative">
                    
                    {/* Background track line */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-neutral-200 z-0">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${((currentStageNumber - 1) / 5) * 100}%` }}
                      />
                    </div>

                    {STEPS.map((step) => {
                      const isPast = step.number < currentStageNumber;
                      const isCurrent = step.number === currentStageNumber;

                      return (
                        <div key={step.stage} className="flex flex-col items-center relative z-10 text-center w-24">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isPast
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                                : 'bg-white border-2 border-neutral-300 text-neutral-400'
                            }`}
                          >
                            {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                          </div>
                          <span
                            className={`text-[11px] font-bold mt-2 leading-tight ${
                              isCurrent ? 'text-blue-600 font-extrabold' : isPast ? 'text-[#0d0c22]' : 'text-neutral-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[9px] text-neutral-400 line-clamp-1 mt-0.5">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Stage Banner Notice */}
                {activeCollab.currentStage === 'review' && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm">
                          Draft Deliverable v1 Siap Ditinjau!
                        </div>
                        <p className="text-xs text-amber-900/80 mt-0.5">
                          Kreator telah mengunggah draft karya. Tonton preview di bawah, ajukan revisi jika diperlukan, atau setujui untuk menyelesaikan proyek dan mencairkan escrow.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsRevisionModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-amber-200 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Minta Revisi</span>
                      </button>

                      <button
                        onClick={() => setIsApproveConfirmModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui (Approve)</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeCollab.currentStage === 'completed' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-950">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-2">
                          <span>✓ Proyek Selesai & Terbit ke Profil UMKM</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">LUNAS</span>
                        </div>
                        <p className="text-xs text-emerald-900/90 mt-0.5">
                          Dana escrow {activeCollab.budgetFormatted} telah dicairkan ke kreator. Proyek ini sudah otomatis terbit di halaman profil UMKM Anda.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigate('umkm-profile')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <span>Lihat di Profil UMKM</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================== */}
              {/* INNER WORKSPACE TABS                                       */}
              {/* ========================================================== */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-2 overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setRoomInnerTab('deliverables')}
                    className={`py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      roomInnerTab === 'deliverables'
                        ? 'bg-[#0d0c22] text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-[#0d0c22]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Hasil Karya & Deliverables ({activeCollab.deliverables.length})</span>
                  </button>

                  <button
                    onClick={() => setRoomInnerTab('brief')}
                    className={`py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      roomInnerTab === 'brief'
                        ? 'bg-[#0d0c22] text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-[#0d0c22]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Brief & Aset Brand</span>
                  </button>

                  <button
                    onClick={() => setRoomInnerTab('revisions')}
                    className={`py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      roomInnerTab === 'revisions'
                        ? 'bg-[#0d0c22] text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-[#0d0c22]'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Catatan Revisi ({activeCollab.revisions.length})</span>
                  </button>

                  <button
                    onClick={() => setRoomInnerTab('logs')}
                    className={`py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      roomInnerTab === 'logs'
                        ? 'bg-[#0d0c22] text-white shadow-2xs'
                        : 'text-neutral-500 hover:text-[#0d0c22]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Log Aktivitas ({activeCollab.activityLogs.length})</span>
                  </button>
                </div>

                {/* TAB CONTENT 1: DELIVERABLES PREVIEW */}
                {roomInnerTab === 'deliverables' && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                    {activeCollab.deliverables.length > 0 ? (
                      activeCollab.deliverables.map((deliv) => (
                        <div
                          key={deliv.id}
                          className="p-5 rounded-3xl border border-neutral-200/80 bg-white space-y-4 shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                                  VERSI {deliv.version}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  Diunggah: {deliv.uploadedAt}
                                </span>
                              </div>
                              <h4 className="text-sm sm:text-base font-extrabold text-[#0d0c22] mt-1">
                                {deliv.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-400 font-mono">
                                {deliv.filesize}
                              </span>
                              {deliv.externalLink && (
                                <a
                                  href={deliv.externalLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1 transition"
                                >
                                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>Unduh File</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Creator Note */}
                          {deliv.creatorNote && (
                            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/70 text-xs text-blue-950 flex items-start gap-2.5">
                              <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold block">Pesan dari Kreator ({activeCollab.creatorName}):</span>
                                <p className="text-blue-900/80 leading-relaxed">
                                  "{deliv.creatorNote}"
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Media Player Simulation */}
                          <div className="relative aspect-video sm:aspect-2/1 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center group shadow-inner">
                            <img
                              src={deliv.previewThumbnail || deliv.url}
                              alt={deliv.title}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                isPlaying ? 'opacity-90' : 'opacity-70 group-hover:opacity-85'
                              }`}
                            />

                            {/* Simulated Watermark for unapproved draft */}
                            {activeCollab.currentStage !== 'completed' && (
                              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                <span>DRAFT PREVIEW • WATERMARKED</span>
                              </div>
                            )}

                            {/* Play / Pause Interactive Trigger */}
                            <button
                              type="button"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 hover:bg-white text-black flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10"
                            >
                              {isPlaying ? (
                                <Pause className="w-6 h-6 fill-black" />
                              ) : (
                                <Play className="w-6 h-6 fill-black ml-1" />
                              )}
                            </button>

                            {/* Video Controls Bar */}
                            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-xs z-10">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px]">00:{isPlaying ? '14' : '00'} / 00:28</span>
                                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">1080p 60fps</span>
                              </div>
                              <span className="text-[11px] text-neutral-300">
                                Audio: Senja Acoustic Ambient (Licensed)
                              </span>
                            </div>
                          </div>

                          {/* Quick Decision Bar for Business */}
                          {activeCollab.currentStage === 'review' && (
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100">
                              <span className="text-xs text-neutral-500">
                                Sudah puas dengan hasil video ini? Klik Approve untuk menyelesaikan proyek.
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setIsRevisionModalOpen(true)}
                                  className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>Minta Revisi Minor</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setIsApproveConfirmModalOpen(true)}
                                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Setujui Hasil Akhir</span>
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center rounded-3xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                        <Clock className="w-8 h-8 text-neutral-400 mx-auto animate-pulse" />
                        <h4 className="text-sm font-bold text-[#0d0c22]">
                          Kreator Sedang Memproduksi Aset
                        </h4>
                        <p className="text-xs text-neutral-500 max-w-md mx-auto">
                          Draft video dan file karya akan otomatis tampil di sini saat diunggah oleh {activeCollab.creatorName}.
                        </p>
                      </div>
                    )}

                    {/* Rating Card if completed */}
                    {activeCollab.rating && (
                      <div className="p-5 rounded-3xl border border-amber-200 bg-amber-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span>Rating & Ulasan yang Anda Berikan ke Kreator</span>
                          </span>
                          <span className="text-xs text-neutral-400">
                            {activeCollab.rating.submittedAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= activeCollab.rating!.score
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-neutral-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-extrabold text-sm text-[#0d0c22]">
                            {activeCollab.rating.score}.0 / 5.0
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-700 italic">
                          "{activeCollab.rating.reviewText}"
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activeCollab.rating.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT 2: BRIEF & BRAND ASSETS */}
                {roomInnerTab === 'brief' && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-150 text-xs">
                    <div className="p-5 rounded-3xl border border-neutral-200/80 bg-white space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Ringkasan Kebutuhan Proyek
                        </span>
                        <p className="text-sm font-semibold text-[#0d0c22] mt-1 leading-relaxed">
                          {activeCollab.briefDetails.summary}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-neutral-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Poin Ketentuan Konten (Checklist)
                        </span>
                        <ul className="space-y-2">
                          {activeCollab.briefDetails.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-neutral-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {activeCollab.briefDetails.brandAssets.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-neutral-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                            File Panduan & Aset Brand Terlampir
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeCollab.briefDetails.brandAssets.map((asset, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-semibold text-neutral-800 truncate">
                                    {asset.name}
                                  </span>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono shrink-0">
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

                {/* TAB CONTENT 3: REVISIONS */}
                {roomInnerTab === 'revisions' && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-500">
                        Riwayat Revisi (Kuota: 2x Revisi Minor)
                      </span>
                      {activeCollab.currentStage === 'review' && (
                        <button
                          onClick={() => setIsRevisionModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition"
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
                          className="p-4 rounded-2xl border border-neutral-200/80 bg-white space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0d0c22]">
                              Putaran Revisi #{rev.revisionRound}
                            </span>
                            <span className="text-neutral-400">{rev.requestedAt}</span>
                          </div>
                          <p className="text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                            "{rev.feedbackText}"
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Status: {rev.status === 'resolved' ? 'Telah Diperbaiki' : 'Sedang Dikerjakan Kreator'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center rounded-3xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                        <p className="text-xs text-neutral-500">
                          Belum ada catatan revisi. Draft karya v1 siap ditinjau.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT 4: ACTIVITY LOGS */}
                {roomInnerTab === 'logs' && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                    {activeCollab.activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl border border-neutral-200/80 bg-white flex items-start gap-3 text-xs"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            log.senderRole === 'system'
                              ? 'bg-blue-100 text-blue-700'
                              : log.senderRole === 'business'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {log.senderRole === 'system' ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : log.senderRole === 'business' ? (
                            <Building2 className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0d0c22]">
                              {log.action}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {log.timestamp}
                            </span>
                          </div>
                          {log.detail && (
                            <p className="text-neutral-600 text-[11px] leading-relaxed">
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
      {/* MODAL 1: FORM MINTA REVISI (POV BUSINESS)                      */}
      {/* ============================================================== */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <h3 className="text-base sm:text-lg font-extrabold text-[#0d0c22]">
                  Ajukan Catatan Revisi Karya
                </h3>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <span className="font-bold block mb-1">Tips Memberikan Feedback Efektif:</span>
              <p className="text-amber-900/90 leading-relaxed">
                Tuliskan bagian detik video atau elemen visual yang ingin diubah secara spesifik (misal: "Di detik ke-05 mohon perjelas logo kemasan cold brew").
              </p>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                  Detail Penyesuaian & Feedback:
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="Contoh: Tolong tambahkan close-up tetesan kopi saat dituang ke es batu di detik ke-6, dan perjelas teks promo di akhir video..."
                  className="w-full p-3 rounded-2xl border border-neutral-300 focus:border-[#0d0c22] focus:ring-2 focus:ring-[#0d0c22]/10 text-xs text-[#0d0c22] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0d0c22] hover:bg-neutral-900 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Revisi ke Kreator</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0d0c22]">
                Setujui Hasil Akhir & Selesaikan Proyek?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Tindakan ini akan mengonfirmasi bahwa Anda telah puas dengan karya kreator.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-neutral-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dana escrow <strong>{activeCollab.budgetFormatted}</strong> dicairkan ke rekening kreator.</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Proyek otomatis terpublikasi di <strong>Profil UMKM Anda</strong> pada tab Kolaborasi Selesai.</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Anda akan diarahkan untuk memberikan rating bintang & testimoni bagi kreator.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsApproveConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
              >
                Tinjau Ulang
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Setujui & Cairkan Escrow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RATING & REVIEW FOR CREATOR (POV BUSINESS)           */}
      {/* ============================================================== */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base sm:text-lg font-extrabold text-[#0d0c22]">
                  Beri Rating & Testimoni Kreator
                </h3>
              </div>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Creator Header */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <img
                src={activeCollab.creatorAvatar}
                alt={activeCollab.creatorName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white shrink-0"
              />
              <div>
                <h4 className="text-sm font-extrabold text-[#0d0c22]">
                  {activeCollab.creatorName}
                </h4>
                <p className="text-xs text-neutral-400">
                  {activeCollab.creatorRole}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
              
              {/* Overall Star Rating */}
              <div className="text-center py-2 space-y-1.5">
                <span className="text-xs font-bold text-neutral-600 block">
                  Seberapa puas Anda dengan hasil kolaborasi ini?
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className="p-1 cursor-pointer transition hover:scale-125 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${
                          star <= ratingScore
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-neutral-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 block">
                  {ratingScore === 5 && 'Sangat Luar Biasa & Memuaskan ★★★★★'}
                  {ratingScore === 4 && 'Bagus & Memuaskan ★★★★☆'}
                  {ratingScore === 3 && 'Cukup Baik ★★★☆☆'}
                  {ratingScore <= 2 && 'Perlu Peningkatan ★★☆☆☆'}
                </span>
              </div>

              {/* Sub Aspects */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Kualitas Karya</span>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        onClick={() => setRatingQuality(s)}
                        className={`w-3.5 h-3.5 cursor-pointer ${s <= ratingQuality ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 block">Komunikasi</span>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        onClick={() => setRatingCommunication(s)}
                        className={`w-3.5 h-3.5 cursor-pointer ${s <= ratingCommunication ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 block">Ketepatan Waktu</span>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        onClick={() => setRatingSpeed(s)}
                        className={`w-3.5 h-3.5 cursor-pointer ${s <= ratingSpeed ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-700 block">
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
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#0d0c22] text-white border-[#0d0c22]'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Testimonial Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  Tulis Ulasan & Testimoni Anda:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda berkolaborasi dengan kreator ini..."
                  className="w-full p-3 rounded-2xl border border-neutral-300 focus:border-[#0d0c22] focus:ring-2 focus:ring-[#0d0c22]/10 text-xs text-[#0d0c22] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kirim Rating & Publikasikan ke Profil</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Mini Calendar Helper Icon
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
