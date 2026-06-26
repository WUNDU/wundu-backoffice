import React from 'react';

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className ?? ''}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Pulse className="h-3 w-28" />
          <Pulse className="h-7 w-20" />
          <Pulse className="h-3 w-16" />
        </div>
        <Pulse className="h-10 w-10 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center py-3.5 border-b border-gray-100 last:border-0 px-2 -mx-2">
      <Pulse className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="ml-4 flex-1 space-y-2">
        <Pulse className="h-3.5 w-48" />
        <Pulse className="h-3 w-32" />
      </div>
      <div className="ml-4 space-y-2 items-end flex flex-col">
        <Pulse className="h-4 w-24" />
        <Pulse className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <Pulse className="h-4 w-36 mb-4" />
      <Pulse className="h-64 w-full rounded-md" />
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

export function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}
