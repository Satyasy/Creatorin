import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorWallets, walletTransactions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({
      wallet: { balance: 1850000, points: 340, updatedAt: new Date().toISOString() },
      transactions: [],
    });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({
      wallet: { balance: 1850000, points: 340, updatedAt: new Date().toISOString() },
      transactions: [],
    });
  }

  try {
    let [wallet] = await db
      .select()
      .from(creatorWallets)
      .where(eq(creatorWallets.creatorId, user.id))
      .limit(1);

    if (!wallet) {
      // Auto initialize wallet
      [wallet] = await db
        .insert(creatorWallets)
        .values({
          creatorId: user.id,
          balance: 0,
          points: 0,
        })
        .returning();
    }

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, wallet.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(20);

    return NextResponse.json({
      wallet: {
        balance: wallet.balance,
        points: wallet.points,
        updatedAt: wallet.updatedAt,
      },
      transactions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
