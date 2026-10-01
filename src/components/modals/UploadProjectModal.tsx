'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Hash, Sparkles, Check, ArrowRight } from 'lucide-react';

interface UploadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProject: any) => void;
}

export const UploadProjectModal: React.FC<UploadProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['kreatorindonesia', 'ugcvideo', 'branding']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, '');
      if (tag && !hashtags.includes(tag)) {
        setHashtags([...hashtags, tag]);
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessToast(true);
      if (onSuccess) {
        onSuccess({
          id: `proj-${Date.now()}`,
          title: caption.slice(0, 30) || 'Karya Baru Kreator',
          caption,
          coverImage: imagePreview || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80',
          tags: hashtags,
          likesCount: 1,
          commentsCount: 0,
        });
      }
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 900);
    }, 1000);
  };

  return (
    <div 
      id="modal-upload-project"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header ala Instagram */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0D0C22]">Upload Proyek Baru</h3>
              <p className="text-[10px] text-neutral-400">Format Feed Portofolio ala Instagram</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* 1. Upload Gambar / Video */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Media Karya (Foto / Video)
            </label>
            <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-200 hover:border-blue-500 transition-colors bg-neutral-50/80 overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Klik untuk ganti media
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-neutral-200 text-neutral-500 mx-auto flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0D0C22] block">Pilih file media atau seret ke sini</span>
                    <span className="text-[11px] text-neutral-400">Mendukung JPG, PNG, MP4 hingga 20MB</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* 2. Caption */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Caption / Cerita Karya
            </label>
            <textarea
              id="input-project-caption"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ceritakan konsep karya, proses kreatif, atau hasil dari proyek ini..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm text-[#0D0C22] placeholder:text-neutral-400 focus:outline-none focus:border-[#0D0C22] transition resize-none"
            />
          </div>

          {/* 3. Hashtags */}
          <div id="hashtags-section">
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Hashtags Kategori
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  placeholder="Ketik hashtag dan tekan Enter (contoh: reels, uiux)..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-200 text-xs text-[#0D0C22] placeholder:text-neutral-400 focus:outline-none focus:border-[#0D0C22] transition"
                />
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-semibold"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="text-neutral-400 hover:text-black cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !caption.trim()}
              className="px-5 py-2 rounded-xl bg-[#0D0C22] hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : successToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Berhasil Diposting!</span>
                </>
              ) : (
                <>
                  <span>Posting Karya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
