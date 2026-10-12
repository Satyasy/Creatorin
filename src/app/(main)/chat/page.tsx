import { Suspense } from 'react';
import { ChatPage } from '@/views/ChatPage';

export const metadata = {
  title: 'Ruang Obrolan & Diskusi Proyek - Creatorin',
  description: 'Komunikasi langsung antara kreator dan brand dengan pertukaran file, invoice, dan ringkasan kerja.',
};

export default function ChatRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">Memuat obrolan...</div>}>
      <ChatPage />
    </Suspense>
  );
}
