export type ActivePage =
  | 'home'
  | 'landing'
  | 'creators'
  | 'services'
  | 'projects'
  | 'briefs'
  | 'brief-detail'
  | 'creator-profile'
  | 'umkm-profile'
  | 'chat'
  | 'notifications'
  | 'my-profile'
  | string;

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: 'creator' | 'umkm' | 'admin' | string;
  [key: string]: unknown;
}

export interface AuthState {
  user?: AuthUser | null;
  isAuthenticated?: boolean;
}

export interface ProjectListing {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  coverImage?: string;
  clientLocation: string;
  clientIndustry?: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  formattedBudget: string;
  deadline: string;
  scopeDurationDays?: number;
  description: string;
  deliverables: string[];
  requiredSkills: string[];
  proposalsCount?: number;
  postedTimeAgo?: string;
  isUrgent?: boolean;
  isVerifiedClient?: boolean;
  productShippingProvided?: boolean;
  clientRating?: number;
  clientProjectsCount?: number;
  status?: 'open' | 'in_progress' | 'completed' | 'closed';
}

export interface Creator {
  id?: string;
  name: string;
  slug?: string;
  avatar: string;
  roleTitle?: string;
  rate?: string;
  formattedRate?: string;
  responseTime?: string;
  city?: string;
  score?: string | number;
  projects?: string | number;
  services?: string | number;
  rating?: string | number;
  reviews?: string | number;
  promoted?: boolean;
  [key: string]: unknown;
}

export interface PortfolioSample {
  id: string;
  title: string;
  thumbnail: string;
  views?: string;
  likes?: string;
  type?: string;
}

export interface BriefApplicant {
  id: string;
  briefId: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  creatorRole: string;
  careerScore: number;
  careerTier?: string;
  location: string;
  rating: number;
  completedProjects: number;
  appliedDate: string;
  bidAmount: number;
  formattedBid: string;
  durationDays: string;
  pitch: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  portfolioSamples?: PortfolioSample[];
  isPro?: boolean;
}

export interface UmkmBrandGuide {
  brandValues?: string[];
  targetAudience?: string;
  sampleShippingPolicy?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface UmkmProfile {
  id: string;
  brandName: string;
  bio: string;
  location: string;
  joinedDate: string;
  website?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  brandGuide?: UmkmBrandGuide;
  stats: {
    completedProjects: number;
    activeBriefs: number;
  };
}
