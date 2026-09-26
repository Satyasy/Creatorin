import { CollaborationItem } from '../types';

export const MOCK_COLLABORATIONS: CollaborationItem[] = [
  {
    id: 'collab-room-4',
    roomCode: 'CR-2026-021',
    projectTitle: 'Foto Katalog & Flatlay 8 Menu Signature Cafe untuk Menu Board & Website',
    category: 'Foto Produk',
    budgetFormatted: 'Rp1.800.000',
    budgetAmount: 1800000,
    escrowStatus: 'released_to_creator',
    invoiceNumber: 'INV/2026/09/CRT-661009',
    invoicePaidDate: '15 September 2026',
    thumbnail: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=240&auto=format&fit=crop&q=80',
    
    creatorId: 'c3',
    creatorName: 'Amanda Larasati',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Commercial Product Photographer',
    creatorRating: 4.96,
    
    businessName: 'Dimas Wicaksono',
    businessBrand: 'Kopi Kenangan Senja',
    businessAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=240&auto=format&fit=crop&q=80',
    
    startDate: '15 September 2026',
    deadlineDate: '20 September 2026',
    daysRemaining: 0,
    
    currentStage: 'completed',
    progressPercent: 100,
    
    briefDetails: {
      summary: 'Photoshoot on-site di kedai Senopati untuk 8 varian kopi & pastry signature.',
      requirements: [
        '16 foto hi-res color-graded profesional',
        'Format JPEG & RAW file master',
        'Hak komersial penuh untuk menu cetak'
      ],
      brandAssets: [
        { name: 'Brand_Guideline_KopiKenanganSenja.pdf', size: '4.2 MB' },
        { name: 'Vector_Logo_KKS_Gold.svg', size: '320 KB' }
      ]
    },
    
    deliverables: [
      {
        id: 'deliv-final-4',
        version: 1,
        title: 'Final Master Deliverables (16 Foto Hi-Res + RAW Archive)',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1200&auto=format&fit=crop&q=80',
        previewThumbnail: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800&auto=format&fit=crop&q=80',
        uploadedAt: '19 September 2026',
        filesize: '340 MB',
        creatorNote: 'Terima kasih banyak mas Dimas dan tim Kopi Kenangan Senja! Semua file master dan color grading sudah dimasukkan dalam arsip.',
        externalLink: 'https://drive.google.com/drive/folders/completed-collab-4'
      }
    ],
    
    revisions: [],
    
    activityLogs: [
      {
        id: 'log-401',
        senderRole: 'system',
        senderName: 'Creatorin Escrow',
        action: 'Pembayaran Dikonfirmasi ke Escrow',
        timestamp: '15 Sep 2026, 09:00 WIB',
        type: 'escrow_locked'
      },
      {
        id: 'log-402',
        senderRole: 'business',
        senderName: 'Dimas Wicaksono',
        action: 'Hasil Disetujui & Approve Akhir',
        timestamp: '20 Sep 2026, 14:10 WIB',
        type: 'approved'
      },
      {
        id: 'log-403',
        senderRole: 'system',
        senderName: 'Creatorin Escrow',
        action: 'Dana Escrow Sebesar Rp1.800.000 Dicairkan ke Rekening Amanda Larasati',
        timestamp: '20 Sep 2026, 14:11 WIB',
        type: 'approved'
      },
      {
        id: 'log-404',
        senderRole: 'system',
        senderName: 'Creatorin Portofolio',
        action: 'Proyek Kolaborasi Otomatis Terbit di Profil UMKM & Profil Kreator',
        timestamp: '20 Sep 2026, 14:12 WIB',
        type: 'rated'
      },
      {
        id: 'log-405',
        senderRole: 'business',
        senderName: 'Dimas Wicaksono',
        action: 'Memberikan Rating & Testimoni Bintang 5',
        detail: 'Foto sangat tajam, pencahayaan alami memperkuat estetika cafe kami. Sangat direkomendasikan!',
        timestamp: '20 Sep 2026, 14:15 WIB',
        type: 'rated'
      }
    ],
    
    rating: {
      score: 5,
      aspects: {
        quality: 5,
        communication: 5,
        speed: 5
      },
      reviewText: 'Foto sangat tajam, pencahayaan alami memperkuat estetika cafe kami. Sangat direkomendasikan!',
      tags: ['Sangat Profesional', 'Tepat Waktu', 'Hasil Sesuai Brief'],
      submittedAt: '20 September 2026'
    }
  },
  {
    id: 'collab-room-1',
    roomCode: 'CR-2026-042',
    projectTitle: 'Video Reels & TikTok UGC: Sensasi Cold Brew Senja Botol 250ml',
    category: 'Reels Instagram & TikTok',
    budgetFormatted: 'Rp1.500.000',
    budgetAmount: 1500000,
    escrowStatus: 'held_in_escrow',
    invoiceNumber: 'INV/2026/09/CRT-882194',
    invoicePaidDate: '10 September 2026',
    thumbnail: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=240&auto=format&fit=crop&q=80',
    
    creatorId: 'c-munir',
    creatorName: 'Sobakhul Munir Siroj',
    creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Product Designer & Video Specialist',
    creatorRating: 4.95,
    
    businessName: 'Dimas Wicaksono',
    businessBrand: 'Kopi Kenangan Senja',
    businessAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=240&auto=format&fit=crop&q=80',
    
    startDate: '10 September 2026',
    deadlineDate: '18 September 2026',
    daysRemaining: 4,
    
    currentStage: 'review',
    progressPercent: 65,
    
    briefDetails: {
      summary: 'Pembuatan 1 video UGC Reels/TikTok berdurasi 25-30 detik menonjolkan sensasi kesegaran biji kopi arabika Ijen dalam botol kemasan baru siap minum (RTD).',
      requirements: [
        'Konsep estetik warm natural cafe lighting',
        'Hook 3 detik pertama: Suara crack membuka tutup botol & slow motion pouring kopi ke gelas berisi es batu',
        'Tone & color grading warm amber senja khas brand',
        'Menyertakan Call To Action (CTA) ke link bio Shopee / Gofood',
        'Format vertikal 9:16 resolusi 4K / 1080p 60fps'
      ],
      brandAssets: [
        { name: 'Brand_Guideline_KopiKenanganSenja.pdf', size: '4.2 MB' },
        { name: 'Vector_Logo_KKS_Gold.svg', size: '320 KB' },
        { name: 'Audio_Jingle_Senja_Acoustic.wav', size: '1.8 MB' }
      ]
    },
    
    deliverables: [
      {
        id: 'deliv-v1',
        version: 1,
        title: 'Draft Final v1 - Reels Pouring Cold Brew Senja (9:16)',
        type: 'video',
        url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1200&auto=format&fit=crop&q=80',
        previewThumbnail: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
        uploadedAt: 'Hari ini, 10:45 WIB',
        filesize: '48.5 MB',
        creatorNote: 'Halo mas Dimas! Draft video Reels v1 sudah selesai saya rekam & edit. Sound pouring ice-nya jernih banget, hook di detik awal sangat punchy. Silakan ditinjau mas!',
        externalLink: 'https://drive.google.com/file/d/example-reels-v1'
      }
    ],
    
    revisions: [],
    
    activityLogs: [
      {
        id: 'log-1',
        senderRole: 'system',
        senderName: 'Creatorin Escrow',
        action: 'Pembayaran Dikonfirmasi & Dana Masuk ke Rekening Escrow',
        detail: 'UMKM Dimas Wicaksono telah melunasi invoice INV/2026/09/CRT-882194 sebesar Rp1.500.000. Dana diamankan secara otomatis di Rekening Bersama Escrow.',
        timestamp: '10 Sep 2026, 09:15 WIB',
        type: 'escrow_locked'
      },
      {
        id: 'log-2',
        senderRole: 'system',
        senderName: 'Creatorin System',
        action: 'Collaboration Room Resmi Dibuat',
        detail: 'Room CR-2026-042 otomatis diinisiasi untuk Kopi Kenangan Senja dan Sobakhul Munir Siroj.',
        timestamp: '10 Sep 2026, 09:16 WIB',
        type: 'brief_confirmed'
      },
      {
        id: 'log-3',
        senderRole: 'business',
        senderName: 'Dimas Wicaksono',
        action: 'Brief Disetujui & Kickoff Dimulai',
        detail: 'Brief detail dan aset visual brand telah disepakati bersama.',
        timestamp: '10 Sep 2026, 10:00 WIB',
        type: 'brief_confirmed'
      },
      {
        id: 'log-4',
        senderRole: 'creator',
        senderName: 'Sobakhul Munir Siroj',
        action: 'Memulai Pengerjaan & Shooting Konten',
        detail: 'Kreator mulai menyiapkan properti shooting, es batu kristal, dan kamera 4K.',
        timestamp: '10 Sep 2026, 13:30 WIB'
      },
      {
        id: 'log-5',
        senderRole: 'creator',
        senderName: 'Sobakhul Munir Siroj',
        action: 'Mengunggah Draft Deliverable v1',
        detail: 'Draft video 9:16 berdurasi 28 detik diunggah untuk direview oleh pihak UMKM.',
        timestamp: 'Hari ini, 10:45 WIB',
        type: 'draft_submitted'
      }
    ]
  },
  {
    id: 'collab-room-3',
    roomCode: 'CR-2026-045',
    projectTitle: 'Kampanye Poster Digital Promo Ramadhan Hemat 2026',
    category: 'Poster & Banner Digital',
    budgetFormatted: 'Rp950.000',
    budgetAmount: 950000,
    escrowStatus: 'held_in_escrow',
    invoiceNumber: 'INV/2026/09/CRT-994110',
    invoicePaidDate: '5 September 2026',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    
    creatorId: 'c1',
    creatorName: 'Rian Pratama',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Creative Visual Designer',
    creatorRating: 4.88,
    
    businessName: 'Dimas Wicaksono',
    businessBrand: 'Kopi Kenangan Senja',
    businessAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=240&auto=format&fit=crop&q=80',
    
    startDate: '5 September 2026',
    deadlineDate: '15 September 2026',
    daysRemaining: 2,
    
    currentStage: 'brief',
    progressPercent: 15,
    
    briefDetails: {
      summary: 'Poster promosi digital paket hampers kopi botol & cookies kurma untuk kampanye Ramadhan & Idul Fitri.',
      requirements: [
        'Nuansa islami modern tanpa terkesan kaku',
        'Ukuran square (1080x1080) dan story (1080x1920)',
        'Copywriting promo headline: Buka Puasa Lebih Hangat'
      ],
      brandAssets: [
        { name: 'KopiKenanganSenja_Assets.zip', size: '14.5 MB' }
      ]
    },
    
    deliverables: [],
    revisions: [],
    
    activityLogs: [
      {
        id: 'log-301',
        senderRole: 'system',
        senderName: 'Creatorin Escrow',
        action: 'Pembayaran Dikonfirmasi & Dana Masuk ke Rekening Escrow',
        detail: 'UMKM telah melunasi invoice sebesar Rp950.000 melalui QRIS Instan.',
        timestamp: '5 Sep 2026, 16:30 WIB',
        type: 'escrow_locked'
      },
      {
        id: 'log-302',
        senderRole: 'system',
        senderName: 'Creatorin System',
        action: 'Collaboration Room Dibuka Otomatis',
        detail: 'Rian Pratama telah menerima notifikasi kickoff proyek.',
        timestamp: '5 Sep 2026, 16:31 WIB',
        type: 'brief_confirmed'
      }
    ]
  },
  {
    id: 'collab-room-2',
    roomCode: 'CR-2026-039',
    projectTitle: 'Redesain Label Kemasan Kopi Drip Bag Artisan Nusantara',
    category: 'Packaging & Desain Grafis',
    budgetFormatted: 'Rp1.200.000',
    budgetAmount: 1200000,
    escrowStatus: 'held_in_escrow',
    invoiceNumber: 'INV/2026/09/CRT-773102',
    invoicePaidDate: '1 September 2026',
    thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=240&auto=format&fit=crop&q=80',
    
    creatorId: 'c2',
    creatorName: 'Nusantara Pack',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Brand & Packaging Specialist',
    creatorRating: 4.92,
    
    businessName: 'Dimas Wicaksono',
    businessBrand: 'Kopi Kenangan Senja',
    businessAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=240&auto=format&fit=crop&q=80',
    
    startDate: '1 September 2026',
    deadlineDate: '10 September 2026',
    daysRemaining: 6,
    
    currentStage: 'in_progress',
    progressPercent: 35,
    
    briefDetails: {
      summary: 'Peremajaan visual kemasan foil drip bag 12gr dengan ilustrasi peta kontur perkebunan kopi Ijen dan sertifikasi halal MUI.',
      requirements: [
        'Ukuran kemasan sachet 10x12.5cm',
        'Ilustrasi minimalis bernuansa kontur tanah & lereng gunung',
        'Format cetak CMYK Pantone, siap kirim ke percetakan',
        'Termasuk mockup 3D photorealistic'
      ],
      brandAssets: [
        { name: 'Label_Current_Old.png', size: '2.1 MB' },
        { name: 'Legalitas_Halal_BPOM.pdf', size: '1.1 MB' }
      ]
    },
    
    deliverables: [],
    revisions: [],
    
    activityLogs: [
      {
        id: 'log-201',
        senderRole: 'system',
        senderName: 'Creatorin Escrow',
        action: 'Pembayaran Dikonfirmasi & Dana Masuk ke Rekening Escrow',
        detail: 'UMKM telah melunasi Rp1.200.000 via BCA Virtual Account.',
        timestamp: '1 Sep 2026, 14:00 WIB',
        type: 'escrow_locked'
      },
      {
        id: 'log-202',
        senderRole: 'business',
        senderName: 'Dimas Wicaksono',
        action: 'Brief & Moodboard Disepakati',
        detail: 'Dimas mengonfirmasi ukuran sachet dan kode warna emas yang diinginkan.',
        timestamp: '1 Sep 2026, 15:20 WIB',
        type: 'brief_confirmed'
      },
      {
        id: 'log-203',
        senderRole: 'creator',
        senderName: 'Nusantara Pack',
        action: 'Pengerjaan Sketsa & Konsep Visual',
        detail: 'Nusantara Pack sedang menyelesaikan 3 opsi alternatif tata letak ilustrasi kontur.',
        timestamp: '2 Sep 2026, 11:00 WIB'
      }
    ]
  }
];
