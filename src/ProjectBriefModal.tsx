"use client";

import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, ShieldCheck, DollarSign, Calendar, FileText } from 'lucide-react';
import { Creator } from './types';

interface ProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCreator?: Creator | null;
}

export const ProjectBriefModal: React.FC<ProjectBriefModalProps> = ({
  isOpen,
  onClose,
  targetCreator
}) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectType, setProjectType] = useState('UGC Video / TikTok');
  const [budget, setBudget] = useState('Rp500.000 - Rp1.500.000');
  const [deadline, setDeadline] = useState('7 Hari Kerja');
  const [briefDetails, setBriefDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setProjectTitle('');
    setBriefDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full overflow-hidden text-left max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#0d0c22]">
              {targetCreator ? `Hubungi ${targetCreator.name}` : 'Buat Brief Proyek Baru'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {targetCreator 
                ? `Mulai kolaborasi aman dengan garansi Career Score.` 
                : 'Kirim brief ke talenta terbaik di Creatorin untuk mendapatkan penawaran.'}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#0d0c22]">Brief Berhasil Dikirim!</h4>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                {targetCreator 
                  ? `Notifikasi telah dikirim ke ${targetCreator.name}. Estimasi balasan: ${targetCreator.responseTime || '1 jam'}.` 
                  : 'Brief proyek Anda telah disiarkan ke talenta terverifikasi yang cocok dengan kriteria Anda.'}
              </p>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-[#2b2a45] text-white text-sm font-semibold transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {targetCreator && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-2">
                  <img
                    src={targetCreator.avatar}
                    alt={targetCreator.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#0d0c22]">{targetCreator.name}</div>
                    <div className="text-[11px] text-neutral-500">{targetCreator.roleTitle} • {targetCreator.formattedRate}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Judul Proyek / Nama Brand
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Contoh: Video UGC Review Minuman Boba / Katalog Skincare"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:border-[#0d0c22] focus:ring-1 focus:ring-[#0d0c22]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Format Konten
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-hidden focus:border-[#0d0c22]"
                  >
                    <option value="UGC Video / TikTok">UGC Video / TikTok</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="Foto Produk Katalog">Foto Produk Katalog</option>
                    <option value="Desain Feed / Carousel">Desain Feed / Carousel</option>
                    <option value="Branding & Logo">Branding & Logo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Estimasi Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-hidden focus:border-[#0d0c22]"
                  >
                    <option value="Rp300.000 - Rp750.000">Rp300.000 - Rp750.000</option>
                    <option value="Rp750.000 - Rp1.500.000">Rp750.000 - Rp1.500.000</option>
                    <option value="Rp1.500.000 - Rp3.000.000">Rp1.500.000 - Rp3.000.000</option>
                    <option value="> Rp3.000.000">&gt; Rp3.000.000</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Detail Brief & Harapan Hasil
                </label>
                <textarea
                  rows={4}
                  required
                  value={briefDetails}
                  onChange={(e) => setBriefDetails(e.target.value)}
                  placeholder="Jelaskan produk Anda, poin utama yang harus disampaikan kreator, batas waktu penyelesaian, dan referensi visual..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:border-[#0d0c22] focus:ring-1 focus:ring-[#0d0c22]"
                />
              </div>

              {/* Escrow Guarantee Note */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Garansi Dana Terlindungi:</strong> Pembayaran Anda hanya akan diteruskan ke kreator setelah hasil pekerjaan Anda setujui sesuai brief.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-[#2b2a45] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Brief Proyek</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
