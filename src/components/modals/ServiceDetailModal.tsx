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
import { CreatorService, Creator, ActivePage } from '@/types';

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

    return list;
  };

  const galleryImages = getGalleryImages();
  const currentActiveImage = galleryImages[activeImageIndex] || currentService.coverImage || galleryImages[0];

  const deliverables = currentService.deliverables || [];
  const serviceTags = currentService.tag ? [`#${currentService.tag.replace(/\s+/g, '')}`] : [];
  const otherServices = (creator.services || []).filter(s => s.id !== currentService.id);
  const formattedDelivery = currentService.deliveryDays
    ? (currentService.deliveryDays.toLowerCase().includes('hari') ? currentService.deliveryDays : `${currentService.deliveryDays} Hari Kerja`)
    : 'Belum ditentukan';
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
        className="flex-1 min-h-0 bg-white text-[#0D0B0B] font-sans selection:bg-[#155DFC] selection:text-white rounded-t-[16px] shadow-xl flex flex-col overflow-hidden relative"
      >
        {/* Right Side Floating Action Rail (Share & Chat) */}
        <div className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-40 flex flex-col items-center gap-2.5">
          {/* Share Button */}
          <button
            id="btn-share-service"
            onClick={handleShare}
            className="w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-[#F3F3F4] text-neutral-600 hover:text-[#0D0B0B] flex items-center justify-center transition-colors duration-150 cursor-pointer"
            title="Salin Tautan Layanan"
          >
            <Copy className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Chat with Creator Button */}
          <button
            id="btn-chat-creator"
            onClick={handleGoToChat}
            className="w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-[#F3F3F4] text-neutral-600 hover:text-[#155DFC] flex items-center justify-center transition-colors duration-150 cursor-pointer"
            title="Diskusikan via Chat"
          >
            <MessageSquare className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Share Copied Toast */}
        {copiedToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0D0C22] text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2]" />
            <span>Tautan layanan berhasil disalin ke clipboard!</span>
          </div>
        )}

        {/* FIXED NAVBAR: Creator Profile Row */}
        <header className="shrink-0 bg-white/95 backdrop-blur-xs border-b border-black/10 z-20">
          <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Avatar & Profile Details */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div 
                onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                className="relative cursor-pointer group shrink-0"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-[#155DFC]">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#0D0C22] text-white p-0.5 rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                </div>
              </div>

              <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                {/* Row 1: Creator Name */}
                <div className="flex flex-wrap items-center gap-2">
                  <span 
                    onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                    className="font-bold text-sm sm:text-base text-[#171717] hover:underline cursor-pointer truncate"
                  >
                    {creator.name}
                  </span>
                </div>

                {/* Row 2: Available for work & Follow */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
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

                {/* Location */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5 text-xs text-neutral-500 font-medium">
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
                className="px-5 py-2.5 rounded-[8px] bg-[#155DFC] hover:bg-[#0E4CD1] text-white font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap"
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
            
            {/* 1. VISUAL MEDIA GALLERY */}
            <div className="space-y-3 sm:space-y-3.5">
              {/* Cover Preview Utama */}
              <div className="relative w-full rounded-[16px] overflow-hidden border border-black/10 bg-neutral-900 aspect-[16/10] sm:aspect-16/9 group">
                {currentActiveImage && <img id="main-service-preview-image" src={currentActiveImage} alt={`${currentService.title} - Foto ${activeImageIndex + 1}`} className="w-full h-full object-cover transition-all duration-300 select-none" />}

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
                            ? 'ring-2 sm:ring-[2.5px] ring-[#0B1F3A] ring-offset-2 ring-offset-white opacity-100 shadow-sm'
                            : 'border border-neutral-200/90 opacity-75 hover:opacity-100 hover:border-neutral-400'
                        }`}
                        title={`Lihat foto ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail preview ${idx + 1}`}
                          className="w-full h-full object-cover "
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

              <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight leading-snug">
                {currentService.title}
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                {currentService.description || 'Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.'}
              </p>
            </div>

            {/* 3. INFORMASI UTAMA: HARGA, ESTIMASI WAKTU, & JUMLAH REVISI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Harga */}
              <div className="p-4 sm:p-5 rounded-[12px] border border-black/10 bg-white hover:border-black/20 transition-colors flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Harga Mulai
                  </span>
                  <div className="w-8 h-8 rounded-[8px] bg-[#F3F3F4] text-neutral-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#0D0C22] tracking-tight">
                    {currentService.formattedPrice}
                  </div>
                  <span className="text-xs text-neutral-500 font-normal">
                    / paket referensi brief
                  </span>
                </div>
              </div>

              {/* Card 2: Estimasi Pengerjaan */}
              <div className="p-4 sm:p-5 rounded-[12px] border border-black/10 bg-white hover:border-black/20 transition-colors flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Waktu Pengerjaan
                  </span>
                  <div className="w-8 h-8 rounded-[8px] bg-[#F3F3F4] text-neutral-700 flex items-center justify-center">
                    <Clock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#0D0C22] tracking-tight">
                    {formattedDelivery}
                  </div>
                  <span className="text-xs text-neutral-500 font-normal">
                    Sesuai kesepakatan diskusi
                  </span>
                </div>
              </div>

              {/* Card 3: Garansi Revisi */}
              <div className="p-4 sm:p-5 rounded-[12px] border border-black/10 bg-white hover:border-black/20 transition-colors flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Jumlah Revisi
                  </span>
                  <div className="w-8 h-8 rounded-[8px] bg-[#F3F3F4] text-neutral-700 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#0D0C22] tracking-tight">
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
              <h2 className="text-base font-bold text-[#171717]">
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
                className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight cursor-pointer hover:underline"
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
                  className="px-6 py-2.5 rounded-[8px] bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  Kirim Pesan
                </button>
                <button
                  id="btn-creator-spotlight-follow"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2.5 rounded-[8px] border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isFollowing
                      ? 'bg-[#F3F3F4] text-neutral-700 border-black/10'
                      : 'bg-white hover:bg-[#F3F3F4] text-[#0D0B0B] border-black/10'
                  }`}
                >
                  {isFollowing ? 'Mengikuti' : 'Ikuti Kreator'}
                </button>
              </div>

            </div>
            {otherServices.length > 0 && (
              <div className="pt-8 border-t border-black/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0D0C22]">
                      Layanan Lain dari {creator.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Eksplorasi paket layanan pendukung lainnya yang disediakan oleh kreator ini.
                    </p>
                  </div>
                  {onViewCreatorProfile && (
                    <button
                      onClick={() => onViewCreatorProfile(creator)}
                      className="text-xs font-semibold text-[#155DFC] hover:underline cursor-pointer shrink-0"
                    >
                      Lihat semua
                    </button>
                  )}
                </div>

                {/* 3-column Grid matching the card design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {otherServices.slice(0, 3).map((srv) => {
                    const srvFormattedDelivery = srv.deliveryDays
                      ? (srv.deliveryDays.toLowerCase().includes('hari') ? srv.deliveryDays : `${srv.deliveryDays} Hari Kerja`)
                      : '2-3 Hari Kerja';

                    return (
                      <div
                        key={srv.id}
                        className="bg-white rounded-[12px] border border-black/10 hover:border-black/25 transition-colors p-5 sm:p-6 flex flex-col justify-between text-left group"
                      >
                        <div>
                          {/* Cover Thumbnail */}
                          {srv.coverImage && (
                            <div
                              onClick={() => handleSwitchService(srv)}
                              className="aspect-[16/10] rounded-[8px] overflow-hidden bg-neutral-100 mb-4 cursor-pointer"
                              title="Lihat detail layanan"
                            >
                              <img
                                src={srv.coverImage}
                                alt={srv.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}

                          {/* Tag */}
                          {srv.tag && (
                            <span className="px-2.5 py-1 rounded-[6px] bg-[#F3F3F4] text-neutral-600 text-[10px] font-bold uppercase tracking-wider inline-block mb-2.5">
                              {srv.tag}
                            </span>
                          )}

                          {/* Title */}
                          <h4
                            onClick={() => handleSwitchService(srv)}
                            className="text-base sm:text-[17px] font-bold text-[#0D0C22] mb-1.5 leading-snug cursor-pointer group-hover:text-[#155DFC] transition-colors"
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
                            <span className="text-base sm:text-lg font-bold text-[#0D0C22]">
                              {srv.formattedPrice}
                            </span>
                          </div>

                          <button
                            onClick={() => onOrderService(srv, creator)}
                            className="px-5 py-2.5 rounded-[8px] bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-semibold transition cursor-pointer"
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
