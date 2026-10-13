'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'id' | 'en';

export interface Translations {
  [key: string]: string;
}

const DICTIONARY: Record<Language, Translations> = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.explore': 'Explore',
    'nav.browse': 'Jelajah',
    'nav.allCategories': 'Semua (Explore Hub)',
    'nav.creators': 'Kreator',
    'nav.services': 'Layanan',
    'nav.projects': 'Proyek',
    'nav.briefs': 'Brief Proyek',
    'nav.signIn': 'Masuk',
    'nav.signUp': 'Mulai Gratis',
    'nav.searchPlaceholder': 'Cari kreator, keahlian, atau video UGC...',
    'nav.profile': 'Profil Saya',
    'nav.wallet': 'Dompet & Saldo',
    'nav.contracts': 'Kontrak Saya',
    'nav.schoolDashboard': 'Dashboard Sekolah',
    'nav.settings': 'Pengaturan',
    'nav.signOut': 'Keluar',

    // Actions & Buttons
    'action.follow': 'Follow',
    'action.following': 'Following',
    'action.sendMessage': 'Kirim Pesan',
    'action.shareProfile': 'Bagikan Profil',
    'action.editProfile': 'Edit Profil',
    'action.finishEdit': 'Selesai Edit',
    'action.save': 'Simpan Perubahan',
    'action.saving': 'Menyimpan...',
    'action.cancel': 'Batal',
    'action.close': 'Tutup',
    'action.orderService': 'Pesan Layanan',
    'action.viewDetail': 'Lihat Detail',
    'action.copyLink': 'Salin Tautan',
    'action.contactCreator': 'Hubungi Kreator',
    'action.signIn': 'Masuk ke Akun',

    // Toasts & Alerts
    'toast.authRequired': 'Perlu Masuk Akun',
    'toast.followAuth': 'Anda harus masuk ke akun Creatorin terlebih dahulu untuk mengikuti kreator ini.',
    'toast.saveServiceAuth': 'Anda harus masuk ke akun Creatorin terlebih dahulu untuk menyimpan layanan favorit.',
    'toast.orderServiceAuth': 'Silakan masuk ke akun Creatorin terlebih dahulu untuk memesan paket layanan ini.',
    'toast.chatAuth': 'Anda harus masuk akun terlebih dahulu untuk menghubungi kreator ini.',
    'toast.profileCopied': 'Tautan profil berhasil disalin!',
    'toast.serviceCopied': 'Tautan layanan berhasil disalin!',
    'toast.projectCopied': 'Tautan proyek berhasil disalin!',
    'toast.copied': 'Tersalin ke clipboard!',

    // Profile Sections
    'profile.work': 'Karya & Proyek',
    'profile.services': 'Katalog Layanan',
    'profile.reviews': 'Ulasan Klien',
    'profile.about': 'Tentang Kreator',
    'profile.startingFrom': 'Mulai dari',
    'profile.perProject': '/ proyek',
    'profile.careerScore': 'Career Score',

    // Settings
    'settings.title': 'Pengaturan Akun',
    'settings.profileTab': 'Profil Pengguna',
    'settings.preferencesTab': 'Preferensi & Notifikasi',
    'settings.securityTab': 'Keamanan & Sandi',
    'settings.languageLabel': 'Bahasa Antarmuka',
    'settings.saveSuccess': 'Pengaturan berhasil disimpan!',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.browse': 'Browse',
    'nav.allCategories': 'All Categories (Explore Hub)',
    'nav.creators': 'Creators',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.briefs': 'Project Briefs',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Get Started Free',
    'nav.searchPlaceholder': 'Search creators, skills, or UGC videos...',
    'nav.profile': 'My Profile',
    'nav.wallet': 'Wallet & Balance',
    'nav.contracts': 'My Contracts',
    'nav.schoolDashboard': 'School Dashboard',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',

    // Actions & Buttons
    'action.follow': 'Follow',
    'action.following': 'Following',
    'action.sendMessage': 'Send Message',
    'action.shareProfile': 'Share Profile',
    'action.editProfile': 'Edit Profile',
    'action.finishEdit': 'Done Editing',
    'action.save': 'Save Changes',
    'action.saving': 'Saving...',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.orderService': 'Order Service',
    'action.viewDetail': 'View Details',
    'action.copyLink': 'Copy Link',
    'action.contactCreator': 'Contact Creator',
    'action.signIn': 'Sign In',

    // Toasts & Alerts
    'toast.authRequired': 'Sign In Required',
    'toast.followAuth': 'You must sign in to Creatorin to follow this creator.',
    'toast.saveServiceAuth': 'You must sign in to Creatorin to bookmark favorite services.',
    'toast.orderServiceAuth': 'Please sign in to Creatorin to order or discuss this service.',
    'toast.chatAuth': 'You must sign in first to contact this creator.',
    'toast.profileCopied': 'Profile link copied to clipboard!',
    'toast.serviceCopied': 'Service link copied to clipboard!',
    'toast.projectCopied': 'Project link copied to clipboard!',
    'toast.copied': 'Copied to clipboard!',

    // Profile Sections
    'profile.work': 'Work & Projects',
    'profile.services': 'Services Catalog',
    'profile.reviews': 'Client Reviews',
    'profile.about': 'About Creator',
    'profile.startingFrom': 'Starting at',
    'profile.perProject': '/ project',
    'profile.careerScore': 'Career Score',

    // Settings
    'settings.title': 'Account Settings',
    'settings.profileTab': 'User Profile',
    'settings.preferencesTab': 'Preferences & Notifications',
    'settings.securityTab': 'Security & Password',
    'settings.languageLabel': 'Interface Language',
    'settings.saveSuccess': 'Settings saved successfully!',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'id',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('creatorin_lang') as Language | null;
      if (stored === 'id' || stored === 'en') {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        document.documentElement.lang = 'id';
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('creatorin_lang', lang);
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('creatorin:lang-changed', { detail: { lang } }));
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const dict = DICTIONARY[language] || DICTIONARY.id;
      return dict[key] || fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
