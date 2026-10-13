'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation has completed
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let safetyTimeout: NodeJS.Timeout;

    const startProgress = () => {
      setIsNavigating(true);
      setProgress(25);

      clearInterval(progressInterval);
      clearTimeout(safetyTimeout);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + (prev < 50 ? 20 : 8);
        });
      }, 150);

      // Safety watchdog: never stay stuck for more than 3.5s
      safetyTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        setIsNavigating(false);
        setProgress(0);
      }, 3500);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, downloads, new tabs, hashes, and modifiers
      if (
        target.target === '_blank' ||
        target.hasAttribute('download') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const currentPath = window.location.pathname + window.location.search;
      if (href === currentPath || href === window.location.pathname) {
        return;
      }

      startProgress();
    };

    const handlePopState = () => {
      startProgress();
    };

    const handlePageShow = () => {
      clearInterval(progressInterval);
      clearTimeout(safetyTimeout);
      setIsNavigating(false);
      setProgress(0);
    };

    const handleNavigationStart = () => {
      startProgress();
    };

    // Attach delegated click listener on document (capture phase)
    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('creatorin:navigation-start', handleNavigationStart);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(safetyTimeout);
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('creatorin:navigation-start', handleNavigationStart);
    };
  }, []);

  if (!isNavigating && progress === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-[#155DFC] transition-all duration-300 ease-out shadow-[0_0_10px_#155DFC,0_0_5px_#155DFC]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
}

export function startRouteProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('creatorin:navigation-start'));
  }
}
