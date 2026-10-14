'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActivePage } from '@/types';
import { Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

interface FooterProps {
  onNavigate?: (page: ActivePage) => void;
  onOpenBrief?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBrief }) => {
  const router = useRouter();
  const { t } = useLanguage();

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="w-full relative overflow-hidden bg-white border-t border-[#E1E3EA] pt-12 sm:pt-16 pb-20 sm:pb-12 font-sans text-[#0D0C22]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Kolom Brand di Kiri & 4 Kolom Navigasi di Kanan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          {/* Sisi Kiri: Identitas Brand Creatorin, Deskripsi, Badge Keamanan & Social Media */}
          <div className="lg:col-span-4 lg:pr-6 space-y-4">
            
            {/* Logo Creatorin (Konsisten 100% dengan Navbar) */}
            <button
              id="footer-logo-btn"
              type="button"
              onClick={() => navigateTo('home', '/')}
              className="inline-flex items-center gap-2.5 group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] rounded-lg text-left"
              aria-label="Creatorin - Beranda"
            >
              <img
                src="/creatorin/logo.svg"
                alt=""
                className="h-8 w-[34px] shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
              />
              <span className="font-display font-bold text-[22px] leading-none tracking-tight text-[#0D0C22] group-hover:text-[#155DFC] transition-colors">
                Creatorin
              </span>
            </button>

            {/* Brand Mission & Tagline */}
            <p className="text-sm text-[#55576A] leading-relaxed max-w-sm">
              {t('footer.aboutDesc', 'Platform kolaborasi terpercaya antara kreator bertalenta dan bisnis di Indonesia. Bangun karya berdampak dengan kemudahan kolaborasi yang aman dan transparan.')}
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-xs font-medium text-[#8C8F9F] mb-2.5">
                {t('footer.socialMedia', 'Ikuti Media Sosial Kami')}
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Creatorin di X (Twitter)"
                  className="w-9 h-9 rounded-xl border border-[#E1E3EA] bg-[#F8F9FA] hover:bg-[#155DFC] text-[#55576A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Creatorin di Instagram"
                  className="w-9 h-9 rounded-xl border border-[#E1E3EA] bg-[#F8F9FA] hover:bg-[#155DFC] text-[#55576A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Creatorin di LinkedIn"
                  className="w-9 h-9 rounded-xl border border-[#E1E3EA] bg-[#F8F9FA] hover:bg-[#155DFC] text-[#55576A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Sisi Kanan: 4 Kolom Navigasi Terstruktur */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            
            {/* Kolom 1: Jelajahi */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0D0C22] mb-3.5">
                {t('footer.colExplore', 'Jelajahi')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[#55576A]">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('services', '/jelajah/layanan')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.creatorServices', 'Layanan Kreator')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('projects', '/jelajah/proyek')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.projectPortfolio', 'Portofolio Proyek')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('creator-profile' as any, '/jelajah/kreator')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.creatorProfiles', 'Direktori Kreator')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('briefs', '/briefs')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.projectBriefs', 'Brief Proyek')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/contracts')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.collaborationContracts', 'Kontrak Kolaborasi')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 2: Untuk Bisnis */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0D0C22] mb-3.5">
                {t('footer.colBusiness', 'Untuk Bisnis')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[#55576A]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenBrief) onOpenBrief();
                      else navigateTo('briefs', '/briefs');
                    }}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.startBrief', 'Pasang Brief')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('creator-profile' as any, '/jelajah/kreator')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.exploreCreators', 'Rekrut Kreator')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/wallet')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.walletPayment', 'Dompet & Pembayaran')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('home', '/')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.howItWorks', 'Cara Kerja')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Untuk Creator */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0D0C22] mb-3.5">
                {t('footer.colCreator', 'Untuk Kreator')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[#55576A]">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('explore', '/jelajah')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.explore', 'Jelajah Peluang')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('briefs', '/briefs')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.openBriefs', 'Lihat Brief Terbuka')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.manageProfile', 'Kelola Profil')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/wallet')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.withdrawEarnings', 'Tarik Penghasilan')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Bantuan & Legalitas */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0D0C22] mb-3.5">
                {t('footer.colHelp', 'Bantuan & Legal')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[#55576A]">
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/terms')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.terms', 'Syarat & Ketentuan')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => router.push('/privacy')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.privacy', 'Kebijakan Privasi')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('chat', '/chat')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.contactSupport', 'Hubungi Dukungan')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('home', '/')}
                    className="hover:text-[#155DFC] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    {t('footer.faq', 'FAQ & Panduan')}
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Official Ecosystem & Partner Endorsement Strip */}
        <div className="mt-14 pt-8 border-t border-[#E1E3EA] text-center">
          <p className="text-[11px] font-semibold text-[#55576A] uppercase tracking-wider mb-4">
            {t('footer.ecosystem', 'Didukung & Berkolaborasi Bersama Ekosistem Industri Digital Nasional')}
          </p>
          <div className="flex items-center justify-center">
            <img 
              src="/creatorin/partners.png" 
              alt="Didukung & Berkolaborasi Bersama: Jagoan Hosting, Komdigi, Maspion IT, Garuda Spark"
              className="max-h-9 sm:max-h-10 w-auto object-contain filter grayscale hover:grayscale-0 opacity-75 hover:opacity-100 transition-all duration-300"
            />
          </div>
        </div>

        {/* Bottom Bar: Copyright & Informasi Legal */}
        <div className="mt-8 pt-6 border-t border-[#E1E3EA] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#55576A]">
          <p className="font-medium text-center md:text-left">
            {t('footer.rights', '© 2026 Creatorin. Seluruh hak cipta dilindungi.')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium text-center">
            <button
              type="button"
              onClick={() => router.push('/terms')}
              className="hover:text-[#155DFC] transition-colors cursor-pointer"
            >
              {t('footer.terms', 'Syarat Layanan')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/privacy')}
              className="hover:text-[#155DFC] transition-colors cursor-pointer"
            >
              {t('footer.privacy', 'Kebijakan Privasi')}
            </button>
            <span className="text-[#8C8F9F] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('footer.tagline', 'Platform Kolaborasi Kreator Indonesia')}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
