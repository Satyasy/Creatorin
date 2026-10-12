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
  UserCheck
} from 'lucide-react';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { creatorService } from '@/services/creatorService';
import { DEFAULT_CREATORS } from '@/data/defaultCreators';
import type { Creator, ActivePage, AuthState } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

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
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const [creators, setCreators] = useState<Creator[]>(DEFAULT_CREATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [selectedSort, setSelectedSort] = useState<'score' | 'rating' | 'projects' | 'rate-asc'>('score');
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'budget' | 'lokasi' | 'sort' | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Modals
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | null>(null);

  useEffect(() => {
    creatorService
      .getCreators()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          // Merge with DEFAULT_CREATORS so top Figma mock creator Qaesyaar Aqeel is always available
          const existingIds = new Set(fetched.map((c) => c.id));
          const combined = [
            ...DEFAULT_CREATORS.filter((dc) => !existingIds.has(dc.id)),
            ...fetched
          ];
          setCreators(combined);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_CREATORS
      });
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
            Jelajah Profil Kreator & Talenta Terverifikasi
          </h1>
          <p className="text-sm text-[#737373] mt-1.5 max-w-2xl leading-relaxed">
            Telusuri portofolio karya asli, bandingkan Career Score & performa nyata kreator, dan hubungi langsung.
          </p>
        </div>


        {/* Section Heading & Filter Toolbar Matching Figma node #4474:7631 */}
        <div className="pt-4 pb-4 border-t border-[#E5E5E5]/80 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0D0C22]">
              Cari Talenta berdasarkan Kategori
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
                title="Urutkan & Filter"
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
                  <span>{selectedCategory === 'Semua Kategori' ? 'Kategori' : selectedCategory}</span>
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
                        <span>{cat}</span>
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
                      ? 'Budget' 
                      : BUDGET_OPTIONS.find((b) => b.id === selectedBudget)?.label || 'Budget'}
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
                        <span>{b.label}</span>
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
                  <span>{selectedLocation === 'Semua Lokasi' ? 'Lokasi' : selectedLocation}</span>
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
                        <span>{loc}</span>
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
                    Urutkan Berdasarkan
                  </div>
                  {[
                    { id: 'score', label: 'Skor Karir Tertinggi' },
                    { id: 'rating', label: 'Rating Tertinggi' },
                    { id: 'projects', label: 'Proyek Terbanyak' },
                    { id: 'rate-asc', label: 'Tarif Terendah' },
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
                      <span>{s.label}</span>
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
                  Reset Filter ({activeFiltersCount})
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Results Count Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-[#737373]">
            Menampilkan <span className="font-bold text-[#0D0C22]">{filteredCreators.length}</span> profil kreator terverifikasi
          </p>
        </div>

        {/* Creator Cards Vertical List Matching Figma node #4785:762 */}
        {filteredCreators.length > 0 ? (
          <div className="space-y-6">
            {filteredCreators.map((creator) => {
              const ratingVal =
                Number(creator.rating || 0) > 0
                  ? Number(creator.rating).toFixed(1)
                  : creator.careerScore?.clientRating
                  ? Number(creator.careerScore.clientRating).toFixed(1)
                  : '5.0';
              const reviewsCount = creator.reviewCount ?? creator.careerScore?.completedProjects ?? 88;
              const completedCount = creator.careerScore?.completedProjects ?? reviewsCount ?? 88;
              const isBookmarked = bookmarkedIds.includes(creator.id);

              // 4 Showcase items for this creator
              interface CreatorShowcaseItem {
                id: string;
                tag: string;
                title: string;
                price: string;
                deliveryDays: string;
                image: string;
                serviceId?: string;
              }

              const showcaseItems: CreatorShowcaseItem[] = (creator.services && creator.services.length >= 4)
                ? creator.services.slice(0, 4).map((s) => ({
                    id: s.id,
                    tag: s.tag || 'Layanan Unggulan',
                    title: s.title,
                    price: s.formattedPrice || `Rp${(s.price || 100000).toLocaleString('id-ID')}`,
                    deliveryDays: s.deliveryDays || '3 Hari Kerja',
                    image: s.coverImage || '/creatorin/service-pattern-1.png',
                    serviceId: s.id,
                  }))
                : [
                    {
                      id: `${creator.id}-showcase-1`,
                      tag: 'Brand Identity',
                      title: 'Desain Identitas Brand & Logo UMKM',
                      price: 'Rp100.000',
                      deliveryDays: '3 Hari Kerja',
                      image: '/creatorin/service-pattern-1.png',
                    },
                    {
                      id: `${creator.id}-showcase-2`,
                      tag: 'Feed Instagram',
                      title: 'Desain Feed Instagram Aesthetic (9 Grid)',
                      price: 'Rp50.000',
                      deliveryDays: '2 Hari Kerja',
                      image: '/creatorin/service-pattern-2.png',
                    },
                    {
                      id: `${creator.id}-showcase-3`,
                      tag: 'Kemasan',
                      title: 'Packaging & Label Design Siap Cetak',
                      price: 'Rp70.000',
                      deliveryDays: '3 Hari Kerja',
                      image: '/creatorin/service-pattern-3.png',
                    },
                    {
                      id: `${creator.id}-showcase-4`,
                      tag: 'Banner',
                      title: 'Banner Promo E-Commerce & Marketplace',
                      price: 'Rp120.000',
                      deliveryDays: '1 Hari Kerja',
                      image: '/creatorin/service-pattern-4.png',
                    },
                  ];

              return (
                <article
                  key={creator.id}
                  className="rounded-[24px] border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  {/* Top Row: Avatar + Info + CTAs */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      
                      {/* Avatar with Verified Checkmark */}
                      <div className="relative shrink-0">
                        <img
                          src={creator.avatar || '/creatorin/avatar.png'}
                          alt={creator.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-[#F5F5F5]"
                        />
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0D0C22] ring-2 ring-white text-white flex items-center justify-center shadow-xs"
                          title="Kreator Terverifikasi"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      {/* Info: Name, Ratings, Completed, Promoted, Rates */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/creator/${creator.id}`}
                            className="text-lg sm:text-xl font-bold text-[#0D0C22] hover:text-[#155DFC] transition-colors truncate"
                          >
                            {creator.name}
                          </Link>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 text-xs font-bold text-[#262626]">
                            <Star className="w-3.5 h-3.5 fill-[#EAB308] text-[#EAB308]" />
                            <span>{ratingVal}</span>
                            <span className="font-normal text-[#A1A1A1]">({reviewsCount})</span>
                          </div>

                          {/* Proyek Selesai */}
                          <div className="flex items-center gap-1 text-xs font-semibold text-[#404040]">
                            <Check className="w-3.5 h-3.5 text-[#404040]" />
                            <span>{completedCount} proyek selesai</span>
                          </div>

                          {/* Promoted Pill */}
                          <span className="text-[11px] font-medium text-[#A1A1A1] px-2 py-0.5 rounded-full bg-[#F5F5F5]">
                            Promoted
                          </span>
                        </div>

                        {/* Sub Info Line */}
                        <div className="mt-1.5 flex items-center gap-2.5 sm:gap-3 text-xs text-[#737373] flex-wrap">
                          <span className="font-semibold text-[#262626]">
                            Mulai {creator.formattedRate || `Rp${(creator.startingRate || 200000).toLocaleString('id-ID')}`}/proyek
                          </span>
                          <span className="text-neutral-300">•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#737373]" />
                            <span>{creator.location || 'Indonesia'}</span>
                          </span>
                          <span className="text-neutral-300">•</span>
                          <span>
                            <strong className="font-black text-[#0D0C22]">{creator.careerScore?.overall ?? 95}%</strong> Skor Karir
                          </span>
                          <span className="text-neutral-300">•</span>
                          <span>
                            {creator.servicesAvailableCount || (creator.services?.length ? creator.services.length : 10)} Layanan tersedia
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                      
                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(creator.id)}
                        className={`w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-neutral-100 text-[#0D0C22]'
                            : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        }`}
                        title="Simpan Kreator"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>

                      {/* Hubungi Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetCreatorForBrief(creator);
                          setIsBriefModalOpen(true);
                        }}
                        className="px-6 py-2.5 rounded-full bg-[#0D0C22] hover:bg-[#1a1936] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        Hubungi
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: 4-Item Showcase Grid */}
                  <div className="border-t border-[#F5F5F5] pt-4 mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {showcaseItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.serviceId) {
                            router.push(`/jelajah/layanan?serviceId=${item.serviceId}`);
                          } else {
                            setTargetCreatorForBrief(creator);
                            setIsBriefModalOpen(true);
                          }
                        }}
                        className="group/item flex flex-col cursor-pointer"
                      >
                        <div className="aspect-[16/11] rounded-[16px] overflow-hidden relative bg-[#171717]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                          />
                          {item.tag && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#0D0C22] line-clamp-1 group-hover/item:text-[#155DFC] transition-colors mt-2.5">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-sm font-bold text-[#0D0C22]">
                            {item.price}
                          </span>
                          <span className="text-xs text-[#737373]">
                            {item.deliveryDays}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row: Skill Tags */}
                  <div className="border-t border-[#F5F5F5] pt-4 mt-5 flex items-center gap-2 flex-wrap">
                    {(creator.skills || ['Brand Identity', 'Product Photography', 'Packaging', 'Social Media Feed', 'UI Mockups']).slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-[#F5F5F5] hover:bg-[#EDEDED] rounded-full text-xs font-medium text-[#404040] transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                    {creator.skills && creator.skills.length > 5 && (
                      <span className="text-[#A1A1A1] text-xs font-medium">
                        +{creator.skills.length - 5} keahlian lainnya
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/10 p-12 text-center max-w-lg mx-auto">
            <UserCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0D0C22]">Tidak Ada Kreator yang Cocok</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Coba gunakan kata kunci lain, pilih kategori umum, atau bersihkan filter pencarian.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0D0C22] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </main>

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        targetCreator={targetCreatorForBrief}
      />
    </div>
  );
};
