'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { creatorService } from '@/services/creatorService';
import { Creator, CreatorService } from '@/types';
import { UploadServiceModal } from '@/components/modals/UploadServiceModal';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { Plus, Sparkles, Layers } from 'lucide-react';

const DEFAULT_CREATOR_SERVICES: CreatorService[] = [
  {
    id: 'demo-srv-1',
    title: 'Premium Figma SaaS Landing Page & Design System',
    tag: 'Figma Template',
    description: 'Template landing page SaaS conversion-ready dengan 30+ komponen auto-layout dan variabel token warna.',
    deliveryDays: '2 Hari Kerja',
    price: 1500000,
    formattedPrice: '🪙 1.500.000',
    coverImage: '/figma/service-figma.png',
    isActive: true,
  },
  {
    id: 'demo-srv-2',
    title: 'Full Framer Interactive Website Build + CMS',
    tag: 'Framer Site',
    description: 'Pengerjaan website interaktif dengan Framer Motion, animasi responsif mobile, dan integrasi CMS dinamis.',
    deliveryDays: '4 Hari Kerja',
    price: 3800000,
    formattedPrice: '🪙 3.800.000',
    coverImage: '/figma/service-framer.png',
    isActive: true,
  },
  {
    id: 'demo-srv-3',
    title: '3x Video TikTok UGC & Review Produk Hook Viral',
    tag: 'TikTok UGC',
    description: '3 video vertical 9:16 dengan angle problem-solution, hook 3 detik pertama, B-roll estetik, dan subtitle dinamis.',
    deliveryDays: '3 Hari Kerja',
    price: 2200000,
    formattedPrice: '🪙 2.200.000',
    coverImage: '/figma/service-tiktok.png',
    isActive: true,
  },
  {
    id: 'demo-srv-4',
    title: 'Brand Visual Identity Kit & Guidelines UMKM',
    tag: 'Branding',
    description: 'Panduan identitas logo primer/sekunder, palet warna, tipografi, dan mockup kemasan produk untuk UMKM.',
    deliveryDays: '5 Hari Kerja',
    price: 1800000,
    formattedPrice: '🪙 1.800.000',
    coverImage: '/figma/service-branding.png',
    isActive: false,
  },
];

