"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  CreditCard,
  FileText,
  Instagram,
  Linkedin,
  MessageSquare,
  Search,
  ShieldCheck,
  Twitter,
} from "lucide-react";
import JelajahNav from "../../JelajahNav";
import "../../App.css";
import "../../Profile.css";
import "../../Notifikasi.css";
import "../../Proportions.css";

type NotificationFilter = "Semua" | "Belum Dibaca" | "Kolaborasi" | "Pesan" | "Transaksi";
type NotificationItem = {
  action: string;
  avatar?: string;
  body: string;
  cta: string;
  icon: typeof MessageSquare;
  time: string;
  unread?: boolean;
};

const filters: NotificationFilter[] = ["Semua", "Belum Dibaca", "Kolaborasi", "Pesan", "Transaksi"];
const unreadCount = 3;
const groups: { title: string; items: NotificationItem[] }[] = [
  {
    title: "Hari Ini",
    items: [
      { action: "Pesan baru dari Sobakhul Munir Siroj", avatar: "/creatorin/avatar.png", body: "Berikut invoice resmi untuk pengerjaan project ini. Setelah pembayaran masuk ke escrow, Collaboration Room akan otomatis aktif.", cta: "Lihat di Pesan", icon: MessageSquare, time: "10 mnt lalu", unread: true },
      { action: "Invoice #INV-882194 diterbitkan", avatar: "/creatorin/avatar.png", body: "Invoice senilai Rp1.500.000 untuk \"Premium Figma SaaS Landing Page Template\" siap dibayarkan ke Rekening Escrow.", cta: "Lihat di Pesan", icon: FileText, time: "25 mnt lalu", unread: true },
      { action: "Collaboration Room siap diaktifkan", body: "Ruang kerja kolaborasi dan kanban board proyek SaaS Landing Page disiapkan setelah verifikasi escrow selesai.", cta: "Lihat di Pesan", icon: BriefcaseBusiness, time: "2 jam lalu", unread: true },
      { action: "Pesan baru dari Maya Angelina", avatar: "/creatorin/maya-angelina.png", body: "Draft hook video TikTok sudah saya sesuaikan dengan brief brand serum Anda ya kak.", cta: "Lihat di Pesan", icon: MessageSquare, time: "8 jam lalu" },
    ],
  },
  {
    title: "Kemarin",
    items: [
      { action: "Pembayaran Escrow berhasil diamankan", body: "Dana Rp450.000 untuk pesanan \"1x Video UGC Skincare & Beauty Routine\" telah aman tersimpan di Rekening Escrow Creatorin.", cta: "Lihat di Pesan", icon: CreditCard, time: "Kemarin, 16:30" },
      { action: "Draft identitas visual disetujui klien", avatar: "/creatorin/budi-pratama.png", body: "Klien telah mengonfirmasi dan menyetujui arah eksplorasi palet warna & tipografi pada Collaboration Room.", cta: "Lihat di Proyek", icon: CheckCheck, time: "Kemarin, 11:15" },
      { action: "Permintaan revisi minor diajukan", avatar: "/creatorin/amanda-larasati.png", body: "Catatan revisi framing b-roll kopi dan audio subtitle ditambahkan pada catatan review pengerjaan.", cta: "Lihat di Pesan", icon: MessageSquare, time: "Kemarin, 08:40" },
    ],
  },
  {
    title: "Sebelumnya",
    items: [
      { action: "Penyelesaian proyek & pencairan escrow", avatar: "/creatorin/sarah-kurniawan.png", body: "Pekerjaan \"Product Catalog Photography Lookbook\" telah selesai dan diverifikasi. Dana Rp250.000 telah diteruskan.", cta: "Lihat di Layanan", icon: ShieldCheck, time: "10 Sep" },
      { action: "Kesepakatan brief kolaborasi disetujui", avatar: "/creatorin/dimas-wicaksono.png", body: "Dimas Wicaksono telah menyetujui brief \"Tech Reviewer UGC Unboxing Gadget\". Tahap pengerjaan dimulai.", cta: "Lihat di Pesan", icon: BriefcaseBusiness, time: "8 Sep" },
      { action: "Pembaruan proteksi Creatorin Escrow 2.0", body: "Seluruh pembayaran transaksi melalui room chat kini otomatis terlindungi penahanan dana escrow berlapis.", cta: "Lihat di Proyek", icon: Bell, time: "5 Sep" },
    ],
  },
];

