'use client';

import React from 'react';
import { Play, Layers, Bookmark } from 'lucide-react';
import { FeedProject } from '@/types';

export interface ProjectCardProps {
  project: FeedProject;
  isSaved?: boolean;
  onToggleSave?: (projectId: string, e: React.MouseEvent) => void;
  onClick?: () => void;
  activeMediaIndex?: number;
  className?: string;
  id?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSaved = false,
  onToggleSave,
  onClick,
  activeMediaIndex = 0,
  className = '',
  id,
}) => {
  const displayMedia =
    project.mediaType === 'carousel' && project.additionalMedia && project.additionalMedia.length > 0
      ? project.additionalMedia[activeMediaIndex] || project.mediaUrl || project.coverImage
      : project.coverImage || project.mediaUrl;

  const handleText =
    project.socialHandle ||
    (project.creator?.handle?.startsWith('@')
      ? project.creator.handle
      : `@${project.creator?.handle || (project.creator as any)?.username || project.creator?.name?.toLowerCase().replace(/\s+/g, '') || 'creator'}`);

  const viewsFormatted =
    project.viewsCount ||
    (project.stats?.views ? String(project.stats.views) : '0');

  return (
    <div
      id={id || `feed-card-${project.id}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group relative aspect-[326/407.5] overflow-hidden rounded-[12px] border border-black/10 bg-[#0D0C22] transition-colors duration-200 hover:border-black/25 cursor-pointer select-none ${className}`}
    >
      {/* Full-bleed Media Cover (Edge-to-Edge) */}
      <img
        src={displayMedia}
        alt={project.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center"
        loading="lazy"
      />

      {/* Top Right Media Badge: Circular dark translucent button with icon */}
      <div className="absolute right-3.5 top-3.5 z-10 pointer-events-none">
        {project.mediaType === 'video' ? (
          <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white shadow-sm backdrop-blur-md">
            <Play className="size-4 translate-x-[1px] fill-white text-white" />
          </div>
        ) : project.mediaType === 'carousel' ? (
          <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white shadow-sm backdrop-blur-md">
            <Layers className="size-4 text-white" />
          </div>
        ) : null}
      </div>

      {/* Quick Save Bookmark button on hover */}
      {onToggleSave && (
        <div className="absolute top-3.5 left-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(project.id, e);
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isSaved
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-black/50 hover:bg-black/80 text-white border border-white/15'
            }`}
            title={isSaved ? 'Hapus Simpan' : 'Simpan Proyek'}
            aria-label={isSaved ? 'Hapus simpan proyek' : 'Simpan proyek ke koleksi'}
          >
            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      )}

      {/* Bottom Static Overlay: 2-line title + creator handle + views */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-4 pt-16">
        <p className="mb-1.5 line-clamp-2 text-[14px] font-bold leading-[19.25px] tracking-[-0.15px] text-white drop-shadow-sm">
          {project.title}
        </p>
        <div className="flex items-center justify-between text-[12px] font-medium leading-4 text-white/80">
          <span className="truncate max-w-[68%] font-medium">
            {handleText}
          </span>
          <span className="shrink-0 font-medium tracking-tight">
            {viewsFormatted}
          </span>
        </div>
      </div>
    </div>
  );
};
