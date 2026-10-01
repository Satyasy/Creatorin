'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  ArrowUpDown, 
  Building2, 
  Sparkles, 
  X, 
  Send, 
  ShieldCheck, 
  Bookmark, 
  FileText, 
  Plus, 
  ArrowRight, 
  Star, 
  Package, 
  ExternalLink,
  DollarSign,
  Briefcase,
  Layers,
  Filter,
  Users,
  Edit3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { BriefDetailPage } from './BriefDetailPage';
import { MOCK_PROJECTS } from '@/data/mockProjects';
import { ActivePage, AuthState, ProjectListing } from '@/types';
import { briefService } from '@/services/briefService';

// Format budget display to single clean number (e.g. Rp1.500.000)
const formatDisplayBudget = (formatted?: string, budgetMin?: number) => {
  if (budgetMin) {
    return `Rp${budgetMin.toLocaleString('id-ID')}`;
  }
  if (!formatted) return 'Rp1.500.000';
  const clean = formatted.split(/[-–—]|sampai/i)[0].trim();
  return clean.startsWith('Rp') ? clean : `Rp${clean}`;
};

interface ProjectBriefsPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: any) => void;
  onViewBrief?: (brief: ProjectListing) => void;
}

const CATEGORY_TABS = [
  'Semua',
  'Reels Instagram',
  'Video Tiktok',
  'Foto Produk',
  'Logo & Branding',
  'Feed Instagram',
  'UI/UX Design',
  'Packaging & Kemasan',
  'Banner & Poster'
];

const POPULAR_BRIEF_TAGS = [
  '#ReelsInstagram',
  '#TikTokViral',
  '#UIUXDesign',
  '#FotoProduk',
  '#DesignSystems',
  '#CinematicBRoll',
  '#FigmaCommunity',
  '#PackagingDesign',
  '#ASMRCoffee'
];

