export default function StorySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="aspect-[9/16] relative bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>
  );
}
