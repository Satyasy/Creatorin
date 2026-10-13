'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { useAuth } from '@/providers/AuthProvider';

const CreatorinChatbot = dynamic(
  () => import('@/components/common/CreatorinChatbot').then((mod) => mod.CreatorinChatbot),
  { ssr: false }
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Dedicated locked workspace only for /chat (which has 3-column independent inner scroll)
  const isChat = pathname?.startsWith('/chat');
  const isDashboard = pathname?.startsWith('/dashboard');
  const isPublicSchoolDashboard = pathname === '/school/dashboard';
  const isPublicSchoolProfile = pathname?.startsWith('/school/') && !isPublicSchoolDashboard;
  const isCreatorShell = user?.role === 'creator';
  const isSchoolShell = (user?.role === 'school' || pathname?.startsWith('/dashboard/school') || isPublicSchoolDashboard) && !isPublicSchoolProfile;

  // Hide footer on full workspace views to maintain SaaS cleanliness
  const hideFooter = isChat || pathname?.startsWith('/contracts') || isDashboard || isSchoolShell;

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-clip bg-[var(--surface-low)] text-[var(--ink)] font-sans selection:bg-primary selection:text-white ${
        isChat ? 'h-screen max-h-screen overflow-hidden' : ''
      } ${isDashboard || isSchoolShell ? 'md:h-screen md:max-h-screen md:overflow-hidden' : ''}`}
    >
      {!isCreatorShell && !isSchoolShell && <Navbar />}
      <div
        className={`flex flex-1 flex-col lg:flex-row ${
          isChat || isDashboard || isSchoolShell ? 'min-h-0 overflow-hidden' : ''
        }`}
      >
        {isCreatorShell && <CreatorSidebar />}
        <main
          className={`min-w-0 flex-1 w-full flex flex-col ${
            isChat ? 'min-h-0 overflow-hidden' : ''
          } ${isDashboard || isSchoolShell ? 'md:min-h-0 md:overflow-hidden' : ''}`}
        >
          {children}
        </main>
      </div>
      {!hideFooter && !isCreatorShell && !isSchoolShell && <Footer />}
      {!isCreatorShell && !isSchoolShell && <CreatorinChatbot />}
    </div>
  );
}
