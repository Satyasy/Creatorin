'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Lock, 
  Bell, 
  Globe, 
  Check, 
  ShieldCheck, 
  Save, 
  Camera, 
  ArrowLeft 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, login } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.name || 'Sobakhul Munir Siroj');
  const [email, setEmail] = useState(user?.email || 'munir@creatorin.id');
  const [location, setLocation] = useState('Jakarta Selatan, Indonesia');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [bio, setBio] = useState('Spesialis antarmuka UI/UX modern, visual website konversi tinggi, dan sistem desain komersial.');
  
  // Notification states
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Call account settings API
      const res = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          location,
          phone,
          notifyEmail,
          notifyPush,
          language,
          ...(newPassword && newPassword === confirmPassword ? { newPassword } : {})
        })
      });

      // Update local state in auth provider if user exists
      if (user) {
        login({
          ...user,
          name: fullName,
          email: email
        });
      }
    } catch {
      // Local fallback
      if (user) {
        login({
          ...user,
          name: fullName,
          email: email
        });
      }
    } finally {
      setIsSaving(false);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] font-sans pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Top Back / Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-neutral-200/60 transition cursor-pointer text-neutral-600"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
                Pengaturan Akun
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Kelola informasi profil, preferensi notifikasi, dan keamanan akun Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#0B1F3A] text-[#0B1F3A]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Utama</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'border-[#0B1F3A] text-[#0B1F3A]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifikasi & Bahasa</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#0B1F3A] text-[#0B1F3A]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Keamanan & Sandi</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* TAB 1: PROFIL UTAMA */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-2xs">
              
              {/* Avatar Section */}
              <div className="flex items-center gap-5 pb-6 border-b border-[#E2E8F0]">
                <div className="relative">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                    alt={fullName}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-neutral-100"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0B1F3A] text-white shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">{fullName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{user?.role === 'creator' ? 'Kreator Terverifikasi' : 'Brand / UMKM'}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3F3F4] text-neutral-700">
                    Format JPG, PNG maks 2MB
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Lokasi Domisili
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Bio / Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors resize-none"
                />
              </div>

            </div>
          )}

          {/* TAB 2: NOTIFIKASI & BAHASA */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-2xs">
              <h3 className="text-sm font-bold text-[#171717]">Preferensi Notifikasi</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] bg-neutral-50/50">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#171717]">Notifikasi Email</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Terima pembaruan brief, pembayaran escrow, dan pesan baru via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="w-5 h-5 accent-[#0B1F3A] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] bg-neutral-50/50">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#171717]">Notifikasi Push & Browser</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Dapatkan pemberitahuan seketika saat ada kiriman revisi atau persetujuan proyek.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyPush}
                    onChange={(e) => setNotifyPush(e.target.checked)}
                    className="w-5 h-5 accent-[#0B1F3A] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Bahasa Antarmuka
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('id')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      language === 'id' 
                        ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white' 
                        : 'border-[#E2E8F0] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Bahasa Indonesia
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      language === 'en' 
                        ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white' 
                        : 'border-[#E2E8F0] text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: KEAMANAN & SANDI */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-2xs">
              <h3 className="text-sm font-bold text-[#171717]">Ubah Kata Sandi</h3>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Kata Sandi Lama
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B1F3A] text-[#171717] transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Akun Anda dilindungi dengan enkripsi standar industri dan verifikasi escrow otomatis untuk setiap transaksi.
                </p>
              </div>

            </div>
          )}

          {/* Action Save Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isSavedToast && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Pengaturan berhasil disimpan!</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] active:scale-95 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
