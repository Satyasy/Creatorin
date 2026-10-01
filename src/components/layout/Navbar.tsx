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
  Building2,
  Settings,
  GraduationCap
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

  const isSearchVisible = showSearch || pathname?.startsWith('/explore') || pathname?.startsWith('/briefs');

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

  // Dynamic shrinking navbar state when scrolled
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
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Tengah: Nav Link (Beranda, Jelajah & Collaboration Room) */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-9 text-sm font-semibold text-[#0D0B0B]">
          
          {/* Nav Link Beranda */}
          <button
            id="nav-beranda-link"
            onClick={() => navigateTo('home', '/')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              activePage === 'home' || pathname === '/'
                ? 'text-[#155DFC] font-bold'
                : 'text-neutral-600 hover:text-[#155DFC]'
            }`}
          >
            <span>Beranda</span>
          </button>

          {/* Dropdown Jelajah dengan Sub-navigasi on Hover & Smooth Animation */}
          <div 
            className={`relative group/explore transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}
            onMouseEnter={() => setExploreDropdownOpen(true)}
            onMouseLeave={() => setExploreDropdownOpen(false)}
          >
            <button
              onClick={() => navigateTo('projects', '/explore/projects')}
              className={`hover:text-[#155DFC] transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                pathname?.startsWith('/explore') ? 'text-[#155DFC]' : 'text-[#0D0C22]'
              } group-hover/explore:text-[#155DFC]`}
            >
              <span>Jelajah</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 text-neutral-500 group-hover/explore:rotate-180 group-hover/explore:text-[#155DFC]" />
            </button>

            {/* Sub-navigasi Panel dengan Animasi Mulus */}
            <div 
              className={`absolute left-0 top-[calc(100%-12px)] w-64 bg-white rounded-[16px] border border-black/10 shadow-lg py-3 px-2 z-50 transition-all duration-200 origin-top-left ${
                exploreDropdownOpen 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible' 
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}
            >
              {/* Invisible bridge to prevent hover loss */}
              <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />
              
              {/* Bagian Atas: Profil, Proyek, Layanan dengan Icon */}
              <div className="space-y-0.5 pb-2.5 mb-2.5 border-b border-black/5">
                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    navigateTo('projects', '/explore/projects');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[8px] text-left text-sm font-bold text-[#0D0C22] hover:bg-[#F3F3F4] flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <TrendingUp className="w-4 h-4 text-neutral-800 group-hover/item:text-[#155DFC] transition-colors" />
                  <div>
                    <span className="block">Feed Proyek (Explore)</span>
                    <span className="text-[10px] font-normal text-neutral-400">Reels, TikTok & Visual Feed</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    navigateTo('landing', '/landing');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[8px] text-left text-sm font-bold text-[#0D0C22] hover:bg-[#F3F3F4] flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <UserCheck className="w-4 h-4 text-neutral-800 group-hover/item:text-[#155DFC] transition-colors" />
                  <span>Kreator & Profil</span>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    navigateTo('umkm-profile', '/umkm/umkm-1');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[8px] text-left text-sm font-bold text-[#0D0C22] hover:bg-[#F3F3F4] flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <Building2 className="w-4 h-4 text-neutral-800 group-hover/item:text-[#155DFC] transition-colors" />
                  <div>
                    <span className="block">Profil UMKM & Brand</span>
                    <span className="text-[10px] font-normal text-neutral-400">Brief Aktif & Reputasi Klien</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    navigateTo('services', '/explore/services');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[8px] text-left text-sm font-bold text-[#0D0C22] hover:bg-[#F3F3F4] flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <Briefcase className="w-4 h-4 text-neutral-800 group-hover/item:text-[#155DFC] transition-colors" />
                  <span>Katalog Layanan</span>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    navigateTo('school-profile', '/school/smk-kreatif-indonesia');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[8px] text-left text-sm font-bold text-[#0D0C22] hover:bg-[#F3F3F4] flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <GraduationCap className="w-4 h-4 text-neutral-800 group-hover/item:text-[#155DFC] transition-colors" />
                  <div>
                    <span className="block">Profil Sekolah & Vokasi</span>
                    <span className="text-[10px] font-normal text-neutral-400">Showcase Portofolio Siswa SMK</span>
                  </div>
                </button>
              </div>

              {/* Bagian Bawah: Kategori Konten & Desain */}
              <div className="space-y-0.5">
                {CATEGORY_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setExploreDropdownOpen(false);
                      if (onSelectTag) {
                        onSelectTag(item);
                      }
                      navigateTo('projects', '/explore/projects');
                    }}
                    className="w-full px-3.5 py-2 rounded-[8px] text-left text-[13px] font-semibold text-neutral-700 hover:text-[#0D0C22] hover:bg-[#F3F3F4] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>


          {/* Menu Brief Proyek */}
          <button
            id="nav-start-brief-btn"
            onClick={() => navigateTo('briefs', '/briefs')}
            className={`hover:text-[#155DFC] transition-colors cursor-pointer font-semibold ${
              activePage === 'briefs' || (pathname && pathname.startsWith('/briefs')) ? 'text-[#155DFC] font-bold' : 'text-neutral-700'
            }`}
          >
            <span>Brief Proyek</span>
          </button>
        </nav>

        {/* Sisi Kanan: Action Buttons & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
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

          {/* User Profile Avatar / Sign In Buttons */}
          {currentUser ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                id="nav-user-profile-logo-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F3F3F4] transition cursor-pointer"
                title="Buka menu profil"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-black/10"
                  />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-[16px] border border-black/10 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95">
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
                    id="nav-user-settings-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('settings', '/settings');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-neutral-500" />
                    <span>Setting</span>
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="nav-signin-btn"
                onClick={() => navigateTo('signin', '/sign-in')}
                className="hidden sm:inline-flex h-10 px-4 text-xs sm:text-sm font-semibold text-[#0D0B0B] hover:text-[#155DFC] hover:bg-[#F3F3F4] rounded-[8px] transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button
                id="nav-signup-btn"
                onClick={() => navigateTo('signup', '/sign-up')}
                className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-[#155DFC] hover:bg-[#0E4CD1] rounded-[8px] transition-colors cursor-pointer flex items-center justify-center shrink-0"
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
              <button type="submit" className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center">
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

            <div>
              <button 
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)} 
                className="w-full py-2 flex items-center justify-between hover:text-blue-600 font-bold"
              >
                <span>Jelajah</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${exploreDropdownOpen ? 'rotate-180 text-blue-600' : 'text-neutral-400'}`} />
              </button>

              {exploreDropdownOpen && (
                <div className="pl-3 py-2 space-y-1.5 border-l-2 border-neutral-100 mb-2">
                  <div className="space-y-1 pb-2 mb-2 border-b border-neutral-100">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExploreDropdownOpen(false);
                        navigateTo('landing', '/landing');
                      }}
                      className="w-full text-left text-xs font-bold py-1.5 flex items-center gap-2 text-neutral-800"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kreator</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExploreDropdownOpen(false);
                        navigateTo('umkm-profile', '/umkm/umkm-1');
                      }}
                      className="w-full text-left text-xs font-bold py-1.5 flex items-center gap-2 text-neutral-800"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Profil UMKM</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExploreDropdownOpen(false);
                        navigateTo('projects', '/explore/projects');
                      }}
                      className="w-full text-left text-xs font-bold py-1.5 flex items-center gap-2 text-neutral-800"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>Proyek</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExploreDropdownOpen(false);
                        navigateTo('services', '/explore/services');
                      }}
                      className="w-full text-left text-xs font-bold py-1.5 flex items-center gap-2 text-neutral-800"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>Layanan</span>
                    </button>
                  </div>

                  {CATEGORY_ITEMS.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setExploreDropdownOpen(false);
                        if (onSelectTag) onSelectTag(item);
                        navigateTo('services', '/explore/services');
                      }}
                      className="w-full text-left text-xs text-neutral-600 hover:text-blue-600 py-1"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>


            <button 
              onClick={() => { 
                setMobileMenuOpen(false); 
                navigateTo('briefs', '/briefs'); 
              }} 
              className={`py-2 text-left hover:text-blue-600 font-semibold ${
                activePage === 'briefs' || (pathname && pathname.startsWith('/briefs')) ? 'text-blue-600' : 'text-neutral-700'
              }`}
            >
              <span>Brief Proyek</span>
            </button>

            <button 
              onClick={() => { 
                setMobileMenuOpen(false); 
                navigateTo('chat', '/chat');
              }} 
              className="py-2 text-left hover:text-blue-600 text-neutral-700 font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-neutral-500" />
                <span>Pesan & Obrolan</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </button>

            <button 
              onClick={() => { 
                setMobileMenuOpen(false); 
                navigateTo('notifications', '/notifications');
              }} 
              className="py-2 text-left hover:text-blue-600 text-neutral-700 font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-neutral-500" />
                <span>Notifikasi</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
          </div>

          {!currentUser && (
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigateTo('signin', '/sign-in'); }}
                className="py-2.5 border border-neutral-200 text-[#0d0c22] text-xs font-semibold rounded-full"
              >
                Masuk
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigateTo('signup', '/sign-up'); }}
                className="py-2.5 bg-[#0d0c22] text-white text-xs font-semibold rounded-full"
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
