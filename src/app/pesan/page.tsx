"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, FileText, MessageSquare, Paperclip, Search, Send } from "lucide-react";
import JelajahNav from "../../JelajahNav";
import "../../App.css";
import "../../Profile.css";
import "../../Pesan.css";

const conversations = [
  { name: "Sobakhul Munir Siroj", avatar: "/creatorin/avatar.png", time: "10:45", preview: "Berikut invoice resmi untuk pengerjaan project ini.", unread: true, online: true, role: "UI/UX & Framer" },
  { name: "Maya Angelina", avatar: "/creatorin/maya-angelina.png", time: "Kemarin", preview: "Draft hook video TikTok sudah saya sesuaikan dengan brief ya.", online: true, role: "Beauty Creator" },
  { name: "Phenomenon Creative", avatar: "/creatorin/budi-pratama.png", time: "13 Sep", preview: "3 konsep alternatif identitas visual sudah selesai kami susun.", role: "Brand Studio" },
  { name: "Rian Prasetyo", avatar: "/creatorin/dimas-wicaksono.png", time: "12 Sep", preview: "Siap kak, jadwal take video ASMR b-roll kopi sudah saya jadwalkan.", role: "Video Creator" },
  { name: "Annisa Putri Rahayu", avatar: "/creatorin/amanda-larasati.png", time: "10 Sep", preview: "Hasil foto produk lookbook siap diunduh via Google Drive.", role: "Product Photographer" },
  { name: "Dimas Wicaksono", avatar: "/creatorin/dimas-wicaksono.png", time: "8 Sep", preview: "Unit gadget sudah diterima di studio dengan aman.", role: "Tech Reviewer" },
];

const services = [
  { title: "Premium Figma SaaS Landing Page Template", category: "Figma Template", time: "2 Hari Kerja", price: "Rp1.500.000", image: "/creatorin/service-figma-template.png" },
  { title: "Full Framer Interactive Website Build", category: "Framer Site", time: "4 Hari Kerja", price: "Rp3.800.000", image: "/creatorin/service-framer.png" },
  { title: "Custom Brand Identity & UI Kit System", category: "Design System", time: "3 Hari Kerja", price: "Rp2.200.000", image: "/creatorin/service-brand-kit.png" },
  { title: "1x Video TikTok UGC & Review Viral", category: "TikTok UGC", time: "2 Hari Kerja", price: "Rp1.500.000", image: "/creatorin/service-ugc.png" },
];

type Conversation = (typeof conversations)[number];
type Service = (typeof services)[number];

function PesanHeader() {
  return <header className="profile-header"><div className="profile-header-inner">
    <div className="profile-header-start"><Link className="brand" href="/" aria-label="Kembali ke Creatorin"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><form className="profile-search" onSubmit={(event) => event.preventDefault()}><input aria-label="Cari" placeholder="Cari kreator, keahlian, atau video UGC..." /><button aria-label="Cari"><Search /></button></form></div>
    <nav className="profile-nav" aria-label="Navigasi utama"><Link href="/">Beranda</Link><JelajahNav /><a href="#collaboration">Collaboration Room</a><a href="#brief">Brief Proyek</a></nav>
    <div className="header-actions"><Link className="icon-button notification" href="/pesan" aria-label="Pesan"><MessageSquare /><i className="blue-dot" /></Link><Link className="icon-button notification" href="/notifikasi" aria-label="Notifikasi"><Bell /><i className="pink-dot" /></Link><Link className="profile-button" href="/profile" aria-label="Profil creator"><img src="/creatorin/avatar.png" alt="Qaesyaar Aqeel" /><i /></Link></div>
  </div></header>;
}

function ServiceMini({ service, dark = false }: { service: Service; dark?: boolean }) {
  return <div className={dark ? "chat-service-card chat-service-card--dark" : "chat-service-card"}>
    <img src={service.image} alt="" />
    <div><h3>{service.title}</h3><p><strong>{service.price}</strong><span>&middot; {service.time}</span></p></div>
    {dark && <button type="button">Detail</button>}
  </div>;
}

function BubbleMeta({ time }: { time: string }) {
  return <span className="bubble-meta"><time>{time}</time><CheckCheck /></span>;
}

