"use client";

import App, { DiscoverDataProps } from "./App";

export default function ClientApp({ initialData }: { initialData?: DiscoverDataProps }) {
  return <App initialData={initialData} />;
}
