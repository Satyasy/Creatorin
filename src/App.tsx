import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown,
  Clock3, FolderKanban, Grid2X2, Instagram, Linkedin, MapPin, Menu,
  MessageSquare, Play, Search, Sparkles, Star, Twitter, Users, X,
} from "lucide-react";
import { ShaderFill } from "./lib/custom-effect-runtime";
import { setup, render, manifest } from "./lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430";
import { setup as waveSetup, render as waveRender, manifest as waveManifest } from "./lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433";
import JelajahNav from "./JelajahNav";
import ProjectDetailPanel from "./ProjectDetailPanel";
import ServiceDetailPanel from "./ServiceDetailPanel";
import "./App.css";
import "./ProjectDetail.css";
import "./ServiceDetail.css";
import "./Proportions.css";

type DiscoverTab = "Creator" | "Layanan" | "Proyek";

const services = [
  { title: "Desain Identitas Brand & Logo UMKM", category: "Brand Identity", price: "Rp100.000", time: "3 Hari Kerja", shape: 0 },
  { title: "Desain Feed Instagram Aesthetic (9 Grid)", category: "Feed Instagram", price: "Rp50.000", time: "2 Hari Kerja", shape: 1 },
  { title: "Packaging & Label Design Siap Cetak", category: "Kemasan", price: "Rp70.000", time: "3 Hari Kerja", shape: 2 },
  { title: "Banner Promo E-Commerce & Marketplace", category: "Banner", price: "Rp120.000", time: "1 Hari Kerja", shape: 0 },
];
const tags = ["dashboard", "landing page", "mobile app", "portfolio", "ecommerce", "animation", "illustration", "onboarding"];
const skills = ["Brand Identity", "Product Photography", "Packaging", "Social Media Feed", "UI Mockups"];
const marketplaceServices = Array.from({ length: 16 }, (_, id) => ({
  id, title: "1x Video TikTok UGC & Review Viral", category: "TikTok UGC", creator: "Sobakhul Munir Siroj",
  description: "Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.", estimate: "2 Hari Kerja", price: "Rp1.500.000",
}));
const projects = Array.from({ length: 16 }, (_, id) => ({
  id, title: "Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)", creator: "@mayaangelina.ugc", views: "710.0K",
}));

