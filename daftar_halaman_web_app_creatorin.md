# CREATORIN
## Daftar Halaman Web App

> **Dokumen kerja hasil brainstorming produk — bukan PRD final.**  
> Struktur halaman masih dapat berubah mengikuti keputusan lanjutan.

**Keterangan Role:**
* `Creator`
* `Business/UMKM`
* `School`
* `Guest`

---

## A. Halaman Publik (Belum Login)
Halaman yang bisa diakses siapa saja tanpa perlu masuk akun. Tujuannya agar calon Creator maupun Business/UMKM bisa melihat-lihat dulu sebelum memutuskan mendaftar.

### 1. Beranda
* **Role:** `Guest`
* **Deskripsi:** Halaman pertama yang dilihat pengunjung saat membuka Creatorin. Memperkenalkan apa itu Creatorin dan mengarahkan pengunjung untuk mulai menjelajah atau mendaftar.
* **Fitur / Komponen:**
  * Hero section: judul, penjelasan singkat platform, gambar/ilustrasi
  * Tombol ajakan (CTA): "Jelajahi Creator" dan "Daftar Sekarang"
  * Preview 3 kategori discovery: Profil Creator, Layanan, Proyek

### 2. Jelajah – Profil Creator
* **Role:** `Guest`
* **Deskripsi:** Tempat pengunjung mencari dan membandingkan Creator berdasarkan kebutuhan mereka, mirip halaman pencarian di marketplace.
* **Fitur / Komponen:**
  * Kolom pencarian nama/kategori
  * Filter: kategori keahlian, lokasi, rentang harga
  * Grid kartu Creator berisi foto, nama, keahlian, harga mulai dari, lokasi, cuplikan layanan

### 3. Jelajah – Layanan
* **Role:** `Guest`
* **Deskripsi:** Menampilkan layanan-layanan spesifik yang ditawarkan para Creator, supaya pengunjung yang sudah tahu kebutuhannya (misal butuh "logo") bisa langsung cari.
* **Fitur / Komponen:**
  * Pencarian & filter kategori (Reels IG, Video TikTok, Feed IG, Poster, Banner, Brosur, Logo, Foto Produk)
  * Grid kartu Layanan: nama layanan, Creator pemilik, harga acuan, contoh hasil

### 4. Jelajah – Proyek
* **Role:** `Guest`
* **Deskripsi:** Galeri hasil karya para Creator, berfungsi seperti portfolio publik untuk membangun kepercayaan dan inspirasi.
* **Fitur / Komponen:**
  * Grid karya (foto, video, atau link Instagram/TikTok)
  * Filter kategori karya
  * Klik karya untuk lihat detail dan Creator pembuatnya

### 5. Detail Profil Creator
* **Role:** `Guest`
* **Deskripsi:** Halaman lengkap satu Creator, jadi 'etalase' utama yang meyakinkan calon klien untuk menghubungi.
* **Fitur / Komponen:**
  * Tab About: bio, keahlian, kontak
  * Tab Layanan yang ditawarkan
  * Tab Proyek/portofolio
  * Tab Hasil Collaboration sebelumnya
  * Tab Review & rating dari klien
  * Statistik (jumlah project selesai, rating rata-rata)
  * Lencana Sekolah (jika Creator terhubung dengan sekolah mitra)

### 6. Detail Layanan
* **Role:** `Guest`
* **Deskripsi:** Halaman satu layanan spesifik, tempat calon klien menilai apakah layanan ini sesuai kebutuhan sebelum menghubungi Creator.
* **Fitur / Komponen:**
  * Deskripsi lengkap layanan
  * Harga acuan (bukan harga final — harga sebenarnya dibicarakan lewat diskusi)
  * Contoh hasil kerja terkait
  * Tombol "Hubungi Creator" (mengarahkan ke Login bila belum masuk)

