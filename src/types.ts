export type UserRole = 'umkm' | 'creator' | 'school' | 'admin';
export type CreatorCategory = 'Video' | 'Image';

export interface CareerScoreBreakdown {
  overall: number; // 0 - 100
  deadlineAccuracy: number; // e.g. 98%
  revisionRate: number; // average revisions, e.g. 1.1
  completionRate: number; // e.g. 100%
  clientRating: number; // e.g. 4.9
  completedProjects: number;
  tier: 'Top Tier' | 'Rising Star' | 'Verified Talent' | 'Belum Dinilai';
}

export interface PortfolioItem {
  id: string;
  title: string;
  categoryTag: string; // e.g. 'WEBSITES', 'UX/UI DESIGN', 'UGC REELS', 'FOTO PRODUK'
  thumbnail: string;
  type?: 'video' | 'image';
  views?: string;
  likes?: string;
}

export interface CreatorService {
  id: string;
  title: string;
  price: number;
  formattedPrice: string; // e.g. "Rp450.000"
  deliveryDays?: string; // e.g. "2 Hari Kerja"
  tag?: string; // e.g. "UGC Video", "Foto Produk", "Design"
  coverImage?: string;
  description?: string;
  deliverables?: string[];
  features?: string[];
  revisions?: string;
  fileFormats?: string[];
  galleryImages?: string[];
  category?: string;
  toolsUsed?: string[];
  isActive?: boolean;
}

export interface Creator {
  id: string;
  name: string;
  username?: string;
  slug?: string;
  email?: string;
  avatar: string;
  category: CreatorCategory;
  roleTitle: string;
  bio: string;
  location: string;
  startingRate: number; // in IDR
  formattedRate: string; // e.g. "Rp150.000"
  careerScore: CareerScoreBreakdown;
  stats?: {
    completedProjects?: number | string;
    [key: string]: unknown;
  };
  rating?: number | string;
  reviewCount?: number | string;
  skills: string[];
  portfolioSamples?: PortfolioItem[];
  services?: CreatorService[];
  joinedDate: string;
  isPromoted?: boolean;
  proBadge?: boolean;
  selectBadge?: boolean;
  verified?: boolean;
  responseTime?: string;
  servicesAvailableCount?: number;
  highlightCard?: {
    heading: string;
    subheading: string;
    accentColor?: string;
  };
  testimonialQuote?: {
    text: string;
    clientName: string;
    rating: number;
    source: string;
  };
  heroHeadline?: string;
  followersCount?: number;
  followingCount?: number;
  likesCount?: number;
  bannerQuote?: string;
  copyrightName?: string;
  cursorTag?: string;
  aboutMeStory?: string;
  handle?: string;
  collections?: { id: string; title: string; count: number; coverImage: string }[];
  reviewsList?: { id: string; clientName: string; clientCompany: string; rating: number; comment: string; date: string; projectTitle: string }[];
}

export interface ProjectListing {
  id: string;
  title: string;
  clientName: string;
  clientAvatar?: string;
  clientLocation: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  formattedBudget: string;
  deadline: string;
  description: string;
  deliverables: string[];
  requiredSkills: string[];
  proposalsCount: number;
  postedTimeAgo: string;
  createdAt?: string;
  isUrgent?: boolean;
  isVerifiedClient?: boolean;
  clientIndustry?: string;
  productShippingProvided?: boolean;
  coverImage?: string;
  clientRating?: number;
  clientProjectsCount?: number;
  scopeDurationDays?: number;
}

export interface FeedProject {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  mediaUrl?: string;
  carouselImages?: string[];
  additionalMedia?: string[];
  videoUrl?: string;
  mediaType: 'video' | 'carousel' | 'image';
  aspectRatio?: 'square' | 'portrait' | 'tall' | '4/5';
  platform?: 'instagram' | 'tiktok' | 'direct' | 'youtube';
  socialHandle?: string;
  socialUrl?: string;
  creatorId?: string;
  creator: Creator;
  category: string;
  caption?: string;
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: string;
  sharesCount: number;
  postedDate?: string;
  createdAt?: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  projectPrice?: string;
  deliveryDays?: string;
  toolsUsed?: string[];
  clientBrand?: string;
  clientReviewSnippet?: {
    clientName: string;
    rating: number;
    text: string;
    brandName?: string;
  };
  servicesUsed?: {
    serviceId: string;
    serviceTitle: string;
    price: number;
  }[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    creatorCategory?: CreatorCategory;
    avatar?: string;
    /** Extended profile fields : populated on save from SettingsPage */
    location?: string;
    bio?: string;
    phone?: string;
    roleTitle?: string;
    handle?: string;
  } | null;
}

