/**
 * uploadHelper.ts
 * Utilitas pengunggahan berkas gambar dengan mekanisme auto-retry untuk mencegah "Failed to fetch" akibat transient network latency.
 */

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export async function uploadImageWithRetry(
  file: File,
  folder: 'avatars' | 'projects' | 'chat' = 'avatars',
  maxRetries = 2
): Promise<UploadResult> {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedMime.includes(file.type)) {
    throw new Error('Format gambar tidak didukung. Harap gunakan format JPG, PNG, atau WebP.');
  }

  const maxBytes = 15 * 1024 * 1024; // 15MB
  if (file.size > maxBytes) {
    throw new Error('Ukuran gambar terlalu besar. Maksimal 15 MB.');
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Gagal mengunggah gambar (Status: ${res.status}).`);
      }

      if (!data.url) {
        throw new Error('Respon server tidak memuat tautan berkas.');
      }

      return {
        url: data.url,
        fileName: data.fileName || file.name,
        fileSize: data.fileSize || file.size,
        fileType: data.fileType || 'image',
      };
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;
      if (attempt <= maxRetries) {
        // Backoff delay sebelum retry
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }

  throw lastError || new Error('Gagal menghubungi server untuk mengunggah gambar. Silakan coba kembali.');
}
