'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Share2,
  Globe,
  Mail,
  Play,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { FeedProject, Creator, ActivePage } from '@/types';
import { Footer } from '@/components/layout/Footer';
import { ProjectCard } from '@/components/common/ProjectCard';
import { useAuth } from '@/providers/AuthProvider';
import { AuthModal } from '@/components/modals/AuthModal';
import { startRouteProgress } from '@/components/common/RouteProgressBar';

export interface ProjectDetailModalProps {
  project: FeedProject;
  onClose: () => void;
  onSelectProject?: (project: FeedProject) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onGetInTouch?: (creator: Creator) => void;
  onScheduleCall?: (creator: Creator, project?: FeedProject) => void;
  onNavigate?: (page: ActivePage) => void;
  allProjects?: FeedProject[];
}

interface SimilarProjectItem {
  id: string;
  title: string;
  creatorHandle: string;
  viewsCount: string;
  mediaUrl: string;
  category: string;
  description?: string;
  creatorId?: string;
  creatorName?: string;
}

const FALLBACK_SIMILAR_PROJECTS: SimilarProjectItem[] = [
  {
    id: 'sim-1',
    title: 'Belum Resmi Meluncur, Chery QQ Ketahuan Ngetes di Curug',
    creatorHandle: '@rianstory.fnb',
    viewsCount: '620.5K',
    mediaUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    category: 'Instagram Reels',
  },
  {
    id: 'sim-2',
    title: 'Rebranding Visual Kopi Specialty Lereng Ijen & Packaging Box',
    creatorHandle: '@sobakhul.design',
    viewsCount: '1.2M',
    mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    category: 'Branding & Kemasan',
  },
  {
    id: 'sim-3',
    title: 'Lookbook Video Fashion Streetwear Lokal Jakarta Aesthetic',
    creatorHandle: '@sarah.streetwear',
    viewsCount: '630.0K',
    mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    category: 'Fashion Video',
  },
  {
    id: 'sim-4',
    title: 'Motion Teaser Peluncuran Koleksi Batik Kontemporer 3D',
    creatorHandle: '@kevinsanjaya.motion',
    viewsCount: '980.5K',
    mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    category: 'Motion Graphic',
  },
];

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project: initialProject,
  onClose,
  onSelectProject,
  onViewCreatorProfile,
  onGetInTouch,
  onNavigate,
  allProjects = [],
}) => {
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState<FeedProject>(initialProject);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Sync state if initialProject changes
  useEffect(() => {
    setCurrentProject(initialProject);
    setActiveImageIndex(0);
  }, [initialProject]);

  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    title: string;
    description: string;
    action?: () => void;
  }>({
    title: 'Masuk ke Akun Creatorin',
    description: 'Masuk untuk melanjutkan tindakan ini dan membuka akses ke seluruh fitur kolaborasi.',
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Smooth bottom sheet mount/unmount animation
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleSmoothClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 240);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSmoothClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSmoothClose]);

  // Derive creator and metadata
  const creator = currentProject.creator;
  const creatorName = creator?.name || 'Maya Angelina';
  const creatorSlug = (creator?.username || creator?.id || 'mayaangelina')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const creatorWebsite = `${creatorSlug}.creatorin.id`;
  const creatorEmail = `inquiry@${creatorSlug}.com`;
  const categoryLabel = currentProject.category || 'Instagram Reels';
  const description =
    currentProject.description ||
    currentProject.caption ||
    'Bukannya pegangan tangan romantis, malah diajarin form deadlift yang bener 😂😂 Konten soft-selling pakaian olahraga & suplemen whey protein yang relate banget sama Gen-Z! Engagement rate: 14.8%!';

  // Multi-image gallery list
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (currentProject.coverImage) list.push(currentProject.coverImage);
    if (currentProject.mediaUrl && !list.includes(currentProject.mediaUrl)) {
      list.push(currentProject.mediaUrl);
    }
    if (currentProject.carouselImages?.length) {
      currentProject.carouselImages.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (currentProject.additionalMedia?.length) {
      currentProject.additionalMedia.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }

    // Ensure at least 6 high-quality image variants matching the 5-thumbnails layout
    const curatedFallbacks = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&auto=format&fit=crop&q=80',
    ];

    for (const fb of curatedFallbacks) {
      if (list.length >= 6) break;
      if (!list.includes(fb)) list.push(fb);
    }

    return list;
  }, [currentProject]);

  // Related projects list
  const similarProjects: SimilarProjectItem[] = useMemo(() => {
    const list: SimilarProjectItem[] = [];

    // Filter projects from props
    allProjects
      .filter((p) => p.id !== currentProject.id)
      .slice(0, 4)
      .forEach((p) => {
        list.push({
          id: p.id,
          title: p.title,
          creatorHandle: p.socialHandle || (p.creator?.username ? `@${p.creator.username}` : '@kreator'),
          viewsCount: p.viewsCount || '500K',
          mediaUrl: p.mediaUrl || p.coverImage,
          category: p.category || 'Karya Kreatif',
          description: p.description,
          creatorId: p.creatorId || p.creator?.id,
          creatorName: p.creator?.name,
        });
      });

    // Supplement with fallbacks if fewer than 4
    FALLBACK_SIMILAR_PROJECTS.forEach((fallback) => {
      if (list.length >= 4) return;
      if (!list.some((item) => item.id === fallback.id || item.title === fallback.title)) {
        list.push(fallback);
      }
    });

    return list.slice(0, 4);
  }, [allProjects, currentProject.id]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Tautan proyek berhasil disalin!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleSendMessage = () => {
    if (onGetInTouch && creator) {
      onGetInTouch(creator);
    } else if (creator?.id) {
      if (!user) {
        setAuthModalConfig({
          title: 'Masuk untuk Menghubungi Kreator',
          description: 'Anda harus masuk akun terlebih dahulu untuk memulai obrolan langsung dan mendiskusikan kebutuhan kolaborasi.',
          action: () => {
            router.push(`/chat?creatorId=${creator.id}`);
          },
        });
        setIsAuthModalOpen(true);
        return;
      }
      router.push(`/chat?creatorId=${creator.id}`);
    } else {
      if (!user) {
        setAuthModalConfig({
          title: 'Masuk untuk Memulai Pesan',
          description: 'Anda harus masuk akun terlebih dahulu untuk mengakses fitur pesan & kolaborasi.',
          action: () => {
            router.push('/chat');
          },
        });
        setIsAuthModalOpen(true);
        return;
      }
      router.push('/chat');
    }
  };

  const handleCreatorClick = () => {
    if (onViewCreatorProfile && creator) {
      onViewCreatorProfile(creator);
    } else if (creator?.id) {
      startRouteProgress();
      router.push(`/creator/${creator.id}`);
    }
  };

  const handleExploreMore = () => {
    if (onNavigate) {
      onNavigate('projects');
    } else {
      router.push('/jelajah/proyek');
    }
  };

  const handleSelectSimilar = (item: SimilarProjectItem) => {
    const convertedProject: FeedProject = {
      id: item.id,
      title: item.title,
      description: item.description || item.title,
      coverImage: item.mediaUrl,
      mediaUrl: item.mediaUrl,
      mediaType: 'image',
      creatorId: item.creatorId || 'creator-sim',
      creator: {
        id: item.creatorId || 'creator-sim',
        name: item.creatorName || item.creatorHandle.replace('@', ''),
        username: item.creatorHandle.replace('@', ''),
        avatar: item.mediaUrl,
        category: 'Image',
        roleTitle: 'Kreator Profesional',
        bio: `${item.creatorName || item.creatorHandle} di Creatorin`,
        location: 'Indonesia',
        startingRate: 250000,
        formattedRate: 'Rp250.000',
        careerScore: {
          overall: 95,
          deadlineAccuracy: 98,
          revisionRate: 1,
          completionRate: 100,
          clientRating: 4.9,
          completedProjects: 45,
          tier: 'Top Tier',
        },
        rating: 4.9,
        reviewCount: 38,
        skills: [item.category, 'Kreator Digital'],
        joinedDate: '2024',
      },
      category: item.category,
      platform: 'direct',
      tags: [item.category.replace(/\s+/g, '')],
      likesCount: 142,
      commentsCount: 18,
      viewsCount: item.viewsCount,
      sharesCount: 12,
    };

    setCurrentProject(convertedProject);
    setActiveImageIndex(0);
    onSelectProject?.(convertedProject);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail Proyek: ${currentProject.title}`}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-[#0D0C22] text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dimmed Overlay Backdrop */}
      <div
        onClick={handleSmoothClose}
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ease-out cursor-pointer ${
          mounted && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Fixed Close Button Top Right */}
      <button
        type="button"
        onClick={handleSmoothClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-6 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
        aria-label="Tutup Detail Proyek"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Smooth Bottom Sheet Container */}
      <div
        ref={scrollContainerRef}
        className={`relative z-10 w-full h-[94vh] sm:h-[92vh] overflow-y-auto overscroll-contain transform-gpu [will-change:transform,scroll-position] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted && !isClosing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="w-full bg-white rounded-t-[28px] sm:rounded-t-[36px] shadow-2xl min-h-full flex flex-col justify-between">
          <div>
            {/* 1. STICKY / FIXED PROFILE HEADER - menetap (stuck) tidak ikut scroll */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F3F4F6] rounded-t-[28px] sm:rounded-t-[36px] shadow-xs">
              <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <img
                    src={creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={creatorName}
                    onClick={handleCreatorClick}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-1 ring-black/5 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                  <div className="min-w-0">
                    <h2
                      onClick={handleCreatorClick}
                      className="font-display font-bold text-sm sm:text-lg text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors truncate"
                    >
                      {creatorName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] sm:text-xs text-[#55576A] mt-0.5">
                      <span className="inline-flex items-center gap-1 hover:text-[#0D0C22] cursor-pointer">
                        <Globe className="w-3.5 h-3.5 text-[#6F7285]" />
                        <span>{creatorWebsite}</span>
                      </span>
                      <span className="hidden sm:inline">&middot;</span>
                      <span className="hidden sm:inline-flex items-center gap-1 hover:text-[#0D0C22] cursor-pointer">
                        <Mail className="w-3.5 h-3.5 text-[#6F7285]" />
                        <span>{creatorEmail}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E1E3EA] bg-white hover:bg-[#F4F5F7] text-[#0D0C22] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Bagikan tautan proyek"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    Kirim Pesan
                  </button>
                </div>
              </div>
            </header>

            {/* 2. Main Scrollable Content */}
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
              {/* Media Gallery Section */}
              <section aria-label="Galeri Media Proyek" className="space-y-3.5">
                <div className="aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden relative bg-neutral-900 shadow-xs">
                  <img
                    src={galleryImages[activeImageIndex] || currentProject.coverImage}
                    alt={`${currentProject.title} preview`}
                    className="w-full h-full object-cover transition-opacity duration-200"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute top-3.5 right-3.5 bg-black/65 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                    {activeImageIndex + 1} / {galleryImages.length} Foto
                  </div>
                </div>

                {/* Thumbnails Row */}
                <div className="grid grid-cols-5 gap-2.5 sm:gap-4">
                  {galleryImages.slice(0, 5).map((imgUrl, idx) => {
                    const isActive = activeImageIndex === idx;
                    const isLastWithMore = idx === 4 && galleryImages.length > 5;
                    const moreCount = galleryImages.length - 4;

                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`aspect-[4/3] rounded-xl overflow-hidden relative cursor-pointer transition-all ${
                          isActive
                            ? 'ring-2 ring-[#0D0C22] ring-offset-2 opacity-100'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isLastWithMore && (
                          <div className="absolute inset-0 bg-black/55 text-white font-bold text-sm sm:text-base flex items-center justify-center">
                            +{moreCount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Project Meta */}
              <section aria-label="Detail Informasi Proyek" className="pt-2">
                <span className="inline-block bg-[#F4F5F7] text-[#55576A] text-xs font-semibold px-3 py-1 rounded-full mb-3.5 tracking-wide">
                  {categoryLabel}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0C22] leading-tight mb-3">
                  {currentProject.title}
                </h1>
                <p className="text-sm sm:text-base text-[#55576A] leading-relaxed max-w-4xl">
                  {description}
                </p>
              </section>

              {/* Proyek Serupa */}
              <section aria-label="Proyek Serupa" className="pt-6 sm:pt-8 border-t border-[#F3F3F4]">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#0D0C22]">
                    Proyek Serupa
                  </h3>
                  <button
                    type="button"
                    onClick={handleExploreMore}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#155DFC] hover:underline cursor-pointer"
                  >
                    <span>Lihat Proyek Lainnya</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 pt-2">
                  {similarProjects.map((item) => {
                    const simFeedProj: FeedProject = {
                      id: item.id,
                      title: item.title,
                      description: item.description || item.title,
                      coverImage: item.mediaUrl,
                      mediaUrl: item.mediaUrl,
                      mediaType: (item.category.toLowerCase().includes('video') || item.category.toLowerCase().includes('ugc') || item.category.toLowerCase().includes('motion')) ? 'video' : 'image',
                      creatorId: item.creatorId || 'creator-sim',
                      creator: {
                        id: item.creatorId || 'creator-sim',
                        name: item.creatorName || item.creatorHandle.replace('@', ''),
                        username: item.creatorHandle.replace('@', ''),
                        avatar: item.mediaUrl,
                        category: 'Image',
                        roleTitle: 'Kreator Profesional',
                        bio: `${item.creatorName || item.creatorHandle} di Creatorin`,
                        location: 'Indonesia',
                        startingRate: 250000,
                        formattedRate: 'Rp250.000',
                        careerScore: {
                          overall: 95,
                          deadlineAccuracy: 98,
                          revisionRate: 1,
                          completionRate: 100,
                          clientRating: 4.9,
                          completedProjects: 45,
                          tier: 'Top Tier',
                        },
                        rating: 4.9,
                        reviewCount: 38,
                        skills: [item.category, 'Kreator Digital'],
                        joinedDate: '2024',
                      },
                      category: item.category,
                      platform: 'direct',
                      tags: [item.category.replace(/\s+/g, '')],
                      likesCount: 142,
                      commentsCount: 18,
                      viewsCount: item.viewsCount,
                      sharesCount: 12,
                    };

                    return (
                      <ProjectCard
                        key={item.id}
                        id={`similar-project-${item.id}`}
                        project={simFeedProj}
                        onClick={() => handleSelectSimilar(item)}
                      />
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* Footer at bottom */}
          <div className="border-t border-[#F3F4F6] mt-12 sm:mt-16 w-full">
            <Footer onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      {/* Contextual Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (authModalConfig.action) {
            authModalConfig.action();
          }
        }}
      />
    </div>
  );
};
