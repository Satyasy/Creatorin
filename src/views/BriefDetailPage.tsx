'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Share2,
  Globe,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  Users,
  Star,
  Check,
  Briefcase,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { creatorService } from '@/services/creatorService';
import type { ActivePage, AuthState, Creator, ProjectListing } from '@/types';
import { Footer } from '@/components/layout/Footer';

type Application = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorHeadline?: string;
  proposedPrice: string;
  pitch: string;
  status: string;
  rating?: number;
  reviewsCount?: number;
  completedProjects?: number;
  careerScore?: number;
  duration?: string;
  location?: string;
};

interface Props {
  brief: ProjectListing;
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onClose?: () => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onEditBrief?: (brief: ProjectListing) => void;
}

interface OtherBriefItem {
  id: string;
  category: string;
  timeAgo: string;
  title: string;
  description: string;
  tags: string[];
  budget: string;
}

const DEFAULT_APPLICANTS: Application[] = [
  {
    id: 'app-1',
    creatorId: 'creator-alya',
    creatorName: 'Alya Rahmadhani',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 42,
    completedProjects: 42,
    proposedPrice: 'Rp1.500.000',
    location: 'Jakarta Selatan',
    careerScore: 98,
    duration: '3 Hari Kerja',
    pitch:
      'Halo tim Kopi Kenangan Senja! Saya sangat tertarik memproduksi 3 video Reels & TikTok untuk menu Cold Brew Caramel ini. Saya terbiasa menyusun visual hook ASMR pouring yang memikat pada 3 detik pertama dengan pencahayaan studio aesthetic dan voiceover yang natural. Rata-rata video kolaborasi saya ditonton 45k-120k views di TikTok.',
    status: 'pending',
  },
  {
    id: 'app-2',
    creatorId: 'creator-dimas',
    creatorName: 'Dimas Pratama',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.85,
    reviewsCount: 29,
    completedProjects: 29,
    proposedPrice: 'Rp1.450.000',
    location: 'Bandung',
    careerScore: 96,
    duration: '4 Hari Kerja',
    pitch:
      'Siap menghadirkan 3 konten video berkualitas kamera Sony Cinema Line dengan lensa makro untuk menonjolkan tekstur swirl caramel dan es batu. Sudah termasuk color grading coffee tone khas kafe modern, royalty-free audio trending, dan 2x opsi revisi.',
    status: 'pending',
  },
  {
    id: 'app-3',
    creatorId: 'creator-nabila',
    creatorName: 'Nabila Salsabila',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewsCount: 18,
    completedProjects: 18,
    proposedPrice: 'Rp1.500.000',
    location: 'Jakarta Barat',
    careerScore: 95,
    duration: '3 Hari Kerja',
    pitch:
      'Konsep yang saya tawarkan berfokus pada "Relatable Daily WFH Hustle": bagaimana cold brew caramel ini jadi booster mood saat deadline kerjaan. Format video sangat engaging, ekspresif, dan disisipi stiker promo untuk memicu direct click ke link pembelian.',
    status: 'pending',
  },
  {
    id: 'app-4',
    creatorId: 'creator-sobakhul',
    creatorName: 'Sobakhul Munir Siroj',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewsCount: 144,
    completedProjects: 144,
    proposedPrice: 'Rp1.600.000',
    location: 'Jakarta Selatan',
    careerScore: 98,
    duration: '5 Hari Kerja',
    pitch:
      'Saya menawarkan produksi Reels yang dilengkapi kinetic typography animasi modern untuk teks promo & pricing, sehingga visual tampil sekelas iklan brand global dengan retensi penonton yang tinggi.',
    status: 'pending',
  },
];

const DEFAULT_OTHER_BRIEFS: OtherBriefItem[] = [
  {
    id: 'other-brief-1',
    category: 'Logo & Branding',
    timeAgo: '5 jam yang lalu',
    title: 'Desain Identitas Visual, Logo Brand, & Packaging Box',
    description: 'Mencari graphic designer berpengalaman di bidang beauty & lifestyle untuk brand skincare lokal baru.',
    tags: ['Logo Design', 'Packaging', 'Brand Identity', 'Adobe Illustrator'],
    budget: 'Rp3.000.000',
  },
  {
    id: 'other-brief-2',
    category: 'Foto Produk',
    timeAgo: '1 hari yang lalu',
    title: 'Foto Katalog Produk & Lifestyle Shoot 12 Artikel Baju',
    description: 'Dibutuhkan fotografer produk fashion untuk sesi photoshoot 12 artikel pakaian streetwear dengan model.',
    tags: ['Foto Produk', 'Fashion Photography', 'Adobe Lightroom', 'Color Grading'],
    budget: 'Rp2.000.000',
  },
  {
    id: 'other-brief-3',
    category: 'Feed Instagram',
    timeAgo: '1 hari yang lalu',
    title: 'Paket Desain 15 Feed Instagram Carousel & Story',
    description: 'Kami membutuhkan desainer grafis untuk membuat 15 konten visual interaktif dan layout grid feed bulanan.',
    tags: ['Feed Instagram', 'Figma', 'Social Media Design', 'Typography'],
    budget: 'Rp1.800.000',
  },
];

