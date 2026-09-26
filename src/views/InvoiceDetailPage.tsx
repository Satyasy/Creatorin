'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  Store,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Lock,
  Share2,
  Info,
  Calendar,
  User,
  FileText
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

type PaymentMethodType = 'qris' | 'va' | 'ewallet' | 'retail' | 'card';

export const InvoiceDetailPage: React.FC<InvoiceDetailProps> = ({
  currentUser: propUser,
  onSignOut,
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
      const routeMap: Record<string, string> = {
        'home': '/',
        'landing': '/landing',
        'explore': '/explore',
        'explore-projects': '/explore/projects',
        'explore-services': '/explore/services',
        'chat': '/chat',
        'collaboration': '/collaboration',
        'collaboration-room': '/collaboration',
        'notifications': '/notifications',
        'briefs': '/briefs',
        'signin': '/sign-in',
        'signup': '/sign-up',
      };
      router.push(routeMap[page] || '/chat');
    }
  };
  // Default fallback data if opened independently or from chat
  const invoice = {
    id: invoiceData?.id || 'INV-882194',
    invoiceNumber: `INV/2026/09/CRT-${invoiceData?.id ? invoiceData.id.replace(/\D/g, '') || '882194' : '882194'}`,
    serviceTitle: invoiceData?.serviceTitle || 'Premium Figma SaaS Landing Page Template & UI Design',
    scopeSummary: invoiceData?.scopeSummary || 'Desain 5 Screen Landing Page Desktop & Mobile (Figma Hi-Fi) • Design System Terstruktur • 2x Revisi Minor',
    amount: invoiceData?.amount || 'Rp1.500.000',
    numericAmount: parseInt((invoiceData?.amount || '1500000').replace(/\D/g, '')) || 1500000,
    status: invoiceData?.status || 'unpaid',
    dueDateText: invoiceData?.dueDate || '24 Jam',
    creator: {
      name: invoiceData?.creatorName || 'Munir Rohman',
      role: invoiceData?.creatorRole || 'Top Rated UI/UX Designer & Framer Developer',
      avatar: invoiceData?.creatorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      completedProjects: 24,
      verified: true
    },
    client: {
      name: currentUser?.name || invoiceData?.clientName || 'Dimas Wicaksono',
      brand: invoiceData?.clientBrand || 'Kopi Kenangan Senja (UMKM)',
      email: currentUser?.email || 'dimas.w@kopikenangansenja.id',
      phone: '+62 812-3456-7890',
      location: 'Jakarta Selatan, Indonesia'
    },
    issueDate: '24 September 2026, 14:30 WIB',
    paymentCode: '8821940015000000'
  };

  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>(invoice.status);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('qris');
  const [selectedVaBank, setSelectedVaBank] = useState<'bca' | 'mandiri' | 'bni' | 'bri' | 'permata'>('bca');
  const [selectedEwallet, setSelectedEwallet] = useState<'gopay' | 'ovo' | 'dana' | 'shopeepay'>('gopay');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'m-banking' | 'atm' | 'ibanking'>('m-banking');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic countdown timer (23 hours, 45 minutes)
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s+/g, ''));
    setCopiedField(fieldName);
    showToast(`${label} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Simulate payment completion
  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentStatus('paid');
      showToast('🎉 Pembayaran Berhasil Diverifikasi! Dana telah diamankan di Rekening Escrow Creatorin.');
      if (onPaymentSuccess) {
        onPaymentSuccess(invoice.id, invoiceData?.messageId);
      }
    }, 1800);
  };

  // Virtual Account data definition
  const vaAccounts = {
    bca: {
      name: 'BCA Virtual Account',
      code: '8277 0812 3456 7890',
      logoText: 'BCA',
      color: 'bg-blue-600',
      instructions: {
        'm-banking': [
          'Buka aplikasi BCA Mobile, pilih m-BCA dan masukkan Kode Akses Anda.',
          'Pilih menu m-Transfer > BCA Virtual Account.',
          'Masukkan nomor Virtual Account: 8277 0812 3456 7890.',
          `Pastikan nama merchant "CREATORIN ESCROW" dan jumlah tagihan ${invoice.amount}.`,
          'Masukkan PIN m-BCA Anda dan simpan bukti transfer digital.'
        ],
        atm: [
          'Masukkan Kartu ATM BCA dan PIN Anda.',
          'Pilih menu Transaksi Lainnya > Transfer > Ke Rek BCA Virtual Account.',
          'Masukkan nomor Virtual Account 8277 0812 3456 7890 lalu tekan Benar.',
          `Periksa konfirmasi pembayaran ${invoice.amount} atas nama CREATORIN ESCROW.`,
          'Tekan Ya untuk menyelesaikan transaksi dan ambil struk ATM.'
        ],
        ibanking: [
          'Login ke KlikBCA Individual (https://ibank.klikbca.com).',
          'Pilih menu Transfer Dana > Transfer ke BCA Virtual Account.',
          'Masukkan nomor VA 8277 0812 3456 7890.',
          'Masukkan respon KeyBCA Appli 1 dan klik Kirim.'
        ]
      }
    },
    mandiri: {
      name: 'Mandiri Virtual Account',
      code: '8890 8123 4567 8901',
      logoText: 'MANDIRI',
      color: 'bg-amber-600',
      instructions: {
        'm-banking': [
          'Buka aplikasi Livin\' by Mandiri dan login.',
          'Pilih menu Bayar > Buat Pembayaran Baru > Multipayment.',
          'Pilih penyedia jasa: "Creatorin Escrow" (Kode: 88908).',
          'Masukkan nomor Virtual Account: 8890 8123 4567 8901.',
          `Konfirmasi nominal ${invoice.amount} dan masukkan PIN Livin\' Anda.`
        ],
        atm: [
          'Masukkan Kartu ATM Mandiri dan PIN Anda.',
          'Pilih menu Bayar/Beli > Multipayment.',
          'Masukkan Kode Perusahaan "88908" lalu tekan Benar.',
          'Masukkan nomor VA 8890 8123 4567 8901.',
          'Tekan angka 1 untuk memilih tagihan dan selesaikan transaksi.'
        ],
        ibanking: [
          'Login ke Mandiri Internet Banking.',
          'Pilih menu Bayar > Multi Payment.',
          'Pilih penyedia Creatorin Escrow dan masukkan nomor VA.',
          'Konfirmasi transaksi dengan Token Mandiri.'
        ]
      }
    },
    bni: {
      name: 'BNI Virtual Account',
      code: '9881 2345 6789 0123',
      logoText: 'BNI',
      color: 'bg-teal-600',
      instructions: {
        'm-banking': [
          'Buka BNI Mobile Banking dan login.',
          'Pilih menu Transfer > Virtual Account Billing.',
          'Pilih tab Input Baru dan masukkan nomor: 9881 2345 6789 0123.',
          `Tagihan senilai ${invoice.amount} akan muncul otomatis.`,
          'Masukkan Password Transaksi dan selesaikan pembayaran.'
        ],
        atm: [
          'Masukkan Kartu ATM BNI dan PIN.',
          'Pilih Menu Lainnya > Transfer > Jenis Rekening: Tabungan.',
          'Pilih Virtual Account Billing dan masukkan 9881 2345 6789 0123.',
          'Konfirmasi rincian pembayaran dan tekan Ya.'
        ],
        ibanking: [
          'Login BNI Internet Banking.',
          'Pilih Transaksi > Pembelian/Pembayaran > Tagihan Pembayaran.',
          'Pilih Virtual Account Billing dan konfirmasi transaksi.'
        ]
      }
    },
    bri: {
      name: 'BRI Virtual Account (BRIVA)',
      code: '1280 0812 3456 7890',
      logoText: 'BRI',
      color: 'bg-blue-700',
      instructions: {
        'm-banking': [
          'Buka aplikasi BRImo dan login.',
          'Pilih menu Tagihan > BRIVA.',
          'Pilih Pembayaran Baru dan masukkan nomor: 1280 0812 3456 7890.',
          `Verifikasi nama merchant CREATORIN ESCROW dan nominal ${invoice.amount}.`,
          'Masukkan PIN BRImo untuk menyelesaikan transaksi.'
        ],
        atm: [
          'Masukkan Kartu ATM BRI dan PIN.',
          'Pilih Transaksi Lain > Pembayaran > Lainnya > BRIVA.',
          'Masukkan 16 digit nomor BRIVA 1280 0812 3456 7890.',
          'Tekan Ya untuk memproses pembayaran.'
        ],
        ibanking: [
          'Login ke Internet Banking BRI.',
          'Pilih Pembayaran Tagihan > Pembayaran BRIVA.',
          'Masukkan kode BRIVA dan selesaikan dengan m-Token.'
        ]
      }
    },
    permata: {
      name: 'Permata Virtual Account',
      code: '8528 0812 3456 7890',
      logoText: 'PERMATA',
      color: 'bg-emerald-600',
      instructions: {
        'm-banking': [
          'Buka aplikasi PermataME dan login.',
          'Pilih menu Bayar Tagihan > Virtual Account.',
          'Masukkan nomor: 8528 0812 3456 7890.',
          'Konfirmasi detail tagihan dan masukkan PIN PermataME Anda.'
        ],
        atm: [
          'Masukkan kartu ATM dan PIN.',
          'Pilih Transaksi Lainnya > Pembayaran > Pembayaran Lainnya > Virtual Account.',
          'Masukkan nomor VA 8528 0812 3456 7890 dan konfirmasi.'
        ],
        ibanking: [
          'Login ke PermataNet, pilih Pembayaran > Virtual Account.',
          'Masukkan nomor VA dan masukkan kode otentikasi SMS.'
        ]
      }
    }
  };

  const currentVa = vaAccounts[selectedVaBank];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0d0c22] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#0d0c22] text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar rendered by (main) layout */}

      {/* Main Container */}
      <main className="max-w-[1116px] mx-auto px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onClose) onClose();
                else navigateTo('chat', '/chat');
              }}
              className="w-10 h-10 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200/80 text-neutral-600 hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Kembali ke Percakapan Chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Tagihan Resmi
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs font-semibold text-blue-600 font-mono">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d0c22] tracking-tight">
                Detail Pembayaran & Invoice
              </h1>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(invoice.invoiceNumber, 'invNo', 'Nomor Invoice')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 text-xs font-semibold text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedField === 'invNo' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>Salin No. Tagihan</span>
            </button>

            <button
              onClick={handlePrintInvoice}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 text-xs font-semibold text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Cetak atau simpan invoice sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-400" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Status Announcement Banner */}
        {paymentStatus === 'unpaid' ? (
          <div className="rounded-2xl p-4 sm:p-5 bg-amber-50/70 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950 shadow-2xs print:hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900">
                    Menunggu Pembayaran
                  </span>
                  <span className="text-xs font-semibold text-amber-800/80">
                    Batas Waktu: {invoice.dueDateText}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900/90 font-medium mt-0.5">
                  Selesaikan transfer ke Rekening Escrow Creatorin untuk otomatis mengaktifkan Collaboration Room.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0 bg-white/95 px-3.5 py-2 rounded-xl border border-amber-200/80 shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium">Sisa Waktu:</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-[#0d0c22]">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-950 shadow-2xs print:hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    ✓ Lunas & Terproteksi Escrow
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    Otomatis Terverifikasi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900/90 font-medium mt-0.5">
                  Dana sebesar <strong>{invoice.amount}</strong> telah diamankan di Rekening Bersama Escrow. Collaboration Room aktif!
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('collaboration-room', '/collaboration')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer shrink-0 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Buka Collaboration Room</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* COLUMN 1: OFFICIAL INVOICE SHEET (CLEAN, MINIMALIST DOCUMENT)             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 shadow-2xs p-6 sm:p-8 space-y-6 text-left relative overflow-hidden print:p-0 print:border-none print:shadow-none">
            
            {/* Lunas Stamp */}
            {paymentStatus === 'paid' && (
              <div className="absolute top-6 right-6 pointer-events-none opacity-90 rotate-[-10deg] z-10">
                <div className="border-2 border-emerald-600 text-emerald-700 font-extrabold uppercase text-xs px-3.5 py-1.5 rounded-xl tracking-wider bg-emerald-50/90 shadow-2xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>LUNAS • ESCROW</span>
                </div>
              </div>
            )}

            {/* Document Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0d0c22] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    C
                  </div>
                  <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0d0c22]">
                    Creatorin Escrow
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-normal">
                  Sistem Rekening Bersama & Pembayaran Resmi Kreator
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Nomor Tagihan
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#0d0c22] block">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-[11px] text-neutral-400 block">
                  {invoice.issueDate}
                </span>
              </div>
            </div>

            {/* Parties: Creator & Client Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 text-xs">
              
              {/* Creator / Provider */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Penyedia Jasa (Kreator)
                </span>
                <div className="flex items-center gap-2.5 pt-0.5">
                  <img
                    src={invoice.creator.avatar}
                    alt={invoice.creator.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200"
                  />
                  <div>
                    <div className="font-bold text-[#0d0c22] text-sm flex items-center gap-1">
                      <span>{invoice.creator.name}</span>
                      {invoice.creator.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-600 text-white" />
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                      {invoice.creator.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client / UMKM */}
              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-neutral-200/60 pt-3 sm:pt-0 sm:pl-5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Ditagihkan Kepada (Klien)
                </span>
                <div className="pt-0.5">
                  <div className="font-bold text-[#0d0c22] text-sm">
                    {invoice.client.brand}
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    PIC: {invoice.client.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {invoice.client.email}
                  </div>
                </div>
              </div>

            </div>

            {/* Deliverables & Scope Card */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block">
                Ruang Lingkup & Deliverables
              </span>
              
              <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/70 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#0d0c22]">
                      {invoice.serviceTitle}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {invoice.scopeSummary}
                    </p>
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-[#0d0c22] shrink-0 font-mono">
                    {invoice.amount}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-neutral-600 font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>2x Revisi Minor Terarah</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Lisensi Komersial Lengkap</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-700">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>File Master (Figma/Source)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Biaya Jasa Kreator</span>
                <span className="font-semibold text-neutral-800">{invoice.amount}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span>Proteksi Rekening Escrow 100%</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">GRATIS</span>
                </span>
                <span className="font-semibold text-emerald-700">Rp0</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Biaya Admin & Platform</span>
                <span className="font-semibold text-neutral-800">Rp0</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-sm sm:text-base">
                <span className="font-bold text-[#0d0c22]">Total Tagihan:</span>
                <span className="font-extrabold text-xl sm:text-2xl text-blue-600 font-mono tracking-tight">
                  {invoice.amount}
                </span>
              </div>
            </div>

            {/* Escrow Guarantee Statement */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-150/70 flex items-start gap-3 text-xs text-blue-950">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Jaminan 100% Aman dengan Escrow Creatorin:</span>
                <p className="text-blue-900/80 leading-relaxed text-[11px]">
                  Dana yang Anda bayarkan tidak diteruskan langsung ke rekening pribadi kreator, melainkan ditahan di Rekening Escrow dan baru dicairkan setelah Anda menyetujui hasil akhir proyek.
                </p>
              </div>
            </div>

            {/* Micro Legal Footer */}
            <div className="pt-1 text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-100 flex items-center justify-between">
              <span>Creatorin Escrow • Dokumen Elektronik Sah</span>
              <span>Bantuan: help@creatorin.id</span>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: PAYMENT METHODS, QRIS & BARCODE (CLEAN & CLEAR)                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-5 print:hidden">
            
            {/* Payment Method Container */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs p-5 sm:p-6 space-y-5 text-left">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#0d0c22]">
                    Metode Pembayaran
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Pilih kanal pembayaran yang paling nyaman untuk Anda
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              {/* Segmented Method Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('qris')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedMethod === 'qris'
                      ? 'bg-white text-[#0d0c22] shadow-2xs'
                      : 'text-neutral-600 hover:text-[#0d0c22]'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>QRIS Instan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('va')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedMethod === 'va'
                      ? 'bg-white text-[#0d0c22] shadow-2xs'
                      : 'text-neutral-600 hover:text-[#0d0c22]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Virtual Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('ewallet')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedMethod === 'ewallet'
                      ? 'bg-white text-[#0d0c22] shadow-2xs'
                      : 'text-neutral-600 hover:text-[#0d0c22]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>E-Wallet</span>
                </button>
              </div>

              {/* Secondary Methods Bar (Retail & Card) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('retail')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                    selectedMethod === 'retail'
                      ? 'bg-[#0d0c22] text-white border-[#0d0c22]'
                      : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200/80'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Indomaret / Alfa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                    selectedMethod === 'card'
                      ? 'bg-[#0d0c22] text-white border-[#0d0c22]'
                      : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200/80'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Kartu Kredit/Debit</span>
                </button>
              </div>

              {/* ============================================================= */}
              {/* TAB 1: QRIS & CLEAN BARCODE DISPLAY                           */}
              {/* ============================================================= */}
              {selectedMethod === 'qris' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                  
                  {/* QRIS Modern Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 text-center space-y-3">
                    
                    {/* Header: GPN & QRIS */}
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                      <span className="font-extrabold text-xs text-red-600 tracking-wider">
                        GPN
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-sm">
                          QRIS
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">
                          Standar Nasional BI
                        </span>
                      </div>
                    </div>

                    {/* Merchant Details */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0d0c22]">
                        CREATORIN ESCROW INDONESIA
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-400">
                        NMID: ID1020240988219 • A01
                      </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="relative mx-auto w-44 h-44 sm:w-48 sm:h-48 p-2.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900 fill-current">
                        {/* Finder Patterns */}
                        <rect x="5" y="5" width="26" height="26" fill="black" rx="2" />
                        <rect x="8" y="8" width="20" height="20" fill="white" />
                        <rect x="11" y="11" width="14" height="14" fill="black" />

                        <rect x="69" y="5" width="26" height="26" fill="black" rx="2" />
                        <rect x="72" y="8" width="20" height="20" fill="white" />
                        <rect x="75" y="11" width="14" height="14" fill="black" />

                        <rect x="5" y="69" width="26" height="26" fill="black" rx="2" />
                        <rect x="8" y="72" width="20" height="20" fill="white" />
                        <rect x="11" y="75" width="14" height="14" fill="black" />

                        {/* Timing Lines */}
                        <rect x="34" y="8" width="3" height="3" />
                        <rect x="40" y="8" width="3" height="3" />
                        <rect x="46" y="8" width="3" height="3" />
                        <rect x="52" y="8" width="3" height="3" />
                        <rect x="58" y="8" width="3" height="3" />
                        <rect x="64" y="8" width="3" height="3" />
                        <rect x="8" y="34" width="3" height="3" />
                        <rect x="8" y="40" width="3" height="3" />
                        <rect x="8" y="46" width="3" height="3" />
                        <rect x="8" y="52" width="3" height="3" />
                        <rect x="8" y="58" width="3" height="3" />
                        <rect x="8" y="64" width="3" height="3" />

                        {/* Modules Pattern Simulation */}
                        <rect x="35" y="18" width="5" height="5" />
                        <rect x="45" y="18" width="8" height="4" />
                        <rect x="58" y="18" width="5" height="5" />

                        <rect x="18" y="35" width="6" height="6" />
                        <rect x="28" y="35" width="4" height="8" />
                        <rect x="36" y="34" width="8" height="4" />
                        <rect x="68" y="35" width="8" height="5" />
                        <rect x="80" y="35" width="5" height="8" />
                        <rect x="88" y="38" width="6" height="4" />

                        <rect x="18" y="48" width="8" height="5" />
                        <rect x="30" y="46" width="6" height="6" />
                        <rect x="66" y="46" width="8" height="6" />
                        <rect x="78" y="48" width="7" height="4" />
                        <rect x="88" y="46" width="5" height="8" />

                        <rect x="18" y="58" width="5" height="6" />
                        <rect x="26" y="56" width="8" height="5" />
                        <rect x="68" y="56" width="5" height="7" />
                        <rect x="76" y="58" width="9" height="5" />

                        <rect x="35" y="68" width="7" height="6" />
                        <rect x="46" y="68" width="8" height="5" />
                        <rect x="58" y="68" width="6" height="7" />
                        <rect x="70" y="68" width="6" height="6" />
                        <rect x="80" y="70" width="8" height="5" />

                        <rect x="36" y="78" width="8" height="6" />
                        <rect x="48" y="80" width="6" height="8" />
                        <rect x="58" y="78" width="9" height="5" />
                        <rect x="72" y="80" width="6" height="8" />
                        <rect x="82" y="82" width="7" height="6" />

                        <rect x="36" y="88" width="6" height="6" />
                        <rect x="46" y="90" width="8" height="4" />
                        <rect x="58" y="88" width="7" height="6" />
                        <rect x="70" y="90" width="9" height="4" />

                        {/* Center Icon Box */}
                        <rect x="40" y="40" width="20" height="20" fill="white" rx="3" />
                        <rect x="42" y="42" width="16" height="16" fill="#0d0c22" rx="2" />
                      </svg>

                      {/* Shield in center */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>

                    {/* Exact Amount */}
                    <div className="pt-0.5">
                      <span className="text-[10px] text-neutral-400 block">
                        Jumlah Pembayaran Pas:
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono text-[#0d0c22]">
                        {invoice.amount}
                      </span>
                    </div>

                    {/* Clean 1D Barcode Strip */}
                    <div className="pt-2 border-t border-neutral-200/60">
                      <span className="text-[10px] text-neutral-400 font-medium block mb-1">
                        Barcode Pembayaran Kasir / EDC:
                      </span>
                      <div className="flex items-center justify-center gap-[2px] h-8 px-4 bg-white rounded-lg border border-neutral-200 py-1 max-w-[280px] mx-auto">
                        <span className="w-[3px] h-full bg-neutral-900"></span>
                        <span className="w-[1px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-transparent"></span>
                        <span className="w-[4px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-neutral-900"></span>
                        <span className="w-[1px] h-full bg-transparent"></span>
                        <span className="w-[3px] h-full bg-neutral-900"></span>
                        <span className="w-[1px] h-full bg-neutral-900"></span>
                        <span className="w-[3px] h-full bg-transparent"></span>
                        <span className="w-[2px] h-full bg-neutral-900"></span>
                        <span className="w-[4px] h-full bg-neutral-900"></span>
                        <span className="w-[1px] h-full bg-transparent"></span>
                        <span className="w-[2px] h-full bg-neutral-900"></span>
                        <span className="w-[3px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-transparent"></span>
                        <span className="w-[4px] h-full bg-neutral-900"></span>
                        <span className="w-[1px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-transparent"></span>
                        <span className="w-[3px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-neutral-900"></span>
                        <span className="w-[3px] h-full bg-transparent"></span>
                        <span className="w-[1px] h-full bg-neutral-900"></span>
                        <span className="w-[4px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-neutral-900"></span>
                        <span className="w-[1px] h-full bg-transparent"></span>
                        <span className="w-[3px] h-full bg-neutral-900"></span>
                        <span className="w-[2px] h-full bg-neutral-900"></span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-neutral-500 block mt-1">
                        8821 9400 1500 0000
                      </span>
                    </div>

                  </div>

                  {/* Clean Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('📥 Gambar QRIS berhasil diunduh ke galeri perangkat Anda!')}
                      className="py-2 px-3 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 text-[#0d0c22] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Unduh QRIS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy('8821940015000000', 'barcode', 'Kode Pembayaran')}
                      className="py-2 px-3 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 text-[#0d0c22] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Salin Kode</span>
                    </button>
                  </div>

                  {/* Supported Apps List */}
                  <div className="p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100 text-center space-y-1">
                    <span className="text-[10px] font-medium text-neutral-400 block">
                      Mendukung Semua m-Banking & E-Wallet:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-neutral-600">
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">BCA</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">Mandiri</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">BRI</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">BNI</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">GoPay</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">OVO</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">DANA</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-neutral-200/60">ShopeePay</span>
                    </div>
                  </div>

                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 2: VIRTUAL ACCOUNT (CLEAN & CLEAR)                        */}
              {/* ============================================================= */}
              {selectedMethod === 'va' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                  
                  {/* Bank Selector Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {(Object.keys(vaAccounts) as Array<keyof typeof vaAccounts>).map((bk) => (
                      <button
                        key={bk}
                        type="button"
                        onClick={() => setSelectedVaBank(bk)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                          selectedVaBank === bk
                            ? 'bg-[#0d0c22] text-white border-[#0d0c22]'
                            : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200/80'
                        }`}
                      >
                        {vaAccounts[bk].logoText}
                      </button>
                    ))}
                  </div>

                  {/* Active VA Card */}
                  <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700">
                        {currentVa.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                        Verifikasi Otomatis
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block mb-1">
                        Nomor Virtual Account:
                      </span>
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-neutral-200">
                        <span className="text-base sm:text-lg font-bold font-mono tracking-wider text-[#0d0c22]">
                          {currentVa.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentVa.code, 'vaNum', 'Nomor Virtual Account')}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#0d0c22] text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === 'vaNum' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Salin</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block mb-1">
                        Jumlah Transfer Pas:
                      </span>
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-neutral-200">
                        <span className="text-sm sm:text-base font-bold font-mono text-blue-600">
                          {invoice.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(invoice.numericAmount.toString(), 'amount', 'Jumlah Tagihan')}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#0d0c22] text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          {copiedField === 'amount' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Salin</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Instructions Accordion */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-700 block">
                      Petunjuk Pembayaran Transfer:
                    </span>
                    <div className="flex items-center gap-1 border-b border-neutral-200 pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveInstructionTab('m-banking')}
                        className={`px-3 py-1 text-xs font-semibold rounded-t-lg transition cursor-pointer ${
                          activeInstructionTab === 'm-banking'
                            ? 'border-b-2 border-[#0d0c22] font-bold text-[#0d0c22]'
                            : 'text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        m-Banking
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveInstructionTab('atm')}
                        className={`px-3 py-1 text-xs font-semibold rounded-t-lg transition cursor-pointer ${
                          activeInstructionTab === 'atm'
                            ? 'border-b-2 border-[#0d0c22] font-bold text-[#0d0c22]'
                            : 'text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        ATM
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveInstructionTab('ibanking')}
                        className={`px-3 py-1 text-xs font-semibold rounded-t-lg transition cursor-pointer ${
                          activeInstructionTab === 'ibanking'
                            ? 'border-b-2 border-[#0d0c22] font-bold text-[#0d0c22]'
                            : 'text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        Internet Banking
                      </button>
                    </div>

                    <ol className="space-y-2 text-xs text-neutral-600 list-decimal list-inside p-3 bg-neutral-50 rounded-xl leading-relaxed">
                      {currentVa.instructions[activeInstructionTab].map((step, idx) => (
                        <li key={idx} className="pl-1">
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 3: E-WALLET (CLEAN)                                       */}
              {/* ============================================================= */}
              {selectedMethod === 'ewallet' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'gopay', name: 'GoPay / Later' },
                      { id: 'ovo', name: 'OVO' },
                      { id: 'dana', name: 'DANA' },
                      { id: 'shopeepay', name: 'ShopeePay' }
                    ].map((ew) => (
                      <button
                        key={ew.id}
                        type="button"
                        onClick={() => setSelectedEwallet(ew.id as any)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                          selectedEwallet === ew.id
                            ? 'bg-[#0d0c22] text-white border-[#0d0c22] shadow-2xs'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200/80'
                        }`}
                      >
                        <div className="text-xs font-bold">{ew.name}</div>
                        <div className={`text-[10px] ${selectedEwallet === ew.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          Buka aplikasi instan
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                        Nomor Handphone Terdaftar:
                      </label>
                      <input
                        type="tel"
                        defaultValue="081234567890"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-neutral-900 focus:outline-none focus:border-[#0d0c22]"
                        placeholder="0812xxxxxxx"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      Permintaan tagihan akan dikirimkan langsung ke aplikasi ponsel Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 4: RETAIL (INDOMARET / ALFAMART)                          */}
              {/* ============================================================= */}
              {selectedMethod === 'retail' && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-700">Indomaret / Alfamart</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200/60">Kasir</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block mb-1">Kode Pembayaran Kasir:</span>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-neutral-200">
                        <span className="text-base font-bold font-mono tracking-wider text-[#0d0c22]">
                          CRT-882194
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('CRT-882194', 'retailCode', 'Kode Pembayaran Kasir')}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold transition cursor-pointer"
                        >
                          Salin
                        </button>
                      </div>
                    </div>

                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-600 leading-relaxed">
                      <li>Kunjungi kasir Indomaret atau Alfamart terdekat.</li>
                      <li>Beritahu kasir ingin membayar tagihan <strong>Creatorin Escrow</strong>.</li>
                      <li>Berikan kode bayar dan selesaikan nominal <strong>{invoice.amount}</strong>.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 5: KARTU KREDIT / DEBIT                                   */}
              {/* ============================================================= */}
              {selectedMethod === 'card' && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                        Nomor Kartu:
                      </label>
                      <input
                        type="text"
                        placeholder="4123 4567 8901 2345"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-neutral-900 focus:outline-none focus:border-[#0d0c22]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                          Masa Berlaku (MM/YY):
                        </label>
                        <input
                          type="text"
                          placeholder="09/28"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-neutral-900 focus:outline-none focus:border-[#0d0c22]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                          CVV / CVC:
                        </label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono text-neutral-900 focus:outline-none focus:border-[#0d0c22]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-neutral-500">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Diproteksi oleh 3D Secure OTP & Visa/Mastercard Identity Check.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button: Verify Payment or Open Collab Room */}
              {paymentStatus === 'unpaid' ? (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleVerifyPayment}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Mengecek Verifikasi Escrow...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Saya Sudah Bayar (Cek Verifikasi)</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                    Sistem otomatis memverifikasi mutasi bank dalam 1-3 detik.
                  </p>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      navigateTo('collaboration-room', '/collaboration');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0d0c22] hover:bg-neutral-900 text-white text-sm font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Masuk ke Collaboration Room</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      navigateTo('chat', '/chat');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Kembali ke Percakapan Chat
                  </button>
                </div>
              )}

            </div>

            {/* Help & Support Minimal Card */}
            <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 text-xs text-neutral-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#0d0c22]">
                <HelpCircle className="w-4 h-4 text-neutral-500" />
                <span>Kendala Saat Pembayaran?</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Tim Support Escrow kami siap membantu pengecekan manual mutasi Anda secara instan 24/7.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-blue-600">
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="hover:underline">
                  WhatsApp Support →
                </a>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-400">Respon &lt; 2 menit</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer rendered by (main) layout */}
    </div>
  );
};
