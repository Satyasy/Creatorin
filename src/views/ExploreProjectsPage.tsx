'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Search, 
  Play,
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Volume2, 
  VolumeX, 
  Send, 
  SlidersHorizontal,
  Clock,
  Briefcase,
  Star,
  Check,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Tag,
  UserCheck
} from 'lucide-react';
import { ProjectBriefModal } from '@/components/modals/ProjectBriefModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { creatorService } from '@/services/creatorService';
import { ActivePage, AuthState, FeedProject, Creator } from '@/types';

interface ExploreProjectsPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

const CATEGORY_TABS = [
  'Semua',
  'Reels Instagram',
  'Video Tiktok',
  'UI/UX Design',
  'Foto Produk',
  'Feed Instagram',
  'Logo & Branding'
];

const PLATFORM_FILTERS = [
  { id: 'all', label: 'Semua Platform' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'direct', label: 'Creatorin Upload' }
];

const MOCK_FEED_PROJECTS: FeedProject[] = [
  {
    id: 'proj-1',
    title: 'Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)',
    description: 'Video review jujur skincare organik untuk audiens wanita muda TikTok, terbukti meningkatkan konversi penjualan.',
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    creatorId: 'c-maya',
    category: 'Video Tiktok',
    platform: 'tiktok',
    socialHandle: '@mayaangelina.ugc',
    viewsCount: '710.0k',
    likesCount: 42000,
    commentsCount: 380,
    sharesCount: 1540,
    creator: {
      id: 'c-maya',
      name: 'Maya Angelina',
      username: 'mayaangelina',
      handle: '@mayaangelina.ugc',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      category: 'Video',
      roleTitle: 'Beauty & Lifestyle UGC Creator',
      bio: 'Spesialis video TikTok & Reels konversi tinggi.',
      location: 'Jakarta',
      startingRate: 350000,
      formattedRate: 'Rp350.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 48, tier: 'Top Tier' },
      skills: ['UGC Review', 'TikTok Ads', 'Beauty'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-2',
    title: 'Visual Identity & Packaging Box Concept untuk Artisan Coffee Roasters',
    description: 'Sistem identitas merek lengkap dengan mock up packaging siap cetak untuk UMKM kopi lokal.',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-aditya',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@adityadesign',
    viewsCount: '542.1k',
    likesCount: 31000,
    commentsCount: 210,
    sharesCount: 980,
    creator: {
      id: 'c-aditya',
      name: 'Aditya Pratama',
      username: 'adityadesign',
      handle: '@adityadesign',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Image',
      roleTitle: 'Brand & Packaging Designer',
      bio: 'Membantu brand F&B memiliki packaging berdaya saing tinggi.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: 'Rp400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 62, tier: 'Top Tier' },
      skills: ['Brand Identity', 'Packaging', 'Vector'],
      joinedDate: '2022',
    }
  },
  {
    id: 'proj-3',
    title: '15-detik Cinematic Reels B-Roll Promo Makanan Nusantara Pedas Gurih',
    description: 'Video sinematik menggugah selera untuk peluncuran menu baru restoran UMKM.',
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    creatorId: 'c-rendy',
    category: 'Reels Instagram',
    platform: 'instagram',
    socialHandle: '@rendy.visuals',
    viewsCount: '890.3k',
    likesCount: 65000,
    commentsCount: 520,
    sharesCount: 3100,
    creator: {
      id: 'c-rendy',
      name: 'Rendy Visuals',
      username: 'rendyvisuals',
      handle: '@rendy.visuals',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      category: 'Video',
      roleTitle: 'Food & Commercial Videographer',
      bio: 'B-roll komersial berkualitas bioskop untuk kuliner.',
      location: 'Surabaya',
      startingRate: 500000,
      formattedRate: 'Rp500.000',
      careerScore: { overall: 95, deadlineAccuracy: 96, revisionRate: 1.1, completionRate: 100, clientRating: 4.9, completedProjects: 40, tier: 'Top Tier' },
      skills: ['Cinematic B-Roll', 'Food Video', 'Color Grading'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-4',
    title: 'Clean Minimalist UI Mockup & Design System Mobile Commerce App',
    description: 'Desain antarmuka aplikasi belanja mobile dengan fokus pada kenyamanan check-out pengguna.',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'carousel',
    creatorId: 'c-clara',
    category: 'UI/UX Design',
    platform: 'direct',
    socialHandle: '@claraux',
    viewsCount: '412.5k',
    likesCount: 28000,
    commentsCount: 190,
    sharesCount: 890,
    creator: {
      id: 'c-clara',
      name: 'Clara Sinta',
      username: 'claraux',
      handle: '@claraux',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'UI/UX Product Designer',
      bio: 'Desainer produk digital berorientasi konversi UX.',
      location: 'Yogyakarta',
      startingRate: 450000,
      formattedRate: 'Rp450.000',
      careerScore: { overall: 97, deadlineAccuracy: 99, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 55, tier: 'Top Tier' },
      skills: ['Figma', 'UI Design', 'Design System'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-5',
    title: 'Studio Lighting Product Photography Seri Hijab Casual Pastel',
    description: 'Foto katalog produk profesional dengan model dan pencahayaan studio softbox lembut.',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-dimas',
    category: 'Foto Produk',
    platform: 'instagram',
    socialHandle: '@dimas.fashionphoto',
    viewsCount: '625.0k',
    likesCount: 39000,
    commentsCount: 310,
    sharesCount: 1200,
    creator: {
      id: 'c-dimas',
      name: 'Dimas Anggara',
      username: 'dimasfashion',
      handle: '@dimas.fashionphoto',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      category: 'Image',
      roleTitle: 'Fashion & Product Photographer',
      bio: 'Menghidupkan lookbook fashion UMKM.',
      location: 'Jakarta',
      startingRate: 350000,
      formattedRate: 'Rp350.000',
      careerScore: { overall: 94, deadlineAccuracy: 95, revisionRate: 1.2, completionRate: 100, clientRating: 4.8, completedProjects: 36, tier: 'Rising Star' },
      skills: ['Fashion Photo', 'Lighting', 'Editing'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-6',
    title: '9-Grid Aesthetic Instagram Feed Design Tematik Natural Skincare',
    description: 'Rancangan feed Instagram berkesinambungan untuk menciptakan reputasi visual premium bagi brand.',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    mediaType: 'carousel',
    creatorId: 'c-anisa',
    category: 'Feed Instagram',
    platform: 'direct',
    socialHandle: '@anisa_creative',
    viewsCount: '488.2k',
    likesCount: 34000,
    commentsCount: 240,
    sharesCount: 1450,
    creator: {
      id: 'c-anisa',
      name: 'Anisa Rahma',
      username: 'anisacreative',
      handle: '@anisa_creative',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'Visual Feed Specialist',
      bio: 'Pakar visual layout feed media sosial.',
      location: 'Semarang',
      startingRate: 250000,
      formattedRate: 'Rp250.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 50, tier: 'Top Tier' },
      skills: ['Feed Instagram', 'Canva', 'Photoshop'],
      joinedDate: '2022',
    }
  },
  {
    id: 'proj-7',
    title: 'E-Commerce Mega Promo Banner & Carousel Ads Siap Pakai 11.11',
    description: 'Seri banner promosi teroptimasi CTR tinggi untuk marketplace Shopee, Tokopedia, dan TikTok Shop.',
    coverImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-kevin',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@kevinsanjaya',
    viewsCount: '730.4k',
    likesCount: 52000,
    commentsCount: 380,
    sharesCount: 2100,
    creator: {
      id: 'c-kevin',
      name: 'Kevin Sanjaya',
      username: 'kevinsanjaya',
      handle: '@kevinsanjaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Video',
      roleTitle: 'E-Commerce Creative Director',
      bio: 'Desain konversi tinggi untuk campaign penjualan online.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: 'Rp400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 65, tier: 'Top Tier' },
      skills: ['Banner Ads', 'Marketplace', 'Promotion'],
      joinedDate: '2022',
    }
  },
  {
    id: 'proj-8',
    title: 'ASMR Unboxing & Packaging Experience Produk Kerajinan Tangan Kulit',
    description: 'Video ASMR dengan visual detail tekstur bahan kulit asli dan packing estetik ramah lingkungan.',
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    creatorId: 'c-nadia',
    category: 'Video Tiktok',
    platform: 'tiktok',
    socialHandle: '@nadiaputri',
    viewsCount: '915.2k',
    likesCount: 84000,
    commentsCount: 670,
    sharesCount: 4200,
    creator: {
      id: 'c-nadia',
      name: 'Nadia Putri',
      username: 'nadiaputri',
      handle: '@nadiaputri',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      category: 'Video',
      roleTitle: 'UGC & Lifestyle Content Creator',
      bio: 'Konten organik otentik berorientasi engagement.',
      location: 'Semarang',
      startingRate: 300000,
      formattedRate: 'Rp300.000',
      careerScore: { overall: 95, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 45, tier: 'Top Tier' },
      skills: ['ASMR Video', 'Unboxing', 'Lifestyle'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-9',
    title: 'Video Teaser Peluncuran Koleksi Baju Gamis Lebaran 2026',
    description: 'Reels video sinematik dengan musik trend dan hook cepat 3 detik pertama.',
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    creatorId: 'c-maya',
    category: 'Reels Instagram',
    platform: 'instagram',
    socialHandle: '@mayaangelina.ugc',
    viewsCount: '680.1k',
    likesCount: 45000,
    commentsCount: 390,
    sharesCount: 1800,
    creator: {
      id: 'c-maya',
      name: 'Maya Angelina',
      username: 'mayaangelina',
      handle: '@mayaangelina.ugc',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      category: 'Video',
      roleTitle: 'Beauty & Lifestyle UGC Creator',
      bio: 'Spesialis video TikTok & Reels konversi tinggi.',
      location: 'Jakarta',
      startingRate: 350000,
      formattedRate: 'Rp350.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 48, tier: 'Top Tier' },
      skills: ['UGC Review', 'TikTok Ads', 'Beauty'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-10',
    title: 'Logo Mark & Typography Identity untuk Kedai Teh Herbal Tradisional',
    description: 'Logo modern dengan sentuhan nusantara warisan budaya, mudah diaplikasikan di packaging cup.',
    coverImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-aditya',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@adityadesign',
    viewsCount: '340.8k',
    likesCount: 22000,
    commentsCount: 160,
    sharesCount: 740,
    creator: {
      id: 'c-aditya',
      name: 'Aditya Pratama',
      username: 'adityadesign',
      handle: '@adityadesign',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Image',
      roleTitle: 'Brand & Packaging Designer',
      bio: 'Membantu brand F&B memiliki packaging berdaya saing tinggi.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: 'Rp400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 62, tier: 'Top Tier' },
      skills: ['Brand Identity', 'Packaging', 'Vector'],
      joinedDate: '2022',
    }
  },
  {
    id: 'proj-11',
    title: 'Flatlay & Macro Photography Perhiasan Emas & Aksesoris Lokal',
    description: 'Foto perhiasan beresolusi ultra tajam dengan pantulan cahaya berkilau mewah.',
    coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-dimas',
    category: 'Foto Produk',
    platform: 'instagram',
    socialHandle: '@dimas.fashionphoto',
    viewsCount: '512.9k',
    likesCount: 37000,
    commentsCount: 280,
    sharesCount: 1100,
    creator: {
      id: 'c-dimas',
      name: 'Dimas Anggara',
      username: 'dimasfashion',
      handle: '@dimas.fashionphoto',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      category: 'Image',
      roleTitle: 'Fashion & Product Photographer',
      bio: 'Menghidupkan lookbook fashion UMKM.',
      location: 'Jakarta',
      startingRate: 350000,
      formattedRate: 'Rp350.000',
      careerScore: { overall: 94, deadlineAccuracy: 95, revisionRate: 1.2, completionRate: 100, clientRating: 4.8, completedProjects: 36, tier: 'Rising Star' },
      skills: ['Fashion Photo', 'Lighting', 'Editing'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-12',
    title: 'Desain Kemasan Pouch Kopi Arabika Specialty Khas Gayo Aceh',
    description: 'Konsep pouch matte finishing foil dengan ilustrasi orisinil pegunungan nusantara.',
    coverImage: 'https://images.unsplash.com/photo-1559525839-8f8ec328b228?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1559525839-8f8ec328b228?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-aditya',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@adityadesign',
    viewsCount: '425.6k',
    likesCount: 29000,
    commentsCount: 195,
    sharesCount: 890,
    creator: {
      id: 'c-aditya',
      name: 'Aditya Pratama',
      username: 'adityadesign',
      handle: '@adityadesign',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      category: 'Image',
      roleTitle: 'Brand & Packaging Designer',
      bio: 'Membantu brand F&B memiliki packaging berdaya saing tinggi.',
      location: 'Bandung',
      startingRate: 400000,
      formattedRate: 'Rp400.000',
      careerScore: { overall: 98, deadlineAccuracy: 100, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 62, tier: 'Top Tier' },
      skills: ['Brand Identity', 'Packaging', 'Vector'],
      joinedDate: '2022',
    }
  },
  {
    id: 'proj-13',
    title: 'Tutorial 3 Menit Resep Masakan Simple dengan Produk Bumbu Instan',
    description: 'Video memasak step-by-step dengan sudut pandang POV eye-level yang engaging.',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    creatorId: 'c-rendy',
    category: 'Video Tiktok',
    platform: 'tiktok',
    socialHandle: '@rendy.visuals',
    viewsCount: '780.0k',
    likesCount: 58000,
    commentsCount: 430,
    sharesCount: 2900,
    creator: {
      id: 'c-rendy',
      name: 'Rendy Visuals',
      username: 'rendyvisuals',
      handle: '@rendy.visuals',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      category: 'Video',
      roleTitle: 'Food & Commercial Videographer',
      bio: 'B-roll komersial berkualitas bioskop untuk kuliner.',
      location: 'Surabaya',
      startingRate: 500000,
      formattedRate: 'Rp500.000',
      careerScore: { overall: 95, deadlineAccuracy: 96, revisionRate: 1.1, completionRate: 100, clientRating: 4.9, completedProjects: 40, tier: 'Top Tier' },
      skills: ['Cinematic B-Roll', 'Food Video', 'Color Grading'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-14',
    title: 'Infografis Carousel Edukasi Finansial Pengelolaan Kas UMKM',
    description: 'Desain carousel edukatif 7 slide dengan tipografi modern dan ilustrasi ikonik.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    mediaType: 'carousel',
    creatorId: 'c-anisa',
    category: 'Feed Instagram',
    platform: 'instagram',
    socialHandle: '@anisa_creative',
    viewsCount: '390.5k',
    likesCount: 26000,
    commentsCount: 180,
    sharesCount: 1300,
    creator: {
      id: 'c-anisa',
      name: 'Anisa Rahma',
      username: 'anisacreative',
      handle: '@anisa_creative',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'Visual Feed Specialist',
      bio: 'Pakar visual layout feed media sosial.',
      location: 'Semarang',
      startingRate: 250000,
      formattedRate: 'Rp250.000',
      careerScore: { overall: 96, deadlineAccuracy: 98, revisionRate: 1.0, completionRate: 100, clientRating: 5.0, completedProjects: 50, tier: 'Top Tier' },
      skills: ['Feed Instagram', 'Canva', 'Photoshop'],
      joinedDate: '2022',
    }
  },
  {
    id: 'proj-15',
    title: '3D Mockup Botol Serum Skincare Glass Minimalis dengan Dropper Gold',
    description: 'Render visual 3D ultra realistis untuk keperluan landing page dan materi promosi UMKM kecantikan.',
    coverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    creatorId: 'c-clara',
    category: 'UI/UX Design',
    platform: 'direct',
    socialHandle: '@claraux',
    viewsCount: '495.0k',
    likesCount: 36000,
    commentsCount: 245,
    sharesCount: 1050,
    creator: {
      id: 'c-clara',
      name: 'Clara Sinta',
      username: 'claraux',
      handle: '@claraux',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Image',
      roleTitle: 'UI/UX Product Designer',
      bio: 'Desainer produk digital berorientasi konversi UX.',
      location: 'Yogyakarta',
      startingRate: 450000,
      formattedRate: 'Rp450.000',
      careerScore: { overall: 97, deadlineAccuracy: 99, revisionRate: 1.0, completionRate: 100, clientRating: 4.9, completedProjects: 55, tier: 'Top Tier' },
      skills: ['Figma', 'UI Design', 'Design System'],
      joinedDate: '2023',
    }
  },
  {
    id: 'proj-16',
    title: 'Micro-documentary Kisah Perjuangan UMKM Sepatu Lokal Bandung',
    description: 'Video storytelling emosional yang meningkatkan brand loyalty dan value produk kerajinan.',
    coverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    creatorId: 'c-rendy',
    category: 'Reels Instagram',
    platform: 'instagram',
    socialHandle: '@rendy.visuals',
    viewsCount: '860.5k',
    likesCount: 71000,
    commentsCount: 540,
    sharesCount: 3600,
    creator: {
      id: 'c-rendy',
      name: 'Rendy Visuals',
      username: 'rendyvisuals',
      handle: '@rendy.visuals',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      category: 'Video',
      roleTitle: 'Food & Commercial Videographer',
      bio: 'B-roll komersial berkualitas bioskop untuk kuliner.',
      location: 'Surabaya',
      startingRate: 500000,
      formattedRate: 'Rp500.000',
      careerScore: { overall: 95, deadlineAccuracy: 96, revisionRate: 1.1, completionRate: 100, clientRating: 4.9, completedProjects: 40, tier: 'Top Tier' },
      skills: ['Cinematic B-Roll', 'Food Video', 'Color Grading'],
      joinedDate: '2023',
    }
  }
];

export const ExploreProjectsPage: React.FC<ExploreProjectsPageProps> = ({
  currentUser: propUser,
  onSignOut,
  onNavigate,
  onViewCreatorProfile
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

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
      router.push(routeMap[page] || '/jelajah/proyek');
    }
  };

  const handleCreatorClick = (creator: Creator) => {
    if (onViewCreatorProfile) onViewCreatorProfile(creator);
    else router.push(`/creator/${creator.id}`);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'kategori' | 'platform' | 'format' | 'sort' | null>(null);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [projects, setProjects] = useState<FeedProject[]>(MOCK_FEED_PROJECTS);
  useEffect(() => {
    creatorService
      .getFeedProjects()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
          setProjects(fetched);
        } else {
          setProjects(MOCK_FEED_PROJECTS);
        }
      })
      .catch(() => setProjects(MOCK_FEED_PROJECTS));
  }, []);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | undefined>(undefined);
  
  // Likes & Save simulation state
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [followingCreators, setFollowingCreators] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState('');
  const [postComments, setPostComments] = useState<Record<string, { user: string; text: string; time: string }[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    const list = projects.filter((proj) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ = 
          (proj.title?.toLowerCase() || '').includes(q) ||
          (proj.caption?.toLowerCase() || '').includes(q) ||
          (proj.creator?.name?.toLowerCase() || '').includes(q) ||
          (proj.socialHandle?.toLowerCase() || '').includes(q) ||
          (proj.tags || []).some(t => (t?.toLowerCase() || '').includes(q));
        if (!matchesQ) return false;
      }

      // Category tab
      if (selectedCategory !== 'Semua' && proj.category !== selectedCategory) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all' && proj.platform !== selectedPlatform) {
        return false;
      }

      // Media format filter
      if (selectedFormat !== 'all' && proj.mediaType !== selectedFormat) {
        return false;
      }

      // Tag filter
      if (selectedTag) {
        const cleanTag = selectedTag.toLowerCase().replace('#', '');
        const matchesTag = (proj.tags || []).some(t => (t?.toLowerCase() || '').includes(cleanTag));
        if (!matchesTag) return false;
      }

      return true;
    });

    // Sorting
    if (selectedSort === 'likes') {
      return [...list].sort((a, b) => b.likesCount - a.likesCount);
    } else if (selectedSort === 'views') {
      const parseViews = (v?: string | number) => {
        if (!v) return 0;
        const str = String(v).toLowerCase();
        const num = parseFloat(str.replace(/[^0-9.]/g, ''));
        if (str.includes('k')) return num * 1000;
        if (str.includes('m')) return num * 1000000;
        return num || 0;
      };
      return [...list].sort((a, b) => parseViews(b.viewsCount) - parseViews(a.viewsCount));
    } else if (selectedSort === 'latest') {
      return [...list].reverse();
    } else {
      // popular
      return [...list].sort((a, b) => (b.sharesCount + b.likesCount) - (a.sharesCount + a.likesCount));
    }
  }, [searchQuery, selectedCategory, selectedPlatform, selectedFormat, selectedSort, selectedTag, projects]);

  const handleOpenProjectModal = (proj: FeedProject) => {
    setSelectedProject(proj);
    setCurrentCarouselIndex(0);
    setIsVideoPlaying(true);
  };

  const handleToggleLike = (projId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedPosts(prev => ({
      ...prev,
      [projId]: !prev[projId]
    }));
  };

  const handleToggleSave = (projId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willSave = !savedPosts[projId];
    setSavedPosts(prev => ({
      ...prev,
      [projId]: willSave
    }));
    showToast(willSave ? 'Disimpan ke Koleksi Favorit' : 'Dihapus dari Koleksi');
  };

  const handleToggleFollow = (creatorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFollowingCreators(prev => ({
      ...prev,
      [creatorId]: !prev[creatorId]
    }));
    showToast(followingCreators[creatorId] ? 'Berhenti mengikuti' : 'Mengikuti kreator');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedProject) return;

    const newComment = {
      user: currentUser?.name || 'Anda',
      text: commentInput.trim(),
      time: 'Baru saja'
    };

    setPostComments(prev => ({
      ...prev,
      [selectedProject.id]: [...(prev[selectedProject.id] || []), newComment]
    }));
    setCommentInput('');
    showToast('Komentar berhasil dikirim!');
  };

  const handleOrderSimilar = (proj: FeedProject) => {
    setTargetCreatorForBrief(proj.creator);
    setIsBriefModalOpen(true);
  };

  return (
    <div className="w-full bg-[#fafafa] text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#0d0c22] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        

        {/* H1 Page Title & Subtitle Matching Figma */}
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[#0D0C22] tracking-tight">
            Jelajah Proyek & Portofolio Kreator
          </h1>
          <p className="text-sm text-[#737373] mt-1.5 max-w-2xl leading-relaxed">
            Temukan portofolio nyata, video Reels, konten TikTok, dan sistem desain yang telah diproduksi oleh kreator top terverifikasi Creatorin.
          </p>
        </div>

        {/* Section Heading & Filter Toolbar Matching Figma */}
        <section className="pt-4 pb-4 border-t border-[#E5E5E5]/80 mb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0D0C22]">
              Cari Proyek berdasarkan Kategori
            </h2>

            {/* Filter Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 relative z-30">
              
              {/* Reset / Clear All Filter Button */}
              <button 
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedPlatform('all');
                  setSelectedFormat('all');
                  setSelectedSort('popular');
                  setSelectedTag(null);
                  setSearchQuery('');
                  setOpenDropdown(null);
                }}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  (selectedCategory !== 'Semua' || selectedPlatform !== 'all' || selectedFormat !== 'all' || selectedSort !== 'popular' || selectedTag || searchQuery)
                    ? 'border-[#0d0c22] bg-[#0d0c22] text-white shadow-2xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                }`}
                title="Reset Semua Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown 1: Kategori */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedCategory !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'kategori' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in max-h-72 overflow-y-auto">
                    {CATEGORY_TABS.map((cat) => (
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
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Platform */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'platform' ? null : 'platform')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedPlatform !== 'all' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedPlatform === 'all' 
                      ? 'Platform' 
                      : selectedPlatform === 'instagram' 
                      ? 'Instagram' 
                      : selectedPlatform === 'tiktok' 
                      ? 'TikTok' 
                      : 'Creatorin Upload'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'platform' && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {PLATFORM_FILTERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPlatform(p.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedPlatform === p.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{p.label}</span>
                        {selectedPlatform === p.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Format Media */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'format' ? null : 'format')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedFormat !== 'all' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedFormat === 'all' 
                      ? 'Format Media' 
                      : selectedFormat === 'video' 
                      ? 'Video / Reels' 
                      : selectedFormat === 'carousel' 
                      ? 'Carousel' 
                      : 'Foto / Desain'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'format' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'all', label: 'Semua Format' },
                      { id: 'video', label: 'Video / Reels' },
                      { id: 'carousel', label: 'Carousel Multi-slide' },
                      { id: 'image', label: 'Foto / Desain Tunggal' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => {
                          setSelectedFormat(fmt.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedFormat === fmt.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{fmt.label}</span>
                        {selectedFormat === fmt.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Urutkan */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedSort !== 'popular' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedSort === 'popular'
                      ? 'Urutkan: Populer'
                      : selectedSort === 'likes'
                      ? 'Urutkan: Likes'
                      : selectedSort === 'views'
                      ? 'Urutkan: Views'
                      : 'Urutkan: Terbaru'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'sort' && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-40 animate-in fade-in">
                    {[
                      { id: 'popular', label: 'Paling Populer' },
                      { id: 'likes', label: 'Terbanyak Disukai' },
                      { id: 'views', label: 'Terbanyak Dilihat' },
                      { id: 'latest', label: 'Terbaru' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSort(s.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedSort === s.id ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {selectedSort === s.id && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Transparent Backdrop to close dropdowns */}
          {openDropdown && (
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setOpenDropdown(null)} 
            />
          )}

          {searchQuery && (
            <div className="flex items-center gap-2 mt-3 text-xs font-medium text-neutral-600">
              <span>Hasil pencarian dari navbar: <strong className="text-[#0d0c22]">"{searchQuery}"</strong></span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded cursor-pointer"
                title="Hapus filter pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* Explore Feed Grid (Instagram/TikTok Explore Style - Dempet Grid with Uniform 4:5 Ratio) */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0d0c22]">Tidak Ada Konten Ditemukan</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1 mb-6">
              Coba sesuaikan kata kunci pencarian atau ubah filter platform dan kategori untuk menemukan karya lainnya.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setSelectedPlatform('all');
                setSelectedFormat('all');
                setSelectedSort('popular');
                setSelectedTag(null);
              }}
              className="h-11 px-6 rounded-xl bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#123B8C] transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredProjects.map((project, pIdx) => (
              <ScrollReveal
                key={project.id}
                distance={28}
                delay={Math.min((pIdx % 4) * 70, 240)}
                duration={600}
              >
                <ProjectCard
                  id={`feed-card-${project.id}`}
                  project={project}
                  isSaved={Boolean(savedPosts[project.id])}
                  onToggleSave={(id, e) => handleToggleSave(id, e)}
                  onClick={() => handleOpenProjectModal(project)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

      </main>

      {/* Full Preview Modal matching requested design */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSelectProject={(newProj) => setSelectedProject(newProj)}
          onViewCreatorProfile={(c) => {
            handleCreatorClick(c);
            setSelectedProject(null);
          }}
          onGetInTouch={(c) => {
            setSelectedProject(null);
            setTargetCreatorForBrief(c);
            setIsBriefModalOpen(true);
          }}
          onScheduleCall={(c) => {
            setSelectedProject(null);
            setTargetCreatorForBrief(c);
            setIsBriefModalOpen(true);
          }}
          onNavigate={navigateTo}
          allProjects={projects}
        />
      )}

      {/* Project Brief Modal (When ordering similar content) */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        targetCreator={targetCreatorForBrief}
      />
    </div>
  );
};
