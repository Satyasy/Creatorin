import { BriefDetailPage } from "../../../BriefPage";

export default async function BriefTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  return <BriefDetailPage tab={tab} />;
}