function ChatDetail({ conversation }: { conversation: Conversation }) {
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTop = thread.scrollHeight;
  }, [conversation.name]);

  return <section className="chat-detail" aria-label={`Percakapan dengan ${conversation.name}`}>
    <header className="chat-header">
      <div className="chat-person"><span className="conversation-avatar"><img src={conversation.avatar} alt="" />{conversation.online && <i />}</span><div><h2>{conversation.name}</h2><p>Online <span>&middot;</span> {conversation.role}</p></div></div>
      <Link href="/profile/sobakhul-munir-siroj">Lihat Profil</Link>
    </header>
    <div className="chat-thread" ref={threadRef}>
      <div className="chat-day">Hari ini</div>
      <article className="message-row message-row--out">
        <div className="message-bubble message-bubble--out"><ServiceMini service={services[0]} dark /><p>Halo Mas Munir, kami tertarik dengan layanan Premium Figma SaaS Landing Page untuk brand kami.</p></div><BubbleMeta time="10:30" />
      </article>
      <article className="message-row">
        <div className="message-bubble"><p>Halo! Terima kasih sudah menghubungi. Untuk paket ini sudah termasuk 20+ komponen responsif, auto-layout rapi, dan panduan variabel warna.</p></div><time>10:35</time>
      </article>
      <article className="message-row message-row--out">
        <div className="message-bubble message-bubble--out"><p>Bagus sekali. Apakah bisa diselaraskan dengan palet warna brand kami?</p></div><BubbleMeta time="10:38" />
      </article>
      <article className="message-row">
        <div className="message-bubble message-bubble--attachment">
          <figure><img src="/creatorin/chat-preview-figma.png" alt="" /><figcaption><span>Preview_Figma_Design_v1.png</span><span>2.4 MB</span></figcaption></figure>
          <p>Sangat bisa kak! Saya sudah siapkan style guide terpisah agar tinggal switch token warna.</p>
        </div><time>10:42</time>
      </article>
      <article className="message-row message-row--out">
        <div className="message-bubble message-bubble--out"><p>Baik Mas Munir, kami sepakat dengan scope pengerjaan dan harganya. Silakan terbitkan invoice ya agar bisa kami proses ke Escrow.</p></div><BubbleMeta time="10:44" />
      </article>
      <article className="message-row">
        <div className="message-bubble message-bubble--invoice">
          <p>Siap kak, terima kasih atas kepercayaannya! Berikut invoice resmi untuk pengerjaan project ini. Setelah pembayaran masuk ke escrow, Collaboration Room akan otomatis aktif.</p>
          <div className="invoice-card"><div><strong><FileText />Invoice #INV-882194</strong><span>Menunggu Pembayaran</span></div><h3>Premium Figma SaaS Landing Page Template</h3><p>1 Proyek &middot; Estimasi 2 Hari Kerja &middot; 20+ Komponen Responsif & Style Guide</p><dl><dt>Total Kesepakatan:</dt><dd>Rp1.500.000</dd></dl><button type="button">Bayar Invoice</button></div>
        </div><time>10:45</time>
      </article>
    </div>
    <form className="chat-compose" onSubmit={(event) => event.preventDefault()}><button type="button" aria-label="Lampirkan file"><Paperclip /></button><input aria-label="Tulis pesan" placeholder={`Tulis pesan untuk ${conversation.name}...`} /><button type="submit">Kirim <Send /></button></form>
  </section>;
}

function CreatorServices() {
  return <aside className="creator-services" aria-label="Layanan Creator">
    <h2>Layanan Creator</h2>
    <div>{services.map((service) => <article className="creator-service-card" key={service.title}><ServiceMini service={service} /><div className="creator-service-actions"><button type="button">Lihat Detail</button><button type="button">Diskusikan</button></div></article>)}</div>
  </aside>;
}

export default function PesanPage() {
  const [selected, setSelected] = useState<Conversation | null>(null);
  return <div className="creatorin-app pesan-page"><PesanHeader /><main className={selected ? "pesan-shell has-chat" : "pesan-shell"}>
    <aside className="pesan-sidebar" aria-label="Daftar percakapan">
      <div className="pesan-sidebar-top"><div className="pesan-title"><h1>Pesan</h1><span>1 baru</span></div><span className="pesan-filter">Belum dibaca</span></div>
      <div className="pesan-search-wrap"><label className="pesan-search"><Search /><input placeholder="Cari percakapan..." aria-label="Cari percakapan" /></label></div>
      <div className="conversation-list">{conversations.map((conversation) => <button type="button" className={`conversation-item${conversation.unread ? " is-unread" : ""}${selected?.name === conversation.name ? " is-active" : ""}`} onClick={() => setSelected(conversation)} key={conversation.name}>
        <span className="conversation-avatar"><img src={conversation.avatar} alt="" />{conversation.online && <i />}</span>
        <span className="conversation-copy"><span className="conversation-row"><strong>{conversation.name}</strong><time>{conversation.time}</time></span><span className="conversation-preview"><p>{conversation.preview}</p>{conversation.unread && <i />}</span></span>
      </button>)}</div>
    </aside>
    {selected ? <div className="pesan-detail-layout"><ChatDetail conversation={selected} /><CreatorServices /></div> : <section className="pesan-empty" aria-label="Percakapan kosong"><div className="pesan-empty-card"><img src="/creatorin/logo.svg" alt="" /><h2>Creatorin</h2><p>Pilih percakapan di sebelah kiri untuk mulai berkirim pesan</p></div></section>}
  </main></div>;
}
