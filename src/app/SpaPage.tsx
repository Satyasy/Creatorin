"use client";

import dynamic from "next/dynamic";
import type { ActivePage } from "../types";

const App = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#fafafa] px-6 py-10 text-sm font-semibold text-[#0d0c22]">
      Memuat Creatorin...
    </div>
  ),
});

type SpaPageProps = {
  initialPage?: ActivePage;
};

export default function SpaPage({ initialPage = "home" }: SpaPageProps) {
  return <App initialPage={initialPage} />;
}
