import React, { useState } from 'react';
import { Creator, PortfolioItem } from '../types';
import { CareerScoreBadge } from './CareerScoreBadge';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  RotateCcw, 
  Send,
  Sparkles,
  Heart,
  Eye,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

interface ProfileModalProps {
  creator: Creator | null;
  isOpen?: boolean;
  onClose: () => void;
  onInitiateProject?: (creator: Creator) => void;
  onOpenBrief?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ creator, isOpen = true, onClose, onInitiateProject, onOpenBrief }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !creator) return null;

  const initiateProject = () => {
    if (onInitiateProject) {
      onInitiateProject(creator);
    } else if (onOpenBrief) {
      onOpenBrief();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id={`creator-profile-modal-${creator.id}`}
        className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-4xl w-full overflow-hidden text-left max-h-[92vh] flex flex-col font-sans"
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-start justify-between bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-neutral-100"
              />
              {creator.careerScore.overall >= 90 && (
                <span className="absolute -bottom-1 -right-1 bg-[#0d0c22] text-white p-1 rounded-full ring-2 ring-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-bold text-[#0d0c22]">{creator.name}</h3>
                {creator.proBadge && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0d0c22] text-white tracking-wider">
                    PRO+
                  </span>
                )}
                {creator.selectBadge && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-200 tracking-wider">
                    SELECT
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {creator.careerScore.clientRating}
                  <span className="text-neutral-400 font-normal">({creator.careerScore.completedProjects})</span>
                </span>
              </div>

              <p className="text-sm font-medium text-neutral-600 mt-1">{creator.roleTitle}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {creator.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {creator.responseTime || 'Merespons cepat'}
                </span>
                <span>•</span>
                <span className="text-[#0d0c22] font-semibold">
                  Mulai {creator.formattedRate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-full border transition cursor-pointer ${
                isSaved ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
              title="Simpan Kreator"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Tentang Kreator</h4>
            <p className="text-sm text-neutral-700 leading-relaxed">{creator.bio}</p>
          </div>

          {/* Career Score Detailed Metrics */}
          <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-bold text-[#0d0c22]">Verified Career Score</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {creator.careerScore.tier}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Skor kredibilitas otomatis dari {creator.careerScore.completedProjects} proyek nyata dengan escrow.
                </p>
              </div>
              <div className="text-2xl font-black text-[#0d0c22]">
                {creator.careerScore.overall}<span className="text-sm font-normal text-neutral-400">/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-neutral-200/60">
              <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                <div className="text-[11px] text-neutral-400 font-medium">Ketepatan Deadline</div>
                <div className="text-base font-bold text-[#0d0c22] mt-0.5">{creator.careerScore.deadlineAccuracy}%</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Tepat Waktu</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                <div className="text-[11px] text-neutral-400 font-medium">Rata-rata Revisi</div>
                <div className="text-base font-bold text-[#0d0c22] mt-0.5">{creator.careerScore.revisionRate}x</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Sangat Rendah</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                <div className="text-[11px] text-neutral-400 font-medium">Proyek Selesai</div>
                <div className="text-base font-bold text-[#0d0c22] mt-0.5">{creator.careerScore.completedProjects}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">100% Tuntas</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
                <div className="text-[11px] text-neutral-400 font-medium">Rating Klien UMKM</div>
                <div className="text-base font-bold text-[#0d0c22] mt-0.5">{creator.careerScore.clientRating} / 5.0</div>
                <div className="text-[10px] text-amber-600 font-semibold">Kepuasan Tinggi</div>
              </div>
            </div>
          </div>

          {/* Portfolio Showcase Gallery */}
          {creator.portfolioSamples && creator.portfolioSamples.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Portofolio Unggulan ({creator.portfolioSamples.length})
                </h4>
                <span className="text-xs text-neutral-400">Klik item untuk preview</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {creator.portfolioSamples.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPortfolio(item)}
                    className="group cursor-pointer rounded-2xl border border-neutral-200/80 overflow-hidden bg-white hover:border-neutral-400 transition shadow-2xs"
                  >
                    <div className="aspect-4/3 relative overflow-hidden bg-neutral-100">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover "
                      />
                    </div>
                    <div className="p-2.5 text-center bg-white">
                      <span className="text-[10px] font-black tracking-wider text-neutral-800 uppercase">
                        {item.categoryTag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Services */}
          {creator.services && creator.services.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Daftar Layanan Tersedia ({creator.services.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {creator.services.map((srv, idx) => {
                  const imageSrc = srv.coverImage || 
                    creator.portfolioSamples?.[idx % (creator.portfolioSamples?.length || 1)]?.thumbnail ||
                    '/creatorin/service-pattern-1.png';

                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        onClose();
                        initiateProject();
                      }}
                      className="group/modalsrv flex flex-col cursor-pointer text-left select-none"
                    >
                      <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-900 relative shadow-2xs group-hover/modalsrv:shadow-md transition-all duration-300">
                        <img
                          src={imageSrc}
                          alt={srv.title}
                          className="w-full h-full object-cover "
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/modalsrv:opacity-100 transition-opacity duration-300" />
                        {srv.tag && (
                          <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                            {srv.tag}
                          </div>
                        )}
                        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover/modalsrv:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/modalsrv:translate-y-0">
                          <span className="bg-white text-[#0d0c22] text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <span>Pilih</span>
                            <span className="text-blue-600 font-bold">→</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 px-0.5 space-y-1">
                        <h5 className="text-[14px] font-bold text-[#0d0c22] group-hover/modalsrv:text-blue-600 transition-colors line-clamp-1 leading-snug">
                          {srv.title}
                        </h5>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[14px] font-black text-[#0d0c22] tracking-tight">
                            {srv.formattedPrice}
                          </span>
                          {srv.deliveryDays && (
                            <span className="text-[11px] font-medium text-neutral-400">
                              {srv.deliveryDays}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Keahlian / Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">Keahlian & Tag</h4>
            <div className="flex flex-wrap gap-2">
              {creator.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="text-xs text-neutral-400">Tarif Proyek Mulai</div>
            <div className="text-lg font-bold text-[#0d0c22]">{creator.formattedRate}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                initiateProject();
              }}
              className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-[#2b2a45] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <span>Hubungi Kreator</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Portfolio Lightbox Preview */}
      {selectedPortfolio && (
        <div 
          onClick={() => setSelectedPortfolio(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
          >
            <div className="aspect-16/10 relative overflow-hidden bg-neutral-900">
              <img
                src={selectedPortfolio.thumbnail}
                alt={selectedPortfolio.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 px-2 py-0.5 rounded-full bg-blue-50">
                  {selectedPortfolio.categoryTag}
                </span>
                <h4 className="text-base font-bold text-[#0d0c22] mt-1">{selectedPortfolio.title}</h4>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {selectedPortfolio.likes || '1.2k'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  {selectedPortfolio.views || '24k'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
