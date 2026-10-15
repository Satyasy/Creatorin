import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Layers, 
  ChevronDown, 
  CreditCard, 
  Clock, 
  Users, 
  Sparkles,
  Check
} from 'lucide-react';
import { Creator } from '@/types';
import { briefService } from '@/services/briefService';
import { useLanguage } from '@/providers/LanguageProvider';

interface ProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCreator?: Creator | null;
  preselectedCreator?: Creator | null;
  onSuccess?: () => void;
  initialData?: {
    title?: string;
    category?: string;
    budget?: string;
    deadline?: string;
    description?: string;
    tags?: string[];
    applicantsCount?: number;
  };
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
  'FeedAesthetic'
];

export const ProjectBriefModal: React.FC<ProjectBriefModalProps> = ({
  isOpen,
  onClose,
  targetCreator,
  preselectedCreator,
  onSuccess,
  initialData
}) => {
  const { t, language } = useLanguage();
  const selectedCreator = targetCreator ?? preselectedCreator ?? null;

  // Form States matching Figma node 5386:10952
  const [category, setCategory] = useState('Video Reels & TikTok');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [rawBudget, setRawBudget] = useState('0');
  const [deadline, setDeadline] = useState('3 Hari Kerja');
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const deadlineRef = useRef<HTMLDivElement>(null);

  // Sync initial data or defaults on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category || 'Video Reels & TikTok');
        setProjectTitle(initialData.title || '');
        const budgetNum = initialData.budget ? initialData.budget.replace(/\D/g, '') : '0';
        setRawBudget(budgetNum ? formatNumberWithDots(budgetNum) : '0');
        setDeadline(initialData.deadline || '3 Hari Kerja');
        setDescription(initialData.description || '');
        setTags(initialData.tags || []);
        setApplicantsCount(initialData.applicantsCount || 0);
      } else {
        setCategory('Video Reels & TikTok');
        setProjectTitle('');
        setRawBudget('0');
        setDeadline('3 Hari Kerja');
        setDescription('');
        setTags([]);
        setApplicantsCount(0);
      }
      setIsSubmitted(false);
      setError('');
    }
  }, [isOpen, initialData]);

  // Handle outside click for custom dropdowns
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

  if (!isOpen) return null;

  // Format number with thousand separator
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setError('Silakan isi judul proyek.');
      return;
    }
    if (!description.trim()) {
      setError('Silakan isi rincian deskripsi proyek.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formattedBudgetString = rawBudget && rawBudget !== '0' ? `Rp${rawBudget}` : 'Sesuai Kesepakatan';
    const tagString = tags.length > 0 ? tags.map((t) => `#${t}`).join(', ') : '';

    const result = await briefService.createBrief({
      title: projectTitle.trim(),
      category,
      description: description.trim(),
      budget: formattedBudgetString,
      deadline,
      expectedOutput: tagString
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Gagal menyimpan brief.');
      return;
    }

    setIsSubmitted(true);
    onSuccess?.();
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setProjectTitle('');
    setDescription('');
    setTags([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E5E5E5] shadow-2xl max-w-4xl lg:max-w-[940px] w-full overflow-hidden text-left max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brief-modal-title"
      >
        {/* Top Header Bar */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#E5E5E5] flex items-center justify-between bg-white/95">
          <div>
            <h2 id="brief-modal-title" className="text-base sm:text-lg font-bold text-[#0D0C22]">
              {selectedCreator 
                ? t('briefModal.sendToTitle', 'Kirim Brief Proyek ke {name}').replace('{name}', selectedCreator.name) 
                : t('briefModal.createTitle', 'Buat Brief Proyek Baru')}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {selectedCreator 
                ? t('briefModal.descSpecific', 'Rincikan kebutuhan proyek kolaborasi Anda dengan aman dan transparan.')
                : t('briefModal.descGeneric', 'Terbitkan kebutuhan proyek Anda untuk mendapatkan penawaran dari kreator terverifikasi.')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            aria-label={language === 'en' ? 'Close modal' : 'Tutup modal'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 overflow-y-auto flex-1">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-[#155DFC] text-white rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-100/80 shadow-lg shadow-blue-500/20 animate-in zoom-in-75 duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    className="animate-checkmark-draw"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0D0C22]">{t('briefModal.successTitle', 'Brief Berhasil Diterbitkan!')}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                {selectedCreator 
                  ? t('briefModal.successDescSpecific', 'Brief proyek Anda telah dikirimkan ke {name}. Anda akan menerima respons dalam waktu dekat.').replace('{name}', selectedCreator.name)
                  : t('briefModal.successDescGeneric', 'Brief proyek Anda telah berhasil dipasang dan siap menerima proposal penawaran dari kreator terbaik.')}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-7 py-2.5 rounded-xl bg-[#155DFC] hover:bg-[#1248C4] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs active:scale-98"
                >
                  {t('briefModal.doneBtn', 'Selesai')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Creator Attribution (if preselected) */}
              {selectedCreator && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5] mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedCreator.avatar}
                      alt={selectedCreator.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#0D0C22] truncate">{selectedCreator.name}</div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {selectedCreator.roleTitle} • {language === 'en' ? 'Starting ' : 'Mulai '}{selectedCreator.formattedRate ? selectedCreator.formattedRate.replace(/^Rp\s?/, '🪙 ') : (selectedCreator.startingRate ? `🪙 ${selectedCreator.startingRate.toLocaleString('id-ID')}` : '🪙 200.000')}
                      </div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-semibold text-[#155DFC] bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
                    {language === 'en' ? 'Target Creator' : 'Kreator Tujuan'}
                  </span>
                </div>
              )}

              {/* 1. Category Dropdown Button (Figma node 5386:10961) */}
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

              {/* 2. Headline Title Input (Figma node 5386:10972) */}
              <div className="border-b border-[#E5E5E5] pb-3">
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder={language === 'en' ? 'Type project title...' : 'Ketik judul proyek...'}
                  className="w-full text-2xl sm:text-3xl md:text-[34px] leading-tight font-extrabold tracking-tight text-[#0D0C22] placeholder:text-[#D4D4D4] outline-none bg-transparent"
                />
              </div>

              {/* 3. Three Metrics / Inputs Grid (Figma node 5386:10975) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                
                {/* Card 1: HARGA (RP) */}
                <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#737373] tracking-[0.055em] uppercase">
                      {language === 'en' ? 'Budget (Coins)' : 'Anggaran (Koin)'}
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
                      value={rawBudget}
                      onChange={handleBudgetChange}
                      placeholder="0"
                      className="text-base font-black text-[#0D0C22] placeholder:text-[#D4D4D4] w-full bg-transparent outline-none tracking-tight"
                    />
                  </div>
                </div>

                {/* Card 2: WAKTU PENGERJAAN */}
                <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] flex flex-col justify-between gap-3" ref={deadlineRef}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#737373] tracking-[0.055em] uppercase">
                      {language === 'en' ? 'Delivery Time' : 'Waktu Pengerjaan'}
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
                        placeholder={language === 'en' ? '3 Working Days' : '3 Hari Kerja'}
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
                            {language === 'en' ? d.replace('Hari Kerja', 'Working Days') : d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 3: PELAMAR TERDAFTAR (Figma node 5386:11017) */}
                <div className="rounded-2xl border border-[#E5E5E5]/90 bg-[#FAFAFA]/70 p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#A1A1A1] tracking-[0.055em] uppercase">
                      {language === 'en' ? 'Registered Applicants' : 'Pelamar Terdaftar'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155DFC]">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 h-[42px] items-center">
                    <span className="text-2xl font-black text-[#0D0C22] tracking-tight">
                      {applicantsCount}
                    </span>
                    <span className="text-sm font-semibold text-[#737373]">
                      {language === 'en' ? (applicantsCount === 1 ? 'Applicant' : 'Applicants') : 'Pelamar'}
                    </span>
                  </div>
                </div>

              </div>

              {/* 4. Deskripsi Proyek Section (Figma node 5386:11059) */}
              <div>
                <label className="block text-xs font-bold text-[#737373] tracking-[0.05em] uppercase mb-2">
                  {language === 'en' ? 'Project Description' : 'Deskripsi Proyek'}
                </label>
                <div className="rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-4 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all">
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'en' ? 'Describe project requirements, concepts, or key campaign goals...' : 'Tuliskan detail kebutuhan proyek, konsep, atau tujuan yang ingin dicapai...'}
                    className="w-full min-h-[140px] bg-transparent outline-none text-sm sm:text-base text-[#0D0C22] placeholder:text-[#A1A1A1] leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* 5. Tagar Section (Figma node 5386:11106) */}
              <div>
                <label className="block text-xs font-bold text-[#737373] tracking-[0.05em] uppercase mb-2">
                  {language === 'en' ? 'Hashtags' : 'Tagar'}
                </label>
                <div className="rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-3 focus-within:bg-white focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-[#155DFC]/10 transition-all flex flex-wrap items-center gap-2">
                  {tags.map((tItem) => (
                    <span
                      key={tItem}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#155DFC] text-xs font-semibold"
                    >
                      <span>#{tItem}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tItem)}
                        className="hover:text-blue-800 cursor-pointer"
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
                    placeholder={tags.length === 0 ? (language === 'en' ? 'Type hashtag then press Enter or Comma (e.g. Reels, Branding)' : 'Ketik tagar lalu tekan Enter atau Koma (misal: Reels, Branding)') : (language === 'en' ? 'Add hashtag...' : 'Tambah tagar...')}
                    className="flex-1 min-w-[200px] bg-transparent outline-none text-xs sm:text-sm text-[#0D0C22] placeholder:text-[#A1A1A1]"
                  />
                </div>

                {/* Popular Tag Quick Suggestions */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-neutral-400 mr-1">
                    {language === 'en' ? 'Recommended tags:' : 'Rekomendasi tagar:'}
                  </span>
                  {POPULAR_TAG_SUGGESTIONS.map((sug) => {
                    const isAdded = tags.includes(sug);
                    return (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => (isAdded ? handleRemoveTag(sug) : handleAddTag(sug))}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
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


              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'en' ? 'Publishing...' : 'Menerbitkan...') 
                      : selectedCreator 
                        ? (language === 'en' ? 'Send Brief to Creator' : 'Kirim Brief ke Kreator') 
                        : (language === 'en' ? 'Post Project Brief' : 'Pasang Brief Proyek')}
                  </span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
