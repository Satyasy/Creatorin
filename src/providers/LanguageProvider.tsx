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
    'nav.browse': 'Jelajah',
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

    // Sub-Navigation Tabs
    'tabs.creators': 'Creator',
    'tabs.services': 'Layanan',
    'tabs.projects': 'Proyek',

    // Explore & Headings
    'explore.heading': 'Cari Talenta berdasarkan Kategori',
    'explore.projectsHeading': 'Jelajahi Inspirasi Karya & Proyek Kreatif',
    'explore.servicesHeading': 'Temukan Layanan Kreatif Siap Pesan',
    'explore.searchPlaceholderProjects': 'Cari video reels, poster, brand identity, feed...',
    'explore.searchPlaceholderServices': 'Cari jasa desain logo, video komersial, packaging...',
    'explore.searchPlaceholderCreators': 'Cari nama kreator, skill, atau keahlian...',

    // Filters
    'filter.category': 'Kategori',
    'filter.budget': 'Budget',
    'filter.location': 'Lokasi',
    'filter.rating': 'Rating / Score',
    'filter.all': 'Semua',
    'filter.allBudget': 'Semua Budget',
    'filter.under500k': 'Di bawah Rp500.000',
    'filter.midBudget': 'Rp500.000 - Rp1.500.000',
    'filter.highBudget': 'Di atas Rp1.500.000',
    'filter.allScores': 'Semua Skor',
    'filter.topTier': 'Score 95+ (Top Tier)',
    'filter.risingStar': 'Score 90+ (Rising Star)',
    'filter.reset': 'Reset Semua Filter',
    'filter.clearAll': 'Hapus semua filter',
    'filter.showingCreators': 'Menampilkan {count} kreator terverifikasi',
    'filter.showingProjects': 'Menampilkan {count} proyek inspiratif',
    'filter.showingServices': 'Menampilkan {count} paket layanan',
    'sort.label': 'Urutkan',
    'sort.popular': 'Paling Populer',
    'sort.mostViewed': 'Paling Banyak Dilihat',
    'sort.mostLiked': 'Paling Disukai',
    'sort.newest': 'Terbaru',

    // Cards & Actions
    'card.startingFrom': 'Mulai',
    'card.fastResponse': 'Merespons cepat',
    'card.servicesAvailable': 'Layanan tersedia',
    'card.contact': 'Hubungi',
    'card.order': 'Order',
    'card.saveCreator': 'Simpan Kreator',
    'card.saveProject': 'Simpan Proyek',
    'card.saveService': 'Simpan Layanan',
    'card.saved': 'Tersimpan',
    'card.removeSave': 'Hapus Simpan',
    'card.discuss': 'Diskusikan',
    'card.details': 'Lihat Detail',

    // Empty states
    'empty.creatorsTitle': 'Tidak Ada Kreator yang Sesuai',
    'empty.creatorsDesc': 'Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat kreator berbakat lainnya.',
    'empty.projectsTitle': 'Tidak Ada Proyek Ditemukan',
    'empty.projectsDesc': 'Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.',
    'empty.servicesTitle': 'Tidak Ada Layanan Ditemukan',
    'empty.servicesDesc': 'Coba atur filter harga atau pilih kategori keahlian lainnya.',

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
    'action.share': 'Bagikan',

    // Auth Modal
    'auth.loginRequired': 'Masuk ke Akun Creatorin',
    'auth.bookmarkRequired': 'Silakan masuk ke akun Creatorin Anda terlebih dahulu untuk menyimpan ke koleksi favorit.',
    'auth.followRequired': 'Anda harus masuk ke akun Creatorin terlebih dahulu untuk mengikuti kreator ini.',
    'auth.emailLabel': 'Email Address',
    'auth.passwordLabel': 'Kata Sandi',
    'auth.submitButton': 'Masuk Sekarang',
    'auth.processing': 'Memproses Masuk...',
    'auth.noAccount': 'Belum memiliki akun?',
    'auth.signUpLink': 'Daftar Akun Baru',
    'auth.emptyCredentials': 'Harap masukkan email dan kata sandi.',
    'auth.invalidCredentials': 'Email atau kata sandi tidak valid.',
    'auth.networkError': 'Terjadi kendala jaringan.',

    // Profile Edit Confirmation & Success
    'profile.confirmFinishTitle': 'Selesaikan & Simpan Edit?',
    'profile.confirmFinishDesc': 'Apakah kamu yakin ingin menyelesaikan pengeditan profil? Seluruh perubahan informasi terbaru akan tersimpan.',
    'profile.confirmFinishButton': 'Yakin, Simpan',
    'profile.successFinishTitle': 'Profil Berhasil Diperbarui!',
    'profile.successFinishDesc': 'Perubahan informasi profil Anda telah berhasil disimpan.',

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
    'toast.savedFavorite': 'Disimpan ke Koleksi Favorit',
    'toast.removedFavorite': 'Dihapus dari Koleksi',

    // Profile Sections
    'profile.work': 'Karya & Proyek',
    'profile.services': 'Katalog Layanan',
    'profile.reviews': 'Ulasan Klien',
    'profile.about': 'Tentang Kreator',
    'profile.startingFrom': 'Mulai dari',
    'profile.perProject': '/ proyek',
    'profile.careerScore': 'Career Score',
    'profile.clientRating': 'Rating Klien',
    'profile.completedProjects': 'Proyek Selesai',
    'profile.followers': 'Pengikut',
    'profile.responseTime': 'Waktu Respon',
    'profile.coreSkills': 'Keahlian Utama',
    'profile.softwareTools': 'Software & Tools',
    'profile.price': 'Harga',

    // Modals
    'modal.projectDetails': 'Detail Proyek',
    'modal.serviceDetails': 'Detail Layanan',
    'modal.discuss': 'Diskusikan Proyek',
    'modal.orderNow': 'Pesan Layanan Sekarang',
    'modal.deliveryTime': 'Waktu Pengerjaan',
    'modal.revisions': 'Revisi Gratis',
    'modal.features': 'Fitur Termasuk',
    'modal.client': 'Klien',
    'modal.year': 'Tahun',
    'modal.mediaFormat': 'Format Media',
    'modal.category': 'Kategori',
    'modal.comments': 'Komentar',
    'modal.writeComment': 'Tulis komentar apresiasi atau pertanyaan...',
    'modal.send': 'Kirim',

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
    'nav.browse': 'Browse',
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

    // Sub-Navigation Tabs
    'tabs.creators': 'Creators',
    'tabs.services': 'Services',
    'tabs.projects': 'Projects',

    // Explore & Headings
    'explore.heading': 'Find Talent by Category',
    'explore.projectsHeading': 'Explore Creative Project Inspirations',
    'explore.servicesHeading': 'Discover Ready-to-Order Creative Services',
    'explore.searchPlaceholderProjects': 'Search reels, posters, brand identity, feed...',
    'explore.searchPlaceholderServices': 'Search logo design, commercial videos, packaging...',
    'explore.searchPlaceholderCreators': 'Search creator name, skill, or expertise...',

    // Filters
    'filter.category': 'Category',
    'filter.budget': 'Budget',
    'filter.location': 'Location',
    'filter.rating': 'Rating / Score',
    'filter.all': 'All',
    'filter.allBudget': 'All Budgets',
    'filter.under500k': 'Under Rp500,000',
    'filter.midBudget': 'Rp500,000 - Rp1,500,000',
    'filter.highBudget': 'Above Rp1,500,000',
    'filter.allScores': 'All Scores',
    'filter.topTier': 'Score 95+ (Top Tier)',
    'filter.risingStar': 'Score 90+ (Rising Star)',
    'filter.reset': 'Reset All Filters',
    'filter.clearAll': 'Clear all filters',
    'filter.showingCreators': 'Showing {count} verified creators',
    'filter.showingProjects': 'Showing {count} inspiring projects',
    'filter.showingServices': 'Showing {count} service packages',
    'sort.label': 'Sort by',
    'sort.popular': 'Most Popular',
    'sort.mostViewed': 'Most Viewed',
    'sort.mostLiked': 'Most Liked',
    'sort.newest': 'Newest',

    // Cards & Actions
    'card.startingFrom': 'From',
    'card.fastResponse': 'Fast response',
    'card.servicesAvailable': 'Services available',
    'card.contact': 'Contact',
    'card.order': 'Order',
    'card.saveCreator': 'Bookmark Creator',
    'card.saveProject': 'Bookmark Project',
    'card.saveService': 'Bookmark Service',
    'card.saved': 'Bookmarked',
    'card.removeSave': 'Remove Bookmark',
    'card.discuss': 'Discuss',
    'card.details': 'View Details',

    // Empty states
    'empty.creatorsTitle': 'No Matching Creators Found',
    'empty.creatorsDesc': 'Try adjusting your search keywords or resetting filters to discover more talent.',
    'empty.projectsTitle': 'No Projects Found',
    'empty.projectsDesc': 'Try searching with different keywords or selecting a different category.',
    'empty.servicesTitle': 'No Services Found',
    'empty.servicesDesc': 'Try adjusting price filters or selecting other skill categories.',

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
    'action.share': 'Share',

    // Auth Modal
    'auth.loginRequired': 'Sign In to Creatorin',
    'auth.bookmarkRequired': 'Please sign in to your Creatorin account first to bookmark and save favorite items to your collection.',
    'auth.followRequired': 'Please sign in to your Creatorin account first to follow this creator.',
    'auth.emailLabel': 'Email Address',
    'auth.passwordLabel': 'Password',
    'auth.submitButton': 'Sign In Now',
    'auth.processing': 'Signing in...',
    'auth.noAccount': "Don't have an account yet?",
    'auth.signUpLink': 'Sign Up Free',
    'auth.emptyCredentials': 'Please enter both email and password.',
    'auth.invalidCredentials': 'Invalid email or password.',
    'auth.networkError': 'Network connection error.',

    // Profile Edit Confirmation & Success
    'profile.confirmFinishTitle': 'Finish & Save Changes?',
    'profile.confirmFinishDesc': 'Are you sure you want to finish editing your profile? All recent changes will be saved.',
    'profile.confirmFinishButton': 'Yes, Save',
    'profile.successFinishTitle': 'Profile Successfully Updated!',
    'profile.successFinishDesc': 'Your profile details have been successfully saved.',

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
    'toast.savedFavorite': 'Saved to Favorite Collection',
    'toast.removedFavorite': 'Removed from Collection',

    // Profile Sections
    'profile.work': 'Work & Projects',
    'profile.services': 'Services Catalog',
    'profile.reviews': 'Client Reviews',
    'profile.about': 'About Creator',
    'profile.startingFrom': 'Starting at',
    'profile.perProject': '/ project',
    'profile.careerScore': 'Career Score',
    'profile.clientRating': 'Client Rating',
    'profile.completedProjects': 'Completed Projects',
    'profile.followers': 'Followers',
    'profile.responseTime': 'Response Time',
    'profile.coreSkills': 'Core Skills',
    'profile.softwareTools': 'Software & Tools',
    'profile.price': 'Price',

    // Modals
    'modal.projectDetails': 'Project Details',
    'modal.serviceDetails': 'Service Details',
    'modal.discuss': 'Discuss Project',
    'modal.orderNow': 'Order Service Now',
    'modal.deliveryTime': 'Delivery Time',
    'modal.revisions': 'Free Revisions',
    'modal.features': 'Included Features',
    'modal.client': 'Client',
    'modal.year': 'Year',
    'modal.mediaFormat': 'Media Format',
    'modal.category': 'Category',
    'modal.comments': 'Comments',
    'modal.writeComment': 'Write appreciation or question comment...',
    'modal.send': 'Send',

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
