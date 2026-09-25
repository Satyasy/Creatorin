"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MessageSquare, 
  Bell, 
  Menu, 
  X, 
  Plus
} from 'lucide-react';
import JelajahNav from './JelajahNav';
import { ActivePage, AuthState } from './types';

export interface NavbarProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  activePage?: ActivePage;
  onSearch?: (query: string) => void;
  onOpenBriefModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSignOut,
  onNavigate,
  activePage = 'briefs',
  onSearch,
  onOpenBriefModal
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleNavigate = (page: ActivePage, href: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      router.push(href);
    }
    setMobileMenuOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        
        {/* Brand & Search */}
        <div className="flex items-center gap-6 lg:gap-8 flex-1">
          <Link 
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('home');
              }
            }}
            className="flex items-center gap-2 group select-none shrink-0"
          >
            <img src="/creatorin/logo.svg" alt="Creatorin" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0d0c22] font-sans">
              Creatorin
            </span>
          </Link>

          {/* Search bar in Navbar */}
          <div className="hidden md:flex items-center relative max-w-xs lg:max-w-md w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Cari brief, UMKM, atau tagar..."
              className="w-full pl-9 pr-4 py-2 bg-[#f4f4f5] hover:bg-neutral-100 focus:bg-white text-xs sm:text-sm text-[#0d0c22] rounded-full border border-transparent focus:border-neutral-300 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Center / Right Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('home');
              }
            }}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition ${
              activePage === 'home' || activePage === 'landing'
                ? 'text-[#0d0c22] bg-neutral-100'
                : 'text-neutral-600 hover:text-[#0d0c22] hover:bg-neutral-50'
            }`}
          >
            Beranda
          </Link>

          <JelajahNav />

          <Link
            href="/"
            className="px-3.5 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-[#0d0c22] hover:bg-neutral-50 transition"
          >
            Collaboration Room
          </Link>

          <Link
            href="/brief"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('briefs');
              }
            }}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition ${
              activePage === 'briefs'
                ? 'text-[#0d0c22] bg-neutral-100 font-bold'
                : 'text-neutral-600 hover:text-[#0d0c22] hover:bg-neutral-50'
            }`}
          >
            Brief Proyek
          </Link>
        </nav>

        {/* Actions (Pasang Brief, Pesan, Notifikasi, Avatar Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenBriefModal && (
            <button
              onClick={onOpenBriefModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pasang Brief</span>
            </button>
          )}

          <Link
            href="/pesan"
            className="relative w-9 h-9 rounded-full border border-neutral-200/80 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#0d0c22] flex items-center justify-center transition"
            aria-label="Pesan"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
          </Link>

          <Link
            href="/notifikasi"
            className="relative w-9 h-9 rounded-full border border-neutral-200/80 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-[#0d0c22] flex items-center justify-center transition"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white" />
          </Link>

          {/* User Profile avatar */}
          <div className="relative">
            <Link
              href="/myprofile"
              className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition"
              aria-label="Profil saya"
            >
              <img
                src={currentUser?.avatar || '/creatorin/avatar.png'}
                alt={currentUser?.name || 'Profil'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200"
              />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-[#0d0c22] rounded-lg hover:bg-neutral-100 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-4 space-y-3">
          <div className="flex items-center relative w-full mb-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Cari brief atau UMKM..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 text-xs text-[#0d0c22] rounded-full border-none focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavigate('home', '/')}
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavigate('creators', '/jelajah/creator')}
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Jelajah Kreator
            </button>
            <button
              onClick={() => handleNavigate('services', '/jelajah/layanan')}
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Katalog Layanan
            </button>
            <button
              onClick={() => handleNavigate('projects', '/jelajah/proyek')}
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Portofolio Proyek
            </button>
            <button
              onClick={() => handleNavigate('briefs', '/brief')}
              className="text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0d0c22] bg-neutral-100"
            >
              Papan Brief Proyek UMKM
            </button>
            <Link
              href="/pesan"
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Pesan Masuk
            </Link>
            <Link
              href="/notifikasi"
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Notifikasi
            </Link>
            <Link
              href="/myprofile"
              className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Profil Saya
            </Link>
          </div>

          {onOpenBriefModal && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBriefModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Pasang Brief Baru</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
