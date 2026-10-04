'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

type Transaction = { id: string; type: string; amount: number; description?: string; status: string; createdAt: string };
type WalletData = { wallet: { balance: number; points: number }; transactions: Transaction[] };

export function WalletPage() {
  const { user } = useAuth();
  const [data, setData] = useState<WalletData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch('/api/wallet', { cache: 'no-store' }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Gagal memuat dompet');
      return body as WalletData;
    }).then(body => { if (active) setData(body); }).catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Gagal memuat dompet'); });
    return () => { active = false; };
  }, [user]);
  if (!user) return <div className="container-creatorin py-16 text-center">Masuk untuk melihat dompet Anda.</div>;
  return <main className="container-creatorin max-w-4xl py-10 sm:py-16">
    <h1 className="text-3xl font-semibold">Dompet koin</h1>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
    <div className="mt-8 rounded-2xl bg-[#0D0C22] p-8 text-white">
      <p className="text-sm text-white/70">Saldo tercatat</p>
      <p className="mt-3 text-4xl font-semibold">{Math.floor((data?.wallet.balance || 0) / 1000).toLocaleString('id-ID')} koin</p>
    </div>
    <p className="mt-5 text-sm text-[var(--muted)]">Top up dan penarikan belum tersedia karena kanal pembayaran belum terhubung.</p>
    <h2 className="mt-10 text-xl font-semibold">Riwayat transaksi</h2>
    <div className="mt-4 divide-y divide-[var(--outline)] rounded-2xl border border-[var(--outline)] bg-white">
      {data?.transactions.length ? data.transactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between gap-4 p-5 text-sm">
        <div><p className="font-semibold">{transaction.description || transaction.type}</p><p className="mt-1 text-[var(--muted)]">{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</p></div>
        <strong>{transaction.amount >= 0 ? '+' : ''}{Math.trunc(transaction.amount / 1000)} koin</strong>
      </div>) : <p className="p-8 text-center text-sm text-[var(--muted)]">Belum ada transaksi.</p>}
    </div>
  </main>;
}
