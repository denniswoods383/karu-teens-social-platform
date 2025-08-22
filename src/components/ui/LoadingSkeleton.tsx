export default function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-300 dark:bg-gray-600 rounded ${className}`} />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <LoadingSkeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <LoadingSkeleton className="h-4 w-32 mb-2" />
          <LoadingSkeleton className="h-3 w-24" />
        </div>
      </div>
      <LoadingSkeleton className="h-20 w-full mb-4" />
      <LoadingSkeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export function StorySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <LoadingSkeleton className="aspect-[9/16] w-full" />
      <div className="p-3">
        <LoadingSkeleton className="h-3 w-20" />
      </div>
    </div>
  );
}