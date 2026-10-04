'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Users,
  FileText,
  Sparkles,
  MessageCircle,
  Check,
  ShieldCheck,
  Star,
  Play,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Truck,
  Video,
  Award,
  CreditCard,
  Briefcase,
  Copy,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Globe,
  Mail,
  User,
  Package,
  Phone,
  Instagram
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ProjectListing, AuthState, ActivePage, Creator } from '@/types';
import { MOCK_PROJECTS } from '@/data/mockProjects';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { MOCK_BRIEF_APPLICANTS, BriefApplicant } from '@/data/mockBriefApplicants';
import { MOCK_PRIMARY_UMKM, MOCK_ALL_UMKM } from '@/data/mockUmkm';

// Helper to format clean display budget
const formatDisplayBudget = (formatted?: string, budgetMin?: number) => {
  if (budgetMin) {
    return `Rp${budgetMin.toLocaleString('id-ID')}`;
  }
  if (!formatted) return 'Rp1.500.000';
  const clean = formatted.split(/[-–—]|sampai/i)[0].trim();
  return clean.startsWith('Rp') ? clean : `Rp${clean}`;
};

interface BriefDetailPageProps {
  brief: ProjectListing;
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onClose?: () => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onEditBrief?: (brief: ProjectListing) => void;
}

