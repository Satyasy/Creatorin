import { Suspense } from 'react';
import { SignUpPage } from '@/views/SignUpPage';

export const metadata = {
  title: 'Daftar Akun Baru - Creatorin',
  description: 'Daftar sebagai kreator konten atau pemilik brand UMKM di Creatorin.',
};

export default function SignUpRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignUpPage />
    </Suspense>
  );
}
