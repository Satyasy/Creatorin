'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { ProjectCard } from '@/components/common/ProjectCard';
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
        'settings': '/settings',
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
  const [scrollY, setScrollY] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check reduced motion preference for accessibility
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Responsive mobile breakpoint check
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // High performance 60fps scroll throttling with requestAnimationFrame
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

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
    <div className="w-full bg-white text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white">
      <main className="w-full">
        
        {/* ========================================================================= */}
        {/* HERO SECTION (Full Section, Clean & Modern) */}
        {/* ========================================================================= */}
        <section className="w-full relative pt-12 sm:pt-20 pb-12 sm:pb-16 overflow-hidden bg-white border-b border-neutral-200/70">
          
          {/* Clear & Visible Aesthetic Canvas Background Pattern */}
          <div className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden" aria-hidden="true">
            {/* Soft Ambient Light Glow in Center with Depth Parallax */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1100px] h-[360px] sm:h-[480px] bg-gradient-to-tr from-blue-100/35 via-indigo-50/40 to-blue-50/50 rounded-full blur-3xl pointer-events-none transition-transform duration-75 ease-out will-change-transform" 
              style={{
                transform: isReducedMotion ? 'translate(-50%, -50%)' : `translate3d(-50%, calc(-50% + ${Math.min(scrollY * 0.10, 50)}px), 0)`
              }}
            />

            {/* Clean & Elegant Architectural Grid Lines (No Dots) across full width with Subtle Parallax */}
            <div 
              className="absolute inset-0 transition-transform duration-75 ease-out will-change-transform"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
                maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 95%)',
                transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * 0.05, 30)}px, 0)`
              }}
            />

            {/* Siluet Logo Creatorin di Kanan Bawah Hero dengan Brand Blue Gradient & Subtle Parallax Glow */}
            <div 
              className="absolute -right-14 -bottom-16 sm:-right-8 sm:-bottom-12 md:right-4 md:-bottom-10 lg:right-12 lg:-bottom-8 w-[280px] h-[264px] sm:w-[360px] sm:h-[340px] md:w-[420px] md:h-[396px] lg:w-[460px] lg:h-[434px] transition-transform duration-100 ease-out pointer-events-none select-none z-0 will-change-transform"
              style={{
                transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * (isMobile ? 0.12 : 0.26), 115)}px, 0) scale(${1 + Math.min(scrollY * 0.00018, 0.035)})`
              }}
            >
              {/* Soft ambient back-glow behind logo silhouette */}
              <div 
                className="absolute inset-4 bg-gradient-to-br from-[#03ACFD]/25 to-[#155DFC]/20 rounded-full blur-3xl pointer-events-none transition-transform duration-100 ease-out will-change-transform" 
                style={{
                  transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * 0.16, 75)}px, 0)`
                }}
              />

              {/* Exact Vector Silhouette from /creatorin/logo.svg */}
              <svg 
                className="w-full h-full opacity-22 hover:opacity-28 transition-opacity duration-300 drop-shadow-[0_8px_24px_rgba(21,93,252,0.14)]"
                preserveAspectRatio="xMidYMid meet" 
                viewBox="0 0 34.0608 32.0987" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="heroSilhouetteGrad" x1="0" y1="0" x2="34.0946" y2="32.0625" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#03ACFD" />
                    <stop offset="100%" stopColor="#155DFC" />
                  </linearGradient>
                </defs>
                <g id="HeroSilhouetteGroup">
                  <path 
                    d="M14.6734 0.0488397C18.7039 -0.282822 23.0405 1.08602 26.0613 3.81028C26.5593 4.25946 27.6061 5.08781 27.6893 5.75197C27.4144 6.16801 23.2771 9.3333 22.6847 9.63686C22.3105 9.68873 21.1521 8.52521 20.7703 8.27595C18.4935 6.78937 15.5157 6.44004 12.9225 7.2802C10.6474 8.03042 8.75853 9.64478 7.66348 11.7749C6.53453 14.0432 6.34872 16.6657 7.14658 19.0704C8.95844 24.552 15.4014 26.8895 20.3742 24.0882C20.973 23.7509 21.9305 22.8136 22.4582 22.6384C22.9989 22.6663 23.5835 23.2309 24.0215 23.5793C24.5722 23.9612 27.473 26.1816 27.5847 26.6874C27.5058 26.9069 27.3749 27.1226 27.2159 27.2925C24.5564 30.1343 20.9762 31.7154 17.1923 32.0416C13.0028 32.3977 8.84287 31.0799 5.62316 28.3767C2.3748 25.6087 0.369138 21.6568 0.0529795 17.4017C-0.2919 13.1385 1.05699 8.91102 3.80765 5.63477C6.63166 2.2969 10.3192 0.409821 14.6734 0.0488397Z" 
                    fill="url(#heroSilhouetteGrad)"
                  />
                  <path 
                    d="M32.6835 8.85233C33.6489 8.76102 34.0639 9.38588 34.0608 10.2843C34.0475 14.1416 34.058 17.9999 34.055 21.8571C34.0548 22.1165 34.0134 22.5461 33.9078 22.7814C33.7895 23.0436 33.5727 23.2488 33.3042 23.3524C33.1384 23.4162 32.8513 23.4493 32.694 23.3928C31.0498 22.8015 29.2454 21.876 27.6298 21.1666C26.5103 20.6598 25.306 20.1396 24.2207 19.5768C25.1105 16.9299 24.9622 15.2492 24.2082 12.6704C25.2979 11.9441 28.0197 10.9228 29.3051 10.3275C30.2018 9.91205 31.7883 9.15612 32.6835 8.85233Z" 
                    fill="url(#heroSilhouetteGrad)"
                  />
                  <path 
                    d="M15.5208 11.5434L15.718 11.6074C15.8182 11.6933 16.5366 13.4837 16.5753 13.6856C16.8702 15.2244 19.6345 15.347 19.9995 16.1661C19.7267 16.6701 18.1637 16.709 17.2472 17.6616C16.1409 18.8114 16.3239 19.854 15.7305 20.7154C14.9942 20.2653 15.0904 18.5706 14.1839 17.6671C13.4863 16.9718 11.4852 16.6321 11.3551 16.0757C11.604 15.6531 12.6313 15.4483 13.1556 15.2045C14.9666 14.3626 14.9254 13.1063 15.5208 11.5434Z" 
                    fill="url(#heroSilhouetteGrad)"
                  />
                </g>
              </svg>
            </div>
          </div>
          
          {/* Centered Hero Header Block with Subtle Fore-Parallax */}
          <div 
            className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 transition-transform duration-75 ease-out will-change-transform"
            style={{
              transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * (isMobile ? 0.02 : 0.045), 24)}px, 0)`
            }}
          >
            
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

            {/* Focal Point Display Headline (Display 64/72 according to design.md §3) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#0F172A] tracking-tight leading-[1.125] lg:leading-[72px]">
              <span className="font-bold">Temukan</span>{' '}
              <span className="font-medium text-[#171717]">Talenta Kreatif</span>,{' '}
              <br className="hidden sm:inline" />
              <span className="font-medium text-[#171717]">Wujudkan</span>{' '}
              <span className="bg-gradient-to-r from-[#155DFC] to-[#05A4FD] bg-clip-text text-transparent font-bold">
                Ide Digital
              </span>.
            </h1>

            {/* Concise Value Proposition Description */}
            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed font-normal">
              Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.
            </p>

            {/* Dual CTA Buttons (Height 48px, rounded-xl 12px according to design.md §7, §8) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <button
                type="button"
                onClick={() => navigateTo('landing', '/landing')}
                className="w-full sm:w-auto h-12 px-7 sm:px-8 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-base font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Jelajah Creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('projects', '/explore/projects')}
                className="w-full sm:w-auto h-12 px-7 sm:px-8 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-base font-semibold transition-colors border border-[#E2E8F0] hover:border-[#64748B] shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tawarkan Keahlian</span>
              </button>
            </div>

            {/* Scroll Down Indicator with Bouncing Mouse Wheel & Smooth Scroll Interaction */}
            <div className="pt-6 sm:pt-10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const exploreSec = document.getElementById('explore-section');
                  if (exploreSec) {
                    exploreSec.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 hover:bg-white border border-neutral-200/90 hover:border-[#155DFC]/40 text-xs font-semibold text-neutral-500 hover:text-[#155DFC] transition-all cursor-pointer shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#155DFC]/20"
                aria-label="Gulir ke bawah untuk menjelajahi karya"
              >
                {/* Mouse Outline with Animated Wheel Dot */}
                <span className="relative flex items-start justify-center w-3.5 h-5 pt-0.5 border-[1.5px] border-neutral-400 group-hover:border-[#155DFC] rounded-full transition-colors">
                  <span className="w-1 h-1 bg-[#155DFC] rounded-full animate-bounce" />
                </span>
                <span className="tracking-tight">Jelajahi Karya</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#155DFC] group-hover:translate-y-0.5 transition-all" />
              </button>
            </div>

          </div>

        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: EKSPLORASI DENGAN FILTER AKTIF (Proyek, Creator, Layanan) */}
        {/* Desain Bersih & Elegan Sesuai Referensi (Shots / Designers / Services) */}
        {/* ========================================================================= */}
        <section id="explore-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          
          {/* Baris 1: Segmented Tabs (Creator, Layanan, Proyek) */}
          <div className="flex items-center gap-2 mb-5">
            <button
              type="button"
              onClick={() => setActiveExploreTab('creator')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeExploreTab === 'creator'
                  ? 'bg-[#F3F3F4] text-[#0F172A] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Creator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveExploreTab('layanan')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeExploreTab === 'layanan'
                  ? 'bg-[#F3F3F4] text-[#0F172A] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Layanan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveExploreTab('proyek')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeExploreTab === 'proyek'
                  ? 'bg-[#F3F3F4] text-[#0F172A] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-200">
                    {displayProjects.map((proj, idx) => {
                      const colIndex = idx % 4;
                      const colMultiplier = colIndex === 0 ? -1 : colIndex === 1 ? 1 : colIndex === 2 ? -0.5 : 0.5;
                      const cardOffset = isReducedMotion
                        ? 0
                        : isMobile
                          ? (idx % 2 === 0 ? -3 : 3)
                          : colMultiplier * Math.min(scrollY * 0.028, 16);

                      return (
                        <div
                          key={proj.id}
                          className="transition-transform duration-100 ease-out will-change-transform"
                          style={{
                            transform: cardOffset ? `translate3d(0, ${cardOffset}px, 0)` : undefined,
                          }}
                        >
                          <ProjectCard
                            id={`feed-card-${proj.id}`}
                            project={proj}
                            isSaved={Boolean(savedProjects[proj.id])}
                            onToggleSave={(id, e) => toggleSaveProject(id, e)}
                            onClick={() => {
                              setSelectedProject(proj);
                              setCurrentCarouselIndex(0);
                              setIsVideoPlaying(true);
                            }}
                          />
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
                        coverImage: creator.portfolioSamples?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
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
                                  <span
                                    className="uppercase px-2 py-0.5 rounded bg-[#0d0c22] tracking-[0.62px] leading-[15px]"
                                    style={{
                                      color: '#FFF',
                                      fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                                      fontSize: '10px',
                                      fontStyle: 'normal',
                                      fontWeight: 900,
                                    }}
                                  >
                                    PRO
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
                                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80';
                              const colMultiplier = srvIdx === 0 ? -0.8 : srvIdx === 1 ? 0.8 : srvIdx === 2 ? -0.4 : 0.4;
                              const serviceOffset = isReducedMotion
                                ? 0
                                : isMobile
                                  ? 0
                                  : colMultiplier * Math.min(scrollY * 0.02, 12);

                              return (
                                <div
                                  key={service.id}
                                  id={`service-card-${service.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTargetCreatorForBrief(creator);
                                    setIsBriefModalOpen(true);
                                  }}
                                  className="group/srv flex flex-col cursor-pointer text-left select-none transition-transform duration-100 ease-out will-change-transform"
                                  style={{
                                    transform: serviceOffset ? `translate3d(0, ${serviceOffset}px, 0)` : undefined,
                                  }}
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
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
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
                  {displayServices.map((srv, idx) => {
                    const colIndex = idx % 4;
                    const colMultiplier = colIndex === 0 ? -1 : colIndex === 1 ? 1 : colIndex === 2 ? -0.5 : 0.5;
                    const cardOffset = isReducedMotion
                      ? 0
                      : isMobile
                        ? (idx % 2 === 0 ? -3 : 3)
                        : colMultiplier * Math.min(scrollY * 0.026, 15);

                    return (
                      <div
                        key={srv.id}
                        id={`service-shot-${srv.id}`}
                        onClick={() => navigateTo('services', '/explore/services')}
                        className="group flex flex-col text-left cursor-pointer select-none transition-transform duration-100 ease-out will-change-transform"
                        style={{
                          transform: cardOffset ? `translate3d(0, ${cardOffset}px, 0)` : undefined,
                        }}
                      >
                      {/* Media Cover Image Card (Aspect 4:3 matching screenshot) */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shadow-2xs group-hover:shadow-md transition-all duration-300">
                        <img
                          src={srv.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'}
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
                    );
                  })}
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
                  <span className="hidden sm:inline text-neutral-500">: Tell us what you need and find the right talent for your project.</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTargetCreatorForBrief(undefined);
                    setIsBriefModalOpen(true);
                  }}
                  className="h-8 px-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
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
