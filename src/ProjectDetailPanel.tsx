"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Info, MessageCircle, Play, Send, Share2, Volume2 } from "lucide-react";
import DetailSurface from "./DetailSurface";

const comments = [
  { name: "Mukhlasur Rahman", avatar: "/creatorin/comment-mukhlasur.png", body: "Impressive work!", time: "about 1 hour" },
  { name: "Bhautik Domadiya", avatar: "/creatorin/comment-bhautik.png", body: "Framing the main headline with that delicate script overlay gives this hero section such a high-end editorial feel! It balances modern luxury web design with Cartier's heritage so beautifully. Fantastic work, Halo UI/UX!", time: "about 1 hour" },
  { name: "Rifat Jahangir Ony", avatar: "/creatorin/comment-rifat.png", body: "superb work!", time: "about 3 hours" },
  { name: "Minu Vi", avatar: "/creatorin/comment-minu.png", body: "Cool font 👌", time: "about 4 hours" },
  { name: "Abdur Rouf ✪", avatar: "/creatorin/comment-abdur.png", body: "Professional and impressive design work ! Good job", time: "about 4 hours" },
];

type ProjectDetailPanelProps = {
  isModal?: boolean;
  isClosing?: boolean;
  onClose?: () => void;
  title?: string;
  creator?: string;
  views?: string;
};

function FloatingActions({ open, placement, setOpen }: { open: boolean; placement: "side" | "top"; setOpen: (open: boolean) => void }) {
  const sideHidden = open && placement === "side";
  return <div className={`project-floating project-floating--${placement}`} aria-hidden={sideHidden} aria-label="Project actions">
    <button className={open ? "project-float-button is-active" : "project-float-button"} type="button" onClick={() => setOpen(!open)} aria-label="Komentar" tabIndex={sideHidden ? -1 : undefined}><MessageCircle fill="currentColor" /><span className="project-comment-badge">23</span></button>
    <button className="project-float-button" type="button" aria-label="Bagikan" tabIndex={sideHidden ? -1 : undefined}><Share2 /></button>
    <button className="project-float-button" type="button" aria-label="Informasi" tabIndex={sideHidden ? -1 : undefined}><Info /></button>
  </div>;
}

function CommentDrawer() {
  return <div className="comment-drawer">
    <div className="comment-list">{comments.map((comment) => <article className="comment-item" key={comment.name}><img src={comment.avatar} alt="" /><div><h3>{comment.name}</h3><p>{comment.body}</p><time>{comment.time}</time></div></article>)}</div>
    <form className="comment-compose" onSubmit={(event) => event.preventDefault()}><input aria-label="Tulis komentar" placeholder="Tulis ulasan atau apresiasi..." /><button type="submit" aria-label="Kirim komentar"><Send /></button></form>
  </div>;
}

export default function ProjectDetailPanel({ isModal = false, isClosing = false, onClose, title, creator, views }: ProjectDetailPanelProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const related = Array.from({ length: 8 }, (_, index) => index);
  const heading = title || "POV: Simulasi Prewed Anak Gym (Humor UGC & Fitness Brand Placement)";
  const creatorHandle = creator || "@mayaangelina.ugc";
  const viewCount = views || "890.1K";
  return <DetailSurface kind="project" isModal={isModal} isClosing={isClosing} onClose={onClose} closeLabel="Tutup detail proyek" dialogLabel="Detail proyek" sheetClassName={commentsOpen ? "comments-open" : ""} header={
      <div className="project-detail-header-inner">
        <div className="project-author"><span className="project-author-avatar"><img src="/creatorin/maya-angelina.png" alt="" /><i /></span><div><h2>Maya Angelina</h2><div className="project-author-meta"><span className="project-status"><i />Available for work</span><span className="project-follow">Follow</span><span>mayaangelina.creatorin.id</span><span>inquiry@mayaangelina.com</span></div></div></div>
        <div className="project-actions"><button className="project-save" type="button" aria-label="Simpan project"><Heart /></button><Link className="project-message" href="/pesan">Kirim Pesan</Link></div>
      </div>
    } sheetAfter={<FloatingActions open={commentsOpen} placement="side" setOpen={setCommentsOpen} />}>
        <div className="project-body">
          <main className="project-content">
          <h1>{heading}</h1>
          <section className="project-video" aria-label="Video project">
            <img src="/creatorin/project-video-gym.png" alt="" /><button className="project-video-play" type="button" aria-label="Putar video"><Play fill="currentColor" /></button><span className="project-video-user">{creatorHandle}</span><span className="project-video-tag"><Play fill="currentColor" />Video Tiktok</span>
            <div className="project-video-controls"><button type="button" aria-label="Putar"><Play fill="currentColor" /></button><button type="button" aria-label="Volume"><Volume2 /></button><span className="project-progress"><i /></span><span className="project-views">{viewCount} views</span></div>
          </section>
          <div className="project-copy"><p>Bukannya pegangan tangan romantis, malah diajarin form deadlift yang bener 😭😂 Konten soft-selling pakaian olahraga & suplemen whey protein yang relate banget sama Gen-Z! Engagement rate: 14.8%!</p><p>Proyek ini diproduksi untuk memenuhi standar kampanye performa tinggi bagi UMKM dan brand digital di Indonesia, mengintegrasikan visual storytelling dan conversion heuristics.</p></div>
          <div className="project-tags">{["#AnakGym", "#POV", "#TikTokViral", "#FitnessUGC", "#RelateLucu", "#Royalti"].map((tag) => <span key={tag}>{tag}</span>)}</div>
          <section className="project-creator-card"><img src="/creatorin/maya-angelina.png" alt="" /><h2>Maya Angelina</h2><p>Kreator UGC, sketsa ringan, dan storytelling komersial yang siap dipakai untuk brand.</p><div><Link href="/pesan">Kirim Pesan</Link><Link href="/profile/maya-angelina">Buka Kreator</Link></div></section>
          <section className="related-projects"><header><h2>Proyek Serupa</h2><Link href="/jelajah/proyek">Lihat Proyek Lainnya</Link></header><div className="related-grid">{related.map((item) => <article className="related-card" key={item}><img src={item % 2 ? "/creatorin/project-related-2.png" : "/creatorin/project-related-1.png"} alt="" /><span><Play fill="currentColor" size={12} /></span><h3>Retail Promo Miniature Charry 60 Detik</h3><p><small>@mayaangelina.ugc</small><small>602.5K</small></p></article>)}</div></section>
          </main>
          <aside className="project-comments-rail" aria-label="Komentar project" aria-hidden={!commentsOpen}>
            <FloatingActions open={commentsOpen} placement="top" setOpen={setCommentsOpen} />
            <CommentDrawer />
          </aside>
        </div>
        <footer className="project-detail-footer"><div className="project-detail-footer-inner"><Link className="brand" href="/"><img src="/creatorin/logo.svg" alt="" /><span>Creatorin</span></Link><span>&copy; 2026 Creatorin. All rights reserved.</span></div></footer>
  </DetailSurface>;
}
