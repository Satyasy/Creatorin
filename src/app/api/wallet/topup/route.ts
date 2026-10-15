import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorWallets, walletTransactions, notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  let body: { amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "Nominal top up harus lebih besar dari 0." }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    // Fallback if db is not connected (mock mode)
    return NextResponse.json({
      success: true,
      balance: amount,
      amount,
      message: `Top up koin sebesar 🪙 ${amount.toLocaleString('id-ID')} berhasil (Simulasi).`,
    });
  }

  try {
    // 1. Ensure user's wallet exists
    let [wallet] = await db
      .select()
      .from(creatorWallets)
      .where(eq(creatorWallets.creatorId, user.id))
      .limit(1);

    if (!wallet) {
      const [newWallet] = await db
        .insert(creatorWallets)
        .values({
          creatorId: user.id,
          balance: 0,
          points: 0,
        })
        .returning();
      wallet = newWallet;
    }

    // 2. Update balance atomically
    const [updatedWallet] = await db
      .update(creatorWallets)
      .set({
        balance: sql`${creatorWallets.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creatorWallets.id, wallet.id))
      .returning();

    // 3. Record transaction
    const [transaction] = await db
      .insert(walletTransactions)
      .values({
        walletId: wallet.id,
        type: "topup",
        amount: amount,
        description: `Top up koin instan (🪙 ${amount.toLocaleString('id-ID')})`,
        status: "completed",
      })
      .returning();

    // 4. Create in-app notification
    await db.insert(notifications).values({
      userId: user.id,
      type: "wallet",
      title: "Top up koin berhasil!",
      body: `Saldo koin Anda berhasil ditambahkan sebesar 🪙 ${amount.toLocaleString('id-ID')}. Total saldo sekarang: 🪙 ${updatedWallet.balance.toLocaleString('id-ID')}.`,
      linkUrl: "/wallet",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      balance: updatedWallet.balance,
      amount,
      transaction,
      message: `Top up koin sebesar 🪙 ${amount.toLocaleString('id-ID')} berhasil ditambahkan ke dompet Anda.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memproses top up.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
