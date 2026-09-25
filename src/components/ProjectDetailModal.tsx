import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Heart,
  Bookmark,
  Calendar,
  Share2,
  MessageCircle,
  Info,
  Globe,
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Instagram,
  Video,
  FileText,
  ExternalLink,
  Check,
  Eye,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Upload,
  Send
} from 'lucide-react';
import { FeedProject, Creator } from '../types';
import { MOCK_FEED_PROJECTS } from '../data/mockFeedProjects';

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
  onScheduleCall,
  onNavigate,
  allProjects = MOCK_FEED_PROJECTS
}) => {
  const [currentProject, setCurrentProject] = useState<FeedProject>(initialProject);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(initialProject.likesCount || 120);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [commentsList, setCommentsList] = useState<Array<{ name: string; text: string; time: string; avatar?: string; isPro?: boolean }>>([
    {
      name: 'Mukhlasur Rahman',
      text: 'Impressive work!',
      time: 'about 1 hour',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Bhautik Domadiya',
      text: 'Framing the main headline ("THE ART OF CRAFTED LUXURY JEWELRY") with that delicate script overlay gives this hero section such an high-end editorial feel! It balances modern luxury web design with Cartier\'s heritage so beautifully. Fantastic work, Halo UI/UX!',
      time: 'about 1 hour',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Rifat Jahangir Ony',
      text: 'superb work!',
      time: 'about 3 hours',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Minu Vi',
      text: 'Cool font 👌',
      time: 'about 4 hours',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Abdur Rouf',
      text: 'Professional and impressive design work ! Good job',
      time: 'about 4 hours',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      isPro: true
    }
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync state if initialProject changes
  useEffect(() => {
    setCurrentProject(initialProject);
    setLikesCount(initialProject.likesCount || 120);
    setIsPlaying(false);
    setVideoProgress(0);
    setCurrentSlideIndex(0);
  }, [initialProject]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(isNaN(progress) ? 0 : progress);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList(prev => [
      {
        name: 'Anda (UMKM Brand)',
        text: newComment.trim(),
        time: 'Baru saja',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
      },
      ...prev
    ]);
    setNewComment('');
  };

  // Determine media list (for carousels)
  const mediaList = currentProject.carouselImages && currentProject.carouselImages.length > 0
    ? currentProject.carouselImages
    : currentProject.additionalMedia && currentProject.additionalMedia.length > 0
      ? currentProject.additionalMedia
      : [currentProject.coverImage || currentProject.mediaUrl || ''];

  const creator = currentProject.creator;
  const creatorHandle = currentProject.socialHandle || `@${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const creatorDomain = `${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.creatorin.id`;
  const creatorEmail = `inquiry@${creator.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  // Filter other projects by this creator
  const creatorOtherProjects = allProjects.filter(
    p => (p.creatorId === creator.id || p.creator?.id === creator.id) && p.id !== currentProject.id
  ).slice(0, 8);

  // If not enough projects by same creator, supplement with other projects
  const displayOtherProjects = creatorOtherProjects.length >= 4
    ? creatorOtherProjects
    : [
        ...creatorOtherProjects,
        ...allProjects.filter(p => p.id !== currentProject.id && !creatorOtherProjects.some(cp => cp.id === p.id))
      ].slice(0, 8);

  // Project Category (Instagram, TikTok, or Portofolio Upload Biasa)
  const isTikTok = currentProject.platform === 'tiktok' || currentProject.category?.toLowerCase().includes('tiktok');
  const isInstagram = currentProject.platform === 'instagram' || currentProject.category?.toLowerCase().includes('instagram') || currentProject.category?.toLowerCase().includes('reels');
  const isPortfolioDirect = !isTikTok && !isInstagram;

  const handleSwitchProject = (newProj: FeedProject) => {
    setCurrentProject(newProj);
    setIsPlaying(false);
    setVideoProgress(0);
    setCurrentSlideIndex(0);
    if (onSelectProject) {
      onSelectProject(newProj);
    }
    // Scroll modal top smoothly
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderCreatorNavbar = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Avatar & Details */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div 
          onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
          className="relative cursor-pointer group shrink-0"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-linear-to-tr from-blue-600 to-indigo-500 shadow-sm">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-full h-full rounded-full object-cover group-hover:scale-105 transition duration-200"
            />
          </div>
          {creator.proBadge && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#0d0c22] text-white p-0.5 rounded-full ring-2 ring-white">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
            </div>
          )}
        </div>

        <div className="text-left space-y-0.5 sm:space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span 
              onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
              className="font-bold text-sm sm:text-base text-[#0d0c22] hover:underline cursor-pointer"
            >
              {creator.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Available for work badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Available for work</span>
            </span>

            {/* Follow button */}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`font-semibold text-xs transition cursor-pointer ${
                isFollowing ? 'text-neutral-400 hover:text-neutral-600' : 'text-blue-600 hover:underline'
              }`}
            >
              {isFollowing ? 'Mengikuti' : 'Follow'}
            </button>
          </div>

          {/* Links row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-xs text-neutral-500 font-medium">
            <a
              href={`https://${creatorDomain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-blue-600 transition"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>{creatorDomain}</span>
            </a>
            <span>•</span>
            <a
              href={`mailto:${creatorEmail}`}
              className="inline-flex items-center gap-1 hover:text-blue-600 transition"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>{creatorEmail}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right: Actions (Like, Bookmark, Calendar, Primary CTA) */}
      <div className="flex items-center gap-2 self-start sm:self-auto pt-1 sm:pt-0">
        
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
            isLiked
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
          title="Sukai Proyek"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
            isSaved
              ? 'border-amber-200 bg-amber-50 text-amber-600'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
          title="Simpan Proyek"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
        </button>

        {/* Calendar / Brief Button */}
        <button
          onClick={() => {
            if (onScheduleCall) onScheduleCall(creator, currentProject);
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 flex items-center justify-center transition cursor-pointer shadow-2xs"
          title="Jadwalkan Konsultasi / Brief"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Primary CTA Button: Get in Touch */}
        <button
          id="btn-project-get-in-touch"
          onClick={() => {
            if (onGetInTouch) onGetInTouch(creator);
          }}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs whitespace-nowrap"
        >
          Get in touch
        </button>

      </div>
    </div>
  );

  const renderProjectContent = () => (
    <div className="space-y-6 text-left">
      {/* 1. PROJECT TITLE (HEADLINE) - Start of scrollable content */}
      <div className="text-left pt-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0d0c22] tracking-tight leading-snug">
          {currentProject.title}
        </h1>
      </div>

          {/* 3. MAIN PROJECT VISUAL MEDIA PREVIEW */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200/80 shadow-xs">
            
            {/* Category Origin Badge (Top Right) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              {isInstagram && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#0d0c22] text-xs font-bold shadow-md">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram {currentProject.mediaType === 'video' ? 'Reel' : 'Post'}</span>
                </div>
              )}

              {isTikTok && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-md text-white text-xs font-bold shadow-md border border-neutral-700">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TikTok UGC Viral</span>
                </div>
              )}

              {isPortfolioDirect && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Portofolio Langsung</span>
                </div>
              )}
            </div>

            {/* Platform Integration Connection Tag (Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{creatorHandle}</span>
              </span>
            </div>

            {/* Media Content Display */}
            {currentProject.mediaType === 'video' ? (
              <div className="relative w-full aspect-16/10 sm:aspect-16/9 max-h-[640px] flex items-center justify-center bg-black group">
                <video
                  ref={videoRef}
                  src={currentProject.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                  poster={currentProject.coverImage}
                  loop
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlayPause}
                />

                {/* Big Center Play/Pause Overlay */}
                {!isPlaying && (
                  <div 
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  >
                    <div className="w-18 h-18 rounded-full bg-white/90 text-[#0d0c22] flex items-center justify-center shadow-xl hover:scale-110 transition duration-200">
                      <Play className="w-8 h-8 fill-[#0d0c22] translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Video Bottom Control Bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-4 text-white z-20">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-150"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>

                  <span className="text-xs font-mono text-neutral-300">
                    {currentProject.viewsCount || '710.0k'} views
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative w-full aspect-16/10 sm:aspect-16/9 max-h-[640px] flex items-center justify-center bg-neutral-900">
                <img
                  src={mediaList[currentSlideIndex] || currentProject.coverImage}
                  alt={currentProject.title}
                  className="w-full h-full object-contain"
                />

                {/* Multi-slide carousel controls */}
                {mediaList.length > 1 && (
                  <>
                    {currentSlideIndex > 0 && (
                      <button
                        onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center hover:bg-black transition cursor-pointer z-20"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}

                    {currentSlideIndex < mediaList.length - 1 && (
                      <button
                        onClick={() => setCurrentSlideIndex(prev => Math.min(mediaList.length - 1, prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center hover:bg-black transition cursor-pointer z-20"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}

                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md z-20">
                      {mediaList.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentSlideIndex ? 'w-5 bg-white' : 'w-2 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* 4. PROJECT DESCRIPTION */}
          <div className="text-left max-w-4xl space-y-4 pt-2">
            <div className="prose text-neutral-700 text-sm sm:text-base leading-relaxed space-y-3">
              <p>
                {currentProject.description || currentProject.caption || 
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset\'s Body Type sheets.'}
              </p>
              <p className="text-neutral-500 text-xs sm:text-sm">
                Proyek ini diproduksi untuk memenuhi standar kampanye performa tinggi bagi UMKM dan brand digital di Indonesia, mengintegrasikan visual storytelling dan conversion heuristics.
              </p>
            </div>
          </div>

          {/* 5. HASHTAG BADGES (TAGAR) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-left">
            {(currentProject.tags && currentProject.tags.length > 0 ? currentProject.tags : ['#tagar', '#UGC', '#TikTokViral', '#DesignSystem', '#Branding']).map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-1.5 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold transition cursor-pointer"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>

          {/* 6. PROFILE PREVIEW SECTION (DIVIDER WITH CENTER AVATAR) */}
          <div className="relative pt-12 text-center">
            
            {/* Divider line */}
            <div className="absolute top-12 inset-x-0 border-t border-neutral-200 z-0"></div>

            {/* Circular Creator Avatar Centered on Divider */}
            <div className="relative z-10 inline-block -mt-6">
              <div 
                onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                className="w-14 h-14 rounded-full p-1 bg-white shadow-md ring-4 ring-white cursor-pointer group mx-auto"
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition"
                />
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="mt-4 space-y-2 max-w-xl mx-auto text-center">
              <h2 
                onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                className="text-lg sm:text-xl font-black text-[#0d0c22] tracking-wider uppercase cursor-pointer hover:underline"
              >
                {creator.name}
              </h2>

              {/* Creatorin Select / Top Tier Badge */}
              <div className="flex items-center justify-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-extrabold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>CREATORIN SELECT TOP 1%</span>
                </span>
              </div>

              {/* Creator Tagline / Bio */}
              <p className="text-xs sm:text-sm text-neutral-600 font-medium pt-1">
                {creator.bio || 'Design & Content Agency Helping Brands Become TOP 1% ✨'}
              </p>

              {/* Action Buttons: Get in Touch & Schedule a Call */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    if (onGetInTouch) onGetInTouch(creator);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#0d0c22] hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Get in touch
                </button>
                <button
                  onClick={() => {
                    if (onScheduleCall) onScheduleCall(creator, currentProject);
                  }}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-[#0d0c22] border border-neutral-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  Schedule a call
                </button>
              </div>

              {/* Contact links */}
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-neutral-500 font-medium">
                <a
                  href={`https://${creatorDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{creatorDomain}</span>
                </a>
                <span>•</span>
                <a
                  href={`mailto:${creatorEmail}`}
                  className="inline-flex items-center gap-1 hover:text-blue-600 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{creatorEmail}</span>
                </a>
              </div>
            </div>

          </div>

          {/* 7. CARDS DARI PROFIL AKUN (Creator's Other Projects 4-col Grid) */}
          <div className="pt-8 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#0d0c22]">
                Proyek Lainnya dari {creator.name}
              </h3>
              <button
                onClick={() => onViewCreatorProfile && onViewCreatorProfile(creator)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Lihat Profil Lengkap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4-column cards grid as seen in uploaded screenshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {displayOtherProjects.map((proj) => {
                const isItemVideo = proj.mediaType === 'video' || !!proj.videoUrl;
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleSwitchProject(proj)}
                    className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 aspect-4/5 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 border border-neutral-200/60"
                  >
                    {/* Thumbnail */}
                    <img
                      src={proj.coverImage || proj.mediaUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Play icon indicator for video */}
                    {isItemVideo && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                        <Play className="w-3 h-3 fill-white translate-x-0.2" />
                      </div>
                    )}

                    {/* Bottom overlay with text details matching screenshot */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/90 via-black/60 to-transparent text-left">
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition">
                        {proj.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10 text-[10px] text-neutral-300">
                        <span className="truncate max-w-[100px]">
                          {proj.socialHandle || creatorHandle}
                        </span>
                        <span className="font-mono font-medium">
                          {proj.viewsCount || '710.0k'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        {/* 8. CREATORIN BOTTOM FOOTER */}
        <footer className="w-full border-t border-neutral-200 py-6 px-4 sm:px-8 text-neutral-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0d0c22] text-white flex items-center justify-center font-black text-xs">
              C
            </div>
            <span className="font-black text-[#0d0c22] tracking-tight">Creatorin</span>
            <span className="text-neutral-400">© 2026 Platform Kolaborasi UMKM & Content Creator Indonesia.</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-600 font-medium">
            <button onClick={() => onNavigate && onNavigate('projects')} className="hover:text-black cursor-pointer">
              Jelajah
            </button>
            <button onClick={() => onNavigate && onNavigate('services')} className="hover:text-black cursor-pointer">
              Career Score
            </button>
            <button className="hover:text-black cursor-pointer">
              Bantuan
            </button>
            <button className="hover:text-black cursor-pointer">
              Privasi
            </button>
          </div>
        </footer>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-black/65 backdrop-blur-xs text-left animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
    >
      {/* Top Space: preview of the previous page underneath with top-right Close [X] button */}
      <div className="shrink-0 flex items-center justify-end px-5 py-2.5 h-11 sm:h-12 pointer-events-none">
        <button
          id="btn-close-project-detail"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/15 flex items-center justify-center"
          title="Tutup (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Floating Modal Pop-up Sheet (melayang dengan rounded top corners) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 bg-white text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Right Side Middle Floating Action Rail (Komen, Bagikan, Info) */}
        <div className={`fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-40 flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ${
          showCommentsDrawer ? 'opacity-0 pointer-events-none translate-x-6' : 'opacity-100 pointer-events-auto translate-x-0'
        }`}>
          {/* Comments Toggle Button (Circle with badge popup for count) */}
          <div className="relative">
            <button
              id="btn-toggle-comments"
              onClick={() => setShowCommentsDrawer(true)}
              className="w-11 h-11 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center justify-center transition-colors duration-150 cursor-pointer"
              title="Buka Kolom Komentar"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
            {/* Comment Count Badge / Popup */}
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center border border-neutral-300 bg-white text-neutral-800 leading-none pointer-events-none">
              {Math.max(23, commentsList.length)}
            </span>
          </div>

          {/* Share Button (Circle with stroke only) */}
          <button
            id="btn-share-project"
            onClick={handleShare}
            className="w-11 h-11 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center justify-center transition-colors duration-150 cursor-pointer"
            title="Bagikan Tautan Proyek"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Info Button (Circle with stroke only) */}
          <button
            id="btn-info-project"
            onClick={() => setShowInfoModal(true)}
            className="w-11 h-11 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center justify-center transition-colors duration-150 cursor-pointer"
            title="Informasi Spesifikasi"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Share Copied Toast */}
        {copiedToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0c22] text-white text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Tautan proyek berhasil disalin ke clipboard!</span>
          </div>
        )}

        {/* Two-Layout Container: Left Project View + Right Comments Sidebar */}
        <div className="flex-1 min-h-0 relative overflow-hidden flex">
          
          {/* LEFT LAYOUT: Fixed Profile Navbar + Scrollable Content */}
          <div 
            className={`w-full flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out ${
              showCommentsDrawer ? 'lg:-translate-x-[190px] xl:-translate-x-[210px]' : 'translate-x-0'
            }`}
          >
            
            {/* FIXED NAVBAR: Creator Profile Row */}
            <header className="shrink-0 bg-white/95 backdrop-blur-xs border-b border-neutral-100 z-20">
              <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-3.5">
                {renderCreatorNavbar()}
              </div>
            </header>

            {/* SCROLLABLE CONTENT BODY: Starting from Headline down to bottom */}
            <div 
              ref={modalContainerRef}
              className="flex-1 overflow-y-auto"
            >
              <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-6 pb-24">
                {renderProjectContent()}
              </div>
            </div>

          </div>

          {/* RIGHT LAYOUT: Dedicated Comments Sidebar (Smooth sliding from right) */}
          <aside 
            id="project-comments-sidebar"
            className={`absolute top-0 bottom-0 right-0 w-full sm:w-[380px] xl:w-[420px] bg-white border-l border-neutral-200/80 flex flex-col h-full z-30 shadow-2xl transition-transform duration-300 ease-in-out ${
              showCommentsDrawer ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
            }`}
          >
              {/* Top Action Bar: Comments, Share, Info (matching screenshot Group 1000011508.png) */}
              <div className="shrink-0 px-5 py-3.5 sm:py-4 flex items-center justify-start gap-3 border-b border-neutral-100 bg-white z-20">
                {/* Comment Toggle Button (Active, circle with badge popup) */}
                <div className="relative">
                  <button
                    id="btn-toggle-comments-active"
                    onClick={() => setShowCommentsDrawer(false)}
                    className="w-10 h-10 rounded-full border border-neutral-900 bg-neutral-900 text-white flex items-center justify-center transition-colors duration-150 cursor-pointer"
                    title="Tutup Kolom Komentar"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </button>
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center border border-white bg-neutral-900 text-white leading-none pointer-events-none">
                    {Math.max(23, commentsList.length)}
                  </span>
                </div>

                {/* Share Button (Circle with stroke only) */}
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center justify-center transition-colors duration-150 cursor-pointer"
                  title="Bagikan Tautan Proyek"
                >
                  <Upload className="w-4 h-4" />
                </button>

                {/* Info Button (Circle with stroke only) */}
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-black flex items-center justify-center transition-colors duration-150 cursor-pointer"
                  title="Informasi Spesifikasi"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List (Scrollable) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 text-left">
                {commentsList.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-neutral-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#0d0c22]">
                          {c.name}
                        </span>
                        {c.isPro && (
                          <span className="text-amber-500 text-[10px]" title="Top Contributor">✪</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-800 leading-relaxed font-normal whitespace-pre-line">
                        {c.text}
                      </p>
                      <div className="text-[11px] text-neutral-400 font-medium pt-0.5">
                        {c.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input Box at bottom of right sidebar */}
              <form onSubmit={handleAddComment} className="p-4 border-t border-neutral-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis ulasan atau apresiasi..."
                  className="flex-1 bg-neutral-100 rounded-full px-4 py-2.5 text-xs text-[#0d0c22] focus:outline-hidden focus:ring-1 focus:ring-[#0d0c22]"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="p-2.5 rounded-full bg-[#0d0c22] text-white disabled:opacity-40 hover:bg-neutral-800 transition cursor-pointer"
                  title="Kirim Komentar"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </aside>

        </div>

        {/* SPECIFICATION INFO MODAL */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-left space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="font-bold text-base text-[#0d0c22] flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Detail Spesifikasi</span>
                </h3>
                <button onClick={() => setShowInfoModal(false)} className="text-neutral-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-700">
                <div className="flex justify-between py-1 border-b border-neutral-50">
                  <span className="text-neutral-400">Kategori Media</span>
                  <span className="font-bold text-[#0d0c22]">
                    {isInstagram ? 'Instagram (Reel/Post)' : isTikTok ? 'TikTok (UGC Video)' : 'Portofolio Upload Langsung'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-50">
                  <span className="text-neutral-400">Format File</span>
                  <span className="font-bold text-[#0d0c22] uppercase">
                    {currentProject.mediaType} ({currentProject.aspectRatio || '16:9'})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-50">
                  <span className="text-neutral-400">Estimasi Pengerjaan</span>
                  <span className="font-bold text-[#0d0c22]">{currentProject.deliveryDays || '2-3 Hari Kerja'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-50">
                  <span className="text-neutral-400">Tools / Software</span>
                  <span className="font-bold text-[#0d0c22]">
                    {currentProject.toolsUsed?.join(', ') || 'Figma, Premiere Pro, CapCut'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
