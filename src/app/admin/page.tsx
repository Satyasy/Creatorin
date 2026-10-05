'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'briefs' | 'schools';

interface AdminUser {
  id: string;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
}

interface AdminBrief {
  id: string;
  title?: string | null;
  category?: string | null;
  budget?: string | number | null;
  status?: string | null;
  createdAt?: string | null;
}

interface AdminSchool {
  id: string;
  name?: string | null;
  slug?: string | null;
  picName?: string | null;
  picContact?: string | null;
  isVerified?: boolean | null;
}

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
  recentUsers: AdminUser[];
}

const tabs: Array<{ id: AdminTab; label: string; helper: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Ringkasan', helper: 'Metrik platform', icon: LayoutDashboard },
  { id: 'users', label: 'Pengguna', helper: 'Role dan akses', icon: UsersRound },
  { id: 'briefs', label: 'Brief proyek', helper: 'Pekerjaan UMKM', icon: BriefcaseBusiness },
  { id: 'schools', label: 'SMK vokasi', helper: 'Verifikasi sekolah', icon: GraduationCap },
];

const roleOptions = [
  { value: '', label: 'Semua peran' },
  { value: 'admin', label: 'Admin' },
  { value: 'creator', label: 'Creator' },
  { value: 'business', label: 'UMKM' },
  { value: 'school', label: 'SMK' },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  creator: 'Creator',
  business: 'UMKM',
  school: 'SMK',
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value || 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getNameInitial(name?: string | null) {
  return (name || 'A').trim().charAt(0).toUpperCase();
}

function roleBadgeClass(role?: string | null) {
  if (role === 'admin') return 'border-[#FEE4E2] bg-[#FEE4E2] text-[#912018]';
  if (role === 'creator') return 'border-[#E8F0FF] bg-[#E8F0FF] text-[#0D2A75]';
  if (role === 'business') return 'border-[#DCFCE7] bg-[#DCFCE7] text-[#14532D]';
  return 'border-[#FFF4D6] bg-[#FFF4D6] text-[#7A2E0E]';
}

function statusBadgeClass(status?: string | null) {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('selesai')) {
    return 'border-[#DCFCE7] bg-[#DCFCE7] text-[#14532D]';
  }
  if (normalized.includes('progress') || normalized.includes('review')) {
    return 'border-[#E8F0FF] bg-[#E8F0FF] text-[#0D2A75]';
  }
  if (normalized.includes('cancel') || normalized.includes('tolak')) {
    return 'border-[#FEE4E2] bg-[#FEE4E2] text-[#912018]';
  }
  return 'border-[#FFF4D6] bg-[#FFF4D6] text-[#7A2E0E]';
}

