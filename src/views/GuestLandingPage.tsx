'use client';

import React from 'react';
import { ArrowRight, BriefcaseBusiness, Check, Coins, GraduationCap, MessageSquare, Palette, ShieldCheck, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const GuestLandingPage = () => {
  const router = useRouter();
  return <div className="bg-white text-[var(--ink)]">
    <section className="overflow-hidden border-b border-[var(--outline)]"><div className="container-creatorin grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-[.95fr_1.05fr] lg:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">Marketplace kerja kreatif untuk UMKM Indonesia</p>
        <h1 className="mt-4 text-[clamp(2.75rem,6vw,4rem)] font-semibold leading-[1.08] tracking-tight">
          Temukan creator. Bayar aman. Selesaikan proyek di satu tempat.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#55576A]">
          Creatorin menghubungkan UMKM dengan talenta desain dan konten. Brief, pesan, invoice, escrow, revisi, dan hasil akhir tersimpan dalam alur kerja yang jelas.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button 
            onClick={() => router.push('/sign-up')} 
            className="h-12 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-[#1248C7] hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Buat akun Creatorin
          </button>
          <button 
            onClick={() => router.push('/explore/services')} 
            className="h-12 rounded-xl border border-[#B7BBC9] bg-white px-6 text-sm font-semibold text-[#0D0C22] hover:border-[#A9C3FF] hover:bg-[#E8F0FF] transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Lihat layanan creator
          </button>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#55576A]">
          <span className="flex items-center gap-2 font-medium"><ShieldCheck className="h-5 w-5 text-primary" /> Koin ditahan di escrow</span>
          <span className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-[#16803C]" /> Revisi tercatat di invoice</span>
        </div>
      </div>

      {/* Right Column: Layered Abstract Shapes & Platform Metrics (Option A: Pure Vector & Glassmorphic Architecture, No Photos, No Live Dots) */}
      <div className="relative flex items-center justify-center lg:justify-end w-full">
        {/* Ambient Gradient Mesh Background Glows */}
        <div className="absolute -top-14 -right-14 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-500/20 via-sky-400/20 to-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-600/15 to-transparent blur-3xl pointer-events-none" />

        {/* Outer Visual Frame */}
        <div className="relative w-full max-w-[560px] xl:max-w-[600px] flex flex-col gap-4">
          
          {/* Main Glassmorphic Container Card */}
          <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-7 shadow-[0_20px_50px_rgba(21,93,252,0.08)] backdrop-blur-xl transition-all duration-300">
            
            {/* Header Protocol Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Protokol Escrow & Kolaborasi</h3>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200/60 uppercase font-mono">
                      Smart Contract
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Transparansi alur kerja UMKM & talenta terverifikasi</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700">
                <Check className="h-3 w-3 text-blue-600 stroke-[3]" />
                <span>Terverifikasi</span>
              </div>
            </div>

            {/* Visual Vector Metric: Dynamic Area Chart & Delivery Velocity */}
            <div className="my-5 rounded-2xl bg-gradient-to-b from-slate-50/80 to-blue-50/30 p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Penyelesaian Sesuai Brief & Tenggat</span>
                  <span className="text-base font-bold text-slate-900">99.4% Skor Ketepatan Hasil</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    <TrendingUp className="h-3.5 w-3.5" /> +18.2% Kuartal Ini
                  </span>
                </div>
              </div>

              {/* Pure SVG Geometric Waveform & Graph */}
              <div className="h-24 w-full">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroMetricGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#155DFC" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#155DFC" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="0" y1="65" x2="400" y2="65" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                  {/* Area Fill */}
                  <path 
                    d="M 0 85 C 70 80, 110 55, 170 50 C 230 45, 280 25, 340 20 C 370 18, 390 12, 400 10 L 400 100 L 0 100 Z" 
                    fill="url(#heroMetricGradient)" 
                  />
                  {/* Primary Line */}
                  <path 
                    d="M 0 85 C 70 80, 110 55, 170 50 C 230 45, 280 25, 340 20 C 370 18, 390 12, 400 10" 
                    fill="none" 
                    stroke="#155DFC" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                  {/* Milestone Nodes */}
                  <circle cx="170" cy="50" r="4" fill="#FFFFFF" stroke="#155DFC" strokeWidth="2.5" />
                  <circle cx="340" cy="20" r="4" fill="#FFFFFF" stroke="#155DFC" strokeWidth="2.5" />
                  <circle cx="400" cy="10" r="4" fill="#155DFC" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* 4-Stage Architectural Pipeline (Pure CSS & Icons, No Dots) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Siklus Transaksi & Verifikasi Hasil
              </span>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { step: '01', title: 'Brief Sah', desc: 'Ruang lingkup terkunci' },
                  { step: '02', title: 'Escrow Aktif', desc: 'Koin diamankan sistem' },
                  { step: '03', title: 'Produksi', desc: 'Revisi terkuota jelas' },
                  { step: '04', title: 'Pelepasan', desc: 'Hasil disetujui UMKM' },
                ].map((item) => (
                  <div 
                    key={item.step} 
                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-blue-600">{item.step}</span>
                      <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900 leading-snug">{item.title}</span>
                    <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dual Accent Stat Cards (Balanced Width & Height, No Dots) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Stat Pill 1: Escrow Protection */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-lg shadow-slate-900/5 backdrop-blur-md">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 font-bold shrink-0 border border-blue-200/60">
                <Coins className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate">Proteksi Dana Escrow</span>
                <span className="block text-[11px] text-slate-500 truncate">Rilis otomatis saat hasil disetujui</span>
              </div>
            </div>

            {/* Stat Pill 2: Career Score & Validation */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-lg shadow-slate-900/5 backdrop-blur-md">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 font-bold shrink-0 border border-indigo-200/60">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate">Talenta Terkurasi & SMK</span>
                <span className="block text-[11px] text-slate-500 truncate">Validasi portofolio & Career Score 98</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div></section>

    <section className="container-creatorin py-16 sm:py-20"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-sm font-semibold text-primary">Dua jalan menuju proyek</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl sm:leading-[56px]">Mulai dari layanan atau brief terbuka.</h2><p className="mt-5 text-base leading-7 text-[#55576A]">UMKM dapat memilih paket creator yang sudah jelas, atau menulis kebutuhan dan menilai proposal yang masuk.</p></div><div className="grid gap-5 sm:grid-cols-2"><article className="rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,.06)]"><Palette className="h-7 w-7 text-primary" /><h3 className="mt-8 text-2xl font-semibold">Pilih layanan creator</h3><p className="mt-3 leading-7 text-[#55576A]">Bandingkan portofolio, paket, harga koin, durasi, rating, dan Career Score. Mulai pesan untuk membahas kebutuhan.</p><button onClick={() => router.push('/explore/services')} className="mt-5 flex min-h-11 items-center gap-2 text-sm font-semibold text-primary cursor-pointer hover:gap-3 transition-all active:scale-[0.98]">Buka katalog layanan <ArrowRight className="h-4 w-4" /></button></article><article className="rounded-2xl bg-[#0D0C22] p-6 text-white"><BriefcaseBusiness className="h-7 w-7 text-[#8CB7FF]" /><h3 className="mt-8 text-2xl font-semibold text-white">Terbitkan brief proyek</h3><p className="mt-3 leading-7 text-[#DDE0E8]">Tulis output, anggaran koin, tenggat, dan konteks usaha. Creator melamar dengan pesan dan penawaran yang dapat dibandingkan.</p><button onClick={() => router.push('/briefs')} className="mt-5 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8CB7FF] cursor-pointer hover:gap-3 transition-all active:scale-[0.98]">Lihat brief proyek <ArrowRight className="h-4 w-4" /></button></article></div></div></section>

    <section className="bg-[#F8F9FC] py-16 sm:py-20"><div className="container-creatorin"><div className="max-w-2xl"><p className="text-sm font-semibold text-primary">Alur pembayaran dan hasil</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl sm:leading-[56px]">Setiap keputusan meninggalkan rekam jejak.</h2></div><div className="mt-10 grid gap-0 border-y border-[var(--outline)] md:grid-cols-4">{[
      { icon: MessageSquare, title: 'Sepakati pekerjaan', body: 'UMKM dan Creator menyelaraskan ruang lingkup lewat pesan.' },
      { icon: Coins, title: 'Bayar dengan koin', body: 'Invoice mencatat harga, tenggat, dan jumlah revisi.' },
      { icon: ShieldCheck, title: 'Kerjakan dalam escrow', body: 'Koin ditahan selama hasil belum disetujui UMKM.' },
      { icon: Check, title: 'Selesaikan dan nilai', body: 'Dana dilepas, proyek masuk riwayat, lalu UMKM memberi rating.' },
    ].map(({ icon: Icon, title, body }, index) => <article key={title} className="border-b border-[var(--outline)] py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><div className="flex items-center justify-between"><Icon className="h-6 w-6 text-primary" /><span className="text-sm font-semibold text-[#6F7285]">0{index + 1}</span></div><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#55576A]">{body}</p></article>)}</div></div></section>

    <section className="container-creatorin py-16 sm:py-20"><div className="grid overflow-hidden rounded-[20px] border border-[#A9C3FF] lg:grid-cols-2"><div className="bg-[#155DFC] p-8 text-white sm:p-12"><GraduationCap className="h-8 w-8" /><h2 className="mt-10 text-3xl font-semibold text-white sm:text-4xl">Sekolah dapat memantau pengalaman kerja nyata siswa.</h2><p className="mt-4 max-w-xl leading-7 text-[#E8F0FF]">Operator memverifikasi afiliasi, melihat aktivitas, proyek selesai, rating, Career Score, dan koin yang diperoleh. Isi chat dan file proyek tetap privat.</p><button onClick={() => router.push('/school/smk-kreatif-indonesia')} className="mt-7 min-h-12 rounded-xl bg-white px-6 text-sm font-semibold text-primary cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]">Lihat Mitra Sekolah</button></div><div className="bg-[#E8F0FF] p-8 sm:p-12"><p className="text-sm font-semibold text-primary">Batas akses sekolah</p><ul className="mt-6 space-y-4 text-sm text-[#0D2A75]"><li className="flex gap-3"><Check className="h-5 w-5 shrink-0" /> Melihat status dan metrik proyek siswa</li><li className="flex gap-3"><Check className="h-5 w-5 shrink-0" /> Memilih karya selesai untuk showcase sekolah</li><li className="flex gap-3"><Check className="h-5 w-5 shrink-0" /> Memverifikasi permintaan afiliasi siswa</li><li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0" /> Tidak dapat membuka chat atau file kolaborasi</li></ul></div></div></section>

    <section className="border-t border-[var(--outline)] bg-[#0D0C22] py-16 text-white"><div className="container-creatorin flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><h2 className="text-3xl font-semibold text-white sm:text-5xl sm:leading-[56px]">Mulai dari kebutuhan yang benar-benar ada.</h2><p className="mt-4 text-[#DDE0E8]">Buat brief sebagai UMKM atau lengkapi profil sebagai Creator.</p></div><div className="flex flex-col gap-3 sm:flex-row"><button onClick={() => router.push('/sign-up')} className="h-12 rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-[#1248C7] transition-all cursor-pointer active:scale-[0.98]">Buat akun</button><button onClick={() => router.push('/explore')} className="h-12 rounded-xl border border-white/30 px-6 text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer active:scale-[0.98]">Jelajahi Creatorin</button></div></div></section>
  </div>;
};
