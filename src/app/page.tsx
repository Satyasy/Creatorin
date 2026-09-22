import ClientApp from "../ClientApp";
import { getDiscoverData } from "../lib/db/queries/discover";

export default async function Home() {
  const data = await getDiscoverData();
  return <ClientApp initialData={data as any} />;
}
