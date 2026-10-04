'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CreatorDashboard } from '@/views/CreatorDashboard';
import { UMKMDashboard } from '@/views/UMKMDashboard';
import { SchoolDashboardPage } from '@/views/SchoolDashboardPage';

export default function DashboardIndexRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role === 'school') {
    return <SchoolDashboardPage />;
  }

  if (user.role === 'creator') {
    return <CreatorDashboard />;
  }

  return <UMKMDashboard />;
}