export type ActivePage = 'home' | 'landing' | 'signup' | 'signin' | 'explore' | 'projects' | 'services' | 'creator-profile' | 'notifications' | 'chat' | 'briefs' | 'umkm-profile' | 'brief-detail' | 'invoice' | 'collaboration-room' | 'settings' | 'school-dashboard' | 'school-profile';

export type CollabStage = 'brief' | 'in_progress' | 'review' | 'revision' | 'approval' | 'completed';

export interface CollabDeliverable {
  id: string;
  version: number;
  title: string;
  type: 'video' | 'image' | 'design_file';
  url: string;
  uploadedAt: string;
  filesize?: string;
  creatorNote?: string;
  previewThumbnail?: string;
  externalLink?: string;
}

export interface CollabRevision {
  id: string;
  revisionRound: number;
  requestedAt: string;
  feedbackText: string;
  status: 'pending' | 'resolved';
  resolvedAt?: string;
}

export interface CollabActivityLog {
  id: string;
  senderRole: 'system' | 'business' | 'creator';
  senderName: string;
  action: string;
  timestamp: string;
  detail?: string;
  type?: 'escrow_locked' | 'brief_confirmed' | 'draft_submitted' | 'revision_requested' | 'approved' | 'rated';
}

export interface CollabRating {
  score: number;
  aspects: {
    quality: number;
    communication: number;
    speed: number;
  };
  reviewText: string;
  tags: string[];
  submittedAt: string;
}

export interface CollaborationItem {
  id: string;
  roomCode: string; // e.g. "CR-2026-081"
  projectTitle: string;
  category: string;
  budgetFormatted: string;
  budgetAmount: number;
  escrowStatus: 'held_in_escrow' | 'released_to_creator' | 'refunded';
  invoiceNumber: string;
  invoicePaidDate: string;
  
  // Creator Info
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: string;
  creatorRating: number;
  
  // Business / UMKM Info
  businessName: string;
  businessBrand: string;
  businessAvatar: string;
  
  // Timeline
  startDate: string;
  deadlineDate: string;
  daysRemaining: number;
  
  // Current Progress State
  currentStage: CollabStage;
  progressPercent: number; // 0 - 100
  
  // Stage Data
  briefDetails: {
    summary: string;
    requirements: string[];
    brandAssets: { name: string; size: string }[];
  };
  deliverables: CollabDeliverable[];
  revisions: CollabRevision[];
  activityLogs: CollabActivityLog[];
  rating?: CollabRating;
  
  // Published Portfolio Link when completed
  publishedPortfolioId?: string;
  thumbnail?: string;
}

export interface UMKMCompletedCollab {
  id: string;
  title: string;
  creatorId?: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: string;
  category: string;
  completedDate: string;
  deliverableMedia: string;
  mediaType: 'video' | 'image';
  ratingGiven: number;
  budgetFormatted: string;
  reviewComment?: string;
}

export interface UMKMCreatorReview {
  id: string;
  creatorId?: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: string;
  rating: number;
  date: string;
  comment: string;
  projectTitle: string;
  tags: string[];
}

export interface UMKMProfile {
  id: string;
  name: string;
  brandName: string;
  logo: string;
  coverBanner: string;
  industry: string;
  category: string;
  tagline: string;
  bio: string;
  location: string;
  website?: string;
  instagram?: string;
  marketplaceUrl?: string; // Shopee / Tokopedia
  whatsapp?: string;
  verified: boolean;
  joinedDate: string;
  stats: {
    activeBriefs: number;
    completedProjects: number;
    totalPaidFormatted: string;
    ratingFromCreators: number;
    reviewCount: number;
    paymentOnTimeRate: number; // e.g. 100%
    avgResponseHours: number; // e.g. 1.5
  };
  brandGuide?: {
    primaryColor: string;
    secondaryColor: string;
    targetAudience: string;
    brandValues: string[];
    sampleShippingPolicy: string;
  };
  activeBriefsList?: ProjectListing[];
  completedCollaborations?: UMKMCompletedCollab[];
  creatorReviews?: UMKMCreatorReview[];
}

export interface AppNotification {
  id: string;
  type: 'project_inquiry' | 'order' | 'like' | 'comment' | 'system' | 'proposal' | 'review' | 'message' | 'invoice' | 'collaboration' | 'revision' | 'approval';
  category?: 'collaboration' | 'messages' | 'transactions' | 'general';
  timeGroup?: 'today' | 'yesterday' | 'earlier';
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  avatar?: string;
  senderName?: string;
  actionUrl?: string;
  targetPage?: ActivePage;
  badge?: string;
}

