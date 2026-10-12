'use client';

import React from 'react';
import { ArrowRight, BriefcaseBusiness, Check, Coins, GraduationCap, MessageSquare, Palette, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';

export const GuestLandingPage = () => {
  const router = useRouter();

  return (
    <div className="bg-white text-[var(--ink)]">
      {/* Symmetrical Hero Section matching Figma 4816-18898 */}
      <HomeHeroSection
        onExploreClick={() => router.push('/jelajah/kreator')}
        secondaryText="Bergabung Creatorin"
        secondaryHref="/sign-up"
      />

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
