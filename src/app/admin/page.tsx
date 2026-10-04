'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  GraduationCap,
  LogOut,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  TrendingUp,
  Filter,
  Check,
  X,
  Menu,
} from 'lucide-react';

interface AdminStats {
  users: {
    total: number;
    admin: number;
    creator: number;
    business: number;
    school: number;
  };
  briefs: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
  };
  invoices: {
    totalCount: number;
    paidCount: number;
    unpaidCount: number;
    totalVolume: number;
    paidVolume: number;
  };
  schools: {
    total: number;
    verified: number;
    pending: number;
  };
  services: number;
  portfolioProjects: number;
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'briefs' | 'schools'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Users tab state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersFilter, setUsersFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Schools tab state
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  // Briefs tab state
  const [briefsList, setBriefsList] = useState<any[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(false);

  // Cek token saat inisialisasi
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat statistik.');
      setStats(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('creatorin_access_token');
      const url = new URL('/api/admin/users', window.location.origin);
      if (usersFilter) url.searchParams.set('role', usersFilter);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSchools = async () => {
    setSchoolsLoading(true);
    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/schools', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setSchoolsList(data.schools);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const fetchBriefs = async () => {
    setBriefsLoading(true);
    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/briefs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setBriefsList(data.briefs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBriefsLoading(false);
    }
  };

  const handleUpdateSchoolStatus = async (schoolId: string, isVerified: boolean) => {
    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/schools', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ schoolId, isVerified }),
      });
      if (res.ok) {
        fetchSchools();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('creatorin_access_token');
    localStorage.removeItem('creatorin_role');
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/admin/login');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'creatorin.my.id') {
      window.location.replace('https://api.creatorin.my.id/admin');
      return;
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'schools') fetchSchools();
    if (activeTab === 'briefs') fetchBriefs();
  }, [activeTab, usersFilter, searchQuery]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-200">
      {/* 1. Left Sidebar Navigation (Filament Style) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight block text-sm">CreatorIn</span>
              <span className="text-[10px] text-amber-400 font-mono tracking-wider uppercase block">
                Filament Admin
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pengendalian Utama
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('users');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Manajemen Users</span>
                </div>
                {stats?.users.total ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {stats.users.total}
                  </span>
                ) : null}
              </button>

              <button
                onClick={() => {
                  setActiveTab('briefs');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'briefs'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>Briefs & Proyek</span>
                </div>
                {stats?.briefs.total ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {stats.briefs.total}
                  </span>
                ) : null}
              </button>

              <button
                onClick={() => {
                  setActiveTab('schools');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'schools'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span>Verifikasi SMK</span>
                </div>
                {stats?.schools.pending ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                    {stats.schools.pending}
                  </span>
                ) : null}
              </button>
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tautan Eksternal
            </div>
            <a
              href="https://creatorin.my.id"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4" />
                <span>Frontend Publik</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">creatorin.my.id</span>
            </a>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-200 truncate">Admin CreatorIn</span>
                <span className="block text-[10px] text-emerald-400 truncate flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Super Admin
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-100 capitalize">
              {activeTab === 'overview' && 'Ringkasan Platform & Metrik'}
              {activeTab === 'users' && 'Manajemen Akun Pengguna'}
              {activeTab === 'briefs' && 'Daftar Brief & Kontrak Proyek'}
              {activeTab === 'schools' && 'Institusi SMK Vokasi'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                if (activeTab === 'users') fetchUsers();
                if (activeTab === 'schools') fetchSchools();
                if (activeTab === 'briefs') fetchBriefs();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-850 text-xs font-medium text-slate-300 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Perbarui</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>LEMP VPS Live (Postgres 17)</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Users Card */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider">Total Pengguna</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {stats?.users.total ?? 0}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">{stats?.users.creator ?? 0} Kreator</span>
                    <span>&bull;</span>
                    <span className="text-sky-400 font-semibold">{stats?.users.business ?? 0} UMKM</span>
                    <span>&bull;</span>
                    <span className="text-amber-400 font-semibold">{stats?.users.school ?? 0} SMK</span>
                  </div>
                </div>

                {/* Briefs Card */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider">Brief Pekerjaan</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {stats?.briefs.total ?? 0}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-amber-400 font-semibold">{stats?.briefs.open ?? 0} Terbuka</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-semibold">{stats?.briefs.completed ?? 0} Selesai</span>
                  </div>
                </div>

                {/* Escrow Card */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider">Volume Transaksi</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Receipt className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2 truncate">
                    {formatCurrency(stats?.invoices.paidVolume ?? 0)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{stats?.invoices.paidCount ?? 0} Transaksi Lunas</span>
                  </div>
                </div>

                {/* Schools Card */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider">SMK Terverifikasi</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {stats?.schools.verified ?? 0} <span className="text-xs font-normal text-slate-500">/ {stats?.schools.total ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{stats?.schools.pending ?? 0} Menunggu Verifikasi</span>
                  </div>
                </div>
              </div>

              {/* Filament Charts & Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Donut / Distribution Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Distribusi Pengguna</h3>
                  <p className="text-xs text-slate-400 mb-6">Proporsi akun terdaftar berdasarkan peran sistem</p>

                  <div className="flex flex-col items-center">
                    <div className="relative h-44 w-44">
                      {/* Interactive Visual SVG Pie/Donut */}
                      <svg viewBox="0 0 36 36" className="h-full w-full rotate-[-90deg]">
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="3.5" />
                        {/* Creator segment */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="3.5"
                          strokeDasharray="45 55"
                          strokeDashoffset="0"
                        />
                        {/* UMKM segment */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeDasharray="30 70"
                          strokeDashoffset="-45"
                        />
                        {/* School segment */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          strokeDasharray="20 80"
                          strokeDashoffset="-75"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{stats?.users.total ?? 0}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
                      </div>
                    </div>

                    <div className="mt-6 w-full space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <span className="text-slate-300">Creator Freelance</span>
                        </div>
                        <span className="font-semibold text-white">{stats?.users.creator ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-slate-300">UMKM / Bisnis</span>
                        </div>
                        <span className="font-semibold text-white">{stats?.users.business ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                          <span className="text-slate-300">SMK Vokasi</span>
                        </div>
                        <span className="font-semibold text-white">{stats?.users.school ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Activity Bar Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-slate-200">Aktivitas Kolaborasi & Transaksi</h3>
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-mono">
                        Q4 2026
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6">Tren volume proyek brief dan penyelesaian pekerjaan</p>

                    {/* SVG Bar Chart Visualization */}
                    <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-800">
                      {[
                        { label: 'Mei', briefs: 4, volume: 45 },
                        { label: 'Jun', briefs: 8, volume: 60 },
                        { label: 'Jul', briefs: 12, volume: 80 },
                        { label: 'Agt', briefs: 15, volume: 75 },
                        { label: 'Sep', briefs: 22, volume: 90 },
                        { label: 'Okt', briefs: 30, volume: 98 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <div className="w-full max-w-[38px] flex items-end gap-1 h-full">
                            <div
                              style={{ height: `${item.briefs * 3}%` }}
                              className="flex-1 bg-amber-500/80 rounded-t-sm group-hover:bg-amber-400 transition-all"
                              title={`Briefs: ${item.briefs}`}
                            />
                            <div
                              style={{ height: `${item.volume}%` }}
                              className="flex-1 bg-blue-500/80 rounded-t-sm group-hover:bg-blue-400 transition-all"
                              title={`Volume: ${item.volume}%`}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm bg-amber-500" />
                        <span>Brief Proyek Masuk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm bg-blue-500" />
                        <span>Realisasi Transaksi Escrow</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Layanan Aktif: <strong className="text-white">{stats?.services ?? 0}</strong></span>
                    <span className="text-slate-400">Portofolio Publik: <strong className="text-white">{stats?.portfolioProjects ?? 0}</strong></span>
                    <span className="text-slate-400">Escrow Pending: <strong className="text-amber-400">{stats?.invoices.unpaidCount ?? 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* Recent Registered Users Section */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Pengguna Terbaru</h3>
                    <p className="text-xs text-slate-400">Pendaftaran akun pengguna paling mutakhir</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Lihat Semua &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="pb-3 font-semibold">Nama Lengkap</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Peran</th>
                        <th className="pb-3 font-semibold">Terdaftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {stats?.recentUsers?.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-medium text-slate-200 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                              {u.fullName.charAt(0)}
                            </div>
                            <span>{u.fullName}</span>
                          </td>
                          <td className="py-3 text-slate-400 font-mono">{u.email}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : u.role === 'creator'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : u.role === 'business'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 font-mono">
                            {new Date(u.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950/60 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select
                    value={usersFilter}
                    onChange={(e) => setUsersFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950/60 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Semua Peran</option>
                    <option value="admin">Admin</option>
                    <option value="creator">Creator</option>
                    <option value="business">UMKM / Business</option>
                    <option value="school">SMK Vokasi</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Peran Sistem</th>
                      <th className="pb-3 font-semibold">Aksi Ubah Role</th>
                      <th className="pb-3 font-semibold">Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-medium text-slate-200 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                            {user.fullName.charAt(0)}
                          </div>
                          <span>{user.fullName}</span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono">{user.email}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : user.role === 'creator'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : user.role === 'business'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            defaultValue={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-amber-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="creator">Creator</option>
                            <option value="business">Business</option>
                            <option value="school">School</option>
                          </select>
                        </td>
                        <td className="py-3 text-slate-500 font-mono">
                          {new Date(user.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BRIEFS & PROJECTS */}
          {activeTab === 'briefs' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Daftar Brief Proyek</h3>
                  <p className="text-xs text-slate-400">Seluruh pekerjaan yang dipublikasikan oleh UMKM</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-3 font-semibold">Judul Proyek</th>
                      <th className="pb-3 font-semibold">Kategori</th>
                      <th className="pb-3 font-semibold">Budget</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {briefsList.map((brief) => (
                      <tr key={brief.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-medium text-slate-200">{brief.title}</td>
                        <td className="py-3 text-slate-400">{brief.category}</td>
                        <td className="py-3 font-mono text-emerald-400">{brief.budget}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                            {brief.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-mono">
                          {new Date(brief.createdAt).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    {briefsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          Belum ada data brief yang tersimpan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOOLS VERIFICATION */}
          {activeTab === 'schools' && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Verifikasi SMK Vokasi</h3>
                <p className="text-xs text-slate-400">Persetujuan pendaftaran kemitraan sekolah vokasi</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-3 font-semibold">Nama Sekolah</th>
                      <th className="pb-3 font-semibold">Slug Profil</th>
                      <th className="pb-3 font-semibold">Kontak PIC</th>
                      <th className="pb-3 font-semibold">Status Verifikasi</th>
                      <th className="pb-3 font-semibold">Aksi Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {schoolsList.map((school) => (
                      <tr key={school.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-medium text-slate-200 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-400" />
                          <span>{school.name}</span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono">/school/{school.slug}</td>
                        <td className="py-3 text-slate-400">{school.picName || school.picContact || '-'}</td>
                        <td className="py-3">
                          {school.isVerified ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          {school.isVerified ? (
                            <button
                              onClick={() => handleUpdateSchoolStatus(school.id, false)}
                              className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-[11px]"
                            >
                              Cabut Status
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateSchoolStatus(school.id, true)}
                              className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[11px] font-semibold"
                            >
                              Setujui Verifikasi
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {schoolsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          Tidak ada data sekolah vokasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
