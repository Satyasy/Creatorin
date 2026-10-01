/**
 * Knowledge Base resmi platform Creatorin untuk mesin RAG (Retrieval-Augmented Generation).
 * Dokumen ini memuat informasi lengkap tentang fitur, tata cara penggunaan, navigasi lokasi,
 * sistem escrow/keuangan, kolaborasi, dan kemitraan vokasi sekolah.
 */

export interface KnowledgeDocument {
  id: string;
  category: 'overview' | 'navigation' | 'umkm' | 'creator' | 'school' | 'escrow' | 'collaboration';
  title: string;
  keywords: string[];
  content: string;
  relatedRoute?: string;
}

export const CREATORIN_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'kb-about',
    category: 'overview',
    title: 'Tentang Platform Creatorin',
    keywords: ['creatorin', 'apa itu creatorin', 'fungsi', 'tujuan', 'platform', 'tentang'],
    content: `Creatorin adalah platform ekosistem kolaborasi kreatif yang menghubungkan UMKM, Brand, Kreator Konten independen, dan Siswa Vokasi/SMK. 
Creatorin memfasilitasi pembuatan brief proyek, kolaborasi produksi konten (video UGC, visual branding, UI/UX, desain grafis), sistem pembayaran aman berbasis Escrow (rekening bersama), serta sertifikasi Career Score portofolio siswa vokasi.`,
    relatedRoute: '/',
  },
  {
    id: 'kb-navigation',
    category: 'navigation',
    title: 'Lokasi dan Navigasi Fitur Utama di Creatorin',
    keywords: ['lokasi', 'navigasi', 'dimana', 'halaman', 'menu', 'cara menuju', 'rute', 'link'],
    content: `Berikut adalah lokasi dan halaman utama di Creatorin yang dapat diakses melalui Navbar atas:
1. Beranda (/): Menampilkan feed tren, kreator unggulan, dan ringkasan platform.
2. Jelajah Proyek (/explore/projects): Menjelajahi portofolio konten kreatif, video UGC, TikTok/Reels feed, dan desain dari para kreator.
3. Katalog Layanan (/explore/services): Melihat paket jasa kreatif yang ditawarkan kreator lengkap dengan estimasi harga dan waktu pengerjaan.
4. Collaboration Room (/collaboration): Ruang kerja resmi antara UMKM dan Kreator untuk meninjau hasil karya, mengirim revisi, dan menyetujui approval akhir.
5. Brief Proyek (/briefs): Tempat UMKM memasang brief proyek baru dan melihat daftar brief yang sedang aktif.
6. Chat & Obrolan (/chat): Ruang percakapan pesan langsung antara UMKM, Kreator, dan mitra sekolah.
7. Dashboard Sekolah (/dashboard/school): Khusus institusi pendidikan SMK/Vokasi untuk mengelola approval pendaftaran siswa, penilaian rubrik kompetensi, dan profil sekolah.
8. Profil Publik Sekolah (/school/smk-kreatif-indonesia): Etalase publik karya siswa SMK, prestasi sekolah, dan pengajuan kemitraan industri.
9. Notifikasi (/notifications): Pusat pemberitahuan aktivitas proyek, penawaran brief, dan pembaruan invoice.
10. Profil Saya (/profile): Mengatur portofolio, bio, dan kredensial kreator.`,
    relatedRoute: '/explore',
  },
  {
    id: 'kb-escrow',
    category: 'escrow',
    title: 'Sistem Pembayaran dan Escrow Creatorin',
    keywords: ['escrow', 'pembayaran', 'bayar', 'aman', 'uang', 'rekening bersama', 'dana', 'cair', 'invoice', 'midtrans', 'keamanan'],
    content: `Sistem Escrow Creatorin menjamin keamanan 100% bagi UMKM dan Kreator:
1. Saat brief disepakati, UMKM membayar invoice ke rekening bersama (Escrow) Creatorin melalui Virtual Account, QRIS, atau transfer bank.
2. Dana tersebut AMAN ditahan oleh sistem Creatorin dan belum masuk ke dompet kreator sampai proyek selesai.
3. Kreator memproduksi karya dengan tenang karena mengetahui dana proyek sudah siap dan terkunci di escrow.
4. Setelah karya diunggah dan disetujui (Approved) oleh pihak UMKM di Collaboration Room, sistem secara otomatis mencairkan dana escrow langsung ke dompet saldo kreator.
5. Kreator dapat melakukan penarikan dana (Withdraw) ke rekening bank lokal kapan saja.`,
    relatedRoute: '/invoice/inv-101',
  },
  {
    id: 'kb-collaboration-room',
    category: 'collaboration',
    title: 'Tata Cara Penggunaan Collaboration Room',
    keywords: ['collaboration room', 'ruang kolaborasi', 'revisi', 'deliverable', 'approval', 'draft', 'cara kerja kolaborasi'],
    content: `Collaboration Room adalah pusat kerja pasca-pembayaran proyek:
1. Tahapan Proyek: Mengikuti 6 langkah terstruktur: (1) Brief & Kickoff -> (2) Pengerjaan -> (3) Review Hasil -> (4) Revisi -> (5) Approval UMKM -> (6) Selesai.
2. Peninjauan Deliverable: UMKM dapat memutar video atau memeriksa file desain langsung di pratinjau media.
3. Pengajuan Revisi: UMKM dapat menulis catatan feedback revisi spesifik. Kreator akan mendapat notifikasi untuk mengunggah revisi terbaru.
4. Approval Akhir: Begitu hasil karya memuaskan, UMKM menekan tombol 'Setujui Proyek' (Approve).
5. Pasca-Approval: Dana otomatis cair ke kreator, proyek resmi tercatat di riwayat selesai, dan UMKM dapat memberikan rating & ulasan bintang.`,
    relatedRoute: '/collaboration',
  },
  {
    id: 'kb-umkm-guide',
    category: 'umkm',
    title: 'Panduan Lengkap untuk Brand & UMKM',
    keywords: ['umkm', 'brand', 'klien', 'buat brief', 'pasang lowongan', 'rekrut', 'cara pesan', 'sewa kreator'],
    content: `Langkah menggunakan Creatorin untuk UMKM:
1. Membuat Brief Proyek: Buka menu 'Brief Proyek' (/briefs) lalu klik 'Buat Brief Baru'. Isi judul kampanye, kategori (UGC, Video, Desain), budget, tenggat waktu, dan arahan visual.
2. Menerima Pelamar: Kreator yang tertarik akan mengajukan proposal dan portofolio mereka.
3. Memilih Kreator: Tinjau profil, Career Score, dan ulasan kreator, lalu klik 'Terima Pelamar'.
4. Pembayaran Escrow: Lakukan pembayaran invoice aman.
5. Pantau di Collaboration Room: Masuk ke /collaboration untuk berkomunikasi dan menerima hasil karya.`,
    relatedRoute: '/briefs',
  },
  {
    id: 'kb-creator-guide',
    category: 'creator',
    title: 'Panduan Lengkap untuk Kreator Konten',
    keywords: ['kreator', 'creator', 'daftar kreator', 'cari kerja', 'lamar brief', 'portfolio', 'upload karya', 'penghasilan'],
    content: `Langkah bagi Kreator Konten di Creatorin:
1. Lengkapi Profil: Masuk ke /profile dan tambahkan link media sosial, keahlian, tarif mulai, dan karya terbaik.
2. Jelajahi Brief Proyek: Buka /briefs untuk melihat tawaran kerja dari UMKM aktif.
3. Kirim Lamaran (Pitch): Sertakan ide konten dan harga yang Anda tawarkan ke UMKM.
4. Mulai Pengerjaan: Setelah UMKM membayar escrow, ruangan kolaborasi /collaboration akan terbuka. Unggah draf karya Anda ke tab Deliverables.
5. Terima Pembayaran: Setelah disetujui UMKM, dana langsung masuk ke saldo akun Anda.`,
    relatedRoute: '/profile',
  },
  {
    id: 'kb-school-guide',
    category: 'school',
    title: 'Panduan Siswa SMK & Dashboard Sekolah',
    keywords: ['sekolah', 'smk', 'siswa', 'vokasi', 'school dashboard', 'school_id', 'penilaian', 'rubrik', 'magang', 'approval sekolah'],
    content: `Creatorin mengintegrasikan pendidikan vokasi dengan industri:
1. Siswa Terhubung Sekolah: Siswa yang mendaftar melalui sekolah memiliki atribut school_id dengan status 'pending'.
2. Approval Sekolah: Pihak guru/sekolah meninjau permohonan siswa di /dashboard/school pada tab 'Approval'. Siswa yang disetujui statusnya menjadi 'approved'.
3. Penilaian Rubrik Industri: Guru dapat menilai 4 kompetensi siswa (Kemampuan Teknis 40%, Tanggung Jawab 20%, Komunikasi 20%, Kedisiplinan 20%) di menu 'Penilaian' dengan kartu ringkasan nilai otomatis.
4. School Profile Publik: Menampilkan karya terbaik siswa sekolah di /school/[slug] sehingga UMKM dapat merekrut siswa untuk proyek atau program magang industri.`,
    relatedRoute: '/dashboard/school',
  },
  {
    id: 'kb-career-score',
    category: 'overview',
    title: 'Tentang Career Score Kreator & Siswa',
    keywords: ['career score', 'skor', 'reputasi', 'rating', 'badge', 'top tier', 'rising star'],
    content: `Career Score (skor 0-100) adalah metrik reputasi profesional terverifikasi di Creatorin.
Skor dihitung dari:
- Akurasi tenggat waktu (Deadline Accuracy)
- Rasio revisi yang rendah
- Tingkat penyelesaian proyek (Completion Rate)
- Penilaian ulasan klien (Client Rating)
- Penilaian asesmen kompetensi dari sekolah vokasi (khusus siswa SMK).
Skor tinggi membantu kreator dan siswa mendapatkan prioritas kurasi di halaman Jelajah dan tawaran proyek dari brand besar.`,
    relatedRoute: '/explore/projects',
  }
];

/**
 * Mencari dokumen knowledge base yang paling relevan dengan query pengguna.
 * Menggunakan pencarian kata kunci dan skor kecocokan term berbasis frekuensi & bobot.
 */
export function searchKnowledgeBase(query: string, limit: number = 3): KnowledgeDocument[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 1);

  if (queryTokens.length === 0) {
    return CREATORIN_KNOWLEDGE_BASE.slice(0, limit);
  }

  const scoredDocs = CREATORIN_KNOWLEDGE_BASE.map(doc => {
    let score = 0;

    // Check title match
    const titleLower = doc.title.toLowerCase();
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 5;
    }

    // Check keywords match
    for (const keyword of doc.keywords) {
      const kwLower = keyword.toLowerCase();
      if (normalizedQuery.includes(kwLower) || kwLower.includes(normalizedQuery)) {
        score += 8;
      }
      for (const token of queryTokens) {
        if (kwLower.includes(token)) score += 3;
      }
    }

    // Check content match
    const contentLower = doc.content.toLowerCase();
    for (const token of queryTokens) {
      if (contentLower.includes(token)) score += 1;
    }

    return { doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);

  return scoredDocs.filter(item => item.score > 0).slice(0, limit).map(item => item.doc);
}
