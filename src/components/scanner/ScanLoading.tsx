import { Loader2 } from "lucide-react";

type ScanLoadingProps = {
  message: string;
};

export function ScanLoading({ message }: ScanLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="relative size-16">
        <Loader2 className="size-full animate-spin text-primary" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 rounded-full bg-primary/10" />
        </div>
      </div>
      <p className="text-sm font-medium text-foreground animate-pulse">{message}</p>
    </div>
  );
}
