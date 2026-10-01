'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CreatorinChatbot } from '@/components/common/CreatorinChatbot';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide footer on workspace/chat/collaboration/dashboard pages to keep clean layout
  const isWorkspace = pathname?.startsWith('/chat') || pathname?.startsWith('/collaboration') || pathname?.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      {!isWorkspace && <Footer />}
      <CreatorinChatbot />
    </div>
  );
}
