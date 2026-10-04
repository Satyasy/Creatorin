'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Instagram,
  Video,
  Layers,
  ArrowUpRight,
  MessageSquare,
  Upload,
  Info,
  Send,
  Check,
  Pencil,
  Trash2
} from 'lucide-react';
import { FeedProject, Creator, ActivePage } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { ProjectCard } from '@/components/common/ProjectCard';
import { Footer } from '@/components/layout/Footer';

export interface ProjectDetailModalProps {
  project: FeedProject;
  onClose: () => void;
  onSelectProject?: (project: FeedProject) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onGetInTouch?: (creator: Creator) => void;
  onScheduleCall?: (creator: Creator, project?: FeedProject) => void;
  onNavigate?: (page: ActivePage) => void;
  allProjects?: FeedProject[];
}

interface CommentItem {
  id: string;
  name: string;
  avatar: string;
  text: string;
  time: string;
  hasBadge?: boolean;
  createdAt?: number;
  isOwner?: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project: initialProject,
  onClose,
  onSelectProject,
  onViewCreatorProfile,
  onGetInTouch,
  onNavigate,
  allProjects = []
}) => {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<FeedProject>(initialProject);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Comment & Sidebar states matching Figma
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [commentEditCutoff] = useState(() => Date.now() - 10 * 60 * 1000);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${currentProject.id}/comments`, { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Gagal memuat komentar');
        return response.json();
      })
      .then(({ comments: rows }) => {
        if (active) setComments(rows.map((row: { id: string; userId: string; name: string; avatar: string | null; text: string; createdAt: string }) => ({
          id: row.id,
          name: row.name,
          avatar: row.avatar || '/creatorin/avatar.png',
          text: row.text,
          time: new Date(row.createdAt).toLocaleDateString('id-ID'),
          createdAt: new Date(row.createdAt).getTime(),
          isOwner: row.userId === user?.id,
        })));
      })
      .catch(() => { if (active) showToast('Komentar belum dapat dimuat'); });
    return () => { active = false; };
  }, [currentProject.id, showToast, user?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tautan proyek berhasil disalin ke clipboard!');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newCommentText.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim komentar');
      setComments(prev => [{ id: data.comment.id, name: user?.name || 'Anda', avatar: user?.avatar || '/creatorin/avatar.png', text: data.comment.content, time: 'Baru saja', createdAt: new Date(data.comment.createdAt).getTime(), isOwner: true }, ...prev]);
      setNewCommentText('');
      showToast('Komentar berhasil dikirim!');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal mengirim komentar'); }
  };

  const handleStartEdit = (item: CommentItem) => {
    setEditingCommentId(item.id);
    setEditingCommentText(item.text);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/comments/${commentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editingCommentText.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memperbarui komentar');
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, text: data.comment.content, time: 'Diedit baru saja' } : c));
      setEditingCommentId(null);
      setEditingCommentText('');
      showToast('Komentar berhasil diperbarui!');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal memperbarui komentar'); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/comments/${commentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error || 'Gagal menghapus komentar');
      setComments(prev => prev.filter(c => c.id !== commentId));
      if (editingCommentId === commentId) setEditingCommentId(null);
      showToast('Komentar berhasil dihapus!');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal menghapus komentar'); }
  };

  const mediaList = currentProject.carouselImages && currentProject.carouselImages.length > 0
    ? currentProject.carouselImages
    : currentProject.additionalMedia && currentProject.additionalMedia.length > 0
      ? currentProject.additionalMedia
      : [currentProject.coverImage || currentProject.mediaUrl || ''];

  const creator = currentProject.creator;
  const creatorName = creator?.name || 'Creator Creatorin';
  const normalizedName = creatorName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const creatorHandle = currentProject.socialHandle || `@${normalizedName}`;
  const description = currentProject.description || currentProject.caption || '';
  const categoryLabel = currentProject.category || 'Portofolio Kreator';

  const isTikTok = currentProject.platform === 'tiktok' || categoryLabel.toLowerCase().includes('tiktok');
  const isInstagram =
    currentProject.platform === 'instagram' ||
    categoryLabel.toLowerCase().includes('instagram') ||
    categoryLabel.toLowerCase().includes('reels');

  const creatorId = creator?.id || '';
  const creatorOtherProjects = allProjects.filter(
    project => (project.creatorId === creatorId || project.creator?.id === creatorId) && project.id !== currentProject.id
  ).slice(0, 8);

  const displayOtherProjects = creatorOtherProjects.length >= 4
    ? creatorOtherProjects
    : [
        ...creatorOtherProjects,
        ...allProjects.filter(project => (
          project.id !== currentProject.id && !creatorOtherProjects.some(creatorProject => creatorProject.id === project.id)
        ))
      ].slice(0, 8);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(Number.isNaN(progress) ? 0 : progress);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) {
      setIsPlaying(prev => !prev);
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      return;
    }

    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(prev => !prev);
  };

  const handleSwitchProject = (newProject: FeedProject) => {
    setCurrentProject(newProject);
    setComments([]);
    setIsPlaying(false);
    setVideoProgress(0);
    setCurrentSlideIndex(0);
    onSelectProject?.(newProject);
    modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPlatformBadge = () => {
    if (isInstagram) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold leading-4 text-[#171717] shadow-sm backdrop-blur-md">
          <Instagram className="size-3.5 text-pink-600" />
          Instagram {currentProject.mediaType === 'video' ? 'Reels' : 'Post'}
        </span>
      );
    }

    if (isTikTok) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#404040] bg-black/90 px-3 py-1.5 text-[12px] font-bold leading-4 text-white shadow-sm backdrop-blur-md">
          <Video className="size-3.5 text-cyan-400" />
          Video Tiktok
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0C22] px-3 py-1.5 text-[12px] font-bold leading-4 text-white">
        <Layers className="size-3.5" />
        Portofolio
      </span>
    );
  };

  const renderMedia = () => (
    <div className="relative w-full overflow-hidden rounded-[16px] border border-black/10 bg-[#0D0C22]">
      <div className="absolute left-4 top-4 z-20 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold leading-[16.5px] tracking-[0.06px] text-white backdrop-blur-md">
        {creatorHandle}
      </div>

      <div className="absolute right-4 top-4 z-20">
        {renderPlatformBadge()}
      </div>

      {currentProject.mediaType === 'video' ? (
        <div className="relative flex aspect-[960/540.875] max-h-[640px] min-h-[260px] w-full items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={currentProject.videoUrl || currentProject.mediaUrl}
            poster={currentProject.coverImage}
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlayPause}
            className="size-full cursor-pointer object-cover"
          />

          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
              title="Putar video"
            >
              <span className="flex size-[72px] items-center justify-center rounded-full bg-white/90 text-[#0B1F3A] shadow-xl transition hover:scale-105">
                <Play className="size-8 translate-x-0.5 fill-[#0B1F3A]" />
              </span>
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-4 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex size-8 items-center justify-center rounded-full text-white transition hover:bg-white/20 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Putar'}
            >
              {isPlaying ? <Pause className="size-5 fill-white" /> : <Play className="size-5 fill-white" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="flex size-8 items-center justify-center rounded-full text-white transition hover:bg-white/20 cursor-pointer"
              title={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>

            <div className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full rounded-full bg-[#2b7fff]" style={{ width: `${videoProgress}%` }} />
            </div>

            <span className="whitespace-nowrap font-mono text-[12px] leading-4 text-[#d4d4d4]">
              {currentProject.viewsCount || '0'} views
            </span>
          </div>
        </div>
      ) : (
        <div className="relative flex aspect-[960/540.875] max-h-[640px] min-h-[260px] w-full items-center justify-center bg-black">
          <img
            src={mediaList[currentSlideIndex] || currentProject.coverImage}
            alt={currentProject.title}
            className="size-full object-cover"
          />

          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                title="Slide sebelumnya"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlideIndex(prev => Math.min(mediaList.length - 1, prev + 1))}
                disabled={currentSlideIndex === mediaList.length - 1}
                className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                title="Slide berikutnya"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md">
                {mediaList.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${index === currentSlideIndex ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                    title={`Lihat slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderCreatorNavbar = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      {/* Left: Avatar & Profile Details */}
      <div className="flex min-w-0 items-center gap-[14px]">
        <button
          type="button"
          onClick={() => onViewCreatorProfile?.(creator)}
          className="relative shrink-0 rounded-full cursor-pointer"
          title={`Lihat profil ${creator.name}`}
        >
          <span className="block size-12 rounded-full bg-linear-to-tr from-[#155dfc] to-[#615fff] p-0.5 shadow-sm">
            <img src={creator.avatar} alt={creator.name} className="size-full rounded-full object-cover" />
          </span>
          {creator.proBadge && (
            <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#0B1F3A] text-amber-400 ring-2 ring-white">
              <ShieldCheck className="size-3" />
            </span>
          )}
        </button>

        <div className="min-w-0 text-left">
          <button
            type="button"
            onClick={() => onViewCreatorProfile?.(creator)}
            className="block max-w-full truncate text-left text-[16px] font-bold leading-6 tracking-[-0.31px] text-[#171717] hover:underline cursor-pointer"
          >
            {creator.name}
          </button>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold leading-[14.7px] tracking-[0.06px] text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Available for work
            </span>
            <button
              type="button"
              onClick={() => setIsFollowing(prev => !prev)}
              className="text-[12px] font-semibold leading-4 text-[#1D4ED8] hover:underline cursor-pointer"
            >
              {isFollowing ? 'Mengikuti' : 'Follow'}
            </button>
          </div>

        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => setIsLiked(prev => !prev)}
          className={`flex size-10 items-center justify-center rounded-full border shadow-2xs transition cursor-pointer ${
            isLiked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-[#E2E8F0] bg-white text-[#171717] hover:bg-neutral-50'
          }`}
          title="Sukai proyek"
        >
          <Heart className={`size-4 ${isLiked ? 'fill-rose-600' : ''}`} />
        </button>

        <button
          id="btn-active-comment"
          data-testid="btn-open-comments"
          type="button"
          onClick={() => setIsCommentOpen(prev => !prev)}
          className={`relative flex size-10 items-center justify-center rounded-full border shadow-2xs transition cursor-pointer ${
            isCommentOpen ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white' : 'border-[#E2E8F0] bg-white text-[#171717] hover:bg-neutral-50'
          }`}
          title={isCommentOpen ? 'Tutup komentar' : 'Buka komentar'}
        >
          <MessageSquare className="size-4" />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#171717] text-white px-1 text-[9px] font-bold">
            {comments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onGetInTouch?.(creator)}
          className="rounded-[8px] bg-[#155DFC] px-6 py-2.5 text-[14px] font-bold leading-5 tracking-[-0.15px] text-white transition hover:bg-[#0E4CD1] cursor-pointer"
        >
          Kirim Pesan
        </button>
      </div>
    </div>
  );

  const renderCreatorCard = () => (
    <section className="w-full pt-[72px] text-center">
      <div className="relative h-[38px] w-full">
        <div className="absolute inset-x-0 top-0 border-t border-black/10" />
        <button
          type="button"
          onClick={() => creator && onViewCreatorProfile?.(creator)}
          className="absolute left-1/2 top-[-24px] size-14 -translate-x-1/2 rounded-full bg-white p-1 ring-1 ring-black/10 cursor-pointer"
          title={`Lihat profil ${creator?.name || 'Kreator'}`}
        >
          <img src={creator?.avatar || '/creatorin/avatar.png'} alt={creator?.name || 'Kreator'} className="size-full rounded-full object-cover" />
        </button>
      </div>

      <div className="mx-auto flex max-w-[576px] flex-col items-center pt-4">
        <button
          type="button"
          onClick={() => creator && onViewCreatorProfile?.(creator)}
          className="text-center text-[20px] font-bold leading-7 tracking-[0.2px] text-[#0D0C22] hover:underline cursor-pointer"
        >
          {creator?.name || 'Kreator'}
        </button>
        <p className="pt-3 text-center text-[14px] font-medium leading-5 tracking-[-0.15px] text-neutral-600">
          {creator?.bio || 'Belum ada deskripsi kreator.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => onGetInTouch?.(creator)}
            className="rounded-[8px] bg-[#155DFC] px-6 py-2.5 text-[12px] font-semibold leading-4 text-white transition hover:bg-[#0E4CD1] cursor-pointer"
          >
            Kirim Pesan
          </button>
          <button
            type="button"
            onClick={() => setIsFollowing(prev => !prev)}
            className="rounded-[8px] border border-black/10 bg-white px-6 py-2.5 text-[12px] font-semibold leading-4 text-[#0D0B0B] transition hover:bg-[#F3F3F4] cursor-pointer"
          >
            {isFollowing ? 'Mengikuti' : 'Ikuti Kreator'}
          </button>
        </div>

      </div>
    </section>
  );

  const renderRelatedProjects = () => (
    <section className="w-full pt-14">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[18px] font-bold leading-7 tracking-[-0.44px] text-[#0D0C22]">
          Proyek Serupa
        </h3>
        <button
          type="button"
          onClick={() => creator && onViewCreatorProfile?.(creator)}
          className="inline-flex items-center gap-1 text-[12px] font-bold leading-4 text-[#155DFC] hover:underline cursor-pointer"
        >
          Lihat Proyek Lainnya
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
        {displayOtherProjects.map(otherProject => (
          <ProjectCard
            key={otherProject.id}
            id={`related-project-${otherProject.id}`}
            project={otherProject}
            onClick={() => handleSwitchProject(otherProject)}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/65 text-left animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-60 bg-[#0d0c22] text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Action Buttons on Right Screen (Visible when comments panel is CLOSED, matching Figma) */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 transition-all duration-300 ease-out ${
          isCommentOpen ? 'translate-x-12 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}
      >
        <button
          id="btn-open-comments"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCommentOpen(true);
          }}
          className="relative flex size-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#171717] shadow-sm hover:shadow-md hover:border-neutral-300 transition cursor-pointer"
          title="Buka Komentar"
        >
          <MessageSquare className="size-5" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-bold text-white shadow-xs">
            {comments.length}
          </span>
        </button>

        <button
          id="btn-floating-share"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex size-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#171717] shadow-sm hover:shadow-md hover:border-neutral-300 transition cursor-pointer"
          title="Bagikan Proyek"
        >
          <Upload className="size-5" />
        </button>

        <button
          id="btn-floating-info"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsInfoOpen(prev => !prev);
          }}
          className={`flex size-11 items-center justify-center rounded-full border shadow-sm hover:shadow-md transition cursor-pointer ${
            isInfoOpen ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white' : 'border-neutral-200 bg-white text-[#171717] hover:border-neutral-300'
          }`}
          title="Info Proyek"
        >
          <Info className="size-5" />
        </button>
      </aside>

      {/* Project Info Modal / Tooltip */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs" onClick={() => setIsInfoOpen(false)}>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 max-w-sm w-full space-y-4 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-base font-bold text-[#0d0c22]">Informasi Proyek</h4>
              <button onClick={() => setIsInfoOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Judul:</span>
                <span className="font-semibold text-neutral-800 text-right max-w-[200px] truncate">{currentProject.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Kreator:</span>
                <span className="font-semibold text-neutral-800">{creator?.name || 'Kreator'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Kategori:</span>
                <span className="font-semibold text-neutral-800">{categoryLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Format:</span>
                <span className="font-semibold text-neutral-800 capitalize">{currentProject.mediaType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Total Tayangan:</span>
                <span className="font-semibold text-neutral-800">{currentProject.viewsCount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Total Komentar:</span>
                <span className="font-semibold text-neutral-800">{comments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-400">Perangkat Lunak:</span>
                <span className="font-semibold text-neutral-800">Figma, Framer, CapCut</span>
              </div>
            </div>
            <button
              onClick={() => setIsInfoOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Top Close Button for the Entire Modal */}
      <div className="flex h-12 shrink-0 items-center justify-end px-5 py-2.5 pointer-events-none">
        <button
          id="btn-close-project-detail"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white cursor-pointer"
          title="Tutup"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* Main Modal Surface (Rounded-T 16px) */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[16px] bg-white font-sans text-[#0D0B0B] shadow-xl selection:bg-[#155DFC] selection:text-white"
      >
        {/* Scrollable Container with Content and Footer */}
        <div ref={modalContainerRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <main
            className={`mx-auto w-full max-w-[1024px] px-5 sm:px-8 pt-8 pb-20 transition-transform duration-300 ease-out ${
              isCommentOpen ? 'lg:-translate-x-[160px] xl:-translate-x-[180px]' : 'translate-x-0'
            }`}
          >
            {/* Primary Content Column */}
            <div className="min-w-0 w-full text-left">
              {/* Creator Profile Navbar - perfectly aligned with the media */}
              <div className="pb-6">
                {renderCreatorNavbar()}
              </div>

              {/* Media Preview */}
              {renderMedia()}

              {/* Category & Title */}
              <div className="flex w-full flex-col items-start pt-6">
                <span className="rounded-md bg-[#f5f5f5] px-2.5 py-1 text-[12px] font-medium leading-4 tracking-[0.3px] text-[#525252]">
                  {categoryLabel}
                </span>
                <h1 className="mt-3 max-w-[960px] text-[28px] font-extrabold leading-[36px] tracking-[-0.53px] text-[#171717] sm:text-[36px] sm:leading-[49.5px]">
                  {currentProject.title}
                </h1>
              </div>

              {/* Description */}
              {description && (
                <p className="max-w-[896px] pt-6 text-[15px] sm:text-[16px] font-medium leading-[26px] tracking-[-0.31px] text-[#404040]">
                  {description}
                </p>
              )}

              {/* Tags */}
              {currentProject.tags?.length > 0 && (
                <div className="flex w-full flex-wrap items-center gap-2 pt-6">
                  {currentProject.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full bg-[#F3F3F4] px-4 py-1.5 text-[12px] font-medium leading-4 text-[#171717]"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Signature Creator Divider Section */}
              {renderCreatorCard()}

              {/* Related Projects Section (4 columns x 2 rows) */}
              {renderRelatedProjects()}
            </div>
          </main>

          {/* Full Creatorin Footer inside modal scroll area matching Figma */}
          <div
            className={`transition-transform duration-300 ease-out ${
              isCommentOpen ? 'lg:-translate-x-[160px] xl:-translate-x-[180px]' : 'translate-x-0'
            }`}
          >
            <Footer onNavigate={onNavigate} />
          </div>
        </div>

        {/* Mobile Backdrop for Comment Overlay */}
        {isCommentOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-35 lg:hidden"
            onClick={() => setIsCommentOpen(false)}
          />
        )}

        {/* Clean Slide-Over Comment Overlay Panel (Simple horizontal shift, no layout reflow or popups) */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 bottom-0 z-40 w-full sm:w-[400px] xl:w-[420px] bg-white border-l border-neutral-200/90 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isCommentOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
          }`}
        >
          {/* Top Row: Title & Action Buttons moved to top header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-[#171717]">Komentar</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold">
                {comments.length}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="btn-close-comment"
                type="button"
                onClick={() => setIsCommentOpen(false)}
                className="relative flex size-10 items-center justify-center rounded-full bg-[#171717] text-white shadow-xs transition hover:bg-neutral-800 cursor-pointer"
                title="Tutup Komentar"
              >
                <MessageSquare className="size-4.5" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-[#171717] px-1 text-[9px] font-bold shadow-xs border border-neutral-200">
                  {comments.length}
                </span>
              </button>

              <button
                id="btn-active-share"
                type="button"
                onClick={handleShare}
                className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#171717] shadow-2xs hover:border-neutral-300 hover:shadow-xs transition cursor-pointer"
                title="Bagikan Proyek"
              >
                <Upload className="size-4.5" />
              </button>

              <button
                id="btn-active-info"
                type="button"
                onClick={() => setIsInfoOpen(prev => !prev)}
                className={`flex size-10 items-center justify-center rounded-full border shadow-2xs transition cursor-pointer ${
                  isInfoOpen ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white' : 'border-neutral-200 bg-white text-[#171717] hover:border-neutral-300'
                }`}
                title="Info Proyek"
              >
                <Info className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Comments Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {comments.map((item) => {
              const canEditOrDelete = item.isOwner && item.createdAt && item.createdAt >= commentEditCutoff;
              const isEditing = editingCommentId === item.id;

              return (
                <div key={item.id} className="flex items-start gap-3.5 group">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="size-9 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-bold text-[#171717] leading-tight">
                          {item.name}
                        </p>
                        {item.hasBadge && (
                          <span className="size-2 rounded-full bg-amber-500" title="Kreator Terverifikasi" />
                        )}
                        {item.isOwner && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                            Anda
                          </span>
                        )}
                      </div>

                      {canEditOrDelete && !isEditing && (
                        <div className="flex items-center gap-1 text-neutral-400 opacity-90 transition">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1 hover:text-[#171717] hover:bg-neutral-100 rounded cursor-pointer transition"
                            title="Edit Komentar (< 10 menit)"
                            data-testid={`btn-edit-comment-${item.id}`}
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(item.id)}
                            className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition"
                            title="Hapus Komentar"
                            data-testid={`btn-delete-comment-${item.id}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full p-2.5 text-[13px] border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white"
                          rows={2}
                          data-testid="input-edit-comment"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 text-xs bg-[#171717] text-white rounded font-medium cursor-pointer hover:bg-neutral-800"
                            data-testid="btn-save-comment"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-[#404040] leading-relaxed font-normal">
                        {item.text}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#a3a3a3] font-normal">
                        {item.time}
                      </span>
                      {canEditOrDelete && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Bisa diedit/hapus &lt; 10m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comment Input Form at Bottom */}
          <form
            onSubmit={handleAddComment}
            className="p-5 border-t border-neutral-100 flex items-center gap-2.5 bg-white shrink-0"
          >
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Tulis ulasan atau apresiasi..."
              className="flex-1 h-11 px-5 rounded-full bg-[#f5f5f5] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#171717]"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="size-11 rounded-full bg-[#171717] disabled:bg-neutral-300 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs hover:bg-neutral-800"
              title="Kirim Komentar"
            >
              <Send className="size-4" />
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};
