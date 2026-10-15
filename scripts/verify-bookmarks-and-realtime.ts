/**
 * verify-bookmarks-and-realtime.ts
 * Automated persistence verification for Bookmarks, Chat Read Receipts, and Banner Persistence.
 */
import postgres from "postgres";
import fs from "fs";
import path from "path";
import { signJwtToken } from "../src/lib/auth-local.js";

const DATABASE_URL = process.env.DATABASE_URL || "postgres://creatorin_user:creatorin_secure_2026@localhost:5432/creatorin_db";
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const CREATOR_ID = "33333333-3333-3333-3333-333333333333";
const BUSINESS_ID = "44444444-4444-4444-4444-444444444444";

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

  // Record initial creator cover
  const [initialCreator] = await sql`SELECT cover_url FROM profiles WHERE id = ${CREATOR_ID}`;
  const initialCreatorCover = initialCreator?.cover_url || "linear-gradient(135deg, #0B1F3A 0%, #155DFC 100%)";

  // Create physical banner file so Nginx never returns 404
  const uploadsDir = "/var/www/creatorin/shared/uploads/avatars";
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const bannerFilename = "test-banner-persistent-2026.png";
  const bannerFilePath = path.join(uploadsDir, bannerFilename);
  const sampleImage = "/var/www/creatorin/repo/public/creatorin/avatar.png";
  if (fs.existsSync(sampleImage)) {
    fs.copyFileSync(sampleImage, bannerFilePath);
  } else {
    const dummyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    fs.writeFileSync(bannerFilePath, dummyPng);
  }

  const creatorToken = await signJwtToken({
    id: CREATOR_ID,
    email: "munir@creatorin.id",
    role: "creator",
    fullName: "Sobakhul Munir Siroj",
  });
  const businessToken = await signJwtToken({
    id: BUSINESS_ID,
    email: "glowlab@creatorin.my.id",
    role: "business",
    fullName: "GlowLab Skincare Indonesia",
  });

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
      const exists = Array.isArray(res.bookmarks) && res.bookmarks.some((b: any) => b.targetId === testProjectId || b === testProjectId);
      if (!exists) {
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
    console.log("\n--- CLEANUP: Restoring creator coverUrl and cleaning up temporary test files ---");
    try {
      await sql`UPDATE profiles SET cover_url = ${initialCreatorCover} WHERE id = ${CREATOR_ID}`;
      console.log("✅ Creator coverUrl restored in PostgreSQL.");
    } catch (e) {
      console.error("⚠️ Failed to restore creator coverUrl:", e);
    }

    try {
      if (fs.existsSync(bannerFilePath)) fs.unlinkSync(bannerFilePath);
      console.log("✅ Temporary test banner unlinked from disk.");
    } catch (e) {
      console.warn("⚠️ Could not unlink temporary test banner:", e);
    }

    await sql.end();
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
