"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, Clock3,
  ExternalLink, Eye, Globe, Instagram, Linkedin, Mail, MapPin, MessageCircle,
  MessageSquare, MoreHorizontal, PenLine, Play, Plus, Search, Send, Share2, SlidersHorizontal, Star, Twitter,
  Users, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import JelajahNav from "./JelajahNav";
import "./App.css";
import "./Profile.css";
import "./Brief.css";

type BriefTab = "rincian" | "pelamar" | "tentang-umkm";
type UmkmProfileTab = "brief" | "collaboration" | "brand";

const briefSlug = "/brief/rincian";
const popularTags = ["#ReelsInstagram", "#TikTokViral", "#UIUXDesign", "#FotoProduk", "#DesignSystems", "#CinematicBRoll", "#FigmaCommunity", "#PackagingDesign", "#ASMRCoffee"];

const briefs = [
  {
    category: "Reels Instagram",
    title: "Produksi 3x Video Reels Instagram & TikTok untuk Launching Kopi Susu Botolan",
    description: "Kami membutuhkan kreator video UGC yang aktif dan ekspresif untuk membuat konten promo Cold Brew Caramel.",
    budget: "Rp1.500.000",
    time: "2 jam yang lalu",
    deliverables: ["3x Video 9:16 resolusi 1080p 60fps durasi 30-60 detik", "Sudah include voiceover/subtitle dan copywriting hook"],
    tags: ["TikTok UGC", "Reels Instagram", "Food Videography", "Voiceover", "CapCut Pro"],
  },
  {
    category: "Video Tiktok",
    title: "Video Review & Unboxing Jujur Headset Gaming Wireless",
    description: "Mencari tech enthusiast / gamer creator untuk membuat review vertikal yang natural dan informatif.",
    budget: "Rp1.200.000",
    time: "3 jam yang lalu",
    deliverables: ["1 Video review vertikal 60-90 detik untuk TikTok & Reels", "Tes mikrofon dan cuplikan in-game test audio"],
    tags: ["Video Tiktok", "Tech Review", "Sound Testing", "Video Editing"],
  },
  {
    category: "Logo & Branding",
    title: "Desain Identitas Visual, Logo Brand, & Packaging Box",
    description: "Mencari graphic designer berpengalaman di bidang beauty & personal care.",
    budget: "Rp3.000.000",
    time: "5 jam yang lalu",
    deliverables: ["Master logo vector AI, EPS, SVG, PNG", "Brand guideline mini dan color palette"],
    tags: ["Logo Design", "Packaging", "Brand Identity", "Adobe Illustrator"],
  },
  {
    category: "Foto Produk",
    title: "Foto Katalog Produk & Lifestyle Shoot 12 Artikel Baju",
    description: "Dibutuhkan fotografer produk fashion untuk sesi photoshoot katalog dan lifestyle.",
    budget: "Rp2.000.000",
    time: "1 hari yang lalu",
    deliverables: ["36 Foto edited & color-graded", "Format e-commerce 1:1 dan banner 16:9"],
    tags: ["Foto Produk", "Fashion Photography", "Adobe Lightroom", "Color Grading"],
  },
  {
    category: "Feed Instagram",
    title: "Paket Desain 15 Feed Instagram Carousel & Story Edukasi",
    description: "Kami membutuhkan desainer grafis untuk membuat konten visual edukatif dan konsisten.",
    budget: "Rp1.800.000",
    time: "1 hari yang lalu",
    deliverables: ["15 Post Instagram (10 Carousel + 5 Single Post)", "15 Desain Story penunjang interaktif"],
    tags: ["Feed Instagram", "Social Media Design", "Figma", "Infographic Design", "Typography"],
  },
  {
    category: "UI/UX Design",
    title: "Redesign Landing Page Website Brand Sepatu Lokal Responsif",
    description: "Kami ingin meremajakan tampilan website katalog e-commerce agar lebih rapi dan konversi-ready.",
    budget: "Rp3.500.000",
    time: "4 jam yang lalu",
    deliverables: ["Desain Figma responsif (Desktop & Mobile)", "Design token, typography style, & component system"],
    tags: ["UI/UX Design", "Figma", "E-Commerce UX", "Design Systems", "Responsive Web"],
  },
] as const;