export interface ChatInvoice {
  id: string;
  serviceTitle: string;
  amount: string;
  status: 'unpaid' | 'paid';
  dueDate?: string;
  scopeSummary?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
  };
  serviceInquiry?: CreatorService;
  invoice?: ChatInvoice;
  metadata?: Record<string, any>;
}

export interface ChatConversation {
  id: string;
  creatorId: string;
  partnerId?: string;
  partnerRole?: string;
  myRole?: 'creator' | 'umkm' | 'business' | 'admin';
  name: string;
  roleTitle: string;
  avatar: string;
  verified?: boolean;
  online: boolean;
  lastSeen?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  category?: string;
  rate?: string;
}

// ==========================================
// School Dashboard & Profile Interfaces
// ==========================================
export type SchoolStatus = 'pending' | 'approved' | 'rejected';
export type AssessmentStatus = 'not_started' | 'draft' | 'completed';

export interface SchoolInfo {
  id: string;
  profileId?: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  tagline?: string;
  description?: string;
  address?: string;
  city?: string;
  website?: string;
  email?: string;
  phone?: string;
  picName?: string;
  picContact?: string;
  sectionOrder?: string[];
  isVerified?: boolean;
}

export interface StudentActivity {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  activityType: 'joined' | 'uploaded_project' | 'completed_project' | 'assessed';
  description: string;
  timestamp: string;
}

export interface SchoolDashboardOverview {
  totalStudents: number;
  activeStudents: number;
  pendingApproval: number;
  gradedStudents: number;
  ungradedStudents: number;
  totalProjects: number;
  recentActivities: StudentActivity[];
  assessmentProgress: {
    graded: number;
    draft: number;
    ungraded: number;
  };
}

export interface StudentApprovalItem {
  id: string; // relation id
  studentId: string;
  name: string;
  email: string;
  major: string;
  classGrade: string;
  graduationYear: string;
  requestDate: string;
  status: SchoolStatus;
  avatarUrl?: string;
  nisn?: string;
}

export interface RubricCriterion {
  id?: string;
  name: string;
  score: number; // 0 - 100
  weight: number; // percentage e.g. 40
  notes?: string;
}

export interface StudentAssessmentSummary {
  studentId: string;
  name: string;
  email: string;
  major: string;
  classGrade: string;
  graduationYear: string;
  nisn?: string;
  avatarUrl?: string;
  projectCount: number;
  status: AssessmentStatus;
  finalScore: number | null;
  updatedAt?: string;
}

export interface StudentAssessmentDetail {
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    major: string;
    classGrade: string;
    graduationYear: string;
    nisn?: string;
    projectCount: number;
    skills: string[];
    bio?: string;
  };
  projects: {
    id: string;
    title: string;
    category: string;
    coverImage?: string;
    createdDate: string;
    viewsCount?: string;
    isFeaturedSchool?: boolean;
  }[];
  assessment: {
    id?: string;
    status: AssessmentStatus;
    finalScore: number | null;
    rubricItems: RubricCriterion[];
    notes?: string;
  };
}

export interface SchoolAchievement {
  id: string;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
  category: string;
}

export interface PublicSchoolProfile {
  school: SchoolInfo;
  stats: {
    totalStudents: number;
    totalProjects: number;
    totalCollaborations: number;
    totalAchievements: number;
  };
  featuredProjects: {
    id: string;
    title: string;
    studentName: string;
    studentAvatar?: string;
    category: string;
    thumbnail: string;
    createdDate: string;
  }[];
  studentProjects: {
    id: string;
    title: string;
    studentName: string;
    studentAvatar?: string;
    category: string;
    thumbnail: string;
    createdDate: string;
    viewsCount?: string;
  }[];
  students: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    major: string;
    projectCount: number;
    careerScore: number;
  }[];
  achievements: SchoolAchievement[];
  sectionOrder: string[];
}

export interface SchoolStudentProjectItem {
  id: string;
  studentId: string;
  title: string;
  studentName: string;
  studentAvatar?: string;
  category: string;
  thumbnail: string;
  createdDate: string;
  viewsCount?: string;
  isFeaturedSchool?: boolean;
}

export interface SchoolStudentItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  major: string;
  classGrade: string;
  graduationYear: string;
  projectCount: number;
  careerScore: number;
  isFeatured?: boolean;
}

