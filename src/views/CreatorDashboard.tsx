'use client';

import { useMemo, useState } from 'react';
import { Bookmark, BriefcaseBusiness, Clock, MapPin, Search, ShieldCheck, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { MOCK_PROJECTS } from '@/data/mockProjects';
import { useAuth } from '@/providers/AuthProvider';

type FeedTab = 'recommended' | 'recent' | 'saved';

const tabs: { id: FeedTab; label: string }[] = [
  { id: 'recommended', label: 'Rekomendasi' },
  { id: 'recent', label: 'Terbaru' },
  { id: 'saved', label: 'Tersimpan' },
];

const ageInHours = (value: string) => {
  const amount = Number.parseInt(value, 10) || 0;
  return value.includes('hari') ? amount * 24 : amount;
};

export const CreatorDashboard = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FeedTab>('recommended');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const briefs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = MOCK_PROJECTS.filter((brief) => {
      if (activeTab === 'saved' && !savedIds.includes(brief.id)) return false;
      return !needle || `${brief.title} ${brief.description} ${brief.category} ${(brief.requiredSkills || []).join(' ')}`.toLowerCase().includes(needle);
    });

    return activeTab === 'recent'
      ? [...matching].sort((a, b) => ageInHours(a.postedTimeAgo) - ageInHours(b.postedTimeAgo))
      : matching;
  }, [activeTab, query, savedIds]);

  const toggleSaved = (id: string) => {
    setSavedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
        <div className="mx-auto grid max-w-[1460px] gap-8 xl:grid-cols-[minmax(0,1fr)_310px]">
          <section className="min-w-0">
            <header>
              <p className="text-sm font-semibold text-primary">Ruang kerja kreator</p>
              <h1 className="mt-1 text-3xl font-semibold leading-tight sm:text-[38px]">
                Selamat datang, {user?.name?.split(' ')[0] || 'Kreator'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#55576A] sm:text-base">
                Temukan brief yang sesuai, simpan yang menarik, lalu pelajari kebutuhannya sebelum mengirim proposal.
              </p>
            </header>

            <label className="mt-7 flex h-13 items-center rounded-xl border border-[#B7BBC9] bg-white px-4 focus-within:border-primary focus-within:shadow-[var(--focus-ring)]">
              <span className="sr-only">Cari brief proyek</span>
              <Search className="mr-3 h-5 w-5 shrink-0 text-[#55576A]" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari proyek, keahlian, atau kata kunci"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#6F7285]"
              />
            </label>

            <div className="mt-7 border-b border-[var(--outline)]">
              <div className="flex gap-7 overflow-x-auto" role="tablist" aria-label="Filter brief">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-11 shrink-0 border-b-2 px-1 text-sm font-semibold ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-[#55576A] hover:text-[var(--ink)]'}`}
                  >
                    {tab.label}{tab.id === 'saved' && savedIds.length > 0 ? ` (${savedIds.length})` : ''}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-5 text-xs text-[#6F7285]">Data demo ditampilkan untuk memperlihatkan bentuk feed proyek.</p>

            <div className="mt-3 divide-y divide-[var(--outline)] border-y border-[var(--outline)] bg-white">
              {briefs.length > 0 ? briefs.map((brief) => {
                const isSaved = savedIds.includes(brief.id);
                return (
                  <article key={brief.id} className="px-4 py-5 transition-colors hover:bg-[#FAFBFD] sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#55576A]">
                          <span className="rounded-md bg-[#E8F0FF] px-2 py-1 font-semibold text-[#0D47BF]">{brief.category}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{brief.postedTimeAgo}</span>
                          {brief.isUrgent && <span className="font-semibold text-[#A13B00]">Mendesak</span>}
                        </div>
                        <Link href={`/briefs/${brief.id}`} className="mt-3 block rounded-sm">
                          <h2 className="text-lg font-semibold leading-7 hover:text-primary sm:text-xl">{brief.title}</h2>
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaved(brief.id)}
                        aria-label={isSaved ? 'Hapus brief dari tersimpan' : 'Simpan brief'}
                        aria-pressed={isSaved}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[#55576A] hover:bg-[#E8F0FF] hover:text-primary"
                      >
                        <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : ''}`} aria-hidden="true" />
                      </button>
                    </div>

                    <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[#55576A]">{brief.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(brief.requiredSkills || []).slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-md bg-[#F0F1F4] px-2.5 py-1 text-xs font-medium text-[#44465A]">{skill}</span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--outline)] pt-4 text-xs text-[#55576A] sm:text-sm">
                      <strong className="text-[var(--ink)]">{brief.formattedBudget || `Rp${brief.budgetMin?.toLocaleString('id-ID')}`}</strong>
                      <span>{brief.deadline}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{brief.clientLocation || 'Indonesia'}</span>
                      {brief.isVerifiedClient && <span className="flex items-center gap-1 text-[#176B45]"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Klien terverifikasi</span>}
                      <span className="sm:ml-auto">{brief.proposalsCount} proposal</span>
                    </div>
                  </article>
                );
              }) : (
                <div className="px-6 py-14 text-center">
                  <h2 className="text-lg font-semibold">{activeTab === 'saved' ? 'Belum ada brief tersimpan' : 'Brief tidak ditemukan'}</h2>
                  <p className="mt-2 text-sm text-[#55576A]">
                    {activeTab === 'saved' ? 'Simpan brief dari tab Rekomendasi untuk membacanya kembali di sini.' : 'Coba kata kunci yang lebih umum.'}
                  </p>
                  {query && <button type="button" onClick={() => setQuery('')} className="mt-4 min-h-11 font-semibold text-primary">Hapus pencarian</button>}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
            <section className="border border-[var(--outline)] bg-white p-5 sm:p-6" aria-labelledby="creator-profile-title">
              <div className="flex items-center justify-between gap-4">
                <h2 id="creator-profile-title" className="text-lg font-semibold">Profil Anda</h2>
                <Link href="/profile" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Buka profil</Link>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <img src={user?.avatar || '/creatorin/avatar.png'} alt="" className="h-14 w-14 rounded-full border border-[var(--outline)] object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user?.name || 'Profil kreator'}</p>
                  <p className="mt-0.5 text-sm text-[#55576A]">Kreator Creatorin</p>
                </div>
              </div>
              <div className="mt-6 border-t border-[var(--outline)] pt-5">
                <p className="font-semibold">Siapkan profil sebelum melamar</p>
                <p className="mt-2 text-sm leading-6 text-[#55576A]">Lengkapi bio, keahlian, portofolio, serta rekening agar calon klien mendapat konteks yang cukup.</p>
                <Link href="/profile" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-[#1248C7]">Lengkapi profil</Link>
              </div>
            </section>

            <section className="border border-[var(--outline)] bg-[#0D0C22] p-5 text-white sm:p-6" aria-labelledby="creator-workflow-title">
              <BriefcaseBusiness className="h-6 w-6 text-[#8BB0FF]" aria-hidden="true" />
              <h2 id="creator-workflow-title" className="mt-4 text-lg font-semibold text-white">Alur kerja yang aman</h2>
              <ol className="mt-4 space-y-4 text-sm leading-6 text-[#DDE0E8]">
                <li className="flex gap-3"><span className="font-semibold text-white">1.</span><span>Pelajari brief dan kirim proposal yang relevan.</span></li>
                <li className="flex gap-3"><span className="font-semibold text-white">2.</span><span>Kerjakan proyek di ruang kolaborasi.</span></li>
                <li className="flex gap-3"><span className="font-semibold text-white">3.</span><span>Terima koin setelah hasil disetujui.</span></li>
              </ol>
              <Link href="/wallet" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#A9C3FF] hover:text-white">
                <WalletCards className="h-4 w-4" aria-hidden="true" />Buka dompet
              </Link>
            </section>
          </aside>
        </div>
    </div>
  );
};
