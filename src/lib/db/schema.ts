import { pgTable, text, timestamp, uuid, integer, decimal, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("user_role", ["admin", "creator", "business", "school"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["unpaid", "paid", "cancelled"]);
export const roomStatusEnum = pgEnum("room_status", ["in_progress", "review_pending", "revision_requested", "completed", "disputed"]);
export const schoolStatusEnum = pgEnum("school_status", ["pending", "approved", "rejected"]);
export const assessmentStatusEnum = pgEnum("assessment_status", ["not_started", "draft", "completed"]);

// 1. Unified Profiles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // matches unique user uuid
  role: roleEnum("role").notNull().default("creator"),
  fullName: text("full_name").notNull(),
  email: text("email"),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  phone: text("phone"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Creator Specific Profiles
export const creatorProfiles = pgTable("creator_profiles", {
  profileId: uuid("profile_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  slug: text("slug").unique().notNull(),
  headline: text("headline").notNull(),
  bio: text("bio"),
  careerScore: integer("career_score").default(0).notNull(),
  completedProjectsCount: integer("completed_projects_count").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0").notNull(),
  reviewsCount: integer("reviews_count").default(0).notNull(),
  followersCount: text("followers_count").default("0").notNull(),
  schoolId: uuid("school_id"),
  schoolName: text("school_name"),
  schoolStatus: schoolStatusEnum("school_status").default("pending"),
  graduationYear: text("graduation_year"),
  major: text("major"),
  classGrade: text("class_grade"),
  nisn: text("nisn"),
  startingPrice: text("starting_price").default("").notNull(),
  skills: jsonb("skills").$type<string[]>().default([]).notNull(),
  languages: jsonb("languages").$type<string[]>().default([]).notNull(),
  isPro: boolean("is_pro").default(false).notNull(),
  isPromoted: boolean("is_promoted").default(false).notNull(),
  responseTime: text("response_time").default("").notNull(),
  onTimeRate: integer("on_time_rate").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Business / UMKM Profiles
export const businessProfiles = pgTable("business_profiles", {
  profileId: uuid("profile_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  businessCategory: text("business_category").notNull(),
  description: text("description"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Enhanced Schools & Partners
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  tagline: text("tagline"),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  picName: text("pic_name"),
  picContact: text("pic_contact"),
  sectionOrder: jsonb("section_order").$type<string[]>().default(["featured_projects", "students", "achievements", "about"]).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4b. Legacy School Profiles
export const schoolProfiles = pgTable("school_profiles", {
  profileId: uuid("profile_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  schoolName: text("school_name").notNull(),
  picName: text("pic_name").notNull(),
  picContact: text("pic_contact"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4c. Student School Relations (Approval & Enrollment)
export const studentSchoolRelations = pgTable("student_school_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  schoolId: uuid("school_id").references(() => schools.id, { onDelete: "cascade" }).notNull(),
  schoolStatus: schoolStatusEnum("school_status").default("pending").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  graduationYear: text("graduation_year").notNull().default(""),
  major: text("major").notNull().default(""),
  classGrade: text("class_grade").notNull().default(""),
  nisn: text("nisn"),
  requestDate: timestamp("request_date").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4d. School Assessments
export const schoolAssessments = pgTable("school_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  schoolId: uuid("school_id").references(() => schools.id, { onDelete: "cascade" }).notNull(),
  status: assessmentStatusEnum("status").default("not_started").notNull(),
  finalScore: decimal("final_score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  assessedBy: uuid("assessed_by").references(() => profiles.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4e. Assessment Rubric Items
export const assessmentItems = pgTable("assessment_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessmentId: uuid("assessment_id").references(() => schoolAssessments.id, { onDelete: "cascade" }).notNull(),
  criterion: text("criterion").notNull(),
  score: integer("score").notNull().default(0),
  weight: integer("weight").notNull().default(20), // e.g. 40 for 40%
  notes: text("notes"),
});

// 4f. School Achievements
export const schoolAchievements = pgTable("school_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id").references(() => schools.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  year: text("year").notNull(),
  imageUrl: text("image_url"),
  category: text("category").default("Kompetisi").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Marketplace Services
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(), // e.g. "Rp1.500.000"
  priceNumeric: integer("price_numeric").default(0).notNull(),
  estimatedDays: text("estimated_days").notNull(), // e.g. "2 Hari Kerja"
  shapeIdx: integer("shape_idx").default(0).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Portfolio Projects
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("Karya Kreatif").notNull(),
  creatorHandle: text("creator_handle").notNull(),
  viewsCount: text("views_count").default("0").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type").default("shader").notNull(),
  externalLink: text("external_link"),
  isFeaturedSchool: boolean("is_featured_school").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectComments = pgTable("project_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Project Briefs (Lowongan dari UMKM)
export const projectBriefs = pgTable("project_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  expectedOutput: text("expected_output"),
  budget: text("budget").notNull(),
  deadline: text("deadline"),
  status: text("status").default("open").notNull(), // "open", "in_progress", "closed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Brief Applications (Lamaran dari Creator)
export const briefApplications = pgTable("brief_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id").references(() => projectBriefs.id, { onDelete: "cascade" }).notNull(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  pitch: text("pitch"),
  proposedPrice: text("proposed_price"),
  status: text("status").default("pending").notNull(), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Conversations & Messages
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  participant1Id: uuid("participant_1_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  participant2Id: uuid("participant_2_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: uuid("sender_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  serviceQuoteId: uuid("service_quote_id").references(() => services.id, { onDelete: "set null" }),
  isRead: boolean("is_read").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Invoices & Payments
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: text("invoice_number").unique().notNull(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  businessId: uuid("business_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  scopeDescription: text("scope_description").notNull(),
  totalAmount: integer("total_amount").notNull(),
  deadlineDays: integer("deadline_days").default(3).notNull(),
  revisionRules: text("revision_rules").default("Maksimal 2 kali revisi minor."),
  status: invoiceStatusEnum("status").default("unpaid").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Collaboration Rooms & Submissions
export const collaborationRooms = pgTable("collaboration_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).unique().notNull(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  businessId: uuid("business_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  briefSummary: text("brief_summary").notNull(),
  deadline: timestamp("deadline"),
  status: roomStatusEnum("status").default("in_progress").notNull(),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").references(() => collaborationRooms.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").default(1).notNull(),
  notes: text("notes"),
  fileUrls: jsonb("file_urls").$type<string[]>().default([]).notNull(),
  status: text("status").default("pending").notNull(), // "pending", "approved", "revision_requested"
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const revisions = pgTable("revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").references(() => collaborationRooms.id, { onDelete: "cascade" }).notNull(),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "cascade" }).notNull(),
  feedback: text("feedback").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

// 12. Reviews & Ratings
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  reviewerId: uuid("reviewer_id").references(() => profiles.id, { onDelete: "set null" }),
  roomId: uuid("room_id").references(() => collaborationRooms.id, { onDelete: "set null" }),
  reviewerName: text("reviewer_name").notNull(),
  reviewerRole: text("reviewer_role").notNull(),
  reviewerAvatar: text("reviewer_avatar").default("/creatorin/avatar.png").notNull(),
  projectTitle: text("project_title").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  comment: text("comment").notNull(),
  completedDate: text("completed_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // message, invoice, submission, approval, review
  title: text("title").notNull(),
  body: text("body").notNull(),
  linkUrl: text("link_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  notifyPush: boolean("notify_push").default(true).notNull(),
  language: text("language").default("id").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 14. Creator Wallet & Transactions
export const creatorWallets = pgTable("creator_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => profiles.id, { onDelete: "cascade" }).unique().notNull(),
  balance: integer("balance").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").references(() => creatorWallets.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // "credit_payment", "withdrawal", "points_conversion"
  amount: integer("amount").notNull(),
  description: text("description"),
  status: text("status").default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. User Bookmarks / Saved Items
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  targetType: text("target_type").notNull(), // 'creator' | 'project' | 'service' | 'brief'
  targetId: text("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  creatorProfile: one(creatorProfiles, {
    fields: [profiles.id],
    references: [creatorProfiles.profileId],
  }),
  businessProfile: one(businessProfiles, {
    fields: [profiles.id],
    references: [businessProfiles.profileId],
  }),
  schoolProfile: one(schoolProfiles, {
    fields: [profiles.id],
    references: [schoolProfiles.profileId],
  }),
  services: many(services),
  projects: many(projects),
  reviews: many(reviews),
  notifications: many(notifications),
  bookmarks: many(bookmarks),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  creator: one(profiles, {
    fields: [services.creatorId],
    references: [profiles.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  creator: one(profiles, {
    fields: [projects.creatorId],
    references: [profiles.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  creator: one(profiles, {
    fields: [reviews.creatorId],
    references: [profiles.id],
  }),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [schools.profileId],
    references: [profiles.id],
  }),
  studentRelations: many(studentSchoolRelations),
  assessments: many(schoolAssessments),
  achievements: many(schoolAchievements),
}));

export const studentSchoolRelationsRelations = relations(studentSchoolRelations, ({ one }) => ({
  student: one(profiles, {
    fields: [studentSchoolRelations.studentId],
    references: [profiles.id],
  }),
  school: one(schools, {
    fields: [studentSchoolRelations.schoolId],
    references: [schools.id],
  }),
}));

export const schoolAssessmentsRelations = relations(schoolAssessments, ({ one, many }) => ({
  student: one(profiles, {
    fields: [schoolAssessments.studentId],
    references: [profiles.id],
  }),
  school: one(schools, {
    fields: [schoolAssessments.schoolId],
    references: [schools.id],
  }),
  items: many(assessmentItems),
}));

export const assessmentItemsRelations = relations(assessmentItems, ({ one }) => ({
  assessment: one(schoolAssessments, {
    fields: [assessmentItems.assessmentId],
    references: [schoolAssessments.id],
  }),
}));

export const schoolAchievementsRelations = relations(schoolAchievements, ({ one }) => ({
  school: one(schools, {
    fields: [schoolAchievements.schoolId],
    references: [schools.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(profiles, {
    fields: [bookmarks.userId],
    references: [profiles.id],
  }),
}));
