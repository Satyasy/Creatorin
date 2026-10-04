'use client';

import React from 'react';
import { ArrowRight, BriefcaseBusiness, Check, Coins, GraduationCap, MessageSquare, Palette, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const GuestLandingPage = () => {
  const router = useRouter();

  return (
    <div className="bg-white text-[var(--ink)]">
      {/* Hero Section */}
      <section className="overflow-hidden border-b border-[var(--outline)]">
        <div className="container-creatorin grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-[.95fr_1.05fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Marketplace kerja kreatif untuk UMKM Indonesia</p>
            <h1 className="mt-4 text-[clamp(2.75rem,6vw,4rem)] font-semibold leading-[1.08]">
              Temukan creator. Bayar aman. Selesaikan proyek di satu tempat.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#55576A]">
              Creatorin menghubungkan UMKM dengan talenta desain dan konten. Brief, pesan, invoice, escrow, revisi, dan hasil akhir tersimpan dalam alur kerja yang jelas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button 
                onClick={() => router.push('/sign-up')} 
                className="h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-[#1248C7]"
              >
                Buat akun Creatorin
              </button>
              <button 
                onClick={() => router.push('/jelajah/layanan')} 
                className="h-12 rounded-xl border border-[#B7BBC9] bg-white px-5 text-sm font-semibold hover:border-[#A9C3FF] hover:bg-[#E8F0FF]"
              >
                Lihat layanan creator
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#55576A]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Koin ditahan di escrow
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#16803C]" /> Revisi tercatat di invoice
              </span>
            </div>
          </div>

          {/* Authentic Collaboration Room Mockup */}
          <div className="relative">
            <div className="rounded-[20px] border border-[#A9C3FF] bg-[#E8F0FF] p-4 shadow-[0_16px_40px_rgba(13,12,34,.14)] sm:p-6">
              <div className="rounded-2xl border border-[var(--outline)] bg-white p-5">
                <div className="flex flex-col justify-between gap-3 border-b border-[var(--outline)] pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold text-primary">Collaboration Room</p>
                    <h2 className="mt-1 text-xl font-semibold">Identitas visual Kopi Lereng</h2>
                  </div>
                  <span className="w-fit rounded-full bg-[#E1F6FF] px-3 py-1 text-xs font-semibold text-[#07557D]">
                    Koin dalam escrow
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  {['Brief disepakati', 'Produksi', 'Tinjauan hasil', 'Selesai'].map((step, index) => (
                    <div 
                      key={step} 
                      className={`rounded-lg border p-3 ${index === 2 ? 'border-primary bg-[#E8F0FF]' : 'border-[var(--outline)] bg-[#F8F9FC]'}`}
                    >
                      <span className="text-xs font-semibold text-[#55576A]">0{index + 1}</span>
                      <p className="mt-2 text-sm font-semibold">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-[#F8F9FC] p-4">
                  <p className="text-sm font-semibold">Hasil versi 2 siap ditinjau</p>
                  <p className="mt-1 text-sm text-[#55576A]">UMKM dapat menyetujui hasil atau memakai sisa kuota revisi.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="min-h-11 rounded-lg border border-[#B7BBC9] bg-white px-4 text-sm font-semibold">
                      Minta revisi
                    </button>
                    <button className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white">
                      Setujui hasil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="container-creatorin py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold text-primary">Dua jalan menuju proyek</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl sm:leading-[56px]">
              Mulai dari layanan atau brief terbuka.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#55576A]">
              UMKM dapat memilih paket creator yang sudah jelas, atau menulis kebutuhan dan menilai proposal yang masuk.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-[var(--outline)] bg-white p-6 shadow-[0_1px_2px_rgba(13,12,34,.06)]">
              <Palette className="h-7 w-7 text-primary" />
              <h3 className="mt-8 text-2xl font-semibold">Pilih layanan creator</h3>
              <p className="mt-3 leading-7 text-[#55576A]">
                Bandingkan portofolio, paket, harga koin, durasi, rating, dan Career Score. Mulai pesan untuk membahas kebutuhan.
              </p>
              <button 
                onClick={() => router.push('/jelajah/layanan')} 
                className="mt-5 flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                Buka katalog layanan <ArrowRight className="h-4 w-4" />
              </button>
            </article>
            <article className="rounded-2xl bg-[#0D0C22] p-6 text-white">
              <BriefcaseBusiness className="h-7 w-7 text-[#8CB7FF]" />
              <h3 className="mt-8 text-2xl font-semibold text-white">Terbitkan brief proyek</h3>
              <p className="mt-3 leading-7 text-[#DDE0E8]">
                Tulis output, anggaran koin, tenggat, dan konteks usaha. Creator melamar dengan pesan dan penawaran yang dapat dibandingkan.
              </p>
              <button 
                onClick={() => router.push('/briefs')} 
                className="mt-5 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#8CB7FF]"
              >
                Lihat brief proyek <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-[#F8F9FC] py-16 sm:py-20">
        <div className="container-creatorin">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Alur pembayaran dan hasil</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl sm:leading-[56px]">
              Setiap keputusan meninggalkan rekam jejak.
            </h2>
          </div>
          <div className="mt-10 grid gap-0 border-y border-[var(--outline)] md:grid-cols-4">
            {[
              { icon: MessageSquare, title: 'Sepakati pekerjaan', body: 'UMKM dan Creator menyelaraskan ruang lingkup lewat pesan.' },
              { icon: Coins, title: 'Bayar dengan koin', body: 'Invoice mencatat harga, tenggat, dan jumlah revisi.' },
              { icon: ShieldCheck, title: 'Kerjakan dalam escrow', body: 'Koin ditahan selama hasil belum disetujui UMKM.' },
              { icon: Check, title: 'Selesaikan dan nilai', body: 'Dana dilepas, proyek masuk riwayat, lalu UMKM memberi rating.' },
            ].map(({ icon: Icon, title, body }, index) => (
              <article 
                key={title} 
                className="border-b border-[var(--outline)] py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-semibold text-[#6F7285]">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#55576A]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* School Section */}
      <section className="container-creatorin py-16 sm:py-20">
        <div className="grid overflow-hidden rounded-[20px] border border-[#A9C3FF] lg:grid-cols-2">
          <div className="bg-[#155DFC] p-8 text-white sm:p-12">
            <GraduationCap className="h-8 w-8" />
            <h2 className="mt-10 text-3xl font-semibold text-white sm:text-4xl">
              Sekolah dapat memantau pengalaman kerja nyata siswa.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[#E8F0FF]">
              Operator memverifikasi afiliasi, melihat aktivitas, proyek selesai, rating, Career Score, dan koin yang diperoleh. Isi chat dan file proyek tetap privat.
            </p>
            <button 
              onClick={() => router.push('/school/smk-kreatif-indonesia')} 
              className="mt-7 min-h-12 rounded-xl bg-white px-5 text-sm font-semibold text-primary"
            >
              Lihat Mitra Sekolah
            </button>
          </div>
          <div className="bg-[#E8F0FF] p-8 sm:p-12">
            <p className="text-sm font-semibold text-primary">Batas akses sekolah</p>
            <ul className="mt-6 space-y-4 text-sm text-[#0D2A75]">
              <li className="flex gap-3"><Check className="h-5 w-5 shrink-0" /> Melihat status dan metrik proyek siswa</li>
              <li className="flex gap-3"><Check className="h-5 w-5 shrink-0" /> Memilih karya selesai untuk showcase sekolah</li>
              <li className="flex gap-3"><Check className="h-5 w-5 shrink-0" /> Memverifikasi permintaan afiliasi siswa</li>
              <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0" /> Tidak dapat membuka chat atau file kolaborasi</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[var(--outline)] bg-[#0D0C22] py-16 text-white">
        <div className="container-creatorin flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-white sm:text-5xl sm:leading-[56px]">
              Mulai dari kebutuhan yang benar-benar ada.
            </h2>
            <p className="mt-4 text-[#DDE0E8]">
              Buat brief sebagai UMKM atau lengkapi profil sebagai Creator.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button 
              onClick={() => router.push('/sign-up')} 
              className="h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-[#1248C7]"
            >
              Buat akun
            </button>
            <button 
              onClick={() => router.push('/jelajah/layanan')} 
              className="h-12 rounded-xl border border-white/30 px-5 text-sm font-semibold hover:bg-white/10"
            >
              Jelajahi Creatorin
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
