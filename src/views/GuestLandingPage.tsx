'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { ProjectCard } from '@/components/common/ProjectCard';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { FeedProject } from '@/types';
import dynamic from 'next/dynamic';
import { 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  ChevronRight, 
  FileCheck, 
  RefreshCw, 
  Zap, 
  Sparkles,
  Star,
  Users,
  FolderCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  GitCommit,
  Layers,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';

const ProjectDetailModal = dynamic(
  () => import('@/components/modals/ProjectDetailModal').then((mod) => mod.ProjectDetailModal),
  { ssr: false }
);

// Reusable Exact Vector Silhouette of Creatorin Logo (Matching HomePage & Footer)
const CreatorinSilhouette: React.FC<{ 
  className?: string; 
  id?: string;
  opacity?: string;
  parallaxStyle?: React.CSSProperties;
}> = ({ 
  className = "w-72 h-72", 
  id = "silGrad",
  opacity = "opacity-20",
  parallaxStyle
}) => (
  <div 
    className={`pointer-events-none select-none relative transition-transform duration-100 ease-out will-change-transform ${className}`} 
    style={parallaxStyle}
    aria-hidden="true"
  >
    {/* Ambient radial glow */}
    <div className="absolute inset-4 bg-gradient-to-tr from-[#03ACFD]/20 to-[#155DFC]/22 rounded-full blur-3xl pointer-events-none" />
    <svg 
      className={`w-full h-full drop-shadow-[0_8px_24px_rgba(21,93,252,0.12)] ${opacity} transition-opacity duration-300`} 
      preserveAspectRatio="xMidYMid meet" 
      viewBox="0 0 34.0608 32.0987" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="34.0946" y2="32.0625" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#03ACFD" />
          <stop offset="100%" stopColor="#155DFC" />
        </linearGradient>
      </defs>
      <g>
        <path 
          d="M14.6734 0.0488397C18.7039 -0.282822 23.0405 1.08602 26.0613 3.81028C26.5593 4.25946 27.6061 5.08781 27.6893 5.75197C27.4144 6.16801 23.2771 9.3333 22.6847 9.63686C22.3105 9.68873 21.1521 8.52521 20.7703 8.27595C18.4935 6.78937 15.5157 6.44004 12.9225 7.2802C10.6474 8.03042 8.75853 9.64478 7.66348 11.7749C6.53453 14.0432 6.34872 16.6657 7.14658 19.0704C8.95844 24.552 15.4014 26.8895 20.3742 24.0882C20.973 23.7509 21.9305 22.8136 22.4582 22.6384C22.9989 22.6663 23.5835 23.2309 24.0215 23.5793C24.5722 23.9612 27.473 26.1816 27.5847 26.6874C27.5058 26.9069 27.3749 27.1226 27.2159 27.2925C24.5564 30.1343 20.9762 31.7154 17.1923 32.0416C13.0028 32.3977 8.84287 31.0799 5.62316 28.3767C2.3748 25.6087 0.369138 21.6568 0.0529795 17.4017C-0.2919 13.1385 1.05699 8.91102 3.80765 5.63477C6.63166 2.2969 10.3192 0.409821 14.6734 0.0488397Z" 
          fill={`url(#${id})`}
        />
        <path 
          d="M32.6835 8.85233C33.6489 8.76102 34.0639 9.38588 34.0608 10.2843C34.0475 14.1416 34.058 17.9999 34.055 21.8571C34.0548 22.1165 34.0134 22.5461 33.9078 22.7814C33.7895 23.0436 33.5727 23.2488 33.3042 23.3524C33.1384 23.4162 32.8513 23.4493 32.694 23.3928C31.0498 22.8015 29.2454 21.876 27.6298 21.1666C26.5103 20.6598 25.306 20.1396 24.2207 19.5768C25.1105 16.9299 24.9622 15.2492 24.2082 12.6704C25.2979 11.9441 28.0197 10.9228 29.3051 10.3275C30.2018 9.91205 31.7883 9.15612 32.6835 8.85233Z" 
          fill={`url(#${id})`}
        />
        <path 
          d="M15.5208 11.5434L15.718 11.6074C15.8182 11.6933 16.5366 13.4837 16.5753 13.6856C16.8702 15.2244 19.6345 15.347 19.9995 16.1661C19.7267 16.6701 18.1637 16.709 17.2472 17.6616C16.1409 18.8114 16.3239 19.854 15.7305 20.7154C14.9942 20.2653 15.0904 18.5706 14.1839 17.6671C13.4863 16.9718 11.4852 16.6321 11.3551 16.0757C11.604 15.6531 12.6313 15.4483 13.1556 15.2045C14.9666 14.3626 14.9254 13.1063 15.5208 11.5434Z" 
          fill={`url(#${id})`}
        />
      </g>
    </svg>
  </div>
);

// Pure Transparent Vector SVG Logos of Leading Digital Brands
interface BrandLogoItem {
  id: string;
  name: string;
  svg: React.ReactNode;
  heightClass?: string;
}

const TOP_DIGITAL_BRAND_LOGOS: BrandLogoItem[] = [
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 140 32" fill="none">
        <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm-4.5 9.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm9 0a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" fill="#03AC0E"/>
        <path d="M42 22h-3.2v-9.5H35V9.7h10.2v2.8h-3.2V22zm9.3.2c-3.5 0-5.8-2.3-5.8-6.3s2.3-6.3 5.8-6.3 5.8 2.3 5.8 6.3-2.3 6.3-5.8 6.3zm0-2.8c1.7 0 2.7-1.4 2.7-3.5s-1-3.5-2.7-3.5-2.7 1.4-2.7 3.5 1 3.5 2.7 3.5zm13.1 2.6l-4.1-5.6v5.6h-3.1V5.5h3.1v8.8l3.9-4.6h3.8l-4.7 5.3 5 7h-3.9zm9.3.2c-3.5 0-5.8-2.3-5.8-6.3s2.3-6.3 5.8-6.3 5.8 2.3 5.8 6.3-2.3 6.3-5.8 6.3zm0-2.8c1.7 0 2.7-1.4 2.7-3.5s-1-3.5-2.7-3.5-2.7 1.4-2.7 3.5 1 3.5 2.7 3.5zm12.9 2.6v-2.1c-.7 1.5-2.3 2.3-4.1 2.3-3.1 0-5.3-2.2-5.3-6.2 0-4 2.2-6.2 5.3-6.2 1.8 0 3.3.8 4.1 2.3V5.5h3.1V22h-3.1zm-3.9-2.7c1.7 0 2.8-1.3 2.8-3.5s-1.1-3.5-2.8-3.5-2.7 1.3-2.7 3.5 1 3.5 2.7 3.5zm15.4 2.7h-3.1V9.7h3.1V22zm0-14.2h-3.1V5.2h3.1v2.6zm10.7 14.4c-1.8 0-3.3-.8-4-2.2v2h-3.1V9.7h3.1v2.1c.7-1.4 2.2-2.2 4-2.2 3.1 0 5.4 2.2 5.4 6.2s-2.3 6.4-5.4 6.4zm-.8-2.7c1.7 0 2.8-1.3 2.8-3.5s-1.1-3.5-2.8-3.5-2.8 1.3-2.8 3.5 1.1 3.5 2.8 3.5z" fill="#222222"/>
      </svg>
    )
  },
  {
    id: 'gojek',
    name: 'Gojek',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 115 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="#00AA13"/>
        <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
        <path d="M42 22.4c-4.4 0-7.3-3-7.3-7.5s2.9-7.5 7.3-7.5c3.8 0 6.3 2.3 6.9 5.8h-3.4c-.5-1.8-1.8-2.9-3.5-2.9-2.4 0-4 1.8-4 4.6s1.6 4.6 4 4.6c1.8 0 3.1-1.1 3.5-2.8h-3.5v-2.8h6.8v8.7h-3.2v-1.6c-.9 1-2.1 1.4-3.6 1.4zm16.5 0c-4.3 0-7.2-3.1-7.2-7.5s2.9-7.5 7.2-7.5 7.2 3.1 7.2 7.5-2.9 7.5-7.2 7.5zm0-3c2.4 0 3.9-1.9 3.9-4.5s-1.5-4.5-3.9-4.5-3.9 1.9-3.9 4.5 1.5 4.5 3.9 4.5zm11.9 8.2c-3.1 0-5.1-1.4-5.6-3.8h3.3c.3 1 1.2 1.5 2.3 1.5 1.5 0 2.5-.9 2.5-2.5V7.7h3.3v14.8c0 3.2-2.2 5.1-5.8 5.1zm4.7-22.8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm16.1 14.6c-4.3 0-7.1-3.1-7.1-7.5s2.9-7.5 7.1-7.5c4.1 0 6.9 3 6.9 7.4v.9h-10.7c.2 2.3 1.8 3.8 4 3.8 1.7 0 3-1 3.5-2.2h3.3c-.7 3.1-3.2 5.1-7 5.1zm-3.8-8.2h7.4c-.2-2.1-1.7-3.4-3.7-3.4-2 0-3.5 1.3-3.7 3.4zm18.3 8h-3.3V2.4h3.3v10.3l4.6-5h4.1l-5.3 5.4 5.7 9.3h-4l-4.1-6.9-1.3 1.3V22.4z" fill="#111111"/>
      </svg>
    )
  },
  {
    id: 'shopee',
    name: 'Shopee',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 120 32" fill="none">
        <path d="M14 3a6 6 0 00-6 6v2H5a2 2 0 00-2 2l2 16a2 2 0 002 2h14a2 2 0 002-2l2-16a2 2 0 00-2-2h-3v-2a6 6 0 00-6-6zm-3.5 8a3.5 3.5 0 017 0v2h-7v-2z" fill="#EE4D2D"/>
        <path d="M42 19.8c.8.6 1.9 1 3.1 1 1.8 0 2.8-.9 2.8-2.1 0-3.3-6.1-2-6.1-6.7 0-2.4 2-4.1 5.3-4.1 1.4 0 2.7.4 3.7 1.1l-1 2.3c-.7-.5-1.6-.9-2.7-.9-1.5 0-2.4.8-2.4 1.8 0 3.2 6.1 1.9 6.1 6.8 0 2.5-2 4.2-5.7 4.2-1.6 0-3.2-.5-4.3-1.3l1.2-2.1zm12.3 2.4V4.5h2.9v6.8c.9-1.1 2.2-1.6 3.7-1.6 2.8 0 4.7 2 4.7 5.5v7h-2.9v-6.6c0-2-1.1-3.2-2.7-3.2-1.6 0-2.8 1.2-2.8 3.2v6.6h-2.9zm17.9.2c-4 0-6.8-3-6.8-7.3s2.8-7.3 6.8-7.3 6.8 3 6.8 7.3-2.8 7.3-6.8 7.3zm0-2.6c2.3 0 3.8-1.9 3.8-4.7s-1.5-4.7-3.8-4.7-3.8 1.9-3.8 4.7 1.5 4.7 3.8 4.7zm11.7 8v-17h2.8v2c.9-1.4 2.4-2.2 4.1-2.2 3.3 0 5.6 2.6 5.6 7.2s-2.3 7.2-5.6 7.2c-1.7 0-3.2-.8-4.1-2.2v5h-2.8zm6.5-5.2c2.2 0 3.6-1.8 3.6-4.6s-1.4-4.6-3.6-4.6-3.6 1.8-3.6 4.6 1.4 4.6 3.6 4.6zm13.7.2c-3.9 0-6.6-2.9-6.6-7.2s2.7-7.2 6.6-7.2c3.9 0 6.5 2.8 6.5 7.1v.9h-10.2c.2 2.3 1.8 3.8 4 3.8 1.6 0 2.9-.8 3.4-2.1l2.6 1c-.8 2.4-3.1 3.7-6.3 3.7zm-3.7-7.8h7.2c-.2-2-1.6-3.3-3.5-3.3-1.9 0-3.4 1.3-3.7 3.3zm15.7 7.8c-3.9 0-6.6-2.9-6.6-7.2s2.7-7.2 6.6-7.2c3.9 0 6.5 2.8 6.5 7.1v.9h-10.2c.2 2.3 1.8 3.8 4 3.8 1.6 0 2.9-.8 3.4-2.1l2.6 1c-.8 2.4-3.1 3.7-6.3 3.7zm-3.7-7.8h7.2c-.2-2-1.6-3.3-3.5-3.3-1.9 0-3.4 1.3-3.7 3.3z" fill="#222222"/>
      </svg>
    )
  },
  {
    id: 'grab',
    name: 'Grab',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 100 32" fill="none">
        <path d="M7 16c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="#00B14F" strokeWidth="3" fill="none"/>
        <path d="M12.5 16c0-2 1.8-3.5 3.5-3.5s3.5 1.5 3.5 3.5-1.5 3.5-3.5 3.5" stroke="#00B14F" strokeWidth="2.5" fill="none"/>
        <path d="M40 21.5c-3.6 0-6-2.6-6-6.5s2.4-6.5 6-6.5c3.2 0 5.4 1.9 5.8 4.7h-2.9c-.3-1.4-1.4-2.3-2.9-2.3-2 0-3.2 1.6-3.2 4.1s1.2 4.1 3.2 4.1c1.5 0 2.6-.9 2.9-2.3h-2.9v-2.3h5.6v7.3H43v-1.3c-.8.8-1.8 1.3-3 1.3zm12.5 0v-9.3h2.6v1.6c.6-1.1 1.7-1.8 3-1.8.4 0 .7 0 1 .2v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.7 1.2-2.7 3v4h-2.7zm15.4.2c-1.5 0-2.8-.7-3.4-1.8v1.6h-2.6v-9.3h2.6v1.6c.6-1.1 1.9-1.8 3.4-1.8 2.8 0 4.8 2.2 4.8 5s-2 4.7-4.8 4.7zm-.6-2.4c1.7 0 2.8-1.4 2.8-3.2s-1.1-3.2-2.8-3.2-2.8 1.4-2.8 3.2 1.1 3.2 2.8 3.2zm14.3 2.2v-1.6c-.7 1.1-2 1.8-3.5 1.8-2.7 0-4.7-2.1-4.7-5s2-5 4.7-5c1.5 0 2.8.7 3.5 1.8V4.5h2.7v17h-2.7zm-2.8-2.4c1.7 0 2.8-1.4 2.8-3.2s-1.1-3.2-2.8-3.2-2.8 1.4-2.8 3.2 1.1 3.2 2.8 3.2z" fill="#00B14F"/>
      </svg>
    )
  },
  {
    id: 'traveloka',
    name: 'Traveloka',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 130 28" fill="none">
        <path d="M14 4c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S19.5 4 14 4zm-1 5.5l7 4.5-7 4.5V9.5z" fill="#0194F3"/>
        <path d="M37 20h-2.7v-9H31V8.5h9.3V11h-3.3V20zm8.3 0v-8.2h2.4v1.4c.5-1 1.6-1.6 2.7-1.6.4 0 .7 0 1 .1v2.5c-.4-.1-.7-.1-1-.1-1.5 0-2.4 1-2.4 2.7V20h-2.7zm13.7.2c-1.3 0-2.5-.6-3-1.6v1.4h-2.4v-8.2h2.4v1.4c.5-1 1.7-1.6 3-1.6 2.5 0 4.3 1.9 4.3 4.4s-1.8 4.6-4.3 4.6zm-.5-2.2c1.4 0 2.4-1.1 2.4-2.5s-1-2.5-2.4-2.5-2.4 1.1-2.4 2.5 1 2.5 2.4 2.5zm11.3 2.2l-3.8-8.2h2.8l2.3 5.4 2.3-5.4h2.7L70.3 20h-2.7zm14.6.2c-3.4 0-5.7-2.5-5.7-6.2 0-3.7 2.3-6.2 5.7-6.2 3.4 0 5.6 2.4 5.6 6.1v.7h-8.8c.2 2 1.6 3.2 3.4 3.2 1.4 0 2.5-.7 2.9-1.8l2.3.9c-.8 2-2.7 3.3-5.4 3.3zm-3.2-6.7h6.2c-.2-1.7-1.4-2.8-3-2.8-1.6 0-2.9 1.1-3.2 2.8zm11.5 6.5V3.8h2.6V20h-2.6zm10.7.2c-3.5 0-5.8-2.5-5.8-6.2s2.3-6.2 5.8-6.2 5.8 2.5 5.8 6.2-2.3 6.2-5.8 6.2zm0-2.3c1.9 0 3.2-1.6 3.2-3.9s-1.3-3.9-3.2-3.9-3.2 1.6-3.2 3.9 1.3 3.9 3.2 3.9zm13.1 2.1l-3.5-4.8v4.8h-2.6V3.8h2.6v9.4l3.4-3.9h3.3l-4.1 4.5 4.3 6.2h-3.4zm10.3.2c-1.3 0-2.5-.6-3-1.6v1.4h-2.4v-8.2h2.4v1.4c.5-1 1.7-1.6 3-1.6 2.5 0 4.3 1.9 4.3 4.4s-1.8 4.6-4.3 4.6zm-.5-2.2c1.4 0 2.4-1.1 2.4-2.5s-1-2.5-2.4-2.5-2.4 1.1-2.4 2.5 1 2.5 2.4 2.5z" fill="#111111"/>
      </svg>
    )
  },
  {
    id: 'spotify',
    name: 'Spotify',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 110 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="#1DB954"/>
        <path d="M10 13c4-1 9-.8 13 1M11 16.5c3-.8 7-.6 10 1M12 20c2.5-.6 5.5-.5 8 .8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        <path d="M38 19.8c.8.6 1.8 1 2.9 1 1.7 0 2.6-.9 2.6-2 0-3.1-5.8-1.9-5.8-6.4 0-2.3 1.9-4 5-4 1.3 0 2.5.4 3.5 1l-1 2.2c-.7-.5-1.5-.9-2.5-.9-1.4 0-2.3.8-2.3 1.7 0 3.1 5.8 1.8 5.8 6.5 0 2.4-1.9 4-5.4 4-1.5 0-3-.5-4.1-1.2l1.3-1.9zm13.1 2.4v-2c-.8 1.4-2.2 2.2-3.8 2.2-3.1 0-5.2-2.5-5.2-6.8s2.1-6.8 5.2-6.8c1.6 0 3 .8 3.8 2.2V4.8h2.6V22h-2.6zm-3.6-2.2c1.8 0 3.1-1.4 3.1-3.6s-1.3-3.6-3.1-3.6-3 1.4-3 3.6 1.2 3.6 3 3.6zm13.8 2.4c-3.3 0-5.5-2.4-5.5-6.8s2.2-6.8 5.5-6.8 5.5 2.4 5.5 6.8-2.2 6.8-5.5 6.8zm0-2.2c1.8 0 3-1.5 3-4.6s-1.2-4.6-3-4.6-3 1.5-3 4.6 1.2 4.6 3 4.6zm12.3 2.2h-2.6V11.2h-2.1V9h2.1V6.2h2.6V9h3.2v2.2h-3.2v8.6c0 1.2.6 1.8 1.7 1.8.5 0 1-.1 1.4-.3v2.2c-.6.3-1.4.5-2.2.5zm5.8 0h-2.6V9h2.6v13zm0-15.6h-2.6V4h2.6v2.8zm8.6 15.8c-1.8 0-3.3-.8-4.2-2.1V22h-2.6V9h2.6v2.1c.9-1.3 2.4-2.1 4.2-2.1.6 0 1.1.1 1.6.3l-.7 2.4c-.4-.2-.9-.3-1.4-.3-1.8 0-3.2 1.4-3.2 3.7V22h-2.6zm10.7-3.6l4 10.4h-2.8l-1.3-3.6h-4.8l-1.3 3.6h-2.8l4-10.4h2.4v-4.8h2.6v4.8z" fill="#111111"/>
      </svg>
    )
  },
  {
    id: 'blibli',
    name: 'Blibli',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 100 32" fill="none">
        <rect x="4" y="6" width="20" height="20" rx="5" fill="#0095DA"/>
        <circle cx="14" cy="16" r="4.5" fill="#FFFFFF"/>
        <path d="M36 22V6h3.2v6.6c.9-1.2 2.3-1.8 3.9-1.8 3.1 0 5.4 2.3 5.4 5.6s-2.3 5.6-5.4 5.6c-1.6 0-3-.6-3.9-1.8V22H36zm4.8-2.6c2 0 3.5-1.5 3.5-3.6s-1.5-3.6-3.5-3.6-3.4 1.5-3.4 3.6 1.4 3.6 3.4 3.6zm12.3 2.6V6h3.2V22h-3.2zm6.7 0V11h3.2V22h-3.2zm0-13.6V5.8h3.2v2.6h-3.2zm7.7 13.6V6h3.2v6.6c.9-1.2 2.3-1.8 3.9-1.8 3.1 0 5.4 2.3 5.4 5.6s-2.3 5.6-5.4 5.6c-1.6 0-3-.6-3.9-1.8V22h-3.2zm4.8-2.6c2 0 3.5-1.5 3.5-3.6s-1.5-3.6-3.5-3.6-3.4 1.5-3.4 3.6 1.4 3.6 3.4 3.6zm12.3 2.6V6h3.2V22h-3.2zm6.7 0V11h3.2V22h-3.2zm0-13.6V5.8h3.2v2.6h-3.2z" fill="#0095DA"/>
      </svg>
    )
  },
  {
    id: 'tiket',
    name: 'Tiket.com',
    heightClass: 'h-6 sm:h-7',
    svg: (
      <svg className="h-6 sm:h-7 w-auto" viewBox="0 0 115 28" fill="none">
        <circle cx="12" cy="14" r="10" fill="#FEDD00"/>
        <circle cx="12" cy="14" r="5" fill="#0064D2"/>
        <path d="M33 21h-2.5v-8.8H28v-2.3h7.5v2.3h-2.5V21zm5.7 0v-8.8h2.5V21h-2.5zm0-11V7.7h2.5V10h-2.5zm7.3 11l-3.2-5v5h-2.5V5.5h2.5v9.8l3.1-4.2h3.1l-3.7 4.7 4 5.2h-3.3zm9.6.2c-3 0-5.1-2.2-5.1-5.7s2.1-5.7 5.1-5.7c3 0 5 2.1 5 5.5v.7h-7.6c.2 1.8 1.4 2.9 3 2.9 1.2 0 2.2-.6 2.6-1.6l2.1.8c-.8 1.8-2.4 3.1-5.1 3.1zm-2.6-6.1h5.1c-.2-1.5-1.2-2.5-2.5-2.5-1.3 0-2.4 1-2.6 2.5zm10.7 5.9h-2.5V12.2h-1.8v-2.1h1.8V7.8h2.5v2.3h2.8v2.1h-2.8v6.8c0 .9.4 1.4 1.3 1.4.4 0 .8-.1 1.1-.2v2c-.5.3-1.1.4-1.9.4zm8 0c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6zm8.8.2c-3.1 0-5.3-2.3-5.3-5.7s2.2-5.7 5.3-5.7c2.8 0 4.7 1.8 5.1 4.3h-2.5c-.3-1.3-1.3-2.1-2.6-2.1-1.7 0-2.8 1.4-2.8 3.5s1.1 3.5 2.8 3.5c1.3 0 2.3-.8 2.6-2.1h2.5c-.4 2.5-2.3 4.3-5.1 4.3zm12.3 0c-3.2 0-5.4-2.4-5.4-5.7s2.2-5.7 5.4-5.7 5.4 2.4 5.4 5.7-2.2 5.7-5.4 5.7zm0-2.2c1.7 0 2.9-1.5 2.9-3.5s-1.2-3.5-2.9-3.5-2.9 1.5-2.9 3.5 1.2 3.5 2.9 3.5zm15.7 2.2v-8.8h2.4v1.3c.7-1 1.8-1.5 3-1.5 1.5 0 2.7.7 3.3 1.9.8-1.2 2-1.9 3.5-1.9 2.2 0 3.9 1.5 3.9 4.3V21h-2.5v-6.5c0-1.6-.8-2.3-2-2.3-1.2 0-2.1.8-2.1 2.3V21h-2.5v-6.5c0-1.6-.8-2.3-2-2.3-1.2 0-2.1.8-2.1 2.3V21h-2.5z" fill="#0064D2"/>
      </svg>
    )
  }
];

