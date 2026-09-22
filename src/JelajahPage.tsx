"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown, Clock3, Grid2X2, Heart,
  Instagram, Linkedin, MapPin, MessageSquare, Play, Search, SlidersHorizontal,
  Star, Twitter, Users, X,
} from "lucide-react";
import { ShaderFill } from "./lib/custom-effect-runtime";
import { setup, render, manifest } from "./lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430";
import { setup as waveSetup, render as waveRender, manifest as waveManifest } from "./lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433";
import JelajahNav from "./JelajahNav";
import "./App.css";
import "./Profile.css";
import "./Jelajah.css";

type JelajahSection = "creator" | "layanan" | "proyek";

const sectionCopy = {
  creator: {
    crumb: "Profil Kreator",
    title: "Jelajah Profil Kreator & Talenta Terverifikasi",
    description: "Telusuri portofolio karya asli, bandingkan Career Score, dan temukan kreator yang sesuai dengan gaya brand kamu.",
    heading: "Cari Talenta berdasarkan Kategori",
    tags: ["#Kuliner", "#TikTokViral", "#InstagramReels", "#ReviewProduk", "#DesainPoster", "#FotoProduk", "#FeedInstagram", "#LogoUMKM", "#BannerPromo"],
    filters: ["Kategori", "Budget", "Lokasi", "Rating / Score"],
  },
  layanan: {
    crumb: "Katalog Layanan",
    title: "Jelajah Katalog Layanan & Jasa Kreator",
    description: "Pilih paket layanan konten instan mulai dari video UGC, desain feed, hingga branding dengan harga transparan dan garansi pengerjaan tepat waktu.",
    heading: "Cari Layanan berdasarkan Kategori",
    tags: ["#Kuliner", "#TikTokViral", "#InstagramReels", "#ReviewProduk", "#DesainPoster", "#FotoProduk", "#FeedInstagram", "#LogoUMKM", "#BannerPromo"],
    filters: ["Kategori", "Budget", "Pengerjaan", "Rating / Score"],
  },
  proyek: {
    crumb: "Proyek Kreator",
    title: "Jelajah Proyek & Portofolio Kreator",
    description: "Temukan portofolio nyata, video Reels, konten TikTok, dan sistem desain yang telah diproduksi oleh kreator top terverifikasi Creatorin.",
    heading: "Cari Proyek berdasarkan Kategori",
    tags: ["#ReelsInstagram", "#TikTokViral", "#UIUXDesign", "#FotoProduk", "#DesignSystems", "#CinematicBRoll", "#FigmaCommunity", "#PackagingDesign", "#ASMRCoffee"],
    filters: ["Kategori", "Platform", "Format Media", "Urutkan: Populer"],
  },
} satisfies Record<JelajahSection, { crumb: string; title: string; description: string; heading: string; tags: string[]; filters: string[] }>;

const sections: { id: JelajahSection; label: string; Icon: typeof Users }[] = [
  { id: "creator", label: "Creator", Icon: Users },
  { id: "layanan", label: "Layanan", Icon: Grid2X2 },
  { id: "proyek", label: "Proyek", Icon: BriefcaseBusiness },
];

const servicePreviews = [
  { title: "Desain Identitas Brand & Logo UMKM", category: "Brand Identity", price: "Rp100.000", time: "3 Hari Kerja", shape: 0 },
  { title: "Desain Feed Instagram Aesthetic (9 Grid)", category: "Feed Instagram", price: "Rp50.000", time: "2 Hari Kerja", shape: 1 },
  { title: "Packaging & Label Design Siap Cetak", category: "Kemasan", price: "Rp70.000", time: "3 Hari Kerja", shape: 2 },
  { title: "Banner Promo E-Commerce & Marketplace", category: "Banner", price: "Rp120.000", time: "1 Hari Kerja", shape: 0 },
];

