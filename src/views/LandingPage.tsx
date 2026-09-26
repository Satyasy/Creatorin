import React, { useState, useMemo } from 'react';
import { Navbar } from './Navbar';
import { MOCK_CREATORS } from '../data/mockCreators';
import { Creator, CreatorCategory, AuthState, ActivePage } from '../types';
import { ProfileModal } from './ProfileModal';
import { ProjectBriefModal } from './ProjectBriefModal';
import { Footer } from './Footer';
import { 
  ShieldCheck, 
  Star, 
  Check, 
  MapPin, 
  Clock, 
  Layers, 
  SlidersHorizontal, 
  ChevronDown, 
  Bookmark, 
  Send, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Filter,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

interface LandingPageProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

const POPULAR_TAGS = [
  '#Kuliner',
  '#TikTokViral',
  '#InstagramReels',
  '#ReviewProduk',
  '#DesainPoster',
  '#FotoProduk',
  '#FeedInstagram',
  '#LogoUMKM',
  '#BannerPromo'
];

export const LandingPage: React.FC<LandingPageProps> = ({ currentUser, onSignOut, onNavigate, onViewCreatorProfile }) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBudget, setSelectedBudget] = useState<string>('Semua');
  const [selectedLocation, setSelectedLocation] = useState<string>('Semua');
  const [selectedScore, setSelectedScore] = useState<string>('Semua');
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Saved Creators set
  const [savedCreators, setSavedCreators] = useState<Set<string>>(new Set());

  // Modals state
  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<Creator | null>(null);
  const [targetCreatorForBrief, setTargetCreatorForBrief] = useState<Creator | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  // Toggle Save Creator
  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCreators(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open Brief Modal
  const handleOpenBrief = (creator?: Creator, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetCreatorForBrief(creator || null);
    setIsBriefModalOpen(true);
  };

  // Filtered Creators list
  const filteredCreators = useMemo(() => {
    return MOCK_CREATORS.filter((creator) => {
      // Search input filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (creator.name?.toLowerCase() || '').includes(q);
        const matchesSkills = (creator.skills || []).some(s => (s?.toLowerCase() || '').includes(q));
        const matchesRole = (creator.roleTitle?.toLowerCase() || '').includes(q);
        const matchesLoc = (creator.location?.toLowerCase() || '').includes(q);
        if (!matchesName && !matchesSkills && !matchesRole && !matchesLoc) return false;
      }

      // Tag filter
      if (selectedTag) {
        const rawTag = selectedTag.toLowerCase().replace('#', '');
        
        // Flexible keyword matching for hashtags commonly used by UMKM and nano/micro creators
        const tagKeywords: Record<string, string[]> = {
          'kuliner': ['kuliner', 'fnb', 'makanan', 'food', 'minuman', 'cafe', 'resto', 'beauty', 'e-commerce'],
          'tiktokviral': ['tiktok', 'tiktok ugc', 'video', 'capcut', 'viral', 'reels'],
          'instagramreels': ['reels', 'instagram reels', 'short reels', 'video', 'ig', 'instagram'],
          'reviewproduk': ['review', 'ugc', 'unboxing', 'product showcase', 'voiceover', 'video', 'product'],
          'desainposter': ['poster', 'desain', 'photoshop', 'canva', 'banner', 'grafis', 'branding'],
          'fotoproduk': ['foto produk', 'product photography', 'product showcase', 'katalog', 'flatlay', 'image'],
          'feedinstagram': ['feed', 'social media feed', 'canva', 'photoshop', 'branding', 'carousel'],
          'logoumkm': ['logo', 'brand identity', 'branding', 'redesign', 'identitas'],
          'bannerpromo': ['banner', 'banner e-commerce', 'marketing', 'poster', 'diskon', 'promo']
        };

        const keywords = tagKeywords[rawTag] || [rawTag];
        const matchesSkill = (creator.skills || []).some(s => keywords.some(k => (s?.toLowerCase() || '').includes(k)));
        const matchesCat = keywords.some(k => (creator.category?.toLowerCase() || '').includes(k));
        const matchesRole = keywords.some(k => (creator.roleTitle?.toLowerCase() || '').includes(k));
        const matchesBio = keywords.some(k => (creator.bio?.toLowerCase() || '').includes(k));
        const matchesPortfolio = creator.portfolioSamples?.some(p => keywords.some(k => (p.categoryTag?.toLowerCase() || '').includes(k) || (p.title?.toLowerCase() || '').includes(k)));
        
        if (!matchesSkill && !matchesCat && !matchesRole && !matchesBio && !matchesPortfolio) return false;
      }

      // Category filter
      if (selectedCategory !== 'Semua') {
        const cat = selectedCategory.toLowerCase();
        const catKeywords: Record<string, string[]> = {
          'reels instagram': ['reels', 'instagram reels', 'short reels', 'video'],
          'video tiktok': ['tiktok', 'tiktok ugc', 'video', 'capcut'],
          'feed instagram': ['feed', 'social media feed', 'desain feed', 'canva', 'photoshop', 'branding'],
          'poster': ['poster', 'brand identity', 'ui mockups', 'packaging', 'banner'],
          'banner': ['banner', 'banner e-commerce', 'marketing', 'design'],
          'brosur': ['brosur', 'brochure', 'marketing', 'packaging', 'brand identity', 'catalog'],
          'logo': ['logo', 'brand identity', 'branding', 'redesign'],
          'foto produk': ['foto produk', 'product photography', 'product showcase', 'catalog shoot', 'flatlay']
        };

        const keywords = catKeywords[cat] || [cat];
        const matchesSkill = (creator.skills || []).some(s => keywords.some(k => (s?.toLowerCase() || '').includes(k)));
        const matchesCat = keywords.some(k => (creator.category?.toLowerCase() || '').includes(k));
        const matchesRole = keywords.some(k => (creator.roleTitle?.toLowerCase() || '').includes(k));
        const matchesBio = keywords.some(k => (creator.bio?.toLowerCase() || '').includes(k));
        const matchesPortfolio = creator.portfolioSamples?.some(p => keywords.some(k => (p.categoryTag?.toLowerCase() || '').includes(k) || (p.title?.toLowerCase() || '').includes(k)));
        
        if (!matchesSkill && !matchesCat && !matchesRole && !matchesBio && !matchesPortfolio) return false;
      }

      // Budget filter
      if (selectedBudget === 'under500' && creator.startingRate > 500000) return false;
      if (selectedBudget === 'mid' && (creator.startingRate <= 500000 || creator.startingRate > 1500000)) return false;
      if (selectedBudget === 'high' && creator.startingRate <= 1500000) return false;

      // Location filter
      if (selectedLocation !== 'Semua' && !creator.location.includes(selectedLocation)) {
        return false;
      }

      // Score filter
      if (selectedScore === '95+' && creator.careerScore.overall < 95) return false;
      if (selectedScore === '90+' && creator.careerScore.overall < 90) return false;

      return true;
    });
  }, [searchQuery, selectedTag, selectedCategory, selectedBudget, selectedLocation, selectedScore]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-[#0d0c22] selection:text-white text-[#0d0c22]">
      
      {/* Top Navbar Dribbble Style */}
      <Navbar
        currentUser={currentUser}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
        onSearch={(q) => setSearchQuery(q)}
        onOpenBriefModal={() => handleOpenBrief()}
        onSelectTag={(tag) => setSelectedTag(tag)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-2.5">
          <button 
            onClick={() => onNavigate('landing')}
            className="hover:text-neutral-900 transition cursor-pointer"
          >
            Jelajah
          </button>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">Profil Kreator</span>
        </div>

        {/* Page Title & Subtitle Header (Clean, Compact, Above-The-Fold Hero) */}
        <div className="mb-5 space-y-2.5">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0d0c22] tracking-tight leading-tight">
              Jelajah Profil Kreator & Talenta Terverifikasi
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              Telusuri portofolio karya asli, bandingkan Career Score & performa nyata kreator, dan hubungi langsung.
            </p>
          </div>

          {/* Popular Tag Pills (Compact & Refined) */}
          <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <span>Tagar Populer:</span>
            </span>
            {POPULAR_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#0d0c22] text-white border-[#0d0c22] shadow-2xs font-semibold' 
                      : 'bg-white text-neutral-600 border-neutral-200/90 hover:border-neutral-400 hover:text-[#0d0c22] hover:bg-neutral-50'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-xs text-blue-600 font-semibold hover:underline ml-1.5 cursor-pointer"
              >
                Reset Tagar
              </button>
            )}
          </div>
        </div>

        {/* Section Heading: Cari Talenta Berdasarkan Kategori & Filter Toolbar */}
        <div className="pt-4 pb-4 border-t border-neutral-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <h2 className="text-base sm:text-lg font-bold text-[#0d0c22]">
              Cari Talenta berdasarkan Kategori
            </h2>

            {/* Filter Buttons Group (Dribbble Toolbar) */}
            <div className="flex flex-wrap items-center gap-2 relative">
              
              {/* Filter Icon Button */}
              <button 
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSelectedBudget('Semua');
                  setSelectedLocation('Semua');
                  setSelectedScore('Semua');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition cursor-pointer"
                title="Reset Semua Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown 1: Kategori */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'kategori' ? null : 'kategori')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedCategory !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'kategori' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in max-h-72 overflow-y-auto">
                    {[
                      'Semua',
                      'Reels Instagram',
                      'Video Tiktok',
                      'Feed Instagram',
                      'Poster',
                      'Banner',
                      'Brosur',
                      'Logo',
                      'Foto Produk'
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Budget */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'budget' ? null : 'budget')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedBudget !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>
                    {selectedBudget === 'Semua' ? 'Budget' : selectedBudget === 'under500' ? '< Rp500rb' : selectedBudget === 'mid' ? 'Rp500rb - Rp1.5jt' : '> Rp1.5jt'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'budget' && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: 'Semua Budget', val: 'Semua' },
                      { label: 'Di bawah Rp500.000', val: 'under500' },
                      { label: 'Rp500.000 - Rp1.500.000', val: 'mid' },
                      { label: 'Di atas Rp1.500.000', val: 'high' }
                    ].map((b) => (
                      <button
                        key={b.val}
                        onClick={() => {
                          setSelectedBudget(b.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedBudget === b.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{b.label}</span>
                        {selectedBudget === b.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 3: Lokasi */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'lokasi' ? null : 'lokasi')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedLocation !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedLocation === 'Semua' ? 'Lokasi' : selectedLocation}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'lokasi' && (
                  <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {['Semua', 'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedLocation === loc ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{loc}</span>
                        {selectedLocation === loc && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 4: Career Score */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 bg-white transition cursor-pointer ${
                    selectedScore !== 'Semua' ? 'border-[#0d0c22] text-[#0d0c22] bg-neutral-50' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span>{selectedScore === 'Semua' ? 'Rating / Score' : `Score ${selectedScore}`}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {openDropdown === 'rating' && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-30 animate-in fade-in">
                    {[
                      { label: 'Semua Skor', val: 'Semua' },
                      { label: 'Score 95+ (Top Tier)', val: '95+' },
                      { label: 'Score 90+ (Rising Star)', val: '90+' }
                    ].map((s) => (
                      <button
                        key={s.val}
                        onClick={() => {
                          setSelectedScore(s.val);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-neutral-50 flex items-center justify-between cursor-pointer ${
                          selectedScore === s.val ? 'font-bold text-[#0d0c22]' : 'text-neutral-600'
                        }`}
                      >
                        <span>{s.label}</span>
                        {selectedScore === s.val && <Check className="w-3.5 h-3.5 text-[#0d0c22]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Results Counter & Notification */}
        <div className="text-xs font-medium text-neutral-400 mb-6 flex items-center justify-between">
          <span>Menampilkan <strong>{filteredCreators.length}</strong> kreator terverifikasi</span>
          {(selectedCategory !== 'Semua' || selectedBudget !== 'Semua' || selectedLocation !== 'Semua' || selectedScore !== 'Semua' || selectedTag || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSelectedBudget('Semua');
                setSelectedLocation('Semua');
                setSelectedScore('Semua');
                setSelectedTag(null);
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Hapus semua filter
            </button>
          )}
        </div>

        {/* LIST KREATOR: TAMPILAN SHOWCASE CARD ALA DRIBBBLE (Persis Gambar Uploaded) */}
        <div className="space-y-6">
          {filteredCreators.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
              <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#0d0c22]">Tidak Ada Kreator yang Sesuai</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat kreator berbakat lainnya.
              </p>
            </div>
          ) : (
            filteredCreators.map((creator) => {
              const isSaved = savedCreators.has(creator.id);

              return (
                <div
                  key={creator.id}
                  id={`creator-card-${creator.id}`}
                  onClick={() => {
                    if (onViewCreatorProfile) {
                      onViewCreatorProfile(creator);
                    } else {
                      setSelectedCreatorForModal(creator);
                    }
                  }}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 hover:border-neutral-300 p-6 sm:p-8 transition-all shadow-xs hover:shadow-md cursor-pointer text-left"
                >
                  
                  {/* BARIS 1: Header Profil Kreator, Badges, & Action Buttons */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Identitas Kreator */}
                    <div className="flex items-start sm:items-center gap-4">
                      
                      {/* Avatar Kreator dengan Badge */}
                      <div className="relative shrink-0">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-neutral-100"
                        />
                        {creator.careerScore.overall >= 95 && (
                          <div className="absolute -bottom-1 -right-1 bg-[#0d0c22] text-white p-1 rounded-full ring-2 ring-white">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                          </div>
                        )}
                      </div>

                      {/* Detail Nama & Status Promoted */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0d0c22]">
                            {creator.name}
                          </h3>

                          {creator.proBadge && (
                            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#0d0c22] text-white tracking-wider">
                              PRO+
                            </span>
                          )}

                          {creator.selectBadge && (
                            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#2b2a45] text-neutral-200 tracking-wider">
                              SELECT
                            </span>
                          )}

                          <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{creator.careerScore.clientRating}</span>
                            <span className="text-neutral-400 font-normal">({creator.careerScore.completedProjects})</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 ml-1">
                            <Check className="w-3.5 h-3.5 text-neutral-900 stroke-[3]" />
                            <span>{creator.careerScore.completedProjects} proyek selesai</span>
                          </div>

                          {creator.isPromoted && (
                            <span className="text-[11px] font-medium text-neutral-400 ml-1">
                              Promoted
                            </span>
                          )}
                        </div>

                        {/* Sub-info Row (Harga, Lokasi, Respon, Layanan) */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mt-2">
                          <span className="font-semibold text-neutral-800">
                            Mulai {creator.formattedRate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {creator.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            {creator.responseTime || 'Merespons cepat'}
                          </span>
                          <span>•</span>
                          <span>{creator.servicesAvailableCount || 8} Layanan tersedia</span>
                        </div>

                      </div>

                    </div>

                    {/* Sisi Kanan: Bookmark & Tombol "Hubungi" (Get in touch) */}
                    <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                      
                      {/* Save Button */}
                      <button
                        onClick={(e) => toggleSave(creator.id, e)}
                        className={`p-2.5 rounded-full border transition cursor-pointer ${
                          isSaved 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
                        }`}
                        title="Simpan Kreator"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                      </button>

                      {/* Tombol Get in touch (Hitam pekat ala Dribbble) */}
                      <button
                        onClick={(e) => handleOpenBrief(creator, e)}
                        className="px-5 sm:px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-[#2b2a45] text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2"
                      >
                        <span>Hubungi</span>
                      </button>

                    </div>

                  </div>

                  {/* BARIS 2: Card Layanan Kreator (Minimal 4 Card Layanan: Cover Image, Judul Layanan, & Harga Bersih) */}
                  {(() => {
                    const defaultServices = [
                      {
                        id: `srv-${creator.id}-1`,
                        title: `1x Layanan Konten ${creator.category === 'Video' ? 'Reels & TikTok UGC' : 'Feed & Desain Visual'}`,
                        formattedPrice: creator.formattedRate.replace('/proyek', '').replace('/video', '').replace('/sesi', ''),
                        price: creator.startingRate,
                        coverImage: creator.portfolioSamples?.[0]?.thumbnail || '/creatorin/service-pattern-1.png',
                        tag: creator.category === 'Video' ? 'UGC Video' : 'Design',
                        deliveryDays: '2 Hari Kerja'
                      },
                      {
                        id: `srv-${creator.id}-2`,
                        title: `Paket Lengkap Promosi Brand UMKM`,
                        formattedPrice: `Rp${(creator.startingRate * 2).toLocaleString('id-ID')}`,
                        price: creator.startingRate * 2,
                        coverImage: creator.portfolioSamples?.[1]?.thumbnail || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
                        tag: 'Paket Brand',
                        deliveryDays: '3 Hari Kerja'
                      },
                      {
                        id: `srv-${creator.id}-3`,
                        title: `Campaign Visual & Konten Prioritas`,
                        formattedPrice: `Rp${(creator.startingRate * 3).toLocaleString('id-ID')}`,
                        price: creator.startingRate * 3,
                        coverImage: creator.portfolioSamples?.[2]?.thumbnail || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
                        tag: 'Campaign',
                        deliveryDays: '5 Hari Kerja'
                      },
                      {
                        id: `srv-${creator.id}-4`,
                        title: `Layanan Custom & Retainer Bulanan`,
                        formattedPrice: `Rp${(creator.startingRate * 4).toLocaleString('id-ID')}`,
                        price: creator.startingRate * 4,
                        coverImage: creator.portfolioSamples?.[3]?.thumbnail || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
                        tag: 'Custom Retainer',
                        deliveryDays: '7 Hari Kerja'
                      }
                    ];

                    const servicesList = (creator.services && creator.services.length >= 4)
                      ? creator.services.slice(0, 4)
                      : (creator.services && creator.services.length > 0)
                        ? [...creator.services, ...defaultServices.slice(creator.services.length)].slice(0, 4)
                        : defaultServices;

                    return (
                      <div className="mt-5 pt-4 border-t border-neutral-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
                          {servicesList.map((service, srvIdx) => {
                            const imageSrc = service.coverImage || 
                              creator.portfolioSamples?.[srvIdx % (creator.portfolioSamples?.length || 1)]?.thumbnail ||
                              '/creatorin/service-pattern-1.png';

                            return (
                              <div
                                key={service.id}
                                id={`service-card-${service.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenBrief(creator, e);
                                }}
                                className="group/srv flex flex-col cursor-pointer text-left select-none"
                              >
                                {/* Cover Image Preview (Clean Rounded, No Outer Stroke) */}
                                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-900 relative shadow-2xs group-hover/srv:shadow-md transition-all duration-300">
                                  <img
                                    src={imageSrc}
                                    alt={service.title}
                                    className="w-full h-full object-cover "
                                    loading="lazy"
                                  />
                                  
                                  {service.tag && (
                                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide">
                                      {service.tag}
                                    </div>
                                  )}

                                  <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover/srv:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/srv:translate-y-0">
                                    <span className="bg-white text-[#0d0c22] text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                      <span>Order</span>
                                      <span className="text-blue-600 font-bold">→</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Clean Title & Price Below Image */}
                                <div className="pt-3 px-0.5 space-y-1">
                                  <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0d0c22] group-hover/srv:text-blue-600 transition-colors line-clamp-1 leading-snug">
                                    {service.title}
                                  </h4>

                                  <div className="flex items-center justify-between pt-0.5">
                                    <span className="text-[13px] sm:text-[14px] font-black text-[#0d0c22] tracking-tight">
                                      {service.formattedPrice}
                                    </span>
                                    {service.deliveryDays && (
                                      <span className="text-[11px] font-medium text-neutral-400">
                                        {service.deliveryDays}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* BARIS 3: Tag Keahlian / Skills */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                    {creator.skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium hover:bg-neutral-200 transition"
                      >
                        {skill}
                      </span>
                    ))}
                    {creator.skills.length > 5 && (
                      <span className="text-xs font-medium text-neutral-400 hover:text-neutral-700">
                        +{creator.skills.length - 5} keahlian lainnya
                      </span>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </main>

      {/* Modern Rounded Footer Sesuai Referensi Gambar */}
      <Footer onNavigate={onNavigate} onOpenBrief={() => setIsBriefModalOpen(true)} />

      {/* Modal Profile Detail Kreator */}
      <ProfileModal
        creator={selectedCreatorForModal}
        onClose={() => setSelectedCreatorForModal(null)}
        onInitiateProject={(c) => handleOpenBrief(c)}
      />

      {/* Modal Buat Brief Proyek */}
      <ProjectBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        targetCreator={targetCreatorForBrief}
      />

    </div>
  );
};
