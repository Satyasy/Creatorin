'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActivePage } from '@/types';

interface FooterProps {
  onNavigate?: (page: ActivePage) => void;
  onOpenBrief?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBrief }) => {
  const router = useRouter();
  const go = (page: ActivePage, path: string) => { onNavigate?.(page); router.push(path); };

  return (
    <footer className="border-t border-[var(--outline)] bg-white text-[var(--ink)]">
      <div className="container-creatorin py-10 sm:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <button onClick={() => go('home', '/')} className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg pr-3 text-left" aria-label="Buka beranda Creatorin">
            <img src="/creatorin/logo.svg" alt="" className="h-9 w-10" />
            <span className="font-display text-2xl font-bold tracking-[-0.03em]">Creatorin</span>
          </button>

          <nav aria-label="Navigasi footer" className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-semibold lg:mx-auto">
            <button onClick={() => go('services', '/explore/services')} className="min-h-11 hover:text-primary">Layanan creator</button>
            <button onClick={() => go('briefs', '/briefs')} className="min-h-11 hover:text-primary">Brief proyek</button>
            <button onClick={() => onOpenBrief ? onOpenBrief() : go('briefs', '/briefs')} className="min-h-11 hover:text-primary">Buat brief</button>
          </nav>

          <p className="text-sm text-[var(--muted)]">Dibuat untuk ekosistem kreatif Indonesia.</p>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-[var(--outline)] pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <p>© 2026 Creatorin</p>
            <button onClick={() => router.push('/terms')} className="hover:text-[var(--ink)]">Syarat layanan</button>
            <button onClick={() => router.push('/privacy')} className="hover:text-[var(--ink)]">Kebijakan privasi</button>
          </div>
          <p>Kolaborasi kreatif untuk usaha Indonesia.</p>
        </div>
      </div>
    </footer>
  );
};
