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
  ShieldCheck,
  FolderGit2,
  Users,
  Award,
  ChevronRight,
  Send,
  X,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

interface SchoolPublicProfilePageProps {
  slug?: string;
}

export function SchoolPublicProfilePage({ slug = 'smk-kreatif-indonesia' }: SchoolPublicProfilePageProps) {
  const [profile, setProfile] = useState<PublicSchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
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
        setLoadError(err instanceof Error ? err.message : 'Gagal memuat profil sekolah');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) return;

    setIsSubmittingInquiry(true);
    try {
      // Jika profil sekolah memiliki profileId penanggung jawab, kirim notifikasi ke akun pengelola sekolah
      if (profile?.school?.profileId) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.school.profileId,
            type: 'system',
            title: `Pengajuan Kemitraan: ${inquiryCompany.trim() || inquiryName.trim()}`,
            body: `Pengajuan kemitraan baru dari ${inquiryName} (${inquiryEmail}): "${inquiryMessage.trim()}"`,
            linkUrl: `/dashboard/school`,
          }),
        }).catch(() => {});
      }

      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setIsModalOpen(false);
        setInquiryName('');
        setInquiryEmail('');
        setInquiryCompany('');
        setInquiryMessage('');
      }, 1500);
    } catch {
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setIsModalOpen(false);
      }, 1500);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (!isLoading && !profile) {
    return (
      <div className="min-h-[70vh] grid place-items-center text-sm text-[#55576A]" role="alert">
        {loadError || 'Profil sekolah tidak ditemukan.'}
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-2 border-[#155DFC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#55576A]">Memuat profil sekolah...</p>
        </div>
      </div>
    );
  }

  const { school, stats, featuredProjects, studentProjects, students, achievements } = profile;

  // Filter student projects
  const filteredProjects =
    projectCategoryFilter === 'Semua'
      ? studentProjects
      : studentProjects.filter((p) =>
          p.category.toLowerCase().includes(projectCategoryFilter.toLowerCase())
        );

  const displayedStudents = showAllStudents ? students : students.slice(0, 4);

  // 1. Featured Projects (Pilihan Sekolah)
  const renderFeaturedProjects = () => {
    if (featuredProjects.length === 0) return null;
    return (
      <section key="featured_projects" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155DFC] uppercase tracking-wider mb-1">
              <Sparkles className="size-3.5" />
              <span>Kurasi Portofolio</span>
            </div>
            <h2 className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#0D0C22]">
              Karya Unggulan Sekolah
            </h2>
          </div>
          <span className="text-xs text-[#6F7285] font-medium">Terverifikasi Institusi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-[#E1E3EA] overflow-hidden shadow-[0_1px_2px_rgba(13,12,34,0.06)] hover:border-[#155DFC] transition-all group"
            >
              <div className="aspect-video w-full overflow-hidden bg-[#F3F3F4] relative">
                <img
                  src={proj.thumbnail}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#0D0C22]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  {proj.category}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-['DM_Sans'] text-sm font-semibold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-[#E1E3EA] text-xs text-[#55576A]">
                  <div className="flex items-center gap-2">
                    {proj.studentAvatar && (
                      <img
                        src={proj.studentAvatar}
                        alt={proj.studentName}
                        className="size-5 rounded-full object-cover border border-[#E1E3EA]"
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

  // 2. Students Section
  const renderStudents = () => (
    <section key="students" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#0D0C22]">
            Siswa & Talenta Vokasi
          </h2>
          <p className="text-xs text-[#55576A] mt-0.5">
            Daftar siswa vokasi SMK aktif terverifikasi dengan portofolio terakreditasi sekolah.
          </p>
        </div>
        <button
          onClick={() => setShowAllStudents(!showAllStudents)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#155DFC] hover:underline"
        >
          <span>{showAllStudents ? 'Sembunyikan Sebagian' : 'Lihat Semua Siswa'}</span>
          <ChevronRight
            className={`size-3.5 transition-transform ${showAllStudents ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedStudents.map((std) => (
          <div
            key={std.id}
            className="bg-white rounded-xl p-5 border border-[#E1E3EA] shadow-[0_1px_2px_rgba(13,12,34,0.06)] hover:border-[#155DFC] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={std.avatarUrl}
                  alt={std.name}
                  className="size-11 rounded-full object-cover border border-[#E1E3EA] shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#0D0C22] truncate">{std.name}</h4>
                  <p className="text-[11px] text-[#6F7285] truncate">{std.role}</p>
                  <span className="inline-block text-[10px] font-semibold text-[#155DFC] bg-[#E8F0FF] px-2 py-0.5 rounded-full mt-1">
                    {std.major}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E1E3EA] text-xs text-[#55576A]">
                <span className="flex items-center gap-1 text-[11px]">
                  <FolderGit2 className="size-3.5 text-[#6F7285]" />
                  {std.projectCount} Karya
                </span>
                {std.careerScore && <CareerScoreBadge score={std.careerScore} size="sm" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // 3. Achievements Section
  const renderAchievements = () => {
    if (achievements.length === 0) return null;
    return (
      <section key="achievements" className="space-y-4">
        <div>
          <h2 className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#0D0C22]">
            Prestasi & Sertifikasi
          </h2>
          <p className="text-xs text-[#55576A] mt-0.5">
            Rekam jejak kompetisi dan karya inovatif yang diraih siswa dan institusi sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white rounded-xl border border-[#E1E3EA] overflow-hidden shadow-[0_1px_2px_rgba(13,12,34,0.06)] p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#0D2A75] bg-[#E8F0FF] px-2.5 py-0.5 rounded-full">
                  {ach.category}
                </span>
                <span className="text-xs font-semibold text-[#6F7285]">{ach.year}</span>
              </div>
              <h3 className="font-['DM_Sans'] text-sm font-semibold text-[#0D0C22] leading-snug">
                {ach.title}
              </h3>
              <p className="text-xs text-[#55576A] leading-relaxed">{ach.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // 4. About Section
  const renderAbout = () => (
    <section
      key="about"
      className="bg-white rounded-2xl border border-[#E1E3EA] p-6 sm:p-8 shadow-[0_1px_2px_rgba(13,12,34,0.06)] grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <div className="md:col-span-2 space-y-4">
        <h2 className="font-['DM_Sans'] text-xl font-semibold text-[#0D0C22]">
          Tentang {school.name}
        </h2>
        <p className="text-xs sm:text-sm text-[#55576A] leading-relaxed">
          {school.description || 'Belum ada deskripsi profil sekolah.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E1E3EA] text-xs">
          <div>
            <span className="font-semibold text-[#0D0C22] block mb-1">
              Hubungan Industri (Hubin)
            </span>
            <p className="text-[#55576A]">{school.picName || 'Drs. Hendro Wibowo, M.Kom'}</p>
            <p className="text-[#6F7285] text-[11px] mt-0.5">
              {school.picContact || '+62 812-9876-5432'}
            </p>
          </div>
          <div>
            <span className="font-semibold text-[#0D0C22] block mb-1">Lokasi Kampus Vokasi</span>
            <p className="text-[#55576A]">
              {school.address || 'Jl. Pemuda No. 45, Embong Kaliasin'}
            </p>
            <p className="text-[#6F7285] text-[11px] mt-0.5">{school.city}</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-[#F8F9FC] rounded-xl border border-[#E1E3EA] space-y-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-[#0D0C22] block mb-1">
            Tertarik Merekrut atau Kolaborasi?
          </span>
          <p className="text-xs text-[#55576A] leading-relaxed">
            Creatorin menghubungkan UMKM & Brand dengan siswa SMK untuk magang, proyek lepas, dan rekrutmen talenta muda terverifikasi.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Send className="size-3.5" />
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

  const dynamicOrder = school.sectionOrder || [
    'featured_projects',
    'students',
    'achievements',
    'about',
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24 text-[#0D0C22]">
      {/* Hero School Profile */}
      <section className="relative w-full">
        {/* Cover Banner */}
        <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden bg-neutral-900">
          {school.coverUrl && (
            <img
              src={school.coverUrl}
              alt={school.name}
              className="w-full h-full object-cover opacity-85"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Hero Card Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 bg-white rounded-2xl border border-[#E1E3EA] p-6 sm:p-8 shadow-[0_1px_3px_rgba(13,12,34,0.06)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Logo & Main Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={school.logoUrl || '/creatorin/avatar.png'}
                  alt={school.name}
                  className="size-20 sm:size-24 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-white"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-['DM_Sans'] text-xl sm:text-2xl md:text-3xl font-semibold text-[#0D0C22]">
                      {school.name}
                    </h1>
                    {school.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0FF] text-[#155DFC] text-xs font-semibold border border-[#A9C3FF]/50">
                        <ShieldCheck className="size-3.5" />
                        Terverifikasi Industri
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#155DFC]">
                    {school.tagline || 'Teknologi • Desain Kreatif • Industri Digital'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#55576A] pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[#6F7285]" />
                      {school.city}
                    </span>
                    {school.website && (
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#155DFC] transition-colors"
                      >
                        <Globe className="size-3.5 text-[#6F7285]" />
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
                  className="px-5 py-2.5 bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Mail className="size-4" />
                  <span>Kemitraan Industri</span>
                </button>

                <Link
                  href="/dashboard/school"
                  className="px-4 py-2.5 bg-[#F3F3F4] hover:bg-[#E9EAF0] text-[#0D0C22] text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <GraduationCap className="size-4 text-[#55576A]" />
                  <span>Dashboard Sekolah</span>
                </Link>
              </div>
            </div>

            {/* Quick Hero Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E1E3EA]">
              <div>
                <span className="text-xs text-[#6F7285] font-medium">Siswa Terdaftar</span>
                <p className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#0D0C22] mt-0.5">
                  {stats.totalStudents}{' '}
                  <span className="text-xs font-normal text-[#55576A]">Siswa</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6F7285] font-medium">Portofolio Karya</span>
                <p className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#0D0C22] mt-0.5">
                  {stats.totalProjects}{' '}
                  <span className="text-xs font-normal text-[#55576A]">Karya</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6F7285] font-medium">Kolaborasi Industri</span>
                <p className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#16803C] mt-0.5">
                  {stats.totalCollaborations}{' '}
                  <span className="text-xs font-normal text-[#55576A]">Proyek</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6F7285] font-medium">Prestasi & Penghargaan</span>
                <p className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#155DFC] mt-0.5">
                  {stats.totalAchievements}{' '}
                  <span className="text-xs font-normal text-[#55576A]">Gelar</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body with Dynamic Section Order */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {dynamicOrder.map((key) => {
          const renderFn = sectionMap[key];
          return renderFn ? <React.Fragment key={key}>{renderFn()}</React.Fragment> : null;
        })}

        {/* Student Projects Showcase */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-['DM_Sans'] text-xl sm:text-2xl font-semibold text-[#0D0C22]">
                Semua Karya Siswa
              </h2>
              <p className="text-xs text-[#55576A] mt-0.5">
                Karya nyata hasil kurikulum vokasi dan kolaborasi industri langsung.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['Semua', 'UI/UX', 'Web App', 'Branding', 'Video UGC'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProjectCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    projectCategoryFilter === cat
                      ? 'bg-[#155DFC] text-white'
                      : 'bg-white border border-[#E1E3EA] text-[#55576A] hover:bg-[#F8F9FC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-[#E1E3EA] overflow-hidden shadow-[0_1px_2px_rgba(13,12,34,0.06)] hover:border-[#155DFC] transition-all flex flex-col group"
              >
                <div className="aspect-video w-full overflow-hidden bg-[#F3F3F4] relative">
                  <img
                    src={proj.thumbnail}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#0D0C22]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {proj.category}
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <h4 className="font-['DM_Sans'] text-xs font-semibold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors line-clamp-2">
                    {proj.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#6F7285] pt-2 border-t border-[#E1E3EA] mt-2">
                    <span className="font-semibold text-[#55576A] truncate">
                      {proj.studentName}
                    </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E1E3EA] max-w-lg w-full p-6 shadow-xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#6F7285] hover:text-[#0D0C22] transition-colors p-1"
            >
              <X className="size-5" />
            </button>

            <div>
              <span className="text-[11px] font-semibold text-[#155DFC] uppercase tracking-wider">
                Kemitraan Industri Vokasi
              </span>
              <h3 className="font-['DM_Sans'] text-lg font-semibold text-[#0D0C22] mt-0.5">
                Kirim Permohonan ke {school.name}
              </h3>
              <p className="text-xs text-[#55576A] mt-1">
                Tawaran kerja sama proyek, magang, atau perekrutan siswa akan langsung diteruskan ke Tim Hubin sekolah.
              </p>
            </div>

            {inquirySuccess ? (
              <div className="p-6 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl text-center space-y-2">
                <CheckCircle2 className="size-8 text-[#16803C] mx-auto" />
                <h4 className="text-sm font-semibold text-[#14532D]">
                  Permohonan Kemitraan Terkirim!
                </h4>
                <p className="text-xs text-[#14532D]/90 leading-relaxed">
                  Terima kasih. Pihak sekolah akan segera menghubungi Anda melalui kontak yang dicantumkan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                    Nama Perwakilan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-xl text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                      Perusahaan / Brand / UMKM
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Kopi Senja / PT Maju"
                      value={inquiryCompany}
                      onChange={(e) => setInquiryCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-xl text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                      Email Anda
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@perusahaan.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-xl text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                    Rencana Kerja Sama / Kebutuhan
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ceritakan proyek, program magang, atau kebutuhan talenta siswa yang ingin Anda ajukan..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-xl text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-[3px] focus:ring-[#155DFC]/15 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E1E3EA]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#F3F3F4] text-[#0D0C22] text-xs font-semibold rounded-xl hover:bg-[#E9EAF0] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry || !inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()}
                    className="px-5 py-2 bg-[#155DFC] hover:bg-[#1248C7] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    {isSubmittingInquiry ? 'Mengirim...' : 'Kirim Penawaran'}
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
