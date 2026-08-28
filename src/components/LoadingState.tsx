'use client';

export function LoadingState() {
  return (
    <div className="space-y-3">
      {/* Skeleton for table header */}
      <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" style={{ width: i === 1 ? '60%' : i === 6 ? '80%' : '70%' }} />
        ))}
      </div>
      {/* Skeleton rows */}
      {[1, 2, 3, 4, 5].map(row => (
        <div key={row} className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-gray-100">
          {[1, 2, 3, 4, 5, 6].map(col => (
            <div key={col} className="h-4 bg-gray-200 animate-pulse rounded" style={{ width: col === 1 ? '60%' : col === 6 ? '80%' : '70%' }} />
          ))}
        </div>
      ))}
    </div>
  );
}