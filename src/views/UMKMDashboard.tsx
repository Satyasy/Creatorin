'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { FeedProject } from '@/types';
import { ProjectCard } from '@/components/common/ProjectCard';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  ArrowRight, 
  SlidersHorizontal,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

const ProjectBriefModal = dynamic(
  () => import('@/components/modals/ProjectBriefModal').then((mod) => mod.ProjectBriefModal),
  { ssr: false }
);

export const UMKMDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'populer' | 'likes' | 'views'>('populer');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Record<string, boolean>>({});
  
  // Modals state
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<FeedProject | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  const POPULAR_TAGS = [
    'Reels Instagram',
    'Foto Produk',
    'Video Tiktok',
    'UI/UX Design',
    'Branding & Logo',
    'Feed Instagram'
  ];

  const filteredProjects = useMemo(() => {
    let list = [...MOCK_FEED_PROJECTS];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.title?.toLowerCase() || '').includes(q) ||
        (p.creator?.name?.toLowerCase() || '').includes(q) ||
        (p.category?.toLowerCase() || '').includes(q) ||
        (p.tags || []).some(t => (t?.toLowerCase() || '').includes(q))
      );
    }
    if (selectedTag) {
      const tagQuery = selectedTag.toLowerCase();
      list = list.filter(p => 
        (p.title?.toLowerCase() || '').includes(tagQuery) ||
        (p.category?.toLowerCase() || '').includes(tagQuery) ||
        (p.tags || []).some(t => (t?.toLowerCase() || '').includes(tagQuery))
      );
    }
    if (sortBy === 'likes') {
      list.sort((a, b) => b.likesCount - a.likesCount);
    } else if (sortBy === 'views') {
      const parseV = (v?: string | number) => {
        if (!v) return 0;
        const str = String(v).toLowerCase();
        const n = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (str.includes('k')) return n * 1000;
        if (str.includes('m')) return n * 1000000;
        return n || 0;
      };
      list.sort((a, b) => parseV(b.viewsCount) - parseV(a.viewsCount));
    } else {
      list.sort((a, b) => ((b.sharesCount || 0) + b.likesCount) - ((a.sharesCount || 0) + a.likesCount));
    }
    return list;
  }, [searchQuery, selectedTag, sortBy]);

  const toggleSaveProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] text-[#0F172A] font-sans pb-24">
      
      {/* 1. Sapaan / Simpler Hero Banner for Logged-in UMKM */}
      <section className="bg-gradient-to-r from-[#0D0C22] to-[#1E293B] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-neutral-200">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#155DFC]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Dashboard Klien UMKM
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Halo, {user?.name || 'Sahabat UMKM'}! 👋
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Jelajahi portofolio terbaik dari kreator pilihan, atau buat brief pekerjaan baru dengan sistem proteksi rekening bersama (escrow).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsBriefModalOpen(true)}
              className="h-11 px-5 rounded-xl bg-[#155DFC] hover:bg-[#03ACFD] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Brief Proyek</span>
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Jelajah Kreator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Focus: Project Showcase Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ide desain, video TikTok, foto produk..."
              className="w-full pl-10 pr-9 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder:text-neutral-400 focus:outline-none focus:border-[#155DFC] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0 self-end md:self-auto">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 text-xs font-semibold text-neutral-700 transition cursor-pointer shadow-2xs"
            >
              <span>
                {sortBy === 'populer' && 'Terpopuler'}
                {sortBy === 'likes' && 'Terbanyak Disukai'}
                {sortBy === 'views' && 'Paling Banyak Dilihat'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                {[
                  { id: 'populer', label: 'Terpopuler' },
                  { id: 'likes', label: 'Terbanyak Disukai' },
                  { id: 'views', label: 'Paling Banyak Dilihat' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id as any);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                      sortBy === s.id ? 'font-bold text-[#0D0C22]' : 'text-neutral-600'
                    }`}
                  >
                    <span>{s.label}</span>
                    {sortBy === s.id && <Check className="w-3.5 h-3.5 text-[#0D0C22]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Tags Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-4">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedTag === null
                ? 'bg-[#0D0C22] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Semua Kategori
          </button>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#0D0C22] text-white font-semibold'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200 p-8">
            <p className="text-sm font-semibold text-neutral-600">Tidak ada proyek yang sesuai dengan filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
              className="mt-3 text-xs font-bold text-[#155DFC] hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                id={`umkm-feed-${proj.id}`}
                project={proj}
                isSaved={Boolean(savedProjects[proj.id])}
                onToggleSave={(id, e) => toggleSaveProject(id, e)}
                onClick={() => setSelectedProjectForDetail(proj)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Lightbox / Project Detail Modal */}
      {selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          onClose={() => setSelectedProjectForDetail(null)}
          onViewCreatorProfile={(creator) => {
            setSelectedProjectForDetail(null);
            router.push(`/creator/${creator.id}`);
          }}
          onGetInTouch={(creator) => {
            setSelectedProjectForDetail(null);
            router.push(`/chat?creatorId=${creator.id}`);
          }}
          allProjects={filteredProjects}
        />
      )}

      {/* Create Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />
    </div>
  );
};
