import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Check,
  MessageSquare,
  Copy,
  Heart,
  Globe,
  Mail,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { CreatorService, Creator, ActivePage } from '../types';

export interface ServiceDetailModalProps {
  service: CreatorService;
  creator: Creator;
  onClose: () => void;
  onOrderService: (service: CreatorService, creator: Creator) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onNavigate?: (page: ActivePage) => void;
  onSelectOtherService?: (service: CreatorService) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service: initialService,
  creator,
  onClose,
  onOrderService,
  onViewCreatorProfile,
  onNavigate,
  onSelectOtherService
}) => {
  const [currentService, setCurrentService] = useState<CreatorService>(initialService);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const creatorDomain = `${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.creatorin.id`;
  const creatorEmail = `inquiry@${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  // Sync state if initialService changes
  useEffect(() => {
    setCurrentService(initialService);
    setActiveImageIndex(0);
  }, [initialService]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleGoToChat = () => {
    onClose();
    if (onNavigate) {
      onNavigate('chat');
    }
  };

  const handleSwitchService = (srv: CreatorService) => {
    setCurrentService(srv);
    setActiveImageIndex(0);
    if (onSelectOtherService) {
      onSelectOtherService(srv);
    }
    // Scroll modal top
    const modalBody = document.getElementById('service-detail-scroll-container');
    if (modalBody) {
      modalBody.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Compile at least 5-6 gallery images for the service
  const getGalleryImages = (): string[] => {
    const list: string[] = [];
    if (currentService.coverImage) {
      list.push(currentService.coverImage);
    }
    if (currentService.galleryImages && currentService.galleryImages.length > 0) {
      currentService.galleryImages.forEach(img => {
        if (!list.includes(img)) list.push(img);
      });
    }

    // Contextual high-resolution photo sets based on creative domain
    const titleLower = currentService.title.toLowerCase();
    const tagLower = (currentService.tag || '').toLowerCase();

    let categoryPool: string[] = [];
    if (titleLower.includes('figma') || tagLower.includes('figma') || titleLower.includes('landing page') || titleLower.includes('ui') || titleLower.includes('app')) {
      categoryPool = [
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542744094-3a31727220c3?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80'
      ];
    } else if (titleLower.includes('framer') || tagLower.includes('framer') || titleLower.includes('website') || titleLower.includes('web')) {
      categoryPool = [
        'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80'
      ];
    } else if (titleLower.includes('ugc') || tagLower.includes('ugc') || titleLower.includes('video') || titleLower.includes('tiktok')) {
      categoryPool = [
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80'
      ];
    } else if (titleLower.includes('brand') || titleLower.includes('identity') || titleLower.includes('logo') || tagLower.includes('design system')) {
      categoryPool = [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=1200&auto=format&fit=crop&q=80'
      ];
    } else {
      categoryPool = [
        'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80'
      ];
    }

    // Ensure at least 6 gallery photos
    categoryPool.forEach(img => {
      if (!list.includes(img) && list.length < 6) {
        list.push(img);
      }
    });

    return list;
  };

  const galleryImages = getGalleryImages();
  const currentActiveImage = galleryImages[activeImageIndex] || currentService.coverImage || galleryImages[0];

  // Deliverables tailored to service type
  const getDeliverables = () => {
    if (currentService.deliverables && currentService.deliverables.length > 0) {
      return currentService.deliverables;
    }
    const titleLower = currentService.title.toLowerCase();
    const tagLower = (currentService.tag || '').toLowerCase();

    if (titleLower.includes('figma') || tagLower.includes('figma') || titleLower.includes('landing page')) {
      return [
        'File Master Figma (.fig) lengkap dengan Auto-Layout & Design Tokens',
        'Struktur Komponen Responsif (Desktop, Tablet, dan Mobile View)',
        'Style Guide terintegrasi: Typography, Color Palette, dan UI Assets',
        '2x Putaran Revisi Minor & penyesuaian copywriting brand',
        'Hak Cipta Lisensi Komersial Penuh 100% untuk UMKM / Bisnis'
      ];
    }
    if (titleLower.includes('framer') || tagLower.includes('framer') || titleLower.includes('website')) {
      return [
        'Full Framer Website siap live dengan interaksi micro-animation halus',
        'Setup responsive breakpoints (Desktop, Tablet, Mobile)',
        'SEO Friendly structure, clean CMS collections & form contact',
        'Panduan handoff & deployment custom domain tanpa repot coding',
        'Garansi perbaikan bug selama 14 hari pasca serah terima'
      ];
    }
    if (titleLower.includes('ugc') || titleLower.includes('tiktok') || titleLower.includes('video')) {
      return [
        '1x Video Konten Vertikal (9:16) format MP4 Full HD / 4K jernih',
        'Hook opening teruji algoritma untuk retensi audiens tinggi',
        'Subtitle animasi dinamis, sound trending komersial, & color grading',
        'Raw footage & cutdown cut untuk kebutuhan iklan berbayar (Ads)',
        'Lisensi hak tayang komersial lintas platform media sosial'
      ];
    }
    if (titleLower.includes('brand') || titleLower.includes('identity') || titleLower.includes('logo')) {
      return [
        'Paket Logo Utama, Alternatif Horizontal/Vertical, & Favicon Icon',
        'Brand Guidelines PDF: Tipografi, Skema Warna Pantone/HEX, & Aturan Penggunaan',
        'Aset Siap Pakai resolusi tinggi (Vector SVG, AI, EPS, PNG Transparan)',
        'Mockup aplikasi identitas brand pada kartu nama & stationery bisnis',
        '2x Revisi Konseptual terstruktur'
      ];
    }
    return [
      'Hasil pengerjaan profesional beresolusi tinggi sesuai standar industri',
      'File master editable lengkap serta format export siap pakai',
      'Revisi minor terstruktur untuk memastikan kesesuaian brief bisnis Anda',
      'Hak guna komersial penuh bebas royalti untuk kebutuhan bisnis Anda'
    ];
  };

  const deliverables = getDeliverables();

  // Tags / Hashtags tailored to service
  const getServiceTags = () => {
    const titleLower = currentService.title.toLowerCase();
    const tagLower = (currentService.tag || '').toLowerCase();

    if (titleLower.includes('figma') || tagLower.includes('figma') || titleLower.includes('landing page')) {
      return ['#FigmaTemplate', '#LandingPage', '#UIUXDesign', '#AutoLayout', '#DesignSystem', '#ResponsiveWeb'];
    }
    if (titleLower.includes('framer') || tagLower.includes('framer') || titleLower.includes('website')) {
      return ['#FramerSite', '#InteractiveWebsite', '#WebDevelopment', '#NoCode', '#Responsive', '#FramerAnimation'];
    }
    if (titleLower.includes('ugc') || titleLower.includes('tiktok') || titleLower.includes('video')) {
      return ['#UGCVideo', '#TikTokViral', '#ContentCreator', '#ReviewProduk', '#ReelsInstagram', '#VideoPromosi'];
    }
    if (titleLower.includes('brand') || titleLower.includes('identity') || titleLower.includes('logo')) {
      return ['#BrandIdentity', '#LogoDesign', '#DesignSystem', '#VisualBranding', '#CorporateIdentity', '#StyleGuide'];
    }
    return [
      currentService.tag ? `#${currentService.tag.replace(/\s+/g, '')}` : '#LayananKreatif',
      '#KreatorIndonesia',
      '#DesainProfesional',
      '#UMKMGoDigital',
      '#CreativeAgency'
    ];
  };

  const serviceTags = getServiceTags();
  const otherServices = (creator.services || []).filter(s => s.id !== currentService.id);
  const formattedDelivery = currentService.deliveryDays
    ? (currentService.deliveryDays.toLowerCase().includes('hari') ? currentService.deliveryDays : `${currentService.deliveryDays} Hari Kerja`)
    : '2-3 Hari Kerja';
  const formattedRevisions = currentService.revisions
    ? (currentService.revisions.toLowerCase().includes('revisi') ? currentService.revisions : `${currentService.revisions} Revisi`)
    : '2x Revisi Gratis';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/65 backdrop-blur-xs text-left animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
    >
      {/* Top Bar with Close Button */}
      <div className="shrink-0 flex items-center justify-end px-5 py-2.5 h-11 sm:h-12 pointer-events-none">
        <button
          id="btn-close-service-detail"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/15 flex items-center justify-center"
          title="Tutup (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Floating Modal Pop-up Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 bg-white text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Right Side Floating Action Rail (Share & Chat) */}
        <div className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-40 flex flex-col items-center gap-2.5">
          {/* Share Button */}
          <button
            id="btn-share-service"
            onClick={handleShare}
            className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black flex items-center justify-center transition-colors duration-150 cursor-pointer shadow-xs"
            title="Salin Tautan Layanan"
          >
            <Copy className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Chat with Creator Button */}
          <button
            id="btn-chat-creator"
            onClick={handleGoToChat}
            className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-blue-600 flex items-center justify-center transition-colors duration-150 cursor-pointer shadow-xs"
            title="Diskusikan via Chat"
          >
            <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Share Copied Toast */}
        {copiedToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2]" />
            <span>Tautan layanan berhasil disalin ke clipboard!</span>
          </div>
        )}

        {/* FIXED NAVBAR: Creator Profile Row (Identik dengan Gambar Referensi & Detail Proyek) */}
        <header className="shrink-0 bg-white/95 backdrop-blur-xs border-b border-neutral-100 z-20">
          <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Avatar & Profile Details */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div 
                onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                className="relative cursor-pointer group shrink-0"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-linear-to-tr from-blue-600 to-indigo-500 shadow-sm">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition duration-200"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#0d0c22] text-white p-0.5 rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                </div>
              </div>

              <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                {/* Row 1: Creator Name */}
                <div className="flex flex-wrap items-center gap-2">
                  <span 
                    onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                    className="font-bold text-sm sm:text-base text-[#0d0c22] hover:underline cursor-pointer truncate"
                  >
                    {creator.name}
                  </span>
                </div>

                {/* Row 2: Available for work & Follow */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Available for work</span>
                  </span>

                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`font-semibold text-xs transition cursor-pointer ${
                      isFollowing ? 'text-neutral-400 hover:text-neutral-600' : 'text-blue-600 hover:underline'
                    }`}
                  >
                    {isFollowing ? 'Mengikuti' : 'Follow'}
                  </button>
                </div>

                {/* Row 3: Domain, Email & Location */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5 text-xs text-neutral-500 font-medium">
                  <a
                    href={`https://${creatorDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-blue-600 transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{creatorDomain}</span>
                  </a>
                  <span>•</span>
                  <a
                    href={`mailto:${creatorEmail}`}
                    className="inline-flex items-center gap-1 hover:text-blue-600 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{creatorEmail}</span>
                  </a>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{creator.location || 'Indonesia'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Heart Button & Diskusikan Layanan */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
                  isLiked
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                title={isLiked ? 'Batal Suka' : 'Sukai Layanan'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
              </button>

              <button
                id="btn-service-discuss"
                onClick={handleGoToChat}
                className="px-5 py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                Diskusikan Layanan
              </button>
            </div>

          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <div 
          id="service-detail-scroll-container"
          className="flex-1 overflow-y-auto bg-white"
        >
          <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-6 sm:py-8 space-y-7 text-left">
            
            {/* 1. VISUAL MEDIA GALLERY (1 COVER UTAMA BESAR + DERETAN FOTO TAMBAHAN DI BAWAH) */}
            <div className="space-y-3 sm:space-y-3.5">
              {/* Cover Preview Utama (1 Besar Sesuai Wireframe) */}
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/80 bg-neutral-900 aspect-[16/10] sm:aspect-16/9 group shadow-2xs">
                <img
                  id="main-service-preview-image"
                  src={currentActiveImage}
                  alt={`${currentService.title} - Foto ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 select-none"
                />

                {/* Counter Pill Badge */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/10 select-none">
                    {activeImageIndex + 1} / {galleryImages.length} Foto
                  </div>
                )}

                {/* Left & Right Navigation Arrows on Main Cover */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                      }}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#0d0c22] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="Foto sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#0d0c22] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="Foto berikutnya"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2]" />
                    </button>
                  </>
                )}
              </div>

              {/* Deretan Foto Tambahan di Bawah (Layout Sesuai Gambar Referensi Wireframe: Kotak Rounded) */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
                  {galleryImages.slice(0, 5).map((imgUrl, idx) => {
                    const isActive = activeImageIndex === idx;
                    const isFifthSlot = idx === 4 && galleryImages.length > 5;
                    const remainingExtra = galleryImages.length - 5;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 transition-all duration-200 cursor-pointer group text-left ${
                          isActive
                            ? 'ring-2 sm:ring-[2.5px] ring-[#0d0c22] ring-offset-2 ring-offset-white opacity-100 shadow-sm'
                            : 'border border-neutral-200/90 opacity-75 hover:opacity-100 hover:border-neutral-400'
                        }`}
                        title={`Lihat foto ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail preview ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isFifthSlot && remainingExtra > 0 && !isActive && (
                          <div className="absolute inset-0 bg-black/55 backdrop-blur-2xs flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                            +{remainingExtra}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. KATEGORI, NAMA LAYANAN, & DESKRIPSI SINGKAT */}
            <div className="space-y-2.5">
              {currentService.tag && (
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs font-medium tracking-wide">
                    {currentService.tag}
                  </span>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-[#0d0c22] tracking-tight leading-snug">
                {currentService.title}
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                {currentService.description || 'Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.'}
              </p>
            </div>

            {/* 3. INFORMASI UTAMA: HARGA, ESTIMASI WAKTU, & JUMLAH REVISI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Harga */}
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-neutral-300 transition-colors shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Harga Mulai
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100/90 text-neutral-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0d0c22] tracking-tight">
                    {currentService.formattedPrice}
                  </div>
                  <span className="text-xs text-neutral-500 font-normal">
                    / paket referensi brief
                  </span>
                </div>
              </div>

              {/* Card 2: Estimasi Pengerjaan */}
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-neutral-300 transition-colors shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Waktu Pengerjaan
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100/90 text-neutral-700 flex items-center justify-center">
                    <Clock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0d0c22] tracking-tight">
                    {formattedDelivery}
                  </div>
                  <span className="text-xs text-neutral-500 font-normal">
                    Sesuai kesepakatan diskusi
                  </span>
                </div>
              </div>

              {/* Card 3: Garansi Revisi */}
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white hover:border-neutral-300 transition-colors shadow-2xs flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Jumlah Revisi
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-neutral-100/90 text-neutral-700 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#0d0c22] tracking-tight">
                    {formattedRevisions}
                  </div>
                  <span className="text-xs text-neutral-500 font-normal">
                    Penyempurnaan & polesan
                  </span>
                </div>
              </div>
            </div>

            {/* 4. HASIL YANG AKAN DIDAPAT (DELIVERABLES) */}
            <div className="space-y-3 pt-1">
              <h2 className="text-base font-bold text-[#0d0c22]">
                Hasil yang Akan Didapat
              </h2>
              <div className="space-y-2.5">
                {deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-neutral-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-md bg-neutral-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. HASHTAG BADGES (TAGAR) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-left">
              {serviceTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold transition cursor-pointer"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>

            {/* 6. PROFIL KREATOR (SESUAI GAMBAR REFERENSI CONTAINER.PNG) */}
            <div className="pt-10 pb-2 text-center space-y-4">
              <div className="w-full border-t border-neutral-200/80 mb-8" />

              {/* Centered Avatar */}
              <div className="flex justify-center">
                <div 
                  onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                  className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-neutral-100 shadow-sm cursor-pointer hover:opacity-90 transition"
                  title={`Lihat profil ${creator.name}`}
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Creator Name */}
              <h2 
                onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                className="text-xl sm:text-2xl font-bold text-[#0d0c22] tracking-tight cursor-pointer hover:underline"
              >
                {creator.name}
              </h2>

              {/* Bio / Description */}
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
                {creator.bio || 'Kreator UGC autentik dengan engagement tinggi. Spesialis review skincare, makeup tutorial, dan unboxing estetik.'}
              </p>

              {/* Action Buttons: Kirim Pesan & Ikuti Kreator */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  id="btn-creator-spotlight-chat"
                  onClick={handleGoToChat}
                  className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
                >
                  Kirim Pesan
                </button>
                <button
                  id="btn-creator-spotlight-follow"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isFollowing
                      ? 'bg-neutral-100 text-neutral-700 border-neutral-300'
                      : 'bg-white hover:bg-neutral-50 text-[#0d0c22] border-neutral-300 shadow-2xs'
                  }`}
                >
                  {isFollowing ? 'Mengikuti' : 'Ikuti Kreator'}
                </button>
              </div>

              {/* Contact / Links: Domain & Email */}
              <div className="flex items-center justify-center gap-3 pt-2 text-xs text-neutral-500 font-medium">
                <span className="inline-flex items-center gap-1.5 hover:text-neutral-800 transition cursor-pointer">
                  <Globe className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                  <span>{creatorDomain}</span>
                </span>
                <span className="text-neutral-300">•</span>
                <a
                  href={`mailto:${creatorEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-neutral-800 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                  <span>{creatorEmail}</span>
                </a>
              </div>
            </div>
            {otherServices.length > 0 && (
              <div className="pt-8 border-t border-neutral-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                      Layanan Lain dari {creator.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Eksplorasi paket layanan pendukung lainnya yang disediakan oleh kreator ini.
                    </p>
                  </div>
                  {onViewCreatorProfile && (
                    <button
                      onClick={() => onViewCreatorProfile(creator)}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer shrink-0"
                    >
                      Lihat semua
                    </button>
                  )}
                </div>

                {/* 3-column Grid matching the screenshot card design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {otherServices.slice(0, 3).map((srv) => {
                    const srvFormattedDelivery = srv.deliveryDays
                      ? (srv.deliveryDays.toLowerCase().includes('hari') ? srv.deliveryDays : `${srv.deliveryDays} Hari Kerja`)
                      : '2-3 Hari Kerja';

                    return (
                      <div
                        key={srv.id}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 hover:border-neutral-300 hover:shadow-lg transition-all p-5 sm:p-6 flex flex-col justify-between text-left group"
                      >
                        <div>
                          {/* Cover Thumbnail */}
                          {srv.coverImage && (
                            <div
                              onClick={() => handleSwitchService(srv)}
                              className="aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-4 cursor-pointer"
                              title="Lihat detail layanan"
                            >
                              <img
                                src={srv.coverImage}
                                alt={srv.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          )}

                          {/* Tag */}
                          {srv.tag && (
                            <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider inline-block mb-2.5">
                              {srv.tag}
                            </span>
                          )}

                          {/* Title */}
                          <h4
                            onClick={() => handleSwitchService(srv)}
                            className="text-base sm:text-[17px] font-bold text-[#0d0c22] mb-1.5 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors"
                            title="Lihat detail layanan"
                          >
                            {srv.title}
                          </h4>

                          {/* Description */}
                          <p
                            onClick={() => handleSwitchService(srv)}
                            className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4 cursor-pointer"
                          >
                            {srv.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                          </p>

                          {/* Estimasi Durasi */}
                          <div
                            onClick={() => handleSwitchService(srv)}
                            className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                            <span>Estimasi: {srvFormattedDelivery}</span>
                          </div>
                        </div>

                        {/* Footer Card: HARGA + Pesan Layanan */}
                        <div className="flex items-center justify-between pt-2">
                          <div onClick={() => handleSwitchService(srv)} className="cursor-pointer">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">
                              HARGA
                            </span>
                            <span className="text-base sm:text-lg font-black text-[#0d0c22]">
                              {srv.formattedPrice}
                            </span>
                          </div>

                          <button
                            onClick={() => onOrderService(srv, creator)}
                            className="px-5 py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs hover:shadow-sm cursor-pointer"
                          >
                            Pesan Layanan
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. QUIET FOOTER */}
            <div className="pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
              <span>Creatorin • Kolaborasi Aman via Diskusi & Invoice Resmi</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
