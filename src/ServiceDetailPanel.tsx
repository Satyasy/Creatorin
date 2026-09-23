"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Clock3,
  Bookmark,
  Instagram,
  Linkedin,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Twitter,
  X,
} from "lucide-react";
import { ShaderFill } from "./lib/custom-effect-runtime";
import { setup as waveSetup, render as waveRender, manifest as waveManifest } from "./lib/custom-effects/CodeComponentId_cd43ef0afb2cac168a28e7f79135150678ccfd25_433";

const gallery = [
  { src: "/creatorin/service-framer.png", alt: "Fotografer memegang kamera di area kota" },
  { src: "/creatorin/service-figma-template.png", alt: "Preview template website dan wireframe" },
  { src: "/creatorin/service-brand-kit.png", alt: "Aset identitas brand di atas meja kerja" },
  { src: "/creatorin/service-ugc.png", alt: "Produksi konten UGC untuk brand" },
  { src: "/creatorin/project-related-1.png", alt: "Preview visual interaktif layanan" },
];

const outcomes = [
  "Full Framer Website siap live dengan interaksi micro-animation halus",
  "Setup responsive breakpoints untuk Desktop, Tablet, dan Mobile",
  "SEO-friendly structure, custom CMS collections, dan form connect",
  "Panduan handoff ke tim bisnis untuk update konten sendiri",
];

const process = [
  "Audit brief, referensi, dan prioritas konversi bisnis",
  "Pembuatan struktur halaman, copy block, dan arah visual",
  "Development di Framer dengan interaksi dan responsive tuning",
  "QA bersama, revisi, handoff, dan dokumentasi publish",
];

const related = [
  "Premium Figma SaaS Landing Page Template",
  "Interactive Portfolio Website Build",
  "Brand Launch Landing Page Design",
  "Conversion Sales Page Copy + Build",
  "Mobile-first Product Page Prototype",
  "Website CMS Setup for Service Business",
];

type ServiceDetailPanelProps = {
  isModal?: boolean;
  isClosing?: boolean;
  onClose?: () => void;
  title?: string;
  category?: string;
  creator?: string;
  price?: string;
  time?: string;
};

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof ReceiptText }) {
  return <article className="service-detail-metric">
    <div><span>{label}</span><i><Icon /></i></div>
    <strong>{value}</strong>
    <p>{detail}</p>
  </article>;
}

function RelatedCard({ title, index }: { title: string; index: number }) {
  return <article className="service-related-card">
    <div className="service-related-visual"><ShaderFill className="portfolio-shader" shader={{ setup: waveSetup, render: waveRender, manifest: waveManifest, params: { transform: { x: 50, y: 50, radius: 30, angle: 0 }, amplitude: 15, waveColor: { r: 1, g: 1, b: 1, a: 1 }, offset: index * 5, zoom: 1, glowIntensity: 1 } }} /></div>
    <span>Framer Site</span>
    <h3>{title}</h3>
    <p>Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.</p>
    <div><small>Mulai dari</small><strong>Rp1.500.000</strong><Link href="/layanan/full-framer-interactive-website-build">Pesan Layanan</Link></div>
  </article>;
}

