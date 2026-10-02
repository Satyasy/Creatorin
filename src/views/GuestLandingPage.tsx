'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { ProjectCard } from '@/components/common/ProjectCard';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { FeedProject } from '@/types';
import dynamic from 'next/dynamic';
import { 
  ArrowRight, 
  ShieldCheck, 
  Star,
  PlayCircle,
  Clock,
  Award,
  Check,
  Zap,
  ChevronRight,
  MessageSquare,
  FileCheck,
  Search,
  Tag,
  FileText,
  RefreshCw,
  Sliders,
  FolderCheck,
  Layers,
  Sparkles
} from 'lucide-react';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

// Real SVG Brand Logos for Running Marquee (Monochrome clean SVG vectors)
const REAL_BRAND_LOGOS = [
  {
    name: 'Tokopedia',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 120 32" fill="currentColor">
        <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm-4 8a3 3 0 110 6 3 3 0 010-6zm8 0a3 3 0 110 6 3 3 0 010-6z" fill="#03AC0E"/>
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#333333">tokopedia</text>
      </svg>
    )
  },
  {
    name: 'Shopee',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 100 32" fill="currentColor">
        <path d="M12 4a5 5 0 00-5 5v1H4a2 2 0 00-2 2l2 14a2 2 0 002 2h12a2 2 0 002-2l2-14a2 2 0 00-2-2h-3V9a5 5 0 00-5-5zm-3 6a3 3 0 016 0v1H9v-1z" fill="#EE4D2D"/>
        <text x="26" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#333333">Shopee</text>
      </svg>
    )
  },
  {
    name: 'Gojek',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 95 32" fill="currentColor">
        <circle cx="12" cy="16" r="8" fill="#00AA13"/>
        <circle cx="12" cy="16" r="3.5" fill="#FFFFFF"/>
        <text x="26" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" fill="#111111">gojek</text>
      </svg>
    )
  },
  {
    name: 'Grab',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 85 32" fill="currentColor">
        <path d="M6 16c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="#00B14F" strokeWidth="3" fill="none"/>
        <path d="M12 16c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5-1.5 3.5-3 3.5" stroke="#00B14F" strokeWidth="2.5" fill="none"/>
        <text x="30" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" fill="#00B14F">Grab</text>
      </svg>
    )
  },
  {
    name: 'Traveloka',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 115 32" fill="currentColor">
        <path d="M15 6c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm-1 5l6 4-6 4v-8z" fill="#0194F3"/>
        <text x="30" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="14" fill="#111111">traveloka</text>
      </svg>
    )
  },
  {
    name: 'Spotify',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 100 32" fill="currentColor">
        <circle cx="12" cy="16" r="9" fill="#1DB954"/>
        <path d="M7 13.5c3-1 7-.8 10 .8M8 16c2.5-.7 5.5-.5 8 .8M9 18.5c2-.5 4.5-.4 6.5.6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <text x="27" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#111111">Spotify</text>
      </svg>
    )
  },
  {
    name: 'Tiket.com',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 105 32" fill="currentColor">
        <circle cx="11" cy="16" r="8" fill="#FEDD00"/>
        <circle cx="11" cy="16" r="4.5" fill="#0064D2"/>
        <text x="25" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#0064D2">tiket<tspan fill="#FEDD00">.com</tspan></text>
      </svg>
    )
  },
  {
    name: 'Blibli',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 85 32" fill="currentColor">
        <rect x="4" y="8" width="16" height="16" rx="4" fill="#0095DA"/>
        <text x="26" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" fill="#0095DA">blibli</text>
      </svg>
    )
  }
];