### 7. Detail Proyek
* **Role:** `Guest`
* **Deskripsi:** Halaman satu karya, memperlihatkan hasil kerja secara utuh beserta cerita di baliknya.
* **Fitur / Komponen:**
  * Media karya (gambar/video/embed link)
  * Deskripsi proyek
  * Info Creator pembuat dengan tautan ke profilnya

### 8. Login
* **Role:** `Guest`
* **Deskripsi:** Pintu masuk untuk pengguna yang sudah punya akun.
* **Fitur / Komponen:**
  * Form email & kata sandi
  * Tombol masuk dengan akun Google
  * Tautan "Lupa kata sandi" dan "Belum punya akun? Daftar"

### 9. Daftar (Register)
* **Role:** `Guest`
* **Deskripsi:** Pintu masuk untuk pengguna baru, langkah pertama sebelum onboarding.
* **Fitur / Komponen:**
  * Pilihan role: Creator / Business-UMKM / Sekolah
  * Form data akun dasar (nama, email, kata sandi) atau daftar via Google

---

## B. Onboarding
Serangkaian halaman singkat setelah mendaftar, untuk melengkapi data awal sesuai role yang dipilih sebelum pengguna masuk ke aplikasi utama.

### 10. Onboarding Creator
* **Role:** `Creator`
* **Deskripsi:** Mengumpulkan informasi dasar tentang keahlian Creator agar profil awalnya sudah cukup informatif.
* **Fitur / Komponen:**
  * Pilih kategori/bidang keahlian
  * Isi bio singkat
  * Opsional: unggah 1–2 contoh karya awal

### 11. Onboarding Business/UMKM
* **Role:** `Business/UMKM`
* **Deskripsi:** Mengumpulkan informasi dasar tentang usaha agar Creator paham siapa yang akan mereka ajak kerja sama.
* **Fitur / Komponen:**
  * Nama & kategori usaha
  * Deskripsi singkat usaha
  * Kebutuhan utama (opsional, untuk rekomendasi awal)

### 12. Onboarding Sekolah
* **Role:** `School`
* **Deskripsi:** Proses pendaftaran/verifikasi mitra sekolah agar dapat memonitor siswa yang menjadi Creator.
* **Fitur / Komponen:**
  * Data sekolah & penanggung jawab
  * > **Catatan (ASSUMPTION):** Alur verifikasi & dokumen pendukung belum dibahas, perlu keputusan lebih lanjut.

### 13. Lengkapi Profil (Complete Profile)
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Langkah terakhir sebelum masuk ke aplikasi utama, memastikan field profil penting sudah terisi.
* **Fitur / Komponen:**
  * Cek kelengkapan field wajib (foto, lokasi, kontak, dll)
  * Tombol "Selesai" mengarahkan ke Beranda logged-in

---

## C. Beranda Setelah Login

### 14. Beranda (Logged-in)
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Versi personal dari Beranda, menyesuaikan isi dengan aktivitas dan kebutuhan pengguna yang sudah masuk.
* **Fitur / Komponen:**
  * Rekomendasi Creator/Layanan/Brief yang relevan dengan pengguna
  * Ringkasan aktivitas terbaru (pesan baru, status Brief, dsb)
  * Pintasan ke fitur yang sering dipakai

---

## D. Profil

### 15. Profil Saya – Creator
* **Role:** `Creator`
* **Deskripsi:** Versi 'milik sendiri' dari halaman Detail Profil Creator, dengan tambahan akses untuk mengelola isinya.
* **Fitur / Komponen:**
  * Sama seperti Detail Profil Creator (About, Layanan, Proyek, Collaboration Work, Review, Statistik, Lencana Sekolah)
  * Tombol edit di setiap bagian

### 16. Profil Saya – Business/UMKM
* **Role:** `Business/UMKM`
* **Deskripsi:** Versi 'milik sendiri' dari profil usaha, menampilkan rekam jejak kerja sama dengan para Creator.
* **Fitur / Komponen:**
  * About usaha
  * Brief yang sedang dibuka (Open Brief)
  * Riwayat Collaboration
  * Review dari para Creator

