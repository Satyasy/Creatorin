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
  Check, 
  ChevronRight, 
  Tag, 
  FileCheck, 
  RefreshCw, 
  Lock, 
  Award, 
  Zap, 
  MessageSquare,
  Search,
  Sliders,
  Sparkles,
  Command,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

// Real SVG Brand Logos for Running Marquee (Monochrome clean vectors)
const REAL_BRAND_LOGOS = [
  {
    name: 'Tokopedia',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 120 32" fill="currentColor">
        <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm-4 8a3 3 0 110 6 3 3 0 010-6zm8 0a3 3 0 110 6 3 3 0 010-6z" fill="#03AC0E"/>
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#333333">tokopedia</text>
      </svg>
    )
  },
  {
    name: 'Shopee',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 100 32" fill="currentColor">
        <path d="M12 4a5 5 0 00-5 5v1H4a2 2 0 00-2 2l2 14a2 2 0 002 2h12a2 2 0 002-2l2-14a2 2 0 00-2-2h-3V9a5 5 0 00-5-5zm-3 6a3 3 0 016 0v1H9v-1z" fill="#EE4D2D"/>
        <text x="26" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#333333">Shopee</text>
      </svg>
    )
  },
  {
    name: 'Gojek',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 95 32" fill="currentColor">
        <circle cx="12" cy="16" r="8" fill="#00AA13"/>
        <circle cx="12" cy="16" r="3.5" fill="#FFFFFF"/>
        <text x="26" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" fill="#111111">gojek</text>
      </svg>
    )
  },
  {
    name: 'Grab',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 85 32" fill="currentColor">
        <path d="M6 16c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="#00B14F" strokeWidth="3" fill="none"/>
        <path d="M12 16c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5-1.5 3.5-3 3.5" stroke="#00B14F" strokeWidth="2.5" fill="none"/>
        <text x="30" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15" fill="#00B14F">Grab</text>
      </svg>
    )
  },
  {
    name: 'Traveloka',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 115 32" fill="currentColor">
        <path d="M15 6c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm-1 5l6 4-6 4v-8z" fill="#0194F3"/>
        <text x="30" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="14" fill="#111111">traveloka</text>
      </svg>
    )
  },
  {
    name: 'Spotify',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 100 32" fill="currentColor">
        <circle cx="12" cy="16" r="9" fill="#1DB954"/>
        <path d="M7 13.5c3-1 7-.8 10 .8M8 16c2.5-.7 5.5-.5 8 .8M9 18.5c2-.5 4.5-.4 6.5.6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <text x="27" y="21" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" fill="#111111">Spotify</text>
      </svg>
    )
  },
  {
    name: 'Tiket.com',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 105 32" fill="currentColor">
        <circle cx="11" cy="16" r="8" fill="#FEDD00"/>
        <circle cx="11" cy="16" r="4.5" fill="#0064D2"/>
        <text x="25" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#0064D2">tiket<tspan fill="#FEDD00">.com</tspan></text>
      </svg>
    )
  },
  {
    name: 'Blibli',
    svg: (
      <svg className="h-5 w-auto" viewBox="0 0 85 32" fill="currentColor">
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
    <div className="w-full bg-[#F8F8F9] text-zinc-900 font-sans py-4 sm:py-6 px-2 sm:px-4 md:px-6 selection:bg-zinc-900 selection:text-white">
      
      {/* Outer Floating Canvas Card (Pure Monochrome Neo-Grotesque Style) */}
      <div className="max-w-[1240px] mx-auto bg-white rounded-3xl border border-[#EDEDEF] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Tepat Skala & Token: H1 48px font-medium tracking-[-0.035em]) */}
        {/* ========================================================================= */}
        <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-8 text-center overflow-hidden">
          
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            
            {/* Top Micro-Pill (• +100K active users style) */}
            <ScrollReveal distance={14} duration={450} immediate>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 text-[11px] font-medium tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>1.200+ Kreator Aktif & Terverifikasi</span>
              </div>
            </ScrollReveal>

            {/* Display Headline (font-medium 500-600, not heavy black!) */}
            <ScrollReveal distance={18} duration={500} delay={50} immediate>
              <h1 className="text-4xl md:text-5xl font-medium tracking-[-0.035em] leading-[1.1] text-zinc-900 max-w-xl mx-auto">
                Ide. Kreator. Kolaborasi. <br />
                Di mana pun bisnismu berkembang.
              </h1>
            </ScrollReveal>

            {/* Subhead Description (Strict Measure: max-w-[460px], text-zinc-500, leading-relaxed) */}
            <ScrollReveal distance={18} duration={500} delay={100} immediate>
              <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-[460px] mx-auto">
                Gabungkan ide promosi UMKM dengan talenta konten kreator terbaik Indonesia dalam satu platform cerdas—siap diproduksi kapan pun inspirasi datang.
              </p>
            </ScrollReveal>

            {/* Creative Mode Selector Pill (Style 01 ⤹ B I ≡ ● in reference) */}
            <ScrollReveal distance={14} duration={500} delay={150} immediate>
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/80 text-[11px] font-medium text-zinc-700 shadow-2xs">
                <span className="text-zinc-400 font-mono text-[10px]">Style 01</span>
                <span className="text-zinc-300">⤹</span>
                <span className="font-semibold text-zinc-900">B</span>
                <span className="italic font-serif text-zinc-700">I</span>
                <span className="text-zinc-400">≡</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 inline-block" />
              </div>
            </ScrollReveal>

            {/* Two Action Buttons (Skeuomorphic Subtle Buttons with shadow-[inset_0_1px_0_...]) */}
            <ScrollReveal distance={16} duration={500} delay={200} immediate>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/sign-up')}
                  className="w-full sm:w-auto rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mulai Kolaborasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('workspace-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto rounded-full bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-medium px-5 py-2.5 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Pelajari Cara Kerja</span>
                  <span className="text-zinc-400">›</span>
                </button>
              </div>
            </ScrollReveal>

            {/* Hero Artwork Frame with Mountain Outline & Siluet Logo Creatorin */}
            <ScrollReveal distance={20} duration={600} delay={250} immediate>
              <div className="mt-8 sm:mt-12 relative mx-auto max-w-3xl bg-[#FAFAFA] rounded-2xl border border-zinc-200/80 p-5 sm:p-7 overflow-hidden">
                
                {/* Monochrome Siluet Logo Creatorin Background (Direct from logo.svg) */}
                <div className="absolute right-6 -bottom-10 sm:right-10 sm:-bottom-8 w-60 sm:w-72 h-60 sm:h-72 pointer-events-none select-none opacity-15">
                  <svg className="w-full h-full" viewBox="0 0 34.0608 32.0987" fill="none">
                    <path 
                      d="M14.6734 0.0488397C18.7039 -0.282822 23.0405 1.08602 26.0613 3.81028C26.5593 4.25946 27.6061 5.08781 27.6893 5.75197C27.4144 6.16801 23.2771 9.3333 22.6847 9.63686C22.3105 9.68873 21.1521 8.52521 20.7703 8.27595C18.4935 6.78937 15.5157 6.44004 12.9225 7.2802C10.6474 8.03042 8.75853 9.64478 7.66348 11.7749C6.53453 14.0432 6.34872 16.6657 7.14658 19.0704C8.95844 24.552 15.4014 26.8895 20.3742 24.0882C20.973 23.7509 21.9305 22.8136 22.4582 22.6384C22.9989 22.6663 23.5835 23.2309 24.0215 23.5793C24.5722 23.9612 27.473 26.1816 27.5847 26.6874C27.5058 26.9069 27.3749 27.1226 27.2159 27.2925C24.5564 30.1343 20.9762 31.7154 17.1923 32.0416C13.0028 32.3977 8.84287 31.0799 5.62316 28.3767C2.3748 25.6087 0.369138 21.6568 0.0529795 17.4017C-0.2919 13.1385 1.05699 8.91102 3.80765 5.63477C6.63166 2.2969 10.3192 0.409821 14.6734 0.0488397Z" 
                      fill="#18181B"
                    />
                    <path 
                      d="M32.6835 8.85233C33.6489 8.76102 34.0639 9.38588 34.0608 10.2843C34.0475 14.1416 34.058 17.9999 34.055 21.8571C34.0548 22.1165 34.0134 22.5461 33.9078 22.7814C33.7895 23.0436 33.5727 23.2488 33.3042 23.3524C33.1384 23.4162 32.8513 23.4493 32.694 23.3928C31.0498 22.8015 29.2454 21.876 27.6298 21.1666C26.5103 20.6598 25.306 20.1396 24.2207 19.5768C25.1105 16.9299 24.9622 15.2492 24.2082 12.6704C25.2979 11.9441 28.0197 10.9228 29.3051 10.3275C30.2018 9.91205 31.7883 9.15612 32.6835 8.85233Z" 
                      fill="#18181B"
                    />
                  </svg>
                </div>

                {/* Minimalist Mountain Landscape Ink Artwork (Cutting out in hero bottom) */}
                <div className="relative z-10 flex flex-col items-center justify-center py-6">
                  <svg className="w-full max-w-md h-28 opacity-85 mx-auto" viewBox="0 0 500 120" fill="none">
                    {/* Mountain silhouette contour lines */}
                    <path d="M10 110L90 40L140 75L210 25L280 80L340 35L420 90L490 110" stroke="#D4D4D8" strokeWidth="1.5" fill="none"/>
                    <path d="M50 110L120 55L180 85L250 45L310 85L390 50L460 110" stroke="#E4E4E7" strokeWidth="1.5" fill="none"/>
                    <path d="M140 75L210 25L240 60L210 25" stroke="#A1A1AA" strokeWidth="1.5" fill="none"/>
                    <path d="M210 25L225 110M340 35L350 110M90 40L100 110" stroke="#E4E4E7" strokeWidth="0.8" strokeDasharray="3 3"/>
                  </svg>
                  
                  {/* Floating Micro-Pill Overlay */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <span className="px-3 py-1 rounded-full bg-white border border-zinc-200/90 text-[11px] font-medium text-zinc-700 shadow-2xs">
                      ✓ 100% Escrow Protection
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white border border-zinc-200/90 text-[11px] font-medium text-zinc-700 shadow-2xs">
                      ⭐ 4.9/5 Rata-rata Klien
                    </span>
                  </div>
                </div>

              </div>
            </ScrollReveal>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* TRUST BAR (No Setup Fee • 100% Legal Compliance style in reference) */}
        {/* ========================================================================= */}
        <section className="py-5 border-y border-[#EDEDEF] bg-[#FAFAFA]">
          <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-9 text-[12px] font-normal text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-400 flex items-center justify-center text-[9px]">○</span>
              <span>Bebas Biaya Setup</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-400 flex items-center justify-center text-[9px]">○</span>
              <span>100% Rekening Bersama (Escrow)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-400 flex items-center justify-center text-[9px]">○</span>
              <span>80%+ Pangkas Waktu Koordinasi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-400 flex items-center justify-center text-[9px]">○</span>
              <span>Garansi Revisi & Refund</span>
            </span>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* RUNNING MARQUEE LOGO VEKTOR ASLI (Monochrome Brand Vectors) */}
        {/* ========================================================================= */}
        <section className="py-6 border-b border-[#EDEDEF] bg-white overflow-hidden">
          <div className="relative flex overflow-x-hidden group items-center">
            
            <div className="animate-marquee flex space-x-12 items-center min-w-full shrink-0">
              {REAL_BRAND_LOGOS.map((brand, idx) => (
                <div key={`brand-a-${idx}`} className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-200 cursor-pointer">
                  {brand.svg}
                </div>
              ))}
            </div>

            <div className="animate-marquee flex space-x-12 items-center min-w-full shrink-0 absolute top-0 left-full">
              {REAL_BRAND_LOGOS.map((brand, idx) => (
                <div key={`brand-b-${idx}`} className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-200 cursor-pointer">
                  {brand.svg}
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. APPLICATION WINDOW ("Notes that work the way you think" in reference) */}
        {/* ========================================================================= */}
        <section id="workspace-section" className="py-16 sm:py-24 px-4 sm:px-8 border-b border-[#EDEDEF]">
          <div className="max-w-3xl mx-auto mb-10 text-left">
            <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900 mb-2">
              Notes that work the way you think.
            </h2>
            <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-md">
              Notes shouldn't feel messy or scattered. With Creatorin, every brief and deliverable flows into an organized system that adapts to your style and keeps you focused.
            </p>
          </div>

          {/* Desktop Application Frame Mockup (Persis di lp-desain-1.png) */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-zinc-200/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] overflow-hidden text-left">
            {/* Toolbar */}
            <div className="bg-[#FAFAFA] px-4 py-2.5 border-b border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[11px] font-medium text-zinc-600">
                <span className="font-mono text-zinc-400">Style 01</span>
                <span className="text-zinc-300">⤹</span>
                <span className="font-bold text-zinc-900">B</span>
                <span className="italic font-serif">I</span>
                <span className="text-zinc-400">≡</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block" />
              </div>
            </div>

            {/* Document / Content Area */}
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-600 font-normal">
                Brief Produksi 3x Video Reels TikTok UGC untuk peluncuran menu baru Kopi Susu Botolan Cold Brew Caramel. Konsep video mencakup first impression review, aesthetic pouring B-roll, dan ASMR unboxing. Seluruh aset raw footage dan hak cipta komersial diserahkan via Google Drive resmi.
              </p>
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-500 font-normal">
                Deliverable disepakati selesai dalam 5 hari kerja dengan proteksi single-settlement escrow Rp1.500.000. Revisi tahap 1 script disetujui tanpa kendala.
              </p>
              
              {/* Bottom Buttons inside Document */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-100">
                <button 
                  type="button" 
                  className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium px-3.5 py-1 transition cursor-pointer"
                >
                  AI summary
                </button>
                <button 
                  type="button" 
                  className="rounded-full bg-zinc-900 text-white text-[11px] font-medium px-4 py-1 flex items-center gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  <span>Save</span>
                  <span>↓</span>
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. 2X2 BENTO GRID ("Ideas. Notes. Clarity. Wherever your mind goes.") */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-[#EDEDEF]">
          <div className="max-w-3xl mx-auto mb-12 text-left">
            <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900">
              Ideas. Notes. Clarity. <br />
              Wherever your mind goes.
            </h2>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            
            {/* Card 1: Top Left (Keep it simple pill with -6deg rotation style) */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-zinc-200/80 flex flex-col justify-between">
              <div className="mb-8">
                {/* Floating pill badge with subtle -6deg rotation */}
                <div className="flex items-center justify-center py-4">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-medium shadow-xs transform -rotate-3">
                    <span>Keep it simple</span>
                  </div>
                </div>
                {/* Toolbar icons */}
                <div className="bg-white p-2 rounded-xl border border-zinc-200/80 flex items-center justify-around text-xs text-zinc-600 shadow-2xs mt-2">
                  <span className="cursor-pointer hover:text-black">⌂</span>
                  <span className="cursor-pointer hover:text-black">✉</span>
                  <span className="cursor-pointer hover:text-black">𝕏</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-medium">Book a Call</span>
                </div>
                <div className="h-6 flex items-center justify-center opacity-40">
                  <span className="text-zinc-400 font-serif italic text-lg">~</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                  Notely for Android / Rekening Bersama
                </h3>
                <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                  Take notes on the go with fast, secure sync across all your devices. Capture thoughts instantly and access them anytime.
                </p>
              </div>
            </div>

            {/* Card 2: Top Right (Note taken / folders used checklist style) */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-zinc-200/80 flex flex-col justify-between">
              <div className="space-y-2 mb-8">
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 flex items-center gap-2 text-xs font-medium text-zinc-700 shadow-2xs">
                  <span className="w-3.5 h-3.5 rounded-md border border-zinc-300 flex items-center justify-center text-[9px]">✓</span>
                  <span>Note taken</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 flex items-center gap-2 text-xs font-medium text-zinc-700 shadow-2xs">
                  <span className="w-3.5 h-3.5 rounded-md border border-zinc-300 flex items-center justify-center text-[9px]">📁</span>
                  <span>folders used</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 flex items-center gap-2 text-xs font-medium text-zinc-700 shadow-2xs">
                  <span className="w-3.5 h-3.5 rounded-md border border-zinc-300 flex items-center justify-center text-[9px]">👥</span>
                  <span>collaborated projects</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                  Notely for iOS / Skor Karir Terverifikasi
                </h3>
                <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                  Jot down notes, organize with folders, and collaborate on shared projects, all from your iPhone or iPad.
                </p>
              </div>
            </div>

            {/* Card 3: Bottom Left (Keyboard / Desktop hardware style) */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-zinc-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-center py-6 mb-4">
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">⌘</span>
                  <span className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">K</span>
                  <span className="w-14 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-mono shadow-2xs">Shift</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                  Notely for Windows / Linux
                </h3>
                <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                  Work smarter on desktop. Enjoy seamless syncing, keyboard shortcuts, and distraction-free writing.
                </p>
              </div>
            </div>

            {/* Card 4: Bottom Right (Concentric radar with Responsive & under 3 seconds style) */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-zinc-200/80 flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center py-4 mb-4 relative">
                <div className="w-24 h-24 rounded-full border border-zinc-300 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full border border-dashed border-zinc-300 flex items-center justify-center">
                    <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">⚡</span>
                  </div>
                  <span className="absolute -top-2 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-medium">
                    Responsive
                  </span>
                  <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-medium">
                    under 3 seconds
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                  Notely for Web / Responsif Cepat
                </h3>
                <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                  Access your notes anywhere with a responsive web app that loads in under 3 seconds.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. PRICING SECTION (Kiri & Kanan Dark Zinc-900, Tengah Elevated White!) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-[#EDEDEF] bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900 mb-2">
              Choose your pricing plan
            </h2>
            <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-md mx-auto">
              Keep your notes organized, clear, and easy to find. With Scribble, every thought flows into a system that adapts to your style, helping you stay focused and productive.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch text-left">
            
            {/* Card 1: Left Dark Card ($0.00 Free in reference) */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">$0.00</h3>
                <p className="text-xs text-zinc-400 font-medium mb-4">Free</p>
                
                <ul className="space-y-2 text-[12px] text-zinc-300 font-normal">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Create up to 50 notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Basic search & tagging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Access on one device</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full py-2 rounded-full bg-white text-zinc-900 text-xs font-medium hover:bg-zinc-100 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  Upgrade to premium
                </button>
              </div>
            </div>

            {/* Card 2: Center Elevated White Card ($69.00 Pro Most Popular in reference!) */}
            <div className="bg-white text-zinc-900 rounded-2xl p-7 border border-[#EDEDEF] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] scale-102 relative z-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-zinc-900">$69.00</h3>
                <p className="text-xs font-semibold text-zinc-900 mb-4">Pro (Most Popular)</p>
                
                <ul className="space-y-2.5 text-[12px] text-zinc-600 font-normal">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-900" />
                    <span>Unlimited notes & notebooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-900" />
                    <span>Advanced search & tagging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-900" />
                    <span>Real-time collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-900" />
                    <span>Cloud sync across devices</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-xs font-medium hover:bg-black transition shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  Upgrade to premium
                </button>
              </div>
            </div>

            {/* Card 3: Right Dark Card ($149.00 Vision Pro in reference) */}
            <div className="bg-zinc-900 text-white rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">$149.00</h3>
                <p className="text-xs text-zinc-400 font-medium mb-4">Vision Pro (Most Popular)</p>
                
                <ul className="space-y-2 text-[12px] text-zinc-300 font-normal">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Team collaboration & shared workspaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Admin controls & permissions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full py-2 rounded-full bg-white text-zinc-900 text-xs font-medium hover:bg-zinc-100 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                >
                  Upgrade to premium
                </button>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. FEATURE ROW WITH PARCEL BOX ("Smarter Notes. One Simple Space..." in ref) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-[#EDEDEF]">
          <div className="max-w-4xl mx-auto space-y-4 mb-10 text-left">
            <span className="text-[11px] font-medium tracking-tight px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 inline-block">
              earned by users today
            </span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900">
              Smarter Notes. One Simple Space to <br className="hidden sm:inline"/>
              Capture, Organize & Remember
            </h2>
            <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-xl">
              Simplify the way you take notes. Write down your thoughts instantly, organize them into clear categories, and find anything in seconds. Capture ideas in real time, stay focused with smart organization, and keep all your notes in one place that moves with you.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            
            {/* Left: Cardboard Box with Floating Cubes */}
            <div className="lg:col-span-6 bg-[#FAFAFA] p-8 rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center min-h-[260px] relative">
              <svg className="w-36 h-36 opacity-80" viewBox="0 0 200 200" fill="none">
                {/* Isometric cardboard box */}
                <polygon points="100,50 170,85 100,120 30,85" fill="#E4E4E7" stroke="#A1A1AA" strokeWidth="1.5"/>
                <polygon points="30,85 100,120 100,175 30,140" fill="#D4D4D8" stroke="#A1A1AA" strokeWidth="1.5"/>
                <polygon points="170,85 100,120 100,175 170,140" fill="#C4C4C8" stroke="#A1A1AA" strokeWidth="1.5"/>
                {/* Floating cubes */}
                <rect x="50" y="30" width="20" height="20" rx="4" fill="#FFFFFF" stroke="#71717A" strokeWidth="1.5"/>
                <text x="56" y="44" fontSize="10" fill="#71717A" fontFamily="monospace">◫</text>
                <rect x="130" y="25" width="22" height="22" rx="4" fill="#FFFFFF" stroke="#71717A" strokeWidth="1.5"/>
                <text x="136" y="40" fontSize="11" fill="#71717A" fontFamily="monospace">⌂</text>
                <rect x="90" y="10" width="18" height="18" rx="4" fill="#FFFFFF" stroke="#71717A" strokeWidth="1.5"/>
                <text x="94" y="23" fontSize="10" fill="#71717A" fontFamily="monospace">✓</text>
              </svg>
            </div>

            {/* Right: 3 Vertical Feature Rows with Custom Outlined Icons */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg border border-zinc-300 flex items-center justify-center text-xs shrink-0 mt-0.5">◫</span>
                <div>
                  <h4 className="text-sm font-semibold tracking-[-0.015em] text-zinc-900">Smart Note Capture</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Quickly jot down ideas, tasks, and reminders without losing flow. Add tags, folders, or checklists to keep everything in order.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg border border-zinc-300 flex items-center justify-center text-xs shrink-0 mt-0.5">⊕</span>
                <div>
                  <h4 className="text-sm font-semibold tracking-[-0.015em] text-zinc-900">Adaptive Organization</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Your notes grow with you. Use smart search, categories, and links to connect ideas and find what you need instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg border border-zinc-300 flex items-center justify-center text-xs shrink-0 mt-0.5">⛯</span>
                <div>
                  <h4 className="text-sm font-semibold tracking-[-0.015em] text-zinc-900">Simple & Flexible</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    A tool that fits your style—whether for study, work, or personal journaling. Take notes your way, on the fly, and access them anytime.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 6. MINI SHOWCASE KARYA (Clickable Lightbox Detail Modal) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-[#EDEDEF]">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.025em] text-zinc-900">Karya Unggulan Kreator</h3>
                <p className="text-xs text-zinc-500 mt-1">Klik karya di bawah untuk melihat preview detail video dan profil kreator.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/sign-in')}
                className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Lihat Semua Karya di Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* 7. FINAL CTA CARD (Soft Sand / Light Gray Card "How You Take Notes?") */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-20 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto bg-[#F8F8F9] rounded-2xl p-8 sm:p-12 text-center border border-zinc-200/80">
            <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] text-zinc-900 mb-2">
              How You Take Notes? / Siap Memulai?
            </h2>
            <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500 max-w-md mx-auto mb-6">
              Start Using Notely To Capture Your Thoughts Instantly And Keep Them Organized Effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/sign-up')}
                className="w-full sm:w-auto rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition cursor-pointer"
              >
                Get Started Free
              </button>
              <button
                type="button"
                onClick={() => router.push('/sign-in')}
                className="w-full sm:w-auto text-xs font-medium text-zinc-700 hover:text-black transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Get Started Free</span>
                <span>›</span>
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Lightbox / Project Detail Modal */}
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
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  );
};
