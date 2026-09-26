import { AlertTriangle, RefreshCw, Keyboard } from "lucide-react";

type ScanErrorProps = {
  title: string;
  description: string;
  tryAgainLabel: string;
  enterManuallyLabel: string;
  onTryAgain: () => void;
  onEnterManually: () => void;
};

export function ScanError({
  title,
  description,
  tryAgainLabel,
  enterManuallyLabel,
  onTryAgain,
  onEnterManually,
}: ScanErrorProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/40">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/50">
        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">{title}</h3>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 max-w-xs mx-auto">{description}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs sm:flex-row">
        <button
          type="button"
          onClick={onTryAgain}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300 bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {tryAgainLabel}
        </button>
        <button
          type="button"
          onClick={onEnterManually}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Keyboard className="size-4" aria-hidden="true" />
          {enterManuallyLabel}
        </button>
      </div>
    </div>
  );
}
