import { SchoolPublicProfilePage } from '@/views/SchoolPublicProfilePage';

export default async function SchoolPublicRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SchoolPublicProfilePage slug={slug} />;
}
