'use client';

import Link from 'next/link';
import { Bell, BriefcaseBusiness, CircleHelp, House, LogOut, MessageSquareText, Search, SlidersHorizontal, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

type CreatorLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const primaryLinks = [
  { label: 'Search', href: '/explore', icon: Search },
  { label: 'Home', href: '/', icon: House },
  { label: 'Messages', href: '/chat', icon: MessageSquareText },
  { label: 'Contracts', href: '/contracts', icon: BriefcaseBusiness },
  { label: 'Finances', href: '/wallet', icon: Wallet },
] satisfies CreatorLink[];

const utilityLinks = [
  { label: 'Notifikasi', href: '/notifications', icon: Bell },
  { label: 'Pengaturan', href: '/settings', icon: SlidersHorizontal },
  { label: 'Bantuan', href: '/terms', icon: CircleHelp },
] satisfies CreatorLink[];

export function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const renderMainLink = ({ label, href, icon: Icon }: CreatorLink) => {
    const active = isActive(href);

    return (
      <Link
        key={href}
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`flex h-[52px] min-w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-md px-1.5 text-[10px] font-normal leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:h-[58px] lg:w-full ${active ? 'bg-[#DFE6EF] text-[var(--ink)]' : 'text-[#121212] hover:bg-[#E7EBF0]'}`}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.35} aria-hidden="true" />
        <span className="max-w-[88px] whitespace-nowrap">{label}</span>
      </Link>
    );
  };

  const renderUtilityLink = ({ label, href, icon: Icon }: CreatorLink) => {
    const active = isActive(href);
    const isNotification = href === '/notifications';

    return (
      <Link
        key={href}
        href={href}
        title={label}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? 'bg-[#DFE6EF] text-[var(--ink)]' : 'text-[#121212] hover:bg-[#E7EBF0]'}`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.35} aria-hidden="true" />
        {isNotification && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#EB4D4B]" aria-hidden="true" />}
      </Link>
    );
  };

  return (
    <aside aria-label="Sidebar kreator" className="border-b border-[var(--outline)] bg-[#F3F5F7] lg:sticky lg:top-0 lg:h-screen lg:w-[100px] lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex min-h-16 items-center gap-2 px-3 lg:h-full lg:flex-col lg:px-4 lg:py-3">
        <Link href="/" aria-label="Beranda Creatorin" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl hover:bg-[#E7EBF0] lg:h-12 lg:w-12">
          <img src="/creatorin/logo.svg" alt="" className="h-7 w-8" />
        </Link>

        <Link href="/profile" className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-[#E7EBF0] lg:mb-6 lg:mt-7" aria-label={`Buka profil ${user?.name || 'kreator'}`}>
          <img src={user?.avatar || '/creatorin/avatar.png'} alt="" className="h-9 w-9 rounded-full border border-[var(--outline)] object-cover" />
        </Link>

        <nav aria-label="Navigasi kreator" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:w-full lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible">
          {primaryLinks.map(renderMainLink)}

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="flex h-[52px] min-w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-md px-1.5 text-[10px] font-normal leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:h-[58px] lg:w-full text-[#121212] hover:bg-[#FEE4E2] hover:text-[#D92D20] cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.35} aria-hidden="true" />
            <span className="max-w-[88px] whitespace-nowrap">Logout</span>
          </button>

          <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:mt-auto lg:w-full lg:flex-col lg:items-center lg:gap-2">
            {utilityLinks.map(renderUtilityLink)}
          </div>
        </nav>
      </div>
    </aside>
  );
}
