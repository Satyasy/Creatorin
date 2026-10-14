import type { Metadata, Viewport } from "next";
import "../index.css";
import { Suspense } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { AuthModalProvider } from "@/providers/AuthModalProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { RouteProgressBar } from "@/components/common/RouteProgressBar";
import { GA_TRACKING_ID, CLARITY_PROJECT_ID } from "@/lib/analytics";

export const viewport: Viewport = {
  themeColor: "#155DFC",
  width: "device-width",
  initialScale: 1,
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://creatorin.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
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
    url: APP_URL,
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
      "@id": `${APP_URL}/#website`,
      "url": APP_URL,
      "name": "Creatorin",
      "description": "Platform kolaborasi UMKM dan content creator terverifikasi",
      "publisher": {
        "@id": `${APP_URL}/#organization`
      },
      "inLanguage": "id-ID"
    },
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      "name": "Creatorin",
      "url": APP_URL,
      "logo": `${APP_URL}/creatorin/logo.svg`,
      "sameAs": []
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="overflow-x-clip" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        {GA_TRACKING_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <script
              id="google-tag-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}');
                `,
              }}
            />
          </>
        )}
        {/* Microsoft Clarity */}
        {CLARITY_PROJECT_ID && (
          <script
            id="microsoft-clarity"
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.creatorin.my.id" crossOrigin="use-credentials" />
        <link rel="dns-prefetch" href="https://api.creatorin.my.id" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* App Router root layout owns the document head. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,500;1,9..40,600;1,9..40,700&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans overflow-x-clip text-base leading-6" suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <AuthModalProvider>
              <ToastProvider>
                <Suspense fallback={null}>
                  <RouteProgressBar />
                </Suspense>
                {children}
              </ToastProvider>
            </AuthModalProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
