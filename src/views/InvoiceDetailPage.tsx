'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Coins, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wallet,
  PlusCircle,
  Lock
} from 'lucide-react';
import type { ActivePage, AuthState } from '@/types';
import { formatCoin } from '@/lib/coin';
import { TopUpCoinModal } from '@/components/modals/TopUpCoinModal';

export interface InvoiceDetailProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  invoiceData?: {
    id: string;
    serviceTitle?: string;
    amount?: string;
    status?: 'unpaid' | 'paid';
    messageId?: string;
    dueDate?: string;
    scopeSummary?: string;
    creatorName?: string;
    creatorRole?: string;
    creatorAvatar?: string;
    clientName?: string;
    clientBrand?: string;
  };
  onPaymentSuccess?: (invoiceId: string, messageId?: string) => void;
  onClose?: () => void;
}

type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  scopeDescription: string;
  totalAmount: number; // in Coins
  deadlineDays: number;
  revisionRules: string | null;
  status: 'unpaid' | 'paid' | 'cancelled';
  createdAt: string;
  creatorId: string;
  businessId: string;
  creator: { fullName: string } | null;
  business: { fullName: string; companyName: string | null } | null;
};

export function InvoiceDetailPage({ invoiceData, onPaymentSuccess, onClose }: InvoiceDetailProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // 1. Fetch user's coin wallet balance
  useEffect(() => {
    fetch('/api/wallet/balance')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.balance);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch invoice details from API
  useEffect(() => {
    if (!invoiceData?.id) {
      setError('Nomor invoice tidak ditemukan.');
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`/api/invoices/${encodeURIComponent(invoiceData.id)}`, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          // If not in database yet (e.g. simulated invoice ID), create fallback invoice view
          return {
            id: invoiceData.id,
            invoiceNumber: invoiceData.id,
            title: invoiceData.serviceTitle || 'Kesepakatan Proyek',
            scopeDescription: invoiceData.scopeSummary || 'Pengerjaan konten kreatif sesuai kesepakatan obrolan.',
            totalAmount: parseInt(invoiceData.amount?.replace(/[^0-9]/g, '') || '1500', 10),
            deadlineDays: 3,
            revisionRules: 'Maksimal 2 kali revisi minor.',
            status: invoiceData.status || 'unpaid',
            createdAt: new Date().toISOString(),
            creatorId: '',
            businessId: '',
            creator: { fullName: invoiceData.creatorName || 'Kreator' },
            business: { fullName: invoiceData.clientName || 'UMKM', companyName: null },
          } as Invoice;
        }
        return body.invoice as Invoice;
      })
      .then((data) => {
        if (active) setInvoice(data);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Gagal memuat invoice');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [invoiceData?.id]);

  const totalCoinRequired = invoice?.totalAmount || 0;
  const isBalanceSufficient = walletBalance !== null ? walletBalance >= totalCoinRequired : true;
  const balanceAfterPayment = walletBalance !== null ? Math.max(0, walletBalance - totalCoinRequired) : 0;

  const pay = async () => {
    if (!invoice) return;
    setPaying(true);
    setError('');
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pay`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Pembayaran gagal');
      
      setInvoice({ ...invoice, status: 'paid' });
      if (walletBalance !== null) {
        setWalletBalance(balanceAfterPayment);
      }
      onPaymentSuccess?.(invoice.id, invoiceData?.messageId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pembayaran gagal');
    } finally {
      setPaying(false);
    }
  };

  return (
    <main className="container-creatorin max-w-2xl py-8 sm:py-12 px-4">
      <button
        type="button"
        onClick={() => (onClose ? onClose() : router.back())}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Obrolan</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#155DFC] uppercase tracking-wider">
            Escrow Pembayaran Koin
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-0.5">
            Rincian Pembayaran Invoice
          </h1>
        </div>

        {/* Escrow badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Escrow Terproteksi</span>
        </div>
      </div>

      {loading && (
        <div className="mt-8 p-12 text-center text-sm text-neutral-400 bg-white rounded-2xl border border-neutral-200">
          Memuat rincian invoice dan saldo koin...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {invoice && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header Invoice */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-5">
            <div>
              <p className="text-xs font-semibold text-neutral-400">
                #{invoice.invoiceNumber || invoice.id}
              </p>
              <h2 className="mt-1 text-lg font-bold text-neutral-900">
                {invoice.title}
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                invoice.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {invoice.status === 'paid' ? '✓ Escrow Terbayar' : 'Menunggu Pembayaran'}
            </span>
          </div>

          {/* Rincian Pihak & Jadwal */}
          <dl className="grid gap-4 py-1 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-neutral-400">Kreator Pelaksana</dt>
              <dd className="mt-1 font-semibold text-neutral-800">
                {invoice.creator?.fullName || invoiceData?.creatorName || 'Sobakhul Munir'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Klien UMKM</dt>
              <dd className="mt-1 font-semibold text-neutral-800">
                {invoice.business?.fullName || invoiceData?.clientName || 'GlowLab Skincare'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Estimasi Pengerjaan</dt>
              <dd className="mt-1 font-semibold text-neutral-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{invoice.deadlineDays} Hari Kerja setelah DP</span>
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">Ketentuan Revisi</dt>
              <dd className="mt-1 font-semibold text-neutral-800">
                {invoice.revisionRules || '2x revisi minor gratis'}
              </dd>
            </div>
          </dl>

          {/* Lingkup Kerja */}
          <div className="border-t border-neutral-100 pt-4">
            <h4 className="text-xs font-semibold text-neutral-700 mb-1">
              Ruang Lingkup & Deliverables:
            </h4>
            <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
              {invoice.scopeDescription}
            </p>
          </div>

          {/* Rincian Saldo Koin & Biaya */}
          <div className="border-t border-neutral-100 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-neutral-400" />
                <span>Saldo Koin Anda Saat Ini:</span>
              </span>
              <div className="flex items-center gap-2">
                <strong className="text-neutral-900 font-bold">
                  {walletBalance !== null ? `🪙 ${walletBalance.toLocaleString('id-ID')}` : 'Memuat...'}
                </strong>
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(true)}
                  className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold cursor-pointer transition"
                >
                  + Top Up
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Biaya Invoice (Escrow):</span>
              <strong className="text-amber-800 font-bold">
                🪙 {totalCoinRequired.toLocaleString('id-ID')}
              </strong>
            </div>

            {invoice.status === 'unpaid' && walletBalance !== null && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-dashed border-neutral-200">
                <span className="text-neutral-500">Estimasi Sisa Saldo Koin:</span>
                <span className={`font-semibold ${isBalanceSufficient ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isBalanceSufficient ? `🪙 ${balanceAfterPayment.toLocaleString('id-ID')}` : 'Saldo Koin Tidak Cukup'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <span className="font-bold text-sm text-neutral-900">Total Pembayaran:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#0B1F3A] flex items-center gap-1.5 justify-end">
                  <span>🪙</span>
                  <span>{totalCoinRequired.toLocaleString('id-ID')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Pembayaran */}
          {invoice.status === 'unpaid' && (
            <div className="pt-2 space-y-2.5">
              {!isBalanceSufficient && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2">
                  <p className="text-xs text-amber-900 font-medium text-center">
                    Saldo koin Anda kurang <strong>🪙 {(totalCoinRequired - (walletBalance || 0)).toLocaleString('id-ID')}</strong> untuk membayar invoice ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Top Up Koin Sekarang</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={pay}
                disabled={paying || !isBalanceSufficient}
                className="w-full rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] py-3 text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Lock className="w-4 h-4 text-neutral-300" />
                <span>{paying ? 'Memproses Escrow Koin...' : 'Konfirmasi Bayar dengan Saldo Koin'}</span>
              </button>

              <p className="text-[10px] text-neutral-400 text-center">
                Dana koin akan ditahan di rekening penampung (Escrow) CreatorIn hingga hasil akhir disetujui.
              </p>
            </div>
          )}

          {invoice.status === 'paid' && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pembayaran Berhasil Diverifikasi!</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Dana sebesar 🪙 {totalCoinRequired.toLocaleString('id-ID')} telah diamankan di Escrow. Collaboration Room telah aktif dan pengerjaan proyek dapat dipantau bersama Kreator.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Top Up Cepat */}
      <TopUpCoinModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={walletBalance || 0}
        onSuccess={(newBal) => {
          setWalletBalance(newBal);
        }}
      />
    </main>
  );
}
