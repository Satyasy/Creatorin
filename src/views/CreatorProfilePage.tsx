'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Creator, CreatorService, PortfolioItem, AuthState, ActivePage, FeedProject } from '@/types';
import { CareerScoreBadge } from '@/components/common/CareerScoreBadge';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { UploadProjectModal } from '@/components/modals/UploadProjectModal';
import { UploadServiceModal } from '@/components/modals/UploadServiceModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { creatorService } from '@/services/creatorService';
import { chatService } from '@/services/chatService';
import { createClient } from '@/lib/supabase/client';
import { ShaderFill } from '@/lib/custom-effect-runtime';
import { setup as setupConcentric, render as renderConcentric, manifest as manifestConcentric } from '@/lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430';
import { setup as setupWater, render as renderWater, manifest as manifestWater } from '@/lib/custom-effects/CodeComponentId_40f03f78407c1c973fc891fbca9ff3d0387485e6_435';
import { setup as setupWave, render as renderWave, manifest as manifestWave } from '@/lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433';

interface CreatorProfilePageProps {
  creator: Creator;
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
  creator,
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onSelectCreator,
  isOwnProfile = false
}) => {
  const router = useRouter();
  const { user: authUser, updateUser, refreshUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;
  const isEffectiveOwner = Boolean(isOwnProfile);
  const isCreatorShell = currentUser?.role === 'creator';

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(creator.followersCount || 0);
  const followingCount = creator.followingCount ?? 0;
  const [likesCount, setLikesCount] = useState(creator.likesCount ?? 0);

  // Modals state
  const [selectedShotForModal, setSelectedShotForModal] = useState<PortfolioItem | null>(null);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<CreatorService | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<CreatorService | null>(null);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isUploadProjectModalOpen, setIsUploadProjectModalOpen] = useState(false);
  const [isUploadServiceModalOpen, setIsUploadServiceModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);

  // Protected actions AuthModal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    title: string;
    description: string;
    action?: (user?: NonNullable<AuthState['user']>) => void;
  }>({
    title: 'Masuk ke Akun Creatorin',
    description: 'Masuk untuk melanjutkan tindakan ini dan membuka akses ke seluruh fitur kolaborasi.',
  });
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // In-place inline edit profile state
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [editingSection, setEditingSection] = useState<'name' | 'bio' | 'avatar' | 'banner' | null>(null);
  const [creatorName, setCreatorName] = useState(creator.name);
  const [creatorRoleTitle, setCreatorRoleTitle] = useState(creator.roleTitle);
  const [creatorBio, setCreatorBio] = useState(creator.bio);
  const [creatorAvatar, setCreatorAvatar] = useState(creator.avatar);
  const [creatorBannerColor, setCreatorBannerColor] = useState('#0063b4');

  // Temp editing inputs
  const [tempName, setTempName] = useState(creator.name);
  const [tempRoleTitle, setTempRoleTitle] = useState(creator.roleTitle);
  const [tempBio, setTempBio] = useState(creator.bio);
  const [tempAvatar, setTempAvatar] = useState(creator.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Saved shots / projects in profile
  const [likedShots, setLikedShots] = useState<Set<string>>(new Set());
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());
  const [savedServiceIds, setSavedServiceIds] = useState<Set<string>>(new Set());
  const [activeMediaIndexes, setActiveMediaIndexes] = useState<{ [id: string]: number }>({});
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<FeedProject | null>(null);
  const [liveProjects, setLiveProjects] = useState<FeedProject[]>([]);
  const [liveServices, setLiveServices] = useState<CreatorService[]>(creator.services || []);
  useEffect(() => {
    if (!creator.id) return;
    creatorService.getFeedProjects(creator.id).then(setLiveProjects).catch(() => setLiveProjects([]));
  }, [creator.id]);
  const [isDetailMuted, setIsDetailMuted] = useState(true);
  const [detailMediaIndex, setDetailMediaIndex] = useState(0);

  // Handle follow toggle with auth guard and backend persistence
  const toggleFollow = async () => {
    if (isTogglingFollow) return;

    if (!currentUser) {
      setAuthModalConfig({
        title: 'Masuk untuk Mengikuti Kreator',
        description: 'Anda harus masuk ke akun Creatorin terlebih dahulu untuk mengikuti kreator ini dan memantau pembaruan karya mereka.',
        action: async () => {
          try {
            setIsTogglingFollow(true);
            const res = await creatorService.toggleFollow(creator.id, true);
            setIsFollowing(true);
            setFollowersCount(res.followersCount);
          } catch (err) {
            console.error('Follow failed after auth:', err);
          } finally {
            setIsTogglingFollow(false);
          }
        },
      });
      setIsAuthModalOpen(true);
      return;
    }

    const nextState = !isFollowing;
    setIsTogglingFollow(true);
    try {
      const res = await creatorService.toggleFollow(creator.id, nextState);
      setIsFollowing(res.isFollowing);
      setFollowersCount(res.followersCount);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status follow.');
    } finally {
      setIsTogglingFollow(false);
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

  // Contact creator directly - creates/finds conversation room and redirects to chat
  const [isStartingChat, setIsStartingChat] = useState(false);
  const handleContactCreator = async () => {
    if (!currentUser) {
      setAuthModalConfig({
        title: 'Masuk untuk Menghubungi Kreator',
        description: 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk memulai obrolan dengan kreator ini.',
        action: async () => {
          await executeContactCreator();
        },
      });
      setIsAuthModalOpen(true);
      return;
    }
    await executeContactCreator();
  };

  const executeContactCreator = async () => {
    setIsStartingChat(true);
    try {
      const res = await chatService.initiateChatWithProfile(
        {
          id: creator.id,
          name: creatorName || creator.name,
          avatar: creatorAvatar || creator.avatar,
          roleTitle: creatorRoleTitle || creator.roleTitle || 'Kreator',
          role: 'creator',
        },
        currentUser
      );
      router.push(`/chat?conversationId=${res.conversationId}&creatorId=${creator.id}`);
    } catch {
      router.push(`/chat?creatorId=${creator.id}`);
    } finally {
      setIsStartingChat(false);
    }
  };

  // Internal executor for sending inquiry message
  const executeSendInquiry = async (text: string) => {
    setIsSendingInquiry(true);
    try {
      const res = await chatService.initiateChatWithProfile(
        {
          id: creator.id,
          name: creatorName || creator.name,
          avatar: creatorAvatar || creator.avatar,
          roleTitle: creatorRoleTitle || creator.roleTitle || 'Kreator',
          role: 'creator',
        },
        currentUser
      );

      const conversationId = res.conversationId;
      await chatService.sendMessage(conversationId, text);

      setInquirySentSuccess(true);
      setTimeout(() => {
        setInquirySentSuccess(false);
        setIsGetInTouchOpen(false);
        setInquiryMessage('');
        router.push(`/chat?conversationId=${conversationId}&creatorId=${creator.id}`);
      }, 900);
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesan penawaran ke kreator.');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  // Send message handler - with draft preservation and contextual auth modal
  const handleSendInquiry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inquiryMessage.trim();
    if (!text) return;

    if (!currentUser) {
      setAuthModalConfig({
        title: 'Masuk untuk Mengirim Pesan',
        description: 'Draf pesan Anda telah tersimpan rapi. Masuk ke akun Anda terlebih dahulu untuk langsung mengirimkan pesan diskusi ke kreator ini.',
        action: async () => {
          await executeSendInquiry(text);
        },
      });
      setIsAuthModalOpen(true);
      return;
    }

    await executeSendInquiry(text);
  };

  // Guard for discussing or ordering service
  const handleOpenOrderService = (srv: CreatorService) => {
    if (!currentUser) {
      setAuthModalConfig({
        title: 'Masuk untuk Mendiskusikan Layanan',
        description: 'Silakan masuk akun terlebih dahulu untuk memesan atau mendiskusikan paket layanan kolaborasi dengan kreator ini.',
        action: () => {
          setSelectedServiceForOrder(srv);
        },
      });
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedServiceForOrder(srv);
  };

  const creatorProjects = liveProjects;

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
        <div 
          className="relative h-[220px] sm:h-[260px] lg:h-[288px] w-full overflow-hidden rounded-3xl"
          style={{ backgroundColor: creatorBannerColor }}
        >
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
          {isOwnProfile && isEditModeActive && (
            <button
              onClick={() => setEditingSection('banner')}
              className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-black text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition"
              title="Edit Banner"
            >
              <Pencil className="w-3.5 h-3.5 text-blue-600" />
              <span>Ganti Banner</span>
            </button>
          )}
        </div>

        {/* Squircle Avatar & Action Bar Row */}
        <div className="relative z-20 flex flex-col gap-4 px-4 -mt-20 sm:flex-row sm:items-end sm:justify-between">
          
          {/* Circular Avatar */}
          <div className="relative inline-block self-start group">
            <div className="size-[144px] rounded-full bg-white p-1.5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.08)] ring-1 ring-neutral-900/5">
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {isOwnProfile && isEditModeActive && (
              <button
                onClick={() => {
                  setTempAvatar(creatorAvatar);
                  setEditingSection('avatar');
                }}
                className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer z-20 transition"
                title="Ganti Foto Profil"
              >
                <Pencil className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-semibold">Ganti Foto</span>
              </button>
            )}
            {creator.proBadge && (
              <div 
                className="absolute left-[114px] top-[114px] rounded-full bg-[#0d0c22] p-1.5 text-white shadow-xs ring-[3px] ring-white" 
                title="Pro Creator Verified"
              >
                <ShieldCheck className="size-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
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
                      handleContactCreator();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span>Hubungi via Pesan</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      alert(`Profil ${creatorName} telah diverifikasi oleh tim Creatorin.`);
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

                {/* Own Profile: Edit Profil Mode Toggle */}
                <button
                  id="btn-edit-profile"
                  onClick={() => setIsEditModeActive(!isEditModeActive)}
                  className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs ${
                    isEditModeActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#0B1F3A] hover:bg-[#123B8C] text-white'
                  }`}
                >
                  {isEditModeActive ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                  <span>{isEditModeActive ? 'Selesai Edit' : 'Edit Profil'}</span>
                </button>
              </>
            ) : (
              <>
                {/* Public Profile: Follow Toggle Button */}
                <button
                  id="btn-follow-toggle"
                  onClick={toggleFollow}
                  disabled={isTogglingFollow}
                  className={`h-10 px-5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${
                    isFollowing
                      ? 'border-[#E2E8F0] bg-white text-[#171717] hover:bg-[#F8FAFC]'
                      : 'border-[#0B1F3A] bg-[#0B1F3A] text-white hover:bg-[#123B8C]'
                  } ${isTogglingFollow ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isTogglingFollow && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                {/* Public Profile: Hubungi */}
                <button
                  id="btn-send-message-primary"
                  onClick={handleContactCreator}
                  disabled={isStartingChat}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                >
                  <Mail className={`w-3.5 h-3.5 ${isStartingChat ? 'animate-spin' : ''}`} />
                  <span>{isStartingChat ? 'Menghubungkan...' : 'Hubungi'}</span>
                </button>
              </>
            )}

          </div>

        </div>

        {/* Creator Identity & Meta Stats Block (Below Avatar) */}
        <div className="px-4 pt-4 text-left">
          
          {/* Name & Badges with inline pencil */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] tracking-tight text-[#0F172A]">
              {creatorName}
            </h1>
            {isOwnProfile && isEditModeActive && (
              <button
                onClick={() => {
                  setTempName(creatorName);
                  setTempRoleTitle(creatorRoleTitle);
                  setEditingSection('name');
                }}
                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer transition"
                title="Edit Nama & Gelar"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>
            )}
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
            {creatorRoleTitle || 'Design in business. Business in design.'}
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
              ({creator.reviewCount ?? 0} Ulasan)
            </span>
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {followersCount.toLocaleString()}
              </strong>{' '}
              Pengikut
            </span>
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {creator.careerScore?.overall ?? 0}%
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
      <div 
        className={`sticky ${isCreatorShell ? 'top-0' : 'top-16 lg:top-[72px]'} z-30 border-b border-[#eaeaea] bg-white/95 backdrop-blur-md transition-[top]`}
        style={{ top: isCreatorShell ? 0 : 'var(--navbar-height, 64px)' }}
      >
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
                {liveServices.length}
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
                {isEffectiveOwner && (
                  <button
                    id="btn-upload-project-action"
                    data-testid="btn-upload-project-action"
                    type="button"
                    onClick={() => setIsUploadProjectModalOpen(true)}
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
            {liveServices.length === 0 ? (
              <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-12 text-center">
                <Sparkles className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-[#0d0c22]">Belum Ada Paket Layanan Standar</h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
                  Kreator ini melayani proyek kustom sesuai kebutuhan spesifik Anda.
                </p>
                <button
                  onClick={() => isEffectiveOwner ? setIsUploadServiceModalOpen(true) : setIsBriefModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-bold"
                >
                  {isEffectiveOwner ? 'Upload Layanan' : 'Buat Brief Proyek'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isEffectiveOwner && (
                  <button
                    id="btn-upload-service-action"
                    data-testid="btn-upload-service-action"
                    type="button"
                    onClick={() => setIsUploadServiceModalOpen(true)}
                    className="flex min-h-[468px] flex-col items-center justify-center rounded-md border border-dashed border-[#acacac] bg-white px-8 text-center transition hover:border-[#0d0c22] hover:bg-neutral-50 cursor-pointer"
                  >
                    <span className="text-6xl font-light leading-none text-[#acacac]">+</span>
                    <span className="mt-6 text-[24px] font-bold leading-none text-black">Upload Layanan</span>
                    <span className="mt-2 max-w-[256px] text-[12px] font-normal leading-[1.4] text-black">
                      Show off your best work. Get feedback, likes and be a part of a growing community.
                    </span>
                  </button>
                )}
                {liveServices.map((srv) => (
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
                        {/* Tombol Diskusikan */}
                        <button
                          type="button"
                          onClick={() => handleOpenOrderService(srv)}
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
          const baseReviews = (creator.reviewsList || []).map((review) => ({
            id: review.id,
            clientName: review.clientName,
            clientRole: review.clientCompany,
            clientAvatar: '',
            projectTitle: review.projectTitle,
            rating: review.rating,
            completedDate: review.date,
            comment: review.comment,
            timestamp: Date.parse(review.date) || 0,
          }));

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
                    {creator.careerScore.overall} <span className="text-xl sm:text-2xl font-normal text-neutral-400">/ 100</span>
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-neutral-700">
                    • Skor Rekam Jejak
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-neutral-600 leading-relaxed font-normal mt-3 max-w-2xl">
                  Skor dan statistik diambil dari aktivitas yang tercatat pada akun ini.
                </p>
              </div>

              {/* Divider Line identik dengan About */}
              <hr className="border-neutral-200/80 my-8" />

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0d0c22] mb-5">Data aktivitas</h3>
                <div className="grid grid-cols-2 gap-5 text-sm">
                  <div><p className="text-neutral-500">Proyek selesai</p><p className="mt-1 text-xl font-semibold">{creator.careerScore.completedProjects}</p></div>
                  <div><p className="text-neutral-500">Ketepatan waktu</p><p className="mt-1 text-xl font-semibold">{creator.careerScore.deadlineAccuracy}%</p></div>
                  <div><p className="text-neutral-500">Rating klien</p><p className="mt-1 text-xl font-semibold">{creator.careerScore.clientRating} / 5</p></div>
                  <div><p className="text-neutral-500">Jumlah ulasan</p><p className="mt-1 text-xl font-semibold">{creator.reviewCount || 0}</p></div>
                </div>
              </div>

              {/* Divider Line identik dengan About */}
              <hr className="border-neutral-200/80 my-8" />

            </div>

            {/* Sisi Kanan: Status Sistem Otomatis, Transparansi, & Sumber Penilaian (Identik dengan Sisi Kanan About) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Kartu Status Otomatis & Keamanan (Gaya Kartu Kanan di About) */}
              <div className="bg-[#fafafa] rounded-2xl p-5 sm:p-6 space-y-3.5 border border-neutral-100 text-sm text-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-[#0d0c22] text-white flex items-center justify-center text-[8px] font-black shrink-0">
                    ✓
                  </div>
                  <span>{creator.careerScore.overall > 0 ? 'Memiliki riwayat penilaian' : 'Belum memiliki penilaian'}</span>
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
                  Nilai yang belum memiliki riwayat tercatat ditampilkan sebagai nol.
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
                <div className="flex items-center gap-2 mb-3.5">
                  <h3 className="text-base sm:text-lg font-bold text-[#0d0c22]">Biography</h3>
                  {isOwnProfile && isEditModeActive && (
                    <button
                      onClick={() => {
                        setTempBio(creatorBio);
                        setEditingSection('bio');
                      }}
                      className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer transition"
                      title="Edit Bio"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  )}
                </div>
                <div className="space-y-4 text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal whitespace-pre-line">
                  <p>{creatorBio}</p>
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
                  <strong className="text-[#0d0c22] font-semibold">{creator.followersCount || 0}</strong> followers
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">{creator.followingCount || 0}</strong> following
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">{creator.skills.length}</strong> keahlian
                </span>
              </div>

            </div>

            {/* Sisi Kanan: Location Card, Contact Info, Social Links */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Location & Dribbble Pro / Member Card */}
              <div className="bg-[#fafafa] rounded-2xl p-5 sm:p-6 space-y-3.5 border border-neutral-100 text-sm text-neutral-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>{creator.location || 'Lokasi belum diisi'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Bergabung {creator.joinedDate || 'baru-baru ini'}</span>
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
                      disabled={isSendingInquiry || !inquiryMessage.trim()}
                      className="px-6 py-2.5 rounded-full bg-[#0d0c22] disabled:opacity-50 text-white text-xs font-bold hover:bg-neutral-800 flex items-center gap-2 cursor-pointer transition"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSendingInquiry ? 'animate-pulse' : ''}`} />
                      <span>{isSendingInquiry ? 'Mengirim...' : 'Kirim Pesan'}</span>
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
                'explore': '/jelajah',
                'explore-projects': '/jelajah/proyek',
                'explore-services': '/jelajah/layanan',
                'chat': '/chat',
                'collaboration': '/contracts',
                'notifications': '/notifications',
                'briefs': '/briefs',
                'signin': '/sign-in',
                'signup': '/sign-up',
              };
              router.push(routeMap[page] || '/jelajah');
            }
          }}
          allProjects={creatorProjects}
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
                if (!currentUser) {
                  setAuthModalConfig({
                    title: 'Masuk untuk Melanjutkan Pembayaran',
                    description: 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk menyelesaikan proses pembayaran aman.',
                    action: () => {
                      alert(`Pemesanan layanan "${selectedServiceForOrder.title}" berhasil diproses! Silakan lengkapi instruksi brief.`);
                      setSelectedServiceForOrder(null);
                    },
                  });
                  setIsAuthModalOpen(true);
                  return;
                }
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
            handleOpenOrderService(srv);
          }}
          onNavigate={(page) => {
            if (onNavigate) onNavigate(page);
            else {
              const routeMap: Record<string, string> = {
                'home': '/',
                'landing': '/landing',
                'explore': '/jelajah',
                'explore-projects': '/jelajah/proyek',
                'explore-services': '/jelajah/layanan',
                'chat': '/chat',
                'collaboration': '/contracts',
                'notifications': '/notifications',
                'briefs': '/briefs',
                'signin': '/sign-in',
                'signup': '/sign-up',
              };
              router.push(routeMap[page] || '/jelajah');
            }
          }}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail(newSrv);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* INLINE EDIT MICRO-MODALS FOR SECTIONS (NAMA, BIO, AVATAR, BANNER)    */}
      {/* ==================================================================== */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-[#0D0C22]">
                {editingSection === 'name' && 'Edit Nama & Gelar Profesional'}
                {editingSection === 'bio' && 'Edit Biografi / Ringkasan Diri'}
                {editingSection === 'avatar' && 'Ubah Foto Profil'}
                {editingSection === 'banner' && 'Ubah Warna / Banner Profil'}
              </h3>
              <button 
                onClick={() => setEditingSection(null)} 
                className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editingSection === 'name' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#0D0C22]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Gelar / Role Profesional</label>
                  <input
                    type="text"
                    value={tempRoleTitle}
                    onChange={(e) => setTempRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#0D0C22]"
                  />
                </div>
              </div>
            )}

            {editingSection === 'bio' && (
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-neutral-700 block">Biografi</label>
                <textarea
                  rows={4}
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-[#0D0C22] resize-none"
                  placeholder="Tuliskan biografi singkat Anda..."
                />
              </div>
            )}

            {editingSection === 'avatar' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={tempAvatar} alt="Preview" className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-200" />
                  <div className="flex-1">
                    <label className="font-semibold text-neutral-700 block mb-1">Pilih File Baru</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setAvatarFile(file); setTempAvatar(URL.createObjectURL(file)); }
                      }}
                      className="text-xs text-neutral-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {editingSection === 'banner' && (
              <div className="space-y-3 text-xs">
                <label className="font-semibold text-neutral-700 block">Pilih Warna Aksen Banner</label>
                <div className="flex gap-2">
                  {['#0063b4', '#0d0c22', '#155DFC', '#0f766e', '#7c3aed', '#be185d'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCreatorBannerColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                        creatorBannerColor === c ? 'border-black scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    let avatarUrl = tempAvatar;
                    if (editingSection === 'avatar' && avatarFile) {
                      if (!['image/jpeg', 'image/png', 'image/webp'].includes(avatarFile.type) || avatarFile.size > 10 * 1024 * 1024) {
                        throw new Error('Gunakan JPG, PNG, atau WebP maksimal 10 MB.');
                      }
                      const formData = new FormData();
                      formData.append('file', avatarFile);
                      const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      });
                      const uploadData = await uploadRes.json();
                      if (!uploadRes.ok) {
                        throw new Error(uploadData.error || 'Gagal mengunggah foto profil.');
                      }
                      avatarUrl = uploadData.url;
                    }
                    const payload = editingSection === 'name' ? { fullName: tempName, headline: tempRoleTitle } : editingSection === 'bio' ? { bio: tempBio } : editingSection === 'avatar' ? { avatarUrl } : {};
                    if (editingSection !== 'banner') {
                      const response = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                      if (!response.ok) throw new Error((await response.json()).error || 'Gagal menyimpan profil.');
                    }
                    if (editingSection === 'name') {
                      setCreatorName(tempName);
                      setCreatorRoleTitle(tempRoleTitle);
                      creator.name = tempName;
                      creator.roleTitle = tempRoleTitle;
                      updateUser({ name: tempName, roleTitle: tempRoleTitle });
                    } else if (editingSection === 'bio') {
                      setCreatorBio(tempBio);
                      creator.bio = tempBio;
                      updateUser({ bio: tempBio });
                    } else if (editingSection === 'avatar') {
                      setCreatorAvatar(avatarUrl);
                      setAvatarFile(null);
                      creator.avatar = avatarUrl;
                      updateUser({ avatar: avatarUrl });
                    }
                    await refreshUser();
                    setEditingSection(null);
                  } catch (error) { alert(error instanceof Error ? error.message : 'Gagal menyimpan profil.'); }
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0D0C22] hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Project Modal (Figma JHIC 2.0 style) */}
      <UploadProjectModal
        isOpen={isUploadProjectModalOpen}
        onClose={() => setIsUploadProjectModalOpen(false)}
        creator={creator}
        onSuccess={() => {
          creatorService.getFeedProjects(creator.id).then(setLiveProjects).catch(() => {});
        }}
      />

      {/* Upload Service Modal (Figma JHIC 2.0 style) */}
      <UploadServiceModal
        isOpen={isUploadServiceModalOpen}
        onClose={() => setIsUploadServiceModalOpen(false)}
        creator={creator}
        onSuccess={(newSrv) => setLiveServices((services) => [newSrv, ...services])}
      />

      {/* Contextual Auth Modal for protected actions */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
        onSuccess={(loggedUser) => {
          setIsAuthModalOpen(false);
          refreshUser?.();
          if (authModalConfig.action) {
            authModalConfig.action(loggedUser);
          }
        }}
      />

    </div>
  );
};