const creators = [
  { name: "Qaesyaar Aqeel", slug: "qaesyaar-aqeel", avatar: "/creatorin/avatar.png", rate: "Mulai Rp200.000/proyek", city: "Bandung, Jawa Barat", score: "95%", projects: "88", services: "10", rating: "5", reviews: "88", promoted: true },
  { name: "Maya Angelina", slug: "maya-angelina", avatar: "/creatorin/maya-angelina.png", rate: "Mulai Rp350.000/proyek", city: "Jakarta Barat", score: "95%", projects: "142", services: "8", rating: "4.9", reviews: "98", promoted: true },
  { name: "Sobakhul Munir Siroj", slug: "sobakhul-munir-siroj", avatar: "/creatorin/avatar.png", rate: "Mulai Rp300.000/proyek", city: "Jakarta Selatan", score: "93%", projects: "64", services: "7", rating: "4.9", reviews: "52", promoted: false },
  { name: "Sarah Kurniawan", slug: "maya-angelina", avatar: "/creatorin/sarah-kurniawan.png", rate: "Mulai Rp250.000/proyek", city: "Surabaya, Jawa Timur", score: "91%", projects: "73", services: "6", rating: "4.8", reviews: "46", promoted: false },
  { name: "Dimas Wicaksono", slug: "qaesyaar-aqeel", avatar: "/creatorin/dimas-wicaksono.png", rate: "Mulai Rp450.000/proyek", city: "Yogyakarta", score: "90%", projects: "59", services: "5", rating: "4.8", reviews: "41", promoted: false },
  { name: "Amanda Larasati", slug: "maya-angelina", avatar: "/creatorin/amanda-larasati.png", rate: "Mulai Rp275.000/proyek", city: "Denpasar, Bali", score: "89%", projects: "48", services: "6", rating: "4.7", reviews: "35", promoted: false },
];

const marketplaceServices = Array.from({ length: 16 }, (_, id) => ({
  id,
  title: id % 3 === 0 ? "1x Video TikTok UGC & Review Viral" : id % 3 === 1 ? "Paket Reels Product Showcase 3 Video" : "Desain Campaign Feed Instagram UMKM",
  category: id % 3 === 2 ? "Feed Instagram" : id % 2 ? "Instagram Reels" : "TikTok UGC",
  creator: id % 2 ? "Maya Angelina" : "Sobakhul Munir Siroj",
  description: "Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.",
  estimate: id % 2 ? "3 Hari Kerja" : "2 Hari Kerja",
  price: id % 3 === 2 ? "Rp750.000" : id % 2 ? "Rp2.100.000" : "Rp1.500.000",
}));

const projects = Array.from({ length: 16 }, (_, id) => ({
  id,
  title: id % 3 === 0 ? "Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)" : id % 3 === 1 ? "Coffee Shop Reels Campaign with Cinematic B-Roll" : "Design System Launch Video for SaaS Dashboard",
  creator: id % 2 ? "@munirs.design" : "@mayaangelina.ugc",
  views: id % 3 === 0 ? "710.0K" : id % 3 === 1 ? "218.0K" : "185.4K",
}));
const filterCategories = ["Logo & Branding", "Web Design", "Illustration", "Product Design", "Mobile", "Animation", "Typography", "Print"];
const otherFilters = [
  ["Available for work", "Hanya tampilkan kreator yang siap terima project"],
  ["Pengerjaan Kilat (<= 2 Hari)", "Proses produksi cepat untuk kebutuhan mendesak"],
  ["Kreator Terverifikasi (Skor 90+)", "Tampilkan kreator dengan rekam jejak terbaik"],
];

function normalizeSection(section: string): JelajahSection {
  return section === "layanan" || section === "proyek" ? section : "creator";
}

function JelajahHeader() {
  return <header className="profile-header"><div className="profile-header-inner">
    <div className="profile-header-start"><Link className="brand" href="/" aria-label="Kembali ke Creatorin"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><form className="profile-search" onSubmit={(event) => event.preventDefault()}><input aria-label="Cari" placeholder="Cari kreator, keahlian, atau video UGC..." /><button aria-label="Cari"><Search /></button></form></div>
    <nav className="profile-nav" aria-label="Navigasi utama"><Link href="/">Beranda</Link><JelajahNav /><a href="#collaboration">Collaboration Room</a><a href="#brief">Brief Proyek</a></nav>
    <div className="header-actions"><Link className="icon-button notification" href="/pesan" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></Link><Link className="icon-button notification" href="/notifikasi" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></Link><Link className="profile-button" href="/profile" aria-label="Profil creator"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link></div>
  </div></header>;
}

