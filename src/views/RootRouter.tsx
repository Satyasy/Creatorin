'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { GuestLandingPage } from './GuestLandingPage';
import { CreatorDashboard } from './CreatorDashboard';
import { UMKMDashboard } from './UMKMDashboard';
import { SchoolDashboardPage } from './SchoolDashboardPage';

export const RootRouter = () => {
  const { user } = useAuth();

  // If logged in as School, show School Dashboard directly (RBAC School)
  if (user?.role === 'school') {
    return <SchoolDashboardPage />;
  }

  // If logged in as Creator, show Creator Dashboard
  if (user?.role === 'creator') {
    return <CreatorDashboard />;
  }

  // Both guests (not logged in) and UMKM show UMKMDashboard (the Home screen)
  return <UMKMDashboard />;
};
