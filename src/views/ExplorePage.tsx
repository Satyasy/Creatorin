'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, MapPin, Search, Video, X } from 'lucide-react';
import { businessService } from '@/services/businessService';
import { creatorService } from '@/services/creatorService';
import type { UMKMProfile } from '@/types';

type ExploreTab = 'umkm' | 'video';

export function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('umkm');
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState<UMKMProfile[]>([]);
  const [videoPosts, setVideoPosts] = useState<Array<{ id: string; title: string; categoryTag: string; thumbnail: string; views: string; creator: { id: string; name: string; avatar: string; roleTitle: string } }>>([]);
  useEffect(() => {
    businessService.getBusinesses().then(setBusinesses).catch(() => setBusinesses([]));
    creatorService.getFeedProjects().then((projects) => setVideoPosts(projects.filter((project) => project.mediaType === 'video').map((project) => ({ id: project.id, title: project.title, categoryTag: project.category, thumbnail: project.mediaUrl || '', views: project.viewsCount, creator: project.creator })))).catch(() => setVideoPosts([]));
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleBusinesses = useMemo(
    () =>
      businesses.filter((business) =>
        [business.brandName, business.industry, business.category, business.location]
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
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, videoPosts]
  );

  const switchTab = (tab: ExploreTab) => {
    setActiveTab(tab);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#171714]">
      <main>
        <section className="border-b border-[#DFE0DA] bg-white">
          <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
            <nav aria-label="Konten jelajah" className="mb-9 flex h-12 items-center gap-1 border-b border-[#DFE0DA] sm:mb-12">
              <TabButton active={activeTab === 'umkm'} onClick={() => switchTab('umkm')}>Profil UMKM</TabButton>
              <TabButton active={activeTab === 'video'} onClick={() => switchTab('video')}>Video kreator</TabButton>
            </nav>
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-medium text-[#155DFC]">
                  {activeTab === 'umkm' ? 'Direktori usaha lokal' : 'Karya terbaru komunitas'}
                </p>
                <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
                  {activeTab === 'umkm' ? 'Temukan UMKM yang siap berkolaborasi.' : 'Lihat cara kreator lain bercerita lewat video.'}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#62635E] sm:text-lg">
                  {activeTab === 'umkm'
                    ? 'Kenali brand, bidang usaha, lokasi, dan rekam jejak proyeknya sebelum mengirim ide.'
                    : 'Jelajahi referensi UGC, kuliner, beauty, dan konten pendek dari portofolio kreator Creatorin.'}
                </p>
              </div>

              <label className="flex h-13 items-center gap-3 border-b-2 border-[#171714] bg-white focus-within:border-[#155DFC]">
                <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#62635E]" strokeWidth={1.6} />
                <span className="sr-only">Cari {activeTab === 'umkm' ? 'UMKM' : 'video kreator'}</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={activeTab === 'umkm' ? 'Cari nama, industri, atau kota' : 'Cari video, kategori, atau kreator'}
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#171714] outline-none placeholder:text-[#62635E]"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian" className="grid h-11 w-11 shrink-0 place-items-center text-[#62635E] hover:text-[#171714] focus-visible:outline-2 focus-visible:outline-[#155DFC]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
            </div>
          </div>
        </section>

        {activeTab === 'umkm' ? (
          <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16" aria-labelledby="umkm-heading">
            <div className="mb-7">
              <h2 id="umkm-heading" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">UMKM terdaftar</h2>
              <p className="mt-2 text-sm text-[#62635E]">{visibleBusinesses.length} profil cocok dengan pencarianmu</p>
            </div>

            {visibleBusinesses.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {visibleBusinesses.map((business) => (
                  <Link key={business.id} href={`/umkm/${business.id}`} className="group grid min-w-0 overflow-hidden rounded-2xl border border-[#DFE0DA] bg-white transition-colors hover:border-[#AEB0A8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] sm:grid-cols-[190px_minmax(0,1fr)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#E9EAE5] sm:aspect-auto sm:min-h-[260px]">
                      {business.coverBanner && <img src={business.coverBanner} alt={`Suasana ${business.brandName}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                    </div>
                    <div className="flex min-w-0 flex-col p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        {business.logo && <img src={business.logo} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl border border-[#DFE0DA] object-cover" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">{business.brandName}</h3>
                            {business.verified && (
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#155DFC] text-white" aria-label="Terverifikasi">
                                <Check className="h-3 w-3" strokeWidth={2.5} />
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm text-[#62635E]">{business.category}</p>
                        </div>
                      </div>

                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#4F504B]">{business.bio}</p>

                      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-sm text-[#62635E]">
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" strokeWidth={1.6} />{business.location}</span>
                        <span>{business.stats.completedProjects} proyek selesai</span>
                        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[#171714]">Lihat profil <ArrowUpRight className="h-4 w-4" /></span>
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
          <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16" aria-labelledby="video-heading">
            <div className="mb-7">
              <h2 id="video-heading" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Video dari kreator</h2>
              <p className="mt-2 text-sm text-[#62635E]">{visibleVideos.length} karya cocok dengan pencarianmu</p>
            </div>

            {visibleVideos.length ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleVideos.map((post) => (
                  <article key={`${post.creator.id}-${post.id}`} className="group min-w-0">
                    <Link href={`/creator/${post.creator.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#E9EAE5]">
                        <video src={post.thumbnail} muted playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#171714]/88 px-2.5 py-1.5 text-xs font-medium text-white">
                          <Video className="h-3.5 w-3.5" strokeWidth={1.7} /> Video portofolio
                        </span>
                        {post.views && <span className="absolute bottom-3 right-3 rounded-md bg-white/92 px-2 py-1 text-xs font-medium text-[#171714]">{post.views} tayangan</span>}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 tracking-[-0.015em] group-hover:text-[#155DFC]">{post.title}</h3>
                    </Link>
                    <div className="mt-3 flex items-center gap-2.5">
                      {post.creator.avatar && <img src={post.creator.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />}
                      <div className="min-w-0">
                        <Link href={`/creator/${post.creator.id}`} className="block truncate text-sm font-medium hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-[#155DFC]">{post.creator.name}</Link>
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
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`relative h-full px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#155DFC] sm:px-4 ${active ? 'font-semibold text-[#171714]' : 'text-[#62635E] hover:text-[#171714]'}`}>
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
      <button type="button" onClick={onClear} className="mt-5 min-h-11 rounded-lg bg-[#171714] px-5 text-sm font-semibold text-white hover:bg-[#30312D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]">
        Tampilkan semua
      </button>
    </div>
  );
}
