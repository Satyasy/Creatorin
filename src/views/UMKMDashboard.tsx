'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import { ProjectCard } from '@/components/common/ProjectCard';
import { creatorService } from '@/services/creatorService';
import { useAuth } from '@/providers/AuthProvider';
import { FeedProject } from '@/types';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

const ProjectBriefModal = dynamic(
  () => import('@/components/modals/ProjectBriefModal').then((mod) => mod.ProjectBriefModal),
  { ssr: false }
);

const CATEGORIES = [
  'Semua karya',
  'Reels Instagram',
  'Foto Produk',
  'Video Tiktok',
  'UI/UX Design',
  'Branding & Logo',
  'Feed Instagram',
];

export const UMKMDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'populer' | 'likes' | 'views'>('populer');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [projectsData, setProjects] = useState<FeedProject[]>([]);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    creatorService.getFeedProjects().then(setProjects).catch(() => setLoadError('Gagal memuat karya. Coba muat ulang halaman.'));
  }, []);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isSortDropdownOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsSortDropdownOpen(false);
      sortButtonRef.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isSortDropdownOpen]);

  const filteredProjects = useMemo(() => {
    let projects = [...projectsData];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      projects = projects.filter((project) =>
        [project.title, project.creator?.name, project.category, ...(project.tags || [])]
          .some((value) => value?.toLowerCase().includes(query))
      );
    }

    if (selectedTag) {
      const tag = selectedTag.toLowerCase();
      projects = projects.filter((project) =>
        [project.title, project.category, ...(project.tags || [])]
          .some((value) => value?.toLowerCase().includes(tag))
      );
    }

    if (sortBy === 'likes') projects.sort((a, b) => b.likesCount - a.likesCount);
    if (sortBy === 'views') {
      const views = (value?: string | number) => {
        const text = String(value || '0').toLowerCase();
        const amount = Number.parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
        return text.includes('m') ? amount * 1_000_000 : text.includes('k') ? amount * 1_000 : amount;
      };
      projects.sort((a, b) => views(b.viewsCount) - views(a.viewsCount));
    }
    if (sortBy === 'populer') {
      projects.sort((a, b) => (b.sharesCount || 0) + b.likesCount - ((a.sharesCount || 0) + a.likesCount));
    }

    return projects;
  }, [searchQuery, selectedTag, sortBy, projectsData]);
  const categoryPreviews = useMemo(() => Array.from(new Map(projectsData.map(project => [project.category, project])).entries()).slice(0, 5), [projectsData]);

  const selectCategory = (category: string) => {
    setSelectedTag(category === 'Semua karya' ? null : category);
    setVisibleCount(8);
  };

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <section className="border-b border-[var(--outline)] bg-white">
        <div className="container-creatorin grid gap-10 pb-12 pt-14 lg:grid-cols-[1fr_420px] lg:items-end lg:pb-16 lg:pt-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold text-primary">Selamat datang, {user?.name || 'pemilik usaha'}</p>
            <h1 className="max-w-[760px] text-[40px] font-semibold leading-[1.04] tracking-[-0.045em] text-[var(--ink)] sm:text-5xl lg:text-[64px]">
              Cari karya yang membuat brandmu terlihat serius.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Lihat hasil kerja creator, bandingkan gaya visualnya, lalu kirim brief saat kamu sudah menemukan yang cocok.
            </p>
            <form className="mt-8 flex max-w-2xl items-center rounded-2xl border border-[#B7BBC9] bg-[#F8F9FC] p-2 focus-within:border-primary focus-within:bg-white focus-within:shadow-[var(--focus-ring)]" onSubmit={(event) => event.preventDefault()}>
              <Search className="ml-3 h-5 w-5 shrink-0 text-[#6F7285]" />
              <label htmlFor="umkm-work-search" className="sr-only">Cari karya atau creator</label>
              <input id="umkm-work-search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setVisibleCount(8); }} placeholder="Cari video, foto produk, branding, atau creator" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-[#6F7285] sm:text-base" />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Hapus pencarian" className="grid h-11 w-11 place-items-center rounded-xl text-[#55576A] hover:bg-white hover:text-[var(--ink)]"><X className="h-4 w-4" /></button>}
              <button type="submit" className="hidden h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover sm:block">Cari karya</button>
            </form>
          </div>

          <aside className="border-l-0 border-[var(--outline)] lg:border-l lg:pl-10" aria-label="Mulai proyek baru">
            <p className="text-sm font-semibold text-[var(--ink)]">Sudah punya kebutuhan?</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">Tulis kebutuhan sekali. Creator yang relevan dapat mengirim proposal dan contoh kerja.</p>
            <button onClick={() => setIsBriefModalOpen(true)} className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-[#0D0C22] px-5 text-sm font-semibold text-white hover:bg-[#29283D]">
              <Plus className="h-4 w-4" /> Buat brief proyek
            </button>
          </aside>
        </div>
      </section>

      <section className="container-creatorin py-10 sm:py-12" aria-labelledby="category-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Pilih dari hasil nyata</p>
            <h2 id="category-heading" className="mt-1 text-2xl font-semibold sm:text-3xl">Mulai dari format yang kamu butuhkan</h2>
          </div>
          <button onClick={() => router.push('/explore/projects')} className="hidden items-center gap-2 text-sm font-semibold text-[var(--ink)] hover:text-primary sm:flex">Semua karya <ArrowRight className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-[repeat(5,minmax(220px,1fr))] gap-4 overflow-x-auto pb-3" role="list">
          {categoryPreviews.map(([category, project]) => {
            return (
              <button key={category} onClick={() => selectCategory(category)} className="group min-w-0 text-left" role="listitem">
                <span className="block aspect-[16/10] overflow-hidden rounded-xl bg-[#F3F3F4]"><img src={project.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" loading="lazy" /></span>
                <span className="mt-3 block text-sm font-semibold text-[var(--ink)] group-hover:text-primary">{category}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="container-creatorin pb-20 pt-4" aria-labelledby="work-heading">
        <div className="border-t border-[var(--outline)] pt-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Kurasi untuk usahamu</p>
              <h2 id="work-heading" className="mt-1 text-2xl font-semibold sm:text-3xl">Karya terbaru dari creator</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{filteredProjects.length} karya cocok dengan pencarian ini.</p>
            </div>

            <div className="flex items-center gap-3 self-stretch overflow-x-auto lg:self-auto">
              <div className="flex gap-2" aria-label="Filter kategori">
                {CATEGORIES.slice(0, 4).map((category) => {
                  const active = category === 'Semua karya' ? !selectedTag : selectedTag === category;
                  return <button key={category} onClick={() => selectCategory(category)} aria-pressed={active} className={`h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold ${active ? 'border-[#0D0C22] bg-[#0D0C22] text-white' : 'border-[var(--outline)] bg-white text-[#55576A] hover:border-[#B7BBC9] hover:text-[var(--ink)]'}`}>{category}</button>;
                })}
              </div>

              <div className="relative shrink-0">
                <button ref={sortButtonRef} onClick={() => setIsSortDropdownOpen((open) => !open)} aria-expanded={isSortDropdownOpen} className="flex h-11 items-center gap-2 rounded-xl border border-[var(--outline)] bg-white px-4 text-sm font-semibold text-[var(--ink)] hover:border-[#B7BBC9]">
                  {sortBy === 'populer' ? 'Populer' : sortBy === 'likes' ? 'Paling disukai' : 'Paling dilihat'} <ChevronDown className="h-4 w-4" />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-[var(--outline)] bg-white p-2 shadow-[0_16px_40px_rgba(13,12,34,.14)]">
                    {([['populer', 'Populer'], ['likes', 'Paling disukai'], ['views', 'Paling dilihat']] as const).map(([value, label]) => (
                      <button key={value} onClick={() => { setSortBy(value); setIsSortDropdownOpen(false); }} className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-medium hover:bg-[#F8F9FC]">{label}{sortBy === value && <Check className="h-4 w-4 text-primary" />}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loadError && <p role="alert" className="mt-8 text-sm text-red-600">{loadError}</p>}
          {filteredProjects.length ? (
            <>
              <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {filteredProjects.slice(0, visibleCount).map((project) => (
                  <ProjectCard key={project.id} id={`umkm-feed-${project.id}`} project={project} isSaved={Boolean(savedProjects[project.id])} onToggleSave={(id, event) => { event.stopPropagation(); setSavedProjects((saved) => ({ ...saved, [id]: !saved[id] })); }} onClick={() => setSelectedProject(project)} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                {visibleCount < filteredProjects.length ? <button onClick={() => setVisibleCount((count) => count + 8)} className="h-12 rounded-xl border border-[#B7BBC9] bg-white px-6 text-sm font-semibold text-[var(--ink)] hover:border-primary hover:text-primary">Muat karya berikutnya</button> : <p className="text-sm text-[var(--muted)]">Semua karya yang tersedia sudah ditampilkan.</p>}
              </div>
            </>
          ) : (
            <div className="mt-8 border-y border-[var(--outline)] py-16 text-center"><p className="font-semibold">Belum ada karya yang cocok.</p><button onClick={() => { setSearchQuery(''); selectCategory('Semua karya'); }} className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover">Hapus filter</button></div>
          )}
        </div>
      </section>

      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} onViewCreatorProfile={(creator) => { setSelectedProject(null); router.push(`/creator/${creator.id}`); }} onGetInTouch={(creator) => { setSelectedProject(null); router.push(`/chat?creatorId=${creator.id}`); }} allProjects={filteredProjects} />}
      <ProjectBriefModal isOpen={isBriefModalOpen} onClose={() => setIsBriefModalOpen(false)} />
    </div>
  );
};
