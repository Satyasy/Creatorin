'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; relatedRoute?: string }>;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  'Bagaimana sistem Escrow & pencairan dana?',
  'Di mana lokasi Collaboration Room & Brief?',
  'Bagaimana cara daftar siswa SMK & sekolah?',
  'Panduan membuat brief proyek untuk UMKM',
];

export function CreatorinChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Halo! Saya Creatorin Assistant resmi. Saya siap memandu Anda mengenai lokasi fitur, tata cara penggunaan, sistem pembayaran Escrow, atau kemitraan sekolah vokasi. Ada yang bisa saya bantu?',
      timestamp: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextMessageId = (prefix: string) => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: nextMessageId('user'),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.answer) {
          const botMsg: ChatMessage = {
            id: nextMessageId('bot'),
            role: 'assistant',
            content: json.answer,
            sources: json.sources,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, botMsg]);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('Gagal mendapatkan respon');
    } catch {
      const fallbackMsg: ChatMessage = {
        id: nextMessageId('bot-err'),
        role: 'assistant',
        content:
          'Creatorin menyediakan halaman Contracts (/contracts) untuk memantau status lamaran brief, halaman Brief (/briefs) untuk UMKM, dan Dashboard Sekolah (/dashboard/school) untuk asesmen kompetensi siswa. Anda dapat mengakses menu utama lewat navigasi aplikasi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          'Percakapan direset. Silakan tanyakan hal lain seputar cara penggunaan atau navigasi fitur platform Creatorin!',
        timestamp: 'Baru saja',
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* 1. Floating Action Button (Toggle) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasUnreadNotice(false);
          }}
          className="relative group w-14 h-14 rounded-full bg-[#0B1F3A] hover:bg-[#155DFC] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer focus:outline-hidden"
          title="Tanya Creatorin AI Assistant"
          aria-label="AI Guide - Buka Chatbot Creatorin"
        >
          <Bot className="w-7 h-7 stroke-[1.8] group-hover:scale-110 transition-transform" />

          {/* Sparkle badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#155DFC] rounded-full border-2 border-white flex items-center justify-center text-white" aria-hidden="true">
            <Sparkles className="w-2.5 h-2.5" />
          </div>

          {/* Unread Notice Indicator */}
          {hasUnreadNotice && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#0B1F3A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs border border-white/30">
              AI Guide
            </span>
          )}
        </button>
      )}

      {/* 2. Chat Window (Linear / Notion Style - Expandable) */}
      {isOpen && (
        <div
          className={`w-[calc(100vw-32px)] ${
            isExpanded
              ? 'sm:w-[680px] lg:w-[760px] h-[calc(100vh-80px)] sm:h-[620px]'
              : 'sm:w-[410px] h-[540px] max-h-[calc(100vh-100px)]'
          } bg-white rounded-[18px] border border-black/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-all`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#0B1F3A] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-[#155DFC] flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight">Creatorin Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-neutral-300 block font-normal">
                  Grounded RAG AI • Panduan Resmi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-[6px] text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                title={isExpanded ? 'Perkecil tampilan' : 'Perbesar tampilan'}
                aria-label={isExpanded ? 'Perkecil tampilan' : 'Perbesar tampilan'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-[6px] text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                title="Reset percakapan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-[6px] text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                title="Tutup asisten"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="px-3.5 py-1.5 bg-blue-50/80 border-b border-blue-100/80 flex items-center gap-1.5 text-[11px] text-blue-900 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#155DFC] shrink-0" />
            <span className="truncate">Informasi terverifikasi dari Creatorin Handbook</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-[12px] leading-relaxed relative group/bubble ${
                    msg.role === 'user'
                      ? 'bg-[#0B1F3A] text-white rounded-br-[2px]'
                      : 'bg-[#F8FAFC] text-[#0D0C22] rounded-bl-[2px] border border-black/10 shadow-2xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-line text-xs font-normal">{msg.content}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {msg.content.split('\n').map((line, lIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={lIdx} className="h-1.5" />;

                        // Check Numbered item
                        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
                        if (numMatch) {
                          const num = numMatch[1];
                          const body = numMatch[2];
                          return (
                            <div key={lIdx} className="flex items-start gap-2 my-1 pl-0.5">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-[#155DFC] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                {num}
                              </span>
                              <div className="text-[12px] text-neutral-800 leading-relaxed font-normal flex-1">
                                {body.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={pIdx} className="font-bold text-[#0D0C22]">{part.slice(2, -2)}</strong>;
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          );
                        }

                        // Check Bullet item
                        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
                        if (bulletMatch) {
                          const body = bulletMatch[1];
                          return (
                            <div key={lIdx} className="flex items-start gap-2 my-0.5 pl-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#155DFC] shrink-0 mt-2" />
                              <div className="text-[12px] text-neutral-800 leading-relaxed font-normal flex-1">
                                {body.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={pIdx} className="font-bold text-[#0D0C22]">{part.slice(2, -2)}</strong>;
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          );
                        }

                        // Check Section Header
                        if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)) {
                          const headerText = trimmed.replace(/^###\s*/, '').replace(/^\*\*|\*\*$/g, '');
                          return (
                            <div key={lIdx} className="text-[12px] font-bold text-[#0D0C22] mt-2 mb-1 pt-1 border-t border-black/5 flex items-center gap-1.5">
                              <span className="w-1 h-3 rounded-full bg-[#155DFC]" />
                              <span>{headerText}</span>
                            </div>
                          );
                        }

                        // Regular paragraph
                        return (
                          <p key={lIdx} className="text-[12px] text-neutral-800 leading-relaxed">
                            {trimmed.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-bold text-[#0D0C22]">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}

                      {/* Copy message button */}
                      <div className="pt-1.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedMessageId(msg.id);
                            setTimeout(() => setCopiedMessageId(null), 2000);
                          }}
                          className="opacity-70 hover:opacity-100 text-[10px] text-neutral-500 hover:text-[#155DFC] inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="Salin jawaban"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sources & Navigation Links */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-black/10 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                        Rujukan & Rute Terkait:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map(src => (
                          src.relatedRoute ? (
                            <Link
                              key={src.title}
                              href={src.relatedRoute}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white text-[#155DFC] border border-black/10 text-[10px] font-bold hover:bg-blue-50 transition-colors"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          ) : (
                            <span
                              key={src.title}
                              className="px-2 py-0.5 rounded-[6px] bg-white text-neutral-600 border border-black/10 text-[10px] font-medium"
                            >
                              {src.title}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#F3F3F4] rounded-[12px] rounded-bl-[2px] max-w-[60%] border border-black/5">
                <div className="w-2 h-2 rounded-full bg-[#155DFC] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#155DFC] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#155DFC] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-neutral-500 ml-1">Mencari jawaban...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown when message count is small) */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3.5 pb-2 pt-1 border-t border-black/5 bg-neutral-50/50">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Pertanyaan Populer:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUESTIONS.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#0D0C22] text-[11px] font-medium rounded-[8px] border border-black/10 transition-colors text-left cursor-pointer shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-black/10 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Tanyakan lokasi fitur atau tata cara..."
              className="flex-1 px-3 py-2 bg-[#F8FAFC] rounded-[8px] border border-black/10 text-xs text-[#0D0C22] placeholder:text-neutral-400 focus:bg-white focus:border-[#155DFC] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="w-9 h-9 rounded-[8px] bg-[#155DFC] hover:bg-[#0E4CD1] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
