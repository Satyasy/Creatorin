export interface TimelineItem {
  task: string;
  statedDeadline: string;
  assignee: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'unknown';
  certainty: 'confirmed' | 'unconfirmed';
  sourceQuote: string;
}

export interface StructuredSummaryData {
  executiveSummary: string;
  agreements: string[];
  actionItems: { task: string; assignee: string; status: 'pending' | 'in_progress' | 'completed' }[];
  lastRevisionNotes?: string;
  scope: string[];
  confirmedAgreements: string[];
  proposals: string[];
  timeline: TimelineItem[];
  creatorResponsibilities: string[];
  umkmResponsibilities: string[];
  openQuestions: string[];
  risksAndConflicts: string[];
  missingInformation: string[];
  isOutdated: boolean;
  modelUsed: string;
  generatedAt: string;
  sourceMessageRange?: { count: number; firstAt?: string; lastAt?: string };
}

/**
 * Deteksi dan klasifikasi format deliverable yang valid dalam percakapan.
 */
export function extractScope(allText: string, projectTitle?: string): string[] {
  const deliverableKeywords = [
    { key: /(?:reels|instagram\s*reels)/i, label: 'Video Instagram Reels' },
    { key: /(?:tiktok|video\s*tiktok)/i, label: 'Video TikTok' },
    { key: /(?:logo|brand\s*identity|identitas\s*brand)/i, label: 'Desain Logo & Identitas Brand' },
    { key: /(?:feed|carousel|postingan\s*ig)/i, label: 'Desain Feed / Carousel Instagram' },
    { key: /(?:foto\s*produk|photoshoot|fotografi)/i, label: 'Foto Produk Komersial' },
    { key: /(?:packaging|kemasan|label\s*produk)/i, label: 'Desain Kemasan & Label Produk' },
    { key: /(?:banner|poster|baliho)/i, label: 'Desain Banner & Media Promosi' },
    { key: /(?:ui\/ux|figma|desain\s*aplikasi|landing\s*page)/i, label: 'Desain UI/UX & Prototipe Web/App' },
    { key: /(?:storyboard|naskah|script\s*video)/i, label: 'Naskah Script & Storyboard' },
  ];

  const detected = deliverableKeywords
    .filter(d => d.key.test(allText))
    .map(d => d.label);

  if (detected.length === 0 && projectTitle && projectTitle !== 'Diskusi Kolaborasi') {
    detected.push(`Fokus deliverable: ${projectTitle}`);
  }

  return detected;
}

/**
 * Mesin Ekstraksi Semantik Berbasis Percakapan Faktual (Zero-Hallucination)
 */
