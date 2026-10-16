import { pipeline, env } from '@huggingface/transformers';

// Set cache directory to shared node_modules cache or system default
env.cacheDir = '/var/www/creatorin/shared/node_modules/@huggingface/transformers/.cache';

let summarizerPipeline: any = null;
let initPromise: Promise<any> | null = null;
let activeInferenceCount = 0;
const MAX_CONCURRENT_INFERENCES = 2;

/**
 * Singleton loader for local Xenova/distilbart-cnn-6-6 summarizer model (~160MB ONNX q8)
 * Model is loaded once into memory and reused across all requests.
 */
export async function getSummarizerPipeline() {
  if (summarizerPipeline) return summarizerPipeline;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('⚡ [AI Summarizer] Initializing local Hugging Face ONNX summarizer pipeline...');
      const pipe = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
        dtype: 'q8',
      });
      summarizerPipeline = pipe;
      console.log('✅ [AI Summarizer] Local pipeline ready in memory.');
      return pipe;
    } catch (err) {
      console.error('❌ [AI Summarizer] Failed to load local summarizer pipeline:', err);
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Sanitasi teks percakapan untuk melindungi dari prompt injection atau instruksi palsu.
 */
export function sanitizeTranscript(text: string): string {
  return text
    .replace(/(?:abaikan|ignore)\s+(?:semua|instruksi|system).*$/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Hierarchical chunking: jika percakapan sangat panjang, pecah menjadi potongan-potongan terstruktur
 * dengan mempertahankan pesan pembuka (tujuan proyek), pesan tengah (negosiasi), dan pesan terbaru (status revisi).
 */
export function chunkConversationMessages(
  messages: Array<{ sender: string; text: string; time?: string; role?: string }>,
  maxCharsPerChunk: number = 900
): string[] {
  if (messages.length === 0) return [];

  const formattedLines = messages.map(m => {
    const cleanText = sanitizeTranscript(m.text);
    return `${m.sender}: ${cleanText}`;
  });

  const fullText = formattedLines.join(' \n ');
  if (fullText.length <= maxCharsPerChunk) {
    return [fullText];
  }

  // Anchor Strategy:
  // 1. Ambil 3 pesan pertama (tujuan/scope awal)
  // 2. Ambil pesan tengah yang relevan dengan kesepakatan/harga/deadline
  // 3. Ambil 4 pesan terakhir (status revisi / kesepakatan terbaru)
  const firstBatch = formattedLines.slice(0, 3);
  const lastBatch = formattedLines.slice(-4);
  const middleCandidates = formattedLines.slice(3, -4);

  const middleImportant = middleCandidates.filter(line => 
    /(?:harga|biaya|rp|juta|ribu|deadline|tenggat|sepakat|setuju|revisi|selesai|dp|invoice|draft)/i.test(line)
  );

  const combined = [...firstBatch, ...middleImportant, ...lastBatch];
  const joinedCombined = combined.join(' \n ');

  if (joinedCombined.length <= maxCharsPerChunk) {
    return [joinedCombined];
  }

  // Jika masih panjang, pecah menjadi 2 chunk
  const half = Math.ceil(combined.length / 2);
  return [
    combined.slice(0, half).join(' \n '),
    combined.slice(half).join(' \n ')
  ];
}

/**
 * Menghasilkan ringkasan naratif eksekutif menggunakan model lokal Transformers.js
 * dengan proteksi timeout dan batas concurrency.
 */
export async function generateLocalSummary(
  text: string,
  maxTokens: number = 80,
  timeoutMs: number = 15000
): Promise<string | null> {
  const cleanInput = sanitizeTranscript(text);
  if (!cleanInput || cleanInput.length < 15) {
    return null;
  }

  // Concurrency guard
  if (activeInferenceCount >= MAX_CONCURRENT_INFERENCES) {
    console.warn('[AI Summarizer] Concurrency limit reached, awaiting capacity...');
    await new Promise(r => setTimeout(r, 800));
  }

  activeInferenceCount++;

  try {
    const summarizer = await getSummarizerPipeline();
    if (!summarizer) return null;

    // Timeout wrapper
    const inferencePromise = (async () => {
      const output = await summarizer(cleanInput, {
        max_new_tokens: maxTokens,
        min_length: 15,
        do_sample: false,
      });

      if (Array.isArray(output) && output[0]?.summary_text) {
        return output[0].summary_text.trim();
      }
      return null;
    })();

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Inference timeout')), timeoutMs)
    );

    return await Promise.race([inferencePromise, timeoutPromise]);
  } catch (err: any) {
    console.warn('[AI Summarizer] Local summarization inference notice:', err?.message || err);
    return null;
  } finally {
    activeInferenceCount = Math.max(0, activeInferenceCount - 1);
  }
}
