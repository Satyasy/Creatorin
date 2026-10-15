'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Layers, 
  ChevronDown, 
  CreditCard, 
  Clock, 
  RotateCcw, 
  Globe, 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Instagram,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Creator, CreatorService } from '@/types';

interface UploadServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newService: CreatorService) => void;
  creator?: Creator | null;
}

const CATEGORY_OPTIONS = [
  'Video Reels & TikTok',
  'Reels Instagram',
  'Video TikTok',
  'Foto Produk Katalog',
  'Logo & Branding',
  'Desain Feed / Carousel',
  'UI/UX Design',
  'Packaging & Kemasan',
  'Banner & Poster'
];

const DEADLINE_PRESETS = [
  '1 Hari Kerja (Express)',
  '2 Hari Kerja',
  '3 Hari Kerja',
  '5 Hari Kerja',
  '7 Hari Kerja',
  '14 Hari Kerja'
];

const REVISION_PRESETS = [
  '1x Revisi',
  '2x Revisi',
  '3x Revisi',
  '5x Revisi',
  'Revisi Tanpa Batas'
];

const POPULAR_TAG_SUGGESTIONS = [
  'UGCVideo',
  'ReelsViral',
  'DesainBrand',
  'KatalogProduk',
  'UIUX',
  'FeedAesthetic'
];

