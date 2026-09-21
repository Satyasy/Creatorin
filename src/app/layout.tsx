import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Creatorin — Platform Kolaborasi Kreatif",
  description: "Platform kolaborasi UMKM dan content creator berbasis career score.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
