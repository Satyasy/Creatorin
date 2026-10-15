'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { chatService } from '@/services/chatService';

export interface DiscussInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    tag?: string;
    formattedPrice?: string;
    price?: number;
    deliveryDays?: string;
    coverImage?: string;
    description?: string;
  };
  creator: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    roleTitle?: string;
  };
  itemType?: 'service' | 'project';
  onSuccess?: (conversationId: string, creatorId: string) => void;
}

export const DiscussInquiryModal: React.FC<DiscussInquiryModalProps> = ({
  isOpen,
  onClose,
  item,
  creator,
  itemType = 'service',
  onSuccess,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const formattedPriceDisplay =
    item.formattedPrice ||
    (item.price ? `🪙 ${item.price.toLocaleString('id-ID')}` : '🪙 200.000');

  const deliveryDisplay =
    item.deliveryDays || (itemType === 'project' ? '3-5 Hari Kerja' : '3 Hari Kerja');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    if (!user) {
      showToast({
        type: 'warning',
        title: t('toast.authRequired', 'Perlu Masuk Akun'),
        message: 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk mendiskusikan kebutuhan Anda dengan kreator.',
        action: {
          label: t('action.signIn', 'Masuk ke Akun'),
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await chatService.sendServiceInquiry({
        creator: {
          id: creator.id,
          name: creator.name,
          username: creator.username,
          avatar: creator.avatar || '',
          roleTitle: creator.roleTitle || 'Kreator Profesional',
        },
        service: {
          id: item.id,
          title: item.title,
          price: item.price || 0,
          formattedPrice: formattedPriceDisplay,
          deliveryDays: deliveryDisplay,
          coverImage: item.coverImage || '',
          tag: item.tag || (itemType === 'project' ? 'Proyek Portofolio' : 'Layanan Kreatif'),
          description: item.description || '',
        },
        message: text,
        currentUser: user,
      });

      showToast({
        type: 'success',
        title: 'Pesan Terkirim',
        message: `Pesan diskusi berhasil dikirim ke ${creator.name}!`,
      });

      onClose();
      if (onSuccess) {
        onSuccess(res.conversationId, creator.id);
      } else {
        router.push(`/chat?conversationId=${res.conversationId}&creatorId=${creator.id}`);
      }
    } catch (err: unknown) {
      showToast({
        type: 'error',
        title: 'Gagal Mengirim',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan diskusi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full overflow-hidden text-left max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-start justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide">
              {item.tag || (itemType === 'project' ? 'Proyek Portofolio' : 'Layanan Kreatif')}
            </span>
            <h3 className="text-xl font-bold text-[#0d0c22] mt-1.5 leading-snug">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
              <span>Oleh {creator.name}</span>
              <span>•</span>
              <span>{deliveryDisplay}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
            aria-label="Tutup form diskusi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Price summary */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-bold uppercase">
                {itemType === 'project' ? 'Estimasi Nilai Proyek' : t('service.totalCost', 'Total Biaya Layanan')}
              </span>
              <p className="text-xl font-black text-[#0d0c22] mt-0.5">
                {formattedPriceDisplay}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400 font-bold uppercase">
                {itemType === 'project' ? 'Estimasi Waktu' : t('service.estimateDelivery', 'Estimasi Pengerjaan')}
              </span>
              <p className="text-sm font-bold text-neutral-800 mt-0.5">
                {deliveryDisplay}
              </p>
            </div>
          </div>

          {/* Input Kirim Pesan untuk Kreator */}
          <div>
            <label className="block text-xs font-bold text-[#0d0c22] mb-1.5">
              {t('service.sendMessageToCreator', 'Kirim pesan untuk kreator')}
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                itemType === 'project'
                  ? 'Tulis pesan atau pertanyaan Anda terkait proyek ini ke kreator...'
                  : t('service.messagePlaceholder', 'Tulis pesan atau pertanyaan Anda terkait layanan ini ke kreator...')
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0d0c22] resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              {t('action.cancel', 'Batal')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#0D0C22] hover:bg-[#1a1936] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>{t('service.sending', 'Mengirim...')}</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('action.sendMessage', 'Kirim Pesan')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
