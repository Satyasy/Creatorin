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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FeedProject, Creator, ActivePage } from '@/types';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useLanguage } from '@/providers/LanguageProvider';
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

  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
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

  const handlePrevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [galleryImages.length]);

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [galleryImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSmoothClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSmoothClose, handlePrevImage, handleNextImage]);

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
    const canonicalUrl = `${window.location.origin}/jelajah/proyek?projectId=${currentProject.id}`;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(canonicalUrl);
      showToast({
        type: 'success',
        message: t('toast.projectCopied', 'Tautan proyek berhasil disalin!'),
      });
      setToastMessage(t('toast.projectCopied', 'Tautan proyek berhasil disalin!'));
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleSendMessage = () => {
    if (onGetInTouch && creator) {
      onGetInTouch(creator);
    } else if (creator?.id) {
      if (!user) {
        setAuthModalConfig({
          title: 'Masuk untuk hubungi kreator',
          description: 'Masuk ke akun Anda untuk memulai percakapan dengan kreator ini.',
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
          title: 'Masuk untuk kirim pesan',
          description: 'Masuk ke akun Anda untuk memulai percakapan.',
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
        formattedRate: '🪙 250.000',
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
      aria-label={currentProject.title}
      onClick={handleSmoothClose}
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/60 transition-opacity duration-300 transform-gpu ${
        mounted && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-6 z-60 bg-[#0D0C22] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Close Button Top Right */}
      <div className="w-full max-w-[1120px] mx-auto flex justify-end px-4 sm:px-6 pb-2 pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSmoothClose();
          }}
          className="pointer-events-auto w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 active:bg-white/50 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          aria-label="Tutup detail proyek"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Modal Surface - Slides Up Smoothly from Bottom */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[1120px] mx-auto bg-white rounded-t-[28px] sm:rounded-t-[36px] shadow-2xl flex flex-col h-[88vh] sm:h-[90vh] max-h-[92vh] overflow-hidden transition-transform duration-300 ease-out transform-gpu ${
          mounted && !isClosing ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Scrollable Container with Hardware Acceleration (Zero Lag) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 md:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 transform-gpu [will-change:scroll-position]"
        >
          {/* 1. Header Section: Creator Info + Action Buttons */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F3F3F4]">
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={creator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={creatorName}
                onClick={handleCreatorClick}
                className="w-12 h-12 rounded-full object-cover ring-1 ring-black/5 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              />
              <div className="min-w-0">
                <h2
                  onClick={handleCreatorClick}
                  className="font-display font-bold text-base sm:text-lg text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors truncate"
                >
                  {creatorName}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#55576A] mt-0.5">
                  <span className="inline-flex items-center gap-1 hover:text-[#0D0C22] cursor-pointer">
                    <Globe className="w-3.5 h-3.5 text-[#6F7285]" />
                    <span>{creatorWebsite}</span>
                  </span>
                  <span>&middot;</span>
                  <span className="inline-flex items-center gap-1 hover:text-[#0D0C22] cursor-pointer">
                    <Mail className="w-3.5 h-3.5 text-[#6F7285]" />
                    <span>{creatorEmail}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-full border border-[#E1E3EA] bg-white hover:bg-[#F3F3F4] active:bg-[#ECEEF2] text-[#55576A] hover:text-[#0D0C22] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Bagikan tautan proyek"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Kirim Pesan
              </button>
            </div>
          </header>

          {/* 2. Media Gallery Section (Hero Image + 5 Thumbnails Row) */}
          <section aria-label="Galeri Media Proyek" className="space-y-3.5">
            {/* Hero Main Media */}
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden relative bg-neutral-900 shadow-xs group/hero">
              <img
                src={galleryImages[activeImageIndex] || currentProject.coverImage}
                alt={`${currentProject.title} preview`}
                className="w-full h-full object-cover transition-opacity duration-200"
                loading="eager"
                decoding="async"
              />
              {/* Counter Badge Pill Top Right */}
              <div className="absolute top-3.5 right-3.5 bg-black/65 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                {activeImageIndex + 1} / {galleryImages.length} Foto
              </div>

              {/* Prev / Next Gallery Navigation Buttons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md opacity-90 sm:opacity-0 sm:group-hover/hero:opacity-100"
                    aria-label="Foto sebelumnya"
                    title="Foto sebelumnya (Panah Kiri)"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md opacity-90 sm:opacity-0 sm:group-hover/hero:opacity-100"
                    aria-label="Foto berikutnya"
                    title="Foto berikutnya (Panah Kanan)"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row (5 Items matching Figma) */}
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

          {/* 3. Project Meta: Category Pill, Title, Description */}
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

          {/* 4. "Proyek Serupa" Section */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
              {similarProjects.map((item) => (
                <article
                  key={item.id}
                  onClick={() => handleSelectSimilar(item)}
                  className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E1E3EA]/50 bg-neutral-900"
                >
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Play Badge Top Right */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white shadow-xs">
                    <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                  </div>
                  {/* Dark Gradient Overlay Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                    <h4 className="text-white font-display font-semibold text-xs leading-snug line-clamp-2 drop-shadow-xs group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/15 text-white/85 text-[11px] sm:text-xs">
                      <span className="font-medium truncate pr-2 hover:text-white transition-colors">
                        {item.creatorHandle}
                      </span>
                      <span className="shrink-0 font-medium text-white/75">
                        {item.viewsCount}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Footer at the bottom of the modal */}
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
