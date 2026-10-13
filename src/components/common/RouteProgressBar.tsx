'use client';

import React, { useEffect, useState, useTransition } from 'react';
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

  // Listen to global link clicks to immediately trigger the progress bar
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, downloads, new tabs, hashes, and same URL
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
      // If clicking same page anchor or same route, don't show navigation bar
      if (href === currentPath || href === window.location.pathname) {
        return;
      }

      setIsNavigating(true);
      setProgress(25);

      clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + (prev < 50 ? 20 : 8);
        });
      }, 150);
    };

    const attachLinkListeners = () => {
      const anchors = document.querySelectorAll('a[href^="/"]');
      anchors.forEach((a) => {
        a.addEventListener('click', handleAnchorClick as EventListener);
      });
    };

    // Initial attach
    attachLinkListeners();

    // Observe DOM mutations to attach to dynamically rendered links
    const observer = new MutationObserver(() => {
      attachLinkListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const handlePopState = () => {
      setIsNavigating(true);
      setProgress(40);
    };

    window.addEventListener('popstate', handlePopState);

    const handleNavigationStart = () => {
      setIsNavigating(true);
      setProgress(25);
      clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + (prev < 50 ? 20 : 8);
        });
      }, 150);
    };

    window.addEventListener('creatorin:navigation-start', handleNavigationStart);

    return () => {
      clearInterval(progressInterval);
      observer.disconnect();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('creatorin:navigation-start', handleNavigationStart);
      const anchors = document.querySelectorAll('a[href^="/"]');
      anchors.forEach((a) => {
        a.removeEventListener('click', handleAnchorClick as EventListener);
      });
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