export const GuestLandingPage = () => {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);

  // Parallax Scroll Tracking with requestAnimationFrame
  const [scrollY, setScrollY] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check reduced motion preference for accessibility
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Responsive mobile breakpoint check
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // High performance 60fps scroll throttling with requestAnimationFrame
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Showcase 4 curated projects for guests
  const displayProjects = MOCK_FEED_PROJECTS.slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Full-Width, Siluet Parallax & Fade-in Masuk)             */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-20 sm:pt-28 pb-16 sm:pb-24 overflow-hidden border-b border-zinc-200/80 bg-white">
        
        {/* Subtle Architectural Grid Lines with Subtle Parallax */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-transform duration-75 ease-out will-change-transform"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(228, 228, 231, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(228, 228, 231, 0.4) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 90%)',
            transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * 0.05, 30)}px, 0)`
          }}
        />

        {/* Creatorin Logo Silhouette in Hero Background with Scroll Parallax */}
        <div className="absolute right-2 -bottom-10 sm:right-8 sm:-bottom-8 md:right-16 md:-bottom-4 w-[280px] h-[264px] sm:w-[380px] sm:h-[358px] md:w-[480px] md:h-[450px] pointer-events-none z-0">
          <CreatorinSilhouette 
            id="heroSilGrad" 
            className="w-full h-full" 
            opacity="opacity-22" 
            parallaxStyle={{
              transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * (isMobile ? 0.10 : 0.22), 95)}px, 0) scale(${1 + Math.min(scrollY * 0.00015, 0.03)})`
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          
          {/* Top Micro-Pill (No emoji!) */}
          <ScrollReveal distance={14} duration={450} immediate>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 text-[11px] font-medium tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span>1.200+ Kreator Aktif & Terverifikasi di Seluruh Indonesia</span>
            </div>
          </ScrollReveal>

          {/* Display Headline (Medium 500, tight tracking -0.035em) */}
          <ScrollReveal distance={18} duration={500} delay={50} immediate>
            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-medium tracking-[-0.035em] leading-[1.1] text-zinc-900 max-w-2xl mx-auto">
              Ide Promosi. Kreator Berbakat. <br />
              Hasil Nyata untuk Bisnismu.
            </h1>
          </ScrollReveal>

          {/* Subhead Description (Strict Measure: max-w-[460px], text-zinc-500) */}
          <ScrollReveal distance={18} duration={500} delay={100} immediate>
            <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-[460px] mx-auto">
              Hubungkan brand UMKM dengan ribuan kreator video UGC, foto studio produk, dan desainer visual profesional Indonesia melalui 4 tahapan kolaborasi terstruktur.
            </p>
          </ScrollReveal>

          {/* Creative Mode Selector Pill (Tactile micro-UI abstraction) */}
          <ScrollReveal distance={14} duration={500} delay={150} immediate>
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/80 text-[11px] font-medium text-zinc-700 shadow-2xs">
              <span className="text-zinc-400 font-mono text-[10px]">Kategori</span>
              <span className="text-zinc-300">⤹</span>
              <span className="text-zinc-900 font-semibold">UGC TikTok</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600">Foto Studio</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600">Brand Design</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 inline-block" />
            </div>
          </ScrollReveal>

          {/* Two Action Buttons (Skeuomorphic Subtle Capsule Buttons) */}
          <ScrollReveal distance={16} duration={500} delay={200} immediate>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/sign-up')}
                className="w-full sm:w-auto rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium px-6 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Mulai Kolaborasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('workspace-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto rounded-full bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-medium px-5 py-2.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-zinc-300"
              >
                <span>Pelajari Cara Kerja</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </ScrollReveal>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* TRUST STRIP (Full-Width, 4 Indikator Tahapan Tanpa Escrow)                */}
      {/* ========================================================================= */}
      <section className="w-full py-5 border-b border-zinc-200/80 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[12px] font-normal text-zinc-600">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
            <span>Bebas Biaya Setup</span>
          </span>
          <span className="flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-zinc-800" />
            <span>4 Tahapan Kolaborasi Terstruktur</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-zinc-800" />
            <span>80%+ Pangkas Waktu Koordinasi</span>
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-800" />
            <span>Garansi Revisi Sesuai Brief</span>
          </span>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* ROLLING BANNER (Logo Vektor Asli Brand Digital Ternama dengan Jarak Lebar) */}
      {/* ========================================================================= */}
      <section className="w-full py-8 border-b border-zinc-200/80 bg-white overflow-hidden">
        <div className="relative flex overflow-x-hidden group items-center">
          
          <div className="animate-marquee flex space-x-16 sm:space-x-20 items-center shrink-0 pr-16 sm:pr-20">
            {TOP_DIGITAL_BRAND_LOGOS.map((logo, idx) => (
              <div 
                key={`logo-a-${logo.id}-${idx}`} 
                className="flex items-center justify-center shrink-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                title={logo.name}
              >
                <div className={`${logo.heightClass || 'h-6 sm:h-7'} flex items-center`}>
                  {logo.svg}
                </div>
              </div>
            ))}
          </div>

          <div className="animate-marquee flex space-x-16 sm:space-x-20 items-center shrink-0 absolute top-0 bottom-0 left-full pr-16 sm:pr-20">
            {TOP_DIGITAL_BRAND_LOGOS.map((logo, idx) => (
              <div 
                key={`logo-b-${logo.id}-${idx}`} 
                className="flex items-center justify-center shrink-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                title={logo.name}
              >
                <div className={`${logo.heightClass || 'h-6 sm:h-7'} flex items-center`}>
                  {logo.svg}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. RUANG KOLABORASI (Tanpa Dekorasi Card, Langsung di Background Section) */}
      {/* ========================================================================= */}
      <section id="workspace-section" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 bg-white relative overflow-hidden">
        
        {/* Siluet Logo Creatorin di Sudut Kanan Bawah Latar (Tidak Menabrak Teks) */}
        <div className="absolute -right-8 -bottom-12 w-[340px] h-[320px] sm:w-[420px] sm:h-[396px] pointer-events-none z-0">
          <CreatorinSilhouette 
            id="appSilGrad" 
            className="w-full h-full" 
            opacity="opacity-12" 
            parallaxStyle={{
              transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min((scrollY - 400) * 0.10, 60)}px, 0)`
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-left">
          
          {/* Section Heading & Subhead */}
          <ScrollReveal distance={20} duration={500}>
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900 mb-3">
                Ruang Kolaborasi yang Bekerja Sesuai Standar Kreatifmu.
              </h2>
              <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-xl">
                Tinggalkan koordinasi yang tercecer di obrolan chat. Di Creatorin, setiap tahapan mulai dari brief, progres produksi, hingga serah terima tertata rapi dalam satu alur kerja transparan.
              </p>
            </div>
          </ScrollReveal>

          {/* Baris Status Proyek Aktif (Clean Divider Border-Y) */}
          <ScrollReveal distance={20} duration={500} delay={50}>
            <div className="border-y border-zinc-200/80 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-zinc-800">
                <span className="font-mono text-zinc-400">Proyek #CR-92014</span>
                <span className="text-zinc-300">/</span>
                <span className="font-semibold text-zinc-900">Kopi Senja Cold Brew × Bagus W.</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Tahap 3 dari 4: Tinjauan Akhir Klien</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Rincian Brief Disepakati (Langsung di Canvas, Border-B) */}
          <ScrollReveal distance={20} duration={500} delay={100}>
            <div className="py-6 border-b border-zinc-200/80 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                Rincian Brief Disepakati
              </span>
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-700 font-normal max-w-3xl">
                Produksi 3x Video Reels TikTok UGC untuk peluncuran varian Cold Brew Caramel. Konsep video mencakup hook 3 detik unboxing, aesthetic pouring shot dengan lighting natural, dan review rasa otentik. Seluruh file master 4K dan hak komersial diserahkan penuh kepada klien.
              </p>
            </div>
          </ScrollReveal>

          {/* 4 Tahapan Kolaborasi Terstruktur (Clean Stepper Langsung di Canvas, Border-B) */}
          <ScrollReveal distance={20} duration={500} delay={150}>
            <div className="py-6 border-b border-zinc-200/80 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                4 Tahapan Kolaborasi Terstruktur
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[12px]">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-2.5 text-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">Tahap 1</span>
                    <span className="font-medium text-zinc-900">Sepakati Brief</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-2.5 text-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">Tahap 2</span>
                    <span className="font-medium text-zinc-900">Produksi Kreator</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/90 flex items-center gap-2.5 text-blue-900 font-medium">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="block font-semibold text-[10px] text-blue-500 uppercase">Tahap 3 (Aktif)</span>
                    <span className="font-medium text-blue-950">Tinjauan &amp; Revisi</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50/50 border border-dashed border-zinc-200 flex items-center gap-2.5 text-zinc-400">
                  <span className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] font-mono shrink-0">4</span>
                  <div>
                    <span className="block font-semibold text-[10px] text-zinc-400 uppercase">Tahap 4</span>
                    <span className="font-medium text-zinc-500">Serah Terima Aset</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Action & Garansi Bar di Bawah */}
          <ScrollReveal distance={20} duration={500} delay={200}>
            <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[12px] text-zinc-500 font-normal flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Perlindungan garansi revisi aktif hingga seluruh hasil kerja disetujui</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => router.push('/sign-in')}
                  className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium px-4 py-2 transition cursor-pointer"
                >
                  Tinjau Draft Video
                </button>
                <button 
                  type="button" 
                  onClick={() => router.push('/sign-in')}
                  className="rounded-full bg-zinc-900 text-white text-xs font-medium px-5 py-2 flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer hover:bg-black transition"
                >
                  <span>Setujui & Selesaikan Tahap Ini</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
                </button>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. 2X2 BENTO GRID (4 Pilar Unggulan dengan Interactive Hover Lift)        */}
      {/* ========================================================================= */}
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 bg-[#FAFAFA] relative overflow-hidden">
        
        {/* Creatorin Logo Silhouette in Bento Background with Parallax */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none z-0">
          <CreatorinSilhouette 
            id="bentoSilGrad" 
            className="w-full h-full" 
            opacity="opacity-20" 
            parallaxStyle={{
              transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min((scrollY - 1000) * 0.10, 70)}px, 0)`
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollReveal distance={20} duration={500}>
            <div className="mb-12 text-left">
              <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900 mb-2">
                Ekosistem Cerdas. Kolaborasi Aman. <br />
                Tanpa Hambatan.
              </h2>
              <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-md">
                Dirancang khusus untuk kebutuhan bisnis modern yang mengutamakan kecepatan eksekusi, tahapan kerja jelas, dan kualitas visual terbaik.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Card 1: Top Left (4 Tahapan Kolaborasi with -3deg Tilted Pill & Hover) */}
            <ScrollReveal distance={22} duration={550} delay={50}>
              <div className="p-7 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 ease-out flex flex-col justify-between h-full cursor-default">
                <div className="mb-8">
                  {/* Floating pill badge */}
                  <div className="flex items-center justify-center py-4">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-medium shadow-xs transform -rotate-3">
                      <Workflow className="w-3 h-3 text-zinc-300" />
                      <span>Alur Kolaborasi Transparan</span>
                    </div>
                  </div>
                  {/* Step Flow strip */}
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80 flex items-center justify-around text-[11px] text-zinc-600 mt-2">
                    <span className="font-semibold text-zinc-900">1. Brief</span>
                    <span className="text-zinc-300">→</span>
                    <span className="font-semibold text-zinc-900">2. Produksi</span>
                    <span className="text-zinc-300">→</span>
                    <span className="font-semibold text-zinc-900">3. Tinjauan</span>
                    <span className="text-zinc-300">→</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-medium">4. Selesai</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                    4 Tahapan Pengerjaan Terstruktur
                  </h3>
                  <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                    Dari brief awal hingga penyerahan file master 4K, setiap tahapan memiliki tenggat waktu dan kriteria penerimaan yang jelas tanpa ruang miskomunikasi.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Top Right (Verified Career Score & Reputation with Hover) */}
            <ScrollReveal distance={22} duration={550} delay={100}>
              <div className="p-7 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 ease-out flex flex-col justify-between h-full cursor-default">
                <div className="space-y-2.5 mb-8">
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80 flex items-center gap-2.5 text-xs font-medium text-zinc-700">
                    <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Rekam Jejak: 42 Proyek Tuntas</span>
                  </div>
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80 flex items-center gap-2.5 text-xs font-medium text-zinc-700">
                    <Star className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Rating Klien: 4.9 / 5.0 (Bintang)</span>
                  </div>
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80 flex items-center gap-2.5 text-xs font-medium text-zinc-700">
                    <Users className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span>Tingkat Kepuasan UMKM: 99.2%</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                    Skor Karir & Portofolio Nyata
                  </h3>
                  <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                    Sistem penilaian terverifikasi berdasarkan ketepatan waktu, kualitas deliverable, dan ulasan riil. Temukan talenta paling kompeten tanpa spekulasi.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Bottom Left (Keyboard Niche Discovery Hardware UI with Hover) */}
            <ScrollReveal distance={22} duration={550} delay={150}>
              <div className="p-7 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 ease-out flex flex-col justify-between h-full cursor-default">
                <div className="flex flex-col items-center justify-center py-4 mb-4 gap-2.5">
                  <div className="flex gap-2">
                    <span className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">⌘</span>
                    <span className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">K</span>
                    <span className="px-3 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[11px] font-medium text-zinc-700 shadow-2xs">
                      Cari Niche Kreator
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 text-[10px] text-zinc-500">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200">F&amp;B Kuliner</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200">Fashion</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200">Skincare</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200">Teknologi</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                    Kurasi Instan Sesuai Industri Bisnismu
                  </h3>
                  <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                    Filter cerdas memudahkan UMKM menemukan kreator yang telah berpengalaman memproduksi konten di ceruk industri yang relevan.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 4: Bottom Right (Turnaround Radar with SLAs & Hover) */}
            <ScrollReveal distance={22} duration={550} delay={200}>
              <div className="p-7 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 ease-out flex flex-col justify-between h-full cursor-default">
                <div className="flex flex-col items-center justify-center py-4 mb-4 relative">
                  <div className="w-24 h-24 rounded-full border border-zinc-200 flex items-center justify-center relative">
                    <div className="w-16 h-16 rounded-full border border-dashed border-zinc-300 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-zinc-900" />
                    </div>
                    <span className="absolute -top-2 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-medium">
                      SLA Terukur
                    </span>
                    <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-medium">
                      Turnaround &lt; 3 Hari
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-[-0.015em] text-zinc-900 mb-1">
                    Produksi Cepat Tanpa Kompromi Mutu
                  </h3>
                  <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500">
                    Setiap pesanan diikat oleh tenggat pengerjaan yang disepakati di muka. Video promosi dan materi campaign selesai tepat waktu sebelum momen promosi lewat.
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. PAKET KOLABORASI UMKM (Pricing Cards dengan Interactive Hover Lift)    */}
      {/* ========================================================================= */}
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 bg-white relative overflow-hidden">
        
        {/* Creatorin Logo Silhouette in Pricing Background with Parallax */}
        <div className="absolute -left-10 bottom-6 w-88 h-88 pointer-events-none z-0">
          <CreatorinSilhouette 
            id="pricingSilGrad" 
            className="w-full h-full" 
            opacity="opacity-18" 
            parallaxStyle={{
              transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min((scrollY - 1600) * 0.11, 65)}px, 0)`
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal distance={20} duration={500}>
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900 mb-2">
                Pilih Paket Kolaborasi yang Pas untuk Bisnismu
              </h2>
              <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-md mx-auto">
                Transparan tanpa biaya tersembunyi. Seluruh paket mencakup 4 tahapan kolaborasi standar, hak pakai komersial, dan jaminan revisi.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch text-left">
            
            {/* Card 1: Left Dark Card (Paket Starter) */}
            <ScrollReveal distance={24} duration={550} delay={50}>
              <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-7 border border-zinc-800 flex flex-col justify-between shadow-sm hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.30)] hover:border-zinc-700 transition-all duration-300 ease-out h-full">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">Rp 450.000</h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">Paket Starter (1 Konten Uji Coba)</p>
                  
                  <ul className="space-y-2.5 text-[12px] text-zinc-300 font-normal">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>1x Video UGC TikTok / Reels (30-60 detik)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>1x Revisi minor skrip &amp; visual</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>Lisensi posting komersial media sosial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>Alur 4 tahapan kolaborasi terpandu</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => router.push('/sign-in')}
                    className="w-full py-2.5 rounded-full bg-white text-zinc-900 text-xs font-medium hover:bg-zinc-100 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                  >
                    Pilih Paket Starter
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Center Elevated White Card (Paket Growth - Paling Diminati) */}
            <ScrollReveal distance={24} duration={550} delay={100}>
              <div className="bg-white text-zinc-900 rounded-2xl p-7 sm:p-8 border border-zinc-200/90 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08)] scale-102 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_48px_-8px_rgba(0,0,0,0.12)] hover:border-zinc-300 transition-all duration-300 ease-out relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-semibold tracking-wide uppercase mb-3">
                    Paling Diminati UMKM
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-zinc-900">Rp 1.450.000</h3>
                  <p className="text-xs font-semibold text-zinc-900 mb-4">Paket Growth (3 Konten Siap Iklan)</p>
                  
                  <ul className="space-y-3 text-[12px] text-zinc-600 font-normal">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-900" />
                      <span>3x Video UGC TikTok/Reels resolusi 4K</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-900" />
                      <span>Subtitle kreatif + sinkronisasi audio trending</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-900" />
                      <span>2x Revisi per konten &amp; penyerahan raw assets</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-900" />
                      <span>Hak cipta komersial penuh untuk Meta &amp; TikTok Ads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-900" />
                      <span>Alur kerja prioritas &amp; pendampingan pengerjaan</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => router.push('/sign-in')}
                    className="w-full py-3 rounded-full bg-zinc-900 text-white text-xs font-medium hover:bg-black transition shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                  >
                    Mulai Paket Growth
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Right Dark Card (Paket Scale-Up) */}
            <ScrollReveal distance={24} duration={550} delay={150}>
              <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-7 border border-zinc-800 flex flex-col justify-between shadow-sm hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.30)] hover:border-zinc-700 transition-all duration-300 ease-out h-full">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-white">Rp 3.500.000</h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">Paket Scale-Up (Kampanye Lengkap)</p>
                  
                  <ul className="space-y-2.5 text-[12px] text-zinc-300 font-normal">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>5x Video UGC + 10x Foto Produk Studio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>Desain banner promosi e-commerce &amp; story</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>Scriptwriting &amp; storyboard terpandu</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-400" />
                      <span>Dedicated Project Facilitator dari Creatorin</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => router.push('/sign-in')}
                    className="w-full py-2.5 rounded-full bg-white text-zinc-900 text-xs font-medium hover:bg-zinc-100 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
                  >
                    Pilih Paket Scale-Up
                  </button>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. FEATURE DELIVERABLE ROW (Paket Deliverable Lengkap Standar Mutu)        */}
      {/* ========================================================================= */}
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 bg-[#FAFAFA] relative overflow-hidden">
        
        {/* Creatorin Logo Silhouette in Deliverables Background with Parallax */}
        <div className="absolute right-0 top-6 w-96 h-96 pointer-events-none z-0">
          <CreatorinSilhouette 
            id="featSilGrad" 
            className="w-full h-full" 
            opacity="opacity-18" 
            parallaxStyle={{
              transform: isReducedMotion ? 'none' : `translate3d(0, ${Math.min((scrollY - 2200) * 0.10, 60)}px, 0)`
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-left">
          <ScrollReveal distance={20} duration={500}>
            <div className="space-y-3 mb-12">
              <span className="text-[11px] font-medium tracking-tight px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 inline-block">
                Standar Deliverable Industri
              </span>
              <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] leading-[1.18] text-zinc-900">
                Aset Kreatif Siap Pakai. <br className="hidden sm:inline"/>
                Satu Paket Lengkap Langsung Siap Tayang.
              </h2>
              <p className="text-xs md:text-sm font-normal leading-relaxed text-zinc-500 max-w-xl">
                Setiap karya yang diserahkan oleh kreator wajib memenuhi standar spesifikasi teknis platform: resolusi tinggi, audio bebas klaim hak cipta, dan kepemilikan komersial mutlak bagi UMKM.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Creative Asset Parcel Box Visual with Hover */}
            <ScrollReveal distance={24} duration={550} delay={50} className="lg:col-span-6">
              <div className="bg-white p-8 rounded-2xl border border-zinc-200/90 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] relative">
                <svg className="w-36 h-36 opacity-75" viewBox="0 0 200 200" fill="none">
                  <polygon points="100,50 170,85 100,120 30,85" fill="#E4E4E7" stroke="#A1A1AA" strokeWidth="1.5"/>
                  <polygon points="30,85 100,120 100,175 30,140" fill="#D4D4D8" stroke="#A1A1AA" strokeWidth="1.5"/>
                  <polygon points="170,85 100,120 100,175 170,140" fill="#C4C4C8" stroke="#A1A1AA" strokeWidth="1.5"/>
                  {/* Floating tags */}
                  <rect x="50" y="30" width="24" height="20" rx="4" fill="#FFFFFF" stroke="#71717A" strokeWidth="1.5"/>
                  <text x="54" y="44" fontSize="10" fontWeight="bold" fill="#71717A" fontFamily="monospace">4K</text>
                  <rect x="126" y="25" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#71717A" strokeWidth="1.5"/>
                  <text x="130" y="40" fontSize="10" fontWeight="bold" fill="#71717A" fontFamily="monospace">RAW</text>
                  <rect x="88" y="10" width="24" height="18" rx="4" fill="#FFFFFF" stroke="#71717A" strokeWidth="1.5"/>
                  <text x="92" y="23" fontSize="9" fontWeight="bold" fill="#71717A" fontFamily="monospace">LIC</text>
                </svg>
              </div>
            </ScrollReveal>

            {/* Right: 3 Vertical Feature Rows with Outlined Lucide Icons */}
            <ScrollReveal distance={24} duration={550} delay={100} className="lg:col-span-6 space-y-6">
              <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-white hover:border hover:border-zinc-200/80 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg border border-zinc-300 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                  <FileCheck className="w-3.5 h-3.5 text-zinc-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-[-0.015em] text-zinc-900">Brief Terstruktur Tanpa Miskomunikasi</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Formulir panduan brief membantu UMKM menjelaskan target audiens, pesan kunci, dan style visual secara presisi sejak awal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-white hover:border hover:border-zinc-200/80 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg border border-zinc-300 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                  <FolderCheck className="w-3.5 h-3.5 text-zinc-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-[-0.015em] text-zinc-900">Penyimpanan Aset Terpusat di Cloud</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Seluruh file master, raw footage, dan variasi rasio video (9:16 untuk Reels, 1:1 untuk Feed) tersimpan aman dan bisa diunduh kapan saja.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-white hover:border hover:border-zinc-200/80 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg border border-zinc-300 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-[-0.015em] text-zinc-900">Lisensi Hak Pakai Komersial Resmi</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Bebas klaim hak cipta musik dan video saat dipakai untuk beriklan di platform digital Meta Ads, TikTok Ads, maupun Google Ads.
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. MINI SHOWCASE KARYA (Clickable Lightbox Detail Modal & Card Hover)     */}
      {/* ========================================================================= */}
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 bg-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal distance={20} duration={500}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.025em] text-zinc-900">Karya Unggulan Kreator</h3>
                <p className="text-xs text-zinc-500 mt-1">Klik karya di bawah untuk melihat preview detail video dan profil kreator.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/sign-in')}
                className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Lihat Semua Karya di Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayProjects.map((proj, idx) => (
              <ScrollReveal key={proj.id} distance={20} duration={500} delay={idx * 60}>
                <div className="hover:-translate-y-1.5 transition-transform duration-300 ease-out">
                  <ProjectCard
                    id={`guest-proj-${proj.id}`}
                    project={proj}
                    isSaved={false}
                    onToggleSave={() => {}}
                    onClick={() => setSelectedProject(proj)}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. FINAL CTA CARD (Soft Sand / Light Gray Card)                           */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <ScrollReveal distance={24} duration={600}>
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 sm:p-12 text-center border border-zinc-200/90 shadow-[0_2px_16px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 ease-out">
            <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.025em] text-zinc-900 mb-2">
              Siap Mengubah Ide Promosimu Menjadi Penjualan Nyata?
            </h2>
            <p className="text-xs sm:text-[13px] font-normal leading-relaxed text-zinc-500 max-w-md mx-auto mb-6">
              Bergabunglah bersama ribuan UMKM dan talenta kreator terdepan di seluruh Indonesia. Mulai kolaborasi pertamamu hari ini.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/sign-up')}
                className="w-full sm:w-auto rounded-full bg-zinc-900 hover:bg-black text-white text-xs font-medium px-6 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Daftar Sebagai Klien UMKM
              </button>
              <button
                type="button"
                onClick={() => router.push('/sign-up')}
                className="w-full sm:w-auto rounded-full bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-medium px-5 py-2.5 transition cursor-pointer flex items-center justify-center gap-1.5 hover:border-zinc-300"
              >
                <span>Gabung Sebagai Kreator</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Lightbox / Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onViewCreatorProfile={(creator) => {
            setSelectedProject(null);
            router.push(`/creator/${creator.id}`);
          }}
          onGetInTouch={() => {
            setSelectedProject(null);
            router.push('/sign-in');
          }}
          allProjects={displayProjects}
        />
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 24s linear infinite;
        }
      `}</style>
    </div>
  );
};
