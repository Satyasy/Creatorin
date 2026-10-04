'use client';

import React from 'react';
import { ArrowRight, BriefcaseBusiness, Check, Coins, GraduationCap, MessageSquare, Palette, ShieldCheck } from 'lucide-react';
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

      {/* Right Column: Visual Creative Assets Showcase (Replaces old text card) */}
      <div className="relative flex items-center justify-center lg:justify-end">
        {/* Ambient Glow & Decorative Grid */}
        <div className="absolute -top-12 -right-12 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/20 via-sky-400/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/15 via-blue-600/15 to-transparent blur-3xl pointer-events-none" />

        {/* Layered Showcase Stack */}
        <div className="relative w-full max-w-[480px]">
          {/* Main Visual Card */}
          <div className="group relative rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_50px_rgba(13,12,34,0.12)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_25px_60px_rgba(21,93,252,0.18)]">
            {/* Visual Cover Header */}
            <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop" 
                alt="Brand Identity & Packaging Design Showcase"
                className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Category & Verified Pill */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-white">
                  Identitas Brand & Kemasan
                </span>
                <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white flex items-center gap-1 shadow-sm">
                  <Check className="h-3 w-3 stroke-[3]" /> Terverifikasi
                </span>
              </div>

              {/* Bottom Project Label on Cover */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between text-white">
                <div>
                  <p className="text-xs text-slate-300 font-medium">Mitra UMKM Kopi Specialty</p>
                  <h3 className="text-lg font-bold tracking-tight">Kopi Lereng Nusantara</h3>
                </div>
                <div className="rounded-xl bg-white/20 backdrop-blur-md px-2.5 py-1 text-right">
                  <span className="text-[10px] text-slate-200 block uppercase font-mono">Rating</span>
                  <span className="text-sm font-bold text-amber-300">★ 4.9 / 5.0</span>
                </div>
              </div>
            </div>

            {/* Micro Specs Bar under Image */}
            <div className="mt-4 flex items-center justify-between px-2 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  CR
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">Aditya Pratama</span>
                  <span className="text-[11px] text-slate-500">Motion & Brand Designer</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">Career Score</span>
                <span className="font-bold text-blue-600 text-sm">98 / 100</span>
              </div>
            </div>
          </div>

          {/* Floating Pill Card: Escrow Guarantee (Left Bottom) */}
          <div className="absolute -bottom-6 -left-6 z-20 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-900">Dana Aman dalam Escrow</span>
              <span className="block text-[11px] text-slate-500">Otomatis rilis saat hasil disetujui</span>
            </div>
          </div>

          {/* Floating Pill Card: On-Time Delivery (Right Top) */}
          <div className="absolute -top-5 -right-5 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-4 py-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">100% On-Time Completion</span>
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
