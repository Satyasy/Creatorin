import React, { useState, useMemo } from 'react';
import { Creator, CreatorCategory, AuthState, ActivePage } from '../types';
import { MOCK_CREATORS } from '../data/mockCreators';
import { CareerScoreBadge } from './CareerScoreBadge';
import { ProfileModal } from './ProfileModal';
import { 
  ShieldCheck, 
  Search, 
  SlidersHorizontal, 
  Compass, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  User, 
  LogOut, 
  MapPin, 
  Sparkles, 
  ChevronDown, 
  Filter, 
  Check, 
  ArrowUpDown, 
  Menu, 
  X,
  ExternalLink,
  Award,
  Zap,
  Building2
} from 'lucide-react';

interface ExplorePageProps {
  currentUser: AuthState['user'];
  onSignOut: () => void;
  onNavigate: (page: ActivePage) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ currentUser, onSignOut, onNavigate, onViewCreatorProfile }) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CreatorCategory>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedMinScore, setSelectedMinScore] = useState<number>(0);
  const [selectedBudget, setSelectedBudget] = useState<'All' | 'low' | 'mid' | 'high'>('All');
  const [sortBy, setSortBy] = useState<'score' | 'newest' | 'budget'>('score');

  // Sidebar & Modal states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'explore' | 'requests' | 'collab' | 'payments' | 'account'>('explore');
  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<Creator | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter and sort logic
  const filteredCreators = useMemo(() => {
    return MOCK_CREATORS.filter((creator) => {
      // Search filter (name, skills, bio, roleTitle)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = creator.name.toLowerCase().includes(q);
        const matchesSkills = creator.skills.some((s) => s.toLowerCase().includes(q));
        const matchesRole = creator.roleTitle.toLowerCase().includes(q);
        const matchesLoc = creator.location.toLowerCase().includes(q);
        if (!matchesName && !matchesSkills && !matchesRole && !matchesLoc) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && creator.category !== selectedCategory) {
        return false;
      }

      // Location filter
      if (selectedLocation !== 'All' && !creator.location.includes(selectedLocation)) {
        return false;
      }

      // Min Career Score filter
      if (selectedMinScore > 0 && creator.careerScore.overall < selectedMinScore) {
        return false;
      }

      // Budget filter
      if (selectedBudget === 'low' && creator.startingRate > 150000) return false;
      if (selectedBudget === 'mid' && (creator.startingRate <= 150000 || creator.startingRate > 200000)) return false;
      if (selectedBudget === 'high' && creator.startingRate <= 200000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') {
        return b.careerScore.overall - a.careerScore.overall;
      }
      if (sortBy === 'budget') {
        return a.startingRate - b.startingRate;
      }
      if (sortBy === 'newest') {
        return b.id.localeCompare(a.id);
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedLocation, selectedMinScore, selectedBudget, sortBy]);

  // Unique locations from data
  const locations = useMemo(() => {
    const locs = Array.from(new Set(MOCK_CREATORS.map((c) => c.location.split(' ')[0])));
    return ['All', ...locs];
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 justify-between shrink-0 h-screen sticky top-0">
        <div className="p-5 flex flex-col gap-6">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Creatorin
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-0.5">
                Trust Platform
              </span>
            </div>
          </button>

          {/* Role Status Tag */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-slate-700">
                {currentUser?.role === 'creator' ? 'Creator Mode' : 'UMKM Client Mode'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
              Verified
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              id="sidebar-nav-explore"
              onClick={() => setActiveNav('explore')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'explore'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeNav === 'explore' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Explore Creators</span>
            </button>

            <button
              id="sidebar-nav-requests"
              onClick={() => {
                setActiveNav('requests');
                showToast('My Requests: Inquiries & proposals section will be available in next prompt');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'requests'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>My Requests</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Soon</span>
            </button>

            <button
              id="sidebar-nav-collab"
              onClick={() => {
                setActiveNav('collab');
                showToast('Collaboration Room: Real-time work milestone tracker coming in next release');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'collab'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Collaboration Room</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Soon</span>
            </button>

            <button
              id="sidebar-nav-payments"
              onClick={() => {
                setActiveNav('payments');
                showToast('Payments & Escrow: Milestone payouts section');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'payments'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payments</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Soon</span>
            </button>

            <button
              id="sidebar-nav-account"
              onClick={() => {
                setActiveNav('account');
                showToast('Account Settings: Profile & verification metrics');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'account'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <span>Account</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Soon</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-4 border-t border-slate-200">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name || 'UMKM Owner'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser?.email || 'owner@business.id'}
                </div>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900">Creatorin</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="explore-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or skill (e.g. Reels, Feed Design, Surabaya)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Profile / Quick Switch */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-slate-900">{currentUser?.name || 'UMKM Owner'}</div>
                <div className="text-[10px] text-slate-500">{currentUser?.role === 'creator' ? 'Creator' : 'Business'}</div>
              </div>
            </div>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80'}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 ring-2 ring-indigo-500/10 cursor-pointer"
              onClick={onSignOut}
              title="Click to sign out"
            />
          </div>
        </header>

        {/* EXPLORE PAGE BODY */}
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          
          {/* Page Heading & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Explore Vetted Creators</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                  Career Score Verified
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing {filteredCreators.length} active nano and micro creators ready for UMKM collaborations.
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                id="explore-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="score">Highest Career Score</option>
                <option value="budget">Lowest Starting Budget</option>
                <option value="newest">Newest Joined</option>
              </select>
            </div>
          </div>

          {/* FILTER ROW */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Category Pills (All / Video / Image) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider text-[10px]">
                  Category:
                </span>
                {(['All', 'Video', 'Image'] as const).map((cat) => (
                  <button
                    key={cat}
                    id={`filter-category-${cat.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'All' ? 'All Formats' : cat === 'Video' ? '🎬 Video (Reels/TikTok)' : '🖼️ Image (Feed/Carousel)'}
                  </button>
                ))}
              </div>

              {/* Reset filter button if any filter active */}
              {(selectedCategory !== 'All' || selectedLocation !== 'All' || selectedMinScore > 0 || selectedBudget !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedLocation('All');
                    setSelectedMinScore(0);
                    setSelectedBudget('All');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Secondary Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              
              {/* CAREER SCORE MINIMUM FILTER (CORE DIFFERENTIATOR - Highlighted with Warm Amber) */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-300/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Min. Career Score
                  </label>
                  <span className="text-xs font-extrabold text-amber-950">
                    {selectedMinScore === 0 ? 'All Scores' : `${selectedMinScore}+ Score`}
                  </span>
                </div>
                <select
                  id="filter-career-score-select"
                  value={selectedMinScore}
                  onChange={(e) => setSelectedMinScore(Number(e.target.value))}
                  className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                >
                  <option value={0}>All Verified Scores (75+)</option>
                  <option value={85}>85+ (Rising Star & Top Tier)</option>
                  <option value={90}>90+ (Top Tier Only)</option>
                  <option value={93}>93+ (Elite Reliability)</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Location (Indonesia)
                  </label>
                </div>
                <select
                  id="filter-location-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Cities</option>
                  {locations.filter((l) => l !== 'All').map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range Filter */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Starting Budget
                  </label>
                </div>
                <select
                  id="filter-budget-select"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value as any)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Starting Rates</option>
                  <option value="low">Under Rp150k / project</option>
                  <option value="mid">Rp150k - Rp200k / project</option>
                  <option value="high">Above Rp200k / project</option>
                </select>
              </div>

            </div>
          </div>

          {/* MAIN CREATOR CARDS GRID */}
          {filteredCreators.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No creators match your current filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your Career Score threshold or resetting your category to see more creators.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedLocation('All');
                  setSelectedMinScore(0);
                  setSelectedBudget('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  id={`creator-card-${creator.id}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between p-5 text-left group"
                >
                  <div>
                    {/* Top Row: Circular Photo + Name + Category Badge */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 ring-2 ring-indigo-500/10 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-slate-900 text-base truncate">{creator.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            creator.category === 'Video'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {creator.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{creator.roleTitle}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{creator.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* HERO ELEMENT: Prominent Career Score Badge */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-amber-50/40 -mx-5 px-5 py-2.5 border-b border-amber-100/60">
                      <CareerScoreBadge
                        score={creator.careerScore.overall}
                        size="md"
                        tier={creator.careerScore.tier}
                        onClick={() => setSelectedCreatorForModal(creator)}
                      />
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-medium">Starting from</div>
                        <div className="text-xs font-extrabold text-slate-900">{creator.formattedRate}</div>
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {creator.bio}
                    </p>

                    {/* Skill tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {creator.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      id={`view-profile-btn-${creator.id}`}
                      onClick={() => {
                        if (onViewCreatorProfile) {
                          onViewCreatorProfile(creator);
                        } else {
                          setSelectedCreatorForModal(creator);
                        }
                      }}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Profile & Score</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative bg-white w-72 h-full p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900">Creatorin</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-800">{currentUser?.name}</div>
                <div className="text-slate-500">{currentUser?.role === 'creator' ? 'Creator Account' : 'UMKM Account'}</div>
              </div>

              <div className="space-y-1 text-sm font-medium">
                <button
                  onClick={() => {
                    setActiveNav('explore');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold"
                >
                  Explore Creators
                </button>
                <button
                  onClick={() => {
                    showToast('My Requests coming in next prompt');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  My Requests
                </button>
                <button
                  onClick={() => {
                    showToast('Collaboration Room coming soon');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Collaboration Room
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                onSignOut();
              }}
              className="w-full py-2.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Creator Profile Modal */}
      <ProfileModal
        creator={selectedCreatorForModal}
        onClose={() => setSelectedCreatorForModal(null)}
      />

    </div>
  );
};
