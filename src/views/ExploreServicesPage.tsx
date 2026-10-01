'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Search, 
  Clock, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ChevronDown, 
  Check, 
  ArrowUpDown, 
  ShoppingBag, 
  User, 
  X, 
  Send, 
  Zap, 
  SlidersHorizontal, 
  Bookmark 
} from 'lucide-react';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { CareerScoreBadge } from '@/components/common/CareerScoreBadge';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { ServiceFilterModal, FilterState } from '@/components/modals/ServiceFilterModal';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { ActivePage, AuthState, Creator, CreatorService } from '@/types';

interface ExploreServicesPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

interface ServiceWithCreator extends CreatorService {
  creator: Creator;
}

const POPULAR_SERVICES_TAGS = [
  '#Kuliner',
  '#TikTokViral',
  '#InstagramReels',
  '#ReviewProduk',
  '#DesainPoster',
  '#FotoProduk',
  '#FeedInstagram',
  '#LogoUMKM',
  '#BannerPromo'
];

export const ExploreServicesPage: React.FC<ExploreServicesPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile
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
      };
      router.push(routeMap[page] || '/explore');
    }
  };

  const handleCreatorClick = (creator: Creator) => {
    if (onViewCreatorProfile) onViewCreatorProfile(creator);
    else router.push(`/creator/${creator.id}`);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBudget, setSelectedBudget] = useState<string>('Semua');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('Semua');
  const [selectedScore, setSelectedScore] = useState<string>('Semua');
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'budget' | 'durasi' | 'score' | null>(null);

  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<Creator | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [availableForWork, setAvailableForWork] = useState<boolean>(false);
  const [fastDelivery, setFastDelivery] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const [orderModalService, setOrderModalService] = useState<ServiceWithCreator | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<ServiceWithCreator | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderBriefNotes, setOrderBriefNotes] = useState('');
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);

  const toggleSaveService = (serviceId: string) => {
    setSavedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory('Semua');
    setSelectedBudget('Semua');
    setSelectedDelivery('Semua');
    setSelectedScore('Semua');
    setMinPrice(0);
    setMaxPrice(10000000);
    setSelectedLocation('');
    setMinRating(0);
    setAvailableForWork(false);
    setFastDelivery(false);
    setVerifiedOnly(false);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Semua') count++;
    if (minPrice > 0 || maxPrice < 10000000) count++;
    if (selectedLocation.trim()) count++;
    if (minRating > 0) count++;
    if (availableForWork) count++;
    if (fastDelivery) count++;
    if (verifiedOnly) count++;
    if (selectedBudget !== 'Semua') count++;
    if (selectedDelivery !== 'Semua') count++;
    if (selectedScore !== 'Semua') count++;
    return count;
  }, [
    selectedCategory,
    minPrice,
    maxPrice,
    selectedLocation,
    minRating,
    availableForWork,
    fastDelivery,
    verifiedOnly,
    selectedBudget,
    selectedDelivery,
    selectedScore
  ]);

  // Aggregate all services from all creators
  const allServices: ServiceWithCreator[] = useMemo(() => {
    const list: ServiceWithCreator[] = [];
    MOCK_CREATORS.forEach((cr) => {
      if (cr.services && cr.services.length > 0) {
        cr.services.forEach((srv) => {
          list.push({
            ...srv,
            creator: cr
          });
        });
      }
    });
    return list;
  }, []);

  // Filter and Sort services
  const filteredServices = useMemo(() => {
    return allServices.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSearch = 
          (item.title?.toLowerCase() || '').includes(q) ||
          (item.creator?.name?.toLowerCase() || '').includes(q) ||
          (item.tag && item.tag.toLowerCase().includes(q)) ||
          (item.creator?.roleTitle?.toLowerCase() || '').includes(q);
        if (!matchSearch) return false;
      }

      // Tag filter
      if (selectedTag) {
        const cleanTag = selectedTag.replace('#', '').toLowerCase();
        const matchTag = 
          (item.title?.toLowerCase() || '').includes(cleanTag) ||
          (item.tag && item.tag.toLowerCase().includes(cleanTag)) ||
          (item.creator?.category?.toLowerCase() || '').includes(cleanTag);
        if (!matchTag) return false;
      }

      // Category filter (flexible for modal categories & native tags)
      if (selectedCategory !== 'Semua') {
        const cat = selectedCategory.toLowerCase();
        const itemTag = (item.tag || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const creatorCat = (item.creator?.category || '').toLowerCase();
        
        let matchCat = itemTag.includes(cat) || itemTitle.includes(cat) || creatorCat.includes(cat);
        
        if (!matchCat) {
          if (cat.includes('logo') || cat.includes('brand')) {
            matchCat = itemTag.includes('logo') || itemTitle.includes('logo') || creatorCat.includes('brand');
          } else if (cat.includes('web')) {
            matchCat = itemTag.includes('web') || itemTitle.includes('web') || creatorCat.includes('ui/ux') || itemTitle.includes('landing');
          } else if (cat.includes('illustration')) {
            matchCat = itemTag.includes('ilustrasi') || itemTitle.includes('ilustrasi') || itemTitle.includes('illustration') || creatorCat.includes('desain');
          } else if (cat.includes('product')) {
            matchCat = itemTag.includes('produk') || itemTitle.includes('produk') || creatorCat.includes('foto') || creatorCat.includes('desain');
          } else if (cat.includes('mobile')) {
            matchCat = itemTag.includes('mobile') || itemTitle.includes('app') || creatorCat.includes('ui/ux');
          } else if (cat.includes('animation')) {
            matchCat = itemTag.includes('animasi') || itemTitle.includes('animasi') || itemTitle.includes('motion') || itemTitle.includes('video') || creatorCat.includes('video');
          } else if (cat.includes('typography')) {
            matchCat = itemTag.includes('font') || itemTitle.includes('typography') || creatorCat.includes('brand') || creatorCat.includes('desain');
          } else if (cat.includes('print')) {
            matchCat = itemTag.includes('print') || itemTitle.includes('poster') || itemTitle.includes('banner') || itemTitle.includes('brosur') || creatorCat.includes('desain');
          }
        }

        if (!matchCat) return false;
      }

      // Budget filter from modal
      if (minPrice > 0 && item.price < minPrice) return false;
      if (maxPrice < 10000000 && item.price > maxPrice) return false;

      // Quick budget dropdown filter
      if (selectedBudget === 'under500' && item.price > 500000) return false;
      if (selectedBudget === 'mid' && (item.price <= 500000 || item.price > 1500000)) return false;
      if (selectedBudget === 'high' && item.price <= 1500000) return false;

      // Location filter from modal
      if (selectedLocation.trim()) {
        const locLower = selectedLocation.toLowerCase().trim();
        const creatorLoc = (item.creator?.location || '').toLowerCase();
        if (!creatorLoc.includes(locLower)) return false;
      }

      // Rating filter from modal
      if (minRating > 0 && (item.creator?.careerScore?.clientRating || 0) < minRating) return false;

      // Delivery duration filter
      const days = parseInt(item.deliveryDays || '3', 10);
      if (fastDelivery && days > 2) return false;
      if (selectedDelivery !== 'Semua') {
        if (selectedDelivery === 'fast' && days > 2) return false;
        if (selectedDelivery === 'standard' && (days <= 2 || days > 4)) return false;
        if (selectedDelivery === 'relaxed' && days <= 4) return false;
      }

      // Score filter
      if (selectedScore === '95+' && item.creator.careerScore.overall < 95) return false;
      if (selectedScore === '90+' && item.creator.careerScore.overall < 90) return false;
      if (selectedScore === 'rating49' && item.creator.careerScore.clientRating < 4.9) return false;

      // Verified creators filter
      if (verifiedOnly && !(item.creator?.verified || (item.creator?.careerScore?.overall || 0) >= 90)) return false;

      return true;
    });
  }, [
    allServices,
    searchQuery,
    selectedTag,
    selectedCategory,
    selectedBudget,
    selectedDelivery,
    selectedScore,
    minPrice,
    maxPrice,
    selectedLocation,
    minRating,
    availableForWork,
    fastDelivery,
    verifiedOnly
  ]);

  const handleOpenOrder = (item: ServiceWithCreator) => {
    setOrderModalService(item);
    setOrderBriefNotes('');
    setOrderPlaced(false);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
  };

  return (
    <div className="w-full bg-[#fafafa] flex flex-col font-sans selection:bg-[#0d0c22] selection:text-white text-[#0d0c22]">
      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-2.5">
          <button 
            onClick={() => navigateTo('landing', '/landing')}
            className="hover:text-neutral-900 transition cursor-pointer"
          >
            Jelajah
          </button>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">Katalog Layanan</span>
        </div>

        {/* Page Title & Subtitle Header */}
        <ScrollReveal distance={20} duration={600}>
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#0F172A] tracking-tight leading-tight lg:leading-[48px]">
                  Jelajah Katalog Layanan & Jasa Kreator
                </h1>
                <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-2xl leading-normal font-normal">
                  Pilih paket layanan konten instan mulai dari video UGC, desain feed, hingga branding dengan harga transparan dan garansi pengerjaan tepat waktu.
                </p>
              </div>

              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="self-start sm:self-auto h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Request Custom Brief</span>
              </button>
            </div>

            {/* Popular Tag Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#64748B] mr-1 flex items-center gap-1">
                <span>Tagar Populer:</span>
              </span>
              {POPULAR_SERVICES_TAGS.map((tag) => {
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
        </ScrollReveal>

        {/* Section Heading & Filter Toolbar (Identical to Screenshot) */}
        <div className="pt-4 pb-4 border-t border-neutral-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="text-base sm:text-lg font-bold text-[#0d0c22]">
              Cari Layanan berdasarkan Kategori
            </h2>

            {/* Filter Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 relative">
              
              {/* Pop-up Filter Modal Trigger Button */}
              <button 
                id="open-filters-modal-btn"
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  activeFilterCount > 0 
                    ? 'border-[#0d0c22] bg-[#0d0c22] text-white' 
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
                title="Buka Filter Lengkap"
              >
                <SlidersHorizontal className={`w-4 h-4 ${activeFilterCount > 0 ? 'text-white' : 'text-neutral-700'}`} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-white text-[#0d0c22] text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button 
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold px-2 py-1 transition cursor-pointer"
                  title="Reset Semua Filter"
                >
                  Reset
                </button>
              )}

              {/* Dropdown 1: Kategori */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedCategory !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'kategori' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in max-h-72 overflow-y-auto">
                    {[
                      'Semua',
                      'Reels Instagram',
                      'Video Tiktok',
                      'Feed Instagram',
                      'Poster',
                      'Banner',
                      'Brosur',
                      'Logo',
                      'Foto Produk'
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Budget */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'budget' ? null : 'budget')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedBudget !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedBudget === 'Semua' ? 'Budget' : selectedBudget === 'under500' ? '< Rp500rb' : selectedBudget === 'mid' ? 'Rp500rb - Rp1.5jt' : '> Rp1.5jt'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'budget' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: 'Semua Budget', val: 'Semua' },
                      { label: 'Di bawah Rp500.000', val: 'under500' },
                      { label: 'Rp500.000 - Rp1.500.000', val: 'mid' },
                      { label: 'Di atas Rp1.500.000', val: 'high' }
                    ].map((b) => (
                      <button
                        key={b.val}
                        onClick={() => {
                          setSelectedBudget(b.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedBudget === b.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{b.label}</span>
                        {selectedBudget === b.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Durasi Pengerjaan */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'durasi' ? null : 'durasi')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedDelivery !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedDelivery === 'Semua' ? 'Pengerjaan' : selectedDelivery === 'fast' ? '⚡ 1-2 Hari' : selectedDelivery === 'standard' ? '3-4 Hari' : '5+ Hari'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'durasi' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: 'Semua Waktu', val: 'Semua' },
                      { label: '⚡ Kilat (1-2 Hari Kerja)', val: 'fast' },
                      { label: 'Standard (3-4 Hari Kerja)', val: 'standard' },
                      { label: 'Proyek Besar (5+ Hari)', val: 'relaxed' }
                    ].map((d) => (
                      <button
                        key={d.val}
                        onClick={() => {
                          setSelectedDelivery(d.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedDelivery === d.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{d.label}</span>
                        {selectedDelivery === d.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Rating & Score */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'score' ? null : 'score')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedScore !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedScore === 'Semua' ? 'Rating / Score' : selectedScore === '95+' ? 'Score 95+' : selectedScore === '90+' ? 'Score 90+' : 'Rating 4.9+'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'score' && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-[16px] border border-black/10 shadow-lg py-2 z-30 animate-in fade-in">
                    {[
                      { label: 'Semua Rating & Score', val: 'Semua' },
                      { label: 'Career Score 95+ (Top 1%)', val: '95+' },
                      { label: 'Career Score 90+ (Top Tier)', val: '90+' },
                      { label: 'Rating Bintang 4.9+', val: 'rating49' }
                    ].map((s) => (
                      <button
                        key={s.val}
                        onClick={() => {
                          setSelectedScore(s.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedScore === s.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {selectedScore === s.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Services Grid (Dribbble Pro Aesthetic matching reference image) */}
        <div className="mt-6">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
              <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d0c22]">Tidak ada layanan yang sesuai</h3>
              <p className="text-sm text-neutral-500 mt-1">Coba kata kunci lain atau bersihkan filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedBudget('Semua');
                  setSelectedDelivery('Semua');
                  setSelectedScore('Semua');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#0d0c22] cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredServices.map((item, sIdx) => {
                const coverImage = item.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80';
                const formattedDelivery = item.deliveryDays
                  ? (item.deliveryDays.toLowerCase().includes('hari') ? item.deliveryDays : `${item.deliveryDays} Hari Kerja`)
                  : '2-3 Hari Kerja';

                return (
                  <ScrollReveal
                    key={item.id}
                    distance={28}
                    delay={Math.min((sIdx % 4) * 70, 240)}
                    duration={600}
                  >
                    <div
                      className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#64748B] transition-colors p-5 flex flex-col justify-between text-left group shadow-2xs h-full"
                    >
                    <div>
                      {/* Cover Thumbnail Image inside card padding */}
                      <div 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="aspect-[16/10] rounded-xl overflow-hidden bg-[#F3F3F4] mb-4 cursor-pointer"
                        title="Klik untuk melihat detail layanan"
                      >
                        <img
                          src={coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Tag & Creator Attribution Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F3F3F4] text-[#171717] text-[11px] font-medium inline-block">
                          {item.tag || 'Layanan'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatorClick(item.creator);
                          }}
                          className="flex items-center gap-1.5 text-[#64748B] hover:text-[#1D4ED8] transition-colors group/cr cursor-pointer"
                          title={`Lihat profil ${item.creator.name}`}
                        >
                          <img
                            src={item.creator.avatar}
                            alt={item.creator.name}
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-[#E2E8F0]"
                          />
                          <span className="text-[11px] font-medium truncate max-w-[120px] group-hover/cr:underline">
                            {item.creator.name}
                          </span>
                        </button>
                      </div>

                      {/* Service Title */}
                      <h3 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="text-base font-semibold text-[#0F172A] mb-1.5 leading-snug cursor-pointer group-hover:text-[#1D4ED8] transition-colors"
                        title="Klik untuk melihat detail layanan"
                      >
                        {item.title}
                      </h3>

                      {/* Service Description (1-2 lines) */}
                      <p 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4 cursor-pointer font-normal"
                      >
                        {item.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                      </p>

                      {/* Estimasi Durasi Pengerjaan */}
                      <div 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="flex items-center gap-1.5 text-xs text-[#64748B] mb-6 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#9F9F9F] stroke-[1.75]" />
                        <span>Estimasi: {formattedDelivery}</span>
                      </div>
                    </div>

                    {/* Bottom Row / Card Footer: HARGA + Pesan Layanan */}
                    <div className="flex items-center justify-between pt-2 gap-2 border-t border-[#E2E8F0]">
                      <div onClick={() => setSelectedServiceForDetail(item)} className="cursor-pointer min-w-0">
                        <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider block mb-0.5">
                          HARGA
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#0F172A] truncate block">
                          {item.formattedPrice}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Tombol Icon Simpan */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveService(item.id);
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition cursor-pointer flex items-center justify-center ${
                            savedServiceIds.includes(item.id)
                              ? 'border-amber-300 bg-amber-50 text-amber-600'
                              : 'border-[#E2E8F0] hover:border-[#64748B] hover:bg-[#F8FAFC] text-[#64748B]'
                          }`}
                          title={savedServiceIds.includes(item.id) ? "Tersimpan" : "Simpan layanan"}
                          aria-label="Simpan layanan"
                        >
                          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${savedServiceIds.includes(item.id) ? 'fill-amber-500 text-amber-500' : 'stroke-[1.75]'}`} />
                        </button>

                        {/* Tombol Diskusikan (CTA transaksional #0B1F3A, rounded-xl 12px) */}
                        <button
                          type="button"
                          onClick={() => handleOpenOrder(item)}
                          className="h-9 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                          Diskusikan
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Direct Service Order / Brief Modal */}
      {orderModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full overflow-hidden text-left max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  {orderModalService.tag || 'Layanan Kreatif'}
                </span>
                <h3 className="text-xl font-bold text-[#0d0c22] mt-1.5">
                  {orderModalService.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                  <span>Oleh {orderModalService.creator.name}</span>
                  <span>•</span>
                  <span>Estimasi {orderModalService.deliveryDays || '3 Hari Kerja'}</span>
                </div>
              </div>
              <button
                onClick={() => setOrderModalService(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {orderPlaced ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#0d0c22]">
                  Pesanan Layanan Berhasil Dibuat!
                </h4>
                <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Permintaan pesanan telah diteruskan ke <strong>{orderModalService.creator.name}</strong>. Pembayaran Anda sebesar <strong>{orderModalService.formattedPrice}</strong> akan diamankan di sistem escrow Creatorin hingga hasil akhir disetujui.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setOrderModalService(null)}
                    className="px-6 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Kembali ke Katalog
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="p-6 space-y-4 overflow-y-auto">
                
                {/* Price summary */}
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 font-bold uppercase">Total Biaya Layanan</span>
                    <p className="text-xl font-black text-[#0d0c22]">{orderModalService.formattedPrice}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 font-bold uppercase">Garansi Pengerjaan</span>
                    <p className="text-sm font-bold text-neutral-800">{orderModalService.deliveryDays || '3 Hari Kerja'}</p>
                  </div>
                </div>

                {/* Brief details input */}
                <div>
                  <label className="block text-xs font-bold text-[#0d0c22] mb-1">
                    Catatan Kebutuhan / Link Referensi
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={orderBriefNotes}
                    onChange={(e) => setOrderBriefNotes(e.target.value)}
                    placeholder="Sebutkan detail brand Anda, produk yang ingin dibuatkan konten, atau lampirkan link Google Drive materi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                {/* Escrow note */}
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Garansi Escrow Creatorin</strong>: Dana Anda tidak akan diteruskan ke kreator sebelum hasil akhir diserahkan dan sesuai kesepakatan revisi.
                  </span>
                </div>

                {/* Footer buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderModalService(null)}
                    className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Lanjutkan & Amankan Dana di Escrow</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Creator Profile Modal */}
      {selectedCreatorForModal && (
        <ProfileModal
          creator={selectedCreatorForModal}
          isOpen={true}
          onClose={() => setSelectedCreatorForModal(null)}
          onOpenBrief={() => {
            setSelectedCreatorForModal(null);
            setIsBriefModalOpen(true);
          }}
        />
      )}

      {/* Modal Buat Brief Baru */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />

      {/* Service Detail Modal (Pop-up sheet with matching design concept) */}
      {selectedServiceForDetail && (
        <ServiceDetailModal
          service={selectedServiceForDetail}
          creator={selectedServiceForDetail.creator}
          onClose={() => setSelectedServiceForDetail(null)}
          onOrderService={(srv, cr) => {
            setSelectedServiceForDetail(null);
            handleOpenOrder({ ...srv, creator: cr });
          }}
          onViewCreatorProfile={(cr) => {
            setSelectedServiceForDetail(null);
            handleCreatorClick(cr);
          }}
          onNavigate={navigateTo}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail({
              ...newSrv,
              creator: selectedServiceForDetail.creator
            });
          }}
        />
      )}

      {/* Pop-up Filters Modal matching Dribbble screenshot */}
      <ServiceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={{
          category: selectedCategory,
          minPrice,
          maxPrice,
          location: selectedLocation,
          minRating,
          availableForWork,
          fastDelivery,
          verifiedOnly
        }}
        onApply={(newFilters) => {
          setSelectedCategory(newFilters.category);
          setMinPrice(newFilters.minPrice);
          setMaxPrice(newFilters.maxPrice);
          setSelectedLocation(newFilters.location);
          setMinRating(newFilters.minRating);
          setAvailableForWork(newFilters.availableForWork);
          setFastDelivery(newFilters.fastDelivery);
          setVerifiedOnly(newFilters.verifiedOnly);
        }}
        onReset={resetAllFilters}
      />

    </div>
  );
};
