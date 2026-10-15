import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorWallets, walletTransactions, notifications } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const body = await req.json();
    const { amount, bankName, accountNumber, accountHolder } = body;

    const parsedAmount = parseInt(String(amount), 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Nominal penarikan tidak valid" }, { status: 400 });
    }

    if (!bankName || !accountNumber) {
      return NextResponse.json({ error: "Nama bank dan nomor rekening wajib diisi" }, { status: 400 });
    }

    // Process transaction atomically
    const result = await db.transaction(async (tx) => {
      // Find wallet
      const [wallet] = await tx
        .select()
        .from(creatorWallets)
        .where(eq(creatorWallets.creatorId, user.id))
        .limit(1);

      if (!wallet || wallet.balance < parsedAmount) {
        throw new Error("Saldo dompet tidak mencukupi untuk penarikan");
      }

      // Deduct balance
      const [updatedWallet] = await tx
        .update(creatorWallets)
        .set({
          balance: sql`${creatorWallets.balance} - ${parsedAmount}`,
          updatedAt: new Date(),
        })
        .where(and(eq(creatorWallets.id, wallet.id), gte(creatorWallets.balance, parsedAmount)))
        .returning();

      if (!updatedWallet) {
        throw new Error("Gagal memproses penarikan saldo, silakan coba lagi");
      }

      // Insert transaction record
      const [txRecord] = await tx
        .insert(walletTransactions)
        .values({
          walletId: wallet.id,
          type: "withdrawal",
          amount: -parsedAmount,
          description: `Penarikan dana ke ${bankName} (${accountNumber}${accountHolder ? ` a.n ${accountHolder}` : ""})`,
          status: "completed",
        })
        .returning();

      // Notify user
      await tx.insert(notifications).values({
        userId: user.id,
        type: "wallet",
        title: "Penarikan Berhasil Diajukan",
        body: `Penarikan Rp${parsedAmount.toLocaleString("id-ID")} ke rekening ${bankName} (${accountNumber}) berhasil diproses.`,
        linkUrl: "/contracts",
      });

      return {
        wallet: updatedWallet,
        transaction: txRecord,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Penarikan saldo berhasil diproses",
      balance: result.wallet.balance,
      transaction: result.transaction,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses penarikan" }, { status: 400 });
  }
}
