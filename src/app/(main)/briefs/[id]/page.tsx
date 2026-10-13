import { Metadata } from 'next';
import { getBriefServerData } from '@/lib/server/briefs';
import { BriefDetailClient } from './BriefDetailClient';

interface BriefDetailRouteProps {
  params: Promise<{ id: string }>;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.my.id').replace(/\/$/, '');

export async function generateMetadata({ params }: BriefDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getBriefServerData(id);

  if (!data) {
    return {
      title: 'Brief Proyek Tidak Ditemukan | Creatorin',
      description: 'Brief proyek ini mungkin telah ditutup, dihapus, atau tautan tidak valid.',
    };
  }

  const { raw } = data;
  const title = `${raw.title} - Lowongan Proyek Kreatif | Creatorin`;
  const description =
    raw.description ||
    `Tender proyek ${raw.title} kategori ${raw.category} oleh ${raw.companyName || 'Mitra UMKM'}. Anggaran ${raw.budget || 'fleksibel'}.`;
  const canonicalUrl = `${APP_URL}/briefs/${raw.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      images: raw.businessAvatar
        ? [
            {
              url: raw.businessAvatar,
              width: 400,
              height: 400,
              alt: raw.title,
            },
          ]
        : [
            {
              url: `${APP_URL}/creatorin/logo.svg`,
              width: 1200,
              height: 630,
              alt: raw.title,
            },
          ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: raw.businessAvatar ? [raw.businessAvatar] : [`${APP_URL}/creatorin/logo.svg`],
    },
  };
}

export default async function BriefDetailRoute({ params }: BriefDetailRouteProps) {
  const { id } = await params;
  const data = await getBriefServerData(id);

  const schemaJsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'JobPosting',
            '@id': `${APP_URL}/briefs/${data.raw.id}#posting`,
            title: data.raw.title,
            description: data.raw.description || `Lowongan proyek kreatif: ${data.raw.title}`,
            datePosted: data.raw.createdAt.toISOString(),
            employmentType: 'CONTRACTOR',
            hiringOrganization: {
              '@type': 'Organization',
              name: data.raw.companyName || 'Mitra UMKM Creatorin',
              ...(data.raw.businessAvatar && { logo: data.raw.businessAvatar }),
            },
            ...(data.raw.businessLocation && {
              jobLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: data.raw.businessLocation,
                  addressCountry: 'ID',
                },
              },
            }),
            ...(data.raw.budget && {
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: 'IDR',
                value: {
                  '@type': 'QuantitativeValue',
                  value: Number(String(data.raw.budget).replace(/\D/g, '')) || 0,
                  unitText: 'PROJECT',
                },
              },
            }),
          },
        ],
      }
    : null;

  return (
    <>
      {schemaJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
        />
      )}
      <BriefDetailClient id={id} initialBrief={data?.brief} />
    </>
  );
}
