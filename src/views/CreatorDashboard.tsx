'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Clock, 
  Layers, 
  FolderPlus, 
  ShieldCheck, 
  Shield, 
  Pencil, 
  Check, 
  X, 
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { briefService } from '@/services/briefService';
import { creatorService } from '@/services/creatorService';
import type { ProjectListing } from '@/types';

interface BriefItem {
  id: string;
  category: string;
  postedTimeAgo: string;
  title: string;
  description: string;
  skills: string[];
  budget: string;
  budgetMin: number;
  budgetMax: number;
}

const FIGMA_SAMPLE_BRIEFS: BriefItem[] = [
  {
    id: 'figma-brief-1',
    category: 'Reels Instagram',
    postedTimeAgo: '2 jam yang lalu',
    title: 'Produksi 3x Video Reels Instagram & TikTok untuk Launching Kopi Susu Botolan',
    description: 'Kami membutuhkan kreator video UGC yang aktif dan ekspresif untuk membuat 3 video reels/TikTok promosi menu baru Cold Brew Caramel. Konsep video: First impression review, aesthetic pouring B-roll, dan ASMR unboxing. Produk akan kami kirimkan ke alamat kreator.',
    skills: ['TikTok UGC', 'Reels Instagram', 'Food Videography', 'Voiceover', 'CapCut Pro'],
    budget: '🪙 1.500.000',
    budgetMin: 1500000,
    budgetMax: 1500000,
  },
  {
    id: 'figma-brief-2',
    category: 'Logo & Branding',
    postedTimeAgo: '5 jam yang lalu',
    title: 'Desain Identitas Visual, Logo Brand, & Packaging Box Skincare Organik',
    description: 'Mencari graphic designer berpengalaman di bidang beauty & skincare untuk merancang logo minimalis premium, panduan warna/tipografi, serta mockup box kemasan serum dan facial wash.',
    skills: ['Logo Design', 'Packaging', 'Brand Identity', 'Adobe Illustrator', 'Visual Branding'],
    budget: '🪙 3.000.000',
    budgetMin: 3000000,
    budgetMax: 3000000,
  },
  {
    id: 'figma-brief-3',
    category: 'Foto Produk',
    postedTimeAgo: '1 hari yang lalu',
    title: 'Foto Katalog Produk & Lifestyle Shoot 12 Artikel Baju Muslim Lebaran',
    description: 'Dibutuhkan fotografer produk fashion untuk sesi photoshoot 12 artikel gamis & hijab. Kami akan kirimkan sampel produk fisik ke studio Anda. Butuh foto white background (clean e-commerce) dan outdoor natural mood.',
    skills: ['Foto Produk', 'Fashion Photography', 'Adobe Lightroom', 'Color Grading'],
    budget: '🪙 2.000.000',
    budgetMin: 2000000,
    budgetMax: 2000000,
  },
  {
    id: 'figma-brief-4',
    category: 'Feed Instagram',
    postedTimeAgo: '1 hari yang lalu',
    title: 'Paket Desain 15 Feed Instagram Carousel & Story Edukatif Fintech Syariah',
    description: 'Kami membutuhkan desainer grafis untuk membuat 15 konten visual social media bulanan (carousel edukasi investasi halal & tips keuangan) dengan tone modern, clean, dan profesional.',
    skills: ['Feed Instagram', 'Social Media Design', 'Figma', 'Infographic Design', 'Typography'],
    budget: '🪙 1.800.000',
    budgetMin: 1800000,
    budgetMax: 1800000,
  },
  {
    id: 'figma-brief-5',
    category: 'Video Tiktok',
    postedTimeAgo: '3 jam yang lalu',
    title: 'Video Review & Unboxing Jujur Headset Gaming Wireless (TikTok & YouTube Shorts)',
    description: 'Mencari tech enthusiast / gamer creator untuk membuat video unboxing + review latensi mic, sound staging, dan build quality produk headset gaming terbaru kami.',
    skills: ['Video Tiktok', 'Tech Review', 'Sound Testing', 'Video Editing'],
    budget: '🪙 1.200.000',
    budgetMin: 1200000,
    budgetMax: 1200000,
  },
  {
    id: 'figma-brief-6',
    category: 'Banner',
    postedTimeAgo: '2 hari yang lalu',
    title: 'Desain Banner Promosi Shopee Big Sale & Roll Up Banner Stand Booth Event',
    description: 'Dibutuhkan desainer cepat untuk membuat set banner e-commerce marketplace (Shopee/Tokopedia campaign) dan 2 desain standing banner untuk pameran kuliner.',
    skills: ['Banner', 'Poster', 'E-Commerce Graphic', 'Print Design', 'Photoshop'],
    budget: '🪙 800.000',
    budgetMin: 800000,
    budgetMax: 800000,
  },
  {
    id: 'figma-brief-7',
    category: 'UI/UX Design',
    postedTimeAgo: '4 jam yang lalu',
    title: 'Redesign Landing Page Website Brand Sepatu Lokal Ramah Lingkungan',
    description: 'Kami ingin meremajakan tampilan website katalog e-commerce kami dengan sentuhan clean, editorial, dan menonjolkan nilai sustainability sepatu daur ulang kami. Butuh file rapi di Figma siap serah terima ke developer.',
    skills: ['UI/UX Design', 'Figma', 'E-Commerce UX', 'Design Systems', 'Responsive Web'],
    budget: '🪙 3.500.000',
    budgetMin: 3500000,
    budgetMax: 3500000,
  },
  {
    id: 'figma-brief-8',
    category: 'Video Tiktok',
    postedTimeAgo: '6 jam yang lalu',
    title: 'Pembuatan 2 Video Recipe Hacks Menggunakan Keju Oles Serbaguna (TikTok Foodie)',
    description: 'Mencari kreator food blogger / home cook TikTok untuk membuat resep cemilan viral yang mudah ditiru ibu muda dan anak kos menggunakan keju oles kami. Wajib ada close-up tekstur leleh yang menggugah selera.',
    skills: ['Video Tiktok', 'Food Styling', 'Recipe Creation', 'Short Video Editing'],
    budget: '🪙 1.800.000',
    budgetMin: 1800000,
    budgetMax: 1800000,
  },
];

