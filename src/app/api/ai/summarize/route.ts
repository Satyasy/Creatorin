import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { conversations, collaborationRooms, invoices, messages as messagesTable, profiles } from '@/lib/db/schema';
import { eq, or, and, gt, desc, asc, sql } from 'drizzle-orm';
import { publishChatEvent } from '@/lib/redis';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { generateLocalSummary, chunkConversationMessages } from '@/lib/ai/localSummarizer';
import { extractStructuredFacts, StructuredSummaryData } from '@/lib/ai/semanticExtractor';

export type SummarizeResponseData = StructuredSummaryData;

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const roomId = searchParams.get('roomId');

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    if (conversationId && conversationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const [conv] = await db
        .select({
          id: conversations.id,
          participant1Id: conversations.participant1Id,
          participant2Id: conversations.participant2Id,
          aiSummary: conversations.aiSummary,
          aiSummaryUpdatedAt: conversations.aiSummaryUpdatedAt,
        })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!conv) {
        return NextResponse.json({ success: false, error: 'Percakapan tidak ditemukan' }, { status: 404 });
      }

      // Otorisasi: hanya partisipan atau admin yang berhak mengakses ringkasan
      const isParticipant = conv.participant1Id === user.id || conv.participant2Id === user.id || user.role === 'admin';
      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden: Anda bukan partisipan percakapan ini' }, { status: 403 });
      }

      if (conv.aiSummary) {
        // Cek apakah ringkasan kedaluwarsa (ada pesan baru setelah aiSummaryUpdatedAt)
        let isOutdated = false;
        if (conv.aiSummaryUpdatedAt) {
          const [newerMsg] = await db
            .select({ id: messagesTable.id })
            .from(messagesTable)
            .where(and(
              eq(messagesTable.conversationId, conversationId),
              gt(messagesTable.createdAt, conv.aiSummaryUpdatedAt)
            ))
            .limit(1);

          if (newerMsg) {
            isOutdated = true;
          }
        }

        const enrichedSummary = {
          ...conv.aiSummary,
          isOutdated,
        };

        return NextResponse.json({
          success: true,
          data: enrichedSummary,
          updatedAt: conv.aiSummaryUpdatedAt,
          isOutdated,
        });
      }
    }

    if (roomId && roomId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const [room] = await db
        .select({
          id: collaborationRooms.id,
          creatorId: collaborationRooms.creatorId,
          businessId: collaborationRooms.businessId,
          aiSummary: collaborationRooms.aiSummary,
          aiSummaryUpdatedAt: collaborationRooms.aiSummaryUpdatedAt,
          briefSummary: collaborationRooms.briefSummary,
        })
        .from(collaborationRooms)
        .where(eq(collaborationRooms.id, roomId))
        .limit(1);

      if (!room) {
        return NextResponse.json({ success: false, error: 'Ruang kolaborasi tidak ditemukan' }, { status: 404 });
      }

      const isParticipant = room.creatorId === user.id || room.businessId === user.id || user.role === 'admin';
      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (room.aiSummary) {
        return NextResponse.json({
          success: true,
          data: room.aiSummary,
          updatedAt: room.aiSummaryUpdatedAt,
          briefSummary: room.briefSummary,
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Belum ada ringkasan yang tersimpan' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Harap login terlebih dahulu' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      conversationId,
      roomId, 
      projectTitle = 'Diskusi Kolaborasi Proyek', 
      creatorName: providedCreatorName, 
      businessBrand: providedBusinessBrand,
      messages: providedMessages = [],
      forceRefresh = false,
    } = body as {
      conversationId?: string;
      roomId?: string;
      projectTitle?: string;
      creatorName?: string;
      businessBrand?: string;
      messages?: Array<{ sender: string; text: string; time?: string; role?: string }>;
      forceRefresh?: boolean;
    };

    const targetConvId = conversationId || (roomId && roomId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? roomId : undefined);
    const db = getDb();

    let effectiveCreatorName = providedCreatorName || 'Kreator';
    let effectiveBusinessBrand = providedBusinessBrand || 'UMKM Brand';
    let rawMessages: Array<{ sender: string; text: string; time?: string; role?: string }> = providedMessages;

    // 1. Jika conversationId UUID valid, verifikasi otorisasi & ambil pesan asli dari database PostgreSQL
    if (db && targetConvId && targetConvId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const [conv] = await db
        .select({
          id: conversations.id,
          participant1Id: conversations.participant1Id,
          participant2Id: conversations.participant2Id,
          aiSummary: conversations.aiSummary,
          aiSummaryUpdatedAt: conversations.aiSummaryUpdatedAt,
        })
        .from(conversations)
        .where(eq(conversations.id, targetConvId))
        .limit(1);

      if (conv) {
        // Cek otorisasi
        const isParticipant = conv.participant1Id === user.id || conv.participant2Id === user.id || user.role === 'admin';
        if (!isParticipant) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Anda tidak berhak merangkum percakapan ini' },
            { status: 403 }
          );
        }

        // Ambil nama partisipan resmi dari database profiles
        const [p1] = await db.select({ id: profiles.id, name: profiles.fullName, role: profiles.role }).from(profiles).where(eq(profiles.id, conv.participant1Id)).limit(1);
        const [p2] = await db.select({ id: profiles.id, name: profiles.fullName, role: profiles.role }).from(profiles).where(eq(profiles.id, conv.participant2Id)).limit(1);

        if (p1 && p2) {
          const creatorProfile = p1.role === 'creator' ? p1 : p2.role === 'creator' ? p2 : p1;
          const businessProfile = p1.role !== 'creator' ? p1 : p2;
          effectiveCreatorName = creatorProfile.name || effectiveCreatorName;
          effectiveBusinessBrand = businessProfile.name || effectiveBusinessBrand;
        }

        // Ambil riwayat pesan nyata dari database messages
        const dbMsgs = await db
          .select({
            id: messagesTable.id,
            content: messagesTable.content,
            senderId: messagesTable.senderId,
            createdAt: messagesTable.createdAt,
            senderName: profiles.fullName,
            senderRole: profiles.role,
          })
          .from(messagesTable)
          .innerJoin(profiles, eq(messagesTable.senderId, profiles.id))
          .where(eq(messagesTable.conversationId, targetConvId))
          .orderBy(asc(messagesTable.createdAt));

        if (dbMsgs.length > 0) {
          rawMessages = dbMsgs.map(m => ({
            sender: m.senderId === user.id ? 'Anda' : (m.senderName || 'Lawan Bicara'),
            text: m.content,
            time: m.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            role: m.senderRole,
          }));

          // Cek apakah ringkasan yang tersimpan masih segar dan tidak diminta forceRefresh
          if (conv.aiSummary && !forceRefresh && conv.aiSummaryUpdatedAt) {
            const lastMsgTime = dbMsgs[dbMsgs.length - 1].createdAt;
            if (lastMsgTime <= conv.aiSummaryUpdatedAt) {
              return NextResponse.json({
                success: true,
                data: {
                  ...conv.aiSummary,
                  isOutdated: false,
                },
                cached: true,
              });
            }
          }
        }
      }
    }

    // 2. Siapkan konteks percakapan untuk model Hugging Face lokal
    let hfExecutiveSummary: string | null = null;
    let modelName = 'Hugging Face Transformers.js (distilbart-cnn-6-6 ONNX) + Semantic Fact Engine';

    if (rawMessages.length > 0) {
      try {
        const chunks = chunkConversationMessages(rawMessages);
        if (chunks.length > 0) {
          // Jalankan inferensi model Hugging Face lokal pada teks percakapan aktual
          hfExecutiveSummary = await generateLocalSummary(chunks[0], 80);
        }
      } catch (err: any) {
        console.warn('[AI Summarize] Local HF inference fallback notice:', err?.message || err);
      }
    }

    // 3. Ekstraksi fakta semantik terstruktur (zero-hallucination)
    const finalSummary: StructuredSummaryData = extractStructuredFacts(
      rawMessages,
      projectTitle,
      effectiveCreatorName,
      effectiveBusinessBrand,
      hfExecutiveSummary
    );

    // 4. Simpan ke database PostgreSQL secara persisten
    if (db && targetConvId && targetConvId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      try {
        // Simpan ke tabel conversations
        await db
          .update(conversations)
          .set({
            aiSummary: finalSummary,
            aiSummaryUpdatedAt: sql`NOW()`,
            updatedAt: sql`NOW()`,
          })
          .where(eq(conversations.id, targetConvId));

        // Sinkronkan ke linked collaboration_rooms jika ada
        const [linkedRoom] = await db
          .select({ id: collaborationRooms.id })
          .from(collaborationRooms)
          .innerJoin(invoices, eq(collaborationRooms.invoiceId, invoices.id))
          .where(eq(invoices.conversationId, targetConvId))
          .limit(1);

        if (linkedRoom) {
          await db
            .update(collaborationRooms)
            .set({
              aiSummary: finalSummary,
              aiSummaryUpdatedAt: sql`NOW()`,
            })
            .where(eq(collaborationRooms.id, linkedRoom.id));
        }

        // Siarkan event pembaruan via Redis Pub/Sub
        await publishChatEvent(`chat:${targetConvId}`, {
          type: "AI_SUMMARY_UPDATED",
          conversationId: targetConvId,
          summary: finalSummary,
        });
      } catch (dbErr) {
        console.warn('[AI Summarize] Database persistence notice:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: finalSummary,
    });
  } catch (error: any) {
    console.error('Error in ai summarize route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses analisis percakapan' },
      { status: 500 }
    );
  }
}
