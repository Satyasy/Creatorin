import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#0D0C22] font-sans selection:bg-[#155DFC] selection:text-white">
      {children}
    </div>
  );
}
