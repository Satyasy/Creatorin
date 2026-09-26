import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Heart,
  Bookmark,
  Globe,
  Mail,
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
  ArrowUpRight
} from 'lucide-react';
import { FeedProject, Creator } from '@/types';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';

export interface ProjectDetailModalProps {
  project: FeedProject;
  onClose: () => void;
  onSelectProject?: (project: FeedProject) => void;
  onViewCreatorProfile?: (creator: Creator) => void;
  onGetInTouch?: (creator: Creator) => void;
  onScheduleCall?: (creator: Creator, project?: FeedProject) => void;
  onNavigate?: (page: any) => void;
  allProjects?: FeedProject[];
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project: initialProject,
  onClose,
  onSelectProject,
  onViewCreatorProfile,
  onGetInTouch,
  allProjects = MOCK_FEED_PROJECTS
}) => {
  const [currentProject, setCurrentProject] = useState<FeedProject>(initialProject);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentProject(initialProject);
    setIsPlaying(false);
    setVideoProgress(0);
    setCurrentSlideIndex(0);
  }, [initialProject]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const mediaList = currentProject.carouselImages && currentProject.carouselImages.length > 0
    ? currentProject.carouselImages
    : currentProject.additionalMedia && currentProject.additionalMedia.length > 0
      ? currentProject.additionalMedia
      : [currentProject.coverImage || currentProject.mediaUrl || ''];

  const creator = currentProject.creator;
  const normalizedName = creator.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const creatorHandle = currentProject.socialHandle || `@${normalizedName}`;
  const creatorDomain = `${normalizedName}.creatorin.id`;
  const creatorEmail = `inquiry@${normalizedName}.com`;
  const description = currentProject.description || currentProject.caption || '';
  const categoryLabel = currentProject.category || 'Portofolio Kreator';

  const isTikTok = currentProject.platform === 'tiktok' || categoryLabel.toLowerCase().includes('tiktok');
  const isInstagram =
    currentProject.platform === 'instagram' ||
    categoryLabel.toLowerCase().includes('instagram') ||
    categoryLabel.toLowerCase().includes('reels');

  const creatorOtherProjects = allProjects.filter(
    project => (project.creatorId === creator.id || project.creator?.id === creator.id) && project.id !== currentProject.id
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
    setIsPlaying(false);
    setVideoProgress(0);
    setCurrentSlideIndex(0);
    onSelectProject?.(newProject);
    modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPlatformBadge = () => {
    if (isInstagram) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold leading-4 text-[#0d0c22] shadow-sm backdrop-blur-md">
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d0c22] px-3 py-1.5 text-[12px] font-bold leading-4 text-white shadow-sm">
        <Layers className="size-3.5" />
        Portofolio
      </span>
    );
  };

  const renderMedia = () => (
    <div className="relative w-full overflow-hidden rounded-[24px] border border-[rgba(229,229,229,0.8)] bg-[#171717] shadow-xs">
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
            src={currentProject.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
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
              <span className="flex size-[72px] items-center justify-center rounded-full bg-white/90 text-[#0d0c22] shadow-xl transition hover:scale-105">
                <Play className="size-8 translate-x-0.5 fill-[#0d0c22]" />
              </span>
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-4 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex size-8 items-center justify-center rounded-full text-white transition hover:bg-white/20"
              title={isPlaying ? 'Pause' : 'Putar'}
            >
              {isPlaying ? <Pause className="size-5 fill-white" /> : <Play className="size-5 fill-white" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="flex size-8 items-center justify-center rounded-full text-white transition hover:bg-white/20"
              title={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>

            <div className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full rounded-full bg-[#2b7fff]" style={{ width: `${videoProgress}%` }} />
            </div>

            <span className="whitespace-nowrap font-mono text-[12px] leading-4 text-[#d4d4d4]">
              {currentProject.viewsCount || '710.0K'} views
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
                className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                title="Slide sebelumnya"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlideIndex(prev => Math.min(mediaList.length - 1, prev + 1))}
                disabled={currentSlideIndex === mediaList.length - 1}
                className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
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
                    className={`h-2 rounded-full transition-all ${index === currentSlideIndex ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-[14px]">
        <button
          type="button"
          onClick={() => onViewCreatorProfile?.(creator)}
          className="relative shrink-0 rounded-full"
          title={`Lihat profil ${creator.name}`}
        >
          <span className="block size-12 rounded-full bg-linear-to-tr from-[#155dfc] to-[#615fff] p-0.5 shadow-sm">
            <img src={creator.avatar} alt={creator.name} className="size-full rounded-full object-cover" />
          </span>
          {creator.proBadge && (
            <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#0d0c22] text-amber-400 ring-2 ring-white">
              <ShieldCheck className="size-3" />
            </span>
          )}
        </button>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onViewCreatorProfile?.(creator)}
            className="block max-w-full truncate text-left text-[16px] font-bold leading-6 tracking-[-0.31px] text-[#0d0c22] hover:underline"
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
              className="text-[12px] font-semibold leading-4 text-[#155dfc] hover:underline"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-medium leading-4 text-[#737373]">
            <a href={`https://${creatorDomain}`} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 hover:text-[#155dfc]">
              <Globe className="size-3.5 shrink-0 text-neutral-500" />
              <span className="truncate">{creatorDomain}</span>
            </a>
            <span className="hidden sm:inline">|</span>
            <a href={`mailto:${creatorEmail}`} className="inline-flex min-w-0 items-center gap-1 hover:text-[#155dfc]">
              <Mail className="size-3.5 shrink-0 text-neutral-500" />
              <span className="truncate">{creatorEmail}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setIsLiked(prev => !prev)}
          className={`flex size-10 items-center justify-center rounded-full border shadow-2xs transition ${
            isLiked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-[#e5e5e5] bg-white text-[#0d0c22] hover:bg-neutral-50'
          }`}
          title="Sukai proyek"
        >
          <Heart className={`size-4 ${isLiked ? 'fill-rose-600' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setIsSaved(prev => !prev)}
          className={`flex size-10 items-center justify-center rounded-full border shadow-2xs transition ${
            isSaved ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-[#e5e5e5] bg-white text-[#0d0c22] hover:bg-neutral-50'
          }`}
          title="Simpan proyek"
        >
          <Bookmark className={`size-4 ${isSaved ? 'fill-amber-600' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => onGetInTouch?.(creator)}
          className="rounded-full bg-[#0d0c22] px-5 py-2.5 text-[14px] font-bold leading-5 tracking-[-0.15px] text-white shadow-xs transition hover:bg-neutral-800"
        >
          Kirim Pesan
        </button>
      </div>
    </div>
  );

  const renderCreatorCard = () => (
    <section className="w-full pt-[72px] text-center">
      <div className="relative h-[38px] w-full">
        <div className="absolute inset-x-0 top-0 border-t border-[#e5e5e5]" />
        <button
          type="button"
          onClick={() => onViewCreatorProfile?.(creator)}
          className="absolute left-1/2 top-[-24px] size-14 -translate-x-1/2 rounded-full bg-white p-1 shadow-[0_0_0_4px_white,0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
          title={`Lihat profil ${creator.name}`}
        >
          <img src={creator.avatar} alt={creator.name} className="size-full rounded-full object-cover" />
        </button>
      </div>

      <div className="mx-auto flex max-w-[576px] flex-col items-center pt-4">
        <button
          type="button"
          onClick={() => onViewCreatorProfile?.(creator)}
          className="text-center text-[20px] font-bold leading-7 tracking-[0.2px] text-[#0d0c22] hover:underline"
        >
          {creator.name}
        </button>
        <p className="pt-3 text-center text-[14px] font-medium leading-5 tracking-[-0.15px] text-[#525252]">
          {creator.bio}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => onGetInTouch?.(creator)}
            className="rounded-full bg-[#0d0c22] px-6 py-2.5 text-[12px] font-bold leading-4 text-white shadow-xs transition hover:bg-neutral-800"
          >
            Kirim Pesan
          </button>
          <button
            type="button"
            onClick={() => setIsFollowing(prev => !prev)}
            className="rounded-full border border-[#d4d4d4] bg-white px-6 py-2.5 text-[12px] font-bold leading-4 text-[#0d0c22] shadow-2xs transition hover:bg-neutral-50"
          >
            {isFollowing ? 'Mengikuti' : 'Ikuti Kreator'}
          </button>
        </div>

        <div className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 text-[12px] font-medium leading-4 text-[#737373]">
          <a href={`https://${creatorDomain}`} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 hover:text-[#155dfc]">
            <Globe className="size-3.5 shrink-0" />
            <span className="truncate">{creatorDomain}</span>
          </a>
          <a href={`mailto:${creatorEmail}`} className="inline-flex min-w-0 items-center gap-1 hover:text-[#155dfc]">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{creatorEmail}</span>
          </a>
        </div>
      </div>
    </section>
  );

  const renderRelatedProjects = () => (
    <section className="w-full pt-14">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[18px] font-bold leading-7 tracking-[-0.44px] text-[#0d0c22]">
          Proyek Serupa
        </h3>
        <button
          type="button"
          onClick={() => onViewCreatorProfile?.(creator)}
          className="inline-flex items-center gap-1 text-[12px] font-bold leading-4 text-[#155dfc] hover:underline"
        >
          Lihat Proyek Lainnya
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
        {displayOtherProjects.map(project => {
          const isItemVideo = project.mediaType === 'video' || Boolean(project.videoUrl);

          return (
            <button
              type="button"
              key={project.id}
              onClick={() => handleSwitchProject(project)}
              className="group relative aspect-[228/285] overflow-hidden rounded-md border border-[#e5e5e5] bg-[#171717] text-left shadow-xs"
            >
              <img
                src={project.coverImage || project.mediaUrl}
                alt={project.title}
                className="size-full object-cover "
              />

              {isItemVideo && (
                <span className="absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                  <Play className="size-3 fill-white" />
                </span>
              )}

              <span className="absolute inset-x-0 bottom-0 block bg-linear-to-t from-black/90 via-black/60 to-transparent p-3 text-white">
                <span className="line-clamp-2 text-[12px] font-semibold leading-[16.5px]">
                  {project.title}
                </span>
                <span className="mt-1 flex items-center justify-between border-t border-white/10 pt-1 text-[10px] leading-[15px] text-[#d4d4d4]">
                  <span className="max-w-[100px] truncate font-normal">{project.socialHandle || creatorHandle}</span>
                  <span className="font-mono">{project.viewsCount || '710.0K'}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderProjectContent = () => (
    <div className="flex flex-col items-start pb-24 pt-6">
      {renderMedia()}

      <div className="flex w-full flex-col items-start pt-6">
        <span className="rounded-md bg-[#f5f5f5] px-2.5 py-1 text-[12px] font-medium leading-4 tracking-[0.3px] text-[#525252]">
          {categoryLabel}
        </span>
        <h1 className="mt-3 max-w-[960px] text-[28px] font-extrabold leading-[36px] tracking-[-0.53px] text-[#0d0c22] sm:text-[36px] sm:leading-[49.5px]">
          {currentProject.title}
        </h1>
      </div>

      {description && (
        <p className="max-w-[896px] pt-8 text-[16px] font-medium leading-[26px] tracking-[-0.31px] text-[#404040]">
          {description}
        </p>
      )}

      {currentProject.tags?.length > 0 && (
        <div className="flex w-full flex-wrap items-center gap-2 pt-7">
          {currentProject.tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="rounded-full bg-[rgba(229,229,229,0.8)] px-4 py-1.5 text-[12px] font-medium leading-4 text-[#262626]"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {renderCreatorCard()}
      {renderRelatedProjects()}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/65 text-left animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="flex h-12 shrink-0 items-center justify-end px-5 py-2.5 pointer-events-none">
        <button
          id="btn-close-project-detail"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
          title="Tutup"
        >
          <X className="size-6" />
        </button>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] bg-white font-sans text-[#0d0c22] shadow-2xl selection:bg-[#0d0c22] selection:text-white"
      >
        <header className="shrink-0 border-b border-[#eaeaea] bg-white">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-3.5 sm:px-8">
            {renderCreatorNavbar()}
          </div>
        </header>

        <div ref={modalContainerRef} className="min-h-0 flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-[1024px] px-5 sm:px-8">
            {renderProjectContent()}
          </main>
        </div>

      </div>
    </div>
  );
};
