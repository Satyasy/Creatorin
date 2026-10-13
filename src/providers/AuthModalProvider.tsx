'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthModal } from '@/components/modals/AuthModal';
import type { AuthState } from '@/types';

export interface AuthModalOptions {
  title?: string;
  description?: string;
  redirectUrl?: string;
  onSuccess?: (user: NonNullable<AuthState['user']>) => void;
}

interface AuthModalContextType {
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthModalOpen: false,
});

export const useAuthModal = () => useContext(AuthModalContext);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<AuthModalOptions>({});

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setModalConfig(options || {});
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthModalOpen: isOpen }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        title={modalConfig.title}
        description={modalConfig.description}
        redirectUrl={modalConfig.redirectUrl}
        onSuccess={modalConfig.onSuccess}
      />
    </AuthModalContext.Provider>
  );
}
