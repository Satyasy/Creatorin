'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Menu, MessageSquare, Search, WalletCards, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ActivePage, AuthState } from '@/types';

interface NavbarProps {
  currentUser?: AuthState['user']; onNavigate?: (page: ActivePage) => void; onSignOut?: () => void;
  onSearch?: (query: string) => void; onOpenBriefModal?: () => void; onSelectTag?: (tag: string) => void;
  activePage?: ActivePage; showSearch?: boolean;
}

const links = [
  { label: 'Beranda', path: '/', page: 'home' as ActivePage },
  { label: 'Layanan', path: '/explore/services', page: 'services' as ActivePage },
  { label: 'Brief proyek', path: '/briefs', page: 'briefs' as ActivePage },
];

export const Navbar: React.FC<NavbarProps> = ({ currentUser: suppliedUser, onNavigate, onSignOut, onSearch, showSearch = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: sessionUser, signOut } = useAuth();
  const user = suppliedUser === undefined ? sessionUser : suppliedUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const hasSearch = showSearch || (pathname.startsWith('/explore') && pathname !== '/explore') || pathname.startsWith('/briefs');

  useEffect(() => {
    const close = (event: MouseEvent) => { if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    if (!accountOpen && !menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (accountOpen) {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [accountOpen, menuOpen]);
  const navigate = (page: ActivePage, path: string) => { setMenuOpen(false); onNavigate?.(page); router.push(path); };
  const active = (path: string) => path === '/' ? pathname === path : pathname.startsWith(path);
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault(); onSearch?.(query);
    if (!pathname.startsWith('/explore')) router.push(`/explore/services?q=${encodeURIComponent(query)}`);
  };
  const exit = () => { if (onSignOut) onSignOut(); else signOut(); router.push('/'); };

  return (
    <header className="sticky top-0 z-50 h-16 lg:h-[72px] border-b border-[var(--outline)] bg-white/95 backdrop-blur-sm">
      <div className="container-creatorin flex h-full items-center gap-3 py-2">
        <button onClick={() => navigate('home', '/')} className="flex min-h-11 shrink-0 items-center gap-2 rounded-md pr-2" aria-label="Buka beranda Creatorin">
          <img src="/creatorin/logo.svg" alt="" className="h-8 w-9" />
          <span className="font-display text-xl font-bold tracking-[-0.03em] text-[var(--ink)]">Creatorin</span>
        </button>

        {hasSearch && <form onSubmit={submitSearch} className="ml-2 hidden min-w-0 max-w-md flex-1 items-center md:flex">
          <label htmlFor="global-search" className="sr-only">Cari layanan, creator, atau brief</label>
          <div className="flex h-11 w-full items-center rounded-lg border border-[#B7BBC9] bg-white px-3 focus-within:border-primary focus-within:shadow-[var(--focus-ring)]">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--muted)]" />
            <input id="global-search" value={query} onChange={(event) => { setQuery(event.target.value); onSearch?.(event.target.value); }} placeholder="Cari layanan, creator, atau brief" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[#6F7285]" />
          </div>
        </form>}

        <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-1 xl:flex">
          {links.map((link) => <button key={link.path} onClick={() => navigate(link.page, link.path)} aria-current={active(link.path) ? 'page' : undefined} className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${active(link.path) ? 'bg-[#E8F0FF] text-primary' : 'text-[#55576A] hover:bg-[#F8F9FC] hover:text-[var(--ink)]'}`}>{link.label}</button>)}
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-2">
          {user ? <>
            <button onClick={() => navigate('chat', '/chat')} className="grid h-11 w-11 place-items-center rounded-lg text-[#55576A] hover:bg-[#F8F9FC] hover:text-[var(--ink)]" aria-label="Buka pesan"><MessageSquare className="h-5 w-5" /></button>
            <button onClick={() => navigate('notifications', '/notifications')} className="grid h-11 w-11 place-items-center rounded-lg text-[#55576A] hover:bg-[#F8F9FC] hover:text-[var(--ink)]" aria-label="Buka notifikasi"><Bell className="h-5 w-5" /></button>
            <div className="relative" ref={accountRef}>
              <button ref={accountButtonRef} onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen} className="flex min-h-11 items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-[#F8F9FC]">
                <img src={user.avatar || '/creatorin/avatar.png'} alt="" className="h-8 w-8 rounded-full border border-[var(--outline)] object-cover" />
                <span className="hidden max-w-28 truncate text-sm font-semibold text-[var(--ink)] lg:block">{user.name}</span><ChevronDown className="h-4 w-4 text-[#55576A]" />
              </button>
              {accountOpen && <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--outline)] bg-white p-2 shadow-[0_16px_40px_rgba(13,12,34,.14)]">
                <p className="truncate px-3 py-2 text-xs text-[#55576A]">{user.email}</p>
                <button onClick={() => router.push('/profile')} className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold hover:bg-[#F8F9FC]">Profil saya</button>
                <button onClick={() => router.push('/wallet')} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-[#F8F9FC]"><WalletCards className="h-4 w-4 text-[#55576A]" />Dompet</button>
                <button onClick={() => router.push('/settings')} className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold hover:bg-[#F8F9FC]">Pengaturan</button>
                {user.role === 'school' && <button onClick={() => router.push('/dashboard/school')} className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold hover:bg-[#F8F9FC]">Dashboard sekolah</button>}
                <div className="my-1 border-t border-[var(--outline)]" /><button onClick={exit} className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold text-[#D92D20] hover:bg-[#FEE4E2]">Keluar</button>
              </div>}
            </div>
          </> : <>
            <button onClick={() => navigate('signin', '/sign-in')} className="hidden min-h-11 rounded-lg px-4 text-sm font-semibold text-[var(--ink)] hover:bg-[#F8F9FC] sm:block">Masuk</button>
            <button onClick={() => navigate('signup', '/sign-up')} className="hidden min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-[#1248C7] sm:block">Buat akun</button>
          </>}
          <button ref={mobileMenuButtonRef} onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="grid h-11 w-11 place-items-center rounded-lg text-[var(--ink)] hover:bg-[#F8F9FC] xl:hidden" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>

      {menuOpen && <nav id="mobile-navigation" aria-label="Navigasi seluler" className="container-creatorin border-t border-[var(--outline)] bg-white py-3 xl:hidden">
        {hasSearch && <form onSubmit={submitSearch} className="mb-3 md:hidden"><label htmlFor="mobile-search" className="sr-only">Cari layanan, creator, atau brief</label><div className="flex h-11 items-center rounded-lg border border-[#B7BBC9] px-3 focus-within:border-primary focus-within:shadow-[var(--focus-ring)]"><Search className="mr-2 h-4 w-4 text-[#55576A]" /><input id="mobile-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari di Creatorin" className="min-w-0 flex-1 outline-none" /></div></form>}
        <div className="grid gap-1 sm:grid-cols-2">{links.map((link) => <button key={link.path} onClick={() => navigate(link.page, link.path)} className={`min-h-11 rounded-lg px-3 text-left text-sm font-semibold ${active(link.path) ? 'bg-[#E8F0FF] text-primary' : 'text-[#55576A] hover:bg-[#F8F9FC]'}`}>{link.label}</button>)}</div>
        {!user && <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--outline)] pt-3"><button onClick={() => router.push('/sign-in')} className="min-h-11 rounded-xl border border-[var(--outline)] font-semibold">Masuk</button><button onClick={() => router.push('/sign-up')} className="min-h-11 rounded-xl bg-primary font-semibold text-white">Buat akun</button></div>}
      </nav>}
    </header>
  );
};
