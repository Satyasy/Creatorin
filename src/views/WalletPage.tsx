'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Coins, ArrowUpRight, PlusCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { DemoTopUpModal } from '@/components/wallet/DemoTopUpModal';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
};

type WalletData = {
  wallet: { balance: number; points: number };
  transactions: Transaction[];
};

export function WalletPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [data, setData] = useState<WalletData | null>(null);
  const [error, setError] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/wallet', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          body.error || (language === 'en' ? 'Failed to load wallet' : 'Gagal memuat dompet')
        );
      }
      setData(body as WalletData);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : language === 'en'
          ? 'Failed to load wallet'
          : 'Gagal memuat dompet'
      );
    }
  }, [user, language]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (!user) {
    return (
      <div className="container-creatorin py-16 text-center">
        {t('wallet.signInRequired', 'Masuk untuk melihat dompet Anda.')}
      </div>
    );
  }

  const rawBalance = data?.wallet.balance || 0;
  // If balance was seeded in old rupiah units (>= 100,000 without decimal), normalize to coins, else use as coins
  const displayCoins = rawBalance >= 100000 ? Math.floor(rawBalance / 1000) : rawBalance;
  const rupiahEquivalent = displayCoins * 1000;

  return (
    <main className="container-creatorin max-w-4xl py-10 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t('wallet.coinWallet', 'Dompet koin')}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Kelola saldo koin untuk transaksi escrow dan pembayaran kemitraan proyek kreatif.
          </p>
        </div>

        {/* Demo Top Up Button */}
        <button
          type="button"
          onClick={() => setIsTopUpOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer w-fit"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Top Up Koin Demo</span>
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {/* Main Balance Card */}
      <div className="mt-8 rounded-2xl bg-[#0D0C22] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-indigo-500/0 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <p className="text-xs sm:text-sm text-white/70">
                {t('wallet.recordedBalance', 'Saldo Koin Tersedia')}
              </p>
            </div>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>🪙</span>
              <span>
                {displayCoins.toLocaleString(language === 'en' ? 'en-US' : 'id-ID')}{' '}
                <span className="text-lg sm:text-xl font-normal text-white/70">Koin</span>
              </span>
            </p>
            <p className="mt-1.5 text-xs text-white/60">
              Setara Rp{rupiahEquivalent.toLocaleString('id-ID')} (1 Koin = Rp1.000)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Tambah Koin</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        {t(
          'wallet.channelNotice',
          'Sistem pembayaran menggunakan proteksi rekening bersama (escrow) CreatorIn yang diverifikasi oleh sistem.'
        )}
      </p>

      {/* Transaction History Section */}
      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        {t('wallet.history', 'Riwayat transaksi')}
      </h2>

      <div className="mt-4 divide-y divide-[var(--outline)] rounded-2xl border border-[var(--outline)] bg-white overflow-hidden shadow-xs">
        {data?.transactions.length ? (
          data.transactions.map((transaction) => {
            const rawTxAmount = transaction.amount;
            const txCoins = rawTxAmount >= 100000 || rawTxAmount <= -100000 ? Math.trunc(rawTxAmount / 1000) : rawTxAmount;
            const isPositive = txCoins >= 0;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 p-4 sm:p-5 text-sm hover:bg-[#F9FAFB] transition-colors"
              >
                <div>
                  <p className="font-semibold text-[#0D0C22]">
                    {transaction.description || transaction.type}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(transaction.createdAt).toLocaleDateString(
                      language === 'en' ? 'en-US' : 'id-ID',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <strong
                    className={`block font-bold text-sm ${
                      isPositive ? 'text-emerald-600' : 'text-neutral-800'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {txCoins.toLocaleString(language === 'en' ? 'en-US' : 'id-ID')}{' '}
                    {language === 'en' ? 'coins' : 'koin'}
                  </strong>
                  <span className="text-[10px] text-[var(--muted)] block">
                    (Rp{Math.abs(txCoins * 1000).toLocaleString('id-ID')})
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-8 text-center text-sm text-[var(--muted)]">
            {t('wallet.noTransactions', 'Belum ada transaksi.')}
          </p>
        )}
      </div>

      {/* Demo Top Up Modal Component */}
      <DemoTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={() => fetchWallet()}
      />
    </main>
  );
}
