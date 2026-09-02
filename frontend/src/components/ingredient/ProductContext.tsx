"use client";

import { Package } from "lucide-react";
import type { ProductContextInfo } from "@/data/ingredient-data";
import type { IngredientLabels } from "@/data/ingredient-labels";

type ProductContextProps = {
  context: ProductContextInfo;
  labels: IngredientLabels["productContext"];
};

export function ProductContext({ context, labels }: ProductContextProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Package className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
      </div>

      <div className="space-y-2.5">
        <div className="rounded-xl border border-border bg-background p-3.5">
          <span className="text-xs text-muted-foreground">{labels.productName}</span>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {context.productBrand} — {context.productName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border bg-background p-3.5">
            <span className="text-xs text-muted-foreground">{labels.position}</span>
            <p className="mt-0.5 text-sm font-medium text-foreground">{context.position}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3.5">
            <span className="text-xs text-muted-foreground">{labels.functionLabel}</span>
            <p className="mt-0.5 text-sm font-medium text-foreground">{context.functionInProduct}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-3.5">
          <span className="text-xs text-muted-foreground">{labels.notes}</span>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {context.additionalNotes}
          </p>
        </div>
      </div>
    </div>
  );
}
