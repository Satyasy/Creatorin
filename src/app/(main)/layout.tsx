'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CreatorinChatbot } from '@/components/common/CreatorinChatbot';
import { RoleSwitcher } from '@/components/common/RoleSwitcher';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dedicated locked workspace only for /chat (which has 3-column independent inner scroll)
  const isChat = pathname?.startsWith('/chat');
  const isDashboard = pathname?.startsWith('/dashboard');
  // Hide footer on full workspace views to maintain SaaS cleanliness
  const hideFooter = isChat || pathname?.startsWith('/collaboration') || isDashboard;

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden bg-[#F8FAFC] text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white ${isChat ? 'h-screen max-h-screen overflow-hidden' : ''} ${isDashboard ? 'md:h-screen md:max-h-screen md:overflow-hidden' : ''}`}>
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${isChat ? 'min-h-0 overflow-hidden' : ''} ${isDashboard ? 'md:min-h-0 md:overflow-hidden' : ''}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CreatorinChatbot />
      <RoleSwitcher />
    </div>
  );
}
