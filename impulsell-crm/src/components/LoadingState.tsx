"use client"

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <Card className="overflow-hidden p-0" role="status" aria-label="Carregando leads">
      {/* header skeleton */}
      <div className="flex items-center gap-3 border-b border-border/40 bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="hidden h-4 w-24 sm:block" />
        <Skeleton className="hidden h-4 w-20 md:block" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* row skeletons */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24 sm:hidden" />
            </div>
            <Skeleton className="hidden h-6 w-24 sm:block" />
            <Skeleton className="h-8 w-36" />
          </div>
        ))}
      </div>
    </Card>
  );
}