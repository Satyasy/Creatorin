import React from 'react';

export function CreatorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#0F172A] pb-24 animate-pulse">
      {/* Banner Skeleton */}
      <div className="relative w-full h-48 sm:h-64 lg:h-72 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 overflow-hidden" />

      {/* Main Profile Info Container */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between -mt-16 sm:-mt-20 gap-4 pb-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-neutral-300 ring-4 ring-white shadow-md shrink-0" />
            <div className="space-y-2.5 pb-1">
              <div className="h-8 w-56 sm:w-72 bg-neutral-300 rounded-lg" />
              <div className="h-4 w-44 sm:w-60 bg-neutral-200 rounded-md" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-5 w-20 bg-neutral-200 rounded-md" />
                <div className="h-5 w-24 bg-neutral-200 rounded-md" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <div className="h-10 w-28 bg-neutral-200 rounded-xl" />
            <div className="h-10 w-32 bg-neutral-300 rounded-xl" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-t border-neutral-200/70">
          <div className="h-4 w-28 bg-neutral-200 rounded-md" />
          <div className="h-4 w-32 bg-neutral-200 rounded-md" />
          <div className="h-4 w-24 bg-neutral-200 rounded-md" />
          <div className="h-4 w-24 bg-neutral-200 rounded-md" />
          <div className="h-4 w-28 bg-neutral-200 rounded-md" />
        </div>
      </div>

      {/* Sticky Tab Bar Skeleton */}
      <div className="sticky top-16 z-20 border-y border-neutral-200 bg-white/90 backdrop-blur-xs py-3.5">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 bg-neutral-300 rounded-lg" />
            <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
            <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
            <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
            <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
          </div>
          <div className="hidden sm:block h-8 w-28 bg-neutral-200 rounded-lg" />
        </div>
      </div>

      {/* Grid of Portfolio Cards Skeleton */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-[326/407.5] rounded-xl bg-neutral-200 border border-neutral-200/80 overflow-hidden flex flex-col justify-end p-4 space-y-2"
            >
              <div className="h-4 w-3/4 bg-neutral-300 rounded-md" />
              <div className="h-3 w-1/2 bg-neutral-300/80 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