### 17. Edit Profil
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Form untuk mengubah data profil yang sudah diisi sebelumnya.
* **Fitur / Komponen:**
  * Ubah foto, bio/deskripsi, lokasi, kontak, dan info dasar lainnya

---

## E. Layanan (Service)
Khusus untuk Creator mengelola apa saja yang mereka tawarkan.

### 18. Kelola Layanan
* **Role:** `Creator`
* **Deskripsi:** Dasbor untuk Creator melihat dan mengatur semua layanan yang mereka jual.
* **Fitur / Komponen:**
  * Daftar layanan milik sendiri beserta status (aktif/nonaktif)
  * Tombol tambah layanan baru
  * Aksi edit atau hapus per layanan

### 19. Tambah/Edit Layanan
* **Role:** `Creator`
* **Deskripsi:** Form untuk membuat layanan baru atau memperbarui layanan yang sudah ada.
* **Fitur / Komponen:**
  * Nama layanan & kategori (mis. Logo, Poster, dst)
  * Deskripsi lengkap
  * Harga acuan (bukan harga mengikat — harga final ditentukan lewat diskusi & invoice)
  * Contoh hasil kerja terkait

---

## F. Proyek (Project)
Khusus untuk Creator mengelola portofolio karya mereka.

### 20. Kelola Proyek
* **Role:** `Creator`
* **Deskripsi:** Dasbor untuk mengatur semua karya yang ditampilkan di profil dan halaman Jelajah.
* **Fitur / Komponen:**
  * Daftar Proyek (karya personal, hasil Collaboration, atau portofolio)
  * Tombol tambah karya baru
  * Aksi edit atau hapus per karya

### 21. Tambah/Edit Proyek
* **Role:** `Creator`
* **Deskripsi:** Form untuk mengunggah atau memperbarui satu karya.
* **Fitur / Komponen:**
  * Unggah media: satu gambar, beberapa gambar, atau video
  * Atau tautkan link Instagram/TikTok
  * Deskripsi karya

---

## G. Brief Proyek
Alur di mana Business/UMKM membuka lowongan pekerjaan dan Creator melamar — kebalikan dari alur Layanan di mana Creator yang menawarkan.

### 22. Daftar Brief Proyek
* **Role:** `Creator`
* **Deskripsi:** Halaman bagi Creator untuk mencari pekerjaan yang dibuka oleh berbagai Business/UMKM.
* **Fitur / Komponen:**
  * Pencarian & filter Brief
  * List Brief dengan ringkasan: judul, kebutuhan, budget, tenggat

### 23. Detail Brief Proyek
* **Role:** `Creator`
* **Deskripsi:** Halaman satu lowongan pekerjaan lengkap, tempat Creator memutuskan untuk melamar atau tidak.
* **Fitur / Komponen:**
  * Deskripsi pekerjaan, kebutuhan, output yang diharapkan, budget
  * Tombol "Apply" untuk melamar

### 24. Buat Brief Proyek
* **Role:** `Business/UMKM`
* **Deskripsi:** Form bagi Business/UMKM untuk membuka pekerjaan baru.
* **Fitur / Komponen:**
  * Deskripsi pekerjaan & kebutuhan
  * Output yang diinginkan
  * Budget/harga yang ditawarkan

### 25. Kelola Brief Saya
* **Role:** `Business/UMKM`
* **Deskripsi:** Dasbor untuk memantau semua Brief yang pernah dibuat.
* **Fitur / Komponen:**
  * Daftar Brief beserta status (terbuka/tertutup/berjalan)
  * Jumlah pelamar per Brief

### 26. Detail Brief + Daftar Pelamar
* **Role:** `Business/UMKM`
* **Deskripsi:** Halaman untuk meninjau siapa saja yang melamar dan memilih Creator yang paling cocok.
* **Fitur / Komponen:**
  * Daftar Creator yang melamar dengan ringkasan profil
  * Aksi terima/tolak pelamar
  * Setelah memilih, mengarah ke Ruang Pesan untuk diskusi lanjutan