export function extractStructuredFacts(
  messages: Array<{ sender: string; text: string; time?: string; role?: string }>,
  projectTitle: string = 'Diskusi Kolaborasi Proyek',
  creatorName: string = 'Kreator',
  businessBrand: string = 'UMKM Brand',
  modelExecutiveSummary?: string | null
): StructuredSummaryData {
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  if (!messages || messages.length === 0) {
    return {
      executiveSummary: 'Percakapan baru dibuka. Belum ada materi atau rincian pekerjaan yang dibahas.',
      agreements: [],
      actionItems: [
        {
          task: 'Mulai obrolan untuk mendiskusikan kebutuhan proyek dan deliverable',
          assignee: `${creatorName} & ${businessBrand}`,
          status: 'pending',
        },
      ],
      lastRevisionNotes: undefined,
      scope: projectTitle ? [projectTitle] : [],
      confirmedAgreements: [],
      proposals: [],
      timeline: [],
      creatorResponsibilities: [],
      umkmResponsibilities: [],
      openQuestions: [],
      risksAndConflicts: [],
      missingInformation: [
        'Belum ada informasi deliverable yang dibahas',
        'Belum ada kesepakatan harga atau anggaran',
        'Belum ada penetapan deadline pekerjaan',
      ],
      isOutdated: false,
      modelUsed: 'Hugging Face Transformers.js (distilbart-cnn-6-6 ONNX) + Semantic Fact Engine',
      generatedAt: currentTime,
      sourceMessageRange: { count: 0 },
    };
  }

  const allText = messages.map(m => m.text).join(' \n ');
  const scope = extractScope(allText, projectTitle);

  const confirmedAgreements: string[] = [];
  const proposals: string[] = [];
  const timeline: TimelineItem[] = [];
  const creatorResponsibilities: string[] = [];
  const umkmResponsibilities: string[] = [];
  const openQuestions: string[] = [];
  const actionItems: { task: string; assignee: string; status: 'pending' | 'in_progress' | 'completed' }[] = [];
  const risksAndConflicts: string[] = [];
  const missingInformation: string[] = [];

  // 1. Deteksi Kesepakatan Anggaran & Biaya
  const priceMatches = allText.match(/(?:Rp\s*[\d\.,]+|\b\d+(?:[\.,]\d+)?\s*(?:juta|jt|ribu|k)\b)/gi);
  const agreementSignals = /(?:sepakat|deal|setuju|oke\s*(?:kak|ya|mas|deal)|siap\s*(?:kak|mas|laksanakan)|baik\s*kami\s*setuju)/i;
  const proposalSignals = /(?:bagaimana\s*kalau|usul|mungkin\s*bisa|bisa\s*nggak\s*kalau|tawaran|opsi|kira-kira|apakah\s*bisa)/i;

  let hasPriceAgreement = false;
  if (priceMatches && priceMatches.length > 0) {
    const latestPrice = priceMatches[priceMatches.length - 1].trim();
    // Cari apakah ada pesan yang mengonfirmasi harga ini
    const priceMsgIdx = messages.findIndex(m => m.text.includes(latestPrice));
    const isAgreedAfter = messages.slice(priceMsgIdx).some(m => agreementSignals.test(m.text));

    if (isAgreedAfter) {
      confirmedAgreements.push(`Biaya yang disepakati: ${latestPrice}`);
      hasPriceAgreement = true;
    } else {
      proposals.push(`Usulan biaya yang diajukan: ${latestPrice} (belum ada konfirmasi resmi kedua pihak)`);
    }
  }

  // 2. Deteksi Deliverable yang Disepakati vs Usulan Sepihak
  const deliverableKeywords = [
    { key: /(?:reels|instagram\s*reels)/i, label: 'Video Instagram Reels' },
    { key: /(?:tiktok|video\s*tiktok)/i, label: 'Video TikTok' },
    { key: /(?:logo|brand\s*identity|identitas\s*brand)/i, label: 'Desain Logo & Identitas Brand' },
    { key: /(?:feed|carousel|postingan\s*ig)/i, label: 'Desain Feed / Carousel Instagram' },
    { key: /(?:foto\s*produk|photoshoot|fotografi)/i, label: 'Foto Produk Komersial' },
    { key: /(?:packaging|kemasan|label\s*produk)/i, label: 'Desain Kemasan & Label Produk' },
    { key: /(?:banner|poster|baliho)/i, label: 'Desain Banner & Media Promosi' },
    { key: /(?:ui\/ux|figma|desain\s*aplikasi|landing\s*page)/i, label: 'Desain UI/UX & Prototipe Web/App' },
    { key: /(?:storyboard|naskah|script\s*video)/i, label: 'Naskah Script & Storyboard' },
  ];

  const agreedDeliverables: string[] = [];
  const proposedDeliverables: string[] = [];

  for (const item of deliverableKeywords) {
    const msgIndices = messages
      .map((m, idx) => ({ idx, text: m.text }))
      .filter(m => item.key.test(m.text));

    if (msgIndices.length === 0) continue;

    const firstMsg = msgIndices[0];
    const isProposalMsg = proposalSignals.test(firstMsg.text);
    const subsequentMessages = messages.slice(firstMsg.idx + 1);
    const isAgreedAfter = subsequentMessages.some(m => agreementSignals.test(m.text));

    if (isProposalMsg && !isAgreedAfter) {
      proposedDeliverables.push(item.label);
    } else if (isAgreedAfter || (firstMsg.idx > 0 && agreementSignals.test(firstMsg.text))) {
      agreedDeliverables.push(item.label);
    } else if (messages.some(m => agreementSignals.test(m.text)) && !isProposalMsg) {
      agreedDeliverables.push(item.label);
    } else {
      proposedDeliverables.push(item.label);
    }
  }

  if (agreedDeliverables.length > 0) {
    confirmedAgreements.push(`Deliverable disepakati: ${agreedDeliverables.join(', ')}`);
    creatorResponsibilities.push(`Membuat dan menyelesaikan ${agreedDeliverables.join(', ')} sesuai brief`);
  }
  if (proposedDeliverables.length > 0) {
    proposals.push(`Usulan tambahan deliverable: ${proposedDeliverables.join(', ')} (belum disetujui)`);
  }

  // 3. Deteksi Deadline & Timeline Secara Faktual (Tanpa Halusinasi)
  const deadlineRegex = /(?:deadline|tenggat|target\s*selesai|selesai\s*(?:pada|sebelum|tanggal|hari)?)\s*:?\s*([a-zA-Z0-9\s,\/]{3,35})(?=\.|\n|,|$)/gi;
  let deadlineMatch: RegExpExecArray | null;

  while ((deadlineMatch = deadlineRegex.exec(allText)) !== null) {
    const rawTime = deadlineMatch[1].trim();
    // Validasi agar tidak menangkap kata-kata umum non-waktu
    if (rawTime.length >= 3 && !/^(?:ya|kak|mas|baik|oke|deh|saja)$/i.test(rawTime)) {
      const matchMsg = messages.find(m => m.text.includes(deadlineMatch![0])) || messages[0];
      const isAgreed = messages.some(m => agreementSignals.test(m.text));

      timeline.push({
        task: `Penyelesaian deliverable utama (${scope[0] || projectTitle})`,
        statedDeadline: rawTime,
        assignee: creatorName,
        status: 'in_progress',
        certainty: isAgreed ? 'confirmed' : 'unconfirmed',
        sourceQuote: `"${matchMsg.text.slice(0, 100)}" (${matchMsg.sender})`,
      });

      if (isAgreed) {
        confirmedAgreements.push(`Target penyelesaian: ${rawTime}`);
      } else {
        proposals.push(`Usulan target waktu: ${rawTime} (perlu konfirmasi kepastian)`);
      }
      break; // Ambil target waktu utama terjelas
    }
  }

  // 4. Deteksi Catatan Revisi & Feedback Aktual
  let lastRevisionNotes: string | undefined = undefined;
  const revisionMessages = messages.filter(m => /revisi|perbaiki|ubah|ganti|tambah|kurang|catatan|kurang pas|koreksi|feedback/i.test(m.text));
  if (revisionMessages.length > 0) {
    const lastRev = revisionMessages[revisionMessages.length - 1];
    lastRevisionNotes = `"${lastRev.text.trim()}" (${lastRev.sender})`;
    risksAndConflicts.push(`Terdapat catatan penyesuaian aktif dari ${lastRev.sender}`);
    actionItems.push({
      task: `Lakukan penyesuaian deliverable sesuai catatan revisi`,
      assignee: creatorName,
      status: 'in_progress',
    });
    actionItems.push({
      task: `Tinjau hasil revisi di ruang obrolan / kolaborasi`,
      assignee: businessBrand,
      status: 'pending',
    });
  }

  // 5. Tanggung Jawab Creator & UMKM
  const hasAssetMention = /(?:kirim|sediakan|berikan)\s*(?:produk|foto|materi|brief|aset|sampel|logo)/i.test(allText);
  if (hasAssetMention) {
    umkmResponsibilities.push(`Menyediakan materi/produk/brief yang dibutuhkan kepada ${creatorName}`);
  }

  const hasPaymentMention = /(?:invoice|dp|pembayaran|escrow|bayar|transfer)/i.test(allText);
  if (hasPaymentMention) {
    umkmResponsibilities.push(`Melakukan pembayaran/DP melalui Escrow resmi Creatorin`);
  }

  if (creatorResponsibilities.length === 0) {
    creatorResponsibilities.push(`Mengerjakan deliverable yang disepakati sesuai spesifikasi teknis`);
  }
  if (umkmResponsibilities.length === 0) {
    umkmResponsibilities.push(`Memberikan umpan balik (feedback) dan menyetujui hasil pengerjaan`);
  }

  // 6. Deteksi Pertanyaan Terbuka yang Belum Terjawab
  messages.forEach((m, idx) => {
    // Pesan yang memuat tanda tanya atau kata tanya
    if (/\?|apakah|bagaimana|kapan|bisa tolong|berapa/i.test(m.text)) {
      // Periksa apakah pesan berikutnya dari lawan bicara menjawab pertanyaan
      const nextMessages = messages.slice(idx + 1);
      const isFromPartner = nextMessages.some(next => next.sender !== m.sender);
      const isQuestionShort = m.text.trim().length <= 150;

      if (!isFromPartner && isQuestionShort) {
        openQuestions.push(`"${m.text.trim()}" (Ditanyakan oleh ${m.sender})`);
      } else if (idx === messages.length - 1 && isQuestionShort) {
        // Pertanyaan terakhir di percakapan yang belum dijawab
        openQuestions.push(`"${m.text.trim()}" (Menunggu jawaban dari lawan bicara)`);
      }
    }
  });

  // 7. Deteksi Informasi Penting yang Belum Dibahas (Missing Information)
  if (timeline.length === 0) {
    missingInformation.push('Tenggat waktu pengerjaan (deadline) belum ditentukan');
  }
  if (!hasPriceAgreement && (!priceMatches || priceMatches.length === 0)) {
    missingInformation.push('Estimasi biaya atau anggaran proyek belum dibahas');
  }
  if (!/revisi/i.test(allText)) {
    missingInformation.push('Batas maksimal revisi belum disepakati secara eksplisit');
  }

  // 8. Action Items Pokok
  if (actionItems.length === 0) {
    if (hasPriceAgreement && !hasPaymentMention) {
      actionItems.push({
        task: `Buat dan konfirmasi Invoice Escrow untuk mengunci kesepakatan`,
        assignee: creatorName,
        status: 'pending',
      });
      actionItems.push({
        task: `Selesaikan pembayaran DP di sistem untuk memulai pengerjaan`,
        assignee: businessBrand,
        status: 'pending',
      });
    } else {
      actionItems.push({
        task: `Lanjutkan pengerjaan deliverable sesuai arahan`,
        assignee: creatorName,
        status: 'in_progress',
      });
      actionItems.push({
        task: `Tinjau progres berkala di ruang obrolan`,
        assignee: businessBrand,
        status: 'pending',
      });
    }
  }

  // 9. Format Ringkasan Eksekutif
  // Gunakan output model Hugging Face jika tersedia, jika tidak formulasikan secara faktual
  let executiveSummary = modelExecutiveSummary;
  if (!executiveSummary) {
    if (lastRevisionNotes) {
      executiveSummary = `Kolaborasi proyek "${projectTitle}" antara ${businessBrand} dan ${creatorName} sedang dalam tahap penyesuaian berdasarkan catatan revisi terbaru.`;
    } else if (confirmedAgreements.length > 0) {
      executiveSummary = `Diskusi proyek "${projectTitle}" telah menghasilkan kesepakatan mengenai ${confirmedAgreements.slice(0, 2).join(' serta ')}. Pengerjaan dapat dilanjutkan sesuai timeline.`;
    } else {
      executiveSummary = `Diskusi proyek "${projectTitle}" sedang berlangsung antara ${businessBrand} dan ${creatorName}. Rincian teknis dan kesepakatan final sedang dimatangkan.`;
    }
  }

  return {
    executiveSummary,
    agreements: confirmedAgreements.length > 0 ? confirmedAgreements : proposals,
    actionItems,
    lastRevisionNotes,
    scope,
    confirmedAgreements,
    proposals,
    timeline,
    creatorResponsibilities,
    umkmResponsibilities,
    openQuestions: openQuestions.slice(0, 3),
    risksAndConflicts,
    missingInformation,
    isOutdated: false,
    modelUsed: 'Hugging Face Transformers.js (distilbart-cnn-6-6 ONNX) + Semantic Fact Engine',
    generatedAt: currentTime,
    sourceMessageRange: {
      count: messages.length,
      firstAt: messages[0]?.time,
      lastAt: messages[messages.length - 1]?.time,
    },
  };
}
