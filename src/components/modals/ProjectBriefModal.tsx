import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Creator } from '@/types';

interface ProjectBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCreator?: Creator | null;
  preselectedCreator?: Creator | null;
}

export const ProjectBriefModal: React.FC<ProjectBriefModalProps> = ({
  isOpen,
  onClose,
  targetCreator,
  preselectedCreator,
}) => {
  const selectedCreator = targetCreator ?? preselectedCreator ?? null;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[16px] border border-black/10 shadow-xl max-w-xl w-full overflow-hidden text-left max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-black/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0D0C22]">
              {selectedCreator ? `Hubungi ${selectedCreator.name}` : 'Buat Brief Proyek Baru'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 font-normal">
              {selectedCreator 
                ? 'Mulai kolaborasi aman dengan garansi Career Score.' 
                : 'Kirim brief ke talenta terbaik di Creatorin untuk penawaran cepat.'}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-[8px] hover:bg-[#F3F3F4] transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-6 ring-emerald-50/50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-[#0D0C22]">Brief Berhasil Dikirim!</h4>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                {selectedCreator 
                  ? `Notifikasi telah dikirim ke ${selectedCreator.name}. Estimasi balasan: ${selectedCreator.responseTime || '1 jam'}.` 
                  : 'Brief proyek Anda telah disiarkan ke talenta terverifikasi yang cocok dengan kriteria Anda.'}
              </p>
              <div className="pt-3">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-[8px] bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedCreator && (
                <div className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F3F3F4] border border-black/10 mb-2">
                  <img
                    src={selectedCreator.avatar}
                    alt={selectedCreator.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#0D0C22]">{selectedCreator.name}</div>
                    <div className="text-[11px] text-neutral-500">{selectedCreator.roleTitle} • {selectedCreator.formattedRate}</div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="brief-project-title" className="block text-xs font-medium text-[#0D0C22] mb-1.5">
                  Judul Proyek / Nama Brand
                </label>
                <input
                  id="brief-project-title"
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Contoh: Video UGC Review Minuman Boba"
                  className="w-full px-3.5 py-2.5 rounded-[8px] border border-black/10 text-sm bg-white focus:outline-hidden focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="brief-content-format" className="block text-xs font-medium text-[#0D0C22] mb-1.5">
                    Format Konten
                  </label>
                  <select
                    id="brief-content-format"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[8px] border border-black/10 text-sm bg-white focus:outline-hidden focus:border-[#155DFC]"
                  >
                    <option value="UGC Video / TikTok">UGC Video / TikTok</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="Foto Produk Katalog">Foto Produk Katalog</option>
                    <option value="Desain Feed / Carousel">Desain Feed / Carousel</option>
                    <option value="Branding & Logo">Branding & Logo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brief-budget-range" className="block text-xs font-medium text-[#0D0C22] mb-1.5">
                    Estimasi Budget
                  </label>
                  <select
                    id="brief-budget-range"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[8px] border border-black/10 text-sm bg-white focus:outline-hidden focus:border-[#155DFC]"
                  >
                    <option value="Rp300.000 - Rp750.000">Rp300.000 - Rp750.000</option>
                    <option value="Rp750.000 - Rp1.500.000">Rp750.000 - Rp1.500.000</option>
                    <option value="Rp1.500.000 - Rp3.000.000">Rp1.500.000 - Rp3.000.000</option>
                    <option value="> Rp3.000.000">&gt; Rp3.000.000</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brief-deadline" className="block text-xs font-medium text-[#0D0C22] mb-1.5">
                    Tenggat Waktu
                  </label>
                  <select
                    id="brief-deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[8px] border border-black/10 text-sm bg-white focus:outline-hidden focus:border-[#155DFC]"
                  >
                    <option value="3 Hari Kerja">3 Hari Kerja</option>
                    <option value="5 Hari Kerja">5 Hari Kerja</option>
                    <option value="7 Hari Kerja">7 Hari Kerja</option>
                    <option value="14 Hari Kerja">14 Hari Kerja</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="brief-details" className="block text-xs font-medium text-[#0D0C22] mb-1.5">
                  Detail Brief & Harapan Hasil
                </label>
                <textarea
                  id="brief-details"
                  rows={4}
                  required
                  value={briefDetails}
                  onChange={(e) => setBriefDetails(e.target.value)}
                  placeholder="Jelaskan produk Anda, pesan utama yang harus disampaikan, dan referensi visual..."
                  className="w-full px-3.5 py-2.5 rounded-[8px] border border-black/10 text-sm bg-white focus:outline-hidden focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC]"
                />
              </div>

              {/* Escrow Guarantee Note */}
              <div className="p-3.5 rounded-[8px] bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Garansi Dana Terlindungi:</strong> Pembayaran Anda hanya akan diteruskan ke kreator setelah hasil pekerjaan Anda setujui sesuai brief.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-[8px] hover:bg-[#F3F3F4] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[8px] bg-[#155DFC] hover:bg-[#0E4CD1] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
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
