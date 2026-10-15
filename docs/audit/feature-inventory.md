# Creatorin — Feature Inventory & Persistence Mapping

## Overview
This document inventories all user-facing application flows across the 4 primary personas (**Creator**, **UMKM / Business**, **SMK / School**, and **Admin**) and maps their respective persistence layers (API routes, PostgreSQL tables, caching, and state behaviors).

---

## 1. Creator Flows

| Flow / Feature | UI Route | API Endpoint | PostgreSQL Tables | Persistence Verification |
|---|---|---|---|---|
| **Public Profile & Slug Discovery** | `/profile?slug=...` | `GET /api/profile?slug=...` | `profiles`, `creator_profiles` | Reads live DB with Redis caching |
| **Profile & Bio Edit** | `/profile` (tab=edit) | `PUT /api/profile` | `profiles`, `creator_profiles` | Updates `fullName`, `avatarUrl`, `coverUrl`, `skills`, `headline`, `bio` |
| **Onboarding Wizard** | `/onboarding` | `GET/POST /api/onboarding` | `profiles`, `creator_profiles` | Saves initial creator headline, skills, starting price |
| **Marketplace Service CRUD** | `/dashboard/layanan` | `GET/POST/PUT/DELETE /api/services` & `.../[id]` | `services`, `profiles` | Creates service with image upload, full DB write & delete |
| **Portfolio Project CRUD** | `/proyek` | `GET/POST/PUT/DELETE /api/projects` & `.../[id]` | `projects`, `profiles` | Uploads project showcase, writes metadata & media URLs |
| **Apply to Brief** | `/briefs/[id]` | `POST /api/briefs/[id]/apply` | `brief_applications`, `project_briefs` | Validates duplicate prevention, inserts application row |
| **Submit Work Draft** | `/contracts` (room modal) | `POST /api/collaboration-rooms/[roomId]/submissions` | `submissions`, `collaboration_rooms` | Records versioned submission, updates room status |
| **Create Invoice** | `/chat` (invoice creation) | `POST /api/invoices` | `invoices`, `conversations` | Inserts unpaid invoice, attaches to conversation thread |
| **Wallet & Earnings** | `/wallet` | `GET /api/wallet`, `GET /api/wallet/balance` | `creator_wallets`, `wallet_transactions` | Live balance calculation, transaction audit trail |
| **Withdrawal Request** | `/wallet` | `POST /api/wallet/withdraw` | `creator_wallets`, `wallet_transactions`, `notifications` | Atomic transaction deducting balance & recording withdrawal |

---

## 2. UMKM / Business Flows

| Flow / Feature | UI Route | API Endpoint | PostgreSQL Tables | Persistence Verification |
|---|---|---|---|---|
| **Post Project Brief** | `/brief/new`, `/briefs` | `POST /api/briefs` | `project_briefs`, `business_profiles` | Inserts open brief with budget & scope |
| **Review & Accept Applicant** | `/briefs/[id]` | `POST /api/briefs/[id]/applications/[appId]/accept` | `brief_applications`, `project_briefs`, `conversations`, `messages`, `notifications` | Updates status, initializes chat thread, dispatches notification |
| **Chat with Creator** | `/chat` | `GET/POST /api/messages`, `GET /api/conversations` | `messages`, `conversations`, `profiles` | Live message persistence and conversation update |
| **Pay Invoice & Escrow** | `/invoice/[id]` | `POST /api/invoices/[id]/pay` | `invoices`, `collaboration_rooms`, `creator_wallets`, `wallet_transactions`, `notifications` | Atomic escrow hold, room creation, status `paid` |
| **Request Revision** | `/contracts` (room modal) | `POST /api/collaboration-rooms/[roomId]/revisions` | `revisions`, `collaboration_rooms` | Inserts revision note, updates room status to `revision_requested` |
| **Approve Final Work & Release Escrow** | `/contracts` (room modal) | `POST /api/collaboration-rooms/[roomId]/approve` | `collaboration_rooms`, `creator_wallets`, `wallet_transactions`, `notifications` | Marks room completed, credits creator wallet |
| **Submit Creator Review** | `/contracts` (completed) | `POST /api/reviews` | `reviews`, `creator_profiles` | Stores star rating & comment, updates creator score |

---

## 3. SMK / School Partner Flows

| Flow / Feature | UI Route | API Endpoint | PostgreSQL Tables | Persistence Verification |
|---|---|---|---|---|
| **School Institutional Profile** | `/school/[slug]` | `GET /api/school/data?slug=...` | `schools`, `school_achievements`, `projects`, `profiles` | Public school showcase with student accomplishments |
| **School Admin Dashboard** | `/dashboard/school` | `GET /api/school/data` | `schools`, `student_school_relations`, `school_assessments`, `profiles` | Institutional metrics, enrollment stats |
| **Student Enrollment Approval** | `/dashboard/school` | `POST /api/school/data` (action=approval) | `student_school_relations` | Updates student affiliation status (`approved` / `rejected`) |
| **Rubric Assessment** | `/dashboard/school` | `POST /api/school/data` (action=assessment) | `school_assessments`, `assessment_items` | Scores students on 4 rubric criteria, calculates weighted GPA |
| **School Achievements CRUD** | `/dashboard/school` | `POST /api/school/data` (action=achievement) | `school_achievements` | Persists competition awards and institutional badges |

---

## 4. Platform Administration & Global Flows

| Flow / Feature | UI Route | API Endpoint | PostgreSQL Tables | Persistence Verification |
|---|---|---|---|---|
| **Admin Analytics & Stats** | `/admin` | `GET /api/admin/stats` | `profiles`, `project_briefs`, `invoices`, `services` | Real-time aggregate counts and transaction volume |
| **User Management** | `/admin` | `GET/PUT /api/admin/users` | `profiles` | User moderation, role assignment, verification status |
| **Notifications Center** | `/notifications` | `GET/PUT /api/notifications` | `notifications` | Live notification feed and mark-as-read status |
| **Account Settings & Security**| `/settings` | `GET/PUT /api/account/settings` | `profiles`, `user_settings` | Password re-hashing (scrypt), preferences update |
| **File / Media Uploads** | Direct uploader | `POST /api/upload` | Server disk `/var/www/creatorin/shared/uploads/` | Image validation (size, MIME), persistent storage link |
