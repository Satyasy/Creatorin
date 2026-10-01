'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Search, 
  Play, 
  Layers, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Volume2, 
  VolumeX, 
  Send, 
  SlidersHorizontal,
  Clock,
  Briefcase,
  Star,
  Check,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { ActivePage, AuthState, FeedProject, Creator } from '@/types';

interface ExploreProjectsPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

const CATEGORY_TABS = [
  'Semua',
  'Reels Instagram',
  'Video Tiktok',
  'UI/UX Design',
  'Foto Produk',
  'Feed Instagram',
  'Logo & Branding'
];

const PLATFORM_FILTERS = [
  { id: 'all', label: 'Semua Platform' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'direct', label: 'Creatorin Upload' }
];

const POPULAR_PROJECT_TAGS = [
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

export const ExploreProjectsPage: React.FC<ExploreProjectsPageProps> = ({
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'platform' | 'format' | 'sort' | null>(null);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | undefined>(undefined);
  
  // Likes & Save simulation state
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [followingCreators, setFollowingCreators] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState('');
  const [postComments, setPostComments] = useState<Record<string, { user: string; text: string; time: string }[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    const list = MOCK_FEED_PROJECTS.filter((proj) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ = 
          (proj.title?.toLowerCase() || '').includes(q) ||
          (proj.caption?.toLowerCase() || '').includes(q) ||
          (proj.creator?.name?.toLowerCase() || '').includes(q) ||
          (proj.socialHandle?.toLowerCase() || '').includes(q) ||
          (proj.tags || []).some(t => (t?.toLowerCase() || '').includes(q));
        if (!matchesQ) return false;
      }

      // Category tab
      if (selectedCategory !== 'Semua' && proj.category !== selectedCategory) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all' && proj.platform !== selectedPlatform) {
        return false;
      }

      // Media format filter
      if (selectedFormat !== 'all' && proj.mediaType !== selectedFormat) {
        return false;
      }

      // Tag filter
      if (selectedTag) {
        const cleanTag = selectedTag.toLowerCase().replace('#', '');
        const matchesTag = (proj.tags || []).some(t => (t?.toLowerCase() || '').includes(cleanTag));
        if (!matchesTag) return false;
      }

      return true;
    });

    // Sorting
    if (selectedSort === 'likes') {
      return [...list].sort((a, b) => b.likesCount - a.likesCount);
    } else if (selectedSort === 'views') {
      const parseViews = (v?: string | number) => {
        if (!v) return 0;
        const str = String(v).toLowerCase();
        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (str.includes('k')) return num * 1000;
        if (str.includes('m')) return num * 1000000;
        return num || 0;
      };
      return [...list].sort((a, b) => parseViews(b.viewsCount) - parseViews(a.viewsCount));
    } else if (selectedSort === 'latest') {
      return [...list].reverse();
    } else {
      // popular
      return [...list].sort((a, b) => (b.sharesCount + b.likesCount) - (a.sharesCount + a.likesCount));
    }
  }, [searchQuery, selectedCategory, selectedPlatform, selectedFormat, selectedSort, selectedTag]);

  const handleOpenProjectModal = (proj: FeedProject) => {
    setSelectedProject(proj);
    setCurrentCarouselIndex(0);
    setIsVideoPlaying(true);
  };

  const handleToggleLike = (projId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedPosts(prev => ({
      ...prev,
      [projId]: !prev[projId]
    }));
  };

  const handleToggleSave = (projId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willSave = !savedPosts[projId];
    setSavedPosts(prev => ({
      ...prev,
      [projId]: willSave
    }));
    showToast(willSave ? 'Disimpan ke Koleksi Favorit' : 'Dihapus dari Koleksi');
  };

  const handleToggleFollow = (creatorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFollowingCreators(prev => ({
      ...prev,
      [creatorId]: !prev[creatorId]
    }));
    showToast(followingCreators[creatorId] ? 'Berhenti mengikuti' : 'Mengikuti kreator');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedProject) return;

    const newComment = {
      user: currentUser?.name || 'Anda',
      text: commentInput.trim(),
      time: 'Baru saja'
    };

    setPostComments(prev => ({
      ...prev,
      [selectedProject.id]: [...(prev[selectedProject.id] || []), newComment]
    }));
    setCommentInput('');
    showToast('Komentar berhasil dikirim!');
  };

  const handleOrderSimilar = (proj: FeedProject) => {
    setTargetCreatorForBrief(proj.creator);
    setIsBriefModalOpen(true);
  };

  return (
    <div className="w-full bg-[#fafafa] text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#0d0c22] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
          <span className="text-neutral-800 font-semibold">Proyek Kreator</span>
        </div>

        {/* Page Title & Subtitle Header */}
        <ScrollReveal distance={20} duration={600}>
          <div className="mb-6 space-y-2">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#0F172A] tracking-tight leading-tight lg:leading-[48px]">
                Jelajah Proyek & Portofolio Kreator
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-2xl leading-normal font-normal">
                Temukan portofolio nyata, video Reels, konten TikTok, dan sistem desain yang telah diproduksi oleh kreator top terverifikasi Creatorin.
              </p>
            </div>

            {/* Popular Tag Pills */}
            <div className="pt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#64748B] mr-1 flex items-center gap-1">
                <span>Tagar Populer:</span>
              </span>
              {POPULAR_PROJECT_TAGS.map((tag) => {
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

        {/* Section Heading & Filter Toolbar */}
        <section className="pt-4 pb-4 border-t border-[#E2E8F0] mb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
              Cari Proyek berdasarkan Kategori
            </h2>

            {/* Filter Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 relative z-30">
              
              {/* Reset / Clear All Filter Button */}
              <button 
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedPlatform('all');
                  setSelectedFormat('all');
                  setSelectedSort('popular');
                  setSelectedTag(null);
                  setSearchQuery('');
                  setOpenDropdown(null);
                }}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  (selectedCategory !== 'Semua' || selectedPlatform !== 'all' || selectedFormat !== 'all' || selectedSort !== 'popular' || selectedTag || searchQuery)
                    ? 'border-[#0d0c22] bg-[#0d0c22] text-white shadow-2xs'
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
                    selectedCategory !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
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

              {/* Dropdown 2: Platform */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'platform' ? null : 'platform')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedPlatform !== 'all' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedPlatform === 'all' 
                      ? 'Platform' 
                      : selectedPlatform === 'instagram' 
                      ? 'Instagram' 
                      : selectedPlatform === 'tiktok' 
                      ? 'TikTok' 
                      : 'Creatorin Upload'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'platform' && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {PLATFORM_FILTERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPlatform(p.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedPlatform === p.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{p.label}</span>
                        {selectedPlatform === p.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Format Media */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'format' ? null : 'format')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedFormat !== 'all' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedFormat === 'all' 
                      ? 'Format Media' 
                      : selectedFormat === 'video' 
                      ? 'Video / Reels' 
                      : selectedFormat === 'carousel' 
                      ? 'Carousel' 
                      : 'Foto / Desain'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'format' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'all', label: 'Semua Format' },
                      { id: 'video', label: 'Video / Reels' },
                      { id: 'carousel', label: 'Carousel Multi-slide' },
                      { id: 'image', label: 'Foto / Desain Tunggal' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => {
                          setSelectedFormat(fmt.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedFormat === fmt.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{fmt.label}</span>
                        {selectedFormat === fmt.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Urutkan */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedSort !== 'popular' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedSort === 'popular'
                      ? 'Urutkan: Populer'
                      : selectedSort === 'likes'
                      ? 'Urutkan: Likes'
                      : selectedSort === 'views'
                      ? 'Urutkan: Views'
                      : 'Urutkan: Terbaru'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'sort' && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'popular', label: 'Paling Populer' },
                      { id: 'likes', label: 'Terbanyak Disukai' },
                      { id: 'views', label: 'Terbanyak Dilihat' },
                      { id: 'latest', label: 'Terbaru' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSort(s.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedSort === s.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {selectedSort === s.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Transparent Backdrop to close dropdowns */}
          {openDropdown && (
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setOpenDropdown(null)} 
            />
          )}

          {searchQuery && (
            <div className="flex items-center gap-2 mt-3 text-xs font-medium text-neutral-600">
              <span>Hasil pencarian dari navbar: <strong className="text-[#0d0c22]">"{searchQuery}"</strong></span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded cursor-pointer"
                title="Hapus filter pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* Explore Feed Grid (Instagram/TikTok Explore Style - Dempet Grid with Uniform 4:5 Ratio) */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0d0c22]">Tidak Ada Konten Ditemukan</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1 mb-6">
              Coba sesuaikan kata kunci pencarian atau ubah filter platform dan kategori untuk menemukan karya lainnya.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedPlatform('all');
                setSelectedFormat('all');
                setSelectedSort('popular');
                setSelectedTag(null);
              }}
              className="h-11 px-6 rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#123B8C] transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project, pIdx) => (
              <ScrollReveal
                key={project.id}
                distance={28}
                delay={Math.min((pIdx % 4) * 70, 240)}
                duration={600}
              >
                <ProjectCard
                  id={`feed-card-${project.id}`}
                  project={project}
                  isSaved={Boolean(savedPosts[project.id])}
                  onToggleSave={(id, e) => handleToggleSave(id, e)}
                  onClick={() => handleOpenProjectModal(project)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

      </main>

      {/* Full Preview Modal matching requested design */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSelectProject={(newProj) => setSelectedProject(newProj)}
          onViewCreatorProfile={(c) => {
            handleCreatorClick(c);
            setSelectedProject(null);
          }}
          onGetInTouch={(c) => {
            setSelectedProject(null);
            setTargetCreatorForBrief(c);
            setIsBriefModalOpen(true);
          }}
          onScheduleCall={(c) => {
            setSelectedProject(null);
            setTargetCreatorForBrief(c);
            setIsBriefModalOpen(true);
          }}
          onNavigate={navigateTo}
          allProjects={MOCK_FEED_PROJECTS}
        />
      )}

      {/* Project Brief Modal (When ordering similar content) */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        targetCreator={targetCreatorForBrief}
      />
    </div>
  );
};
