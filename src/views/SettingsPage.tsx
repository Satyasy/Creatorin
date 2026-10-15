'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useToast } from '@/providers/ToastProvider';
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
  ArrowLeft,
  Loader2,
  LogOut 
} from 'lucide-react';
import { useConfirmModal } from '@/providers/ConfirmModalProvider';
import { useSuccessModal } from '@/providers/SuccessModalProvider';
import { uploadImageWithRetry } from '@/lib/uploadHelper';

export const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const { confirmModal } = useConfirmModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmed = await confirmModal({
      title: 'Konfirmasi Keluar Akun',
      message: 'Apakah Anda yakin ingin keluar dari akun Creatorin ini?',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      variant: 'danger',
    });
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      showToast({
        type: 'info',
        message: 'Anda telah berhasil keluar dari akun.',
      });
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [prevUserId, setPrevUserId] = useState<string | undefined>(user?.id);

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setFullName(user?.name || '');
    setEmail(user?.email || '');
    setLocation(user?.location || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
  }
  
  // Global hooks
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const { showSuccessModal } = useSuccessModal();

  // Notification states
  const [notifyPush, setNotifyPush] = useState(true);

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setSaveError('');
    try {
      const uploadResult = await uploadImageWithRetry(file, 'avatars');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: uploadResult.url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menyimpan foto profil.');
      }
      await refreshUser();
      showSuccessModal({
        title: 'Foto Profil Diperbarui',
        message: 'Foto profil Anda berhasil disimpan ke database.',
        duration: 2500,
      });
      showToast({
        type: 'success',
        message: 'Foto profil berhasil diperbarui!',
      });
    } catch (err: any) {
      setSaveError(err.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetch('/api/account/settings', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Gagal memuat preferensi.');
        setNotifyPush(result.settings.notifyPush);
        if (result.settings.language) {
          setLanguage(result.settings.language === 'en' ? 'en' : 'id');
        }
      })
      .catch((caught) => setSaveError(caught instanceof Error ? caught.message : 'Gagal memuat preferensi.'));
  }, [user, setLanguage]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');

    if (newPassword && newPassword !== confirmPassword) {
      setSaveError('Konfirmasi kata sandi tidak cocok.');
      setIsSaving(false);
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setSaveError('Kata sandi baru minimal 8 karakter.');
      setIsSaving(false);
      return;
    }

    try {
      // Call account settings API
      const res = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          ...(email !== user?.email ? { newEmail: email } : {}),
          location,
          phone,
          bio,
          notifyPush,
          language,
          ...(newPassword && newPassword === confirmPassword ? { newPassword } : {})
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan pengaturan.');

      if (user?.role === 'creator' || user?.role === 'umkm') {
        const profileResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio }),
        });
        const profileResult = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(profileResult.error || 'Gagal menyimpan bio.');
      }

      await refreshUser();
      setIsSavedToast(true);
      showSuccessModal({
        title: 'Pengaturan Berhasil Disimpan',
        message: 'Perubahan profil dan preferensi akun Anda telah berhasil diperbarui di server.',
        duration: 2500,
      });
      showToast({
        type: 'success',
        message: t('settings.saveSuccess', 'Pengaturan berhasil disimpan!'),
      });
      setTimeout(() => setIsSavedToast(false), 3500);
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] font-sans pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Top Back / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
                {t('settings.title', 'Pengaturan Akun')}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Kelola informasi profil, preferensi notifikasi, dan keamanan akun Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-settings-header-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer w-fit disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>{isLoggingOut ? 'Mengeluarkan...' : t('nav.signOut', 'Keluar Akun')}</span>
          </button>
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
            <span>{t('settings.profileTab', 'Profil Utama')}</span>
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
            <span>{t('settings.preferencesTab', 'Notifikasi & Bahasa')}</span>
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
            <span>{t('settings.securityTab', 'Keamanan & Sandi')}</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* TAB 1: PROFIL UTAMA */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-2xs">
              
              {/* Avatar Section */}
              <div className="flex items-center gap-5 pb-6 border-b border-[#E2E8F0]">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <div 
                  onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                  className="relative group cursor-pointer"
                  title="Klik untuk mengganti foto profil"
                >
                  <img
                    src={user?.avatar || '/creatorin/avatar.png'}
                    alt={fullName}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-neutral-100 group-hover:ring-blue-400 transition"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Ubah</span>
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0B1F3A] text-white shadow-xs group-hover:scale-110 transition">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">{fullName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{user?.role === 'creator' ? 'Kreator Terverifikasi' : 'Brand / UMKM'}</p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F3F3F4] hover:bg-neutral-200 text-neutral-700 cursor-pointer transition"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>Pilih Foto Baru</span>
                      </>
                    )}
                  </button>
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
                  {t('settings.languageLabel', 'Bahasa Antarmuka')}
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
              {saveError && <p className="text-xs font-semibold text-red-700" role="alert">{saveError}</p>}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#123B8C] active:scale-95 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t('action.saving', 'Menyimpan...') : t('action.save', 'Simpan Perubahan')}</span>
            </button>
          </div>

        </form>

        {/* Sesi Akun & Logout Card */}
        <div className="mt-8 bg-white rounded-2xl border border-red-100 p-6 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Sesi Akun & Keluar</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Keluar dari sesi saat ini pada perangkat ini ({user?.email || 'akun terdaftar'}). Anda dapat masuk kembali kapan saja.
              </p>
            </div>
            <button
              type="button"
              id="btn-settings-footer-logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer w-full sm:w-auto shrink-0 disabled:opacity-50"
            >
              {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span>{isLoggingOut ? 'Mengeluarkan...' : 'Keluar dari Akun Ini'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
