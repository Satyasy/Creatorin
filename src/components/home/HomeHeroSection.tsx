'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface HomeHeroSectionProps {
  onExploreClick?: () => void;
  onSecondaryClick?: () => void;
  secondaryText?: string;
  secondaryHref?: string;
  badgeText?: string;
}

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  onExploreClick,
  onSecondaryClick,
  secondaryText = 'Buat Brief Proyek',
  secondaryHref = '/briefs',
  badgeText = 'Platform Kolaborasi Kreatif',
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-white border-b border-[#E1E3EA]">
      {/* Repeating Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage: 'url(/brand/bg-pattern.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '100% auto',
          backgroundPosition: 'top center',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Symmetrical Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] lg:w-[1100px] h-[360px] lg:h-[480px] rounded-full pointer-events-none blur-[64px]"
        style={{
          background:
            'linear-gradient(45deg, rgba(219, 234, 254, 0.45) 0%, rgba(238, 242, 255, 0.5) 50%, rgba(239, 246, 255, 0.6) 100%)',
        }}
      />

      {/* Central Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E1E3EA] shadow-xs mb-5 sm:mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#155DFC]" />
          <span className="text-xs sm:text-sm font-medium text-[#0D0C22]">
            {badgeText}
          </span>
        </div>

        {/* Symmetrical Headline */}
        <h1 className="max-w-[920px] mx-auto flex flex-col items-center text-center tracking-tight leading-[1.08]">
          <span className="font-display font-medium sm:font-semibold text-3xl sm:text-5xl md:text-6xl lg:text-[72px] text-[#0D0C22]">
            Temukan Talenta Kreatif
          </span>
          <span className="font-['Playfair_Display',serif] italic font-normal text-3xl sm:text-5xl md:text-6xl lg:text-[72px] text-[#0D0C22] mt-1 sm:mt-2">
            Wujudkan Ide Digital
          </span>
        </h1>

        {/* Paragraph */}
        <p className="mt-4 sm:mt-5 max-w-[690px] mx-auto text-sm sm:text-base lg:text-lg text-[#525252] leading-relaxed font-normal">
          Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.
        </p>

        {/* CTAs */}
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onExploreClick}
            className="inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[#155DFC] hover:bg-[#1248C7] active:bg-[#0E3A9E] text-white text-sm sm:text-[15px] font-medium shadow-[0px_4px_6px_-1px_rgba(21,93,252,0.25),0px_2px_4px_-1px_rgba(21,93,252,0.15)] transition-all group cursor-pointer"
          >
            <span>Jelajah Kreator</span>
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#155DFC] shadow-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </button>

          {onSecondaryClick ? (
            <button
              type="button"
              onClick={onSecondaryClick}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm sm:text-[15px] font-medium text-[#55576A] hover:text-[#0D0C22] hover:bg-neutral-100/70 transition-colors cursor-pointer"
            >
              {secondaryText}
            </button>
          ) : (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm sm:text-[15px] font-medium text-[#55576A] hover:text-[#0D0C22] hover:bg-neutral-100/70 transition-colors"
            >
              {secondaryText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