export const UploadServiceModal: React.FC<UploadServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  creator: propCreator,
}) => {
  const { user } = useAuth();

  // Active creator info for Header (Figma node 5386:13673)
  const creatorName = propCreator?.name || user?.name || 'Maya Angelina';
  const creatorAvatar = propCreator?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const creatorUsername = propCreator?.username || 'mayaangelina';
  const creatorDomain = `${creatorUsername.toLowerCase().replace(/\s+/g, '')}.creatorin.id`;
  const creatorEmail = user?.email || `inquiry@${creatorUsername.toLowerCase().replace(/\s+/g, '')}.com`;

  // Form states matching Figma node 5386:13352
  const [category, setCategory] = useState('Video Reels & TikTok');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawPrice, setRawPrice] = useState('0');
  const [deadline, setDeadline] = useState('3 Hari Kerja');
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [revisions, setRevisions] = useState('2x Revisi');
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Media gallery states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<{ url: string; file: File }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const deadlineRef = useRef<HTMLDivElement>(null);
  const revisionRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (deadlineRef.current && !deadlineRef.current.contains(event.target as Node)) {
        setIsDeadlineOpen(false);
      }
      if (revisionRef.current && !revisionRef.current.contains(event.target as Node)) {
        setIsRevisionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      galleryImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [coverPreview, galleryImages]);

  if (!isOpen) return null;

  function formatNumberWithDots(val: string) {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) return '';
    return Number(cleaned).toLocaleString('id-ID');
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val || val === '0') {
      setRawPrice(val);
    } else {
      setRawPrice(formatNumberWithDots(val));
    }
  };

  const handleCoverSelect = (file: File) => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    setCoverFile(file);
    setError('');
  };

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverSelect(file);
  };

  const handleAddGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems = Array.from(files).map((f) => ({
        url: URL.createObjectURL(f),
        file: f,
      }));
      setGalleryImages((prev) => [...prev, ...newItems]);
      // If cover is not set yet, use the first image as cover
      if (!coverFile && newItems[0]) {
        setCoverFile(newItems[0].file);
        setCoverPreview(newItems[0].url);
      }
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const target = galleryImages[indexToRemove];
    if (target) URL.revokeObjectURL(target.url);
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddTag = (newTag: string) => {
    const clean = newTag.replace(/^[#,]/, '').trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serviceTitle.trim()) {
      setError('Silakan isi judul layanan.');
      return;
    }
    if (!rawPrice || rawPrice === '0') {
      setError('Silakan masukkan harga paket layanan.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let fullDescription = description.trim();
      if (revisions) {
        fullDescription += `\n\n🔄 Ketentuan Revisi: ${revisions}`;
      }
      if (tags.length > 0) {
        fullDescription += `\n\n${tags.map((t) => `#${t}`).join(' ')}`;
      }

      const form = new FormData();
      form.set('title', serviceTitle.trim());
      form.set('category', category);
      form.set('description', fullDescription || serviceTitle.trim());
      form.set('price', rawPrice.replace(/\D/g, ''));
      form.set('estimatedDays', deadline);
      if (coverFile) form.set('file', coverFile);

      const response = await fetch('/api/services', {
        method: 'POST',
        body: form
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menerbitkan layanan.');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      onSuccess?.({
        id: result.service.id,
        title: result.service.title,
        price: result.service.priceNumeric,
        formattedPrice: result.service.price,
        deliveryDays: result.service.estimatedDays,
        description: result.service.description,
        tag: result.service.category,
        coverImage: result.service.imageUrl
      });

      setTimeout(() => {
        setIsSuccess(false);
        handleResetAndClose();
      }, 1000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal menerbitkan layanan.');
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    galleryImages.forEach((img) => URL.revokeObjectURL(img.url));
    setCoverPreview(null);
    setCoverFile(null);
    setGalleryImages([]);
    setServiceTitle('');
    setDescription('');
    setRawPrice('0');
    setTags([]);
    setError('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div 
      id="modal-upload-service"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-[24px] sm:rounded-[28px] border border-[#E5E5E5] shadow-2xl overflow-hidden text-left relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-service-title"
      >
        {/* ===================================================================== */}
        {/* TOP BAR / HEADER (Figma node 5386:13673)                             */}
        {/* ===================================================================== */}
        <header className="px-6 sm:px-8 py-3.5 border-b border-[#E5E5E5] bg-white flex items-center justify-between gap-4 shrink-0">
          
          {/* Sisi Kiri: Profil Kreator (Avatar Gradient + Nama + Domain + Email) */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#155DFC] to-[#615FFF] shadow-xs">
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {/* Badge Centang Terverifikasi */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0D0C22] ring-2 ring-white text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#0D0C22] tracking-[-0.0195em] truncate">
                {creatorName}
              </h2>
              
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#737373] font-medium truncate">
                <span className="inline-flex items-center gap-1 truncate text-[#155DFC]">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{creatorDomain}</span>
                </span>
                <span className="text-[#D4D4D4]">•</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{creatorEmail}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tombol "Publikasikan Layanan" (#0D0C22) + Tombol Tutup */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="h-10 px-5 sm:px-6 rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menerbitkan...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Layanan Aktif!</span>
                </>
              ) : (
                <span>Publikasikan Layanan</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </header>

        {/* ===================================================================== */}
        {/* MAIN BODY CONTENT (Figma node 5386:13352)                            */}
        {/* ===================================================================== */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 1. VISUAL COVER & GALLERY STRIP (Figma node 5386:13617)            */}
          {/* ----------------------------------------------------------------- */}
          <div className="space-y-3">
            {/* Main Upload Dropzone */}
            <div 
              onClick={() => coverInputRef.current?.click()}
              className={`relative h-56 sm:h-64 rounded-[24px] border border-dashed transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer group select-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                coverPreview 
                  ? 'border-[#E5E5E5] bg-neutral-900' 
                  : 'border-[#E5E5E5] hover:border-[#155DFC] bg-white'
              }`}
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Upload className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">Klik untuk ganti visual sampul</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-black/20 flex items-center justify-center text-neutral-800 mx-auto shadow-2xs group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-black tracking-[-0.0244em]">
                    Unggah Visual Portofolio
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Format visual utama yang tampil pada kartu layanan di halaman jelajah
                  </p>
                </div>
              )}

              {/* Top Left Username Pill */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full pointer-events-none">
                @{creatorUsername}
              </div>

              {/* Top Right Format Pill */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-[#DDDDDD] text-[#0D0C22] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 pointer-events-none shadow-2xs">
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
                <span>Instagram Post</span>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverInputChange}
                className="hidden"
              />
            </div>

            {/* Gallery Thumbnail Strip (Figma node 5386:13391) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {/* Tambah Thumbnail Button */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-28 h-20 rounded-xl border border-dashed border-[#E5E5E5] hover:border-[#155DFC] bg-white flex flex-col items-center justify-center gap-1 text-[#A1A1A1] hover:text-[#155DFC] transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Tambah</span>
              </button>

              {/* Extra Uploaded Gallery Previews */}
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx}
                  className="w-28 h-20 rounded-xl border border-neutral-200 overflow-hidden relative group shrink-0"
                >
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAddGalleryImages}
                className="hidden"
              />
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 2. CATEGORY & TITLE (Figma node 5386:13651 & 5386:13666)          */}
          {/* ----------------------------------------------------------------- */}
          <div className="space-y-3 pt-2">
            
            {/* Category Dropdown Pill */}
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="h-[38px] px-3.5 rounded-xl border border-[#CFCFCF]/90 bg-[#FBFBFB]/80 hover:bg-white text-black flex items-center gap-2.5 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-neutral-700 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#0D0C22] tracking-[-0.01em]">
                  {category}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-[#E5E5E5] shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer ${
                        category === cat ? 'text-[#155DFC] bg-blue-50/50' : 'text-[#0D0C22]'
                      }`}
                    >
                      <span>{cat}</span>
                      {category === cat && <Check className="w-3.5 h-3.5 text-[#155DFC]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Headline Title Input */}
            <div className="border-b border-[#E5E5E5] pb-2.5">
              <input
                id="upload-service-title"
                type="text"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="Ketik judul layanan..."
                className="w-full text-2xl sm:text-3xl md:text-[34px] leading-tight font-extrabold tracking-tight text-[#0D0C22] placeholder:text-[#D4D4D4] outline-none bg-transparent"
              />
            </div>

          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 3. DESKRIPSI LAYANAN (Figma node 5386:13425)                      */}
          {/* ----------------------------------------------------------------- */}
          <div>
            <label className="block text-xs font-bold text-[#404040] tracking-[0.05em] uppercase mb-2">
              Deskripsi Layanan
            </label>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-3.5 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan deskripsi layanan..."
                className="w-full min-h-[90px] bg-transparent outline-none text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1] leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 4. KETENTUAN PAKET & HARGA (Figma node 5386:13435)                */}
          {/* ----------------------------------------------------------------- */}
          <div>
            <label className="block text-xs font-bold text-[#404040] tracking-[0.05em] uppercase mb-2.5">
              Ketentuan Paket & Harga
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              
              {/* Card 1: HARGA (RP) */}
              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#737373] tracking-[0.055em] uppercase">
                    Harga (Koin)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#737373]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>

                <div className="h-[42px] px-3 rounded-xl border border-[#E5E5E5] bg-white flex items-center gap-1.5 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                  <span className="text-sm select-none">
                    🪙
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rawPrice}
                    onChange={handlePriceChange}
                    placeholder="0"
                    className="text-base font-black text-[#0D0C22] placeholder:text-[#D4D4D4] w-full bg-transparent outline-none tracking-tight"
                  />
                </div>
              </div>

              {/* Card 2: WAKTU PENGERJAAN */}
              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] flex flex-col justify-between gap-3" ref={deadlineRef}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#737373] tracking-[0.055em] uppercase">
                    Waktu Pengerjaan
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#737373]">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative">
                  <div className="h-[42px] px-3 rounded-xl border border-[#E5E5E5] bg-white flex items-center gap-2 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      onFocus={() => setIsDeadlineOpen(true)}
                      placeholder="3 Hari Kerja"
                      className="text-base font-black text-[#0D0C22] placeholder:text-[#D4D4D4] w-full bg-transparent outline-none tracking-tight"
                    />
                    <button
                      type="button"
                      onClick={() => setIsDeadlineOpen(!isDeadlineOpen)}
                      className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isDeadlineOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-[#E5E5E5] shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                      {DEADLINE_PRESETS.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => {
                            setDeadline(d);
                            setIsDeadlineOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-semibold text-[#0D0C22] hover:bg-neutral-50 transition cursor-pointer"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: JUMLAH REVISI (Figma node 5386:13469) */}
              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] flex flex-col justify-between gap-3" ref={revisionRef}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#737373] tracking-[0.055em] uppercase">
                    Jumlah Revisi
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#737373]">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative">
                  <div className="h-[42px] px-3 rounded-xl border border-[#E5E5E5] bg-white flex items-center gap-2 focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                    <input
                      type="text"
                      value={revisions}
                      onChange={(e) => setRevisions(e.target.value)}
                      onFocus={() => setIsRevisionOpen(true)}
                      placeholder="2x Revisi"
                      className="text-base font-black text-[#0D0C22] placeholder:text-[#D4D4D4] w-full bg-transparent outline-none tracking-tight"
                    />
                    <button
                      type="button"
                      onClick={() => setIsRevisionOpen(!isRevisionOpen)}
                      className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isRevisionOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-[#E5E5E5] shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                      {REVISION_PRESETS.map((r) => (
                        <button
                          type="button"
                          key={r}
                          onClick={() => {
                            setRevisions(r);
                            setIsRevisionOpen(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-semibold text-[#0D0C22] hover:bg-neutral-50 transition cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 5. TAGAR (Figma node 5386:13507)                                  */}
          {/* ----------------------------------------------------------------- */}
          <div>
            <label className="block text-xs font-bold text-[#404040] tracking-[0.05em] uppercase mb-2">
              Tagar
            </label>
            <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]/40 p-2.5 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#155DFC] text-xs font-semibold"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-blue-800 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) handleAddTag(tagInput);
                }}
                placeholder={tags.length === 0 ? "Ketik tagar (Enter / koma)..." : "Tambah tagar..."}
                className="flex-1 min-w-[180px] bg-transparent outline-none text-xs text-[#0D0C22] placeholder:text-[#A1A1A1]"
              />
            </div>

            {/* Popular Tag Quick Suggestions */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium text-neutral-400 mr-1">Rekomendasi tagar:</span>
              {POPULAR_TAG_SUGGESTIONS.map((sug) => {
                const isAdded = tags.includes(sug);
                return (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => (isAdded ? handleRemoveTag(sug) : handleAddTag(sug))}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                      isAdded
                        ? 'bg-[#155DFC] text-white border-[#155DFC]'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    #{sug}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
