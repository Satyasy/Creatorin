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
  Settings,
  GraduationCap,
  WalletCards,
  FileCheck2,
  ArrowUpRight
} from 'lucide-react';
import { ActivePage, AuthState } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';

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
  activePage,
  showSearch = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, signOut: authSignOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const currentUser = propUser !== undefined ? propUser : authUser;
  const isHomeActive = activePage === 'home' || pathname === '/' || pathname === '/dashboard';

  const navigateTo = (page: ActivePage, path: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    router.push(path);
  };

  const handleSignOutAction = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await authSignOut();
      window.location.href = '/';
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchInput, setNavSearchInput] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [jelajahDropdownOpen, setJelajahDropdownOpen] = useState(false);
  const jelajahDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isCreator = currentUser?.role === 'creator';
  const isSearchVisible = showSearch || pathname?.startsWith('/jelajah') || pathname?.startsWith('/briefs');

  // Dynamic Unread Notification & Message Counts (No fake dots!)
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }

    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const notifRes = await fetch('/api/notifications', { cache: 'no-store' });
        if (notifRes.ok) {
          const data = await notifRes.json();
          if (isMounted && Array.isArray(data.notifications)) {
            const unreadCount = data.notifications.filter((n: any) => !n.isRead).length;
            setUnreadNotifications(unreadCount);
          }
        }
      } catch {
        // Ignore network errors in silent polling
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jelajahDropdownRef.current && !jelajahDropdownRef.current.contains(event.target as Node)) {
        setJelajahDropdownOpen(false);
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
      if (!pathname?.startsWith('/jelajah')) {
        router.push(`/jelajah/kreator?q=${encodeURIComponent(navSearchInput)}`);
      }
    } else {
      if (!pathname?.startsWith('/jelajah')) {
        router.push(`/jelajah/layanan?q=${encodeURIComponent(navSearchInput)}`);
      }
    }
  };

  return (
    <header 
      id="main-header" 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out font-sans ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#E1E3EA]' 
          : isHomeActive 
            ? 'bg-transparent border-b border-transparent' 
            : 'bg-white border-b border-[#E1E3EA]'
      }`}
    >
      <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out flex items-center justify-between gap-4 ${
        isScrolled ? 'h-16' : 'h-[72px]'
      }`}>
        
        {/* Sisi Kiri: Logo Brand & Search Bar Dribbble Style */}
        <div className={`flex items-center gap-6 xl:gap-8 ${isSearchVisible ? 'flex-1 max-w-2xl' : 'shrink-0'}`}>
          
          {/* Logo Creatorin */}
          <button
            id="nav-logo-btn"
            onClick={() => navigateTo('home', '/')}
            className="inline-flex items-center gap-2.5 shrink-0 group text-left cursor-pointer focus:outline-hidden"
            aria-label="Creatorin"
          >
            <img
              src="/creatorin/logo.svg"
              alt=""
              className={`shrink-0 transition-all duration-300 ease-in-out ${isScrolled ? 'h-7 w-[30px]' : 'h-8 w-[34px]'}`}
              aria-hidden="true"
            />
            <span className={`font-display font-bold leading-none tracking-tight text-[#0D0C22] transition-all duration-300 ease-in-out ${isScrolled ? 'text-xl' : 'text-[22px]'}`}>
              Creatorin
            </span>
          </button>

          {isSearchVisible && (
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center w-full max-w-md bg-[#F3F3F4] hover:bg-[#E9EAF0] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155DFC]/20 focus-within:border-[#155DFC] rounded-full p-1 pl-4 transition-all border border-[#E1E3EA]"
            >
              <input
                type="text"
                id="nav-search-input"
                value={navSearchInput}
                onChange={(e) => {
                  setNavSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder={t('nav.searchPlaceholder', 'Cari kreator, keahlian, atau video UGC...')}
                className="w-full bg-transparent text-sm font-normal text-[#0D0C22] placeholder:text-[#55576A]/60 focus:outline-hidden font-sans"
              />
              
              {/* Brand Blue Round Search Button */}
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-[#155DFC] hover:bg-[#1248C7] active:bg-[#0E3A9E] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs ml-2"
                aria-label="Cari"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </form>
          )}

        </div>

        {/* Tengah: Nav Link (Beranda, Jelajah & Brief) */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-sm font-sans">
          
          {/* Nav Link Beranda */}
          <button
            id="nav-beranda-link"
            onClick={() => navigateTo('home', '/')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer text-sm py-1.5 ${
              isHomeActive
                ? 'text-[#0D0C22] font-semibold'
                : 'text-[#55576A] font-medium hover:text-[#0D0C22]'
            }`}
          >
            <span>{t('nav.home', 'Beranda')}</span>
          </button>

          <div
            ref={jelajahDropdownRef}
            className="relative py-3"
            onMouseEnter={() => setJelajahDropdownOpen(true)}
            onMouseLeave={() => setJelajahDropdownOpen(false)}
          >
            <button
              id="nav-jelajah-link"
              type="button"
              aria-haspopup="menu"
              aria-expanded={jelajahDropdownOpen}
              onClick={() => setJelajahDropdownOpen((open) => !open)}
              className={`flex items-center gap-1 py-1.5 text-sm transition-colors cursor-pointer ${
                pathname?.startsWith('/jelajah')
                  ? 'font-semibold text-[#155DFC]'
                  : 'font-medium text-[#55576A] hover:text-[#0D0C22]'
              }`}
            >
              <span>{t('nav.browse', 'Jelajah')}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${jelajahDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {jelajahDropdownOpen && (
              <div role="menu" className="absolute top-full -left-4 z-50 w-44 rounded-xl border border-[#E1E3EA] bg-white p-1.5 shadow-md">
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setJelajahDropdownOpen(false);
                    navigateTo('creator-profile', '/jelajah/kreator');
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${pathname?.startsWith('/jelajah/kreator') ? 'bg-[#E8F0FF] font-semibold text-[#155DFC]' : 'font-medium text-[#0D0C22] hover:bg-[#F3F3F4]'}`}
                >
                  {t('nav.creators', 'Kreator')}
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setJelajahDropdownOpen(false);
                    navigateTo('services', '/jelajah/layanan');
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${pathname?.startsWith('/jelajah/layanan') ? 'bg-[#E8F0FF] font-semibold text-[#155DFC]' : 'font-medium text-[#0D0C22] hover:bg-[#F3F3F4]'}`}
                >
                  {t('nav.services', 'Layanan')}
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setJelajahDropdownOpen(false);
                    navigateTo('projects', '/jelajah/proyek');
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${pathname?.startsWith('/jelajah/proyek') ? 'bg-[#E8F0FF] font-semibold text-[#155DFC]' : 'font-medium text-[#0D0C22] hover:bg-[#F3F3F4]'}`}
                >
                  {t('nav.projects', 'Proyek')}
                </button>
              </div>
            )}
          </div>

          {/* Nav Link Brief Proyek */}
          <button
            id="nav-briefs-link"
            onClick={() => navigateTo('briefs', '/briefs')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer text-sm py-1.5 ${
              pathname?.startsWith('/briefs') 
                ? 'text-[#155DFC] font-semibold' 
                : 'text-[#55576A] font-medium hover:text-[#0D0C22]'
            }`}
          >
            <span>{t('nav.briefs', 'Brief Proyek')}</span>
          </button>

        </nav>

        {/* Sisi Kanan: Action Buttons & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 font-sans">
          
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-[#F3F3F4] rounded-full p-0.5 border border-[#E1E3EA] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer text-[11px] font-bold ${
                language === 'id' ? 'bg-[#155DFC] text-white shadow-xs' : 'text-[#55576A] hover:text-[#0D0C22]'
              }`}
              title="Bahasa Indonesia"
              aria-label="Bahasa Indonesia"
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer text-[11px] font-bold ${
                language === 'en' ? 'bg-[#155DFC] text-white shadow-xs' : 'text-[#55576A] hover:text-[#0D0C22]'
              }`}
              title="English"
              aria-label="English"
            >
              EN
            </button>
          </div>

          {currentUser && (
            <>
              {/* Ikon Pesan */}
              <button
                id="nav-chat-btn"
                onClick={() => navigateTo('chat', '/chat')}
                className="w-10 h-10 rounded-full hover:bg-[#F3F3F4] flex items-center justify-center text-[#55576A] hover:text-[#0D0C22] transition-colors relative cursor-pointer"
                aria-label="Messages"
                title="Buka Ruang Obrolan & Pesan"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#155DFC] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </button>

              {/* Ikon Notifikasi */}
              <button
                id="nav-notifications-btn"
                onClick={() => navigateTo('notifications', '/notifications')}
                className="w-10 h-10 rounded-full hover:bg-[#F3F3F4] flex items-center justify-center text-[#55576A] hover:text-[#0D0C22] transition-colors relative cursor-pointer"
                aria-label="Notifications"
                title="Buka Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D92D20] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
            </>
          )}

          {/* User Profile Avatar / Sign In Buttons */}
          {currentUser ? (
            <div className="relative" ref={userDropdownRef}>
              <div className="flex items-center gap-1">
                <button
                  id="nav-user-profile-logo-btn"
                  onClick={() => navigateTo('creator-profile', '/profile')}
                  className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#155DFC]/30 transition-all cursor-pointer group"
                  title="Buka Profil Saya"
                  aria-label="Buka Profil Saya"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-black/10 group-hover:ring-2 group-hover:ring-[#155DFC] transition-all"
                    />
                  </div>
                </button>

                <button
                  id="nav-user-menu-toggle-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-1 rounded-full text-[#55576A] hover:text-[#0D0C22] hover:bg-[#F3F3F4] transition cursor-pointer"
                  title="Buka menu akun"
                  aria-expanded={userDropdownOpen}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E1E3EA] shadow-md py-1.5 z-50 animate-in fade-in zoom-in-95 font-sans">
                  <div className="px-4 py-2 border-b border-[#E1E3EA]">
                    <p className="text-xs font-semibold text-[#0D0C22] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#55576A] truncate">{currentUser.email}</p>
                  </div>

                  <button
                    id="nav-user-creator-profile-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('creator-profile', '/profile');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-[#55576A]" />
                    <span>{t('nav.profile', 'Profil Saya')}</span>
                  </button>

                  <button
                    id="nav-user-wallet-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push('/wallet');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <WalletCards className="w-4 h-4 text-[#55576A]" />
                    <span>{t('nav.wallet', 'Dompet & Saldo')}</span>
                  </button>

                  {currentUser.role === 'creator' && (
                    <button
                      id="nav-user-contracts-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/contracts');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#55576A]" />
                      <span>{t('nav.contracts', 'Kontrak Saya')}</span>
                    </button>
                  )}

                  {currentUser.role === 'school' && (
                    <button
                      id="nav-user-school-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push('/dashboard/school');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-[#55576A]" />
                      <span>{t('nav.schoolDashboard', 'Dashboard Sekolah')}</span>
                    </button>
                  )}

                  <button
                    id="nav-user-settings-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigateTo('settings', '/settings');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#55576A]" />
                    <span>{t('nav.settings', 'Pengaturan')}</span>
                  </button>

                  <div className="my-1 border-t border-[#E1E3EA]" />

                  <button
                    id="nav-user-logout-btn"
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await handleSignOutAction();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#D92D20] hover:bg-[#FEE4E2] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#D92D20]" />
                    <span>{t('nav.signOut', 'Keluar')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="nav-signin-btn"
                onClick={() => navigateTo('signin', '/sign-in')}
                className="px-3.5 py-2 text-sm font-medium text-[#55576A] hover:text-[#0D0C22] rounded-lg hover:bg-[#F3F3F4] transition-colors cursor-pointer"
              >
                {t('nav.signIn', 'Masuk')}
              </button>

              <button
                id="nav-signup-btn"
                onClick={() => navigateTo('signin', '/sign-in')}
                className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-[#155DFC] hover:bg-[#1248C7] active:bg-[#0E3A9E] text-white text-sm font-semibold rounded-full shadow-xs transition-all group cursor-pointer"
              >
                <span>{t('nav.signUp', 'Mulai Gratis')}</span>
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#155DFC] shadow-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="p-2 lg:hidden text-[#55576A] hover:text-[#0D0C22] rounded-lg hover:bg-[#F3F3F4] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E1E3EA] bg-white px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200 font-sans">
          {isSearchVisible && (
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#F3F3F4] rounded-full p-1 pl-4 border border-[#E1E3EA]">
              <input
                type="text"
                value={navSearchInput}
                onChange={(e) => {
                  setNavSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder="Cari kreator, keahlian, atau video UGC..."
                className="w-full bg-transparent text-sm font-normal text-[#0D0C22] placeholder:text-[#55576A]/60 focus:outline-hidden"
              />
              <button 
                type="submit" 
                className="w-8 h-8 bg-[#155DFC] hover:bg-[#1248C7] text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs ml-2" 
                aria-label="Cari"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </form>
          )}

          <div className="flex flex-col space-y-1 pt-2 text-sm">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between py-2 px-3 mb-1 bg-[#F3F3F4] rounded-xl border border-[#E1E3EA]">
              <span className="text-xs font-semibold text-[#55576A]">{t('settings.languageLabel', 'Bahasa Antarmuka')}</span>
              <div className="flex items-center bg-white rounded-full p-0.5 border border-[#E1E3EA] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs font-bold ${
                    language === 'id' ? 'bg-[#155DFC] text-white shadow-xs' : 'text-[#55576A]'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs font-bold ${
                    language === 'en' ? 'bg-[#155DFC] text-white shadow-xs' : 'text-[#55576A]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('home', '/');
              }}
              className={`py-2 px-3 text-left rounded-lg transition-colors ${
                isHomeActive 
                  ? 'text-[#0D0C22] font-semibold bg-[#F3F3F4]' 
                  : 'text-[#55576A] font-medium hover:text-[#0D0C22]'
              }`}
            >
              {t('nav.home', 'Beranda')}
            </button>
            <p className="px-3 pt-2 text-xs font-semibold text-[#737373]">{t('nav.browse', 'Jelajah')}</p>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('creator-profile', '/jelajah/kreator');
              }}
              className={`rounded-lg px-3 py-2 text-left transition-colors ${pathname?.startsWith('/jelajah/kreator') ? 'bg-[#E8F0FF] font-semibold text-[#155DFC]' : 'font-medium text-[#55576A] hover:text-[#0D0C22]'}`}
            >
              {t('nav.creators', 'Kreator')}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('services', '/jelajah/layanan');
              }}
              className={`rounded-lg px-3 py-2 text-left transition-colors ${pathname?.startsWith('/jelajah/layanan') ? 'bg-[#E8F0FF] font-semibold text-[#155DFC]' : 'font-medium text-[#55576A] hover:text-[#0D0C22]'}`}
            >
              {t('nav.services', 'Layanan')}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('projects', '/jelajah/proyek');
              }}
              className={`rounded-lg px-3 py-2 text-left transition-colors ${pathname?.startsWith('/jelajah/proyek') ? 'bg-[#E8F0FF] font-semibold text-[#155DFC]' : 'font-medium text-[#55576A] hover:text-[#0D0C22]'}`}
            >
              {t('nav.projects', 'Proyek')}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('briefs', '/briefs');
              }}
              className={`py-2 px-3 text-left rounded-lg transition-colors ${
                pathname?.startsWith('/briefs') 
                  ? 'text-[#155DFC] font-semibold bg-[#E8F0FF]' 
                  : 'text-[#55576A] font-medium hover:text-[#0D0C22]'
              }`}
            >
              {t('nav.briefs', 'Brief Proyek')}
            </button>
          </div>

          {!currentUser && (
            <div className="pt-4 border-t border-[#E1E3EA] flex gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('signin', '/sign-in');
                }}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-[#0D0C22] border border-[#E1E3EA] rounded-xl hover:bg-[#F3F3F4] transition-colors"
              >
                {t('nav.signIn', 'Masuk')}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('signup', '/sign-up');
                }}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-[#155DFC] hover:bg-[#1248C7] rounded-xl transition-colors shadow-xs"
              >
                {t('nav.signUp', 'Mulai Gratis')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
