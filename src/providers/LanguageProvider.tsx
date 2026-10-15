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
    'filter.under500k': 'Di bawah 🪙 500.000',
    'filter.midBudget': '🪙 500.000 - 🪙 1.500.000',
    'filter.highBudget': 'Di atas 🪙 1.500.000',
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
    'action.viewMore': 'Lihat Selengkapnya',

    // Auth Modal
    'auth.loginRequired': 'Masuk ke akun',
    'auth.bookmarkRequired': 'Masuk ke akun Anda untuk menyimpan item ini.',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Kata sandi',
    'auth.submitButton': 'Masuk',
    'auth.processing': 'Memproses...',
    'auth.noAccount': 'Belum punya akun?',
    'auth.signUpLink': 'Daftar',
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

    // Home Hero Section
    'hero.badge': 'Platform Kolaborasi Kreatif',
    'hero.titleLine1': 'Temukan Talenta Kreatif',
    'hero.titleLine2': 'Wujudkan Ide Digital',
    'hero.subtitle': 'Temukan creator berbakat untuk kebutuhan digitalmu, atau tampilkan keahlianmu dan dapatkan project yang tepat.',
    'hero.exploreBtn': 'Jelajah Kreator',
    'hero.joinBtn': 'Bergabung Creatorin',
    'hero.createBrief': 'Buat Brief Proyek',

    // Home / UMKMDashboard
    'home.searchPlaceholder': 'Desain apa yang sedang Anda cari?',
    'home.searchPlaceholderGeneric': 'Cari kreator, keahlian, atau video UGC...',
    'home.noCreatorsFound': 'Belum ada kreator yang cocok dengan pencarian.',
    'home.resetSearch': 'Reset pencarian',
    'home.promoted': 'Promoted',
    'home.viewPortfolio': 'Lihat Portofolio',
    'home.startingPrice': 'Mulai Rp{price}',
    'home.verifiedProjects': '{count} proyek selesai',

    // Categories
    'category.all': 'Semua',
    'category.reels': 'Reels Instagram',
    'category.tiktok': 'Video TikTok',
    'category.feed': 'Feed Instagram',
    'category.poster': 'Poster',
    'category.banner': 'Banner Promo',
    'category.brochure': 'Brosur & Katalog',
    'category.logo': 'Logo & Branding',
    'category.productPhoto': 'Foto Produk',
    'category.uiux': 'UI/UX Design',

    // Platforms & Media Formats
    'platform.all': 'Semua Platform',
    'platform.instagram': 'Instagram',
    'platform.tiktok': 'TikTok',
    'platform.direct': 'Creatorin Upload',
    'format.all': 'Semua Format',
    'format.video': 'Video / Reels',
    'format.carousel': 'Carousel Multi-slide',
    'format.image': 'Foto / Desain Tunggal',

    // Delivery & Services
    'service.workingDays': '{count} Hari Kerja',
    'service.orderService': 'Pesan Sekarang',
    'service.contactToOrder': 'Hubungi untuk Pesan',

    // Footer
    'footer.aboutTitle': 'Tentang Platform',
    'footer.aboutDesc': 'Hubungkan bisnis dengan creator yang tepat untuk membangun karya dan kolaborasi yang berdampak dengan perlindungan pembayaran escrow terpercaya.',
    'footer.colExplore': 'Jelajahi',
    'footer.creatorServices': 'Layanan Kreator',
    'footer.projectPortfolio': 'Portofolio Project',
    'footer.creatorProfiles': 'Profil Kreator',
    'footer.projectBriefs': 'Brief Proyek',
    'footer.collaborationContracts': 'Kontrak Kolaborasi',
    'footer.colBusiness': 'Untuk Bisnis',
    'footer.startBrief': 'Mulai Brief',
    'footer.exploreCreators': 'Jelajahi Kreator',
    'footer.walletPayment': 'Dompet & Pembayaran',
    'footer.howItWorks': 'Cara Kerja',
    'footer.colCreator': 'Untuk Creator',
    'footer.explore': 'Jelajah',
    'footer.openBriefs': 'Lihat Brief Terbuka',
    'footer.manageProfile': 'Kelola Profil',
    'footer.withdrawEarnings': 'Tarik Penghasilan',
    'footer.colHelp': 'Bantuan & Legal',
    'footer.terms': 'Syarat & Ketentuan',
    'footer.privacy': 'Kebijakan Privasi',
    'footer.contactSupport': 'Hubungi Dukungan',
    'footer.faq': 'FAQ',
    'footer.ecosystem': 'Didukung & Berkolaborasi Bersama Ekosistem Industri Digital Nasional',
    'footer.rights': '© 2026 Creatorin. All rights reserved.',
    'footer.tagline': 'Platform Kolaborasi Kreator & Bisnis Indonesia',

    // Contracts & Collaboration
    'contracts.title': 'Kontrak Kolaborasi & Pembayaran',
    'contracts.subtitle': 'Kelola proyek aktif, penyerahan karya, revisi, dan pembayaran aman bergaransi escrow.',
    'contracts.activeTab': 'Proyek Berjalan',
    'contracts.completedTab': 'Selesai',
    'contracts.disputedTab': 'Kendala / Revisi',
    'contracts.escrowBadge': 'Escrow Terlindungi',
    'contracts.deadline': 'Batas Waktu',
    'contracts.viewRoom': 'Buka Ruang Kerja',
    'contracts.releaseFunds': 'Lepaskan Pembayaran',

    // Wallet
    'wallet.title': 'Dompet & Saldo Creatorin',
    'wallet.balance': 'Saldo Tersedia',
    'wallet.inEscrow': 'Dalam Garansi Escrow',
    'wallet.totalWithdrawn': 'Total Telah Ditarik',
    'wallet.withdraw': 'Tarik Saldo',
    'wallet.topUp': 'Isi Saldo',
    'wallet.history': 'Riwayat Transaksi',

    // Notifications
    'notif.title': 'Pusat Notifikasi',
    'notif.markAllRead': 'Tandai Semua Telah Dibaca',
    'notif.empty': 'Belum ada notifikasi baru untuk Anda.',

    // Explore & Filters Expanded
    'filter.allCategories': 'Semua Kategori',
    'filter.allLocations': 'Semua Lokasi',
    'filter.allPlatforms': 'Semua Platform',
    'filter.allFormats': 'Semua Format',
    'filter.allTimes': 'Semua Waktu',
    'filter.allDeadlines': 'Semua Tenggat',
    'filter.allScoresRatings': 'Semua Rating & Score',
    'filter.platform': 'Platform',
    'filter.format': 'Format Media',
    'filter.duration': 'Pengerjaan',
    'filter.deadline': 'Tenggat Waktu',
    'filter.clearSearch': 'Hapus filter pencarian',
    'filter.searchResultsNavbar': 'Hasil pencarian dari navbar:',
    
    // Sort options
    'sort.prefix': 'Urutkan: ',
    'sort.highestScore': 'Skor Karir Tertinggi',
    'sort.highestRating': 'Rating Tertinggi',
    'sort.mostProjects': 'Proyek Terbanyak',
    'sort.lowestRate': 'Tarif Terendah',
    'sort.byTitle': 'Urutkan Berdasarkan',

    // Budgets & Durations
    'budget.under250': '< 🪙 250.000',
    'budget.250to500': '🪙 250.000 - 🪙 500.000',
    'budget.above500': '> 🪙 500.000',
    'budget.under500': '< 🪙 500rb',
    'budget.mid500to15': '🪙 500rb - 🪙 1.5jt',
    'budget.above15': '> 🪙 1.5jt',
    'budget.under1jt': '< 🪙 1 Juta',
    'budget.1to3jt': '🪙 1jt - 🪙 3jt',
    'budget.3to5jt': '🪙 3jt - 🪙 5jt',
    'budget.above5jt': '> 🪙 5 Juta',

    'duration.fast': '⚡ 1-2 Hari',
    'duration.standard': '3-4 Hari',
    'duration.relaxed': '5+ Hari',
    'duration.fastFull': '⚡ Kilat (1-2 Hari Kerja)',
    'duration.standardFull': 'Standard (3-4 Hari Kerja)',
    'duration.relaxedFull': 'Proyek Besar (5+ Hari)',
    'duration.urgent': 'Urgent / Butuh Cepat (<3 Hari)',
    'duration.underWeek': 'Kurang dari 7 Hari',
    'duration.overWeek': 'Lebih dari 7 Hari',

    // Card Details
    'card.moreSkills': '+{count} keahlian lainnya',
    'card.priceHeader': 'HARGA',
    'card.estimateHeader': 'Estimasi: {time}',
    'card.tbd': 'Belum ditentukan',
    'card.orderSimilar': 'Pesan Karya Serupa',

    // Modals - Project Detail & Order
    'project.similarProjects': 'Proyek Serupa',
    'project.viewMoreProjects': 'Lihat Proyek Lainnya',
    'project.prevPhoto': 'Foto sebelumnya',
    'project.nextPhoto': 'Foto berikutnya',
    'service.totalCost': 'Total Biaya Layanan',
    'service.estimateDelivery': 'Estimasi Pengerjaan',
    'service.sendMessageToCreator': 'Kirim pesan untuk kreator',
    'service.messagePlaceholder': 'Tulis pesan atau pertanyaan Anda terkait layanan ini ke kreator...',
    'service.sending': 'Mengirim...',

    // Project Brief Modal
    'briefModal.createTitle': 'Buat Brief Proyek Baru',
    'briefModal.sendToTitle': 'Kirim Brief Proyek ke {name}',
    'briefModal.descGeneric': 'Terbitkan kebutuhan proyek Anda untuk mendapatkan penawaran dari kreator terverifikasi.',
    'briefModal.descSpecific': 'Rincikan kebutuhan proyek kolaborasi Anda dengan aman dan transparan.',
    'briefModal.titleLabel': 'Judul Kebutuhan Proyek',
    'briefModal.titlePlaceholder': 'Misal: Video TikTok UGC Review Skincare Organik 30 Detik',
    'briefModal.categoryLabel': 'Kategori Utama',
    'briefModal.budgetLabel': 'Estimasi Anggaran / Budget (IDR)',
    'briefModal.deadlineLabel': 'Tenggat Waktu Pengerjaan',
    'briefModal.descLabel': 'Rincian Brief & Kebutuhan Kreatif',
    'briefModal.descPlaceholder': 'Jelaskan tujuan kampanye, poin utama yang harus disampaikan, format file, dan arahan visual...',
    'briefModal.tagsLabel': 'Tag Kebutuhan',
    'briefModal.submitBtn': 'Terbitkan Brief Proyek',
    'briefModal.submitting': 'Menerbitkan Brief...',
    'briefModal.successTitle': 'Brief Berhasil Diterbitkan!',
    'briefModal.successDescGeneric': 'Brief proyek Anda telah berhasil dipasang dan siap menerima proposal penawaran dari kreator terbaik.',
    'briefModal.successDescSpecific': 'Brief proyek Anda telah dikirimkan ke {name}. Anda akan menerima respons dalam waktu dekat.',
    'briefModal.doneBtn': 'Selesai',

    // Contracts Page
    'contracts.badge': 'Contracts',
    'contracts.pageHeading': 'Brief yang sedang kamu lamar.',
    'contracts.pageSubheading': 'Pantau lamaran yang sudah diterima dan yang masih menunggu keputusan UMKM.',
    'contracts.accepted': 'Accepted',
    'contracts.pending': 'Menunggu review',
    'contracts.rejected': 'Tidak lanjut',
    'contracts.searchPlaceholder': 'Cari brief, UMKM, atau kategori',
    'contracts.all': 'Semua',
    'contracts.loading': 'Memuat daftar lamaran...',
    'contracts.emptyTitle': 'Belum ada lamaran yang cocok',
    'contracts.emptyDesc': 'Coba ubah filter, atau buka papan brief untuk melamar proyek baru.',
    'contracts.openBriefs': 'Buka papan brief',
    'contracts.appliedOn': 'Dilamar {date}',
    'contracts.viewBriefDetail': 'Lihat Detail Brief',
    'contracts.chatBusiness': 'Chat UMKM',

    // Wallet Page
    'wallet.coinWallet': 'Dompet koin',
    'wallet.recordedBalance': 'Saldo tercatat',
    'wallet.coins': '{count} koin',
    'wallet.channelNotice': 'Top up dan penarikan belum tersedia karena kanal pembayaran belum terhubung.',
    'wallet.noTransactions': 'Belum ada transaksi.',
    'wallet.signInRequired': 'Masuk untuk melihat dompet Anda.',

    // Notifications Page
    'notif.pageTitle': 'Notifikasi',
    'notif.activity': 'Aktivitas akun',
    'notif.all': 'Semua',
    'notif.unread': 'Belum dibaca',
    'notif.messages': 'Pesan',
    'notif.transactions': 'Transaksi',
    'notif.collaboration': 'Kolaborasi',
    'notif.loading': 'Memuat notifikasi...',
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
    'filter.under500k': 'Under 🪙 500,000',
    'filter.midBudget': '🪙 500,000 - 🪙 1,500,000',
    'filter.highBudget': 'Above 🪙 1,500,000',
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
    'action.viewMore': 'See More',

    // Auth Modal
    'auth.loginRequired': 'Sign in',
    'auth.bookmarkRequired': 'Sign in to save this item to your favorites.',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Password',
    'auth.submitButton': 'Sign in',
    'auth.processing': 'Signing in...',
    'auth.noAccount': "Don't have an account?",
    'auth.signUpLink': 'Sign up',
    'auth.emptyCredentials': 'Please enter your email and password.',
    'auth.invalidCredentials': 'Invalid email or password.',
    'auth.networkError': 'Network error. Please try again.',

    // Profile Edit Confirmation & Success
    'profile.confirmFinishTitle': 'Finish & Save Changes?',
    'profile.confirmFinishDesc': 'Are you sure you want to finish editing your profile? All recent changes will be saved.',
    'profile.confirmFinishButton': 'Yes, Save',
    'profile.successFinishTitle': 'Profile Successfully Updated!',
    'profile.successFinishDesc': 'Your profile details have been successfully saved.',

    // Toasts & Alerts
    'toast.authRequired': 'Sign In Required',
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

    // Home Hero Section
    'hero.badge': 'Creative Collaboration Platform',
    'hero.titleLine1': 'Find Creative Talents',
    'hero.titleLine2': 'Bring Digital Ideas to Life',
    'hero.subtitle': 'Discover verified top creators for your digital needs, or showcase your skills and get the right projects.',
    'hero.exploreBtn': 'Explore Creators',
    'hero.joinBtn': 'Join Creatorin Free',
    'hero.createBrief': 'Post a Project Brief',

    // Home / UMKMDashboard
    'home.searchPlaceholder': 'What type of design or creator are you looking for?',
    'home.searchPlaceholderGeneric': 'Search creators, skills, or UGC videos...',
    'home.noCreatorsFound': 'No creators match your current search criteria.',
    'home.resetSearch': 'Reset search',
    'home.promoted': 'Promoted',
    'home.viewPortfolio': 'View Portfolio',
    'home.startingPrice': 'From IDR {price}',
    'home.verifiedProjects': '{count} projects completed',

    // Categories
    'category.all': 'All',
    'category.reels': 'Instagram Reels',
    'category.tiktok': 'TikTok Video',
    'category.feed': 'Instagram Feed',
    'category.poster': 'Poster Design',
    'category.banner': 'Promotional Banner',
    'category.brochure': 'Brochure & Catalog',
    'category.logo': 'Logo & Branding',
    'category.productPhoto': 'Product Photography',
    'category.uiux': 'UI/UX Design',

    // Platforms & Media Formats
    'platform.all': 'All Platforms',
    'platform.instagram': 'Instagram',
    'platform.tiktok': 'TikTok',
    'platform.direct': 'Creatorin Direct Upload',
    'format.all': 'All Formats',
    'format.video': 'Video / Reels',
    'format.carousel': 'Multi-slide Carousel',
    'format.image': 'Single Photo / Design',

    // Delivery & Services
    'service.workingDays': '{count} Working Days',
    'service.orderService': 'Order Now',
    'service.contactToOrder': 'Contact to Order',

    // Footer
    'footer.aboutTitle': 'About Platform',
    'footer.aboutDesc': 'Connecting forward-thinking businesses with the right creators to produce impactful work backed by verified escrow payment protection.',
    'footer.colExplore': 'Explore',
    'footer.creatorServices': 'Creator Services',
    'footer.projectPortfolio': 'Project Portfolio',
    'footer.creatorProfiles': 'Creator Profiles',
    'footer.projectBriefs': 'Project Briefs',
    'footer.collaborationContracts': 'Collaboration Contracts',
    'footer.colBusiness': 'For Business',
    'footer.startBrief': 'Post a Brief',
    'footer.exploreCreators': 'Browse Creators',
    'footer.walletPayment': 'Wallet & Payments',
    'footer.howItWorks': 'How It Works',
    'footer.colCreator': 'For Creators',
    'footer.explore': 'Explore',
    'footer.openBriefs': 'Browse Open Briefs',
    'footer.manageProfile': 'Manage Profile',
    'footer.withdrawEarnings': 'Withdraw Earnings',
    'footer.colHelp': 'Help & Legal',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.contactSupport': 'Contact Support',
    'footer.faq': 'FAQ',
    'footer.ecosystem': 'Supported & Collaborating with the National Digital Ecosystem',
    'footer.rights': '© 2026 Creatorin. All rights reserved.',
    'footer.tagline': 'Indonesian Creator & Business Collaboration Platform',

    // Contracts & Collaboration
    'contracts.title': 'Collaboration Contracts & Payments',
    'contracts.subtitle': 'Manage active projects, milestone submissions, revisions, and escrow-guaranteed payments.',
    'contracts.activeTab': 'In Progress',
    'contracts.completedTab': 'Completed',
    'contracts.disputedTab': 'Revisions / Issues',
    'contracts.escrowBadge': 'Escrow Secured',
    'contracts.deadline': 'Deadline',
    'contracts.viewRoom': 'Open Workspace',
    'contracts.releaseFunds': 'Release Payment',

    // Wallet
    'wallet.title': 'Creatorin Balance & Wallet',
    'wallet.balance': 'Available Balance',
    'wallet.inEscrow': 'Held in Escrow Guarantee',
    'wallet.totalWithdrawn': 'Total Withdrawn',
    'wallet.withdraw': 'Withdraw Funds',
    'wallet.topUp': 'Add Balance',
    'wallet.history': 'Transaction History',

    // Notifications
    'notif.title': 'Notification Center',
    'notif.markAllRead': 'Mark all as read',
    'notif.empty': 'No new notifications yet.',

    // Explore & Filters Expanded
    'filter.allCategories': 'All Categories',
    'filter.allLocations': 'All Locations',
    'filter.allPlatforms': 'All Platforms',
    'filter.allFormats': 'All Formats',
    'filter.allTimes': 'All Delivery Times',
    'filter.allDeadlines': 'All Deadlines',
    'filter.allScoresRatings': 'All Ratings & Scores',
    'filter.platform': 'Platform',
    'filter.format': 'Media Format',
    'filter.duration': 'Delivery Time',
    'filter.deadline': 'Deadline',
    'filter.clearSearch': 'Clear search filter',
    'filter.searchResultsNavbar': 'Search results for:',

    // Sort options
    'sort.prefix': 'Sort: ',
    'sort.highestScore': 'Highest Career Score',
    'sort.highestRating': 'Highest Rating',
    'sort.mostProjects': 'Most Projects',
    'sort.lowestRate': 'Lowest Rate',
    'sort.byTitle': 'Sort By',

    // Budgets & Durations
    'budget.under250': '< 🪙 250k',
    'budget.250to500': '🪙 250k - 🪙 500k',
    'budget.above500': '> 🪙 500k',
    'budget.under500': '< 🪙 500k',
    'budget.mid500to15': '🪙 500k - 🪙 1.5M',
    'budget.above15': '> 🪙 1.5M',
    'budget.under1jt': '< 🪙 1M',
    'budget.1to3jt': '🪙 1M - 🪙 3M',
    'budget.3to5jt': '🪙 3M - 🪙 5M',
    'budget.above5jt': '> 🪙 5M',

    'duration.fast': '⚡ 1-2 Days',
    'duration.standard': '3-4 Days',
    'duration.relaxed': '5+ Days',
    'duration.fastFull': '⚡ Express (1-2 Working Days)',
    'duration.standardFull': 'Standard (3-4 Working Days)',
    'duration.relaxedFull': 'Large Project (5+ Days)',
    'duration.urgent': 'Urgent (< 3 Days)',
    'duration.underWeek': '< 7 Days',
    'duration.overWeek': '> 7 Days',

    // Card Details
    'card.moreSkills': '+{count} more skills',
    'card.priceHeader': 'PRICE',
    'card.estimateHeader': 'Estimate: {time}',
    'card.tbd': 'TBD',
    'card.orderSimilar': 'Order Similar Work',

    // Modals - Project Detail & Order
    'project.similarProjects': 'Similar Projects',
    'project.viewMoreProjects': 'View More Projects',
    'project.prevPhoto': 'Previous image',
    'project.nextPhoto': 'Next image',
    'service.totalCost': 'Total Service Cost',
    'service.estimateDelivery': 'Estimated Delivery',
    'service.sendMessageToCreator': 'Send message to creator',
    'service.messagePlaceholder': 'Write your message or questions regarding this service...',
    'service.sending': 'Sending...',

    // Project Brief Modal
    'briefModal.createTitle': 'Create New Project Brief',
    'briefModal.sendToTitle': 'Send Project Brief to {name}',
    'briefModal.descGeneric': 'Publish your project requirements to receive competitive proposals from verified creators.',
    'briefModal.descSpecific': 'Specify your project collaboration requirements clearly, transparently, and securely.',
    'briefModal.titleLabel': 'Project Title / Goal',
    'briefModal.titlePlaceholder': 'e.g. 30-Second UGC Skincare Review TikTok Video',
    'briefModal.categoryLabel': 'Main Category',
    'briefModal.budgetLabel': 'Estimated Budget (IDR)',
    'briefModal.deadlineLabel': 'Target Completion Deadline',
    'briefModal.descLabel': 'Creative Brief Details & Requirements',
    'briefModal.descPlaceholder': 'Describe campaign goals, key deliverables, required file formats, visual directions...',
    'briefModal.tagsLabel': 'Requirement Tags',
    'briefModal.submitBtn': 'Publish Project Brief',
    'briefModal.submitting': 'Publishing Brief...',
    'briefModal.successTitle': 'Brief Successfully Published!',
    'briefModal.successDescGeneric': 'Your project brief is live and ready to receive proposals from top creators.',
    'briefModal.successDescSpecific': 'Your project brief has been sent to {name}. You will receive a response shortly.',
    'briefModal.doneBtn': 'Done',

    // Contracts Page
    'contracts.badge': 'Contracts',
    'contracts.pageHeading': 'Briefs you are applying for.',
    'contracts.pageSubheading': 'Track proposals that have been accepted and those awaiting UMKM decisions.',
    'contracts.accepted': 'Accepted',
    'contracts.pending': 'Under review',
    'contracts.rejected': 'Declined',
    'contracts.searchPlaceholder': 'Search brief, business, or category',
    'contracts.all': 'All',
    'contracts.loading': 'Loading applications...',
    'contracts.emptyTitle': 'No matching applications found',
    'contracts.emptyDesc': 'Try changing filters or browse open briefs to apply for new projects.',
    'contracts.openBriefs': 'Explore Open Briefs',
    'contracts.appliedOn': 'Applied {date}',
    'contracts.viewBriefDetail': 'View Brief Details',
    'contracts.chatBusiness': 'Chat Business',

    // Wallet Page
    'wallet.coinWallet': 'Coin Wallet',
    'wallet.recordedBalance': 'Recorded Balance',
    'wallet.coins': '{count} coins',
    'wallet.channelNotice': 'Top up and withdrawals are not yet available because payment channels are not connected.',
    'wallet.noTransactions': 'No transactions yet.',
    'wallet.signInRequired': 'Sign in to view your wallet.',

    // Notifications Page
    'notif.pageTitle': 'Notifications',
    'notif.activity': 'Account activity',
    'notif.all': 'All',
    'notif.unread': 'Unread',
    'notif.messages': 'Messages',
    'notif.transactions': 'Transactions',
    'notif.collaboration': 'Collaboration',
    'notif.loading': 'Loading notifications...',
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
