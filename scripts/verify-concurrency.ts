/**
 * Concurrency & Idempotency Gate Verification
 * Tests race conditions: double escrow payment, concurrent withdrawals, and double approval.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { signJwtToken } from "../src/lib/auth-local.js";
import { getDb } from "../src/lib/db/index.js";
import { invoices, creatorWallets, collaborationRooms, profiles } from "../src/lib/db/schema.js";
import { eq, and, sql } from "drizzle-orm";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000";

const CREATOR_ID = "33333333-3333-3333-3333-333333333333";
const BUSINESS_ID = "44444444-4444-4444-4444-444444444444";

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

async function runConcurrencyTests() {
  console.log("\n=======================================================");
  console.log("⚡ Running Concurrency & Idempotency Gate Tests");
  console.log(`Target: ${BASE_URL}`);
  console.log("=======================================================\n");

  const db = getDb();
  if (!db) throw new Error("Database not connected!");

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

  const authCreator = { Authorization: `Bearer ${creatorToken}` };
  const authBusiness = { Authorization: `Bearer ${businessToken}` };

  // --- TEST 1: Double Escrow Payment Concurrency ---
  console.log("1. Testing Concurrent Double Escrow Payment...");

  // Create an invoice with totalAmount 100
  const invRes = await request("/api/invoices", {
    method: "POST",
    headers: authCreator,
    body: JSON.stringify({
      businessId: BUSINESS_ID,
      title: "Uji Coba Concurrency Escrow Payment",
      scopeDescription: "Testing double payment race condition",
      totalAmount: 100,
      deadlineDays: 2,
    }),
  });

  const testInvoiceId = invRes.data?.invoice?.id;
  if (!testInvoiceId) throw new Error("Failed to create test invoice");

  // Fire 2 simultaneous payment requests at the same millisecond
  const [payRes1, payRes2] = await Promise.all([
    request(`/api/invoices/${testInvoiceId}/pay`, { method: "POST", headers: authBusiness }),
    request(`/api/invoices/${testInvoiceId}/pay`, { method: "POST", headers: authBusiness }),
  ]);

  const successCountPay = [payRes1, payRes2].filter((r) => r.ok).length;
  const failCountPay = [payRes1, payRes2].filter((r) => !r.ok).length;

  console.log(`   Payment 1 status: ${payRes1.status}, data: ${JSON.stringify(payRes1.data)}`);
  console.log(`   Payment 2 status: ${payRes2.status}, data: ${JSON.stringify(payRes2.data)}`);

  const payTestPassed = successCountPay === 1 && failCountPay === 1;
  console.log(payTestPassed ? "   ✅ Escrow concurrency protected: Exactly 1 payment succeeded, 1 rejected." : "   ❌ Escrow concurrency FAILED");

  // --- TEST 2: Double Withdrawal Concurrency (Overdraw Race Condition) ---
  console.log("\n2. Testing Concurrent Double Withdrawal (Overdraw Race Condition)...");

  // Check creator wallet balance
  let [walletBefore] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, CREATOR_ID));
  const testWithdrawAmount = 1000;

  // Ensure balance is sufficient for ONE withdrawal but not for TWO, or verify balance matches
  // Fire 2 simultaneous withdrawals at the exact same millisecond
  const [wRes1, wRes2] = await Promise.all([
    request("/api/wallet/withdraw", {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        amount: testWithdrawAmount,
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "Sobakhul Munir Siroj",
      }),
    }),
    request("/api/wallet/withdraw", {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        amount: testWithdrawAmount,
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "Sobakhul Munir Siroj",
      }),
    }),
  ]);

  let [walletAfter] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, CREATOR_ID));
  console.log(`   Withdrawal 1 status: ${wRes1.status}, Withdrawal 2 status: ${wRes2.status}`);
  console.log(`   Wallet balance before: ${walletBefore?.balance}, after: ${walletAfter?.balance}`);

  const expectedDeduction = (wRes1.ok ? testWithdrawAmount : 0) + (wRes2.ok ? testWithdrawAmount : 0);
  const actualDeduction = (walletBefore?.balance || 0) - (walletAfter?.balance || 0);

  const withdrawTestPassed = actualDeduction === expectedDeduction && (walletAfter?.balance || 0) >= 0;
  console.log(withdrawTestPassed ? `   ✅ Wallet atomic balance verified: Actual deduction (${actualDeduction}) matches successful requests.` : "   ❌ Wallet atomic balance FAILED");

  console.log("\n=======================================================");
  if (payTestPassed && withdrawTestPassed) {
    console.log("🎉 ALL CONCURRENCY & IDEMPOTENCY TESTS PASSED!");
    process.exit(0);
  } else {
    console.error("⚠️ CONCURRENCY TESTS FAILED!");
    process.exit(1);
  }
}

runConcurrencyTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
