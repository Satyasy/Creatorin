'use client';

import React, { useState } from 'react';
import { Coins, Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useErrorModal } from '@/providers/ErrorModalProvider';
import { useToast } from '@/providers/ToastProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export function DemoTopUpModal({ isOpen, onClose, onSuccess }: Props) {
  const { showErrorModal } = useErrorModal();
  const { showToast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleTopUp = async () => {
    if (currentAmount <= 0) {
      showErrorModal({
        title: 'Nominal Tidak Valid',
        message: 'Harap pilih atau masukkan jumlah koin yang valid lebih dari 0.',
        suggestion: 'Pilih salah satu nominal preset koin yang tersedia.',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: currentAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan koin demo');
      }

      showToast({
        type: 'success',
        title: 'Top-Up Koin Berhasil!',
        message: `🪙 ${currentAmount.toLocaleString('id-ID')} Koin berhasil ditambahkan ke saldo dompet Anda.`,
      });

      onSuccess?.(data.wallet?.balance);
      onClose();
    } catch (err: unknown) {
      showErrorModal(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-[#E1E3EA] shadow-2xl p-6 sm:p-7 text-left animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 p-1.5 text-[#55576A] hover:text-[#0D0C22] rounded-lg hover:bg-[#F3F3F4] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-['DM_Sans',sans-serif] text-lg font-bold text-[#0D0C22] tracking-tight">
                Top Up Koin Demo
              </h2>
              <span className="text-[10px] font-bold text-[#155DFC] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Simulasi Evaluasi
              </span>
            </div>
            <p className="text-xs text-[#55576A] mt-0.5">
              Tambah saldo koin untuk simulasi pembayaran escrow kolaborasi.
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-[#262626] mb-2">
            Pilih Nominal Koin Demo:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = !customAmount && selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#155DFC] bg-[#F4F7FF] shadow-xs'
                      : 'border-[#E1E3EA] bg-white hover:border-[#155DFC]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0D0C22]">
                      🪙 {amt.toLocaleString('id-ID')}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#155DFC]" />}
                  </div>
                  <span className="text-[10px] text-[#737373] block mt-0.5">
                    Setara Rp{(amt * 1000).toLocaleString('id-ID')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mt-3.5">
          <label htmlFor="custom-coin-input" className="block text-xs font-semibold text-[#262626] mb-1">
            Atau Masukkan Nominal Koin Kustom:
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              🪙
            </span>
            <input
              id="custom-coin-input"
              type="number"
              min="1"
              max="50000000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Contoh: 10000"
              className="h-10 w-full rounded-xl bg-[#F9FAFB] border border-[#E1E3EA] pl-9 pr-3 text-xs sm:text-sm text-[#0D0C22] focus:bg-white focus:border-[#155DFC] focus:outline-none"
            />
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="mt-4 p-3 rounded-xl bg-[#F8F9FB] border border-[#E1E3EA] flex items-center justify-between text-xs">
          <span className="text-[#55576A]">Total Koin Ditambahkan:</span>
          <strong className="text-[#0D0C22] font-bold text-sm">
            🪙 {currentAmount.toLocaleString('id-ID')} Koin
          </strong>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-[#F0F1F5]">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#262626] text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleTopUp}
            disabled={loading || currentAmount <= 0}
            className="h-10 px-5 rounded-xl bg-[#155DFC] hover:bg-[#1248C7] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menambahkan Saldo…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Top Up Koin Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
