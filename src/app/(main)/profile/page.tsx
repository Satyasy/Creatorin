'use client';

import { CreatorProfilePage } from '@/views/CreatorProfilePage';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Creator } from '@/types';

export default function MyProfilePage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, router]);

  // Sync latest user details from server on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Build a Creator object from the logged-in user's auth state.
  // Real user identity takes priority over template data.
  const template = MOCK_CREATORS[0];

  const userCreator: Creator = {
    ...template,
    id: `user-${user.email.replace(/[^a-z0-9]/gi, '-')}`,
    name: user.name,
    avatar:
      user.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
    bio: user.bio || 'Kreator kreatif di platform Creatorin.',
    roleTitle:
      user.roleTitle ||
      (user.role === 'creator' ? 'Kreator Konten' : 'Brand / UMKM'),
    location: user.location || 'Indonesia',
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
