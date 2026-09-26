"use client";

import { useMemo, useState } from "react";
import { Bookmark, Check, ScanLine, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { serializeProductContextToParams } from "@/components/food-safety-assistant/state";
import type { ProductSnapshot } from "@/types/food-safety-assistant";

type AnalysisActionsProps = {
  saveLabel: string;
  scanLabel: string;
  searchLabel: string;
  reportLabel?: string;
  // Optional product snapshot used to build a deep-link to the assistant.
  // When omitted, the assistant opens empty.
  product?: ProductSnapshot | null;
};

export function AnalysisActions({
  saveLabel,
  scanLabel,
  searchLabel,
  reportLabel = "Get Help Reporting",
  product,
}: AnalysisActionsProps) {
  const [saved, setSaved] = useState(false);

  const reportHref = useMemo(() => {
    const params = serializeProductContextToParams(product ?? null);
    const qs = params.toString();
    return qs ? `/food-safety-assistant?${qs}` : "/food-safety-assistant";
  }, [product]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={reportHref}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          data-testid="analysis-report-issue"
        >
          <ShieldAlert className="size-4" aria-hidden="true" />
          {reportLabel}
        </Link>
        <Link
          href="/scan"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ScanLine className="size-4" aria-hidden="true" />
          {scanLabel}
        </Link>
        <Link
          href="/search"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Search className="size-4" aria-hidden="true" />
          {searchLabel}
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setSaved(true)}
        disabled={saved}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        {saved ? (
          <>
            <Check className="size-4 text-green-600" aria-hidden="true" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="size-4" aria-hidden="true" />
            {saveLabel}
          </>
        )}
      </button>
    </div>
  );
}
