'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { FeedProject } from '@/types';
import { UploadProjectModal } from '@/components/modals/UploadProjectModal';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';

// Sample projects matching Figma node 5414:15736
const INITIAL_PROJECTS: FeedProject[] = [
  {
    id: 'figma-proj-1',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    description: 'Konsep desain menu digital & cetak dengan visual branding modern untuk kedai kopi lokal.',
    coverImage: '/creatorin/service-pattern-4.png',
    mediaUrl: '/creatorin/service-pattern-4.png',
    mediaType: 'image',
    creatorId: 'c-munir',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@munirsr.design',
    viewsCount: '185.4K',
    likesCount: 12400,
    commentsCount: 94,
    sharesCount: 310,
    creator: {
      id: 'c-munir',
      name: 'Munir S.R.',
      username: 'munirsr',
      handle: '@munirsr.design',
      avatar: '/creatorin/avatar.png',
      category: 'Image',
      roleTitle: 'Brand & Visual Designer',
      bio: 'Desainer grafis spesialis F&B branding dan katalog produk kreatif.',
      location: 'Bandung',
      startingRate: 450000,
      formattedRate: '🪙 450.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 99,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 36,
        tier: 'Top Tier',
      },
      skills: ['Branding', 'Menu Design', 'Illustration'],
      joinedDate: '2023',
    },
  },
  {
    id: 'figma-proj-2',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    description: 'Desain identitas visual kontemporer dengan tipografi dinamis dan komposisi geometris tajam.',
    coverImage: '/creatorin/service-pattern-1.png',
    mediaUrl: '/creatorin/service-pattern-1.png',
    mediaType: 'image',
    creatorId: 'c-munir',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@munirsr.design',
    viewsCount: '185.4K',
    likesCount: 9800,
    commentsCount: 65,
    sharesCount: 220,
    creator: {
      id: 'c-munir',
      name: 'Munir S.R.',
      username: 'munirsr',
      handle: '@munirsr.design',
      avatar: '/creatorin/avatar.png',
      category: 'Image',
      roleTitle: 'Brand & Visual Designer',
      bio: 'Desainer grafis spesialis F&B branding dan katalog produk kreatif.',
      location: 'Bandung',
      startingRate: 450000,
      formattedRate: '🪙 450.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 99,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 36,
        tier: 'Top Tier',
      },
      skills: ['Branding', 'Menu Design', 'Illustration'],
      joinedDate: '2023',
    },
  },
  {
    id: 'figma-proj-3',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    description: 'Koleksi aset grafis minimalis hitam-putih untuk promosi media sosial dan packaging.',
    coverImage: '/creatorin/service-pattern-4.png',
    mediaUrl: '/creatorin/service-pattern-4.png',
    mediaType: 'image',
    creatorId: 'c-munir',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@munirsr.design',
    viewsCount: '185.4K',
    likesCount: 14200,
    commentsCount: 112,
    sharesCount: 450,
    creator: {
      id: 'c-munir',
      name: 'Munir S.R.',
      username: 'munirsr',
      handle: '@munirsr.design',
      avatar: '/creatorin/avatar.png',
      category: 'Image',
      roleTitle: 'Brand & Visual Designer',
      bio: 'Desainer grafis spesialis F&B branding dan katalog produk kreatif.',
      location: 'Bandung',
      startingRate: 450000,
      formattedRate: '🪙 450.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 99,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 36,
        tier: 'Top Tier',
      },
      skills: ['Branding', 'Menu Design', 'Illustration'],
      joinedDate: '2023',
    },
  },
  {
    id: 'figma-proj-4',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    description: 'Karya desain packaging dan merchandise kafe dengan pola geometris repetitif presisi tinggi.',
    coverImage: '/creatorin/service-pattern-1.png',
    mediaUrl: '/creatorin/service-pattern-1.png',
    mediaType: 'image',
    creatorId: 'c-munir',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@munirsr.design',
    viewsCount: '185.4K',
    likesCount: 11300,
    commentsCount: 88,
    sharesCount: 340,
    creator: {
      id: 'c-munir',
      name: 'Munir S.R.',
      username: 'munirsr',
      handle: '@munirsr.design',
      avatar: '/creatorin/avatar.png',
      category: 'Image',
      roleTitle: 'Brand & Visual Designer',
      bio: 'Desainer grafis spesialis F&B branding dan katalog produk kreatif.',
      location: 'Bandung',
      startingRate: 450000,
      formattedRate: '🪙 450.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 99,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 36,
        tier: 'Top Tier',
      },
      skills: ['Branding', 'Menu Design', 'Illustration'],
      joinedDate: '2023',
    },
  },
  {
    id: 'figma-proj-5',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    description: 'Visual identity series: poster, menu card, dan template feed bertema optical lines.',
    coverImage: '/creatorin/service-pattern-4.png',
    mediaUrl: '/creatorin/service-pattern-4.png',
    mediaType: 'image',
    creatorId: 'c-munir',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@munirsr.design',
    viewsCount: '185.4K',
    likesCount: 15600,
    commentsCount: 130,
    sharesCount: 520,
    creator: {
      id: 'c-munir',
      name: 'Munir S.R.',
      username: 'munirsr',
      handle: '@munirsr.design',
      avatar: '/creatorin/avatar.png',
      category: 'Image',
      roleTitle: 'Brand & Visual Designer',
      bio: 'Desainer grafis spesialis F&B branding dan katalog produk kreatif.',
      location: 'Bandung',
      startingRate: 450000,
      formattedRate: '🪙 450.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 99,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 36,
        tier: 'Top Tier',
      },
      skills: ['Branding', 'Menu Design', 'Illustration'],
      joinedDate: '2023',
    },
  },
  {
    id: 'figma-proj-6',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    description: 'Desain editorial dan tata letak menu kopi espresso bar dengan sentuhan minimalis elegan.',
    coverImage: '/creatorin/service-pattern-1.png',
    mediaUrl: '/creatorin/service-pattern-1.png',
    mediaType: 'image',
    creatorId: 'c-munir',
    category: 'Logo & Branding',
    platform: 'direct',
    socialHandle: '@munirsr.design',
    viewsCount: '185.4K',
    likesCount: 10400,
    commentsCount: 79,
    sharesCount: 290,
    creator: {
      id: 'c-munir',
      name: 'Munir S.R.',
      username: 'munirsr',
      handle: '@munirsr.design',
      avatar: '/creatorin/avatar.png',
      category: 'Image',
      roleTitle: 'Brand & Visual Designer',
      bio: 'Desainer grafis spesialis F&B branding dan katalog produk kreatif.',
      location: 'Bandung',
      startingRate: 450000,
      formattedRate: '🪙 450.000',
      careerScore: {
        overall: 98,
        deadlineAccuracy: 99,
        revisionRate: 1.0,
        completionRate: 100,
        clientRating: 5.0,
        completedProjects: 36,
        tier: 'Top Tier',
      },
      skills: ['Branding', 'Menu Design', 'Illustration'],
      joinedDate: '2023',
    },
  },
];

