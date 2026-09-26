import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0d0c22] font-sans selection:bg-[#0d0c22] selection:text-white">
      {children}
    </div>
  );
}
