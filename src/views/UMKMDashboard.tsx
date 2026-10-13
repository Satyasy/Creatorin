'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  Bookmark, 
  Check, 
  ChevronDown, 
  Clock,
  Layers, 
  MapPin, 
  Package, 
  Play,
  Search, 
  Star, 
  User, 
  X,
  Loader2
} from 'lucide-react';
import { creatorService } from '@/services/creatorService';
import { useAuth } from '@/providers/AuthProvider';
import { FeedProject, CreatorService, Creator, AuthState } from '@/types';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { startRouteProgress } from '@/components/common/RouteProgressBar';
import { AuthModal } from '@/components/modals/AuthModal';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

const ServiceDetailModal = dynamic(
  () => import('@/components/modals/ServiceDetailModal').then((mod) => mod.ServiceDetailModal),
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

interface HomeServiceItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorSlug: string;
}

interface HomeProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  mediaUrl: string;
  viewsCount: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
}

const INITIAL_SHOWCASE_SERVICES: HomeServiceItem[] = [
  {
    id: 'svc-home-1',
    tag: 'TIKTOK UGC',
    title: '1x Video TikTok UGC & Review Viral',
    description: 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
    price: 'Rp1.500.000',
    duration: '2 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-sobakhul',
    creatorName: 'Sobakhul Munir Siroj',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'sobakhul-munir',
  },
  {
    id: 'svc-home-2',
    tag: 'BRANDING',
    title: 'Desain Identitas Brand & Logo Master Kit UMKM',
    description: 'Logo primer, sekunder, palet warna, tipografi dan file master vector siap cetak.',
    price: 'Rp750.000',
    duration: '3 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-qaesyaar-aqeel',
    creatorName: 'Qaesyaar Aqeel',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'qaesyaar-aqeel',
  },
  {
    id: 'svc-home-3',
    tag: 'REELS INSTAGRAM',
    title: 'Reels Aesthetic Cinematic Lifestyle Product',
    description: 'Video reels dinamis menampilkan detail tekstur produk dan angle sinematik.',
    price: 'Rp300.000',
    duration: '2 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-sarah-amelia',
    creatorName: 'Sarah Amelia',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'sarah.amelia',
  },
  {
    id: 'svc-home-4',
    tag: 'MOTION GRAPHIC',
    title: 'Animasi Logo 3D Intro & Motion Reel 15 Detik',
    description: 'Motion grafis modern untuk opening YouTube, reels, dan promosi media sosial.',
    price: 'Rp450.000',
    duration: '3 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-kevin-sanjaya',
    creatorName: 'Kevin Sanjaya',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'kevinsanjaya',
  },
  {
    id: 'svc-home-5',
    tag: 'KEMASAN',
    title: 'Packaging & Label Desain Standing Pouch Siap Cetak',
    description: 'Desain label pouch kopi & cemilan dengan layout visual menarik siap naik cetak.',
    price: 'Rp350.000',
    duration: '3 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-anisa-rahma',
    creatorName: 'Anisa Rahma',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'anisa-rahma',
  },
  {
    id: 'svc-home-6',
    tag: 'FOTO PRODUK',
    title: 'Foto Produk Studio Komersial White Background',
    description: 'Sesi foto studio katalog produk dengan lighting profesional & retouching detail.',
    price: 'Rp250.000',
    duration: '2 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-budi-pratama',
    creatorName: 'Budi Pratama',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'budipratama',
  },
  {
    id: 'svc-home-7',
    tag: 'TIKTOK UGC',
    title: 'Unboxing Jujur & First Impression Brand Video',
    description: 'Video unboxing natural dengan review jujur dan call to action yang meyakinkan.',
    price: 'Rp250.000',
    duration: '2 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-sarah-amelia',
    creatorName: 'Sarah Amelia',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'sarah.amelia',
  },
  {
    id: 'svc-home-8',
    tag: 'FEED INSTAGRAM',
    title: 'Desain Feed Instagram Aesthetic (9-12 Grid Canva)',
    description: 'Template feed terintegrasi dan konsisten yang bisa diedit mandiri di Canva.',
    price: 'Rp300.000',
    duration: '3 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-anisa-rahma',
    creatorName: 'Anisa Rahma',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'anisa-rahma',
  },
  {
    id: 'svc-home-9',
    tag: 'BANNER PROMO',
    title: 'Banner Hero Marketplace Shopee & Tokopedia',
    description: 'Banner promosi flash sale dengan visual eye-catching dan conversion-focused.',
    price: 'Rp150.000',
    duration: '1 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-qaesyaar-aqeel',
    creatorName: 'Qaesyaar Aqeel',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'qaesyaar-aqeel',
  },
  {
    id: 'svc-home-10',
    tag: 'KULINER',
    title: 'Food Photography & Styling Minuman Kekinian',
    description: 'Foto makanan dan minuman menggugah selera untuk menu GoFood, GrabFood & ShopeeFood.',
    price: 'Rp280.000',
    duration: '2 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-budi-pratama',
    creatorName: 'Budi Pratama',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'budipratama',
  },
  {
    id: 'svc-home-11',
    tag: 'TIKTOK UGC',
    title: 'Serial 3 Video TikTok Ads Edukatif Produk Skincare',
    description: 'Konten soft selling dengan hook kuat dan problem solving yang relate bagi audiens.',
    price: 'Rp600.000',
    duration: '3 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-sarah-amelia',
    creatorName: 'Sarah Amelia',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'sarah.amelia',
  },
  {
    id: 'svc-home-12',
    tag: 'BRANDING',
    title: 'Rebranding Visual Kedai Kopi & Cafe Minimalis',
    description: 'Paket brand guide lengkap mencakup logo, kartu nama, apron & desain cup kopi.',
    price: 'Rp850.000',
    duration: '4 Hari Kerja',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
    creatorId: 'creator-kevin-sanjaya',
    creatorName: 'Kevin Sanjaya',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorSlug: 'kevinsanjaya',
  },
];

