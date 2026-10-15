'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ConfirmModal, ConfirmModalOptions } from '@/components/modals/ConfirmModal';

interface ConfirmModalContextType {
  confirmModal: (options: ConfirmModalOptions) => Promise<boolean>;
}

const ConfirmModalContext = createContext<ConfirmModalContextType>({
  confirmModal: () => Promise.resolve(false),
});

export const useConfirmModal = () => useContext(ConfirmModalContext);

export function ConfirmModalProvider({ children }: { children: React.ReactNode }) {
  const [modalOptions, setModalOptions] = useState<ConfirmModalOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirmModal = useCallback((options: ConfirmModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModalOptions(options);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    modalOptions?.onConfirm?.();
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setModalOptions(null);
  }, [modalOptions]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    modalOptions?.onCancel?.();
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setModalOptions(null);
  }, [modalOptions]);

  return (
    <ConfirmModalContext.Provider value={{ confirmModal }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        options={modalOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmModalContext.Provider>
  );
}
