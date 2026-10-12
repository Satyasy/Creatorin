import React from 'react';

export function UmkmProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#0F172A] pb-24 animate-pulse">
      {/* Cover Banner Skeleton */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200" />

      {/* Main UMKM Brand Header */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between -mt-14 sm:-mt-16 gap-4 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-neutral-300 ring-4 ring-white shadow-md shrink-0" />
            <div className="space-y-2 pb-1">
              <div className="h-7 w-48 sm:w-64 bg-neutral-300 rounded-lg" />
              <div className="h-4 w-40 sm:w-56 bg-neutral-200 rounded-md" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-4 w-24 bg-neutral-200 rounded-md" />
                <div className="h-4 w-28 bg-neutral-200 rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end">
            <div className="h-10 w-28 bg-neutral-200 rounded-xl" />
            <div className="h-10 w-32 bg-neutral-300 rounded-xl" />
          </div>
        </div>

        {/* Brand Meta Stats */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-t border-neutral-200/70">
          <div className="h-4 w-28 bg-neutral-200 rounded-md" />
          <div className="h-4 w-24 bg-neutral-200 rounded-md" />
          <div className="h-4 w-32 bg-neutral-200 rounded-md" />
        </div>
      </div>

      {/* Tab Bar Skeleton */}
      <div className="sticky top-16 z-20 border-y border-neutral-200 bg-white/90 backdrop-blur-xs py-3.5">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <div className="h-8 w-28 bg-neutral-300 rounded-lg" />
          <div className="h-8 w-32 bg-neutral-200 rounded-lg" />
          <div className="h-8 w-24 bg-neutral-200 rounded-lg" />
          <div className="h-8 w-28 bg-neutral-200 rounded-lg" />
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-neutral-200 rounded-md" />
                <div className="h-4 w-16 bg-neutral-100 rounded-md" />
              </div>
              <div className="h-5 w-3/4 bg-neutral-300 rounded-md" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-neutral-100 rounded-md" />
                <div className="h-3.5 w-5/6 bg-neutral-100 rounded-md" />
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <div className="h-4 w-24 bg-neutral-200 rounded-md" />
                <div className="h-8 w-20 bg-neutral-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
