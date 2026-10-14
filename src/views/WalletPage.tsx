'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';

type Transaction = { id: string; type: string; amount: number; description?: string; status: string; createdAt: string };
type WalletData = { wallet: { balance: number; points: number }; transactions: Transaction[] };

export function WalletPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState<WalletData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch('/api/wallet', { cache: 'no-store' }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || (language === 'en' ? 'Failed to load wallet' : 'Gagal memuat dompet'));
      return body as WalletData;
    }).then(body => { if (active) setData(body); }).catch(caught => { if (active) setError(caught instanceof Error ? caught.message : (language === 'en' ? 'Failed to load wallet' : 'Gagal memuat dompet')); });
    return () => { active = false; };
  }, [user, language]);
  if (!user) return <div className="container-creatorin py-16 text-center">{t('wallet.signInRequired', 'Masuk untuk melihat dompet Anda.')}</div>;
  return <main className="container-creatorin max-w-4xl py-10 sm:py-16">
    <h1 className="text-3xl font-semibold">{t('wallet.coinWallet', 'Dompet koin')}</h1>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
    <div className="mt-8 rounded-2xl bg-[#0D0C22] p-8 text-white">
      <p className="text-sm text-white/70">{t('wallet.recordedBalance', 'Saldo tercatat')}</p>
      <p className="mt-3 text-4xl font-semibold">{t('wallet.coins', '{count} koin').replace('{count}', Math.floor((data?.wallet.balance || 0) / 1000).toLocaleString(language === 'en' ? 'en-US' : 'id-ID'))}</p>
    </div>
    <p className="mt-5 text-sm text-[var(--muted)]">{t('wallet.channelNotice', 'Top up dan penarikan belum tersedia karena kanal pembayaran belum terhubung.')}</p>
    <h2 className="mt-10 text-xl font-semibold">{t('wallet.history', 'Riwayat transaksi')}</h2>
    <div className="mt-4 divide-y divide-[var(--outline)] rounded-2xl border border-[var(--outline)] bg-white">
      {data?.transactions.length ? data.transactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between gap-4 p-5 text-sm">
        <div><p className="font-semibold">{transaction.description || transaction.type}</p><p className="mt-1 text-[var(--muted)]">{new Date(transaction.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID')}</p></div>
        <strong>{transaction.amount >= 0 ? '+' : ''}{Math.trunc(transaction.amount / 1000)} {language === 'en' ? 'coins' : 'koin'}</strong>
      </div>) : <p className="p-8 text-center text-sm text-[var(--muted)]">{t('wallet.noTransactions', 'Belum ada transaksi.')}</p>}
    </div>
  </main>;
}
