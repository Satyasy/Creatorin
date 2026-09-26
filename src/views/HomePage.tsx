'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Pause,
  Mic,
  Video as VideoIcon,
  Layers, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  UserCheck, 
  Briefcase, 
  Zap, 
  Clock, 
  Users, 
  ArrowUpRight, 
  Check, 
  ChevronRight, 
  Award, 
  MessageCircle, 
  Heart, 
  Bookmark, 
  Eye,
  SlidersHorizontal,
  ThumbsUp,
  Camera,
  Video,
  Palette,
  Layout,
  Share2,
  MapPin,
  ChevronDown,
  ChevronLeft,
  Volume2,
  VolumeX,
  Tag,
  ExternalLink,
  X
} from 'lucide-react';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { ActivePage, AuthState, Creator, CreatorService, FeedProject } from '@/types';

interface HomePageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

const POPULAR_CATEGORIES = [
  {
    id: 'reels-tiktok',
    title: 'Video Reels & TikTok UGC',
    desc: 'Konten video berdurasi pendek dengan hook kuat, voice over natural, dan audio trending.',
    creatorsCount: '1.240+ Kreator',
    icon: Video,
    tag: 'Reels Instagram',
    accent: 'bg-rose-50 text-rose-600 border-rose-100'
  },
  {
    id: 'foto-produk',
    title: 'Foto Produk & Komersial',
    desc: 'Fotografi still life, lifestyle produk, dan konsep studio dengan lighting profesional.',
    creatorsCount: '890+ Kreator',
    icon: Camera,
    tag: 'Foto Produk',
    accent: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  {
    id: 'uiux-web',
    title: 'UI/UX & Desain Website',
    desc: 'Desain website konversi tinggi, sistem desain Figma, dan prototipe aplikasi modern.',
    creatorsCount: '620+ Kreator',
    icon: Layout,
    tag: 'UI/UX Design',
    accent: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    id: 'branding-logo',
    title: 'Logo & Identitas Brand',
    desc: 'Desain logo berkarakter, visual guidelines, palet warna, dan kemasan produk.',
    creatorsCount: '510+ Kreator',
    icon: Palette,
    tag: 'Logo & Branding',
    accent: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  },
  {
    id: 'feed-carousel',
    title: 'Feed & Carousel Instagram',
    desc: 'Desain carousel edukatif multi-slide dan layout grid terpadu untuk membangun otoritas brand.',
    creatorsCount: '970+ Kreator',
    icon: Layers,
    tag: 'Feed Instagram',
    accent: 'bg-purple-50 text-purple-600 border-purple-100'
  },
  {
    id: 'campaign-ugc',
    title: 'Influencer & UGC Campaign',
    desc: 'Endorsement otentik dan kampanye terstruktur untuk meningkatkan engagement dan sales.',
    creatorsCount: '780+ Kreator',
    icon: TrendingUp,
    tag: 'Video Tiktok',
    accent: 'bg-sky-50 text-sky-600 border-sky-100'
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    client: 'Bagus Wicaksono',
    role: 'Founder & CMO, Kopi Senja Nusantara',
    brand: 'Kopi Senja Nusantara',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Sebelum pakai Creatorin, kami pusing cari kreator TikTok yang konsisten dan tepat waktu. Lewat platform ini, 5 video UGC kami tembus total 800k views dalam 2 minggu pertama. Fitur Skor Karirnya sangat membantu!'
  },
  {
    id: 2,
    client: 'Clara Santoso',
    role: 'Brand Manager, GlowNatural ID',
    brand: 'GlowNatural ID',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Sistem rekening bersama dan garansinya bikin belanja jasa kreatif jadi tenang. Portofolio kreator di sini bukan klaim asal-asalan karena sudah tersinkronisasi langsung dengan platform sosial aslinya.'
  },
  {
    id: 3,
    client: 'Rizky Pratama',
    role: 'Head of Product, SaaS Kita Maju',
    brand: 'SaaS Kita Maju',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Desainer UI/UX di Creatorin punya pemahaman kuat soal conversion rate dan systems thinking. Desain landing page kami selesai dalam 4 hari kerja dengan hasil revisi yang minimal.'
  }
];


export const HomePage: React.FC<HomePageProps> = ({
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
    if (onViewCreatorProfile) {
      onViewCreatorProfile(creator);
    } else {
      router.push(`/creator/${creator.id}`);
    }
  };

  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | undefined>(undefined);
  
  // Clean explore section state (matching Dribbble reference)
  const [activeExploreTab, setActiveExploreTab] = useState<'proyek' | 'creator' | 'layanan'>('creator');
  const [exploreSearch, setExploreSearch] = useState('');
  const [selectedPopularTag, setSelectedPopularTag] = useState<string | null>(null);
  const [exploreSort, setExploreSort] = useState<'populer' | 'likes' | 'views' | 'terbaru'>('populer');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [likedProjects, setLikedProjects] = useState<Record<string, boolean>>({});
  const [savedProjects, setSavedProjects] = useState<Record<string, boolean>>({});
  const [isBriefBannerVisible, setIsBriefBannerVisible] = useState(true);

  // Lightbox modal state for project card click
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [followingCreators, setFollowingCreators] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, Array<{ user: string; text: string; time: string }>>>({});
  const [commentInput, setCommentInput] = useState('');

  // Popular search tags matching reference screenshot
  const POPULAR_SEARCH_TAGS = [
    'Dashboard', 
    'Landing Page', 
    'Mobile App', 
    'Portfolio', 
    'Ecommerce', 
    'Animation', 
    'Illustration', 
    'Onboarding'
  ];

  // Filtered preview projects (up to 8 items for a 4x2 grid like reference)
  const displayProjects = useMemo(() => {
    let list = [...MOCK_FEED_PROJECTS];
    if (exploreSearch.trim()) {
      const q = exploreSearch.toLowerCase();
      list = list.filter(p => 
        (p.title?.toLowerCase() || '').includes(q) ||
        (p.creator?.name?.toLowerCase() || '').includes(q) ||
        (p.category?.toLowerCase() || '').includes(q) ||
        (p.tags || []).some(t => (t?.toLowerCase() || '').includes(q))
      );
    }
    if (selectedPopularTag) {
      const tagQuery = selectedPopularTag.toLowerCase();
      list = list.filter(p => 
        (p.title?.toLowerCase() || '').includes(tagQuery) ||
        (p.category?.toLowerCase() || '').includes(tagQuery) ||
        (p.tags || []).some(t => (t?.toLowerCase() || '').includes(tagQuery))
      );
    }
    if (exploreSort === 'likes') {
      list.sort((a, b) => b.likesCount - a.likesCount);
    } else if (exploreSort === 'views') {
      const parseV = (v?: string | number) => {
        if (!v) return 0;
        const str = String(v).toLowerCase();
        const n = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (str.includes('k')) return n * 1000;
        if (str.includes('m')) return n * 1000000;
        return n || 0;
      };
      list.sort((a, b) => parseV(b.viewsCount) - parseV(a.viewsCount));
    } else if (exploreSort === 'terbaru') {
      list.reverse();
    } else {
      // Populer: Urutkan berdasarkan interaksi tertinggi (sesuai ExploreProjectsPage)
      list.sort((a, b) => ((b.sharesCount || 0) + b.likesCount) - ((a.sharesCount || 0) + a.likesCount));
    }
    return list.slice(0, 8);
  }, [exploreSearch, selectedPopularTag, exploreSort]);

  // Filtered preview creators (up to 8 items)
  const displayCreators = useMemo(() => {
    let list = [...MOCK_CREATORS];
    if (exploreSearch.trim()) {
      const q = exploreSearch.toLowerCase();
      list = list.filter(c => 
        (c.name?.toLowerCase() || '').includes(q) ||
        (c.roleTitle?.toLowerCase() || '').includes(q) ||
        (c.skills || []).some(s => (s?.toLowerCase() || '').includes(q))
      );
    }
    if (selectedPopularTag) {
      const tagQuery = selectedPopularTag.toLowerCase();
      list = list.filter(c => 
        (c.roleTitle?.toLowerCase() || '').includes(tagQuery) ||
        (c.skills || []).some(s => (s?.toLowerCase() || '').includes(tagQuery))
      );
    }
    return list.slice(0, 8);
  }, [exploreSearch, selectedPopularTag]);

  // Aggregated top services with creator details
  interface ServiceWithCreator extends CreatorService {
    creator: Creator;
  }
  const displayServices: ServiceWithCreator[] = useMemo(() => {
    const list: ServiceWithCreator[] = [];
    MOCK_CREATORS.forEach((cr) => {
      if (cr.services && cr.services.length > 0) {
        cr.services.forEach((srv) => {
          list.push({ ...srv, creator: cr });
        });
      }
    });

    let filtered = list;
    if (exploreSearch.trim()) {
      const q = exploreSearch.toLowerCase();
      filtered = filtered.filter(s => 
        (s.title?.toLowerCase() || '').includes(q) ||
        (s.tag && s.tag.toLowerCase().includes(q)) ||
        (s.creator?.category?.toLowerCase() || '').includes(q) ||
        (s.creator?.name?.toLowerCase() || '').includes(q)
      );
    }
    if (selectedPopularTag) {
      const tagQuery = selectedPopularTag.toLowerCase();
      filtered = filtered.filter(s => 
        (s.title?.toLowerCase() || '').includes(tagQuery) ||
        (s.creator?.category?.toLowerCase() || '').includes(tagQuery) ||
        (s.tag && s.tag.toLowerCase().includes(tagQuery))
      );
    }
    return filtered.slice(0, 8);
  }, [exploreSearch, selectedPopularTag]);

  const toggleLikeProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSaveProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full bg-white text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">
      <main className="w-full">
        
        {/* ========================================================================= */}
        {/* HERO SECTION (Full Section, Clean & Modern) */}
        {/* ========================================================================= */}
        <section className="w-full relative pt-12 sm:pt-20 pb-12 sm:pb-16 overflow-hidden bg-white border-b border-neutral-200/70">
          
          {/* Clear & Visible Aesthetic Canvas Background Pattern */}
          <div className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden" aria-hidden="true">
            {/* Soft Ambient Light Glow in Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1100px] h-[360px] sm:h-[480px] bg-gradient-to-tr from-blue-100/35 via-indigo-50/40 to-blue-50/50 rounded-full blur-3xl pointer-events-none" />

            {/* Clean & Elegant Architectural Grid Lines (No Dots) across full width */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
                maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 95%)'
              }}
            />
          </div>
          
          {/* Centered Hero Header Block */}
          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 px-6 lg:px-8">
            
            {/* Sleek, Modern Hero Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                <Sparkles className="w-3 h-3 text-blue-600" />
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-[#0d0c22] tracking-tight">
                Platform Kolaborasi Kreatif
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline-block" />
              <span className="text-xs sm:text-[13px] font-normal text-neutral-500 hidden sm:inline">
                Marketplace Jasa Digital & UMKM
              </span>
            </div>

            {/* Focal Point Large Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] text-[#0d0c22] tracking-tight leading-[1.12] sm:leading-[1.14]">
              <span className="font-extrabold">Temukan</span>{' '}
              <span className="font-medium text-neutral-800">Talenta Kreatif</span>,{' '}
              <br className="hidden sm:inline" />
              <span className="font-medium text-neutral-800">Wujudkan</span>{' '}
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent font-extrabold">
                Ide Digital
              </span>.
            </h1>

            {/* Concise Value Proposition Description */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.
            </p>

            {/* Dual CTA Buttons (Jelajahi Creator & Tawarkan Keahlian) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 sm:pt-3">
              <button
                type="button"
                onClick={() => navigateTo('landing', '/landing')}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-sm sm:text-base font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Jelajah Creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('projects', '/explore/projects')}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white hover:bg-neutral-50 text-[#0d0c22] text-sm sm:text-base font-bold transition-all border border-neutral-300 hover:border-neutral-400 shadow-2xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Tawarkan Keahlian</span>
              </button>
            </div>

          </div>

        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: EKSPLORASI DENGAN FILTER AKTIF (Proyek, Creator, Layanan) */}
        {/* Desain Bersih & Elegan Sesuai Referensi (Shots / Designers / Services) */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-6 sm:pt-8 pb-10 sm:pb-14">
          
          {/* Baris 1: Segmented Pill Tabs (Creator, Layanan, Proyek) */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveExploreTab('creator')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeExploreTab === 'creator'
                  ? 'bg-[#f3f3f4] text-[#0d0c22] font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Creator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveExploreTab('layanan')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeExploreTab === 'layanan'
                  ? 'bg-[#f3f3f4] text-[#0d0c22] font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Layanan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveExploreTab('proyek')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeExploreTab === 'proyek'
                  ? 'bg-[#f3f3f4] text-[#0d0c22] font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Proyek</span>
            </button>
          </div>

          {/* Baris 2: Clean Wide Pill Search Bar (Persis Gambar Referensi) */}
          <div className="relative w-full mb-4">
            <div className="w-full flex items-center justify-between rounded-full bg-[#f4f4f6] sm:bg-[#f3f3f4] hover:bg-white hover:border-neutral-300 focus-within:bg-white focus-within:border-[#0d0c22] border border-neutral-200/80 px-4 sm:px-6 py-2.5 sm:py-3.5 transition-all shadow-2xs">
              <input
                type="text"
                value={exploreSearch}
                onChange={(e) => setExploreSearch(e.target.value)}
                placeholder="What type of design are you interested in?"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#0d0c22] placeholder:text-neutral-500 focus:outline-none pr-3"
              />
              <div className="flex items-center gap-2 shrink-0">
                {exploreSearch && (
                  <button
                    type="button"
                    onClick={() => setExploreSearch('')}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ea4c89] hover:bg-[#d63f7a] active:scale-95 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Cari"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Baris 3: Popular Chips & Following/Sort Dropdown (Persis Gambar Referensi) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
            {/* Popular tags list */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs sm:text-sm font-bold text-[#0d0c22] shrink-0">
                Popular:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                {POPULAR_SEARCH_TAGS.map((tag) => {
                  const isActive = selectedPopularTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedPopularTag(isActive ? null : tag)}
                      className={`px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-[#0d0c22] text-white border border-[#0d0c22] shadow-2xs font-semibold'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-[#0d0c22]'
                      }`}
                    >
                      {tag.toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Sort / Following Dropdown */}
            <div className="relative shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white hover:border-neutral-300 text-xs font-semibold text-neutral-700 transition cursor-pointer shadow-2xs"
              >
                <span>
                  {exploreSort === 'populer' && 'Following'}
                  {exploreSort === 'likes' && 'Terbanyak Disukai'}
                  {exploreSort === 'views' && 'Terbanyak Dilihat'}
                  {exploreSort === 'terbaru' && 'Terbaru'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                  {[
                    { id: 'populer', label: 'Following' },
                    { id: 'likes', label: 'Terbanyak Disukai' },
                    { id: 'views', label: 'Terbanyak Dilihat' },
                    { id: 'terbaru', label: 'Terbaru' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setExploreSort(s.id as any);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                        exploreSort === s.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                      }`}
                    >
                      <span>{s.label}</span>
                      {exploreSort === s.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: PROYEK / SHOTS (Persis Tampilan Gambar Referensi) */}
          {activeExploreTab === 'proyek' && (
            <div>
              {displayProjects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-600">Tidak ada proyek yang cocok dengan kata kunci atau filter.</p>
                  <button
                    onClick={() => { setExploreSearch(''); setSelectedPopularTag(null); }}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 animate-in fade-in duration-200">
                  {displayProjects.map((proj) => {
                    const isLiked = likedProjects[proj.id];
                    const isSaved = savedProjects[proj.id];

                    return (
                      <div
                        key={proj.id}
                        id={`feed-card-${proj.id}`}
                        onClick={() => {
                          setSelectedProject(proj);
                          setCurrentCarouselIndex(0);
                          setIsVideoPlaying(true);
                        }}
                        className="group relative aspect-[4/5] rounded-[4px] sm:rounded-[6px] overflow-hidden bg-neutral-900 cursor-pointer select-none transition-all duration-200 shadow-2xs hover:shadow-lg"
                      >
                        {/* Media Cover Image (Edge to Edge, Uniform 4:5) */}
                        <img
                          src={proj.coverImage}
                          alt={proj.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center "
                          loading="lazy"
                        />

                        {/* Top-Right Media Badge (Play for Video, Stacked Cards for Carousel - matching screenshot) */}
                        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 pointer-events-none">
                          {proj.mediaType === 'video' ? (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/45 backdrop-blur-md flex items-center justify-center text-white shadow-xs border border-white/15">
                              <Play className="w-3 h-3 fill-white text-white translate-x-[0.5px]" />
                            </div>
                          ) : proj.mediaType === 'carousel' ? (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/45 backdrop-blur-md flex items-center justify-center text-white shadow-xs border border-white/15">
                              <Layers className="w-3 h-3 text-white" />
                            </div>
                          ) : null}
                        </div>

                        {/* Bottom Static Title & Creator Vignette (Clean and Unobtrusive - matching screenshot) */}
                        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-200">
                          <p className="text-white text-xs sm:text-[13px] font-bold line-clamp-2 leading-snug drop-shadow-md">
                            {proj.title}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-white/80 text-[10px] sm:text-[11px]">
                            <span className="font-semibold truncate max-w-[130px]">{proj.socialHandle || proj.creator.name}</span>
                            <span className="shrink-0 opacity-80">{proj.viewsCount}</span>
                          </div>
                        </div>

                        {/* Hover Overlay (Instagram Explore Interactive Peek - matching ExploreProjectsPage) */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 sm:p-4 flex flex-col justify-between text-white z-20">
                          {/* Top Creator Header */}
                          <div className="flex items-center justify-between">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreatorClick(proj.creator);
                              }}
                              className="flex items-center gap-2 group/author cursor-pointer min-w-0"
                            >
                              <img
                                src={proj.creator.avatar}
                                alt={proj.creator.name}
                                className="w-7 h-7 rounded-full object-cover border border-white/50 shrink-0"
                              />
                              <div className="text-left min-w-0">
                                <p className="text-xs font-bold group-hover/author:underline leading-tight truncate">
                                  {proj.creator.name}
                                </p>
                                <p className="text-[10px] text-neutral-300 font-mono truncate">
                                  {proj.socialHandle}
                                </p>
                              </div>
                            </div>

                            {/* Quick Save Bookmark */}
                            <button
                              onClick={(e) => toggleSaveProject(proj.id, e)}
                              className={`p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                                isSaved ? 'bg-white text-black' : 'bg-white/25 text-white hover:bg-white/35'
                              }`}
                              title={isSaved ? "Tersimpan" : "Simpan Proyek"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-black text-black' : 'text-white'}`} />
                            </button>
                          </div>

                          {/* Center Title & Category Tag */}
                          <div className="my-auto text-center px-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-white/10">
                              {proj.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-extrabold line-clamp-3 leading-snug">
                              {proj.title}
                            </h4>
                          </div>

                          {/* Bottom Stats & Engagement (Likes, Comments, Views) */}
                          <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-white/20">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => toggleLikeProject(proj.id, e)}
                                className="flex items-center gap-1.5 hover:text-rose-400 transition cursor-pointer"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                                <span>{proj.likesCount + (isLiked ? 1 : 0)}</span>
                              </button>
                              <div className="flex items-center gap-1 text-white/90">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{proj.commentsCount}</span>
                              </div>
                            </div>

                            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-300">
                              {proj.viewsCount} views
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Tombol Aksi Lihat Semua Proyek */}
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => navigateTo('projects', '/explore/projects')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <span>Jelajah Semua Karya di Feed Proyek</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
            </div>
          )}

          {/* TAB 2: CREATOR / DESIGNERS (Persis Showcase Card Halaman Jelajah > Profil Creator) */}
          {activeExploreTab === 'creator' && (
            <div>
              {displayCreators.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-600">Tidak ada creator yang cocok dengan pencarian.</p>
                  <button
                    onClick={() => { setExploreSearch(''); setSelectedPopularTag(null); }}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {displayCreators.map((creator) => {
                    const isSaved = savedProjects[`creator-${creator.id}`];

                    // Siapkan 4 kartu layanan seperti di halaman Jelajah > Profil Creator
                    const defaultServices = [
                      {
                        id: `srv-${creator.id}-1`,
                        title: `1x Layanan Konten ${creator.category === 'Video' ? 'Reels & TikTok UGC' : 'Feed & Desain Visual'}`,
                        formattedPrice: creator.formattedRate.replace('/proyek', '').replace('/video', '').replace('/sesi', ''),
                        price: creator.startingRate,
                        coverImage: creator.portfolioSamples?.[0]?.thumbnail || '/creatorin/service-pattern-1.png',
                        tag: creator.category === 'Video' ? 'UGC Video' : 'Design',
                        deliveryDays: '2 Hari Kerja'
                      },
                      {
                        id: `srv-${creator.id}-2`,
                        title: `Paket Lengkap Promosi Brand UMKM`,
                        formattedPrice: `Rp${(creator.startingRate * 2).toLocaleString('id-ID')}`,
                        price: creator.startingRate * 2,
                        coverImage: creator.portfolioSamples?.[1]?.thumbnail || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
                        tag: 'Paket Brand',
                        deliveryDays: '3 Hari Kerja'
                      },
                      {
                        id: `srv-${creator.id}-3`,
                        title: `Campaign Visual & Konten Prioritas`,
                        formattedPrice: `Rp${(creator.startingRate * 3).toLocaleString('id-ID')}`,
                        price: creator.startingRate * 3,
                        coverImage: creator.portfolioSamples?.[2]?.thumbnail || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
                        tag: 'Campaign',
                        deliveryDays: '5 Hari Kerja'
                      },
                      {
                        id: `srv-${creator.id}-4`,
                        title: `Layanan Custom & Retainer Bulanan`,
                        formattedPrice: `Rp${(creator.startingRate * 4).toLocaleString('id-ID')}`,
                        price: creator.startingRate * 4,
                        coverImage: creator.portfolioSamples?.[3]?.thumbnail || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
                        tag: 'Custom Retainer',
                        deliveryDays: '7 Hari Kerja'
                      }
                    ];

                    const servicesList = (creator.services && creator.services.length >= 4)
                      ? creator.services.slice(0, 4)
                      : (creator.services && creator.services.length > 0)
                        ? [...creator.services, ...defaultServices.slice(creator.services.length)].slice(0, 4)
                        : defaultServices;

                    return (
                      <div
                        key={creator.id}
                        id={`creator-card-${creator.id}`}
                        onClick={() => handleCreatorClick(creator)}
                        className="group bg-white rounded-[24px] border border-[rgba(229,229,229,0.8)] p-6 sm:p-8 transition-all shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] cursor-pointer text-left"
                      >
                        {/* BARIS 1: Header Profil Kreator, Badges, Rating & Tombol Hubungi */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                          
                          {/* Identitas Kreator */}
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Avatar Kreator dengan Badge */}
                            <div className="relative shrink-0">
                              <img
                                src={creator.avatar}
                                alt={creator.name}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#f5f5f5]"
                              />
                              {creator.careerScore.overall >= 95 && (
                                <div className="absolute left-12 top-12 bg-[#0d0c22] text-white p-1 rounded-full">
                                  <ShieldCheck className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Detail Nama & Status Promoted */}
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-[20px] font-bold leading-7 tracking-[-0.95px] text-[#0d0c22] group-hover:text-blue-600 transition-colors truncate">
                                  {creator.name}
                                </h3>

                                {creator.proBadge && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#0d0c22] text-white tracking-[0.62px] leading-[15px]">
                                    PRO+
                                  </span>
                                )}

                                {creator.selectBadge && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#2b2a45] text-white tracking-[0.62px] leading-[15px]">
                                    SELECT
                                  </span>
                                )}

                                <div className="flex items-center gap-1 text-[12px] leading-4 font-bold text-[#262626]">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span>{creator.careerScore.clientRating}</span>
                                  <span className="text-[#a1a1a1] font-normal">({creator.careerScore.completedProjects})</span>
                                </div>

                                <div className="flex items-center gap-1 pl-1 text-[12px] leading-4 font-semibold text-[#404040]">
                                  <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[3]" />
                                  <span>{creator.careerScore.completedProjects} proyek selesai</span>
                                </div>

                                {creator.isPromoted && (
                                  <span className="pl-1 text-[11px] leading-[16.5px] font-medium text-[#a1a1a1] tracking-[0.06px]">
                                    Promoted
                                  </span>
                                )}
                              </div>

                              {/* Sub-info Row (Harga, Lokasi, Skor, Layanan) */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] leading-4 text-[#737373]">
                                <span className="font-semibold text-[#262626]">
                                  Mulai {creator.formattedRate}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#0d0c22]" />
                                  {creator.location}
                                </span>
                                <span>•</span>
                                <span>
                                  <strong className="font-semibold text-[#0d0c22]">{creator.careerScore.overall}%</strong>{' '}
                                  <span className="font-medium">Skor Karir</span>
                                </span>
                                <span>•</span>
                                <span>{creator.servicesAvailableCount || 8} Layanan tersedia</span>
                              </div>
                            </div>
                          </div>

                          {/* Sisi Kanan: Bookmark & Tombol "Hubungi" */}
                          <div className="flex items-center gap-2.5 self-end xl:self-center shrink-0">
                            {/* Save Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSavedProjects(prev => ({
                                  ...prev,
                                  [`creator-${creator.id}`]: !prev[`creator-${creator.id}`]
                                }));
                              }}
                              className={`p-2.5 rounded-full border transition cursor-pointer ${
                                isSaved 
                                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
                              }`}
                              title="Simpan Kreator"
                            >
                              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                            </button>

                            {/* Tombol Get in touch */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetCreatorForBrief(creator);
                                setIsBriefModalOpen(true);
                              }}
                              className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-[#2b2a45] text-white text-[14px] leading-5 font-semibold tracking-[-0.15px] transition-all shadow-[0_1px_0_rgba(0,0,0,0.05)] cursor-pointer flex items-center gap-2"
                            >
                              <span>Hubungi</span>
                            </button>
                          </div>
                        </div>

                        {/* BARIS 2: Card Layanan Kreator (4 Card Layanan) */}
                        <div className="mt-5 pt-4 border-t border-[#f5f5f5]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {servicesList.map((service, srvIdx) => {
                              const imageSrc = service.coverImage || 
                                creator.portfolioSamples?.[srvIdx % (creator.portfolioSamples?.length || 1)]?.thumbnail ||
                                '/creatorin/service-pattern-1.png';

                              return (
                                <div
                                  key={service.id}
                                  id={`service-card-${service.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTargetCreatorForBrief(creator);
                                    setIsBriefModalOpen(true);
                                  }}
                                  className="group/srv flex flex-col cursor-pointer text-left select-none"
                                >
                                  {/* Cover Image Preview (Clean Rounded) */}
                                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#171717] relative shadow-[0_1px_0_rgba(0,0,0,0.05)] group-hover/srv:shadow-md transition-all duration-300">
                                    <img
                                      src={imageSrc}
                                      alt={service.title}
                                      className="w-full h-full object-cover "
                                      loading="lazy"
                                    />
                                    {service.tag && (
                                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold leading-[15px] px-2.5 py-0.5 rounded-full tracking-[0.37px]">
                                        {service.tag}
                                      </div>
                                    )}
                                  </div>

                                  {/* Clean Title & Price Below Image */}
                                  <div className="pt-3 px-0.5">
                                    <h4 className="text-[14px] font-bold leading-[19.25px] tracking-[-0.15px] text-[#0d0c22] group-hover/srv:text-blue-600 transition-colors line-clamp-1">
                                      {service.title}
                                    </h4>

                                    <div className="flex items-center justify-between gap-3 pt-1.5">
                                      <span className="text-[14px] font-black leading-[21px] text-[#0d0c22] tracking-[-0.5px]">
                                        {service.formattedPrice}
                                      </span>
                                      <span className="text-[11px] leading-[16.5px] text-[#a1a1a1] font-medium tracking-[0.06px] whitespace-nowrap">
                                        {service.deliveryDays || '2-3 Hari'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#f5f5f5]">
                          <div className="flex flex-wrap items-center gap-2">
                            {creator.skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-[#f5f5f5] px-3 py-1 font-sans text-[12px] font-medium leading-4 text-[#404040]"
                              >
                                {skill}
                              </span>
                            ))}
                            {creator.skills.length > 5 && (
                              <span className="font-sans text-[12px] font-medium leading-4 text-[#a1a1a1]">
                                +{creator.skills.length - 5} keahlian lainnya
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {/* Tombol Aksi Lihat Semua Creator */}
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => navigateTo('landing', '/landing')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <span>Jelajah Semua Creator Terverifikasi</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LAYANAN / SERVICES (Persis Grid Showcase Style) */}
          {activeExploreTab === 'layanan' && (
            <div>
              {displayServices.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-600">Tidak ada layanan yang cocok dengan pencarian.</p>
                  <button
                    onClick={() => { setExploreSearch(''); setSelectedPopularTag(null); }}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 animate-in fade-in duration-200">
                  {displayServices.map((srv) => (
                    <div
                      key={srv.id}
                      id={`service-shot-${srv.id}`}
                      onClick={() => navigateTo('services', '/explore/services')}
                      className="group flex flex-col text-left cursor-pointer select-none"
                    >
                      {/* Media Cover Image Card (Aspect 4:3 matching screenshot) */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shadow-2xs group-hover:shadow-md transition-all duration-300">
                        <img
                          src={srv.coverImage || '/creatorin/service-pattern-1.png'}
                          alt={srv.title}
                          className="w-full h-full object-cover "
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />

                        {/* Tag pill overlay top left */}
                        {srv.tag && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold tracking-tight shadow-xs">
                              {srv.tag}
                            </span>
                          </div>
                        )}

                        {/* Delivery time pill overlay bottom left */}
                        {srv.deliveryDays && (
                          <div className="absolute bottom-3 left-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0d0c22] text-[11px] font-bold shadow-xs">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              {srv.deliveryDays}
                            </span>
                          </div>
                        )}

                        {/* Hover action overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                          <span className="px-4 py-2 rounded-full bg-white text-[#0d0c22] text-xs font-bold shadow-lg hover:bg-neutral-100 transition flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>Pesan Layanan</span>
                          </span>
                        </div>
                      </div>

                      {/* Metadata below image */}
                      <div className="mt-3 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#0d0c22] group-hover:text-blue-600 transition-colors truncate">
                          {srv.title}
                        </h4>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          {/* Creator Info */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img
                              src={srv.creator.avatar}
                              alt={srv.creator.name}
                              className="w-5 h-5 rounded-full object-cover border border-neutral-200 shrink-0"
                            />
                            <span className="text-xs font-semibold text-neutral-700 truncate max-w-[120px]">
                              {srv.creator.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-neutral-200 text-neutral-700 shrink-0">
                              PRO
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs sm:text-sm font-extrabold text-[#0d0c22]">
                              {srv.formattedPrice}
                            </span>
                            <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Tombol Aksi Lihat Semua Layanan */}
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => navigateTo('services', '/explore/services')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <span>Eksplorasi Katalog Layanan Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

          {/* Floating Start a Project Brief Banner (Persis Gambar Referensi) */}
          {isBriefBannerVisible && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl sm:rounded-full py-2.5 px-4 sm:px-6 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 truncate">
                  <strong className="text-[#0d0c22] font-bold">Start a Project Brief</strong>{' '}
                  <span className="hidden sm:inline text-neutral-500">— Tell us what you need and find the right talent for your project.</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTargetCreatorForBrief(undefined);
                    setIsBriefModalOpen(true);
                  }}
                  className="px-4 py-1.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => setIsBriefBannerVisible(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                  title="Tutup banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Project Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => {
          setIsBriefModalOpen(false);
          setTargetCreatorForBrief(undefined);
        }}
        preselectedCreator={targetCreatorForBrief}
      />

      {/* Project Detail / Full Preview Modal matching requested design */}
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
    </div>
  );
};
