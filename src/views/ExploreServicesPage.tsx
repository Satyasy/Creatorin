'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  Search, 
  Clock, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ChevronDown, 
  Check, 
  ArrowUpDown, 
  ShoppingBag, 
  User, 
  X, 
  Send, 
  Zap, 
  SlidersHorizontal, 
  Bookmark,
  TrendingUp,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { CareerScoreBadge } from '@/components/common/CareerScoreBadge';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { ServiceFilterModal, FilterState } from '@/components/modals/ServiceFilterModal';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { toCreator } from '@/services/creatorService';
import { chatService } from '@/services/chatService';
import { ActivePage, AuthState, Creator, CreatorService } from '@/types';
import { useAuthModal } from '@/providers/AuthModalProvider';

interface ExploreServicesPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

interface ServiceWithCreator extends CreatorService {
  creator: Creator;
}

export const ExploreServicesPage: React.FC<ExploreServicesPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Semua') return t('category.all', 'Semua');
    if (cat === 'Reels Instagram') return t('category.reels', 'Reels Instagram');
    if (cat === 'Video Tiktok' || cat === 'Video TikTok') return t('category.tiktok', 'Video TikTok');
    if (cat === 'Feed Instagram') return t('category.feed', 'Feed Instagram');
    if (cat === 'Poster') return t('category.poster', 'Poster');
    if (cat === 'Banner') return t('category.banner', 'Banner');
    if (cat === 'Brosur') return t('category.brochure', 'Brosur');
    if (cat === 'Logo') return t('category.logo', 'Logo');
    if (cat === 'Foto Produk') return t('category.productPhoto', 'Foto Produk');
    return cat;
  };

  const getBudgetLabel = (val: string) => {
    if (val === 'Semua') return t('filter.allBudget', 'Semua Budget');
    if (val === 'under500') return t('budget.under500', '< 🪙 500rb');
    if (val === 'mid') return t('budget.mid500to15', '🪙 500rb - 🪙 1.5jt');
    if (val === 'high') return t('budget.above15', '> 🪙 1.5jt');
    return val;
  };

  const getDeliveryLabel = (val: string) => {
    if (val === 'Semua') return t('filter.allTimes', 'Semua Waktu');
    if (val === 'fast') return t('duration.fast', '⚡ 1-2 Hari');
    if (val === 'standard') return t('duration.standard', '3-4 Hari');
    if (val === 'relaxed') return t('duration.relaxed', '5+ Hari');
    return val;
  };

  const getScoreLabel = (val: string) => {
    if (val === 'Semua') return t('filter.allScoresRatings', 'Semua Rating & Score');
    if (val === '95+') return 'Score 95+';
    if (val === '90+') return 'Score 90+';
    if (val === 'rating49') return 'Rating 4.9+';
    return val;
  };

  const formatDelivery = (deliveryDays?: string) => {
    if (!deliveryDays) return t('card.tbd', 'Belum ditentukan');
    if (language === 'en') {
      return deliveryDays.replace(/hari kerja/gi, 'Working Days').replace(/hari/gi, 'Days');
    }
    return deliveryDays.toLowerCase().includes('hari') ? deliveryDays : `${deliveryDays} Hari Kerja`;
  };

  const navigateTo = (page: ActivePage, path?: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (path) {
      router.push(path);
    } else {
      const routeMap: Record<string, string> = {
        'home': '/',
        'landing': '/landing',
        'explore': '/jelajah',
        'explore-projects': '/jelajah/proyek',
        'explore-services': '/jelajah/layanan',
        'chat': '/chat',
        'collaboration': '/contracts',
        'collaboration-room': '/contracts',
        'notifications': '/notifications',
        'briefs': '/briefs',
        'signin': '/sign-in',
        'signup': '/sign-up',
      };
      router.push(routeMap[page] || '/jelajah/layanan');
    }
  };

  const handleCreatorClick = (creator: Creator) => {
    if (onViewCreatorProfile) onViewCreatorProfile(creator);
    else router.push(`/creator/${creator.id}`);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBudget, setSelectedBudget] = useState<string>('Semua');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('Semua');
  const [selectedScore, setSelectedScore] = useState<string>('Semua');
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'budget' | 'durasi' | 'score' | null>(null);

  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<Creator | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [availableForWork, setAvailableForWork] = useState<boolean>(false);
  const [fastDelivery, setFastDelivery] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const [orderModalService, setOrderModalService] = useState<ServiceWithCreator | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<ServiceWithCreator | null>(null);
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [orderBriefNotes, setOrderBriefNotes] = useState('');
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);

  const toggleSaveService = (serviceId: string) => {
    if (!currentUser) {
      showToast({
        type: 'warning',
        title: t('toast.authRequired', 'Perlu Masuk Akun'),
        message: t('toast.saveServiceAuth', 'Anda harus masuk ke akun Creatorin terlebih dahulu untuk menyimpan layanan favorit.'),
        action: {
          label: t('action.signIn', 'Masuk ke Akun'),
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    setSavedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory('Semua');
    setSelectedBudget('Semua');
    setSelectedDelivery('Semua');
    setSelectedScore('Semua');
    setMinPrice(0);
    setMaxPrice(10000000);
    setSelectedLocation('');
    setMinRating(0);
    setAvailableForWork(false);
    setFastDelivery(false);
    setVerifiedOnly(false);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Semua') count++;
    if (minPrice > 0 || maxPrice < 10000000) count++;
    if (selectedLocation.trim()) count++;
    if (minRating > 0) count++;
    if (availableForWork) count++;
    if (fastDelivery) count++;
    if (verifiedOnly) count++;
    if (selectedBudget !== 'Semua') count++;
    if (selectedDelivery !== 'Semua') count++;
    if (selectedScore !== 'Semua') count++;
    return count;
  }, [
    selectedCategory,
    minPrice,
    maxPrice,
    selectedLocation,
    minRating,
    availableForWork,
    fastDelivery,
    verifiedOnly,
    selectedBudget,
    selectedDelivery,
    selectedScore
  ]);

const DEFAULT_SERVICES: ServiceWithCreator[] = [
  {
    id: 'srv-1',
    title: '1x Video TikTok UGC & Review Viral',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    price: 1500000,
    formattedPrice: '🪙 1.500.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'TIKTOK UGC',
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-sobakhul',
      name: 'Sobakhul Munir Siroj',
      username: 'sobakhulmunir',
      handle: '@sobakhulmunir',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      category: 'Video',
      roleTitle: 'TikTok & Short-Form Specialist',
      bio: 'Konten kreator TikTok viral dengan pengalaman kolaborasi brand terpercaya.',
      location: 'Bandung',
      startingRate: 1500000,
      formattedRate: '🪙 1.500.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 42, tier: 'Top Tier' },
      skills: ['TikTok UGC', 'Video Viral', 'Short-form'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-2',
    title: '3x Reels Instagram Hook Kuat & Edukasi Produk',
    description: 'Paket konten video reels vertikal dengan visual hook dalam 3 detik pertama.',
    price: 2500000,
    formattedPrice: '🪙 2.500.000',
    deliveryDays: '3 Hari Kerja',
    tag: 'REELS INSTAGRAM',
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-sarah',
      name: 'Sarah Amelia',
      username: 'sarah.amelia',
      handle: '@sarah.amelia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      category: 'Video',
      roleTitle: 'UGC & Video Content Creator',
      bio: 'Spesialis video TikTok & Reels berorientasi konversi untuk produk kecantikan.',
      location: 'Jakarta Selatan',
      startingRate: 250000,
      formattedRate: '🪙 250.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.1, completionRate: 100, clientRating: 4.9, completedProjects: 38, tier: 'Top Tier' },
      skills: ['Video TikTok', 'Reels Instagram', 'UGC Content'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-3',
    title: 'Desain Identitas Brand & Logo UMKM Siap Pakai',
    description: 'Paket logo profesional lengkap dengan color guide, font pairing, dan master file.',
    price: 850000,
    formattedPrice: '🪙 850.000',
    deliveryDays: '3 Hari Kerja',
    tag: 'LOGO & BRANDING',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-kevin',
      name: 'Kevin Sanjaya',
      username: 'kevinsanjaya',
      handle: '@kevinsanjaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Video',
      roleTitle: 'Motion Designer & Visual Branding',
      bio: 'Membantu UMKM membangun identitas visual modern.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: '🪙 400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 45, tier: 'Top Tier' },
      skills: ['Motion Graphic', 'Branding', 'Vector'],
      joinedDate: '2022',
    }
  },
  {
    id: 'srv-4',
    title: '9-Grid Feed Instagram Estetik & Template Canva',
    description: 'Desain feed teratur yang memperkuat branding produk UMKM di media sosial.',
    price: 450000,
    formattedPrice: '🪙 450.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'FEED INSTAGRAM',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-anisa',
      name: 'Anisa Rahma',
      username: 'anisa_creative',
      handle: '@anisa_creative',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'Visual Designer & Content Strategist',
      bio: 'Desainer grafis berfokus pada feed Instagram estetik dan visual banner.',
      location: 'Yogyakarta',
      startingRate: 200000,
      formattedRate: '🪙 200.000',
      careerScore: { overall: 94, deadlineAccuracy: 96, revisionRate: 1.2, completionRate: 100, clientRating: 4.9, completedProjects: 52, tier: 'Top Tier' },
      skills: ['Feed Instagram', 'Poster', 'Logo & Branding'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-5',
    title: 'Foto Produk Komersial Studio 10 Foto Siap Katalog',
    description: 'Sesi foto produk dengan tata lampu studio dan retouching resolusi tinggi.',
    price: 650000,
    formattedPrice: '🪙 650.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'FOTO PRODUK',
    coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-budi',
      name: 'Budi Pratama',
      username: 'budipratama',
      handle: '@budipratama',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      category: 'Video',
      roleTitle: 'Fotografer Komersial',
      bio: 'Pencahayaan dan komposisi profesional untuk produk lokal.',
      location: 'Surabaya',
      startingRate: 350000,
      formattedRate: '🪙 350.000',
      careerScore: { overall: 91, deadlineAccuracy: 95, revisionRate: 1.3, completionRate: 98, clientRating: 4.8, completedProjects: 29, tier: 'Rising Star' },
      skills: ['Foto Produk', 'Lighting Studio', 'Commercial'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-6',
    title: 'Video Unboxing & Review Organik TikTok Shop',
    description: 'Video unboxing natural yang meningkatkan rasa percaya calon pembeli e-commerce.',
    price: 750000,
    formattedPrice: '🪙 750.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'TIKTOK UGC',
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-nadia',
      name: 'Nadia Putri',
      username: 'nadiaputri',
      handle: '@nadiaputri',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      category: 'Video',
      roleTitle: 'UGC Creator & Lifestyle Reviewer',
      bio: 'UGC organik yang otentik dan relate dengan audiens muda.',
      location: 'Semarang',
      startingRate: 200000,
      formattedRate: '🪙 200.000',
      careerScore: { overall: 95, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 41, tier: 'Top Tier' },
      skills: ['UGC Review', 'Unboxing', 'Lifestyle'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-7',
    title: 'Packaging & Kemasan Label Produk Box / Pouch Siap Cetak',
    description: 'Desain kemasan fungsional dengan pola dieline tepat ukuran siap dikirim ke percetakan.',
    price: 900000,
    formattedPrice: '🪙 900.000',
    deliveryDays: '4 Hari Kerja',
    tag: 'KEMASAN',
    coverImage: 'https://images.unsplash.com/photo-1559525839-8f8ec328b228?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-kevin',
      name: 'Kevin Sanjaya',
      username: 'kevinsanjaya',
      handle: '@kevinsanjaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Video',
      roleTitle: 'Motion Designer & Visual Branding',
      bio: 'Membantu UMKM membangun identitas visual modern.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: '🪙 400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 45, tier: 'Top Tier' },
      skills: ['Packaging', 'Dieline', 'Print'],
      joinedDate: '2022',
    }
  },
  {
    id: 'srv-8',
    title: 'Banner Promosi Flash Sale Marketplace Shopee & Tokped',
    description: 'Header toko dan 5 banner campaign promo berdaya tarik visual tinggi.',
    price: 350000,
    formattedPrice: '🪙 350.000',
    deliveryDays: '1 Hari Kerja',
    tag: 'BANNER PROMO',
    coverImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-anisa',
      name: 'Anisa Rahma',
      username: 'anisa_creative',
      handle: '@anisa_creative',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'Visual Designer & Content Strategist',
      bio: 'Desainer grafis berfokus pada feed Instagram estetik dan visual banner.',
      location: 'Yogyakarta',
      startingRate: 200000,
      formattedRate: '🪙 200.000',
      careerScore: { overall: 94, deadlineAccuracy: 96, revisionRate: 1.2, completionRate: 100, clientRating: 4.9, completedProjects: 52, tier: 'Top Tier' },
      skills: ['Feed Instagram', 'Poster', 'Banner Promo'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-9',
    title: 'Video Sinematik B-Roll Menu Restoran & Kuliner',
    description: 'Tampilan menggugah selera dengan transisi mulus dan color grade hangat.',
    price: 1200000,
    formattedPrice: '🪙 1.200.000',
    deliveryDays: '3 Hari Kerja',
    tag: 'VIDEO KULINER',
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-dimas',
      name: 'Dimas Anggara',
      username: 'dimas.visuals',
      handle: '@dimas.visuals',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      category: 'Video',
      roleTitle: 'Short-Form Video Specialist',
      bio: 'Menghadirkan hook visual kuat dalam 3 detik pertama untuk promosi UMKM.',
      location: 'Bali',
      startingRate: 300000,
      formattedRate: '🪙 300.000',
      careerScore: { overall: 93, deadlineAccuracy: 97, revisionRate: 1.1, completionRate: 100, clientRating: 4.9, completedProjects: 34, tier: 'Rising Star' },
      skills: ['Video Reels', 'TikTok Ads', 'Storytelling'],
      joinedDate: '2024',
    }
  },
  {
    id: 'srv-10',
    title: 'Redesain Kemasan Pouch Kopi Specialty Premium',
    description: 'Transformasi visual packaging kopi lokal menjadi produk bernilai jual ekspor.',
    price: 1100000,
    formattedPrice: '🪙 1.100.000',
    deliveryDays: '3 Hari Kerja',
    tag: 'PACKAGING',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-kevin',
      name: 'Kevin Sanjaya',
      username: 'kevinsanjaya',
      handle: '@kevinsanjaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Video',
      roleTitle: 'Motion Designer & Visual Branding',
      bio: 'Membantu UMKM membangun identitas visual modern.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: '🪙 400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 45, tier: 'Top Tier' },
      skills: ['Packaging', 'Branding', 'Vector'],
      joinedDate: '2022',
    }
  },
  {
    id: 'srv-11',
    title: '1x Video TikTok Edukasi Masalah Kulit & Skincare',
    description: 'Konten soft-selling edukatif dengan pembawaan rileks dan relatable.',
    price: 800000,
    formattedPrice: '🪙 800.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'TIKTOK UGC',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-nadia',
      name: 'Nadia Putri',
      username: 'nadiaputri',
      handle: '@nadiaputri',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      category: 'Video',
      roleTitle: 'UGC Creator & Lifestyle Reviewer',
      bio: 'UGC organik yang otentik dan relate dengan audiens muda.',
      location: 'Semarang',
      startingRate: 200000,
      formattedRate: '🪙 200.000',
      careerScore: { overall: 95, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 41, tier: 'Top Tier' },
      skills: ['UGC Review', 'Unboxing', 'Lifestyle'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-12',
    title: 'Desain UI Landing Page Mobile UMKM Siap Coding',
    description: 'Mockup Figma responsif dengan komponen rapi dan prototipe interaktif.',
    price: 1800000,
    formattedPrice: '🪙 1.800.000',
    deliveryDays: '4 Hari Kerja',
    tag: 'UI/UX DESIGN',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-anisa',
      name: 'Anisa Rahma',
      username: 'anisa_creative',
      handle: '@anisa_creative',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'Visual Designer & Content Strategist',
      bio: 'Desainer grafis berfokus pada feed Instagram estetik dan visual banner.',
      location: 'Yogyakarta',
      startingRate: 200000,
      formattedRate: '🪙 200.000',
      careerScore: { overall: 94, deadlineAccuracy: 96, revisionRate: 1.2, completionRate: 100, clientRating: 4.9, completedProjects: 52, tier: 'Top Tier' },
      skills: ['UI/UX', 'Figma', 'Web Design'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-13',
    title: 'Foto Katalog Busana Muslim & Hijab On-Model',
    description: 'Foto lookbook studio profesional dengan model, makeup, dan arahan gaya.',
    price: 950000,
    formattedPrice: '🪙 950.000',
    deliveryDays: '3 Hari Kerja',
    tag: 'FOTO PRODUK',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-budi',
      name: 'Budi Pratama',
      username: 'budipratama',
      handle: '@budipratama',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      category: 'Video',
      roleTitle: 'Fotografer Komersial',
      bio: 'Pencahayaan dan komposisi profesional untuk produk lokal.',
      location: 'Surabaya',
      startingRate: 350000,
      formattedRate: '🪙 350.000',
      careerScore: { overall: 91, deadlineAccuracy: 95, revisionRate: 1.3, completionRate: 98, clientRating: 4.8, completedProjects: 29, tier: 'Rising Star' },
      skills: ['Foto Produk', 'Lighting Studio', 'Commercial'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-14',
    title: 'Animasi Logo 3D Bumper Video Intro Youtube',
    description: 'Animasi logo berdurasi 5 detik dengan sound effects memukau untuk video brand.',
    price: 600000,
    formattedPrice: '🪙 600.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'ANIMASI & MOTION',
    coverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-kevin',
      name: 'Kevin Sanjaya',
      username: 'kevinsanjaya',
      handle: '@kevinsanjaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Video',
      roleTitle: 'Motion Designer & Visual Branding',
      bio: 'Membantu UMKM membangun identitas visual modern.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: '🪙 400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 45, tier: 'Top Tier' },
      skills: ['Motion Graphic', 'Branding', 'Vector'],
      joinedDate: '2022',
    }
  },
  {
    id: 'srv-15',
    title: 'Paket Konten 30 Hari Feed + Story Kalender UMKM',
    description: 'Kalender editorial dan 30 aset grafis siap jadwalkan untuk media sosial bisnis.',
    price: 2200000,
    formattedPrice: '🪙 2.200.000',
    deliveryDays: '5 Hari Kerja',
    tag: 'FEED INSTAGRAM',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-anisa',
      name: 'Anisa Rahma',
      username: 'anisa_creative',
      handle: '@anisa_creative',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'Visual Designer & Content Strategist',
      bio: 'Desainer grafis berfokus pada feed Instagram estetik dan visual banner.',
      location: 'Yogyakarta',
      startingRate: 200000,
      formattedRate: '🪙 200.000',
      careerScore: { overall: 94, deadlineAccuracy: 96, revisionRate: 1.2, completionRate: 100, clientRating: 4.9, completedProjects: 52, tier: 'Top Tier' },
      skills: ['Feed Instagram', 'Poster', 'Logo & Branding'],
      joinedDate: '2023',
    }
  },
  {
    id: 'srv-16',
    title: 'Video Testimoni & Review Penggunaan Produk Herbal',
    description: 'Ulasan personal dari sudut pandang konsumen asli dengan penyampaian terpercaya.',
    price: 500000,
    formattedPrice: '🪙 500.000',
    deliveryDays: '2 Hari Kerja',
    tag: 'TIKTOK UGC',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    creator: {
      id: 'c-sarah',
      name: 'Sarah Amelia',
      username: 'sarah.amelia',
      handle: '@sarah.amelia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      category: 'Video',
      roleTitle: 'UGC & Video Content Creator',
      bio: 'Spesialis video TikTok & Reels berorientasi konversi untuk produk kecantikan.',
      location: 'Jakarta Selatan',
      startingRate: 250000,
      formattedRate: '🪙 250.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.1, completionRate: 100, clientRating: 4.9, completedProjects: 38, tier: 'Top Tier' },
      skills: ['Video TikTok', 'Reels Instagram', 'UGC Content'],
      joinedDate: '2023',
    }
  }
];

  // Aggregate all services from all creators
  const [allServices, setAllServices] = useState<ServiceWithCreator[]>(DEFAULT_SERVICES);
  useEffect(() => {
    fetch('/api/services', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Gagal memuat layanan.');
        const data = await response.json();
        if (data.services && data.services.length > 0) {
          setAllServices(
            data.services.map((service: any) => ({
              id: service.id,
              title: service.title,
              price: service.priceNumeric || 0,
              formattedPrice: service.price
                ? String(service.price).replace(/^Rp\s?/, '🪙 ')
                : (service.priceNumeric ? `🪙 ${service.priceNumeric.toLocaleString('id-ID')}` : '🪙 200.000'),
              deliveryDays: service.estimatedDays || '',
              description: service.description || '',
              coverImage: service.imageUrl || '',
              tag: service.category || '',
              creator: toCreator({
                id: service.creatorId,
                fullName: service.creatorName,
                avatarUrl: service.creatorAvatar,
                slug: service.creatorSlug,
              }),
            }))
          );
        } else {
          setAllServices(DEFAULT_SERVICES);
        }
      })
      .catch(() => setAllServices(DEFAULT_SERVICES));
  }, []);

  // Filter and Sort services
  const filteredServices = useMemo(() => {
    return allServices.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSearch = 
          (item.title?.toLowerCase() || '').includes(q) ||
          (item.creator?.name?.toLowerCase() || '').includes(q) ||
          (item.tag && item.tag.toLowerCase().includes(q)) ||
          (item.creator?.roleTitle?.toLowerCase() || '').includes(q);
        if (!matchSearch) return false;
      }

      // Tag filter
      if (selectedTag) {
        const cleanTag = selectedTag.replace('#', '').toLowerCase();
        const matchTag = 
          (item.title?.toLowerCase() || '').includes(cleanTag) ||
          (item.tag && item.tag.toLowerCase().includes(cleanTag)) ||
          (item.creator?.category?.toLowerCase() || '').includes(cleanTag);
        if (!matchTag) return false;
      }

      // Category filter (flexible for modal categories & native tags)
      if (selectedCategory !== 'Semua') {
        const cat = selectedCategory.toLowerCase();
        const itemTag = (item.tag || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const creatorCat = (item.creator?.category || '').toLowerCase();
        
        let matchCat = itemTag.includes(cat) || itemTitle.includes(cat) || creatorCat.includes(cat);
        
        if (!matchCat) {
          if (cat.includes('logo') || cat.includes('brand')) {
            matchCat = itemTag.includes('logo') || itemTitle.includes('logo') || creatorCat.includes('brand');
          } else if (cat.includes('web')) {
            matchCat = itemTag.includes('web') || itemTitle.includes('web') || creatorCat.includes('ui/ux') || itemTitle.includes('landing');
          } else if (cat.includes('illustration')) {
            matchCat = itemTag.includes('ilustrasi') || itemTitle.includes('ilustrasi') || itemTitle.includes('illustration') || creatorCat.includes('desain');
          } else if (cat.includes('product')) {
            matchCat = itemTag.includes('produk') || itemTitle.includes('produk') || creatorCat.includes('foto') || creatorCat.includes('desain');
          } else if (cat.includes('mobile')) {
            matchCat = itemTag.includes('mobile') || itemTitle.includes('app') || creatorCat.includes('ui/ux');
          } else if (cat.includes('animation')) {
            matchCat = itemTag.includes('animasi') || itemTitle.includes('animasi') || itemTitle.includes('motion') || itemTitle.includes('video') || creatorCat.includes('video');
          } else if (cat.includes('typography')) {
            matchCat = itemTag.includes('font') || itemTitle.includes('typography') || creatorCat.includes('brand') || creatorCat.includes('desain');
          } else if (cat.includes('print')) {
            matchCat = itemTag.includes('print') || itemTitle.includes('poster') || itemTitle.includes('banner') || itemTitle.includes('brosur') || creatorCat.includes('desain');
          }
        }

        if (!matchCat) return false;
      }

      // Budget filter from modal
      if (minPrice > 0 && item.price < minPrice) return false;
      if (maxPrice < 10000000 && item.price > maxPrice) return false;

      // Quick budget dropdown filter
      if (selectedBudget === 'under500' && item.price > 500000) return false;
      if (selectedBudget === 'mid' && (item.price <= 500000 || item.price > 1500000)) return false;
      if (selectedBudget === 'high' && item.price <= 1500000) return false;

      // Location filter from modal
      if (selectedLocation.trim()) {
        const locLower = selectedLocation.toLowerCase().trim();
        const creatorLoc = (item.creator?.location || '').toLowerCase();
        if (!creatorLoc.includes(locLower)) return false;
      }

      // Rating filter from modal
      if (minRating > 0 && (item.creator?.careerScore?.clientRating || 0) < minRating) return false;

      // Delivery duration filter
      const days = parseInt(item.deliveryDays || '3', 10);
      if (fastDelivery && days > 2) return false;
      if (selectedDelivery !== 'Semua') {
        if (selectedDelivery === 'fast' && days > 2) return false;
        if (selectedDelivery === 'standard' && (days <= 2 || days > 4)) return false;
        if (selectedDelivery === 'relaxed' && days <= 4) return false;
      }

      // Score filter
      if (selectedScore === '95+' && item.creator.careerScore.overall < 95) return false;
      if (selectedScore === '90+' && item.creator.careerScore.overall < 90) return false;
      if (selectedScore === 'rating49' && item.creator.careerScore.clientRating < 4.9) return false;

      // Verified creators filter
      if (verifiedOnly && !(item.creator?.verified || (item.creator?.careerScore?.overall || 0) >= 90)) return false;

      return true;
    });
  }, [
    allServices,
    searchQuery,
    selectedTag,
    selectedCategory,
    selectedBudget,
    selectedDelivery,
    selectedScore,
    minPrice,
    maxPrice,
    selectedLocation,
    minRating,
    availableForWork,
    fastDelivery,
    verifiedOnly
  ]);

  const handleOpenOrder = (item: ServiceWithCreator) => {
    if (!currentUser) {
      showToast({
        type: 'warning',
        title: t('toast.authRequired', 'Perlu Masuk Akun'),
        message: t('toast.orderServiceAuth', 'Silakan masuk ke akun Creatorin terlebih dahulu untuk memesan atau mendiskusikan paket layanan ini.'),
        action: {
          label: t('action.signIn', 'Masuk ke Akun'),
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }
    setOrderModalService(item);
    setOrderBriefNotes('');
    setIsSendingInquiry(false);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModalService) return;
    const text = orderBriefNotes.trim();
    if (!text) return;

    setIsSendingInquiry(true);
    try {
      const res = await chatService.sendServiceInquiry({
        creator: {
          id: orderModalService.creator.id,
          name: orderModalService.creator.name,
          username: orderModalService.creator.username,
          avatar: orderModalService.creator.avatar,
          roleTitle: orderModalService.creator.roleTitle,
        },
        service: {
          id: orderModalService.id,
          title: orderModalService.title,
          price: orderModalService.price,
          formattedPrice: orderModalService.formattedPrice,
          deliveryDays: orderModalService.deliveryDays,
          coverImage: orderModalService.coverImage,
          tag: orderModalService.tag,
          description: orderModalService.description,
        },
        message: text,
        currentUser,
      });

      const targetCreatorId = orderModalService.creator.id;
      const targetConvId = res.conversationId;

      setOrderModalService(null);
      setOrderBriefNotes('');

      // Arahkan otomatis ke ruang chat
      navigateTo('chat', `/chat?conversationId=${targetConvId}&creatorId=${targetCreatorId}`);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Gagal Mengirim Pesan',
        message: err?.message || 'Gagal mengirim pesan ke kreator.',
      });
    } finally {
      setIsSendingInquiry(false);
    }
  };

  return (
    <div className="w-full bg-[#fafafa] flex flex-col font-sans selection:bg-[#0d0c22] selection:text-white text-[#0d0c22]">
      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        

        {/* H1 Page Title & Subtitle Matching Figma */}
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[#0D0C22] tracking-tight">
            Jelajah Katalog Layanan & Jasa Kreator
          </h1>
          <p className="text-sm text-[#737373] mt-1.5 max-w-2xl leading-relaxed">
            Pilih paket layanan konten instan mulai dari video UGC, desain feed, hingga branding dengan harga transparan dan garansi pengerjaan tepat waktu.
          </p>
        </div>

        {/* Section Heading & Filter Toolbar Matching Figma */}
        <div className="pt-4 pb-4 border-t border-[#E5E5E5]/80 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0D0C22]">
              Cari Layanan berdasarkan Kategori
            </h2>

            {/* Filter Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 relative">
              
              {/* Pop-up Filter Modal Trigger Button */}
              <button 
                id="open-filters-modal-btn"
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  activeFilterCount > 0 
                    ? 'border-[#0d0c22] bg-[#0d0c22] text-white' 
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
                title="Buka Filter Lengkap"
              >
                <SlidersHorizontal className={`w-4 h-4 ${activeFilterCount > 0 ? 'text-white' : 'text-neutral-700'}`} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-white text-[#0d0c22] text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button 
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold px-2 py-1 transition cursor-pointer"
                  title="Reset Semua Filter"
                >
                  Reset
                </button>
              )}

              {/* Dropdown 1: Kategori */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedCategory !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedCategory === 'Semua' ? t('filter.category', 'Kategori') : getCategoryLabel(selectedCategory)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'kategori' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in max-h-72 overflow-y-auto">
                    {[
                      'Semua',
                      'Reels Instagram',
                      'Video Tiktok',
                      'Feed Instagram',
                      'Poster',
                      'Banner',
                      'Brosur',
                      'Logo',
                      'Foto Produk'
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{getCategoryLabel(cat)}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Budget */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'budget' ? null : 'budget')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedBudget !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedBudget === 'Semua' ? t('filter.budget', 'Budget') : getBudgetLabel(selectedBudget)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'budget' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: t('filter.allBudget', 'Semua Budget'), val: 'Semua' },
                      { label: t('filter.under500k', 'Di bawah 🪙 500.000'), val: 'under500' },
                      { label: t('filter.midBudget', '🪙 500.000 - 🪙 1.500.000'), val: 'mid' },
                      { label: t('filter.highBudget', 'Di atas 🪙 1.500.000'), val: 'high' }
                    ].map((b) => (
                      <button
                        key={b.val}
                        onClick={() => {
                          setSelectedBudget(b.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedBudget === b.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{b.label}</span>
                        {selectedBudget === b.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Durasi Pengerjaan */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'durasi' ? null : 'durasi')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedDelivery !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedDelivery === 'Semua' ? t('filter.duration', 'Pengerjaan') : getDeliveryLabel(selectedDelivery)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'durasi' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: t('filter.allTimes', 'Semua Waktu'), val: 'Semua' },
                      { label: t('duration.fastFull', '⚡ Kilat (1-2 Hari Kerja)'), val: 'fast' },
                      { label: t('duration.standardFull', 'Standard (3-4 Hari Kerja)'), val: 'standard' },
                      { label: t('duration.relaxedFull', 'Proyek Besar (5+ Hari)'), val: 'relaxed' }
                    ].map((d) => (
                      <button
                        key={d.val}
                        onClick={() => {
                          setSelectedDelivery(d.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedDelivery === d.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{d.label}</span>
                        {selectedDelivery === d.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Rating & Score */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'score' ? null : 'score')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedScore !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedScore === 'Semua' ? t('filter.rating', 'Rating / Score') : getScoreLabel(selectedScore)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'score' && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-[16px] border border-black/10 shadow-lg py-2 z-30 animate-in fade-in">
                    {[
                      { label: t('filter.allScoresRatings', 'Semua Rating & Score'), val: 'Semua' },
                      { label: 'Career Score 95+ (Top 1%)', val: '95+' },
                      { label: 'Career Score 90+ (Top Tier)', val: '90+' },
                      { label: 'Rating 4.9+', val: 'rating49' }
                    ].map((s) => (
                      <button
                        key={s.val}
                        onClick={() => {
                          setSelectedScore(s.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedScore === s.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {selectedScore === s.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Services Grid (Dribbble Pro Aesthetic matching reference image) */}
        <div className="mt-6">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
              <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d0c22]">{t('empty.servicesTitle', 'Tidak Ada Layanan Ditemukan')}</h3>
              <p className="text-sm text-neutral-500 mt-1">{t('empty.servicesDesc', 'Coba kata kunci lain atau bersihkan filter.')}</p>
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedBudget('Semua');
                  setSelectedDelivery('Semua');
                  setSelectedScore('Semua');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#0d0c22] cursor-pointer"
              >
                {t('filter.reset', 'Reset Semua Filter')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredServices.map((item, sIdx) => {
                const coverImage = item.coverImage || '';
                const formattedDelivery = formatDelivery(item.deliveryDays);
                const displayPrice = item.formattedPrice
                  ? item.formattedPrice.replace(/^Rp\s?/, '🪙 ')
                  : (item.price ? `🪙 ${item.price.toLocaleString('id-ID')}` : '🪙 200.000');

                return (
                  <ScrollReveal
                    key={item.id}
                    distance={28}
                    delay={Math.min((sIdx % 4) * 70, 240)}
                    duration={600}
                  >
                    <div
                      className="bg-white rounded-[20px] border border-neutral-200/80 hover:border-neutral-300 transition-all duration-200 p-5 flex flex-col justify-between text-left group shadow-xs hover:shadow-md h-full"
                    >
                    <div>
                      {/* Cover Thumbnail Image inside card padding */}
                      <div 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="aspect-[16/10] rounded-[16px] overflow-hidden bg-neutral-900 mb-3.5 cursor-pointer relative"
                        title="Klik untuk melihat detail layanan"
                      >
                        {coverImage && (
                          <img 
                            src={coverImage} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                            referrerPolicy="no-referrer" 
                          />
                        )}
                      </div>

                      {/* Tag & Creator Attribution Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#737373] text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase inline-block">
                          {item.tag || 'LAYANAN'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatorClick(item.creator);
                          }}
                          className="flex items-center gap-1.5 text-neutral-600 hover:text-[#155DFC] transition-colors group/cr cursor-pointer"
                          title={`Lihat profil ${item.creator.name}`}
                        >
                          <img
                            src={item.creator.avatar}
                            alt={item.creator.name}
                            className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-neutral-200"
                          />
                          <span className="text-xs font-medium text-[#0D0C22] truncate max-w-[120px] group-hover/cr:underline">
                            {item.creator.name}
                          </span>
                        </button>
                      </div>

                      {/* Service Title */}
                      <h3 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="text-sm sm:text-base font-bold text-[#0D0C22] mb-1 leading-snug cursor-pointer group-hover:text-[#155DFC] transition-colors line-clamp-2"
                        title="Klik untuk melihat detail layanan"
                      >
                        {item.title}
                      </h3>

                      {/* Service Description (1-2 lines) */}
                      <p 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="text-xs text-[#737373] line-clamp-2 leading-relaxed mb-3 cursor-pointer font-normal"
                      >
                        {item.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.'}
                      </p>

                      {/* Estimasi Durasi Pengerjaan */}
                      <div 
                        onClick={() => setSelectedServiceForDetail(item)}
                        className="flex items-center gap-1.5 text-xs text-[#55576A] mb-5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                        <span>{t('card.estimateHeader', 'Estimasi: {time}').replace('{time}', formattedDelivery)}</span>
                      </div>
                    </div>

                    {/* Bottom Row / Card Footer: HARGA + Pesan Layanan */}
                    <div className="flex items-center justify-between pt-3.5 gap-2 border-t border-[#F5F5F5]">
                      <div onClick={() => setSelectedServiceForDetail(item)} className="cursor-pointer min-w-0">
                        <span className="text-[10px] text-[#737373] font-semibold uppercase tracking-wider block mb-0.5">
                          {t('card.priceHeader', 'HARGA')}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-[#0D0C22] truncate block">
                          {displayPrice}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Tombol Diskusikan (CTA rounded-full matching Figma) */}
                        <button
                          type="button"
                          onClick={() => handleOpenOrder(item)}
                          className="h-9 px-4 rounded-full bg-[#0D0C22] hover:bg-[#1a1936] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                          {t('card.discuss', 'Diskusikan')}
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Direct Service Order / Brief Modal */}
      {orderModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full overflow-hidden text-left max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  {orderModalService.tag || 'Layanan Kreatif'}
                </span>
                <h3 className="text-xl font-bold text-[#0d0c22] mt-1.5">
                  {orderModalService.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                  <span>Oleh {orderModalService.creator.name}</span>
                  <span>•</span>
                  <span>{formatDelivery(orderModalService.deliveryDays)}</span>
                </div>
              </div>
              <button
                onClick={() => setOrderModalService(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleOrderSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Price summary */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 font-bold uppercase">{t('service.totalCost', 'Total Biaya Layanan')}</span>
                  <p className="text-xl font-black text-[#0d0c22]">
                    {orderModalService.formattedPrice
                      ? orderModalService.formattedPrice.replace(/^Rp\s?/, '🪙 ')
                      : (orderModalService.price ? `🪙 ${orderModalService.price.toLocaleString('id-ID')}` : '🪙 200.000')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 font-bold uppercase">{t('service.estimateDelivery', 'Estimasi Pengerjaan')}</span>
                  <p className="text-sm font-bold text-neutral-800">{formatDelivery(orderModalService.deliveryDays)}</p>
                </div>
              </div>

              {/* Input Kirim Pesan untuk Kreator */}
              <div>
                <label className="block text-xs font-bold text-[#0d0c22] mb-1.5">
                  {t('service.sendMessageToCreator', 'Kirim pesan untuk kreator')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={orderBriefNotes}
                  onChange={(e) => setOrderBriefNotes(e.target.value)}
                  placeholder={t('service.messagePlaceholder', 'Tulis pesan atau pertanyaan Anda terkait layanan ini ke kreator...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0d0c22] resize-none"
                />
              </div>

              {/* Footer buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOrderModalService(null)}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                >
                  {t('action.cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isSendingInquiry}
                  className="px-6 py-2.5 rounded-full bg-[#0D0C22] hover:bg-[#1a1936] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSendingInquiry ? (
                    <span>{t('service.sending', 'Mengirim...')}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('action.sendMessage', 'Kirim Pesan')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creator Profile Modal */}
      {selectedCreatorForModal && (
        <ProfileModal
          creator={selectedCreatorForModal}
          isOpen={true}
          onClose={() => setSelectedCreatorForModal(null)}
          onOpenBrief={() => {
            setSelectedCreatorForModal(null);
            setIsBriefModalOpen(true);
          }}
        />
      )}

      {/* Modal Buat Brief Baru */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />

      {/* Service Detail Modal (Pop-up sheet with matching design concept) */}
      {selectedServiceForDetail && (
        <ServiceDetailModal
          service={selectedServiceForDetail}
          creator={selectedServiceForDetail.creator}
          onClose={() => setSelectedServiceForDetail(null)}
          onOrderService={(srv, cr) => {
            setSelectedServiceForDetail(null);
            handleOpenOrder({ ...srv, creator: cr });
          }}
          onViewCreatorProfile={(cr) => {
            setSelectedServiceForDetail(null);
            handleCreatorClick(cr);
          }}
          onNavigate={navigateTo}
          onSelectOtherService={(newSrv) => {
            setSelectedServiceForDetail({
              ...newSrv,
              creator: selectedServiceForDetail.creator
            });
          }}
        />
      )}

      {/* Pop-up Filters Modal matching Dribbble screenshot */}
      <ServiceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={{
          category: selectedCategory,
          minPrice,
          maxPrice,
          location: selectedLocation,
          minRating,
          availableForWork,
          fastDelivery,
          verifiedOnly
        }}
        onApply={(newFilters) => {
          setSelectedCategory(newFilters.category);
          setMinPrice(newFilters.minPrice);
          setMaxPrice(newFilters.maxPrice);
          setSelectedLocation(newFilters.location);
          setMinRating(newFilters.minRating);
          setAvailableForWork(newFilters.availableForWork);
          setFastDelivery(newFilters.fastDelivery);
          setVerifiedOnly(newFilters.verifiedOnly);
        }}
        onReset={resetAllFilters}
      />

    </div>
  );
};
