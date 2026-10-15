import { getDb } from '@/lib/db';
import { profiles, creatorProfiles, services, projects, reviews, collaborationRooms } from '@/lib/db/schema';
import { eq, or, desc, and } from 'drizzle-orm';
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
    coverUrl: string | null;
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
        coverUrl: profiles.coverUrl,
        phone: profiles.phone,
        location: profiles.location,
        slug: creatorProfiles.slug,
        headline: creatorProfiles.headline,
        bio: creatorProfiles.bio,
        careerScore: creatorProfiles.careerScore,
        completedProjectsCount: creatorProfiles.completedProjectsCount,
        rating: creatorProfiles.rating,
        reviewsCount: creatorProfiles.reviewsCount,
        schoolName: creatorProfiles.schoolName,
        schoolStatus: creatorProfiles.schoolStatus,
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

    const strippedId = idOrSlug.replace(/^creator-/, '');
    const creatorList = isUuid
      ? await creatorQuery.where(eq(profiles.id, idOrSlug)).limit(1)
      : await creatorQuery
          .where(or(eq(creatorProfiles.slug, idOrSlug), eq(creatorProfiles.slug, strippedId)))
          .limit(1);

    if (!creatorList || creatorList.length === 0) {
      return null;
    }

    const rawCreator = creatorList[0];

    const [creatorServices, completedRooms, creatorReviews] = await Promise.all([
      db
        .select()
        .from(services)
        .where(and(eq(services.creatorId, rawCreator.id), eq(services.isActive, true)))
        .orderBy(desc(services.createdAt)),
      db
        .select({ id: collaborationRooms.id })
        .from(collaborationRooms)
        .where(and(eq(collaborationRooms.creatorId, rawCreator.id), eq(collaborationRooms.status, 'completed'))),
      db
        .select()
        .from(reviews)
        .where(eq(reviews.creatorId, rawCreator.id))
        .orderBy(desc(reviews.createdAt)),
    ]);

    const reviewList = creatorReviews || [];
    const avgRating = reviewList.length > 0
      ? (reviewList.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviewList.length).toFixed(1)
      : (rawCreator.rating ? Number(rawCreator.rating).toFixed(1) : '0.0');

    const formattedCreator = toCreator({
      ...rawCreator,
      rating: Number(avgRating),
      reviewsCount: reviewList.length > 0 ? reviewList.length : rawCreator.reviewsCount,
      completedProjectsCount: Math.max(rawCreator.completedProjectsCount, completedRooms.length),
      schoolBadge: (rawCreator.schoolName && rawCreator.schoolStatus === 'approved')
        ? {
            schoolName: rawCreator.schoolName,
            verified: true,
          }
        : null,
    });

    formattedCreator.reviewsList = reviewList.map((rev) => ({
      id: rev.id,
      clientName: rev.reviewerName,
      clientCompany: rev.reviewerRole,
      rating: Number(rev.rating),
      comment: rev.comment,
      date: rev.completedDate,
      projectTitle: rev.projectTitle,
    }));

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
        coverUrl: rawCreator.coverUrl,
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
