export function SearchLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="space-y-2 pt-2">
              <div className="h-2 w-full rounded bg-muted animate-pulse" />
              <div className="h-2 w-2/3 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