export function BriefDetailPage({
  brief,
  currentUser,
  onNavigate,
  onClose,
  onViewCreatorProfile,
  onEditBrief,
}: Props) {
  const router = useRouter();
  const { user: sessionUser } = useAuth();
  const user = currentUser === undefined ? sessionUser : currentUser;

  const [currentBrief, setCurrentBrief] = useState(brief);
  const [businessId, setBusinessId] = useState('');
  const [applications, setApplications] = useState<Application[]>(DEFAULT_APPLICANTS);
  const [myApplication, setMyApplication] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState(brief.formattedBudget || 'Rp1.500.000');
  const [pitch, setPitch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Smooth mount/close animation
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const isOwner = Boolean(user?.id && user.id === businessId);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleSmoothClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        router.push('/briefs');
      }
    }, 240);
  }, [onClose, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isApplyModalOpen) {
          setIsApplyModalOpen(false);
        } else {
          handleSmoothClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSmoothClose, isApplyModalOpen]);

  // Fetch brief details and applicants
  useEffect(() => {
    let active = true;
    fetch(`/api/briefs/${encodeURIComponent(brief.id)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        if (data.brief) {
          setBusinessId(data.brief.businessId || '');
          if (data.applications && data.applications.length > 0) {
            setApplications(data.applications);
          }
          setMyApplication(Boolean(data.myApplication));
          setCurrentBrief((prev) => ({
            ...prev,
            title: data.brief.title || prev.title,
            category: data.brief.category || prev.category,
            description: data.brief.description || prev.description,
            formattedBudget: data.brief.budget || prev.formattedBudget,
            deadline: data.brief.deadline || prev.deadline,
            clientName: data.brief.companyName || prev.clientName,
            clientLocation: data.brief.businessLocation || prev.clientLocation,
            clientAvatar: data.brief.businessAvatar || prev.clientAvatar,
            proposalsCount: data.applicationsCount || prev.proposalsCount,
          }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [brief.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Tautan brief berhasil disalin ke clipboard');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleOpenApply = () => {
    if (isOwner) {
      setToastMessage('Anda adalah pemilik brief ini.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/briefs/${brief.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, proposedPrice }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim proposal.');
      setMyApplication(true);
      setIsApplyModalOpen(false);
      setToastMessage('Lamaran Anda berhasil dikirim ke pemilik brief!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal mengirim proposal.');
    } finally {
      setBusy(false);
    }
  };

  const viewCreator = async (creatorId: string) => {
    if (onViewCreatorProfile) {
      const creator = await creatorService.getCreatorDetail(creatorId).catch(() => null);
      if (creator) onViewCreatorProfile(creator);
    } else {
      router.push(`/creator/${creatorId}`);
    }
  };

  // Header display details
  const clientName = currentBrief.clientName || 'Kopi Kenangan Senja';
  const clientAvatar =
    currentBrief.clientAvatar ||
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=150&auto=format&fit=crop&q=80';
  const clientDomain = `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.creatorin.id`;
  const clientEmail = `halo@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const clientLocation = currentBrief.clientLocation || 'Jakarta Selatan';

  // Brief description fallback
  const briefDescription =
    currentBrief.description ||
    'Kami membutuhkan kreator video UGC yang aktif dan ekspresif untuk membuat 3 video reels/TikTok promosi menu baru Cold Brew Caramel. Konsep video: First impression review, aesthetic pouring B-roll, dan ASMR unboxing. Produk akan kami kirimkan ke alamat kreator.';

  // Tags
  const tags =
    currentBrief.requiredSkills && currentBrief.requiredSkills.length > 0
      ? currentBrief.requiredSkills.map((s) => (s.startsWith('#') ? s : `#${s.replace(/\s+/g, '')}`))
      : ['#TikTokUGC', '#ReelsInstagram', '#FoodVideography', '#Voiceover', '#CapCutPro'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail Brief: ${currentBrief.title}`}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-[#0D0C22] text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dimmed Overlay Backdrop */}
      <div
        onClick={handleSmoothClose}
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ease-out cursor-pointer ${
          mounted && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Fixed Close Button Top Right */}
      <button
        type="button"
        onClick={handleSmoothClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-6 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
        aria-label="Tutup Detail Brief"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Smooth Bottom Sheet Container */}
      <div
        ref={scrollContainerRef}
        className={`relative z-10 w-full h-[94vh] sm:h-[92vh] overflow-y-auto overscroll-contain transform-gpu [will-change:transform,scroll-position] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted && !isClosing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="w-full bg-white rounded-t-[28px] sm:rounded-t-[36px] shadow-2xl min-h-full flex flex-col justify-between">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
            {/* 1. Header: Client Info & Actions */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-3.5">
                <img
                  src={clientAvatar}
                  alt={clientName}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-black/5 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-base sm:text-lg text-[#0D0C22] truncate">
                    {clientName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#55576A]">
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#55576A] shrink-0" />
                      <span>{clientDomain}</span>
                    </span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#55576A] shrink-0" />
                      <span>{clientEmail}</span>
                    </span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#55576A] shrink-0" />
                      <span>{clientLocation}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-[#E1E3EA] bg-white hover:bg-[#F4F5F7] text-[#0D0C22] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Bagikan Brief"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenApply}
                  className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-98 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{myApplication ? 'Sudah Dilamar' : 'Lamar'}</span>
                </button>
              </div>
            </header>

            {/* 2. Brief Header Info: Category Badge & Title */}
            <div className="mt-7">
              <span className="inline-block bg-[#F4F5F7] text-[#55576A] text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {currentBrief.category || 'Reels Instagram'}
              </span>

              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[32px] text-[#0D0C22] mt-3 leading-tight tracking-tight">
                {currentBrief.title}
              </h1>
            </div>

            {/* 3. 3 Highlight Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-7">
              {/* Card 1: Anggaran Proyek */}
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6F7285] uppercase tracking-wider">
                  <span>ANGGARAN PROYEK</span>
                  <CreditCard className="w-4 h-4 text-[#6F7285]" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#0D0C22]">
                    {currentBrief.formattedBudget || 'Rp1.500.000'}
                  </div>
                  <div className="text-xs text-[#55576A] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#6F7285]" />
                    <span>Diskusikan Terlebih Dahulu</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Waktu Pengerjaan */}
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6F7285] uppercase tracking-wider">
                  <span>WAKTU PENGERJAAN</span>
                  <Clock className="w-4 h-4 text-[#6F7285]" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#0D0C22]">
                    {currentBrief.deadline || '5 Hari Kerja'}
                  </div>
                  <div className="text-xs text-[#55576A] mt-1">Maksimal 2x revisi</div>
                </div>
              </div>

              {/* Card 3: Pelamar Terdaftar */}
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6F7285] uppercase tracking-wider">
                  <span>PELAMAR TERDAFTAR</span>
                  <Users className="w-4 h-4 text-[#6F7285]" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#0D0C22]">
                    {applications.length} Kreator
                  </div>
                  <div className="text-xs text-[#55576A] mt-1">1 Masuk Shortlist</div>
                </div>
              </div>
            </div>

            {/* 4. Description Paragraph */}
            <div className="mt-7">
              <p className="text-sm sm:text-base text-[#55576A] leading-relaxed max-w-4xl">
                {briefDescription}
              </p>
            </div>

            {/* 5. Tags Row */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              {tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="bg-[#F4F5F7] text-[#55576A] hover:text-[#0D0C22] text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 6. Daftar Kreator yang Mengajukan Lamaran */}
            <section aria-label="Daftar Pelamar" className="mt-12 sm:mt-14 pt-8 border-t border-[#F3F4F6]">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-[#0D0C22]">
                  Daftar Kreator yang Mengajukan Lamaran ({applications.length})
                </h3>
                <p className="text-xs text-[#55576A] mt-0.5">
                  Kreator terverifikasi yang siap mengeksekusi brief ini lengkap dengan portofolio relevan
                </p>
              </div>

              <div className="space-y-4 mt-5">
                {applications.map((app) => (
                  <article
                    key={app.id}
                    className="rounded-2xl border border-[#E1E3EA] bg-white p-5 hover:border-[#B7BBC9] transition-all space-y-3 shadow-xs"
                  >
                    {/* Applicant Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            app.creatorAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={app.creatorName}
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-black/5 shrink-0 cursor-pointer"
                          onClick={() => viewCreator(app.creatorId)}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              onClick={() => viewCreator(app.creatorId)}
                              className="font-display font-semibold text-sm sm:text-base text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors"
                            >
                              {app.creatorName}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D0C22]">
                              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                              <span>{app.rating || 4.9}</span>
                              <span className="text-[#55576A] font-normal">({app.reviewsCount || 40})</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16803C]">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>{app.completedProjects || 40} proyek selesai</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-[#55576A]">
                            <span className="font-medium text-[#0D0C22]">Tawaran {app.proposedPrice}</span>
                            <span>&middot;</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#6F7285]" />
                              {app.location || 'Indonesia'}
                            </span>
                            <span>&middot;</span>
                            <span>
                              <strong className="font-semibold text-[#0D0C22]">
                                {app.careerScore || 96}%
                              </strong>{' '}
                              Skor Karir
                            </span>
                            <span>&middot;</span>
                            <span>Waktu {app.duration || '3 Hari Kerja'}</span>
                          </div>
                        </div>
                      </div>

                      {isOwner && app.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            setToastMessage(`Proposal ${app.creatorName} diterima!`);
                            setTimeout(() => setToastMessage(null), 2500);
                          }}
                          className="self-end sm:self-auto rounded-full bg-[#0D0C22] hover:bg-black text-white px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                        >
                          Terima Proposal
                        </button>
                      )}
                    </div>

                    {/* Pitch Description */}
                    <p className="text-xs sm:text-[13px] text-[#55576A] leading-relaxed pt-1">
                      {app.pitch}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* 7. Brief Proyek Lainnya yang Sedang Aktif */}
            <section aria-label="Brief Lainnya" className="mt-12 sm:mt-14 pt-8 border-t border-[#F3F4F6]">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-display font-bold text-base sm:text-lg text-[#0D0C22]">
                  Brief Proyek Lainnya yang Sedang Aktif
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    handleSmoothClose();
                    if (onNavigate) {
                      onNavigate('briefs');
                    } else {
                      router.push('/briefs');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#55576A] hover:text-[#0D0C22] hover:underline cursor-pointer"
                >
                  <span>Lihat Semua Brief</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                {DEFAULT_OTHER_BRIEFS.map((other) => (
                  <article
                    key={other.id}
                    className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-xs hover:border-[#B7BBC9] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Category badge & Time posted */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-[#F4F5F7] text-[#55576A] text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase">
                          {other.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-[#6F7285]">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{other.timeAgo}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-display font-semibold text-sm sm:text-[15px] text-[#0D0C22] group-hover:text-[#155DFC] transition-colors leading-snug line-clamp-2 mt-3">
                        {other.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-[#55576A] line-clamp-2 mt-1.5 leading-relaxed">
                        {other.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {other.tags.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="bg-[#F8F9FA] border border-[#E1E3EA]/60 text-[#55576A] text-[10px] font-medium px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Bar: Anggaran & Tombol Lamar */}
                    <div className="pt-3 border-t border-[#F3F4F6] mt-4 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6F7285] tracking-wider block leading-none">
                          Estimasi Anggaran
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#0D0C22] mt-0.5 block leading-tight">
                          {other.budget}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenApply}
                        className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Lamar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Footer at the bottom of the modal */}
          <div className="border-t border-[#F3F4F6] mt-12 sm:mt-16 w-full">
            <Footer onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      {/* Apply Proposal Modal Dialog */}
      {isApplyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#0D0C22]">Ajukan Lamaran Brief</h3>
                <p className="text-xs text-[#55576A] mt-0.5">{currentBrief.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F4F5F7] flex items-center justify-center text-[#55576A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={submitApplication} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#0D0C22] mb-1.5">
                  Tawaran Biaya (IDR)
                </label>
                <input
                  type="text"
                  required
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="Contoh: Rp1.500.000"
                  className="w-full rounded-xl border border-[#E1E3EA] px-3.5 py-2.5 text-xs text-[#0D0C22] focus:outline-hidden focus:ring-2 focus:ring-[#155DFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0D0C22] mb-1.5">
                  Pitch & Konsep Eksekusi Anda
                </label>
                <textarea
                  required
                  rows={4}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Jelaskan pendekatan kreatif, pengalaman serupa, dan apa yang membuat Anda tepat untuk brief ini..."
                  className="w-full rounded-xl border border-[#E1E3EA] p-3 text-xs text-[#0D0C22] focus:outline-hidden focus:ring-2 focus:ring-[#155DFC] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E1E3EA] text-xs font-semibold text-[#55576A] hover:bg-[#F4F5F7] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2 rounded-full bg-[#0D0C22] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim Lamaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
