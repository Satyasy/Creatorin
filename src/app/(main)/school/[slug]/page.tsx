import { Metadata } from 'next';
import { SchoolPublicProfilePage } from '@/views/SchoolPublicProfilePage';
import { getSchoolServerData } from '@/lib/server/schools';

interface SchoolPublicRouteProps {
  params: Promise<{ slug: string }>;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.my.id').replace(/\/$/, '');

export async function generateMetadata({ params }: SchoolPublicRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolServerData(slug);

  if (!school) {
    return {
      title: 'Profil SMK Vokasi | Creatorin',
      description: 'Halaman etalase talenta vokasi dan karya siswa binaan Creatorin.',
    };
  }

  const title = `${school.name} - Hub Talenta Vokasi Kreatif | Creatorin`;
  const description =
    school.description ||
    school.tagline ||
    `Etalase resmi portofolio karya kreatif dan profil siswa bertalenta dari ${school.name} di Creatorin.`;
  const canonicalUrl = `${APP_URL}/school/${school.slug}`;

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
      images: school.logoUrl
        ? [
            {
              url: school.logoUrl,
              width: 400,
              height: 400,
              alt: school.name,
            },
          ]
        : [
            {
              url: `${APP_URL}/creatorin/logo.svg`,
              width: 1200,
              height: 630,
              alt: school.name,
            },
          ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: school.logoUrl ? [school.logoUrl] : [`${APP_URL}/creatorin/logo.svg`],
    },
  };
}

export default async function SchoolPublicRoute({ params }: SchoolPublicRouteProps) {
  const { slug } = await params;
  const school = await getSchoolServerData(slug);

  const schemaJsonLd = school
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'EducationalOrganization',
            '@id': `${APP_URL}/school/${school.slug}#organization`,
            name: school.name,
            url: `${APP_URL}/school/${school.slug}`,
            description: school.description || school.tagline || undefined,
            logo: school.logoUrl || undefined,
            image: school.coverUrl || undefined,
            ...(school.website && { sameAs: [school.website] }),
            ...(school.city && {
              address: {
                '@type': 'PostalAddress',
                addressLocality: school.city,
                streetAddress: school.address || undefined,
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
      <SchoolPublicProfilePage slug={slug} />
    </>
  );
}
