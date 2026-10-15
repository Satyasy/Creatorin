# Creatorin — Full-Stack Audit Findings & Remediation Log

## Overview
This document records all confirmed defects, missing persistence layers, fake mock states, and security/reliability issues discovered during the full-stack audit across Next.js 16 and PostgreSQL 17.

---

## Findings Summary

| ID | Category | Severity | Component / Route | Description | Status |
|---|---|---|---|---|---|
| **F-01** | Missing Route | HIGH | `/api/collaboration-rooms/[roomId]` | Room detail lookup only supported by invoice ID; direct ID lookups returned 404 | ✅ FIXED |
| **F-02** | Missing Route | HIGH | `/api/wallet/withdraw` | Creator withdrawal action was not handled by any route handler; returned 404 | ✅ FIXED |
| **F-03** | Mock / Fake Fallback | MEDIUM | `/api/wallet` | Returned hardcoded fake wallet `{ balance: 1850000 }` when unauthenticated | ✅ FIXED |
| **F-04** | Test Portability | MEDIUM | Playwright verify scripts | Hardcoded Windows Chrome path `C:\Program Files\...` broke Linux execution | ✅ FIXED |
| **F-05** | Auth Architecture | MEDIUM | `scripts/test-api.ts` | Test harness relied on `x-user-id` which is disabled in production Next.js runtime | ✅ FIXED |
| **F-06** | Test Assertion Drift | LOW | `verify-creator-dashboard.mjs` | Outdated navigation assertions did not match current Figma-aligned UI | ✅ FIXED |

---

## Detailed Findings & Fix Evidence

### Finding F-01: Direct Room Lookup Route Missing
- **File:** `src/app/api/collaboration-rooms/[roomId]/route.ts`
- **Impact:** Any component or direct link referencing a collaboration room by its primary UUID failed with 404.
- **Remediation:** Implemented `GET /api/collaboration-rooms/[roomId]/route.ts` querying `collaborationRooms` by primary ID, enforcing RBAC (creator, business participant, or admin), and eager-loading submissions, revisions, and participant profiles.

### Finding F-02: Missing Persistence for Creator Withdrawal
- **File:** `src/app/api/wallet/withdraw/route.ts`
- **Impact:** Creator balance withdrawal requests failed to persist.
- **Remediation:** Created `POST /api/wallet/withdraw/route.ts` executing inside an atomic Drizzle database transaction:
  1. Validates requested withdrawal amount $\le$ current wallet balance.
  2. Atomically decrements `creatorWallets.balance`.
  3. Inserts an immutable transaction row into `walletTransactions` with status `completed`.
  4. Dispatches an in-app notification to the creator.

### Finding F-03: Hardcoded Fake Wallet Fallback
- **File:** `src/app/api/wallet/route.ts`
- **Impact:** Unauthenticated requests or database connection disruptions silently returned a dummy balance of 1,850,000 coins, misleading client UI into displaying fake funds.
- **Remediation:** Replaced fake fallback with explicit `401 Unauthorized` and `503 Service Unavailable` status responses.

### Finding F-04: Hardcoded Windows Chrome Executable in Verification Scripts
- **File:** `scripts/verify-creator-dashboard.mjs`, `scripts/verify-explore.mjs`
- **Impact:** Playwright tests crashed immediately on Linux servers with `Failed to launch chromium because executable doesn't exist at C:\Program Files...`.
- **Remediation:** Added platform-adaptive launcher detecting `process.env.CHROME_PATH`, `process.platform === 'win32'`, and falling back seamlessly to Playwright's bundled headless Chromium.

### Finding F-05: Missing Production JWT Bearer Auth in Automated Test Suite
- **File:** `scripts/test-api.ts`
- **Impact:** `test-api.ts` failed with 31 cascading 401/404/405 errors when executed against production server builds.
- **Remediation:** Integrated `signJwtToken` from `src/lib/auth-local.ts` to sign authentic HS256 JWT tokens for test personas (`creator`, `business`, `school`) and pass valid `Authorization: Bearer <token>` headers.
