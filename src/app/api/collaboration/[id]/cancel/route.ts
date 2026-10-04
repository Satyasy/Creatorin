import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { collaborationRooms, creatorWallets, invoices, submissions, walletTransactions } from '@/lib/db/schema';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
  const [room] = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, id)).limit(1);
  if (!room) return NextResponse.json({ error: 'Collaboration Room tidak ditemukan.' }, { status: 404 });
  if (user.id !== room.businessId && user.id !== room.creatorId) return NextResponse.json({ error: 'Anda bukan peserta proyek ini.' }, { status: 403 });
  if (room.status === 'completed') return NextResponse.json({ error: 'Proyek yang sudah selesai tidak dapat dibatalkan.' }, { status: 400 });
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, room.invoiceId)).limit(1);
  const delivered = await db.select({ id: submissions.id }).from(submissions).where(eq(submissions.roomId, id)).limit(1);
  const fullRefund = user.id === room.creatorId || delivered.length === 0;
  if (!fullRefund) {
    await db.update(collaborationRooms).set({ status: 'disputed' }).where(eq(collaborationRooms.id, id));
    return NextResponse.json({ success: true, mediationRequired: true, message: 'Pengumpulan pertama sudah diterima. Tim Creatorin akan memediasi pengembalian 50 sampai 75 persen.' });
  }
  const refund = invoice?.totalAmount || 0;
  let [wallet] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, room.businessId)).limit(1);
  if (!wallet) [wallet] = await db.insert(creatorWallets).values({ creatorId: room.businessId, balance: refund, points: 0 }).returning();
  else await db.update(creatorWallets).set({ balance: sql`${creatorWallets.balance} + ${refund}`, updatedAt: new Date() }).where(eq(creatorWallets.creatorId, room.businessId));
  await db.insert(walletTransactions).values({ walletId: wallet.id, type: 'refund', amount: refund, description: `Pengembalian penuh untuk ${room.title}`, status: 'completed' });
  await db.update(invoices).set({ status: 'cancelled' }).where(eq(invoices.id, room.invoiceId));
  await db.update(collaborationRooms).set({ status: 'disputed' }).where(eq(collaborationRooms.id, id));
  return NextResponse.json({ success: true, refund, message: `${Math.floor(refund / 1000)} koin dikembalikan ke dompet UMKM.` });
}