export function CreatorServicesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState<CreatorService[]>(DEFAULT_CREATOR_SERVICES);
  const [creatorProfile, setCreatorProfile] = useState<Creator | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<CreatorService | null>(null);

  // Sync creator services from backend if user exists
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    creatorService
      .getCreatorDetail(user.id)
      .then((creator) => {
        if (!isMounted || !creator) return;
        setCreatorProfile(creator);
        if (creator.services && creator.services.length > 0) {
          const mapped = creator.services.map((s, idx) => ({
            ...s,
            isActive: s.isActive !== undefined ? s.isActive : (idx === 3 ? false : true),
            coverImage:
              s.coverImage ||
              (idx === 0
                ? '/figma/service-figma.png'
                : idx === 1
                ? '/figma/service-framer.png'
                : idx === 2
                ? '/figma/service-tiktok.png'
                : '/figma/service-branding.png'),
          }));
          setServices(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Fallback creator object for modals
  const activeCreator: Creator = useMemo(() => {
    if (creatorProfile) return creatorProfile;
    return {
      id: user?.id || 'demo-creator-1',
      name: user?.name || 'Sobakhul Munir Siroj',
      avatar: user?.avatar || '/figma/creator-avatar.png',
      roleTitle: 'Top Tier Product Designer & Figma/Framer Architect',
      category: 'Image',
      bio: 'Desainer antarmuka dan kreator digital fokus pada brand identity, landing page interaktif, dan video konten UGC.',
      location: user?.location || 'Jakarta, ID',
      startingRate: 1500000,
      formattedRate: '🪙 1.500.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 100,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 24,
        tier: 'Top Tier',
      },
      skills: ['Figma', 'Framer', 'UI/UX Design', 'Design Systems', 'TikTok UGC', 'Branding'],
      joinedDate: 'Januari 2024',
    };
  }, [creatorProfile, user]);

  const activeCount = useMemo(() => {
    return services.filter((s) => s.isActive !== false).length;
  }, [services]);

  const handleToggleServiceActive = async (serviceId: string) => {
    const target = services.find((s) => s.id === serviceId);
    if (!target) return;
    const newActive = target.isActive === false;

    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: newActive } : s))
    );

    if (!serviceId.startsWith('demo-') && !serviceId.startsWith('qa-') && !serviceId.startsWith('sm-')) {
      try {
        await fetch(`/api/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: newActive }),
        });
      } catch (err) {
        console.error('Failed to toggle service status:', err);
      }
    }

    showToast({
      type: 'success',
      title: newActive ? 'Layanan Diaktifkan' : 'Layanan Dinonaktifkan',
      message: newActive
        ? 'Layanan berhasil diaktifkan dan tayang di etalase Anda.'
        : 'Layanan disimpan sebagai draft (tidak tayang ke UMKM).',
    });
  };

  const handleDeleteService = async (serviceId: string, serviceTitle: string) => {
    if (!window.confirm(`Yakin ingin menghapus layanan "${serviceTitle}"?`)) return;

    setServices((prev) => prev.filter((s) => s.id !== serviceId));

    if (!serviceId.startsWith('demo-') && !serviceId.startsWith('qa-') && !serviceId.startsWith('sm-')) {
      try {
        await fetch(`/api/services/${serviceId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete service:', err);
      }
    }

    showToast({
      type: 'info',
      title: 'Layanan Dihapus',
      message: `Layanan "${serviceTitle}" telah berhasil dihapus.`,
    });
  };

  const handleUploadSuccess = (newService: CreatorService) => {
    setServices((prev) => [newService, ...prev]);
    setIsUploadModalOpen(false);
    showToast({
      type: 'success',
      title: 'Layanan Ditambahkan',
      message: `Paket layanan "${newService.title}" berhasil ditambahkan ke etalase Anda!`,
    });
  };

  return (
    <div className="min-h-screen w-full flex-1 overflow-y-auto bg-[#F8F9FC] text-[#0D0C22]">
      {/* Outer Container matching Figma padding 32px */}
      <div className="mx-auto max-w-[1728px] p-6 sm:p-8 lg:p-10">
        
        {/* ==================================================================== */}
        {/* HEADER SECTION (Figma Node 5414:15483)                                */}
        {/* ==================================================================== */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-2">
          <div className="max-w-[720px]">
            <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-[34px] sm:leading-[36px] tracking-[-0.012em] text-[#0D0C22]">
              Manajemen Layanan Kreator
            </h1>
            <p className="mt-1.5 text-[14px] font-normal leading-[22.75px] tracking-[-0.0107em] text-[#737373]">
              Kelola paket jasa, tarif komersial, durasi pengerjaan, dan status aktif layanan yang Anda tawarkan kepada brand & UMKM.
            </p>
          </div>

          {/* Quick Header Actions & Status Pill */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-full border border-[rgba(229,229,229,0.9)] bg-white px-3.5 py-2 text-[12px] font-medium text-[#737373] shadow-[0px_1px_0px_0px_rgba(0,0,0,0.05)]">
              <span className="size-2 rounded-full bg-[#00BC7D]" />
              <span className="font-semibold text-[#0D0C22]">{activeCount}</span>
              <span>dari {services.length} Layanan Aktif</span>
            </div>

            <button
              id="btn-header-tambah-layanan"
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#0D0C22] px-4 py-2 text-[12px] font-bold text-white shadow-xs transition hover:bg-neutral-800 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Tambah Layanan</span>
            </button>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* RESPONSIVE GRID CONTAINER (Matching UMKM card scale)                 */}
        {/* ==================================================================== */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          
          {/* ------------------------------------------------------------------ */}
          {/* ITEM 1: Upload Proyek Tile (Compact scale)                         */}
          {/* ------------------------------------------------------------------ */}
          <button
            id="btn-upload-service-tile"
            data-testid="btn-upload-service-tile"
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="group relative flex min-h-[300px] sm:min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#ACACAC] bg-white p-5 sm:p-6 text-center transition-all hover:border-[#0D0C22] hover:bg-neutral-50/50 cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex flex-col items-center justify-center max-w-[240px]">
              {/* Plus Vector Icon */}
              <div className="flex items-center justify-center">
                <svg
                  width="44"
                  height="36"
                  viewBox="0 0 64 53"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#B0B0B0] group-hover:text-[#0D0C22] transition-colors"
                >
                  <path d="M32.3297 0V52.9998" stroke="currentColor" strokeWidth="4" />
                  <path d="M63.729 26.8841H0.000499456" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>

              {/* Tile Headline */}
              <h2 className="mt-4 text-base sm:text-lg font-bold leading-tight text-black group-hover:text-[#0D0C22]">
                Upload Proyek
              </h2>

              {/* Tile Subtitle */}
              <p className="mt-1.5 text-xs font-normal leading-relaxed text-neutral-500">
                Show off your best work. Get feedback, likes and be a part of a growing community.
              </p>
            </div>
          </button>

          {/* ------------------------------------------------------------------ */}
          {/* SERVICE CARDS (Matching UMKM Card Dimensions)                      */}
          {/* ------------------------------------------------------------------ */}
          {services.map((srv) => (
            <div
              key={srv.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E1E3EA] bg-white p-3.5 sm:p-4 text-left shadow-[0px_1px_2px_rgba(13,12,34,0.06)] hover:border-[#B7BBC9] hover:shadow-md transition-all"
            >
              <div>
                {/* Cover Image Container (UMKM aspect 16/10) */}
                <div
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 cursor-pointer"
                  title="Lihat detail layanan"
                >
                  {srv.coverImage ? (
                    <img
                      src={srv.coverImage}
                      alt={srv.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/figma/service-figma.png';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                      <span className="text-xs font-semibold text-neutral-400">
                        {srv.tag || srv.category || 'Layanan'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Tag */}
                <div className="mt-3">
                  <span className="inline-block rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#55576A]">
                    {srv.tag || srv.category || 'Layanan'}
                  </span>
                </div>

                {/* Service Title */}
                <h3
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="mt-2 cursor-pointer font-display font-semibold text-sm sm:text-[15px] leading-snug text-[#0D0C22] transition-colors group-hover:text-[#155DFC] line-clamp-2"
                  title="Lihat detail layanan"
                >
                  {srv.title}
                </h3>

                {/* Description */}
                <p
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="mt-1 line-clamp-2 cursor-pointer text-xs leading-relaxed text-[#55576A]"
                >
                  {srv.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                </p>

                {/* Duration / Estimasi */}
                <div
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="mt-2.5 flex cursor-pointer items-center gap-1.5 text-xs text-[#55576A]"
                >
                  {/* Clock SVG (13x13) */}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 text-[#6F7285]"
                  >
                    <path
                      d="M7 3.5V7L9.33333 8.16667"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.99935 12.8337C10.221 12.8337 12.8327 10.222 12.8327 7.00033C12.8327 3.77866 10.221 1.16699 6.99935 1.16699C3.77769 1.16699 1.16602 3.77866 1.16602 7.00033C1.16602 10.222 3.77769 12.8337 6.99935 12.8337Z"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    Estimasi:{' '}
                    {srv.deliveryDays
                      ? srv.deliveryDays.toLowerCase().includes('hari')
                        ? srv.deliveryDays
                        : `${srv.deliveryDays} Hari Kerja`
                      : '2-3 Hari Kerja'}
                  </span>
                </div>
              </div>

              {/* Footer / Bottom Row */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F3F4F6] pt-3">
                {/* Price column */}
                <div
                  onClick={() => setSelectedServiceForDetail(srv)}
                  className="cursor-pointer min-w-0"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6F7285] leading-none">
                    HARGA
                  </span>
                  <span className="block truncate text-sm sm:text-base font-bold leading-tight text-[#0D0C22] mt-0.5">
                    {srv.formattedPrice
                      ? srv.formattedPrice.replace(/^Rp\s?/, '🪙 ')
                      : (srv.price ? `🪙 ${srv.price.toLocaleString('id-ID')}` : '🪙 1.500.000')}
                  </span>
                </div>

                {/* Action Buttons: Toggle Active + Trash */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Toggle Active / Nonaktifkan */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleServiceActive(srv.id);
                    }}
                    className={`rounded-full border border-[#E1E3EA] px-2.5 sm:px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      srv.isActive !== false
                        ? 'text-[#404040] hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                        : 'text-[#404040] hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {srv.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  {/* Trash Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteService(srv.id, srv.title);
                    }}
                    className="flex size-7 items-center justify-center rounded-full border border-[#E1E3EA] text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    title="Hapus Layanan"
                    aria-label="Hapus Layanan"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0"
                    >
                      <path
                        d="M5.83398 6.41699V9.91699"
                        stroke="currentColor"
                        strokeWidth="1.17"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.16602 6.41699V9.91699"
                        stroke="currentColor"
                        strokeWidth="1.17"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.0827 3.5V11.6667C11.0827 11.9761 10.9598 12.2728 10.741 12.4916C10.5222 12.7104 10.2254 12.8333 9.91602 12.8333H4.08268C3.77326 12.8333 3.47652 12.7104 3.25772 12.4916C3.03893 12.2728 2.91602 11.9761 2.91602 11.6667V3.5"
                        stroke="currentColor"
                        strokeWidth="1.17"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1.75 3.5H12.25"
                        stroke="currentColor"
                        strokeWidth="1.17"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.66602 3.50033V2.33366C4.66602 2.02424 4.78893 1.72749 5.00772 1.5087C5.22652 1.28991 5.52326 1.16699 5.83268 1.16699H8.16602C8.47543 1.16699 8.77218 1.28991 8.99097 1.5087C9.20977 1.72749 9.33268 2.02424 9.33268 2.33366V3.50033"
                        stroke="currentColor"
                        strokeWidth="1.17"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODALS                                                               */}
      {/* ==================================================================== */}
      <UploadServiceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        creator={activeCreator}
        onSuccess={handleUploadSuccess}
      />

      {selectedServiceForDetail && (
        <ServiceDetailModal
          service={selectedServiceForDetail}
          creator={activeCreator}
          onClose={() => setSelectedServiceForDetail(null)}
          onSelectOtherService={(srv) => setSelectedServiceForDetail(srv)}
        />
      )}
    </div>
  );
}
