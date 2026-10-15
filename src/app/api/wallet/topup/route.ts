import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorWallets, walletTransactions, notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const ALLOWED_DEMO_EMAILS = [
  'umkm@creatorin.my.id',
  'creator@creatorin.my.id',
  'school@creatorin.my.id',
  'glowlab@creatorin.id',
  'munir@creatorin.id',
  'admin@creatorin.my.id',
];

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan masuk kembali." }, { status: 401 });
  }

  const isDemoEnv = 
    process.env.ENABLE_DEMO_TOPUP === 'true' || 
    process.env.ALLOW_DEMO_TOPUP === 'true' || 
    process.env.NODE_ENV !== 'production';

  const isDemoAccount = user.email && ALLOWED_DEMO_EMAILS.includes(user.email.toLowerCase());

  if (!isDemoEnv && !isDemoAccount) {
    return NextResponse.json(
      {
        error: "Top-up koin demo hanya diizinkan untuk akun demonstrasi evaluasi atau saat mode demo aktif.",
        code: "ERR_DEMO_TOPUP_DISABLED",
      },
      { status: 403 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database tidak terhubung" }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawAmount = Number(body.amount);

    if (!Number.isSafeInteger(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "Jumlah koin top-up harus berupa angka positif yang valid." },
        { status: 400 }
      );
    }

    if (rawAmount > 50_000_000) {
      return NextResponse.json(
        { error: "Maksimal top-up koin demo per transaksi adalah 50.000.000 koin." },
        { status: 400 }
      );
    }

    // Eksekusi atomik menggunakan transaksi PostgreSQL
    const result = await db.transaction(async (tx) => {
      // 1. Pastikan record dompet ada untuk pengguna
      let [wallet] = await tx
        .select()
        .from(creatorWallets)
        .where(eq(creatorWallets.creatorId, user.id))
        .limit(1);

      if (!wallet) {
        [wallet] = await tx
          .insert(creatorWallets)
          .values({
            creatorId: user.id,
            balance: 0,
            points: 100,
          })
          .returning();
      }

      // 2. Kunci baris & tambahkan saldo secara atomik
      const [updatedWallet] = await tx
        .update(creatorWallets)
        .set({
          balance: sql`${creatorWallets.balance} + ${rawAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(creatorWallets.id, wallet.id))
        .returning();

      // 3. Catat log mutasi transaksi dompet immutable
      const [transaction] = await tx
        .insert(walletTransactions)
        .values({
          walletId: wallet.id,
          type: "topup",
          amount: rawAmount,
          description: `Top-up Koin Demo untuk simulasi evaluasi kolaborasi (+${rawAmount.toLocaleString('id-ID')} Koin)`,
          status: "completed",
        })
        .returning();

      // 4. Catat notifikasi in-app
      try {
        await tx.insert(notifications).values({
          userId: user.id,
          type: "wallet",
          title: "Top-up koin berhasil!",
          body: `Saldo koin Anda berhasil ditambahkan sebesar 🪙 ${rawAmount.toLocaleString('id-ID')}. Total saldo sekarang: 🪙 ${updatedWallet.balance.toLocaleString('id-ID')}.`,
          linkUrl: "/wallet",
        });
      } catch {}

      return { updatedWallet, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan 🪙 ${rawAmount.toLocaleString('id-ID')} Koin ke dompet Anda.`,
      balance: result.updatedWallet.balance,
      amount: rawAmount,
      wallet: {
        balance: result.updatedWallet.balance,
        points: result.updatedWallet.points,
        updatedAt: result.updatedWallet.updatedAt,
      },
      transaction: result.transaction,
    });
  } catch (err: any) {
    console.error("[Demo Top-Up Error]", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses top-up koin." },
      { status: 500 }
    );
  }
}
