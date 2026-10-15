'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Star, 
  Check, 
  SlidersHorizontal, 
  ChevronDown, 
  Bookmark, 
  UserCheck, 
  Clock, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { startRouteProgress } from '@/components/common/RouteProgressBar';
import { creatorService } from '@/services/creatorService';
import { DEFAULT_CREATORS } from '@/data/defaultCreators';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useToast } from '@/providers/ToastProvider';
import { useSuccessModal } from '@/providers/SuccessModalProvider';
import { bookmarkService } from '@/services/bookmarkService';
import type { AuthState, ActivePage, Creator, CreatorService } from '@/types';

interface JelajahKreatorPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

const CATEGORY_OPTIONS = [
  'Semua Kategori',
  'Brand Identity',
  'Feed Instagram',
  'Kemasan',
  'Video & UGC',
  'Motion & Animasi',
  'Foto Produk'
];

const BUDGET_OPTIONS = [
  { id: 'all', label: 'Semua Budget' },
  { id: 'under250', label: '< Rp250.000' },
  { id: '250to500', label: 'Rp250.000 - Rp500.000' },
  { id: 'above500', label: '> Rp500.000' },
];

const LOCATION_OPTIONS = [
  'Semua Lokasi',
  'Bandung, Jawa Barat',
  'Jakarta Selatan',
  'Yogyakarta',
  'Surabaya',
  'Bali',
  'Semarang'
];

