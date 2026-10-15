'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { TopUpCoinModal } from '@/components/modals/TopUpCoinModal';
import { PlusCircle, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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
        throw new Error(body.error || (language === 'en' ? 'Failed to load wallet' : 'Gagal memuat dompet'));
      }
      setData(body as WalletData);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (language === 'en' ? 'Failed to load wallet' : 'Gagal memuat dompet'));
    }
  }, [user, language]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (!user) {
    return (
      <div className="container-creatorin py-16 text-center text-sm text-neutral-600">
        {t('wallet.signInRequired', 'Masuk untuk melihat dompet Anda.')}
      </div>
    );
  }

  const currentBalance = data?.wallet.balance || 0;

  return (
    <main className="container-creatorin max-w-4xl py-8 sm:py-14">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            {t('wallet.coinWallet', 'Dompet Koin')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola saldo koin untuk transaksi proyek & pembayaran kesepakatan kreator.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsTopUpOpen(true)}
          className="h-10 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Top Up Koin</span>
        </button>
      </div>

      {error && (
        <p className="mb-6 rounded-xl bg-red-50 p-4 text-xs sm:text-sm text-red-700 font-medium" role="alert">
          {error}
        </p>
      )}

      {/* Hero Saldo Koin Card */}
      <div className="rounded-2xl bg-[#0D0C22] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm font-medium">
              <Wallet className="w-4 h-4" />
              <span>{t('wallet.recordedBalance', 'Saldo Koin Tersedia')}</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-2">
                <span>🪙</span>
                <span>{currentBalance.toLocaleString('id-ID')}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-[#0D0C22] hover:bg-neutral-100 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Top Up Sekarang</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background gradient */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Riwayat Transaksi */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
            {t('wallet.history', 'Riwayat Transaksi')}
          </h2>
          <span className="text-xs text-neutral-400 font-medium">
            {data?.transactions.length || 0} transaksi tercatat
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-100 shadow-xs">
          {data?.transactions && data.transactions.length > 0 ? (
            data.transactions.map((tx) => {
              const isPlus = tx.amount >= 0;
              return (
                <div key={tx.id} className="flex items-center justify-between gap-4 p-4 sm:p-5 text-sm hover:bg-neutral-50/50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPlus ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-600'}`}>
                      {isPlus ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 truncate text-xs sm:text-sm">
                        {tx.description || tx.type}
                      </p>
                      <p className="mt-0.5 text-neutral-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-bold text-xs sm:text-sm ${isPlus ? 'text-emerald-600' : 'text-neutral-900'}`}>
                      {isPlus ? '+ ' : '- '}🪙 {Math.abs(tx.amount).toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[10px] text-neutral-400 capitalize">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center">
              <p className="text-xs sm:text-sm text-neutral-400">
                {t('wallet.noTransactions', 'Belum ada transaksi di dompet ini.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Top Up */}
      <TopUpCoinModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={currentBalance}
        onSuccess={() => {
          fetchWallet();
        }}
      />
    </main>
  );
}
