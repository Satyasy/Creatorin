/**
 * Independent Verification & Final Persistence Proof Suite
 * Verifies real PostgreSQL persistence, transaction boundaries, Redis caching,
 * and security authorization boundaries.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { signJwtToken } from "../src/lib/auth-local.js";
import { getDb } from "../src/lib/db/index.js";
import { services, creatorWallets, walletTransactions, profiles, collaborationRooms } from "../src/lib/db/schema.js";
import { eq } from "drizzle-orm";
import { getRedisClient } from "../src/lib/redis.js";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000";

const CREATOR_ID = "33333333-3333-3333-3333-333333333333";
const BUSINESS_ID = "44444444-4444-4444-4444-444444444444";
const STRANGER_ID = "11111111-1111-1111-1111-111111111111"; // Unrelated user

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function verifyAll() {
  console.log("\n=======================================================");
  console.log("🔍 Running Independent Persistence & Boundary Verification");
  console.log(`Target: ${BASE_URL}`);
  console.log("=======================================================\n");

  const db = getDb();
  if (!db) throw new Error("Database not connected to PostgreSQL!");

  const redis = getRedisClient();

  const creatorToken = await signJwtToken({
    id: CREATOR_ID,
    email: "munir@creatorin.id",
    role: "creator",
    fullName: "Sobakhul Munir Siroj",
  });

  const businessToken = await signJwtToken({
    id: BUSINESS_ID,
    email: "glowlab@creatorin.id",
    role: "business",
    fullName: "GlowLab Skincare Indonesia",
  });

  const strangerToken = await signJwtToken({
    id: STRANGER_ID,
    email: "stranger@creatorin.id",
    role: "creator",
    fullName: "Stranger Test Account",
  });

  const results: { section: string; check: string; passed: boolean; details: string }[] = [];

  // --- SECTION 1: Authorization Boundaries ---
  console.log("1. Checking Authorization Boundaries...");

  // 1.1 Unauthenticated wallet request
  const unauthWallet = await request("/api/wallet");
  results.push({
    section: "Authorization",
    check: "Unauthenticated /api/wallet returns 401",
    passed: unauthWallet.status === 401,
    details: `Status: ${unauthWallet.status}`,
  });

  // 1.2 Unauthenticated withdraw request
  const unauthWithdraw = await request("/api/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount: 1000 }),
  });
  results.push({
    section: "Authorization",
    check: "Unauthenticated /api/wallet/withdraw returns 401",
    passed: unauthWithdraw.status === 401,
    details: `Status: ${unauthWithdraw.status}`,
  });

  // 1.3 Stranger accessing collaboration room
  const [anyRoom] = await db.select().from(collaborationRooms).limit(1);
  if (anyRoom) {
    const forbiddenRoom = await request(`/api/collaboration-rooms/${anyRoom.id}`, {
      headers: { Authorization: `Bearer ${strangerToken}` },
    });
    results.push({
      section: "Authorization",
      check: "Stranger forbidden from accessing private collaboration room (403)",
      passed: forbiddenRoom.status === 403,
      details: `Status: ${forbiddenRoom.status}`,
    });
  }

  // --- SECTION 2: Transaction Boundaries & Wallet Edge Cases ---
  console.log("2. Checking Transaction Boundaries on Wallet...");

  // 2.1 Withdrawal with negative amount
  const negWithdraw = await request("/api/wallet/withdraw", {
    method: "POST",
    headers: { Authorization: `Bearer ${creatorToken}` },
    body: JSON.stringify({ amount: -50000, bankName: "BCA", accountNumber: "123" }),
  });
  results.push({
    section: "Transactions",
    check: "Withdrawal rejects negative amount with 400",
    passed: negWithdraw.status === 400,
    details: `Status: ${negWithdraw.status}, error: ${negWithdraw.data?.error}`,
  });

  // 2.2 Withdrawal exceeding wallet balance
  const [currentWallet] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, CREATOR_ID));
  const excessiveAmount = (currentWallet?.balance || 0) + 100000000;
  const excessiveWithdraw = await request("/api/wallet/withdraw", {
    method: "POST",
    headers: { Authorization: `Bearer ${creatorToken}` },
    body: JSON.stringify({ amount: excessiveAmount, bankName: "BCA", accountNumber: "123" }),
  });
  results.push({
    section: "Transactions",
    check: "Withdrawal rejects amount > balance with 400",
    passed: excessiveWithdraw.status === 400 && excessiveWithdraw.data?.error?.includes("mencukupi"),
    details: `Status: ${excessiveWithdraw.status}, error: ${excessiveWithdraw.data?.error}`,
  });

  // 2.3 Withdrawal missing bank details
  const missingBankWithdraw = await request("/api/wallet/withdraw", {
    method: "POST",
    headers: { Authorization: `Bearer ${creatorToken}` },
    body: JSON.stringify({ amount: 1000 }),
  });
  results.push({
    section: "Transactions",
    check: "Withdrawal rejects missing bank name/account with 400",
    passed: missingBankWithdraw.status === 400,
    details: `Status: ${missingBankWithdraw.status}, error: ${missingBankWithdraw.data?.error}`,
  });

  // --- SECTION 3: Real PostgreSQL Write & Read-back Proof ---
  console.log("3. Proving Real PostgreSQL Persistence (Write -> Read-back -> Delete)...");

  // Create service via HTTP API
  const createServiceRes = await request("/api/services", {
    method: "POST",
    headers: { Authorization: `Bearer ${creatorToken}` },
    body: JSON.stringify({
      title: "Uji Coba Independen Persistence PostgreSQL",
      category: "Testing",
      description: "Verifikasi independen bahwa record benar-benar masuk tabel PostgreSQL",
      price: "Rp750.000",
      estimatedDays: "2 Hari Kerja",
    }),
  });

  const createdId = createServiceRes.data?.service?.id;
  let dbRowAfterCreate: any = null;
  if (createdId) {
    const [row] = await db.select().from(services).where(eq(services.id, createdId));
    dbRowAfterCreate = row;
  }

  results.push({
    section: "Persistence",
    check: "Record persisted into PostgreSQL 'services' table",
    passed: Boolean(dbRowAfterCreate && dbRowAfterCreate.title === "Uji Coba Independen Persistence PostgreSQL"),
    details: dbRowAfterCreate ? `Found in DB with ID: ${dbRowAfterCreate.id}, title: ${dbRowAfterCreate.title}` : "Not found in DB",
  });

  // Update service via HTTP API
  let dbRowAfterUpdate: any = null;
  if (createdId) {
    await request(`/api/services/${createdId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${creatorToken}` },
      body: JSON.stringify({
        title: "Uji Coba Independen Persistence PostgreSQL (Updated)",
        price: "Rp900.000",
      }),
    });
    const [row] = await db.select().from(services).where(eq(services.id, createdId));
    dbRowAfterUpdate = row;
  }

  results.push({
    section: "Persistence",
    check: "Update persisted into PostgreSQL 'services' table",
    passed: Boolean(dbRowAfterUpdate && dbRowAfterUpdate.title.includes("(Updated)")),
    details: dbRowAfterUpdate ? `Updated DB title: ${dbRowAfterUpdate.title}, price: ${dbRowAfterUpdate.price}` : "Not updated in DB",
  });

  // Delete service via HTTP API
  let dbRowAfterDelete: any = null;
  if (createdId) {
    await request(`/api/services/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const [row] = await db.select().from(services).where(eq(services.id, createdId));
    dbRowAfterDelete = row;
  }

  results.push({
    section: "Persistence",
    check: "Delete removed record from PostgreSQL 'services' table",
    passed: dbRowAfterDelete === undefined,
    details: dbRowAfterDelete === undefined ? "Confirmed: Row completely deleted from DB" : "Error: Row still exists in DB",
  });

  // --- SECTION 4: Redis Cache Invalidation ---
  console.log("4. Checking Redis Caching & Invalidation...");

  if (redis) {
    // Prime the cache
    await request("/api/profile?slug=sobakhul-munir");
    const cachedBefore = await redis.get("profile:slug:sobakhul-munir");
    
    // Invalidate via profile update
    await request("/api/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${creatorToken}` },
      body: JSON.stringify({ location: "Jakarta, Indonesia" }),
    });

    const cachedAfter = await redis.get("profile:slug:sobakhul-munir");

    results.push({
      section: "Redis Cache",
      check: "Redis cache key invalidated upon profile mutation",
      passed: Boolean(cachedBefore && !cachedAfter),
      details: `Before PUT: ${cachedBefore ? "Cached" : "Not Cached"}, After PUT: ${cachedAfter ? "Still Cached (Stale)" : "Cleanly Evicted (Null)"}`,
    });
  }

  // Print Summary Table
  console.log("\n=======================================================");
  console.log("📊 Independent Verification Summary:");
  console.log("=======================================================\n");

  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? "✅ PASS" : "❌ FAIL";
    if (!r.passed) allPassed = false;
    console.log(`${icon} [${r.section}] ${r.check}`);
    console.log(`   Evidence: ${r.details}\n`);
  }

  if (allPassed) {
    console.log("🎉 ALL INDEPENDENT PERSISTENCE & BOUNDARY CHECKS PASSED!\n");
    process.exit(0);
  } else {
    console.error("⚠️ SOME CHECKS FAILED!\n");
    process.exit(1);
  }
}

verifyAll().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
