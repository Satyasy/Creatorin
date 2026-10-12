'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Star, 
  Check, 
  ArrowUpRight, 
  Sparkles, 
  SlidersHorizontal, 
  Briefcase, 
  TrendingUp, 
  UserCheck, 
  X,
  MessageSquare,
  ShieldCheck,
  User,
  Package,
  Layers
} from 'lucide-react';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ScrollReveal } from '@/components/common/ScrollReveal';
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

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'video', label: 'Video & UGC' },
  { id: 'design', label: 'Desain Grafis' },
  { id: 'photo', label: 'Foto Produk' },
  { id: 'branding', label: 'Logo & Branding' },
  { id: 'motion', label: 'Animasi & Motion' },
];

const LOCATION_OPTIONS = [
  'Semua Lokasi',
  'Jakarta Selatan',
  'Bandung',
  'Surabaya',
  'Yogyakarta',
  'Bali',
  'Semarang',
];

export const JelajahKreatorPage: React.FC<JelajahKreatorPageProps> = ({
  currentUser: propUser,
  onNavigate,
  onViewCreatorProfile,
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const [creators, setCreators] = useState<Creator[]>(DEFAULT_CREATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [selectedSort, setSelectedSort] = useState<'score' | 'rating' | 'projects' | 'rate-asc'>('score');
  const [minRating, setMinRating] = useState<number>(0);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | null>(null);

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

  const navigateTo = (page: ActivePage, path?: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (path) {
      router.push(path);
    }
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
          (creator.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesQ) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = selectedCategory.toLowerCase();
        const skillsText = (creator.skills || []).join(' ').toLowerCase();
        const role = (creator.roleTitle || '').toLowerCase();
        const bio = (creator.bio || '').toLowerCase();
        const fullText = `${skillsText} ${role} ${bio}`;

        if (cat === 'video' && !fullText.includes('video') && !fullText.includes('ugc') && !fullText.includes('reels') && !fullText.includes('tiktok')) {
          return false;
        }
        if (cat === 'design' && !fullText.includes('desain') && !fullText.includes('design') && !fullText.includes('feed') && !fullText.includes('poster')) {
          return false;
        }
        if (cat === 'photo' && !fullText.includes('foto') && !fullText.includes('photo')) {
          return false;
        }
        if (cat === 'branding' && !fullText.includes('logo') && !fullText.includes('brand')) {
          return false;
        }
        if (cat === 'motion' && !fullText.includes('motion') && !fullText.includes('animasi')) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation !== 'Semua Lokasi') {
        const locLower = selectedLocation.toLowerCase();
        if (!(creator.location || '').toLowerCase().includes(locLower)) {
          return false;
        }
      }

      // Rating filter
      const rating = Number(creator.rating || creator.careerScore?.clientRating || 0);
      if (minRating > 0 && rating < minRating) {
        return false;
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
  }, [creators, searchQuery, selectedCategory, selectedLocation, selectedSort, minRating]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('Semua Lokasi');
    setSelectedSort('score');
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0D0C22]">
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Sub-Navigation Switcher Tabs for UMKM Jelajah */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 overflow-x-auto no-scrollbar">
          <Link
            href="/jelajah/kreator"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all bg-[#F4F5F7] text-[#0D0C22] shadow-xs ring-1 ring-black/5 font-bold"
          >
            <User className="w-4 h-4 text-inherit" />
            <span>Creator</span>
          </Link>

          <Link
            href="/jelajah/layanan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]"
          >
            <Package className="w-4 h-4 text-inherit" />
            <span>Layanan</span>
          </Link>

          <Link
            href="/jelajah/proyek"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]"
          >
            <Layers className="w-4 h-4 text-inherit" />
            <span>Proyek</span>
          </Link>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl border border-black/10 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kreator, username, skill, atau kota..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#F8F9FA] rounded-xl text-xs sm:text-sm text-[#0D0C22] placeholder:text-neutral-400 border border-transparent focus:border-[#155DFC] focus:bg-white outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Lokasi Dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F8F9FA] rounded-xl text-xs sm:text-sm font-medium text-[#0D0C22] border border-black/5 hover:border-black/15 outline-none cursor-pointer"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Sorting Dropdown */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="px-3.5 py-2.5 bg-[#F8F9FA] rounded-xl text-xs sm:text-sm font-medium text-[#0D0C22] border border-black/5 hover:border-black/15 outline-none cursor-pointer"
            >
              <option value="score">Urutkan: Skor Karir</option>
              <option value="rating">Urutkan: Rating Tertinggi</option>
              <option value="projects">Urutkan: Proyek Terbanyak</option>
              <option value="rate-asc">Urutkan: Tarif Terendah</option>
            </select>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3.5 py-2.5 bg-[#F8F9FA] rounded-xl text-xs sm:text-sm font-medium text-[#0D0C22] border border-black/5 hover:border-black/15 outline-none cursor-pointer"
            >
              <option value={0}>Semua Rating</option>
              <option value={4.8}>⭐ 4.8 Ke Atas</option>
              <option value={4.5}>⭐ 4.5 Ke Atas</option>
            </select>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-black/5">
            <span className="text-xs font-semibold text-neutral-400 mr-1">Kategori:</span>
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0D0C22] text-white font-semibold'
                      : 'bg-[#F3F3F4] text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}

            {(searchQuery || selectedCategory !== 'all' || selectedLocation !== 'Semua Lokasi' || minRating > 0) && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#155DFC] font-semibold hover:underline ml-auto cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* Result Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#55576A]">
            Menampilkan <span className="font-bold text-[#0D0C22]">{filteredCreators.length}</span> profil kreator siap kerja
          </p>
        </div>

        {/* Creator Cards Grid */}
        {filteredCreators.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCreators.map((creator) => {
              const username = creator.handle
                ? creator.handle
                : creator.username
                ? `@${creator.username}`
                : `@${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
              const ratingVal =
                Number(creator.rating || 0) > 0
                  ? Number(creator.rating).toFixed(1)
                  : creator.careerScore?.clientRating
                  ? Number(creator.careerScore.clientRating).toFixed(1)
                  : '5.0';
              const reviewsCount = creator.reviewCount ?? creator.careerScore?.completedProjects ?? 0;
              const completedCount = creator.careerScore?.completedProjects ?? reviewsCount ?? 0;

              return (
                <article
                  key={creator.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-xs hover:shadow-xl hover:border-[#155DFC]/50 hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    {/* Header: Avatar, Nama, Username, Rating */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        {creator.avatar ? (
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-black/5 group-hover:ring-[#155DFC]/40 transition-all"
                          />
                        ) : (
                          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-[#155DFC] to-[#60A5FA] text-xl font-bold text-white ring-2 ring-black/5">
                            {creator.name?.charAt(0)?.toUpperCase() || 'K'}
                          </div>
                        )}
                        {creator.careerScore?.overall >= 90 && (
                          <span
                            className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#155DFC] text-white ring-2 ring-white"
                            title="Top Rated Creator"
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/creator/${creator.id}`}
                            className="truncate text-base sm:text-lg font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors"
                          >
                            {creator.name}
                          </Link>
                          {creator.proBadge && (
                            <span className="shrink-0 rounded bg-[#0D0C22] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                              PRO
                            </span>
                          )}
                        </div>

                        <p className="truncate text-xs font-medium text-neutral-500 mt-0.5">
                          {username}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#0D0C22]">
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                            <span>{ratingVal}</span>
                          </span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-500 font-normal">
                            {completedCount} proyek selesai
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Title */}
                    {creator.roleTitle && (
                      <p className="mt-3.5 text-xs font-bold text-[#155DFC]">
                        {creator.roleTitle}
                      </p>
                    )}

                    {/* Bio */}
                    <p className="mt-2 text-xs leading-relaxed text-neutral-600 line-clamp-2">
                      {creator.bio ||
                        'Kreator terverifikasi di Creatorin dengan rekam jejak terpercaya untuk produksi visual, video, dan desain bisnismu.'}
                    </p>

                    {/* Career Score & Tier Pill */}
                    <div className="mt-3.5 flex items-center justify-between bg-[#F8F9FA] rounded-xl px-3 py-2 border border-black/5">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-neutral-400">Skor Karir</p>
                        <p className="text-xs font-extrabold text-[#0D0C22]">
                          {creator.careerScore?.overall ?? 90}/100
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#155DFC]">
                        {creator.careerScore?.tier || 'Top Tier'}
                      </span>
                    </div>

                    {/* Skills Tags */}
                    {creator.skills && creator.skills.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {creator.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-6 pt-4 border-t border-black/5">
                    <div className="flex items-center justify-between text-xs mb-3.5">
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                        {creator.location || 'Indonesia'}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 block">Mulai dari</span>
                        <span className="font-bold text-[#0D0C22] text-sm">
                          {creator.formattedRate || `Rp${(creator.startingRate || 200000).toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => router.push(`/chat?creatorId=${creator.id}`)}
                        className="h-9 px-3 rounded-xl border border-black/10 bg-white hover:bg-neutral-50 text-xs font-semibold text-[#0D0C22] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Hubungi</span>
                      </button>

                      <Link
                        href={`/creator/${creator.id}`}
                        className="h-9 px-3 rounded-xl bg-[#0D0C22] hover:bg-[#201E3D] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Lihat Profil</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
              className="mt-4 px-4 py-2 rounded-xl bg-[#0D0C22] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
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
