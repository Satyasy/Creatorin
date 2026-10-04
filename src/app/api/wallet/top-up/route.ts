import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { creatorWallets, walletTransactions } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'business') return NextResponse.json({ error: 'Top up hanya tersedia untuk akun UMKM.' }, { status: 403 });
  const { coins, paymentMethod = 'sandbox' } = await request.json();
  const coinAmount = Number(coins);
  if (!Number.isInteger(coinAmount) || coinAmount < 10 || coinAmount > 10000) return NextResponse.json({ error: 'Top up harus antara 10 dan 10.000 koin.' }, { status: 400 });
  const amount = coinAmount * 1000;
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
  let [wallet] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, user.id)).limit(1);
  if (!wallet) [wallet] = await db.insert(creatorWallets).values({ creatorId: user.id, balance: amount, points: 0 }).returning();
  else await db.update(creatorWallets).set({ balance: sql`${creatorWallets.balance} + ${amount}`, updatedAt: new Date() }).where(eq(creatorWallets.creatorId, user.id));
  const [transaction] = await db.insert(walletTransactions).values({ walletId: wallet.id, type: 'top_up', amount, description: `Top up sandbox ${coinAmount} koin melalui ${paymentMethod}`, status: 'completed' }).returning();
  return NextResponse.json({ success: true, coins: coinAmount, amount, transaction });
}
