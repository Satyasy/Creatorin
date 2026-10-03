'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicSchoolProfile } from '@/types';
import { schoolService } from '@/services/schoolService';
import { CareerScoreBadge } from '@/components/common/CareerScoreBadge';
import {
  GraduationCap,
  MapPin,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  FolderGit2,
  Users,
  Award,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Send,
  X,
  CheckCircle2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface SchoolPublicProfilePageProps {
  slug?: string;
}

export function SchoolPublicProfilePage({ slug = 'smk-kreatif-indonesia' }: SchoolPublicProfilePageProps) {
  const [profile, setProfile] = useState<PublicSchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('Semua');

  // Partnership Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await schoolService.getPublicSchoolProfile(slug);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load public school profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setIsModalOpen(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryCompany('');
      setInquiryMessage('');
    }, 2500);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#155DFC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-600">Memuat profil sekolah...</p>
        </div>
      </div>
    );
  }

  const { school, stats, featuredProjects, studentProjects, students, achievements } = profile;

  // Filter student projects
  const filteredProjects =
    projectCategoryFilter === 'Semua'
      ? studentProjects
      : studentProjects.filter(p => p.category.toLowerCase().includes(projectCategoryFilter.toLowerCase()));

  const displayedStudents = showAllStudents ? students : students.slice(0, 4);


  // 16. Featured Projects (Pilihan Sekolah)
  const renderFeaturedProjects = () => {
    if (featuredProjects.length === 0) return null;
    return (
      <section key="featured_projects" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kurasi Portofolio</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0D0C22]">Featured Projects</h2>
          </div>
          <span className="text-xs text-neutral-400 font-medium">Pilihan Sekolah</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map(proj => (
            <div
              key={proj.id}
              className="bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-xs hover:border-[#155DFC] hover:shadow-md transition-all group"
            >
              <div className="aspect-video w-full overflow-hidden bg-neutral-100 relative">
                <img
                  src={proj.thumbnail}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {proj.category}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    {proj.studentAvatar && (
                      <img
                        src={proj.studentAvatar}
                        alt={proj.studentName}
                        className="w-5 h-5 rounded-full object-cover border border-black/10"
                      />
                    )}
                    <span className="font-semibold text-[#0D0C22]">{proj.studentName}</span>
                  </div>
                  <span>{proj.createdDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // 13. Students Section
  const renderStudents = () => (
    <section key="students" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0D0C22]">Siswa & Talenta Kreator</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Daftar siswa vokasi SMK aktif terverifikasi dengan portofolio terakreditasi sekolah.
          </p>
        </div>
        <button
          onClick={() => setShowAllStudents(!showAllStudents)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#155DFC] hover:underline cursor-pointer"
        >
          <span>{showAllStudents ? 'Sembunyikan Sebagian' : 'View All Students'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllStudents ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedStudents.map(std => (
          <div
            key={std.id}
            className="bg-white rounded-[12px] p-5 border border-black/10 shadow-xs hover:border-[#155DFC]/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={std.avatarUrl}
                  alt={std.name}
                  className="w-12 h-12 rounded-full object-cover border border-black/10 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0D0C22] truncate">{std.name}</h4>
                  <p className="text-[11px] text-neutral-500 truncate">{std.role}</p>
                  <span className="inline-block text-[10px] font-bold text-[#155DFC] bg-blue-50 px-1.5 py-0.2 rounded-xs mt-0.5">
                    {std.major}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-neutral-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
                  {std.projectCount} Projects
                </span>
                {std.careerScore && <CareerScoreBadge score={std.careerScore} size="sm" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // 17. Achievements Section
  const renderAchievements = () => {
    if (achievements.length === 0) return null;
    return (
      <section key="achievements" className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0D0C22]">Prestasi & Penghargaan</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Rekam jejak kompetisi dan karya inovatif yang diraih siswa dan sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className="bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-xs p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded-full">
                  {ach.category}
                </span>
                <span className="text-xs font-bold text-neutral-400">{ach.year}</span>
              </div>
              <h3 className="text-sm font-bold text-[#0D0C22] leading-snug">{ach.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{ach.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // About Section
  const renderAbout = () => (
    <section key="about" className="bg-white rounded-[16px] border border-black/10 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-lg font-bold text-[#0D0C22]">Tentang {school.name}</h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          {school.description ||
            'SMK Kreatif Indonesia berfokus pada kurikulum vokasi berbasis proyek industri nyata. Siswa dibekali keterampilan praktis mulai dari UI/UX, software development, hingga multimedia branding.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/10 text-xs">
          <div>
            <span className="font-bold text-[#0D0C22] block mb-1">Penanggung Jawab Kemitraan (Hubin)</span>
            <p className="text-neutral-600">{school.picName || 'Drs. Hendro Wibowo, M.Kom'}</p>
            <p className="text-neutral-500 text-[11px]">{school.picContact || '+62 812-9876-5432'}</p>
          </div>
          <div>
            <span className="font-bold text-[#0D0C22] block mb-1">Lokasi Kampus Vokasi</span>
            <p className="text-neutral-600">{school.address || 'Jl. Pemuda No. 45, Embong Kaliasin'}</p>
            <p className="text-neutral-500 text-[11px]">{school.city}</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-[#F8FAFC] rounded-[12px] border border-black/10 space-y-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-[#0D0C22] block mb-1">Tertarik Merekrut atau Kolaborasi?</span>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Kreatorin menghubungkan UMKM & Brand dengan siswa SMK untuk magang, proyek lepas, dan rekrutmen talenta muda.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-bold rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Hubungi Sekolah Sekarang</span>
        </button>
      </div>
    </section>
  );

  const sectionMap: Record<string, () => React.ReactNode> = {
    featured_projects: renderFeaturedProjects,
    students: renderStudents,
    achievements: renderAchievements,
    about: renderAbout,
  };

  const dynamicOrder = school.sectionOrder || ['featured_projects', 'students', 'achievements', 'about'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 11. Hero School Profile */}
      <section className="relative w-full">
        {/* Cover Image */}
        <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden bg-neutral-900">
          <img
            src={school.coverUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80'}
            alt={school.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Hero Card Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 bg-white rounded-[16px] border border-black/10 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Logo & Main Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={school.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80'}
                  alt={school.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] object-cover border-2 border-white shadow-md shrink-0 bg-white"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0D0C22]">
                      {school.name}
                    </h1>
                    {school.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#155DFC] text-xs font-bold border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Terverifikasi Industri
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#155DFC]">
                    {school.tagline || 'Technology • Design • Creative Industry'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {school.city}
                    </span>
                    {school.website && (
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#155DFC] transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-neutral-400" />
                        {school.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs sm:text-sm font-bold rounded-[8px] transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Kemitraan Industri</span>
                </button>

                <Link
                  href="/dashboard/school"
                  className="px-4 py-2.5 bg-[#F3F3F4] hover:bg-neutral-200/80 text-[#0D0C22] text-xs sm:text-sm font-bold rounded-[8px] transition-colors flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-neutral-600" />
                  <span className="hidden sm:inline">School</span> Dashboard
                </Link>
              </div>
            </div>

            {/* Quick Hero Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-black/10">
              <div>
                <span className="text-xs text-neutral-400 font-medium">Jumlah Siswa Terdaftar</span>
                <p className="text-xl sm:text-2xl font-bold text-[#0D0C22] mt-0.5">
                  {stats.totalStudents}{' '}
                  <span className="text-xs font-normal text-neutral-500">Siswa</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-medium">Portofolio Project</span>
                <p className="text-xl sm:text-2xl font-bold text-[#0D0C22] mt-0.5">
                  {stats.totalProjects}{' '}
                  <span className="text-xs font-normal text-neutral-500">Karya</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-medium">Kolaborasi UMKM & Industri</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
                  {stats.totalCollaborations}{' '}
                  <span className="text-xs font-normal text-neutral-500">Proyek</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-medium">Prestasi & Penghargaan</span>
                <p className="text-xl sm:text-2xl font-bold text-[#155DFC] mt-0.5">
                  {stats.totalAchievements}{' '}
                  <span className="text-xs font-normal text-neutral-500">Gelar</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body with Dynamic Section Order */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {dynamicOrder.map(key => {
          const renderFn = sectionMap[key];
          return renderFn ? <React.Fragment key={key}>{renderFn()}</React.Fragment> : null;
        })}

        {/* 15. Student Projects Showcase (Always Available on School Profile) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0D0C22]">Semua Proyek Siswa</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Karya nyata hasil kurikulum vokasi dan kolaborasi industri langsung.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['Semua', 'UI/UX', 'Web App', 'Branding', 'Video UGC'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setProjectCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    projectCategoryFilter === cat
                      ? 'bg-[#155DFC] text-white'
                      : 'bg-white border border-black/10 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProjects.map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-xs hover:border-[#155DFC]/40 transition-all flex flex-col group"
              >
                <div className="aspect-video w-full overflow-hidden bg-neutral-100 relative">
                  <img
                    src={proj.thumbnail}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-[4px]">
                    {proj.category}
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors line-clamp-2">
                    {proj.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-black/5 mt-2">
                    <span className="font-semibold text-neutral-600 truncate">{proj.studentName}</span>
                    <span>{proj.createdDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Partnership Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[16px] border border-black/10 max-w-lg w-full p-6 shadow-xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#0D0C22] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold text-[#155DFC] uppercase tracking-wider">
                Kemitraan Industri Vokasi
              </span>
              <h3 className="text-lg font-bold text-[#0D0C22] mt-0.5">
                Kirim Permohonan ke {school.name}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Tawaran kerja sama proyek, magang, atau perekrutan siswa akan langsung diteruskan ke Tim Hubin sekolah.
              </p>
            </div>

            {inquirySuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-[12px] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">Permohonan Kemitraan Terkirim!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Terima kasih. Pihak sekolah akan segera menghubungi Anda melalui email atau kontak yang Anda cantumkan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Perwakilan</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/10 rounded-[8px] text-xs text-[#0D0C22] focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Perusahaan / Brand / UMKM</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Kopi Senja / PT Maju"
                      value={inquiryCompany}
                      onChange={e => setInquiryCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/10 rounded-[8px] text-xs text-[#0D0C22] focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Email Anda</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@perusahaan.com"
                      value={inquiryEmail}
                      onChange={e => setInquiryEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/10 rounded-[8px] text-xs text-[#0D0C22] focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Kebutuhan / Rencana Kerja Sama</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ceritakan proyek, magang, atau kebutuhan talenta siswa yang ingin Anda ajukan..."
                    value={inquiryMessage}
                    onChange={e => setInquiryMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/10 rounded-[8px] text-xs text-[#0D0C22] focus:bg-white focus:border-[#155DFC] focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#F3F3F4] text-[#0D0C22] text-xs font-semibold rounded-[8px] hover:bg-neutral-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-bold rounded-[8px] transition-colors shadow-xs"
                  >
                    Kirim Penawaran
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
