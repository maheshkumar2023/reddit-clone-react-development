export function PostSkeleton() {
  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-600/50 overflow-hidden">
      <div className="skeleton w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-12" />
        </div>
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="flex items-center gap-4 mt-3">
          <div className="skeleton h-7 w-20 rounded-lg" />
          <div className="skeleton h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
