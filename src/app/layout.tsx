import type { Metadata, Viewport } from "next";
import "../index.css";
import { AuthProvider } from "@/providers/AuthProvider";

export const viewport: Viewport = {
  themeColor: "#155DFC",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://creatorin.id"),
  title: {
    default: "Creatorin | Platform Kolaborasi Kreatif UMKM & Kreator",
    template: "%s | Creatorin",
  },
  description: "Platform kolaborasi UMKM dan content creator terverifikasi dengan career score, escrow aman, dan portofolio vokasi terbaik.",
  keywords: ["creatorin", "kolaborasi kreatif", "umkm", "content creator", "desain grafis", "influencer", "portofolio", "vokasi"],
  authors: [{ name: "Creatorin" }],
  creator: "Creatorin",
  publisher: "Creatorin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Creatorin | Platform Kolaborasi Kreatif UMKM & Kreator",
    description: "Platform kolaborasi UMKM dan content creator terverifikasi dengan career score, escrow aman, dan portofolio vokasi terbaik.",
    url: "https://creatorin.id",
    siteName: "Creatorin",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/creatorin/logo.svg",
        width: 1200,
        height: 630,
        alt: "Creatorin Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creatorin | Platform Kolaborasi Kreatif UMKM & Kreator",
    description: "Platform kolaborasi UMKM dan content creator terverifikasi dengan career score, escrow aman, dan portofolio vokasi terbaik.",
    images: ["/creatorin/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/creatorin/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/creatorin/logo.svg',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://creatorin.id/#website",
      "url": "https://creatorin.id",
      "name": "Creatorin",
      "description": "Platform kolaborasi UMKM dan content creator terverifikasi",
      "publisher": {
        "@id": "https://creatorin.id/#organization"
      },
      "inLanguage": "id-ID"
    },
    {
      "@type": "Organization",
      "@id": "https://creatorin.id/#organization",
      "name": "Creatorin",
      "url": "https://creatorin.id",
      "logo": "https://creatorin.id/creatorin/logo.svg",
      "sameAs": []
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="overflow-x-clip" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          media="print"
          // @ts-expect-error non-standard attribute on link tag for async font loading
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans overflow-x-clip tracking-[0.01em] text-[15px] leading-relaxed" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
