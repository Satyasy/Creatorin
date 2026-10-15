# Creatorin — Matriks Persistensi State & Ketahanan Data Lintas Reload

**Tanggal:** 15 Oktober 2026  
**Status:** AUDITED & REMEDIATED  
**Fokus:** Memastikan tidak ada data bisnis yang hilang saat pengguna me-reload halaman browser atau berganti sesi perangkat.

---

## 1. Matriks Persistensi State Klien vs Backend

| No | Fitur / Entitas Data | Sumber State Klien | Titik Persistensi Backend | Tabel / Kolom Database | Ketahanan Saat Reload | Status |
|:--:|:---------------------|:-------------------|:--------------------------|:------------------------|:----------------------|:------:|
| 1 | **Bookmark Kreator** | `bookmarkedIds` Set di `JelajahKreatorPage` & `UMKMDashboard` | `POST /api/bookmarks` | `bookmarks(user_id, target_type='creator', target_id)` | **Persisten** (dimuat via `GET /api/bookmarks` saat mount) | **PASS** |
| 2 | **Bookmark Layanan** | `savedServiceIds` Set di `CreatorProfilePage`, `ExploreServicesPage`, `UMKMDashboard` | `POST /api/bookmarks` | `bookmarks(user_id, target_type='service', target_id)` | **Persisten** (dimuat via `GET /api/bookmarks` saat mount) | **PASS** |
| 3 | **Bookmark Proyek** | `savedPosts` di `ExploreProjectsPage`, `savedProjectIds` di `CreatorProfilePage` | `POST /api/bookmarks` | `bookmarks(user_id, target_type='project', target_id)` | **Persisten** (dimuat via `GET /api/bookmarks` saat mount) | **PASS** |
| 4 | **Foto Profil (Avatar)** | `avatarUrl` di `SettingsPage`, `CreatorProfilePage`, `UmkmProfilePage` | `POST /api/upload` + `PUT /api/profile` | `profiles.avatar_url` + berkas fisik `/shared/uploads/avatars/` | **Persisten** (tersimpan di DB & disk publik) | **PASS** |
| 5 | **Banner / Sampul Profil** | `coverUrl` / `coverBanner` di `CreatorProfilePage`, `UmkmProfilePage` | `POST /api/upload` + `PUT /api/profile` | `profiles.cover_url` + berkas fisik `/shared/uploads/avatars/` | **Persisten** (Drizzle query SSR kini memuat `cover_url`) | **PASS** |
| 6 | **Pesan Chat Masuk/Keluar** | `conversations` list di `ChatPage` | `POST /api/messages` | `messages(conversation_id, sender_id, content, metadata)` | **Persisten** (dimuat via `GET /api/messages`) | **PASS** |
| 7 | **Tanda Baca Chat (Read Receipts)** | `msg.status` ('delivered' / 'read') | `POST /api/messages/read` | `messages.is_read` | **Persisten** (dimuat via `GET /api/messages` & disinkron via SSE) | **PASS** |
| 8 | **Saldo Dompet & Riwayat Koin** | `wallet`, `transactions` di `WalletViewModal` | `POST /api/wallet/topup`, `POST /api/wallet/withdraw` | `wallets.balance_numeric`, `transactions` | **Persisten** (transaksi atomik PostgreSQL `FOR UPDATE`) | **PASS** |
| 9 | **Penahanan & Pencairan Escrow** | Status pembayaran invoice di `CollaborationRoomView` | `POST /api/invoices/[id]/pay`, `POST /api/collaborations/[id]/complete` | `invoices`, `collaboration_rooms.status`, `wallets` | **Persisten** (transaksi atomik PostgreSQL) | **PASS** |
| 10 | **Pengunggahan Karya Kolaborasi** | Deliverables list di `CollaborationRoomView` | `POST /api/collaborations/[id]/deliverables` | `project_deliverables` | **Persisten** (dimuat via `GET /api/collaborations/[id]`) | **PASS** |
| 11 | **Permintaan Revisi & Catatan** | Revision count & feedback di `CollaborationRoomView` | `POST /api/collaborations/[id]/revisions` | `collaboration_rooms.revision_count`, `collaboration_events` | **Persisten** (dimuat dari DB) | **PASS** |
| 12 | **Ulasan & Rating Bintang** | Reviews list di `CreatorProfilePage`, `UmkmProfilePage` | `POST /api/reviews` | `reviews(creator_id, business_id, rating, comment)` | **Persisten** (diagregasi otomatis di DB) | **PASS** |
| 13 | **Status Aktif/Nonaktif Layanan** | `liveServices[i].isActive` di `CreatorProfilePage` & `CreatorServicesPage` | `PUT /api/services/[id]` | `services.is_active` | **Persisten** (dimuat via `GET /api/services`) | **PASS** |
| 14 | **Brief Proyek & Proposal** | `activeBriefs` di `UMKMDashboard` & `UmkmProfilePage` | `POST /api/briefs`, `POST /api/proposals` | `project_briefs`, `proposals` | **Persisten** (dimuat via `GET /api/briefs`) | **PASS** |
| 15 | **Verifikasi Sekolah & Siswa** | Badge sekolah terverifikasi di profil kreator | `POST /api/school/verify` | `school_verifications.status`, `creator_profiles.school_status` | **Persisten** (terhubung relasional di DB) | **PASS** |

