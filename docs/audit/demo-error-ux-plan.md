# Creatorin — Demo Experience, Global Error UX & Safe Top-Up Plan

**Document Version:** 1.0.0  
**Date:** 15 Oktober 2026  
**Status:** Approved & Implemented  
**Lead Engineer:** Senior Full-Stack Engineer / Reliability & Security Auditor  

---

## 1. Executive Summary & Objectives

Tiga area fungsional ditingkatkan untuk memenuhi kebutuhan evaluasi juri/evaluator, keandalan penanganan galat lintas platform, dan simulasi alur transaksi bisnis end-to-end tanpa mock:
1. **Global Clear Error Popups**: Menggantikan pesan error mentah (`Failed to fetch`, unhandled rejection, blank screen) dengan modal dialog ramah pengguna berbahasa Indonesia yang terstruktur, memiliki saran perbaikan, tombol coba lagi, dan kode teknis ringkas.
2. **One-Click Demo Personas**: Menyediakan tombol masuk demo satu-klik di `/sign-in` dan `/sign-up` untuk 3 peran inti (Creator, UMKM/Business, Sekolah) yang menerbitkan JWT resmi dan session cookie tanpa membocorkan kredensial atau membypass middleware autentikasi.
3. **Safe Coin Top-Up for Collaboration Testing**: Menyediakan endpoint atomik `POST /api/wallet/topup` dengan proteksi guard demo untuk mengisi saldo koin evaluator, sehingga siklus invoice $\rightarrow$ escrow payment $\rightarrow$ pengerjaan $\rightarrow$ revisi $\rightarrow$ persetujuan $\rightarrow$ payout kreator dapat disimulasikan secara tuntas di database PostgreSQL.

---

## 2. Error Classification & UX Mapping Table

Centralized error mapper (`src/lib/error-mapper.ts`) menerjemahkan status HTTP dan pengecualian JavaScript menjadi UI model yang ramah pengguna:

| Skenario / Status | Judul Bahasa Indonesia | Penjelasan Ramah Pengguna | Tindakan Lanjutan | Retryable | Kode Teknis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Network / Offline / CORS** | Koneksi Terputus | Gagal menghubungi server Creatorin. Periksa jaringan internet Anda. | Pastikan perangkat terhubung ke internet stabil lalu coba lagi. | Ya | `ERR_NETWORK_DISCONNECTED` |
| **401 Unauthorized** | Sesi Masuk Berakhir | Sesi autentikasi Anda telah berakhir atau belum terdaftar. | Silakan masuk kembali ke akun Anda. | Tidak (Tautan `/sign-in`) | `HTTP_401_UNAUTHORIZED` |
| **403 Forbidden** | Akses Terbatas | Anda tidak memiliki hak akses untuk membuka atau mengubah data ini. | Gunakan akun dengan peran yang sesuai (Creator, UMKM, Sekolah). | Tidak | `HTTP_403_FORBIDDEN` |
| **404 Not Found** | Data Tidak Ditemukan | Informasi atau berkas yang diminta tidak tersedia di sistem. | Periksa kembali tautan atau kembali ke penjelajahan. | Tidak | `HTTP_404_NOT_FOUND` |
| **409 Conflict** | Terjadi Konflik Data | Data sedang diperbarui atau telah ada perubahan dari sesi lain. | Muat ulang halaman untuk menyinkronkan data terbaru. | Ya | `HTTP_409_CONFLICT` |
| **422 / 400 Validation** | Periksa Kembali Formulir | Data yang Anda masukkan belum memenuhi kriteria yang diperlukan. | Lengkapi seluruh kolom wajib bertanda bintang. | Tidak | `HTTP_4xx_VALIDATION` |
| **429 Rate Limit** | Terlalu Banyak Permintaan | Batas aktivitas sementara telah tercapai. | Mohon tunggu 30-60 detik demi keamanan. | Ya | `HTTP_429_RATE_LIMITED` |
| **500 / 502 / 503 Server** | Gangguan Server Sementara | Layanan kami sedang mengalami kendala teknis internal. | Tim teknis sedang memantau. Coba beberapa saat lagi. | Ya | `HTTP_5xx_SERVER_ERROR` |
| **Insufficient Coins** | Saldo Koin Tidak Cukup | Saldo dompet Anda belum mencukupi transaksi escrow ini. | Tambahkan koin ke dompet Anda untuk melanjutkan. | Tidak (Tautan Top Up) | `ERR_INSUFFICIENT_COINS` |

---

## 3. Demo Personas & Authentication Flow

Data pengguna demo tersimpan di PostgreSQL 17:
- **Creator Persona**: `creator@creatorin.my.id` (Nama: *Creator Pro CreatorIn*, Role: `creator`)
- **UMKM / Business Persona**: `umkm@creatorin.my.id` (Nama: *Kopi Lereng Nusantara*, Role: `business`)
- **School Persona**: `school@creatorin.my.id` (Nama: *SMK Negeri 1 Surabaya*, Role: `school`)

### Mekanisme Autentikasi:
- Frontend mengirim request `POST /api/auth/demo` dengan payload `{ role: "creator" | "business" | "school" }`.
- Server memvalidasi persona di PostgreSQL dan auto-provisioning relasi profil jika diperlukan.
- Server menandatangani JWT menggunakan `signJwtToken({ id, email, role, fullName })`.
- Server mengembalikan session token dan mengatur HTTP-only cookie `creatorin_token`.
- Klien menyimpan token di localStorage dan mengarahkan pengguna ke dashboard atau beranda.

---

## 4. Safe Coin Top-Up Mechanics

- **Endpoint**: `POST /api/wallet/topup`
- **Guards**:
  - Wajib memiliki token autentikasi valid (HTTP 401 jika anonim).
  - Diizinkan hanya jika `ENABLE_DEMO_TOPUP=true` ATAU email pengguna merupakan akun demo terdaftar ATAU mode development (HTTP 403 jika ditolak).
  - Jumlah koin harus integer positif $1 \le \text{amount} \le 50.000.000$.
- **Database Transaction (Atomik)**:
  1. Memastikan record dompet `creator_wallets` pengguna ada.
  2. Kunci baris & tambah saldo `balance = balance + amount`.
  3. Menyimpan baris `wallet_transactions` dengan status `completed`, tipe `topup`, dan deskripsi transparan.
