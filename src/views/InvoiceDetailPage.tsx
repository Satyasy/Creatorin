'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ActivePage, AuthState } from '@/types';

export interface InvoiceDetailProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  invoiceData?: { id: string; serviceTitle?: string; amount?: string; status?: 'unpaid' | 'paid'; messageId?: string; dueDate?: string; scopeSummary?: string; creatorName?: string; creatorRole?: string; creatorAvatar?: string; clientName?: string; clientBrand?: string };
  onPaymentSuccess?: (invoiceId: string, messageId?: string) => void;
  onClose?: () => void;
}

type Invoice = {
  id: string; invoiceNumber: string; title: string; scopeDescription: string;
  totalAmount: number; deadlineDays: number; revisionRules: string | null;
  status: 'unpaid' | 'paid' | 'cancelled'; createdAt: string;
  creatorId: string; businessId: string;
  creator: { fullName: string } | null; business: { fullName: string; companyName: string | null } | null;
};

export function InvoiceDetailPage({ invoiceData, onPaymentSuccess, onClose }: InvoiceDetailProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!invoiceData?.id) { setError('Nomor invoice tidak tersedia.'); setLoading(false); return; }
    let active = true;
    fetch(`/api/invoices/${encodeURIComponent(invoiceData.id)}`, { cache: 'no-store' })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Gagal memuat invoice');
        return body.invoice as Invoice;
      })
      .then(data => { if (active) setInvoice(data); })
      .catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Gagal memuat invoice'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [invoiceData?.id]);

  const pay = async () => {
    if (!invoice) return;
    setPaying(true);
    setError('');
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pay`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Pembayaran gagal');
      setInvoice({ ...invoice, status: 'paid' });
      onPaymentSuccess?.(invoice.id, invoiceData?.messageId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pembayaran gagal');
    } finally { setPaying(false); }
  };

  return <main className="container-creatorin max-w-3xl py-10 sm:py-16">
    <button type="button" onClick={() => onClose ? onClose() : router.back()} className="mb-8 text-sm font-semibold text-primary">← Kembali</button>
    <h1 className="text-3xl font-semibold text-[var(--ink)]">Detail invoice</h1>
    {loading && <p className="mt-8 text-sm text-[var(--muted)]">Memuat invoice...</p>}
    {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
    {invoice && <div className="mt-8 rounded-2xl border border-[var(--outline)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--outline)] pb-6">
        <div><p className="text-sm text-[var(--muted)]">{invoice.invoiceNumber}</p><h2 className="mt-2 text-xl font-semibold">{invoice.title}</h2></div>
        <span className="rounded-full bg-[#F8F9FC] px-3 py-1 text-sm font-semibold">{invoice.status === 'paid' ? 'Dibayar' : invoice.status === 'cancelled' ? 'Dibatalkan' : 'Belum dibayar'}</span>
      </div>
      <dl className="grid gap-5 py-6 text-sm sm:grid-cols-2">
        <div><dt className="text-[var(--muted)]">Kreator</dt><dd className="mt-1 font-semibold">{invoice.creator?.fullName || '—'}</dd></div>
        <div><dt className="text-[var(--muted)]">UMKM</dt><dd className="mt-1 font-semibold">{invoice.business?.companyName || invoice.business?.fullName || '—'}</dd></div>
        <div><dt className="text-[var(--muted)]">Tanggal dibuat</dt><dd className="mt-1 font-semibold">{new Date(invoice.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</dd></div>
        <div><dt className="text-[var(--muted)]">Tenggat kerja</dt><dd className="mt-1 font-semibold">{invoice.deadlineDays} hari setelah dibayar</dd></div>
      </dl>
      <p className="border-t border-[var(--outline)] py-5 text-sm leading-6">{invoice.scopeDescription}</p>
      <div className="flex items-center justify-between border-t border-[var(--outline)] pt-5"><span className="font-semibold">Total</span><strong className="text-xl">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(invoice.totalAmount)}</strong></div>
      {invoice.status === 'unpaid' && <button type="button" onClick={pay} disabled={paying} className="mt-8 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{paying ? 'Memproses...' : 'Bayar dengan saldo koin'}</button>}
      {invoice.status === 'paid' && <p className="mt-8 rounded-xl bg-green-50 p-4 text-sm text-green-800">Pembayaran tercatat. Lihat status proyek di halaman kontrak.</p>}
    </div>}
  </main>;
}
