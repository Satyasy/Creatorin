import { Metadata } from 'next';
import { getBusinessServerData } from '@/lib/server/businesses';
import { UmkmProfileClient } from './UmkmProfileClient';

interface UmkmRouteProps {
  params: Promise<{ id: string }>;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.my.id').replace(/\/$/, '');

export async function generateMetadata({ params }: UmkmRouteProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getBusinessServerData(id);

  if (!data) {
    return {
      title: 'Profil UMKM Tidak Ditemukan | Creatorin',
      description: 'Profil brand ini mungkin telah dinonaktifkan atau tautan tidak valid.',
    };
  }

  const { raw } = data;
  const brandTitle = raw.brandName || raw.name;
  const categorySnippet = raw.category ? ` (${raw.category})` : '';
  const title = `${brandTitle}${categorySnippet} - Profil UMKM | Creatorin`;
  const description =
    raw.bio ||
    `${brandTitle} adalah mitra UMKM terverifikasi di platform kolaborasi kreatif Creatorin.`;
  const canonicalUrl = `${APP_URL}/umkm/${raw.id}`;

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
      type: 'profile',
      images: raw.logo
        ? [
            {
              url: raw.logo,
              width: 400,
              height: 400,
              alt: brandTitle,
            },
          ]
        : [
            {
              url: `${APP_URL}/creatorin/logo.svg`,
              width: 1200,
              height: 630,
              alt: brandTitle,
            },
          ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: raw.logo ? [raw.logo] : [`${APP_URL}/creatorin/logo.svg`],
    },
  };
}

export default async function UmkmRoute({ params }: UmkmRouteProps) {
  const { id } = await params;
  const data = await getBusinessServerData(id);

  const schemaJsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'LocalBusiness',
            '@id': `${APP_URL}/umkm/${data.raw.id}#business`,
            name: data.raw.brandName || data.raw.name,
            url: `${APP_URL}/umkm/${data.raw.id}`,
            description: data.raw.bio || undefined,
            image: data.raw.logo || undefined,
            ...(data.raw.website && { sameAs: [data.raw.website] }),
            ...(data.raw.location && {
              address: {
                '@type': 'PostalAddress',
                addressLocality: data.raw.location,
                addressCountry: 'ID',
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
      <UmkmProfileClient id={id} initialProfile={data?.business} />
    </>
  );
}
