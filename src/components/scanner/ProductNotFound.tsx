"use client";

import { SearchX, FlaskConical, Keyboard, RefreshCw } from "lucide-react";

type ProductNotFoundProps = {
  title: string;
  description: string;
  scanIngredientLabel: string;
  enterManuallyLabel: string;
  tryAnotherLabel: string;
  onScanIngredient: () => void;
  onEnterManually: () => void;
  onTryAnother: () => void;
};

export function ProductNotFound({
  title,
  description,
  scanIngredientLabel,
  enterManuallyLabel,
  tryAnotherLabel,
  onScanIngredient,
  onEnterManually,
  onTryAnother,
}: ProductNotFoundProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={onScanIngredient}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <FlaskConical className="size-4" aria-hidden="true" />
          {scanIngredientLabel}
        </button>
        <button
          type="button"
          onClick={onEnterManually}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Keyboard className="size-4" aria-hidden="true" />
          {enterManuallyLabel}
        </button>
        <button
          type="button"
          onClick={onTryAnother}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {tryAnotherLabel}
        </button>
      </div>
    </div>
  );
}