export const BriefDetailPage: React.FC<BriefDetailPageProps> = ({
  brief: initialBrief,
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onClose,
  onViewCreatorProfile,
  onEditBrief
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
        'collaboration': '/contracts',
        'notifications': '/notifications',
        'briefs': '/briefs',
        'signin': '/sign-in',
        'signup': '/sign-up',
        'umkm-profile': '/umkm/kopi-kenangan-senja',
        'creator-profile': '/creator/sarah-azhari',
      };
      router.push(routeMap[page] || '/explore');
    }
  };
  const [currentBrief, setCurrentBrief] = useState<ProjectListing>(initialBrief);
  const [activeTab, setActiveTab] = useState<'rincian' | 'pelamar' | 'klien'>('rincian');
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [applicantsFilter, setApplicantsFilter] = useState<'all' | 'shortlisted' | 'pending'>('all');
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigateTo('briefs', '/briefs');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Matched UMKM Profile for About section
  const matchedUmkm = useMemo(() => {
    return MOCK_ALL_UMKM.find(u => 
      u.brandName.toLowerCase() === currentBrief.clientName?.toLowerCase() ||
      currentBrief.clientName?.toLowerCase().includes(u.brandName.toLowerCase()) ||
      u.brandName.toLowerCase().includes(currentBrief.clientName?.toLowerCase())
    ) || MOCK_PRIMARY_UMKM;
  }, [currentBrief.clientName]);

  // Applicants state
  const [applicants, setApplicants] = useState<BriefApplicant[]>(MOCK_BRIEF_APPLICANTS);
  const [selectedApplicantForContract, setSelectedApplicantForContract] = useState<BriefApplicant | null>(null);
  const [selectedSampleForPreview, setSelectedSampleForPreview] = useState<{
    title: string;
    thumbnail: string;
    views?: string;
    likes?: string;
    creatorName: string;
  } | null>(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyForm, setApplyForm] = useState({
    bidRate: currentBrief.budgetMin ? currentBrief.budgetMin.toString() : '1500000',
    duration: currentBrief.deadline || '3 Hari Kerja',
    pitch: '',
    portfolioLink: ''
  });

  // Edit Brief Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: currentBrief.title,
    category: currentBrief.category,
    budgetMin: (currentBrief.budgetMin || 1500000).toString(),
    deadline: currentBrief.deadline,
    description: currentBrief.description,
    deliverables: (currentBrief.deliverables || []).join('\n'),
    skills: (currentBrief.requiredSkills || []).join(', '),
    productShipping: currentBrief.productShippingProvided ?? true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } else {
      showToast('Tautan brief berhasil disalin ke clipboard!');
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Brief disimpan ke daftar favorit Anda' : 'Brief dihapus dari daftar simpan');
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    showToast(!isLiked ? 'Anda menyukai brief proyek ini' : 'Batal menyukai brief');
  };

  const handleToggleShortlist = (applicantId: string) => {
    setApplicants(prev => prev.map(app => {
      if (app.id === applicantId) {
        const nextStatus = app.status === 'shortlisted' ? 'pending' : 'shortlisted';
        showToast(nextStatus === 'shortlisted' ? `${app.creatorName} berhasil masuk Shortlist!` : `${app.creatorName} kembali ke status review`);
        return { ...app, status: nextStatus };
      }
      return app;
    }));
  };

  const handleAcceptProposal = (applicant: BriefApplicant) => {
    setSelectedApplicantForContract(applicant);
  };

  const handleConfirmContract = () => {
    if (!selectedApplicantForContract) return;
    setApplicants(prev => prev.map(app => 
      app.id === selectedApplicantForContract.id ? { ...app, status: 'accepted' } : app
    ));
    const name = selectedApplicantForContract.creatorName;
    setSelectedApplicantForContract(null);
    showToast(`Selamat! Kontrak kerjasama dengan ${name} telah dimulai dengan Rekening Bersama Escrow.`);
  };

  const handleSubmitApply = (e: React.FormEvent) => {
    e.preventDefault();
    const bidNum = parseInt(applyForm.bidRate) || 1500000;
    
    // Add new applicant to state
    const newApp: BriefApplicant = {
      id: `app-new-${Date.now()}`,
      briefId: currentBrief.id,
      creatorId: 'cr-self',
      creatorName: currentUser?.name || 'Anda (Kreator Terverifikasi)',
      creatorUsername: '@' + (currentUser?.name ? currentUser.name.toLowerCase().replace(/\s+/g, '') : 'kreator'),
      creatorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      creatorRole: 'Content Creator & Video Specialist',
      careerScore: 98,
      careerTier: 'Top Tier',
      location: 'Indonesia',
      rating: 5.0,
      completedProjects: 14,
      appliedDate: 'Baru saja',
      bidAmount: bidNum,
      formattedBid: `Rp${bidNum.toLocaleString('id-ID')}`,
      durationDays: applyForm.duration,
      pitch: applyForm.pitch || 'Halo, saya sangat tertarik untuk mengeksekusi brief ini dengan visual hook menarik dan retensi tinggi.',
      status: 'pending',
      portfolioSamples: [
        {
          id: 'new-samp-1',
          title: 'Contoh Konten Video Unggulan Kreator',
          thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
          views: '48.5K',
          likes: '4.2K',
          type: 'video'
        }
      ],
      isPro: true
    };

    setApplicants(prev => [newApp, ...prev]);
    setHasApplied(true);
    setIsApplyModalOpen(false);
    showToast('Proposal lamaran Anda berhasil dikirim ke UMKM!');
    setActiveTab('pelamar');
  };

  const handleSaveEditBrief = (e: React.FormEvent) => {
    e.preventDefault();
    const minNum = parseInt(editForm.budgetMin) || 1500000;
    const deliverablesList = editForm.deliverables
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);
    const skillsList = editForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updatedBrief: ProjectListing = {
      ...currentBrief,
      title: editForm.title,
      category: editForm.category,
      budgetMin: minNum,
      budgetMax: minNum,
      formattedBudget: `Rp${minNum.toLocaleString('id-ID')}`,
      deadline: editForm.deadline,
      description: editForm.description,
      deliverables: deliverablesList.length > 0 ? deliverablesList : currentBrief.deliverables,
      requiredSkills: skillsList.length > 0 ? skillsList : currentBrief.requiredSkills,
      productShippingProvided: editForm.productShipping
    };

    setCurrentBrief(updatedBrief);
    setIsEditModalOpen(false);
    if (onEditBrief) onEditBrief(updatedBrief);
    showToast('Brief proyek berhasil diperbarui!');
  };

  const filteredApplicants = applicants.filter(app => {
    if (applicantsFilter === 'shortlisted') return app.status === 'shortlisted';
    if (applicantsFilter === 'pending') return app.status === 'pending';
    return true;
  });

  const shortlistedCount = applicants.filter(a => a.status === 'shortlisted').length;
  const pendingCount = applicants.filter(a => a.status === 'pending').length;

  const clientDomain = `${currentBrief.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.creatorin.id`;
  const clientEmail = `halo@${currentBrief.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  // Filter other briefs from MOCK_PROJECTS
  const otherBriefs = MOCK_PROJECTS.filter(p => p.id !== currentBrief.id).slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/65 backdrop-blur-xs text-left animate-in fade-in duration-200 overflow-hidden font-sans"
      onClick={handleClose}
    >
      {/* Top Space with Close Button [X] */}
      <div className="shrink-0 flex items-center justify-end px-5 py-2.5 h-11 sm:h-12 pointer-events-none">
        <button
          id="btn-close-brief-detail"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="pointer-events-auto text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/15 flex items-center justify-center"
          title="Tutup (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Floating Modal Pop-up Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 bg-white text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#0B1F3A] text-white px-5 py-3 rounded-full flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Copied Link Toast */}
        {copiedToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B1F3A] text-white text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2]" />
            <span>Tautan brief berhasil disalin ke clipboard!</span>
          </div>
        )}

        {/* Floating Action Rail on the Right (Same signature UX as Project & Service Detail) */}
        <div className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-40 hidden md:flex flex-col items-center gap-2.5">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full border border-[#E2E8F0] bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Salin Tautan Brief"
          >
            <Copy className="w-4 h-4 stroke-[1.75]" />
          </button>

          <button
            onClick={handleToggleSave}
            className={`w-10 h-10 rounded-full border transition-colors cursor-pointer flex items-center justify-center shadow-xs ${
              isSaved
                ? 'border-[#0B1F3A] bg-[#0B1F3A] text-amber-400'
                : 'border-[#E2E8F0] bg-white text-neutral-600 hover:text-black hover:bg-neutral-50'
            }`}
            title="Simpan Brief"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => navigateTo('chat', '/chat')}
            className="w-10 h-10 rounded-full border border-[#E2E8F0] bg-white hover:bg-neutral-50 text-neutral-600 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Diskusikan via Chat"
          >
            <MessageCircle className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* FIXED SUB-HEADER: Client Profile Bar (Matching Screenshot) */}
        <header className="border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs sticky top-0 z-30 shrink-0">
          <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Left: Avatar & Profile Details */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div 
                onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
                className="relative cursor-pointer group shrink-0"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-linear-to-tr from-blue-600 to-indigo-500 shadow-xs">
                  {currentBrief.clientAvatar ? (
                    <img
                      src={currentBrief.clientAvatar}
                      alt={currentBrief.clientName}
                      className="w-full h-full rounded-full object-cover "
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#0B1F3A] text-white p-0.5 rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                </div>
              </div>

              <div className="text-left space-y-0.5 min-w-0">
                {/* Row 1: Client Name & Category & Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span 
                    onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
                    className="font-bold text-sm sm:text-base text-[#171717] hover:underline cursor-pointer truncate"
                  >
                    {currentBrief.clientName}
                  </span>
                  {currentBrief.isVerifiedClient && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Available for work</span>
                  </span>
                </div>

                {/* Row 2: Website / Domain • Email • Location (Exact layout from user screenshot) */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-medium">
                  <span 
                    className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer"
                    onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
                  >
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{clientDomain}</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <a href={`mailto:${clientEmail}`} className="flex items-center gap-1 hover:text-blue-600 transition">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{clientEmail}</span>
                  </a>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1 text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{currentBrief.clientLocation || 'Indonesia'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions (Like, Save, Edit, and Primary Lamar Button) */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleToggleLike}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
                  isLiked
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                title={isLiked ? 'Batal Suka' : 'Sukai Brief'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
              </button>

              <button
                onClick={handleToggleSave}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition cursor-pointer md:hidden shadow-2xs ${
                  isSaved
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-amber-400'
                    : 'border-[#E2E8F0] bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Simpan Brief"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>


              {hasApplied ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Lamaran Terkirim</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-5 py-2 sm:py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Lamar</span>
                </button>
              )}
            </div>

          </div>
        </header>

        {/* SCROLLABLE MAIN BODY */}
        <div ref={modalContainerRef} className="flex-1 overflow-y-auto min-h-0 bg-white">
          <main className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-6 sm:py-8 space-y-7 text-left">
            {/* 1. BRIEF HEADLINE & TAGS */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium tracking-wide">
              {currentBrief.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#171717] tracking-tight leading-snug">
            {currentBrief.title}
          </h1>
        </div>

        {/* 2. THREE-COLUMN KEY INFO STRIP (Anggaran, Waktu, Pelamar) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Metric 1: Anggaran Proyek */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] bg-white flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Anggaran Proyek
              </span>
              <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-[#171717] tracking-tight">
                {formatDisplayBudget(currentBrief.formattedBudget, currentBrief.budgetMin)}
              </div>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Garansi Escrow</span>
              </span>
            </div>
          </div>

          {/* Metric 2: Waktu Pengerjaan */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] bg-white flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Waktu Pengerjaan
              </span>
              <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                <Clock className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-[#171717] tracking-tight">
                {currentBrief.deadline}
              </div>
              <span className="text-xs text-neutral-500 font-normal">
                Maksimal 2x revisi
              </span>
            </div>
          </div>

          {/* Metric 3: Pelamar Terdaftar */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] bg-white flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Pelamar Terdaftar
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-[#1D4ED8] tracking-tight">
                {applicants.length} Kreator
              </div>
              <span className="text-xs text-neutral-500 font-normal">
                {shortlistedCount} Masuk Shortlist
              </span>
            </div>
          </div>

        </div>

        {/* 3. SECTION TABS (Styled matching profile tabs from screenshot) */}
        <div className="border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('rincian')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rincian'
                  ? 'bg-[#F3F3F4] font-semibold text-[#171717]'
                  : 'text-neutral-600 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              <span>Rincian Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pelamar')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pelamar'
                  ? 'bg-[#F3F3F4] font-semibold text-[#171717]'
                  : 'text-neutral-600 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              <span>Pelamar</span>
              <span className="text-[11px] font-medium text-neutral-500">
                {applicants.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('klien')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'klien'
                  ? 'bg-[#F3F3F4] font-semibold text-[#171717]'
                  : 'text-neutral-600 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              <span>Tentang UMKM</span>
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* TAB 1: RINCIAN & KEBUTUHAN BRIEF                                */}
        {/* =============================================================== */}
        {activeTab === 'rincian' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 1. Deskripsi (Langsung paragraf tanpa headline) */}
            <div className="space-y-2.5 max-w-4xl">
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
                {currentBrief.description}
              </p>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Kreator diharapkan mampu mengomunikasikan nilai keunikan produk secara organik dengan sentuhan storytelling khas kreator, visual tajam, audio jernih, serta call-to-action yang mendorong interaksi audiens.
              </p>
            </div>

            {/* 2. Hasil yang Diharapkan (Deliverables) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                  Hasil yang Diharapkan (Deliverables)
                </h2>
                <span className="text-xs text-neutral-400">
                  {currentBrief.deliverables?.length || 0} Target Output
                </span>
              </div>

              <div className="space-y-2.5 max-w-3xl">
                {currentBrief.deliverables?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-neutral-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-md bg-neutral-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Tagar (Langsung tagar tanpa headline) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {currentBrief.requiredSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer"
                >
                  #{sk.replace(/\s+/g, '')}
                </span>
              ))}
            </div>

          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: KREATOR YANG SUDAH APPLY                                 */}
        {/* =============================================================== */}
        {activeTab === 'pelamar' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter Pills Toolbar */}
            <div className="pb-3 border-b border-neutral-200/80">
              <h2 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                Daftar Kreator yang Mengajukan Lamaran ({applicants.length})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kreator terverifikasi yang siap mengeksekusi brief ini lengkap dengan portofolio relevan
              </p>
            </div>

            {/* Clean Flat Applicants List (Clear and clean layout, no heavy nested cards) */}
            <div className="space-y-6">
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="border border-[#E2E8F0] rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white space-y-5 text-left transition hover:border-neutral-300"
                >
                  {/* Top: Profil Kreator (Matching exact profile style from screenshot) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      {/* Avatar with Verified Badge */}
                      <div 
                        className="relative shrink-0 cursor-pointer group"
                        onClick={() => {
                          const match = MOCK_CREATORS.find(c => c.name === applicant.creatorName) || MOCK_CREATORS[0];
                          if (onViewCreatorProfile) onViewCreatorProfile(match);
                          else router.push(`/creator/${match.id}`);
                        }}
                      >
                        <img
                          src={applicant.creatorAvatar}
                          alt={applicant.creatorName}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-neutral-100 "
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#0B1F3A] text-white p-1 rounded-full ring-2 ring-white">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                        </div>
                      </div>

                      {/* Detail Nama & Badges */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 
                            onClick={() => {
                              const match = MOCK_CREATORS.find(c => c.name === applicant.creatorName) || MOCK_CREATORS[0];
                              if (onViewCreatorProfile) onViewCreatorProfile(match);
                              else router.push(`/creator/${match.id}`);
                            }}
                            className="text-lg sm:text-xl font-bold tracking-tight text-[#171717] hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {applicant.creatorName}
                          </h3>

                          {applicant.isPro && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-[#0B1F3A] text-white tracking-wider">
                              PRO+
                            </span>
                          )}

                          <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{applicant.rating || 5}</span>
                            <span className="text-neutral-400 font-normal">({applicant.completedProjects || 88})</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 ml-1">
                            <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[3]" />
                            <span>{applicant.completedProjects || 88} proyek selesai</span>
                          </div>

                          <span className="text-[11px] font-medium text-neutral-400 ml-1 hidden sm:inline">
                            Promoted
                          </span>
                        </div>

                        {/* Sub-info Row: Tawaran, Lokasi, Skor Karir, Durasi */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 mt-1.5">
                          <span className="font-semibold text-neutral-800">
                            Tawaran {applicant.formattedBid}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            {applicant.location}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-neutral-700">
                            {applicant.careerScore}% Skor Karir
                          </span>
                          <span>•</span>
                          <span>Waktu {applicant.durationDays}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Paragraf Deskripsi / Pesan Lamaran (Tanpa Card) */}
                  <p className="text-sm sm:text-[15px] text-neutral-600 leading-relaxed font-normal">
                    {applicant.pitch}
                  </p>

                  {/* Applicant Actions (Clean, Flat, Minimalist) */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const match = MOCK_CREATORS.find(c => c.name === applicant.creatorName) || MOCK_CREATORS[0];
                        if (onViewCreatorProfile) onViewCreatorProfile(match);
                        else router.push(`/creator/${match.id}`);
                      }}
                      className="text-xs font-semibold text-neutral-600 hover:text-[#171717] transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Portofolio Lengkap</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigateTo('chat', '/chat')}
                        aria-label={`Chat dengan ${applicant.creatorName}`}
                        title="Chat"
                        className="w-9 h-9 rounded-xl border border-[#E2E8F0] hover:border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-[#171717] transition flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptProposal(applicant)}
                        className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Pilih Creator</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: TENTANG UMKM / ABOUT BRAND                               */}
        {/* Exact layout and styling matching UMKM Profile About tab        */}
        {/* =============================================================== */}
        {activeTab === 'klien' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 text-left w-full pt-1 animate-in fade-in duration-200">
            
            {/* Sisi Kiri: Story/Bio, Brand Values, Target Audience, Sample Policy, Color Palette */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Kisah & Bio Brand */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-3">
                  Kisah Brand & Filosofi
                </h3>
                <div className="space-y-3.5 text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal">
                  <p>
                    {matchedUmkm.bio}
                  </p>
                  <p className="text-neutral-600">
                    Sebagai brand lokal yang bertumbuh di era digital, kami sangat menghargai kreativitas dan sudut pandang autentik para kreator konten. Kami percaya kolaborasi yang kuat dibangun di atas kejelasan brief, transparansi timeline, dan kepastian pembayaran tepat waktu melalui sistem Escrow terpercaya.
                  </p>
                </div>
              </div>

              {/* Brand Values / Nilai Brand (Pills style) */}
              {matchedUmkm.brandGuide?.brandValues && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-3">
                    Nilai & Karakter Brand
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchedUmkm.brandGuide.brandValues.map((val, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-lg bg-[#f3f3f4] text-neutral-800 text-xs font-medium hover:bg-neutral-200/70 transition cursor-default"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audiens */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-2.5">
                  Target Audiens Produk
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed font-normal">
                  {matchedUmkm.brandGuide?.targetAudience || 'Konsumen muda urban usia 20-35 tahun, penikmat produk lokal premium, aktif di media sosial Instagram & TikTok.'}
                </p>
              </div>

              {/* Kebijakan Kirim Sampel Produk Fisik */}
              {matchedUmkm.brandGuide?.sampleShippingPolicy && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-2.5 flex items-center gap-2">
                    <Package className="w-4 h-4 text-neutral-600" />
                    <span>Kebijakan Pengiriman Sampel Produk Fisik</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#fafafa] border border-neutral-100 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    {matchedUmkm.brandGuide.sampleShippingPolicy}
                  </div>
                </div>
              )}

              {/* Palet Warna Brand */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-3">
                  Palet Warna Brand
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl shadow-xs border border-neutral-200"
                      style={{ backgroundColor: matchedUmkm.brandGuide?.primaryColor || '#78350f' }}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#0d0c22]">Warna Primer</div>
                      <div className="text-[11px] font-mono text-neutral-500">{matchedUmkm.brandGuide?.primaryColor || '#78350f'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl shadow-xs border border-neutral-200"
                      style={{ backgroundColor: matchedUmkm.brandGuide?.secondaryColor || '#fef3c7' }}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#0d0c22]">Warna Sekunder</div>
                      <div className="text-[11px] font-mono text-neutral-500">{matchedUmkm.brandGuide?.secondaryColor || '#fef3c7'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <hr className="border-neutral-200/80 my-6" />

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-neutral-600 font-normal">
                <span>
                  <strong className="text-[#0d0c22] font-semibold">{matchedUmkm.stats.completedProjects}</strong> kolaborasi selesai
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">{matchedUmkm.stats.activeBriefs}</strong> brief aktif
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">100%</strong> garansi escrow aman
                </span>
              </div>

            </div>

            {/* Sisi Kanan: Location Card, Contact Info, Social & Marketplace Links */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Location & Status Card */}
              <div className="bg-[#fafafa] rounded-2xl p-5 sm:p-6 space-y-3.5 border border-neutral-100 text-sm text-neutral-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>{matchedUmkm.location}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#0d0c22] text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    PRO
                  </div>
                  <span>Verified UMKM Escrow</span>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>{matchedUmkm.joinedDate}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#0d0c22] mb-3">Kontak & Media Sosial</h4>
                <div className="space-y-2.5 text-sm text-neutral-700">
                  {matchedUmkm.website && (
                    <a
                      href={matchedUmkm.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 hover:text-[#0d0c22] transition group"
                    >
                      <Globe className="w-4 h-4 text-neutral-500 group-hover:text-[#0d0c22]" />
                      <span>{matchedUmkm.website.replace('https://', '')}</span>
                    </a>
                  )}
                  {matchedUmkm.whatsapp && (
                    <a
                      href={`https://wa.me/${matchedUmkm.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 hover:text-[#0d0c22] transition group"
                    >
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp ({matchedUmkm.whatsapp})</span>
                    </a>
                  )}
                  {matchedUmkm.instagram && (
                    <a
                      href={`https://instagram.com/${matchedUmkm.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 hover:text-[#0d0c22] transition group"
                    >
                      <Instagram className="w-4 h-4 text-rose-500" />
                      <span>{matchedUmkm.instagram}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tombol Lihat Profil Lengkap Brand */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-[#0d0c22] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span>Buka Halaman Profil Brand</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =============================================================== */}
        {/* SIGNATURE PROFILE DIVIDER SECTION (CENTER AVATAR ON DIVIDER)    */}
        {/* Exactly matching ProjectDetailModal & ServiceDetailModal        */}
        {/* =============================================================== */}
        <div className="relative pt-12 text-center">
          {/* Divider line */}
          <div className="absolute top-12 inset-x-0 border-t border-neutral-200 z-0" />

          {/* Centered Avatar */}
          <div className="relative z-10 inline-block -mt-6">
            <div 
              onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
              className="w-16 h-16 rounded-full p-1 bg-white ring-4 ring-neutral-100 cursor-pointer group mx-auto"
            >
              {currentBrief.clientAvatar ? (
                <img
                  src={currentBrief.clientAvatar}
                  alt={currentBrief.clientName}
                  className="w-full h-full rounded-full object-cover "
                />
              ) : (
                <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="mt-4 space-y-2 max-w-xl mx-auto text-center">
            <h2 
              onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
              className="text-lg sm:text-xl font-black text-[#0d0c22] tracking-wider uppercase cursor-pointer hover:underline"
            >
              {currentBrief.clientName}
            </h2>

            <div className="flex items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-extrabold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>KLIEN UMKM TERVERIFIKASI CREATORIN</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 font-medium pt-1">
              {currentBrief.clientIndustry || 'Brand & UMKM Lokal'} • Berlokasi di {currentBrief.clientLocation || 'Indonesia'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => navigateTo('chat', '/chat')}
                className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Kirim Pesan
              </button>
              <button
                onClick={() => navigateTo('umkm-profile', '/umkm/kopi-kenangan-senja')}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-[#0d0c22] border border-neutral-300 text-xs font-bold transition cursor-pointer"
              >
                Lihat Profil UMKM
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-neutral-500 font-medium">
              <span className="hover:text-blue-600 transition cursor-pointer">{clientDomain}</span>
              <span>•</span>
              <span className="hover:text-blue-600 transition cursor-pointer">{clientEmail}</span>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* BRIEF LAINNYA DARI KLIEN (MATCHING PROJECT BRIEFS PAGE STYLE)    */}
        {/* =============================================================== */}
        <div className="pt-10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#0d0c22]">
              Brief Proyek Lainnya yang Sedang Aktif
            </h3>
            <button
              onClick={() => navigateTo('briefs', '/briefs')}
              className="text-xs font-semibold text-neutral-500 hover:text-[#0d0c22] transition cursor-pointer"
            >
              Lihat Semua Brief →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherBriefs.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setCurrentBrief(project);
                  setActiveTab('rincian');
                  if (modalContainerRef.current) {
                    modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 hover:border-neutral-300 hover:shadow-lg transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between cursor-pointer text-left relative"
              >
                <div>
                  {/* Top Meta: Category Badge & Time */}
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <span className="px-3 py-1 rounded-full bg-[#f3f3f4] text-[#0d0c22] text-xs font-semibold">
                      {project.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{project.postedTimeAgo || '2 jam yang lalu'}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base sm:text-[17px] font-bold text-[#0d0c22] group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {project.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed font-normal mb-4">
                    {project.description}
                  </p>

                  {/* Key Scope & Deliverables */}
                  {project.deliverables && project.deliverables.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {project.deliverables.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Tags */}
                  {project.requiredSkills && project.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.requiredSkills.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#f3f3f4] text-neutral-700 text-xs font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Footer: Budget & Actions */}
                <div className="pt-4 mt-6 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-neutral-400 font-medium block">Estimasi Anggaran</span>
                    <span className="text-base sm:text-lg font-black text-[#0d0c22] tracking-tight block">
                      {formatDisplayBudget(project.formattedBudget, project.budgetMin)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBrief(project);
                        setApplyForm({
                          bidRate: project.budgetMin ? project.budgetMin.toString() : '1500000',
                          duration: project.deadline || '3 Hari Kerja',
                          pitch: '',
                          portfolioLink: ''
                        });
                        setIsApplyModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-white/80" />
                      <span>Lamar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer rendered by (main) layout */}
    </div>

      {/* =============================================================== */}
      {/* MODAL 1: LAMAR                                                   */}
      {/* =============================================================== */}
      {isApplyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsApplyModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 space-y-5 text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                  Lamar & Ajukan Penawaran
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApply} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Brief yang Dilamar:
                </label>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs font-semibold text-[#0d0c22]">
                  {currentBrief.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Tawaran Biaya (Rp):
                  </label>
                  <input
                    type="number"
                    value={applyForm.bidRate}
                    onChange={(e) => setApplyForm({ ...applyForm, bidRate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-[#0d0c22] focus:outline-none focus:border-[#0d0c22]"
                    placeholder="1500000"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Anggaran klien: {currentBrief.formattedBudget}</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Estimasi Pengerjaan:
                  </label>
                  <input
                    type="text"
                    value={applyForm.duration}
                    onChange={(e) => setApplyForm({ ...applyForm, duration: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-[#0d0c22] focus:outline-none focus:border-[#0d0c22]"
                    placeholder="3 Hari Kerja"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Tenggat brief: {currentBrief.deadline}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Ide Hook & Cover Letter Singkat:
                </label>
                <textarea
                  rows={4}
                  value={applyForm.pitch}
                  onChange={(e) => setApplyForm({ ...applyForm, pitch: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:border-[#0d0c22]"
                  placeholder="Ceritakan mengapa Anda tepat mengeksekusi brief ini dan ide hook 3 detik pertama yang Anda tawarkan..."
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Pembayaran Anda dilindungi 100% oleh Rekening Bersama Escrow Creatorin. Dana akan dicairkan seketika setelah hasil disetujui klien.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Kirim Lamaran Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL 2: EDIT BRIEF PROYEK                                       */}
      {/* =============================================================== */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 space-y-4 text-left max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-neutral-700" />
                <h3 className="text-base sm:text-lg font-bold text-[#171717]">
                  Edit Rincian Brief Proyek
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-black flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBrief} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Judul Brief:
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#171717] focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Kategori:
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Anggaran (Rp):
                  </label>
                  <input
                    type="number"
                    value={editForm.budgetMin}
                    onChange={(e) => setEditForm({ ...editForm, budgetMin: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#171717] focus:outline-none focus:border-[#0B1F3A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Tenggat Pengerjaan:
                </label>
                <input
                  type="text"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#0B1F3A]"
                  placeholder="3-5 Hari Kerja"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Deskripsi & Konsep:
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-neutral-800 focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Daftar Target Output (1 baris per deliverable):
                </label>
                <textarea
                  rows={3}
                  value={editForm.deliverables}
                  onChange={(e) => setEditForm({ ...editForm, deliverables: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-neutral-800 focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL 3: PREVIEW SAMPEL KARYA KREATOR                            */}
      {/* =============================================================== */}
      {selectedSampleForPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedSampleForPreview(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-neutral-950 text-white rounded-3xl overflow-hidden border border-neutral-800 text-left space-y-4"
          >
            <div className="p-4 flex items-center justify-between border-b border-neutral-800">
              <div>
                <h4 className="font-bold text-sm text-white line-clamp-1">
                  {selectedSampleForPreview.title}
                </h4>
                <span className="text-xs text-neutral-400">
                  Oleh {selectedSampleForPreview.creatorName}
                </span>
              </div>
              <button
                onClick={() => setSelectedSampleForPreview(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedSampleForPreview.thumbnail}
                alt={selectedSampleForPreview.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition">
                <Play className="w-7 h-7 fill-white text-white ml-1" />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{selectedSampleForPreview.views || '45K'} views</span>
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{selectedSampleForPreview.likes || '3.2K'} likes</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedSampleForPreview(null)}
                className="px-4 py-1.5 rounded-full bg-white text-[#0d0c22] font-bold hover:bg-neutral-200 transition cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* MODAL 4: KONTRAK ESCROW CONFIRMATION                             */}
      {/* =============================================================== */}
      {selectedApplicantForContract && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedApplicantForContract(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 p-6 space-y-4 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                Konfirmasi Kontrak Kerjasama Escrow
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Anda akan memilih <strong>{selectedApplicantForContract.creatorName}</strong> untuk mengerjakan brief ini dengan penawaran sebesar <strong>{selectedApplicantForContract.formattedBid}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="flex justify-between">
                <span>Nilai Kontrak:</span>
                <span className="font-bold text-[#0d0c22]">{selectedApplicantForContract.formattedBid}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimasi Waktu:</span>
                <span className="font-bold text-[#0d0c22]">{selectedApplicantForContract.durationDays}</span>
              </div>
              <div className="flex justify-between">
                <span>Proteksi Escrow:</span>
                <span className="font-bold text-emerald-700">100% Terlindungi</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedApplicantForContract(null)}
                className="px-4 py-2.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmContract}
                className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Mulai Kontrak Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
