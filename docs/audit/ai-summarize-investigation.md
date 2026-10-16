# AI Summarize — Laporan Investigasi Awal & Audit Arsitektur

**Tanggal Audit:** 16 Oktober 2026  
**Target Fitur:** AI Summarize Percakapan Chat & Collaboration Room  
**Repository:** `Satyasy/Creatorin` (`main`)  
**Lingkungan:** Next.js App Router (Node.js 24), PostgreSQL 17, Redis, PM2, `@huggingface/transformers`

---

## 1. Riwayat Implementasi Git Terkait AI Summarize

Berdasarkan pelacakan riwayat commit:
1. **`15ff475` (feat: implement AI conversation summarize):**
   - Pertama kali memperkenalkan konsep AI Summarize di chat room dan floating assistant.
   - Menggunakan mock/stub awal dan struktur response sementara.
2. **`6f391ac` (feat: integrate local Hugging Face Transformers.js models):**
   - Menambahkan `@huggingface/transformers` ke proyek.
   - Membuat `src/lib/ai/localSummarizer.ts` menggunakan model ONNX `Xenova/distilbart-cnn-6-6` (~160MB ONNX q8) dan `src/lib/ai/localEmbedding.ts` menggunakan `Xenova/all-MiniLM-L6-v2`.
   - Menambahkan percobaan fallback ke remote Hugging Face API (`cahya/t5-base-indonesian-summarization`).
   - Namun jika model lokal/remote gagal, fallback ke teks statis hardcoded (*"Kolaborasi antara ... CTA promo diskon 15%..."*).
3. **`be6c6a2` (feat: add invoice DP proposal, collaboration room, real file upload):**
   - Menghubungkan ringkasan ke ruang kolaborasi (`collaboration_rooms`).
4. **`cf5582f` (feat: persist AI summarize to PostgreSQL, harden realtime live chat):**
   - Menambahkan kolom `ai_summary` (JSONB) dan `ai_summary_updated_at` (TIMESTAMP) ke tabel `conversations` dan `collaboration_rooms` di database PostgreSQL.
   - Mengganti pemanggilan model Hugging Face di `src/app/api/ai/summarize/route.ts` dengan pengecekan `GEMINI_API_KEY` (API eksternal berbayar Google) dan fallback ke fungsi ekstraksi regex lokal `extractDynamicSummary()`.
   - Mengabaikan `src/lib/ai/localSummarizer.ts` sehingga model Hugging Face lokal tidak pernah dipanggil pada runtime produksi.

---

## 2. Arsitektur Saat Ini

```
[UI ChatPage / CollaborationRoomView]
  │
  ├─► [Tombol "Perbarui Ringkasan AI" / Auto-fetch on mount]
  │     │
  │     ▼
  │   [aiSummarizeService.summarizeConversation()]
  │     │
  │     ▼
  │   [POST /api/ai/summarize]
  │     ├─ Cek GEMINI_API_KEY (jika ada, panggil Google Cloud API)
  │     ├─ Jika tidak ada, panggil extractDynamicSummary(messages) (Regex-based NLP)
  │     ├─ Simpan hasil ke PostgreSQL (conversations.ai_summary & collaboration_rooms.ai_summary)
  │     └─ Broadcast via Redis Pub/Sub (AI_SUMMARY_UPDATED)
```

---

## 3. Akar Masalah yang Ditemukan (Root Causes)

1. **Model Hugging Face Lokal Di-bypass:**
   - Berkas `src/lib/ai/localSummarizer.ts` telah ada tetapi tidak lagi dipanggil di `src/app/api/ai/summarize/route.ts`. Route langsung lari ke external Gemini API atau fungsi regex `extractDynamicSummary`.
2. **Keterbatasan Kemampuan Model Sekuensial vs Format Terstruktur:**
   - Model summarization klasik (`distilbart-cnn-6-6` atau `cahya/t5-base`) hanya menghasilkan teks paragraf tunggal (`summary_text`), bukan objek JSON dengan field terstruktur (kesepakatan, usulan, timeline, penanggung jawab, dll.).
   - Sebaliknya, model generatif instruksional kecil (seperti Qwen2.5-0.5B-Instruct pada pengujian runtime CPU) memakan waktu ~20 detik dan rentan menghasilkan halusinasi tanggal/pembayaran jika tidak dibatasi oleh validator fakta yang ketat.
