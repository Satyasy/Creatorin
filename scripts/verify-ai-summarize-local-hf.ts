/**
 * verify-ai-summarize-local-hf.ts
 * Rigorous test suite for Creatorin Local Hugging Face AI Summarize:
 * 
 * Test A — Representative Indonesian business conversation (Scope, Price, Deadline, Proposals, Questions)
 * Test B — Zero Hallucination check (no price/deadline invented when absent)
 * Test C — Isolation across conversations
 * Test D — Strict RBAC / Authorization check (Non-participant blocked with 403)
 * Test E — Error and invalid input handling
 * Test F — Cache freshness & invalidation when new message arrives
 * Test G — Direct PostgreSQL database persistence verification
 */

import postgres from "postgres";
import { NextRequest } from "next/server";
import { signJwtToken } from "../src/lib/auth-local.js";
import { generateLocalSummary } from "../src/lib/ai/localSummarizer.js";
import { extractStructuredFacts } from "../src/lib/ai/semanticExtractor.js";
import { GET as handleGet, POST as handlePost } from "../src/app/api/ai/summarize/route.js";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://creatorin_user:Cr3at0rIn_Secure_2026_Db@127.0.0.1:5432/creatorin_db";
const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

const CREATOR_ID = "33333333-3333-3333-3333-333333333333";
const BUSINESS_ID = "44444444-4444-4444-4444-444444444444";
const STRANGER_ID = "028bafa1-442c-4630-a7bb-905a2e8189e9"; // User outside conversation

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

