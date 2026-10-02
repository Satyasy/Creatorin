'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { MOCK_PROJECTS } from '@/data/mockProjects';
import { ProjectListing } from '@/types';
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Search, 
  Sparkles, 
  Briefcase, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export const CreatorDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [savedBriefIds, setSavedBriefIds] = useState<string[]>([]);

  const categories = [
    'Semua',
    'Reels Instagram',
    'Video Tiktok',
    'Foto Produk',
    'Logo & Branding',
    'UI/UX Design',
    'Feed Instagram'
  ];

  const filteredBriefs = MOCK_PROJECTS.filter((brief) => {
    const matchesCat = selectedCategory === 'Semua' || brief.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (brief.requiredSkills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const toggleSaveBrief = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBriefIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-24">
      {/* 1. Profile Welcome Banner at Top */}
      <section className="bg-white border-b border-[#E2E8F0] pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#0D0C22] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* User Greeting & Info */}
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#155DFC] to-[#03ACFD] p-1 shrink-0">
                <div className="w-full h-full bg-[#0D0C22] rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{user?.name?.charAt(0) || 'K'}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-[#03ACFD] text-xs font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Kreator Terverifikasi
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Selamat datang, {user?.name || 'Kreator Hebat'}!
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
                  Telusuri brief pekerjaan terbaru dari berbagai UMKM Indonesia, kirimkan proposal terbaikmu, dan raih kesempatan kolaborasi baru hari ini.
                </p>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/5 border border-white/10 px-5 py-4 rounded-xl relative z-10 shrink-0">
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-base sm:text-lg">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>4.9</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">Reputasi</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <p className="text-base sm:text-lg font-bold text-white">12</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">Proyek Selesai</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <p className="text-base sm:text-lg font-bold text-emerald-400">100%</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">Job Success</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Layout (Upwork Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Project Briefs Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header & Search */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#155DFC]" />
                  Brief Proyek Untuk Anda
                </h2>
                <button
                  onClick={() => router.push('/briefs')}
                  className="text-xs font-semibold text-[#155DFC] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua Brief</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari brief berdasarkan keahlian atau kata kunci..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder:text-neutral-400 focus:outline-none focus:border-[#155DFC] transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#0D0C22] text-white font-semibold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brief Cards List */}
            <div className="space-y-4">
              {filteredBriefs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
                  <p className="text-sm font-semibold text-neutral-600">Tidak ada brief yang sesuai dengan pencarian.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}
                    className="mt-3 text-xs font-bold text-[#155DFC] hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredBriefs.map((brief) => {
                  const isSaved = savedBriefIds.includes(brief.id);
                  return (
                    <div
                      key={brief.id}
                      onClick={() => router.push(`/briefs/${brief.id}`)}
                      className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#94A3B8] p-5 sm:p-6 transition-all shadow-2xs hover:shadow-xs cursor-pointer relative"
                    >
                      {/* Top Meta: Time & Save Button */}
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Diposting {brief.postedTimeAgo}</span>
                          {brief.isUrgent && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold border border-rose-100 text-[11px]">
                              Urgent
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleSaveBrief(brief.id, e)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title={isSaved ? 'Hapus dari simpanan' : 'Simpan brief'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#155DFC] text-[#155DFC]' : ''}`} />
                        </button>
                      </div>

                      {/* Brief Title */}
                      <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#155DFC] transition-colors leading-snug mb-2">
                        {brief.title}
                      </h3>

                      {/* Budget & Scope */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mb-3">
                        <span className="font-bold text-[#0F172A] text-sm bg-neutral-100 px-2.5 py-1 rounded-lg">
                          {brief.formattedBudget || `Rp${brief.budgetMin?.toLocaleString('id-ID')}`}
                        </span>
                        <span>•</span>
                        <span>Estimasi: {brief.deadline}</span>
                        <span>•</span>
                        <span className="text-[#155DFC] font-semibold">{brief.category}</span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                        {brief.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {(brief.requiredSkills || []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Client Trust Verification Footer */}
                      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
                        <div className="flex items-center gap-3">
                          {brief.isVerifiedClient && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pembayaran Terverifikasi
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            {brief.clientLocation || 'Indonesia'}
                          </span>
                        </div>
                        <div className="font-medium text-neutral-600">
                          {brief.proposalsCount} Proposal Diajukan
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Sidebar Actions & Navigation (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Jelajah Karya Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#155DFC]" />
                Inspirasi & Referensi
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Lihat ribuan karya portofolio dari kreator lain untuk mendapatkan inspirasi visual dan tren konten terbaru.
              </p>
              <button
                onClick={() => router.push('/explore')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0D0C22] hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>Buka Navbar Jelajah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Career Readiness Checklist */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#0F172A]">Kelengkapan Profil Kreator</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Status Profil</span>
                  <span className="font-bold text-emerald-600">85% Lengkap</span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[85%]" />
                </div>
                <ul className="space-y-2 pt-2 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Sinkronisasi Akun Media Sosial</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unggah Portofolio Terbaik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span>Verifikasi Identitas & Rekening</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 p-5 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-[#155DFC] text-[11px] font-bold">
                Tips Sukses
              </span>
              <h4 className="text-xs font-bold text-[#0D0C22]">Tulis Proposal dengan Hook Kuat</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Jelaskan pemahamanmu terhadap brief brand dalam 2 kalimat pertama untuk meningkatkan peluang diterima hingga 3x lipat.
              </p>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