export function CreatorProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<FeedProject[]>(INITIAL_PROJECTS);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FeedProject | null>(null);

  // Load projects from database API with fallback to stored and initial
  useEffect(() => {
    async function fetchApiProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.projects) && data.projects.length > 0) {
            const apiProjects: FeedProject[] = data.projects.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              coverImage: p.mediaUrl || '/creatorin/service-pattern-4.png',
              mediaUrl: p.mediaUrl || '/creatorin/service-pattern-4.png',
              mediaType: p.mediaType || 'image',
              creatorId: p.creatorId,
              category: p.category || 'Karya Kreatif',
              platform: 'direct',
              socialHandle: p.creatorHandle || (p.creatorName ? `@${p.creatorName.toLowerCase().replace(/\s+/g, '')}` : '@kreator'),
              viewsCount: p.viewsCount || '0',
              likesCount: 0,
              commentsCount: 0,
              sharesCount: 0,
              creator: {
                id: p.creatorId,
                name: p.creatorName || 'Kreator',
                username: (p.creatorName || 'kreator').toLowerCase().replace(/\s+/g, ''),
                handle: p.creatorHandle || `@${(p.creatorName || 'kreator').toLowerCase().replace(/\s+/g, '')}`,
                avatar: p.creatorAvatar || '/creatorin/avatar.png',
                category: 'Image',
                roleTitle: 'Kreator Konten & Desainer',
                bio: 'Kreator terverifikasi di Creatorin.',
                location: 'Indonesia',
                startingRate: 350000,
                formattedRate: 'Rp350.000',
                careerScore: {
                  overall: 95,
                  deadlineAccuracy: 98,
                  revisionRate: 1.0,
                  completionRate: 100,
                  clientRating: 4.9,
                  completedProjects: 12,
                  tier: 'Top Tier',
                },
                skills: ['Kreatif', 'Digital Content'],
                joinedDate: '2024',
              },
            }));

            // Combine with INITIAL_PROJECTS
            const existingIds = new Set(apiProjects.map((p) => p.id));
            const remainder = INITIAL_PROJECTS.filter((p) => !existingIds.has(p.id));
            setProjects([...apiProjects, ...remainder]);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load projects from API:', err);
      }

      // Fallback to local storage if API call didn't yield results
      try {
        const stored = localStorage.getItem('creatorin_custom_projects');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects([...parsed, ...INITIAL_PROJECTS]);
          }
        }
      } catch {}
    }

    fetchApiProjects();
  }, []);

  const handleUploadSuccess = (newProjectData: any) => {
    const newProject: FeedProject = {
      id: newProjectData.id || `custom-proj-${Date.now()}`,
      title: newProjectData.title || 'Proyek Baru Kreator',
      description: newProjectData.description || 'Portofolio karya kreatif terbaru.',
      coverImage: newProjectData.mediaUrl || '/creatorin/service-pattern-4.png',
      mediaUrl: newProjectData.mediaUrl || '/creatorin/service-pattern-4.png',
      mediaType: newProjectData.mediaType || 'image',
      creatorId: user?.id || 'creator-self',
      category: newProjectData.category || 'Desain Grafis',
      platform: 'direct',
      socialHandle: user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@kreator',
      viewsCount: '1',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      creator: {
        id: user?.id || 'creator-self',
        name: user?.name || 'Kreator Creatorin',
        username: user?.name?.toLowerCase().replace(/\s+/g, '') || 'creator',
        handle: `@${user?.name?.toLowerCase().replace(/\s+/g, '') || 'creator'}`,
        avatar: user?.avatar || '/creatorin/avatar.png',
        category: 'Image',
        roleTitle: 'Kreator Konten & Desainer',
        bio: user?.bio || 'Kreator terverifikasi di Creatorin.',
        location: user?.location || 'Indonesia',
        startingRate: 350000,
        formattedRate: '🪙 350.000',
        careerScore: {
          overall: 95,
          deadlineAccuracy: 98,
          revisionRate: 1.0,
          completionRate: 100,
          clientRating: 4.9,
          completedProjects: 12,
          tier: 'Top Tier',
        },
        skills: ['Kreatif', 'Digital Content'],
        joinedDate: '2024',
      },
    };

    setProjects((prev) => [newProject, ...prev]);
    try {
      localStorage.setItem('creatorin_custom_projects', JSON.stringify([newProject]));
    } catch {}
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {/* Header Section (Matching Figma node 5414:15736) */}
        <header className="mb-10 sm:mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2.5 rounded-full bg-[#155DFC]/10 text-[#155DFC] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portofolio & Showcases</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0D0B0B] sm:text-3xl lg:text-[34px]">
                Manajemen Portofolio Proyek Kreator
              </h1>
              <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[#55576A] sm:text-base">
                Pamerkan karya terbaik Anda untuk membuktikan keahlian, memikat calon klien UMKM, dan meningkatkan peluang diterimanya proposal.
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:bg-[#1249c4] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Proyek Baru</span>
              </button>
            </div>
          </div>
        </header>

        {/* Grid Section: Upload Card + Project Portfolio Cards */}
        {/* Generous spacing and margin between cards (gap-8 sm:gap-8 lg:gap-10) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-8 lg:gap-10">
          {/* Card 1: Upload Proyek (Dashed Dotted Card) */}
          <button
            type="button"
            id="btn-upload-project-card"
            data-testid="btn-upload-project-card"
            onClick={() => setIsUploadModalOpen(true)}
            aria-label="Upload Proyek Baru"
            className="group flex aspect-[326/430] min-h-[420px] flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#D0D5DD] bg-neutral-50/70 p-6 sm:p-8 text-center transition-all duration-300 hover:border-[#155DFC] hover:bg-[#F0F5FF] hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] cursor-pointer"
          >
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-neutral-200/80 transition-all duration-300 group-hover:border-[#155DFC]/40 group-hover:bg-[#155DFC] group-hover:shadow-md group-hover:scale-105">
              <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
            <span className="mt-6 text-xl sm:text-2xl font-bold text-[#0D0B0B] transition-colors group-hover:text-[#155DFC]">
              Upload Proyek
            </span>
            <span className="mt-3 max-w-[260px] text-xs sm:text-sm leading-relaxed text-[#667085]">
              Tampilkan karya terbaik Anda. Dapatkan feedback, apresiasi, dan bangun reputasi profesional bersama UMKM.
            </span>
          </button>

          {/* Cards 2+: Portfolio Project Cards */}
          {projects.map((project) => (
            <article
              key={project.id}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProject(project);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Buka detail portofolio: ${project.title}`}
              className="group relative flex aspect-[326/430] min-h-[420px] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-[#0D0B0B] text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] cursor-pointer"
            >
              {/* Media Image Area */}
              <div className="relative flex-1 overflow-hidden bg-neutral-900">
                <img
                  src={project.coverImage || project.mediaUrl}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Top Overlay Badge: Category */}
                {project.category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10 shadow-xs">
                      {project.category}
                    </span>
                  </div>
                )}

                {/* Top-Right Play Indicator Badge */}
                <div
                  className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-xs backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" />
                </div>

                {/* Bottom subtle gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Bottom Metadata Bar */}
              <div className="flex flex-col gap-2.5 bg-[#0D0B0B] p-5 text-white border-t border-white/5">
                <h2 className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug text-white transition-colors group-hover:text-[#03ACFD]">
                  {project.title}
                </h2>
                <div className="flex items-center justify-between text-xs text-[#98A2B3] pt-1 border-t border-white/10">
                  <span className="font-medium truncate max-w-[150px]">
                    {project.socialHandle || (project.creator?.handle ?? '@kreator')}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 text-neutral-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{project.viewsCount || '0'}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Upload Project Modal */}
      <UploadProjectModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          allProjects={projects}
        />
      )}
    </div>
  );
}
