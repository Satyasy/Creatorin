import { UmkmProfilePage } from '@/views/UmkmProfilePage';
import { MOCK_PRIMARY_UMKM, MOCK_ALL_UMKM } from '@/data/mockUmkm';
import type { Metadata } from 'next';

interface UmkmRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UmkmRouteProps): Promise<Metadata> {
  const { id } = await params;
  const umkm = MOCK_ALL_UMKM.find((u) => u.id === id || u.brandName.toLowerCase().replace(/\s+/g, '-') === id) || MOCK_PRIMARY_UMKM;
  return {
    title: `${umkm.brandName} - Profil Brand UMKM di Creatorin`,
    description: umkm.bio || `Profil brand UMKM ${umkm.brandName} di Creatorin.`,
  };
}

export default async function UmkmRoute({ params }: UmkmRouteProps) {
  const { id } = await params;
  const umkm = MOCK_ALL_UMKM.find((u) => u.id === id || u.brandName.toLowerCase().replace(/\s+/g, '-') === id) || MOCK_PRIMARY_UMKM;
  return <UmkmProfilePage initialProfile={umkm} />;
}
