import { RootRouter } from '@/views/RootRouter';

export const metadata = {
  title: 'Creatorin - Kolaborasi Kreator & UMKM Tanpa Ribet',
  description: 'Platform kolaborasi kreatif terpercaya untuk kreator konten dan UMKM Indonesia dengan perlindungan pembayaran escrow.',
};

export default function HomeRoute() {
  return <RootRouter />;
}