function PageTitle({ activeTab }: { activeTab: AdminTab }) {
  const copy = {
    overview: {
      title: 'Ringkasan platform',
      text: 'Pantau pengguna, brief, invoice, dan verifikasi dari satu layar kerja.',
    },
    users: {
      title: 'Manajemen pengguna',
      text: 'Cari akun, tinjau role, dan ubah akses sesuai kebutuhan operasional.',
    },
    briefs: {
      title: 'Daftar brief proyek',
      text: 'Lihat pekerjaan yang dipublikasikan UMKM beserta status dan budget.',
    },
    schools: {
      title: 'Verifikasi SMK vokasi',
      text: 'Tinjau sekolah vokasi dan kelola status verifikasinya.',
    },
  }[activeTab];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold leading-9 text-[#0D0C22] sm:text-[32px] sm:leading-10">
        {copy.title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#55576A]">{copy.text}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone?: 'primary' | 'info' | 'success' | 'warning';
}) {
  const toneClass = {
    primary: 'bg-[#E8F0FF] text-[#155DFC]',
    info: 'bg-[#E1F6FF] text-[#087BB8]',
    success: 'bg-[#DCFCE7] text-[#16803C]',
    warning: 'bg-[#FFF4D6] text-[#B54708]',
  }[tone];

  return (
    <article className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#55576A]">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold leading-9 text-[#0D0C22]">{value}</p>
        </div>
        <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', toneClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#55576A]">{note}</p>
    </article>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#B7BBC9] bg-[#F8F9FC] p-8 text-center">
      <p className="text-sm font-semibold text-[#0D0C22]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#55576A]">{text}</p>
    </div>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[#E1E3EA]">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex} className="py-4">
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#E9EAF0]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function StatusPill({
  children,
  className,
  icon: Icon,
}: {
  children: React.ReactNode;
  className: string;
  icon?: LucideIcon;
}) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', className)}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

function HorizontalChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; value: number; color: string }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 0);

  return (
    <section className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#0D0C22]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#55576A]">{description}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F0FF] text-[#155DFC]">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {max === 0 ? (
        <EmptyState title="Belum ada data grafik" text="Grafik akan tampil setelah API mengirim nilai di atas nol." />
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const width = Math.max((item.value / max) * 100, 4);

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[#0D0C22]">{item.label}</span>
                  <span className="font-medium text-[#55576A]">{formatNumber(item.value)}</span>
                </div>
                <svg viewBox="0 0 100 8" className="h-3 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={`${item.label}: ${formatNumber(item.value)}`}>
                  <rect width="100" height="8" rx="4" fill="#F3F3F4" />
                  <rect width={width} height="8" rx="4" fill={item.color} />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RatioChart({ paid, unpaid }: { paid: number; unpaid: number }) {
  const total = paid + unpaid;
  const paidRatio = total > 0 ? paid / total : 0;
  const circumference = 2 * Math.PI * 42;

  return (
    <section className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold text-[#0D0C22]">Status invoice</h2>
        <p className="mt-1 text-sm leading-6 text-[#55576A]">Komposisi invoice dibayar dan belum dibayar.</p>
      </div>

      {total === 0 ? (
        <EmptyState title="Belum ada invoice" text="Komposisi invoice akan muncul saat data transaksi tersedia." />
      ) : (
        <div className="grid items-center gap-6 sm:grid-cols-[160px_1fr]">
          <div className="relative mx-auto h-40 w-40">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`Invoice dibayar ${formatNumber(paid)} dari ${formatNumber(total)}`}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F3F4" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#155DFC"
                strokeLinecap="round"
                strokeWidth="10"
                strokeDasharray={`${paidRatio * circumference} ${circumference}`}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-3xl font-semibold text-[#0D0C22]">{Math.round(paidRatio * 100)}%</p>
                <p className="text-xs font-semibold text-[#55576A]">dibayar</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#E8F0FF] px-4 py-3">
              <span className="text-sm font-semibold text-[#0D2A75]">Dibayar</span>
              <span className="text-sm font-semibold text-[#0D2A75]">{formatNumber(paid)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#FFF4D6] px-4 py-3">
              <span className="text-sm font-semibold text-[#7A2E0E]">Belum dibayar</span>
              <span className="text-sm font-semibold text-[#7A2E0E]">{formatNumber(unpaid)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [usersFilter, setUsersFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [schoolsList, setSchoolsList] = useState<AdminSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [briefsList, setBriefsList] = useState<AdminBrief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat statistik.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchUsers = useCallback(async () => {
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
      if (!res.ok) throw new Error(data.error || 'Gagal memuat pengguna.');
      setUsersList(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pengguna.');
    } finally {
      setUsersLoading(false);
    }
  }, [searchQuery, usersFilter]);

  const fetchSchools = useCallback(async () => {
    setSchoolsLoading(true);

    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/schools', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat data sekolah.');
      setSchoolsList(data.schools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data sekolah.');
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  const fetchBriefs = useCallback(async () => {
    setBriefsLoading(true);

    try {
      const token = localStorage.getItem('creatorin_access_token');
      const res = await fetch('/api/admin/briefs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat brief.');
      setBriefsList(data.briefs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat brief.');
    } finally {
      setBriefsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'creatorin.my.id') {
        window.location.replace('https://api.creatorin.my.id/admin');
        return;
      }
    }

    void Promise.resolve().then(fetchStats);
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') void Promise.resolve().then(fetchUsers);
    if (activeTab === 'schools') void Promise.resolve().then(fetchSchools);
    if (activeTab === 'briefs') void Promise.resolve().then(fetchBriefs);
  }, [activeTab, fetchBriefs, fetchSchools, fetchUsers]);

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

      if (!res.ok) throw new Error('Gagal memperbarui status sekolah.');
      await Promise.all([fetchSchools(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status sekolah.');
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

      if (!res.ok) throw new Error('Gagal memperbarui role pengguna.');
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui role pengguna.');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('creatorin_access_token');
    localStorage.removeItem('creatorin_role');
    localStorage.removeItem('creatorin_token');
    localStorage.removeItem('creatorin_auth_user');

    if (typeof document !== 'undefined') {
      const domains = ['.creatorin.my.id', 'creatorin.my.id', 'api.creatorin.my.id', ''];
      for (const dom of domains) {
        const domStr = dom ? `; domain=${dom}` : '';
        document.cookie = `creatorin_token=; Max-Age=0; path=/${domStr}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `creatorin_access_token=; Max-Age=0; path=/${domStr}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }

    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    router.push('/admin/login');
  };

  const userChart = useMemo(
    () => [
      { label: 'Creator', value: stats?.users.creator || 0, color: '#155DFC' },
      { label: 'UMKM', value: stats?.users.business || 0, color: '#03ACFD' },
      { label: 'SMK', value: stats?.users.school || 0, color: '#087BB8' },
      { label: 'Admin', value: stats?.users.admin || 0, color: '#0D0C22' },
    ],
    [stats],
  );

  const briefChart = useMemo(
    () => [
      { label: 'Terbuka', value: stats?.briefs.open || 0, color: '#155DFC' },
      { label: 'Berjalan', value: stats?.briefs.inProgress || 0, color: '#03ACFD' },
      { label: 'Selesai', value: stats?.briefs.completed || 0, color: '#16803C' },
    ],
    [stats],
  );

  const activeTabCopy = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#0D0C22]">
      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Tutup menu admin"
          className="fixed inset-0 z-30 bg-[#0D0C22]/35 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#E1E3EA] bg-white transition-transform lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#E1E3EA] px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#155DFC] text-white">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-[#0D0C22]">Creatorin</p>
              <p className="text-sm font-medium text-[#55576A]">Admin workspace</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="grid h-11 w-11 place-items-center rounded-xl text-[#55576A] hover:bg-[#F3F3F4] lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigasi admin">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
                    isActive ? 'bg-[#E8F0FF] text-[#155DFC]' : 'text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22]',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{tab.label}</span>
                    <span className={cx('block text-xs', isActive ? 'text-[#0D2A75]' : 'text-[#6F7285]')}>
                      {tab.helper}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-[#E1E3EA] pt-5">
            <a
              href="https://creatorin.my.id"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#55576A] hover:bg-[#F3F3F4] hover:text-[#0D0C22]"
            >
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
              <span>Frontend publik</span>
            </a>
          </div>
        </nav>

        <div className="border-t border-[#E1E3EA] p-4">
          <div className="rounded-2xl border border-[#E1E3EA] bg-[#F8F9FC] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0D0C22] text-sm font-semibold text-white">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0D0C22]">Admin Creatorin</p>
                <p className="truncate text-xs font-medium text-[#55576A]">Pengelola platform</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Keluar dari admin"
                className="grid h-10 w-10 place-items-center rounded-xl text-[#55576A] hover:bg-[#FEE4E2] hover:text-[#912018]"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#E1E3EA] bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Buka menu admin"
                onClick={() => setIsMobileMenuOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-[#E1E3EA] text-[#55576A] hover:bg-[#F3F3F4] lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div>
                <p className="text-sm font-semibold text-[#155DFC]">{activeTabCopy?.label}</p>
                <p className="hidden text-sm text-[#55576A] sm:block">Data operasional Creatorin</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchStats}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E1E3EA] bg-white px-3 text-sm font-semibold text-[#0D0C22] hover:bg-[#F3F3F4]"
              >
                <RefreshCw className={cx('h-4 w-4', loading && 'animate-spin')} aria-hidden="true" />
                <span className="hidden sm:inline">Muat ulang</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-[#0D0C22] px-4 text-sm font-semibold text-white hover:bg-[#26243A] sm:inline-flex"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Keluar
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <PageTitle activeTab={activeTab} />
              {stats ? (
                <div className="rounded-2xl border border-[#E1E3EA] bg-white px-4 py-3 text-sm text-[#55576A] shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                  <span className="font-semibold text-[#0D0C22]">{formatNumber(stats.services)}</span> layanan dan{' '}
                  <span className="font-semibold text-[#0D0C22]">{formatNumber(stats.portfolioProjects)}</span> portofolio
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#FEE4E2] bg-[#FEE4E2] p-4 text-sm text-[#912018]" role="alert">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Ada data yang belum berhasil dimuat.</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            ) : null}

            {activeTab === 'overview' ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    icon={UsersRound}
                    label="Total pengguna"
                    value={loading && !stats ? '...' : formatNumber(stats?.users.total || 0)}
                    note="Semua akun yang terdaftar di platform."
                  />
                  <MetricCard
                    icon={BriefcaseBusiness}
                    label="Brief aktif"
                    value={loading && !stats ? '...' : formatNumber((stats?.briefs.open || 0) + (stats?.briefs.inProgress || 0))}
                    note="Brief terbuka dan proyek yang sedang berjalan."
                    tone="info"
                  />
                  <MetricCard
                    icon={WalletCards}
                    label="Volume dibayar"
                    value={loading && !stats ? '...' : formatCurrency(stats?.invoices.paidVolume || 0)}
                    note="Nilai invoice yang tercatat sudah dibayar."
                    tone="success"
                  />
                  <MetricCard
                    icon={GraduationCap}
                    label="SMK menunggu"
                    value={loading && !stats ? '...' : formatNumber(stats?.schools.pending || 0)}
                    note="Sekolah yang masih perlu ditinjau admin."
                    tone="warning"
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <HorizontalChart title="Distribusi pengguna" description="Jumlah akun berdasarkan peran sistem." data={userChart} />
                  <HorizontalChart title="Status brief" description="Sebaran brief berdasarkan tahap pengerjaan." data={briefChart} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <RatioChart paid={stats?.invoices.paidCount || 0} unpaid={stats?.invoices.unpaidCount || 0} />

                  <section className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-[#0D0C22]">Pengguna terbaru</h2>
                        <p className="mt-1 text-sm leading-6 text-[#55576A]">Akun yang baru tercatat di platform.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E1E3EA] px-3 text-sm font-semibold text-[#155DFC] hover:bg-[#E8F0FF]"
                      >
                        Lihat pengguna
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#E1E3EA] text-[#55576A]">
                            <th className="pb-3 font-semibold">Nama</th>
                            <th className="pb-3 font-semibold">Email</th>
                            <th className="pb-3 font-semibold">Peran</th>
                            <th className="pb-3 font-semibold">Terdaftar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E1E3EA]">
                          {loading && !stats ? (
                            <LoadingRows columns={4} />
                          ) : (
                            stats?.recentUsers?.map((user) => (
                              <tr key={user.id} className="hover:bg-[#F8F9FC]">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F3F3F4] text-sm font-semibold text-[#0D0C22]">
                                      {getNameInitial(user.fullName)}
                                    </div>
                                    <span className="font-semibold text-[#0D0C22]">{user.fullName || 'Tanpa nama'}</span>
                                  </div>
                                </td>
                                <td className="py-3 text-[#55576A]">{user.email || '-'}</td>
                                <td className="py-3">
                                  <StatusPill className={roleBadgeClass(user.role)}>
                                    {roleLabels[user.role || ''] || user.role || 'Role kosong'}
                                  </StatusPill>
                                </td>
                                <td className="py-3 text-[#55576A]">{formatDate(user.createdAt)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {!loading && (stats?.recentUsers?.length || 0) === 0 ? (
                      <div className="mt-4">
                        <EmptyState title="Belum ada pengguna terbaru" text="Daftar ini akan terisi saat ada akun baru." />
                      </div>
                    ) : null}
                  </section>
                </div>
              </div>
            ) : null}

            {activeTab === 'users' ? (
              <section className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:max-w-md">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#55576A]" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama atau email"
                      className="h-11 w-full rounded-xl border border-[#B7BBC9] bg-white pl-10 pr-4 text-sm text-[#0D0C22] outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#55576A]" aria-hidden="true" />
                    <select
                      value={usersFilter}
                      onChange={(e) => setUsersFilter(e.target.value)}
                      className="h-11 rounded-xl border border-[#B7BBC9] bg-white px-3 text-sm font-medium text-[#0D0C22] outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20"
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E1E3EA] text-[#55576A]">
                        <th className="pb-3 font-semibold">User</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Peran</th>
                        <th className="pb-3 font-semibold">Ubah role</th>
                        <th className="pb-3 font-semibold">Terdaftar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E3EA]">
                      {usersLoading ? (
                        <LoadingRows columns={5} />
                      ) : (
                        usersList.map((user) => (
                          <tr key={user.id} className="hover:bg-[#F8F9FC]">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F3F3F4] text-sm font-semibold text-[#0D0C22]">
                                  {getNameInitial(user.fullName)}
                                </div>
                                <span className="font-semibold text-[#0D0C22]">{user.fullName || 'Tanpa nama'}</span>
                              </div>
                            </td>
                            <td className="py-3 text-[#55576A]">{user.email || '-'}</td>
                            <td className="py-3">
                              <StatusPill className={roleBadgeClass(user.role)}>
                                {roleLabels[user.role || ''] || user.role || 'Role kosong'}
                              </StatusPill>
                            </td>
                            <td className="py-3">
                              <select
                                defaultValue={user.role || ''}
                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                className="h-10 rounded-xl border border-[#B7BBC9] bg-white px-3 text-sm font-medium text-[#0D0C22] outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20"
                              >
                                <option value="admin">Admin</option>
                                <option value="creator">Creator</option>
                                <option value="business">UMKM</option>
                                <option value="school">SMK</option>
                              </select>
                            </td>
                            <td className="py-3 text-[#55576A]">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!usersLoading && usersList.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState title="Pengguna tidak ditemukan" text="Ubah kata kunci pencarian atau filter peran." />
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeTab === 'briefs' ? (
              <section className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#0D0C22]">Brief dan proyek</h2>
                    <p className="mt-1 text-sm leading-6 text-[#55576A]">Data yang dikirim oleh UMKM melalui alur brief.</p>
                  </div>
                  {briefsLoading ? <Loader2 className="h-5 w-5 animate-spin text-[#155DFC]" aria-hidden="true" /> : null}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E1E3EA] text-[#55576A]">
                        <th className="pb-3 font-semibold">Judul proyek</th>
                        <th className="pb-3 font-semibold">Kategori</th>
                        <th className="pb-3 font-semibold">Budget</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E3EA]">
                      {briefsLoading ? (
                        <LoadingRows columns={5} />
                      ) : (
                        briefsList.map((brief) => (
                          <tr key={brief.id} className="hover:bg-[#F8F9FC]">
                            <td className="py-3 font-semibold text-[#0D0C22]">{brief.title || 'Tanpa judul'}</td>
                            <td className="py-3 text-[#55576A]">{brief.category || '-'}</td>
                            <td className="py-3 font-semibold text-[#0D0C22]">{brief.budget || '-'}</td>
                            <td className="py-3">
                              <StatusPill className={statusBadgeClass(brief.status)}>
                                {brief.status || 'Status kosong'}
                              </StatusPill>
                            </td>
                            <td className="py-3 text-[#55576A]">{formatDate(brief.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!briefsLoading && briefsList.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState title="Belum ada brief" text="Brief yang dipublikasikan UMKM akan muncul di sini." />
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeTab === 'schools' ? (
              <section className="rounded-2xl border border-[#E1E3EA] bg-white p-5 shadow-[0_1px_2px_rgba(13,12,34,0.06)]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#0D0C22]">Daftar sekolah</h2>
                    <p className="mt-1 text-sm leading-6 text-[#55576A]">Setujui sekolah yang sudah layak tampil sebagai mitra vokasi.</p>
                  </div>
                  {schoolsLoading ? <Loader2 className="h-5 w-5 animate-spin text-[#155DFC]" aria-hidden="true" /> : null}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E1E3EA] text-[#55576A]">
                        <th className="pb-3 font-semibold">Sekolah</th>
                        <th className="pb-3 font-semibold">Profil</th>
                        <th className="pb-3 font-semibold">Kontak PIC</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E3EA]">
                      {schoolsLoading ? (
                        <LoadingRows columns={5} />
                      ) : (
                        schoolsList.map((school) => (
                          <tr key={school.id} className="hover:bg-[#F8F9FC]">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#E1F6FF] text-[#087BB8]">
                                  <Building2 className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <span className="font-semibold text-[#0D0C22]">{school.name || 'Tanpa nama sekolah'}</span>
                              </div>
                            </td>
                            <td className="py-3 text-[#55576A]">/school/{school.slug || '-'}</td>
                            <td className="py-3 text-[#55576A]">{school.picName || school.picContact || '-'}</td>
                            <td className="py-3">
                              {school.isVerified ? (
                                <StatusPill className="border-[#DCFCE7] bg-[#DCFCE7] text-[#14532D]" icon={CheckCircle2}>
                                  Terverifikasi
                                </StatusPill>
                              ) : (
                                <StatusPill className="border-[#FFF4D6] bg-[#FFF4D6] text-[#7A2E0E]" icon={Clock3}>
                                  Menunggu tinjauan
                                </StatusPill>
                              )}
                            </td>
                            <td className="py-3">
                              {school.isVerified ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSchoolStatus(school.id, false)}
                                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#FEE4E2] bg-white px-3 text-sm font-semibold text-[#912018] hover:bg-[#FEE4E2]"
                                >
                                  Cabut status
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSchoolStatus(school.id, true)}
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-3 text-sm font-semibold text-white hover:bg-[#1248C7]"
                                >
                                  <Check className="h-4 w-4" aria-hidden="true" />
                                  Setujui
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!schoolsLoading && schoolsList.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState title="Belum ada sekolah" text="Data SMK vokasi akan muncul setelah sekolah melengkapi profil." />
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
