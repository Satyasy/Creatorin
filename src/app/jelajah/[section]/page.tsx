import JelajahPage from "../../../JelajahPage";

export default async function JelajahSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <JelajahPage initialSection={section} />;
}
