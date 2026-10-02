'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { ProjectCard } from '@/components/common/ProjectCard';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star,
  PlayCircle
} from 'lucide-react';

export const GuestLandingPage = () => {
  const router = useRouter();

  // Mini showcase for guests (limit to 4 projects)
  const displayProjects = MOCK_FEED_PROJECTS.slice(0, 4);

  return (
    <div className="w-full overflow-x-clip bg-white text-[#0D0B0B] font-sans selection:bg-[#155DFC] selection:text-white">
      <main className="w-full">
        
        {/* 1. Hero Section (Above the fold) */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden border-b border-neutral-100">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <ScrollReveal distance={20} duration={600} immediate>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-sm font-semibold mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Cara Baru UMKM Menemukan Kreator
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-[72px] font-bold text-[#0D0C22] tracking-tight leading-[1.1] max-w-4xl mx-auto">
                Kolaborasi Kreatif <br className="hidden sm:block" />
                <span className="text-[#155DFC]">Lebih Aman & Mudah</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal distance={20} duration={600} delay={100} immediate>
              <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                Platform terpercaya yang mempertemukan UMKM dengan kreator konten, desainer, dan freelancer terbaik di Indonesia dengan sistem pembayaran aman (escrow).
              </p>
            </ScrollReveal>

            <ScrollReveal distance={20} duration={600} delay={200} immediate>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => router.push('/sign-in')}
                  className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[#155DFC] hover:bg-[#03ACFD] text-white text-base font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Mulai Sekarang <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto h-14 px-8 rounded-xl bg-white hover:bg-neutral-50 text-[#0D0C22] border border-neutral-200 text-base font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5 text-neutral-400" /> Cara Kerja
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Companies (Running Banner) */}
        <section className="py-10 border-b border-neutral-100 bg-neutral-50/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
            <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase">Dipercaya oleh berbagai brand berkembang</p>
          </div>
          <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee flex space-x-12 items-center min-w-full">
              {/* Dummy Logos */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`logo1-${i}`} className="text-2xl font-bold text-neutral-300 whitespace-nowrap opacity-60">Brand {i + 1}</div>
              ))}
            </div>
            <div className="animate-marquee flex space-x-12 items-center min-w-full absolute top-0 left-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`logo2-${i}`} className="text-2xl font-bold text-neutral-300 whitespace-nowrap opacity-60">Brand {i + 1}</div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Problem / Agitation */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal distance={20} duration={600}>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0D0C22] mb-12 tracking-tight">
                Sering kecewa saat mencari kreator lepas?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Kualitas Tidak Sesuai", desc: "Portofolio bagus, tapi hasil kerja aslinya jauh dari ekspektasi dan butuh banyak revisi." },
                  { title: "Pembayaran Berisiko", desc: "Sudah bayar DP penuh, tapi kreator menghilang atau telat mengirimkan hasil karya." },
                  { title: "Komunikasi Sulit", desc: "Briefing berantakan karena menggunakan platform chat biasa yang tidak terstruktur." }
                ].map((item, idx) => (
                  <div key={idx} className="p-8 rounded-2xl bg-neutral-50 border border-neutral-100 text-left">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[#0D0C22] mb-3">{item.title}</h3>
                    <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 4. Solution Section */}
        <section className="py-24 bg-[#0D0C22] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal distance={20} duration={600}>
                <div className="space-y-8">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                    Creatorin hadir sebagai <span className="text-[#03ACFD]">sistem jaminan mutlak</span> untuk setiap proyek kreatifmu.
                  </h2>
                  <p className="text-lg text-neutral-400 leading-relaxed">
                    Kami menggabungkan kurasi portofolio otomatis, sistem pembayaran escrow (rekening bersama), dan ruang kolaborasi khusus dalam satu platform.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Pembayaran ditahan hingga proyek disetujui",
                      "Skor karir kreator yang transparan",
                      "Kontrak kerja & revisi terstruktur"
                    ].map((li, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-neutral-300">
                        <CheckCircle2 className="w-6 h-6 text-[#155DFC]" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
              <ScrollReveal distance={20} duration={600} delay={100}>
                <div className="aspect-square sm:aspect-[4/3] bg-neutral-800/50 border border-neutral-700 rounded-2xl overflow-hidden flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#155DFC]/20 to-transparent" />
                    <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                            <div>
                                <h4 className="text-sm font-semibold text-[#0D0C22]">Pembayaran Aman</h4>
                                <p className="text-xs text-neutral-500">Dana ditahan di Escrow</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 bg-neutral-100 rounded-full w-full" />
                            <div className="h-2 bg-neutral-100 rounded-full w-3/4" />
                            <div className="h-10 mt-4 bg-[#155DFC] rounded-lg w-full flex items-center justify-center text-xs font-semibold text-white">
                                Proyek Selesai & Rilis Dana
                            </div>
                        </div>
                    </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 5. Testimonials */}
        <section className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal distance={20} duration={600}>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#0D0C22] mb-16 tracking-tight">
                Dipercaya oleh UMKM Indonesia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-neutral-600 mb-8 italic">"Semenjak pakai Creatorin, kami gak pernah lagi pusing cari kreator untuk campaign bulanan. Hasilnya selalu on-time dan sesuai brief."</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded-full" />
                      <div>
                        <h4 className="font-semibold text-[#0D0C22]">Budi Santoso</h4>
                        <p className="text-sm text-neutral-500">Founder Brand Dummy {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 6. Mini Project Showcase */}
        <section className="py-24 bg-white border-t border-neutral-100">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal distance={20} duration={600}>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#0D0C22] mb-4 tracking-tight">
                  Karya Kreator Pilihan
                </h2>
                <p className="text-lg text-neutral-500">Lihat hasil nyata dari kolaborasi di platform kami</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayProjects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    id={`guest-proj-${proj.id}`}
                    project={proj}
                    isSaved={false}
                    onToggleSave={() => {}}
                    onClick={() => {}}
                  />
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  onClick={() => router.push('/sign-in')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-neutral-200 hover:border-[#155DFC] text-[#0D0C22] font-semibold transition-all"
                >
                  Lihat Lebih Banyak Karya
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 7. How it Works */}
        <section id="how-it-works" className="py-24 bg-neutral-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal distance={20} duration={600}>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#0D0C22] mb-16 tracking-tight">
                Hanya 3 Langkah Mudah
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-neutral-200" />
                {[
                  { step: "1", title: "Pilih & Brief", desc: "Temukan kreator yang pas atau post brief untuk ditawarkan ke publik." },
                  { step: "2", title: "Bayar ke Escrow", desc: "Bayar aman ke rekening bersama. Dana baru cair saat hasil disetujui." },
                  { step: "3", title: "Terima Hasil", desc: "Kolaborasi lancar lewat chat khusus, revisi terukur, dan terima file." }
                ].map((item, idx) => (
                  <div key={idx} className="relative text-center">
                    <div className="w-24 h-24 mx-auto bg-white border-4 border-neutral-50 shadow-md rounded-full flex items-center justify-center text-3xl font-bold text-[#155DFC] mb-6 relative z-10">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-[#0D0C22] mb-3">{item.title}</h3>
                    <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal distance={20} duration={600}>
              <div className="bg-gradient-to-br from-[#155DFC] to-[#03ACFD] rounded-3xl p-12 sm:p-16 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight leading-tight relative z-10">
                  Siap untuk meningkatkan visual brand Anda?
                </h2>
                <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">
                  Bergabung dengan ribuan UMKM dan kreator yang telah berkolaborasi membangun karya luar biasa setiap harinya.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                  <button onClick={() => router.push('/sign-in')} className="h-14 px-8 rounded-xl bg-white text-[#155DFC] font-bold text-lg hover:shadow-lg transition-all">
                    Mulai Daftar Gratis
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};
