'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useToast } from '@/providers/ToastProvider';
import { creatorService } from '@/services/creatorService';
import { Creator, CreatorCategory, CreatorService, AuthState, ActivePage } from '@/types';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { 
  Star, 
  Check, 
  MapPin, 
  Clock, 
  Layers, 
  SlidersHorizontal, 
  ChevronDown, 
  Bookmark, 
  Send, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Filter,
  Eye,
  Heart,
  Share2,
  User,
  Package
} from 'lucide-react';

interface LandingPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

const POPULAR_TAGS = [
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

export const LandingPage: React.FC<LandingPageProps> = ({ currentUser: propUser, onSignOut, onNavigate, onViewCreatorProfile }) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Semua') return t('filter.category', 'Kategori');
    if (language !== 'en') return cat;
    const map: Record<string, string> = {
      'Reels Instagram': 'Instagram Reels',
      'Video Tiktok': 'TikTok Video',
      'Feed Instagram': 'Instagram Feed',
      'Poster': 'Poster',
      'Banner': 'Promo Banner',
      'Brosur': 'Brochure & Catalog',
      'Logo': 'Logo & Branding',
      'Foto Produk': 'Product Photography',
      'UI/UX Design': 'UI/UX Design'
    };
    return map[cat] || cat;
  };

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) onNavigate(page);
    else router.push(path);
  };

  const handleCreatorClick = (creator: Creator) => {
    if (onViewCreatorProfile) onViewCreatorProfile(creator);
    else router.push(`/creator/${creator.id}`);
  };
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBudget, setSelectedBudget] = useState<string>('Semua');
  const [selectedLocation, setSelectedLocation] = useState<string>('Semua');
  const [selectedScore, setSelectedScore] = useState<string>('Semua');
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Saved Creators set
  const [savedCreators, setSavedCreators] = useState<Set<string>>(new Set());
  const [creators, setCreators] = useState<Creator[]>([]);
  useEffect(() => { creatorService.getCreators().then(setCreators).catch(() => setCreators([])); }, []);

  // Modals state
  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<Creator | null>(null);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<{
    service: CreatorService;
    creator: Creator;
  } | null>(null);

  // Toggle Save Creator (Guarded with Toast Notification)
  const toggleSave = (id: string, e: React.MouseEvent) => {
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
    setSavedCreators(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open Brief Modal
  const handleOpenBrief = (creator?: Creator, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetCreatorForBrief(creator || null);
    setIsBriefModalOpen(true);
  };

  // Open Service Detail Modal
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

  // Filtered Creators list
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      // Search input filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (creator.name?.toLowerCase() || '').includes(q);
        const matchesSkills = (creator.skills || []).some(s => (s?.toLowerCase() || '').includes(q));
        const matchesRole = (creator.roleTitle?.toLowerCase() || '').includes(q);
        const matchesLoc = (creator.location?.toLowerCase() || '').includes(q);
        if (!matchesName && !matchesSkills && !matchesRole && !matchesLoc) return false;
      }

      // Tag filter
      if (selectedTag) {
        const rawTag = selectedTag.toLowerCase().replace('#', '');
        
        // Flexible keyword matching for hashtags commonly used by UMKM and nano/micro creators
        const tagKeywords: Record<string, string[]> = {
          'kuliner': ['kuliner', 'fnb', 'makanan', 'food', 'minuman', 'cafe', 'resto', 'beauty', 'e-commerce'],
          'tiktokviral': ['tiktok', 'tiktok ugc', 'video', 'capcut', 'viral', 'reels'],
          'instagramreels': ['reels', 'instagram reels', 'short reels', 'video', 'ig', 'instagram'],
          'reviewproduk': ['review', 'ugc', 'unboxing', 'product showcase', 'voiceover', 'video', 'product'],
          'desainposter': ['poster', 'desain', 'photoshop', 'canva', 'banner', 'grafis', 'branding'],
          'fotoproduk': ['foto produk', 'product photography', 'product showcase', 'katalog', 'flatlay', 'image'],
          'feedinstagram': ['feed', 'social media feed', 'canva', 'photoshop', 'branding', 'carousel'],
          'logoumkm': ['logo', 'brand identity', 'branding', 'redesign', 'identitas'],
          'bannerpromo': ['banner', 'banner e-commerce', 'marketing', 'poster', 'diskon', 'promo']
        };

        const keywords = tagKeywords[rawTag] || [rawTag];
        const matchesSkill = (creator.skills || []).some(s => keywords.some(k => (s?.toLowerCase() || '').includes(k)));
        const matchesCat = keywords.some(k => (creator.category?.toLowerCase() || '').includes(k));
        const matchesRole = keywords.some(k => (creator.roleTitle?.toLowerCase() || '').includes(k));
        const matchesBio = keywords.some(k => (creator.bio?.toLowerCase() || '').includes(k));
        const matchesPortfolio = creator.portfolioSamples?.some(p => keywords.some(k => (p.categoryTag?.toLowerCase() || '').includes(k) || (p.title?.toLowerCase() || '').includes(k)));
        
        if (!matchesSkill && !matchesCat && !matchesRole && !matchesBio && !matchesPortfolio) return false;
      }

      // Category filter
      if (selectedCategory !== 'Semua') {
        const cat = selectedCategory.toLowerCase();
        const catKeywords: Record<string, string[]> = {
          'reels instagram': ['reels', 'instagram reels', 'short reels', 'video'],
          'video tiktok': ['tiktok', 'tiktok ugc', 'video', 'capcut'],
          'feed instagram': ['feed', 'social media feed', 'desain feed', 'canva', 'photoshop', 'branding'],
          'poster': ['poster', 'brand identity', 'ui mockups', 'packaging', 'banner'],
          'banner': ['banner', 'banner e-commerce', 'marketing', 'design'],
          'brosur': ['brosur', 'brochure', 'marketing', 'packaging', 'brand identity', 'catalog'],
          'logo': ['logo', 'brand identity', 'branding', 'redesign'],
          'foto produk': ['foto produk', 'product photography', 'product showcase', 'catalog shoot', 'flatlay']
        };

        const keywords = catKeywords[cat] || [cat];
        const matchesSkill = (creator.skills || []).some(s => keywords.some(k => (s?.toLowerCase() || '').includes(k)));
        const matchesCat = keywords.some(k => (creator.category?.toLowerCase() || '').includes(k));
        const matchesRole = keywords.some(k => (creator.roleTitle?.toLowerCase() || '').includes(k));
        const matchesBio = keywords.some(k => (creator.bio?.toLowerCase() || '').includes(k));
        const matchesPortfolio = creator.portfolioSamples?.some(p => keywords.some(k => (p.categoryTag?.toLowerCase() || '').includes(k) || (p.title?.toLowerCase() || '').includes(k)));
        
        if (!matchesSkill && !matchesCat && !matchesRole && !matchesBio && !matchesPortfolio) return false;
      }

      // Budget filter
      if (selectedBudget === 'under500' && creator.startingRate > 500000) return false;
      if (selectedBudget === 'mid' && (creator.startingRate <= 500000 || creator.startingRate > 1500000)) return false;
      if (selectedBudget === 'high' && creator.startingRate <= 1500000) return false;

      // Location filter
      if (selectedLocation !== 'Semua' && !creator.location.includes(selectedLocation)) {
        return false;
      }

      // Score filter
      if (selectedScore === '95+' && creator.careerScore.overall < 95) return false;
      if (selectedScore === '90+' && creator.careerScore.overall < 90) return false;

      return true;
    });
  }, [searchQuery, selectedTag, selectedCategory, selectedBudget, selectedLocation, selectedScore, creators]);

  return (
    <div className="w-full bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#0B1F3A] selection:text-white text-[#171717]">
      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Sub-Navigation Switcher Tabs for UMKM Jelajah */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 overflow-x-auto no-scrollbar">
          <Link
            href="/jelajah/kreator"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all bg-[#F4F5F7] text-[#0D0C22] shadow-xs ring-1 ring-black/5 font-bold"
          >
            <User className="w-4 h-4 text-inherit" />
            <span>{t('tabs.creators', 'Creator')}</span>
          </Link>

          <Link
            href="/jelajah/layanan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]"
          >
            <Package className="w-4 h-4 text-inherit" />
            <span>{t('tabs.services', 'Layanan')}</span>
          </Link>

          <Link
            href="/jelajah/proyek"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]"
          >
            <Layers className="w-4 h-4 text-inherit" />
            <span>{t('tabs.projects', 'Proyek')}</span>
          </Link>
        </div>

        {/* Section Heading: Cari Talenta Berdasarkan Kategori & Filter Toolbar */}
        <div className="pt-4 pb-4 border-t border-[#E2E8F0]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
              {t('explore.heading', 'Cari Talenta berdasarkan Kategori')}
            </h2>

            {/* Filter Buttons Group (Dribbble Toolbar) */}
            <div className="flex flex-wrap items-center gap-2 relative">
              
              {/* Filter Icon Button */}
              <button 
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedBudget('Semua');
                  setSelectedLocation('Semua');
                  setSelectedScore('Semua');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition cursor-pointer"
                title={t('filter.reset', 'Reset Semua Filter')}
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
                  <span>{selectedCategory === 'Semua' ? t('filter.category', 'Kategori') : getCategoryLabel(selectedCategory)}</span>
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
                          selectedCategory === cat ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{cat === 'Semua' ? t('filter.all', 'Semua') : getCategoryLabel(cat)}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
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
                    selectedBudget !== 'Semua' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedBudget === 'Semua' 
                      ? t('filter.budget', 'Budget') 
                      : selectedBudget === 'under500' 
                        ? (language === 'en' ? '< IDR 500k' : '< Rp500rb') 
                        : selectedBudget === 'mid' 
                          ? (language === 'en' ? 'IDR 500k - 1.5M' : 'Rp500rb - Rp1.5jt') 
                          : (language === 'en' ? '> IDR 1.5M' : '> Rp1.5jt')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'budget' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: t('filter.allBudget', 'Semua Budget'), val: 'Semua' },
                      { label: t('filter.under500k', 'Di bawah Rp500.000'), val: 'under500' },
                      { label: t('filter.midBudget', 'Rp500.000 - Rp1.500.000'), val: 'mid' },
                      { label: t('filter.highBudget', 'Di atas Rp1.500.000'), val: 'high' }
                    ].map((b) => (
                      <button
                        key={b.val}
                        onClick={() => {
                          setSelectedBudget(b.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedBudget === b.val ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{b.label}</span>
                        {selectedBudget === b.val && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Lokasi */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'lokasi' ? null : 'lokasi')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedLocation !== 'Semua' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedLocation === 'Semua' ? t('filter.location', 'Lokasi') : selectedLocation}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'lokasi' && (
                  <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {['Semua', 'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedLocation === loc ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{loc === 'Semua' ? t('filter.all', 'Semua') : loc}</span>
                        {selectedLocation === loc && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Career Score */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedScore !== 'Semua' ? 'border-[#0B1F3A] text-[#0B1F3A] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedScore === 'Semua' ? t('filter.rating', 'Rating / Score') : `Score ${selectedScore}`}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'rating' && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: t('filter.allScores', 'Semua Skor'), val: 'Semua' },
                      { label: t('filter.topTier', 'Score 95+ (Top Tier)'), val: '95+' },
                      { label: t('filter.risingStar', 'Score 90+ (Rising Star)'), val: '90+' }
                    ].map((s) => (
                      <button
                        key={s.val}
                        onClick={() => {
                          setSelectedScore(s.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedScore === s.val ? 'font-bold text-[#0B1F3A]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {selectedScore === s.val && <Check className="w-3.5 h-3.5 text-[#0B1F3A]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Results Counter & Notification */}
        <div className="text-xs font-medium text-neutral-400 mb-6 flex items-center justify-between">
          <span>{t('filter.showingCreators', 'Menampilkan {count} kreator terverifikasi').replace('{count}', String(filteredCreators.length))}</span>
          {(selectedCategory !== 'Semua' || selectedBudget !== 'Semua' || selectedLocation !== 'Semua' || selectedScore !== 'Semua' || selectedTag || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSelectedBudget('Semua');
                setSelectedLocation('Semua');
                setSelectedScore('Semua');
                setSelectedTag(null);
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              {t('filter.clearAll', 'Hapus semua filter')}
            </button>
          )}
        </div>

        {/* LIST KREATOR: TAMPILAN SHOWCASE CARD ALA DRIBBBLE (Persis Gambar Uploaded) */}
        <div className="space-y-6">
          {filteredCreators.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
              <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#0d0c22]">{t('empty.creatorsTitle', 'Tidak Ada Kreator yang Sesuai')}</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                {t('empty.creatorsDesc', 'Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat kreator berbakat lainnya.')}
              </p>
            </div>
          ) : (
            filteredCreators.map((creator, cIdx) => {
              const isSaved = savedCreators.has(creator.id);

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
                    className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 hover:border-neutral-300 p-6 sm:p-8 transition-all shadow-xs hover:shadow-md cursor-pointer text-left"
                  >
                  
                  {/* BARIS 1: Header Profil Kreator, Badges, & Action Buttons */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Identitas Kreator */}
                    <div className="flex items-start sm:items-center gap-4">
                      
                      {/* Avatar Kreator */}
                      <div className="relative shrink-0">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-neutral-100"
                        />
                      </div>

                      {/* Detail Nama & Status Promoted */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0d0c22]">
                            {creator.name}
                          </h3>

                          <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{creator.careerScore.clientRating}</span>
                            <span className="text-neutral-400 font-normal">({creator.careerScore.completedProjects})</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 ml-1">
                            <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[3]" />
                            <span>{t('card.completedProjects', '{count} proyek selesai').replace('{count}', String(creator.careerScore.completedProjects))}</span>
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
                            {t('card.startingFrom', 'Mulai')} {language === 'en' ? creator.formattedRate.replace('Rp', 'IDR ') : creator.formattedRate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {creator.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            {creator.responseTime || t('card.fastResponse', 'Merespons cepat')}
                          </span>
                          <span>•</span>
                          <span>{creator.servicesAvailableCount || 8} {t('card.servicesAvailable', 'Layanan tersedia')}</span>
                        </div>

                      </div>

                    </div>

                    {/* Sisi Kanan: Bookmark & Tombol "Hubungi" (Get in touch) */}
                    <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                      
                      {/* Save Button */}
                      <button
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
                        onClick={(e) => handleOpenBrief(creator, e)}
                        className="h-10 px-5 sm:px-6 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2"
                      >
                        <span>{t('card.contact', 'Hubungi')}</span>
                      </button>

                    </div>

                  </div>

                  {/* Layanan yang benar-benar diterbitkan kreator */}
                  {(() => {
                    const servicesList = creator.services?.slice(0, 4) || [];

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
                                      {language === 'en' ? service.formattedPrice.replace('Rp', 'IDR ') : service.formattedPrice}
                                    </span>
                                    {service.deliveryDays && (
                                      <span className="text-[11px] font-medium text-neutral-400">
                                        {language === 'en' ? service.deliveryDays.replace('Hari Kerja', 'Working Days') : service.deliveryDays}
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
                    {creator.skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition"
                      >
                        {skill}
                      </span>
                    ))}
                    {creator.skills.length > 5 && (
                      <span className="text-xs font-medium text-neutral-400 hover:text-neutral-700">
                        {t('card.moreSkills', '+{count} keahlian lainnya').replace('{count}', String(creator.skills.length - 5))}
                      </span>
                    )}
                  </div>

                </div>
              </ScrollReveal>
            );
            })
          )}
        </div>

      </main>

      {/* Modal Profile Detail Kreator */}
      <ProfileModal
        creator={selectedCreatorForModal}
        onClose={() => setSelectedCreatorForModal(null)}
        onInitiateProject={(c) => handleOpenBrief(c)}
      />

      {/* Modal Buat Brief Proyek */}
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
            router.push(`/chat?creatorId=${cr.id}`);
          }}
          onViewCreatorProfile={(cr) => {
            setSelectedServiceForDetail(null);
            if (onViewCreatorProfile) {
              onViewCreatorProfile(cr);
            } else {
              router.push(`/creator/${cr.id}`);
            }
          }}
          onNavigate={onNavigate}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail((prev) => (prev ? { ...prev, service: newSrv } : null));
          }}
        />
      )}

    </div>
  );
};
