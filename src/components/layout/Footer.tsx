'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActivePage } from '@/types';
import { Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: ActivePage) => void;
  onOpenBrief?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBrief }) => {
  const router = useRouter();

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="w-full relative overflow-hidden bg-white border-t border-neutral-200/80 pt-8 sm:pt-10 pb-8 sm:pb-10 font-sans text-[#0d0c22]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Top Bar: Brand Logo di Kiri & Social Media di Kanan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
          <div
            className="inline-flex items-center gap-1.5 cursor-pointer select-none group w-fit"
            onClick={() => navigateTo('home', '/')}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-6 sm:mt-8 relative">
          
          {/* Siluet Logo Creatorin di Sisi Kiri Footer (Di Belakang Kolom Tentang Platform) */}
          <div 
            className="absolute -left-14 sm:-left-10 -bottom-8 sm:-bottom-6 lg:-left-6 lg:top-2 w-[260px] h-[245px] sm:w-[320px] sm:h-[302px] lg:w-[360px] lg:h-[340px] pointer-events-none select-none z-0 opacity-18 hover:opacity-24 transition-all duration-700 ease-in-out"
            aria-hidden="true"
          >
            {/* Ambient soft glow */}
            <div className="absolute inset-4 bg-gradient-to-tr from-[#03ACFD]/20 to-[#155DFC]/22 rounded-full blur-3xl pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />

            {/* Exact Vector Silhouette from /creatorin/logo.svg */}
            <svg 
              className="w-full h-full drop-shadow-[0_8px_20px_rgba(21,93,252,0.12)]"
              preserveAspectRatio="xMidYMid meet" 
              viewBox="0 0 34.0608 32.0987" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="footerSilhouetteGrad" x1="0" y1="0" x2="34.0946" y2="32.0625" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#03ACFD" />
                  <stop offset="100%" stopColor="#155DFC" />
                </linearGradient>
              </defs>
              <g id="FooterSilhouetteGroup">
                <path 
                  d="M14.6734 0.0488397C18.7039 -0.282822 23.0405 1.08602 26.0613 3.81028C26.5593 4.25946 27.6061 5.08781 27.6893 5.75197C27.4144 6.16801 23.2771 9.3333 22.6847 9.63686C22.3105 9.68873 21.1521 8.52521 20.7703 8.27595C18.4935 6.78937 15.5157 6.44004 12.9225 7.2802C10.6474 8.03042 8.75853 9.64478 7.66348 11.7749C6.53453 14.0432 6.34872 16.6657 7.14658 19.0704C8.95844 24.552 15.4014 26.8895 20.3742 24.0882C20.973 23.7509 21.9305 22.8136 22.4582 22.6384C22.9989 22.6663 23.5835 23.2309 24.0215 23.5793C24.5722 23.9612 27.473 26.1816 27.5847 26.6874C27.5058 26.9069 27.3749 27.1226 27.2159 27.2925C24.5564 30.1343 20.9762 31.7154 17.1923 32.0416C13.0028 32.3977 8.84287 31.0799 5.62316 28.3767C2.3748 25.6087 0.369138 21.6568 0.0529795 17.4017C-0.2919 13.1385 1.05699 8.91102 3.80765 5.63477C6.63166 2.2969 10.3192 0.409821 14.6734 0.0488397Z" 
                  fill="url(#footerSilhouetteGrad)"
                />
                <path 
                  d="M32.6835 8.85233C33.6489 8.76102 34.0639 9.38588 34.0608 10.2843C34.0475 14.1416 34.058 17.9999 34.055 21.8571C34.0548 22.1165 34.0134 22.5461 33.9078 22.7814C33.7895 23.0436 33.5727 23.2488 33.3042 23.3524C33.1384 23.4162 32.8513 23.4493 32.694 23.3928C31.0498 22.8015 29.2454 21.876 27.6298 21.1666C26.5103 20.6598 25.306 20.1396 24.2207 19.5768C25.1105 16.9299 24.9622 15.2492 24.2082 12.6704C25.2979 11.9441 28.0197 10.9228 29.3051 10.3275C30.2018 9.91205 31.7883 9.15612 32.6835 8.85233Z" 
                  fill="url(#footerSilhouetteGrad)"
                />
                <path 
                  d="M15.5208 11.5434L15.718 11.6074C15.8182 11.6933 16.5366 13.4837 16.5753 13.6856C16.8702 15.2244 19.6345 15.347 19.9995 16.1661C19.7267 16.6701 18.1637 16.709 17.2472 17.6616C16.1409 18.8114 16.3239 19.854 15.7305 20.7154C14.9942 20.2653 15.0904 18.5706 14.1839 17.6671C13.4863 16.9718 11.4852 16.6321 11.3551 16.0757C11.604 15.6531 12.6313 15.4483 13.1556 15.2045C14.9666 14.3626 14.9254 13.1063 15.5208 11.5434Z" 
                  fill="url(#footerSilhouetteGrad)"
                />
              </g>
            </svg>
          </div>

          {/* Sisi Kiri: Deskripsi & Informasi Ringkas */}
          <div className="lg:col-span-4 space-y-4 relative z-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Tentang Platform</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-sm">
                Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak dengan perlindungan pembayaran escrow terpercaya.
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
                    onClick={() => navigateTo('services', '/jelajah/layanan')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Layanan Kreator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('projects', '/jelajah/proyek')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Portofolio Project
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('creator-profile' as any, '/jelajah/kreator')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Profil Kreator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('briefs', '/briefs')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Brief Proyek
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/contracts')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Kontrak Kolaborasi
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
                      else navigateTo('briefs', '/briefs');
                    }}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Mulai Brief
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('creator-profile' as any, '/jelajah/kreator')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Jelajahi Kreator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/wallet')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Dompet & Pembayaran
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('home', '/')}
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
                    onClick={() => navigateTo('explore', '/explore')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Explore Komunitas
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('briefs', '/briefs')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Lihat Brief Terbuka
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Kelola Profil
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/wallet')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Tarik Penghasilan
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Bantuan & Kebijakan */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d0c22] mb-4">Bantuan & Legal</h4>
              <ul className="space-y-3 text-xs text-neutral-500 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/terms')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Syarat & Ketentuan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/privacy')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Kebijakan Privasi
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('chat', '/chat')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    Hubungi Dukungan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('home', '/')}
                    className="hover:text-[#0d0c22] transition cursor-pointer text-left"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Official Ecosystem & Partner Endorsement Strip */}
        <div className="mt-8 pt-6 pb-2 border-t border-neutral-200/80 text-center">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
            Didukung & Berkolaborasi Bersama Ekosistem Industri Digital Nasional
          </p>
          <div className="flex items-center justify-center">
            <img 
              src="/creatorin/partners.png" 
              alt="Didukung & Berkolaborasi Bersama: Jagoan Hosting, Komdigi, Maspion IT, Garuda Spark"
              className="max-h-10 sm:max-h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all opacity-85 hover:opacity-100 duration-300"
            />
          </div>
        </div>

        {/* Bagian Bawah: Copyright & Informasi Tambahan */}
        <div className="pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p className="text-neutral-700 font-medium text-center sm:text-left">
            © 2026 Creatorin. All rights reserved.
          </p>

          <div className="flex items-center gap-5 sm:gap-6 text-xs text-neutral-500 font-medium">
            <button
              type="button"
              onClick={() => router.push('/terms')}
              className="hover:text-[#0d0c22] transition cursor-pointer"
            >
              Syarat Layanan
            </button>
            <button
              type="button"
              onClick={() => router.push('/privacy')}
              className="hover:text-[#0d0c22] transition cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <span className="text-neutral-400">
              Platform Kolaborasi Kreator & Bisnis Indonesia
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
