export function CardSkeleton() {
  return (
    <div className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 animate-pulse space-y-4 backdrop-blur-sm">
      <div className="h-48 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-5 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
      </div>
    </div>
  );
}

export function TextSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-8 pl-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2 relative">
          <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="h-5 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}
