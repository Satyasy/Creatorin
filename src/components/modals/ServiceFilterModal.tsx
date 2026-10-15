import React, { useState, useEffect } from 'react';
import { X, Search, Star } from 'lucide-react';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  minRating: number;
  availableForWork: boolean;
  fastDelivery: boolean;
  verifiedOnly: boolean;
}

interface ServiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const CATEGORY_OPTIONS = [
  'Logo & Branding',
  'Web Design',
  'Illustration',
  'Product Design',
  'Mobile',
  'Animation',
  'Typography',
  'Print'
];

// Helper to format currency display (Coins formatted for Creatorin platform)
export const formatIDR = (val: number): string => {
  if (val >= 10000000) return '🪙 10.000.000+';
  if (val <= 0) return '🪙 0';
  return `🪙 ${val.toLocaleString('id-ID')}`;
};

export const ServiceFilterModal: React.FC<ServiceFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset
}) => {
  // Local state initialized with current active filters
  const [category, setCategory] = useState<string>(filters.category);
  const [minPrice, setMinPrice] = useState<number>(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState<number>(filters.maxPrice);
  const [location, setLocation] = useState<string>(filters.location);
  const [minRating, setMinRating] = useState<number>(filters.minRating);
  const [availableForWork, setAvailableForWork] = useState<boolean>(filters.availableForWork);
  const [fastDelivery, setFastDelivery] = useState<boolean>(filters.fastDelivery);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(filters.verifiedOnly);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory(filters.category);
      setMinPrice(filters.minPrice);
      setMaxPrice(filters.maxPrice);
      setLocation(filters.location);
      setMinRating(filters.minRating);
      setAvailableForWork(filters.availableForWork);
      setFastDelivery(filters.fastDelivery);
      setVerifiedOnly(filters.verifiedOnly);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApplyClick = () => {
    onApply({
      category,
      minPrice,
      maxPrice,
      location,
      minRating,
      availableForWork,
      fastDelivery,
      verifiedOnly
    });
    onClose();
  };

  const handleResetClick = () => {
    setCategory('Semua');
    setMinPrice(0);
    setMaxPrice(10000000);
    setLocation('');
    setMinRating(0);
    setAvailableForWork(false);
    setFastDelivery(false);
    setVerifiedOnly(false);
    onReset();
    onClose();
  };

  // Calculate percentage positions for dual slider track
  const maxLimit = 10000000;
  const leftPercent = Math.min(100, Math.max(0, (minPrice / maxLimit) * 100));
  const rightPercent = Math.min(100, Math.max(0, (maxPrice / maxLimit) * 100));

  return (
    <div 
      id="service-filter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="service-filter-modal-card"
        className="relative w-full max-w-[490px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-[#E2E8F0] animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Exact match to uploaded image) */}
        <div className="relative px-6 py-4.5 border-b border-[#E2E8F0] flex items-center justify-center">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">
            Filters
          </h2>
          <button
            id="close-filter-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-600 hover:text-black transition cursor-pointer"
            aria-label="Tutup filter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#E2E8F0]">
          
          {/* Section 1: Categories */}
          <div className="px-6 py-5 sm:py-6">
            <h3 className="text-base font-bold text-[#171717] mb-3.5">
              Categories
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(isSelected ? 'Semua' : cat)}
                    className={`w-full py-2.5 px-3 rounded-full border text-xs sm:text-sm font-medium transition-all cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] font-semibold shadow-2xs'
                        : 'bg-white text-neutral-800 border-[#E2E8F0] hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Budget */}
          <div className="px-6 py-5 sm:py-6">
            <h3 className="text-base font-bold text-[#171717] mb-3.5">
              Budget
            </h3>

            {/* Single clean slider matching screenshot without duplicate bottom inputs */}
            <div className="py-3 px-1">
              <div className="relative h-1.5 w-full bg-neutral-200 rounded-full flex items-center">
                {/* Active track bar between handles */}
                <div 
                  className="absolute top-0 bottom-0 bg-[#8c9eff] rounded-full pointer-events-none"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${Math.max(2, rightPercent - leftPercent)}%`
                  }}
                />
                
                {/* Visual Left Thumb */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#8c9eff] shadow-xs pointer-events-none z-10"
                  style={{ left: `${leftPercent}%` }}
                />

                {/* Visual Right Thumb */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#8c9eff] shadow-xs pointer-events-none z-10"
                  style={{ left: `${rightPercent}%` }}
                />

                {/* Direct transparent slider overlays on the track */}
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="250000"
                  value={minPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v <= maxPrice) setMinPrice(v);
                  }}
                  className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto ${
                    minPrice > 5000000 ? 'z-25' : 'z-20'
                  }`}
                  title="Budget Minimum"
                />
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="250000"
                  value={maxPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= minPrice) setMaxPrice(v);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto z-20"
                  title="Budget Maksimum"
                />
              </div>

              {/* Minimum & Maximum value boxes */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs text-neutral-500 font-medium block mb-1.5">
                    Minimum
                  </label>
                  <div className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-center text-sm font-semibold text-neutral-800 bg-white">
                    {formatIDR(minPrice)}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 font-medium block mb-1.5">
                    Maximum
                  </label>
                  <div className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-center text-sm font-semibold text-neutral-800 bg-white">
                    {formatIDR(maxPrice)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="px-6 py-5 sm:py-6">
            <h3 className="text-base font-bold text-[#171717] mb-3.5">
              Location
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="filter-location-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter Location"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#171717] placeholder:text-neutral-400 focus:outline-hidden focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A] transition bg-white"
              />
            </div>
          </div>

          {/* Section 4: Rating */}
          <div className="px-6 py-5 sm:py-6">
            <h3 className="text-base font-bold text-[#171717] mb-3.5">
              Rating
            </h3>
            <div className="space-y-3">
              {[
                { stars: 5, minVal: 4.9 },
                { stars: 4, minVal: 4.5 },
                { stars: 3, minVal: 4.0 },
                { stars: 2, minVal: 3.5 },
              ].map(({ stars, minVal }) => {
                const isSelected = minRating === minVal;
                return (
                  <label
                    key={stars}
                    onClick={() => setMinRating(isSelected ? 0 : minVal)}
                    className="flex items-center gap-3.5 cursor-pointer group select-none"
                  >
                    {/* Radio button circle */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                      isSelected 
                        ? 'border-[#ff2a6d] bg-white' 
                        : 'border-neutral-300 group-hover:border-neutral-400'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff2a6d]" />
                      )}
                    </div>

                    {/* Star Icons in Hot Pink matching screenshot */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars
                              ? 'text-[#ff2a6d] fill-[#ff2a6d]'
                              : 'text-neutral-200 fill-neutral-200'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs sm:text-sm font-medium text-neutral-700">
                      & up
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Other Filters */}
          <div className="px-6 py-5 sm:py-6">
            <h3 className="text-base font-bold text-[#171717] mb-3.5">
              Other Filters
            </h3>
            
            <div className="space-y-4">
              {/* Toggle 1: Available for work (matching screenshot) */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-neutral-800 block">
                    Available for work
                  </span>
                  <span className="text-xs text-neutral-500">
                    Hanya tampilkan kreator yang siap terima project
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAvailableForWork(!availableForWork)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    availableForWork ? 'bg-[#ff2a6d]' : 'bg-neutral-200'
                  }`}
                  role="switch"
                  aria-checked={availableForWork}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      availableForWork ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Fast Delivery */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-neutral-800 block">
                    Pengerjaan Kilat (&le; 2 Hari)
                  </span>
                  <span className="text-xs text-neutral-500">
                    Proses produksi cepat untuk kebutuhan mendesak
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFastDelivery(!fastDelivery)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    fastDelivery ? 'bg-[#ff2a6d]' : 'bg-neutral-200'
                  }`}
                  role="switch"
                  aria-checked={fastDelivery}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      fastDelivery ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Verified Only */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold text-neutral-800 block">
                    Kreator Terverifikasi (Skor 90+)
                  </span>
                  <span className="text-xs text-neutral-500">
                    Tampilkan kreator dengan rekam jejak terbaik
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    verifiedOnly ? 'bg-[#ff2a6d]' : 'bg-neutral-200'
                  }`}
                  role="switch"
                  aria-checked={verifiedOnly}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer with Apply Button (Exact match to screenshot) */}
        <div className="p-5 sm:p-6 border-t border-[#E2E8F0] bg-white">
          <button
            id="apply-filters-btn"
            type="button"
            onClick={handleApplyClick}
            className="w-full py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] text-white font-semibold text-sm sm:text-base transition-all shadow-md active:scale-[0.99] cursor-pointer text-center"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            className="w-full mt-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 py-1 transition cursor-pointer text-center"
          >
            Reset all filters
          </button>
        </div>

      </div>
    </div>
  );
};
