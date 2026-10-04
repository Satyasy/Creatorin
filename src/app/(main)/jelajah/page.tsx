import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Jelajah Layanan, Proyek & Kreator - Creatorin',
  description: 'Pusat eksplorasi talenta kreatif, portofolio proyek, dan paket jasa untuk UMKM.',
};

export default function JelajahRootRoute() {
  redirect('/jelajah/layanan');
}
