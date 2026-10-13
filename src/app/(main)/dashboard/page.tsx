'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { CreatorDashboard } from '@/views/CreatorDashboard';
import { CreatorServicesPage } from '@/views/CreatorServicesPage';
import { UMKMDashboard } from '@/views/UMKMDashboard';
import { SchoolDashboardPage } from '@/views/SchoolDashboardPage';

function DashboardContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

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
    if (tab === 'services' || tab === 'layanan') {
      return <CreatorServicesPage />;
    }
    return <CreatorDashboard />;
  }

  return <UMKMDashboard />;
}

export default function DashboardIndexRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
