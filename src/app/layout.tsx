import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "../index.css";

const logoFont = Space_Grotesk({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Creatorin — Platform Kolaborasi Kreatif",
  description: "Platform kolaborasi UMKM dan content creator berbasis career score.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className={logoFont.variable}><body>{children}</body></html>;
}
