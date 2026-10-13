import { Metadata } from 'next';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { getCreatorServerData } from '@/lib/server/creators';
import { CreatorProfileClient } from './CreatorProfileClient';

interface CreatorRouteProps {
  params: Promise<{ id: string }>;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.my.id').replace(/\/$/, '');

export async function generateMetadata({ params }: CreatorRouteProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getCreatorServerData(id);

  if (!data) {
    return {
      title: 'Profil Kreator Tidak Ditemukan | Creatorin',
      description: 'Profil kreator ini mungkin telah diubah, dinonaktifkan, atau tautan tidak valid.',
    };
  }

  const { raw } = data;
  const canonicalPath = raw.slug ? `/creator/${raw.slug}` : `/creator/${raw.id}`;
  const canonicalUrl = `${APP_URL}${canonicalPath}`;
  const headline = raw.headline ? ` - ${raw.headline}` : '';
  const title = `${raw.fullName}${headline} | Creatorin`;
  const description = raw.bio || `${raw.fullName} adalah konten kreator terverifikasi di Creatorin dengan keahlian ${raw.skills.slice(0, 3).join(', ')}.`;

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
      images: raw.avatarUrl
        ? [
            {
              url: raw.avatarUrl,
              width: 600,
              height: 600,
              alt: raw.fullName,
            },
          ]
        : [
            {
              url: `${APP_URL}/creatorin/logo.svg`,
              width: 1200,
              height: 630,
              alt: raw.fullName,
            },
          ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: raw.avatarUrl ? [raw.avatarUrl] : [`${APP_URL}/creatorin/logo.svg`],
    },
  };
}

export default async function CreatorRoute({ params }: CreatorRouteProps) {
  const { id } = await params;
  const data = await getCreatorServerData(id);

  // If visited via raw UUID, redirect 301 to SEO-friendly slug when available
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (data && isUuid && data.raw.slug && data.raw.slug !== id) {
    redirect(`/creator/${data.raw.slug}`, RedirectType.replace);
  }

  const schemaJsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ProfilePage',
            '@id': `${APP_URL}/creator/${data.raw.slug || data.raw.id}#webpage`,
            url: `${APP_URL}/creator/${data.raw.slug || data.raw.id}`,
            name: `${data.raw.fullName} - Profil Kreator di Creatorin`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${APP_URL}/#website`,
              name: 'Creatorin',
              url: APP_URL,
            },
            mainEntity: {
              '@id': `${APP_URL}/creator/${data.raw.slug || data.raw.id}#person`,
            },
          },
          {
            '@type': 'Person',
            '@id': `${APP_URL}/creator/${data.raw.slug || data.raw.id}#person`,
            name: data.raw.fullName,
            alternateName: `@${data.raw.slug || data.raw.id}`,
            jobTitle: data.raw.headline || 'Content Creator',
            description: data.raw.bio || undefined,
            image: data.raw.avatarUrl || undefined,
            address: data.raw.location
              ? {
                  '@type': 'PostalAddress',
                  addressLocality: data.raw.location,
                  addressCountry: 'ID',
                }
              : undefined,
            knowsAbout: data.raw.skills.length > 0 ? data.raw.skills : undefined,
            ...(Number(data.raw.rating) > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: Number(data.raw.rating).toFixed(1),
                reviewCount: Math.max(1, data.raw.reviewsCount || 1),
                bestRating: '5',
                worstRating: '1',
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
      <CreatorProfileClient id={id} initialCreator={data?.creator} />
    </>
  );
}