export const GuestLandingPage = () => {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);

  // Showcase 4 curated projects for guests
  const displayProjects = MOCK_FEED_PROJECTS.slice(0, 4);

  return (
    <div className="w-full bg-[#F4F4F6] text-[#0D0B0B] font-sans py-3 sm:py-6 px-2 sm:px-4 md:px-6 selection:bg-[#155DFC] selection:text-white">
      
      {/* Outer Floating Canvas Card (Matching lp-desain-1.png Layout & Padding) */}
      <div className="max-w-[1360px] mx-auto bg-white rounded-[28px] sm:rounded-[36px] border border-neutral-200/80 shadow-2xs overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Persis Tipografi & Struktur lp-desain-1.png) */}
        {/* ========================================================================= */}
        <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-8 text-center overflow-hidden">
          
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            
            {/* Top Micro-Pill (• +100K active users style in reference) */}
            <ScrollReveal distance={16} duration={500} immediate>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F4F6] border border-neutral-200/80 text-[12px] font-semibold text-neutral-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>1.200+ Kreator Terverifikasi di Indonesia</span>
              </div>
            </ScrollReveal>

            {/* Display Headline (Ideas. Notes. Clarity. Wherever your mind goes. style) */}
            <ScrollReveal distance={20} duration={600} delay={60} immediate>
              <h1 className="text-4xl sm:text-6xl md:text-[68px] font-extrabold text-[#111827] tracking-[-0.03em] leading-[1.08] max-w-3xl mx-auto">
                Ide. Kreator. Kolaborasi. <br />
                <span className="text-[#111827]">Wujudkan karya brand Anda.</span>
              </h1>
            </ScrollReveal>

            {/* Subhead Description (Compact 2-3 lines centered) */}
            <ScrollReveal distance={20} duration={600} delay={120} immediate>
              <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed font-normal">
                Gabungkan ide promosi UMKM dengan talenta konten kreator terbaik Indonesia dalam satu platform cerdas—siap diproduksi kapan pun inspirasi datang.
              </p>
            </ScrollReveal>

            {/* Creative Mode Selector Pill (Style 01 ⤹ B I ≡ ● in reference) */}
            <ScrollReveal distance={16} duration={600} delay={160} immediate>
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-[#F4F4F6] border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-2xs">
                <span className="text-neutral-400 font-mono text-[11px]">Style 01</span>
                <span className="text-neutral-300">⤹</span>
                <span className="hover:text-[#155DFC] cursor-pointer transition-colors">Video Reels</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="hover:text-[#155DFC] cursor-pointer transition-colors">TikTok UGC</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
                <span className="hover:text-[#155DFC] cursor-pointer transition-colors hidden sm:inline">Foto Studio</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
                <span className="hover:text-[#155DFC] cursor-pointer transition-colors hidden sm:inline">Brand Design</span>
              </div>
            </ScrollReveal>

            {/* Two Action Buttons (Download for Playstore & Start Free Trial style) */}
            <ScrollReveal distance={20} duration={600} delay={200} immediate>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/sign-up')}
                  className="w-full sm:w-auto h-11 px-7 rounded-full bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mulai Kolaborasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('workspace-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto h-11 px-6 rounded-full bg-transparent hover:bg-neutral-100 text-[#0D0C22] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Pelajari Cara Kerja</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </ScrollReveal>

            {/* Hero Artwork Frame with Creatorin Logo Silhouette (Mountain cut-out style in reference) */}
            <ScrollReveal distance={24} duration={700} delay={260} immediate>
              <div className="mt-10 sm:mt-14 relative mx-auto max-w-4xl bg-gradient-to-b from-neutral-50 via-neutral-100/60 to-[#EAEAEB] rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-4 sm:p-8 overflow-hidden shadow-2xs">
                
                {/* Silhouette Logo Creatorin Background (Direct Vector from logo.svg with soft blue glow) */}
                <div className="absolute right-4 -bottom-10 sm:right-10 sm:-bottom-6 w-64 sm:w-80 h-64 sm:h-80 pointer-events-none select-none opacity-25">
                  <div className="absolute inset-4 bg-gradient-to-tr from-[#03ACFD]/20 to-[#155DFC]/25 rounded-full blur-2xl pointer-events-none" />
                  <svg className="w-full h-full drop-shadow-[0_8px_20px_rgba(21,93,252,0.15)]" viewBox="0 0 34.0608 32.0987" fill="none">
                    <defs>
                      <linearGradient id="heroSilhouetteGrad" x1="0" y1="0" x2="34.0946" y2="32.0625" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#03ACFD" />
                        <stop offset="100%" stopColor="#155DFC" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M14.6734 0.0488397C18.7039 -0.282822 23.0405 1.08602 26.0613 3.81028C26.5593 4.25946 27.6061 5.08781 27.6893 5.75197C27.4144 6.16801 23.2771 9.3333 22.6847 9.63686C22.3105 9.68873 21.1521 8.52521 20.7703 8.27595C18.4935 6.78937 15.5157 6.44004 12.9225 7.2802C10.6474 8.03042 8.75853 9.64478 7.66348 11.7749C6.53453 14.0432 6.34872 16.6657 7.14658 19.0704C8.95844 24.552 15.4014 26.8895 20.3742 24.0882C20.973 23.7509 21.9305 22.8136 22.4582 22.6384C22.9989 22.6663 23.5835 23.2309 24.0215 23.5793C24.5722 23.9612 27.473 26.1816 27.5847 26.6874C27.5058 26.9069 27.3749 27.1226 27.2159 27.2925C24.5564 30.1343 20.9762 31.7154 17.1923 32.0416C13.0028 32.3977 8.84287 31.0799 5.62316 28.3767C2.3748 25.6087 0.369138 21.6568 0.0529795 17.4017C-0.2919 13.1385 1.05699 8.91102 3.80765 5.63477C6.63166 2.2969 10.3192 0.409821 14.6734 0.0488397Z" 
                      fill="url(#heroSilhouetteGrad)"
                    />
                    <path 
                      d="M32.6835 8.85233C33.6489 8.76102 34.0639 9.38588 34.0608 10.2843C34.0475 14.1416 34.058 17.9999 34.055 21.8571C34.0548 22.1165 34.0134 22.5461 33.9078 22.7814C33.7895 23.0436 33.5727 23.2488 33.3042 23.3524C33.1384 23.4162 32.8513 23.4493 32.694 23.3928C31.0498 22.8015 29.2454 21.876 27.6298 21.1666C26.5103 20.6598 25.306 20.1396 24.2207 19.5768C25.1105 16.9299 24.9622 15.2492 24.2082 12.6704C25.2979 11.9441 28.0197 10.9228 29.3051 10.3275C30.2018 9.91205 31.7883 9.15612 32.6835 8.85233Z" 
                      fill="url(#heroSilhouetteGrad)"
                    />
                  </svg>
                </div>

                {/* Inner Canvas Cards */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* Card 1: Escrow Protection */}
                  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/90 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#155DFC]" /> Rekening Bersama
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">100% Aman</span>
                    </div>
                    <p className="text-xs font-bold text-[#0D0C22]">Dana Rp1.500.000 Terkunci</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Dicairkan hanya setelah hasil Anda setujui.</p>
                  </div>

                  {/* Card 2: UGC Video Views */}
                  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/90 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-[#155DFC]" /> TikTok UGC
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">Viral</span>
                    </div>
                    <p className="text-xs font-bold text-[#0D0C22]">840.500+ Tayangan Organik</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Hook 3 detik & format video vertikal 9:16.</p>
                  </div>

                  {/* Card 3: Career Score */}
                  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-200/90 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> Career Score
                      </span>
                      <span className="text-[11px] font-bold text-[#0D0C22]">98/100</span>
                    </div>
                    <p className="text-xs font-bold text-[#0D0C22]">Kreator Terverifikasi</p>
                    <p className="text-[11px] text-neutral-500 mt-1">100% ketepatan waktu & minim revisi.</p>
                  </div>
                </div>

              </div>
            </ScrollReveal>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* TRUST BAR (Persis baris no setup fee / 100% legal compliance di lp-desain-1) */}
        {/* ========================================================================= */}
        <section className="py-6 border-y border-neutral-200/70 bg-[#FAFAFB]">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-neutral-600">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-400" />
              <span>Bebas Biaya Registrasi</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#155DFC]" />
              <span>100% Rekening Bersama (Escrow)</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-neutral-400" />
              <span>Kontrak & Hak Cipta Resmi</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-neutral-400" />
              <span>Garansi Revisi & Uang Kembali</span>
            </span>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* RUNNING MARQUEE LOGO ASLI (Vektor SVG Asli, Bukan Teks Chip!) */}
        {/* ========================================================================= */}
        <section className="py-7 border-b border-neutral-100 bg-white overflow-hidden">
          <div className="relative flex overflow-x-hidden group items-center">
            
            <div className="animate-marquee flex space-x-14 items-center min-w-full shrink-0">
              {REAL_BRAND_LOGOS.map((brand, idx) => (
                <div key={`brand-a-${idx}`} className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-200 cursor-pointer">
                  {brand.svg}
                </div>
              ))}
            </div>

            <div className="animate-marquee flex space-x-14 items-center min-w-full shrink-0 absolute top-0 left-full">
              {REAL_BRAND_LOGOS.map((brand, idx) => (
                <div key={`brand-b-${idx}`} className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-200 cursor-pointer">
                  {brand.svg}
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. APPLICATION WINDOW (Notes that work the way you think style) */}
        {/* ========================================================================= */}
        <section id="workspace-section" className="py-16 sm:py-24 px-4 sm:px-8 border-b border-neutral-100">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-[-0.03em]">
              Kolaborasi yang bekerja sesuai caramu.
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Briefing tak lagi berantakan di WhatsApp. Semua kesepakatan, file master, revisi terukur, dan faktur tersimpan rapi dalam satu Collaboration Room.
            </p>
          </div>

          {/* Desktop App Window Frame (matching browser mockup in lp-desain-1.png) */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden text-left">
            {/* Window Title Bar */}
            <div className="bg-[#F8F8F9] px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>
              <div className="px-4 py-1 rounded-md bg-white border border-neutral-200 text-[11px] font-mono text-neutral-500">
                creatorin.id/collaboration-room/CR-92014
              </div>
              <div className="text-[11px] font-semibold text-[#155DFC] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Active Escrow
              </div>
            </div>

            {/* Window Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Project ID: #CR-92014</span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D0C22] mt-0.5">Produksi 3x Video Reels Instagram & TikTok Launching Produk</h3>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-xs text-neutral-400">Total Settlement:</span>
                  <p className="text-lg font-bold text-[#155DFC]">Rp2.500.000</p>
                </div>
              </div>

              {/* Progress Milestones Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-neutral-700">1. Script & Hook</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-neutral-500">Disetujui klien</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-neutral-700">2. Video Draft Kasar</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-neutral-500">Revisi 1 minor selesai</p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#155DFC]">3. Penyerahan Final</span>
                    <span className="w-2 h-2 rounded-full bg-[#155DFC] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#155DFC] font-medium">Siap untuk verifikasi dana</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">Pengerjaan dijamin oleh Creatorin Career Score & Escrow</span>
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="px-4 py-2 rounded-full bg-[#155DFC] text-white text-xs font-semibold hover:bg-[#0E4CD1] transition cursor-pointer"
                >
                  Coba Demo Room
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. 2X2 BENTO GRID (Ideas. Notes. Clarity. Wherever your mind goes style) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-neutral-100">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-[-0.03em]">
              Ide. Kreator. Kepastian. <br />
              <span className="text-neutral-400 font-semibold">Terkendali dari awal hingga selesai.</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Bento Card 1: Rekening Bersama (Keep it simple pill style) */}
            <div className="p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F8F8F9] border border-neutral-200/90 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 mb-6 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#155DFC]" />
                  <span>Garansi Mutlak</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Rekening Bersama (Escrow)</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  Dana pembayaran Anda diamankan di sistem. Kreator baru menerima hak pencairan dana setelah Anda puas dan menyetujui penyerahan karya.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-400">
                <span>0% Risiko Penipuan</span>
                <span className="font-semibold text-emerald-600">Proteksi 100%</span>
              </div>
            </div>

            {/* Bento Card 2: Skor Karir & Checklist (Note taken / folders used style in reference) */}
            <div className="p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F8F8F9] border border-neutral-200/90 flex flex-col justify-between">
              <div>
                <div className="space-y-2 mb-6">
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 flex items-center justify-between shadow-2xs">
                    <span>Akurasi Deadline</span>
                    <span className="text-emerald-600 font-bold">99.2% Tepat</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 flex items-center justify-between shadow-2xs">
                    <span>Tingkat Kepuasan Klien</span>
                    <span className="text-amber-500 font-bold">⭐ 4.9 / 5.0</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Skor Karir & Portofolio Asli</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  Bukan klaim sepihak. Seluruh statistik portofolio dihitung otomatis dari transaksi kolaborasi nyata yang telah selesai.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-400">
                <span>Verifikasi Identitas & Karya</span>
                <Award className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Bento Card 3: Collaboration Room Cerdas */}
            <div className="p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F8F8F9] border border-neutral-200/90 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 mb-6 shadow-2xs">
                  <MessageSquare className="w-3.5 h-3.5 text-[#155DFC]" />
                  <span>Workroom Digital</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Collaboration Room Terstruktur</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  Pencatatan revisi bertahap, penyerahan file raw footage resolusi tinggi, dan persetujuan hak cipta komersial dalam satu alur kerja.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-400">
                <span>Terintegrasi Cloud Storage</span>
                <FileCheck className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Bento Card 4: Kecepatan Eksekusi (Concentric badges style in reference) */}
            <div className="p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F8F8F9] border border-neutral-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-[#155DFC] text-white text-xs font-bold">Respons Cepat</span>
                  <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700">&lt; 2 Jam</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Penawaran Proposal Instan</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  Pasang brief proyek Anda sekarang, dan dapatkan proposal penawaran langsung dari kreator yang siap bekerja hari ini.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-400">
                <span>Siap Produksi Kapan Pun</span>
                <Zap className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. PRICING / PACKAGE COMPARISON (Choose your pricing plan in reference) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-neutral-100 bg-[#FAFAFB]">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-[-0.03em]">
              Pilihan Paket Kolaborasi UMKM
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Atur anggaran promosi brand Anda secara fleksibel dan transparan. Tanpa biaya langganan bulanan tersembunyi.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-left">
            
            {/* Card 1: Starter */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 p-7 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Uji Coba Campaign</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] mt-2 mb-1">Rp450.000</h3>
                <p className="text-xs text-neutral-400 mb-6">Paket Starter 1 Video</p>
                
                <ul className="space-y-3 text-xs text-neutral-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>1 Video TikTok / Reels UGC (30-60s)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Konsep Hook 3 Detik Pertama</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>1x Kesempatan Revisi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Garansi Rekening Bersama</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full py-2.5 rounded-full border border-neutral-300 text-xs font-semibold text-[#0D0C22] hover:bg-neutral-50 transition cursor-pointer"
                >
                  Pilih Paket Starter
                </button>
              </div>
            </div>

            {/* Card 2: Growth (HIGHLIGHTED BLACK CARD in reference!) */}
            <div className="bg-[#0D0C22] text-white rounded-2xl sm:rounded-3xl p-7 flex flex-col justify-between shadow-xl relative scale-102 border-2 border-[#155DFC]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#155DFC] text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Paling Populer
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Growth Campaign</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-1">Rp1.450.000</h3>
                <p className="text-xs text-neutral-400 mb-6">Paket Konten Lengkap Bulanan</p>
                
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#03ACFD] shrink-0" />
                    <span>3 Video Reels & TikTok UGC Pilihan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#03ACFD] shrink-0" />
                    <span>5 Foto Produk Studio Profesional</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#03ACFD] shrink-0" />
                    <span>Naskah & Storyboard Disetujui</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#03ACFD] shrink-0" />
                    <span>Lisensi Hak Cipta Komersial Penuh</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#03ACFD] shrink-0" />
                    <span>Prioritas Mediasi Escrow</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full py-3 rounded-full bg-[#155DFC] hover:bg-[#03ACFD] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Mulai Paket Growth
                </button>
              </div>
            </div>

            {/* Card 3: Scale-up */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 p-7 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Brand Scale-up</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] mt-2 mb-1">Rp3.500.000</h3>
                <p className="text-xs text-neutral-400 mb-6">Branding & Desain Lengkap</p>
                
                <ul className="space-y-3 text-xs text-neutral-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Identitas Logo, Palet Warna & Font</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Desain Kemasan Packaging / Box</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Desain Landing Page UI/UX Figma</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Dedicated Project Manager</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full py-2.5 rounded-full border border-neutral-300 text-xs font-semibold text-[#0D0C22] hover:bg-neutral-50 transition cursor-pointer"
                >
                  Pilih Paket Scale-up
                </button>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. FEATURE ROW WITH CREATIVE BOX (Smarter Notes style in reference) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-neutral-100">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Creative Package Visual */}
            <div className="lg:col-span-6 bg-gradient-to-br from-neutral-50 to-neutral-100/80 p-8 rounded-3xl border border-neutral-200/90 text-center relative overflow-hidden">
              <div className="w-20 h-20 mx-auto bg-[#0D0C22] rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold mb-4 shadow-sm">
                📦
              </div>
              <h4 className="text-base font-bold text-[#111827]">Paket Deliverable Siap Pakai</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                File master MP4 High-Res 4K, mockup 3D, source file Figma, dan hak penggunaan komersial.
              </p>
              
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-2.5 py-1 rounded-full bg-white border border-neutral-200">Video Reels</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-neutral-200">TikTok UGC</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-neutral-200">Foto Produk</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-neutral-200">Logo Vektor</span>
              </div>
            </div>

            {/* Right: 3 Features List with Custom Minimalist Line Icons */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div>
                <span className="text-[11px] font-bold text-[#155DFC] uppercase tracking-widest">Ekosistem Terpadu</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-[-0.03em] mt-1">
                  Satu Tempat untuk Menemukan, Mengelola & Membayar Kreator.
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-4 h-4 text-[#155DFC]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Pencarian Tepat Sesuai Niche</h4>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Temukan kreator yang spesifik menguasai industri FnB, kecantikan, fashion, hingga SaaS teknologi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4 text-[#155DFC]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Briefing Terstruktur & Kontrak Resmi</h4>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Format brief yang mudah dipahami kreator lengkap dengan perlindungan hak cipta komersial.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-[#155DFC]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Settlement Escrow Otomatis</h4>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Satu kali bayar aman ke rekening bersama. Dana baru diteruskan setelah Anda menyatakan pekerjaan selesai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 6. MINI PROJECT SHOWCASE (Clickable Cards with Lightbox Modal) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-neutral-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-left">
              <div>
                <span className="text-xs font-bold text-[#155DFC] uppercase tracking-wider">Portofolio Nyata</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1 tracking-[-0.02em]">Karya Unggulan Kreator</h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">Klik karya di bawah untuk melihat detail video dan feed karya lengkap.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/sign-in')}
                className="text-xs font-semibold text-[#155DFC] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Lihat Semua Karya di Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayProjects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  id={`guest-proj-${proj.id}`}
                  project={proj}
                  isSaved={false}
                  onToggleSave={() => {}}
                  onClick={() => setSelectedProject(proj)}
                />
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 7. HOW YOU TAKE ACTION? (Soft Sand CTA Card in reference) */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-20 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto bg-[#F4F4F6] rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center border border-neutral-200/80">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] tracking-[-0.03em] mb-3">
              Siap Mengembangkan Brand Anda?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed mb-8">
              Mulai kolaborasi pertamamu hari ini bersama ribuan kreator dan UMKM terkurasi di seluruh Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/sign-up')}
                className="w-full sm:w-auto h-11 px-7 rounded-full bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
              >
                Daftar Sebagai UMKM
              </button>
              <button
                type="button"
                onClick={() => router.push('/sign-in')}
                className="w-full sm:w-auto h-11 px-6 rounded-full bg-transparent hover:bg-neutral-200/60 text-[#0D0C22] text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Gabung Sebagai Kreator ›
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Lightbox / Project Detail Modal for Mini Showcase */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onViewCreatorProfile={(creator) => {
            setSelectedProject(null);
            router.push(`/creator/${creator.id}`);
          }}
          onGetInTouch={() => {
            setSelectedProject(null);
            router.push('/sign-in');
          }}
          allProjects={displayProjects}
        />
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
