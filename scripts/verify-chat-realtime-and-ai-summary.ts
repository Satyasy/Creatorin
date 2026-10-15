/**
 * verify-chat-realtime-and-ai-summary.ts
 * Rigorous end-to-end verification for:
 * 1. Real-time Live Chat via Redis Pub/Sub + SSE Streaming
 * 2. Message Read Receipts & Persistence in PostgreSQL
 * 3. AI Summarize Generation & Persistence in PostgreSQL (Conversations & Collaboration Rooms)
 * 4. Creator Deliverable Submission Persistence in PostgreSQL & Retrieval by UMKM
 */
import postgres from "postgres";
import { signJwtToken } from "../src/lib/auth-local.js";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://creatorin_user:Cr3at0rIn_Secure_2026_Db@127.0.0.1:5432/creatorin_db";
const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

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
  console.log("=========================================================================");
  console.log("🚀 Creatorin Real-Time Chat, AI Summarize & Collaboration Room Persistence Tests");
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

  const authCreator = { Authorization: `Bearer ${creatorToken}`, "Content-Type": "application/json" };
  const authBusiness = { Authorization: `Bearer ${businessToken}`, "Content-Type": "application/json" };

  try {
    // -------------------------------------------------------------
    // 1. SETUP CONVERSATION
    // -------------------------------------------------------------
    let convId = "";
    await runTest("Setup: Ensure active conversation exists between Creator & Business", async () => {
      const res = await request("/api/conversations", {
        method: "POST",
        headers: authBusiness,
        body: JSON.stringify({ recipientId: CREATOR_ID }),
      });
      convId = res.conversation?.id;
      if (!convId) throw new Error("Conversation ID missing");
    });

    // -------------------------------------------------------------
    // 2. REAL-TIME LIVE CHAT (REDIS PUB/SUB + SSE STREAM)
    // -------------------------------------------------------------
    let testMessageText = `Pesan realtime uji coba ${Date.now()}`;
    let sentMsgId = "";

    await runTest("Realtime Chat: Establish SSE stream & receive live message within 5000ms", async () => {
      const streamUrl = `${BASE_URL}/api/messages/stream?conversationId=${convId}`;
      const controller = new AbortController();

      // Open SSE stream as Creator
      const ssePromise = new Promise<void>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("Timeout waiting for real-time SSE message"));
        }, 8000);

        let buffer = "";
        try {
          const streamRes = await fetch(streamUrl, {
            headers: { Authorization: `Bearer ${creatorToken}` },
            signal: controller.signal,
          });

          if (!streamRes.ok || !streamRes.body) {
            clearTimeout(timeout);
            return reject(new Error(`Failed to connect SSE: HTTP ${streamRes.status}`));
          }

          const reader = streamRes.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            if (buffer.includes("NEW_MESSAGE") && buffer.includes(testMessageText)) {
              clearTimeout(timeout);
              controller.abort();
              return resolve();
            }
          }
        } catch (err: any) {
          if (err.name === "AbortError" && buffer.includes(testMessageText)) {
            clearTimeout(timeout);
            return resolve();
          }
          clearTimeout(timeout);
          reject(err);
        }
      });

      // Small delay to allow SSE connection handshake to establish
      await new Promise((r) => setTimeout(r, 600));

      // Business sends message via POST /api/messages
      const msgRes = await request("/api/messages", {
        method: "POST",
        headers: authBusiness,
        body: JSON.stringify({
          conversationId: convId,
          content: testMessageText,
        }),
      });

      sentMsgId = msgRes.message?.id;
      if (!sentMsgId) throw new Error("Failed to send message via API");

      // Await real-time receipt via SSE
      await ssePromise;
    });

    await runTest("Database Check: Message persisted in PostgreSQL with is_read = false", async () => {
      const [row] = await sql`SELECT id, content, is_read FROM messages WHERE id = ${sentMsgId}`;
      if (!row) throw new Error("Message not found in PostgreSQL");
      if (row.content !== testMessageText) throw new Error(`Content mismatch: ${row.content}`);
      if (row.is_read !== false) throw new Error("Expected newly sent message to have is_read = false");
    });

    await runTest("POST /api/messages/read: Mark conversation messages as read", async () => {
      const readRes = await request("/api/messages/read", {
        method: "POST",
        headers: authCreator,
        body: JSON.stringify({ conversationId: convId }),
      });
      if (readRes.success !== true) throw new Error("Expected success: true");

      const [row] = await sql`SELECT is_read FROM messages WHERE id = ${sentMsgId}`;
      if (!row || row.is_read !== true) throw new Error("Message is_read should be true in PostgreSQL");
    });

    // -------------------------------------------------------------
    // 3. AI SUMMARIZE GENERATION & DATABASE PERSISTENCE
    // -------------------------------------------------------------
    let generatedSummaryData: any = null;

    await runTest("POST /api/ai/summarize: Generate structured summary for conversation", async () => {
      const summaryPayload = {
        conversationId: convId,
        projectTitle: "Produksi Konten Video Skincare Reels",
        creatorName: "Sobakhul Munir Siroj",
        businessBrand: "GlowLab Skincare Indonesia",
        messages: [
          { sender: "GlowLab Skincare Indonesia", text: "Halo Sobakhul, kami butuh video reels promosi skincare dengan budget Rp 1.500.000 deadline 3 hari." },
          { sender: "Sobakhul Munir Siroj", text: "Halo kak, siap! Saya akan buatkan video instagram reels dengan storytelling edukasi dan visual clean." },
          { sender: "GlowLab Skincare Indonesia", text: "Mantap, tolong terbitkan invoice DP nya ya agar escrow aktif." }
        ]
      };

      const res = await request("/api/ai/summarize", {
        method: "POST",
        headers: authBusiness,
        body: JSON.stringify(summaryPayload),
      });

      if (!res.success || !res.data) throw new Error("Summary API failed");
      if (!res.data.executiveSummary) throw new Error("executiveSummary missing");
      if (!Array.isArray(res.data.agreements) || res.data.agreements.length === 0) throw new Error("agreements array missing or empty");
      if (!Array.isArray(res.data.actionItems) || res.data.actionItems.length === 0) throw new Error("actionItems array missing or empty");

      generatedSummaryData = res.data;
    });

    await runTest("Database Check: ai_summary and ai_summary_updated_at saved in PostgreSQL conversations table", async () => {
      const [convRow] = await sql`
        SELECT ai_summary, ai_summary_updated_at 
        FROM conversations 
        WHERE id = ${convId}
      `;

      if (!convRow) throw new Error("Conversation row not found");
      if (!convRow.ai_summary) throw new Error("ai_summary column in PostgreSQL is NULL");
      if (!convRow.ai_summary_updated_at) throw new Error("ai_summary_updated_at in PostgreSQL is NULL");

      const savedSummary = convRow.ai_summary;
      if (!savedSummary.executiveSummary || savedSummary.executiveSummary !== generatedSummaryData.executiveSummary) {
        throw new Error("Persisted executiveSummary does not match generated data");
      }
      if (!Array.isArray(savedSummary.agreements) || savedSummary.agreements.length === 0) {
        throw new Error("Persisted agreements are empty");
      }
    });

    await runTest("GET /api/ai/summarize: Fetch stored summary from server by conversationId", async () => {
      const res = await request(`/api/ai/summarize?conversationId=${convId}`, {
        headers: authCreator,
      });

      if (!res.success || !res.data) throw new Error("Stored summary retrieval failed");
      if (res.data.executiveSummary !== generatedSummaryData.executiveSummary) {
        throw new Error("Retrieved summary does not match database record");
      }
    });

    await runTest("GET /api/conversations: Returned conversation includes persistent aiSummary", async () => {
      const res = await request("/api/conversations", {
        headers: authCreator,
      });

      const matched = (res.conversations || []).find((c: any) => c.id === convId);
      if (!matched) throw new Error("Conversation not returned in list");
      if (!matched.aiSummary) throw new Error("aiSummary missing from conversation list item");
      if (matched.aiSummary.executiveSummary !== generatedSummaryData.executiveSummary) {
        throw new Error("Conversation list aiSummary does not match database record");
      }
    });

    // -------------------------------------------------------------
    // 4. COLLABORATION ROOM & DELIVERABLE SUBMISSION PERSISTENCE
    // (Addresses User's Bug Report: Deliverables not saving & missing in UMKM Dashboard)
    // -------------------------------------------------------------
    let testRoomId = "";
    let testInvoiceId = "";

    await runTest("Setup: Ensure active paid invoice & collaboration room exist for conversation", async () => {
      // 1. Check if room already exists
      const existingRoomCheck = await request(`/api/collaboration-rooms/by-conversation/${convId}`, {
        headers: authCreator,
      });

      if (existingRoomCheck.room?.id) {
        testRoomId = existingRoomCheck.room.id;
        testInvoiceId = existingRoomCheck.invoice?.id || "";
      } else {
        // Create new invoice
        const invRes = await request("/api/invoices", {
          method: "POST",
          headers: authCreator,
          body: JSON.stringify({
            businessId: BUSINESS_ID,
            conversationId: convId,
            title: "Proyek Konten Video Skincare Reels",
            scopeDescription: "1x Video Instagram Reels 30 detik durasi 9:16 + color grading",
            totalAmount: 1500,
            deadlineDays: 3,
            revisionRules: "Maksimal 2 kali revisi minor.",
          }),
        });

        testInvoiceId = invRes.invoice?.id;
        if (!testInvoiceId) throw new Error("Invoice creation failed");

        // Pay invoice as Business to activate escrow and generate collaboration room
        const payRes = await request(`/api/invoices/${testInvoiceId}/pay`, {
          method: "POST",
          headers: authBusiness,
        });

        testRoomId = payRes.room?.id;
        if (!testRoomId) throw new Error("Room creation upon invoice pay failed");
      }
    });

    let submittedVersion = 1;
    const testDeliverableTitle = `Draft Video Reels Versi ${Date.now()}`;
    const testDeliverableUrl = "https://creatorin.my.id/uploads/deliverables/sample-reels-v1.mp4";

    await runTest("POST /api/collaboration-rooms/[roomId]/submissions: Creator submits deliverable", async () => {
      const subRes = await request(`/api/collaboration-rooms/${testRoomId}/submissions`, {
        method: "POST",
        headers: authCreator,
        body: JSON.stringify({
          title: testDeliverableTitle,
          notes: "Draft video reels versi 1 mencakup hook pembuka dan visual storytelling.",
          fileUrls: [testDeliverableUrl],
        }),
      });

      if (!subRes.success || !subRes.submission) {
        throw new Error("Submission API failed");
      }
      submittedVersion = subRes.submission.version;
      if (subRes.submission.status !== "pending") {
        throw new Error(`Expected status 'pending', got: ${subRes.submission.status}`);
      }
    });

    await runTest("Database Check: Submission row exists in PostgreSQL submissions table", async () => {
      const [subRow] = await sql`
        SELECT * FROM submissions 
        WHERE room_id = ${testRoomId} AND version = ${submittedVersion}
      `;

      if (!subRow) throw new Error(`Submission row not found in PostgreSQL for room ${testRoomId}`);
      if (!subRow.notes.includes(testDeliverableTitle)) {
        throw new Error(`Submission notes do not contain title: ${subRow.notes}`);
      }
      if (!Array.isArray(subRow.file_urls) || !subRow.file_urls.includes(testDeliverableUrl)) {
        throw new Error(`file_urls in PostgreSQL does not contain uploaded URL`);
      }
    });

    await runTest("GET /api/collaboration-rooms/by-conversation: UMKM retrieves collaboration room & deliverables", async () => {
      const res = await request(`/api/collaboration-rooms/by-conversation/${convId}`, {
        headers: authBusiness,
      });

      if (!res.room || res.room.id !== testRoomId) {
        throw new Error(`UMKM failed to resolve collaboration room by conversation ID: ${JSON.stringify(res)}`);
      }

      if (!Array.isArray(res.submissions) || res.submissions.length === 0) {
        throw new Error("Submissions array is empty for UMKM!");
      }

      const foundSub = res.submissions.find((s: any) => s.version === submittedVersion);
      if (!foundSub) {
        throw new Error(`Submitted version ${submittedVersion} not found in UMKM submissions list`);
      }

      if (res.room.status !== "review_pending") {
        throw new Error(`Expected room status 'review_pending', got: ${res.room.status}`);
      }
    });

    await runTest("GET /api/collaboration-rooms/[roomId]: Creator & UMKM can view room with deliverables", async () => {
      const res = await request(`/api/collaboration-rooms/${testRoomId}`, {
        headers: authBusiness,
      });

      if (!res.room || res.room.id !== testRoomId) throw new Error("Failed to fetch room by roomId");
      if (!Array.isArray(res.submissions) || res.submissions.length === 0) {
        throw new Error("No submissions found when querying by roomId");
      }
    });

    console.log("\n=========================================================================");
    console.log(`📊 Final Verification Results: ${passed} Passed, ${failed} Failed`);
    console.log("=========================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
