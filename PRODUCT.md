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

Curated Indonesian creators with built-in Collaboration Rooms, standardized two-way project briefs (service listings and open client briefs), upfront secure single-payment invoicing, and verified career score tracking.

## Operating Context

- Web application built on Next.js 16 (App Router), React 19, and Tailwind CSS v4.
- Established UI prototype and comprehensive page structure covering 42 pages specified in [daftar_halaman_web_app_creatorin.md](file:///C:/Users/Netra%20Ops/Documents/www/creatorin/daftar_halaman_web_app_creatorin.md).
- Immediate engineering focus is backend architecture, database integration, authentication, and API implementation while preserving the existing frontend layout.

## Capabilities and Constraints

- **Scope & Hierarchy**: 42 pages spanning 15 functional modules: Public pages, Onboarding, Logged-in Home, Profile, Services, Projects, Project Briefs, Messaging, Invoice & Payment, Collaboration Room, Rating & Review, Notifications, Points & Wallet, School Dashboard, and Account Settings.
- **Frontend Invariance Constraint**: Do not alter frontend page layouts; UI changes are restricted strictly to micro-refinements (border radii, card surfaces, and typography polish).
- **Separation of Collaboration Phases**: Pre-deal negotiation occurs in direct messaging with quotation/invoice generation; the official Collaboration Room activates only after upfront single payment confirmation.
- **Undecided Product Facts**: School verification requirements and student data visibility boundaries (ASSUMPTION in spec); creator balance withdrawal fees and minimum thresholds (ASSUMPTION in spec); specific multi-criteria weighting for rating calculations.

## Brand Commitments

- **Name**: Creatorin (`creatorin.id`).
- **Voice & Tone**: Approachable, professional, empowering, localized to Indonesian creative and commercial culture.
- **Language**: Indonesian (Bahasa Indonesia) as the primary interface language, retaining industry-standard creative terms (e.g., TikTok UGC, Brand Identity, Feed Instagram, Collaboration Room).

## Evidence on Hand

- Functional Next.js App Router codebase with working UI routes (`/`, `/pesan`, `/profile`, `/proyek/...`).
- Project documentation [daftar_halaman_web_app_creatorin.md](file:///C:/Users/Netra%20Ops/Documents/www/creatorin/daftar_halaman_web_app_creatorin.md) detailing all 42 pages, roles, and components.
- Static assets and logos located in `public/creatorin/`.

## Product Principles

1. **Preserve Frontend Structure**: The layout and component structure defined in the design and page list are authoritative; backend development conforms to these interfaces without restructuring layouts.
2. **Two-Way Marketplace Flexibility**: Enable both creator-led offerings (direct service catalog) and client-led hiring (custom project briefs).
3. **Structured Milestone Governance**: Transition cleanly from negotiation to execution via single-payment invoice settlement and milestone-driven Collaboration Rooms.
4. **Verifiable Reputation**: Creator career scores and showcases derive from completed Collaboration Room deliverables and verified client reviews.

## Accessibility & Inclusion

- Semantic HTML and ARIA labels across navigation, search tabs, and interactive triggers.
- High-contrast typography and clear form states accommodating diverse device resolutions and Indonesian business owners.