### 27. Status Brief Saya
* **Role:** `Creator`
* **Deskripsi:** Halaman bagi Creator untuk memantau lamaran yang sudah dikirim.
* **Fitur / Komponen:**
  * Daftar Brief yang sudah dilamar beserta status (menunggu/diterima/ditolak)

---

## H. Pesan
Ruang komunikasi sebelum kerja sama resmi dimulai — berbeda dari Collaboration Room yang dipakai setelah pembayaran.

### 28. Daftar Percakapan
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Kotak masuk berisi semua percakapan pengguna, seperti inbox pada umumnya.
* **Fitur / Komponen:**
  * List percakapan dengan preview pesan terakhir
  * Penanda pesan belum dibaca

### 29. Ruang Pesan
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Halaman chat satu-satu untuk membahas detail pekerjaan sebelum sepakat.
* **Fitur / Komponen:**
  * Jendela chat real-time
  * Panel/preview konteks pembicaraan: Layanan atau Brief yang sedang dibahas
  * Dari sini, kesepakatan dilanjutkan ke pembuatan Invoice

---

## I. Invoice & Pembayaran
Tahap setelah kedua pihak sepakat lewat diskusi, sebelum Collaboration Room dimulai. Pembayaran bersifat satu kali (single payment) di awal.

### 30. Buat Invoice
* **Role:** `Creator`
* **Deskripsi:** Form bagi Creator untuk menagih pekerjaan yang sudah disepakati dengan klien.
* **Fitur / Komponen:**
  * Layanan/pekerjaan yang disepakati
  * Rincian pekerjaan & output
  * Harga total, tenggat waktu, ketentuan revisi

### 31. Detail Invoice
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Halaman rincian satu invoice, dilihat oleh kedua pihak.
* **Fitur / Komponen:**
  * Semua rincian yang dibuat Creator
  * Status invoice: menunggu pembayaran / sudah dibayar

### 32. Pembayaran
* **Role:** `Business/UMKM`
* **Deskripsi:** Halaman bagi Business/UMKM untuk membayar invoice secara penuh di muka.
* **Fitur / Komponen:**
  * Ringkasan tagihan
  * Pilihan metode pembayaran
  * Konfirmasi setelah berhasil bayar — otomatis membuka Collaboration Room

### 33. Riwayat Transaksi
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Catatan seluruh transaksi yang pernah dilakukan, untuk keperluan pelacakan dan pembukuan sederhana.
* **Fitur / Komponen:**
  * List semua invoice/transaksi dengan status dan tanggal
  * Filter berdasarkan status atau periode

---

## J. Collaboration Room
Ruang kerja khusus yang aktif setelah pembayaran, tempat pekerjaan benar-benar dikerjakan hingga selesai.

### 34. Daftar Collaboration Room
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Halaman untuk melihat semua kerja sama yang sedang berjalan maupun yang sudah selesai.
* **Fitur / Komponen:**
  * Kartu ringkasan tiap Collaboration Room dengan status progres

### 35. Detail Collaboration Room
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Ruang kerja utama satu proyek, dari awal pengerjaan sampai selesai.
* **Fitur / Komponen:**
  * Ringkasan brief & detail pekerjaan yang disepakati
  * Tenggat waktu & progres berjalan
  * Area unggah hasil kerja (submission)
  * Alur revisi: klien minta revisi → Creator unggah ulang (resubmission)
  * Persetujuan akhir (approval) oleh klien
  * Hasil akhir project, yang nantinya bisa ditampilkan sebagai Proyek di profil Creator

---

## K. Rating & Review

