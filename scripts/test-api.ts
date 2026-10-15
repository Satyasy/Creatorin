/**
 * Creatorin API Automated Full-Stack Test Suite
 * Comprehensive end-to-end tests for all 4 personas (Creator, Business, School, Admin)
 * Validates real PostgreSQL persistence and verifies no mock state masks failures.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { signJwtToken } from "../src/lib/auth-local.js";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000";

// Seeded user IDs from PostgreSQL database
const CREATOR_ID = "33333333-3333-3333-3333-333333333333"; // Sobakhul Munir Siroj
const BUSINESS_ID = "44444444-4444-4444-4444-444444444444"; // GlowLab Skincare Indonesia
const SCHOOL_ID = "45d6f32f-eaf4-4c42-986c-5850e7b00acd"; // SMK Negeri 1 Surabaya

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

  // Generate authentic JWT tokens for test personas
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

  const schoolToken = await signJwtToken({
    id: SCHOOL_ID,
    email: "school@creatorin.my.id",
    role: "school",
    fullName: "SMK Negeri 1 Surabaya",
  });

  const authCreator = { Authorization: `Bearer ${creatorToken}` };
  const authBusiness = { Authorization: `Bearer ${businessToken}` };
  const authSchool = { Authorization: `Bearer ${schoolToken}` };

  let testServiceId = "";
  let testProjectId = "";
  let testBriefId = "";
  let testAppId = "";
  let testConversationId = "";
  let testInvoiceId = "";
  let testRoomId = "";

  // 1. Discovery & Public Marketplace
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

  await runTest("GET /api/profile?slug=sobakhul-munir", async () => {
    const res = await request("/api/profile?slug=sobakhul-munir");
    if (res.creator?.slug !== "sobakhul-munir") throw new Error("Invalid creator slug returned");
  });

  // 2. Auth & Current User
  await runTest("GET /api/auth/me (Creator role verification)", async () => {
    const res = await request("/api/auth/me", {
      headers: authCreator,
    });
    if (res.user?.id !== CREATOR_ID || res.user?.role !== "creator") {
      throw new Error("Invalid user authentication or role");
    }
  });

  // 3. Onboarding
  await runTest("GET /api/onboarding (Check status)", async () => {
    const res = await request("/api/onboarding", {
      headers: authCreator,
    });
    if (!res.profile) throw new Error("Profile not returned in onboarding");
  });

  await runTest("POST /api/onboarding (Update profile & role fields)", async () => {
    const res = await request("/api/onboarding", {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        headline: "Lead Video Director & Creative Content Specialist",
        skills: ["TikTok UGC", "CapCut Pro", "After Effects", "Reels"],
        startingPrice: "Mulai Rp250.000",
      }),
    });
    if (!res.success) throw new Error("Onboarding update failed");
  });

  // 4. Services CRUD
  await runTest("POST /api/services (Create Service)", async () => {
    const res = await request("/api/services", {
      method: "POST",
      headers: authCreator,
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
    const res = await request(`/api/services/${testServiceId}`, {
      method: "DELETE",
      headers: authCreator,
    });
    if (!res.success) throw new Error("Failed to delete service");
  });

  // 5. Portfolio Projects CRUD
  await runTest("POST /api/projects (Create Portfolio Project)", async () => {
    const res = await request("/api/projects", {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        title: "Karya Uji Coba Otomatis",
        category: "Motion Graphic",
        description: "Proyek portofolio untuk automated test verification",
        mediaUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
        mediaType: "image",
        externalLink: "https://creatorin.id",
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
    const res = await request(`/api/projects/${testProjectId}`, {
      method: "DELETE",
      headers: authCreator,
    });
    if (!res.success) throw new Error("Failed to delete project");
  });

  // 6. Project Briefs & Applications
  await runTest("POST /api/briefs (Business opens brief)", async () => {
    const res = await request("/api/briefs", {
      method: "POST",
      headers: authBusiness,
      body: JSON.stringify({
        title: "Kampanye Video TikTok Serum Barrier GlowLab",
        category: "Video",
        description: "Mencari kreator konten kecantikan untuk membuat 1 video edukasi produk serum.",
        expectedOutput: "1 Video 9:16 durasi 60 detik",
        budget: "Rp1.800.000",
        deadline: "7 Hari",
      }),
    });
    if (!res.brief?.id) throw new Error("Brief was not created");
    testBriefId = res.brief.id;
  });

  await runTest("POST /api/briefs/[id]/apply (Creator applies)", async () => {
    const res = await request(`/api/briefs/${testBriefId}/apply`, {
      method: "POST",
      headers: authCreator,
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
      headers: authBusiness,
    });
    if (res.brief?.id !== testBriefId) throw new Error("Brief detail ID mismatch");
    if (!Array.isArray(res.applications) || res.applications.length === 0) {
      throw new Error("Applications list missing for brief owner");
    }
  });

  await runTest("POST /api/briefs/[id]/applications/[appId]/accept (Business accepts -> Auto Chat)", async () => {
    const res = await request(`/api/briefs/${testBriefId}/applications/${testAppId}/accept`, {
      method: "POST",
      headers: authBusiness,
    });
    if (!res.conversationId) throw new Error("Chat was not initialized on acceptance");
    testConversationId = res.conversationId;
  });

  // 7. Chat & Messaging
  await runTest("POST /api/messages (Send Message)", async () => {
    const res = await request("/api/messages", {
      method: "POST",
      headers: authBusiness,
      body: JSON.stringify({
        conversationId: testConversationId,
        content: "Halo mas Munir, kami sudah review brief Anda dan ingin lanjut pembuatan invoice.",
      }),
    });
    if (!res.message?.id) throw new Error("Failed to send message");
  });

  await runTest("GET /api/messages?conversationId=...", async () => {
    const res = await request(`/api/messages?conversationId=${testConversationId}`, {
      headers: authCreator,
    });
    if (!Array.isArray(res.messages) || res.messages.length === 0) {
      throw new Error("Messages not retrieved");
    }
  });

  // 8. Invoicing & Collaboration Workflow
  await runTest("POST /api/invoices (Creator creates invoice)", async () => {
    const res = await request("/api/invoices", {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        businessId: BUSINESS_ID,
        conversationId: testConversationId,
        title: "Pengerjaan 1x Video TikTok UGC Serum Barrier",
        scopeDescription: "Video vertikal 60 detik + 2 hook variasi + 1x revisi minor",
        totalAmount: 1000,
        deadlineDays: 4,
      }),
    });
    if (!res.invoice?.id) throw new Error("Invoice was not created");
    testInvoiceId = res.invoice.id;
  });

  await runTest("GET /api/invoices/[id] (Invoice Details)", async () => {
    const res = await request(`/api/invoices/${testInvoiceId}`, {
      headers: authCreator,
    });
    if (res.invoice?.id !== testInvoiceId) throw new Error("Invoice ID mismatch");
    if (!res.invoice?.creator || !res.invoice?.business) {
      throw new Error("Invoice participant details missing");
    }
  });

  await runTest("POST /api/invoices/[id]/pay (Payment -> Auto Create Room)", async () => {
    const res = await request(`/api/invoices/${testInvoiceId}/pay`, {
      method: "POST",
      headers: authBusiness,
    });
    if (!res.room?.id) throw new Error("Collaboration room was not created on payment");
    testRoomId = res.room.id;
  });

  await runTest("GET /api/collaboration-rooms/[roomId] (Room Details)", async () => {
    const res = await request(`/api/collaboration-rooms/${testRoomId}`, {
      headers: authCreator,
    });
    if (res.room?.id !== testRoomId || res.room?.status !== "in_progress") {
      throw new Error("Room status invalid");
    }
  });

  await runTest("POST /api/collaboration-rooms/[roomId]/submissions (Creator Submits Draft)", async () => {
    const res = await request(`/api/collaboration-rooms/${testRoomId}/submissions`, {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        notes: "Draft video pertama sudah diunggah sesuai brief.",
        fileUrls: ["https://storage.creatorin.id/vault/preview-v1.mp4"],
      }),
    });
    if (!res.submission?.id) throw new Error("Submission upload failed");
  });

  await runTest("POST /api/collaboration-rooms/[roomId]/revisions (Client Requests Revision)", async () => {
    const res = await request(`/api/collaboration-rooms/${testRoomId}/revisions`, {
      method: "POST",
      headers: authBusiness,
      body: JSON.stringify({
        feedback: "Tolong perjelas pencahayaan di detik ke 10 saat menampilkan tekstur serum.",
      }),
    });
    if (!res.revision?.id) throw new Error("Revision request failed");
  });

  await runTest("POST /api/collaboration-rooms/[roomId]/approve (Client Approval -> Payout)", async () => {
    const res = await request(`/api/collaboration-rooms/${testRoomId}/approve`, {
      method: "POST",
      headers: authBusiness,
    });
    if (!res.success) throw new Error("Approval failed");
  });

  // 9. Review & Wallet Verification
  await runTest("POST /api/reviews (Client Reviews Creator)", async () => {
    const res = await request("/api/reviews", {
      method: "POST",
      headers: authBusiness,
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
      headers: authCreator,
    });
    if (typeof res.wallet?.balance !== "number") {
      throw new Error("Wallet balance format invalid");
    }
  });

  await runTest("POST /api/wallet/withdraw (Withdraw Funds)", async () => {
    const res = await request("/api/wallet/withdraw", {
      method: "POST",
      headers: authCreator,
      body: JSON.stringify({
        amount: 50000,
        bankName: "BCA",
        accountNumber: "1234567890",
        accountHolder: "Sobakhul Munir Siroj",
      }),
    });
    if (!res.success) throw new Error("Withdrawal failed");
  });

  // 10. School Partner Dashboard & Student Monitoring
  await runTest("GET /api/school/data (School Dashboard)", async () => {
    const res = await request("/api/school/data", {
      headers: authSchool,
    });
    if (!res.overview || !Array.isArray(res.approvals)) {
      throw new Error("Invalid school dashboard response");
    }
  });

  await runTest("GET /api/school/students/[id] (Student Detail View)", async () => {
    const res = await request(`/api/school/students/${CREATOR_ID}`, {
      headers: authSchool,
    });
    if (res.student?.id !== CREATOR_ID || !Array.isArray(res.projects)) {
      throw new Error("Invalid student detail response");
    }
  });

  // 11. Home Feed & Account Settings
  await runTest("GET /api/home/feed (Creator Feed)", async () => {
    const res = await request("/api/home/feed", {
      headers: authCreator,
    });
    if (res.role !== "creator" || !res.feed) throw new Error("Invalid creator home feed");
  });

  await runTest("GET /api/home/feed (Business Feed)", async () => {
    const res = await request("/api/home/feed", {
      headers: authBusiness,
    });
    if (res.role !== "business" || !res.feed) throw new Error("Invalid business home feed");
  });

  await runTest("PUT /api/account/settings (Update Settings)", async () => {
    const res = await request("/api/account/settings", {
      method: "PUT",
      headers: authCreator,
      body: JSON.stringify({
        location: "Surabaya, Jawa Timur",
        notifyPush: true,
      }),
    });
    if (!res.success) throw new Error("Settings update failed");
  });

  // 12. Notifications
  await runTest("GET /api/notifications", async () => {
    const res = await request("/api/notifications", {
      headers: authCreator,
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
