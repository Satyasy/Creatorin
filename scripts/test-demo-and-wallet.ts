/**
 * Creatorin Automated Test Suite: Demo Experience, Error Mapping & Safe Coin Top-Up
 * Validates authentic demo authentication, strict top-up guards, atomic DB mutations,
 * and end-to-end collaboration escrow lifecycle.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { mapErrorToDetails } from '../src/lib/error-mapper.js';
import { getDb } from '../src/lib/db/index.js';
import { creatorWallets, walletTransactions, invoices, collaborationRooms } from '../src/lib/db/schema.js';
import { eq, desc } from 'drizzle-orm';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`• Testing: ${name}... `);
    await fn();
    console.log('✅ PASSED');
    passed++;
  } catch (err: any) {
    console.log('❌ FAILED');
    console.error(`  Error: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n=============================================================');
  console.log('🚀 Creatorin Demo, Error UX & Wallet Top-Up Automated Tests');
  console.log(`Target: ${BASE_URL}`);
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // PART 1: Error Mapper Verification
  // -------------------------------------------------------------
  await test('Error Mapper maps Network Error to user-friendly retryable modal', async () => {
    const res = mapErrorToDetails(new TypeError('Failed to fetch'));
    if (res.title !== 'Koneksi Terputus') throw new Error(`Unexpected title: ${res.title}`);
    if (!res.retryable) throw new Error('Expected network error to be retryable');
    if (res.code !== 'ERR_NETWORK_DISCONNECTED') throw new Error(`Unexpected code: ${res.code}`);
  });

  await test('Error Mapper maps 401 Unauthorized to Sesi Masuk Berakhir with login action', async () => {
    const res = mapErrorToDetails({ status: 401, message: 'Unauthorized access' });
    if (res.title !== 'Sesi Masuk Berakhir') throw new Error(`Unexpected title: ${res.title}`);
    if (res.retryable) throw new Error('401 should not be retryable');
    if (res.action?.href !== '/sign-in') throw new Error('Expected login link action');
  });

  await test('Error Mapper maps insufficient coin error to Saldo Koin Tidak Cukup with wallet action', async () => {
    const res = mapErrorToDetails(new Error('Saldo koin tidak cukup untuk membayar invoice ini.'));
    if (res.title !== 'Saldo Koin Tidak Cukup') throw new Error(`Unexpected title: ${res.title}`);
    if (res.action?.href !== '/wallet') throw new Error('Expected wallet action link');
    if (res.code !== 'ERR_INSUFFICIENT_COINS') throw new Error(`Unexpected code: ${res.code}`);
  });

  await test('Error Mapper maps 429 Rate Limit with wait suggestion', async () => {
    const res = mapErrorToDetails({ status: 429, message: 'Too many attempts' });
    if (res.title !== 'Terlalu Banyak Permintaan') throw new Error(`Unexpected title: ${res.title}`);
    if (!res.retryable) throw new Error('429 should be retryable');
  });

  // -------------------------------------------------------------
  // PART 2: Demo Authentication Endpoints
  // -------------------------------------------------------------
  let creatorToken = '';
  let creatorUser: any = null;
  let businessToken = '';
  let businessUser: any = null;
  let schoolToken = '';

  await test('POST /api/auth/demo authenticates Creator persona with valid JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'creator' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.session?.accessToken) throw new Error('Missing session token');
    if (data.user?.role !== 'creator') throw new Error(`Unexpected role: ${data.user?.role}`);
    creatorToken = data.session.accessToken;
    creatorUser = data.user;
  });

  await test('POST /api/auth/demo authenticates UMKM / Business persona with valid JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'business' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.session?.accessToken) throw new Error('Missing session token');
    if (data.user?.role !== 'business') throw new Error(`Unexpected role: ${data.user?.role}`);
    businessToken = data.session.accessToken;
    businessUser = data.user;
  });

  await test('POST /api/auth/demo authenticates School persona with valid JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'school' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.session?.accessToken) throw new Error('Missing session token');
    if (data.user?.role !== 'school') throw new Error(`Unexpected role: ${data.user?.role}`);
    schoolToken = data.session.accessToken;
  });

  await test('POST /api/auth/demo rejects invalid role with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'superhero' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('Expected error message in response');
  });

  // -------------------------------------------------------------
  // PART 3: Safe Coin Top-Up
  // -------------------------------------------------------------
  await test('POST /api/wallet/topup rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('POST /api/wallet/topup rejects invalid amounts with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/wallet/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${businessToken}`,
      },
      body: JSON.stringify({ amount: -500 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  const TOPUP_AMOUNT = 2500;
  let balanceBefore = 0;

  await test('POST /api/wallet/topup credits demo coins & persists to PostgreSQL', async () => {
    // 1. Get initial balance
    const db = getDb();
    if (!db) throw new Error('Database not connected');
    const [initialWallet] = await db
      .select()
      .from(creatorWallets)
      .where(eq(creatorWallets.creatorId, businessUser.id))
      .limit(1);
    balanceBefore = initialWallet?.balance || 0;

    // 2. Execute Top Up
    const res = await fetch(`${BASE_URL}/api/wallet/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${businessToken}`,
      },
      body: JSON.stringify({ amount: TOPUP_AMOUNT }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`HTTP ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    if (!data.success) throw new Error('Topup response success is false');

    // 3. Direct DB read to prove PostgreSQL persistence
    const [persistedWallet] = await db
      .select()
      .from(creatorWallets)
      .where(eq(creatorWallets.creatorId, businessUser.id))
      .limit(1);

    if (!persistedWallet) throw new Error('Wallet record missing in DB');
    if (persistedWallet.balance !== balanceBefore + TOPUP_AMOUNT) {
      throw new Error(
        `Balance mismatch: Expected ${balanceBefore + TOPUP_AMOUNT}, found ${persistedWallet.balance}`
      );
    }

    // 4. Verify transaction row inserted
    const [latestTx] = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, persistedWallet.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(1);

    if (!latestTx || latestTx.type !== 'topup' || latestTx.amount !== TOPUP_AMOUNT) {
      throw new Error(`Transaction record mismatch: ${JSON.stringify(latestTx)}`);
    }
  });

  // -------------------------------------------------------------
  // PART 4: End-to-End Collaboration Escrow Flow
  // -------------------------------------------------------------
  let createdInvoiceId = '';
  const INVOICE_COINS = 500;

  await test('Full Collaboration: Creator creates invoice for UMKM', async () => {
    const res = await fetch(`${BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        businessId: businessUser.id,
        title: 'Desain Kampanye Media Sosial Edisi Ramadhan',
        scopeDescription: '3 variasi konten feed Instagram dan 2 video TikTok promosi.',
        totalAmount: INVOICE_COINS,
        deadlineDays: 5,
        revisionRules: 'Maksimal 2 kali revisi minor.',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`HTTP ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    if (!data.invoice?.id) throw new Error('Invoice id missing');
    createdInvoiceId = data.invoice.id;
  });

  let createdRoomId = '';

  await test('Full Collaboration: UMKM pays invoice with demo coins (Escrow Lock)', async () => {
    const res = await fetch(`${BASE_URL}/api/invoices/${createdInvoiceId}/pay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${businessToken}`,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`HTTP ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    if (!data.room?.id) throw new Error('Collaboration room not created');
    createdRoomId = data.room.id;

    // Verify DB states
    const db = getDb();
    if (!db) throw new Error('Database not connected');
    const [inv] = await db.select().from(invoices).where(eq(invoices.id, createdInvoiceId)).limit(1);
    if (inv?.status !== 'paid') throw new Error(`Expected invoice paid, got ${inv?.status}`);

    const [room] = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, createdRoomId)).limit(1);
    if (room?.status !== 'in_progress') throw new Error(`Expected room in_progress, got ${room?.status}`);
  });

  await test('Full Collaboration: UMKM approves deliverable & releases Escrow coins to Creator', async () => {
    const res = await fetch(`${BASE_URL}/api/collaboration-rooms/${createdRoomId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${businessToken}`,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`HTTP ${res.status}: ${err.error}`);
    }
    const data = await res.json();
    if (!data.success) throw new Error('Room approval returned success: false');

    // Verify room is completed in DB
    const db = getDb();
    if (!db) throw new Error('Database not connected');
    const [room] = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, createdRoomId)).limit(1);
    if (room?.status !== 'completed') throw new Error(`Expected room completed, got ${room?.status}`);
  });

  console.log('\n=============================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
