'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SuccessModal, SuccessModalOptions } from '@/components/modals/SuccessModal';

interface SuccessModalContextType {
  showSuccessModal: (options: SuccessModalOptions) => void;
  hideSuccessModal: () => void;
}

const SuccessModalContext = createContext<SuccessModalContextType>({
  showSuccessModal: () => {},
  hideSuccessModal: () => {},
});

export const useSuccessModal = () => useContext(SuccessModalContext);

export function SuccessModalProvider({ children }: { children: React.ReactNode }) {
  const [modalOptions, setModalOptions] = useState<SuccessModalOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const hideSuccessModal = useCallback(() => {
    setIsOpen(false);
    setModalOptions(null);
  }, []);

  const showSuccessModal = useCallback((options: SuccessModalOptions) => {
    setModalOptions(options);
    setIsOpen(true);
  }, []);

  return (
    <SuccessModalContext.Provider value={{ showSuccessModal, hideSuccessModal }}>
      {children}
      <SuccessModal
        isOpen={isOpen}
        options={modalOptions}
        onDismiss={hideSuccessModal}
      />
    </SuccessModalContext.Provider>
  );
}
