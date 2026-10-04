/**
 * Demo mode fixtures — development only.
 * Never imported on the server in production (guarded by NODE_ENV checks).
 */

import type { UserRole } from '@/types';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  location?: string;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  school: {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'SMK Mitra Creatorin',
    email: 'smkmitra@creatorin.id',
    role: 'school',
    avatar: '',
    bio: 'Sekolah menengah kejuruan mitra industri kreatif.',
    location: 'Jakarta Selatan',
  },
  creator: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Demo Kreator',
    email: 'demo.creator@creatorin.id',
    role: 'creator',
    avatar: '',
    bio: 'Kreator desain grafis dan konten digital.',
    location: 'Bandung',
  },
  umkm: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Demo UMKM',
    email: 'demo.umkm@creatorin.id',
    role: 'umkm',
    avatar: '',
    bio: 'Usaha mikro kecil menengah produk lokal.',
    location: 'Surabaya',
  },
};

export const DEMO_COOKIE = 'creatorin_demo_role';

export function getDemoUser(role: string): DemoUser | null {
  return DEMO_USERS[role] ?? null;
}

/** Destination path after activating demo mode */
export const DEMO_DESTINATIONS: Record<string, string> = {
  school: '/dashboard/school',
  creator: '/',
  umkm: '/',
};