type DetailModal =
  | { type: "service"; item: (typeof marketplaceServices)[number] }
  | { type: "project"; item: (typeof projects)[number] };

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? "brand--footer" : ""}`} href="#top" aria-label="Creatorin home"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-inner">
    <Brand />
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Buka navigasi" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Navigasi utama">
      <Link href="/">Beranda</Link><JelajahNav /><a href="#collaboration">Collaboration Room</a><Link href="/brief">Brief Proyek</Link>
    </nav>
    <div className="header-actions">
      <Link className="icon-button notification" href="/pesan" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></Link>
      <Link className="icon-button notification" href="/notifikasi" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></Link>
      <Link className="profile-button" href="/myprofile" aria-label="Buka profil saya"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link>
    </div>
  </div></header>;
}

function Hero() {
  return <section className="hero" id="top"><div className="hero-content">
    <div className="eyebrow"><span><Sparkles /></span><b>Platform Kolaborasi Kreatif</b><i />Marketplace Jasa Digital & UMKM</div>
    <h1><strong>Temukan</strong> Talenta Kreatif,<br />Wujudkan <em>Ide Digital.</em></h1>
    <p>Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.</p>
    <div className="hero-actions"><Link className="button button--dark" href="/jelajah/creator">Jelajahi Creator <ArrowRight /></Link><Link className="button button--light" href="/brief">Tawarkan Keahlian</Link></div>
  </div></section>;
}

function DiscoverControls({ query, setQuery, tab, setTab }: { query: string; setQuery: (value: string) => void; tab: DiscoverTab; setTab: (tab: DiscoverTab) => void }) {
  const tabs: { name: DiscoverTab; Icon: typeof Users }[] = [{ name: "Creator", Icon: Users }, { name: "Layanan", Icon: Grid2X2 }, { name: "Proyek", Icon: FolderKanban }];
  return <div className="discover-controls">
    <div className="tabs" role="tablist" aria-label="Jenis konten">{tabs.map(({ name, Icon }) => <button type="button" className={tab === name ? "selected" : ""} onClick={() => setTab(name)} role="tab" aria-selected={tab === name} aria-controls="discover-results" key={name}><Icon />{name}</button>)}</div>
    <form className="search-box" onSubmit={(event) => event.preventDefault()} role="search"><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari tipe desain" placeholder="What type of design are you interested in?" /><button aria-label="Cari"><Search /></button></form>
    <div className="popular-row"><div className="popular"><b>Popular:</b>{tags.map((tag) => <button type="button" onClick={() => setQuery(tag)} key={tag}>{tag}</button>)}</div><button type="button" className="following">Following <ChevronDown /></button></div>
  </div>;
}

function PortfolioCard({ item }: { item: (typeof services)[number] }) {
  return <article className="portfolio-card"><div className="portfolio-visual">
    <ShaderFill className="portfolio-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: 0, shape: item.shape, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span>{item.category}</span></div><h4>{item.title}</h4><div className="portfolio-meta"><strong>{item.price}</strong><span>{item.time}</span></div></article>;
}

function ServiceListingCard({ item, onOpen }: { item: (typeof marketplaceServices)[number]; onOpen: (item: (typeof marketplaceServices)[number]) => void }) {
  const [saved, setSaved] = useState(false);
  return <article className="service-card">
    <button type="button" className="service-visual service-visual-link service-card-open" onClick={() => onOpen(item)} aria-label={`Buka detail layanan ${item.title}`}><ShaderFill className="portfolio-shader" shader={{ setup: waveSetup, render: waveRender, manifest: waveManifest, params: { transform: { x: 50, y: 50, radius: 30, angle: 0 }, amplitude: 15, waveColor: { r: 1, g: 1, b: 1, a: 1 }, offset: item.id * 4, zoom: 1, glowIntensity: 1 } }} /></button>
    <div className="service-topline"><span>{item.category}</span><Link className="service-creator" href="/profile/sobakhul-munir-siroj"><img src="/creatorin/avatar.png" alt="" />{item.creator}</Link></div>
    <h3><button type="button" className="service-title-button" onClick={() => onOpen(item)}>{item.title}</button></h3><p>{item.description}</p><div className="service-estimate"><Clock3 />Estimasi: {item.estimate}</div>
    <div className="service-footer"><div><small>Harga</small><strong>{item.price}</strong></div><div className="service-actions"><button type="button" className={saved ? "saved" : ""} onClick={() => setSaved(!saved)} aria-label={saved ? "Hapus layanan dari tersimpan" : "Simpan layanan"}><Bookmark fill={saved ? "currentColor" : "none"} /></button><button type="button" className="service-detail-button" onClick={() => onOpen(item)}>Detail</button></div></div>
  </article>;
}

function ProjectCard({ item, onOpen }: { item: (typeof projects)[number]; onOpen: (item: (typeof projects)[number]) => void }) {
  return <button type="button" className="project-card project-card-button" onClick={() => onOpen(item)} aria-label={`Buka detail proyek ${item.title}`}>
    <ShaderFill className="portfolio-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: item.id * .03, shape: 1, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span className="project-play" aria-hidden="true"><Play fill="currentColor" /></span>
    <div className="project-info"><h3>{item.title}</h3><div><span>{item.creator}</span><span>{item.views}</span></div></div>
  </button>;
}

export type CreatorCardData = {
  slug: string;
  name: string;
  avatar: string;
  isPro: boolean;
  rating: string;
  reviewsCount: number;
  completedProjects: number;
  isPromoted: boolean;
  startingPrice: string;
  location: string;
  careerScore: string;
  skills: string[];
  services?: (typeof services);
};

export type DiscoverDataProps = {
  creators: CreatorCardData[];
  marketplaceServices: (typeof marketplaceServices);
  projects: (typeof projects);
  isLiveDb?: boolean;
};

function CreatorCard({ query, data }: { query: string; data?: CreatorCardData }) {
  const [saved, setSaved] = useState(false);
  const creator = data ?? {
    slug: "qaesyaar-aqeel",
    name: "Qaesyaar Aqeel",
    avatar: "/creatorin/avatar.png",
    isPro: true,
    rating: "5",
    reviewsCount: 88,
    completedProjects: 88,
    isPromoted: true,
    startingPrice: "Mulai Rp200.000/proyek",
    location: "Bandung, Jawa Barat",
    careerScore: "95%",
    skills: skills,
    services: services,
  };
  const currentServices = creator.services || services;
  const visibleServices = currentServices.filter(({ title, category }) => `${title} ${category}`.toLowerCase().includes(query.toLowerCase()));
  return <article className="creator-card">
    <div className="creator-head"><div className="creator-profile"><Link className="avatar-wrap" href={`/profile/${creator.slug}`} aria-label={`Buka profil ${creator.name}`}><img src={creator.avatar} alt={creator.name} /><span><Check /></span></Link><div className="creator-copy">
      <div className="creator-title"><h3><Link href={`/profile/${creator.slug}`}>{creator.name}</Link></h3>{creator.isPro && <b>PRO+</b>}<span className="rating"><Star /> {creator.rating} <i>({creator.reviewsCount})</i></span><span><BriefcaseBusiness />{creator.completedProjects} proyek selesai</span>{creator.isPromoted && <small>Promoted</small>}</div>
      <div className="creator-details"><strong>{creator.startingPrice}</strong><i>&middot;</i><span><MapPin />{creator.location}</span><i>&middot;</i><span><b>{creator.careerScore}</b> Skor Karir</span><i>&middot;</i><span>{currentServices.length} Layanan tersedia</span></div>
    </div></div><div className="creator-actions"><button className={saved ? "save-button saved" : "save-button"} onClick={() => setSaved(!saved)} aria-label={saved ? "Hapus dari tersimpan" : "Simpan creator"}><Bookmark fill={saved ? "currentColor" : "none"} /></button><Link className="contact-button" href="mailto:hello@creatorin.id">Hubungi</Link></div></div>
    <div className="portfolio-grid">{visibleServices.length ? visibleServices.map((item) => <PortfolioCard item={item} key={item.title} />) : <p className="empty-state">Belum ada layanan yang cocok dengan pencarianmu.</p>}</div>
    <div className="skill-list">{creator.skills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}{creator.skills.length > 5 && <small>+{creator.skills.length - 5} keahlian lainnya</small>}</div>
  </article>;
}

function SearchMoreButton({ href }: { href: string }) {
  return <div className="search-more"><Link href={href}>Lihat Lebih Banyak</Link></div>;
}

function Footer() {
  const columns = [
    ["Jelajahi", ["Cari Creator", "/jelajah/creator"], ["Layanan", "/jelajah/layanan"], ["Project", "/jelajah/proyek"], ["Collaboration Room", "/"]],
    ["Untuk Bisnis", ["Mulai Brief", "/"], ["Jelajahi Creator", "/jelajah/creator"], ["Kelola Project", "/jelajah/proyek"], ["Cara Kerja", "/"]],
    ["Untuk Creator", ["Bagikan Project", "/jelajah/proyek"], ["Lihat Brief Project", "/jelajah/proyek"], ["Portfolio", "/myprofile"], ["Skor Rekam Jejak", "/myprofile"]],
    ["Bantuan", ["Pusat Bantuan", "/"], ["FAQ", "/"], ["Hubungi Kami", "/"], ["Kebijakan & Privasi", "/"]],
  ] as const;
  return <footer className="footer"><div className="footer-inner">
    <div className="footer-top"><Brand footer /><div className="social"><span>Social Media</span><a href="#twitter" aria-label="X Twitter"><Twitter /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a></div></div>
    <div className="footer-body"><div className="about"><h3>Tentang Platform</h3><p>Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.</p><div className="partners"><img src="/creatorin/partner-1.png" alt="Innovation Room" /><img src="/creatorin/partners.png" alt="Partner Creatorin" /></div></div><div className="footer-columns">{columns.map(([title, ...links]) => <div key={title}><h3>{title}</h3>{links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}</div></div>
    <div className="footer-word" aria-hidden="true">creatorin</div><div className="footer-bottom"><span>&copy; 2026 Creatorin. All rights reserved.</span><div><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></div></div>
  </div></footer>;
}

export default function App({ initialData }: { initialData?: DiscoverDataProps }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<DiscoverTab>("Creator");
  const [briefVisible, setBriefVisible] = useState(true);
  const [detailModal, setDetailModal] = useState<DetailModal | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const needle = query.trim().toLowerCase();

  const creatorsList = initialData?.creators || [
    {
      slug: "qaesyaar-aqeel",
      name: "Qaesyaar Aqeel",
      avatar: "/creatorin/avatar.png",
      isPro: true,
      rating: "5",
      reviewsCount: 88,
      completedProjects: 88,
      isPromoted: true,
      startingPrice: "Mulai Rp200.000/proyek",
      location: "Bandung, Jawa Barat",
      careerScore: "95%",
      skills: skills,
      services: services,
    },
    {
      slug: "maya-angelina",
      name: "Maya Angelina",
      avatar: "/creatorin/maya-angelina.png",
      isPro: true,
      rating: "4.9",
      reviewsCount: 98,
      completedProjects: 142,
      isPromoted: true,
      startingPrice: "Mulai Rp850.000/proyek",
      location: "Jakarta Barat",
      careerScore: "95%",
      skills: ["TikTok UGC", "Beauty Review", "Reels Video", "Skincare Testing", "Script Writing"],
      services: services,
    },
    {
      slug: "sobakhul-munir-siroj",
      name: "Sobakhul Munir Siroj",
      avatar: "/creatorin/avatar.png",
      isPro: false,
      rating: "4.9",
      reviewsCount: 52,
      completedProjects: 64,
      isPromoted: false,
      startingPrice: "Mulai Rp1.500.000/proyek",
      location: "Jakarta Selatan",
      careerScore: "93%",
      skills: ["UI/UX Design", "Framer", "Design System", "Product Design", "Interactive Web"],
      services: services,
    },
  ];

  const servicesList = (initialData?.marketplaceServices as unknown as typeof marketplaceServices) || marketplaceServices;
  const projectsList = (initialData?.projects as unknown as typeof projects) || projects;

  const filteredCreators = creatorsList.filter((c) =>
    `${c.name} ${c.location} ${c.skills.join(" ")}`.toLowerCase().includes(needle)
  );
  const filteredServices = servicesList.filter((item) => Object.values(item).join(" ").toLowerCase().includes(needle));
  const filteredProjects = projectsList.filter((item) => Object.values(item).join(" ").toLowerCase().includes(needle));
  const openDetail = (modal: DetailModal) => {
    setDetailClosing(false);
    setDetailModal(modal);
  };
  const closeDetail = () => {
    setDetailClosing(true);
    window.setTimeout(() => {
      setDetailModal(null);
      setDetailClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (!detailModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [detailModal]);

  return <div className="creatorin-app"><Header /><main><Hero /><section className="discover" id="discover"><DiscoverControls query={query} setQuery={setQuery} tab={tab} setTab={setTab} /><div id="discover-results" role="tabpanel">
    {tab === "Creator" && (
      <>
        <div className="creator-list">
          {filteredCreators.length ? (
            filteredCreators.map((c) => <CreatorCard query={query} data={c} key={c.slug} />)
          ) : (
            <p className="empty-state">Belum ada kreator yang cocok dengan pencarianmu.</p>
          )}
        </div>
        <SearchMoreButton href="/jelajah/creator" />
      </>
    )}
    {tab === "Layanan" && (
      <>
        <div className="service-grid">
          {filteredServices.length ? (
            filteredServices.map((item) => <ServiceListingCard item={item} onOpen={(selected) => openDetail({ type: "service", item: selected })} key={item.id} />)
          ) : (
            <p className="empty-state">Belum ada layanan yang cocok dengan pencarianmu.</p>
          )}
        </div>
        <SearchMoreButton href="/jelajah/layanan" />
      </>
    )}
    {tab === "Proyek" && (
      <>
        <div className="project-grid">
          {filteredProjects.length ? (
            filteredProjects.map((item) => <ProjectCard item={item} onOpen={(selected) => openDetail({ type: "project", item: selected })} key={item.id} />)
          ) : (
            <p className="empty-state">Belum ada proyek yang cocok dengan pencarianmu.</p>
          )}
        </div>
        <SearchMoreButton href="/jelajah/proyek" />
      </>
    )}
  </div></section></main><Footer />
    {briefVisible && <aside className="brief-toast" id="brief"><div><span><BriefcaseBusiness /></span><p><b>Start a Project Brief</b> &mdash; Tell us what you need and find the right creator.</p></div><div><Link href="/brief">Get Started</Link><button onClick={() => setBriefVisible(false)} aria-label="Tutup"><X /></button></div></aside>}
    {detailModal?.type === "service" && <ServiceDetailPanel isModal isClosing={detailClosing} onClose={closeDetail} title={detailModal.item.title} category={detailModal.item.category} creator={detailModal.item.creator} price={detailModal.item.price} time={detailModal.item.estimate} />}
    {detailModal?.type === "project" && <ProjectDetailPanel isModal isClosing={detailClosing} onClose={closeDetail} title={detailModal.item.title} creator={detailModal.item.creator} views={detailModal.item.views} />}
  </div>;
}



