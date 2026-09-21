import { useState } from "react";
import {
  ArrowRight, Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown,
  FolderKanban, Grid2X2, Instagram, Linkedin, MapPin, Menu,
  MessageSquare, Search, Sparkles, Star, Twitter, Users, X,
} from "lucide-react";
import { ShaderFill } from "./lib/custom-effect-runtime";
import { setup, render, manifest } from "./lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430";
import "./App.css";

const services = [
  { title: "Desain Identitas Brand & Logo UMKM", category: "Brand Identity", price: "Rp100.000", time: "3 Hari Kerja", shape: 0 },
  { title: "Desain Feed Instagram Aesthetic (9 Grid)", category: "Feed Instagram", price: "Rp50.000", time: "2 Hari Kerja", shape: 1 },
  { title: "Packaging & Label Design Siap Cetak", category: "Kemasan", price: "Rp70.000", time: "3 Hari Kerja", shape: 2 },
  { title: "Banner Promo E-Commerce & Marketplace", category: "Banner", price: "Rp120.000", time: "1 Hari Kerja", shape: 0 },
];
const tags = ["dashboard", "landing page", "mobile app", "portfolio", "ecommerce", "animation", "illustration", "onboarding"];
const skills = ["Brand Identity", "Product Photography", "Packaging", "Social Media Feed", "UI Mockups"];

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
      <button className="profile-button" aria-label="Profil Qaesyaar Aqeel"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></button>
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

function DiscoverControls({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  const [tab, setTab] = useState("Creator");
  const tabs = [{ name: "Creator", Icon: Users }, { name: "Layanan", Icon: Grid2X2 }, { name: "Proyek", Icon: FolderKanban }];
  return <div className="discover-controls">
    <div className="tabs" role="tablist">{tabs.map(({ name, Icon }) => <button className={tab === name ? "selected" : ""} onClick={() => setTab(name)} role="tab" aria-selected={tab === name} key={name}><Icon />{name}</button>)}</div>
    <form className="search-box" onSubmit={(event) => event.preventDefault()} role="search"><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari tipe desain" placeholder="What type of design are you interested in?" /><button aria-label="Cari"><Search /></button></form>
    <div className="popular-row"><div className="popular"><b>Popular:</b>{tags.map((tag) => <button onClick={() => setQuery(tag)} key={tag}>{tag}</button>)}</div><button className="following">Following <ChevronDown /></button></div>
  </div>;
}

function PortfolioCard({ item }: { item: (typeof services)[number] }) {
  return <article className="portfolio-card"><div className="portfolio-visual">
    <ShaderFill className="portfolio-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: 0, shape: item.shape, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span>{item.category}</span></div><h4>{item.title}</h4><div className="portfolio-meta"><strong>{item.price}</strong><span>{item.time}</span></div></article>;
}

function CreatorCard({ id, query }: { id: number; query: string }) {
  const [saved, setSaved] = useState(false);
  const visibleServices = services.filter(({ title, category }) => `${title} ${category}`.toLowerCase().includes(query.toLowerCase()));
  return <article className="creator-card">
    <div className="creator-head"><div className="creator-profile"><div className="avatar-wrap"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><span><Check /></span></div><div className="creator-copy">
      <div className="creator-title"><h3>Qaesyaar Aqeel</h3><b>PRO+</b><span className="rating"><Star /> 5 <i>(88)</i></span><span><BriefcaseBusiness />88 proyek selesai</span><small>Promoted</small></div>
      <div className="creator-details"><strong>Mulai Rp200.000/proyek</strong><i>•</i><span><MapPin />Bandung, Jawa Barat</span><i>•</i><span><b>95%</b> Skor Karir</span><i>•</i><span>10 Layanan tersedia</span></div>
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
    <div className="footer-word" aria-hidden="true">creatorin</div><div className="footer-bottom"><span>© 2026 Creatorin. All rights reserved.</span><div><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></div></div>
  </div></footer>;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [briefVisible, setBriefVisible] = useState(true);
  return <div className="creatorin-app"><Header /><main><Hero /><section className="discover" id="discover"><DiscoverControls query={query} setQuery={setQuery} /><div className="creator-list">{Array.from({ length: 6 }, (_, id) => <CreatorCard id={id} query={query} key={id} />)}</div></section></main><Footer />
    {briefVisible && <aside className="brief-toast" id="brief"><div><span><BriefcaseBusiness /></span><p><b>Start a Project Brief</b> — Tell us what you need and find the right creator.</p></div><div><a href="#discover">Get Started</a><button onClick={() => setBriefVisible(false)} aria-label="Tutup"><X /></button></div></aside>}
  </div>;
}
