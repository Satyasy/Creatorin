import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CreatorIn Admin Panel | Filament Dashboard',
  description: 'Panel Pengendalian Terpusat Platform CreatorIn',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e8f0] antialiased selection:bg-amber-500 selection:text-slate-950">
      {children}
    </div>
  );
}