function JelajahFooter() {
  const columns = [
    ["Jelajahi", ["Cari Creator", "/jelajah/creator"], ["Layanan", "/jelajah/layanan"], ["Project", "/jelajah/proyek"], ["Collaboration Room", "/"]],
    ["Untuk Bisnis", ["Mulai Brief", "/"], ["Jelajahi Creator", "/jelajah/creator"], ["Kelola Project", "/jelajah/proyek"], ["Cara Kerja", "/"]],
    ["Untuk Creator", ["Bagikan Project", "/jelajah/proyek"], ["Lihat Brief Project", "/jelajah/proyek"], ["Portfolio", "/profile"], ["Skor Rekam Jejak", "/profile"]],
    ["Bantuan", ["Pusat Bantuan", "/"], ["FAQ", "/"], ["Hubungi Kami", "/"], ["Kebijakan & Privasi", "/"]],
  ] as const;
  return <footer className="footer profile-footer"><div className="footer-inner">
    <div className="footer-top"><Link className="brand brand--footer" href="/"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><div className="social"><span>Social Media</span><a href="#twitter" aria-label="X Twitter"><Twitter /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a></div></div>
    <div className="footer-body"><div className="about"><h3>Tentang Platform</h3><p>Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.</p><div className="partners"><img src="/creatorin/partner-1.png" alt="Innovation Room" /><img src="/creatorin/partners.png" alt="Partner Creatorin" /></div></div><div className="footer-columns">{columns.map(([title, ...links]) => <div key={title}><h3>{title}</h3>{links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}</div></div>
    <div className="footer-word" aria-hidden="true">creatorin</div><div className="footer-bottom"><span>&copy; 2026 Creatorin. All rights reserved.</span><div><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></div></div>
  </div></footer>;
}

function PortfolioCard({ item, index }: { item: (typeof servicePreviews)[number]; index: number }) {
  return <article className="portfolio-card"><div className="portfolio-visual">
    <ShaderFill className="portfolio-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: index * .04, shape: item.shape, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span>{item.category}</span></div><h4>{item.title}</h4><div className="portfolio-meta"><strong>{item.price}</strong><span>{item.time}</span></div></article>;
}

function CreatorResultCard({ creator, index }: { creator: (typeof creators)[number]; index: number }) {
  return <article className="creator-card jelajah-creator-card">
    <div className="creator-head"><div className="creator-profile"><Link className="avatar-wrap" href={`/profile/${creator.slug}`} aria-label={`Buka profil ${creator.name}`}><img src={creator.avatar} alt={creator.name} /><span><Check /></span></Link><div className="creator-copy">
      <div className="creator-title"><h3><Link href={`/profile/${creator.slug}`}>{creator.name}</Link></h3><b>PRO+</b><span className="rating"><Star /> {creator.rating} <i>({creator.reviews})</i></span><span><BriefcaseBusiness />{creator.projects} proyek selesai</span>{creator.promoted && <small>Promoted</small>}</div>
      <div className="creator-details"><strong>{creator.rate}</strong><i>&middot;</i><span><MapPin />{creator.city}</span><i>&middot;</i><span><b>{creator.score}</b> Skor Karir</span><i>&middot;</i><span>{creator.services} Layanan tersedia</span></div>
    </div></div><div className="creator-actions"><button className="save-button" aria-label={`Simpan ${creator.name}`}><Bookmark /></button><Link className="contact-button" href="/pesan">Hubungi</Link></div></div>
    <div className="portfolio-grid">{servicePreviews.map((item, serviceIndex) => <PortfolioCard item={item} index={index + serviceIndex} key={item.title} />)}</div>
    <div className="skill-list"><span>Brand Identity</span><span>Product Photography</span><span>Packaging</span><span>Social Media Feed</span><span>UI Mockups</span><small>+2 keahlian lainnya</small></div>
  </article>;
}

function ServiceResultCard({ item }: { item: (typeof marketplaceServices)[number] }) {
  return <article className="service-card">
    <Link className="service-visual service-visual-link" href="/layanan/full-framer-interactive-website-build" aria-label={`Buka detail layanan ${item.title}`}><ShaderFill className="portfolio-shader" shader={{ setup: waveSetup, render: waveRender, manifest: waveManifest, params: { transform: { x: 50, y: 50, radius: 30, angle: 0 }, amplitude: 15, waveColor: { r: 1, g: 1, b: 1, a: 1 }, offset: item.id * 4, zoom: 1, glowIntensity: 1 } }} /></Link>
    <div className="service-topline"><span>{item.category}</span><Link className="service-creator" href="/profile/sobakhul-munir-siroj"><img src="/creatorin/avatar.png" alt="" />{item.creator}</Link></div>
    <h3><Link href="/layanan/full-framer-interactive-website-build">{item.title}</Link></h3><p>{item.description}</p><div className="service-estimate"><Clock3 />Estimasi: {item.estimate}</div>
    <div className="service-footer"><div><small>Harga</small><strong>{item.price}</strong></div><div className="service-actions"><button type="button" aria-label="Simpan layanan"><Heart /></button><Link href="/layanan/full-framer-interactive-website-build">Diskusikan</Link></div></div>
  </article>;
}

function ProjectResultCard({ item }: { item: (typeof projects)[number] }) {
  return <Link className="project-card" href="/proyek/skincare-barrier-restoring-serum" aria-label={`Buka detail proyek ${item.title}`}>
    <ShaderFill className="portfolio-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: item.id * .03, shape: 1, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span className="project-play" aria-hidden="true"><Play fill="currentColor" /></span>
    <div className="project-info"><h3>{item.title}</h3><div><span>{item.creator}</span><span>{item.views}</span></div></div>
  </Link>;
}

function RatingRow({ score }: { score: number }) {
  return <button type="button" className="filter-rating-row"><span className="filter-radio" /> <span className="filter-stars" aria-label={`${score} bintang ke atas`}>{Array.from({ length: 5 }, (_, index) => <Star className={index < score ? "filled" : "empty"} fill={index < score ? "currentColor" : "currentColor"} key={index} />)}</span><span>& up</span></button>;
}

function FilterPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <div className={open ? "filter-panel is-open" : "filter-panel"} aria-hidden={!open}>
    <header className="filter-panel-header"><h2>Filters</h2><button type="button" onClick={onClose} aria-label="Tutup filter"><X /></button></header>
    <div className="filter-panel-body">
      <section className="filter-section"><h3>Categories</h3><div className="filter-category-grid">{filterCategories.map((category) => <button type="button" key={category}>{category}</button>)}</div></section>
      <section className="filter-section"><h3>Budget</h3><div className="filter-range"><span /><i /><i /></div><div className="filter-budget-grid"><label><span>Minimum</span><strong>Rp 0</strong></label><label><span>Maximum</span><strong>Rp 10.000.000+</strong></label></div></section>
      <section className="filter-section"><h3>Location</h3><label className="filter-location"><MapPin /><input aria-label="Lokasi" placeholder="Enter Location" /></label></section>
      <section className="filter-section"><h3>Rating</h3><div className="filter-rating-list"><RatingRow score={5} /><RatingRow score={4} /><RatingRow score={3} /><RatingRow score={2} /></div></section>
      <section className="filter-section filter-section--last"><h3>Other Filters</h3><div className="filter-switch-list">{otherFilters.map(([title, detail]) => <label className="filter-switch-row" key={title}><span><strong>{title}</strong><small>{detail}</small></span><input type="checkbox" /></label>)}</div></section>
    </div>
    <footer className="filter-panel-footer"><button type="button" onClick={onClose}>Apply</button><button type="button">Reset all filters</button></footer>
  </div>;
}

function FilterMenuButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <div className="filter-menu-wrap" ref={wrapRef}><button type="button" aria-label="Filter lanjutan" aria-expanded={open} onClick={() => setOpen((value) => !value)}><SlidersHorizontal /></button><FilterPanel open={open} onClose={() => setOpen(false)} /></div>;
}

