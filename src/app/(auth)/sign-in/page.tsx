import { Suspense } from 'react';
import { SignInPage } from '@/views/SignInPage';

export const metadata = {
  title: 'Masuk ke Akun - Creatorin',
  description: 'Masuk ke platform Creatorin untuk mengelola kolaborasi, proyek, dan penawaran Anda.',
};

export default function SignInRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignInPage />
    </Suspense>
  );
}