const CATEGORY_FILTERS = [
  'Semua Kategori',
  'Reels Instagram',
  'Video Tiktok',
  'Logo & Branding',
  'Foto Produk',
  'Feed Instagram',
  'Banner',
  'UI/UX Design',
];

const BUDGET_FILTERS = [
  'Semua Anggaran',
  '< 🪙 1.000.000',
  '🪙 1.000.000 - 🪙 2.000.000',
  '> 🪙 2.000.000',
];

const DEADLINE_FILTERS = [
  'Semua Waktu',
  'Terbaru (< 24 Jam)',
  '1-3 Hari Lalu',
  '> 3 Hari Lalu',
];

export const CreatorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedBudget, setSelectedBudget] = useState('Semua Anggaran');
  const [selectedDeadline, setSelectedDeadline] = useState('Semua Waktu');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);

  // Stats states
  const [serviceStats, setServiceStats] = useState({ total: 4, active: 3 });
  const [projectCount, setProjectCount] = useState(4);

  // Application modal state
  const [applyingBrief, setApplyingBrief] = useState<BriefItem | null>(null);
  const [pitchMessage, setPitchMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live briefs from database
  const [liveBriefs, setLiveBriefs] = useState<ProjectListing[]>([]);

  useEffect(() => {
    briefService.getBriefs().then(setLiveBriefs).catch(() => setLiveBriefs([]));
  }, []);

  useEffect(() => {
    if (user?.id) {
      creatorService.getCreatorDetail(user.id).then((creator) => {
        if (creator) {
          if (creator.services && creator.services.length > 0) {
            const active = creator.services.filter((s) => s.isActive !== false).length;
            setServiceStats({ total: creator.services.length, active });
          }
          if (creator.stats?.completedProjects || creator.portfolioSamples?.length) {
            setProjectCount(Number(creator.stats?.completedProjects) || creator.portfolioSamples?.length || 4);
          }
        }
      }).catch(() => {});
    }
  }, [user?.id]);

  // Combine Figma design briefs with live briefs from database
  const combinedBriefs = useMemo<BriefItem[]>(() => {
    const list: BriefItem[] = [...FIGMA_SAMPLE_BRIEFS];

    // If live briefs exist, map them to BriefItem format and prepend
    if (liveBriefs.length > 0) {
      liveBriefs.forEach((b) => {
        if (!list.some((existing) => existing.id === b.id)) {
          list.unshift({
            id: b.id,
            category: b.category || 'Kolaborasi Proyek',
            postedTimeAgo: b.postedTimeAgo || 'Baru saja',
            title: b.title,
            description: b.description || 'Brief kolaborasi proyek terbuka untuk kreator terverifikasi.',
            skills: b.requiredSkills?.length ? b.requiredSkills : [b.category || 'Kreatif'],
            budget: b.formattedBudget
              ? b.formattedBudget.replace(/^Rp\s?/, '🪙 ')
              : (b.budgetMin ? `🪙 ${b.budgetMin.toLocaleString('id-ID')}` : '🪙 1.500.000'),
            budgetMin: b.budgetMin || 0,
            budgetMax: b.budgetMax || 0,
          });
        }
      });
    }

    return list;
  }, [liveBriefs]);

  // Filtered briefs
  const filteredBriefs = useMemo(() => {
    return combinedBriefs.filter((item) => {
      // Search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.skills.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Category filter
      if (selectedCategory !== 'Semua Kategori') {
        if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Budget filter
      if (selectedBudget === '< 🪙 1.000.000' && item.budgetMin >= 1000000) return false;
      if (
        selectedBudget === '🪙 1.000.000 - 🪙 2.000.000' &&
        (item.budgetMin < 1000000 || item.budgetMin > 2000000)
      ) {
        return false;
      }
      if (selectedBudget === '> 🪙 2.000.000' && item.budgetMin <= 2000000) return false;

      // Deadline filter
      if (selectedDeadline === 'Terbaru (< 24 Jam)') {
        if (!item.postedTimeAgo.includes('jam') && !item.postedTimeAgo.includes('Baru')) {
          return false;
        }
      }

      return true;
    });
  }, [combinedBriefs, query, selectedCategory, selectedBudget, selectedDeadline]);

  const handleOpenApply = (brief: BriefItem) => {
    setApplyingBrief(brief);
    setProposedPrice(brief.budget);
    setPitchMessage('');
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingBrief) return;
    setIsSubmitting(true);

    try {
      if (!applyingBrief.id.startsWith('figma-')) {
        await briefService.applyToBrief(applyingBrief.id, pitchMessage, proposedPrice);
      }
      showToast({
        type: 'success',
        title: 'Lamaran Terkirim!',
        message: `Proposal Anda untuk "${applyingBrief.title}" berhasil diajukan ke klien.`,
      });
      setApplyingBrief(null);
    } catch {
      showToast({
        type: 'error',
        title: 'Gagal Mengirim',
        message: 'Terjadi kesalahan saat mengajukan lamaran. Coba lagi nanti.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const creatorDisplayName = user?.name || 'Sobakhul Munir Siroj';
  const creatorRoleTitle = (user as any)?.roleTitle || (user as any)?.headline || 'Top Tier Product Designer & Figma/Framer Architect';
  const creatorUsername = (user as any)?.username || user?.name?.toLowerCase().replace(/\s+/g, '') || 'sobakhulmunirsiroj';
  const creatorLocation = user?.location || 'Jakarta, ID';
  const creatorAvatar = user?.avatar || '/figma/creator-avatar.png';

  return (
    <div className="min-h-screen w-full flex-1 overflow-y-auto bg-[#F8F9FC] text-[#0D0C22]">
      <div className="mx-auto flex max-w-[1728px] flex-col xl:flex-row gap-8 p-4 sm:p-6 lg:p-8">
        
        {/* ==================================================================== */}
        {/* MAIN CONTENT AREA (Figma node 5433:17939) */}
        {/* ==================================================================== */}
        <main className="min-w-0 flex-1">
          
          {/* Hero Welcome Card (Figma node 5433:17940) */}
          <section className="rounded-[24px] border border-[rgba(229,229,229,0.9)] bg-white p-6 sm:p-7 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Left Column: Greeting & Intro */}
              <div className="max-w-[576px]">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold tracking-[-0.0107em] text-[#155DFC]">
                    Ruang Kerja Kreator
                  </span>
                </div>
                <h1 className="mt-1 text-[22px] sm:text-[24px] font-extrabold leading-[32px] tracking-[-0.0221em] text-[#0D0C22]">
                  Selamat datang di Ruang Kerja Kreator, {creatorDisplayName}! 👋
                </h1>
                <p className="mt-2 text-[14px] font-normal leading-[22.75px] tracking-[-0.0107em] text-[#737373]">
                  Kelola layanan dan portofolio proyek Anda dengan mudah, serta eksplorasi brief kolaborasi yang sedang terbuka dari brand & UMKM.
                </p>
              </div>

              {/* Right Column: Quick Stats Cards (Figma node 5433:17949) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                
                {/* Stat 1: Jumlah Layanan */}
                <Link
                  href="/dashboard/layanan"
                  className="group flex h-[101.5px] w-full sm:w-[200px] items-start justify-between rounded-2xl border border-[rgba(229,229,229,0.8)] bg-white p-4 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all hover:border-[#155DFC] hover:shadow-md cursor-pointer"
                >
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-[11px] font-semibold leading-[16.5px] tracking-[0.0059em] text-[#737373]">
                      Jumlah Layanan
                    </span>
                    <div className="flex items-baseline gap-1 my-0.5">
                      <span className="text-[24px] font-black leading-[32px] tracking-[0.0029em] text-[#0D0C22]">
                        {serviceStats.total}
                      </span>
                      <span className="text-[12px] font-medium leading-4 text-[#737373]">
                        Layanan
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold leading-[15px] tracking-[0.0117em] text-[#009966]">
                      {serviceStats.active} aktif di etalase
                    </span>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(229,229,229,0.8)] bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-blue-50">
                    <Layers className="size-4 text-[#0D0C22] group-hover:text-[#155DFC]" />
                  </div>
                </Link>

                {/* Stat 2: Jumlah Proyek */}
                <Link
                  href="/profile?tab=work"
                  className="group flex h-[101.5px] w-full sm:w-[200px] items-start justify-between rounded-2xl border border-[rgba(229,229,229,0.8)] bg-white p-4 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all hover:border-[#155DFC] hover:shadow-md cursor-pointer"
                >
                  <div className="flex flex-col justify-between h-full">
                    <span className="text-[11px] font-semibold leading-[16.5px] tracking-[0.0059em] text-[#737373]">
                      Jumlah Proyek
                    </span>
                    <div className="flex items-baseline gap-1 my-0.5">
                      <span className="text-[24px] font-black leading-[32px] tracking-[0.0029em] text-[#0D0C22]">
                        {projectCount}
                      </span>
                      <span className="text-[12px] font-medium leading-4 text-[#737373]">
                        Proyek
                      </span>
                    </div>
                    <span className="text-[10px] font-medium leading-[15px] tracking-[0.0117em] text-[#A1A1A1]">
                      Portofolio terupload
                    </span>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(229,229,229,0.8)] bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-blue-50">
                    <FolderPlus className="size-4 text-[#0D0C22] group-hover:text-[#155DFC]" />
                  </div>
                </Link>

              </div>
            </div>
          </section>

          {/* Search Bar (Figma node 5433:17982) */}
          <div className="mt-6">
            <div className="relative flex h-[50px] w-full items-center rounded-full border border-[rgba(229,229,229,0.9)] bg-white px-4 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition focus-within:border-[#155DFC] focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="size-4 shrink-0 text-[#A1A1A1]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari proyek, keahlian, atau kata kunci"
                className="w-full bg-transparent px-3 text-[14px] text-[#0D0C22] placeholder-[#A1A1A1] outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="rounded-full p-1 text-[#A1A1A1] hover:text-[#0D0C22]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category & Filters Header (Figma node 5433:17988) */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[14px] font-bold leading-5 tracking-[-0.0107em] text-[#0D0C22]">
              Cari Proyek berdasarkan Kategori
            </h2>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Reset / All Filters icon button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Semua Kategori');
                  setSelectedBudget('Semua Anggaran');
                  setSelectedDeadline('Semua Waktu');
                  setQuery('');
                }}
                className="flex size-9 items-center justify-center rounded-xl border border-[rgba(229,229,229,0.8)] bg-white text-neutral-600 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition hover:bg-neutral-50 hover:text-[#0D0C22] cursor-pointer"
                title="Reset Semua Filter"
              >
                <SlidersHorizontal className="size-4" />
              </button>

              {/* Kategori Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsBudgetOpen(false);
                    setIsDeadlineOpen(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold leading-4 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition cursor-pointer ${
                    selectedCategory !== 'Semua Kategori'
                      ? 'border-[#0D0C22] bg-[#0D0C22] text-white'
                      : 'border-[rgba(229,229,229,0.8)] bg-white text-[#404040] hover:bg-neutral-50'
                  }`}
                >
                  <span>{selectedCategory === 'Semua Kategori' ? 'Kategori' : selectedCategory}</span>
                  <ChevronDown className="size-3.5 shrink-0" />
                </button>
                {isCategoryOpen && (
                  <div className="absolute left-0 top-full mt-2 z-40 w-52 rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-xl">
                    {CATEGORY_FILTERS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-neutral-50 cursor-pointer ${
                          selectedCategory === cat ? 'bg-blue-50 text-blue-600' : 'text-neutral-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Anggaran Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsBudgetOpen(!isBudgetOpen);
                    setIsCategoryOpen(false);
                    setIsDeadlineOpen(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold leading-4 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition cursor-pointer ${
                    selectedBudget !== 'Semua Anggaran'
                      ? 'border-[#0D0C22] bg-[#0D0C22] text-white'
                      : 'border-[rgba(229,229,229,0.8)] bg-white text-[#404040] hover:bg-neutral-50'
                  }`}
                >
                  <span>{selectedBudget === 'Semua Anggaran' ? 'Anggaran' : selectedBudget}</span>
                  <ChevronDown className="size-3.5 shrink-0" />
                </button>
                {isBudgetOpen && (
                  <div className="absolute left-0 top-full mt-2 z-40 w-56 rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-xl">
                    {BUDGET_FILTERS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setSelectedBudget(b);
                          setIsBudgetOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-neutral-50 cursor-pointer ${
                          selectedBudget === b ? 'bg-blue-50 text-blue-600' : 'text-neutral-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tenggat Waktu Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeadlineOpen(!isDeadlineOpen);
                    setIsCategoryOpen(false);
                    setIsBudgetOpen(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold leading-4 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition cursor-pointer ${
                    selectedDeadline !== 'Semua Waktu'
                      ? 'border-[#0D0C22] bg-[#0D0C22] text-white'
                      : 'border-[rgba(229,229,229,0.8)] bg-white text-[#404040] hover:bg-neutral-50'
                  }`}
                >
                  <span>{selectedDeadline === 'Semua Waktu' ? 'Tenggat Waktu' : selectedDeadline}</span>
                  <ChevronDown className="size-3.5 shrink-0" />
                </button>
                {isDeadlineOpen && (
                  <div className="absolute right-0 top-full mt-2 z-40 w-52 rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-xl">
                    {DEADLINE_FILTERS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDeadline(d);
                          setIsDeadlineOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-neutral-50 cursor-pointer ${
                          selectedDeadline === d ? 'bg-blue-50 text-blue-600' : 'text-neutral-700'
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

          {/* Grid of Brief Cards (Figma node 5433:18019) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBriefs.map((brief) => (
              <article
                key={brief.id}
                className="group flex flex-col justify-between rounded-[16px] border border-[rgba(229,229,229,0.8)] bg-white p-5 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all hover:border-neutral-300 hover:shadow-md"
              >
                <div>
                  {/* Category Badge & Time Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-[11px] font-semibold leading-[14.67px] tracking-[0.0059em] text-[#404040]">
                      {brief.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-normal leading-[14.67px] tracking-[0.0059em] text-[#A1A1A1]">
                      <Clock className="size-3 text-[#A1A1A1]" />
                      <span>{brief.postedTimeAgo}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-[14px] font-extrabold leading-[19.25px] tracking-[-0.0107em] text-[#0D0C22] transition-colors group-hover:text-blue-600 line-clamp-2">
                    {brief.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-[12px] font-normal leading-[19.5px] text-[#737373] line-clamp-3">
                    {brief.description}
                  </p>

                  {/* Skills / Deliverables Tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {brief.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-[8px] bg-[#F5F5F5]/80 px-2.5 py-1 text-[10px] font-medium leading-[15px] tracking-[0.0117em] text-[#525252]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Budget & Lamar Button */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F5F5F5] pt-4">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium leading-[15px] tracking-[0.0117em] text-[#A1A1A1]">
                      Estimasi Anggaran
                    </span>
                    <span className="block truncate text-[16px] font-extrabold leading-6 tracking-[-0.0195em] text-[#0D0C22]">
                      {brief.budget}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenApply(brief)}
                    className="rounded-full bg-[#0D0C22] px-5 py-2 text-[12px] font-bold leading-4 text-white shadow-xs transition hover:bg-neutral-800 cursor-pointer"
                  >
                    Lamar
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredBriefs.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto size-8 text-neutral-400 mb-2" />
              <h3 className="text-sm font-bold text-[#0D0C22]">Tidak Ada Proyek yang Cocok</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat brief lainnya.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Semua Kategori');
                  setSelectedBudget('Semua Anggaran');
                  setSelectedDeadline('Semua Waktu');
                  setQuery('');
                }}
                className="mt-4 rounded-full bg-[#0D0C22] px-4 py-2 text-xs font-bold text-white"
              >
                Reset Semua Filter
              </button>
            </div>
          )}

        </main>

        {/* ==================================================================== */}
        {/* RIGHT SIDEBAR (Figma node 5433:18299, 340px width) */}
        {/* ==================================================================== */}
        <aside className="w-full xl:w-[340px] shrink-0 space-y-5">
          
          {/* Card 1: Creator Mini Profile Card (Figma node 5433:18300) */}
          <div className="relative overflow-hidden rounded-[16px] border border-[rgba(229,229,229,0.9)] bg-white shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
            
            {/* Top Linear Gradient Banner (Figma node 5433:18325) */}
            <div 
              className="h-20 w-full"
              style={{
                background: 'linear-gradient(90deg, #155DFC 0%, #4F39F6 50%, #0D0C22 100%)'
              }}
            />

            {/* Profile Content */}
            <div className="px-5 pb-6">
              
              {/* Overlapping Avatar (Figma node 5433:18327) */}
              <div className="relative -mt-9 flex items-end justify-between">
                <img
                  src={creatorAvatar}
                  alt={creatorDisplayName}
                  className="size-[72px] rounded-[16px] border-4 border-white bg-white object-cover shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/figma/creator-avatar.png';
                  }}
                />
              </div>

              {/* Creator Info */}
              <div className="mt-4">
                <h3 className="text-[16px] font-extrabold leading-6 tracking-[-0.0195em] text-[#0D0C22]">
                  {creatorDisplayName}
                </h3>
                <p className="mt-0.5 text-[12px] font-medium leading-4 text-[#737373]">
                  {creatorRoleTitle}
                </p>
                <p className="mt-0.5 text-[11px] font-normal leading-[16.5px] tracking-[0.0059em] text-[#A1A1A1]">
                  @{creatorUsername} • {creatorLocation}
                </p>
              </div>

              {/* Divider & Action Button */}
              <div className="mt-4 border-t border-[#F5F5F5] pt-4">
                <Link
                  href="/profile"
                  className="flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#E5E5E5] px-3 py-2.5 text-[12px] font-bold text-[#404040] transition hover:border-neutral-400 hover:bg-neutral-50 cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit Profil & Pengaturan</span>
                </Link>
              </div>

            </div>
          </div>

          {/* Card 2: Security & Escrow Trust Card (Figma node 5433:18330) */}
          <div className="rounded-[16px] border border-[rgba(229,229,229,0.9)] bg-white p-5 shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
            
            {/* Header: Shield + Alur Kerja Aman */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#0D0C22]" />
              <h4 className="text-[12px] font-extrabold leading-4 text-[#0D0C22]">
                Alur Kerja Aman Creatorin
              </h4>
            </div>

            {/* Description */}
            <p className="mt-3 text-[11px] font-normal leading-[17.88px] tracking-[0.0059em] text-[#737373]">
              Semua transaksi dilindungi sistem Rekening Bersama Escrow. Dana klien dikunci sebelum pengerjaan dimulai dan dicairkan otomatis saat hasil disetujui.
            </p>

            {/* Checklists */}
            <div className="mt-4 space-y-2 border-t border-[#F5F5F5] pt-3">
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.0059em] text-[#525252]">
                <Check className="size-3.5 text-[#009966] stroke-[2.5]" />
                <span>Perjanjian NDA otomatis antar pihak</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.0059em] text-[#525252]">
                <Check className="size-3.5 text-[#009966] stroke-[2.5]" />
                <span>Hak cipta terlindungi hingga pelunasan</span>
              </div>
            </div>

          </div>

        </aside>

      </div>

      {/* ==================================================================== */}
      {/* PROPOSAL APPLICATION MODAL */}
      {/* ==================================================================== */}
      {applyingBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <span className="rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#525252]">
                  {applyingBrief.category}
                </span>
                <h3 className="mt-1 text-base font-extrabold text-[#0D0C22]">
                  Ajukan Proposal Kolaborasi
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                  {applyingBrief.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyingBrief(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                  Penawaran Biaya (Koin)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">🪙</span>
                  <input
                    type="text"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 pl-8 pr-3.5 py-2 text-sm text-[#0D0C22] outline-none focus:border-blue-600"
                    placeholder="Contoh: 1.500.000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                  Pesan Pengantar & Portofolio Relevan
                </label>
                <textarea
                  rows={4}
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  placeholder="Ceritakan mengapa Anda orang yang tepat, rencana pengerjaan, dan tautan hasil karya serupa..."
                  className="w-full rounded-xl border border-neutral-200 p-3 text-xs leading-relaxed text-[#0D0C22] outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setApplyingBrief(null)}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0C22] px-5 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
