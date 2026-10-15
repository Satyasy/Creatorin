'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { mapErrorToDetails, ErrorDetails } from '@/lib/error-mapper';

interface ShowErrorOptions {
  onRetry?: () => Promise<void> | void;
  title?: string;
  message?: string;
}

interface ErrorModalContextType {
  showErrorModal: (error: unknown, options?: ShowErrorOptions) => void;
  hideErrorModal: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextType>({
  showErrorModal: () => {},
  hideErrorModal: () => {},
});

export const useErrorModal = () => useContext(ErrorModalContext);

export function dispatchGlobalError(error: unknown, options?: ShowErrorOptions) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('creatorin:error-modal', {
        detail: { error, options },
      })
    );
  }
}

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [retryCallback, setRetryCallback] = useState<(() => Promise<void> | void) | undefined>(undefined);

  const hideErrorModal = useCallback(() => {
    setIsOpen(false);
    setErrorDetails(null);
    setRetryCallback(undefined);
  }, []);

  const showErrorModal = useCallback((error: unknown, options?: ShowErrorOptions) => {
    const mapped = mapErrorToDetails(error, options?.title, options?.message);
    setErrorDetails(mapped);
    setRetryCallback(() => options?.onRetry);
    setIsOpen(true);
  }, []);

  // Listen to global error dispatch events (e.g. from fetch interceptors or unhandled rejections)
  useEffect(() => {
    const handleGlobalError = (event: Event) => {
      const customEvent = event as CustomEvent<{ error: unknown; options?: ShowErrorOptions }>;
      if (customEvent.detail) {
        showErrorModal(customEvent.detail.error, customEvent.detail.options);
      }
    };

    window.addEventListener('creatorin:error-modal', handleGlobalError);
    return () => {
      window.removeEventListener('creatorin:error-modal', handleGlobalError);
    };
  }, [showErrorModal]);

  return (
    <ErrorModalContext.Provider value={{ showErrorModal, hideErrorModal }}>
      {children}
      <ErrorModal
        isOpen={isOpen}
        onClose={hideErrorModal}
        error={errorDetails}
        onRetry={retryCallback}
      />
    </ErrorModalContext.Provider>
  );
}
