# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Business / UMKM**: Indonesian micro, small, and medium businesses, local brands, and agencies looking for reliable creative talent for digital marketing, brand identity, packaging, and UGC video assets.
- **Creator**: Indonesian creative talents, freelancers, and vocational/design students offering specialized services (TikTok UGC, graphic design, social media feeds, photography, video production).
- **Sekolah (Partner Schools)**: Educational institutions monitoring student-creators' career development, real-world project experience, and portfolio progress.
- **Guest**: Visitors exploring creators, service listings, and project portfolios before registering.

## Product Purpose

Creatorin is a creative collaboration platform and digital service marketplace connecting Indonesian businesses and UMKM with curated creative talents. It streamlines discovery, standardized brief creation, milestone delivery, and transparent transactions from first pitch to final asset handoff.

## Positioning

Curated Indonesian creators with built-in Collaboration Rooms, standardized two-way project briefs (service listings and open client briefs), coin-based payment system and escrow, and verified career score tracking.

## Operating Context

- Web application built on Next.js 16 (App Router), React 19, and Tailwind CSS v4.
- Established UI prototype and comprehensive page structure covering 44 pages specified in [daftar_halaman_web_app_creatorin.md](./daftar_halaman_web_app_creatorin.md).
- Immediate engineering focus is a working prototype for JHIC 2026 with both frontend redesign and backend completion.

## Capabilities and Constraints

- **Scope & Hierarchy**: 44 pages spanning 15 functional modules: Public pages, Onboarding, Logged-in Home, Profile, Services, Projects, Project Briefs, Messaging, Invoice & Payment, Collaboration Room, Rating & Review, Notifications, Coin & Wallet, School Dashboard, and Account Settings.
- **Design Evolution Principle**: Redesign of layout and components is allowed, but brand identity must be preserved including colors (primary blue #155DFC, secondary light blue #03ACFD), logo, name "Creatorin", and the sitemap structure.
- **Separation of Collaboration Phases**: Pre-deal negotiation occurs in direct messaging with quotation/invoice generation; the official Collaboration Room activates only after coin-based escrow confirmation.
- **Undecided Product Facts**: Sertifikat accreditation partners.

## Brand Commitments

- **Name**: Creatorin (`creatorin.id`).
- **Voice & Tone**: Approachable, professional, empowering, localized to Indonesian creative and commercial culture.
- **Language**: Indonesian (Bahasa Indonesia) as the primary interface language, retaining industry-standard creative terms (e.g., TikTok UGC, Brand Identity, Feed Instagram, Collaboration Room).

## Evidence on Hand

- Functional Next.js App Router codebase with working UI routes (`/`, `/pesan`, `/profile`, `/proyek/...`).
- Project documentation [daftar_halaman_web_app_creatorin.md](./daftar_halaman_web_app_creatorin.md) detailing all 44 pages, roles, and components.
- Static assets and logos located in `public/creatorin/`.

## Product Principles

1. **Design Evolution**: Redesign of layout and components is allowed while preserving brand identity (colors, logo, sitemap structure).
2. **Two-Way Marketplace Flexibility**: Enable both creator-led offerings (direct service catalog) and client-led hiring (custom project briefs).
3. **Structured Milestone Governance**: Transition cleanly from negotiation to execution via coin-based escrow settlement and milestone-driven Collaboration Rooms.
4. **Verifiable Reputation**: Creator career scores and showcases derive from completed Collaboration Room deliverables and verified client reviews.
5. **Coin Economy**: A transparent coin system (1 coin = Rp1,000) enables secure escrow, reduces payment gateway overhead, and creates platform stickiness.

## Accessibility & Inclusion

- Semantic HTML and ARIA labels across navigation, search tabs, and interactive triggers.
- High-contrast typography and clear form states accommodating diverse device resolutions and Indonesian business owners.
