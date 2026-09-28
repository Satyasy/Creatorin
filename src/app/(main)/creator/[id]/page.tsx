import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { creatorService } from '@/services/creatorService';
import type { Metadata } from 'next';

interface CreatorRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CreatorRouteProps): Promise<Metadata> {
  const { id } = await params;
  const creator = (await creatorService.getCreatorDetail(id)) || MOCK_CREATORS[0];
  return {
    title: `${creator.name} - Portofolio & Layanan di Creatorin`,
    description: creator.bio || `Profil kreator ${creator.name} di platform Creatorin.`,
  };
}

export default async function CreatorRoute({ params }: CreatorRouteProps) {
  const { id } = await params;
  const creator = (await creatorService.getCreatorDetail(id)) || MOCK_CREATORS[0];
  return <CreatorProfilePage creator={creator} />;
}
