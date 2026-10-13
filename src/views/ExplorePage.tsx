'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, MapPin, Search, Star, Video, X } from 'lucide-react';
import { businessService } from '@/services/businessService';
import { creatorService } from '@/services/creatorService';
import { useLanguage } from '@/providers/LanguageProvider';
import type { Creator, UMKMProfile } from '@/types';

import { DEFAULT_CREATORS } from '@/data/defaultCreators';

type ExploreTab = 'video' | 'umkm' | 'creator';

export function ExplorePage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ExploreTab>('video');
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState<UMKMProfile[]>([]);
  const [videoPosts, setVideoPosts] = useState<
    Array<{
      id: string;
      title: string;
      categoryTag: string;
      thumbnail: string;
      views: string;
      creator: { id: string; name: string; avatar: string; roleTitle: string };
    }>
  >([]);
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    // Check initial tab from URL search params if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'creator' || tabParam === 'kreator') {
        setActiveTab('creator');
      } else if (tabParam === 'umkm') {
        setActiveTab('umkm');
      } else if (tabParam === 'video') {
        setActiveTab('video');
      }
    }

    businessService.getBusinesses().then(setBusinesses).catch(() => setBusinesses([]));
    creatorService
      .getFeedProjects()
      .then((projects) =>
        setVideoPosts(
          projects
            .filter((project) => project.mediaType === 'video')
            .map((project) => ({
              id: project.id,
              title: project.title,
              categoryTag: project.category,
              thumbnail: project.mediaUrl || '',
              views: project.viewsCount,
              creator: project.creator,
            }))
        )
      )
      .catch(() => setVideoPosts([]));

    creatorService
      .getCreators()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          setCreators(fetched);
        }
      })
      .catch(() => {
        // Keep default creators on error
      });
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleBusinesses = useMemo(
    () =>
      businesses.filter((business) =>
        [business.brandName, business.industry, business.category, business.location]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, businesses]
  );

  const visibleVideos = useMemo(
    () =>
      videoPosts.filter(({ title, categoryTag, creator }) =>
        [title, categoryTag, creator.name, creator.roleTitle]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, videoPosts]
  );

  const visibleCreators = useMemo(
    () =>
      creators.filter((creator) =>
        [
          creator.name,
          creator.username,
          creator.handle,
          creator.roleTitle,
          creator.bio,
          creator.location,
          ...(creator.skills || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, creators]
  );

  const switchTab = (tab: ExploreTab) => {
    setActiveTab(tab);
    setQuery('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#171714]">
      <main>
        <section className="border-b border-[#DFE0DA] bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
            <nav aria-label="Konten jelajah" className="mb-9 flex h-12 items-center gap-1 border-b border-[#DFE0DA] sm:mb-12">
              <TabButton active={activeTab === 'video'} onClick={() => switchTab('video')}>
                {language === 'en' ? 'Video' : 'Video'}
              </TabButton>
              <TabButton active={activeTab === 'umkm'} onClick={() => switchTab('umkm')}>
                {language === 'en' ? 'SMEs & Businesses' : 'UMKM'}
              </TabButton>
              <TabButton active={activeTab === 'creator'} onClick={() => switchTab('creator')}>
                {language === 'en' ? 'Creator Profiles' : 'Profil Kreator'}
              </TabButton>
            </nav>

            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-medium text-[#155DFC]">
                  {language === 'en'
                    ? activeTab === 'video'
                      ? 'Latest community showcase'
                      : activeTab === 'umkm'
                      ? 'Local business directory'
                      : 'Verified creative talent'
                    : activeTab === 'video'
                    ? 'Karya terbaru komunitas'
                    : activeTab === 'umkm'
                    ? 'Direktori usaha lokal'
                    : 'Talenta kreatif terdaftar'}
                </p>
                <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
                  {language === 'en'
                    ? activeTab === 'video'
                      ? 'See how creators tell authentic stories through video.'
                      : activeTab === 'umkm'
                      ? 'Discover businesses ready for creative collaboration.'
                      : 'Find top creative profiles for your next project.'
                    : activeTab === 'video'
                    ? 'Lihat cara kreator lain bercerita lewat video.'
                    : activeTab === 'umkm'
                    ? 'Temukan UMKM yang siap berkolaborasi.'
                    : 'Temukan profil kreator terbaik untuk proyekmu.'}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#62635E] sm:text-lg">
                  {language === 'en'
                    ? activeTab === 'video'
                      ? 'Browse UGC, culinary, beauty, and short-form video references from Creatorin creator portfolios.'
                      : activeTab === 'umkm'
                      ? 'Learn about brands, business categories, locations, and past project track records.'
                      : 'Explore portfolios, ratings, and skills of Creatorin creators for your business creative needs.'
                    : activeTab === 'video'
                    ? 'Jelajahi referensi UGC, kuliner, beauty, dan konten pendek dari portofolio kreator Creatorin.'
                    : activeTab === 'umkm'
                    ? 'Kenali brand, bidang usaha, lokasi, dan rekam jejak proyeknya sebelum mengirim ide.'
                    : 'Jelajahi portofolio, rating, dan keahlian para kreator Creatorin untuk berbagai kebutuhan kreatif usahamu.'}
                </p>
              </div>

              <label className="flex h-13 items-center gap-3 border-b-2 border-[#171714] bg-white focus-within:border-[#155DFC]">
                <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#62635E]" strokeWidth={1.6} />
                <span className="sr-only">
                  {language === 'en'
                    ? `Search ${activeTab === 'video' ? 'creator videos' : activeTab === 'umkm' ? 'businesses' : 'creator profiles'}`
                    : `Cari ${activeTab === 'video' ? 'video kreator' : activeTab === 'umkm' ? 'UMKM' : 'profil kreator'}`}
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    language === 'en'
                      ? activeTab === 'video'
                        ? 'Search videos, categories, or creators'
                        : activeTab === 'umkm'
                        ? 'Search business name, industry, or city'
                        : 'Search creator name, handle, skills, or city'
                      : activeTab === 'video'
                      ? 'Cari video, kategori, atau kreator'
                      : activeTab === 'umkm'
                      ? 'Cari nama, industri, atau kota'
                      : 'Cari nama, username, keahlian, atau kota'
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#171714] outline-none placeholder:text-[#62635E]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Hapus pencarian"
                    className="grid h-11 w-11 shrink-0 place-items-center text-[#62635E] hover:text-[#171714] focus-visible:outline-2 focus-visible:outline-[#155DFC]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
            </div>
          </div>
        </section>

        {activeTab === 'video' ? (
          <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16" aria-labelledby="video-heading">
            <div className="mb-7">
              <h2 id="video-heading" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                Video dari kreator
              </h2>
              <p className="mt-2 text-sm text-[#62635E]">{visibleVideos.length} karya cocok dengan pencarianmu</p>
            </div>

            {visibleVideos.length ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleVideos.map((post) => (
                  <article key={`${post.creator.id}-${post.id}`} className="group min-w-0">
                    <Link
                      href={`/creator/${post.creator.id}`}
                      className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#E9EAE5]">
                        <video
                          src={post.thumbnail}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#171714]/88 px-2.5 py-1.5 text-xs font-medium text-white">
                          <Video className="h-3.5 w-3.5" strokeWidth={1.7} /> Video portofolio
                        </span>
                        {post.views && (
                          <span className="absolute bottom-3 right-3 rounded-md bg-white/92 px-2 py-1 text-xs font-medium text-[#171714]">
                            {post.views} tayangan
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 tracking-[-0.015em] group-hover:text-[#155DFC]">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="mt-3 flex items-center gap-2.5">
                      {post.creator.avatar && (
                        <img
                          src={post.creator.avatar}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/creator/${post.creator.id}`}
                          className="block truncate text-sm font-medium hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-[#155DFC]"
                        >
                          {post.creator.name}
                        </Link>
                        <p className="truncate text-xs text-[#62635E]">{post.categoryTag}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState query={query} label="video" onClear={() => setQuery('')} />
            )}
          </section>
        ) : activeTab === 'umkm' ? (
          <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16" aria-labelledby="umkm-heading">
            <div className="mb-7">
              <h2 id="umkm-heading" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                UMKM terdaftar
              </h2>
              <p className="mt-2 text-sm text-[#62635E]">{visibleBusinesses.length} profil cocok dengan pencarianmu</p>
            </div>

            {visibleBusinesses.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {visibleBusinesses.map((business) => (
                  <Link
                    key={business.id}
                    href={`/umkm/${business.id}`}
                    className="group grid min-w-0 overflow-hidden rounded-2xl border border-[#DFE0DA] bg-white transition-colors hover:border-[#AEB0A8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] sm:grid-cols-[190px_minmax(0,1fr)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#E9EAE5] sm:aspect-auto sm:min-h-[260px]">
                      {business.coverBanner && (
                        <img
                          src={business.coverBanner}
                          alt={`Suasana ${business.brandName}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        {business.logo && (
                          <img
                            src={business.logo}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 shrink-0 rounded-xl border border-[#DFE0DA] object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">{business.brandName}</h3>
                            {business.verified && (
                              <span
                                className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#155DFC] text-white"
                                aria-label="Terverifikasi"
                              >
                                <Check className="h-3 w-3" strokeWidth={2.5} />
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm text-[#62635E]">{business.category}</p>
                        </div>
                      </div>

                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#4F504B]">{business.bio}</p>

                      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm text-[#62635E]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" strokeWidth={1.6} />
                          {business.location}
                        </span>
                        <span>{business.stats.completedProjects} proyek selesai</span>
                        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[#171714]">
                          Lihat profil <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState query={query} label="UMKM" onClear={() => setQuery('')} />
            )}
          </section>
        ) : (
          <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16" aria-labelledby="kreator-heading">
            <div className="mb-7">
              <h2 id="kreator-heading" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                Kreator terdaftar
              </h2>
              <p className="mt-2 text-sm text-[#62635E]">{visibleCreators.length} profil kreator cocok dengan pencarianmu</p>
            </div>

            {visibleCreators.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCreators.map((creator) => {
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

                  return (
                    <Link
                      key={creator.id}
                      href={`/creator/${creator.id}`}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#DFE0DA] bg-white p-5 sm:p-6 transition-all duration-300 hover:border-[#155DFC]/60 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#155DFC]"
                    >
                      <div>
                        {/* Header: Foto Profile, Nama, Username, Rating */}
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            {creator.avatar ? (
                              <img
                                src={creator.avatar}
                                alt={creator.name}
                                width={56}
                                height={56}
                                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-[#DFE0DA] transition-all group-hover:ring-[#155DFC]/40"
                              />
                            ) : (
                              <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full bg-gradient-to-tr from-[#155DFC] to-[#60A5FA] text-lg font-bold text-white ring-2 ring-[#DFE0DA]">
                                {creator.name?.charAt(0)?.toUpperCase() || 'K'}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-base sm:text-lg font-semibold tracking-[-0.02em] text-[#171714] transition-colors group-hover:text-[#155DFC]">
                                {creator.name}
                              </h3>
                            </div>

                            <p className="truncate text-xs sm:text-sm font-medium text-[#62635E]">
                              {username}
                            </p>

                            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#171714]">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" strokeWidth={1.5} />
                              <span>{ratingVal}</span>
                              <span className="text-[#62635E] font-normal">
                                ({reviewsCount} ulasan)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Role Title if available */}
                        {creator.roleTitle && (
                          <p className="mt-3 truncate text-xs font-medium text-[#155DFC]">
                            {creator.roleTitle}
                          </p>
                        )}

                        {/* Sedikit Bio */}
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#4F504B]">
                          {creator.bio ||
                            'Kreator kreatif terdaftar di Creatorin siap membantu kebutuhan produksi visual, video, dan desain bisnismu.'}
                        </p>

                        {/* Skills Tags */}
                        {creator.skills && creator.skills.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {creator.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-md bg-[#F1F2ED] px-2 py-0.5 text-xs font-medium text-[#4F504B]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer: Lokasi & Lihat Profil */}
                      <div className="mt-5 flex items-center justify-between border-t border-[#DFE0DA]/80 pt-3.5 text-xs text-[#62635E]">
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8C8E87]" strokeWidth={1.6} />
                          {creator.location || 'Indonesia'}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#155DFC] transition-transform group-hover:translate-x-0.5 shrink-0">
                          Lihat profil <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState query={query} label="kreator" onClear={() => setQuery('')} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative h-full px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#155DFC] sm:px-4 ${
        active ? 'font-semibold text-[#171714]' : 'text-[#62635E] hover:text-[#171714]'
      }`}
    >
      {children}
      {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#155DFC]" />}
    </button>
  );
}

function EmptyState({ query, label, onClear }: { query: string; label: string; onClear: () => void }) {
  return (
    <div className="border-y border-[#DFE0DA] py-16 text-center">
      <h3 className="text-lg font-semibold">Tidak ada {label} untuk “{query}”</h3>
      <p className="mt-2 text-sm text-[#62635E]">Coba kata kunci yang lebih umum atau tampilkan semua.</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 min-h-11 rounded-lg bg-[#171714] px-5 text-sm font-semibold text-white hover:bg-[#30312D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
      >
        Tampilkan semua
      </button>
    </div>
  );
}
