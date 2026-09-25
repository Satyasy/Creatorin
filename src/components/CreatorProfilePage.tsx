import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  MoreHorizontal, 
  Check, 
  MessageSquare, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Eye, 
  Heart, 
  ChevronDown, 
  Zap, 
  ExternalLink, 
  Copy, 
  Mail, 
  Send, 
  X, 
  FolderPlus,
  Layers,
  Award,
  CheckCircle2,
  Calendar,
  DollarSign,
  ThumbsUp,
  SlidersHorizontal,
  Bookmark,
  Play,
  MessageCircle,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Tag,
  BarChart3,
  TrendingUp,
  Activity,
  User,
  Laptop,
  Globe,
  Dribbble,
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Creator, CreatorService, PortfolioItem, AuthState, ActivePage, FeedProject } from '../types';
import { Navbar } from './Navbar';
import { CareerScoreBadge } from './CareerScoreBadge';
import { ProjectBriefModal } from './ProjectBriefModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ServiceDetailModal } from './ServiceDetailModal';
import { MOCK_FEED_PROJECTS } from '../data/mockFeedProjects';

interface CreatorProfilePageProps {
  creator: Creator;
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate: (page: ActivePage) => void;
  onSelectCreator?: (creator: Creator) => void;
}

type ProfileTab = 'work' | 'services' | 'reviews' | 'statistics' | 'liked' | 'about';
type ShotFilter = 'all' | 'recent' | 'popular' | 'views' | 'video' | 'carousel';

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  creator,
  currentUser,
  onSignOut,
  onNavigate,
  onSelectCreator
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<ProfileTab>('work');
  const [shotFilter, setShotFilter] = useState<ShotFilter>('recent');
  const [reviewFilter, setReviewFilter] = useState<'recent' | 'highest'>('recent');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  // Follow state
  const [isFollowing, setIsFollowing] = useState(true);
  const [followersCount, setFollowersCount] = useState(creator.followersCount || 4827);
  const followingCount = creator.followingCount ?? 4;
  const [likesCount, setLikesCount] = useState(creator.likesCount ?? 0);

  // Modals state
  const [selectedShotForModal, setSelectedShotForModal] = useState<PortfolioItem | null>(null);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<CreatorService | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<CreatorService | null>(null);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);

  // Saved shots / projects in profile
  const [likedShots, setLikedShots] = useState<Set<string>>(new Set());
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());
  const [savedServiceIds, setSavedServiceIds] = useState<Set<string>>(new Set());
  const [activeMediaIndexes, setActiveMediaIndexes] = useState<{ [id: string]: number }>({});
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<FeedProject | null>(null);
  const [isDetailMuted, setIsDetailMuted] = useState(true);
  const [detailMediaIndex, setDetailMediaIndex] = useState(0);

  // Handle follow toggle
  const toggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  // Toggle like on shot/project
  const toggleLikeShot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedShots(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setLikesCount(l => Math.max(0, l - 1));
      } else {
        next.add(id);
        setLikesCount(l => l + 1);
      }
      return next;
    });
  };

  // Toggle bookmark on project
  const toggleSaveProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProjectIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle bookmark on service
  const toggleSaveService = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedServiceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLinkSuccess(true);
    setIsMoreMenuOpen(false);
    setTimeout(() => setCopiedLinkSuccess(false), 3000);
  };

  // Send message handler
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;
    setInquirySentSuccess(true);
    setTimeout(() => {
      setInquirySentSuccess(false);
      setIsGetInTouchOpen(false);
      setInquiryMessage('');
      if (onNavigate) {
        onNavigate('chat');
      }
    }, 1200);
  };

  // Convert creator's portfolioItems or mock feed projects into FeedProject models matching ExploreProjectsPage
  const creatorProjects = useMemo<FeedProject[]>(() => {
    // Check if MOCK_FEED_PROJECTS has projects by this creator
    const creatorNameLower = (creator?.name || '').toLowerCase();
    const creatorHandle = creator?.handle || '';
    const creatorHandleClean = creatorHandle ? creatorHandle.toLowerCase().replace('@', '') : '';
    const creatorHandleAlt = (creator?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const matchedFeedProjects = MOCK_FEED_PROJECTS.filter(p => {
      const pCreatorId = p.creator?.id;
      const pCreatorName = (p.creator?.name || '').toLowerCase();
      const pCreatorHandle = (p.creator?.handle || '').toLowerCase().replace('@', '');
      const pSocialHandle = (p.socialHandle || '').toLowerCase().replace('@', '');

      if (pCreatorId && creator.id && pCreatorId === creator.id) return true;
      if (creatorNameLower && pCreatorName && (pCreatorName === creatorNameLower || pCreatorName.includes(creatorNameLower) || creatorNameLower.includes(pCreatorName))) return true;
      if (creatorHandleClean && pCreatorHandle && pCreatorHandle === creatorHandleClean) return true;
      if (creatorHandleClean && pSocialHandle && pSocialHandle === creatorHandleClean) return true;
      if (creatorHandleAlt && pSocialHandle && (pSocialHandle.includes(creatorHandleAlt) || creatorHandleAlt.includes(pSocialHandle))) return true;
      return false;
    });

    const parseNumber = (val?: string | number) => {
      if (!val) return 100;
      if (typeof val === 'number') return val;
      const str = String(val).toLowerCase();
      if (str.includes('k')) return Math.round(parseFloat(str) * 1000);
      if (str.includes('m')) return Math.round(parseFloat(str) * 1000000);
      return parseInt(str.replace(/[^0-9.]/g, '')) || 100;
    };

    if (matchedFeedProjects.length > 0) {
      return matchedFeedProjects.map((p, idx): FeedProject => {
        const baseLikes = p.likesCount || 1400;
        const baseViews = parseNumber(p.viewsCount) || 32000;
        const baseComments = p.commentsCount || 84;
        const baseShares = p.sharesCount || 32;
        const cover = p.coverImage || (p as any).mediaUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80';
        const carousel = p.carouselImages && p.carouselImages.length > 0 
          ? p.carouselImages 
          : (p.additionalMedia && p.additionalMedia.length > 0 ? p.additionalMedia : [cover]);

        return {
          ...p,
          id: p.id || `proj-matched-${idx}`,
          title: p.title,
          description: p.caption || p.description || `Proyek komersial berkualitas tinggi oleh ${creator.name} mengintegrasikan estetika visual dan performa konten optimal.`,
          category: p.category || 'Desain Grafis',
          tags: p.tags && p.tags.length > 0 ? p.tags.map(t => t.replace('#', '')) : ['Portfolio', 'UI/UX', 'Trending'],
          mediaType: p.mediaType || 'image',
          coverImage: cover,
          mediaUrl: cover,
          aspectRatio: p.aspectRatio || '4/5',
          carouselImages: carousel,
          additionalMedia: carousel,
          creator: {
            ...creator,
            ...(p.creator || {}),
            handle: p.creator?.handle || p.socialHandle || creator.handle || `@${(creator.name || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            verified: p.creator?.verified ?? creator.verified ?? true
          },
          likesCount: baseLikes,
          commentsCount: baseComments,
          sharesCount: baseShares,
          viewsCount: typeof p.viewsCount === 'string' ? p.viewsCount : `${Math.round(baseViews / 1000)}k`,
          stats: {
            likes: baseLikes,
            comments: baseComments,
            shares: baseShares,
            views: baseViews
          },
          servicesUsed: p.servicesUsed || (creator.services && creator.services.length > 0 ? [
            {
              serviceId: creator.services[0].id,
              serviceTitle: creator.services[0].title,
              price: creator.services[0].price
            }
          ] : undefined),
          toolsUsed: p.toolsUsed || ['Figma', 'Framer', 'After Effects'],
          createdAt: p.postedDate || '2025-02-15'
        };
      });
    }

    // Convert creator portfolio items to FeedProject shape
    const baseSamples: PortfolioItem[] = (creator.portfolioSamples && creator.portfolioSamples.length > 0)
      ? creator.portfolioSamples
      : [
          {
            id: 'shot-1',
            title: 'Synoria AI Platform - Next-Gen Autonomous Web Suite',
            categoryTag: 'Website Design',
            thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            likes: '1.4k',
            views: '32.5k'
          },
          {
            id: 'shot-2',
            title: 'Shotline - Hi, I\'m Elian! Professional Visuals & Lookbook',
            categoryTag: 'Portfolio Site',
            thumbnail: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            likes: '2.8k',
            views: '48.1k'
          },
          {
            id: 'shot-3',
            title: 'Novaire - Minimalist Designer & Motion Visual System',
            categoryTag: 'Branding & UI',
            thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            likes: '3.1k',
            views: '64.0k'
          },
          {
            id: 'shot-4',
            title: 'FinEdge - Next-Gen Banking & Crypto Asset Mobile App',
            categoryTag: 'Mobile App',
            thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000&auto=format&fit=crop&q=80',
            type: 'video',
            likes: '920',
            views: '19.4k'
          },
          {
            id: 'shot-5',
            title: 'Kuro Artisan Coffee - Packaging & Social Content B-Roll',
            categoryTag: 'F&B Branding',
            thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80',
            type: 'video',
            likes: '1.7k',
            views: '38.2k'
          },
          {
            id: 'shot-6',
            title: 'Lumina Skincare - E-Commerce Landing Page & UGC Campaign',
            categoryTag: 'E-Commerce',
            thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            likes: '2.4k',
            views: '51.9k'
          },
          {
            id: 'shot-7',
            title: 'Aura Studio - Architectural Lighting & Minimal Space Design',
            categoryTag: 'Interior & 3D',
            thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            likes: '3.8k',
            views: '72.1k'
          },
          {
            id: 'shot-8',
            title: 'Zenith Watch Co - Luxury Chronograph Identity & Product Reel',
            categoryTag: 'Product Design',
            thumbnail: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            likes: '4.2k',
            views: '89.4k'
          }
        ];

    return baseSamples.map((shot, idx): FeedProject => {
      const isVid = shot.type === 'video';
      const isCarousel = idx % 3 === 1;
      const baseLikes = parseNumber(shot.likes);
      const baseViews = parseNumber(shot.views);
      const imgThumb = shot.thumbnail || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80';
      const carouselImgs = isCarousel ? [
        imgThumb,
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80'
      ] : [imgThumb];

      return {
        id: shot.id || `proj-${idx}`,
        title: shot.title,
        description: `Proyek komersial berkualitas tinggi oleh ${creator.name} mengintegrasikan desain presisi tinggi dan aset visual siap pakai.`,
        category: shot.categoryTag || 'Desain Grafis',
        tags: [shot.categoryTag, 'Portfolio', 'UI/UX', 'Trending'].filter(Boolean) as string[],
        mediaType: isVid ? 'video' : (isCarousel ? 'carousel' : 'image'),
        coverImage: imgThumb,
        mediaUrl: imgThumb,
        aspectRatio: '4/5',
        carouselImages: carouselImgs,
        additionalMedia: carouselImgs,
        creator: {
          ...creator,
          handle: creator.handle || `@${(creator.name || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          verified: creator.verified ?? true
        },
        likesCount: baseLikes,
        commentsCount: Math.floor(baseLikes * 0.08) + 12,
        sharesCount: Math.floor(baseLikes * 0.04) + 6,
        viewsCount: shot.views || `${Math.round(baseViews / 1000)}k`,
        stats: {
          likes: baseLikes,
          comments: Math.floor(baseLikes * 0.08) + 12,
          shares: Math.floor(baseLikes * 0.04) + 6,
          views: baseViews
        },
        servicesUsed: creator.services && creator.services.length > 0 ? [
          {
            serviceId: creator.services[0].id,
            serviceTitle: creator.services[0].title,
            price: creator.services[0].price
          }
        ] : undefined,
        toolsUsed: ['Figma', 'Framer', 'After Effects'],
        createdAt: '2025-02-15'
      };
    });
  }, [creator]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let projects = [...creatorProjects];
    if (shotFilter === 'video') {
      projects = projects.filter(p => p.mediaType === 'video');
    } else if (shotFilter === 'carousel') {
      projects = projects.filter(p => p.mediaType === 'carousel');
    } else if (shotFilter === 'popular') {
      projects = projects.sort((a, b) => (b.stats?.likes ?? b.likesCount ?? 0) - (a.stats?.likes ?? a.likesCount ?? 0));
    } else if (shotFilter === 'views') {
      projects = projects.sort((a, b) => (b.stats?.views ?? 0) - (a.stats?.views ?? 0));
    }
    return projects;
  }, [creatorProjects, shotFilter]);

  const heroHeading = creator.heroHeadline || creator.roleTitle || 'Selling premium Figma & Framer templates. Follow for more.';

  return (
    <div className="min-h-screen bg-white text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">
      
      {/* Top Main Navigation */}
      <Navbar 
        currentUser={currentUser}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
        onOpenBriefModal={() => setIsBriefModalOpen(true)}
      />

      {/* Copy Notification */}
      {copiedLinkSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d0c22] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Tautan profil berhasil disalin ke clipboard!</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* HERO SECTION (Style Exactly Matching The Uploaded Screenshot) */}
      {/* ==================================================================== */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
        {/* Rounded Top Banner Card */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden bg-[#f3f3f4] h-44 sm:h-56 md:h-64 lg:h-72">
        </div>

        {/* Squircle Avatar & Action Bar Row */}
        <div className="relative px-2 sm:px-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 md:-mt-20 z-20">
          
          {/* Circular Avatar */}
          <div className="relative inline-block self-start">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1 sm:p-1.5 bg-white shadow-xl shadow-black/8 ring-1 ring-neutral-900/5">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {creator.proBadge && (
              <div 
                className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-[#0d0c22] text-white p-1.5 rounded-full ring-3 ring-white shadow-xs" 
                title="Pro Creator Verified"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}
          </div>

          {/* Action Buttons Row (Right Aligned, Style from Reference Image) */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-end pb-1">
            
            {/* Button 1: More Options (...) */}
            <div className="relative">
              <button
                id="btn-more-options"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-10 h-10 rounded-full bg-[#f3f3f4] hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Opsi Lainnya"
                title="Opsi Lainnya"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-50 text-left">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleCopyLink();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-neutral-400" />
                    <span>Salin Tautan Profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsBriefModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Kirim Proyek Brief</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsGetInTouchOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span>Hubungi via Pesan</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      alert(`Profil ${creator.name} telah diverifikasi oleh tim Creatorin.`);
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Verifikasi Talent</span>
                  </button>
                </div>
              )}
            </div>

            {/* Button 2: Follow Toggle Button */}
            <button
              id="btn-follow-toggle"
              onClick={toggleFollow}
              className={`px-5 py-2 sm:py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isFollowing
                  ? 'border-neutral-300 bg-white text-[#0d0c22] hover:bg-neutral-50'
                  : 'border-[#0d0c22] bg-[#0d0c22] text-white hover:bg-neutral-800'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>

            {/* Button 3: Primary Solid Black CTA Button (Kirim Pesan) */}
            <button
              id="btn-send-message-primary"
              onClick={() => setIsGetInTouchOpen(true)}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-900 text-white text-xs sm:text-sm font-bold transition shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirim Pesan</span>
            </button>

          </div>

        </div>

        {/* Creator Identity & Meta Stats Block (Below Avatar) */}
        <div className="mt-3.5 sm:mt-4 px-2 sm:px-4 text-left">
          
          {/* Name & Badges */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0d0c22] tracking-tight">
              {creator.name}
            </h1>
            {creator.verified && (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 fill-blue-600 text-white" />
            )}
            {creator.careerScore?.overall >= 95 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#0d0c22] text-white">
                PRO+
              </span>
            )}
          </div>

          {/* Tagline / Headline (Directly Below Name, Clean & Concise) */}
          <p className="text-sm sm:text-base text-neutral-600 font-normal mt-1 max-w-2xl leading-relaxed">
            {creator.heroHeadline || creator.roleTitle || 'Design in business. Business in design.'}
          </p>

          {/* Inline Stats Row (Matching Style: 12.234 Students 293 Online 13 Admins) */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-neutral-500 mt-2.5 font-medium">
            <span>
              <strong className="text-[#0d0c22] font-black">
                {creator.stats?.completedProjects || '142+'}
              </strong>{' '}
              Proyek Selesai
            </span>
            <span>
              <strong className="text-[#0d0c22] font-black">
                {creator.rating || '4.9'} ★
              </strong>{' '}
              ({creator.reviewCount || 98} Ulasan)
            </span>
            <span>
              <strong className="text-[#0d0c22] font-black">
                {followersCount.toLocaleString()}
              </strong>{' '}
              Pengikut
            </span>
            <span>
              <strong className="text-[#0d0c22] font-black">
                {creator.careerScore?.overall || 98}%
              </strong>{' '}
              Skor Karir
            </span>
            <span className="text-neutral-400">
              <MapPin className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-neutral-400" />
              {creator.location || 'Indonesia'}
            </span>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* TAB NAVIGATION BAR (Work, Services, Reviews, Collections, Liked Shots, About) */}
      {/* ==================================================================== */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-3">
          
          {/* Tabs Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            
            {/* Proyek Tab (Formerly Work) */}
            <button
              onClick={() => setActiveTab('work')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'work'
                  ? 'bg-[#f3f3f4] font-semibold text-[#0d0c22]'
                  : 'text-neutral-700 font-medium hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Proyek</span>
              <span className="text-[11px] font-medium text-neutral-500">
                {filteredProjects.length || 3}
              </span>
            </button>

            {/* Services Tab */}
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-[#f3f3f4] font-semibold text-[#0d0c22]'
                  : 'text-neutral-700 font-medium hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              <span>Services</span>
              <span className="text-[11px] font-medium text-neutral-500">
                {creator.services?.length || 4}
              </span>
            </button>

            {/* Reviews Tab */}
            <button
              id="tab-btn-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#f3f3f4] font-semibold text-[#0d0c22]'
                  : 'text-neutral-700 font-medium hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Ulasan
            </button>

            {/* Skor Rekam Jejak Tab (Formerly Statistik) */}
            <button
              id="tab-btn-statistics"
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                activeTab === 'statistics'
                  ? 'bg-[#f3f3f4] font-semibold text-[#0d0c22]'
                  : 'text-neutral-700 font-medium hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Skor Rekam Jejak
            </button>

            {/* Liked Shots Tab */}
            <button
              onClick={() => setActiveTab('liked')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                activeTab === 'liked'
                  ? 'bg-[#f3f3f4] font-semibold text-[#0d0c22]'
                  : 'text-neutral-700 font-medium hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Liked Shots
            </button>

            {/* About Tab */}
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-[#f3f3f4] font-semibold text-[#0d0c22]'
                  : 'text-neutral-700 font-medium hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              About
            </button>
          </div>

          {/* Right Side: Shot/Project Filters Dropdown */}
          {activeTab === 'work' && (
            <div className="relative self-end sm:self-center">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-xs sm:text-sm font-bold text-[#0d0c22] flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {shotFilter === 'all' && 'Semua Proyek'}
                  {shotFilter === 'recent' && 'Terbaru'}
                  {shotFilter === 'popular' && 'Paling Populer'}
                  {shotFilter === 'views' && 'Paling Banyak Dilihat'}
                  {shotFilter === 'video' && 'Format Video'}
                  {shotFilter === 'carousel' && 'Format Carousel'}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 text-left">
                  <button
                    onClick={() => { setShotFilter('all'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${shotFilter === 'all' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Semua Proyek
                  </button>
                  <button
                    onClick={() => { setShotFilter('recent'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${shotFilter === 'recent' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Terbaru
                  </button>
                  <button
                    onClick={() => { setShotFilter('popular'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${shotFilter === 'popular' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Paling Populer
                  </button>
                  <button
                    onClick={() => { setShotFilter('views'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${shotFilter === 'views' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Paling Banyak Dilihat
                  </button>
                  <button
                    onClick={() => { setShotFilter('video'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${shotFilter === 'video' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Format Video
                  </button>
                  <button
                    onClick={() => { setShotFilter('carousel'); setIsFilterDropdownOpen(false); }}
                    className={`w-full px-4 py-2 text-xs font-semibold text-left hover:bg-neutral-50 ${shotFilter === 'carousel' ? 'text-blue-600 font-bold bg-neutral-50' : 'text-neutral-700'}`}
                  >
                    Format Carousel
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB CONTENT AREA */}
      {/* ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ----------------- TAB 1: PROYEK (EXPLORE PROJECTS CARD DESIGN) ----------------- */}
        {activeTab === 'work' && (
          <div>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100">
                <Briefcase className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-[#0d0c22]">Tidak Ada Proyek Ditemukan</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Belum ada proyek yang cocok dengan filter yang dipilih. Coba pilih filter lainnya.
                </p>
                <button
                  onClick={() => setShotFilter('all')}
                  className="mt-4 px-4 py-2 bg-[#0d0c22] text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition cursor-pointer"
                >
                  Tampilkan Semua Proyek
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProjects.map((project) => {
                  const isLiked = likedShots.has(project.id);
                  const isSaved = savedProjectIds.has(project.id);
                  const currentMediaIdx = activeMediaIndexes[project.id] || 0;
                  const displayMedia = project.mediaType === 'carousel' && project.additionalMedia
                    ? project.additionalMedia[currentMediaIdx] || project.mediaUrl
                    : project.mediaUrl;

                  const handleText = project.socialHandle || (project.creator?.handle?.startsWith('@') 
                    ? project.creator.handle 
                    : `@${project.creator?.handle || creator.username || creator.name.toLowerCase().replace(/\s+/g, '')}`);

                  const viewsFormatted = project.viewsCount || `${Math.round((project.stats?.views || 85400) / 1000)}K`;

                  return (
                    <div
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectForDetail(project);
                        setDetailMediaIndex(0);
                      }}
                      className="group relative aspect-[4/5] rounded-2xl sm:rounded-[22px] overflow-hidden bg-neutral-900 border border-neutral-200/40 hover:border-neutral-300/80 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none"
                    >
                      {/* Full-bleed Media Cover (Edge-to-Edge) */}
                      <img
                        src={displayMedia}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Top Right Media Badge: Circular dark translucent button with icon (matching screenshot) */}
                      <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                        {project.mediaType === 'video' ? (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-sm">
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white translate-x-[1px]" />
                          </div>
                        ) : project.mediaType === 'carousel' ? (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-sm">
                            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                        ) : null}
                      </div>

                      {/* Quick Save Bookmark button on hover */}
                      <div className="absolute top-3.5 left-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveProject(project.id, e);
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
                            isSaved 
                              ? 'bg-amber-500 text-white shadow-md' 
                              : 'bg-black/50 hover:bg-black/80 text-white border border-white/15'
                          }`}
                          title={isSaved ? 'Hapus Simpan' : 'Simpan Proyek'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom Static Overlay: 2-line title + creator handle + views (Always visible matching screenshot) */}
                      <div className="absolute inset-x-0 bottom-0 pt-16 pb-3.5 sm:pb-4 px-3.5 sm:px-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10 flex flex-col justify-end">
                        <p className="text-white text-[13px] sm:text-[14px] font-bold line-clamp-2 leading-snug drop-shadow-sm mb-1.5">
                          {project.title}
                        </p>
                        <div className="flex items-center justify-between text-white/80 text-[11px] sm:text-xs font-normal">
                          <span className="truncate max-w-[68%] font-medium">
                            {handleText}
                          </span>
                          <span className="shrink-0 font-medium tracking-tight">
                            {viewsFormatted}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: SERVICES ----------------- */}
        {activeTab === 'services' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0d0c22]">Layanan & Paket Jasa</h3>
                <p className="text-xs text-neutral-500 mt-1">Pesan layanan langsung dengan proteksi pembayaran escrow Creatorin</p>
              </div>

              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#0d0c22] text-white text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
              >
                + Minta Penawaran Kustom
              </button>
            </div>

            {(!creator.services || creator.services.length === 0) ? (
              <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-12 text-center">
                <Sparkles className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-[#0d0c22]">Belum Ada Paket Layanan Standar</h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
                  Kreator ini melayani proyek kustom sesuai kebutuhan spesifik Anda.
                </p>
                <button
                  onClick={() => setIsBriefModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-bold"
                >
                  Buat Brief Proyek
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {creator.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-300 hover:shadow-lg transition-all p-4 sm:p-5 flex flex-col justify-between text-left group"
                  >
                    <div>
                      {/* Cover Thumbnail */}
                      {srv.coverImage && (
                        <div 
                          onClick={() => setSelectedServiceForDetail(srv)}
                          className="aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-4 cursor-pointer"
                          title="Lihat detail layanan"
                        >
                          <img 
                            src={srv.coverImage} 
                            alt={srv.title} 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                          />
                        </div>
                      )}

                      {srv.tag && (
                        <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider inline-block mb-2.5">
                          {srv.tag}
                        </span>
                      )}

                      <h4 
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="text-base sm:text-[17px] font-bold text-[#0d0c22] mb-1.5 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors"
                        title="Lihat detail layanan"
                      >
                        {srv.title}
                      </h4>

                      <p 
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4 cursor-pointer"
                      >
                        {srv.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                      </p>

                      <div 
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                        <span>Estimasi: {srv.deliveryDays ? (srv.deliveryDays.toLowerCase().includes('hari') ? srv.deliveryDays : `${srv.deliveryDays} Hari Kerja`) : '2-3 Hari Kerja'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 gap-2">
                      <div onClick={() => setSelectedServiceForDetail(srv)} className="cursor-pointer min-w-0">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">HARGA</span>
                        <span className="text-sm sm:text-base font-black text-[#0d0c22] truncate block">{srv.formattedPrice}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Tombol Icon Simpan */}
                        <button
                          type="button"
                          onClick={(e) => toggleSaveService(srv.id, e)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition cursor-pointer flex items-center justify-center ${
                            savedServiceIds.has(srv.id)
                              ? 'border-amber-300 bg-amber-50 text-amber-600'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-neutral-600'
                          }`}
                          title={savedServiceIds.has(srv.id) ? 'Tersimpan' : 'Simpan layanan'}
                          aria-label="Simpan layanan"
                        >
                          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${savedServiceIds.has(srv.id) ? 'fill-amber-500 text-amber-500' : 'stroke-[1.75]'}`} />
                        </button>

                        {/* Tombol Diskusikan */}
                        <button
                          type="button"
                          onClick={() => setSelectedServiceForOrder(srv)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs hover:shadow-sm cursor-pointer"
                        >
                          Diskusikan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: REVIEWS / ULASAN ----------------- */}
        {activeTab === 'reviews' && (() => {
          const baseReviews = [
            {
              id: 'rev-1',
              clientName: 'Sarah Kurniawan',
              clientRole: 'Founder, GlowLab Skincare',
              clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              projectTitle: 'Desain Landing Page & Mobile UI Kit Kosmetik',
              rating: 5.0,
              completedDate: '12 September 2026',
              comment: 'Kerja sama yang sangat memuaskan dari awal brief hingga serah terima. Mas Munir sangat responsif di room chat Creatorin, memahami kebutuhan visual brand kami tanpa perlu banyak revisi, dan deliverable Figma-nya terstruktur rapi untuk tim developer kami. Sangat direkomendasikan untuk brand yang butuh eksekusi visual premium.',
              timestamp: 1789200000,
            },
            {
              id: 'rev-2',
              clientName: 'Budi Pratama',
              clientRole: 'Marketing Lead, Kopi Karsa',
              clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              projectTitle: 'Redesign Website Interaktif & Brand Guideline',
              rating: 5.0,
              completedDate: '28 Agustus 2026',
              comment: 'Hasil pengerjaan website Framer-nya jauh melampaui ekspektasi. Interaksi animasinya sangat halus dan konversi campaign kopi kami naik drastis sejak peluncuran. Seluruh revisi diselesaikan tepat waktu sesuai timeline yang disepakati bersama.',
              timestamp: 1788000000,
            },
            {
              id: 'rev-3',
              clientName: 'Amanda Larasati',
              clientRole: 'Co-Founder, Zenita Fashion',
              clientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
              projectTitle: 'Desain E-Commerce UI & Seasonal Campaign Banner',
              rating: 5.0,
              completedDate: '15 Agustus 2026',
              comment: 'Sangat profesional dan terbiasa dengan standar komersial tinggi. Komunikasi selama pengerjaan di Creatorin sangat transparan, file aset rapi, dan brief langsung diterjemahkan ke estetika visual yang modern dan elegan.',
              timestamp: 1787000000,
            },
            {
              id: 'rev-4',
              clientName: 'Farhan Mahendra',
              clientRole: 'Product Manager, FinPay Digital',
              clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              projectTitle: 'SaaS Dashboard Design System & Component Library',
              rating: 5.0,
              completedDate: '29 Juli 2026',
              comment: 'Design system yang dibangun sangat komprehensif mulai dari typography token, color hierarchy, hingga reusable components. Tim engineer kami sangat terbantu dengan kerapian dokumentasi dan kepatuhan terhadap deadline.',
              timestamp: 1785500000,
            },
            {
              id: 'rev-5',
              clientName: 'Jessica Tanuwidjaja',
              clientRole: 'Creative Director, Artisan Goods Co.',
              clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
              projectTitle: 'Webflow Portfolio & Digital Brand Identity',
              rating: 4.9,
              completedDate: '14 Juli 2026',
              comment: 'Salah satu kreator paling solutif yang pernah kami ajak kerja sama. Bukan hanya mengeksekusi apa yang tertulis di brief, tapi juga aktif memberikan masukan cerdas untuk pengalaman pengguna yang lebih baik.',
              timestamp: 1784000000,
            },
            {
              id: 'rev-6',
              clientName: 'Dimas Wicaksono',
              clientRole: 'Founder, TeknoVibe Studio',
              clientAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
              projectTitle: 'Landing Page Promosi Aplikasi Mobile',
              rating: 5.0,
              completedDate: '30 Juni 2026',
              comment: 'Proses serah terima cepat, zero drama, dan langsung siap dideploy ke produksi. Komitmen terhadap deadline dan akurasi brief benar-benar terbukti sepanjang kolaborasi di platform ini.',
              timestamp: 1782500000,
            }
          ];

          const sortedReviews = [...baseReviews].sort((a, b) => {
            if (reviewFilter === 'highest') {
              return b.rating - a.rating;
            }
            return b.timestamp - a.timestamp;
          });

          return (
            <div className="w-full text-left space-y-6">
              
              {/* Header Ulasan Bersih */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-neutral-200/80">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0d0c22] tracking-tight">
                    Ulasan Klien
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
                    Seluruh testimoni berasal dari kolaborasi proyek yang telah selesai dan diserahterimakan di Creatorin.
                  </p>
                </div>

                {/* Filter Sederhana Tanpa Nuansa Dashboard */}
                <div className="flex items-center gap-1 bg-[#f3f3f4] p-1 rounded-xl text-xs font-medium self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setReviewFilter('recent')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      reviewFilter === 'recent'
                        ? 'bg-white text-[#0d0c22] shadow-xs font-semibold'
                        : 'text-neutral-600 hover:text-[#0d0c22]'
                    }`}
                  >
                    Terbaru
                  </button>
                  <button
                    onClick={() => setReviewFilter('highest')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      reviewFilter === 'highest'
                        ? 'bg-white text-[#0d0c22] shadow-xs font-semibold'
                        : 'text-neutral-600 hover:text-[#0d0c22]'
                    }`}
                  >
                    Rating Tertinggi
                  </button>
                </div>
              </div>

              {/* List Sederhana Ulasan Klien dengan Spacing Lega dan Divider Tipis */}
              <div className="divide-y divide-neutral-200/70">
                {sortedReviews.map((rev) => (
                  <div key={rev.id} className="py-7 sm:py-8 first:pt-2 space-y-3.5">
                    
                    {/* Baris Klien & Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={rev.clientAvatar}
                          alt={rev.clientName}
                          className="w-10 h-10 rounded-full object-cover bg-neutral-100 shrink-0 border border-neutral-200/60 mt-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-semibold text-[#0d0c22]">
                              {rev.clientName}
                            </span>
                            {rev.clientRole && (
                              <span className="text-xs text-neutral-500 font-normal">
                                • {rev.clientRole}
                              </span>
                            )}
                          </div>
                          
                          {/* Nama Proyek & Tanggal Selesai */}
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 flex-wrap">
                            <span className="font-medium text-neutral-800">
                              Proyek: {rev.projectTitle}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span>Selesai {rev.completedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bintang Rating */}
                      <div className="flex items-center gap-1 self-start sm:self-auto shrink-0 pt-0.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(rev.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-neutral-200 text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-[#0d0c22] ml-1">
                          {Number(rev.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Komentar Ulasan (Fokus Utama) */}
                    <p className="text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal pt-1">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                  </div>
                ))}
              </div>

            </div>
          );
        })()}

        {/* ----------------- TAB 4: SKOR REKAM JEJAK ----------------- */}
        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 text-left w-full pt-2">
            
            {/* Sisi Kiri: Skor Utama (Focal Point), 3 Aspek Penilaian, & Statistik Pendukung */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. Skor Utama sebagai Focal Point */}
              <div>
                <div className="flex items-baseline gap-2.5 sm:gap-3.5 flex-wrap">
                  <span className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0d0c22] tracking-tight">
                    92 <span className="text-xl sm:text-2xl font-normal text-neutral-400">/ 100</span>
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-neutral-700">
                    — Skor Rekam Jejak
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-neutral-600 leading-relaxed font-normal mt-3 max-w-2xl">
                  Dihitung otomatis oleh sistem Creatorin berdasarkan aktivitas nyata, mencakup respons komunikasi di room chat, kelancaran eksekusi proyek, ketepatan waktu serah terima, dan ulasan terverifikasi dari klien.
                </p>
              </div>

              {/* Divider Line identik dengan About */}
              <hr className="border-neutral-200/80 my-8" />

              {/* 2. Breakdown Sederhana 3 Aspek */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-5">Aspek Rekam Jejak</h3>
                <div className="space-y-6">
                  
                  {/* Aspek 1: Respons & Profesionalitas */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm font-medium text-neutral-800">Respons & Profesionalitas</span>
                      <span className="text-sm font-semibold text-[#0d0c22]">
                        94 <span className="text-xs font-normal text-neutral-400">/ 100</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f3f3f4] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0d0c22] rounded-full transition-all duration-500" 
                        style={{ width: '94%' }} 
                      />
                    </div>
                    <span className="text-xs text-neutral-500 block mt-1.5">
                      Kecepatan membalas pesan, kejelasan koordinasi brief, dan etika komunikasi profesional.
                    </span>
                  </div>

                  {/* Aspek 2: Performa Proyek */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm font-medium text-neutral-800">Performa Proyek</span>
                      <span className="text-sm font-semibold text-[#0d0c22]">
                        93 <span className="text-xs font-normal text-neutral-400">/ 100</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f3f3f4] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0d0c22] rounded-full transition-all duration-500" 
                        style={{ width: '93%' }} 
                      />
                    </div>
                    <span className="text-xs text-neutral-500 block mt-1.5">
                      Kesesuaian hasil akhir dengan ruang lingkup brief, akurasi deadline, dan efisiensi revisi.
                    </span>
                  </div>

                  {/* Aspek 3: Kepuasan Klien */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm font-medium text-neutral-800">Kepuasan Klien</span>
                      <span className="text-sm font-semibold text-[#0d0c22]">
                        89 <span className="text-xs font-normal text-neutral-400">/ 100</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f3f3f4] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0d0c22] rounded-full transition-all duration-500" 
                        style={{ width: '89%' }} 
                      />
                    </div>
                    <span className="text-xs text-neutral-500 block mt-1.5">
                      Tingkat penerimaan deliverable final tanpa kendala serta konsistensi feedback positif.
                    </span>
                  </div>

                </div>
              </div>

              {/* Divider Line identik dengan About */}
              <hr className="border-neutral-200/80 my-8" />

              {/* 3. Statistik Pendukung Ringkas (Clean, Angka sebagai Focal Point, Whitespace Luas) */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-4">Statistik Pendukung</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pt-1">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#0d0c22] tracking-tight block">
                      28
                    </span>
                    <span className="text-sm font-medium text-neutral-700 block mt-1">Project Selesai</span>
                    <span className="text-xs text-neutral-500 block mt-0.5">Tuntas serah terima</span>
                  </div>

                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#0d0c22] tracking-tight block">
                      95%
                    </span>
                    <span className="text-sm font-medium text-neutral-700 block mt-1">Tepat Waktu</span>
                    <span className="text-xs text-neutral-500 block mt-0.5">Sesuai kesepakatan</span>
                  </div>

                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#0d0c22] tracking-tight block">
                      &lt; 1 Jam
                    </span>
                    <span className="text-sm font-medium text-neutral-700 block mt-1">Rata-rata Respons</span>
                    <span className="text-xs text-neutral-500 block mt-0.5">Respon aktif chat</span>
                  </div>

                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[#0d0c22] tracking-tight block">
                      4.8 <span className="text-base font-normal text-neutral-400">/ 5</span>
                    </span>
                    <span className="text-sm font-medium text-neutral-700 block mt-1">Rating Kepuasan</span>
                    <span className="text-xs text-neutral-500 block mt-0.5">Ulasan klien verified</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sisi Kanan: Status Sistem Otomatis, Transparansi, & Sumber Penilaian (Identik dengan Sisi Kanan About) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Kartu Status Otomatis & Keamanan (Gaya Kartu Kanan di About) */}
              <div className="bg-[#fafafa] rounded-2xl p-5 sm:p-6 space-y-3.5 border border-neutral-100 text-sm text-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#0d0c22] text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    ✓
                  </div>
                  <span>Terverifikasi Otomatis</span>
                </div>

                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Berdasarkan Transaksi Nyata</span>
                </div>

                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Tanpa Input Manual Kreator</span>
                </div>
              </div>

              {/* Penjelasan Transparansi Rekam Jejak */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#0d0c22] mb-2.5">Tentang Skor Rekam Jejak</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  Skor diperbarui secara berkala oleh algoritma Creatorin berdasarkan riwayat transaksi yang valid. Sistem ini memberikan transparansi objektif bagi klien tanpa membebani kreator untuk mengisi data sendiri.
                </p>
              </div>

              {/* Sumber Data Penilaian (Gaya Pill Tags di About) */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#0d0c22] mb-3">Sumber Data Penilaian</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Aktivitas Chat',
                    'Ketepatan Tenggat',
                    'Kelancaran Revisi',
                    'Penyelesaian Escrow',
                    'Feedback Klien'
                  ].map((item) => (
                    <span
                      key={item}
                      className="px-3.5 py-1.5 rounded-lg bg-[#f3f3f4] text-neutral-800 text-xs font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ----------------- TAB 5: LIKED SHOTS ----------------- */}
        {activeTab === 'liked' && (
          <div className="text-left">
            <h3 className="text-lg font-bold text-[#0d0c22] mb-4">Shots Disukai Oleh {creator.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorProjects.slice(0, 3).map((project) => (
                <div 
                  key={project.id} 
                  className="group cursor-pointer" 
                  onClick={() => {
                    setSelectedProjectForDetail(project);
                    setDetailMediaIndex(0);
                  }}
                >
                  <div className="aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0d0c22] mt-2 truncate">{project.title}</h4>
                  <span className="text-xs text-neutral-400">{project.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: ABOUT ----------------- */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 text-left w-full pt-2">
            
            {/* Sisi Kiri: Biography, Languages, Skills, Stats */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Biography */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-3.5">Biography</h3>
                <div className="space-y-4 text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal">
                  <p>
                    We are Kreativa Studio – a forward thinking digital design studio delivering meticulous experiences that talk to people.
                  </p>
                  <p>
                    Our creations help clients around the world, ranging from industry icons and brands the likes of Tony Robbins, Sony, Hasbro, Toyota and Government of Dubai, to small ambitious startups such as EnduroSat, Backpack and Ybot to name a few.
                  </p>
                  <p>
                    From concept to execution, we partner with clients to help them establish brands that resonate, launch impeccable apps, edgy websites and products adapted for what&apos;s to come.
                  </p>
                  <p>
                    So, if you&apos;re looking for the right dance partner to help you make that next step, and think we might be a good fit, reach out to us, and let&apos;s create something special – together!
                  </p>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#f3f3f4] text-neutral-800 text-xs font-medium">
                    English
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'app ui',
                    'branding',
                    'dashboard',
                    'design systems',
                    'development',
                    'front end development',
                    'icons',
                    'illustration',
                    'mobile',
                    'product design',
                    'strategy',
                    'ui',
                    'ux',
                    'web design',
                    'website ui',
                    'wordpress'
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 rounded-lg bg-[#f3f3f4] text-neutral-800 text-xs font-medium hover:bg-neutral-200/70 transition cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider Line */}
              <hr className="border-neutral-200/80 my-8" />

              {/* Follower Stats Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-neutral-600 font-normal">
                <span>
                  <strong className="text-[#0d0c22] font-semibold">52,249</strong> followers
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">819</strong> following
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">4,162</strong> tags
                </span>
              </div>

            </div>

            {/* Sisi Kanan: Location Card, Contact Info, Social Links */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Location & Dribbble Pro / Member Card */}
              <div className="bg-[#fafafa] rounded-2xl p-5 sm:p-6 space-y-3.5 border border-neutral-100 text-sm text-neutral-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Croatia</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#0d0c22] text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    PRO
                  </div>
                  <span>Dribbble Pro</span>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Member since May 2011</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#0d0c22] mb-3">Contact Info</h4>
                <div className="space-y-2.5 text-sm text-neutral-700">
                  <a
                    href="https://kreativa.studio"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 hover:text-[#0d0c22] transition group"
                  >
                    <Laptop className="w-4 h-4 text-neutral-500 group-hover:text-[#0d0c22]" />
                    <span>kreativa.studio</span>
                  </a>
                  <a
                    href="mailto:hello@kreativa.studio"
                    className="flex items-center gap-2.5 hover:text-[#0d0c22] transition group"
                  >
                    <Mail className="w-4 h-4 text-neutral-500 group-hover:text-[#0d0c22]" />
                    <span>hello@kreativa.studio</span>
                  </a>
                </div>
              </div>

              {/* Social */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#0d0c22] mb-3">Social</h4>
                <div className="space-y-3 text-sm text-neutral-700">
                  <a
                    href="https://kreativa.studio"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#0d0c22] transition group"
                  >
                    <Globe className="w-4 h-4 text-neutral-700 group-hover:text-[#0d0c22]" />
                    <span>kreativa.studio</span>
                  </a>

                  <a
                    href="https://dribbble.com/KreativaStudio"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#ea4c89] transition group"
                  >
                    <Dribbble className="w-4 h-4 text-neutral-700 group-hover:text-[#ea4c89]" />
                    <span>KreativaStudio.dribbble.com</span>
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#1da1f2] transition group"
                  >
                    <Twitter className="w-4 h-4 text-neutral-700 group-hover:text-[#1da1f2]" />
                    <span>Twitter</span>
                  </a>

                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#1877f2] transition group"
                  >
                    <Facebook className="w-4 h-4 text-neutral-700 group-hover:text-[#1877f2]" />
                    <span>Facebook</span>
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#e4405f] transition group"
                  >
                    <Instagram className="w-4 h-4 text-neutral-700 group-hover:text-[#e4405f]" />
                    <span>Instagram</span>
                  </a>

                  <a
                    href="https://behance.net"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#053eff] transition group"
                  >
                    <span className="w-4 h-4 flex items-center justify-center font-black text-xs text-neutral-800 group-hover:text-[#053eff] leading-none">
                      Bē
                    </span>
                    <span>Behance</span>
                  </a>

                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-[#0077b5] transition group"
                  >
                    <Linkedin className="w-4 h-4 text-neutral-700 group-hover:text-[#0077b5]" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL: GET IN TOUCH / DIRECT INQUIRY POPUP */}
      {/* ==================================================================== */}
      {isGetInTouchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-left animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <h3 className="text-base font-bold text-[#0d0c22]">Kirim Pesan ke {creator.name}</h3>
                  <p className="text-xs text-neutral-400">Biasanya merespons dalam {creator.responseTime || '1 jam'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsGetInTouchOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendInquiry} className="p-6 space-y-4">
              {inquirySentSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold">Pesan Anda Berhasil Terkirim!</h4>
                  <p className="text-xs text-emerald-700">Kreator telah menerima notifikasi dan akan membalas pesan Anda segera.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Pesan atau Kebutuhan Proyek Anda
                    </label>
                    <textarea
                      rows={4}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder={`Halo ${creator.name}, saya tertarik untuk memesan template / video UGC untuk brand saya...`}
                      className="w-full p-3.5 rounded-2xl border border-neutral-200 text-xs sm:text-sm text-[#0d0c22] focus:outline-hidden focus:ring-2 focus:ring-[#0d0c22]"
                      required
                    />
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-2xl text-[11px] text-neutral-500 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Komunikasi dan pembayaran melalui Creatorin dilindungi garansi uang kembali 100%.</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsGetInTouchOpen(false)}
                      className="px-5 py-2.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-bold hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pesan</span>
                    </button>
                  </div>
                </>
              )}
            </form>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FULL PROJECT PREVIEW MODAL (MATCHING REFERENCE IMAGE DESIGN) */}
      {/* ==================================================================== */}
      {selectedProjectForDetail && (
        <ProjectDetailModal
          project={selectedProjectForDetail}
          onClose={() => setSelectedProjectForDetail(null)}
          onSelectProject={(newProj) => setSelectedProjectForDetail(newProj)}
          onViewCreatorProfile={(c) => {
            if (onSelectCreator) onSelectCreator(c);
          }}
          onGetInTouch={(c) => {
            setSelectedProjectForDetail(null);
            setIsGetInTouchOpen(true);
          }}
          onScheduleCall={(c) => {
            setSelectedProjectForDetail(null);
            setIsBriefModalOpen(true);
          }}
          onNavigate={onNavigate}
          allProjects={MOCK_FEED_PROJECTS}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL: ORDER SERVICE DIALOG */}
      {/* ==================================================================== */}
      {selectedServiceForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 text-left space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Konfirmasi Pemesanan</span>
                <h3 className="text-lg font-bold text-[#0d0c22]">{selectedServiceForOrder.title}</h3>
              </div>
              <button onClick={() => setSelectedServiceForOrder(null)} className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Kreator:</span>
                <span className="font-bold text-neutral-800">{creator.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimasi Pengiriman:</span>
                <span className="font-bold text-neutral-800">{selectedServiceForOrder.deliveryDays || '2 Hari'}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200/60 pt-2 text-sm">
                <span className="font-bold text-neutral-800">Total Biaya:</span>
                <span className="font-black text-[#0d0c22]">{selectedServiceForOrder.formattedPrice}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Pemesanan layanan "${selectedServiceForOrder.title}" berhasil diproses! Silakan lengkapi instruksi brief.`);
                setSelectedServiceForOrder(null);
              }}
              className="w-full py-3.5 rounded-full bg-[#0d0c22] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Lanjut ke Pembayaran Aman
            </button>
          </div>
        </div>
      )}

      {/* Brief Project Modal */}
      {isBriefModalOpen && (
        <ProjectBriefModal
          isOpen={isBriefModalOpen}
          targetCreator={creator}
          onClose={() => setIsBriefModalOpen(false)}
        />
      )}

      {/* Service Detail Modal */}
      {selectedServiceForDetail && (
        <ServiceDetailModal
          service={selectedServiceForDetail}
          creator={creator}
          onClose={() => setSelectedServiceForDetail(null)}
          onOrderService={(srv) => {
            setSelectedServiceForDetail(null);
            setSelectedServiceForOrder(srv);
          }}
          onNavigate={onNavigate}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail(newSrv);
          }}
        />
      )}

    </div>
  );
};
