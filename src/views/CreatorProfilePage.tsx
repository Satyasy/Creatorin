'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Share2, 
  MoreHorizontal, 
  Check, 
  MessageSquare, 
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
  Loader2,
  UploadCloud,
  Settings
} from 'lucide-react';
import { uploadImageWithRetry } from '@/lib/uploadHelper';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useToast } from '@/providers/ToastProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { useConfirmModal } from '@/providers/ConfirmModalProvider';
import { useSuccessModal } from '@/providers/SuccessModalProvider';
import { bookmarkService } from '@/services/bookmarkService';
import { createClient } from '@/lib/supabase/client';
import { ShaderFill } from '@/lib/custom-effect-runtime';
import { setup as setupConcentric, render as renderConcentric, manifest as manifestConcentric } from '@/lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430';
import { setup as setupWater, render as renderWater, manifest as manifestWater } from '@/lib/custom-effects/CodeComponentId_40f03f78407c1c973fc891fbca9ff3d0387485e6_435';
import { setup as setupWave, render as renderWave, manifest as manifestWave } from '@/lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433';

const DEFAULT_CREATOR_SERVICES: CreatorService[] = [
  {
    id: 'demo-srv-1',
    title: 'Premium Figma SaaS Landing Page & Design System',
    tag: 'Figma Template',
    description: 'Template landing page SaaS conversion-ready dengan 30+ komponen auto-layout dan variabel token warna.',
    deliveryDays: '2 Hari Kerja',
    price: 1500000,
    formattedPrice: 'Rp1.500.000',
    coverImage: '/figma/service-figma.png',
    isActive: true,
  },
  {
    id: 'demo-srv-2',
    title: 'Full Framer Interactive Website Build + CMS',
    tag: 'Framer Site',
    description: 'Pengerjaan website interaktif dengan Framer Motion, animasi responsif mobile, dan integrasi CMS dinamis.',
    deliveryDays: '4 Hari Kerja',
    price: 3800000,
    formattedPrice: 'Rp3.800.000',
    coverImage: '/figma/service-framer.png',
    isActive: true,
  },
  {
    id: 'demo-srv-3',
    title: '3x Video TikTok UGC & Review Produk Hook Viral',
    tag: 'TikTok UGC',
    description: '3 video vertical 9:16 dengan angle problem-solution, hook 3 detik pertama, B-roll estetik, dan subtitle dinamis.',
    deliveryDays: '3 Hari Kerja',
    price: 2200000,
    formattedPrice: 'Rp2.200.000',
    coverImage: '/figma/service-tiktok.png',
    isActive: true,
  },
  {
    id: 'demo-srv-4',
    title: 'Brand Visual Identity Kit & Guidelines UMKM',
    tag: 'Branding',
    description: 'Panduan identitas logo primer/sekunder, palet warna, tipografi, dan mockup kemasan produk untuk UMKM.',
    deliveryDays: '5 Hari Kerja',
    price: 1800000,
    formattedPrice: 'Rp1.800.000',
    coverImage: '/figma/service-branding.png',
    isActive: false,
  },
];

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
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();
  const { confirmModal } = useConfirmModal();
  const { showSuccessModal } = useSuccessModal();
  const { t } = useLanguage();
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

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') as ProfileTab | null;
  // Active Tab
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (tabParam && ['work', 'services', 'reviews', 'statistics', 'liked', 'about'].includes(tabParam)) {
      return tabParam;
    }
    return 'work';
  });

  useEffect(() => {
    if (tabParam && ['work', 'services', 'reviews', 'statistics', 'liked', 'about'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [shotFilter, setShotFilter] = useState<ShotFilter>('recent');
  const [reviewFilter, setReviewFilter] = useState<'recent' | 'highest'>('recent');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
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

  // In-place inline edit profile state
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [editingSection, setEditingSection] = useState<'name' | 'bio' | 'avatar' | 'banner' | null>(null);
  const [creatorName, setCreatorName] = useState(creator.name);
  const [creatorRoleTitle, setCreatorRoleTitle] = useState(creator.roleTitle);
  const [creatorBio, setCreatorBio] = useState(creator.bio);
  const [creatorAvatar, setCreatorAvatar] = useState(creator.avatar);
  const [creatorBannerColor, setCreatorBannerColor] = useState(creator.coverUrl || '#0063b4');

  // Temp editing inputs
  const [tempName, setTempName] = useState(creator.name);
  const [tempRoleTitle, setTempRoleTitle] = useState(creator.roleTitle);
  const [tempBio, setTempBio] = useState(creator.bio);
  const [tempAvatar, setTempAvatar] = useState(creator.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [tempBanner, setTempBanner] = useState<string>(creator.coverUrl || '#0063b4');
  const [bannerTab, setBannerTab] = useState<'upload' | 'color'>('upload');
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Finish edit confirmation & animated success modal state
  const [isConfirmFinishOpen, setIsConfirmFinishOpen] = useState(false);
  const [isSuccessFinishOpen, setIsSuccessFinishOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (isSuccessFinishOpen) {
      const timer = setTimeout(() => {
        setIsSuccessFinishOpen(false);
        setIsEditModeActive(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSuccessFinishOpen]);

  const handleConfirmFinish = async () => {
    setIsSavingProfile(true);
    try {
      let avatarUrl = creatorAvatar;
      if (avatarFile) {
        const uploadResult = await uploadImageWithRetry(avatarFile, 'avatars');
        avatarUrl = uploadResult.url;
        setCreatorAvatar(avatarUrl);
        setAvatarFile(null);
        creator.avatar = avatarUrl;
        updateUser({ avatar: avatarUrl });
      }

      let coverUrl = creatorBannerColor;
      if (bannerFile) {
        const uploadResult = await uploadImageWithRetry(bannerFile, 'avatars');
        coverUrl = uploadResult.url;
        setCreatorBannerColor(coverUrl);
        setBannerFile(null);
        creator.coverUrl = coverUrl;
        updateUser({ coverUrl });
      }

      const payload: { fullName?: string; headline?: string; bio?: string; avatarUrl?: string; coverUrl?: string } = {};
      if (tempName && tempName !== creator.name) payload.fullName = tempName;
      if (tempRoleTitle && tempRoleTitle !== creator.roleTitle) payload.headline = tempRoleTitle;
      if (tempBio && tempBio !== creator.bio) payload.bio = tempBio;
      if (avatarUrl && avatarUrl !== creator.avatar) payload.avatarUrl = avatarUrl;
      if (coverUrl && coverUrl !== (creator.coverUrl || '#0063b4')) payload.coverUrl = coverUrl;

      if (Object.keys(payload).length > 0) {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error((await response.json()).error || 'Gagal menyimpan profil.');
        }
        if (payload.fullName) {
          setCreatorName(tempName);
          creator.name = tempName;
        }
        if (payload.headline) {
          setCreatorRoleTitle(tempRoleTitle);
          creator.roleTitle = tempRoleTitle;
        }
        if (payload.bio) {
          setCreatorBio(tempBio);
          creator.bio = tempBio;
        }
        if (payload.coverUrl) {
          setCreatorBannerColor(coverUrl);
          creator.coverUrl = coverUrl;
        }
        updateUser({
          ...(payload.fullName ? { name: tempName } : {}),
          ...(payload.headline ? { roleTitle: tempRoleTitle } : {}),
          ...(payload.bio ? { bio: tempBio } : {}),
          ...(payload.avatarUrl ? { avatar: avatarUrl } : {}),
          ...(payload.coverUrl ? { coverUrl } : {}),
        });
        await refreshUser();
      }

      setIsConfirmFinishOpen(false);
      setIsSuccessFinishOpen(true);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Profil',
        message: error instanceof Error ? error.message : 'Gagal menyimpan pembaruan profil ke server.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Saved shots / projects in profile
  const [likedShots, setLikedShots] = useState<Set<string>>(new Set());
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());
  const [savedServiceIds, setSavedServiceIds] = useState<Set<string>>(new Set());
  const [activeMediaIndexes, setActiveMediaIndexes] = useState<{ [id: string]: number }>({});
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<FeedProject | null>(null);
  const [liveProjects, setLiveProjects] = useState<FeedProject[]>([]);
  const [liveServices, setLiveServices] = useState<CreatorService[]>(() => {
    if (creator.services && creator.services.length > 0) {
      return creator.services.map((s, idx) => ({
        ...s,
        isActive: s.isActive !== undefined ? s.isActive : (idx === 3 ? false : true),
        coverImage: s.coverImage || (idx === 0 ? '/figma/service-figma.png' : idx === 1 ? '/figma/service-framer.png' : idx === 2 ? '/figma/service-tiktok.png' : '/figma/service-branding.png'),
      }));
    }
    return DEFAULT_CREATOR_SERVICES;
  });

  useEffect(() => {
    if (creator.services && creator.services.length > 0) {
      setLiveServices(creator.services.map((s, idx) => ({
        ...s,
        isActive: s.isActive !== undefined ? s.isActive : (idx === 3 ? false : true),
        coverImage: s.coverImage || (idx === 0 ? '/figma/service-figma.png' : idx === 1 ? '/figma/service-framer.png' : idx === 2 ? '/figma/service-tiktok.png' : '/figma/service-branding.png'),
      })));
    }
  }, [creator.services]);

  useEffect(() => {
    if (currentUser) {
      bookmarkService.getBookmarks('project').then(ids => setSavedProjectIds(new Set(ids))).catch(() => {});
      bookmarkService.getBookmarks('service').then(ids => setSavedServiceIds(new Set(ids))).catch(() => {});
    } else {
      setSavedProjectIds(new Set());
      setSavedServiceIds(new Set());
    }
  }, [currentUser]);

  const handleToggleServiceActive = async (serviceId: string) => {
    const target = liveServices.find((s) => s.id === serviceId);
    if (!target) return;
    const newActive = target.isActive === false;
    setLiveServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: newActive } : s))
    );

    if (!serviceId.startsWith('demo-') && !serviceId.startsWith('qa-') && !serviceId.startsWith('sm-')) {
      try {
        await fetch(`/api/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: newActive }),
        });
      } catch (err) {
        console.error('Failed to toggle service status:', err);
      }
    }

    showToast({
      type: 'success',
      title: newActive ? 'Layanan Diaktifkan' : 'Layanan Dinonaktifkan',
      message: newActive ? 'Layanan berhasil diaktifkan dan tayang ke UMKM.' : 'Layanan dinonaktifkan (Draft).',
    });
  };

  const handleDeleteService = async (serviceId: string, serviceTitle: string) => {
    const confirmed = await confirmModal({
      title: 'Hapus Layanan',
      message: `Apakah Anda yakin ingin menghapus layanan "${serviceTitle}" dari profil Anda?`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    });
    if (!confirmed) return;

    if (!serviceId.startsWith('demo-') && !serviceId.startsWith('qa-') && !serviceId.startsWith('sm-')) {
      try {
        const res = await fetch(`/api/services/${serviceId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          showToast({
            type: 'error',
            title: 'Gagal Menghapus Layanan',
            message: errData.error || 'Terjadi kesalahan saat menghapus layanan dari server.',
          });
          return;
        }
      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Koneksi Terputus',
          message: err?.message || 'Gagal menghubungi server.',
        });
        return;
      }
    }

    setLiveServices((prev) => prev.filter((s) => s.id !== serviceId));

    showSuccessModal({
      title: 'Layanan Dihapus',
      message: `Paket layanan "${serviceTitle}" telah dihapus.`,
      duration: 2500,
    });
  };

  const servicesToDisplay = useMemo(() => {
    if (isEffectiveOwner) return liveServices;
    return liveServices.filter((s) => s.isActive !== false);
  }, [isEffectiveOwner, liveServices]);
  useEffect(() => {
    if (!creator.id) return;
    creatorService.getFeedProjects(creator.id).then(setLiveProjects).catch(() => setLiveProjects([]));
  }, [creator.id]);
  const [isDetailMuted, setIsDetailMuted] = useState(true);
  const [detailMediaIndex, setDetailMediaIndex] = useState(0);

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
  const toggleSaveProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast({
        type: 'warning',
        title: t('toast.authRequired', 'Perlu Masuk Akun'),
        message: t('auth.bookmarkRequired', 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk menyimpan ke koleksi favorit.'),
        action: {
          label: t('action.signIn', 'Masuk ke Akun'),
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    const wasSaved = savedProjectIds.has(id);
    setSavedProjectIds(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id); else next.add(id);
      return next;
    });

    try {
      const res = await bookmarkService.toggleBookmark('project', id);
      setSavedProjectIds(prev => {
        const next = new Set(prev);
        if (res.bookmarked) next.add(id); else next.delete(id);
        return next;
      });
      if (res.bookmarked) {
        showSuccessModal({
          title: t('toast.savedFavorite', 'Tersimpan ke Favorit'),
          message: 'Proyek berhasil disimpan ke koleksi favorit Anda.',
        });
      } else {
        showToast({
          type: 'info',
          message: 'Proyek dihapus dari koleksi favorit.',
        });
      }
    } catch (err: any) {
      setSavedProjectIds(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(id); else next.delete(id);
        return next;
      });
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err?.message || 'Gagal memperbarui status simpan proyek.',
      });
    }
  };

  // Toggle bookmark on service
  const toggleSaveService = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast({
        type: 'warning',
        title: t('toast.authRequired', 'Perlu Masuk Akun'),
        message: t('toast.saveServiceAuth', 'Anda harus masuk ke akun Creatorin terlebih dahulu untuk menyimpan layanan favorit.'),
        action: {
          label: t('action.signIn', 'Masuk ke Akun'),
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    const wasSaved = savedServiceIds.has(id);
    setSavedServiceIds(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id); else next.add(id);
      return next;
    });

    try {
      const res = await bookmarkService.toggleBookmark('service', id);
      setSavedServiceIds(prev => {
        const next = new Set(prev);
        if (res.bookmarked) next.add(id); else next.delete(id);
        return next;
      });
      if (res.bookmarked) {
        showSuccessModal({
          title: t('toast.savedFavorite', 'Tersimpan ke Favorit'),
          message: 'Layanan berhasil disimpan ke koleksi favorit Anda.',
        });
      } else {
        showToast({
          type: 'info',
          message: 'Layanan dihapus dari koleksi favorit.',
        });
      }
    } catch (err: any) {
      setSavedServiceIds(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(id); else next.delete(id);
        return next;
      });
      showToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err?.message || 'Gagal memperbarui status simpan layanan.',
      });
    }
  };

  // Copy link
  const handleCopyLink = () => {
    const canonicalUrl = `${window.location.origin}/creator/${creator.slug || creator.id}`;
    navigator.clipboard?.writeText?.(canonicalUrl);
    setCopiedLinkSuccess(true);
    setIsMoreMenuOpen(false);
    showToast({
      type: 'success',
      message: t('toast.profileCopied', 'Tautan profil berhasil disalin!'),
    });
    setTimeout(() => setCopiedLinkSuccess(false), 3000);
  };

  // Internal executor for sending inquiry message
  const executeSendInquiry = async (text: string) => {
    setIsSendingInquiry(true);
    try {
      // 1. Inisiasi atau cari percakapan yang sudah ada dengan kreator ini
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: creator.id }),
      });
      const convData = await convRes.json();
      if (!convRes.ok) throw new Error(convData.error || 'Gagal memulai percakapan');

      const conversationId = convData.conversation?.id;
      if (conversationId) {
        // 2. Kirim pesan pengantar awal
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            content: text,
          }),
        });
      }

      setInquirySentSuccess(true);
      setTimeout(() => {
        setInquirySentSuccess(false);
        setIsGetInTouchOpen(false);
        setInquiryMessage('');
        router.push(conversationId ? `/chat?conversationId=${conversationId}` : '/chat');
      }, 900);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Mengirim Penawaran',
        message: err?.message || 'Gagal mengirim pesan penawaran ke kreator.',
      });
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
          style={
            (creatorBannerColor.startsWith('#') || creatorBannerColor.startsWith('linear-gradient'))
              ? { background: creatorBannerColor }
              : undefined
          }
        >
          {!(creatorBannerColor.startsWith('#') || creatorBannerColor.startsWith('linear-gradient')) && (
            <img
              src={creatorBannerColor}
              alt="Profile Cover Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {(creatorBannerColor.startsWith('#') || creatorBannerColor.startsWith('linear-gradient')) && (
            <>
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
            </>
          )}
          {isOwnProfile && isEditModeActive && (
            <button
              onClick={() => {
                setTempBanner(creatorBannerColor);
                setBannerFile(null);
                setBannerTab(
                  creatorBannerColor.startsWith('#') || creatorBannerColor.startsWith('linear-gradient')
                    ? 'color'
                    : 'upload'
                );
                setEditingSection('banner');
              }}
              className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-black text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition hover:scale-105"
              title="Ganti Background Sampul"
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
                      showSuccessModal({
                        title: 'Kreator Terverifikasi',
                        message: `Profil ${creatorName} telah lolos uji portofolio dan verifikasi identitas resmi tim Creatorin.`,
                        duration: 3000,
                      });
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
                  onClick={() => {
                    if (!isEditModeActive) {
                      setIsEditModeActive(true);
                      setTempName(creatorName);
                      setTempRoleTitle(creatorRoleTitle);
                      setTempBio(creatorBio);
                      setTempAvatar(creatorAvatar);
                    } else {
                      setIsConfirmFinishOpen(true);
                    }
                  }}
                  className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-xs ${
                    isEditModeActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#0B1F3A] hover:bg-[#123B8C] text-white'
                  }`}
                >
                  {isEditModeActive ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                  <span>{isEditModeActive ? t('action.finishEdit', 'Selesai Edit') : t('action.editProfile', 'Edit Profil')}</span>
                </button>

                {/* Own Profile: Pengaturan Akun */}
                <button
                  id="btn-profile-settings"
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[#E2E8F0] bg-white text-neutral-700 hover:text-neutral-900 hover:bg-[#F8FAFC] text-sm font-semibold transition-colors cursor-pointer"
                  title="Buka Pengaturan Akun"
                >
                  <Settings className="w-4 h-4 text-neutral-500" />
                  <span className="hidden sm:inline">Pengaturan</span>
                </button>
              </>
            ) : (
              <>
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

          {/* Inline Stats Row (100% Dinamis dari Database) */}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-normal text-[#64748B]">
            <span>
              <strong className="text-[#0F172A] font-semibold">
                {creator.stats?.completedProjects ?? creator.careerScore?.completedProjects ?? 0}
              </strong>{' '}
              Proyek Selesai
            </span>
            <span>
              {Number(creator.reviewCount ?? 0) > 0 ? (
                <>
                  <strong className="text-[#0F172A] font-semibold">
                    {Number(creator.rating || 0).toFixed(1)} ★
                  </strong>{' '}
                  ({creator.reviewCount} Ulasan)
                </>
              ) : (
                <span className="text-[#64748B]">Belum ada ulasan</span>
              )}
            </span>
            {(creator.careerScore?.overall ?? 0) > 0 && (
              <span>
                <strong className="text-[#0F172A] font-semibold">
                  {creator.careerScore?.overall}%
                </strong>{' '}
                Skor Karir
              </span>
            )}
            <span className="text-[#a1a1a1]">
              <MapPin className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-[#0d0c22]" />
              {creator.location || 'Indonesia'}
            </span>
            {(creator.schoolBadge?.schoolName || (creator.schoolStatus === 'approved' && creator.schoolName)) && (
              <span className="text-[#0B1F3A] font-medium">
                <Laptop className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-[#0B1F3A]" />
                {creator.schoolBadge?.schoolName || creator.schoolName}
              </span>
            )}
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
                {servicesToDisplay.length}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
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
          <div className="py-2">
            {/* Header: Manajemen Layanan Kreator (Figma node 5414:15483) */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-[672px]">
                <h2 className="text-[28px] sm:text-[30px] font-extrabold leading-[36px] tracking-[-0.012em] text-[#0d0c22]">
                  {isEffectiveOwner ? 'Manajemen Layanan Kreator' : 'Paket Layanan Kreator'}
                </h2>
                <p className="mt-1 text-[14px] font-normal leading-[22.75px] tracking-[-0.011em] text-[#737373]">
                  {isEffectiveOwner
                    ? 'Kelola paket jasa, tarif komersial, durasi pengerjaan, dan status aktif layanan yang Anda tawarkan kepada brand & UMKM.'
                    : 'Pesan paket layanan komersial terverifikasi dengan proteksi pembayaran rekening bersama (escrow) Creatorin.'}
                </p>
              </div>
            </div>

            {/* Grid Container (Matching UMKM card scale) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {/* Item 1: Upload Proyek Tile (Only visible if isEffectiveOwner) */}
              {isEffectiveOwner && (
                <button
                  id="btn-upload-service-action"
                  data-testid="btn-upload-service-action"
                  type="button"
                  onClick={() => setIsUploadServiceModalOpen(true)}
                  className="group relative flex min-h-[300px] sm:min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#acacac] bg-white p-5 sm:p-6 text-center transition-all hover:border-[#0d0c22] hover:bg-neutral-50/50 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="flex flex-col items-center justify-center max-w-[240px]">
                    <div className="flex items-center justify-center">
                      <svg width="44" height="36" viewBox="0 0 64 53" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#b0b0b0] group-hover:text-[#0d0c22] transition-colors">
                        <path d="M32.3297 0V52.9998" stroke="currentColor" strokeWidth="4" />
                        <path d="M63.729 26.8841H0.000499456" stroke="currentColor" strokeWidth="4" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-base sm:text-lg font-bold leading-tight text-black group-hover:text-[#0d0c22]">
                      Upload Proyek
                    </h3>
                    <p className="mt-1.5 text-xs font-normal leading-relaxed text-neutral-500">
                      Show off your best work. Get feedback, likes and be a part of a growing community.
                    </p>
                  </div>
                </button>
              )}

              {/* Service Cards matching UMKM Card Dimensions */}
              {servicesToDisplay.map((srv) => (
                <div
                  key={srv.id}
                  className="group flex flex-col justify-between rounded-2xl border border-[#E1E3EA] bg-white p-3.5 sm:p-4 text-left shadow-[0px_1px_2px_rgba(13,12,34,0.06)] hover:border-[#B7BBC9] hover:shadow-md transition-all"
                >
                  <div>
                    {/* Cover Image Container (UMKM aspect 16/10) */}
                    <div
                      onClick={() => setSelectedServiceForDetail(srv)}
                      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 cursor-pointer"
                      title="Lihat detail layanan"
                    >
                      {srv.coverImage ? (
                        <img
                          src={srv.coverImage}
                          alt={srv.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/figma/service-figma.png';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                          <span className="text-xs font-semibold text-neutral-400">{srv.tag || 'Layanan'}</span>
                        </div>
                      )}
                    </div>

                    {/* Category Tag */}
                    <div className="mt-3">
                      <span className="inline-block rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#55576A]">
                        {srv.tag || srv.category || 'Layanan'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => setSelectedServiceForDetail(srv)}
                      className="mt-2 cursor-pointer font-display font-semibold text-sm sm:text-[15px] leading-snug text-[#0d0c22] transition-colors group-hover:text-[#155DFC] line-clamp-2"
                      title="Lihat detail layanan"
                    >
                      {srv.title}
                    </h4>

                    {/* Description */}
                    <p
                      onClick={() => setSelectedServiceForDetail(srv)}
                      className="mt-1 line-clamp-2 cursor-pointer text-xs leading-relaxed text-[#55576A]"
                    >
                      {srv.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                    </p>

                    {/* Duration / Estimasi */}
                    <div
                      onClick={() => setSelectedServiceForDetail(srv)}
                      className="mt-2.5 flex cursor-pointer items-center gap-1.5 text-xs text-[#55576A]"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#6F7285]">
                        <path d="M7 3.5V7L9.33333 8.16667" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.99935 12.8337C10.221 12.8337 12.8327 10.222 12.8327 7.00033C12.8327 3.77866 10.221 1.16699 6.99935 1.16699C3.77769 1.16699 1.16602 3.77866 1.16602 7.00033C1.16602 10.222 3.77769 12.8337 6.99935 12.8337Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>
                        Estimasi:{' '}
                        {srv.deliveryDays
                          ? srv.deliveryDays.toLowerCase().includes('hari')
                            ? srv.deliveryDays
                            : `${srv.deliveryDays} Hari Kerja`
                          : '2-3 Hari Kerja'}
                      </span>
                    </div>
                  </div>

                  {/* Footer / Bottom Row */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F3F4F6] pt-3">
                    {/* Price column */}
                    <div onClick={() => setSelectedServiceForDetail(srv)} className="cursor-pointer min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6F7285] leading-none">
                        HARGA
                      </span>
                      <span className="block truncate text-sm sm:text-base font-bold leading-tight text-[#0d0c22] mt-0.5">
                        {srv.formattedPrice || (srv.price ? `Rp${srv.price.toLocaleString('id-ID')}` : 'Rp1.500.000')}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {isEffectiveOwner ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Toggle Active / Nonaktifkan */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleServiceActive(srv.id);
                          }}
                          className={`rounded-full border border-[#E1E3EA] px-2.5 sm:px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                            srv.isActive !== false
                              ? 'text-[#404040] hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                              : 'text-[#404040] hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {srv.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>

                        {/* Trash button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteService(srv.id, srv.title);
                          }}
                          className="flex size-7 items-center justify-center rounded-full border border-[#E1E3EA] text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          title="Hapus Layanan"
                          aria-label="Hapus Layanan"
                        >
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M5.83398 6.41699V9.91699" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.16602 6.41699V9.91699" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.0827 3.5V11.6667C11.0827 11.9761 10.9598 12.2728 10.741 12.4916C10.5222 12.7104 10.2254 12.8333 9.91602 12.8333H4.08268C3.77326 12.8333 3.47652 12.7104 3.25772 12.4916C3.03893 12.2728 2.91602 11.9761 2.91602 11.6667V3.5" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1.75 3.5H12.25" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.66602 3.50033V2.33366C4.66602 2.02424 4.78893 1.72749 5.00772 1.5087C5.22652 1.28991 5.52326 1.16699 5.83268 1.16699H8.16602C8.47543 1.16699 8.77218 1.28991 8.99097 1.5087C9.20977 1.72749 9.33268 2.02424 9.33268 2.33366V3.50033" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleSaveService(srv.id, e)}
                          className={`flex size-7 items-center justify-center rounded-full border transition cursor-pointer ${
                            savedServiceIds.has(srv.id)
                              ? 'border-amber-300 bg-amber-50 text-amber-600'
                              : 'border-[#E1E3EA] hover:border-neutral-300 hover:bg-neutral-100 text-neutral-600'
                          }`}
                          title={savedServiceIds.has(srv.id) ? 'Tersimpan' : 'Simpan layanan'}
                          aria-label="Simpan layanan"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${savedServiceIds.has(srv.id) ? 'fill-amber-500 text-amber-500' : 'stroke-[1.75]'}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenOrderService(srv)}
                          className="rounded-full bg-[#0d0c22] px-3.5 py-1 text-[11px] sm:text-xs font-bold text-white shadow-xs transition hover:bg-neutral-800 cursor-pointer"
                        >
                          Diskusikan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                {sortedReviews.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-100 mt-4">
                    <p className="text-sm font-medium">Belum ada ulasan untuk kreator ini.</p>
                    <p className="text-xs text-neutral-400 mt-1">Ulasan akan otomatis tampil setelah kolaborasi proyek selesai diserahterimakan.</p>
                  </div>
                ) : (
                  sortedReviews.map((rev) => (
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
                )))}
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
                  <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0" />
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

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-neutral-600 font-normal">
                <span>
                  <strong className="text-[#0d0c22] font-semibold">{creator.stats?.completedProjects ?? creator.careerScore?.completedProjects ?? 0}</strong> proyek selesai
                </span>
                <span>
                  <strong className="text-[#0d0c22] font-semibold">{creator.skills.length}</strong> keahlian terverifikasi
                </span>
                {(creator.careerScore?.overall ?? 0) > 0 && (
                  <span>
                    <strong className="text-[#0d0c22] font-semibold">{creator.careerScore?.overall}%</strong> skor rekam jejak
                  </span>
                )}
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
                      showSuccessModal({
                        title: 'Pemesanan Diproses',
                        message: `Pemesanan layanan "${selectedServiceForOrder.title}" berhasil diproses! Silakan lengkapi instruksi brief proyek Anda.`,
                        duration: 3500,
                      });
                      setSelectedServiceForOrder(null);
                    },
                  });
                  setIsAuthModalOpen(true);
                  return;
                }
                showSuccessModal({
                  title: 'Pemesanan Diproses',
                  message: `Pemesanan layanan "${selectedServiceForOrder.title}" berhasil diproses! Silakan lengkapi instruksi brief proyek Anda.`,
                  duration: 3500,
                });
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
              <div className="space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="relative group shrink-0">
                    <img 
                      src={tempAvatar} 
                      alt="Preview Avatar" 
                      className="w-16 h-16 rounded-full object-cover ring-3 ring-white shadow-md" 
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-neutral-800 text-sm">Pratinjau Foto Profil</p>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      Gunakan format JPG, PNG, atau WebP. Maksimal ukuran 15 MB.
                    </p>
                    {avatarFile && (
                      <p className="text-blue-600 font-semibold text-[11px] mt-1 flex items-center justify-center sm:justify-start gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>File terpilih: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Dropzone with explicit cursor pointer and hover effects */}
                <label 
                  htmlFor="avatar-file-upload-input"
                  className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-blue-500 rounded-2xl bg-white hover:bg-blue-50/40 transition-all duration-200 cursor-pointer text-center"
                >
                  <input
                    id="avatar-file-upload-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { 
                        setAvatarFile(file); 
                        setTempAvatar(URL.createObjectURL(file)); 
                      }
                    }}
                    className="sr-only cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-blue-100 text-neutral-600 group-hover:text-blue-600 flex items-center justify-center transition mb-2 cursor-pointer shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-neutral-800 group-hover:text-blue-600 text-xs transition cursor-pointer">
                    Klik untuk memilih berkas foto atau seret ke sini
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 cursor-pointer">
                    Mendukung JPG, PNG, atau WebP (Orientasi 1:1 direkomendasikan)
                  </span>
                </label>
              </div>
            )}

            {editingSection === 'banner' && (
              <div className="space-y-4 text-xs">
                {/* Tabs: Upload Foto vs Pilihan Warna */}
                <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBannerTab('upload')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      bannerTab === 'upload'
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Foto Sampul</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTab('color')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      bannerTab === 'color'
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preset Warna & Gradien</span>
                  </button>
                </div>

                {bannerTab === 'upload' && (
                  <div className="space-y-3">
                    {/* Live Preview Banner */}
                    <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
                      {!(tempBanner.startsWith('#') || tempBanner.startsWith('linear-gradient')) ? (
                        <img src={tempBanner} alt="Preview Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs" style={{ background: tempBanner }}>
                          <span>Belum ada foto yang dipilih</span>
                        </div>
                      )}
                    </div>

                    {/* Dropzone with cursor-pointer and hover */}
                    <label 
                      htmlFor="banner-file-upload-input"
                      className="group relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-neutral-300 hover:border-blue-500 rounded-2xl bg-white hover:bg-blue-50/40 transition-all duration-200 cursor-pointer text-center"
                    >
                      <input
                        id="banner-file-upload-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBannerFile(file);
                            setTempBanner(URL.createObjectURL(file));
                          }
                        }}
                        className="sr-only cursor-pointer"
                      />
                      <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-blue-100 text-neutral-600 group-hover:text-blue-600 flex items-center justify-center transition mb-1.5 cursor-pointer shadow-xs">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-neutral-800 group-hover:text-blue-600 text-xs transition cursor-pointer">
                        Klik untuk memilih foto sampul kustom
                      </span>
                      <span className="text-[11px] text-neutral-400 mt-0.5 cursor-pointer">
                        Format JPG, PNG, WebP maks 15 MB (Rekomendasi rasio 16:9 atau 1440x300px)
                      </span>
                      {bannerFile && (
                        <span className="text-blue-600 font-semibold text-[11px] mt-2">
                          File: {bannerFile.name} ({(bannerFile.size / 1024).toFixed(0)} KB)
                        </span>
                      )}
                    </label>
                  </div>
                )}

                {bannerTab === 'color' && (
                  <div className="space-y-3">
                    <div 
                      className="h-20 w-full rounded-2xl border border-neutral-200 shadow-inner flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: tempBanner.startsWith('#') || tempBanner.startsWith('linear-gradient') ? tempBanner : '#0063b4' }}
                    >
                      Pratinjau Warna Aksen Banner
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-700 mb-2">Pilih Palet Tema:</p>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          '#0063b4', 
                          '#0d0c22', 
                          '#155DFC', 
                          '#0f766e', 
                          '#7c3aed', 
                          '#be185d', 
                          '#ea580c',
                          'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                          'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
                          'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)'
                        ].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setTempBanner(c);
                              setBannerFile(null);
                            }}
                            className={`w-9 h-9 rounded-xl border-2 transition cursor-pointer shadow-xs hover:scale-110 ${
                              tempBanner === c ? 'border-black ring-2 ring-blue-500 scale-105' : 'border-neutral-200'
                            }`}
                            style={{ background: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                disabled={isSavingSection}
                onClick={async () => {
                  setIsSavingSection(true);
                  try {
                    let avatarUrl = tempAvatar;
                    let coverUrl = tempBanner;

                    if (editingSection === 'avatar' && avatarFile) {
                      const uploadResult = await uploadImageWithRetry(avatarFile, 'avatars');
                      avatarUrl = uploadResult.url;
                    }

                    if (editingSection === 'banner' && bannerFile) {
                      const uploadResult = await uploadImageWithRetry(bannerFile, 'avatars');
                      coverUrl = uploadResult.url;
                    }

                    const payload: Record<string, any> = {};
                    if (editingSection === 'name') {
                      payload.fullName = tempName;
                      payload.headline = tempRoleTitle;
                    } else if (editingSection === 'bio') {
                      payload.bio = tempBio;
                    } else if (editingSection === 'avatar') {
                      payload.avatarUrl = avatarUrl;
                    } else if (editingSection === 'banner') {
                      payload.coverUrl = coverUrl;
                    }

                    const response = await fetch('/api/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    if (!response.ok) {
                      const errData = await response.json().catch(() => ({}));
                      throw new Error(errData.error || 'Gagal menyimpan profil.');
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
                    } else if (editingSection === 'banner') {
                      setCreatorBannerColor(coverUrl);
                      setBannerFile(null);
                      creator.coverUrl = coverUrl;
                      updateUser({ coverUrl });
                    }

                    await refreshUser();
                    setEditingSection(null);
                    showSuccessModal({
                      title: 'Profil Berhasil Diperbarui',
                      message: editingSection === 'banner'
                        ? 'Warna / foto banner profil berhasil disimpan di server.'
                        : 'Pembaruan data profil Anda berhasil disimpan.',
                      duration: 2500,
                    });
                  } catch (error) {
                    showToast({
                      type: 'error',
                      title: 'Gagal Menyimpan Profil',
                      message: error instanceof Error ? error.message : 'Gagal menyimpan profil ke server.',
                    });
                  } finally {
                    setIsSavingSection(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-[#0D0C22] hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
              >
                {isSavingSection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan</span>
                )}
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

      {/* ==================================================================== */}
      {/* CUSTOM CONFIRMATION POPUP (SELESAI EDIT VERIFICATION)               */}
      {/* ==================================================================== */}
      {isConfirmFinishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-200 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-150">
            {/* Center Header Icon */}
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#155DFC]">
              <CheckCircle2 className="w-6 h-6 text-[#155DFC]" />
            </div>

            <h3 className="text-lg font-bold text-[#0D0C22] mb-2 tracking-tight">
              {t('profile.confirmFinishTitle', 'Selesaikan & Simpan Edit?')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mb-6 leading-relaxed max-w-sm mx-auto">
              {t('profile.confirmFinishDesc', 'Apakah kamu yakin ingin menyelesaikan pengeditan profil? Seluruh perubahan informasi terbaru akan tersimpan.')}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmFinishOpen(false)}
                disabled={isSavingProfile}
                className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
              >
                {t('action.cancel', 'Batal')}
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                disabled={isSavingProfile}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('action.saving', 'Menyimpan...')}</span>
                  </>
                ) : (
                  <span>{t('profile.confirmFinishButton', 'Yakin, Simpan')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CUSTOM SUCCESS ANIMATED POPUP (CENTER CHECKMARK ANIMATION)          */}
      {/* ==================================================================== */}
      {isSuccessFinishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-neutral-200 p-7 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            {/* Centered Smooth Animated Checkmark */}
            <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#155DFC]" viewBox="0 0 52 52">
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke="#155DFC"
                    strokeWidth="3.5"
                    strokeDasharray="145"
                    strokeDashoffset="145"
                    style={{
                      animation: 'successCircleDraw 0.55s cubic-bezier(0.65, 0, 0.45, 1) forwards',
                    }}
                  />
                  <path
                    fill="none"
                    stroke="#155DFC"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.5 27.2l7.1 7.2 16.7-16.8"
                    strokeDasharray="36"
                    strokeDashoffset="36"
                    style={{
                      animation: 'successCheckDraw 0.4s 0.35s cubic-bezier(0.65, 0, 0.45, 1) forwards',
                    }}
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#0D0C22] mb-1.5 tracking-tight">
              {t('profile.successFinishTitle', 'Profil Berhasil Diperbarui!')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mb-5 leading-relaxed">
              {t('profile.successFinishDesc', 'Perubahan informasi profil Anda telah berhasil disimpan.')}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsSuccessFinishOpen(false);
                setIsEditModeActive(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition cursor-pointer"
            >
              {t('action.close', 'Tutup')}
            </button>

            {/* Embedded Keyframes for SVG stroke drawing */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes successCircleDraw {
                  0% { stroke-dashoffset: 145; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes successCheckDraw {
                  0% { stroke-dashoffset: 36; }
                  100% { stroke-dashoffset: 0; }
                }
              `
            }} />
          </div>
        </div>
      )}

    </div>
  );
};
