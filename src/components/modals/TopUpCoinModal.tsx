'use client';

import React, { useState } from 'react';
import { X, Check, Loader2, Coins, ArrowRight } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';

interface TopUpCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
  currentBalance?: number;
}

const TOPUP_PRESETS = [50000, 100000, 250000, 500000, 1000000];

export const TopUpCoinModal: React.FC<TopUpCoinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0,
}) => {
  const { showToast } = useToast();
  const [rawAmount, setRawAmount] = useState('100.000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  if (!isOpen) return null;

  function parseAmount(val: string): number {
    return parseInt(val.replace(/\D/g, '') || '0', 10);
  }

  function formatNumber(val: number): string {
    return val.toLocaleString('id-ID');
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '');
    if (!numeric) {
      setRawAmount('0');
      return;
    }
    setRawAmount(formatNumber(parseInt(numeric, 10)));
  };

  const handlePresetClick = (presetVal: number) => {
    setRawAmount(formatNumber(presetVal));
  };

  const handleTopUp = async () => {
    const amount = parseAmount(rawAmount);
    if (!amount || amount <= 0) {
      showToast({ message: 'Silakan masukkan nominal top up koin yang valid.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal melakukan top up koin.');
      }

      setSuccessAnim(true);
      showToast({ title: 'Top Up Berhasil', message: `Berhasil top up 🪙 ${formatNumber(amount)} Koin!`, type: 'success' });
      onSuccess?.(data.balance);

      setTimeout(() => {
        setSuccessAnim(false);
        setIsSubmitting(false);
        onClose();
      }, 900);
    } catch (err: unknown) {
      setIsSubmitting(false);
      showToast({ title: 'Gagal', message: err instanceof Error ? err.message : 'Gagal melakukan top up.', type: 'error' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 sm:p-7 relative overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                Top Up Koin
              </h3>
              <p className="text-xs text-neutral-500">
                Isi saldo koin untuk transaksi dan kolaborasi jasa kreator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Saldo Saat Ini */}
        <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3.5 mb-5 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500">
            Saldo Koin Anda Saat Ini:
          </span>
          <span className="text-sm font-bold text-neutral-900 flex items-center gap-1">
            <span>🪙</span>
            <span>{currentBalance.toLocaleString('id-ID')}</span>
          </span>
        </div>

        {/* Input Nominal Koin */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Nominal Top Up Koin
          </label>
          <div className="h-12 px-3.5 rounded-xl border border-neutral-200 bg-white flex items-center gap-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
            <span className="text-base select-none">🪙</span>
            <input
              type="text"
              inputMode="numeric"
              value={rawAmount}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full text-lg font-black text-neutral-900 placeholder:text-neutral-300 bg-transparent outline-none tracking-tight"
            />
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="space-y-1.5 mb-5">
          <span className="text-[11px] font-medium text-neutral-400">
            Pilihan Nominal Cepat:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TOPUP_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
              >
                +🪙 {formatNumber(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleTopUp}
            disabled={isSubmitting || parseAmount(rawAmount) <= 0}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : successAnim ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Top Up Berhasil!</span>
              </>
            ) : (
              <>
                <span>Top Up Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
