'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import { Sparkles, Shield, Building2, GraduationCap, ChevronDown, Check } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const currentRole = user?.role || 'creator';

  const roles: { id: UserRole; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    {
      id: 'creator',
      label: 'Kreator',
      icon: Sparkles,
      desc: 'Portofolio, Proyek & Layanan Kreatif',
    },
    {
      id: 'umkm',
      label: 'UMKM',
      icon: Building2,
      desc: 'Owner Brand & Pemasang Brief',
    },
    {
      id: 'school',
      label: 'Sekolah / SMK',
      icon: GraduationCap,
      desc: 'Institusi Vokasi & Guru Pembimbing',
    },
  ];

  const currentRoleConfig = roles.find((r) => r.id === currentRole) || roles[0];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <div
      id="role-switcher-container"
      className="fixed bottom-5 left-5 z-40 select-none print:hidden"
    >
      {isOpen && (
        <div
          role="dialog"
          aria-label="Role Switcher Menu"
          className="mb-2 w-72 rounded-2xl bg-white/95 backdrop-blur-md p-2 shadow-xl border border-neutral-200/80 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
              <Shield className="size-3.5 text-neutral-700" />
              <span>Mode Akses (RBAC)</span>
            </div>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono font-medium">
              Demo/QA
            </span>
          </div>

          <div className="mt-1 space-y-1">
            {roles.map((item) => {
              const Icon = item.icon;
              const isActive = currentRole === item.id;

              return (
                <button
                  key={item.id}
                  id={`role-btn-${item.id}`}
                  data-testid={`role-btn-${item.id}`}
                  type="button"
                  onClick={() => {
                    switchRole(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                      {item.label}
                    </p>
                    <p className={`text-[11px] truncate leading-tight mt-0.5 ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {item.desc}
                    </p>
                  </div>
                  {isActive && <Check className="size-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pill trigger */}
      <button
        id="role-switcher-toggle"
        data-testid="role-switcher-toggle"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md hover:shadow-lg border border-neutral-200/80 backdrop-blur-md transition-all cursor-pointer group"
        title="Ganti Mode Peran (Kreator, UMKM, Sekolah)"
      >
        <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
        <CurrentIcon className="size-4 text-neutral-700 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold text-neutral-800">
          Role: <strong className="font-bold text-neutral-950">{currentRoleConfig.label}</strong>
        </span>
        <ChevronDown
          className={`size-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
};