export const ProjectBriefsPage: React.FC<ProjectBriefsPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile,
  onViewBrief
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
        'notifications': '/notifications',
        'briefs': '/briefs',
        'signin': '/sign-in',
        'signup': '/sign-up',
      };
      router.push(routeMap[page] || '/explore');
    }
  };

  // Projects data state (so creators can apply and UMKM can add briefs in-session)
  const [projectsList, setProjectsList] = useState<ProjectListing[]>(MOCK_PROJECTS);

  useEffect(() => {
    briefService.getBriefs().then((briefs) => {
      if (briefs && briefs.length > 0) {
        setProjectsList(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newFromDb = briefs.filter(b => !existingIds.has(b.id));
          return [...newFromDb, ...prev];
        });
      }
    });
  }, []);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBudget, setSelectedBudget] = useState<string>('Semua');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('Semua');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [shippingOnly, setShippingOnly] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<'newest' | 'budget_high' | 'budget_low' | 'fewest_proposals'>('newest');
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'budget' | 'durasi' | 'shipping' | 'sort' | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Interaction states
  const [savedBriefIds, setSavedBriefIds] = useState<string[]>([]);
  const [appliedBriefIds, setAppliedBriefIds] = useState<Record<string, { rate: string; timeline: string }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isPostBriefModalOpen, setIsPostBriefModalOpen] = useState(false);
  const [selectedBriefForDetail, setSelectedBriefForDetail] = useState<ProjectListing | null>(null);
  const [selectedBriefForApply, setSelectedBriefForApply] = useState<ProjectListing | null>(null);
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

  const handleSaveEditBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrief) return;
    const minNum = parseInt(editBriefForm.budgetMin) || 1500000;
    const deliverablesList = editBriefForm.deliverables
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);
    const skillsList = editBriefForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setProjectsList(prev => prev.map(p => {
      if (p.id === editingBrief.id) {
        return {
          ...p,
          title: editBriefForm.title,
          category: editBriefForm.category,
          budgetMin: minNum,
          budgetMax: minNum,
          formattedBudget: `Rp${minNum.toLocaleString('id-ID')}`,
          deadline: editBriefForm.deadline,
          description: editBriefForm.description,
          deliverables: deliverablesList.length > 0 ? deliverablesList : p.deliverables,
          requiredSkills: skillsList.length > 0 ? skillsList : p.requiredSkills,
          productShippingProvided: editBriefForm.productShipping
        };
      }
      return p;
    }));

    setEditingBrief(null);
    showToast('Brief proyek berhasil diperbarui!');
  };

  // Proposal Form State
  const [proposalRate, setProposalRate] = useState<string>('');
  const [proposalTimeline, setProposalTimeline] = useState<string>('');
  const [proposalPitch, setProposalPitch] = useState<string>('');
  const [proposalPortfolioUrl, setProposalPortfolioUrl] = useState<string>('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [isProposalSuccess, setIsProposalSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willSave = !savedBriefIds.includes(id);
    setSavedBriefIds(prev => willSave ? [...prev, id] : prev.filter(x => x !== id));
    showToast(willSave ? 'Brief disimpan ke daftar pantau' : 'Brief dihapus dari simpanan');
  };

  const handleOpenApplyModal = (brief: ProjectListing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBriefForApply(brief);
    // pre-fill recommended rate midpoint
    const mid = Math.round((brief.budgetMin + brief.budgetMax) / 2);
    setProposalRate(`Rp${mid.toLocaleString('id-ID')}`);
    setProposalTimeline(brief.deadline);
    setProposalPitch('');
    setProposalPortfolioUrl('');
    setIsProposalSuccess(false);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBriefForApply) return;

    setIsSubmittingProposal(true);
    setTimeout(() => {
      setIsSubmittingProposal(false);
      setIsProposalSuccess(true);
      
      // Update proposal count in list
      setProjectsList(prev => prev.map(p => {
        if (p.id === selectedBriefForApply.id) {
          return { ...p, proposalsCount: p.proposalsCount + 1 };
        }
        return p;
      }));

      // Record applied
      setAppliedBriefIds(prev => ({
        ...prev,
        [selectedBriefForApply.id]: {
          rate: proposalRate,
          timeline: proposalTimeline
        }
      }));

      // If connected to a real database brief, submit proposal to backend
      if (selectedBriefForApply.id.length > 20 && !selectedBriefForApply.id.startsWith('proj-')) {
        briefService.applyToBrief(
          selectedBriefForApply.id,
          proposalPitch || 'Saya siap mengerjakan brief proyek ini sesuai spesifikasi.',
          proposalRate || selectedBriefForApply.formattedBudget
        ).catch(() => {});
      }

      showToast('Proposal Anda berhasil diajukan ke klien!');
    }, 600);
  };

  // Filter & sort logic
  const filteredProjects = useMemo(() => {
    return projectsList.filter((proj) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = proj.title.toLowerCase().includes(q);
        const matchDesc = proj.description.toLowerCase().includes(q);
        const matchClient = proj.clientName.toLowerCase().includes(q);
        const matchLoc = proj.clientLocation.toLowerCase().includes(q);
        const matchSkills = proj.requiredSkills.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchClient && !matchLoc && !matchSkills) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'Semua' && proj.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag) {
        const cleanTag = selectedTag.replace('#', '').toLowerCase();
        const matchesTag = 
          proj.category.toLowerCase().includes(cleanTag) ||
          proj.requiredSkills.some(s => s.toLowerCase().includes(cleanTag)) ||
          proj.title.toLowerCase().includes(cleanTag);
        if (!matchesTag) return false;
      }

      // Budget filter
      if (selectedBudget === '<1jt' && proj.budgetMax > 1000000) return false;
      if (selectedBudget === '1-3jt' && (proj.budgetMax < 1000000 || proj.budgetMin > 3000000)) return false;
      if (selectedBudget === '3-5jt' && (proj.budgetMax < 3000000 || proj.budgetMin > 5000000)) return false;
      if (selectedBudget === '>5jt' && proj.budgetMax < 5000000) return false;

      // Delivery duration filter
      if (selectedDelivery === 'urgent' && (!proj.isUrgent && (proj.scopeDurationDays || 10) > 3)) return false;
      if (selectedDelivery === 'under_week' && (proj.scopeDurationDays || 5) > 7) return false;
      if (selectedDelivery === 'over_week' && (proj.scopeDurationDays || 5) <= 7) return false;

      // Shipping only filter
      if (shippingOnly && !proj.productShippingProvided) return false;

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'budget_high') {
        return b.budgetMax - a.budgetMax;
      }
      if (selectedSort === 'budget_low') {
        return a.budgetMin - b.budgetMin;
      }
      if (selectedSort === 'fewest_proposals') {
        return a.proposalsCount - b.proposalsCount;
      }
      // default: newest (urgent first, then by id order)
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return 0;
    });
  }, [projectsList, searchQuery, selectedCategory, selectedTag, selectedBudget, selectedDelivery, shippingOnly, selectedSort]);

  // Hitung jumlah filter yang sedang aktif
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Semua') count++;
    if (selectedBudget !== 'Semua') count++;
    if (selectedDelivery !== 'Semua') count++;
    if (shippingOnly) count++;
    if (selectedTag !== null) count++;
    if (searchQuery.trim() !== '') count++;
    if (selectedSort !== 'newest') count++;
    return count;
  }, [selectedCategory, selectedBudget, selectedDelivery, shippingOnly, selectedTag, searchQuery, selectedSort]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedBudget('Semua');
    setSelectedDelivery('Semua');
    setSelectedTag(null);
    setShippingOnly(false);
    setSelectedSort('newest');
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#0B1F3A] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navbar rendered by (main) layout */}

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-2.5">
          <button 
            onClick={() => navigateTo('landing', '/landing')}
            className="hover:text-neutral-900 transition cursor-pointer"
          >
            Jelajah
          </button>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">Papan Brief Proyek UMKM</span>
        </div>

        {/* Header Hero Section */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#0F172A] tracking-tight leading-tight lg:leading-[48px]">
                Papan Brief Proyek & Kebutuhan UMKM
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-3xl leading-relaxed font-normal">
                Temukan peluang proyek langsung dari pelaku bisnis, UMKM, dan brand lokal di seluruh Indonesia. Pelajari brief kebutuhan konten, ajukan proposal Anda, dan mulai berkolaborasi dengan jaminan pembayaran aman.
              </p>
            </div>

            {/* Tombol Pasang Brief Baru (CTA transaksional utama #0B1F3A) */}
            <div className="shrink-0 flex items-center gap-2.5">
              <button
                onClick={() => setIsPostBriefModalOpen(true)}
                className="h-11 px-5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-sm font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Pasang Brief Baru</span>
              </button>
            </div>
          </div>

          {/* Popular Tag Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#64748B] mr-1 flex items-center gap-1">
              <span>Tagar Populer:</span>
            </span>
            {POPULAR_BRIEF_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-2xs font-semibold'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-xs text-[#1D4ED8] font-semibold hover:underline ml-1.5 cursor-pointer"
              >
                Reset Tagar
              </button>
            )}
          </div>
        </div>

        {/* Section Heading & Filter Toolbar (Identical to UI Jelajah) */}
        <section className="pt-4 pb-4 border-t border-neutral-200/80 mb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                Cari Proyek berdasarkan Kategori
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                {filteredProjects.length} Brief
              </span>
            </div>

            {/* Click-away backdrop for dropdowns */}
            {openDropdown && (
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setOpenDropdown(null)} 
              />
            )}

            {/* Filter Buttons Group (Identical to UI Jelajah) */}
            <div className="flex flex-wrap items-center gap-2 relative z-30">
              
              {/* Reset / Clear All Filter Button */}
              <button 
                onClick={resetAllFilters}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  activeFilterCount > 0
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-2xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                }`}
                title="Reset Semua Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown 1: Kategori */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedCategory !== 'Semua' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'kategori' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in max-h-72 overflow-y-auto">
                    {CATEGORY_TABS.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Anggaran / Budget */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'budget' ? null : 'budget')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedBudget !== 'Semua' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedBudget === 'Semua' 
                      ? 'Anggaran' 
                      : selectedBudget === '<1jt' 
                      ? '< Rp1 Juta' 
                      : selectedBudget === '1-3jt' 
                      ? 'Rp1jt - Rp3jt' 
                      : selectedBudget === '3-5jt' 
                      ? 'Rp3jt - Rp5jt' 
                      : '> Rp5 Juta'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'budget' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'Semua', label: 'Semua Anggaran' },
                      { id: '<1jt', label: 'Di bawah Rp1 Juta' },
                      { id: '1-3jt', label: 'Rp1.000.000 - Rp3.000.000' },
                      { id: '3-5jt', label: 'Rp3.000.000 - Rp5.000.000' },
                      { id: '>5jt', label: 'Di atas Rp5.000.000' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBudget(b.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedBudget === b.id ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{b.label}</span>
                        {selectedBudget === b.id && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Tenggat Waktu / Deadline */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'durasi' ? null : 'durasi')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedDelivery !== 'Semua' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedDelivery === 'Semua'
                      ? 'Tenggat Waktu'
                      : selectedDelivery === 'urgent'
                      ? 'Urgent (<3 Hari)'
                      : selectedDelivery === 'under_week'
                      ? '< 7 Hari'
                      : '> 7 Hari'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'durasi' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'Semua', label: 'Semua Tenggat' },
                      { id: 'urgent', label: 'Urgent / Butuh Cepat (<3 Hari)' },
                      { id: 'under_week', label: 'Kurang dari 7 Hari' },
                      { id: 'over_week', label: 'Lebih dari 7 Hari' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDelivery(d.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedDelivery === d.id ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{d.label}</span>
                        {selectedDelivery === d.id && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Kirim Produk / Sampel */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'shipping' ? null : 'shipping')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    shippingOnly ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{shippingOnly ? 'Sampel Dikirim' : 'Kirim Produk'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'shipping' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { val: false, label: 'Semua Brief' },
                      { val: true, label: 'Sampel Fisik Dikirim UMKM' },
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShippingOnly(s.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          shippingOnly === s.val && s.val === true ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {shippingOnly === s.val && s.val === true && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                        {!shippingOnly && s.val === false && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 5: Urutkan */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedSort !== 'newest' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedSort === 'newest'
                      ? 'Urutkan: Rekomendasi'
                      : selectedSort === 'budget_high'
                      ? 'Urutkan: Budget Tertinggi'
                      : selectedSort === 'budget_low'
                      ? 'Urutkan: Budget Terendah'
                      : 'Urutkan: Peluang Terbesar'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'sort' && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'newest', label: 'Rekomendasi & Terbaru' },
                      { id: 'budget_high', label: 'Budget Tertinggi' },
                      { id: 'budget_low', label: 'Budget Terendah' },
                      { id: 'fewest_proposals', label: 'Peluang Besar (<5 Pelamar)' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setSelectedSort(st.id as any);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedSort === st.id ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{st.label}</span>
                        {selectedSort === st.id && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

      {/* GRID DAFTAR BRIEF PROYEK */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Tidak ada brief yang cocok</h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat seluruh brief kebutuhan UMKM yang tersedia.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#123B8C] transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  if (onViewBrief) {
                    onViewBrief(project);
                  } else {
                    router.push(`/briefs/${project.id}`);
                  }
                }}
                className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#64748B] transition-colors p-6 flex flex-col justify-between cursor-pointer text-left relative shadow-2xs"
              >
                <div>
                  {/* Top Meta: Category Badge & Time */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#F3F3F4] text-[#0F172A] text-xs font-semibold">
                      {project.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{project.postedTimeAgo}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base sm:text-lg font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors line-clamp-2 leading-snug mb-2">
                    {project.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 leading-relaxed font-normal mb-4">
                    {project.description}
                  </p>

                  {/* Key Scope & Deliverables */}
                  {project.deliverables && project.deliverables.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {project.deliverables.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills Tags (Compact, subtle surface, full radius according to design.md §9) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-[#F3F3F4] text-[#171717] text-xs font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer: Budget & Actions */}
                <div className="pt-4 mt-6 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#64748B] font-medium block">Estimasi Anggaran</span>
                    <span className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight block">
                      {formatDisplayBudget(project.formattedBudget, project.budgetMin)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {appliedBriefIds[project.id] ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sudah Dilamar</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleOpenApplyModal(project, e)}
                        className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-white/80" />
                        <span>Lamar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* MODAL 1: DETAIL BRIEF PROYEK                                       */}
      {/* =================================================================== */}
      {selectedBriefForDetail && (
        <BriefDetailPage
          brief={selectedBriefForDetail}
          currentUser={currentUser}
          onSignOut={onSignOut}
          onNavigate={navigateTo}
          onClose={() => setSelectedBriefForDetail(null)}
          onViewCreatorProfile={onViewCreatorProfile}
          onEditBrief={(updated) => {
            setProjectsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedBriefForDetail(updated);
          }}
        />
      )}

      {/* =================================================================== */}
      {/* MODAL 2: AJUKAN PROPOSAL (APPLY FORM)                              */}
      {/* =================================================================== */}
      {selectedBriefForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0d0c22]">
                  Ajukan Proposal Proyek
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Kirim penawaran rate dan konsep pengerjaan Anda kepada {selectedBriefForApply.clientName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBriefForApply(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {isProposalSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-[#0d0c22]">Proposal Berhasil Dikirim!</h4>
                  <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
                    Klien <strong>{selectedBriefForApply.clientName}</strong> akan menerima penawaran Anda. Anda dapat memantau status atau berdiskusi lebih lanjut via chat.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={() => setSelectedBriefForApply(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer"
                    >
                      Kembali ke Papan Brief
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBriefForApply(null);
                        navigateTo('chat', '/chat');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Buka Ruang Obrolan
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  
                  {/* Brief recap card */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Brief yang Dilamar:
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-1 line-clamp-1">
                      {selectedBriefForApply.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                      <span>Anggaran Klien: <strong className="text-neutral-800 font-semibold">{selectedBriefForApply.formattedBudget}</strong></span>
                      <span>•</span>
                      <span>Target: {selectedBriefForApply.deadline}</span>
                    </div>
                  </div>

                  {/* Rate & Timeline input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Nominal Penawaran Anda (Rp)
                      </label>
                      <input
                        type="text"
                        required
                        value={proposalRate}
                        onChange={(e) => setProposalRate(e.target.value)}
                        placeholder="Contoh: Rp1.800.000"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Estimasi Waktu Penyelesaian
                      </label>
                      <input
                        type="text"
                        required
                        value={proposalTimeline}
                        onChange={(e) => setProposalTimeline(e.target.value)}
                        placeholder="Contoh: 5 Hari Kerja"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Pitch message */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Pesan Penawaran & Rencana Konsep Kreatif
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={proposalPitch}
                      onChange={(e) => setProposalPitch(e.target.value)}
                      placeholder="Jelaskan secara ringkas pengalaman Anda, ide konsep hook, atau cara Anda mengeksekusi brief ini agar klien yakin memilih Anda..."
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-neutral-900 placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Portfolio link */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Tautan Portofolio Relevan (Opsional)
                    </label>
                    <input
                      type="url"
                      value={proposalPortfolioUrl}
                      onChange={(e) => setProposalPortfolioUrl(e.target.value)}
                      placeholder="https://instagram.com/p/... atau Google Drive / Behance link"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-neutral-900"
                    />
                  </div>

                  {/* Escrow security badge */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Proposal dilindungi Creatorin. Jika klien menerima, dana akan dikunci di Escrow sebelum Anda mulai bekerja.</span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBriefForApply(null)}
                      className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingProposal}
                      className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSubmittingProposal ? (
                        <span>Mengirimkan...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Proposal Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT BRIEF                                                  */}
      {/* =================================================================== */}
      {editingBrief && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
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
                  id="edit-shipping-check-briefs"
                  checked={editBriefForm.productShipping}
                  onChange={(e) => setEditBriefForm({ ...editBriefForm, productShipping: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
                <label htmlFor="edit-shipping-check-briefs" className="text-xs text-neutral-700 font-medium cursor-pointer">
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

      {/* =================================================================== */}
      {/* MODAL 3: PASANG BRIEF BARU (UNTUK BISNIS / UMKM)                   */}
      {/* =================================================================== */}
      <ProjectBriefModal
        isOpen={isPostBriefModalOpen}
        onClose={() => setIsPostBriefModalOpen(false)}
      />

    </div>
  );
};
