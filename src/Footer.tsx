"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActivePage } from './types';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: ActivePage) => void;
  onOpenBrief?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBrief }) => {
  const router = useRouter();
  const navigate = (page: ActivePage) => {
    if (onNavigate) {
      onNavigate(page);
      return;
    }
    if (page === 'home' || page === 'landing') router.push('/');
    else if (page === 'services') router.push('/jelajah/layanan');
    else if (page === 'projects') router.push('/jelajah/proyek');
    else if (page === 'creators' || page === 'creator-profile') router.push('/jelajah/creator');
    else if (page === 'briefs') router.push('/brief');
    else if (page === 'chat') router.push('/pesan');
    else router.push('/');
  };
  return (
    <footer className="w-full bg-white border-t border-neutral-200/80 pt-12 sm:pt-16 pb-10 sm:pb-14 font-sans text-[#0d0c22]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar: Brand Logo di Kiri & Social Media di Kanan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-neutral-200/80">
          <div
            className="inline-flex items-center gap-1.5 cursor-pointer select-none group w-fit"
            onClick={() => navigate('home')}
          >
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0d0c22] font-sans group-hover:text-neutral-700 transition">
              Creatorin
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block -ml-0.5 mt-2"></span>
          </div>

          {/* Social Media (Icon X, Instagram, LinkedIn) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-neutral-500">Social Media</span>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-[#f8f8f9] hover:bg-neutral-100 hover:border-neutral-300 text-neutral-600 hover:text-[#0d0c22] flex items-center justify-center transition cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-[#f8f8f9] hover:bg-neutral-100 hover:border-neutral-300 text-neutral-600 hover:text-[#0d0c22] flex items-center justify-center transition cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl border border-neutral-200 bg-[#f8f8f9] hover:bg-neutral-100 hover:border-neutral-300 text-neutral-600 hover:text-[#0d0c22] flex items-center justify-center transition cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Middle Section: Area Brand & Deskripsi di Kiri, 4 Kolom Navigasi di Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mt-10 sm:mt-12">
          
          {/* Sisi Kiri: Deskripsi & Informasi Ringkas */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Tentang Platform</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-sm">
                Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak.
              </p>
            </div>
          </div>

          {/* Sisi Kanan: 4 Kolom Navigasi Terstruktur */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            
            {/* Kolom 1: Jelajahi */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d0c22] mb-4">Jelajahi</h4>
              <ul className="space-y-3 text-xs text-neutral-500 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('landing')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Cari Creator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('services')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Layanan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('projects')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Project
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('chat')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Collaboration Room
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 2: Untuk Bisnis */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d0c22] mb-4">Untuk Bisnis</h4>
              <ul className="space-y-3 text-xs text-neutral-500 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenBrief) onOpenBrief();
                      else navigate('briefs');
                    }}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Mulai Brief
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('landing')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Jelajahi Creator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('projects')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Kelola Project
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('home')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Cara Kerja
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Untuk Creator */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d0c22] mb-4">Untuk Creator</h4>
              <ul className="space-y-3 text-xs text-neutral-500 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('projects')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Bagikan Project
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('briefs')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Lihat Brief Project
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('creator-profile')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Portfolio
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('creator-profile')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Skor Rekam Jejak
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Bantuan */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d0c22] mb-4">Bantuan</h4>
              <ul className="space-y-3 text-xs text-neutral-500 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('home')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Pusat Bantuan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('home')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('chat')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Hubungi Kami
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('home')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Kebijakan & Privasi
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Elemen Visual Branding Creatorin di Bagian Bawah Menggunakan Font Sans (SF Pro) Sesuai Permintaan */}
        <div className="mt-14 sm:mt-20 pt-4 select-none pointer-events-none text-center overflow-hidden">
          <span className="block text-[14vw] sm:text-[13vw] lg:text-[12vw] font-black tracking-tighter text-neutral-200/70 leading-none font-sans -mb-6 sm:-mb-10 uppercase">
            creatorin
          </span>
        </div>

        {/* Bagian Bawah: Copyright & Informasi Tambahan */}
        <div className="pt-8 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p className="text-neutral-700 font-medium text-center sm:text-left">
            © 2026 Creatorin. All rights reserved.
          </p>

          <div className="flex items-center gap-5 sm:gap-6 text-xs text-neutral-500 font-medium">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-[#0d0c22] transition cursor-pointer"
            >
              Syarat & Ketentuan
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-[#0d0c22] transition cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-[#0d0c22] transition cursor-pointer"
            >
              Cookie Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
