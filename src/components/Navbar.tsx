import React, { useState, useRef, useEffect } from 'react';
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
  Building2
} from 'lucide-react';
import { ActivePage, AuthState } from '../types';

interface NavbarProps {
  currentUser?: AuthState['user'];
  onNavigate: (page: ActivePage) => void;
  onSignOut?: () => void;
  onSearch?: (query: string) => void;
  onOpenBriefModal?: () => void;
  onSelectTag?: (tag: string) => void;
  activePage?: ActivePage;
  showSearch?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onNavigate, 
  onSignOut,
  onSearch,
  onSelectTag,
  activePage,
  showSearch = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchInput, setNavSearchInput] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(event.target as Node)) {
        setExploreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <header id="main-header" className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200/80 transition-all font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Sisi Kiri: Logo Brand & Search Bar Dribbble Style */}
        <div className={`flex items-center gap-6 xl:gap-8 ${showSearch ? 'flex-1 max-w-2xl' : 'shrink-0'}`}>
          
          {/* Logo Creatorin */}
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 shrink-0 group text-left cursor-pointer focus:outline-hidden"
            aria-label="Creatorin"
          >
            <img
              src="/creatorin/logo.svg"
              alt=""
              className="h-[32px] w-[34px] shrink-0"
              aria-hidden="true"
            />
            <span className="text-[23.794px] font-medium leading-none tracking-[-0.714px] text-black font-[var(--font-logo)]">
              Creatorin
            </span>
          </button>

          {showSearch && (
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center w-full max-w-md bg-neutral-100 hover:bg-neutral-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0d0c22] rounded-full p-1.5 pl-5 transition-all border border-transparent focus-within:border-transparent"
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
                className="w-full bg-transparent text-xs sm:text-sm text-[#0d0c22] placeholder:text-neutral-400 focus:outline-hidden"
              />
              
              {/* Blue Search Button */}
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition shadow-2xs cursor-pointer ml-2"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Tengah: Nav Link (Beranda, Jelajah & Collaboration Room) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#0d0c22]">
          
          {/* Nav Link Beranda */}
          <button
            id="nav-beranda-link"
            onClick={() => onNavigate('home')}
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:font-bold"
          >
            <span>Beranda</span>
          </button>

          {/* Dropdown Jelajah dengan Sub-navigasi on Hover & Smooth Animation */}
          <div 
            className="relative py-6 group/explore"
            onMouseEnter={() => setExploreDropdownOpen(true)}
            onMouseLeave={() => setExploreDropdownOpen(false)}
          >
            <button
              onClick={() => onNavigate('projects')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[#0d0c22] group-hover/explore:text-blue-600"
            >
              <span>Jelajah</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 text-neutral-500 group-hover/explore:rotate-180 group-hover/explore:text-blue-600" />
            </button>

            {/* Sub-navigasi Panel dengan Animasi Mulus */}
            <div 
              className={`absolute left-0 top-[calc(100%-12px)] w-64 bg-white rounded-2xl border border-neutral-200/90 shadow-2xl py-3 px-2 z-50 transition-all duration-200 origin-top-left ${
                exploreDropdownOpen 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible' 
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}
            >
              {/* Invisible bridge to prevent hover loss */}
              <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />
              
              {/* Bagian Atas: Profil, Proyek, Layanan dengan Icon */}
              <div className="space-y-0.5 pb-2.5 mb-2.5 border-b border-neutral-100">
                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    onNavigate('projects');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-[#0d0c22] hover:bg-neutral-50 flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <TrendingUp className="w-4 h-4 text-neutral-800 group-hover/item:text-blue-600 transition-colors" />
                  <div>
                    <span className="block">Feed Proyek (Explore)</span>
                    <span className="text-[10px] font-normal text-neutral-400">Reels, TikTok & Visual Feed</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    onNavigate('landing');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-[#0d0c22] hover:bg-neutral-50 flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <UserCheck className="w-4 h-4 text-neutral-800 group-hover/item:text-blue-600 transition-colors" />
                  <span>Kreator & Profil</span>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    onNavigate('umkm-profile');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-[#0d0c22] hover:bg-neutral-50 flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <Building2 className="w-4 h-4 text-neutral-800 group-hover/item:text-blue-600 transition-colors" />
                  <div>
                    <span className="block">Profil UMKM & Brand</span>
                    <span className="text-[10px] font-normal text-neutral-400">Brief Aktif & Reputasi Klien</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setExploreDropdownOpen(false);
                    onNavigate('services');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-[#0d0c22] hover:bg-neutral-50 flex items-center gap-3 transition-colors cursor-pointer group/item"
                >
                  <Briefcase className="w-4 h-4 text-neutral-800 group-hover/item:text-blue-600 transition-colors" />
                  <span>Katalog Layanan</span>
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
                      onNavigate('projects');
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-left text-[13px] font-semibold text-neutral-700 hover:text-[#0d0c22] hover:bg-neutral-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>

          <button
            id="nav-collab-room-btn"
            onClick={() => onNavigate('collaboration-room')}
            className={`hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold ${
              activePage === 'collaboration-room' ? 'text-blue-600 font-bold' : 'text-neutral-700'
            }`}
          >
            <span>Collaboration Room</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          </button>

          {/* Menu Brief Proyek (Nav Item di samping Collaboration Room) */}
          <button
            id="nav-start-brief-btn"
            onClick={() => onNavigate('briefs')}
            className={`hover:text-blue-600 transition-colors cursor-pointer font-semibold ${
              activePage === 'briefs' ? 'text-blue-600 font-bold' : 'text-neutral-700'
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
            onClick={() => onNavigate('chat')}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-[#0d0c22] transition-colors relative cursor-pointer"
            aria-label="Messages"
            title="Buka Ruang Obrolan & Pesan"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Ikon Notifikasi */}
          <button
            id="nav-notifications-btn"
            onClick={() => onNavigate('notifications')}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-[#0d0c22] transition-colors relative cursor-pointer"
            aria-label="Notifications"
            title="Buka Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile Avatar / Sign In Buttons */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-neutral-100">
                    <div className="text-xs font-bold text-[#0d0c22] truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-neutral-400 truncate">{currentUser.email}</div>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 capitalize">
                      {currentUser.role === 'creator' ? 'Content Creator' : 'UMKM / Brand'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('chat');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-neutral-400" />
                    <span>Pesan & Diskusi</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('notifications');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-neutral-400" />
                    <span>Notifikasi</span>
                  </button>
                  <button
                    id="nav-user-umkm-profile-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('umkm-profile');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Profil UMKM / Brand</span>
                  </button>
                  <button
                    id="nav-user-creator-profile-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('creator-profile');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    <span>Profil Kreator</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-signin-btn"
                onClick={() => onNavigate('signin')}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0d0c22] hover:text-blue-600 transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button
                id="nav-signup-btn"
                onClick={() => onNavigate('signup')}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0d0c22] hover:bg-[#2b2a45] rounded-full transition shadow-xs cursor-pointer"
              >
                Daftar
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-neutral-700 hover:text-[#0d0c22] rounded-xl hover:bg-neutral-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {showSearch && (
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
                onNavigate('home');
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
                        onNavigate('landing');
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
                        onNavigate('umkm-profile');
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
                        onNavigate('projects');
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
                        onNavigate('services');
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
                        onNavigate('services');
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
                onNavigate('collaboration-room'); 
              }} 
              className={`py-2 text-left hover:text-blue-600 font-semibold flex items-center justify-between ${
                activePage === 'collaboration-room' ? 'text-blue-600 font-bold' : 'text-neutral-700'
              }`}
            >
              <span>Collaboration Room</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <button 
              onClick={() => { 
                setMobileMenuOpen(false); 
                onNavigate('briefs'); 
              }} 
              className={`py-2 text-left hover:text-blue-600 font-semibold ${
                activePage === 'briefs' ? 'text-blue-600' : 'text-neutral-700'
              }`}
            >
              <span>Brief Proyek</span>
            </button>

            <button 
              onClick={() => { 
                setMobileMenuOpen(false); 
                onNavigate('chat');
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
                onNavigate('notifications');
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
                onClick={() => { setMobileMenuOpen(false); onNavigate('signin'); }}
                className="py-2.5 border border-neutral-200 text-[#0d0c22] text-xs font-semibold rounded-full"
              >
                Masuk
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('signup'); }}
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
