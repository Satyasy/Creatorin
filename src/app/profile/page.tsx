"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck, Bell, Check, ChevronDown, Clock3, Ellipsis, Globe, GraduationCap,
  Heart, Instagram, Linkedin, Mail, MapPin, MessageSquare, Play, Search, SlidersHorizontal,
  Star, Twitter,
} from "lucide-react";
import { ShaderFill } from "../../lib/custom-effect-runtime";
import { setup, render, manifest } from "../../lib/custom-effects/CodeComponentId_c2b302fbdfce8a1ec92a5a80b10a5916ab506ed7_430";
import { setup as waterSetup, render as waterRender, manifest as waterManifest } from "../../lib/custom-effects/CodeComponentId_40f03f78407c1c973fc891fbca9ff3d0387485e6_435";
import JelajahNav from "../../JelajahNav";
import "../../App.css";
import "../../Profile.css";
import "../../Proportions.css";

const tabs = ["Proyek", "Layanan", "Ulasan", "Statistik", "Postingan Diskusi", "Tentang"];
const creators = {
  "maya-angelina": { name: "Maya Angelina", avatar: "/creatorin/maya-angelina.png", headline: "Beauty & Lifestyle TikTok Content Creator", projects: "142+", rating: "4.9", reviews: "98", followers: "4.827", score: "95%", location: "Jakarta Barat", school: "SMK Telkom Sidoarjo" },
  "qaesyaar-aqeel": { name: "Qaesyaar Aqeel", avatar: "/creatorin/avatar.png", headline: "Brand Identity & Digital Content Creator", projects: "88+", rating: "5.0", reviews: "88", followers: "3.240", score: "95%", location: "Bandung, Jawa Barat", school: "Institut Teknologi Bandung" },
  "sobakhul-munir-siroj": { name: "Sobakhul Munir Siroj", avatar: "/creatorin/avatar.png", headline: "TikTok UGC & Product Review Creator", projects: "64+", rating: "4.9", reviews: "52", followers: "2.913", score: "93%", location: "Jakarta Selatan", school: "Creatorin Academy" },
} as const;
const profileProjects = Array.from({ length: 4 }, (_, id) => ({
  id,
  title: "Tips bertahan as Product Designer di 2026 ditengah gempuran AI bot :(",
  creator: "@munirs.design",
  views: "185.4K",
}));

function ProfileHeader() {
  return <header className="profile-header"><div className="profile-header-inner">
    <div className="profile-header-start"><Link className="brand" href="/" aria-label="Kembali ke Creatorin"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><form className="profile-search" onSubmit={(event) => event.preventDefault()}><input aria-label="Cari" placeholder="Cari kreator, keahlian, atau video UGC..." /><button aria-label="Cari"><Search /></button></form></div>
    <nav className="profile-nav" aria-label="Navigasi utama"><Link href="/">Beranda</Link><JelajahNav /><Link href="/">Collaboration Room</Link><Link href="/brief">Brief Proyek</Link></nav>
    <div className="header-actions"><Link className="icon-button notification" href="/pesan" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></Link><Link className="icon-button notification" href="/notifikasi" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></Link><Link className="profile-button" href="/profile" aria-label="Profil creator"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link></div>
  </div></header>;
}

