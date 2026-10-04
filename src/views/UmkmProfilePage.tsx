'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Instagram, 
  ShoppingBag, 
  MessageSquare, 
  Share2, 
  Edit3, 
  PlusCircle, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Package, 
  Calendar, 
  ChevronRight, 
  Check, 
  Copy, 
  X, 
  Play, 
  Award,
  Send,
  ExternalLink,
  Phone,
  MoreHorizontal,
  Layers,
  Bookmark,
  SlidersHorizontal,
  ChevronDown,
  Mail,
  Laptop,
  User,
  Heart,
  Eye,
  Camera,
  Upload,
  Zap,
  Users,
  Pencil
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { creatorService } from '@/services/creatorService';
import { UMKMProfile, AuthState, ActivePage, ProjectListing, UMKMCompletedCollab, UMKMCreatorReview, Creator } from '@/types';

interface UmkmProfilePageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onViewBrief?: (brief: ProjectListing) => void;
  initialProfile: UMKMProfile;
}

type TabKey = 'briefs' | 'collabs' | 'reviews' | 'about';

const formatDisplayBudget = (formatted?: string, budgetMin?: number) => {
  if (budgetMin) {
    return `Rp${budgetMin.toLocaleString('id-ID')}`;
  }
  if (!formatted) return 'Rp0';
  const clean = formatted.split(/[-–—]|sampai/i)[0].trim();
  return clean.startsWith('Rp') ? clean : `Rp${clean}`;
};