---

## 2. Analisis Perbaikan Kerentanan Data Hilang

### Kasus 1: Banner Hilang Saat Reload (Fase 7)
- **Akar Masalah:**
  Sebelum perbaikan, Drizzle ORM query `getCreatorServerData` di `src/lib/server/creators.ts` dan `getBusinessServerData` di `src/lib/server/businesses.ts` tidak menyertakan kolom `profiles.coverUrl` dalam klausul `select`. Akibatnya, server-side rendering selalu mengembalikan string kosong `""`, sehingga antarmuka klien jatuh kembali ke warna default `#0063b4` setiap kali pengguna menekan reload.
- **Solusi yang Diterapkan:**
  1. Menambahkan `coverUrl: profiles.coverUrl` pada semua query Drizzle SSR kreator dan UMKM.
  2. Menambahkan `coverUrl` pada endpoint API `/api/businesses`.
  3. Memperbaiki fungsi transformer `toBusiness` di `src/services/businessService.ts` untuk memetakan `coverBanner: business.coverBanner || business.coverUrl || ''`.
  4. Memastikan symlink berkas unggahan publik `/var/www/creatorin/repo/public/uploads -> /var/www/creatorin/shared/uploads` tersedia dan terbaca dengan izin 755/644.

### Kasus 2: Bookmark Hanya Tersimpan di Set Lokal (Fase 5)
- **Akar Masalah:**
  Di beberapa halaman (`ExploreProjectsPage`, `CreatorProfilePage`), penekanan tombol simpan favorit hanya memanipulasi objek `Set<string>` di React memory tanpa melakukan panggilan API ke server.
- **Solusi yang Diterapkan:**
  1. Membuat tabel PostgreSQL `bookmarks` dengan konstrain unik `(user_id, target_type, target_id)`.
  2. Membangun API atomik `GET /api/bookmarks` dan `POST /api/bookmarks`.
  3. Mengintegrasikan `bookmarkService` dengan optimistic updates dan automatic rollback jika jaringan terputus, disertai Success Modal di tengah layar saat server mengonfirmasi status simpan.

---

## 3. Kesimpulan Persistensi
Seluruh state bisnis penting (keuangan, kolaborasi, pesan, profil, banner, dan bookmark) telah 100% dipindahkan dari memori ephemeral klien ke penyimpanan persisten PostgreSQL 17 dan direktori berkas bersama, menjamin ketahanan penuh terhadap reload halaman, perpindahan tab, maupun sesi login baru.
