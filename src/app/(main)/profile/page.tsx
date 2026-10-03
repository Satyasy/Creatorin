'use client';

import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { UmkmProfilePage } from '@/views/UmkmProfilePage';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { MOCK_PRIMARY_UMKM } from '@/data/mockUmkm';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Creator } from '@/types';

export default function MyProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to sign-in or school users to school dashboard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    } else if (user?.role === 'school') {
      router.replace('/dashboard/school');
    }
  }, [isAuthenticated, user?.role, router]);

  if (!isAuthenticated || !user || user.role === 'school') {
    return null;
  }

  if (user.role === 'umkm') {
    const umkmProfile = {
      ...MOCK_PRIMARY_UMKM,
      id: `user-${user.email.replace(/[^a-z0-9]/gi, '-')}`,
      name: user.name,
      brandName: user.name,
      logo: user.avatar || MOCK_PRIMARY_UMKM.logo,
      bio: user.bio || MOCK_PRIMARY_UMKM.bio,
      location: user.location || MOCK_PRIMARY_UMKM.location,
    };
    return (
      <UmkmProfilePage
        initialProfile={umkmProfile}
        currentUser={user}
      />
    );
  }

  // Build a Creator object from the logged-in user's auth state.
  // We use the mock creator's portfolio/services as a template but override
  // all identity fields with the actual user data.
  const template = MOCK_CREATORS[0];

  const userCreator: Creator = {
    ...template,
    id: `user-${user.email.replace(/[^a-z0-9]/gi, '-')}`,
    name: user.name,
    avatar:
      user.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
    bio: user.bio || template.bio,
    roleTitle:
      user.roleTitle ||
      (user.role === 'creator' ? 'Kreator Konten' : 'Brand / UMKM'),
    location: user.location || template.location,
    handle:
      user.handle ||
      `@${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    verified: true,
    proBadge: false,
    careerScore: template.careerScore,
  };

  return (
    <CreatorProfilePage
      creator={userCreator}
      currentUser={user}
      isOwnProfile={true}
    />
  );
}
