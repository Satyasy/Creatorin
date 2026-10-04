'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CalendarDays, MapPin } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { creatorService } from '@/services/creatorService';
import type { ActivePage, AuthState, Creator, ProjectListing } from '@/types';

type Application = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorHeadline?: string;
  proposedPrice: string;
  pitch: string;
  status: string;
};

interface Props {
  brief: ProjectListing;
  currentUser?: AuthState['user'];
  onSignOut?: () => void;
  onNavigate?: (page: ActivePage) => void;
  onClose?: () => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onEditBrief?: (brief: ProjectListing) => void;
}

export function BriefDetailPage({ brief, currentUser, onClose, onViewCreatorProfile, onEditBrief }: Props) {
  const router = useRouter();
  const { user: sessionUser } = useAuth();
  const user = currentUser === undefined ? sessionUser : currentUser;
  const [currentBrief, setCurrentBrief] = useState(brief);
  const [businessId, setBusinessId] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [myApplication, setMyApplication] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(brief.title);
  const [description, setDescription] = useState(brief.description);
  const [category, setCategory] = useState(brief.category);
  const [budget, setBudget] = useState(brief.formattedBudget);
  const [deadline, setDeadline] = useState(brief.deadline);
  const [pitch, setPitch] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const isOwner = Boolean(user?.id && user.id === businessId);

  useEffect(() => {
    let active = true;
    fetch(`/api/briefs/${encodeURIComponent(brief.id)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Gagal memuat rincian brief.');
        const data = await response.json();
        if (!active) return;
        setBusinessId(data.brief.businessId);
        setApplications(data.applications || []);
        setMyApplication(Boolean(data.myApplication));
        setCurrentBrief((previous) => ({ ...previous,
          title: data.brief.title, category: data.brief.category,
          description: data.brief.description, formattedBudget: data.brief.budget,
          deadline: data.brief.deadline || '',
          deliverables: data.brief.expectedOutput ? [data.brief.expectedOutput] : [],
          proposalsCount: data.applicationsCount || 0,
        }));
      })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Gagal memuat brief.'); });
    return () => { active = false; };
  }, [brief.id]);

  const submitApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/briefs/${brief.id}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pitch, proposedPrice }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim proposal.');
      setMyApplication(true); setNotice('Proposal berhasil dikirim.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Gagal mengirim proposal.'); }
    finally { setBusy(false); }
  };

  const saveBrief = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/briefs/${brief.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, category, budget, deadline }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan brief.');
      const updated = { ...currentBrief, title, description, category, formattedBudget: budget, deadline };
      setCurrentBrief(updated); onEditBrief?.(updated); setEditing(false); setNotice('Brief berhasil diperbarui.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Gagal menyimpan brief.'); }
    finally { setBusy(false); }
  };

  const acceptApplication = async (application: Application) => {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/briefs/${brief.id}/applications/${application.id}/accept`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menerima proposal.');
      setApplications((items) => items.map((item) => item.id === application.id ? { ...item, status: 'accepted' } : item));
      setNotice(`Proposal ${application.creatorName} diterima. Lanjutkan percakapan di Chat.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Gagal menerima proposal.'); }
    finally { setBusy(false); }
  };

  const viewCreator = async (id: string) => {
    if (onViewCreatorProfile) {
      const creator = await creatorService.getCreatorDetail(id).catch(() => null);
      if (creator) onViewCreatorProfile(creator);
    } else router.push(`/creator/${id}`);
  };

  const close = () => onClose ? onClose() : router.push('/briefs');
  return (
    <div className={onClose ? 'fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-8' : 'min-h-screen bg-[#F7F8FA] px-4 py-8'}>
      <main className="mx-auto max-w-4xl rounded-2xl bg-white p-5 text-[#0D0C22] shadow-sm sm:p-9">
        <button type="button" onClick={close} className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#55576A] hover:text-primary"><ArrowLeft className="h-4 w-4" /> Kembali ke brief</button>
        {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
        <p className="text-sm font-semibold text-primary">{currentBrief.category}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{currentBrief.title}</h1>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#55576A]">
          <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" />{currentBrief.clientName}</span>
          {currentBrief.clientLocation && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{currentBrief.clientLocation}</span>}
          {currentBrief.deadline && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{currentBrief.deadline}</span>}
        </div>
        <div className="mt-8 grid gap-8 border-y border-[#E1E3EA] py-7 sm:grid-cols-[1fr_220px]">
          <div><h2 className="font-semibold">Kebutuhan proyek</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#55576A]">{currentBrief.description}</p>
            {currentBrief.deliverables?.length ? <><h3 className="mt-6 font-semibold">Hasil yang diharapkan</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#55576A]">{currentBrief.deliverables.join('\n')}</p></> : null}
          </div>
          <aside><p className="text-xs text-[#6F7285]">Budget</p><p className="mt-1 text-xl font-semibold">{currentBrief.formattedBudget || 'Belum ditentukan'}</p><p className="mt-5 text-xs text-[#6F7285]">Proposal</p><p className="mt-1 font-semibold">{currentBrief.proposalsCount || 0}</p></aside>
        </div>
        {isOwner && <section className="mt-8"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Pelamar</h2><button onClick={() => setEditing((value) => !value)} className="min-h-11 text-sm font-semibold text-primary">{editing ? 'Batal edit' : 'Edit brief'}</button></div>
          {applications.length ? <div className="mt-4 divide-y divide-[#E1E3EA]">{applications.map((application) => <div key={application.id} className="py-5"><button onClick={() => viewCreator(application.creatorId)} className="font-semibold hover:text-primary">{application.creatorName}</button><p className="mt-1 text-sm text-[#55576A]">{application.creatorHeadline}</p><p className="mt-3 whitespace-pre-wrap text-sm">{application.pitch}</p><p className="mt-3 text-sm font-semibold">Tawaran: {application.proposedPrice}</p><p className="mt-1 text-xs text-[#6F7285]">Status: {application.status}</p>{application.status === 'pending' && <button disabled={busy} onClick={() => acceptApplication(application)} className="mt-3 min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">Terima proposal</button>}</div>)}</div> : <p className="mt-4 text-sm text-[#55576A]">Belum ada pelamar.</p>}
          {editing && <form onSubmit={saveBrief} className="mt-7 grid gap-3 border-t border-[#E1E3EA] pt-6"><label className="text-sm font-semibold">Judul<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 block w-full rounded-lg border p-3 font-normal" /></label><label className="text-sm font-semibold">Kategori<input required value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 block w-full rounded-lg border p-3 font-normal" /></label><label className="text-sm font-semibold">Deskripsi<textarea required value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 block w-full rounded-lg border p-3 font-normal" rows={5} /></label><label className="text-sm font-semibold">Budget<input required value={budget} onChange={(event) => setBudget(event.target.value)} className="mt-1 block w-full rounded-lg border p-3 font-normal" /></label><label className="text-sm font-semibold">Tenggat<input value={deadline} onChange={(event) => setDeadline(event.target.value)} className="mt-1 block w-full rounded-lg border p-3 font-normal" /></label><button disabled={busy} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">Simpan brief</button></form>}
        </section>}
        {user?.role === 'creator' && <section className="mt-8"><h2 className="text-xl font-semibold">Kirim proposal</h2>{myApplication ? <p className="mt-3 text-sm text-[#55576A]">Anda sudah melamar brief ini.</p> : <form onSubmit={submitApplication} className="mt-4 grid gap-3"><label className="text-sm font-semibold">Tawaran harga<input required value={proposedPrice} onChange={(event) => setProposedPrice(event.target.value)} placeholder="Rp1.500.000" className="mt-1 block w-full rounded-lg border p-3 font-normal" /></label><label className="text-sm font-semibold">Pesan untuk UMKM<textarea required value={pitch} onChange={(event) => setPitch(event.target.value)} rows={5} className="mt-1 block w-full rounded-lg border p-3 font-normal" /></label><button disabled={busy} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">Kirim proposal</button></form>}</section>}
      </main>
    </div>
  );
}
