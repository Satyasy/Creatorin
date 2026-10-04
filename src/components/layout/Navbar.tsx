'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  ChevronDown, 
  MessageSquare, 
  Bell, 
  Menu, 
  X, 
  User, 
  LogOut,
  UserCheck,
  TrendingUp,
  Briefcase,
  Settings,
  GraduationCap,
  WalletCards,
  FileCheck2
} from 'lucide-react';
import { ActivePage, AuthState } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

interface NavbarProps {
  currentUser?: AuthState['user'];
  onNavigate?: (page: ActivePage) => void;
  onSignOut?: () => void;
  onSearch?: (query: string) => void;
  onOpenBriefModal?: () => void;
  onSelectTag?: (tag: string) => void;
  activePage?: ActivePage;
  showSearch?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser: propUser, 
  onNavigate, 
  onSignOut,
  onSearch,
  onSelectTag,
  activePage,
  showSearch = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, signOut: authSignOut } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;
  const isHomeActive = activePage === 'home' || pathname === '/' || pathname === '/dashboard';

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    router.push(path);
  };

  const handleSignOutAction = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      authSignOut();
      router.push('/');
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchInput, setNavSearchInput] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isCreator = currentUser?.role === 'creator';
  const isSearchVisible = showSearch || pathname?.startsWith('/explore') || pathname?.startsWith('/jelajah') || pathname?.startsWith('/briefs');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(event.target as Node)) {
        setExploreDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic shrinking navbar state when scrolled (Sticky Effect)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        rafId = null;
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(navSearchInput);
    }
    if (isCreator) {
      if (!pathname?.startsWith('/explore')) {
        router.push(`/explore?q=${encodeURIComponent(navSearchInput)}`);
      }
    } else {
      if (!pathname?.startsWith('/jelajah')) {
        router.push(`/jelajah/layanan?q=${encodeURIComponent(navSearchInput)}`);
      }
    }
  };

  const CATEGORY_ITEMS = [
    'Reels Instagram',
    'Video Tiktok',
    'Feed Instagram',
    'Poster',
    'Banner',
    'Brosur',
    'Logo',
    'Foto Produk'
  ];

  return (
    <header 
      id="main-header" 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out font-sans ${
        isScrolled 
          ? 'bg-white/92 backdrop-blur-md shadow-xs border-b border-neutral-200/80' 
          : 'bg-white border-b border-neutral-200/60'
      }`}
    >
      <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out flex items-center justify-between gap-4 ${
        isScrolled ? 'h-16' : 'h-20'
      }`}>
        
        {/* Sisi Kiri: Logo Brand & Search Bar Dribbble Style */}
        <div className={`flex items-center gap-6 xl:gap-8 ${isSearchVisible ? 'flex-1 max-w-2xl' : 'shrink-0'}`}>
          
          {/* Logo Creatorin */}
          <button
            id="nav-logo-btn"
            onClick={() => navigateTo('home', '/')}
            className="inline-flex items-center gap-2 shrink-0 group text-left cursor-pointer focus:outline-hidden"
            aria-label="Creatorin"
          >
            <img
              src="/creatorin/logo.svg"
              alt=""
              className={`shrink-0 transition-all duration-300 ease-in-out ${isScrolled ? 'h-[28px] w-[30px]' : 'h-[32px] w-[34px]'}`}
              aria-hidden="true"
            />
            <span className={`font-medium leading-none tracking-[-0.714px] text-black font-[var(--font-logo)] transition-all duration-300 ease-in-out ${isScrolled ? 'text-[21px]' : 'text-[23.794px]'}`}>
              Creatorin
            </span>
          </button>

          {isSearchVisible && (
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center w-full max-w-md bg-[#F3F3F4] hover:bg-neutral-200/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155DFC] rounded-[8px] p-1 pl-4 transition-all border border-black/10 focus-within:border-transparent"
            >
              <input
                type="text"
                id="nav-search-input"
                value={navSearchInput}
                onChange={(e) => {
                  setNavSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder="Cari kreator, keahlian, atau video UGC..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#0D0B0B] placeholder:text-neutral-400 focus:outline-hidden"
              />
              
              {/* Brand Blue Search Button */}
              <button
                type="submit"
                className="w-8 h-8 rounded-[6px] bg-[#155DFC] hover:bg-[#0E4CD1] text-white flex items-center justify-center shrink-0 transition cursor-pointer ml-2"
                aria-label="Cari"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Tengah: Nav Link (Beranda, Jelajah, Kontrak & Brief) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-9 text-sm font-semibold text-[#0D0B0B]">
          
          {/* Nav Link Beranda */}
          <button
            id="nav-beranda-link"
            onClick={() => navigateTo('home', '/')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              isHomeActive
                ? 'text-[#155DFC] font-bold'
                : 'text-neutral-600 hover:text-[#155DFC]'
            }`}
          >
            <span>Beranda</span>
          </button>

          {/* Navigasi Eksplorasi: Explore untuk Kreator, Jelajah untuk UMKM/Guest */}
          {isCreator ? (
            <button
              id="nav-explore-link"
              onClick={() => navigateTo('explore', '/explore')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                pathname?.startsWith('/explore') ? 'text-[#155DFC]' : 'text-neutral-600 hover:text-[#155DFC]'
              }`}
            >
              <span>Explore</span>
            </button>
          ) : (
            <div 
              className={`relative group/explore transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}
              onMouseEnter={() => setExploreDropdownOpen(true)}
              onMouseLeave={() => setExploreDropdownOpen(false)}
              ref={exploreDropdownRef}
            >
              <button
                onClick={() => navigateTo('services', '/jelajah/layanan')}
                className={`hover:text-[#155DFC] transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                  pathname?.startsWith('/jelajah') ? 'text-[#155DFC]' : 'text-[#0D0C22]'
                } group-hover/explore:text-[#155DFC]`}
              >
                <span>Jelajah</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 text-neutral-500 group-hover/explore:rotate-180 group-hover/explore:text-[#155DFC]" />
              </button>

              {exploreDropdownOpen && (
                <div 
                  className="absolute top-full -left-20 w-[300px] bg-white rounded-[16px] border border-black/10 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-1">
                      Eksplorasi Talenta & Jasa
                    </p>
                    
                    <button
                      onClick={() => {
                        setExploreDropdownOpen(false);
                        navigateTo('services', '/jelajah/layanan');
                      }}
                      className="w-full px-3 py-2 text-left rounded-[10px] hover:bg-[#F3F3F4] text-xs font-semibold text-[#0D0C22] flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-[8px] bg-blue-50 text-[#155DFC] flex items-center justify-center group-hover:bg-[#155DFC] group-hover:text-white transition-colors">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold">Layanan Kreator</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Temukan paket jasa siap kerja</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setExploreDropdownOpen(false);
                        navigateTo('projects', '/jelajah/proyek');
                      }}
                      className="w-full px-3 py-2 text-left rounded-[10px] hover:bg-[#F3F3F4] text-xs font-semibold text-[#0D0C22] flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-[8px] bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold">Portofolio Project</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Inspirasi karya kreator terverifikasi</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setExploreDropdownOpen(false);
                        navigateTo('creator-profile', '/jelajah/kreator');
                      }}
                      className="w-full px-3 py-2 text-left rounded-[10px] hover:bg-[#F3F3F4] text-xs font-semibold text-[#0D0C22] flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold">Profil Kreator</p>
                        <p className="text-[10px] text-neutral-500 font-normal">Temukan kreator terverifikasi</p>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-black/5 my-1.5" />

                  <div className="px-3 py-1">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-1.5">
                      Kategori Populer
                    </p>
                    <div className="grid grid-cols-2 gap-1 px-1">
                      {CATEGORY_ITEMS.slice(0, 4).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setExploreDropdownOpen(false);
                            if (onSelectTag) onSelectTag(cat);
                            router.push(`/jelajah/layanan?tag=${encodeURIComponent(cat)}`);
                          }}
                          className="px-2 py-1.5 text-left rounded-[6px] hover:bg-[#F3F3F4] text-[11px] font-medium text-neutral-600 hover:text-[#155DFC] truncate transition cursor-pointer"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav Link Brief Proyek */}
          <button
            id="nav-briefs-link"
            onClick={() => navigateTo('briefs', '/briefs')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              pathname?.startsWith('/briefs') ? 'text-[#155DFC] font-bold' : 'text-neutral-600 hover:text-[#155DFC]'
            }`}
          >
            <span>Brief Proyek</span>
          </button>

          {/* Nav Link Kontrak & Kolaborasi */}
          <button
            id="nav-contracts-link"
            onClick={() => navigateTo('collaboration-room', '/contracts')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              pathname?.startsWith('/contracts') ? 'text-[#155DFC] font-bold' : 'text-neutral-600 hover:text-[#155DFC]'
            }`}
          >
            <span>Kontrak Kerja</span>
          </button>
        </nav>

        {/* Sisi Kanan: Action Buttons & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {currentUser && (
            <>
              {/* Ikon Pesan */}
              <button
                id="nav-chat-btn"
                onClick={() => navigateTo('chat', '/chat')}
                className="w-10 h-10 rounded-full hover:bg-[#F3F3F4] flex items-center justify-center text-neutral-600 hover:text-[#0D0C22] transition-colors relative cursor-pointer"
                aria-label="Messages"
                title="Buka Ruang Obrolan & Pesan"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#155DFC] rounded-full ring-2 ring-white"></span>
              </button>

              {/* Ikon Notifikasi */}
              <button
                id="nav-notifications-btn"
                onClick={() => navigateTo('notifications', '/notifications')}
                className="w-10 h-10 rounded-full hover:bg-[#F3F3F4] flex items-center justify-center text-neutral-600 hover:text-[#0D0C22] transition-colors relative cursor-pointer"
                aria-label="Notifications"
                title="Buka Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>
            </>
          )}

          {/* User Profile Avatar / Sign In Buttons */}
          {currentUser ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                id="nav-user-profile-logo-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F3F3F4] transition cursor-pointer"
                title="Buka menu profil"
                aria-expanded={userDropdownOpen}
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-black/10"
                  />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-[16px] border border-black/10 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-black/5">
                    <p className="text-xs font-bold text-[#0D0C22] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    id="nav-user-creator-profile-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('creator-profile', '/profile');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-neutral-500" />
                    <span>Profil Saya</span>
                  </button>

                  <button
                    id="nav-user-wallet-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push('/wallet');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <WalletCards className="w-4 h-4 text-neutral-500" />
                    <span>Dompet & Saldo</span>
                  </button>

                  <button
                    id="nav-user-contracts-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push('/contracts');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4 text-neutral-500" />
                    <span>Kontrak Saya</span>
                  </button>

                  {currentUser.role === 'school' && (
                    <button
                      id="nav-user-school-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/dashboard/school');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-neutral-500" />
                      <span>Dashboard Sekolah</span>
                    </button>
                  )}

                  <button
                    id="nav-user-settings-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('settings', '/settings');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-neutral-500" />
                    <span>Pengaturan</span>
                  </button>

                  <div className="my-1 border-t border-black/5" />

                  <button
                    id="nav-user-logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleSignOutAction();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-signin-btn"
                onClick={() => navigateTo('signin', '/sign-in')}
                className="hidden sm:inline-flex h-10 px-4 text-xs sm:text-sm font-semibold text-[#0D0B0B] hover:text-[#155DFC] hover:bg-[#F3F3F4] rounded-xl transition-colors cursor-pointer items-center justify-center shrink-0 border border-transparent"
              >
                Masuk
              </button>
              <button
                id="nav-signup-btn"
                onClick={() => navigateTo('signup', '/sign-up')}
                className="inline-flex h-10 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white bg-[#155DFC] hover:bg-[#0E4CD1] rounded-xl transition-colors cursor-pointer items-center justify-center shrink-0 shadow-2xs"
              >
                Daftar
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="p-2 lg:hidden text-neutral-700 hover:text-[#0D0C22] rounded-[8px] hover:bg-[#F3F3F4] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {isSearchVisible && (
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-neutral-100 rounded-full p-2 pl-4">
              <input
                type="text"
                value={navSearchInput}
                onChange={(e) => {
                  setNavSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder="Cari talenta atau keahlian..."
                className="w-full bg-transparent text-sm text-[#0d0c22] focus:outline-hidden"
              />
              <button type="submit" className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center" aria-label="Cari">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="flex flex-col space-y-2 pt-2 text-sm font-semibold text-[#0d0c22]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('home', '/');
              }}
              className="py-2 text-left hover:text-blue-600 text-neutral-800 font-bold"
            >
              Beranda
            </button>
            {isCreator ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('explore', '/explore');
                }}
                className={`py-2 text-left hover:text-blue-600 ${
                  pathname?.startsWith('/explore') ? 'text-blue-600 font-bold' : 'text-neutral-600'
                }`}
              >
                Explore
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('services', '/jelajah/layanan');
                  }}
                  className={`py-2 text-left hover:text-blue-600 ${
                    pathname?.startsWith('/jelajah/layanan') ? 'text-blue-600 font-bold' : 'text-neutral-600'
                  }`}
                >
                  Layanan Kreator
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('projects', '/jelajah/proyek');
                  }}
                  className={`py-2 text-left hover:text-blue-600 ${
                    pathname?.startsWith('/jelajah/proyek') ? 'text-blue-600 font-bold' : 'text-neutral-600'
                  }`}
                >
                  Portofolio Project
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('creator-profile', '/jelajah/kreator');
                  }}
                  className={`py-2 text-left hover:text-blue-600 ${
                    pathname?.startsWith('/jelajah/kreator') ? 'text-blue-600 font-bold' : 'text-neutral-600'
                  }`}
                >
                  Profil Kreator
                </button>
              </>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('briefs', '/briefs');
              }}
              className="py-2 text-left hover:text-blue-600 text-neutral-600"
            >
              Brief Proyek
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('collaboration-room', '/contracts');
              }}
              className="py-2 text-left hover:text-blue-600 text-neutral-600"
            >
              Kontrak Kerja
            </button>
          </div>

          {!currentUser && (
            <div className="pt-4 border-t border-neutral-100 flex gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('signin', '/sign-in');
                }}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-[#0d0c22] border border-neutral-200 rounded-xl"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('signup', '/sign-up');
                }}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-xl"
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
