import { pipeline } from '@huggingface/transformers';

let summarizerPipeline: any = null;
let isInitializing = false;

/**
 * Singleton loader for local Xenova/distilbart-cnn-6-6 summarizer model (~160MB ONNX q8)
 */
async function getSummarizerPipeline() {
  if (!summarizerPipeline && !isInitializing) {
    isInitializing = true;
    try {
      summarizerPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
        dtype: 'q8',
      });
    } catch (err) {
      console.warn('Failed to load local summarizer pipeline:', err);
    } finally {
      isInitializing = false;
    }
  }
  return summarizerPipeline;
}

/**
 * Menghasilkan ringkasan teks menggunakan model lokal Transformers.js
 */
export async function generateLocalSummary(text: string, maxTokens: number = 80): Promise<string | null> {
  try {
    const summarizer = await getSummarizerPipeline();
    if (!summarizer) return null;

    const output = await summarizer(text, {
      max_new_tokens: maxTokens,
      min_length: 25,
      do_sample: false,
    });

    if (Array.isArray(output) && output[0]?.summary_text) {
      return output[0].summary_text.trim();
    }
  } catch (err) {
    console.warn('Local summarization inference failed:', err);
  }
  return null;
}