export const JelajahKreatorPage: React.FC<JelajahKreatorPageProps> = ({
  currentUser: propUser,
  onNavigate,
  onViewCreatorProfile,
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const { showSuccessModal } = useSuccessModal();
  const { t, language } = useLanguage();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Semua Kategori') return t('filter.allCategories', 'Semua Kategori');
    if (cat === 'Brand Identity') return t('category.logo', 'Brand Identity');
    if (cat === 'Feed Instagram') return t('category.feed', 'Feed Instagram');
    if (cat === 'Kemasan') return 'Packaging';
    if (cat === 'Video & UGC') return 'Video & UGC';
    if (cat === 'Motion & Animasi') return 'Motion & Animation';
    if (cat === 'Foto Produk') return t('category.productPhoto', 'Foto Produk');
    return cat;
  };

  const getBudgetLabel = (id: string) => {
    if (id === 'all') return t('filter.allBudget', 'Semua Budget');
    if (id === 'under250') return t('budget.under250', '< Rp250.000');
    if (id === '250to500') return t('budget.250to500', 'Rp250.000 - Rp500.000');
    if (id === 'above500') return t('budget.above500', '> Rp500.000');
    return id;
  };

  const getLocationLabel = (loc: string) => {
    if (loc === 'Semua Lokasi') return t('filter.allLocations', 'Semua Lokasi');
    return loc;
  };

  const getSortLabel = (id: string) => {
    if (id === 'score') return t('sort.highestScore', 'Skor Karir Tertinggi');
    if (id === 'rating') return t('sort.highestRating', 'Rating Tertinggi');
    if (id === 'projects') return t('sort.mostProjects', 'Proyek Terbanyak');
    if (id === 'rate-asc') return t('sort.lowestRate', 'Tarif Terendah');
    return id;
  };

  const formatRate = (creator: Creator) => {
    const rateNum = creator.startingRate || 200000;
    if (language === 'en') {
      return `From IDR ${rateNum.toLocaleString('en-US')}`;
    }
    return `${t('card.startingFrom', 'Mulai')} ${creator.formattedRate || `Rp${rateNum.toLocaleString('id-ID')}`}`;
  };

  const [creators, setCreators] = useState<Creator[]>(DEFAULT_CREATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [selectedSort, setSelectedSort] = useState<'score' | 'rating' | 'projects' | 'rate-asc'>('score');
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'budget' | 'lokasi' | 'sort' | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loadingCreatorId, setLoadingCreatorId] = useState<string | null>(null);

  // Modals
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<{
    service: CreatorService;
    creator: Creator;
  } | null>(null);

  // AuthModal state for protected actions
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    title: string;
    description: string;
    action?: (user?: NonNullable<AuthState['user']>) => void;
  }>({
    title: 'Masuk ke Akun Creatorin',
    description: 'Masuk untuk melanjutkan tindakan ini dan membuka akses ke seluruh fitur kolaborasi.',
  });

  useEffect(() => {
    creatorService
      .getCreators()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          setCreators(fetched);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_CREATORS
      });
  }, []);

  // Fetch persisted bookmarks from database
  useEffect(() => {
    if (currentUser?.id) {
      bookmarkService.getBookmarks('creator').then((ids) => {
        setBookmarkedIds(ids);
      });
    } else {
      setBookmarkedIds([]);
    }
  }, [currentUser?.id]);

  const toggleBookmark = async (id: string) => {
    const wasBookmarked = bookmarkedIds.includes(id);
    // Optimistic UI
    setBookmarkedIds((prev) => 
      wasBookmarked ? prev.filter((item) => item !== id) : [...prev, id]
    );

    const res = await bookmarkService.toggleBookmark('creator', id);
    if (!res.success) {
      // Rollback on failure
      setBookmarkedIds((prev) => 
        wasBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
      );
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Bookmark',
        message: res.error || 'Terjadi gangguan saat menyimpan ke database.',
      });
      return;
    }

    if (res.bookmarked) {
      showSuccessModal({
        title: 'Kreator Disimpan ke Favorit',
        message: 'Profil kreator berhasil disimpan ke koleksi bookmark akun Anda.',
        duration: 2500,
      });
    } else {
      showToast({
        type: 'info',
        title: 'Bookmark Dihapus',
        message: 'Profil kreator telah dihapus dari koleksi favorit.',
        duration: 2000,
      });
    }
  };

  const handleCreatorClick = (creator: Creator) => {
    if (onViewCreatorProfile) {
      onViewCreatorProfile(creator);
    } else {
      setLoadingCreatorId(creator.id);
      startRouteProgress();
      router.push(`/creator/${creator.id}`);
    }
  };

  const handleOpenBrief = (creator: Creator, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthModalConfig({
        title: 'Masuk untuk kirim brief',
        description: 'Masuk ke akun Anda untuk mengirimkan brief proyek ke kreator ini.',
        action: () => {
          setTargetCreatorForBrief(creator);
          setIsBriefModalOpen(true);
        },
      });
      setIsAuthModalOpen(true);
      return;
    }
    setTargetCreatorForBrief(creator);
    setIsBriefModalOpen(true);
  };

  const handleServiceClick = (service: Partial<CreatorService>, creator: Creator) => {
    const priceNum = typeof service.price === 'number'
      ? service.price
      : parseInt((service.formattedPrice || '').replace(/[^0-9]/g, '')) || 350000;

    const fullService: CreatorService = {
      id: service.id || `srv-${Date.now()}`,
      title: service.title || 'Layanan Kreatif Profesional',
      price: priceNum,
      formattedPrice: service.formattedPrice || `Rp${priceNum.toLocaleString('id-ID')}`,
      deliveryDays: service.deliveryDays || '3 Hari Kerja',
      tag: service.tag || 'Desain',
      coverImage: service.coverImage || service.galleryImages?.[0] || '/creatorin/service-pattern-1.png',
      description: service.description || 'Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.',
      revisions: service.revisions || '2x Revisi Gratis',
      features: service.features || ['Revisi Cepat', 'File Resolusi Tinggi Siap Pakai', 'Konsultasi Kebutuhan Brand'],
      galleryImages: service.galleryImages || (service.coverImage ? [service.coverImage] : []),
      category: service.category || service.tag,
    };

    setSelectedServiceForDetail({ service: fullService, creator });
  };

  const toggleSave = (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast({
        type: 'warning',
        title: t('toast.authRequired', 'Perlu Masuk Akun'),
        message: t('auth.bookmarkRequired', 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk menyimpan ke koleksi favorit.'),
        action: {
          label: t('action.signIn', 'Masuk ke Akun'),
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    toggleBookmark(creatorId);
  };

  const filteredCreators = useMemo(() => {
    const list = creators.filter((creator) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQ =
          (creator.name?.toLowerCase() || '').includes(q) ||
          (creator.username?.toLowerCase() || '').includes(q) ||
          (creator.handle?.toLowerCase() || '').includes(q) ||
          (creator.roleTitle?.toLowerCase() || '').includes(q) ||
          (creator.bio?.toLowerCase() || '').includes(q) ||
          (creator.location?.toLowerCase() || '').includes(q) ||
          (creator.skills || []).some((s) => s.toLowerCase().includes(q)) ||
          (creator.services || []).some((srv) => srv.title.toLowerCase().includes(q) || (srv.tag || '').toLowerCase().includes(q));
        if (!matchesQ) return false;
      }

      // Category filter
      if (selectedCategory !== 'Semua Kategori') {
        const cat = selectedCategory.toLowerCase();
        const skillsText = (creator.skills || []).join(' ').toLowerCase();
        const role = (creator.roleTitle || '').toLowerCase();
        const bio = (creator.bio || '').toLowerCase();
        const servicesText = (creator.services || []).map((s) => `${s.title} ${s.tag || ''}`).join(' ').toLowerCase();
        const fullText = `${skillsText} ${role} ${bio} ${servicesText}`;

        if (cat.includes('brand') && !fullText.includes('brand') && !fullText.includes('logo')) return false;
        if (cat.includes('feed') && !fullText.includes('feed') && !fullText.includes('instagram')) return false;
        if (cat.includes('kemasan') && !fullText.includes('kemasan') && !fullText.includes('packaging') && !fullText.includes('label')) return false;
        if (cat.includes('video') && !fullText.includes('video') && !fullText.includes('ugc') && !fullText.includes('reels') && !fullText.includes('tiktok')) return false;
        if (cat.includes('motion') && !fullText.includes('motion') && !fullText.includes('animasi')) return false;
        if (cat.includes('foto') && !fullText.includes('foto') && !fullText.includes('photo')) return false;
      }

      // Budget filter
      if (selectedBudget !== 'all') {
        const rate = creator.startingRate || 200000;
        if (selectedBudget === 'under250' && rate >= 250000) return false;
        if (selectedBudget === '250to500' && (rate < 250000 || rate > 500000)) return false;
        if (selectedBudget === 'above500' && rate <= 500000) return false;
      }

      // Location filter
      if (selectedLocation !== 'Semua Lokasi') {
        const locLower = selectedLocation.toLowerCase();
        if (!(creator.location || '').toLowerCase().includes(locLower)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (selectedSort === 'score') {
        return (b.careerScore?.overall || 0) - (a.careerScore?.overall || 0);
      }
      if (selectedSort === 'rating') {
        const rateA = Number(a.rating || a.careerScore?.clientRating || 0);
        const rateB = Number(b.rating || b.careerScore?.clientRating || 0);
        return rateB - rateA;
      }
      if (selectedSort === 'projects') {
        const projA = Number(a.reviewCount || a.careerScore?.completedProjects || 0);
        const projB = Number(b.reviewCount || b.careerScore?.completedProjects || 0);
        return projB - projA;
      }
      if (selectedSort === 'rate-asc') {
        return (a.startingRate || 0) - (b.startingRate || 0);
      }
      return 0;
    });

    return list;
  }, [creators, searchQuery, selectedCategory, selectedBudget, selectedLocation, selectedSort]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'Semua Kategori') count++;
    if (selectedBudget !== 'all') count++;
    if (selectedLocation !== 'Semua Lokasi') count++;
    if (selectedSort !== 'score') count++;
    return count;
  }, [searchQuery, selectedCategory, selectedBudget, selectedLocation, selectedSort]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua Kategori');
    setSelectedBudget('all');
    setSelectedLocation('Semua Lokasi');
    setSelectedSort('score');
    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0D0C22]">
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* H1 Page Title & Subtitle Matching Figma node #4474:7603 */}
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[#0D0C22] tracking-tight">
            {t('nav.creators', 'Jelajah Profil Kreator & Talenta Terverifikasi')}
          </h1>
          <p className="text-sm text-[#737373] mt-1.5 max-w-2xl leading-relaxed">
            {t('hero.subtitle', 'Telusuri portofolio karya asli, bandingkan Career Score & performa nyata kreator, dan hubungi langsung.')}
          </p>
        </div>


        {/* Section Heading & Filter Toolbar Matching Figma node #4474:7631 */}
        <div className="pt-4 pb-4 border-t border-[#E5E5E5]/80 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0D0C22]">
              {t('explore.heading', 'Cari Talenta berdasarkan Kategori')}
            </h2>

            {/* Filter Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 relative">
              
              {/* Sliders Icon Filter Button */}
              <button 
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition cursor-pointer shadow-2xs ${
                  openDropdown === 'sort' || selectedSort !== 'score'
                    ? 'border-[#0D0C22] bg-[#0D0C22] text-white'
                    : 'border-[#E5E5E5] bg-white text-[#404040] hover:bg-neutral-50'
                }`}
                title={t('filter.reset', 'Urutkan & Filter')}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown 1: Kategori */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                    selectedCategory !== 'Semua Kategori' 
                      ? 'border-[#0D0C22] text-[#0D0C22] bg-neutral-50' 
                      : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedCategory === 'Semua Kategori' ? t('filter.category', 'Kategori') : getCategoryLabel(selectedCategory)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'kategori' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in max-h-72 overflow-y-auto">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-neutral-50 flex items-center justify-between ${
                          selectedCategory === cat ? 'text-[#155DFC] font-bold bg-blue-50/50' : 'text-neutral-700'
                        }`}
                      >
                        <span>{getCategoryLabel(cat)}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#155DFC]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Budget */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'budget' ? null : 'budget')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                    selectedBudget !== 'all' 
                      ? 'border-[#0D0C22] text-[#0D0C22] bg-neutral-50' 
                      : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedBudget === 'all' 
                      ? t('filter.budget', 'Budget') 
                      : getBudgetLabel(selectedBudget)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'budget' && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {BUDGET_OPTIONS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBudget(b.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-neutral-50 flex items-center justify-between ${
                          selectedBudget === b.id ? 'text-[#155DFC] font-bold bg-blue-50/50' : 'text-neutral-700'
                        }`}
                      >
                        <span>{getBudgetLabel(b.id)}</span>
                        {selectedBudget === b.id && <Check className="w-3.5 h-3.5 text-[#155DFC]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Lokasi */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'lokasi' ? null : 'lokasi')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                    selectedLocation !== 'Semua Lokasi' 
                      ? 'border-[#0D0C22] text-[#0D0C22] bg-neutral-50' 
                      : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedLocation === 'Semua Lokasi' ? t('filter.location', 'Lokasi') : selectedLocation}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'lokasi' && (
                  <div className="absolute right-0 md:left-0 mt-1.5 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in max-h-72 overflow-y-auto">
                    {LOCATION_OPTIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-neutral-50 flex items-center justify-between ${
                          selectedLocation === loc ? 'text-[#155DFC] font-bold bg-blue-50/50' : 'text-neutral-700'
                        }`}
                      >
                        <span>{loc === 'Semua Lokasi' ? t('filter.allLocations', 'Semua Lokasi') : loc}</span>
                        {selectedLocation === loc && <Check className="w-3.5 h-3.5 text-[#155DFC]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Sort (from sliders or click) */}
              {openDropdown === 'sort' && (
                <div className="absolute right-0 mt-1.5 top-10 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                  <div className="px-4 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {t('sort.byTitle', 'Urutkan Berdasarkan')}
                  </div>
                  {[
                    { id: 'score' },
                    { id: 'rating' },
                    { id: 'projects' },
                    { id: 'rate-asc' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSort(s.id as any);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-neutral-50 flex items-center justify-between ${
                        selectedSort === s.id ? 'text-[#155DFC] font-bold bg-blue-50/50' : 'text-neutral-700'
                      }`}
                    >
                      <span>{getSortLabel(s.id)}</span>
                      {selectedSort === s.id && <Check className="w-3.5 h-3.5 text-[#155DFC]" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Reset Button when filters active */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#155DFC] hover:underline font-semibold px-2 py-1 transition cursor-pointer"
                >
                  {t('filter.reset', 'Reset Filter')} ({activeFiltersCount})
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Results Count Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-[#737373]">
            {t('filter.showingCreators', 'Menampilkan {count} kreator terverifikasi').replace('{count}', String(filteredCreators.length))}
          </p>
        </div>

        {/* Creator Cards Vertical List - Cloned from Home Screen */}
        {filteredCreators.length > 0 ? (
          <div className="space-y-6">
            {filteredCreators.map((creator, cIdx) => {
              const isSaved = bookmarkedIds.includes(creator.id);

              return (
                <ScrollReveal
                  key={creator.id}
                  distance={32}
                  delay={Math.min(cIdx * 60, 240)}
                  duration={600}
                >
                  <div
                    id={`creator-card-${creator.id}`}
                    onClick={() => {
                      handleCreatorClick(creator);
                    }}
                    onMouseEnter={() => router.prefetch(`/creator/${creator.id}`)}
                    className={`group bg-white rounded-2xl sm:rounded-3xl border ${
                      loadingCreatorId === creator.id
                        ? 'border-[#155DFC] ring-2 ring-[#155DFC]/20 shadow-md'
                        : 'border-neutral-200/80 hover:border-neutral-300 shadow-xs hover:shadow-md'
                    } p-6 sm:p-8 transition-all cursor-pointer text-left relative`}
                    aria-busy={loadingCreatorId === creator.id}
                  >
                  
                  {/* BARIS 1: Header Profil Kreator, Badges, & Action Buttons */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Identitas Kreator */}
                    <div className="flex items-start sm:items-center gap-4">
                      
                      {/* Avatar Kreator */}
                      <div className="relative shrink-0">
                        <img
                          src={creator.avatar || '/creatorin/avatar.png'}
                          alt={creator.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-neutral-100"
                        />
                        {loadingCreatorId === creator.id && (
                          <div className="absolute inset-0 bg-neutral-900/40 rounded-full flex items-center justify-center text-white backdrop-blur-[1px]">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Detail Nama & Status Promoted */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0d0c22]">
                            {creator.name}
                          </h3>

                          {loadingCreatorId === creator.id && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#155DFC] animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Membuka profil...</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{creator.careerScore?.clientRating ?? '5.0'}</span>
                            <span className="text-neutral-400 font-normal">({creator.careerScore?.completedProjects ?? 88})</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 ml-1">
                            <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[3]" />
                            <span>{t('home.verifiedProjects', '{count} proyek selesai').replace('{count}', String(creator.careerScore?.completedProjects ?? 88))}</span>
                          </div>

                          {creator.isPromoted && (
                            <span className="text-[11px] font-medium text-neutral-400 ml-1">
                              Promoted
                            </span>
                          )}
                        </div>

                        {/* Sub-info Row (Harga, Lokasi, Respon, Layanan) */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mt-2">
                          <span className="font-semibold text-neutral-800">
                            {formatRate(creator)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {creator.location || 'Indonesia'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            {creator.responseTime || t('card.fastResponse', 'Merespons cepat')}
                          </span>
                          <span>•</span>
                          <span>{creator.servicesAvailableCount || (creator.services?.length || 8)} {t('card.servicesAvailable', 'Layanan tersedia')}</span>
                        </div>

                      </div>

                    </div>

                    {/* Sisi Kanan: Bookmark & Tombol "Hubungi" (Get in touch) */}
                    <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                      
                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSave(creator.id, e)}
                        className={`p-2.5 rounded-full border transition cursor-pointer ${
                          isSaved 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
                        }`}
                        title={isSaved ? t('card.removeSave', 'Hapus Simpan') : t('card.saveCreator', 'Simpan Kreator')}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                      </button>

                      {/* Tombol Get in touch */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenBrief(creator, e)}
                        className="h-10 px-5 sm:px-6 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2"
                      >
                        <span>{t('card.contact', 'Hubungi')}</span>
                      </button>

                    </div>

                  </div>

                  {/* Layanan yang benar-benar diterbitkan kreator */}
                  {(() => {
                    const servicesList = (creator.services && creator.services.length > 0)
                      ? creator.services.slice(0, 4)
                      : [
                          {
                            id: `${creator.id}-showcase-1`,
                            tag: 'Brand Identity',
                            title: 'Desain Identitas Brand & Logo UMKM',
                            formattedPrice: 'Rp100.000',
                            deliveryDays: '3 Hari Kerja',
                            coverImage: '/creatorin/service-pattern-1.png',
                          },
                          {
                            id: `${creator.id}-showcase-2`,
                            tag: 'Feed Instagram',
                            title: 'Desain Feed Instagram Aesthetic (9 Grid)',
                            formattedPrice: 'Rp50.000',
                            deliveryDays: '2 Hari Kerja',
                            coverImage: '/creatorin/service-pattern-2.png',
                          },
                          {
                            id: `${creator.id}-showcase-3`,
                            tag: 'Kemasan',
                            title: 'Packaging & Label Design Siap Cetak',
                            formattedPrice: 'Rp70.000',
                            deliveryDays: '3 Hari Kerja',
                            coverImage: '/creatorin/service-pattern-3.png',
                          },
                          {
                            id: `${creator.id}-showcase-4`,
                            tag: 'Banner',
                            title: 'Banner Promo E-Commerce & Marketplace',
                            formattedPrice: 'Rp120.000',
                            deliveryDays: '1 Hari Kerja',
                            coverImage: '/creatorin/service-pattern-4.png',
                          },
                        ];

                    if (!servicesList.length) return null;

                    return (
                      <div className="mt-5 pt-4 border-t border-neutral-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
                          {servicesList.map((service) => {
                            const imageSrc = service.coverImage || '';

                            return (
                              <div
                                key={service.id}
                                id={`service-card-${service.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceClick(service, creator);
                                }}
                                className="group/srv flex flex-col cursor-pointer text-left select-none"
                              >
                                {/* Cover Image Preview (Clean Rounded, No Outer Stroke) */}
                                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-900 relative shadow-2xs group-hover/srv:shadow-md transition-all duration-300">
                                  {imageSrc && <img src={imageSrc} alt={service.title} className="w-full h-full object-cover" loading="lazy" />}
                                  
                                  {service.tag && (
                                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide">
                                      {service.tag}
                                    </div>
                                  )}

                                  <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover/srv:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/srv:translate-y-0">
                                    <span className="bg-white text-[#171717] text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                      <span>Order</span>
                                      <span className="text-blue-600 font-bold">→</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Clean Title & Price Below Image */}
                                <div className="pt-3 px-0.5 space-y-1">
                                  <h4 className="text-[13px] sm:text-[14px] font-bold text-[#171717] group-hover/srv:text-blue-600 transition-colors line-clamp-1 leading-snug">
                                    {service.title}
                                  </h4>

                                  <div className="flex items-center justify-between pt-0.5">
                                    <span className="text-[13px] sm:text-[14px] font-black text-[#171717] tracking-tight">
                                      {language === 'en' ? (service.formattedPrice || '').replace('Rp', 'IDR ') : service.formattedPrice}
                                    </span>
                                    {service.deliveryDays && (
                                      <span className="text-[11px] font-medium text-neutral-400">
                                        {language === 'en' ? service.deliveryDays.replace(/hari kerja/gi, 'Working Days').replace(/hari/gi, 'Days') : service.deliveryDays}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* BARIS 3: Tag Keahlian / Skills */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                    {(creator.skills || []).slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition"
                      >
                        {skill}
                      </span>
                    ))}
                    {creator.skills && creator.skills.length > 5 && (
                      <span className="text-xs font-medium text-neutral-400 hover:text-neutral-700">
                        {t('card.moreSkills', '+{count} keahlian lainnya').replace('{count}', String(creator.skills.length - 5))}
                      </span>
                    )}
                  </div>

                </div>
              </ScrollReveal>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
          <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0D0C22]">{t('empty.creatorsTitle', 'Tidak Ada Kreator yang Sesuai')}</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            {t('empty.creatorsDesc', 'Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat kreator berbakat lainnya.')}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0D0C22] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {t('filter.reset', 'Reset Semua Filter')}
            </button>
          )}
        </div>
      )}

      </main>

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        targetCreator={targetCreatorForBrief}
      />

      {/* Service Detail Modal (Pop up dari bawah) */}
      {selectedServiceForDetail && (
        <ServiceDetailModal
          service={selectedServiceForDetail.service}
          creator={selectedServiceForDetail.creator}
          onClose={() => setSelectedServiceForDetail(null)}
          onOrderService={(srv, cr) => {
            setSelectedServiceForDetail(null);
            if (!currentUser) {
              setAuthModalConfig({
                title: 'Masuk untuk pesan layanan',
                description: 'Masuk ke akun Anda untuk memesan layanan ini.',
                action: () => {
                  router.push(`/chat?creatorId=${cr.id}`);
                },
              });
              setIsAuthModalOpen(true);
              return;
            }
            router.push(`/chat?creatorId=${cr.id}`);
          }}
          onViewCreatorProfile={(cr) => {
            setSelectedServiceForDetail(null);
            if (onViewCreatorProfile) {
              onViewCreatorProfile(cr);
            } else {
              setLoadingCreatorId(cr.id);
              startRouteProgress();
              router.push(`/creator/${cr.id}`);
            }
          }}
          onNavigate={onNavigate}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail((prev) => (prev ? { ...prev, service: newSrv } : null));
          }}
        />
      )}

      {/* Contextual Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
        onSuccess={(loggedUser) => {
          setIsAuthModalOpen(false);
          if (authModalConfig.action) {
            authModalConfig.action(loggedUser);
          }
        }}
      />
    </div>
  );
};
