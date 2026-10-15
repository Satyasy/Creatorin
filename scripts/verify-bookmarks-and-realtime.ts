/**
 * verify-bookmarks-and-realtime.ts
 * Automated persistence verification for Bookmarks, Chat Read Receipts, and Banner Persistence.
 */
import postgres from "postgres";
import { SignJWT } from "jose";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://creatorin_user:creatorin_secure_2026@localhost:5432/creatorin_db";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "creatorin_dev_secret_key_change_in_production");
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const CREATOR_ID = "147e4d43-cde1-4ec4-82f6-30dabd6c8025";
const BUSINESS_ID = "258e4d43-cde1-4ec4-82f6-30dabd6c8026";

async function createToken(userId: string, email: string, role: string) {
  return await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data.error || JSON.stringify(data)}`);
  }
  return data;
}

let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`• Testing: ${name}... `);
    await fn();
    console.log("✅ PASSED");
    passed++;
  } catch (err: any) {
    console.log(`❌ FAILED\n  Error: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log("=============================================================");
  console.log("🚀 Creatorin Bookmarks, Realtime Chat & Banner Persistence Tests");
  console.log(`Target: ${BASE_URL}`);
  console.log("=============================================================\n");

  const sql = postgres(DATABASE_URL);

  const creatorToken = await createToken(CREATOR_ID, "creator.demo@creatorin.id", "creator");
  const businessToken = await createToken(BUSINESS_ID, "umkm.demo@creatorin.id", "business");

  const authCreator = { Authorization: `Bearer ${creatorToken}`, "Content-Type": "application/json" };
  const authBusiness = { Authorization: `Bearer ${businessToken}`, "Content-Type": "application/json" };

  try {
    // -------------------------------------------------------------
    // 1. BOOKMARK PERSISTENCE TESTS
    // -------------------------------------------------------------
    const testProjectId = "proj-test-bm-1";

    await runTest("POST /api/bookmarks: Add project to favorites", async () => {
      const res = await request("/api/bookmarks", {
        method: "POST",
        headers: authCreator,
        body: JSON.stringify({ targetType: "project", targetId: testProjectId }),
      });
      if (res.bookmarked !== true) throw new Error("Expected bookmarked: true");
    });

    await runTest("Database Check: Bookmark row exists in PostgreSQL bookmarks table", async () => {
      const rows = await sql`
        SELECT * FROM bookmarks 
        WHERE user_id = ${CREATOR_ID} AND target_type = 'project' AND target_id = ${testProjectId}
      `;
      if (rows.length !== 1) throw new Error(`Expected 1 row, found ${rows.length}`);
    });

    await runTest("GET /api/bookmarks: Retrieve user bookmarks", async () => {
      const res = await request("/api/bookmarks?targetType=project", {
        headers: authCreator,
      });
      if (!Array.isArray(res.bookmarks) || !res.bookmarks.includes(testProjectId)) {
        throw new Error("Target project ID not present in bookmarks array");
      }
    });

    await runTest("POST /api/bookmarks: Toggle off (remove) bookmark", async () => {
      const res = await request("/api/bookmarks", {
        method: "POST",
        headers: authCreator,
        body: JSON.stringify({ targetType: "project", targetId: testProjectId }),
      });
      if (res.bookmarked !== false) throw new Error("Expected bookmarked: false");

      const rows = await sql`
        SELECT * FROM bookmarks 
        WHERE user_id = ${CREATOR_ID} AND target_type = 'project' AND target_id = ${testProjectId}
      `;
      if (rows.length !== 0) throw new Error(`Expected 0 rows after delete, found ${rows.length}`);
    });

    // -------------------------------------------------------------
    // 2. CHAT READ RECEIPT TESTS
    // -------------------------------------------------------------
    let testConvId = "";
    await runTest("Setup: Ensure active conversation exists between Creator & Business", async () => {
      const convRes = await request("/api/conversations", {
        method: "POST",
        headers: authBusiness,
        body: JSON.stringify({ recipientId: CREATOR_ID }),
      });
      testConvId = convRes.conversation?.id;
      if (!testConvId) throw new Error("Conversation ID missing");
    });

    let sentMsgId = "";
    await runTest("POST /api/messages: Business sends a new message to Creator (status: delivered)", async () => {
      const msgRes = await request("/api/messages", {
        method: "POST",
        headers: authBusiness,
        body: JSON.stringify({
          conversationId: testConvId,
          content: "Halo! Apakah ready untuk kolaborasi minggu ini?",
        }),
      });
      sentMsgId = msgRes.message?.id;
      if (!sentMsgId) throw new Error("Message ID missing");
      if (msgRes.message.isRead !== false) throw new Error("Expected newly sent message to have isRead = false");
    });

    await runTest("Database Check: Message has is_read = false in PostgreSQL", async () => {
      const [row] = await sql`SELECT is_read FROM messages WHERE id = ${sentMsgId}`;
      if (!row || row.is_read !== false) throw new Error("is_read should be false in PostgreSQL");
    });

    await runTest("POST /api/messages/read: Creator opens chat and acknowledges messages", async () => {
      const readRes = await request("/api/messages/read", {
        method: "POST",
        headers: authCreator,
        body: JSON.stringify({ conversationId: testConvId }),
      });
      if (readRes.success !== true) throw new Error("Expected success: true");
    });

    await runTest("Database Check: Message has is_read = true in PostgreSQL after read endpoint", async () => {
      const [row] = await sql`SELECT is_read FROM messages WHERE id = ${sentMsgId}`;
      if (!row || row.is_read !== true) throw new Error("is_read must be true in PostgreSQL after read receipt");
    });

    // -------------------------------------------------------------
    // 3. BANNER PERSISTENCE TESTS
    // -------------------------------------------------------------
    const testBannerUrl = "/uploads/avatars/test-banner-persistent-2026.png";

    await runTest("PUT /api/profile: Update Creator coverUrl", async () => {
      await request("/api/profile", {
        method: "PUT",
        headers: authCreator,
        body: JSON.stringify({ coverUrl: testBannerUrl }),
      });
    });

    await runTest("Database Check: profiles.cover_url matches in PostgreSQL", async () => {
      const [row] = await sql`SELECT cover_url FROM profiles WHERE id = ${CREATOR_ID}`;
      if (!row || row.cover_url !== testBannerUrl) {
        throw new Error(`Expected ${testBannerUrl}, got ${row?.cover_url}`);
      }
    });

    await runTest("GET /api/creators/[id]: Returns persistent coverUrl from server", async () => {
      const res = await request(`/api/creators/${CREATOR_ID}`);
      if (res.creator?.coverUrl !== testBannerUrl) {
        throw new Error(`Expected coverUrl ${testBannerUrl}, got ${res.creator?.coverUrl}`);
      }
    });

    console.log("\n=============================================================");
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log("=============================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
