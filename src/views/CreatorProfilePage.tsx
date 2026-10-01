'use client';

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
  Linkedin,
  Pencil,
  Link as LinkIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { Creator, CreatorService, PortfolioItem, AuthState, ActivePage, FeedProject } from '@/types';
import { CareerScoreBadge } from '@/components/common/CareerScoreBadge';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { ShaderFill } from '@/lib/custom-effect-runtime';
import { setup as setupConcentric, render as renderConcentric, manifest as manifestConcentric } from '@/lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430';
import { setup as setupWater, render as renderWater, manifest as manifestWater } from '@/lib/custom-effects/CodeComponentId_40f03f78407c1c973fc891fbca9ff3d0387485e6_435';
import { setup as setupWave, render as renderWave, manifest as manifestWave } from '@/lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433';

interface CreatorProfilePageProps {
  creator?: Creator;
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onSelectCreator?: (creator: Creator) => void;
  /** When true, renders the owner's own profile view (Bagikan + Edit buttons, upload tiles visible) */
  isOwnProfile?: boolean;
}

type ProfileTab = 'work' | 'services' | 'reviews' | 'statistics' | 'liked' | 'about';
type ShotFilter = 'all' | 'recent' | 'popular' | 'views' | 'video' | 'carousel';

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  creator = MOCK_CREATORS[0],
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onSelectCreator,
  isOwnProfile = false
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) onNavigate(page);
    else router.push(path);
  };

  const handleSelectCreator = (c: Creator) => {
    if (onSelectCreator) onSelectCreator(c);
    else router.push(`/creator/${c.id}`);
  };
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
      navigateTo('chat', '/chat');
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

  return (
    <div className="w-full bg-white text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">

      {/* Copy Notification */}
      {copiedLinkSuccess && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#0d0c22] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Tautan profil berhasil disalin ke clipboard!</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* HERO SECTION (Style Exactly Matching The Uploaded Screenshot) */}
      {/* ==================================================================== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Rounded Top Banner Card (Large panel radius 24px according to design.md §7) */}
        <div className="relative h-[220px] sm:h-[260px] lg:h-[288px] w-full overflow-hidden rounded-3xl bg-[#0063b4]">
          <ShaderFill
            className="absolute inset-0 rounded-3xl"
            shader={{
              setup: setupConcentric,
              render: renderConcentric,
              params: {
                falloff: 1,
                inverseFalloff: false,
                ringCount: 20,
                offset: 0,
                shape: 1,
                transform: { x: 50, y: 50, radius: 50, angle: 0 },
                color: { r: 1, g: 1, b: 1, a: 1 },
              },
              manifest: manifestConcentric,
            }}
          />
          <ShaderFill
            className="absolute inset-0 rounded-[32px]"
            shader={{
              setup: setupWater,
              render: renderWater,
              params: {
                center: { x: 50, y: 50 },
                scale: 1,
                playhead: 0,
                highlightColor: { r: 0.804, g: 0.961, b: 1, a: 1 },
                waterColor: { r: 0, g: 0.388, b: 0.706, a: 1 },
                intensity: 0.5,
              },
              manifest: manifestWater,
            }}
          />
        </div>

        {/* Squircle Avatar & Action Bar Row */}
        <div className="relative z-20 flex flex-col gap-4 px-4 -mt-20 sm:flex-row sm:items-end sm:justify-between">
          
          {/* Circular Avatar */}
          <div className="relative inline-block self-start">
            <div className="size-[144px] rounded-full bg-white p-1.5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.08)] ring-1 ring-neutral-900/5">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {creator.proBadge && (
              <div 
                className="absolute left-[114px] top-[114px] rounded-full bg-[#0d0c22] p-1.5 text-white shadow-xs ring-[3px] ring-white" 
                title="Pro Creator Verified"
              >
                <ShieldCheck className="size-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Action Buttons Row (Right Aligned, Style from Reference Image) */}
          <div className="flex items-center gap-2.5 self-start pb-1 sm:self-end">
            
            {/* Button 1: More Options (...) */}
            <div className="relative">
              <button
                id="btn-more-options"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex size-10 items-center justify-center rounded-full bg-[#f3f3f4] text-neutral-800 transition hover:bg-neutral-200 cursor-pointer"
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

            {isOwnProfile ? (
              <>
                {/* Own Profile: Bagikan Profil */}
                <button
                  id="btn-share-profile"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl border border-[#E2E8F0] bg-white text-[#171717] hover:bg-[#F8FAFC] text-sm font-semibold transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Bagikan Profil</span>
                </button>

                {/* Own Profile: Edit Profil */}
                <button
                  id="btn-edit-profile"
                  onClick={() => navigateTo('settings', '/settings')}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profil</span>
                </button>
              </>
            ) : (
              <>
                {/* Public Profile: Follow Toggle Button */}
                <button
                  id="btn-follow-toggle"
                  onClick={toggleFollow}
                  className={`h-10 px-5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                    isFollowing
                      ? 'border-[#E2E8F0] bg-white text-[#171717] hover:bg-[#F8FAFC]'
                      : 'border-[#0B1F3A] bg-[#0B1F3A] text-white hover:bg-[#123B8C]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                {/* Public Profile: Kirim Pesan */}
                <button
                  id="btn-send-message-primary"
                  onClick={() => setIsGetInTouchOpen(true)}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Pesan</span>
                </button>
              </>
            )}

          </div>

        </div>

        {/* Creator Identity & Meta Stats Block (Below Avatar) */}
        <div className="px-4 pt-4 text-left">
          
          {/* Name & Badges */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] tracking-tight text-[#0F172A]">
              {creator.name}
            </h1>
            {creator.verified && (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1D4ED8] fill-[#1D4ED8] text-white" />
            )}
            {creator.careerScore?.overall >= 95 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#0B1F3A] text-white">
                PRO+
              </span>
            )}
          </div>

          {/* Tagline / Headline */}
          <p className="mt-2 max-w-2xl text-base font-normal leading-6 text-[#64748B]">
            {creator.roleTitle || creator.heroHeadline || 'Design in business. Business in design.'}
          </p>

          {/* Inline Stats Row (Standardized scale spacing gap-x-6 gap-y-2) */}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-normal text-[#64748B]">
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {creator.stats?.completedProjects || '142+'}
              </strong>{' '}
              Proyek Selesai
            </span>
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {creator.rating || '4.9'} ★
              </strong>{' '}
              ({creator.reviewCount || 98} Ulasan)
            </span>
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {followersCount.toLocaleString()}
              </strong>{' '}
              Pengikut
            </span>
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {creator.careerScore?.overall || 98}%
              </strong>{' '}
              Skor Karir
            </span>
            <span className="text-[#a1a1a1]">
              <MapPin className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-[#0d0c22]" />
              {creator.location || 'Indonesia'}
            </span>
            <span className="text-[#a1a1a1]">
              <Laptop className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-[#0d0c22]" />
              SMK Telkom Sidoarjo
            </span>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* TAB NAVIGATION BAR (Work, Services, Reviews, Collections, Liked Shots, About) */}
      {/* ==================================================================== */}
      <div className="sticky top-20 z-30 border-b border-[#eaeaea] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-col items-stretch justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:flex-row sm:items-center">
          
          {/* Tabs Group */}
          <div className="flex h-10 items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            
            {/* Proyek Tab (Formerly Work) */}
            <button
              onClick={() => setActiveTab('work')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] transition whitespace-nowrap cursor-pointer ${
                activeTab === 'work'
                  ? 'bg-[#0d0c22] text-white'
                  : 'text-[#525252] hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              <span>Proyek</span>
              <span className={`rounded-full px-1.5 text-[10px] font-bold leading-[14.286px] tracking-[0.12px] ${activeTab === 'work' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#404040]'}`}>
                {filteredProjects.length || 3}
              </span>
            </button>

            {/* Services Tab */}
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] transition whitespace-nowrap cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-[#0d0c22] text-white'
                  : 'text-[#525252] hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              <span>Layanan</span>
              <span className={`rounded-full px-1.5 text-[10px] font-bold leading-[14.286px] tracking-[0.12px] ${activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-[#e5e5e5] text-[#404040]'}`}>
                {creator.services?.length || 4}
              </span>
            </button>

            {/* Reviews Tab */}
            <button
              id="tab-btn-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`rounded-full px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] transition whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#0d0c22] text-white'
                  : 'text-[#525252] hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Ulasan
            </button>

            {/* Skor Rekam Jejak Tab (Formerly Statistik) */}
            <button
              id="tab-btn-statistics"
              onClick={() => setActiveTab('statistics')}
              className={`rounded-full px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] transition whitespace-nowrap cursor-pointer ${
                activeTab === 'statistics'
                  ? 'bg-[#0d0c22] text-white'
                  : 'text-[#525252] hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Statistik
            </button>

            {/* Liked Shots Tab */}
            <button
              onClick={() => setActiveTab('liked')}
              className={`rounded-full px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] transition whitespace-nowrap cursor-pointer ${
                activeTab === 'liked'
                  ? 'bg-[#0d0c22] text-white'
                  : 'text-[#525252] hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Karya Kolaborasi
            </button>

            {/* About Tab */}
            <button
              onClick={() => setActiveTab('about')}
              className={`rounded-full px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] transition whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-[#0d0c22] text-white'
                  : 'text-[#525252] hover:text-[#0d0c22] hover:bg-neutral-50'
              }`}
            >
              Tentang
            </button>
          </div>

          {/* Right Side: Shot/Project Filters Dropdown */}
          {(activeTab === 'work' || activeTab === 'services') && (
            <div className="relative self-end sm:self-center">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-[14px] font-bold leading-5 tracking-[-0.15px] text-[#0d0c22] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition hover:border-neutral-300 cursor-pointer"
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

              {activeTab === 'work' && isFilterDropdownOpen && (
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
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setIsBriefModalOpen(true)}
                    className="flex aspect-[326/407.5] flex-col items-center justify-center rounded-md border border-dashed border-[#acacac] bg-white px-8 text-center transition hover:border-[#0d0c22] hover:bg-neutral-50 cursor-pointer"
                  >
                    <span className="text-6xl font-light leading-none text-[#acacac]">+</span>
                    <span className="mt-6 text-[24px] font-bold leading-none text-black">Upload Proyek</span>
                    <span className="mt-2 max-w-[256px] text-[12px] font-normal leading-[1.4] text-black">
                      Show off your best work. Get feedback, likes and be a part of a growing community.
                    </span>
                  </button>
                )}
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={`feed-card-${project.id}`}
                    project={project}
                    isSaved={savedProjectIds.has(project.id)}
                    onToggleSave={(id, e) => toggleSaveProject(id, e)}
                    onClick={() => {
                      setSelectedProjectForDetail(project);
                      setDetailMediaIndex(0);
                    }}
                    activeMediaIndex={activeMediaIndexes[project.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: SERVICES ----------------- */}
        {activeTab === 'services' && (
          <div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setIsBriefModalOpen(true)}
                    className="flex min-h-[468px] flex-col items-center justify-center rounded-md border border-dashed border-[#acacac] bg-white px-8 text-center transition hover:border-[#0d0c22] hover:bg-neutral-50 cursor-pointer"
                  >
                    <span className="text-6xl font-light leading-none text-[#acacac]">+</span>
                    <span className="mt-6 text-[24px] font-bold leading-none text-black">Upload Layanan</span>
                    <span className="mt-2 max-w-[256px] text-[12px] font-normal leading-[1.4] text-black">
                      Show off your best work. Get feedback, likes and be a part of a growing community.
                    </span>
                  </button>
                )}
                {creator.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="group flex min-h-[468px] flex-col justify-between rounded-[24px] border border-[rgba(229,229,229,0.9)] bg-white p-5 text-left transition-all hover:border-neutral-300 hover:shadow-lg"
                  >
                    <div>
                      <div
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="mb-4 h-[177.5px] overflow-hidden rounded-2xl bg-[#f5f5f5] cursor-pointer"
                        title="Lihat detail layanan"
                      >
                        <ShaderFill
                          className="h-full w-full"
                          shader={{
                            setup: setupWave,
                            render: renderWave,
                            params: {
                              transform: { x: 50, y: 50, radius: 30, angle: 0 },
                              amplitude: 15,
                              waveColor: { r: 1, g: 1, b: 1, a: 1 },
                              offset: 0,
                              zoom: 1,
                              glowIntensity: 1,
                            },
                            manifest: manifestWave,
                          }}
                        />
                      </div>

                      {srv.tag && (
                        <span className="mb-2.5 inline-block rounded-md bg-[#f5f5f5] px-2.5 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[0.62px] text-[#525252]">
                          {srv.tag}
                        </span>
                      )}

                      <h4 
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="mb-1.5 cursor-pointer text-[17px] font-bold leading-[23.375px] tracking-[-0.43px] text-[#0d0c22] transition-colors group-hover:text-blue-600"
                        title="Lihat detail layanan"
                      >
                        {srv.title}
                      </h4>

                      <p 
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="mb-4 line-clamp-2 cursor-pointer text-[12px] font-normal leading-[19.5px] text-[#737373]"
                      >
                        {srv.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                      </p>

                      <div 
                        onClick={() => setSelectedServiceForDetail(srv)}
                        className="mb-6 flex cursor-pointer items-center gap-1.5 text-[12px] font-normal leading-4 text-[#737373]"
                      >
                        <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                        <span>Estimasi: {srv.deliveryDays ? (srv.deliveryDays.toLowerCase().includes('hari') ? srv.deliveryDays : `${srv.deliveryDays} Hari Kerja`) : '2-3 Hari Kerja'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div onClick={() => setSelectedServiceForDetail(srv)} className="cursor-pointer min-w-0">
                        <span className="mb-0.5 block text-[10px] font-bold uppercase leading-[15px] tracking-[0.62px] text-[#a1a1a1]">HARGA</span>
                        <span className="block truncate text-[16px] font-black leading-6 tracking-[-0.31px] text-[#0d0c22]">{srv.formattedPrice}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Tombol Icon Simpan */}
                        <button
                          type="button"
                          onClick={(e) => toggleSaveService(srv.id, e)}
                          className={`flex size-9 items-center justify-center rounded-full border transition cursor-pointer ${
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
                          className="rounded-full bg-[#0d0c22] px-4 py-2 text-[12px] font-bold leading-4 text-white shadow-xs transition hover:bg-neutral-800 cursor-pointer"
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
                    • Skor Rekam Jejak
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {creatorProjects.slice(0, 4).map((project) => (
                <ProjectCard
                  key={project.id}
                  id={`liked-card-${project.id}`}
                  project={project}
                  isSaved={savedProjectIds.has(project.id)}
                  onToggleSave={(id, e) => toggleSaveProject(id, e)}
                  onClick={() => {
                    setSelectedProjectForDetail(project);
                    setDetailMediaIndex(0);
                  }}
                />
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
            handleSelectCreator(c);
          }}
          onGetInTouch={(c) => {
            setSelectedProjectForDetail(null);
            setIsGetInTouchOpen(true);
          }}
          onScheduleCall={(c) => {
            setSelectedProjectForDetail(null);
            setIsBriefModalOpen(true);
          }}
          onNavigate={(page) => {
            if (onNavigate) onNavigate(page);
            else {
              const routeMap: Record<string, string> = {
                'home': '/',
                'landing': '/landing',
                'explore': '/explore',
                'explore-projects': '/explore/projects',
                'explore-services': '/explore/services',
                'chat': '/chat',
                'collaboration': '/collaboration',
                'notifications': '/notifications',
                'briefs': '/briefs',
                'signin': '/sign-in',
                'signup': '/sign-up',
              };
              router.push(routeMap[page] || '/explore');
            }
          }}
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
          onNavigate={(page) => {
            if (onNavigate) onNavigate(page);
            else {
              const routeMap: Record<string, string> = {
                'home': '/',
                'landing': '/landing',
                'explore': '/explore',
                'explore-projects': '/explore/projects',
                'explore-services': '/explore/services',
                'chat': '/chat',
                'collaboration': '/collaboration',
                'notifications': '/notifications',
                'briefs': '/briefs',
                'signin': '/sign-in',
                'signup': '/sign-up',
              };
              router.push(routeMap[page] || '/explore');
            }
          }}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail(newSrv);
          }}
        />
      )}

    </div>
  );
};