const applicants = [
  {
    name: "Alya Rahmadhani",
    avatar: "/creatorin/amanda-larasati.png",
    rating: "4.9",
    reviews: "42",
    projects: "42",
    offer: "Rp1.500.000",
    location: "Jakarta Selatan",
    score: "98%",
    eta: "3 Hari Kerja",
    promoted: true,
    pitch: "Halo tim Kopi Kenangan Senja! Saya sangat tertarik karena sudah sering membuat konten UGC minuman ready-to-drink. Saya bisa bantu dari hook, script, shooting, voiceover, subtitle, sampai final cut siap upload.",
  },
  {
    name: "Dimas Pratama",
    avatar: "/creatorin/dimas-wicaksono.png",
    rating: "4.85",
    reviews: "29",
    projects: "29",
    offer: "Rp1.450.000",
    location: "Bandung",
    score: "96%",
    eta: "4 Hari Kerja",
    promoted: true,
    pitch: "Saya punya setup lighting kecil untuk produk F&B dan biasa menggabungkan B-roll close-up dengan narasi singkat. Output bisa saya sesuaikan untuk TikTok dan Reels dengan pacing yang berbeda.",
  },
  {
    name: "Maya Angelina",
    avatar: "/creatorin/maya-angelina.png",
    rating: "4.9",
    reviews: "98",
    projects: "142",
    offer: "Rp1.600.000",
    location: "Jakarta Barat",
    score: "95%",
    eta: "5 Hari Kerja",
    promoted: false,
    pitch: "Saya cocok untuk brief ini karena audiens saya dekat dengan lifestyle, cafe hopping, dan produk minuman kekinian. Saya bisa membuat angle review yang natural tanpa terasa hard-selling.",
  },
  {
    name: "Sarah Kurniawan",
    avatar: "/creatorin/sarah-kurniawan.png",
    rating: "4.8",
    reviews: "46",
    projects: "73",
    offer: "Rp1.350.000",
    location: "Surabaya",
    score: "91%",
    eta: "4 Hari Kerja",
    promoted: false,
    pitch: "Saya menawarkan konsep morning routine dan desk refresh yang menonjolkan cold brew sebagai teman kerja. File final akan saya kirim dalam versi clean dan versi subtitle.",
  },
] as const;

const metrics: { label: string; value: string; detail: string; Icon: LucideIcon }[] = [
  { label: "Anggaran Proyek", value: "Rp1.500.000", detail: "Diksusikan Terlebih Dahulu", Icon: Wallet },
  { label: "Waktu Pengerjaan", value: "5 Hari Kerja", detail: "Maksimal 2x revisi", Icon: Clock3 },
  { label: "Pelamar Terdaftar", value: "4 Kreator", detail: "1 Masuk Shortlist", Icon: Users },
];

const umkmProfileTabs = [
  { id: "brief", label: "Brief Dibuka", count: "2" },
  { id: "collaboration", label: "Karya Kolaborasi", count: "3" },
  { id: "brand", label: "Tentang Brand", count: "" },
] as const;

const collaborationWorks = [
  "Tips Bertahan as Product Designer di 2026 ditengah gempuran AI boi :(",
  "Behind the Scene: Cold Brew Caramel Launching Week",
  "Morning Routine Barista dengan Menu Signature Senja",
  "UGC Cafe Visit: Cara Brand Kopi Terlihat Lebih Natural",
] as const;

const umkmOpenBriefs = [
  briefs[0],
  {
    category: "Foto Produk",
    title: "Foto Katalog & Flatlay 8 Menu Signature Cafe untuk Menu Board & Website",
    description: "Dibutuhkan fotografer produk profesional untuk photoshoot on-site di outlet Senopati. Mengambil foto 8 menu.",
    budget: "Rp1.800.000",
    time: "1 hari yang lalu",
    deliverables: ["16 foto hi-res teredit warna profesional (color-graded)", "Versi crop rasio 1:1, 4:5, dan 16:9"],
    tags: ["Food Photography", "Lighting", "Adobe Lightroom", "Photo Retouching"],
  },
  {
    category: "Foto Produk",
    title: "Foto Katalog & Flatlay 8 Menu Signature Cafe untuk Menu Board & Website",
    description: "Dibutuhkan fotografer produk profesional untuk photoshoot on-site di outlet Senopati. Mengambil foto 8 menu.",
    budget: "Rp1.800.000",
    time: "1 hari yang lalu",
    deliverables: ["16 foto hi-res teredit warna profesional (color-graded)", "Versi crop rasio 1:1, 4:5, dan 16:9"],
    tags: ["Food Photography", "Lighting", "Adobe Lightroom", "Photo Retouching"],
  },
] as const;

