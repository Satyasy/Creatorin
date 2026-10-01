import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledgeBase } from '@/data/creatorinKnowledgeBase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messages = [] } = body as {
      message?: string;
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    // User's current prompt
    const userQuery = message || (messages.length > 0 ? messages[messages.length - 1].content : '');

    if (!userQuery.trim()) {
      return NextResponse.json(
        { success: false, error: 'Pesan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Step 1: RAG Semantic Retrieval from Creatorin Knowledge Base
    const matchedDocs = searchKnowledgeBase(userQuery, 3);
    const contextText = matchedDocs
      .map(doc => `### ${doc.title}\n${doc.content}`)
      .join('\n\n');

    // Step 2: Check for API Key (Gemini, Groq, or OpenAI)
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    let aiResponseText: string | null = null;

    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Anda adalah Creatorin Assistant, pemandu resmi yang ramah, profesional, dan to the point untuk platform Creatorin.
Jawab pertanyaan pengguna secara akurat dan HANYA berdasarkan konteks pengetahuan resmi Creatorin di bawah ini.
Jika pengguna menanyakan hal yang benar-benar tidak berkaitan dengan Creatorin, jawab dengan ramah bahwa Anda bertugas khusus untuk memandu seputar platform Creatorin.

[KONTEKS RESMI CREATORIN]:
${contextText}

[PERTANYAAN PENGGUNA]:
${userQuery}

Berikan jawaban yang jelas, terstruktur (gunakan poin/bullet bila perlu), dan sebutkan rute/menu terkait di Creatorin jika relevan.`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 600,
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generated = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated) {
            aiResponseText = generated;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local RAG synthesizer:', err);
      }
    } else if (openaiKey) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Anda adalah Creatorin Assistant, pemandu resmi platform Creatorin.
Gunakan HANYA konteks resmi Creatorin berikut untuk menjawab. Jangan berhalusinasi.
Konteks:
${contextText}`
              },
              { role: 'user', content: userQuery }
            ],
            temperature: 0.2,
            max_tokens: 500,
          })
        });

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const generated = openAiData.choices?.[0]?.message?.content;
          if (generated) {
            aiResponseText = generated;
          }
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to local RAG synthesizer:', err);
      }
    }

    // Step 3: High-Quality Grounded Fallback Synthesizer (Zero Hallucination Guaranteed)
    if (!aiResponseText) {
      if (matchedDocs.length > 0) {
        const topDoc = matchedDocs[0];
        const secondaryDoc = matchedDocs.length > 1 ? matchedDocs[1] : null;

        let formattedAnswer = `${topDoc.content}`;
        if (secondaryDoc && secondaryDoc.id !== topDoc.id) {
          formattedAnswer += `\n\n**Informasi Tambahan (${secondaryDoc.title}):**\n${secondaryDoc.content}`;
        }

        aiResponseText = formattedAnswer;
      } else {
        aiResponseText = `Halo! Saya Creatorin Assistant. Saya dapat membantu Anda seputar tata cara menggunakan Creatorin, sistem pembayaran Escrow, panduan brief proyek untuk UMKM, Collaboration Room, atau fitur kemitraan sekolah vokasi. Silakan tanyakan hal yang ingin Anda ketahui!`;
      }
    }

    const sources = matchedDocs.map(d => ({
      title: d.title,
      relatedRoute: d.relatedRoute,
    }));

    return NextResponse.json({
      success: true,
      answer: aiResponseText,
      sources,
    });
  } catch (error: any) {
    console.error('Error in chatbot RAG API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada asisten AI' },
      { status: 500 }
    );
  }
}
