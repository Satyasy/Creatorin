'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
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
      formattedRate: 'Rp450.000',
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
      formattedRate: 'Rp450.000',
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
      formattedRate: 'Rp450.000',
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
      formattedRate: 'Rp450.000',
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
      formattedRate: 'Rp450.000',
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
      formattedRate: 'Rp450.000',
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

  // Load custom uploaded projects from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('creatorin_custom_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects([...parsed, ...INITIAL_PROJECTS]);
        }
      }
    } catch {}
  }, []);

  const handleUploadSuccess = (newProjectData: any) => {
    const newProject: FeedProject = {
      id: `custom-proj-${Date.now()}`,
      title: newProjectData.title || 'Proyek Baru Kreator',
      description: newProjectData.description || 'Portofolio karya kreatif terbaru.',
      coverImage: newProjectData.mediaUrl || '/creatorin/service-pattern-4.png',
      mediaUrl: newProjectData.mediaUrl || '/creatorin/service-pattern-4.png',
      mediaType: newProjectData.mediaType || 'image',
      creatorId: user?.id || 'creator-self',
      category: newProjectData.category || 'Desain Grafis',
      platform: 'direct',
      socialHandle: user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@munirsr.design',
      viewsCount: '1.2K',
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
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    try {
      localStorage.setItem('creatorin_custom_projects', JSON.stringify([newProject]));
    } catch {}
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {/* Header Section (Matching Figma node 5414:15736) */}
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-[#0D0B0B] sm:text-3xl lg:text-[32px]">
            Manajemen Portofolio Proyek Kreator
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#55576A] sm:text-base">
            Pamerkan karya terbaik Anda untuk membuktikan keahlian, memikat calon klien UMKM, dan meningkatkan peluang diterimanya proposal.
          </p>
        </header>

        {/* Grid Section: Upload Card + Project Portfolio Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Card 1: Upload Proyek (Dashed Dotted Card) */}
          <button
            type="button"
            id="btn-upload-project-card"
            data-testid="btn-upload-project-card"
            onClick={() => setIsUploadModalOpen(true)}
            aria-label="Upload Proyek Baru"
            className="group flex aspect-[326/430] min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D0D5DD] bg-white p-6 text-center transition-all duration-200 hover:border-[#155DFC] hover:bg-[#F9FAFB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] cursor-pointer"
          >
            <span className="text-5xl font-light leading-none text-[#98A2B3] transition-colors group-hover:text-[#155DFC] sm:text-6xl">
              +
            </span>
            <span className="mt-5 text-xl font-bold text-[#0D0B0B] transition-colors group-hover:text-[#155DFC] sm:text-2xl">
              Upload Proyek
            </span>
            <span className="mt-2.5 max-w-[240px] text-xs leading-relaxed text-[#667085] sm:text-sm">
              Show off your best work. Get feedback, likes and be a part of a growing community.
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
              className="group relative flex aspect-[326/430] min-h-[420px] flex-col overflow-hidden rounded-2xl bg-black text-left shadow-xs transition-all duration-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] cursor-pointer"
            >
              {/* Media Image Area */}
              <div className="relative flex-1 overflow-hidden bg-neutral-900">
                <img
                  src={project.coverImage || project.mediaUrl}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Top-Right Play Indicator Badge */}
                <div
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-xs backdrop-blur-xs transition-transform group-hover:scale-110"
                  aria-hidden="true"
                >
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" />
                </div>
              </div>

              {/* Bottom Metadata Bar */}
              <div className="flex flex-col gap-1.5 bg-[#0D0B0B] p-4 text-white">
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#03ACFD]">
                  {project.title}
                </h2>
                <div className="flex items-center justify-between text-xs text-[#98A2B3]">
                  <span>{project.socialHandle || '@munirsr.design'}</span>
                  <span>{project.viewsCount || '185.4K'}</span>
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
