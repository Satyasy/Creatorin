'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  QrCode,
  Building2,
  Smartphone,
  CreditCard,
  Printer,
  CheckCircle2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ActivePage, AuthState } from '@/types';

export interface InvoiceDetailProps {
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  invoiceData?: {
    id: string;
    serviceTitle: string;
    amount: string;
    status: 'unpaid' | 'paid';
    dueDate?: string;
    scopeSummary?: string;
    creatorName?: string;
    creatorRole?: string;
    creatorAvatar?: string;
    clientName?: string;
    clientBrand?: string;
    messageId?: string;
  };
  onPaymentSuccess?: (invoiceId: string, messageId?: string) => void;
  onClose?: () => void;
}

type PaymentMethodType = 'qris' | 'va' | 'ewallet' | 'card';

export const InvoiceDetailPage: React.FC<InvoiceDetailProps> = ({
  currentUser: propUser,
  onNavigate,
  invoiceData,
  onPaymentSuccess,
  onClose
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser;

  const navigateTo = (page: ActivePage, path?: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (path) {
      router.push(path);
    } else {
      router.push('/chat');
    }
  };

  const invoice = {
    id: invoiceData?.id || 'INV-882194',
    invoiceNumber: `INV/2026/09/CRT-${invoiceData?.id ? invoiceData.id.replace(/\D/g, '') || '882194' : '882194'}`,
    serviceTitle: invoiceData?.serviceTitle || 'Premium Figma SaaS Landing Page Template & UI Design',
    scopeSummary: invoiceData?.scopeSummary || 'Desain 5 Screen Landing Page Desktop & Mobile (Figma Hi-Fi) • Design System Terstruktur • 2x Revisi Minor',
    amount: invoiceData?.amount || 'Rp1.500.000',
    status: invoiceData?.status || 'unpaid',
    dueDateText: invoiceData?.dueDate || '24 Jam',
    creator: {
      name: invoiceData?.creatorName || 'Sobakhul Munir Siroj',
      role: invoiceData?.creatorRole || 'Top Rated UI/UX Designer & Framer Developer',
      avatar: invoiceData?.creatorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    client: {
      name: currentUser?.name || invoiceData?.clientName || 'GlowLab Skincare Indonesia',
      brand: invoiceData?.clientBrand || 'GlowLab Skincare (UMKM)',
      email: currentUser?.email || 'glowlab@creatorin.id',
    },
    issueDate: '24 September 2026, 14:30 WIB',
  };

  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>(invoice.status);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('qris');
  const [selectedVaBank, setSelectedVaBank] = useState<'bca' | 'mandiri' | 'bni' | 'bri'>('bca');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 12 });

  useEffect(() => {
    if (paymentStatus === 'paid') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s+/g, ''));
    setCopiedField(fieldName);
    showToast(`${label} berhasil disalin!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentStatus('paid');
      showToast('Pembayaran berhasil! Dana tersimpan aman di Escrow Creatorin.');
      if (onPaymentSuccess) {
        onPaymentSuccess(invoice.id, invoiceData?.messageId);
      }
    }, 1200);
  };

  const vaNumbers: Record<string, { name: string; code: string; logo: string }> = {
    bca: { name: 'BCA Virtual Account', code: '8277 0812 3456 7890', logo: 'BCA' },
    mandiri: { name: 'Mandiri Virtual Account', code: '8950 0812 3456 7890', logo: 'MANDIRI' },
    bni: { name: 'BNI Virtual Account', code: '9881 0812 3456 7890', logo: 'BNI' },
    bri: { name: 'BRI Virtual Account', code: '1280 0812 3456 7890', logo: 'BRI' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 px-4 py-2.5 bg-[#0B1F3A] text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Compact and Sleek */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-black/5 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onClose) onClose();
                else navigateTo('chat', '/chat');
              }}
              className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-black transition flex items-center justify-center cursor-pointer shadow-2xs"
              title="Kembali ke Room Chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Invoice Resmi
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-[11px] font-mono font-semibold text-blue-600">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#0D0C22] leading-tight">
                Detail Pembayaran & Escrow
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(invoice.invoiceNumber, 'invNo', 'Nomor Invoice')}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-700 transition flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'invNo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-neutral-400" />}
              <span className="hidden sm:inline">Salin Nomor</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-700 transition flex items-center gap-1 cursor-pointer"
              title="Cetak Invoice"
            >
              <Printer className="w-3 h-3 text-neutral-400" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Status Announcement Bar */}
        {paymentStatus === 'unpaid' ? (
          <div className="rounded-xl px-4 py-3 bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-amber-950 shadow-2xs print:hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">Menunggu Pembayaran</span>
                <span className="text-amber-800/80 ml-2 hidden sm:inline">
                  Transfer ke Escrow Creatorin untuk mengaktifkan pengerjaan proyek.
                </span>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-[#0D0C22] shrink-0 bg-white px-2.5 py-1 rounded-md border border-amber-200">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        ) : (
          <div className="rounded-xl px-4 py-3 bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-2xs print:hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900">✓ Lunas & Terproteksi Escrow</span>
                <span className="text-emerald-800/80 ml-2">
                  Dana sebesar <strong>{invoice.amount}</strong> telah diamankan. Proyek siap dikerjakan!
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onClose) onClose();
                else navigateTo('chat', '/chat');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kembali ke Room Chat</span>
            </button>
          </div>
        )}

        {/* 2-Column Responsive Grid - Compact & Structured */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ========================================================= */}
          {/* COLUMN 1: RINGKASAN TAGIHAN RESMI (INVOICE SLIP)         */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-4 text-left shadow-2xs">
            {/* Header Slip */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0D0C22] text-white flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <span className="text-sm font-bold text-[#0D0C22]">Creatorin Escrow</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                {invoice.issueDate}
              </span>
            </div>

            {/* Pihak Terkait: Kreator & Klien */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Kreator</span>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={invoice.creator.avatar}
                    alt={invoice.creator.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[#0D0C22] truncate text-xs">{invoice.creator.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{invoice.creator.role}</p>
                  </div>
                </div>
              </div>

              <div className="border-l border-neutral-200/60 pl-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Klien (UMKM)</span>
                <p className="font-bold text-[#0D0C22] truncate text-xs mt-1">{invoice.client.brand}</p>
                <p className="text-[10px] text-neutral-500 truncate">{invoice.client.email}</p>
              </div>
            </div>

            {/* Ruang Lingkup Layanan */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Rincian Layanan</span>
              <div className="p-3 rounded-xl border border-neutral-200/80 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#0D0C22] text-xs">{invoice.serviceTitle}</h4>
                  <span className="font-bold font-mono text-[#0D0C22] text-xs shrink-0">{invoice.amount}</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {invoice.scopeSummary}
                </p>
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2 text-[10px] text-neutral-600 font-medium">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">✓ 2x Revisi Minor</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">✓ Lisensi Komersial</span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">✓ File Master Editable</span>
                </div>
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Biaya Jasa Kreator</span>
                <span className="font-medium text-neutral-800">{invoice.amount}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span className="flex items-center gap-1">
                  <span>Proteksi Escrow 100%</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">GRATIS</span>
                </span>
                <span className="text-emerald-600 font-medium">Rp0</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm">
                <span className="font-bold text-[#0D0C22]">Total Pembayaran:</span>
                <span className="font-bold text-lg text-blue-600 font-mono">{invoice.amount}</span>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2 text-[11px] text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Dana ditahan aman di Escrow hingga Anda menyetujui hasil karya akhir.</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: KANAL PEMBAYARAN RINGKAS (QRIS / VA / E-WALLET) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-4 text-left shadow-2xs print:hidden">
            
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div>
                <h3 className="text-sm font-bold text-[#0D0C22]">Pilih Kanal Pembayaran</h3>
                <p className="text-[11px] text-neutral-400">Verifikasi instan via Rekening Escrow</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>SSL Secured</span>
              </div>
            </div>

            {/* Method Segmented Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl text-xs">
              <button
                id="pay-method-qris"
                type="button"
                onClick={() => setSelectedMethod('qris')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  selectedMethod === 'qris' ? 'bg-white text-[#0D0C22] shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QRIS</span>
              </button>

              <button
                id="pay-method-va"
                type="button"
                onClick={() => setSelectedMethod('va')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  selectedMethod === 'va' ? 'bg-white text-[#0D0C22] shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>VA Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('ewallet')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  selectedMethod === 'ewallet' ? 'bg-white text-[#0D0C22] shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>E-Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  selectedMethod === 'card' ? 'bg-white text-[#0D0C22] shadow-2xs' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Kartu</span>
              </button>
            </div>

            {/* METHOD CONTENT 1: QRIS */}
            {selectedMethod === 'qris' && (
              <div className="space-y-3 pt-1 text-center">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/5 text-[10px] font-bold text-neutral-500">
                    <span className="text-rose-600 font-extrabold">QRIS GPN</span>
                    <span>NMID: ID1020240988219</span>
                  </div>

                  {/* QR Image */}
                  <div className="mx-auto w-36 h-36 bg-white p-2 rounded-xl border border-neutral-200 flex items-center justify-center shadow-2xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`CREATORIN-ESCROW-${invoice.id}-${invoice.amount}`)}`}
                      alt="QRIS Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-neutral-500">
                    Scan via GoPay, OVO, Dana, BCA, Livin, atau m-Banking apapun.
                  </p>
                </div>
              </div>
            )}

            {/* METHOD CONTENT 2: VIRTUAL ACCOUNT */}
            {selectedMethod === 'va' && (
              <div className="space-y-3 pt-1">
                {/* Bank Pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(['bca', 'mandiri', 'bni', 'bri'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedVaBank(b)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        selectedVaBank === b
                          ? 'border-[#0D0C22] bg-[#0D0C22] text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {b.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* VA Code & Copy */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] text-neutral-500 font-medium">Nomor {vaNumbers[selectedVaBank].name}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-[#0D0C22] tracking-wider">
                      {vaNumbers[selectedVaBank].code}
                    </span>
                    <button
                      onClick={() => handleCopy(vaNumbers[selectedVaBank].code, 'vaCode', 'Nomor Virtual Account')}
                      className="px-2 py-1 rounded-md bg-white border border-neutral-200 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer flex items-center gap-1"
                    >
                      {copiedField === 'vaCode' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                      <span>Salin</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 space-y-0.5 pl-1">
                  <p>1. Buka m-Banking atau ATM bank pilihan Anda.</p>
                  <p>2. Pilih Transfer Virtual Account & masukkan nomor di atas.</p>
                  <p>3. Konfirmasi nominal {invoice.amount} atas nama <strong>CREATORIN ESCROW</strong>.</p>
                </div>
              </div>
            )}

            {/* METHOD CONTENT 3: E-WALLET */}
            {selectedMethod === 'ewallet' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {['GoPay', 'OVO', 'DANA', 'ShopeePay'].map((ew) => (
                    <div key={ew} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                      <span className="font-semibold text-neutral-800">{ew}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Instan</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500 pt-1">
                  Akan diarahkan ke aplikasi e-wallet pilihan untuk otorisasi pembayaran satu klik.
                </p>
              </div>
            )}

            {/* METHOD CONTENT 4: KARTU KREDIT/DEBIT */}
            {selectedMethod === 'card' && (
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 text-[11px] text-neutral-600 space-y-2">
                  <p>Mendukung Visa, Mastercard, dan JCB dengan autentikasi 3D-Secure OTP.</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-white border border-neutral-200 font-mono text-[10px] font-bold">VISA</span>
                    <span className="px-2 py-1 rounded bg-white border border-neutral-200 font-mono text-[10px] font-bold">MASTERCARD</span>
                    <span className="px-2 py-1 rounded bg-white border border-neutral-200 font-mono text-[10px] font-bold">JCB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Button (Simulasi Pembayaran) */}
            <div className="pt-2">
              {paymentStatus === 'unpaid' ? (
                <button
                  id="btn-confirm-pay"
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="w-full py-2.5 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] disabled:bg-neutral-300 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Simulasikan Pembayaran Berhasil</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800 font-semibold">
                  ✓ Pembayaran Telah Selesai
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
