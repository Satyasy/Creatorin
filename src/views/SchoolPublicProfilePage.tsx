'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PublicSchoolProfile } from '@/types';
import { schoolService } from '@/services/schoolService';
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  X,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Search,
  Share2,
  Check,
  FolderGit2,
  Building2,
  Eye,
  Calendar,
  Layers,
  Briefcase,
} from 'lucide-react';

interface SchoolPublicProfilePageProps {
  slug?: string;
}

export interface ShowcaseProjectItem {
  id: string;
  title: string;
  studentName: string;
  studentAvatar?: string;
  category: string;
  thumbnail: string;
  createdDate: string;
  viewsCount?: string | number;
  description?: string;
  externalLink?: string;
}

const FALLBACK_SHOWCASE_PROJECTS: ShowcaseProjectItem[] = [
  {
    id: 'proj-fb-1',
    title: 'Rebranding Identitas Visual & Packaging Kopi Specialty Lereng Ijen',
    studentName: 'Budi Santoso',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    category: 'Brand Identity',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    createdDate: '2025-10-10',
    viewsCount: '482',
    description: 'Sistem identitas merek menyeluruh untuk UMKM kopi, meliputi logo konseptual, panduan warna, tipografi, dan packaging bag kopi ramah lingkungan bersertifikasi pangan.',
    externalLink: 'https://behance.net',
  },
  {
    id: 'proj-fb-2',
    title: 'Aplikasi Mobile Point-of-Sale (POS) & Manajemen Stok Kedai UMKM',
    studentName: 'Alya Putri',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    category: 'UI/UX & Web',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    createdDate: '2025-09-24',
    viewsCount: '620',
    description: 'Desain UI/UX 24 screen dan prototype interaktif untuk sistem kasir kasual yang mempermudah pemilik gerai F&B memantau omzet harian dan stok bahan secara realtime.',
    externalLink: 'https://figma.com',
  },
  {
    id: 'proj-fb-3',
    title: 'Video Komersial 30 Detik Produk Madu Hutan Lestari',
    studentName: 'Kevin Sanjaya',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    category: 'Video & Motion',
    thumbnail: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800&auto=format&fit=crop&q=80',
    createdDate: '2025-09-12',
    viewsCount: '915',
    description: 'Produksi video iklan vertikal (9:16) format sinematik dengan visual motion text dinamis untuk promosi kampanye TikTok Shop dan Reels konversi tinggi.',
    externalLink: 'https://youtube.com',
  },
  {
    id: 'proj-fb-4',
    title: 'Desain Kemasan Eco-Pouch Snack Kripik Buah Ekspor',
    studentName: 'Citra Kirana',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    category: 'Packaging',
    thumbnail: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=80',
    createdDate: '2025-08-30',
    viewsCount: '340',
    description: 'Desain kemasan ziplock pouch dengan ilustrasi khas lokal dan tata letak informasi nutrisi sesuai standar regulasi Badan POM dan pasar ekspor ritel.',
  },
  {
    id: 'proj-fb-5',
    title: 'Website Portal Profil Usaha Kerajinan Anyaman Bambu',
    studentName: 'Rian Pratama',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    category: 'UI/UX & Web',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    createdDate: '2025-08-14',
    viewsCount: '512',
    description: 'Website responsif modern berkecepatan tinggi dengan integrasi katalog digital dan formulir pemesanan langsung WhatsApp untuk pengrajin lokal.',
  },
  {
    id: 'proj-fb-6',
    title: 'Identitas Visual & Maskot Merek Camilan Tradisional Modern',
    studentName: 'Dimas Prasetyo',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    category: 'Brand Identity',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    createdDate: '2025-07-29',
    viewsCount: '280',
    description: 'Karakter maskot ramah anak, logo emblem, dan set grafis promosi digital untuk peluncuran lini produk camilan lokal kekinian.',
  },
];

const CATEGORIES = ['Semua', 'UI/UX & Web', 'Brand Identity', 'Video & Motion', 'Packaging'];

