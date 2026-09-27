import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#171717] font-sans selection:bg-[#0B1F3A] selection:text-white">
      {children}
    </div>
  );
}