### 36. Form Rating & Review
* **Role:** `Creator`, `Business/UMKM`
* **Deskripsi:** Muncul setelah Collaboration Room selesai, kedua pihak saling menilai satu sama lain.
* **Fitur / Komponen:**
  * Pemberian bintang (jumlah & aspek penilaian masih perlu ditentukan)
  * Kolom feedback berupa teks
  * > **Catatan:** Detail jumlah bintang, aspek penilaian, dan cara hitung statistik belum final.

---

## L. Notifikasi

### 37. Notifikasi
* **Role:** `Creator`, `Business/UMKM`, `School`
* **Deskripsi:** Pusat pemberitahuan agar pengguna tidak ketinggalan aktivitas penting di akunnya.
* **Fitur / Komponen:**
  * Daftar notifikasi: pesan baru, lamaran diterima/ditolak, invoice baru, pembayaran masuk, dll
  * Klik notifikasi mengarahkan langsung ke halaman terkait

---

## M. Poin & Saldo

### 38. Saldo & Poin
* **Role:** `Creator`
* **Deskripsi:** Halaman bagi Creator untuk memantau penghasilan dari platform.
* **Fitur / Komponen:**
  * Total saldo & total poin
  * Riwayat konversi poin menjadi saldo

### 39. Penarikan Saldo (Withdrawal)
* **Role:** `Creator`
* **Deskripsi:** Halaman untuk mencairkan saldo ke rekening/e-wallet Creator.
* **Fitur / Komponen:**
  * Form penarikan saldo
  * > **Catatan (ASSUMPTION):** Mekanisme fee penarikan, minimum penarikan, dan proses pencairan belum final.

---

## N. Sekolah (School)
Role khusus mitra sekolah, di luar alur marketplace utama.

### 40. Dasbor Sekolah
* **Role:** `School`
* **Deskripsi:** Halaman utama bagi sekolah untuk memantau siswa yang menjadi Creator di Creatorin.
* **Fitur / Komponen:**
  * Ringkasan aktivitas siswa yang terhubung
  * > **Catatan (ASSUMPTION):** Data dan statistik apa saja yang boleh ditampilkan ke sekolah belum disetujui; perlu pembahasan privasi lebih lanjut.

### 41. Detail Siswa/Creator (Tampilan Sekolah)
* **Role:** `School`
* **Deskripsi:** Halaman rincian satu siswa untuk keperluan monitoring sekolah.
* **Fitur / Komponen:**
  * Statistik & aktivitas siswa tersebut
  * > **Catatan (ASSUMPTION):** Cakupan data (nilai transaksi? isi chat? hanya statistik umum?) dan izin akses belum dibahas.

---

## O. Akun & Pengaturan

### 42. Pengaturan Akun
* **Role:** `Creator`, `Business/UMKM`, `School`
* **Deskripsi:** Halaman pengaturan umum akun, terpisah dari profil publik.
* **Fitur / Komponen:**
  * Ubah kata sandi & email
  * Pengaturan preferensi notifikasi
  * Opsional: bahasa, privasi akun

---

## Ringkasan Jumlah Halaman

| Kategori | Jumlah Halaman |
| :--- | :---: |
| A. Publik | 9 |
| B. Onboarding | 4 |
| C. Beranda Logged-in | 1 |
| D. Profil | 3 |
| E. Layanan | 2 |
| F. Proyek | 2 |
| G. Brief Proyek | 6 |
| H. Pesan | 2 |
| I. Invoice & Pembayaran | 4 |
| J. Collaboration Room | 2 |
| K. Rating & Review | 1 |
| L. Notifikasi | 1 |
| M. Poin & Saldo | 2 |
| N. Sekolah | 2 |
| O. Akun & Pengaturan | 1 |
| **Total** | **42** |

> **Catatan akhir:** Halaman bertanda **ASSUMPTION** masih menunggu keputusan (*Onboarding Sekolah*, *Withdrawal*, *Dasbor Sekolah*). Sebagian halaman berpotensi digabung sesuai preferensi UI, misalnya *Kelola Layanan* dan *Kelola Proyek* menjadi satu *Dasbor Creator*.