'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Share2,
  Globe,
  Mail,
  Clock,
  CreditCard,
  RotateCcw,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { CreatorService, Creator, ActivePage } from '@/types';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { AuthModal } from '@/components/modals/AuthModal';
import { DiscussInquiryModal } from '@/components/modals/DiscussInquiryModal';
import { startRouteProgress } from '@/components/common/RouteProgressBar';

export interface ServiceDetailModalProps {
  service: CreatorService;
  creator?: Creator;
  onClose: () => void;
  onOrderService?: (service: CreatorService, creator: Creator) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onNavigate?: (page: ActivePage) => void;
  onSelectOtherService?: (service: CreatorService) => void;
}

interface SimilarServiceItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string;
}

const DEFAULT_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80',
];

const DEFAULT_SIMILAR_SERVICES: SimilarServiceItem[] = [
  {
    id: 'sim-srv-1',
    badge: 'FIGMA TEMPLATE',
    title: 'Premium Figma SaaS Landing Page Template',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    duration: '2 Hari Kerja',
    price: '🪙 1.500.000',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sim-srv-2',
    badge: 'FIGMA TEMPLATE',
    title: 'Premium Figma SaaS Landing Page Template',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    duration: '2 Hari Kerja',
    price: '🪙 1.500.000',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sim-srv-3',
    badge: 'FIGMA TEMPLATE',
    title: 'Premium Figma SaaS Landing Page Template',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    duration: '2 Hari Kerja',
    price: '🪙 1.500.000',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sim-srv-4',
    badge: 'FIGMA TEMPLATE',
    title: 'Premium Figma SaaS Landing Page Template',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    duration: '2 Hari Kerja',
    price: '🪙 1.500.000',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sim-srv-5',
    badge: 'FIGMA TEMPLATE',
    title: 'Premium Figma SaaS Landing Page Template',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    duration: '2 Hari Kerja',
    price: '🪙 1.500.000',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sim-srv-6',
    badge: 'FIGMA TEMPLATE',
    title: 'Premium Figma SaaS Landing Page Template',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    duration: '2 Hari Kerja',
    price: '🪙 1.500.000',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
];

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service: initialService,
  creator,
  onClose,
  onOrderService,
  onViewCreatorProfile,
  onNavigate,
  onSelectOtherService,
}) => {
  const router = useRouter();
  const [currentService, setCurrentService] = useState<CreatorService>(initialService);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
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

  // Sync state if initialService changes
  useEffect(() => {
    setCurrentService(initialService);
    setActiveImageIndex(0);
  }, [initialService]);

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

  // Gallery compilation
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (currentService.coverImage) {
      list.push(currentService.coverImage);
    }
    if (currentService.galleryImages && currentService.galleryImages.length > 0) {
      currentService.galleryImages.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    // Fill up to 6 images using defaults if needed
    for (const defImg of DEFAULT_GALLERY_IMAGES) {
      if (list.length >= 6) break;
      if (!list.includes(defImg)) list.push(defImg);
    }
    return list;
  }, [currentService]);

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  const handleShare = () => {
    const canonicalUrl = `${window.location.origin}/jelajah/layanan?serviceId=${currentService.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonicalUrl);
      showToast({
        type: 'success',
        message: t('toast.serviceCopied', 'Tautan layanan berhasil disalin!'),
      });
      setToastMessage(t('toast.serviceCopied', 'Tautan layanan berhasil disalin!'));
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleOpenDiscuss = () => {
    if (!user) {
      setAuthModalConfig({
        title: 'Masuk untuk diskusikan layanan',
        description: 'Masuk ke akun Creatorin Anda untuk mendiskusikan kebutuhan layanan dengan kreator ini.',
        action: () => setIsInquiryOpen(true),
      });
      setIsAuthModalOpen(true);
      return;
    }
    setIsInquiryOpen(true);
  };

  const handleExploreMore = () => {
    handleSmoothClose();
    if (onNavigate) {
      onNavigate('services');
    } else {
      router.push('/jelajah/layanan');
    }
  };

  // Creator profile info with sensible fallbacks
  const creatorName = creator?.name || 'Sobakhul Munir Siroj';
  const creatorAvatar =
    creator?.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  const creatorHandle = creator?.username || 'mayaangelina';
  const websiteDisplay = `${creatorHandle}.creatorin.id`;
  const emailDisplay = `inquiry@${creator?.username || 'sobakhulmunirsiroj'}.com`;

  // Highlight metrics
  const formattedPrice = currentService.formattedPrice
    ? currentService.formattedPrice.replace(/^Rp\s?/, '🪙 ')
    : currentService.price
    ? `🪙 ${currentService.price.toLocaleString('id-ID')}`
    : '🪙 3.800.000';

  const formattedDelivery = currentService.deliveryDays
    ? currentService.deliveryDays.toLowerCase().includes('hari')
      ? currentService.deliveryDays
      : `${currentService.deliveryDays} Hari Kerja`
    : '4 Hari Kerja';

  const formattedRevisions = currentService.revisions
    ? currentService.revisions.toLowerCase().includes('revisi')
      ? currentService.revisions
      : `${currentService.revisions} Revisi`
    : '2x Revisi Gratis';

  // Tags list
  const tags = useMemo(() => {
    if (currentService.features && currentService.features.length > 0) {
      return currentService.features.map((f) => (f.startsWith('#') ? f : `#${f.replace(/\s+/g, '')}`));
    }
    if (currentService.tag) {
      return [
        `#${currentService.tag.replace(/\s+/g, '')}`,
        '#InteractiveWebsite',
        '#WebDevelopment',
        '#NoCode',
        '#Responsive',
        '#FramerAnimation',
      ];
    }
    return [
      '#FramerSite',
      '#InteractiveWebsite',
      '#WebDevelopment',
      '#NoCode',
      '#Responsive',
      '#FramerAnimation',
    ];
  }, [currentService]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail Layanan: ${currentService.title}`}
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
        aria-label="Tutup Detail Layanan"
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
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
            {/* Header: Creator Info, Contact & Actions */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-3.5">
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-black/5 shrink-0"
                />
                <div className="min-w-0">
                  <h2
                    onClick={() => {
                      if (onViewCreatorProfile && creator) {
                        onViewCreatorProfile(creator);
                      } else if (creator?.id) {
                        handleSmoothClose();
                        startRouteProgress();
                        router.push(`/creator/${creator.id}`);
                      }
                    }}
                    className="font-display font-semibold text-base sm:text-lg text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors truncate"
                  >
                    {creatorName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#55576A]">
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#55576A] shrink-0" />
                      <span>{websiteDisplay}</span>
                    </span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#55576A] shrink-0" />
                      <span>{emailDisplay}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-[#E1E3EA] bg-white hover:bg-[#F4F5F7] text-[#0D0C22] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Bagikan Layanan"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenDiscuss}
                  className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  {t('card.discuss', 'Diskusikan')}
                </button>
              </div>
            </header>

            {/* Media Gallery: Hero Image + Thumbnails */}
            <section aria-label="Galeri Layanan" className="mt-6">
              {/* Main Image */}
              <div className="relative aspect-[16/9] sm:aspect-[16/8.5] w-full rounded-2xl overflow-hidden bg-[#F4F5F7]">
                <img
                  src={activeImage}
                  alt={currentService.title}
                  className="w-full h-full object-cover transition-opacity duration-200"
                />
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium select-none pointer-events-none">
                  {activeImageIndex + 1} / {galleryImages.length} Foto
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-4 mt-3 sm:mt-4">
                {galleryImages.slice(0, 5).map((img, idx) => {
                  const isActive = idx === activeImageIndex;
                  const isLastItem = idx === 4;
                  const hasExtraImages = galleryImages.length > 5;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isActive
                          ? 'border-[#0D0C22] ring-2 ring-[#0D0C22]/10 scale-[1.01]'
                          : 'border-transparent hover:border-[#E1E3EA] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      {isLastItem && hasExtraImages && (
                        <div className="absolute inset-0 bg-black/60 text-white font-bold text-sm sm:text-base flex items-center justify-center">
                          +{galleryImages.length - 4}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Service Header Info: Badge, Title & Description */}
            <div className="mt-8">
              <span className="inline-block bg-[#F4F5F7] text-[#55576A] text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {currentService.tag || currentService.category || 'Framer Site'}
              </span>

              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#0D0C22] mt-3 leading-tight tracking-tight">
                {currentService.title}
              </h1>

              <p className="text-sm sm:text-base text-[#55576A] leading-relaxed mt-3.5 max-w-4xl">
                {currentService.description ||
                  'Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.'}
              </p>
            </div>

            {/* 3 Highlight Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-8">
              {/* Card 1: Harga Mulai */}
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6F7285] uppercase tracking-wider">
                  <span>HARGA MULAI</span>
                  <CreditCard className="w-4 h-4 text-[#6F7285]" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#0D0C22]">
                    {formattedPrice}
                  </div>
                  <div className="text-xs text-[#55576A] mt-1">/ paket referensi brief</div>
                </div>
              </div>

              {/* Card 2: Waktu Pengerjaan */}
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6F7285] uppercase tracking-wider">
                  <span>WAKTU PENGERJAAN</span>
                  <Clock className="w-4 h-4 text-[#6F7285]" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#0D0C22]">
                    {formattedDelivery}
                  </div>
                  <div className="text-xs text-[#55576A] mt-1">Sesuai kesepakatan diskusi</div>
                </div>
              </div>

              {/* Card 3: Jumlah Revisi */}
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6F7285] uppercase tracking-wider">
                  <span>JUMLAH REVISI</span>
                  <RotateCcw className="w-4 h-4 text-[#6F7285]" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#0D0C22]">
                    {formattedRevisions}
                  </div>
                  <div className="text-xs text-[#55576A] mt-1">Penyempurnaan & polesan</div>
                </div>
              </div>
            </div>

            {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              {tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="bg-[#F4F5F7] text-[#55576A] hover:text-[#0D0C22] text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Layanan Serupa Section */}
            <section aria-label="Layanan Serupa" className="mt-12 sm:mt-14 pt-8 border-t border-[#F3F4F6]">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#0D0C22]">
                  Layanan Serupa
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mt-3">
                {DEFAULT_SIMILAR_SERVICES.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[#E1E3EA] bg-white p-4 shadow-xs hover:border-[#B7BBC9] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail Media */}
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-950 relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Category Badge */}
                      <span className="text-[10px] font-bold text-[#6F7285] uppercase tracking-wider mt-3 block">
                        {item.badge}
                      </span>

                      {/* Title */}
                      <h4 className="font-display font-semibold text-sm sm:text-[15px] text-[#0D0C22] group-hover:text-[#155DFC] transition-colors leading-snug line-clamp-2 mt-1">
                        {item.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-[#55576A] line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Estimate */}
                      <div className="flex items-center gap-1.5 text-xs text-[#6F7285] mt-2.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Estimasi: {item.duration}</span>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-3 border-t border-[#F3F4F6] mt-4 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6F7285] tracking-wider block leading-none">
                          HARGA
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#0D0C22] mt-0.5 block leading-tight">
                          {item.price}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenDiscuss}
                        className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {t('card.discuss', 'Diskusikan')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

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

      {/* Inquiry Form Modal */}
      <DiscussInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        item={{
          id: currentService.id,
          title: currentService.title,
          tag: currentService.tag || 'Layanan Kreatif',
          formattedPrice,
          price: currentService.price,
          deliveryDays: formattedDelivery,
          coverImage: currentService.coverImage || activeImage,
          description: currentService.description,
        }}
        creator={{
          id: creator?.id || 'creator-unknown',
          name: creatorName,
          username: creator?.username,
          avatar: creatorAvatar,
          roleTitle: creator?.roleTitle,
        }}
        itemType="service"
        onSuccess={(convId, crId) => {
          setIsInquiryOpen(false);
          handleSmoothClose();
          startRouteProgress();
          if (onNavigate) {
            onNavigate('chat');
          }
          router.push(`/chat?conversationId=${convId}&creatorId=${crId}`);
        }}
      />
    </div>
  );
};
