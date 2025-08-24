export default function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="ml-3 flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
      </div>

      {/* Media */}
      <div className="px-6 pb-4">
        <div className="h-64 bg-gray-300 rounded-2xl animate-pulse"></div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-slate-50">
        <div className="flex items-center justify-between gap-2">
          <div className="h-10 bg-gray-200 rounded-full flex-1 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-full flex-1 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-full flex-1 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