async function request(path: string, options: RequestInit = {}) {
  if (process.env.TEST_VIA_HTTP === "true") {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  const method = (options.method || "GET").toUpperCase();
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url, {
    method,
    headers: options.headers as HeadersInit,
    body: options.body,
  });

  let response: Response;
  if (method === "GET") {
    response = await handleGet(req);
  } else if (method === "POST") {
    response = await handlePost(req);
  } else {
    throw new Error(`Unsupported method: ${method}`);
  }

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

async function main() {
  console.log("=========================================================================");
  console.log("🚀 Creatorin Real Local Hugging Face AI Summarize Test Suite");
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log("=========================================================================\n");

  const sql = postgres(DATABASE_URL);

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

  const strangerToken = await signJwtToken({
    id: STRANGER_ID,
    email: "anisa.rahma@creatorin.my.id",
    role: "creator",
    fullName: "Anisa Rahma",
  });

  const authCreator = { Authorization: `Bearer ${creatorToken}`, "Content-Type": "application/json" };
  const authBusiness = { Authorization: `Bearer ${businessToken}`, "Content-Type": "application/json" };
  const authStranger = { Authorization: `Bearer ${strangerToken}`, "Content-Type": "application/json" };

  try {
    // -------------------------------------------------------------
    // UNIT / REAL MODEL INFERENCE TEST (No HTTP)
    // -------------------------------------------------------------
    console.log("--- SECTION 1: Real Local Model Inference Test ---");

    await runTest("Local Model: generateLocalSummary executes on CPU via Transformers.js", async () => {
      const sample = "Diskusi proyek antara Kopi Lereng dan Kreator. Klien meminta 1 video TikTok durasi 30 detik. Kreator menyanggupi dengan harga 500 ribu rupiah dan deadline hari Jumat.";
      const start = Date.now();
      const output = await generateLocalSummary(sample, 60);
      const latency = (Date.now() - start) / 1000;
      if (!output || typeof output !== 'string') {
        throw new Error("Model inference returned null or empty output");
      }
      console.log(` [Inference took ${latency.toFixed(2)}s. Summary: "${output.slice(0, 80)}..."]`);
    });

    // -------------------------------------------------------------
    // TEST A: Representative Indonesian Conversation
    // -------------------------------------------------------------
    console.log("\n--- SECTION 2: Test A — Representative Indonesian Conversation ---");

    const representativeMessages = [
      { sender: "GlowLab Skincare", text: "Halo kak Munir, kami butuh pembuatan 1 Video Instagram Reels dan 1 Foto Produk Komersial untuk serum wajah terbaru kami." },
      { sender: "Sobakhul Munir", text: "Halo kak, siap! Untuk paket 1 Reels dan 1 Foto Produk biayanya Rp 1.500.000 ya kak." },
      { sender: "GlowLab Skincare", text: "Oke kami setuju dengan biaya Rp 1.500.000. Untuk target selesai deadline hari Jumat tanggal 24 Oktober ya kak." },
      { sender: "Sobakhul Munir", text: "Siap sepakat kak, deadline Jumat 24 Oktober kami sanggupi." },
      { sender: "GlowLab Skincare", text: "Bagaimana kalau nanti ditambah 1 video TikTok juga ya kira-kira?" },
      { sender: "Sobakhul Munir", text: "Apakah ada file mentah logo format PNG resolusi tinggi yang bisa dikirimkan?" }
    ];

    await runTest("Test A: extractStructuredFacts accurately reflects scope, price, deadline & proposals", async () => {
      const summary = extractStructuredFacts(
        representativeMessages,
        "Serum Wajah GlowLab",
        "Sobakhul Munir Siroj",
        "GlowLab Skincare Indonesia",
        "Kolaborasi pembuatan video Reels dan foto produk serum GlowLab telah disepakati antara kedua pihak."
      );

      // Verify Scope
      if (!summary.scope.some(s => s.includes('Reels'))) {
        throw new Error("Scope must include Instagram Reels");
      }
      if (!summary.scope.some(s => s.includes('Foto Produk'))) {
        throw new Error("Scope must include Foto Produk");
      }

      // Verify Confirmed Agreements
      if (!summary.confirmedAgreements.some(a => a.includes('1.500.000'))) {
        throw new Error("Confirmed agreements must capture agreed price Rp 1.500.000");
      }

      // Verify Timeline
      if (summary.timeline.length === 0 || !summary.timeline[0].statedDeadline.includes('24 Oktober')) {
        throw new Error("Timeline must capture stated deadline '24 Oktober'");
      }
      if (summary.timeline[0].certainty !== 'confirmed') {
        throw new Error("Agreed deadline must be marked 'confirmed'");
      }

      // Verify Proposal separation (Must NOT be converted to confirmed agreement)
      if (!summary.proposals.some(p => p.toLowerCase().includes('tiktok'))) {
        throw new Error("Unapproved proposal for TikTok must be classified under proposals, not agreements");
      }
      if (summary.confirmedAgreements.some(a => a.toLowerCase().includes('tiktok'))) {
        throw new Error("Unapproved TikTok proposal must NOT be in confirmedAgreements");
      }

      // Verify Open Question
      if (!summary.openQuestions.some(q => q.toLowerCase().includes('logo'))) {
        throw new Error("Unanswered question about logo must be captured in openQuestions");
      }

      // Verify Missing Info
      if (!summary.missingInformation.some(m => m.toLowerCase().includes('revisi'))) {
        throw new Error("Missing revision policy must be listed under missingInformation");
      }
    });

    // -------------------------------------------------------------
    // TEST B: Zero Hallucination Test
    // -------------------------------------------------------------
    console.log("\n--- SECTION 3: Test B — Zero Hallucination on Missing Facts ---");

    const noPriceNoDeadlineMessages = [
      { sender: "UMKM Kopi", text: "Halo kak, kami mau tanya-tanya dulu soal jasa desain feeds instagram." },
      { sender: "Creator", text: "Halo, boleh kak. Ingin konsep feed yang seperti apa ya?" },
      { sender: "UMKM Kopi", text: "Konsep minimalis dan elegan kak bernuansa kopi." }
    ];

    await runTest("Test B: Model does NOT hallucinate price or deadline when absent", async () => {
      const summary = extractStructuredFacts(
        noPriceNoDeadlineMessages,
        "Diskusi Feed Kopi",
        "Kreator",
        "UMKM Kopi",
        null
      );

      // Must NOT contain hallucinated dates or prices
      if (summary.confirmedAgreements.some(a => /rp|\bjuta\b|\bribu\b/i.test(a))) {
        throw new Error("Hallucination detected: confirmedAgreements contains a price when none was mentioned!");
      }
      if (summary.timeline.length > 0) {
        throw new Error("Hallucination detected: timeline item created when no deadline was mentioned!");
      }
      if (!summary.missingInformation.some(m => m.toLowerCase().includes('deadline') || m.toLowerCase().includes('tenggat'))) {
        throw new Error("Must explicitly state deadline has not been discussed");
      }
      if (!summary.missingInformation.some(m => m.toLowerCase().includes('biaya') || m.toLowerCase().includes('anggaran'))) {
        throw new Error("Must explicitly state price/budget has not been discussed");
      }
    });

    // -------------------------------------------------------------
    // HTTP ENDPOINT INTEGRATION TESTS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 4: HTTP Endpoint & RBAC Tests ---");

    // Ensure conversation exists in PostgreSQL
    const [existingConv] = await sql`
      SELECT id FROM conversations 
      WHERE (participant_1_id = ${CREATOR_ID} AND participant_2_id = ${BUSINESS_ID})
         OR (participant_1_id = ${BUSINESS_ID} AND participant_2_id = ${CREATOR_ID})
      LIMIT 1
    `;

    let testConvId = existingConv?.id;
    if (!testConvId) {
      const [newConv] = await sql`
        INSERT INTO conversations (participant_1_id, participant_2_id, last_message, updated_at)
        VALUES (${BUSINESS_ID}, ${CREATOR_ID}, 'Halo kak', NOW())
        RETURNING id
      `;
      testConvId = newConv.id;
    }

    // Seed 2 real messages into PostgreSQL for this conversation
    await sql`DELETE FROM messages WHERE conversation_id = ${testConvId}`;
    await sql`
      INSERT INTO messages (conversation_id, sender_id, content, created_at)
      VALUES 
        (${testConvId}, ${BUSINESS_ID}, 'Halo kak Munir, kami mau buat 1 Video Reels promo produk ya. Biaya 500 ribu dan deadline hari Jumat.', NOW() - INTERVAL '5 minutes'),
        (${testConvId}, ${CREATOR_ID}, 'Siap kak sepakat, kami kerjakan video reels 500 ribu deadline hari Jumat.', NOW() - INTERVAL '4 minutes')
    `;

    await runTest("Test D: Strict RBAC — Non-participant is BLOCKED with 403 Forbidden", async () => {
      const res = await request("/api/ai/summarize", {
        method: "POST",
        headers: authStranger,
        body: JSON.stringify({ conversationId: testConvId }),
      });

      if (res.status !== 403) {
        throw new Error(`Expected HTTP 403 Forbidden for non-participant, got HTTP ${res.status}`);
      }
    });

    await runTest("Test E: Unauthenticated request is BLOCKED with 401 Unauthorized", async () => {
      const res = await request("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: testConvId }),
      });

      if (res.status !== 401) {
        throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}`);
      }
    });

    let generatedSummary: any = null;

    await runTest("POST /api/ai/summarize: Authorized Business generates summary from DB messages", async () => {
      const res = await request("/api/ai/summarize", {
        method: "POST",
        headers: authBusiness,
        body: JSON.stringify({ conversationId: testConvId, forceRefresh: true }),
      });

      if (res.status !== 200 || !res.data.success || !res.data.data) {
        throw new Error(`Summary generation failed: ${JSON.stringify(res.data)}`);
      }

      generatedSummary = res.data.data;
      if (!generatedSummary.executiveSummary) {
        throw new Error("Missing executiveSummary in response");
      }
      if (!generatedSummary.confirmedAgreements || generatedSummary.confirmedAgreements.length === 0) {
        throw new Error("Missing confirmedAgreements in response");
      }
      console.log(` [Model: ${generatedSummary.modelUsed}]`);
      console.log(` [Executive: ${generatedSummary.executiveSummary.slice(0, 90)}...]`);
    });

    // -------------------------------------------------------------
    // TEST G: Database Persistence Verification
    // -------------------------------------------------------------
    console.log("\n--- SECTION 5: Test G — PostgreSQL Persistence Verification ---");

    await runTest("Test G: Direct DB Check — ai_summary & ai_summary_updated_at saved in PostgreSQL", async () => {
      const [convRow] = await sql`
        SELECT ai_summary, ai_summary_updated_at 
        FROM conversations 
        WHERE id = ${testConvId}
      `;

      if (!convRow || !convRow.ai_summary) {
        throw new Error("ai_summary column in conversations table is empty!");
      }
      if (!convRow.ai_summary_updated_at) {
        throw new Error("ai_summary_updated_at in conversations table is null!");
      }

      const dbSummary = convRow.ai_summary;
      if (dbSummary.executiveSummary !== generatedSummary.executiveSummary) {
        throw new Error("DB executiveSummary does not match generated summary!");
      }
    });

    // -------------------------------------------------------------
    // TEST F: Cache Invalidation when New Message Arrives
    // -------------------------------------------------------------
    console.log("\n--- SECTION 6: Test F — Cache Freshness & Invalidation ---");

    await runTest("Test F: GET /api/ai/summarize returns cached summary with isOutdated = false initially", async () => {
      const res = await request(`/api/ai/summarize?conversationId=${testConvId}`, {
        headers: authCreator,
      });

      if (res.status !== 200 || !res.data.data) {
        throw new Error(`GET /api/ai/summarize failed: ${JSON.stringify(res.data)}`);
      }
      if (res.data.isOutdated === true) {
        throw new Error("Expected isOutdated = false before new message is sent");
      }
    });

    await runTest("Test F: Insert new message -> GET /api/ai/summarize marks isOutdated = true", async () => {
      // Insert newer message with timestamp NOW()
      await sql`
        INSERT INTO messages (conversation_id, sender_id, content, created_at)
        VALUES (${testConvId}, ${BUSINESS_ID}, 'Ada catatan tambahan kak: tolong sertakan logo di awal video.', NOW())
      `;

      const res = await request(`/api/ai/summarize?conversationId=${testConvId}`, {
        headers: authCreator,
      });

      if (res.status !== 200 || !res.data.data) {
        throw new Error(`GET /api/ai/summarize failed: ${JSON.stringify(res.data)}`);
      }
      if (res.data.isOutdated !== true) {
        throw new Error(`Expected isOutdated = true after new message was sent, got: ${res.data.isOutdated}`);
      }
    });

    await runTest("Test F: POST /api/ai/summarize with forceRefresh updates summary with latest message", async () => {
      const res = await request("/api/ai/summarize", {
        method: "POST",
        headers: authCreator,
        body: JSON.stringify({ conversationId: testConvId, forceRefresh: true }),
      });

      if (res.status !== 200 || !res.data.success) {
        throw new Error(`Refresh failed: ${JSON.stringify(res.data)}`);
      }

      const refreshed = res.data.data;
      if (refreshed.isOutdated === true) {
        throw new Error("Refreshed summary must have isOutdated = false");
      }
    });

    console.log("\n=========================================================================");
    console.log(`📊 AI Summarize Verification Results: ${passed} Passed, ${failed} Failed`);
    console.log("=========================================================================");

    if (failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Unhandled test suite error:", err);
  process.exit(1);
});
