export default function SkeletonLoader() {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden animate-pulse border border-slate-200 dark:border-slate-700">
        <div className="w-full h-48 bg-slate-200 dark:bg-slate-700" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-10" />
          </div>
        </div>
      </div>
    );
  }
  