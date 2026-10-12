'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  Bookmark, 
  Check, 
  ChevronDown, 
  Layers, 
  MapPin, 
  Package, 
  Search, 
  Star, 
  User, 
  X 
} from 'lucide-react';
import { creatorService } from '@/services/creatorService';
import { useAuth } from '@/providers/AuthProvider';
import { FeedProject } from '@/types';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

const ProjectBriefModal = dynamic(
  () => import('@/components/modals/ProjectBriefModal').then((mod) => mod.ProjectBriefModal),
  { ssr: false }
);

interface ShowcaseService {
  id: string;
  tag: string;
  title: string;
  price: string;
  duration: string;
  image: string;
}

interface ShowcaseCreator {
  id: string;
  slug?: string;
  name: string;
  avatar: string;
  location: string;
  startingRateText: string;
  careerScore: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  servicesCount: number;
  proBadge: boolean;
  isPromoted: boolean;
  services: ShowcaseService[];
  skills: string[];
}

const INITIAL_SHOWCASE_CREATORS: ShowcaseCreator[] = [
  {
    id: 'creator-qaesyaar-aqeel',
    slug: 'qaesyaar-aqeel',
    name: 'Qaesyaar Aqeel',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    location: 'Bandung, Jawa Barat',
    startingRateText: 'Mulai Rp200.000/proyek',
    careerScore: 95,
    rating: 5.0,
    reviewCount: 88,
    completedProjects: 88,
    servicesCount: 10,
    proBadge: true,
    isPromoted: true,
    services: [
      {
        id: 'svc-qa-1',
        tag: 'Brand Identity',
        title: 'Desain Identitas Brand & Logo UMKM',
        price: 'Rp100.000',
        duration: '3 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-qa-2',
        tag: 'Feed Instagram',
        title: 'Desain Feed Instagram Aesthetic (9 Grid)',
        price: 'Rp50.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-qa-3',
        tag: 'Kemasan',
        title: 'Packaging & Label Design Siap Cetak',
        price: 'Rp70.000',
        duration: '3 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-qa-4',
        tag: 'Banner',
        title: 'Banner Promo E-Commerce & Marketplace',
        price: 'Rp120.000',
        duration: '1 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      },
    ],
    skills: ['Brand Identity', 'Product Photography', 'Packaging', 'Social Media Feed', 'UI Mockups', '+2 keahlian lainnya'],
  },
  {
    id: 'creator-sarah-amelia',
    slug: 'sarah.amelia',
    name: 'Sarah Amelia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Jakarta Selatan',
    startingRateText: 'Mulai Rp250.000/proyek',
    careerScore: 96,
    rating: 4.9,
    reviewCount: 42,
    completedProjects: 42,
    servicesCount: 8,
    proBadge: true,
    isPromoted: true,
    services: [
      {
        id: 'svc-sa-1',
        tag: 'Video TikTok',
        title: 'Video UGC Review & Problem-Solution Ads',
        price: 'Rp250.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-sa-2',
        tag: 'Reels Instagram',
        title: 'Reels Aesthetic Cinematic Lifestyle Product',
        price: 'Rp300.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-sa-3',
        tag: 'Storytelling',
        title: 'Unboxing & First Impression Brand Video',
        price: 'Rp200.000',
        duration: '1 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-sa-4',
        tag: 'Foto Produk',
        title: 'Foto Produk Katalog Instagram & Marketplace',
        price: 'Rp180.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      },
    ],
    skills: ['Video TikTok', 'Reels Instagram', 'UGC Content', 'Short-Form Video', 'Foto Produk', '+3 keahlian lainnya'],
  },
  {
    id: 'creator-kevin-sanjaya',
    slug: 'kevinsanjaya',
    name: 'Kevin Sanjaya',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Surabaya, Jawa Timur',
    startingRateText: 'Mulai Rp400.000/proyek',
    careerScore: 98,
    rating: 5.0,
    reviewCount: 65,
    completedProjects: 65,
    servicesCount: 12,
    proBadge: true,
    isPromoted: false,
    services: [
      {
        id: 'svc-ks-1',
        tag: 'Motion Graphic',
        title: 'Animasi Logo 3D Intro & Outro Video',
        price: 'Rp350.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-ks-2',
        tag: 'Video Iklan',
        title: 'Video Promosi Motion Reel 15 Detik High Conversion',
        price: 'Rp450.000',
        duration: '3 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-ks-3',
        tag: 'Brand Identity',
        title: 'Panduan Identitas Brand Digital & Design System',
        price: 'Rp600.000',
        duration: '4 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-ks-4',
        tag: 'UI Mockups',
        title: 'Interactive Mobile App Demo Video & Landing Page',
        price: 'Rp400.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      },
    ],
    skills: ['Motion Graphic', 'Video Iklan', 'Logo 3D', 'Brand Identity', 'Explainer Video', '+4 keahlian lainnya'],
  },
  {
    id: 'creator-anisa-rahma',
    slug: 'anisa_creative',
    name: 'Anisa Rahma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    location: 'Yogyakarta',
    startingRateText: 'Mulai Rp200.000/proyek',
    careerScore: 94,
    rating: 4.9,
    reviewCount: 52,
    completedProjects: 52,
    servicesCount: 9,
    proBadge: true,
    isPromoted: false,
    services: [
      {
        id: 'svc-ar-1',
        tag: 'Kemasan',
        title: 'Label Kemasan Standing Pouch & Box Packaging',
        price: 'Rp150.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-ar-2',
        tag: 'Feed Instagram',
        title: 'Template Feed & Story Instagram Canva/Figma',
        price: 'Rp120.000',
        duration: '1 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-ar-3',
        tag: 'Poster Promosi',
        title: 'Poster & Banner Digital Menu Kuliner',
        price: 'Rp90.000',
        duration: '1 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-ar-4',
        tag: 'Branding',
        title: 'Desain Kartu Nama, Nota & Brand Collateral',
        price: 'Rp100.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
      },
    ],
    skills: ['Kemasan Produk', 'Feed Instagram', 'Logo UMKM', 'Poster Promosi', 'Brosur', '+2 keahlian lainnya'],
  },
  {
    id: 'creator-budi-pratama',
    slug: 'budipratama',
    name: 'Budi Pratama',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Malang, Jawa Timur',
    startingRateText: 'Mulai Rp350.000/proyek',
    careerScore: 92,
    rating: 4.8,
    reviewCount: 35,
    completedProjects: 35,
    servicesCount: 7,
    proBadge: true,
    isPromoted: false,
    services: [
      {
        id: 'svc-bp-1',
        tag: 'Foto Produk',
        title: 'Foto Produk Studio Komersial White Background',
        price: 'Rp250.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-bp-2',
        tag: 'Lookbook',
        title: 'Foto Fashion & Lookbook Katalog UMKM',
        price: 'Rp350.000',
        duration: '3 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-bp-3',
        tag: 'Kuliner',
        title: 'Food Photography & Lighting Minuman Kekinian',
        price: 'Rp200.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'svc-bp-4',
        tag: 'Banner Promo',
        title: 'Foto Hero Header Website & Marketplace Store',
        price: 'Rp220.000',
        duration: '2 Hari Kerja',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      },
    ],
    skills: ['Foto Produk', 'Food Photography', 'Komersial', 'Lighting Studio', 'Retouching', '+3 keahlian lainnya'],
  },
];

export const UMKMDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'creator' | 'layanan' | 'proyek'>('creator');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCreators, setSavedCreators] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [showcaseCreators, setShowcaseCreators] = useState<ShowcaseCreator[]>(INITIAL_SHOWCASE_CREATORS);

  useEffect(() => {
    creatorService
      .getCreators()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          // Merge dynamic creators from DB while preserving the 4 showcase cards layout
          const mapped: ShowcaseCreator[] = fetched.slice(0, 5).map((fc, index) => {
            const fallback = INITIAL_SHOWCASE_CREATORS[index % INITIAL_SHOWCASE_CREATORS.length];
            return {
              id: fc.id,
              slug: fc.username || fc.id,
              name: fc.name,
              avatar: fc.avatar || fallback.avatar,
              location: fc.location || fallback.location,
              startingRateText: fc.formattedRate ? `Mulai ${fc.formattedRate}/proyek` : fallback.startingRateText,
              careerScore: Number(fc.careerScore?.overall || fallback.careerScore),
              rating: Number(fc.rating || fallback.rating),
              reviewCount: Number(fc.reviewCount || fallback.reviewCount),
              completedProjects: Number(fc.careerScore?.completedProjects || fallback.completedProjects),
              servicesCount: Number(fc.services?.length || fallback.servicesCount),
              proBadge: fc.proBadge ?? fallback.proBadge,
              isPromoted: fc.isPromoted ?? fallback.isPromoted,
              services: fallback.services,
              skills: fc.skills && fc.skills.length > 0 ? [...fc.skills.slice(0, 5), `+${Math.max(2, fc.skills.length - 5)} keahlian lainnya`] : fallback.skills,
            };
          });
          setShowcaseCreators(mapped);
        }
      })
      .catch(() => {
        // Keep initial showcase creators
      });
  }, []);

  const toggleBookmark = (creatorId: string) => {
    setSavedCreators((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  const handleTabChange = (tab: 'creator' | 'layanan' | 'proyek') => {
    setActiveTab(tab);
    if (tab === 'layanan') {
      router.push('/jelajah/layanan');
    } else if (tab === 'proyek') {
      router.push('/jelajah/proyek');
    }
  };

  const filteredCreators = useMemo(() => {
    let list = [...showcaseCreators];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter((creator) => {
        const matchesName = creator.name.toLowerCase().includes(query);
        const matchesLocation = creator.location.toLowerCase().includes(query);
        const matchesSkill = creator.skills.some((s) => s.toLowerCase().includes(query));
        const matchesService = creator.services.some(
          (s) => s.title.toLowerCase().includes(query) || s.tag.toLowerCase().includes(query)
        );
        return matchesName || matchesLocation || matchesSkill || matchesService;
      });
    }

    return list;
  }, [showcaseCreators, searchQuery]);

  const handleServiceClick = (service: ShowcaseService, creator: ShowcaseCreator) => {
    const feedProjectMock: FeedProject = {
      id: service.id,
      title: service.title,
      description: `${service.title} oleh ${creator.name}. Pengerjaan estimasi ${service.duration} dengan jaminan revisi dan proteksi escrow.`,
      coverImage: service.image,
      mediaUrl: service.image,
      mediaType: 'image',
      creatorId: creator.id,
      creator: {
        id: creator.id,
        name: creator.name,
        username: creator.slug || creator.id,
        avatar: creator.avatar,
        category: 'Image',
        roleTitle: creator.location,
        bio: `${creator.name} di Creatorin`,
        location: creator.location,
        startingRate: 200000,
        formattedRate: creator.startingRateText,
        careerScore: {
          overall: creator.careerScore,
          deadlineAccuracy: 95,
          revisionRate: 1,
          completionRate: 100,
          clientRating: creator.rating,
          completedProjects: creator.completedProjects,
          tier: 'Top Tier',
        },
        rating: creator.rating,
        reviewCount: creator.reviewCount,
        skills: creator.skills,
        joinedDate: '2024',
      },
      category: service.tag,
      platform: 'direct',
      tags: [service.tag.replace(/\s+/g, '')],
      likesCount: creator.reviewCount,
      commentsCount: 12,
      viewsCount: '1.2k',
      sharesCount: 18,
    };
    setSelectedProject(feedProjectMock);
  };

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      {/* Symmetrical Hero Section matching Figma 4816-18898 */}
      <HomeHeroSection
        onExploreClick={() => router.push('/jelajah/kreator')}
        onSecondaryClick={() => setIsBriefModalOpen(true)}
        secondaryText="Bergabung Creatorin"
      />

      {/* Main Content Area matching Figma node 4812-8437 */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* 1. Subnav Switcher Tabs (Creator, Layanan, Proyek) */}
        <div className="flex items-center gap-6 sm:gap-8 pb-3 border-b border-transparent">
          <button
            onClick={() => handleTabChange('creator')}
            className={`inline-flex items-center gap-2 pb-1 text-sm sm:text-[15px] font-semibold transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'text-[#0D0C22] font-bold'
                : 'text-[#55576A] hover:text-[#0D0C22]'
            }`}
          >
            <User className="w-4 h-4 text-inherit" />
            <span>Creator</span>
          </button>

          <button
            onClick={() => handleTabChange('layanan')}
            className={`inline-flex items-center gap-2 pb-1 text-sm sm:text-[15px] font-medium transition-all cursor-pointer ${
              activeTab === 'layanan'
                ? 'text-[#0D0C22] font-bold'
                : 'text-[#55576A] hover:text-[#0D0C22]'
            }`}
          >
            <Package className="w-4 h-4 text-inherit" />
            <span>Layanan</span>
          </button>

          <button
            onClick={() => handleTabChange('proyek')}
            className={`inline-flex items-center gap-2 pb-1 text-sm sm:text-[15px] font-medium transition-all cursor-pointer ${
              activeTab === 'proyek'
                ? 'text-[#0D0C22] font-bold'
                : 'text-[#55576A] hover:text-[#0D0C22]'
            }`}
          >
            <Layers className="w-4 h-4 text-inherit" />
            <span>Proyek</span>
          </button>
        </div>

        {/* 2. Full-Width Search Input Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative w-full max-w-full rounded-full bg-[#F4F5F7] hover:bg-[#ECEEF2] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155DFC] focus-within:border-transparent border border-[#E1E3EA] px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 transition-all mt-5 mb-8 sm:mb-10"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What type of design are you interested in?"
            className="w-full bg-transparent text-xs sm:text-sm md:text-[15px] text-[#0D0C22] placeholder:text-[#6F7285] focus:outline-hidden py-1"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-[#6F7285] hover:text-[#0D0C22] cursor-pointer shrink-0"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#155DFC] hover:bg-[#1248C7] active:bg-[#0E3A9E] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
            aria-label="Cari desain atau kreator"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
        </form>

        {/* 4. Creator Cards List */}
        <section aria-label="Daftar Rekomendasi Kreator" className="space-y-6">
          {filteredCreators.length === 0 ? (
            <div className="rounded-2xl border border-[#E1E3EA] bg-white p-12 text-center my-8">
              <p className="text-sm font-semibold text-[#0D0C22]">Belum ada kreator yang cocok dengan pencarian.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs font-semibold text-[#155DFC] hover:underline cursor-pointer"
              >
                Reset pencarian
              </button>
            </div>
          ) : (
            filteredCreators.slice(0, visibleCount).map((creator) => (
              <article
                key={creator.id}
                className="rounded-2xl border border-[#E1E3EA] bg-white p-5 sm:p-6 shadow-[0px_1px_2px_rgba(13,12,34,0.06)] hover:border-[#B7BBC9] transition-all"
              >
                {/* Header: Avatar, Name, PRO+, Stats, Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-black/5"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0D0C22] text-white flex items-center justify-center text-[9px] ring-2 ring-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          onClick={() => router.push(`/creator/${creator.slug || creator.id}`)}
                          className="font-semibold text-base sm:text-[17px] text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors truncate font-display"
                        >
                          {creator.name}
                        </h3>
                        {creator.proBadge && (
                          <span className="bg-[#0D0C22] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide leading-none">
                            PRO+
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D0C22]">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{creator.rating}</span>
                          <span className="text-[#55576A] font-normal">({creator.reviewCount})</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#55576A]">
                          <Check className="w-3 h-3 text-[#16803C] stroke-[2.5]" />
                          <span>{creator.completedProjects} proyek selesai</span>
                        </span>
                        {creator.isPromoted && (
                          <span className="text-xs font-medium text-[#6F7285]">
                            Promoted
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-[#55576A]">
                        <span className="font-semibold text-[#0D0C22]">{creator.startingRateText}</span>
                        <span>&middot;</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#6F7285]" />
                          {creator.location}
                        </span>
                        <span>&middot;</span>
                        <span>
                          <strong className="font-semibold text-[#0D0C22]">{creator.careerScore}%</strong> Skor Karir
                        </span>
                        <span>&middot;</span>
                        <span>{creator.servicesCount} Layanan tersedia</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Bookmark & Hubungi */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(creator.id)}
                      className="w-9 h-9 rounded-xl border border-[#E1E3EA] bg-white hover:bg-[#F3F3F4] text-[#55576A] hover:text-[#0D0C22] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={`Simpan profil ${creator.name}`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedCreators[creator.id] ? 'fill-[#0D0C22] text-[#0D0C22]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/chat?creatorId=${creator.id}`)}
                      className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Hubungi
                    </button>
                  </div>
                </div>

                {/* Middle: 4 Service Showcase Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4 sm:my-5">
                  {creator.services.map((service, idx) => (
                    <div
                      key={service.id || idx}
                      onClick={() => handleServiceClick(service, creator)}
                      className="rounded-xl overflow-hidden border border-[#E1E3EA] bg-white group cursor-pointer hover:shadow-md hover:border-[#A9C3FF] transition-all"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium z-10">
                          {service.tag}
                        </span>
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 flex flex-col justify-between gap-1.5">
                        <h4 className="text-xs sm:text-[13px] font-semibold text-[#0D0C22] group-hover:text-[#155DFC] line-clamp-1 transition-colors">
                          {service.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-bold text-[#0D0C22]">{service.price}</span>
                          <span className="text-[11px] sm:text-xs text-[#6F7285] font-medium">{service.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: Skills Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F3F3F4]">
                  {creator.skills.map((skill, sIdx) => (
                    <button
                      type="button"
                      key={sIdx}
                      onClick={() => setSearchQuery(skill.startsWith('+') ? '' : skill)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        skill.startsWith('+')
                          ? 'text-[#6F7285] hover:text-[#0D0C22]'
                          : 'bg-[#F3F3F4] hover:bg-neutral-200/80 text-[#55576A] hover:text-[#0D0C22]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        {/* 5. Centered Bottom Action: Lihat Selengkapnya */}
        <div className="flex justify-center mt-10 mb-14">
          <button
            type="button"
            onClick={() => {
              if (visibleCount < filteredCreators.length) {
                setVisibleCount((prev) => prev + 3);
              } else {
                router.push('/jelajah/kreator');
              }
            }}
            className="bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-8 py-3 rounded-full text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            Lihat Selengkapnya
          </button>
        </div>

      </main>

      {/* Lightbox / Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onViewCreatorProfile={(creator) => {
            setSelectedProject(null);
            router.push(`/creator/${creator.id}`);
          }}
          onGetInTouch={(creator) => {
            setSelectedProject(null);
            router.push(`/chat?creatorId=${creator.id}`);
          }}
          allProjects={[selectedProject]}
        />
      )}

      {/* Create Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />
    </div>
  );
};