function NotificationHeader() {
  return <header className="profile-header"><div className="profile-header-inner">
    <div className="profile-header-start"><Link className="brand" href="/" aria-label="Kembali ke Creatorin"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><form className="profile-search" onSubmit={(event) => event.preventDefault()}><input aria-label="Cari" placeholder="Cari kreator, keahlian, atau video UGC..." /><button aria-label="Cari"><Search /></button></form></div>
    <nav className="profile-nav" aria-label="Navigasi utama"><Link href="/">Beranda</Link><JelajahNav /><Link href="/">Collaboration Room</Link><Link href="/brief">Brief Proyek</Link></nav>
    <div className="header-actions"><Link className="icon-button notification" href="/pesan" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></Link><Link className="icon-button notification" href="/notifikasi" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></Link><Link className="profile-button" href="/profile" aria-label="Profil creator"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link></div>
  </div></header>;
}

function NotificationFooter() {
  const columns = [
    ["Jelajahi", ["Cari Creator", "/jelajah/creator"], ["Layanan", "/jelajah/layanan"], ["Project", "/jelajah/proyek"], ["Collaboration Room", "/"]],
    ["Untuk Bisnis", ["Mulai Brief", "/"], ["Jelajahi Creator", "/jelajah/creator"], ["Kelola Project", "/jelajah/proyek"], ["Cara Kerja", "/"]],
    ["Untuk Creator", ["Bagikan Project", "/jelajah/proyek"], ["Lihat Brief Project", "/jelajah/proyek"], ["Portfolio", "/profile"], ["Skor Rekam Jejak", "/profile"]],
    ["Bantuan", ["Pusat Bantuan", "/"], ["FAQ", "/"], ["Hubungi Kami", "/"], ["Kebijakan & Privasi", "/"]],
  ] as const;

  return <footer className="footer notification-footer"><div className="footer-inner">
    <div className="footer-top"><Link className="brand brand--footer" href="/"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><div className="social"><span>Social Media</span><a href="#twitter" aria-label="X Twitter"><Twitter /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a></div></div>
    <div className="footer-body"><div className="about"><h3>Tentang Platform</h3><p>Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.</p><div className="partners"><img src="/creatorin/partner-1.png" alt="Innovation Room" /><img src="/creatorin/partners.png" alt="Partner Creatorin" /></div></div><div className="footer-columns">{columns.map(([title, ...links]) => <div key={title}><h3>{title}</h3>{links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}</div></div>
    <div className="footer-word" aria-hidden="true">creatorin</div><div className="footer-bottom"><span>&copy; 2026 Creatorin. All rights reserved.</span><div><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></div></div>
  </div></footer>;
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const Icon = item.icon;
  return <article className={item.unread ? "notification-item is-unread" : "notification-item"}>
    <div className="notification-avatar">{item.avatar ? <img src={item.avatar} alt="" /> : <span><Icon /></span>}<i><Icon /></i></div>
    <div className="notification-copy">
      <header><h3>{item.action}</h3><time>{item.time}</time></header>
      <p>{item.body}</p>
      <Link href={item.cta.includes("Pesan") ? "/pesan" : item.cta.includes("Layanan") ? "/jelajah/layanan" : "/jelajah/proyek"}>{item.cta}<ArrowUpRight /></Link>
    </div>
    {item.unread && <span className="notification-dot" aria-label="Belum dibaca" />}
  </article>;
}

export default function NotifikasiPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("Semua");
  const isUnreadEmpty = activeFilter === "Belum Dibaca";

  return <div className="creatorin-app notification-page"><NotificationHeader /><main className="notification-main">
    <section className="notification-panel" aria-label="Daftar notifikasi">
      <header className="notification-heading">
        <div><h1>Notifikasi</h1>{isUnreadEmpty ? <span>Semua terbaca</span> : <b>{unreadCount} belum dibaca</b>}</div>
        {!isUnreadEmpty && <button type="button"><CheckCheck />Tandai semua sudah dibaca</button>}
      </header>
      <div className="notification-tabs" role="tablist" aria-label="Filter notifikasi">{filters.map((filter) => <button type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)} key={filter}>{filter}{filter === "Belum Dibaca" && activeFilter !== filter && <small>{unreadCount}</small>}</button>)}</div>
      {isUnreadEmpty ? <div className="notification-empty"><h2>Tidak ada notifikasi</h2><p>Semua pembaruan pada filter ini telah dibaca atau belum tersedia.</p></div> : <div className="notification-list">{groups.map((group) => <section className="notification-group" key={group.title}><h2>{group.title}</h2>{group.items.map((item) => <NotificationRow item={item} key={`${group.title}-${item.action}`} />)}</section>)}</div>}
    </section>
  </main><NotificationFooter /></div>;
}