const INITIAL_SHOWCASE_PROJECTS: HomeProjectItem[] = [
  {
    id: 'prj-home-1',
    title: 'Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)',
    category: 'TIKTOK UGC',
    description: 'Ulasan jujur 14 hari pemakaian serum restorasi skin barrier yang viral di TikTok.',
    mediaUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    viewsCount: '710.0K',
    creatorId: 'creator-maya',
    creatorName: 'Maya Angelina',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@mayaangelina.ugc',
  },
  {
    id: 'prj-home-2',
    title: 'Rebranding Visual Kopi Specialty Lereng Ijen & Packaging Box',
    category: 'Branding & Kemasan',
    description: 'Peremajaan identitas visual kemasan biji kopi single origin dengan stiker warna bumi dan tipografi modern.',
    mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.2M',
    creatorId: 'creator-pro',
    creatorName: 'Sobakhul Munir',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@sobakhul.design',
  },
  {
    id: 'prj-home-3',
    title: 'Motion Teaser Peluncuran Koleksi Batik Kontemporer 3D',
    category: 'Motion Graphic',
    description: 'Video teaser 3D partikel kain batik sutra berpadu efek cahaya sinematik untuk promosi peluncuran produk baru.',
    mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    viewsCount: '980.5K',
    creatorId: 'creator-kevin-sanjaya',
    creatorName: 'Kevin Sanjaya',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@kevinsanjaya.motion',
  },
  {
    id: 'prj-home-4',
    title: 'Kampanye Video UGC Minuman Segar Herbal Organik Nusantara',
    category: 'UGC & Video',
    description: 'Serial 5 video TikTok edukatif tentang khasiat rempah nusantara yang menghasilkan konversi tinggi.',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    viewsCount: '450.2K',
    creatorId: 'creator-sarah-amelia',
    creatorName: 'Sarah Amelia',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@sarah.amelia',
  },
  {
    id: 'prj-home-5',
    title: 'Lookbook Video Fashion Streetwear Lokal Jakarta Aesthetic',
    category: 'Fashion Video',
    description: 'Video reels dinamis menampilkan detail jahitan dan gaya berpakaian kasual di area perkotaan Jakarta.',
    mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    viewsCount: '630.0K',
    creatorId: 'creator-sarah-amelia',
    creatorName: 'Sarah Amelia',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@sarah.streetwear',
  },
  {
    id: 'prj-home-6',
    title: 'Desain Kotak Kemasan Cookies & Pastry Ramadan Premium Gold Foil',
    category: 'Packaging Design',
    description: 'Desain hardbox premium bernuansa islami modern dengan aksen hot stamp gold foil untuk hampers Idul Fitri.',
    mediaUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    viewsCount: '520.1K',
    creatorId: 'creator-anisa-rahma',
    creatorName: 'Anisa Rahma',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@anisa.packaging',
  },
  {
    id: 'prj-home-7',
    title: 'Identitas Visual Kedai Teh Tradisional Omah Jamu Yogyakarta',
    category: 'Brand Identity',
    description: 'Eksplorasi logo organik, stempel kemasan craft, dan menu kayu untuk kedai teh artisan di Yogyakarta.',
    mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    viewsCount: '310.8K',
    creatorId: 'creator-anisa-rahma',
    creatorName: 'Anisa Rahma',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@anisa.brand',
  },
  {
    id: 'prj-home-8',
    title: 'Fotografi Studio Produk Keramik Kerajinan Tangan Lokal',
    category: 'Commercial Photo',
    description: 'Sesi foto katalog produk studio keramik handmade dengan penataan cahaya dramatis.',
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    viewsCount: '240.5K',
    creatorId: 'creator-budi-pratama',
    creatorName: 'Budi Pratama',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@budi.photo',
  },
  {
    id: 'prj-home-9',
    title: 'Cinematic Reels Cafe Estetik Sunday Morning Vibes Bandung',
    category: 'Reels Instagram',
    description: 'Pengambilan gambar suasana pagi di coffeeshop dengan color grading warm and nostalgic.',
    mediaUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
    viewsCount: '890.3K',
    creatorId: 'creator-maya',
    creatorName: 'Maya Angelina',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@mayaangelina.ugc',
  },
  {
    id: 'prj-home-10',
    title: '3D Packaging Reveal Minuman Energi Kaleng Tropis',
    category: 'Motion Graphic',
    description: 'Simulasi kondensasi tetesan air pada kaleng dengan animasi putar 360 derajat.',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    viewsCount: '410.7K',
    creatorId: 'creator-kevin-sanjaya',
    creatorName: 'Kevin Sanjaya',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@kevinsanjaya.motion',
  },
  {
    id: 'prj-home-11',
    title: 'E-Commerce Product Styling & Lighting Katalog Tas Kulit Asli',
    category: 'Foto Produk',
    description: 'Penataan tata lampu premium untuk menonjolkan tekstur kulit asli produk kerajinan Garut.',
    mediaUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
    viewsCount: '360.0K',
    creatorId: 'creator-budi-pratama',
    creatorName: 'Budi Pratama',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@budi.photo',
  },
  {
    id: 'prj-home-12',
    title: 'TikTok Ads Hook Formula Skincare Glowing Alami Dalam 7 Hari',
    category: 'TIKTOK UGC',
    description: 'Penerapan 3 hook video berbeda untuk split test iklan berbayar TikTok Shop.',
    mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.1M',
    creatorId: 'creator-maya',
    creatorName: 'Maya Angelina',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorHandle: '@mayaangelina.ugc',
  },
];

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
  const [savedServices, setSavedServices] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [visibleServicesCount, setVisibleServicesCount] = useState(8);
  const [visibleProjectsCount, setVisibleProjectsCount] = useState(8);
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);
  const [selectedService, setSelectedService] = useState<{ service: CreatorService; creator: Creator } | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [loadingCreatorId, setLoadingCreatorId] = useState<string | null>(null);

  // AuthModal state for protected actions
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    title: string;
    description: string;
    action?: (user?: NonNullable<AuthState['user']>) => void;
  }>({
    title: 'Masuk ke Akun Creatorin',
    description: 'Masuk untuk melanjutkan tindakan ini dan membuka akses ke seluruh fitur kolaborasi.',
  });

  const handleNavigateToCreator = (creatorIdOrSlug: string, id: string) => {
    setLoadingCreatorId(id);
    startRouteProgress();
    router.push(`/creator/${creatorIdOrSlug}`);
  };

  const handleOpenChatWithCreator = (creatorId: string) => {
    if (!user) {
      setAuthModalConfig({
        title: 'Masuk untuk Menghubungi Kreator',
        description: 'Anda harus masuk ke akun Creatorin Anda terlebih dahulu untuk memulai obrolan langsung dan mendiskusikan kebutuhan kolaborasi.',
        action: () => {
          router.push(`/chat?creatorId=${creatorId}`);
        },
      });
      setIsAuthModalOpen(true);
      return;
    }
    router.push(`/chat?creatorId=${creatorId}`);
  };

  const [showcaseCreators, setShowcaseCreators] = useState<ShowcaseCreator[]>(INITIAL_SHOWCASE_CREATORS);
  const [showcaseServices, setShowcaseServices] = useState<HomeServiceItem[]>(INITIAL_SHOWCASE_SERVICES);
  const [showcaseProjects, setShowcaseProjects] = useState<HomeProjectItem[]>(INITIAL_SHOWCASE_PROJECTS);

  useEffect(() => {
    // 1. Fetch creators from API
    creatorService
      .getCreators()
      .then((fetched) => {
        if (fetched && fetched.length > 0) {
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
      .catch(() => {});

    // 2. Fetch services from API
    fetch('/api/services', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.services && data.services.length > 0) {
          const apiMapped: HomeServiceItem[] = data.services.map((s: any) => ({
            id: s.id,
            tag: (s.category || 'Layanan').toUpperCase(),
            title: s.title,
            description: s.description || 'Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.',
            price: s.price || (s.priceNumeric ? `Rp${s.priceNumeric.toLocaleString('id-ID')}` : 'Rp250.000'),
            duration: s.estimatedDays || '3 Hari Kerja',
            image: s.imageUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
            creatorId: s.creatorId,
            creatorName: s.creatorName || 'Kreator Terverifikasi',
            creatorAvatar: s.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            creatorSlug: s.creatorSlug || s.creatorId,
          }));
          setShowcaseServices([...apiMapped, ...INITIAL_SHOWCASE_SERVICES.filter(init => !apiMapped.some(api => api.id === init.id))]);
        }
      })
      .catch(() => {});

    // 3. Fetch feed projects from API
    creatorService
      .getFeedProjects()
      .then((projs) => {
        if (projs && projs.length > 0) {
          const apiMapped: HomeProjectItem[] = projs.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category || 'Proyek Kreatif',
            description: p.description || '',
            mediaUrl: p.mediaUrl || p.coverImage,
            viewsCount: p.viewsCount || '500K',
            creatorId: p.creatorId || p.creator?.id || '',
            creatorName: p.creator?.name || 'Kreator',
            creatorAvatar: p.creator?.avatar || '',
            creatorHandle: p.creator?.username ? `@${p.creator.username}` : '@creator',
          }));
          setShowcaseProjects([...apiMapped, ...INITIAL_SHOWCASE_PROJECTS.filter(init => !apiMapped.some(api => api.id === init.id))]);
        }
      })
      .catch(() => {});
  }, []);

  const toggleBookmark = (creatorId: string) => {
    setSavedCreators((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  const toggleBookmarkService = (serviceId: string) => {
    setSavedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const handleTabChange = (tab: 'creator' | 'layanan' | 'proyek') => {
    setActiveTab(tab);
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

  const filteredServices = useMemo(() => {
    let list = [...showcaseServices];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter((service) => {
        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesTag = service.tag.toLowerCase().includes(query);
        const matchesCreator = service.creatorName.toLowerCase().includes(query);
        const matchesDesc = service.description.toLowerCase().includes(query);
        return matchesTitle || matchesTag || matchesCreator || matchesDesc;
      });
    }

    return list;
  }, [showcaseServices, searchQuery]);

  const filteredProjects = useMemo(() => {
    let list = [...showcaseProjects];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter((proj) => {
        const matchesTitle = proj.title.toLowerCase().includes(query);
        const matchesCat = proj.category.toLowerCase().includes(query);
        const matchesHandle = proj.creatorHandle.toLowerCase().includes(query);
        const matchesCreator = proj.creatorName.toLowerCase().includes(query);
        const matchesDesc = proj.description.toLowerCase().includes(query);
        return matchesTitle || matchesCat || matchesHandle || matchesCreator || matchesDesc;
      });
    }

    return list;
  }, [showcaseProjects, searchQuery]);

  const handleServiceClick = (service: ShowcaseService, creator: ShowcaseCreator) => {
    const creatorServiceMock: CreatorService = {
      id: service.id,
      title: service.title,
      price: parseInt(service.price.replace(/[^0-9]/g, '')) || 3800000,
      formattedPrice: service.price,
      deliveryDays: service.duration,
      tag: service.tag,
      coverImage: service.image,
      description: 'Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.',
      revisions: '2x Revisi Gratis',
    };
    const creatorMock: Creator = {
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
    };
    setSelectedService({ service: creatorServiceMock, creator: creatorMock });
  };

  const handleLayananCardClick = (service: HomeServiceItem) => {
    const creatorServiceMock: CreatorService = {
      id: service.id,
      title: service.title,
      price: parseInt(service.price.replace(/[^0-9]/g, '')) || 3800000,
      formattedPrice: service.price,
      deliveryDays: service.duration,
      tag: service.tag,
      coverImage: service.image,
      description: service.description || 'Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.',
      revisions: '2x Revisi Gratis',
    };
    const creatorMock: Creator = {
      id: service.creatorId,
      name: service.creatorName,
      username: service.creatorSlug || service.creatorId,
      avatar: service.creatorAvatar,
      category: 'Image',
      roleTitle: 'Kreator Profesional',
      bio: `${service.creatorName} di Creatorin`,
      location: 'Indonesia',
      startingRate: 250000,
      formattedRate: service.price,
      careerScore: {
        overall: 96,
        deadlineAccuracy: 98,
        revisionRate: 1,
        completionRate: 100,
        clientRating: 4.9,
        completedProjects: 48,
        tier: 'Top Tier',
      },
      rating: 4.9,
      reviewCount: 48,
      skills: [service.tag, 'Desain & Kreatif'],
      joinedDate: '2024',
    };
    setSelectedService({ service: creatorServiceMock, creator: creatorMock });
  };

  const handleProjectCardClick = (project: HomeProjectItem) => {
    const feedProjectMock: FeedProject = {
      id: project.id,
      title: project.title,
      description: project.description || `${project.title} oleh ${project.creatorName}`,
      coverImage: project.mediaUrl,
      mediaUrl: project.mediaUrl,
      mediaType: 'image',
      creatorId: project.creatorId,
      creator: {
        id: project.creatorId,
        name: project.creatorName,
        username: project.creatorHandle.replace('@', ''),
        avatar: project.creatorAvatar,
        category: (project.category.toLowerCase().includes('video') || project.category.toLowerCase().includes('tiktok') || project.category.toLowerCase().includes('motion')) ? 'Video' : 'Image',
        roleTitle: 'Kreator Profesional',
        bio: `${project.creatorName} di Creatorin`,
        location: 'Indonesia',
        startingRate: 250000,
        formattedRate: 'Rp250.000',
        careerScore: {
          overall: 95,
          deadlineAccuracy: 98,
          revisionRate: 1,
          completionRate: 100,
          clientRating: 4.9,
          completedProjects: 45,
          tier: 'Top Tier',
        },
        rating: 4.9,
        reviewCount: 38,
        skills: [project.category, 'Kreator Digital', 'Portofolio'],
        joinedDate: '2024',
      },
      category: project.category,
      platform: 'direct',
      tags: [project.category.replace(/\s+/g, '')],
      likesCount: 142,
      commentsCount: 18,
      viewsCount: project.viewsCount,
      sharesCount: 12,
    };
    setSelectedProject(feedProjectMock);
  };

  const allFeedProjects = useMemo<FeedProject[]>(() => {
    return showcaseProjects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      coverImage: p.mediaUrl,
      mediaUrl: p.mediaUrl,
      mediaType: 'image',
      creatorId: p.creatorId,
      creator: {
        id: p.creatorId,
        name: p.creatorName,
        username: p.creatorHandle.replace('@', ''),
        avatar: p.creatorAvatar,
        category: 'Image',
        roleTitle: 'Kreator Profesional',
        bio: `${p.creatorName} di Creatorin`,
        location: 'Indonesia',
        startingRate: 250000,
        formattedRate: 'Rp250.000',
        careerScore: {
          overall: 95,
          deadlineAccuracy: 98,
          revisionRate: 1,
          completionRate: 100,
          clientRating: 4.9,
          completedProjects: 45,
          tier: 'Top Tier',
        },
        rating: 4.9,
        reviewCount: 38,
        skills: [p.category, 'Kreator Digital'],
        joinedDate: '2024',
      },
      category: p.category,
      platform: 'direct',
      tags: [p.category.replace(/\s+/g, '')],
      likesCount: 142,
      commentsCount: 18,
      viewsCount: p.viewsCount,
      sharesCount: 12,
    }));
  }, [showcaseProjects]);

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      {/* Symmetrical Hero Section matching Figma 4816-18898 */}
      <HomeHeroSection
        onExploreClick={() => router.push('/jelajah/kreator')}
        onSecondaryClick={user ? () => setIsBriefModalOpen(true) : () => router.push('/sign-in')}
        secondaryText={user ? 'Buat Brief Proyek' : 'Bergabung Creatorin'}
      />

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* 1. Subnav Switcher Tabs (Creator, Layanan, Proyek) */}
        <div className="flex items-center gap-2 sm:gap-3 pb-2">
          <button
            type="button"
            onClick={() => handleTabChange('creator')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-[#F4F5F7] text-[#0D0C22] shadow-xs ring-1 ring-black/5 font-bold'
                : 'text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]'
            }`}
          >
            <User className="w-4 h-4 text-inherit" />
            <span>Creator</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('layanan')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'layanan'
                ? 'bg-[#F4F5F7] text-[#0D0C22] shadow-xs ring-1 ring-black/5 font-bold'
                : 'text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]'
            }`}
          >
            <Package className="w-4 h-4 text-inherit" />
            <span>Layanan</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('proyek')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'proyek'
                ? 'bg-[#F4F5F7] text-[#0D0C22] shadow-xs ring-1 ring-black/5 font-bold'
                : 'text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F8F9FC]'
            }`}
          >
            <Layers className="w-4 h-4 text-inherit" />
            <span>Proyek</span>
          </button>
        </div>

        {/* 2. Full-Width Search Input Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative w-full max-w-full rounded-full bg-[#F4F5F7] hover:bg-[#ECEEF2] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155DFC] focus-within:border-transparent border border-[#E1E3EA] px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 transition-all mt-4 mb-8 sm:mb-10"
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

        {/* 3. TAB CONTENT */}

        {/* A. Creator Feed (matching Figma node 4812-8437) */}
        {activeTab === 'creator' && (
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
                    <div 
                      onMouseEnter={() => router.prefetch(`/creator/${creator.slug || creator.id}`)}
                      className="flex items-center gap-3.5 min-w-0"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-12 h-12 rounded-full object-cover ring-1 ring-black/5"
                          loading="lazy"
                        />
                        {loadingCreatorId === creator.id && (
                          <div className="absolute inset-0 bg-neutral-900/40 rounded-full flex items-center justify-center text-white backdrop-blur-[1px]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            onClick={() => handleNavigateToCreator(creator.slug || creator.id, creator.id)}
                            className="font-semibold text-base sm:text-[17px] text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors truncate font-display inline-flex items-center gap-1.5"
                          >
                            <span>{creator.name}</span>
                            {loadingCreatorId === creator.id && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#155DFC]" />
                            )}
                          </h3>
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
                        onClick={() => handleOpenChatWithCreator(creator.id)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service, creator);
                        }}
                        className="rounded-xl overflow-hidden border border-[#E1E3EA] bg-white group cursor-pointer hover:shadow-md hover:border-[#A9C3FF] transition-all"
                      >
                        <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium z-10">
                            {service.tag}
                          </span>
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
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
        )}

        {/* B. Layanan Grid (matching Figma node 4812-9469) */}
        {activeTab === 'layanan' && (
          <section aria-label="Daftar Layanan Kreator">
            {filteredServices.length === 0 ? (
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-12 text-center my-8">
                <p className="text-sm font-semibold text-[#0D0C22]">Belum ada layanan yang cocok dengan pencarian.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-semibold text-[#155DFC] hover:underline cursor-pointer"
                >
                  Reset pencarian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredServices.slice(0, visibleServicesCount).map((service) => (
                  <article
                    key={service.id}
                    className="rounded-2xl border border-[#E1E3EA] bg-white p-3.5 sm:p-4 shadow-[0px_1px_2px_rgba(13,12,34,0.06)] hover:border-[#B7BBC9] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover Image */}
                      <div
                        onClick={() => handleLayananCardClick(service)}
                        className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-100 cursor-pointer relative"
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Tag & Creator Attribution */}
                      <div className="flex items-center justify-between gap-2 mt-3">
                        <span className="bg-[#F3F4F6] text-[#55576A] text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide uppercase">
                          {service.tag}
                        </span>
                        <div
                          onClick={() => handleNavigateToCreator(service.creatorSlug || service.creatorId, service.creatorId)}
                          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                        >
                          <img
                            src={service.creatorAvatar}
                            alt={service.creatorName}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-black/5 shrink-0"
                          />
                          <span className="text-xs font-medium text-[#0D0C22] truncate max-w-[120px]">
                            {service.creatorName}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => handleLayananCardClick(service)}
                        className="font-display font-semibold text-sm sm:text-[15px] text-[#0D0C22] hover:text-[#155DFC] cursor-pointer transition-colors leading-snug line-clamp-2 mt-2"
                      >
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#55576A] line-clamp-2 mt-1 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Estimate */}
                      <div className="flex items-center gap-1.5 text-xs text-[#55576A] mt-2.5">
                        <Clock className="w-3.5 h-3.5 text-[#6F7285] shrink-0" />
                        <span>Estimasi: {service.duration}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-[#F3F4F6] mt-4 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6F7285] tracking-wider block leading-none">
                          HARGA
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#0D0C22] mt-0.5 block leading-tight">
                          {service.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleBookmarkService(service.id)}
                          className="w-8 h-8 rounded-full border border-[#E1E3EA] bg-white hover:bg-[#F3F3F4] text-[#55576A] hover:text-[#0D0C22] flex items-center justify-center transition-colors cursor-pointer"
                          aria-label={`Simpan layanan ${service.title}`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              savedServices[service.id] ? 'fill-[#0D0C22] text-[#0D0C22]' : ''
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenChatWithCreator(service.creatorId)}
                          className="rounded-full bg-[#0D0C22] hover:bg-black active:bg-neutral-900 text-white px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Diskusikan
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* C. Proyek Grid (matching Figma node 4811-3010) */}
        {activeTab === 'proyek' && (
          <section aria-label="Daftar Portofolio Proyek">
            {filteredProjects.length === 0 ? (
              <div className="rounded-2xl border border-[#E1E3EA] bg-white p-12 text-center my-8">
                <p className="text-sm font-semibold text-[#0D0C22]">Belum ada proyek yang cocok dengan pencarian.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-semibold text-[#155DFC] hover:underline cursor-pointer"
                >
                  Reset pencarian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProjects.slice(0, visibleProjectsCount).map((project) => (
                  <article
                    key={project.id}
                    onClick={() => handleProjectCardClick(project)}
                    className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E1E3EA]/50 bg-neutral-900"
                  >
                    {/* Media Thumbnail */}
                    <img
                      src={project.mediaUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Top Right Video Play Badge */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                      <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                    </div>

                    {/* Dark Gradient Overlay with Title and Meta */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-white font-display font-semibold text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-xs group-hover:text-blue-200 transition-colors">
                        {project.title}
                      </h3>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/15 text-white/85 text-xs">
                        <span className="font-medium truncate pr-2 hover:text-white transition-colors">
                          {project.creatorHandle}
                        </span>
                        <span className="shrink-0 font-medium text-white/75">
                          {project.viewsCount}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Centered Bottom Action: Lihat Selengkapnya */}
        <div className="flex justify-center mt-10 mb-14">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'creator') {
                if (visibleCount < filteredCreators.length) {
                  setVisibleCount((prev) => prev + 3);
                } else {
                  router.push('/jelajah/kreator');
                }
              } else if (activeTab === 'layanan') {
                if (visibleServicesCount < filteredServices.length) {
                  setVisibleServicesCount((prev) => prev + 4);
                } else {
                  router.push('/jelajah/layanan');
                }
              } else if (activeTab === 'proyek') {
                if (visibleProjectsCount < filteredProjects.length) {
                  setVisibleProjectsCount((prev) => prev + 4);
                } else {
                  router.push('/jelajah/proyek');
                }
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
          onSelectProject={setSelectedProject}
          onViewCreatorProfile={(creator) => {
            setSelectedProject(null);
            handleNavigateToCreator(creator.id, creator.id);
          }}
          onGetInTouch={(creator) => {
            setSelectedProject(null);
            handleOpenChatWithCreator(creator.id);
          }}
          allProjects={allFeedProjects}
        />
      )}

      {/* Lightbox / Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService.service}
          creator={selectedService.creator}
          onClose={() => setSelectedService(null)}
          onOrderService={(srv, cr) => {
            setSelectedService(null);
            handleOpenChatWithCreator(cr.id);
          }}
          onViewCreatorProfile={(cr) => {
            setSelectedService(null);
            handleNavigateToCreator(cr.id, cr.id);
          }}
          onSelectOtherService={(newSrv) => {
            setSelectedService((prev) => (prev ? { ...prev, service: newSrv } : null));
          }}
        />
      )}

      {/* Create Brief Modal */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
      />

      {/* Contextual Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
        onSuccess={(loggedUser) => {
          setIsAuthModalOpen(false);
          if (authModalConfig.action) {
            authModalConfig.action(loggedUser);
          }
        }}
      />
    </div>
  );
};
