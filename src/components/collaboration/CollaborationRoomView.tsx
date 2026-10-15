'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Upload, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Coins, 
  RefreshCw, 
  FileText,
  Star
} from 'lucide-react';
import { AuthState, ChatConversation, ChatInvoice } from '@/types';
import { formatCoin } from '@/lib/coin';
import { useToast } from '@/providers/ToastProvider';
import { useConfirmModal } from '@/providers/ConfirmModalProvider';
import { useSuccessModal } from '@/providers/SuccessModalProvider';

interface DeliverableItem {
  id: string;
  version: number;
  title: string;
  url?: string;
  notes?: string;
  submittedAt: string;
  status: 'pending' | 'revision_requested' | 'approved';
  revisionNote?: string;
}

interface CollaborationRoomViewProps {
  conversation: ChatConversation;
  currentUser?: AuthState['user'];
  invoice?: ChatInvoice | null;
  onBackToChat: () => void;
  onSendChatMessage?: (text: string) => void;
}

export const CollaborationRoomView: React.FC<CollaborationRoomViewProps> = ({
  conversation,
  currentUser,
  invoice,
  onBackToChat,
  onSendChatMessage
}) => {
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<DeliverableItem[]>([]);
  
  // Determine if current user is Creator in this room
  const isCreator = roomData 
    ? roomData.creatorId === currentUser?.id 
    : (conversation.myRole === 'creator' || currentUser?.role === 'creator');

  const projectTitle = roomData?.title || invoice?.serviceTitle || conversation.category || 'Proyek Kolaborasi Konten Kreatif';
  
  // Format escrow amount to Coin
  const rawEscrow = invoice?.amount ? invoice.amount.replace(/[^0-9]/g, '') : '1500';
  const escrowCoin = parseInt(rawEscrow, 10) || 1500;
  const escrowDisplay = `${escrowCoin.toLocaleString('id-ID')} Koin`;

  // Determine current step (1: brief_dp, 2: production, 3: review, 4: completed)
  const computeStep = (status?: string, subs?: any[]) => {
    if (status === 'completed') return 4;
    if (status === 'review_pending' || (subs && subs.length > 0 && subs[0].status === 'pending')) return 3;
    if (status === 'revision_requested') return 2;
    return 2;
  };

  const [currentStep, setCurrentStep] = useState<number>(2);

  // Form input upload hasil karya kreator
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
  const [newDeliverableNotes, setNewDeliverableNotes] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Modal revisi UMKM
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [remainingRevisions, setRemainingRevisions] = useState(2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal review & rating UMKM untuk Kreator
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  const { showToast: showGlobalToast } = useToast();
  const { confirmModal } = useConfirmModal();
  const { showSuccessModal } = useSuccessModal();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live collaboration room data from backend
  const fetchRoomData = async () => {
    if (!invoice?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/collaboration-rooms/by-invoice/${invoice.id}`);
      if (res.ok) {
        const data = await res.json();
        setRoomData(data.room);
        
        const mappedSubs: DeliverableItem[] = (data.submissions || []).map((s: any) => ({
          id: s.id,
          version: s.version,
          title: `Hasil Karya Versi ${s.version}`,
          url: s.fileUrls && s.fileUrls[0] ? s.fileUrls[0] : undefined,
          notes: s.notes || undefined,
          submittedAt: new Date(s.submittedAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          status: s.status,
          revisionNote: data.revisions?.find((r: any) => r.submissionId === s.id)?.feedback,
        }));
        
        setSubmissionsList(mappedSubs);
        setCurrentStep(computeStep(data.room.status, mappedSubs));
        
        const revCount = data.revisions?.length || 0;
        setRemainingRevisions(Math.max(0, 2 - revCount));
      } else {
        // Fallback default sample if not yet created in DB
        setSubmissionsList([
          {
            id: 'del-1',
            version: 1,
            title: 'Draft Awal Pengerjaan Konten',
            url: 'https://creatorin.my.id/preview/draft-v1',
            notes: 'Draft versi 1 mencakup hook pembuka dan visual storytelling sesuai arahan brief.',
            submittedAt: 'Baru saja',
            status: 'pending'
          }
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [invoice?.id]);

  // Kreator mengunggah hasil karya
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliverableTitle.trim()) return;

    setIsSubmittingWork(true);
    try {
      if (roomData?.id) {
        const res = await fetch(`/api/collaboration-rooms/${roomData.id}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newDeliverableTitle,
            notes: newDeliverableNotes,
            fileUrls: newDeliverableUrl ? [newDeliverableUrl] : [],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengunggah hasil karya');
      }

      const nextVer = submissionsList.length + 1;
      const newItem: DeliverableItem = {
        id: `del-${Date.now()}`,
        version: nextVer,
        title: newDeliverableTitle,
        url: newDeliverableUrl || undefined,
        notes: newDeliverableNotes || undefined,
        submittedAt: 'Baru saja',
        status: 'pending'
      };

      setSubmissionsList(prev => [newItem, ...prev]);
      setCurrentStep(3); // Masuk ke tahap tinjauan
      setNewDeliverableTitle('');
      setNewDeliverableUrl('');
      setNewDeliverableNotes('');
      showSuccessModal({
        title: 'Hasil Karya Berhasil Dikirim!',
        message: `Hasil karya versi ${nextVer} berhasil dikirim ke UMKM untuk ditinjau.`,
        duration: 3000,
      });

      if (onSendChatMessage) {
        onSendChatMessage(`[Collaboration Room] Kreator telah mengunggah hasil karya versi ${nextVer}: "${newItem.title}". Silakan tinjau di Collaboration Room.`);
      }
    } catch (err: any) {
      showGlobalToast({
        type: 'error',
        title: 'Gagal Mengunggah Berkas',
        message: err.message || 'Terjadi gangguan saat mengirim hasil karya ke server.',
      });
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // UMKM meminta revisi
  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) return;

    if (remainingRevisions <= 0) {
      showGlobalToast({
        type: 'warning',
        title: 'Kuota Revisi Habis',
        message: 'Kuota revisi gratis sudah habis. Silakan diskusikan kebutuhan penyesuaian di ruang obrolan.',
      });
      return;
    }

    try {
      if (roomData?.id) {
        const res = await fetch(`/api/collaboration-rooms/${roomData.id}/revisions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: revisionFeedback.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengajukan revisi');
      }

      setRemainingRevisions(prev => prev - 1);
      setSubmissionsList(prev => prev.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            status: 'revision_requested',
            revisionNote: revisionFeedback
          };
        }
        return item;
      }));

      setCurrentStep(2); // Kembali ke produksi
      setIsRevisionModalOpen(false);
      showSuccessModal({
        title: 'Permintaan Revisi Terkirim',
        message: 'Catatan perbaikan telah diteruskan ke Kreator untuk ditindaklanjuti.',
        duration: 2500,
      });

      if (onSendChatMessage) {
        onSendChatMessage(`[Collaboration Room] UMKM meminta revisi: "${revisionFeedback}". Sisa kuota revisi: ${remainingRevisions - 1}x.`);
      }

      setRevisionFeedback('');
    } catch (err: any) {
      showGlobalToast({
        type: 'error',
        title: 'Gagal Mengirim Revisi',
        message: err.message || 'Terjadi gangguan saat menyampaikan permintaan revisi.',
      });
    }
  };

  // Kirim ulasan dan rating UMKM ke API
  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const creatorId = roomData?.creatorId || conversation.creatorId || conversation.partnerId;
      const roomId = roomData?.id;
      if (!roomId || !creatorId) {
        throw new Error('Informasi kolaborasi tidak lengkap.');
      }
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          roomId,
          projectTitle,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim ulasan');

      setHasSubmittedReview(true);
      setIsReviewModalOpen(false);
      showSuccessModal({
        title: 'Ulasan Berhasil Disimpan!',
        message: 'Terima kasih telah memberikan ulasan dan rating performa untuk kreator.',
        duration: 3000,
      });

      if (onSendChatMessage) {
        onSendChatMessage(`[Collaboration Room] UMKM telah memberikan ulasan bintang ⭐ ${reviewRating}/5: "${reviewComment.trim()}"`);
      }
    } catch (err: any) {
      showGlobalToast({
        type: 'error',
        title: 'Gagal Menyimpan Ulasan',
        message: err.message || 'Terjadi kesalahan saat memproses ulasan Anda.',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // UMKM menyetujui hasil karya & mencairkan escrow
  const handleApproveProject = async () => {
    const confirmed = await confirmModal({
      title: 'Setujui Hasil Karya & Selesaikan Proyek',
      message: `Apakah Anda yakin ingin menyetujui hasil karya ini? Setelah disetujui, dana Escrow sebesar 🪙 ${escrowDisplay} akan dicairkan ke saldo dompet Kreator dan proyek dianggap selesai.`,
      confirmText: 'Ya, Setujui & Cairkan',
      cancelText: 'Periksa Kembali',
      variant: 'primary',
    });
    if (!confirmed) return;

    try {
      if (roomData?.id) {
        const res = await fetch(`/api/collaboration-rooms/${roomData.id}/approve`, {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyetujui proyek');
      }

      setCurrentStep(4);
      setSubmissionsList(prev => prev.map((item, idx) => idx === 0 ? { ...item, status: 'approved' } : item));
      showSuccessModal({
        title: 'Proyek Selesai & Dana Dicairkan!',
        message: `Selamat! Hasil karya telah disetujui. Dana Escrow 🪙 ${escrowDisplay} berhasil dicairkan ke saldo Kreator.`,
        duration: 3500,
      });

      if (onSendChatMessage) {
        onSendChatMessage(`[Collaboration Room] Selamat! UMKM telah MENYETUJUI hasil akhir pengerjaan. Dana Escrow 🪙 ${escrowDisplay} telah berhasil dicairkan.`);
      }

      // Langsung munculkan formulir ulasan jika UMKM
      if (!isCreator && !hasSubmittedReview) {
        setTimeout(() => setIsReviewModalOpen(true), 600);
      }
    } catch (err: any) {
      showGlobalToast({
        type: 'error',
        title: 'Gagal Menyetujui Proyek',
        message: err.message || 'Terjadi kendala saat memproses persetujuan proyek.',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B1F3A] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar Collaboration Room */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToChat}
            className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Obrolan</span>
          </button>
          <div className="h-6 w-px bg-neutral-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                Collaboration Room
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentStep === 4 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentStep === 4 ? 'Proyek Selesai' : 'Sedang Berjalan'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                Akses: {isCreator ? 'Kreator' : 'UMKM'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-md">
              {projectTitle} • Bersama <strong>{conversation.name}</strong>
            </p>
          </div>
        </div>

        {/* Escrow Status Badge dengan Koin */}
        <div className="flex items-center gap-2.5 bg-amber-50/80 border border-amber-200/80 px-3.5 py-1.5 rounded-xl text-xs text-amber-950">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
            🪙
          </div>
          <div>
            <span className="text-[10px] text-amber-700 block font-medium">Dana Escrow Terproteksi</span>
            <span className="font-bold text-xs text-amber-950">{escrowDisplay}</span>
          </div>
        </div>
      </div>

      {/* Konten Utama Collaboration Room */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {/* 4 Tahapan Kolaborasi (Progress Stepper) */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Tahapan Pengerjaan Proyek
            </h2>
            <button
              onClick={fetchRoomData}
              disabled={loading}
              className="text-[11px] text-neutral-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Sinkron</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Step 1: Brief & DP */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              currentStep >= 1 ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950' : 'border-neutral-200 bg-neutral-50 text-neutral-400'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">01</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Brief & DP</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Escrow koin aktif</p>
              </div>
            </div>

            {/* Step 2: Produksi */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              currentStep === 2 
                ? 'border-blue-400 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20' 
                : currentStep > 2 
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950' 
                  : 'border-neutral-200 bg-neutral-50 text-neutral-400'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">02</span>
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Produksi</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{currentStep === 2 ? 'Kreator bekerja' : 'Selesai'}</p>
              </div>
            </div>

            {/* Step 3: Tinjauan Hasil */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              currentStep === 3 
                ? 'border-blue-400 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20' 
                : currentStep > 3 
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950' 
                  : 'border-neutral-200 bg-neutral-50 text-neutral-400'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">03</span>
                {currentStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-neutral-400" />}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Tinjauan Hasil</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{currentStep === 3 ? 'Review oleh UMKM' : 'Menunggu draf'}</p>
              </div>
            </div>

            {/* Step 4: Selesai */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              currentStep === 4 ? 'border-emerald-400 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20' : 'border-neutral-200 bg-neutral-50 text-neutral-400'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">04</span>
                {currentStep === 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-neutral-400" />}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Selesai</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{currentStep === 4 ? 'Koin dicairkan' : 'Tahap akhir'}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Panel Khusus Sesuai Role (STRICT RBAC) */}
        {currentStep < 4 && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#155DFC]" />
                <span>Panel Tindakan {isCreator ? 'Kreator' : 'Klien UMKM'}</span>
              </h2>
              <span className="text-xs text-neutral-500">
                Sisa kuota revisi: <strong className="text-neutral-800">{remainingRevisions}x</strong>
              </span>
            </div>

            {/* KREATOR ONLY: Form Upload Hasil Karya */}
            {isCreator && (
              <form onSubmit={handleSubmitDeliverable} className="space-y-3 pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-600">
                  Unggah draft atau hasil karya final untuk ditinjau oleh UMKM:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Judul Karya / Versi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Draft v1 Video Reels 9:16"
                      value={newDeliverableTitle}
                      onChange={(e) => setNewDeliverableTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Tautan File / Google Drive / Figma (Opsional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={newDeliverableUrl}
                      onChange={(e) => setNewDeliverableUrl(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Catatan untuk Klien
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Jelaskan bagian yang baru diselesaikan atau panduan meninjau..."
                    value={newDeliverableNotes}
                    onChange={(e) => setNewDeliverableNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingWork}
                    className="h-10 px-5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isSubmittingWork ? 'Mengirim...' : 'Kirim Karya ke UMKM'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* UMKM ONLY: Tombol Tinjauan & Approval */}
            {!isCreator && (
              <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-neutral-600">
                  Periksa hasil karya yang dikirimkan. Anda dapat meminta revisi minor atau menyetujui hasil final untuk mencairkan koin escrow.
                </p>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsRevisionModalOpen(true)}
                    disabled={remainingRevisions <= 0}
                    className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Minta Revisi ({remainingRevisions})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveProject}
                    className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Selesaikan Proyek</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Banner Status Selesai & Tombol Ulasan */}
        {currentStep === 4 && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-emerald-950">
                  Proyek Telah Selesai & Disetujui
                </h2>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Dana Escrow sebesar 🪙 {escrowDisplay} telah dicairkan ke saldo dompet Kreator.
                </p>
              </div>
            </div>
            {!isCreator && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>{hasSubmittedReview ? 'Edit Ulasan Kreator' : 'Beri Ulasan & Rating'}</span>
              </button>
            )}
          </div>
        )}

        {/* Daftar Hasil Karya / Deliverables History */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900">
            Daftar Berkas & Hasil Karya ({submissionsList.length})
          </h2>

          <div className="space-y-3">
            {submissionsList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition bg-neutral-50/50 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      v{item.version}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-neutral-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Diunggah: {item.submittedAt}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'revision_requested'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status === 'approved' ? '✓ Disetujui' : item.status === 'revision_requested' ? 'Perlu Revisi' : 'Menunggu Review'}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-100">
                    {item.notes}
                  </p>
                )}

                {item.revisionNote && (
                  <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] font-bold">Catatan Revisi dari UMKM:</strong>
                      <span>{item.revisionNote}</span>
                    </div>
                  </div>
                )}

                {item.url && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>Buka Tautan Pratinjau Karya</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL MINTA REVISI DARI UMKM */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">
                Ajukan Catatan Revisi
              </h3>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestRevision} className="space-y-3">
              <p className="text-xs text-neutral-600">
                Berikan instruksi revisi yang spesifik agar Kreator dapat menyesuaikan dengan cepat:
              </p>
              <textarea
                required
                rows={4}
                placeholder="Contoh: Tolong sesuaikan warna teks di 5 detik awal, dan perbaiki penulisan tagline..."
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-[#0B1F3A]"
              />

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Sisa Kuota: <strong>{remainingRevisions}x revisi</strong></span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRevisionModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Kirim Catatan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BERI ULASAN & RATING DARI UMKM (POST /api/reviews) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Beri Ulasan & Rating Kreator
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Proyek telah selesai. Ulasan Anda akan tercatat di profil publik kreator.
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Rating Kualitas Kerja
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-neutral-700 ml-2">
                    {reviewRating} dari 5 Bintang
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Testimoni / Catatan Kepuasan
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ceritakan pengalaman kolaborasi Anda: komunikasi, ketepatan waktu, dan kualitas konten yang dihasilkan..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Nanti Saja
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#123B8C] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingReview ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim Ulasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
