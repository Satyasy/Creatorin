import { BriefDetailPage } from '@/views/BriefDetailPage';
import { MOCK_PROJECTS } from '@/data/mockProjects';
import type { Metadata } from 'next';

interface BriefDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BriefDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const brief = MOCK_PROJECTS.find((p) => p.id === id) || MOCK_PROJECTS[0];
  return {
    title: `${brief.title} - Brief Proyek di Creatorin`,
    description: brief.description || `Detail brief proyek ${brief.title} dari ${brief.clientName}.`,
  };
}

export default async function BriefDetailRoute({ params }: BriefDetailRouteProps) {
  const { id } = await params;
  const brief = MOCK_PROJECTS.find((p) => p.id === id) || MOCK_PROJECTS[0];
  return <BriefDetailPage brief={brief} />;
}
