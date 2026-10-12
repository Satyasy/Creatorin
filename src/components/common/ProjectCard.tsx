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
      className={`group relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[#171717] transition-all duration-200 hover:opacity-95 cursor-pointer select-none ${className}`}
    >
      {/* Full-bleed Media Cover (Edge-to-Edge) */}
      <img
        src={displayMedia}
        alt={project.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Top Right Media Badge: Play icon / Carousel icon matching Figma */}
      <div className="absolute right-3 top-3 z-10 pointer-events-none">
        {project.mediaType === 'video' ? (
          <div className="flex size-7 items-center justify-center rounded-full bg-black/40 text-white shadow-xs backdrop-blur-xs">
            <Play className="size-3.5 translate-x-[0.5px] fill-white text-white" />
          </div>
        ) : project.mediaType === 'carousel' ? (
          <div className="flex size-7 items-center justify-center rounded-full bg-black/40 text-white shadow-xs backdrop-blur-xs">
            <Layers className="size-3.5 text-white" />
          </div>
        ) : null}
      </div>

      {/* Quick Save Bookmark button on hover */}
      {onToggleSave && (
        <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(project.id, e);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isSaved
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-black/50 hover:bg-black/80 text-white border border-white/15'
            }`}
            title={isSaved ? 'Hapus Simpan' : 'Simpan Proyek'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      )}

      {/* Bottom Static Overlay: 2-line title + creator handle + views matching Figma */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-16">
        <p className="mb-1 line-clamp-2 text-[13px] font-bold leading-[18px] tracking-[-0.1px] text-white drop-shadow-xs">
          {project.title}
        </p>
        <div className="flex items-center justify-between text-[11px] font-medium leading-4 text-white/80">
          <span className="truncate max-w-[70%] font-medium">
            {handleText}
          </span>
          <span className="shrink-0 font-medium tracking-tight text-white/90">
            {viewsFormatted}
          </span>
        </div>
      </div>
    </div>
  );
};
