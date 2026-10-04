'use client';

import React, { useState } from 'react';
import { X, Briefcase, Plus, Trash2, Check, ArrowRight, Upload } from 'lucide-react';
import { CreatorService } from '@/types';

interface UploadServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newService: CreatorService) => void;
}

export const UploadServiceModal: React.FC<UploadServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3 Hari Kerja');
  const [category, setCategory] = useState('Desain Grafis & UI/UX');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const newUrls: string[] = [];
      if (galleryImages[0]) URL.revokeObjectURL(galleryImages[0]);
      newUrls.push(URL.createObjectURL(files[0]));
      setGalleryImages(newUrls);
      setCoverFile(files[0]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (galleryImages[indexToRemove]) URL.revokeObjectURL(galleryImages[indexToRemove]);
    setGalleryImages([]);
    setCoverFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const form = new FormData();
      form.set('title', serviceName.trim());
      form.set('category', category);
      form.set('description', description.trim());
      form.set('price', price.trim());
      form.set('estimatedDays', deliveryDays);
      if (coverFile) form.set('file', coverFile);
      const response = await fetch('/api/services', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menerbitkan layanan.');
      setIsSubmitting(false);
      setSuccessToast(true);
      onSuccess?.({ id: result.service.id, title: result.service.title, price: result.service.priceNumeric, formattedPrice: result.service.price, deliveryDays: result.service.estimatedDays, description: result.service.description, tag: result.service.category, coverImage: result.service.imageUrl });
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 900);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal menerbitkan layanan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="modal-upload-service" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Layanan Komersial */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#155DFC] text-white flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0D0C22]">Upload Paket Layanan</h3>
              <p className="text-[10px] text-neutral-400">Katalog Penawaran Jasa untuk Klien & UMKM</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* 1. Nama Layanan */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">
              Nama Layanan
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Contoh: Pembuatan Website Landing Page Framer & UI Kit"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-[#0D0C22] placeholder:text-neutral-400 focus:outline-none focus:border-[#155DFC] transition"
            />
          </div>

          {/* 2. Deskripsi Layanan */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">
              Deskripsi & Ruang Lingkup Layanan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan apa saja yang klien dapatkan (deliverables, format file, lisensi)..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-[#0D0C22] placeholder:text-neutral-400 focus:outline-none focus:border-[#155DFC] transition resize-none"
            />
          </div>

          {/* 3. Estimasi Harga & Waktu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Estimasi Harga (Rp)
              </label>
              <input
                id="input-service-price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500000"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-[#0D0C22] placeholder:text-neutral-400 focus:outline-none focus:border-[#155DFC] transition font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Durasi Pengerjaan
              </label>
              <select
                id="input-service-delivery"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-[#0D0C22] bg-white focus:outline-none focus:border-[#155DFC] transition"
              >
                <option value="1 Hari Kerja">1 Hari Kerja (Express)</option>
                <option value="2-3 Hari Kerja">2-3 Hari Kerja</option>
                <option value="4-7 Hari Kerja">4-7 Hari Kerja</option>
                <option value="2 Minggu">2 Minggu</option>
              </select>
            </div>
          </div>

          {/* 4. Upload Gambar (Bisa Banyak) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Gambar Sampul Layanan
              </label>
              <span className="text-[10px] text-neutral-400">{galleryImages.length} gambar terpilih</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200 group">
                  <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Add Image Button */}
              <label className="relative aspect-video rounded-lg border-2 border-dashed border-neutral-200 hover:border-[#155DFC] transition flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-[#155DFC] cursor-pointer bg-neutral-50/50">
                <Plus className="w-4 h-4" />
                <span className="text-[9px] font-semibold">Tambah</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAddImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
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
              disabled={isSubmitting || !serviceName.trim()}
              className="px-5 py-2 rounded-xl bg-[#155DFC] hover:bg-[#0E4CD1] disabled:bg-neutral-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menerbitkan...</span>
                </>
              ) : successToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Layanan Diterbitkan!</span>
                </>
              ) : (
                <>
                  <span>Terbitkan Layanan</span>
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