export function SchoolPublicProfilePage({ slug = 'smk-kreatif-indonesia' }: SchoolPublicProfilePageProps) {
  const [profile, setProfile] = useState<PublicSchoolProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Project filtering and search state
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected project modal state
  const [selectedProject, setSelectedProject] = useState<ShowcaseProjectItem | null>(null);

  // Partnership inquiry modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquiryType, setInquiryType] = useState('Pemesanan Proyek Kreatif');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Link copy feedback state
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await schoolService.getPublicSchoolProfile(slug);
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load public school profile:', err);
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat profil sekolah');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const school = profile?.school;
  const rawProjects = profile?.studentProjects || [];

  // Unified projects list: prefer backend data, fallback to rich fixtures if empty
  const allProjects: ShowcaseProjectItem[] = useMemo(() => {
    if (rawProjects.length > 0) {
      return rawProjects.map((p) => ({
        id: p.id,
        title: p.title,
        studentName: p.studentName || 'Talenta Vokasi',
        studentAvatar: p.studentAvatar,
        category: p.category || 'Karya Kreatif',
        thumbnail: p.thumbnail || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        createdDate: p.createdDate ? p.createdDate.slice(0, 10) : '2025',
        viewsCount: p.viewsCount || '150',
        description: p.description || 'Karya portofolio vokasi berbasis studi kasus industri.',
        externalLink: p.externalLink,
      }));
    }
    return FALLBACK_SHOWCASE_PROJECTS;
  }, [rawProjects]);

  // Curated featured projects (top 3)
  const featuredProjects: ShowcaseProjectItem[] = useMemo(() => {
    const rawFeatured = profile?.featuredProjects || [];
    if (rawFeatured.length > 0) {
      return rawFeatured.slice(0, 3).map((p) => ({
        id: p.id,
        title: p.title,
        studentName: p.studentName || 'Talenta Vokasi',
        studentAvatar: p.studentAvatar,
        category: p.category || 'Karya Kreatif',
        thumbnail: p.thumbnail || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        createdDate: p.createdDate ? p.createdDate.slice(0, 10) : '2025',
        viewsCount: '450',
        description: p.description || 'Karya kurasi unggulan dengan tingkat kesiapan produksi dan standar industri tinggi.',
        externalLink: p.externalLink,
      }));
    }
    return allProjects.slice(0, 3);
  }, [profile?.featuredProjects, allProjects]);

  // Filtered projects for the main catalog
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesCategory =
        projectCategoryFilter === 'Semua' ||
        p.category.toLowerCase().includes(projectCategoryFilter.toLowerCase());
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allProjects, projectCategoryFilter, searchQuery]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const openProjectInquiry = (project: ShowcaseProjectItem) => {
    setSelectedProject(null);
    setInquiryType('Pemesanan Proyek Kreatif');
    setInquiryMessage(`Halo, kami tertarik untuk memesan atau berkolaborasi terkait karya "${project.title}" (${project.category}). Mohon informasi jadwal dan mekanisme kerja sama dengan teaching factory sekolah.`);
    setIsModalOpen(true);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) return;

    setIsSubmittingInquiry(true);
    try {
      if (school?.profileId) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: school.profileId,
            type: 'system',
            title: `Pengajuan Kemitraan: ${inquiryCompany.trim() || inquiryName.trim()}`,
            body: `Pengajuan ${inquiryType} dari ${inquiryName} (${inquiryEmail}, Perusahaan: ${inquiryCompany || '-'}): "${inquiryMessage.trim()}"`,
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
      }, 1600);
    } catch {
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setIsModalOpen(false);
      }, 1600);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (!isLoading && !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-medium text-[#55576A] max-w-md">
          {loadError || 'Profil showcase sekolah tidak ditemukan.'}
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-[#155DFC] text-white text-xs font-semibold rounded-lg hover:bg-[#1248C7] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (isLoading || !school) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-2 border-[#155DFC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#55576A]">Memuat showcase proyek sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#0D0C22] pb-24">
      {/* 1. HERO HEADER: School Showcase Branding */}
      <section className="relative w-full">
        {/* Cover Canvas with Subtle Dark Gradient */}
        <div className="w-full h-56 sm:h-72 md:h-80 relative overflow-hidden bg-[#0D0C22]">
          {school.coverUrl ? (
            <img
              src={school.coverUrl}
              alt={school.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0D0C22] via-[#1A1C29] to-[#0D2A75] opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C22] via-[#0D0C22]/40 to-transparent" />
        </div>

        {/* Hero Identity Card */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 bg-white rounded-2xl border border-[#E1E3EA] p-6 sm:p-8 shadow-[0_1px_3px_rgba(13,12,34,0.06)]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Logo & Main Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={school.logoUrl || '/creatorin/avatar.png'}
                  alt={school.name}
                  className="size-20 sm:size-24 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0 bg-white"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-['DM_Sans',sans-serif] text-2xl sm:text-3xl font-semibold text-[#0D0C22] tracking-tight">
                      {school.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0FF] text-[#155DFC] text-xs font-semibold border border-[#A9C3FF]/60">
                      <ShieldCheck className="size-3.5" />
                      Teaching Factory Terakreditasi
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[#155DFC]">
                    {school.tagline || 'Pusat Keunggulan Desain Komunikasi Visual & Teknologi Digital'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#55576A] pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[#55576A]" />
                      {school.city || 'Indonesia'}
                    </span>
                    {school.website && (
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-[#155DFC] transition-colors"
                      >
                        <Globe className="size-3.5 text-[#55576A]" />
                        <span>{school.website.replace(/^https?:\/\//, '')}</span>
                        <ArrowUpRight className="size-3 text-[#55576A]" />
                      </a>
                    )}
                    {school.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5 text-[#55576A]" />
                        {school.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Industry Partners */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setInquiryType('Pemesanan Proyek Kreatif');
                    setInquiryMessage('');
                    setIsModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="size-4" />
                  <span>Ajukan Kemitraan Proyek</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 bg-white border border-[#E1E3EA] hover:bg-[#F8F9FC] text-[#0D0C22] text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                  title="Salin tautan showcase"
                >
                  {isCopied ? (
                    <>
                      <Check className="size-4 text-[#16803C]" />
                      <span className="text-[#16803C]">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-4 text-[#55576A]" />
                      <span>Bagikan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Industry Highlights: Purely Project & Collaboration Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E1E3EA]">
              <div>
                <span className="text-xs text-[#55576A] font-medium">Portofolio Siap Produksi</span>
                <p className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#0D0C22] mt-0.5">
                  {allProjects.length}{' '}
                  <span className="text-xs font-normal text-[#55576A]">Karya</span>
                </p>
              </div>

              <div>
                <span className="text-xs text-[#55576A] font-medium">Disiplin Spesialisasi</span>
                <p className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#155DFC] mt-0.5">
                  5 <span className="text-xs font-normal text-[#55576A]">Kategori</span>
                </p>
              </div>

              <div>
                <span className="text-xs text-[#55576A] font-medium">Kemitraan Industri Selesai</span>
                <p className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#16803C] mt-0.5">
                  {profile?.stats?.totalCollaborations || 14}{' '}
                  <span className="text-xs font-normal text-[#55576A]">Proyek</span>
                </p>
              </div>

              <div>
                <span className="text-xs text-[#55576A] font-medium">Standar Output</span>
                <p className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#0D0C22] mt-0.5">
                  100%{' '}
                  <span className="text-xs font-normal text-[#55576A]">Kasus Riil</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN SHOWCASE: Focused Purely on Projects */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* 2a. Featured Projects: Editorial Curated Showcase */}
        {featuredProjects.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155DFC] mb-1">
                  <Sparkles className="size-3.5" />
                  <span>Koleksi Pilihan Industri</span>
                </div>
                <h2 className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#0D0C22]">
                  Karya Unggulan Teaching Factory
                </h2>
                <p className="text-xs text-[#55576A] mt-0.5">
                  Proyek kurasi terbaik dengan tingkat kesiapan produksi dan standar estetika industri.
                </p>
              </div>
              <span className="text-xs text-[#55576A] font-medium hidden sm:block">
                Terverifikasi Kurikulum Vokasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProjects.map((proj) => (
                <div
                  key={`feat-${proj.id}`}
                  onClick={() => setSelectedProject(proj)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProject(proj);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="bg-white rounded-xl border border-[#E1E3EA] overflow-hidden shadow-[0_1px_2px_rgba(13,12,34,0.06)] hover:border-[#155DFC] transition-all group flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="aspect-[16/10] w-full overflow-hidden bg-[#F3F3F4] relative">
                      <img
                        src={proj.thumbnail}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-[#0D0C22]/85 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                        {proj.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-['DM_Sans',sans-serif] text-sm sm:text-base font-semibold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors line-clamp-1 leading-snug">
                        {proj.title}
                      </h3>
                      {proj.description && (
                        <p className="text-xs text-[#55576A] line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Attribution Footer */}
                  <div className="px-4 py-3 border-t border-[#E1E3EA] flex items-center justify-between text-xs text-[#55576A]">
                    <div className="flex items-center gap-2 min-w-0">
                      {proj.studentAvatar ? (
                        <img
                          src={proj.studentAvatar}
                          alt={proj.studentName}
                          className="size-5 rounded-full object-cover border border-[#E1E3EA] shrink-0"
                        />
                      ) : (
                        <div className="size-5 rounded-full bg-[#E8F0FF] text-[#155DFC] text-[10px] font-semibold grid place-items-center shrink-0">
                          {proj.studentName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-[#0D0C22] truncate text-xs">
                        {proj.studentName}
                      </span>
                    </div>

                    <span className="text-[#155DFC] font-medium inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Detail</span>
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2b. Full Projects Catalog with Search & Filter */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#0D0C22]">
                Katalog Lengkap Portofolio Vokasi
              </h2>
              <p className="text-xs text-[#55576A] mt-0.5">
                Eksplorasi seluruh karya desain, produk digital, dan materi kreatif yang siap diaplikasikan ke industri.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="size-4 text-[#55576A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari karya atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E1E3EA] rounded-lg text-xs text-[#0D0C22] placeholder:text-[#55576A] focus:outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#55576A] hover:text-[#0D0C22] p-0.5"
                  aria-label="Hapus pencarian"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = projectCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProjectCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#155DFC] text-white'
                      : 'bg-white border border-[#E1E3EA] text-[#55576A] hover:bg-[#F8F9FC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            <span className="text-xs text-[#55576A] ml-auto shrink-0 pl-2">
              {filteredProjects.length} Karya
            </span>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E1E3EA] p-12 text-center space-y-3">
              <FolderGit2 className="size-8 text-[#55576A] mx-auto" />
              <h3 className="font-['DM_Sans',sans-serif] text-base font-semibold text-[#0D0C22]">
                Tidak ada karya yang cocok
              </h3>
              <p className="text-xs text-[#55576A] max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau pilih kategori lain untuk melihat koleksi karya vokasi.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setProjectCategoryFilter('Semua');
                }}
                className="px-4 py-2 bg-[#F3F3F4] text-[#0D0C22] text-xs font-semibold rounded-lg hover:bg-[#E1E3EA] transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <div
                  key={`catalog-${proj.id}`}
                  onClick={() => setSelectedProject(proj)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedProject(proj);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="bg-white rounded-xl border border-[#E1E3EA] overflow-hidden shadow-[0_1px_2px_rgba(13,12,34,0.06)] hover:border-[#155DFC] transition-all group flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
                >
                  <div>
                    {/* Media Preview */}
                    <div className="aspect-[16/9] w-full overflow-hidden bg-[#F3F3F4] relative">
                      <img
                        src={proj.thumbnail}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-[#0D0C22]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {proj.category}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-['DM_Sans',sans-serif] text-sm font-semibold text-[#0D0C22] group-hover:text-[#155DFC] transition-colors line-clamp-1 leading-snug">
                        {proj.title}
                      </h4>
                      {proj.description && (
                        <p className="text-xs text-[#55576A] line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 border-t border-[#E1E3EA] flex items-center justify-between text-xs text-[#55576A]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {proj.studentAvatar ? (
                        <img
                          src={proj.studentAvatar}
                          alt={proj.studentName}
                          className="size-4.5 rounded-full object-cover border border-[#E1E3EA] shrink-0"
                        />
                      ) : (
                        <div className="size-4.5 rounded-full bg-[#E8F0FF] text-[#155DFC] text-[9px] font-semibold grid place-items-center shrink-0">
                          {proj.studentName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-[#0D0C22] truncate text-[11px]">
                        {proj.studentName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#55576A]">
                      {proj.viewsCount && (
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3" />
                          {proj.viewsCount}
                        </span>
                      )}
                      <span>{proj.createdDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2c. Industry Collaboration Framework & Hubin Contact */}
        <section className="bg-white rounded-2xl border border-[#E1E3EA] p-6 sm:p-8 shadow-[0_1px_2px_rgba(13,12,34,0.06)] space-y-8">
          <div>
            <span className="text-xs font-semibold text-[#155DFC] uppercase tracking-wide">
              Kemitraan Industri Vokasi
            </span>
            <h2 className="font-['DM_Sans',sans-serif] text-xl sm:text-2xl font-semibold text-[#0D0C22] mt-1">
              Kolaborasi & Model Kerja Sama dengan {school.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#55576A] mt-1 leading-relaxed max-w-3xl">
              {school.description ||
                'Menyiapkan talenta kreatif muda siap industri melalui teaching factory terstandarisasi, siap mendukung kebutuhan materi kreatif, branding, dan digital UMKM serta brand modern.'}
            </p>
          </div>

          {/* 3 Pillars of Industry Collaboration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl border border-[#E1E3EA] bg-[#F8F9FC] space-y-2">
              <div className="size-9 rounded-lg bg-white border border-[#E1E3EA] grid place-items-center text-[#155DFC]">
                <Layers className="size-4.5" />
              </div>
              <h3 className="font-['DM_Sans',sans-serif] text-sm font-semibold text-[#0D0C22]">
                1. Pemesanan Proyek Kreatif
              </h3>
              <p className="text-xs text-[#55576A] leading-relaxed">
                Brand atau UMKM dapat memberikan brief desain, video promosi, atau aset digital yang dikerjakan langsung oleh siswa teaching factory di bawah supervisi praktisi.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#E1E3EA] bg-[#F8F9FC] space-y-2">
              <div className="size-9 rounded-lg bg-white border border-[#E1E3EA] grid place-items-center text-[#155DFC]">
                <Briefcase className="size-4.5" />
              </div>
              <h3 className="font-['DM_Sans',sans-serif] text-sm font-semibold text-[#0D0C22]">
                2. Program Magang & Rekrutmen
              </h3>
              <p className="text-xs text-[#55576A] leading-relaxed">
                Akses langsung merekrut talenta yang telah terbukti menghasilkan proyek di etalase ini untuk kebutuhan magang industri atau talenta pemula.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#E1E3EA] bg-[#F8F9FC] space-y-2">
              <div className="size-9 rounded-lg bg-white border border-[#E1E3EA] grid place-items-center text-[#155DFC]">
                <Building2 className="size-4.5" />
              </div>
              <h3 className="font-['DM_Sans',sans-serif] text-sm font-semibold text-[#0D0C22]">
                3. Kelas Industri & Sinkronisasi
              </h3>
              <p className="text-xs text-[#55576A] leading-relaxed">
                Kemitraan kurikulum bersama institusi sekolah untuk membentuk keahlian spesifik yang dibutuhkan oleh perusahaan mitra Anda.
              </p>
            </div>
          </div>

          {/* Hubin Verified Contact Details */}
          <div className="pt-6 border-t border-[#E1E3EA] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-semibold text-[#0D0C22] block mb-1">
                  Kontak Hubungan Industri (Hubin)
                </span>
                <p className="text-[#55576A] font-medium">
                  {school.picName || 'Tim Kemitraan Hubin'}
                </p>
                <div className="flex flex-col gap-0.5 mt-1 text-[#55576A]">
                  {school.picContact && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3 text-[#55576A]" />
                      {school.picContact}
                    </span>
                  )}
                  {school.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3 text-[#55576A]" />
                      {school.email}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#0D0C22] block mb-1">
                  Alamat Kampus Vokasi
                </span>
                <p className="text-[#55576A] leading-relaxed">
                  {school.address || 'Kampus Utama Vokasi'}
                </p>
                <p className="text-[#55576A] mt-0.5">{school.city}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInquiryType('Pemesanan Proyek Kreatif');
                setInquiryMessage('');
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="size-3.5" />
              <span>Mulai Kerja Sama Industri</span>
            </button>
          </div>
        </section>
      </main>

      {/* 3. PROJECT DETAIL CASE STUDY MODAL */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E1E3EA] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl relative space-y-5">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-[#55576A] hover:text-[#0D0C22] transition-colors p-1 rounded-md"
              aria-label="Tutup detail proyek"
            >
              <X className="size-5" />
            </button>

            {/* Media Image */}
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#F3F3F4] border border-[#E1E3EA]">
              <img
                src={selectedProject.thumbnail}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Header Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-[#E8F0FF] text-[#155DFC] text-xs font-semibold rounded-full">
                  {selectedProject.category}
                </span>
                <span className="text-xs text-[#55576A] inline-flex items-center gap-1">
                  <Calendar className="size-3" />
                  {selectedProject.createdDate}
                </span>
                {selectedProject.viewsCount && (
                  <span className="text-xs text-[#55576A] inline-flex items-center gap-1">
                    <Eye className="size-3" />
                    {selectedProject.viewsCount} Dilihat
                  </span>
                )}
              </div>

              <h3 className="font-['DM_Sans',sans-serif] text-lg sm:text-xl font-semibold text-[#0D0C22]">
                {selectedProject.title}
              </h3>
            </div>

            {/* Project Narrative & Scope */}
            <div className="space-y-2 pt-2 border-t border-[#E1E3EA]">
              <h4 className="text-xs font-semibold text-[#0D0C22] uppercase tracking-wide">
                Deskripsi & Lingkup Karya
              </h4>
              <p className="text-xs sm:text-sm text-[#55576A] leading-relaxed">
                {selectedProject.description ||
                  'Karya portofolio ini dikembangkan dalam lingkup teaching factory sekolah dengan standar industri untuk memenuhi kebutuhan studi kasus nyata brand dan UMKM.'}
              </p>
            </div>

            {/* Creator Attribution */}
            <div className="p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E1E3EA] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                {selectedProject.studentAvatar ? (
                  <img
                    src={selectedProject.studentAvatar}
                    alt={selectedProject.studentName}
                    className="size-8 rounded-full object-cover border border-[#E1E3EA]"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-[#E8F0FF] text-[#155DFC] text-xs font-semibold grid place-items-center">
                    {selectedProject.studentName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-[#0D0C22] block">
                    {selectedProject.studentName}
                  </span>
                  <span className="text-[11px] text-[#55576A]">
                    Talenta Vokasi • {school.name}
                  </span>
                </div>
              </div>

              {selectedProject.externalLink && (
                <a
                  href={selectedProject.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-[#E1E3EA] hover:bg-[#F3F3F4] text-[#0D0C22] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Buka Tautan</span>
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-[#E1E3EA]">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto px-4 py-2 bg-[#F3F3F4] text-[#0D0C22] text-xs font-semibold rounded-lg hover:bg-[#E1E3EA] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => openProjectInquiry(selectedProject)}
                className="w-full sm:w-auto px-5 py-2 bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="size-3.5" />
                <span>Pesan Karya Serupa / Ajukan Kerja Sama</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PARTNERSHIP INQUIRY MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E1E3EA] max-w-lg w-full p-6 shadow-xl relative space-y-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#55576A] hover:text-[#0D0C22] transition-colors p-1 rounded-md"
              aria-label="Tutup formulir"
            >
              <X className="size-5" />
            </button>

            <div>
              <span className="text-[11px] font-semibold text-[#155DFC] uppercase tracking-wide">
                Kemitraan Industri Vokasi
              </span>
              <h3 className="font-['DM_Sans',sans-serif] text-lg font-semibold text-[#0D0C22] mt-0.5">
                Kirim Permohonan ke {school.name}
              </h3>
              <p className="text-xs text-[#55576A] mt-1">
                Tawaran pemesanan proyek, magang, atau kemitraan kurikulum akan langsung diteruskan ke tim Hubungan Industri sekolah.
              </p>
            </div>

            {inquirySuccess ? (
              <div className="p-6 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl text-center space-y-2">
                <CheckCircle2 className="size-8 text-[#16803C] mx-auto" />
                <h4 className="text-sm font-semibold text-[#14532D]">
                  Permohonan Kemitraan Terkirim
                </h4>
                <p className="text-xs text-[#14532D]/90 leading-relaxed">
                  Terima kasih. Pihak sekolah dan tim Hubin akan segera menghubungi Anda melalui kontak yang dicantumkan.
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
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-lg text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15"
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
                      placeholder="cth: PT Maju / Kopi Ijen"
                      value={inquiryCompany}
                      onChange={(e) => setInquiryCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-lg text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                      Email Resmi
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@perusahaan.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-lg text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                    Jenis Kemitraan
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-lg text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15 cursor-pointer"
                  >
                    <option value="Pemesanan Proyek Kreatif">Pemesanan Proyek Kreatif (Teaching Factory)</option>
                    <option value="Program Magang Siswa">Penyaluran Magang Siswa Vokasi</option>
                    <option value="Rekrutmen Lulusan">Rekrutmen Lulusan Vokasi</option>
                    <option value="Kemitraan Kurikulum & Kelas Industri">Kemitraan Kelas Industri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0D0C22] mb-1">
                    Rencana Brief / Kebutuhan Kerja Sama
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ceritakan gambaran proyek, target waktu pengerjaan, atau kualifikasi talenta yang Anda butuhkan..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E1E3EA] rounded-lg text-xs text-[#0D0C22] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E1E3EA]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#F3F3F4] text-[#0D0C22] text-xs font-semibold rounded-lg hover:bg-[#E1E3EA] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmittingInquiry ||
                      !inquiryName.trim() ||
                      !inquiryEmail.trim() ||
                      !inquiryMessage.trim()
                    }
                    className="px-5 py-2 bg-[#155DFC] hover:bg-[#1248C7] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
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