export const UmkmProfilePage: React.FC<UmkmProfilePageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile,
  onViewBrief,
  initialProfile
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;
  const isCreatorShell = currentUser?.role === 'creator';

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
        'explore-projects': '/jelajah/proyek',
        'explore-services': '/jelajah/layanan',
        'chat': '/chat',
        'collaboration': '/contracts',
        'notifications': '/notifications',
        'briefs': '/briefs',
        'signin': '/sign-in',
        'signup': '/sign-up',
      };
      router.push(routeMap[page] || '/explore');
    }
  };
  const [profile, setProfile] = useState<UMKMProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<TabKey>('briefs');
  
  // Follow / Save Brand State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  useEffect(() => setProfile(initialProfile), [initialProfile]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [savedCollabIds, setSavedCollabIds] = useState<Set<string>>(new Set());

  // Filter Dropdown for Briefs / Collabs
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [briefFilter, setBriefFilter] = useState<'all' | 'reels' | 'photo' | 'branding'>('all');
  const [reviewFilter, setReviewFilter] = useState<'recent' | 'highest'>('recent');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostBriefOpen, setIsPostBriefOpen] = useState(false);
  const [selectedBriefDetail, setSelectedBriefDetail] = useState<ProjectListing | null>(null);
  const [selectedApplyBrief, setSelectedApplyBrief] = useState<ProjectListing | null>(null);
  const [selectedCollabDetail, setSelectedCollabDetail] = useState<UMKMCompletedCollab | null>(null);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    brandName: profile.brandName,
    tagline: profile.tagline,
    bio: profile.bio,
    industry: profile.industry,
    category: profile.category,
    location: profile.location,
    website: profile.website || '',
    instagram: profile.instagram || '',
    marketplaceUrl: profile.marketplaceUrl || '',
    whatsapp: profile.whatsapp || '',
    targetAudience: profile.brandGuide?.targetAudience || '',
    samplePolicy: profile.brandGuide?.sampleShippingPolicy || ''
  });

  // Post Brief Form State
  const [newBriefForm, setNewBriefForm] = useState({
    title: '',
    category: 'Reels Instagram',
    budgetMin: '1500000',
    budgetMax: '2500000',
    deadline: '5 Hari Kerja',
    description: '',
    deliverables: '3x Video 9:16 resolusi 1080p\nInclude voiceover & subtitle\nHak pakai promosi sosmed',
    skills: 'TikTok UGC, Reels Instagram, CapCut',
    productShipping: true
  });

  // Edit Brief Form State
  const [editingBrief, setEditingBrief] = useState<ProjectListing | null>(null);
  const [editBriefForm, setEditBriefForm] = useState({
    title: '',
    category: 'Reels Instagram',
    budgetMin: '1500000',
    deadline: '5 Hari Kerja',
    description: '',
    deliverables: '',
    skills: '',
    productShipping: true
  });

  // Proposal Submission State
  const [proposalBid, setProposalBid] = useState('');
  const [proposalDuration, setProposalDuration] = useState('');
  const [proposalPitch, setProposalPitch] = useState('');
  const [proposalPortfolio, setProposalPortfolio] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // In-place inline edit state
  const isUmkmOwner = currentUser?.role === 'umkm';
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [inlineSection, setInlineSection] = useState<'name' | 'tagline' | null>(null);
  const [tempBrandName, setTempBrandName] = useState(profile.brandName);
  const [tempTagline, setTempTagline] = useState(profile.tagline || '');

  // User Profile Mode Refs & Handlers
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, coverBanner: url }));
      showToast('Foto sampul brand berhasil diperbarui!');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, logo: url }));
      showToast('Logo brand berhasil diperbarui!');
    }
  };

  const openEditModal = () => {
    setEditForm({
      brandName: profile.brandName,
      tagline: profile.tagline,
      bio: profile.bio,
      industry: profile.industry,
      category: profile.category,
      location: profile.location,
      website: profile.website || '',
      instagram: profile.instagram || '',
      marketplaceUrl: profile.marketplaceUrl || '',
      whatsapp: profile.whatsapp || '',
      targetAudience: profile.brandGuide?.targetAudience || '',
      samplePolicy: profile.brandGuide?.sampleShippingPolicy || ''
    });
    setIsEditModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Tautan profil UMKM berhasil disalin ke clipboard!');
  };

  const toggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
      showToast('Batal mengikuti brand ini');
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      showToast('Berhasil mengikuti! Anda akan menerima notifikasi brief baru.');
    }
  };

  const toggleSaveCollab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCollabIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Karya kolaborasi dihapus dari simpanan');
      } else {
        next.add(id);
        showToast('Karya kolaborasi disimpan ke koleksi!');
      }
      return next;
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: editForm.brandName, companyName: editForm.brandName, businessCategory: editForm.category, description: editForm.bio, website: editForm.website, location: editForm.location }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Gagal menyimpan profil.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal menyimpan profil.'); return; }
    setProfile(prev => ({
      ...prev,
      brandName: editForm.brandName,
      tagline: editForm.tagline,
      bio: editForm.bio,
      industry: editForm.industry,
      category: editForm.category,
      location: editForm.location,
      website: editForm.website,
      instagram: editForm.instagram,
      marketplaceUrl: editForm.marketplaceUrl,
      whatsapp: editForm.whatsapp,
      brandGuide: {
        primaryColor: prev.brandGuide?.primaryColor || '#78350f',
        secondaryColor: prev.brandGuide?.secondaryColor || '#fef3c7',
        brandValues: prev.brandGuide?.brandValues || ['Kualitas Alami', 'Kolaborasi Terbuka'],
        targetAudience: editForm.targetAudience,
        sampleShippingPolicy: editForm.samplePolicy
      }
    }));
    setIsEditModalOpen(false);
    showToast('Profil UMKM berhasil diperbarui!');
  };

  const handleCreateNewBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    const minNum = parseInt(newBriefForm.budgetMin) || 0;
    const maxNum = parseInt(newBriefForm.budgetMax) || 0;
    if (!minNum || !newBriefForm.title.trim() || !newBriefForm.description.trim()) { showToast('Judul, deskripsi, dan budget wajib diisi.'); return; }
    
    const formattedBudget = `Rp${minNum.toLocaleString('id-ID')}`;
    const deliverablesList = newBriefForm.deliverables
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);
    const skillsList = newBriefForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let persistedBrief: { id: string };
    try {
      const response = await fetch('/api/briefs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newBriefForm.title, category: newBriefForm.category, description: newBriefForm.description, expectedOutput: deliverablesList.join('\n'), budget: formattedBudget, deadline: newBriefForm.deadline }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan brief.');
      persistedBrief = result.brief;
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal menyimpan brief.'); return; }

    const newBrief: ProjectListing = {
      id: persistedBrief.id,
      title: newBriefForm.title,
      clientName: profile.brandName,
      clientAvatar: profile.logo,
      clientIndustry: profile.industry,
      clientLocation: profile.location,
      isVerifiedClient: false,
      budgetMin: minNum,
      budgetMax: maxNum,
      formattedBudget: formattedBudget,
      category: newBriefForm.category,
      description: newBriefForm.description,
      deliverables: deliverablesList,
      deadline: newBriefForm.deadline,
      productShippingProvided: newBriefForm.productShipping,
      proposalsCount: 0,
      postedTimeAgo: 'Baru saja',
      requiredSkills: skillsList
    };

    setProfile(prev => ({
      ...prev,
      activeBriefsList: [newBrief, ...(prev.activeBriefsList || [])],
      stats: {
        ...prev.stats,
        activeBriefs: prev.stats.activeBriefs + 1
      }
    }));

    setIsPostBriefOpen(false);
    setNewBriefForm({
      title: '',
      category: 'Reels Instagram',
      budgetMin: '1500000',
      budgetMax: '2500000',
      deadline: '5 Hari Kerja',
      description: '',
      deliverables: '3x Video 9:16 resolusi 1080p\nInclude voiceover & subtitle\nHak pakai promosi sosmed',
      skills: 'TikTok UGC, Reels Instagram, CapCut',
      productShipping: true
    });
    showToast('Brief proyek baru berhasil dipublikasikan!');
  };

  const handleOpenEditBrief = (brief: ProjectListing) => {
    setEditingBrief(brief);
    setEditBriefForm({
      title: brief.title,
      category: brief.category,
      budgetMin: (brief.budgetMin || 1500000).toString(),
      deadline: brief.deadline,
      description: brief.description,
      deliverables: (brief.deliverables || []).join('\n'),
      skills: (brief.requiredSkills || []).join(', '),
      productShipping: brief.productShippingProvided ?? true
    });
  };

  const handleSaveEditBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrief) return;
    const minNum = parseInt(editBriefForm.budgetMin) || 0;
    const deliverablesList = editBriefForm.deliverables
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);
    const skillsList = editBriefForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`/api/briefs/${editingBrief.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editBriefForm.title, category: editBriefForm.category, description: editBriefForm.description, expectedOutput: deliverablesList.join('\n'), budget: `Rp${minNum.toLocaleString('id-ID')}`, deadline: editBriefForm.deadline }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Gagal memperbarui brief.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal memperbarui brief.'); return; }

    setProfile(prev => ({
      ...prev,
      activeBriefsList: (prev.activeBriefsList || []).map(b => {
        if (b.id === editingBrief.id) {
          return {
            ...b,
            title: editBriefForm.title,
            category: editBriefForm.category,
            budgetMin: minNum,
            budgetMax: minNum,
            formattedBudget: `Rp${minNum.toLocaleString('id-ID')}`,
            deadline: editBriefForm.deadline,
            description: editBriefForm.description,
            deliverables: deliverablesList.length > 0 ? deliverablesList : b.deliverables,
            requiredSkills: skillsList.length > 0 ? skillsList : b.requiredSkills,
            productShippingProvided: editBriefForm.productShipping
          };
        }
        return b;
      })
    }));

    setEditingBrief(null);
    showToast('Brief proyek berhasil diperbarui!');
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalBid || !proposalPitch) return;

    setIsSubmittingProposal(true);
    setTimeout(() => {
      setIsSubmittingProposal(false);
      setSelectedApplyBrief(null);
      setProposalBid('');
      setProposalDuration('');
      setProposalPitch('');
      setProposalPortfolio('');
      showToast('Proposal Anda berhasil dikirim ke Klien UMKM! Klien akan meninjau dan merespons via pesan.');
    }, 800);
  };

  // Filtered briefs list
  const filteredBriefs = useMemo(() => {
    if (!profile.activeBriefsList) return [];
    if (briefFilter === 'all') return profile.activeBriefsList;
    if (briefFilter === 'reels') return profile.activeBriefsList.filter(b => b.category.toLowerCase().includes('reel') || b.category.toLowerCase().includes('tiktok') || b.category.toLowerCase().includes('video'));
    if (briefFilter === 'photo') return profile.activeBriefsList.filter(b => b.category.toLowerCase().includes('foto') || b.category.toLowerCase().includes('product'));
    if (briefFilter === 'branding') return profile.activeBriefsList.filter(b => b.category.toLowerCase().includes('brand') || b.category.toLowerCase().includes('logo') || b.category.toLowerCase().includes('design'));
    return profile.activeBriefsList;
  }, [profile.activeBriefsList, briefFilter]);

  // Filtered / sorted reviews
  const sortedReviews = useMemo(() => {
    if (!profile.creatorReviews) return [];
    const revs = [...profile.creatorReviews];
    if (reviewFilter === 'highest') {
      return revs.sort((a, b) => b.rating - a.rating);
    }
    return revs;
  }, [profile.creatorReviews, reviewFilter]);

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#0B1F3A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navbar rendered by root/main layout */}

      {/* ==================================================================== */}
      {/* HERO SECTION (Owner Editable Profile View with Customization Controls) */}
      {/* ==================================================================== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
        
        {/* Hidden File Inputs for Banner & Logo Upload */}
        <input 
          ref={coverFileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleCoverUpload} 
        />
        <input 
          ref={logoFileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleLogoUpload} 
        />

        {/* Rounded Top Banner Card */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden bg-[#f3f3f4] h-44 sm:h-56 md:h-64 lg:h-72">
          <img
            src={profile.coverBanner}
            alt={profile.brandName}
            className="w-full h-full object-cover"
          />
          {isUmkmOwner && isEditModeActive && (
            <button
              onClick={() => coverFileInputRef.current?.click()}
              className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-black text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition"
              title="Ganti Foto Sampul"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Ganti Sampul</span>
            </button>
          )}
        </div>

        {/* Squircle / Circular Avatar & Action Bar Row */}
        <div className="relative px-2 sm:px-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 md:-mt-20 z-20">
          
          {/* Circular Avatar */}
          <div className="relative inline-block self-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1 sm:p-1.5 bg-white shadow-xl shadow-black/8 ring-1 ring-neutral-900/5 relative group">
              <img
                src={profile.logo}
                alt={profile.brandName}
                className="w-full h-full rounded-full object-cover"
              />
              {isUmkmOwner && isEditModeActive && (
                <button
                  onClick={() => logoFileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer z-20 transition"
                  title="Ganti Logo Brand"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">Ganti Logo</span>
                </button>
              )}
            </div>

            {/* Escrow Badge */}
            {profile.verified && (
              <div 
                className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-[#0B1F3A] text-white p-1.5 rounded-full ring-3 ring-white shadow-xs" 
                title="UMKM Terverifikasi Escrow"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-end pb-1">
            
            {/* Button 1: More Options (...) */}
            <div className="relative">
              <button
                id="btn-more-options"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-10 h-10 rounded-full bg-[#f3f3f4] hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Opsi Lainnya"
                title="Opsi Lainnya"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-50 text-left">
                  {isUmkmOwner && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        openEditModal();
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      <span>Edit Lengkap Brand</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleCopyLink();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-neutral-400" />
                    <span>Salin Tautan Profil</span>
                  </button>
                  {isUmkmOwner && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsPostBriefOpen(true);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Pasang Brief Proyek</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Button 2: Edit Profil Mode Toggle (Owner UMKM) OR Hubungi Brand (Creator/Visitor) */}
            {isUmkmOwner ? (
              <button
                id="btn-edit-profile"
                onClick={() => setIsEditModeActive(!isEditModeActive)}
                className={`px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isEditModeActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'border border-[#E2E8F0] bg-white hover:bg-neutral-50 text-[#171717]'
                }`}
              >
                {isEditModeActive ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                <span>{isEditModeActive ? 'Selesai Edit' : 'Edit Profil'}</span>
              </button>
            ) : (
              <button
                id="btn-contact-brand"
                onClick={() => navigateTo('chat', '/chat')}
                className="px-5 py-2 sm:py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Pesan</span>
              </button>
            )}

            {/* Button 3: Bagikan */}
            <button
              id="btn-share-profile"
              onClick={handleCopyLink}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold transition shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </button>

          </div>

        </div>

        {/* Brand Identity & Meta Stats Block (Below Avatar) */}
        <div className="mt-3.5 sm:mt-4 px-2 sm:px-4 text-left">
          
          {/* Name & Badges */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#171717] tracking-tight">
              {profile.brandName}
            </h1>
            {isUmkmOwner && isEditModeActive && (
              <button
                onClick={() => {
                  setTempBrandName(profile.brandName);
                  setInlineSection('name');
                }}
                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer transition"
                title="Edit Nama Brand"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>
            )}
            {profile.verified && (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 fill-blue-600 text-white" />
            )}
          </div>

          {/* Tagline / Headline */}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm sm:text-base text-neutral-600 font-normal max-w-2xl leading-relaxed">
              {profile.tagline || `${profile.industry} • Berkolaborasi dengan talenta kreatif terbaik Indonesia.`}
            </p>
            {isUmkmOwner && isEditModeActive && (
              <button
                onClick={() => {
                  setTempTagline(profile.tagline || '');
                  setInlineSection('tagline');
                }}
                className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-black cursor-pointer transition shrink-0"
                title="Edit Slogan"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600" />
              </button>
            )}
          </div>

          {/* Inline Stats Row (Exact Match to Creator Profile Style in Reference Image) */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-neutral-500 mt-2.5 font-medium">
            <span>
              <strong className="text-[#171717] font-bold">
                {profile.stats.completedProjects}
              </strong>{' '}
              Proyek Selesai
            </span>
            <span>
              <strong className="text-[#171717] font-bold">
                {profile.stats.ratingFromCreators.toFixed(1)} ★
              </strong>{' '}
              ({profile.stats.reviewCount} Ulasan)
            </span>
            <span>
              <strong className="text-[#171717] font-bold">
                {profile.stats.activeBriefs}
              </strong>{' '}
              Brief Terbuka
            </span>
            <span className="text-neutral-400">
              <MapPin className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-neutral-400" />
              {profile.location || 'Indonesia'}
            </span>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* TAB NAVIGATION BAR (Sticky, Exact Match to Creator Profile Style) */}
      {/* ==================================================================== */}
      <div 
        className={`sticky ${isCreatorShell ? 'top-0' : 'top-16 lg:top-[72px]'} z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-[top]`}
        style={{ top: isCreatorShell ? 0 : 'var(--navbar-height, 64px)' }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-3">
          
          {/* Tabs Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            
            {/* Briefs Tab */}
            <button
              onClick={() => setActiveTab('briefs')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'briefs'
                  ? 'bg-[#f3f3f4] font-semibold text-[#171717]'
                  : 'text-neutral-700 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Brief Dibuka</span>
              <span className="text-[11px] font-medium text-neutral-500">
                {profile.activeBriefsList?.length || 0}
              </span>
            </button>

            {/* Collabs / Hasil Kolaborasi Tab */}
            <button
              onClick={() => setActiveTab('collabs')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'collabs'
                  ? 'bg-[#f3f3f4] font-semibold text-[#171717]'
                  : 'text-neutral-700 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Karya Kolaborasi</span>
              <span className="text-[11px] font-medium text-neutral-500">
                {profile.completedCollaborations?.length || 0}
              </span>
            </button>

            {/* Reviews Tab */}
            <button
              id="tab-btn-umkm-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-[#f3f3f4] font-semibold text-[#171717]'
                  : 'text-neutral-700 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              <span>Ulasan Kreator</span>
              <span className="text-[11px] font-medium text-neutral-500">
                {profile.creatorReviews?.length || 0}
              </span>
            </button>

            {/* About Tab */}
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-[#f3f3f4] font-semibold text-[#171717]'
                  : 'text-neutral-700 font-medium hover:text-[#171717] hover:bg-neutral-50'
              }`}
            >
              Tentang Brand
            </button>

          </div>

          {/* Right Side Filter for Briefs / Collabs */}
          {activeTab === 'briefs' && (
            <div className="relative self-end sm:self-center">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-xs sm:text-sm font-bold text-[#171717] flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {briefFilter === 'all' && 'Semua Kategori Brief'}
                  {briefFilter === 'reels' && 'Video & Reels UGC'}
                  {briefFilter === 'photo' && 'Foto Produk'}
                  {briefFilter === 'branding' && 'Branding & Desain'}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 text-left">
                  <button
                    onClick={() => { setBriefFilter('all'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${briefFilter === 'all' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Semua Kategori Brief
                  </button>
                  <button
                    onClick={() => { setBriefFilter('reels'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${briefFilter === 'reels' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Video & Reels UGC
                  </button>
                  <button
                    onClick={() => { setBriefFilter('photo'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${briefFilter === 'photo' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Foto Produk
                  </button>
                  <button
                    onClick={() => { setBriefFilter('branding'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${briefFilter === 'branding' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Branding & Desain
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB CONTENT AREA */}
      {/* ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ----------------- TAB 1: BRIEF DIBUKA (MATCHING SERVICES / SHOTS CARD CLEAN DESIGN) ----------------- */}
        {activeTab === 'briefs' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                  Brief Proyek yang Sedang Dibuka
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
                  Kreator terverifikasi dapat langsung meninjau deliverables dan mengajukan penawaran proposal ke brand ini.
                </p>
              </div>

              <button
                onClick={() => setIsPostBriefOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-blue-400" />
                <span>+ Buat Brief Baru</span>
              </button>
            </div>

            {filteredBriefs.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-[#E2E8F0]">
                <Briefcase className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-[#171717]">Tidak Ada Brief Sesuai Filter</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Belum ada brief proyek yang cocok dengan filter yang dipilih. Coba ganti filter atau buat brief baru.
                </p>
                <button
                  onClick={() => setBriefFilter('all')}
                  className="mt-4 px-4 py-2 bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Tampilkan Semua Brief
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    onClick={() => {
                      if (onViewBrief) {
                        onViewBrief(brief);
                      } else {
                        setSelectedBriefDetail(brief);
                      }
                    }}
                    className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 hover:border-neutral-300 hover:shadow-lg transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between cursor-pointer text-left relative"
                  >
                    <div>
                      {/* Top Meta: Category Badge & Time */}
                      <div className="flex items-center justify-between gap-3 mb-3.5">
                        <span className="px-3 py-1 rounded-full bg-[#f3f3f4] text-[#171717] text-xs font-semibold">
                          {brief.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{brief.postedTimeAgo}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-base sm:text-[17px] font-bold text-[#171717] group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                        {brief.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed font-normal mb-4">
                        {brief.description}
                      </p>

                      {/* Key Scope & Deliverables (Clean Minimal List without nested gray box) */}
                      {brief.deliverables && brief.deliverables.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {brief.deliverables.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {brief.requiredSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#f3f3f4] text-neutral-700 text-xs font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Footer: Budget & Actions */}
                    <div className="pt-4 mt-6 border-t border-neutral-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-neutral-400 font-medium block">Estimasi Anggaran</span>
                        <span className="text-base sm:text-lg font-bold text-[#171717] tracking-tight block">
                          {formatDisplayBudget(brief.formattedBudget, brief.budgetMin)}
                        </span>
                      </div>

                      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditBrief(brief)}
                          className="px-4 py-1.5 sm:py-2 rounded-xl border border-[#E2E8F0] hover:border-neutral-300 bg-white hover:bg-neutral-50 text-[#171717] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Edit brief</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: KARYA KOLABORASI (EXACT 4/5 SHOTS GRID FROM CREATOR PROFILE) ----------------- */}
        {activeTab === 'collabs' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-neutral-200/80 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                  Galeri Karya Kolaborasi Kreator
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
                  Aset konten komersial, foto produk, dan video UGC yang telah selesai diserahterimakan dan disetujui via Escrow.
                </p>
              </div>
            </div>

            {(!profile.completedCollaborations || profile.completedCollaborations.length === 0) ? (
              <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100">
                <Layers className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-[#171717]">Belum Ada Karya Kolaborasi</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Karya yang telah diselesaikan oleh kreator untuk brand ini akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {profile.completedCollaborations.map((collab) => {
                  const isSaved = savedCollabIds.has(collab.id);

                  return (
                    <div
                      key={collab.id}
                      onClick={() => setSelectedCollabDetail(collab)}
                      className="group relative aspect-[4/5] rounded-2xl sm:rounded-[22px] overflow-hidden bg-neutral-900 border border-neutral-200/40 hover:border-neutral-300/80 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none"
                    >
                      {/* Full-bleed Media Cover */}
                      <img
                        src={collab.deliverableMedia}
                        alt={collab.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center "
                      />

                      {/* Top Right Media Badge: Circular dark translucent button with icon */}
                      <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                        {collab.mediaType === 'video' ? (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-sm">
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white translate-x-[1px]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-sm">
                            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Quick Save Bookmark button on hover */}
                      <div className="absolute top-3.5 left-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => toggleSaveCollab(collab.id, e)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
                            isSaved 
                              ? 'bg-amber-500 text-white shadow-md' 
                              : 'bg-black/50 hover:bg-black/80 text-white border border-white/15'
                          }`}
                          title={isSaved ? 'Hapus Simpan' : 'Simpan Karya'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom Static Overlay: 2-line title + creator info (Always visible matching creator profile shots) */}
                      <div className="absolute inset-x-0 bottom-0 pt-16 pb-3.5 sm:pb-4 px-3.5 sm:px-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10 flex flex-col justify-end">
                        <p className="text-white text-[13px] sm:text-[14px] font-bold line-clamp-2 leading-snug drop-shadow-sm mb-1.5">
                          {collab.title}
                        </p>
                        <div className="flex items-center justify-between text-white/80 text-[11px] sm:text-xs font-normal">
                          <span className="truncate max-w-[65%] font-medium flex items-center gap-1.5">
                            <img
                              src={collab.creatorAvatar}
                              alt={collab.creatorName}
                              className="w-4 h-4 rounded-full object-cover ring-1 ring-white/40 shrink-0"
                            />
                            <span className="truncate">{collab.creatorName}</span>
                          </span>
                          <div className="flex items-center gap-1 text-amber-300 font-bold shrink-0">
                            <Star className="w-3 h-3 fill-amber-300" />
                            <span>{collab.ratingGiven}.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: ULASAN KREATOR (EXACT REVIEWS STYLE FROM CREATOR PROFILE) ----------------- */}
        {activeTab === 'reviews' && (
          <div className="w-full text-left space-y-6">
            
            {/* Header Ulasan Bersih */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-neutral-200/80">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                  Ulasan dari Kreator
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
                  Seluruh testimoni berasal dari kreator yang telah menyelesaikan kolaborasi proyek nyata dengan {profile.brandName}.
                </p>
              </div>

              {/* Filter Sederhana Pill */}
              <div className="flex items-center gap-1 bg-[#f3f3f4] p-1 rounded-xl text-xs font-medium self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setReviewFilter('recent')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    reviewFilter === 'recent'
                      ? 'bg-white text-[#171717] shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-[#171717]'
                  }`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => setReviewFilter('highest')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    reviewFilter === 'highest'
                      ? 'bg-white text-[#171717] shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-[#171717]'
                  }`}
                >
                  Rating Tertinggi
                </button>
              </div>
            </div>

            {(!profile.creatorReviews || profile.creatorReviews.length === 0) ? (
              <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100">
                <p className="text-xs text-neutral-500">Belum ada ulasan dari kreator.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200/80">
                {sortedReviews.map((rev) => (
                  <div key={rev.id} className="py-6 first:pt-2 last:pb-2">
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Avatar, Nama, dan Peran Kreator */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={rev.creatorAvatar}
                          alt={rev.creatorName}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#171717]">
                              {rev.creatorName}
                            </h4>
                            <span className="text-xs text-neutral-400 font-normal">
                              • {rev.date}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500 block mt-0.5">
                            {rev.creatorRole}
                          </span>
                        </div>
                      </div>

                      {/* Skor Bintang Sederhana */}
                      <div className="flex items-center gap-1 font-semibold text-xs text-[#171717] shrink-0 bg-[#f3f3f4] px-2.5 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>

                    </div>

                    {/* Judul Proyek yang Dikerjakan */}
                    <div className="mt-3 text-xs text-neutral-500 font-medium">
                      Kolaborasi Proyek: <span className="text-neutral-800 font-semibold">{rev.projectTitle}</span>
                    </div>

                    {/* Isi Testimoni Klien */}
                    <p className="mt-2 text-sm text-neutral-700 leading-relaxed font-normal">
                      "{rev.comment}"
                    </p>

                    {/* Tags Tagar Proyek */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {rev.tags.map((tg, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#f3f3f4] text-neutral-700 text-xs font-medium">
                            {tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------- TAB 4: ABOUT / TENTANG BRAND (EXACT 12-GRID FROM CREATOR PROFILE) ----------------- */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 text-left w-full pt-2">
            
            {/* Sisi Kiri: Story/Bio, Brand Values, Target Audience, Sample Policy */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Kisah & Bio Brand */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-3.5">
                  Kisah Brand & Filosofi
                </h3>
                <div className="space-y-4 text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal">
                  <p>
                    {profile.bio}
                  </p>
                  <p>
                    Sebagai brand lokal yang bertumbuh di era digital, kami sangat menghargai kreativitas dan sudut pandang autentik para kreator konten. Kami percaya kolaborasi yang kuat dibangun di atas kejelasan brief, transparansi timeline, dan kepastian pembayaran tepat waktu.
                  </p>
                </div>
              </div>

              {/* Brand Values / Nilai Brand (Pills style) */}
              {profile.brandGuide?.brandValues && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-3">
                    Nilai & Karakter Brand
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.brandGuide.brandValues.map((val, idx) => (
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
                <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-3">
                  Target Audiens Produk
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed font-normal">
                  {profile.brandGuide?.targetAudience || 'Konsumen muda urban usia 20-35 tahun, penikmat produk lokal premium, aktif di media sosial Instagram & TikTok.'}
                </p>
              </div>

              {/* Kebijakan Kirim Sampel Produk Fisik */}
              {profile.brandGuide?.sampleShippingPolicy && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-neutral-600" />
                    <span>Kebijakan Pengiriman Sampel Produk Fisik</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#fafafa] border border-neutral-100 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    {profile.brandGuide.sampleShippingPolicy}
                  </div>
                </div>
              )}

              {/* Palet Warna Brand */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#171717] mb-3">
                  Palet Warna Brand
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl shadow-xs border border-neutral-200"
                      style={{ backgroundColor: profile.brandGuide?.primaryColor || '#78350f' }}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#171717]">Warna Primer</div>
                      <div className="text-[11px] font-mono text-neutral-500">{profile.brandGuide?.primaryColor || '#78350f'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl shadow-xs border border-neutral-200"
                      style={{ backgroundColor: profile.brandGuide?.secondaryColor || '#fef3c7' }}
                    />
                    <div>
                      <div className="text-xs font-bold text-[#171717]">Warna Sekunder</div>
                      <div className="text-[11px] font-mono text-neutral-500">{profile.brandGuide?.secondaryColor || '#fef3c7'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <hr className="border-neutral-200/80 my-8" />

              {/* Follower / Community Stats Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-neutral-600 font-normal">
                <span>
                  <strong className="text-[#171717] font-semibold">{followersCount.toLocaleString()}</strong> pengikut brand
                </span>
                <span>
                  <strong className="text-[#171717] font-semibold">{profile.stats.completedProjects}</strong> kolaborasi kreator
                </span>
                <span>
                  <strong className="text-[#171717] font-semibold">100%</strong> escrow aman
                </span>
              </div>

            </div>

            {/* Sisi Kanan: Location Card, Contact Info, Social & Marketplace Links */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Location & Status Card */}
              <div className="bg-[#fafafa] rounded-2xl p-5 sm:p-6 space-y-3.5 border border-neutral-100 text-sm text-neutral-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>{profile.location}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#0d0c22] text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    PRO
                  </div>
                  <span>Verified UMKM Escrow</span>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Bergabung sejak {profile.joinedDate}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#171717] mb-3">Kontak & Website</h4>
                <div className="space-y-2.5 text-sm text-neutral-700">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 hover:text-[#171717] transition group"
                    >
                      <Globe className="w-4 h-4 text-neutral-500 group-hover:text-[#171717]" />
                      <span>{profile.website.replace('https://', '')}</span>
                    </a>
                  )}
                  {profile.whatsapp && (
                    <a
                      href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 hover:text-[#171717] transition group"
                    >
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>WhatsApp ({profile.whatsapp})</span>
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 hover:text-[#171717] transition group"
                    >
                      <Instagram className="w-4 h-4 text-rose-500" />
                      <span>{profile.instagram}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Official Store Links */}
              {profile.marketplaceUrl && (
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-[#171717] mb-3">Official Online Store</h4>
                  <a
                    href={profile.marketplaceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm text-neutral-700 hover:text-[#171717] transition group p-3 rounded-2xl bg-[#fafafa] border border-neutral-100"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate font-medium">Buka Toko Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
                  </a>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: EDIT PROFIL UMKM */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f3f3f4] text-[#171717] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">Edit Profil UMKM / Brand</h3>
                  <p className="text-xs text-neutral-500">Perbarui identitas brand, kontak, dan kebijakan sampel</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Brand / Toko</label>
                  <input
                    type="text"
                    value={editForm.brandName}
                    onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Kategori / Industri</label>
                  <input
                    type="text"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tagline Singkat</label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  placeholder="Misal: Racikan Kopi Nusantara Autentik"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Deskripsi & Kisah Brand</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Lokasi Outlet / Kota</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">WhatsApp Bisnis</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    placeholder="+6281234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={editForm.instagram}
                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Tautan Toko Online</label>
                  <input
                    type="url"
                    value={editForm.marketplaceUrl}
                    onChange={(e) => setEditForm({ ...editForm, marketplaceUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Kebijakan Kirim Sampel Fisik</label>
                <input
                  type="text"
                  value={editForm.samplePolicy}
                  onChange={(e) => setEditForm({ ...editForm, samplePolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  placeholder="Misal: Sampel fisik dikirim gratis via ekspedisi kilat..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-neutral-700 font-semibold hover:bg-neutral-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white font-semibold transition cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PASANG BRIEF BARU */}
      {/* ========================================================================= */}
      {isPostBriefOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f3f3f4] text-[#171717] flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">Pasang Brief Proyek Baru</h3>
                  <p className="text-xs text-neutral-500">Kreator akan melihat dan mengajukan proposal langsung ke brief ini</p>
                </div>
              </div>
              <button
                onClick={() => setIsPostBriefOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBrief} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Judul Brief Proyek</label>
                <input
                  type="text"
                  value={newBriefForm.title}
                  onChange={(e) => setNewBriefForm({ ...newBriefForm, title: e.target.value })}
                  placeholder="Misal: Video Review TikTok & Reels untuk Produk Baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Kategori Proyek</label>
                  <select
                    value={newBriefForm.category}
                    onChange={(e) => setNewBriefForm({ ...newBriefForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden bg-white"
                  >
                    <option value="Reels Instagram">Reels Instagram</option>
                    <option value="Video TikTok">Video TikTok</option>
                    <option value="Foto Produk">Foto Produk</option>
                    <option value="Logo & Branding">Logo & Branding</option>
                    <option value="Feed Instagram">Feed Instagram</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Tenggat Waktu Pengerjaan</label>
                  <input
                    type="text"
                    value={newBriefForm.deadline}
                    onChange={(e) => setNewBriefForm({ ...newBriefForm, deadline: e.target.value })}
                    placeholder="Contoh: 5 Hari Kerja"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Anggaran Min (Rp)</label>
                  <input
                    type="number"
                    value={newBriefForm.budgetMin}
                    onChange={(e) => setNewBriefForm({ ...newBriefForm, budgetMin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Anggaran Max (Rp)</label>
                  <input
                    type="number"
                    value={newBriefForm.budgetMax}
                    onChange={(e) => setNewBriefForm({ ...newBriefForm, budgetMax: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Deskripsi Kebutuhan & Konsep</label>
                <textarea
                  rows={3}
                  value={newBriefForm.description}
                  onChange={(e) => setNewBriefForm({ ...newBriefForm, description: e.target.value })}
                  placeholder="Jelaskan target hasil, gaya video yang diharapkan, mood visual..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Daftar Hasil yang Harus Diserahkan (1 per baris)</label>
                <textarea
                  rows={2}
                  value={newBriefForm.deliverables}
                  onChange={(e) => setNewBriefForm({ ...newBriefForm, deliverables: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden resize-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <input
                  type="checkbox"
                  id="shipping-check"
                  checked={newBriefForm.productShipping}
                  onChange={(e) => setNewBriefForm({ ...newBriefForm, productShipping: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
                <label htmlFor="shipping-check" className="text-xs text-neutral-700 font-medium cursor-pointer">
                  UMKM akan mengirimkan produk fisik gratis ke studio kreator
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsPostBriefOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-neutral-700 font-semibold hover:bg-neutral-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white font-semibold transition cursor-pointer shadow-xs"
                >
                  Publikasikan Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BRIEF */}
      {/* ========================================================================= */}
      {editingBrief && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f3f3f4] text-[#171717] flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">Edit Brief Proyek</h3>
                  <p className="text-xs text-neutral-500">Perbarui rincian kebutuhan dan kriteria kolaborasi brief</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBrief(null)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBrief} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Judul Brief Proyek</label>
                <input
                  type="text"
                  value={editBriefForm.title}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Kategori Proyek</label>
                  <select
                    value={editBriefForm.category}
                    onChange={(e) => setEditBriefForm({ ...editBriefForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden bg-white"
                  >
                    <option value="Reels Instagram">Reels Instagram</option>
                    <option value="Video TikTok">Video TikTok</option>
                    <option value="Foto Produk">Foto Produk</option>
                    <option value="Logo & Branding">Logo & Branding</option>
                    <option value="Feed Instagram">Feed Instagram</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Tenggat Waktu</label>
                  <input
                    type="text"
                    value={editBriefForm.deadline}
                    onChange={(e) => setEditBriefForm({ ...editBriefForm, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Estimasi Anggaran (Rp)</label>
                <input
                  type="number"
                  value={editBriefForm.budgetMin}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, budgetMin: e.target.value })}
                  placeholder="Contoh: 1500000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Deskripsi Kebutuhan & Konsep</label>
                <textarea
                  rows={3}
                  value={editBriefForm.description}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Daftar Hasil yang Diharapkan (1 per baris)</label>
                <textarea
                  rows={2}
                  value={editBriefForm.deliverables}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, deliverables: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Skill yang Dibutuhkan (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={editBriefForm.skills}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <input
                  type="checkbox"
                  id="edit-shipping-check"
                  checked={editBriefForm.productShipping}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, productShipping: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
                <label htmlFor="edit-shipping-check" className="text-xs text-neutral-700 font-medium cursor-pointer">
                  UMKM akan mengirimkan produk fisik gratis ke studio kreator
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingBrief(null)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-neutral-700 font-semibold hover:bg-neutral-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white font-semibold transition cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL BRIEF */}
      {/* ========================================================================= */}
      {selectedBriefDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f3f3f4] text-[#171717] text-xs font-semibold">
                  {selectedBriefDetail.category}
                </span>
                <h3 className="text-base font-bold text-[#171717] mt-2">
                  {selectedBriefDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBriefDetail(null)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fafafa] border border-neutral-100">
                <div>
                  <div className="text-[11px] text-neutral-500">Anggaran Proyek</div>
                  <div className="font-extrabold text-[#171717] text-sm">
                    {formatDisplayBudget(selectedBriefDetail.formattedBudget, selectedBriefDetail.budgetMin)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">Tenggat Waktu</div>
                  <div className="font-bold text-neutral-800 text-xs">{selectedBriefDetail.deadline}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-neutral-800 mb-1">Deskripsi Lengkap:</div>
                <p className="text-neutral-600 leading-relaxed text-xs">
                  {selectedBriefDetail.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-neutral-800">Daftar Hasil yang Diserahkan:</div>
                {selectedBriefDetail.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-neutral-600 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setSelectedBriefDetail(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-neutral-700 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const b = selectedBriefDetail;
                  setSelectedBriefDetail(null);
                  handleOpenEditBrief(b);
                }}
                className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit brief</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUKAN PROPOSAL */}
      {/* ========================================================================= */}
      {selectedApplyBrief && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                  Kirim Lamaran ke {profile.brandName}
                </span>
                <h3 className="text-base font-bold text-[#171717] mt-1.5 line-clamp-1">
                  {selectedApplyBrief.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApplyBrief(null)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Penawaran Biaya (Rp)</label>
                  <input
                    type="text"
                    required
                    value={proposalBid}
                    onChange={(e) => setProposalBid(e.target.value)}
                    placeholder="Misal: Rp2.000.000"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Estimasi Waktu Selesai</label>
                  <input
                    type="text"
                    required
                    value={proposalDuration}
                    onChange={(e) => setProposalDuration(e.target.value)}
                    placeholder="Misal: 4 Hari Kerja"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Pesan & Pendekatan Konsep Kreatif</label>
                <textarea
                  rows={3}
                  required
                  value={proposalPitch}
                  onChange={(e) => setProposalPitch(e.target.value)}
                  placeholder="Ceritakan ide konsep visual atau strategi video Anda untuk produk UMKM ini..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tautan Portofolio Pendukung (Opsional)</label>
                <input
                  type="url"
                  value={proposalPortfolio}
                  onChange={(e) => setProposalPortfolio(e.target.value)}
                  placeholder="https://instagram.com/karya-serupa atau Google Drive"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-900 leading-relaxed">
                  Proposal Anda dilindungi oleh Creatorin Escrow. Klien tidak dapat melihat data sensitif Anda sebelum penawaran disepakati bersama.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedApplyBrief(null)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-neutral-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white font-semibold transition cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {isSubmittingProposal ? (
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL COLLABORATION SHOWCASE */}
      {/* ========================================================================= */}
      {selectedCollabDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <div className="relative aspect-video bg-neutral-900">
              <img
                src={selectedCollabDetail.deliverableMedia}
                alt={selectedCollabDetail.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedCollabDetail(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f3f3f4] text-[#171717] text-xs font-semibold">
                    {selectedCollabDetail.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#171717] mt-1.5">
                    {selectedCollabDetail.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold text-amber-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{selectedCollabDetail.ratingGiven}.0</span>
                </div>
              </div>

              {selectedCollabDetail.reviewComment && (
                <div className="p-4 rounded-2xl bg-[#fafafa] border border-neutral-100 text-xs text-neutral-600 italic leading-relaxed">
                  "{selectedCollabDetail.reviewComment}"
                </div>
              )}

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCollabDetail.creatorAvatar}
                    alt={selectedCollabDetail.creatorName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{selectedCollabDetail.creatorName}</div>
                    <div className="text-[11px] text-neutral-500">{selectedCollabDetail.creatorRole}</div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const creatorId = selectedCollabDetail.creatorId;
                    setSelectedCollabDetail(null);
                    if (creatorId) {
                      if (onViewCreatorProfile) {
                        const found = await creatorService.getCreatorDetail(creatorId).catch(() => null);
                        if (found) onViewCreatorProfile(found);
                      } else {
                        router.push(`/creator/${creatorId}`);
                      }
                    } else {
                      navigateTo('explore', '/explore');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Lihat Profil Kreator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INLINE EDIT MICRO-MODALS FOR SECTIONS (NAMA BRAND, TAGLINE)               */}
      {/* ========================================================================= */}
      {inlineSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-[#0D0C22]">
                {inlineSection === 'name' && 'Ubah Nama Brand / Usaha'}
                {inlineSection === 'tagline' && 'Ubah Slogan / Tagline Brand'}
              </h3>
              <button 
                onClick={() => setInlineSection(null)} 
                className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inlineSection === 'name' && (
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-neutral-700 block">Nama Brand</label>
                <input
                  type="text"
                  value={tempBrandName}
                  onChange={(e) => setTempBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#0D0C22]"
                />
              </div>
            )}

            {inlineSection === 'tagline' && (
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-neutral-700 block">Slogan / Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={tempTagline}
                  onChange={(e) => setTempTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#0D0C22] resize-none"
                  placeholder="Tuliskan slogan brand Anda..."
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setInlineSection(null)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (inlineSection === 'name') {
                    setProfile(prev => ({ ...prev, brandName: tempBrandName }));
                    showToast('Nama brand berhasil diperbarui!');
                  } else if (inlineSection === 'tagline') {
                    setProfile(prev => ({ ...prev, tagline: tempTagline }));
                    showToast('Tagline brand berhasil diperbarui!');
                  }
                  setInlineSection(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0D0C22] hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
