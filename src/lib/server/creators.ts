import { getDb } from '@/lib/db';
import { profiles, creatorProfiles, services, projects, reviews, collaborationRooms } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { toCreator } from '@/services/creatorService';
import type { Creator, CreatorService } from '@/types';

export interface CreatorServerData {
  creator: Creator;
  raw: {
    id: string;
    slug: string;
    fullName: string;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    rating: string | number;
    reviewsCount: number;
    skills: string[];
    isPro: boolean;
  };
}

export async function getCreatorServerData(idOrSlug: string): Promise<CreatorServerData | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const creatorQuery = db
      .select({
        id: profiles.id,
        role: profiles.role,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        phone: profiles.phone,
        location: profiles.location,
        slug: creatorProfiles.slug,
        headline: creatorProfiles.headline,
        bio: creatorProfiles.bio,
        careerScore: creatorProfiles.careerScore,
        completedProjectsCount: creatorProfiles.completedProjectsCount,
        rating: creatorProfiles.rating,
        reviewsCount: creatorProfiles.reviewsCount,
        followersCount: creatorProfiles.followersCount,
        schoolName: creatorProfiles.schoolName,
        startingPrice: creatorProfiles.startingPrice,
        skills: creatorProfiles.skills,
        languages: creatorProfiles.languages,
        isPro: creatorProfiles.isPro,
        isPromoted: creatorProfiles.isPromoted,
        responseTime: creatorProfiles.responseTime,
        onTimeRate: creatorProfiles.onTimeRate,
        createdAt: creatorProfiles.createdAt,
      })
      .from(creatorProfiles)
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id));

    const creatorList = isUuid
      ? await creatorQuery.where(eq(profiles.id, idOrSlug)).limit(1)
      : await creatorQuery.where(eq(creatorProfiles.slug, idOrSlug)).limit(1);

    if (!creatorList || creatorList.length === 0) {
      return null;
    }

    const rawCreator = creatorList[0];

    const [creatorServices, completedRooms] = await Promise.all([
      db
        .select()
        .from(services)
        .where(and(eq(services.creatorId, rawCreator.id), eq(services.isActive, true)))
        .orderBy(desc(services.createdAt)),
      db
        .select({ id: collaborationRooms.id })
        .from(collaborationRooms)
        .where(and(eq(collaborationRooms.creatorId, rawCreator.id), eq(collaborationRooms.status, 'completed'))),
    ]);

    const formattedCreator = toCreator({
      ...rawCreator,
      completedProjectsCount: Math.max(rawCreator.completedProjectsCount, completedRooms.length),
      schoolBadge: rawCreator.schoolName
        ? {
            schoolName: rawCreator.schoolName,
            verified: true,
          }
        : null,
    });

    formattedCreator.services = (creatorServices || []).map((service): CreatorService => ({
      id: service.id,
      title: service.title,
      price: service.priceNumeric || 0,
      formattedPrice: service.price || '',
      deliveryDays: service.estimatedDays || '',
      description: service.description || '',
      coverImage: service.imageUrl || '',
      category: service.category || 'Creative',
    }));

    return {
      creator: formattedCreator,
      raw: {
        id: rawCreator.id,
        slug: rawCreator.slug,
        fullName: rawCreator.fullName,
        headline: rawCreator.headline,
        bio: rawCreator.bio,
        avatarUrl: rawCreator.avatarUrl,
        location: rawCreator.location,
        rating: rawCreator.rating,
        reviewsCount: rawCreator.reviewsCount,
        skills: Array.isArray(rawCreator.skills) ? (rawCreator.skills as string[]) : [],
        isPro: Boolean(rawCreator.isPro),
      },
    };
  } catch (error) {
    console.error('Error in getCreatorServerData:', error);
    return null;
  }
}
