import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorWallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    let [wallet] = await db
      .select()
      .from(creatorWallets)
      .where(eq(creatorWallets.creatorId, user.id))
      .limit(1);

    if (!wallet) {
      // Auto-create wallet with starting 5000 coins for UMKM / Creator
      const [newWallet] = await db
        .insert(creatorWallets)
        .values({
          creatorId: user.id,
          balance: 5000,
          points: 100,
        })
        .returning();
      wallet = newWallet;
    }

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      points: wallet.points,
      coinFormatted: `${wallet.balance.toLocaleString('id-ID')} Koin`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
