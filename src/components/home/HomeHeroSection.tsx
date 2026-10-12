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
  secondaryText = 'Bergabung Creatorin',
  secondaryHref = '/briefs',
  badgeText = 'Platform Kolaborasi Kreatif',
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-white border-b border-[#E1E3EA] -mt-20 lg:-mt-20 pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20">
      {/* Symmetrical Ambient Soft-Blue Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] lg:w-[1100px] h-[360px] lg:h-[480px] rounded-full pointer-events-none blur-[80px]"
        style={{
          background:
            'linear-gradient(45deg, rgba(219, 234, 254, 0.45) 0%, rgba(238, 242, 255, 0.5) 50%, rgba(239, 246, 255, 0.55) 100%)',
        }}
      />

      {/* Crisp Geometric Square Grid Pattern (matching Figma 4816-18898 & user screenshot) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #E2E8F0 1px, transparent 1px),
            linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
          backgroundPosition: 'center top',
        }}
      />

      {/* Central Symmetrical Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white border border-[#E1E3EA] shadow-xs mb-5 sm:mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#0D0C22]" />
          <span className="text-xs sm:text-sm font-medium text-[#0D0C22]">
            {badgeText}
          </span>
        </div>

        {/* Symmetrical 2-Line Headline */}
        <h1 className="max-w-[960px] mx-auto flex flex-col items-center text-center tracking-[-0.035em] leading-[1.04]">
          <span className="font-display font-medium sm:font-semibold text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[88px] text-[#0A0A0A]">
            Temukan Talenta Kreatif
          </span>
          <span className="font-['Playfair_Display',serif] italic font-normal text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[88px] text-[#0A0A0A] mt-1 sm:mt-2">
            Wujudkan Ide Digital
          </span>
        </h1>

        {/* Paragraph */}
        <p className="mt-5 sm:mt-6 max-w-[620px] mx-auto text-sm sm:text-base lg:text-[17px] text-[#525252] leading-relaxed font-normal">
          Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.
        </p>

        {/* Symmetrical Action Buttons */}
        <div className="mt-8 sm:mt-9 flex items-center justify-center gap-5 sm:gap-6">
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
              className="inline-flex items-center justify-center text-sm sm:text-[15px] font-medium text-[#525252] hover:text-[#0D0C22] transition-colors cursor-pointer"
            >
              {secondaryText}
            </button>
          ) : (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center text-sm sm:text-[15px] font-medium text-[#525252] hover:text-[#0D0C22] transition-colors"
            >
              {secondaryText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
