'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, Clock3, FileText, MessageSquareText, Search } from 'lucide-react';

type ContractStatus = 'pending' | 'accepted' | 'rejected';
type StatusFilter = 'all' | 'accepted' | 'pending';

type ContractItem = {
  id: string;
  briefId: string;
  status: ContractStatus;
  proposedPrice: string;
  appliedAt: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  deadline: string;
  businessName: string;
  businessAvatar?: string | null;
  businessLocation?: string | null;
  source?: 'demo' | 'database';
};

type ApiContract = {
  id: string;
  briefId: string;
  status: ContractStatus;
  proposedPrice?: string | null;
  appliedAt?: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  deadline?: string | null;
  businessName?: string | null;
  businessAvatar?: string | null;
  businessLocation?: string | null;
  companyName?: string | null;
};

const statusCopy: Record<ContractStatus, { label: string; className: string }> = {
  accepted: { label: 'Accepted', className: 'border-[#B7E4C7] bg-[#F0FDF4] text-[#166534]' },
  pending: { label: 'Menunggu review', className: 'border-[#F3D58B] bg-[#FFFBEB] text-[#92400E]' },
  rejected: { label: 'Tidak lanjut', className: 'border-[#F3B6B6] bg-[#FEF2F2] text-[#991B1B]' },
};

export function ContractsPage() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    let alive = true;

    async function loadContracts() {
      try {
        const response = await fetch('/api/contracts', { cache: 'no-store' });
        if (!response.ok) throw new Error('contracts-unavailable');
        const data = await response.json();
        if (!alive) return;
        setContracts(Array.isArray(data.contracts) ? data.contracts.map(mapApiContract) : []);
      } catch {
        if (!alive) return;
        setContracts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadContracts();
    return () => {
      alive = false;
    };
  }, []);

  const visibleContracts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return contracts.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (!normalized) return true;
      return [item.title, item.businessName, item.category, item.description].join(' ').toLowerCase().includes(normalized);
    });
  }, [contracts, filter, query]);

  const acceptedCount = contracts.filter((item) => item.status === 'accepted').length;
  const pendingCount = contracts.filter((item) => item.status === 'pending').length;

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#171714]">
      <section className="border-b border-[#DFE0DA] bg-white">
        <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-[#155DFC]">Contracts</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Brief yang sedang kamu lamar.
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#62635E] sm:text-base">
                Pantau lamaran yang sudah diterima dan yang masih menunggu keputusan UMKM.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <SummaryCard label="Accepted" value={acceptedCount} />
              <SummaryCard label="Menunggu" value={pendingCount} />
            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-h-12 items-center gap-3 border-b-2 border-[#171714] bg-transparent lg:w-[420px]">
            <Search className="h-5 w-5 shrink-0 text-[#62635E]" strokeWidth={1.6} aria-hidden="true" />
            <label htmlFor="contract-search" className="sr-only">Cari lamaran brief</label>
            <input
              id="contract-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari brief, UMKM, atau kategori"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#62635E]"
            />
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Filter status lamaran">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Semua</FilterButton>
            <FilterButton active={filter === 'accepted'} onClick={() => setFilter('accepted')}>Accepted</FilterButton>
            <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>Menunggu</FilterButton>
          </div>
        </div>

        {loading ? (
          <div className="border-y border-[#DFE0DA] py-14 text-sm text-[#62635E]">Memuat daftar lamaran...</div>
        ) : visibleContracts.length ? (
          <div className="grid gap-4">
            {visibleContracts.map((item) => (
              <ContractCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="border-y border-[#DFE0DA] py-16 text-center">
            <FileText className="mx-auto h-9 w-9 text-[#62635E]" strokeWidth={1.5} />
            <h2 className="mt-4 text-lg font-semibold">Belum ada lamaran yang cocok</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#62635E]">
              Coba ubah filter, atau buka papan brief untuk melamar proyek baru.
            </p>
            <Link href="/briefs" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#171714] px-5 text-sm font-semibold text-white hover:bg-[#30312D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]">
              Buka papan brief
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function ContractCard({ item }: { item: ContractItem }) {
  const status = statusCopy[item.status] ?? statusCopy.pending;
  const isAccepted = item.status === 'accepted';

  return (
    <article className="grid gap-4 border border-[#DFE0DA] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold ${status.className}`}>
            {isAccepted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
            {status.label}
          </span>
          <span className="text-xs text-[#62635E]">{item.category}</span>
          <span className="text-xs text-[#62635E]">Dilamar {item.appliedAt}</span>
        </div>

        <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-6 tracking-[-0.02em]">
          <Link href={`/briefs/${item.briefId}`} className="hover:text-[#155DFC] focus-visible:outline-2 focus-visible:outline-[#155DFC]">
            {item.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#62635E]">{item.description}</p>

        <div className="mt-4 flex items-center gap-2.5">
          {item.businessAvatar ? (
            <Image src={item.businessAvatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="grid h-9 w-9 rounded-full bg-[#E9EAE5] place-items-center text-xs font-semibold">{item.businessName.slice(0, 2).toUpperCase()}</span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.businessName}</p>
            <p className="truncate text-xs text-[#62635E]">{item.businessLocation || 'Indonesia'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-[#DFE0DA] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="grid gap-3 text-sm">
          <div>
            <p className="text-xs text-[#62635E]">Penawaran kamu</p>
            <p className="mt-1 font-semibold">{item.proposedPrice || item.budget}</p>
          </div>
          <div>
            <p className="text-xs text-[#62635E]">Budget brief</p>
            <p className="mt-1 font-semibold">{item.budget}</p>
          </div>
          <div>
            <p className="text-xs text-[#62635E]">Deadline</p>
            <p className="mt-1 font-semibold">{item.deadline || 'Sesuai brief'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isAccepted && (
            <Link href="/chat" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#171714] px-4 text-sm font-semibold text-white hover:bg-[#30312D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]">
              <MessageSquareText className="h-4 w-4" strokeWidth={1.7} />
              Buka chat
            </Link>
          )}
          <Link href={`/briefs/${item.briefId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#B7BBC9] px-4 text-sm font-semibold hover:bg-[#F3F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]">
            <BriefcaseBusiness className="h-4 w-4" strokeWidth={1.7} />
            Lihat brief
          </Link>
        </div>
      </div>
    </article>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] ${
        active ? 'border-[#171714] bg-[#171714] text-white' : 'border-[#DFE0DA] bg-white text-[#4F504B] hover:border-[#AEB0A8]'
      }`}
    >
      {children}
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#DFE0DA] bg-[#F7F7F5] p-4">
      <p className="text-xs text-[#62635E]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function mapApiContract(item: ApiContract): ContractItem {
  return {
    id: item.id,
    briefId: item.briefId,
    status: item.status,
    proposedPrice: item.proposedPrice || '',
    appliedAt: formatAppliedAt(item.appliedAt),
    title: item.title,
    category: item.category,
    description: item.description,
    budget: item.budget,
    deadline: item.deadline || 'Sesuai brief',
    businessName: item.companyName || item.businessName || 'Brand UMKM',
    businessAvatar: item.businessAvatar,
    businessLocation: item.businessLocation,
    source: 'database',
  };
}

function formatAppliedAt(value?: string) {
  if (!value) return 'baru saja';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'baru saja';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