export default function ServiceDetailPanel({ isModal = false, isClosing = false, onClose, title, category, creator, price, time }: ServiceDetailPanelProps) {
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState(false);
  const activeImage = gallery[active];
  const serviceTitle = title || "Full Framer Interactive Website Build";
  const serviceCategory = category || "Framer Site";
  const serviceCreator = creator || "Sobakhul Munir Siroj";
  const servicePrice = price || "Rp3.800.000";
  const serviceTime = time || "4 Hari Kerja";
  const className = `service-detail-page${isModal ? " is-modal" : ""}${isClosing ? " is-closing" : ""}`;
  const showPreviousImage = () => setActive((index) => (index + gallery.length - 1) % gallery.length);
  const showNextImage = () => setActive((index) => (index + 1) % gallery.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % gallery.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return <div className={className} role={isModal ? "dialog" : undefined} aria-modal={isModal || undefined} aria-label={isModal ? "Detail layanan" : undefined}>
    <div className="service-detail-close">{onClose ? <button type="button" onClick={onClose} aria-label="Tutup detail layanan"><X /></button> : <Link href="/" aria-label="Tutup detail layanan"><X /></Link>}</div>
    <div className="service-detail-sheet">
      <header className="service-detail-header">
        <div className="service-detail-header-inner">
          <Link className="service-detail-author" href="/profile/sobakhul-munir-siroj">
            <span><img src="/creatorin/avatar.png" alt="" /><i /></span>
            <div><h2>{serviceCreator}</h2><p><b>Available for work</b><em>Follow</em><small>sobakhulmunir.creatorin.id</small><small>hello@sobakhulmunir.com</small></p></div>
          </Link>
          <div className="service-detail-actions">
            <button type="button" className={saved ? "is-saved" : ""} onClick={() => setSaved(!saved)} aria-label={saved ? "Hapus layanan dari tersimpan" : "Simpan layanan"}><Bookmark fill={saved ? "currentColor" : "none"} /></button>
            <Link href="/pesan">Diskusikan Layanan</Link>
          </div>
        </div>
      </header>

      <div className="service-detail-scroll">
        <main className="service-detail-main">
          <section className="service-gallery" aria-label="Galeri layanan">
            <div className="service-hero-image">
              <img src={activeImage.src} alt={activeImage.alt} />
              <button type="button" className="service-gallery-arrow service-gallery-arrow--prev" onClick={showPreviousImage} aria-label="Foto sebelumnya">&lsaquo;</button>
              <button type="button" className="service-gallery-arrow service-gallery-arrow--next" onClick={showNextImage} aria-label="Foto berikutnya">&rsaquo;</button>
              <span>{active + 1} / {gallery.length} Foto</span>
            </div>
            <div className="service-thumbnails">{gallery.map((image, index) => <button type="button" className={active === index ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Tampilkan foto ${index + 1}`} key={image.src}><img src={image.src} alt="" />{index === gallery.length - 1 && <b>+1</b>}</button>)}</div>
          </section>

          <section className="service-heading">
            <span>{serviceCategory}</span>
            <h1>{serviceTitle}</h1>
            <p>Pengerjaan aset kreatif profesional dengan jaminan kepatuhan brief bisnis, komunikasi aktif, dan penyelarasan kebutuhan proyek Anda.</p>
          </section>

          <section className="service-detail-metrics" aria-label="Ringkasan layanan">
            <MetricCard label="Harga Mulai" value={servicePrice} detail="/ paket referensi brief" icon={ReceiptText} />
            <MetricCard label="Waktu Pengerjaan" value={serviceTime} detail="Sesuai kesepakatan diskusi" icon={Clock3} />
            <MetricCard label="Jumlah Revisi" value="2x Revisi Gratis" detail="Penyempurnaan dan polesan" icon={RefreshCcw} />
          </section>

          <section className="service-detail-grid">
            <div>
              <h2>Hasil yang Akan Didapat</h2>
              <ul>{outcomes.map((item) => <li key={item}><span><Check /></span>{item}</li>)}</ul>
            </div>
            <div>
              <h2>Alur Pengerjaan</h2>
              <ol>{process.map((item) => <li key={item}>{item}</li>)}</ol>
            </div>
          </section>

          <div className="service-tags">{["#FramerBuild", "#WebsitePortfolio", "#CMSDevelopment", "#NoCode", "#Responsive", "#UMKMWebsite"].map((tag) => <span key={tag}>{tag}</span>)}</div>

          <section className="service-creator-summary">
            <img src="/creatorin/avatar.png" alt="" />
            <h2>{serviceCreator}</h2>
            <p>Solving problems, Framer and Product Designer. Kreator website yang fokus pada visual storytelling, struktur konversi, dan sistem brand komersial.</p>
            <div><Link href="/pesan">Kirim Pesan</Link><Link href="/profile/sobakhul-munir-siroj">Profil Kreator</Link></div>
            <footer><span><ShieldCheck /> Terverifikasi Creatorin</span><span><PackageCheck /> 48 proyek selesai</span></footer>
          </section>

          <section className="service-related">
            <header><h2>Layanan Serupa</h2><Link href="/jelajah/layanan">Lihat Banyak Lainnya <ChevronRight /></Link></header>
            <div>{related.map((item, index) => <RelatedCard title={item} index={index} key={item} />)}</div>
          </section>
        </main>

        <footer className="service-detail-footer">
          <div className="service-detail-footer-inner">
            <div className="service-footer-top"><Link className="brand brand--footer" href="/"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><div><span>Social Media</span><a href="#twitter" aria-label="X Twitter"><Twitter /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a></div></div>
            <div className="service-footer-body"><p>Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.</p><div>{["Jelajahi", "Untuk Bisnis", "Untuk Creator", "Bantuan"].map((title) => <section key={title}><h3>{title}</h3><a href="#top">Cari Creator</a><a href="#top">Layanan</a><a href="#top">Project</a><a href="#top">Hubungi Kami</a></section>)}</div></div>
            <div className="service-footer-word" aria-hidden="true">creatorin</div>
            <div className="service-footer-bottom"><span>&copy; 2026 Creatorin. All rights reserved.</span><nav><a href="#terms">Syarat & Ketentuan</a><a href="#privacy">Kebijakan Privasi</a><a href="#cookies">Cookie Policy</a></nav></div>
          </div>
        </footer>
      </div>
    </div>
  </div>;
}
