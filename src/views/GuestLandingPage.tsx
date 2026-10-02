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
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star,
  PlayCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Lock,
  Clock,
  Award,
  Layers,
  Check
} from 'lucide-react';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

export const GuestLandingPage = () => {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Showcase 4 high-converting projects for guests
  const displayProjects = MOCK_FEED_PROJECTS.slice(0, 4);

  // FAQ items matching Anatomy LP Objection Handling
  const FAQS = [
    {
      q: 'Bagaimana jika hasil karya kreator tidak sesuai dengan brief?',
      a: 'Dana Anda 100% terlindungi di rekening bersama (escrow). Kreator memiliki kewajiban revisi sesuai kesepakatan awal. Jika hasil tetap tidak memenuhi standar brief yang disepakati, Anda berhak mengajukan mediasi atau pengembalian dana (refund).'
    },
    {
      q: 'Kapan dana saya dicairkan ke kreator?',
      a: 'Dana hanya akan diteruskan ke saldo kreator setelah Anda secara eksplisit mengklik tombol "Setujui & Selesaikan Proyek" di Collaboration Room setelah memeriksa hasil final.'
    },
    {
      q: 'Apakah portofolio dan rating kreator di sini asli?',
      a: 'Ya, seluruh skor karir, tingkat akurasi deadline, dan ulasan dihitung secara otomatis oleh sistem berdasarkan riwayat transaksi nyata di platform, bukan testimoni buatan sendiri.'
    },
    {
      q: 'Apakah saya bisa berkonsultasi sebelum memesan layanan?',
      a: 'Tentu. Anda dapat menggunakan fitur chat langsung untuk berdiskusi dengan kreator, meminta penawaran kustom, atau membuat brief terbuka agar kreator yang mengajukan proposal.'
    }
  ];

  // Authentic Indonesian Brands that partner & collaborate
  const BRAND_PARTNERS = [
    'Kopi Senja Nusantara',
    'GlowNatural ID',
    'SaaS Kita Maju',
    'Seblak Juara Pedas',
    'Batik Warisan Nusantara',
    'FitLife Activewear',
    'Hijab Al-Madina',
    'Sambal Bu Rudy Style'
  ];

  return (
    <div className="w-full overflow-x-clip bg-white text-[#0D0B0B] font-sans selection:bg-[#155DFC] selection:text-white">
      <main className="w-full">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Above the fold - Clean, Impeccable Typography) */}
        {/* ========================================================================= */}
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden border-b border-neutral-100">
          
          {/* Subtle Aesthetic Grid & Ambient Backlight */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-blue-100/40 via-indigo-50/30 to-blue-50/50 rounded-full blur-3xl pointer-events-none" />
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 40%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 40%, transparent 95%)'
              }}
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
            
            {/* Main Headline */}
            <ScrollReveal distance={20} duration={600} immediate>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[74px] font-extrabold text-[#0D0C22] tracking-tight leading-[1.08] max-w-5xl mx-auto">
                Temukan Talenta Kreatif, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#155DFC] via-[#03ACFD] to-[#155DFC] bg-clip-text text-transparent">
                  Wujudkan Karya Digital.
                </span>
              </h1>
            </ScrollReveal>
            
            {/* Value Proposition Description */}
            <ScrollReveal distance={20} duration={600} delay={80} immediate>
              <p className="text-base sm:text-lg md:text-xl text-[#475569] max-w-2xl mx-auto leading-relaxed font-normal">
                Platform kurasi karya dan marketplace jasa kreatif terpercaya untuk UMKM Indonesia. Dilengkapi proteksi pembayaran escrow, skor karir transparan, dan hasil kerja berkualitas.
              </p>
            </ScrollReveal>

            {/* Aligned Action Buttons */}
            <ScrollReveal distance={20} duration={600} delay={160} immediate>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
                <button
                  type="button"
                  onClick={() => router.push('/sign-up')}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white hover:bg-neutral-50 text-[#0D0C22] border border-neutral-300 hover:border-neutral-400 text-sm sm:text-base font-semibold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-neutral-400" />
                  <span>Pelajari Cara Kerja</span>
                </button>
              </div>
            </ScrollReveal>

            {/* Quick Proof Highlights */}
            <ScrollReveal distance={16} duration={600} delay={240}>
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Escrow Terlindungi
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" /> 1.200+ Kreator Terkurasi
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9/5 Rata-rata Kepuasan Klien
                </span>
              </div>
            </ScrollReveal>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. OFFICIAL PARTNERS & BRANDS (Running Banner with Real Logos) */}
        {/* ========================================================================= */}
        <section className="py-10 border-b border-neutral-100 bg-[#FDFDFD] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Didukung & Berkolaborasi Bersama Ekosistem Industri Digital Nasional
            </p>
          </div>

          {/* Official Partner Image Strip */}
          <div className="max-w-5xl mx-auto px-4 mb-8 flex justify-center">
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs w-full flex items-center justify-center">
              <img 
                src="/creatorin/partners.png" 
                alt="Partner Resmi: Jagoan Hosting, Komdigi, Maspion IT, Garuda Spark"
                className="max-h-12 sm:max-h-16 w-auto object-contain filter grayscale hover:grayscale-0 transition-all opacity-85 hover:opacity-100 duration-300"
              />
            </div>
          </div>

          {/* Continuous Brand Marquee */}
          <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee flex space-x-10 items-center min-w-full">
              {BRAND_PARTNERS.map((brand, i) => (
                <div 
                  key={`brand-1-${i}`} 
                  className="px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-600 whitespace-nowrap shadow-2xs flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{brand}</span>
                </div>
              ))}
            </div>
            <div className="animate-marquee flex space-x-10 items-center min-w-full absolute top-0 left-full">
              {BRAND_PARTNERS.map((brand, i) => (
                <div 
                  key={`brand-2-${i}`} 
                  className="px-5 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-600 whitespace-nowrap shadow-2xs flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. PROBLEM / AGITATION (Sering Kecewa Saat Mencari Kreator Lepas?) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                Tantangan Nyata UMKM
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D0C22] mt-4 tracking-tight leading-tight">
                Pernah kecewa saat mempekerjakan kreator lepas?
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base mt-4 leading-relaxed">
                Mencari kreator konten atau desainer lewat media sosial biasa sering kali berujung pada kerugian waktu dan anggaran promosi bisnis Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: AlertCircle,
                  title: 'Kualitas Tidak Sesuai Portofolio',
                  desc: 'Banyak portofolio tiruan yang terlihat memukau, namun hasil karya aslinya jauh dari ekspektasi dan tidak sesuai dengan karakter brand Anda.',
                  accent: 'border-rose-100 bg-rose-50/40 text-rose-600'
                },
                {
                  icon: Lock,
                  title: 'Risiko Pembayaran & Ghosting',
                  desc: 'Sudah transfer uang muka atau melunasi di awal, namun kreator tiba-tiba menghilang (ghosting) saat tenggat waktu campaign semakin mepet.',
                  accent: 'border-amber-100 bg-amber-50/40 text-amber-600'
                },
                {
                  icon: Clock,
                  title: 'Revisi Tak Terarah & Waktu Molor',
                  desc: 'Briefing berceceran di chat WhatsApp tanpa catatan revisi terstruktur. Proyek yang seharusnya selesai 5 hari molor hingga berminggu-minggu.',
                  accent: 'border-orange-100 bg-orange-50/40 text-orange-600'
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-7 sm:p-8 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${item.accent}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0D0C22] mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2 text-[11px] font-semibold text-rose-500">
                    <span>Masalah Sering Terjadi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. SOLUTION SECTION (Linear / Modern Dark Card Showcase) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-[#0D0C22] text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#155DFC]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
              
              {/* Left Column: Solution Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold text-[#03ACFD] uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">
                  Solusi Terpadu Creatorin
                </span>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Sistem proteksi mutlak <br />
                  <span className="bg-gradient-to-r from-[#03ACFD] to-[#155DFC] bg-clip-text text-transparent">
                    untuk setiap proyek kreatifmu.
                  </span>
                </h2>

                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Creatorin menggabungkan kurasi portofolio nyata, sistem rekening bersama (escrow otomatis), dan Collaboration Room terstruktur agar kolaborasi berjalan tanpa rasa khawatir.
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    {
                      title: 'Proteksi Pembayaran Rekening Bersama (Escrow)',
                      desc: 'Dana Anda aman tertahan di platform. Kreator baru menerima dana setelah Anda memeriksa dan menyetujui hasil akhir.'
                    },
                    {
                      title: 'Skor Karir & Portofolio Terverifikasi',
                      desc: 'Tinjau riwayat ketepatan deadline, rasio revisi, dan ulasan asli dari klien sebelum memutuskan untuk bekerjasama.'
                    },
                    {
                      title: 'Collaboration Room & Invoice Terstruktur',
                      desc: 'Pantau milestone pengerjaan, kirim brief, dan minta revisi terukur dalam satu ruang kerja digital khusus.'
                    }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-[#03ACFD] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Visual Escrow & Collaboration Mockup */}
              <div className="lg:col-span-6">
                <div className="bg-[#17192A] border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                  
                  {/* Mockup Card Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-neutral-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Status Pembayaran</p>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          Rp2.500.000 Terproteksi di Escrow
                        </h4>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                      Dana Aman
                    </span>
                  </div>

                  {/* Mockup Collaboration Timeline */}
                  <div className="py-6 space-y-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Milestone Pengerjaan
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-200">1. Moodboard & Script Video</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold">Selesai</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-200">2. Shooting & Draft Kasar</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold">Selesai</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          <span className="text-xs sm:text-sm font-bold text-white">3. Review Final & Penyerahan Master</span>
                        </div>
                        <span className="text-xs text-[#03ACFD] font-semibold">Menunggu Review</span>
                      </div>
                    </div>
                  </div>

                  {/* Mockup Release Action Button */}
                  <div className="pt-2">
                    <button 
                      type="button"
                      className="w-full py-3.5 rounded-xl bg-[#155DFC] hover:bg-[#03ACFD] text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Setujui Hasil & Rilis Pembayaran</span>
                    </button>
                    <p className="text-[11px] text-center text-neutral-400 mt-2">
                      Dana hanya akan ditransfer ke kreator setelah Anda menekan tombol di atas.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. TESTIMONIALS (Real Client Results & Authentic Feedback) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#155DFC] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Kisah Sukses UMKM
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D0C22] mt-4 tracking-tight">
                Dipercaya ratusan pemilik bisnis di seluruh Indonesia
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base mt-4 leading-relaxed">
                Hasil nyata dari UMKM yang telah meningkatkan penjualan dan citra visual brand mereka melalui Creatorin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  name: 'Bagus Wicaksono',
                  role: 'Founder & CMO, Kopi Senja Nusantara',
                  brand: 'Kopi Senja Nusantara',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                  quote: 'Sebelum menggunakan Creatorin, kami pusing mencari kreator TikTok yang konsisten dan tepat waktu. Lewat platform ini, 5 video UGC kami tembus total 800k views dalam 2 minggu pertama. Fitur Skor Karirnya sangat membantu!'
                },
                {
                  name: 'Clara Santoso',
                  role: 'Brand Manager, GlowNatural ID',
                  brand: 'GlowNatural ID',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                  quote: 'Sistem rekening bersama dan garansinya bikin belanja jasa kreatif jadi tenang. Portofolio kreator di sini bukan klaim asal-asalan karena sudah tersinkronisasi langsung dengan platform sosial aslinya.'
                },
                {
                  name: 'Rizky Pratama',
                  role: 'Head of Product, SaaS Kita Maju',
                  brand: 'SaaS Kita Maju',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
                  quote: 'Desainer UI/UX di Creatorin punya pemahaman kuat soal conversion rate dan systems thinking. Desain landing page kami selesai dalam 4 hari kerja dengan hasil revisi yang minimal.'
                }
              ].map((testi, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-7 sm:p-8 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* 5 Stars */}
                    <div className="flex gap-1 mb-5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-6 italic">
                      "{testi.quote}"
                    </p>
                  </div>

                  {/* Author Profile */}
                  <div className="flex items-center gap-3.5 pt-4 border-t border-neutral-100">
                    <img 
                      src={testi.avatar} 
                      alt={testi.name}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-black/10"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0D0C22]">{testi.name}</h4>
                      <p className="text-xs text-neutral-500">{testi.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 6. MINI PROJECT SHOWCASE (4 Selected Works with Modal Lightbox) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white border-t border-neutral-100">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold text-[#155DFC] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Portofolio Terverifikasi
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D0C22] mt-3 tracking-tight">
                  Karya Pilihan Kreator Indonesia
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  Klik karya untuk melihat detail video, feed carousel, dan profil kreator secara lengkap.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/sign-in')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#155DFC] hover:underline cursor-pointer shrink-0"
              >
                <span>Jelajahi Semua Karya di Feed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        {/* 7. HOW IT WORKS (Hanya 3 Langkah Mudah) */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-[#155DFC] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Alur Praktis
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D0C22] mt-4 tracking-tight">
                Hanya 3 Langkah Mudah
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base mt-4 leading-relaxed">
                Mulai dari briefing hingga penerimaan karya tanpa ribet dan bebas risiko.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: '01',
                  title: 'Pilih Kreator atau Pasang Brief',
                  desc: 'Jelajahi ribuan karya portofolio sesuai industri Anda atau posting brief pekerjaan secara gratis untuk menerima proposal penawaran.'
                },
                {
                  step: '02',
                  title: 'Amankan Pembayaran di Escrow',
                  desc: 'Lakukan pembayaran single-settlement yang aman ke rekening bersama. Dana disimpan aman dan tidak dicairkan sebelum Anda puas.'
                },
                {
                  step: '03',
                  title: 'Review Karya & Rilis Dana',
                  desc: 'Kelola revisi di Collaboration Room khusus. Setelah hasil karya disetujui, dana dicairkan ke kreator dan Anda menerima hak pakai penuh.'
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-2xl border border-neutral-200/90 shadow-2xs relative text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0D0C22] text-white flex items-center justify-center font-bold text-base mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#0D0C22] mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 8. OBJECTION HANDLING (FAQ Accordion - Anatomy LP Requirement) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white border-t border-neutral-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-full">
                Pertanyaan Umum
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D0C22] mt-4 tracking-tight">
                Punya pertanyaan sebelum memulai?
              </h2>
              <p className="text-neutral-500 text-sm mt-3">
                Kami siap membantu Anda memahami mekanisme perlindungan dan kolaborasi di platform Creatorin.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="border border-neutral-200 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0D0C22] hover:text-[#155DFC] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#155DFC]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4 animate-in fade-in duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 9. FINAL HIGH-CONVERSION CTA */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-[#0D0C22] via-[#1E293B] to-[#0D0C22] rounded-3xl p-10 sm:p-16 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight relative z-10">
                Siap Meningkatkan Penjualan Brand Anda?
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 mb-8 max-w-2xl mx-auto leading-relaxed relative z-10">
                Bergabunglah dengan ribuan UMKM dan talenta kreatif Indonesia. Dapatkan karya promosi digital berstandar industri dengan jaminan rekening bersama.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
                <button 
                  type="button"
                  onClick={() => router.push('/sign-up')} 
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] text-white font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Daftar Gratis Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => router.push('/sign-in')} 
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base transition-colors flex items-center justify-center cursor-pointer"
                >
                  Masuk ke Akun
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

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
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};
