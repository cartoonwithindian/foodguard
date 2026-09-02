"use client";

import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import type { IngredientLabels } from "@/data/ingredient-labels";

type IngredientActionsProps = {
  productBarcode?: string;
  labels: IngredientLabels["actions"];
};

export function IngredientActions({
  productBarcode,
  labels,
}: IngredientActionsProps) {
  const analysisHref = productBarcode
    ? `/analysis?barcode=${encodeURIComponent(productBarcode)}`
    : "/";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={analysisHref}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {labels.backToAnalysis}
      </Link>
      <Link
        href="/search"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Search className="size-4" aria-hidden="true" />
        {labels.searchProducts}
      </Link>
    </div>
  );
}
