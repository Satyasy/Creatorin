/**
 * Creatorin Global Error Mapper
 * Translates HTTP status codes, network faults, and application exceptions
 * into structured, human-readable Indonesian UI models.
 */

export interface ErrorDetails {
  title: string;
  message: string;
  suggestion?: string;
  code?: string;
  retryable?: boolean;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function mapErrorToDetails(
  error: unknown,
  fallbackTitle: string = 'Terjadi Kendala',
  fallbackMessage: string = 'Mohon maaf, sistem tidak dapat menyelesaikan permintaan saat ini.'
): ErrorDetails {
  // 1. If already formatted ErrorDetails
  if (typeof error === 'object' && error !== null && 'title' in error && 'message' in error) {
    return error as ErrorDetails;
  }

  // 2. Extract error message and potential status
  let message = '';
  let status: number | null = null;
  let code = '';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
    if ('status' in error && typeof (error as any).status === 'number') {
      status = (error as any).status;
    }
    if ('code' in error && typeof (error as any).code === 'string') {
      code = (error as any).code;
    }
  } else if (typeof error === 'object' && error !== null) {
    message = (error as any).error || (error as any).message || '';
    if (typeof (error as any).status === 'number') {
      status = (error as any).status;
    }
    if (typeof (error as any).code === 'string') {
      code = (error as any).code;
    }
  }

  // Detect HTTP status embedded in message like "HTTP 401" or "401: Unauthorized"
  const httpMatch = message.match(/\b(?:HTTP\s*|status\s*:?\s*)?([45]\d{2})\b/i);
  if (!status && httpMatch) {
    status = parseInt(httpMatch[1], 10);
  }

  // 3. Network or offline error detection
  if (
    /failed to fetch/i.test(message) ||
    /network\s*error/i.test(message) ||
    /offline/i.test(message) ||
    /load failed/i.test(message) ||
    code === 'ERR_NETWORK' ||
    code === 'ENOTFOUND'
  ) {
    return {
      title: 'Koneksi Terputus',
      message: 'Gagal menghubungi server Creatorin. Periksa jaringan internet Anda.',
      suggestion: 'Pastikan perangkat terhubung ke internet yang stabil lalu tekan tombol Coba Lagi.',
      code: 'ERR_NETWORK_DISCONNECTED',
      retryable: true,
    };
  }

  // 4. Wallet specific insufficient balance detection
  if (
    /saldo.*tidak.*cukup/i.test(message) ||
    /insufficient.*balance/i.test(message) ||
    /koin.*kurang/i.test(message) ||
    code === 'ERR_INSUFFICIENT_COINS'
  ) {
    return {
      title: 'Saldo Koin Tidak Cukup',
      message: message || 'Saldo koin di dompet Anda belum mencukupi untuk menyelesaikan transaksi escrow ini.',
      suggestion: 'Silakan lakukan pengisian (top-up) koin agar kolaborasi dapat dilanjutkan.',
      code: 'ERR_INSUFFICIENT_COINS',
      retryable: false,
      action: {
        label: 'Buka Dompet Koin',
        href: '/wallet',
      },
    };
  }

  // 5. HTTP status code specific mappings
  if (status === 401) {
    return {
      title: 'Sesi Masuk Berakhir',
      message: 'Sesi autentikasi Anda telah berakhir atau belum terdaftar.',
      suggestion: 'Silakan masuk kembali untuk melanjutkan aktivitas Anda.',
      code: 'HTTP_401_UNAUTHORIZED',
      retryable: false,
      action: {
        label: 'Masuk Akun',
        href: '/sign-in',
      },
    };
  }

  if (status === 403) {
    return {
      title: 'Akses Terbatas',
      message: message || 'Anda tidak memiliki hak akses untuk membuka atau mengubah data ini.',
      suggestion: 'Pastikan Anda masuk dengan peran akun yang sesuai (Creator, UMKM, atau Sekolah).',
      code: 'HTTP_403_FORBIDDEN',
      retryable: false,
    };
  }

  if (status === 404) {
    return {
      title: 'Data Tidak Ditemukan',
      message: message || 'Informasi atau berkas yang diminta tidak tersedia di sistem.',
      suggestion: 'Periksa kembali URL atau kembali ke halaman penjelajahan.',
      code: 'HTTP_404_NOT_FOUND',
      retryable: false,
    };
  }

  if (status === 409) {
    return {
      title: 'Terjadi Konflik Data',
      message: message || 'Data sedang diperbarui atau telah ada perubahan dari sesi lain.',
      suggestion: 'Muat ulang halaman untuk menyinkronkan data terbaru.',
      code: 'HTTP_409_CONFLICT',
      retryable: true,
    };
  }

  if (status === 422 || status === 400) {
    return {
      title: 'Periksa Kembali Formulir',
      message: message || 'Data yang Anda masukkan belum memenuhi kriteria yang diperlukan.',
      suggestion: 'Lengkapi seluruh kolom wajib bertanda bintang dan pastikan format file sudah tepat.',
      code: `HTTP_${status}_VALIDATION`,
      retryable: false,
    };
  }

  if (status === 429) {
    return {
      title: 'Terlalu Banyak Permintaan',
      message: 'Sistem mendeteksi aktivitas yang terlalu cepat dalam waktu singkat.',
      suggestion: 'Mohon tunggu 30-60 detik demi keamanan sebelum mencoba mengirim permintaan kembali.',
      code: 'HTTP_429_RATE_LIMITED',
      retryable: true,
    };
  }

  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return {
      title: 'Gangguan Server Sementara',
      message: 'Layanan kami sedang mengalami kendala teknis internal.',
      suggestion: 'Tim teknis kami sedang memantau. Anda dapat mencoba beberapa saat lagi.',
      code: `HTTP_${status}_SERVER_ERROR`,
      retryable: true,
    };
  }

  // 6. Generic fallback with clean message
  return {
    title: fallbackTitle,
    message: message || fallbackMessage,
    suggestion: 'Jika masalah berlanjut, silakan segarkan halaman browser Anda.',
    code: code || 'ERR_UNKNOWN',
    retryable: false,
  };
}
