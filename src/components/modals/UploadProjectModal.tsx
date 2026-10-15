'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Layers, 
  ChevronDown, 
  CreditCard, 
  Clock, 
  Mail, 
  MapPin, 
  Check, 
  CheckCircle2, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Tag
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Creator } from '@/types';

interface UploadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProject: any) => void;
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
  '3 Hari Kerja',
  '5 Hari Kerja',
  '7 Hari Kerja',
  '14 Hari Kerja',
  '30 Hari Kerja'
];

const POPULAR_TAG_SUGGESTIONS = [
  'Reels',
  'TikTokViral',
  'Branding',
  'FotoProduk',
  'UIUX',
  'DesainGrafis'
];

export const UploadProjectModal: React.FC<UploadProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  creator: propCreator,
}) => {
  const { user } = useAuth();

  // Active creator info for Header (Figma node 5386:10873)
  const creatorName = propCreator?.name || user?.name || 'Kopi Kenangan Senja';
  const creatorAvatar = propCreator?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const creatorEmail = user?.email || `${(propCreator?.username || 'kreator').toLowerCase().replace(/\s+/g, '')}@creatorin.id`;
  const creatorLocation = propCreator?.location || 'Jakarta Selatan';

  // Form states matching Figma node 5386:10952
  const [category, setCategory] = useState('Video Reels & TikTok');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [rawBudget, setRawBudget] = useState('0');
  const [deadline, setDeadline] = useState('3 Hari Kerja');
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Media upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const deadlineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (deadlineRef.current && !deadlineRef.current.contains(event.target as Node)) {
        setIsDeadlineOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  // Format thousand separator
  function formatNumberWithDots(val: string) {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) return '';
    return Number(cleaned).toLocaleString('id-ID');
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val || val === '0') {
      setRawBudget(val);
    } else {
      setRawBudget(formatNumberWithDots(val));
    }
  };

  const handleFileSelect = (file: File) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setSelectedFile(file);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
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
    if (!selectedFile) {
      setError('Silakan pilih file foto atau video karya portofolio terlebih dahulu.');
      return;
    }
    if (!projectTitle.trim()) {
      setError('Silakan ketik judul proyek.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Compose description with rich fee, timeline, and hashtags
      let fullDescription = description.trim();
      if (rawBudget && rawBudget !== '0') {
        fullDescription += `\n\n💰 Estimasi Nilai Proyek: Rp${rawBudget}`;
      }
      if (deadline) {
        fullDescription += `\n⏱️ Waktu Pengerjaan: ${deadline}`;
      }
      if (tags.length > 0) {
        fullDescription += `\n\n${tags.map((t) => `#${t}`).join(' ')}`;
      }

      const form = new FormData();
      form.set('title', projectTitle.trim().slice(0, 100));
      form.set('category', category);
      form.set('description', fullDescription || projectTitle.trim());
      form.set('file', selectedFile);

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: form
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengunggah karya.');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      onSuccess?.(result.project);

      setTimeout(() => {
        setIsSuccess(false);
        handleResetAndClose();
      }, 1000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal mengunggah karya.');
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setSelectedFile(null);
    setProjectTitle('');
    setDescription('');
    setTags([]);
    setError('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div 
      id="modal-upload-project"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-[24px] sm:rounded-[28px] border border-[#E5E5E5] shadow-2xl overflow-hidden text-left relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-project-title"
      >
        {/* ===================================================================== */}
        {/* TOP BAR / HEADER (Figma node 5386:10873)                             */}
        {/* ===================================================================== */}
        <header className="px-6 sm:px-8 py-3.5 border-b border-[#E5E5E5] bg-white flex items-center justify-between gap-4 shrink-0">
          
          {/* Sisi Kiri: Profil Kreator (Avatar + Nama + Email + Lokasi) */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[2px] bg-white shadow-xs border border-neutral-200 shrink-0">
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#0D0C22] tracking-[-0.0195em] truncate">
                {creatorName}
              </h2>
              
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#737373] font-medium truncate">
                <span className="inline-flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{creatorEmail}</span>
                </span>
                <span className="text-[#D4D4D4]">•</span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{creatorLocation}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tombol "Publikasikan Proyek" + Tombol Tutup */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !selectedFile}
              className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] active:bg-[#0E3A9E] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Berhasil Diposting!</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publikasikan Proyek</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-9 h-9 rounded-xl hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </header>

        {/* ===================================================================== */}
        {/* MAIN BODY CONTENT (Figma node 5386:10952 with Proportional 2-Column)   */}
        {/* ===================================================================== */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {error && (
            <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[330px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
            
            {/* --------------------------------------------------------------- */}
            {/* KOLOM KIRI: Media Upload Dropzone & Portofolio Preview          */}
            {/* --------------------------------------------------------------- */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#737373] tracking-[0.05em] uppercase">
                Media Karya (Foto / Video)
              </label>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[4/5] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer group select-none ${
                  isDragging 
                    ? 'border-[#155DFC] bg-blue-50/50' 
                    : selectedFile 
                      ? 'border-[#E5E5E5] bg-black' 
                      : 'border-[#E5E5E5] hover:border-[#155DFC] bg-[#FAFAFA]'
                }`}
              >
                {imagePreview ? (
                  <>
                    {selectedFile?.type.startsWith('video/') ? (
                      <video 
                        src={imagePreview} 
                        className="w-full h-full object-cover" 
                        muted 
                        playsInline 
                        autoPlay 
                        loop 
                      />
                    ) : (
                      <img 
                        src={imagePreview} 
                        alt="Preview karya" 
                        className="w-full h-full object-cover" 
                      />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                      <Upload className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold">Klik untuk ganti media</span>
                      <span className="text-[11px] text-white/80 mt-0.5 truncate max-w-full px-2">
                        {selectedFile?.name}
                      </span>
                    </div>

                    {/* Media Type Tag */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 pointer-events-none">
                      {selectedFile?.type.startsWith('video/') ? (
                        <>
                          <Video className="w-3 h-3" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3" />
                          <span>Foto</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-neutral-200 text-[#155DFC] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#0D0C22] block">
                        Pilih file karya atau seret ke sini
                      </span>
                      <span className="text-[11px] text-[#A1A1A1] mt-1 block leading-normal">
                        Mendukung JPG, PNG, WebP, MP4 hingga 20MB
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-full bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer"
                    >
                      Pilih Media
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* Informative Tip */}
              <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 text-xs text-neutral-600 leading-relaxed flex items-start gap-2.5">
                <span className="text-amber-500 font-bold shrink-0 text-sm">💡</span>
                <p>
                  <span className="font-semibold text-neutral-800">Tips Portofolio:</span> Format video vertikal (9:16) atau visual beresolusi tinggi mendapatkan minat kolaborasi 3x lebih tinggi dari UMKM.
                </p>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* KOLOM KANAN: Form Fields (Clean & Modern Layout)                 */}
            {/* --------------------------------------------------------------- */}
            <div className="space-y-4 sm:space-y-5">
              
              {/* 1. Judul Proyek & Kategori */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <label htmlFor="upload-project-title" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Judul Proyek
                  </label>

                  {/* Category Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="h-8 px-3 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="font-semibold text-neutral-900">{category}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-neutral-200 shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                        {CATEGORY_OPTIONS.map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer ${
                              category === cat ? 'text-[#155DFC] bg-blue-50/50' : 'text-neutral-800'
                            }`}
                          >
                            <span>{cat}</span>
                            {category === cat && <Check className="w-3.5 h-3.5 text-[#155DFC]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                  <input
                    id="upload-project-title"
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Contoh: Video Kampanye Ramadan Tokopedia"
                    className="w-full text-base sm:text-lg font-bold text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* 2. Estimasi Nilai & Waktu Pengerjaan (2 Kolom Seimbang) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Card 1: NILAI PROYEK (RP) */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 flex flex-col justify-between gap-2.5 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase">
                      Nilai Proyek (Koin)
                    </span>
                    <div className="w-6 h-6 rounded-md bg-neutral-200/60 flex items-center justify-center text-neutral-600">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="h-10 px-3 rounded-lg border border-neutral-200 bg-white flex items-center gap-1.5 focus-within:border-[#155DFC] transition-all">
                    <span className="text-sm select-none">
                      🪙
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rawBudget}
                      onChange={handleBudgetChange}
                      placeholder="0"
                      className="text-sm sm:text-base font-bold text-neutral-900 placeholder:text-neutral-300 w-full bg-transparent outline-none tracking-tight"
                    />
                  </div>
                </div>

                {/* Card 2: WAKTU PENGERJAAN */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 flex flex-col justify-between gap-2.5 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all" ref={deadlineRef}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase">
                      Waktu Pengerjaan
                    </span>
                    <div className="w-6 h-6 rounded-md bg-neutral-200/60 flex items-center justify-center text-neutral-600">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="h-10 px-3 rounded-lg border border-neutral-200 bg-white flex items-center gap-1.5 focus-within:border-[#155DFC] transition-all">
                      <input
                        type="text"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        onFocus={() => setIsDeadlineOpen(true)}
                        placeholder="3 Hari Kerja"
                        className="text-sm sm:text-base font-bold text-neutral-900 placeholder:text-neutral-300 w-full bg-transparent outline-none tracking-tight"
                      />
                      <button
                        type="button"
                        onClick={() => setIsDeadlineOpen(!isDeadlineOpen)}
                        className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDeadlineOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {isDeadlineOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-neutral-200 shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                        {DEADLINE_PRESETS.map((d) => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => {
                              setDeadline(d);
                              setIsDeadlineOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-neutral-50 transition cursor-pointer ${
                              deadline === d ? 'text-[#155DFC] bg-blue-50/50' : 'text-neutral-800'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 3. Deskripsi Proyek */}
              <div>
                <label htmlFor="upload-project-desc" className="block text-xs font-bold text-neutral-500 tracking-wider uppercase mb-1.5">
                  Deskripsi Proyek & Cerita Karya
                </label>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                  <textarea
                    id="upload-project-desc"
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan detail kebutuhan proyek, konsep, atau tujuan yang ingin dicapai..."
                    className="w-full min-h-[90px] bg-transparent outline-none text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* 4. Tagar */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 tracking-wider uppercase mb-1.5">
                  Tagar
                </label>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-2.5 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all flex flex-wrap items-center gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/60 text-[#155DFC] text-xs font-semibold"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-blue-800 cursor-pointer ml-0.5"
                        aria-label={`Hapus tagar ${t}`}
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
                    placeholder={tags.length === 0 ? "Ketik tagar lalu tekan Enter atau Koma (misal: Reels, Branding)" : "Tambah tagar..."}
                    className="flex-1 min-w-[180px] bg-transparent outline-none text-xs text-neutral-900 placeholder:text-neutral-400 py-0.5 px-1"
                  />
                </div>

                {/* Rekomendasi Tagar */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-neutral-400 mr-1">Rekomendasi tagar:</span>
                  {POPULAR_TAG_SUGGESTIONS.map((sug) => {
                    const isAdded = tags.includes(sug);
                    return (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => (isAdded ? handleRemoveTag(sug) : handleAddTag(sug))}
                        className={`text-xs px-2.5 py-0.5 rounded-full border transition cursor-pointer font-medium ${
                          isAdded
                            ? 'bg-[#155DFC] text-white border-[#155DFC]'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
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

      </div>
    </div>
  );
};
