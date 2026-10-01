'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CreatorinChatbot } from '@/components/common/CreatorinChatbot';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dedicated locked workspace only for /chat (which has 3-column independent inner scroll)
  const isChat = pathname?.startsWith('/chat');
  // Hide footer on full workspace views to maintain SaaS cleanliness
  const hideFooter = pathname?.startsWith('/chat') || pathname?.startsWith('/collaboration') || pathname?.startsWith('/dashboard');

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden bg-[#F8FAFC] text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white ${isChat ? 'h-screen max-h-screen overflow-hidden' : ''}`}>
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${isChat ? 'min-h-0 overflow-hidden' : ''}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CreatorinChatbot />
    </div>
  );
}