3. **Penyusunan Konteks Pesan Belum Membedakan Status Kesepakatan:**
   - Pesan yang dikirim oleh frontend hanya memuat string pengirim tanpa metadata status persetujuan eksplisit, sehingga usulan sepihak berisiko disimpulkan sebagai kesepakatan final.
4. **Validasi Otorisasi di Handler POST:**
   - Di `route.ts`, handler `GET` sudah memvalidasi token JWT (`getAuthenticatedUser`), namun handler `POST` menerima `conversationId` dan array `messages` dari body tanpa memverifikasi apakah user yang login memiliki akses ke percakapan tersebut dan tanpa mengambil pesan resmi dari database untuk mencegah manipulasi client-side.

---

## 4. Komponen yang Sudah Berfungsi

- ✅ Skema Database PostgreSQL 17 (`conversations.ai_summary` JSONB, `ai_summary_updated_at`, dan `collaboration_rooms`).
- ✅ Redis Pub/Sub untuk sinkronisasi event pembaruan ringkasan realtime (`AI_SUMMARY_UPDATED`).
- ✅ UI Card AI Summarize di `src/views/ChatPage.tsx` dan `src/components/collaboration/CollaborationRoomView.tsx` (tampilan ringkasan, list kesepakatan, action items, status badge, tombol salin ke clipboard).
- ✅ Mesin runtime `@huggingface/transformers` berbasis `onnxruntime-node` (C++ native Linux x64) yang sudah terverifikasi berfungsi di Node 24 pada server tanpa memerlukan instalasi library Python terpisah.

---

## 5. Komponen yang Belum Berfungsi / Perlu Diperbaiki

- ❌ `src/app/api/ai/summarize/route.ts` belum mengaktifkan model Hugging Face lokal secara nyata (masih mengandalkan regex/Gemini external).
- ❌ Otorisasi pada `POST /api/ai/summarize` belum memvalidasi kepemilikan percakapan dan belum mengambil riwayat pesan otentik dari tabel `messages` PostgreSQL jika tidak disediakan atau untuk menjamin integritas.
- ❌ Pipeline inference lokal belum menyatukan hasil abstraktif model Hugging Face lokal dengan ekstraksi fakta deterministik untuk menjamin zero-hallucination pada field terstruktur (scope, kesepakatan vs usulan, timeline, tanggung jawab, pertanyaan terbuka).
- ❌ Belum ada unit test dan integration test yang menguji inference model Hugging Face lokal secara nyata tanpa mock.

---

## 6. Rencana Perbaikan Paling Minimal & Benar Secara Arsitektur

1. **Pipeline Inference Hugging Face Lokal yang Tangguh:**
   - Gunakan model summarization lokal Hugging Face terkuantisasi ONNX yang diinisialisasi sekali (singleton in-memory) melalui `@huggingface/transformers` untuk menghasilkan ringkasan eksekutif (*executive summary*) berbasis konteks percakapan Bahasa Indonesia.
   - Padukan dengan mesin analisis semantik deterministik multi-tahap (*hybrid factual extraction*) untuk menyusun field terstruktur (kesepakatan terkonfirmasi, usulan belum disetujui, timeline/deadline, penanggung jawab Creator vs UMKM, pertanyaan terbuka, dan informasi yang belum dibahas) secara ketat tanpa halusinasi.
2. **Penguatan Otorisasi & Integritas Sumber Data:**
   - Handler `POST /api/ai/summarize` wajib memverifikasi otentikasi pengguna (`getAuthenticatedUser`).
   - Mengambil pesan percakapan langsung dari tabel `messages` PostgreSQL sesuai `conversationId` yang diminta untuk mencegah manipulasi client-side dan menjamin isolasi antar percakapan.
3. **Struktur Data Output Kompatibel:**
   - Menghasilkan payload data yang sesuai dengan interface UI yang ada (`executiveSummary`, `agreements`, `actionItems`, `lastRevisionNotes`, `modelUsed`, `generatedAt`, plus field metadata terstruktur tambahan).
4. **Verifikasi dan Pengujian Komprehensif:**
   - Buat test suite pengujian nyata (`scripts/verify-ai-summarize-local-hf.ts`) yang menguji skenario representatif, pencegahan halusinasi, isolasi percakapan, otorisasi, dan error handling.
