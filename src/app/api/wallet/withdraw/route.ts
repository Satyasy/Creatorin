import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorWallets, walletTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { amount, bankName, accountNumber, accountHolder } = body;

  const withdrawAmount = Number(amount);
  if (!withdrawAmount || withdrawAmount < 50000) {
    return NextResponse.json({ error: "Penarikan minimal 50 koin atau Rp50.000." }, { status: 400 });
  }

  try {
    const [wallet] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, user.id)).limit(1);
    if (!wallet || wallet.balance < withdrawAmount) {
      return NextResponse.json({ error: "Saldo tidak mencukupi untuk melakukan penarikan." }, { status: 400 });
    }

    const fee = Math.max(Math.round(withdrawAmount * 0.02), 2500);
    const totalDebit = withdrawAmount + fee;
    if (wallet.balance < totalDebit) return NextResponse.json({ error: `Saldo harus mencakup biaya penarikan Rp${fee.toLocaleString("id-ID")}.` }, { status: 400 });

    await db
      .update(creatorWallets)
      .set({
        balance: sql`${creatorWallets.balance} - ${totalDebit}`,
        updatedAt: new Date(),
      })
      .where(eq(creatorWallets.creatorId, user.id));

    // Log transaction
    const [tx] = await db
      .insert(walletTransactions)
      .values({
        walletId: wallet.id,
        type: "withdrawal",
        amount: -totalDebit,
        description: `Penarikan ke ${bankName || "Rekening"} (${accountNumber || "-"}) a.n. ${accountHolder || user.fullName}, termasuk biaya Rp${fee.toLocaleString("id-ID")}`,
        status: "completed",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Penarikan Rp${withdrawAmount.toLocaleString("id-ID")} diproses dengan biaya Rp${fee.toLocaleString("id-ID")}.`,
      fee,
      transaction: tx,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
