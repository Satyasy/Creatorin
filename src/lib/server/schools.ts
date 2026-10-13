import { getDb } from '@/lib/db';
import { schools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface SchoolServerData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  isVerified: boolean;
}

export async function getSchoolServerData(slug: string): Promise<SchoolServerData | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const [school] = await db
      .select({
        id: schools.id,
        name: schools.name,
        slug: schools.slug,
        tagline: schools.tagline,
        description: schools.description,
        logoUrl: schools.logoUrl,
        coverUrl: schools.coverUrl,
        city: schools.city,
        address: schools.address,
        website: schools.website,
        isVerified: schools.isVerified,
      })
      .from(schools)
      .where(eq(schools.slug, slug))
      .limit(1);

    return school || null;
  } catch (error) {
    console.error('Error fetching school server data:', error);
    return null;
  }
}
