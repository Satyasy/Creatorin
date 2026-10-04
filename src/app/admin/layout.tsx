import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CreatorIn Control Panel | Admin Dashboard',
  description: 'Pusat Pengendalian Terpadu Platform CreatorIn',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen antialiased selection:bg-blue-600 selection:text-white font-sans">
      {children}
    </div>
  );
}
