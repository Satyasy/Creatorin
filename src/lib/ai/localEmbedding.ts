import { pipeline } from '@huggingface/transformers';
import { CREATORIN_KNOWLEDGE_BASE, KnowledgeDocument, searchKnowledgeBase } from '@/data/creatorinKnowledgeBase';

let embeddingPipeline: any = null;
let cachedDocEmbeddings: Array<{ doc: KnowledgeDocument; embedding: Float32Array }> | null = null;
let isInitializing = false;

/**
 * Singleton loader for local all-MiniLM-L6-v2 embedding model (~23MB ONNX q8)
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline && !isInitializing) {
    isInitializing = true;
    try {
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        dtype: 'q8',
      });
    } catch (err) {
      console.warn('Failed to load local embedding pipeline:', err);
    } finally {
      isInitializing = false;
    }
  }
  return embeddingPipeline;
}

/**
 * Hitung cosine similarity antara 2 vektor ternormalisasi (dot product)
 */
export function cosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]): number {
  let dotProduct = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
  }
  return dotProduct;
}

/**
 * Menghasilkan dense vector embedding (384 float32) untuk sebuah teks
 */
export async function getVectorEmbedding(text: string): Promise<Float32Array | null> {
  try {
    const extractor = await getEmbeddingPipeline();
    if (!extractor) return null;
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return output.data as Float32Array;
  } catch (err) {
    console.warn('Vector embedding extraction failed:', err);
    return null;
  }
}

/**
 * Pre-computes or caches embeddings untuk seluruh dokumen Creatorin Knowledge Base
 */
async function ensureDocEmbeddings() {
  if (cachedDocEmbeddings) return cachedDocEmbeddings;

  const extractor = await getEmbeddingPipeline();
  if (!extractor) return null;

  const results: Array<{ doc: KnowledgeDocument; embedding: Float32Array }> = [];
  for (const doc of CREATORIN_KNOWLEDGE_BASE) {
    const docSummary = `${doc.title}. ${doc.keywords.join(', ')}. ${doc.content.slice(0, 300)}`;
    const output = await extractor(docSummary, { pooling: 'mean', normalize: true });
    results.push({
      doc,
      embedding: output.data as Float32Array,
    });
  }

  cachedDocEmbeddings = results;
  return cachedDocEmbeddings;
}

/**
 * Semantic Vector Search berbasis model lokal Xenova/all-MiniLM-L6-v2
 * Jika pipeline belum siap, secara otomatis fallback ke keyword search.
 */
export async function semanticVectorSearch(query: string, limit: number = 3): Promise<KnowledgeDocument[]> {
  try {
    const queryEmbedding = await getVectorEmbedding(query);
    const docEmbeddings = await ensureDocEmbeddings();

    if (queryEmbedding && docEmbeddings && docEmbeddings.length > 0) {
      const scored = docEmbeddings.map(item => ({
        doc: item.doc,
        similarity: cosineSimilarity(queryEmbedding, item.embedding),
      }));

      scored.sort((a, b) => b.similarity - a.similarity);
      return scored.slice(0, limit).map(s => s.doc);
    }
  } catch (err) {
    console.warn('Semantic vector search failed, falling back to lexical search:', err);
  }

  // Graceful fallback to lexical/keyword matching
  return searchKnowledgeBase(query, limit);
}
