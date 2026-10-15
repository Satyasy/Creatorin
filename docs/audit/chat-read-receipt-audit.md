# Creatorin — Audit & Verifikasi Chat Real-Time & Tanda Terima Baca (Read Receipts)

**Tanggal:** 15 Oktober 2026  
**Status:** VERIFIED & RELEASE READY  
**Arsitektur:** Next.js App Router + PostgreSQL 17 (Drizzle ORM) + Redis 7 Pub/Sub + SSE (Server-Sent Events)  

---

## 1. Arsitektur Status Pesan & Indikator Centang (Read Receipts)

### Spesifikasi UI & Visual State
Sesuai standar antarmuka Creatorin:
- **Terkirim / Diterima (Delivered):** Dua centang abu-abu (`text-neutral-400`) menggunakan komponen `<CheckCheck />` dari Lucide.
- **Telah Dibaca (Read):** Dua centang biru (`text-blue-600`) menggunakan komponen `<CheckCheck />` dengan transisi warna halus (`transition-colors`).
- **Pesan Masuk (Incoming):** Menampilkan waktu pengiriman tanpa centang (centang hanya ditampilkan pada pesan keluar milik pengirim `msg.isSelf`).

---

## 2. Implementasi Backend & Transpor Real-Time

### A. Skema Database PostgreSQL 17 (`messages`)
Kolom `is_read` bertipe `boolean` dengan nilai baku `false` menyimpan status persistensi pesan:
```sql
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  service_quote_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

### B. Endpoint Tandai Pesan Dibaca (`POST /api/messages/read`)
- Memvalidasi otentikasi JWT pengguna (`getAuthenticatedUser`).
- Memverifikasi otorisasi akses: pengguna harus merupakan peserta sah (`participant1_id` atau `participant2_id`) dalam `conversationId`.
- Mengeksekusi mutasi atomik di PostgreSQL:
  ```ts
  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.conversationId, conversationId),
      ne(messages.senderId, user.id),
      eq(messages.isRead, false)
    ))
    .returning({ id: messages.id });
  ```
- Menyiarkan event `MESSAGES_READ` ke Redis Pub/Sub channel `chat:${conversationId}`.

### C. Transpor Real-Time (SSE + Redis Pub/Sub)
- **Endpoint SSE:** `GET /api/messages/stream?conversationId=...`
- Dedicated Redis subscriber mendengarkan channel `chat:${conversationId}`.
- Mengirim event pesan baru (`NEW_MESSAGE`) dan event baca (`MESSAGES_READ`) ke klien yang terhubung secara instan tanpa delay.
- Dilengkapi heartbeat ping (15 detik) untuk mencegah timeout koneksi proksi/jaringan.
- **Mekanisme Fallback Adaptive Polling:** Jika browser tidak mendukung SSE atau koneksi terputus, klien secara otomatis mengaktifkan polling adaptif berkala (3.5 detik).

---

## 3. Integrasi Frontend (`src/views/ChatPage.tsx`)

1. **Saat Membuka Percakapan:**
   Klien memuat riwayat pesan dari `/api/messages` dan secara otomatis memanggil `chatService.markMessagesAsRead(activeChatId)` untuk menandai pesan yang belum dibaca sebagai terbaca di PostgreSQL.
2. **Saat Menerima Event `MESSAGES_READ`:**
   Jika event `readBy` berasal dari mitra chat (bukan pengirim sendiri), state lokal `conversations` langsung diperbarui (`status: 'read'`), mengubah warna centang dari abu-abu (`text-neutral-400`) menjadi biru terang (`text-blue-600`) tanpa perlu memuat ulang halaman (zero reload).
3. **Pesan Otomatis Collaboration Room:**
   Semua notifikasi pengunggahan file revisi, approval hasil karya, ulasan rating, dan pencairan dana escrow yang dikirim melalui `onSendChatMessage` terintegrasi dengan pipeline chat real-time dan tanda terima baca yang sama.

---

## 4. Matriks Verifikasi Kasus Uji

| No | Skenario Pengujian | Harapan | Hasil Aktual | Status |
|:--:|:-------------------|:--------|:-------------|:------:|
| 1 | Pengirim mengirim pesan baru | Pesan tampil dengan 2 centang abu-abu | `status: 'delivered'`, ikon abu-abu `text-neutral-400` | **PASS** |
| 2 | Penerima membuka ruang chat | Pesan lawan bicara ditandai `is_read = true` di DB | Mutasi sukses via `POST /api/messages/read` | **PASS** |
| 3 | Pengirim menerima event real-time | Centang abu-abu berubah menjadi 2 centang biru seketika | Event `MESSAGES_READ` diterima, berubah ke `text-blue-600` | **PASS** |
| 4 | Reload browser di sisi pengirim | Status pesan tetap 2 centang biru | Nilai `isRead: true` dimuat dari PostgreSQL | **PASS** |
| 5 | Pengguna non-partisipan mengakses stream chat | Akses ditolak dengan status 403 Forbidden | Validasi `canAccessConversation` mengembalikan 403 | **PASS** |