function ProfileFooter() {
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

function ProfileProject({ item }: { item: (typeof profileProjects)[number] }) {
  return <article className="profile-project">
    <ShaderFill className="profile-project-shader" shader={{ setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: item.id * .04, shape: 0, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} />
    <span className="profile-project-play"><Play fill="currentColor" /></span><div className="profile-project-info"><h3>{item.title}</h3><div><span>{item.creator}</span><span>{item.views}</span></div></div>
  </article>;
}


const profileServices = [
  ["1x Video TikTok UGC & Review Viral", "TikTok UGC", "Rp1.500.000", "2 Hari Kerja"],
  ["3x Video Reels Product Showcase", "Instagram Reels", "Rp2.100.000", "4 Hari Kerja"],
  ["1x Video Unboxing & First Impression", "Product Review", "Rp850.000", "2 Hari Kerja"],
  ["Paket 5 Video UGC Campaign", "Campaign", "Rp5.500.000", "7 Hari Kerja"],
];
const reviewItems = [
  ["Sarah Kurniawan", "Founder, GlowLab Skincare", "sarah-kurniawan.png", "Desain Landing Page & Mobile UI Kit Kosmetik", "12 September 2026", "Kerja sama yang sangat memuaskan dari awal brief hingga serah terima. Mas Munir sangat responsif di room chat Creatorin, memahami kebutuhan visual brand kami tanpa perlu banyak revisi, dan deliverable Figma-nya terstruktur rapi untuk tim developer kami."],
  ["Budi Pratama", "Marketing Lead, Kopi Karsa", "budi-pratama.png", "Redesign Website Interaktif & Brand Guideline", "28 Agustus 2026", "Hasil pengerjaan website Framer-nya jauh melampaui ekspektasi. Interaksi animasinya sangat halus dan konversi campaign kopi kami naik drastis sejak peluncuran. Seluruh revisi diselesaikan tepat waktu sesuai timeline yang disepakati bersama."],
  ["Amanda Larasati", "Co-Founder, Zenita Fashion", "amanda-larasati.png", "Desain E-Commerce UI & Seasonal Campaign Banner", "15 Agustus 2026", "Sangat profesional dan terbiasa dengan standar komersial tinggi. Komunikasi selama pengerjaan di Creatorin sangat transparan, file aset rapi, dan brief langsung diterjemahkan ke estetika visual yang modern dan elegan."],
  ["Farhan Mahendra", "Product Manager, FinPay Digital", "farhan-mahendra.png", "SaaS Dashboard Design System & Component Library", "29 Juli 2026", "Design system yang dibangun sangat komprehensif mulai dari typography token, color hierarchy, hingga reusable components. Tim engineer kami sangat terbantu dengan kerapian dokumentasi dan kepatuhan terhadap deadline."],
  ["Jessica Tanuwidjaja", "Creative Director, Artisan Goods Co.", "jessica-tanuwidjaja.png", "Webflow Portfolio & Digital Brand Identity", "14 Juli 2026", "Salah satu kreator paling solutif yang pernah kami ajak kerja sama. Bukan hanya mengeksekusi apa yang tertulis di brief, tapi juga aktif memberikan masukan cerdas untuk pengalaman pengguna yang lebih baik."],
  ["Dimas Wicaksono", "Founder, TeknoVibe Studio", "dimas-wicaksono.png", "Landing Page Promosi Aplikasi Mobile", "30 Juni 2026", "Proses serah terima cepat, zero drama, dan langsung siap dideploy ke produksi. Komitmen terhadap deadline dan akurasi brief benar-benar terbukti sepanjang kolaborasi di platform ini."],
];
function ServicesPanel() {
  return <div className="profile-service-grid">{profileServices.map(([title, category, price, time]) => <article className="profile-service-card" key={title}>
    <div className="profile-service-visual"><ShaderFill className="profile-cover-shader" shader={{ setup: setup, render, manifest, params: { falloff: 1, inverseFalloff: false, ringCount: 20, offset: 0, shape: 1, transform: { x: 50, y: 50, radius: 50, angle: 0 }, color: { r: 1, g: 1, b: 1, a: 1 } } }} /></div>
    <span className="profile-service-tag">{category}</span><h3>{title}</h3><p>Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.</p><div className="profile-service-time"><Clock3 /> Estimasi: {time}</div><div className="profile-service-footer"><div><small>HARGA</small><strong>{price}</strong></div><button aria-label="Simpan layanan"><Heart /></button><Link href="/brief">Diskusikan</Link></div>
  </article>)}</div>;
}
function StatisticsPanel() {
  const metrics = [["Respons & Profesionalitas", 94, "Kecepatan membalas pesan, kejelasan koordinasi brief, dan etika komunikasi profesional."], ["Performa Proyek", 93, "Kesesuaian hasil akhir dengan ruang lingkup brief, akurasi deadline, dan efisiensi revisi."], ["Kepuasan Klien", 89, "Tingkat penerimaan deliverable final tanpa kendala serta konsistensi feedback positif."]];
  return <div className="profile-statistics"><div className="score-main"><div className="score-heading"><strong>92</strong><span>/ 100</span><b>&mdash; Skor Rekam Jejak</b></div><p>Dihitung otomatis oleh sistem Creatorin berdasarkan aktivitas nyata, mencakup respons komunikasi di room chat, kelancaran eksekusi proyek, ketepatan waktu serah terima, dan ulasan terverifikasi dari klien.</p><hr /><h2>Aspek Rekam Jejak</h2>{metrics.map(([label, score, desc]) => <div className="score-metric" key={label as string}><div><span>{label}</span><b>{score} <small>/ 100</small></b></div><i><em style={{ width: `${Number(score) / 100 * 100}%` }} /></i><p>{desc}</p></div>)}<hr /><h2>Statistik Pendukung</h2><div className="support-metrics"><div><b>28</b><span>Project Selesai</span><small>Tuntas serah terima</small></div><div><b>95%</b><span>Tepat Waktu</span><small>Sesuai kesepakatan</small></div><div><b>&lt; 1 Jam</b><span>Rata-rata Respons</span><small>Respons aktif chat</small></div><div><b>4.8</b><span>Rating Kepuasan</span><small>Ulasan klien terverifikasi</small></div></div></div><aside className="score-aside"><div className="score-trust"><p><BadgeCheck />Terverifikasi otomatis</p><p><Check />Berdasarkan transaksi nyata</p><p><Check />Tanpa input manual kreator</p></div><h3>Tentang Skor Rekam Jejak</h3><p>Skor diperbarui secara berkala oleh algoritma Creatorin berdasarkan riwayat transaksi yang valid. Sistem ini memberikan transparansi objektif bagi klien tanpa membebani kreator untuk mengisi data sendiri.</p><h3>Sumber Data Penilaian</h3><div className="score-tags"><span>Aktivitas Chat</span><span>Ketepatan Tenggat</span><span>Kelancaran Revisi</span><span>Penyelesaian Escrow</span><span>Feedback Klien</span></div></aside></div>;
}
function ReviewsPanel() {
  return <div className="profile-reviews"><div className="reviews-heading"><div><h2>Ulasan Klien</h2><p>Seluruh testimoni berasal dari kolaborasi proyek yang telah selesai dan diserahterimakan di Creatorin.</p></div><div><button className="active">Terbaru</button><button>Rating Tertinggi</button></div></div>{reviewItems.map(([name, role, avatar, project, date, quote]) => <article className="review-item" key={name}><div className="review-person"><img src={`/creatorin/${avatar}`} alt="" /><div><h3>{name} <small>&middot; {role}</small></h3><p>Proyek: {project} <i>&middot;</i> Selesai {date}</p></div></div><div className="review-rating"><span aria-label="5 dari 5 bintang">5 / 5</span><b>5.0</b></div><blockquote>&ldquo;{quote}&rdquo;</blockquote></article>)}</div>;
}
function DiscussionPanel() {
  return <div><div className="discussion-heading"><div><h2>Postingan Diskusi</h2><p>Gagasan, proses kreatif, dan percakapan terbaru dari kreator.</p></div><span><MessageSquare />4 postingan</span></div><div className="profile-discussion-grid">{profileProjects.map((item) => <ProfileProject item={item} key={item.id} />)}</div></div>;
}
function AboutPanel() {
  const skills = ["app ui", "branding", "dashboard", "design systems", "development", "front end development", "icons", "illustration", "mobile", "product design", "strategy", "ui", "ux", "web design", "website ui", "wordpress"];
  return <div className="profile-about"><div><h2>Biography</h2><p>We are Kreativa Studio &mdash; a forward-thinking digital design studio delivering meticulous experiences that connect with people.</p><p>Our creations help clients around the world, ranging from industry icons and brands the likes of Tony Robbins, Sony, Hasbro, Toyota and Government of Dubai, to small ambitious startups such as EnduroSat, Backpack and Ybot.</p><p>From concept to execution, we partner with clients to establish brands that resonate, launch impeccable apps, and create websites and products ready for what&apos;s next.</p><p>If you&apos;re looking for the right dance partner for your next step and think we might be a good fit, reach out &mdash; let&apos;s create something special together.</p><h2>Languages</h2><div className="profile-pills"><span>English</span><span>Indonesia</span><span>Jawa</span></div><h2>Skills</h2><div className="profile-pills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="about-stats"><b>142+ <small>Proyek Selesai</small></b><b>4,827 <small>Pengikut</small></b><b>4.9 <Star fill="currentColor" /> <small>(98 Ulasan)</small></b></div></div><aside className="about-aside"><div className="about-summary"><p><MapPin />Croatia</p><p><BadgeCheck />Creatorin Pro</p><p><Clock3 />Bergabung sejak Mei 2011</p></div><h3>Informasi Kontak</h3><p><Globe />kreativa.studio</p><p><Mail />hello@kreativa.studio</p><h3>Sosial</h3><p><Instagram />kreativa.studio</p><p><Twitter />Twitter</p><p><Linkedin />LinkedIn</p></aside></div>;
}

export default function ProfilePage() {
  const params = useParams<{ creator?: string }>();
  const slug = typeof params.creator === "string" ? params.creator : "maya-angelina";
  const creator = creators[slug as keyof typeof creators] ?? creators["maya-angelina"];
  const [following, setFollowing] = useState(true);
  const [activeTab, setActiveTab] = useState("Proyek");
  return <div className="creatorin-app profile-page"><ProfileHeader /><main className="profile-main">
    <section className="profile-hero">
      <div className="profile-cover"><ShaderFill className="profile-cover-shader" shader={{ setup: waterSetup, render: waterRender, manifest: waterManifest, params: { center: { x: 50, y: 50 }, scale: 1, playhead: 0, highlightColor: { r: .804, g: .961, b: 1, a: 1 }, waterColor: { r: 0, g: .388, b: .706, a: 1 }, intensity: .5 } }} /></div>
      <div className="profile-overlap"><div className="profile-avatar"><img src={creator.avatar} alt={creator.name} /><span><Check /></span></div><div className="profile-actions"><button className="profile-more" aria-label="Opsi lainnya"><Ellipsis /></button><button className="profile-follow" onClick={() => setFollowing(!following)}>{following ? "Following" : "Follow"}</button><Link className="profile-message" href="/pesan"><MessageSquare />Kirim Pesan</Link></div></div>
      <div className="profile-identity"><h1>{creator.name}</h1><p>{creator.headline}</p><div className="profile-stats"><span><b>{creator.projects}</b> Proyek Selesai</span><span><b>{creator.rating} <Star fill="currentColor" /></b> ({creator.reviews} Ulasan)</span><span><b>{creator.followers}</b> Pengikut</span><span><b>{creator.score}</b> Skor Karir</span><span><MapPin />{creator.location}</span><span><GraduationCap />{creator.school}</span></div></div>
      <div className="profile-tabs-row"><div className="profile-tabs" role="tablist">{tabs.map((tab, index) => <button type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}{index < 2 && <small>{index === 0 ? 4 : 3}</small>}</button>)}</div><button className="profile-sort"><SlidersHorizontal />Terbaru<ChevronDown /></button></div>
    </section>
    <section className="profile-content" aria-live="polite">{activeTab === "Proyek" && <div className="profile-project-grid">{profileProjects.map((item) => <ProfileProject item={item} key={item.id} />)}</div>}{activeTab === "Layanan" && <ServicesPanel />}{activeTab === "Statistik" && <StatisticsPanel />}{activeTab === "Ulasan" && <ReviewsPanel />}{activeTab === "Postingan Diskusi" && <DiscussionPanel />}{activeTab === "Tentang" && <AboutPanel />}</section>
  </main><ProfileFooter /></div>;
}




