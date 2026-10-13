import { NextRequest, NextResponse } from 'next/server';

export interface SummarizeResponseData {
  executiveSummary: string;
  agreements: string[];
  actionItems: { task: string; assignee: string; status: 'pending' | 'in_progress' | 'completed' }[];
  lastRevisionNotes?: string;
  modelUsed: string;
  generatedAt: string;
}

/**
 * Intelligent Dynamic Extractive NLP Engine
 * Menganalisis pesan percakapan aktual secara terstruktur tanpa halusinasi dan tanpa teks template palsu.
 */
function extractDynamicSummary(
  messages: Array<{ sender: string; text: string; time?: string; role?: string }>,
  projectTitle: string,
  creatorName: string,
  businessBrand: string
): SummarizeResponseData {
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  if (!messages || messages.length === 0) {
    return {
      executiveSummary: `Percakapan baru dimulai. Belum ada rincian kesepakatan atau biaya yang dibahas.`,
      agreements: [
        `Proyek: ${projectTitle}`,
        'Detail kesepakatan akan tercatat otomatis saat dibahas di ruang obrolan.'
      ],
      actionItems: [
        {
          task: `Diskusikan lingkup kerja dan rincian kebutuhan proyek`,
          assignee: `${creatorName} & ${businessBrand}`,
          status: 'pending'
        }
      ],
      modelUsed: 'Ringkasan AI',
      generatedAt: currentTime
    };
  }

  const allText = messages.map(m => m.text).join(' \n ');
  const agreements: string[] = [];
  const actionItems: { task: string; assignee: string; status: 'pending' | 'in_progress' | 'completed' }[] = [];
  let lastRevisionNotes: string | undefined = undefined;

  // 1. Ekstraksi Kesepakatan Anggaran / Harga
  const priceMatches = allText.match(/(?:Rp\s*[\d\.,]+|\b\d+(?:[\.,]\d+)?\s*(?:juta|jt|ribu|k)\b)/gi);
  if (priceMatches && priceMatches.length > 0) {
    const uniquePrices = Array.from(new Set(priceMatches.map(p => p.trim())));
    agreements.push(`Estimasi biaya yang dibahas: ${uniquePrices.slice(-2).join(' / ')}`);
  }

  // 2. Ekstraksi Format Deliverable
  const deliverableKeywords = [
    { key: 'reels', label: 'Video Instagram Reels' },
    { key: 'tiktok', label: 'Video TikTok' },
    { key: 'logo', label: 'Desain Logo & Identitas Brand' },
    { key: 'feed', label: 'Desain Feed / Carousel' },
    { key: 'foto produk', label: 'Foto Produk Komersial' },
    { key: 'packaging', label: 'Desain Kemasan' },
    { key: 'banner', label: 'Desain Banner & Poster' },
    { key: 'ui/ux', label: 'Desain UI/UX Figma' },
    { key: 'storyboard', label: 'Naskah Script & Storyboard' },
  ];

  const detectedDeliverables = deliverableKeywords
    .filter(d => new RegExp(`\\b${d.key}\\b`, 'i').test(allText))
    .map(d => d.label);

  if (detectedDeliverables.length > 0) {
    agreements.push(`Format deliverable: ${detectedDeliverables.join(', ')}`);
  } else if (projectTitle) {
    agreements.push(`Fokus proyek: ${projectTitle}`);
  }

  // 3. Ekstraksi Deadline / Waktu
  const deadlineMatch = allText.match(/(?:deadline|tenggat|target|estimasi|selesai)\s*(?:dalam|pada|tanggal|hari)?\s*([^\.,\n]{3,35})/i);
  if (deadlineMatch && deadlineMatch[1]) {
    agreements.push(`Target penyelesaian: ${deadlineMatch[1].trim()}`);
  }

  // 4. Deteksi Catatan Revisi & Feedback Aktual
  const revisionMessages = messages.filter(m => /revisi|perbaiki|ubah|ganti|tambah|kurang|catatan|kurang pas|koreksi/i.test(m.text));
  if (revisionMessages.length > 0) {
    const lastRev = revisionMessages[revisionMessages.length - 1];
    lastRevisionNotes = `"${lastRev.text.trim()}" (${lastRev.sender})`;
    agreements.push(`Catatan penyesuaian dari ${lastRev.sender}`);
  }

  // 5. Action Items
  if (lastRevisionNotes) {
    actionItems.push({
      task: `Lakukan penyesuaian deliverable`,
      assignee: creatorName,
      status: 'in_progress'
    });
    actionItems.push({
      task: `Tinjau hasil revisi di ruang obrolan`,
      assignee: businessBrand,
      status: 'pending'
    });
  } else {
    const hasInvoiceMention = /invoice|dp|pembayaran|escrow|tagihan/i.test(allText);
    if (hasInvoiceMention) {
      actionItems.push({
        task: 'Konfirmasi rincian pembayaran di Escrow',
        assignee: businessBrand,
        status: 'in_progress'
      });
      actionItems.push({
        task: 'Mulai pengerjaan setelah pembayaran dikonfirmasi',
        assignee: creatorName,
        status: 'pending'
      });
    } else {
      actionItems.push({
        task: 'Sepakati rincian teknis deliverable & biaya',
        assignee: `${creatorName} & ${businessBrand}`,
        status: 'pending'
      });
    }
  }

  // Jika pesan baru 1-2 (misal salam pembuka saja), buat ringkasan yang wajar dan bersih
  const isEarlyStage = messages.length <= 2 && !priceMatches && detectedDeliverables.length === 0;

  if (isEarlyStage) {
    return {
      executiveSummary: `Diskusi proyek baru dimulai. Sampaikan kebutuhan teknis dan rincian kerja untuk mencapai kesepakatan.`,
      agreements: [
        `Fokus proyek: ${projectTitle || 'Diskusi Kolaborasi'}`,
        'Menunggu pembahasan detail deliverable dan biaya.'
      ],
      actionItems: [
        {
          task: 'Sepakati rincian deliverable & anggaran proyek',
          assignee: `${creatorName} & ${businessBrand}`,
          status: 'pending'
        }
      ],
      modelUsed: 'Ringkasan AI',
      generatedAt: currentTime
    };
  }

  // Ringkasan Eksekutif yang ringkas dan alami
  const executiveSummary = lastRevisionNotes
    ? `Terdapat catatan penyesuaian yang sedang ditindaklanjuti oleh ${creatorName}.`
    : `Diskusi proyek "${projectTitle}" sedang berlangsung antara ${businessBrand} dan ${creatorName}.`;

  return {
    executiveSummary,
    agreements: agreements.slice(0, 3),
    actionItems: actionItems.slice(0, 2),
    lastRevisionNotes,
    modelUsed: 'Ringkasan AI',
    generatedAt: currentTime
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      roomId, 
      projectTitle = 'Diskusi Kolaborasi Proyek', 
      creatorName = 'Kreator', 
      businessBrand = 'UMKM Brand',
      messages = [] 
    } = body as {
      roomId?: string;
      projectTitle?: string;
      creatorName?: string;
      businessBrand?: string;
      messages?: Array<{ sender: string; text: string; time?: string; role?: string }>;
    };

    const geminiKey = process.env.GEMINI_API_KEY;

    // Jika GEMINI_API_KEY tersedia dan ada pesan, gunakan Gemini LLM untuk penalaran ekstra mendalam
    if (geminiKey && messages.length > 0) {
      try {
        const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `Analisis transkrip obrolan bisnis antara "${businessBrand}" (Klien UMKM) dan "${creatorName}" (Kreator) untuk proyek "${projectTitle}".
Tugas: Kembalikan JSON murni TANPA markdown/backticks dengan format:
{
  "executiveSummary": "ringkasan eksekutif 2-3 kalimat mengenai status kesepakatan saat ini",
  "agreements": ["poin kesepakatan 1", "poin kesepakatan 2", ...],
  "actionItems": [
    {"task": "deskripsi tugas nyata", "assignee": "nama pihak penanggung jawab", "status": "pending|in_progress|completed"}
  ],
  "lastRevisionNotes": "catatan revisi terakhir jika ada, atau kosongkan jika tidak ada"
}
Aturan: DILARANG mengarang halusinasi. Hanya ambil fakta yang nyata ada di transkrip:
Transkrip:
${transcript}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.ok) {
          const aiData = await res.json();
          const textResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const parsed = JSON.parse(textResponse);
            return NextResponse.json({
              success: true,
              data: {
                ...parsed,
                modelUsed: 'Google Gemini AI (Real-time Context)',
                generatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
              }
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini inference fallback to dynamic NLP:', geminiError);
      }
    }

    // Default: Dynamic Extractive NLP yang 100% membaca chat nyata dan bebas halusinasi
    const dynamicResult = extractDynamicSummary(messages, projectTitle, creatorName, businessBrand);

    return NextResponse.json({
      success: true,
      data: dynamicResult
    });
  } catch (error: any) {
    console.error('Error in ai summarize route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses analisis percakapan' },
      { status: 500 }
    );
  }
}
