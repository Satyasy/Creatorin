import React from 'react';

export const AuthBanner: React.FC = () => {
  return (
    <aside
      className="hidden lg:flex lg:w-1/2 xl:w-[58%] h-screen p-3 sm:p-4 lg:p-5 select-none"
      aria-hidden="true"
    >
      <div className="relative w-full h-full rounded-[28px] lg:rounded-[32px] overflow-hidden flex flex-col justify-between p-8 lg:p-10 xl:p-12 bg-[linear-gradient(135deg,#1B5BF7_0%,#1A58F2_7%,#1955ED_14%,#1852E8_21%,#1750E3_29%,#164DDE_36%,#154AD9_43%,#1447D4_50%,#1343CA_57%,#113FC0_64%,#103BB7_71%,#0E37AD_79%,#0D34A4_86%,#0B309A_93%,#0A2C91_100%)] shadow-2xl">
        {/* Repeating pattern mask */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(/brand/bg-pattern.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '700px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%)',
          }}
        />

        {/* Ambient Glows from Figma */}
        <div className="absolute -top-32 -right-10 w-96 h-96 rounded-full bg-[#51A2FF]/25 blur-[64px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-28 w-96 h-96 rounded-full bg-[#615FFF]/30 blur-[64px] pointer-events-none" />
        <div className="absolute bottom-44 left-1/3 w-80 h-80 rounded-full bg-[#00D3F3]/15 blur-[64px] pointer-events-none" />

        {/* Top Header: Brand Logo & Wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/brand/figma-logo.svg"
            alt="Creatorin"
            className="w-10 h-9.5 lg:w-11 lg:h-10 object-contain drop-shadow"
          />
          <span className="font-display font-medium text-white text-2xl lg:text-[30px] tracking-tight">
            Creatorin
          </span>
        </div>

        {/* Bottom Headline */}
        <div className="relative z-10 pb-2">
          <h2 className="font-display font-medium text-white text-3xl sm:text-4xl lg:text-[44px] xl:text-[54px] leading-[1.1] tracking-[-0.02em] max-w-[700px] drop-shadow-sm">
            Temukan Talenta <span className="italic font-normal">Kreatif,</span>{' '}
            Wujudkan <span className="italic font-normal">Ide Digital.</span>
          </h2>
        </div>
      </div>
    </aside>
  );
};