export default function JelajahPage({ initialSection = "creator" }: { initialSection?: string }) {
  const activeSection = normalizeSection(initialSection);
  const copy = sectionCopy[activeSection];
  return <div className="creatorin-app jelajah-page"><JelajahHeader /><main className="jelajah-main">
    <div className="jelajah-breadcrumb"><Link href="/jelajah/creator">Jelajah</Link><span>/</span><strong>{copy.crumb}</strong></div>
    <section className="jelajah-intro">
      <div><h1>{copy.title}</h1><p>{copy.description}</p></div>
      <nav className="jelajah-switcher" aria-label="Pilih bagian jelajah">{sections.map(({ id, label, Icon }) => <Link className={activeSection === id ? "active" : ""} href={`/jelajah/${id}`} key={id}><Icon />{label}</Link>)}</nav>
    </section>
    <div className="jelajah-tags"><b>Tagar Populer:</b>{copy.tags.map((tag) => <button type="button" key={tag}>{tag}</button>)}</div>
    <section className="jelajah-toolbar">
      <h2>{copy.heading}</h2>
      <div className="jelajah-filter-actions"><FilterMenuButton />{copy.filters.map((filter) => <button type="button" key={filter}>{filter}<ChevronDown /></button>)}</div>
    </section>
    {activeSection === "creator" && <div className="creator-list jelajah-creator-list">{creators.map((creator, index) => <CreatorResultCard creator={creator} index={index} key={`${creator.name}-${index}`} />)}</div>}
    {activeSection === "layanan" && <div className="service-grid jelajah-service-grid">{marketplaceServices.map((item) => <ServiceResultCard item={item} key={item.id} />)}</div>}
    {activeSection === "proyek" && <div className="project-grid jelajah-project-grid">{projects.map((item) => <ProjectResultCard item={item} key={item.id} />)}</div>}
  </main><JelajahFooter /></div>;
}
