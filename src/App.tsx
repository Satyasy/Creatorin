import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown,
  Clock3, FolderKanban, Grid2X2, Instagram, Linkedin, MapPin, Menu,
  MessageSquare, Play, Search, Sparkles, Star, Twitter, Users, X,
} from "lucide-react";
import { ShaderFill } from "./lib/custom-effect-runtime";
import { setup, render, manifest } from "./lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430";
import { setup as waveSetup, render as waveRender, manifest as waveManifest } from "./lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433";
import "./App.css";

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

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand ${footer ? "brand--footer" : ""}`} href="#top" aria-label="Creatorin home"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="header-inner">
    <Brand />
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Buka navigasi" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Navigasi utama">
      <a href="#top">Beranda</a><a className="active" href="#discover">Jelajah <ChevronDown /></a><a href="#collaboration">Collaboration Room</a><a href="#brief">Brief Proyek</a>
    </nav>
    <div className="header-actions">
      <button className="icon-button notification" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></button>
      <button className="icon-button notification" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></button>
      <Link className="profile-button" href="/profile" aria-label="Buka profil creator"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link>
    </div>
  </div></header>;
}

function Hero() {
  return <section className="hero" id="top"><div className="hero-content">
    <div className="eyebrow"><span><Sparkles /></span><b>Platform Kolaborasi Kreatif</b><i />Marketplace Jasa Digital & UMKM</div>
    <h1><strong>Temukan</strong> Talenta Kreatif,<br />Wujudkan <em>Ide Digital.</em></h1>
    <p>Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.</p>
    <div className="hero-actions"><a className="button button--dark" href="#discover">Jelajahi Creator <ArrowRight /></a><a className="button button--light" href="#brief">Tawarkan Keahlian</a></div>
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

function ServiceListingCard({ item }: { item: (typeof marketplaceServices)[number] }) {
  const [saved, setSaved] = useState(false);
  return <article className="service-card">
    <div className="service-visual"><ShaderFill className="portfolio-shader" shader={{ setup: waveSetup, render: waveRender, manifest: waveManifest, params: { transform: { x: 50, y: 50, radius: 30, angle: 0 }, amplitude: 15, waveColor: { r: 1, g: 1, b: 1, a: 1 }, offset: item.id * 4, zoom: 1, glowIntensity: 1 } }} /></div>
    <div className="service-topline"><span>{item.category}</span><Link className="service-creator" href="/profile/sobakhul-munir-siroj"><img src="/creatorin/avatar.png" alt="" />{item.creator}</Link></div>
    <h3>{item.title}</h3><p>{item.description}</p><div className="service-estimate"><Clock3 />Estimasi: {item.estimate}</div>
    <div className="service-footer"><div><small>Harga</small><strong>{item.price}</strong></div><div className="service-actions"><button type="button" className={saved ? "saved" : ""} onClick={() => setSaved(!saved)} aria-label={saved ? "Hapus layanan dari tersimpan" : "Simpan layanan"}><Bookmark fill={saved ? "currentColor" : "none"} /></button><a href={`mailto:hello@creatorin.id?subject=${encodeURIComponent(item.title)}`}>Diskusikan</a></div></div>
  </article>;
}

function ProjectCard({ item }: { item: (typeof projects)[number] }) {
  return <article className="project-card">
    <ShaderFill className="portfolio-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: item.id * .03, shape: 1, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span className="project-play" aria-hidden="true"><Play fill="currentColor" /></span>
    <div className="project-info"><h3>{item.title}</h3><div><span>{item.creator}</span><span>{item.views}</span></div></div>
  </article>;
}

function CreatorCard({ id, query }: { id: number; query: string }) {
  const [saved, setSaved] = useState(false);
  const visibleServices = services.filter(({ title, category }) => `${title} ${category}`.toLowerCase().includes(query.toLowerCase()));
  return <article className="creator-card">
    <div className="creator-head"><div className="creator-profile"><Link className="avatar-wrap" href="/profile/qaesyaar-aqeel" aria-label="Buka profil Qaesyaar Aqeel"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><span><Check /></span></Link><div className="creator-copy">
      <div className="creator-title"><h3><Link href="/profile/qaesyaar-aqeel">Qaesyaar Aqeel</Link></h3><b>PRO+</b><span className="rating"><Star /> 5 <i>(88)</i></span><span><BriefcaseBusiness />88 proyek selesai</span><small>Promoted</small></div>
      <div className="creator-details"><strong>Mulai Rp200.000/proyek</strong><i>ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</i><span><MapPin />Bandung, Jawa Barat</span><i>ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</i><span><b>95%</b> Skor Karir</span><i>ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</i><span>10 Layanan tersedia</span></div>
    </div></div><div className="creator-actions"><button className={saved ? "save-button saved" : "save-button"} onClick={() => setSaved(!saved)} aria-label={saved ? "Hapus dari tersimpan" : "Simpan creator"}><Bookmark fill={saved ? "currentColor" : "none"} /></button><a className="contact-button" href={`mailto:hello@creatorin.id?subject=Project untuk creator ${id + 1}`}>Hubungi</a></div></div>
    <div className="portfolio-grid">{visibleServices.length ? visibleServices.map((item) => <PortfolioCard item={item} key={item.title} />) : <p className="empty-state">Belum ada layanan yang cocok dengan pencarianmu.</p>}</div>
    <div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}<small>+2 keahlian lainnya</small></div>
  </article>;
}

function Footer() {
  const columns = [
    ["Jelajahi", "Cari Creator", "Layanan", "Project", "Collaboration Room"],
    ["Untuk Bisnis", "Mulai Brief", "Jelajahi Creator", "Kelola Project", "Cara Kerja"],
    ["Untuk Creator", "Bagikan Project", "Lihat Brief Project", "Portfolio", "Skor Rekam Jejak"],
    ["Bantuan", "Pusat Bantuan", "FAQ", "Hubungi Kami", "Kebijakan & Privasi"],
  ];
  return <footer className="footer"><div className="footer-inner">
    <div className="footer-top"><Brand footer /><div className="social"><span>Social Media</span><a href="#twitter" aria-label="X Twitter"><Twitter /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a></div></div>
    <div className="footer-body"><div className="about"><h3>Tentang Platform</h3><p>Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.</p><div className="partners"><img src="/creatorin/partner-1.png" alt="Innovation Room" /><img src="/creatorin/partners.png" alt="Partner Creatorin" /></div></div><div className="footer-columns">{columns.map(([title, ...links]) => <div key={title}><h3>{title}</h3>{links.map((link) => <a href="#top" key={link}>{link}</a>)}</div>)}</div></div>
    <div className="footer-word" aria-hidden="true">creatorin</div><div className="footer-bottom"><span>Ãƒâ€šÃ‚Â© 2026 Creatorin. All rights reserved.</span><div><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></div></div>
  </div></footer>;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<DiscoverTab>("Creator");
  const [briefVisible, setBriefVisible] = useState(true);
  const needle = query.trim().toLowerCase();
  const filteredServices = marketplaceServices.filter((item) => Object.values(item).join(" ").toLowerCase().includes(needle));
  const filteredProjects = projects.filter((item) => Object.values(item).join(" ").toLowerCase().includes(needle));
  return <div className="creatorin-app"><Header /><main><Hero /><section className="discover" id="discover"><DiscoverControls query={query} setQuery={setQuery} tab={tab} setTab={setTab} /><div id="discover-results" role="tabpanel">
    {tab === "Creator" && <div className="creator-list">{Array.from({ length: 6 }, (_, id) => <CreatorCard id={id} query={query} key={id} />)}</div>}
    {tab === "Layanan" && <div className="service-grid">{filteredServices.length ? filteredServices.map((item) => <ServiceListingCard item={item} key={item.id} />) : <p className="empty-state">Belum ada layanan yang cocok dengan pencarianmu.</p>}</div>}
    {tab === "Proyek" && <div className="project-grid">{filteredProjects.length ? filteredProjects.map((item) => <ProjectCard item={item} key={item.id} />) : <p className="empty-state">Belum ada proyek yang cocok dengan pencarianmu.</p>}</div>}
  </div></section></main><Footer />
    {briefVisible && <aside className="brief-toast" id="brief"><div><span><BriefcaseBusiness /></span><p><b>Start a Project Brief</b> ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Tell us what you need and find the right creator.</p></div><div><a href="#discover">Get Started</a><button onClick={() => setBriefVisible(false)} aria-label="Tutup"><X /></button></div></aside>}
  </div>;
}