function BrandLink({ footer = false }: { footer?: boolean }) {
  return <Link className={`brand ${footer ? "brand--footer" : ""}`} href="/"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link>;
}

function BriefHeader({ activeBrief = true }: { activeBrief?: boolean } = {}) {
  return <header className="profile-header"><div className="profile-header-inner">
    <div className="profile-header-start"><BrandLink /><form className="profile-search" onSubmit={(event) => event.preventDefault()}><input aria-label="Cari" placeholder="Cari kreator, keahlian, atau video UGC..." /><button aria-label="Cari"><Search /></button></form></div>
    <nav className="profile-nav" aria-label="Navigasi utama"><Link href="/">Beranda</Link><JelajahNav /><Link href="/">Collaboration Room</Link><Link className={activeBrief ? "active" : undefined} href="/brief">Brief Proyek</Link></nav>
    <div className="header-actions"><Link className="icon-button notification" href="/pesan" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></Link><Link className="icon-button notification" href="/notifikasi" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></Link><Link className="profile-button" href="/profile" aria-label="Profil creator"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link></div>
  </div></header>;
}

function BriefFooter() {
  const columns = [
    ["Jelajahi", ["Cari Creator", "/jelajah/creator"], ["Layanan", "/jelajah/layanan"], ["Project", "/jelajah/proyek"], ["Collaboration Room", "/"]],
    ["Untuk Bisnis", ["Mulai Brief", "/brief"], ["Jelajahi Creator", "/jelajah/creator"], ["Kelola Project", "/brief"], ["Cara Kerja", "/"]],
    ["Untuk Creator", ["Bagikan Project", "/jelajah/proyek"], ["Lihat Brief Project", "/brief"], ["Portfolio", "/profile"], ["Skor Rekam Jejak", "/profile"]],
    ["Bantuan", ["Pusat Bantuan", "/"], ["FAQ", "/"], ["Hubungi Kami", "/"], ["Kebijakan & Privasi", "/"]],
  ] as const;
  return <footer className="footer profile-footer"><div className="footer-inner">
    <div className="footer-top"><BrandLink footer /><div className="social"><span>Social Media</span><a href="#twitter" aria-label="X Twitter"><Twitter /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a></div></div>
    <div className="footer-body"><div className="about"><h3>Tentang Platform</h3><p>Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.</p><div className="partners"><img src="/creatorin/partner-1.png" alt="Innovation Room" /><img src="/creatorin/partners.png" alt="Partner Creatorin" /></div></div><div className="footer-columns">{columns.map(([title, ...links]) => <div key={title}><h3>{title}</h3>{links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}</div></div>
    <div className="footer-word" aria-hidden="true">creatorin</div><div className="footer-bottom"><span>&copy; 2026 Creatorin. All rights reserved.</span><div><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></div></div>
  </div></footer>;
}

function FilterButton({ children }: { children: React.ReactNode }) {
  return <button type="button">{children}<ChevronDown /></button>;
}

function BriefCard({ brief }: { brief: (typeof briefs)[number] }) {
  return <article className="brief-card">
    <div className="brief-card-body">
      <div className="brief-card-top"><span>{brief.category}</span><small><Clock3 />{brief.time}</small></div>
      <h3><Link href={briefSlug}>{brief.title}</Link></h3>
      <p>{brief.description}</p>
      <ul>{brief.deliverables.map((item) => <li key={item}><Check />{item}</li>)}</ul>
      <div className="brief-tags">{brief.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </div>
    <footer><div><small>Estimasi Anggaran</small><strong>{brief.budget}</strong></div><Link href={briefSlug}><Send />Lamar</Link></footer>
  </article>;
}

export default function BriefPage() {
  return <div className="creatorin-app brief-page"><BriefHeader /><main className="brief-main">
    <section className="brief-intro">
      <div><h1>Papan Brief Proyek & Kebutuhan UMKM</h1><p>Temukan peluang proyek langsung dari pelaku bisnis dan ajukan penawaran yang paling sesuai dengan portofoliomu.</p></div>
      <button type="button"><Plus />Pasang Brief Baru</button>
    </section>
    <div className="brief-tags-row"><b>Tagar Populer:</b>{popularTags.map((tag) => <button type="button" key={tag}>{tag}</button>)}</div>
    <section className="brief-toolbar">
      <div><h2>Cari Proyek berdasarkan Kategori</h2><span>8 Brief</span></div>
      <div className="brief-filter-actions"><button type="button" aria-label="Filter lanjutan"><SlidersHorizontal /></button><FilterButton>Kategori</FilterButton><FilterButton>Anggaran</FilterButton><FilterButton>Tenggat Waktu</FilterButton><FilterButton>Kirim Produk</FilterButton><FilterButton>Urutkan: Rekomendasi</FilterButton></div>
    </section>
    <section className="brief-grid" aria-label="Daftar brief proyek">{briefs.map((brief) => <BriefCard brief={brief} key={brief.title} />)}</section>
  </main><BriefFooter /></div>;
}

function DetailHeader() {
  return <header className="brief-detail-header"><div>
    <Link className="brief-business" href="/brief/tentang-umkm"><img src="/creatorin/partner-1.png" alt="" /><span><b>Kopi Kenangan Senja</b><small><Globe />kopikenangansenja.creatorin.id <i /> <Mail />halo@kopikenangansenja.com <i /> <MapPin />Jakarta Selatan</small></span></Link>
    <div className="brief-detail-actions"><Link className="brief-icon-btn" href="/brief/tentang-umkm" aria-label="Lihat profil UMKM"><Eye /></Link><Link className="brief-apply" href="/pesan"><Send />Lamar</Link></div>
  </div></header>;
}

function DetailTabs({ active }: { active: BriefTab }) {
  const tabs: { id: BriefTab; label: string; count?: string }[] = [
    { id: "rincian", label: "Rincian Brief" },
    { id: "pelamar", label: "Pelamar", count: "4" },
    { id: "tentang-umkm", label: "Tentang UMKM" },
  ];
  return <nav className="brief-detail-tabs" aria-label="Detail brief">{tabs.map((tab) => <Link className={active === tab.id ? "active" : ""} href={`/brief/${tab.id}`} key={tab.id}>{tab.label}{tab.count && <small>{tab.count}</small>}</Link>)}</nav>;
}

function DetailShell({ active, children }: { active: BriefTab; children: React.ReactNode }) {
  return <div className="brief-detail-page"><Link className="brief-detail-close" href="/brief" aria-label="Tutup detail">x</Link><div className="brief-detail-sheet"><DetailHeader /><main className="brief-detail-main">
    <span className="brief-category">Reels Instagram</span>
    <h1>Produksi 3x Video Reels Instagram & TikTok untuk Launching Kopi Susu Botolan</h1>
    <div className="brief-metrics">{metrics.map(({ label, value, detail, Icon }) => <article key={label}><header><span>{label}</span><i><Icon /></i></header><strong>{value}</strong><p>{detail}</p></article>)}</div>
    <DetailTabs active={active} />
    {children}
    <BusinessSummary />
    <RelatedBriefs />
  </main><BriefFooter /></div></div>;
}

function RincianContent() {
  return <section className="brief-copy">
    <p>Kami membutuhkan kreator video UGC yang aktif dan ekspresif untuk membuat 3 video reels/TikTok promosi menu baru Cold Brew Caramel. Konsep video: first impression review, aesthetic pouring B-roll, dan ASMR unboxing. Produk akan kami kirimkan ke alamat kreator.</p>
    <div className="brief-section-heading"><h2>Hasil yang Diharapkan (Deliverables)</h2><small>3 Target Output</small></div>
    <ul className="brief-check-list"><li><CheckCircle2 />3 Video 9:16 resolusi 1080p 60fps durasi 30-60 detik</li><li><CheckCircle2 />Sudah include voiceover/subtitle dan copywriting hook di 3 detik pertama</li><li><CheckCircle2 />Raw footage opsional diserahkan via Google Drive</li></ul>
    <div className="brief-tags detail">{["#TikTokUGC", "#ReelsInstagram", "#FoodVideography", "#Voiceover", "#CapCutPro"].map((tag) => <span key={tag}>{tag}</span>)}</div>
  </section>;
}

function ApplicantCard({ item }: { item: (typeof applicants)[number] }) {
  return <article className="applicant-card">
    <header><div className="applicant-person"><span><img src={item.avatar} alt="" /><i><Check /></i></span><div><h3>{item.name}{item.promoted && <b>PRO+</b>}<small><Star fill="currentColor" />{item.rating} <em>({item.reviews})</em></small><small><BriefcaseBusiness />{item.projects} proyek selesai</small>{item.promoted && <em>Promoted</em>}</h3><p><strong>Tawaran {item.offer}</strong><i /> <MapPin />{item.location}<i />{item.score} Skor Karir<i />Waktu {item.eta}</p></div></div></header>
    <p>{item.pitch}</p>
    <footer><Link href="/profile/maya-angelina">Lihat Portofolio Lengkap <ExternalLink /></Link><div><Link className="brief-icon-btn" href="/pesan" aria-label={`Chat dengan ${item.name}`}><MessageCircle /></Link><Link className="choose-creator" href="/pesan"><Check />Pilih Creator</Link></div></footer>
  </article>;
}

function PelamarContent() {
  return <section className="brief-applicants"><h2>Daftar Kreator yang Mengajukan Lamaran (4)</h2><p>Kreator terverifikasi yang siap mengeksekusi brief ini sesuai kebutuhan brand kamu.</p><div>{applicants.map((item) => <ApplicantCard item={item} key={item.name} />)}</div></section>;
}

function UmkmBriefCard({ brief }: { brief: (typeof umkmOpenBriefs)[number] }) {
  return <article className="umkm-brief-card">
    <div className="brief-card-top"><span>{brief.category}</span><small><Clock3 />{brief.time}</small></div>
    <h3>{brief.title}</h3>
    <p>{brief.description}</p>
    <ul>{brief.deliverables.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul>
    <div className="brief-tags">{brief.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    <footer><div><small>Estimasi Anggaran</small><strong>{brief.budget}</strong></div><Link href="/brief/rincian"><PenLine />Edit brief</Link></footer>
  </article>;
}

function UmkmBriefPanel() {
  return <>
    <header className="umkm-section-heading"><h2>Brief Proyek yang Sedang Dibuka</h2><p>Kreator terverifikasi dapat langsung meninjau deliverables dan mengajukan penawaran proposal ke brand ini.</p></header>
    <div className="umkm-brief-grid">{umkmOpenBriefs.map((brief, index) => <UmkmBriefCard brief={brief} key={`${brief.title}-${index}`} />)}</div>
  </>;
}

function UmkmCollaborationPanel() {
  return <div className="umkm-collaboration-grid">
    {collaborationWorks.map((title, index) => <article className="umkm-work-card" key={title}>
      <div className="umkm-work-visual"><i /><button type="button" aria-label={`Putar karya kolaborasi ${index + 1}`}><Play fill="currentColor" /></button></div>
      <footer><h3>{title}</h3><div><span>@munir.desig</span><span>185.4K</span></div></footer>
    </article>)}
  </div>;
}

function UmkmBrandPanel() {
  return <section className="umkm-brand-panel">
    <div>
      <h2>Kisah Brand & Filosofi</h2>
      <p>Brand roastery & kedai kopi lokal asal Jakarta Selatan yang fokus menghadirkan biji kopi arabika pilihan dari petani lereng Gunung Ijen dan Gayo. Kami rutin berkolaborasi dengan kreator konten, videografer, dan desainer grafis untuk kampanye produk kopi siap minum (RTD) dan promosi event cafe mingguan.</p>
      <p>Sebagai brand lokal yang bertumbuh di era digital, kami sangat menghargai kreativitas dan sudut pandang autentik para kreator konten. Kami percaya kolaborasi yang kuat dibangun di atas kejelasan brief, transparansi timeline, dan kepastian pembayaran tepat waktu.</p>
      <h2>Nilai & Karakter Brand</h2>
      <div className="umkm-brand-tags">{["Authentic Coffee Craftsmanship", "Fair Trade Petani Lokal", "Aesthetic & Cozy Experience", "Ramah Lingkungan (Eco Cup)"].map((item) => <span key={item}>{item}</span>)}</div>
      <h2>Target Audiens Produk</h2>
      <p>Anak muda usia 19-35 tahun, penikmat kopi specialty, pekerja remote & mahasiswa kreatif perkotaan.</p>
      <h2>Palet Warna Brand</h2>
      <div className="umkm-color-palette"><span><i />Warna Primer<br /><small>#7f3f00</small></span><span><i />Warna Sekunder<br /><small>#f2e7cf</small></span></div>
      <div className="umkm-brand-stats"><b>1.284 <small>pengikut brand</small></b><b>18 <small>kolaborasi kreator</small></b><b>100% <small>escrow aman</small></b></div>
    </div>
    <aside>
      <div><p><MapPin />Jakarta Selatan</p><p><BriefcaseBusiness />Creatorin Pro</p><p><Clock3 />Member since May 2011</p></div>
      <h3>Contact Info</h3><p><Globe />kreativa.studio</p><p><Mail />hello@kreativa.studio</p>
      <h3>Social</h3><p><Globe />kreativa.studio</p><p><Twitter />Twitter</p><p><Instagram />Instagram</p><p><Linkedin />LinkedIn</p>
    </aside>
  </section>;
}

function UmkmProfilePage() {
  const [activeTab, setActiveTab] = useState<UmkmProfileTab>("brief");

  return <div className="creatorin-app profile-page umkm-profile-page">
    <BriefHeader activeBrief={false} />
    <main className="profile-main umkm-profile-main">
      <section className="profile-hero umkm-profile-hero">
        <div className="profile-cover umkm-profile-cover"><img src="/creatorin/umkm-kopi-cover-photo.jpeg" alt="Kopi Kenangan Senja" /></div>
        <div className="profile-overlap">
          <div className="profile-avatar"><img src="/creatorin/umkm-kopi-brand-avatar.jpeg" alt="Kopi Kenangan Senja" /><span><Instagram /></span></div>
          <div className="profile-actions"><button className="profile-more" type="button" aria-label="Opsi lainnya"><MoreHorizontal /></button><button className="profile-follow" type="button">Edit Profil</button><button className="profile-message" type="button"><Share2 />Bagikan</button></div>
        </div>
        <div className="profile-identity">
          <h1>Kopi Kenangan Senja</h1>
          <p>Racikan Kopi Nusantara Autentik untuk Generasi Muda Urban</p>
          <div className="profile-stats"><span><b>18</b>Proyek Selesai</span><span><b>4.9 <Star fill="currentColor" /></b>(22 Ulasan)</span><span><b>2</b>Brief Terbuka</span><span><MapPin />Senopati, Jakarta Selatan</span></div>
        </div>
      </section>
      <section className="umkm-profile-tabbar"><div><nav className="profile-tabs umkm-profile-tabs" aria-label="Profil UMKM">{umkmProfileTabs.map((tab) => <button className={activeTab === tab.id ? "active" : ""} type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.count && <small>{tab.count}</small>}</button>)}</nav></div></section>
      <section className="profile-content umkm-profile-content" key={activeTab}>
        <div className="umkm-tab-panel">
          {activeTab === "collaboration" ? <UmkmCollaborationPanel /> : activeTab === "brand" ? <UmkmBrandPanel /> : <UmkmBriefPanel />}
        </div>
      </section>
    </main>
    <BriefFooter />
  </div>;
}

function BusinessSummary() {
  return <section className="brief-business-summary"><img src="/creatorin/partner-1.png" alt="" /><h2>Kopi Kenangan Senja</h2><p>F&B dan coffee roastery lokal di Jakarta Selatan dengan fokus konten produk kopi siap minum.</p><div><Link href="/pesan">Kirim Pesan</Link><Link href="/brief/tentang-umkm">Lihat Profil</Link></div><footer><span>kopikenangansenja.creatorin.id</span><span>halo@kopikenangansenja.com</span></footer></section>;
}

function RelatedBriefs() {
  return <section className="brief-related"><header><h2>Brief Proyek Lainnya yang Sedang Aktif</h2><Link href="/brief">Lihat Semua Brief +</Link></header><div>{briefs.slice(2, 5).map((brief) => <BriefCard brief={brief} key={brief.title} />)}</div></section>;
}

export function BriefDetailPage({ tab = "rincian" }: { tab?: string }) {
  const active: BriefTab = tab === "pelamar" || tab === "tentang-umkm" ? tab : "rincian";
  if (active === "tentang-umkm") return <UmkmProfilePage />;
  return <DetailShell active={active}>{active === "pelamar" ? <PelamarContent /> : <RincianContent />}</DetailShell>;
}
