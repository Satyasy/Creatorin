/**
 * Creatorin API Automated Test Suite
 * Comprehensive end-to-end tests for all 42 pages / 15 backend modules
 */

const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000";

// Seeded user IDs from database
const CREATOR_ID = "33333333-3333-3333-3333-333333333333"; // Sobakhul Munir Siroj
const BUSINESS_ID = "44444444-4444-4444-4444-444444444444"; // GlowLab Skincare Indonesia
const SCHOOL_ID = "55555555-5555-5555-5555-555555555555"; // SMK Mitra

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`• Testing: ${name}... `);
    await fn();
    console.log("✅ PASSED");
    testsPassed++;
  } catch (err: any) {
    console.log("❌ FAILED");
    console.error(`  Error: ${err.message}`);
    testsFailed++;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data?.error || JSON.stringify(data) || res.statusText}`);
  }
  return data;
}

async function main() {
  console.log("\n=======================================================");
  console.log(`🚀 Starting Creatorin Backend API Full Test Suite`);
  console.log(`Target: ${BASE_URL}`);
  console.log("=======================================================\n");

  let testServiceId = "";
  let testProjectId = "";
  let testBriefId = "";
  let testAppId = "";
  let testConversationId = "";
  let testInvoiceId = "";
  let testRoomId = "";

  // 1. Discovery & Public Marketplace (Halaman 1-7)
  await runTest("GET /api/creators (Discovery Creators)", async () => {
    const res = await request("/api/creators?category=Video");
    if (!Array.isArray(res.creators)) throw new Error("Expected creators array");
  });

  await runTest("GET /api/creators/[id] (Creator Details by UUID & Slug)", async () => {
    const res = await request(`/api/creators/${CREATOR_ID}`);
    if (res.creator?.id !== CREATOR_ID) throw new Error("Creator ID mismatch");
    if (!Array.isArray(res.services)) throw new Error("Creator services missing");
    if (!Array.isArray(res.projects)) throw new Error("Creator projects missing");
    if (!res.stats) throw new Error("Creator stats missing");
  });

  await runTest("GET /api/services (Public Catalog)", async () => {
    const res = await request("/api/services");
    if (!Array.isArray(res.services)) throw new Error("Expected services array");
  });

  await runTest("GET /api/projects (Public Projects)", async () => {
    const res = await request("/api/projects");
    if (!Array.isArray(res.projects)) throw new Error("Expected projects array");
  });

  await runTest("GET /api/profile?slug=maya-angelina", async () => {
    const res = await request("/api/profile?slug=maya-angelina");
    if (res.creator?.slug !== "maya-angelina") throw new Error("Invalid creator slug returned");
  });

  // 2. Auth & Current User (Halaman 8-9)
  await runTest("GET /api/auth/me (Creator role verification)", async () => {
    const res = await request("/api/auth/me", {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (res.user?.id !== CREATOR_ID || res.user?.role !== "creator") {
      throw new Error("Invalid user authentication or role");
    }
  });

  // 3. Onboarding (Halaman 10-13)
  await runTest("GET /api/onboarding (Check status)", async () => {
    const res = await request("/api/onboarding", {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (!res.profile) throw new Error("Profile not returned in onboarding");
  });

  await runTest("POST /api/onboarding (Update profile & role fields)", async () => {
    const res = await request("/api/onboarding", {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        headline: "Senior Motion Graphic & Short-form Specialist",
        skills: ["TikTok UGC", "CapCut Pro", "After Effects", "Reels"],
        startingPrice: "Mulai Rp250.000",
      }),
    });
    if (!res.success) throw new Error("Onboarding update failed");
  });

  // 4. Services CRUD (Halaman 18-19)
  await runTest("POST /api/services (Create Service)", async () => {
    const res = await request("/api/services", {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        title: "Paket Video Testing Otomatis",
        category: "Automation",
        description: "Layanan uji coba dibuat via automated test",
        price: "Rp500.000",
        estimatedDays: "1 Hari Kerja",
      }),
    });
    if (!res.service?.id) throw new Error("Service was not created");
    testServiceId = res.service.id;
  });

  await runTest("GET /api/services/[id]", async () => {
    const res = await request(`/api/services/${testServiceId}`);
    if (res.service?.id !== testServiceId) throw new Error("Service detail mismatch");
  });

  await runTest("DELETE /api/services/[id]", async () => {
    await request(`/api/services/${testServiceId}`, {
      method: "DELETE",
      headers: { "x-user-id": CREATOR_ID },
    });
  });

  // 5. Projects CRUD (Halaman 20-21)
  await runTest("POST /api/projects (Create Portfolio Project)", async () => {
    const res = await request("/api/projects", {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        title: "Test Case Proyek Baru",
        description: "Dokumentasi portofolio otomatis",
        mediaType: "image",
      }),
    });
    if (!res.project?.id) throw new Error("Project was not created");
    testProjectId = res.project.id;
  });

  await runTest("GET /api/projects/[id]", async () => {
    const res = await request(`/api/projects/${testProjectId}`);
    if (res.project?.id !== testProjectId) throw new Error("Project detail mismatch");
  });

  await runTest("DELETE /api/projects/[id]", async () => {
    await request(`/api/projects/${testProjectId}`, {
      method: "DELETE",
      headers: { "x-user-id": CREATOR_ID },
    });
  });

  // 6. Project Briefs & Application (Halaman 22-27)
  await runTest("POST /api/briefs (Business opens brief)", async () => {
    const res = await request("/api/briefs", {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
      body: JSON.stringify({
        title: "Kebutuhan Video Review Serum Baru",
        category: "TikTok UGC",
        description: "Dicari kreator untuk review produk skincare honest 14 hari.",
        budget: "Rp2.000.000",
        expectedOutput: "1x Video MP4 resolusi 1080p vertikal",
      }),
    });
    if (!res.brief?.id) throw new Error("Brief was not created");
    testBriefId = res.brief.id;
  });

  await runTest("POST /api/briefs/[id]/apply (Creator applies)", async () => {
    const res = await request(`/api/briefs/${testBriefId}/apply`, {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        pitch: "Saya memiliki audiens beauty skincare dengan engagement rate 8%.",
        proposedPrice: "Rp1.800.000",
      }),
    });
    if (!res.application?.id) throw new Error("Application failed");
    testAppId = res.application.id;
  });

  await runTest("GET /api/briefs/[id] (Brief Detail with applications list)", async () => {
    const res = await request(`/api/briefs/${testBriefId}`, {
      headers: { "x-user-id": BUSINESS_ID },
    });
    if (res.brief?.id !== testBriefId) throw new Error("Brief detail ID mismatch");
    if (!Array.isArray(res.applications) || res.applications.length === 0) {
      throw new Error("Applications list missing for brief owner");
    }
  });

  await runTest("POST /api/briefs/[id]/applications/[appId]/accept (Business accepts -> Auto Chat)", async () => {
    const res = await request(`/api/briefs/${testBriefId}/applications/${testAppId}/accept`, {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
    });
    if (!res.conversationId) throw new Error("Chat was not initialized on acceptance");
    testConversationId = res.conversationId;
  });

  // 7. Chat & Messaging (Halaman 28-29)
  await runTest("POST /api/messages (Send Message)", async () => {
    const res = await request("/api/messages", {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
      body: JSON.stringify({
        conversationId: testConversationId,
        content: "Halo mas Munir, kami sudah review brief Anda dan ingin lanjut pembuatan invoice.",
      }),
    });
    if (!res.message?.id) throw new Error("Failed to send message");
  });

  await runTest("GET /api/messages?conversationId=...", async () => {
    const res = await request(`/api/messages?conversationId=${testConversationId}`, {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (!Array.isArray(res.messages) || res.messages.length === 0) {
      throw new Error("Messages not retrieved");
    }
  });

  // 8. Invoicing & Collaboration Workflow (Halaman 30-35)
  await runTest("POST /api/invoices (Creator creates invoice)", async () => {
    const res = await request("/api/invoices", {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        businessId: BUSINESS_ID,
        conversationId: testConversationId,
        title: "Pengerjaan 1x Video TikTok UGC Serum Barrier",
        scopeDescription: "Video vertikal 60 detik + 2 hook variasi + 1x revisi minor",
        totalAmount: 1800000,
        deadlineDays: 4,
      }),
    });
    if (!res.invoice?.id) throw new Error("Invoice was not created");
    testInvoiceId = res.invoice.id;
  });

  await runTest("GET /api/invoices/[id] (Invoice Details)", async () => {
    const res = await request(`/api/invoices/${testInvoiceId}`, {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (res.invoice?.id !== testInvoiceId) throw new Error("Invoice ID mismatch");
    if (!res.invoice?.creator || !res.invoice?.business) {
      throw new Error("Invoice participant details missing");
    }
  });

  await runTest("POST /api/invoices/[id]/pay (Payment -> Auto Create Room)", async () => {
    const res = await request(`/api/invoices/${testInvoiceId}/pay`, {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
    });
    if (!res.room?.id) throw new Error("Collaboration room was not created on payment");
    testRoomId = res.room.id;
  });

  await runTest("GET /api/collaboration/[id] (Room Details)", async () => {
    const res = await request(`/api/collaboration/${testRoomId}`, {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (res.room?.id !== testRoomId || res.room?.status !== "in_progress") {
      throw new Error("Room status invalid");
    }
  });

  await runTest("POST /api/collaboration/[id]/submit (Creator Submits Draft)", async () => {
    const res = await request(`/api/collaboration/${testRoomId}/submit`, {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        notes: "Draft video pertama sudah diunggah sesuai brief.",
        fileUrls: ["https://storage.creatorin.id/vault/preview-v1.mp4"],
      }),
    });
    if (!res.submission?.id) throw new Error("Submission upload failed");
  });

  await runTest("POST /api/collaboration/[id]/revision (Client Requests Revision)", async () => {
    const res = await request(`/api/collaboration/${testRoomId}/revision`, {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
      body: JSON.stringify({
        feedback: "Tolong perjelas pencahayaan di detik ke 10 saat menampilkan tekstur serum.",
      }),
    });
    if (!res.revision?.id) throw new Error("Revision request failed");
  });

  await runTest("POST /api/collaboration/[id]/approve (Client Approval -> Payout)", async () => {
    const res = await request(`/api/collaboration/${testRoomId}/approve`, {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
    });
    if (!res.success) throw new Error("Approval failed");
  });

  // 9. Review & Wallet Balance Verification (Halaman 36-39)
  await runTest("POST /api/reviews (Client Reviews Creator)", async () => {
    const res = await request("/api/reviews", {
      method: "POST",
      headers: { "x-user-id": BUSINESS_ID },
      body: JSON.stringify({
        creatorId: CREATOR_ID,
        roomId: testRoomId,
        projectTitle: "Pengerjaan 1x Video TikTok UGC Serum Barrier",
        rating: 5.0,
        comment: "Hasil memuaskan, tepat waktu dan komunikasi sangat jelas.",
      }),
    });
    if (!res.review?.id) throw new Error("Review submission failed");
  });

  await runTest("GET /api/wallet (Verify Creator Balance)", async () => {
    const res = await request("/api/wallet", {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (typeof res.wallet?.balance !== "number" || res.wallet.balance < 1800000) {
      throw new Error("Wallet balance was not credited after approval");
    }
  });

  await runTest("POST /api/wallet/withdraw (Withdraw Funds)", async () => {
    const res = await request("/api/wallet/withdraw", {
      method: "POST",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        amount: 500000,
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "Sobakhul Munir Siroj",
      }),
    });
    if (!res.success) throw new Error("Withdrawal failed");
  });

  // 10. School Partner Dashboard & Student Monitoring (Halaman 40-41)
  await runTest("GET /api/school/dashboard (School Dashboard)", async () => {
    const res = await request("/api/school/dashboard", {
      headers: { "x-user-id": SCHOOL_ID },
    });
    if (!res.school || !Array.isArray(res.students)) {
      throw new Error("Invalid school dashboard response");
    }
  });

  await runTest("GET /api/school/students/[id] (Student Detail View)", async () => {
    const res = await request(`/api/school/students/${CREATOR_ID}`, {
      headers: { "x-user-id": SCHOOL_ID },
    });
    if (res.student?.id !== CREATOR_ID || !Array.isArray(res.projects)) {
      throw new Error("Invalid student detail response");
    }
  });

  // 11. Home Feed & Account Settings (Halaman 14 & 42)
  await runTest("GET /api/home/feed (Creator Feed)", async () => {
    const res = await request("/api/home/feed", {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (res.role !== "creator" || !res.feed) throw new Error("Invalid creator home feed");
  });

  await runTest("GET /api/home/feed (Business Feed)", async () => {
    const res = await request("/api/home/feed", {
      headers: { "x-user-id": BUSINESS_ID },
    });
    if (res.role !== "business" || !res.feed) throw new Error("Invalid business home feed");
  });

  await runTest("PUT /api/account/settings (Update Settings)", async () => {
    const res = await request("/api/account/settings", {
      method: "PUT",
      headers: { "x-user-id": CREATOR_ID },
      body: JSON.stringify({
        location: "Surabaya, Jawa Timur",
        notifyEmail: true,
        notifyPush: true,
      }),
    });
    if (!res.success) throw new Error("Settings update failed");
  });

  // 12. Notifications (Halaman 37)
  await runTest("GET /api/notifications", async () => {
    const res = await request("/api/notifications", {
      headers: { "x-user-id": CREATOR_ID },
    });
    if (!Array.isArray(res.notifications)) throw new Error("Notifications array missing");
  });

  console.log("\n=======================================================");
  console.log(`📊 Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
  console.log("=======================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner fatal error:", err);
  process.exit(1);
});
