"use client";

import { ArrowRight, Check } from "lucide-react";
import { CATEGORY_LABELS, CONCERN_COLORS } from "@/data/mock-data";
import type { SearchProduct } from "@/data/search-data";
import { IngredientMatch } from "./IngredientMatch";

type SearchResultCardProps = {
  product: SearchProduct;
  viewAnalysisLabel: string;
  compareLabel: string;
  comparedLabel: string;
  whyMatchDetailLabel: string;
  matchLabels: {
    matchLabel: string;
    whyMatch: string;
    matchedIngredients: string;
    missingIngredients: string;
  };
  onSelect: (barcode: string) => void;
  onCompareToggle: (id: string) => void;
  isComparing: boolean;
  canCompare: boolean;
};

export function SearchResultCard({
  product,
  viewAnalysisLabel,
  compareLabel,
  comparedLabel,
  whyMatchDetailLabel,
  matchLabels,
  onSelect,
  onCompareToggle,
  isComparing,
  canCompare,
}: SearchResultCardProps) {
  const concernColor = CONCERN_COLORS[product.concernLevel];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{CATEGORY_LABELS[product.category]}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {product.summary}
        </p>
      </div>

      {/* Why this result */}
      {product.matchReasons.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-2.5">
          <p className="mb-1 text-xs font-semibold text-foreground">
            {whyMatchDetailLabel}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {product.matchReasons[0]}
            {product.matchReasons.length > 1 &&
              ` Also: ${product.matchReasons.slice(1, 3).join(", ")}`}
          </p>
        </div>
      )}

      <IngredientMatch
        matchPercentage={product.matchPercentage}
        matchedIngredients={product.matchedIngredients}
        missingIngredients={product.missingIngredients}
        labels={matchLabels}
      />

      <div className="flex items-center justify-between pt-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${concernColor.bg} ${concernColor.text}`}
        >
          <span className={`size-1.5 rounded-full ${concernColor.dot}`} />
          Score: {product.score}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCompareToggle(product.id)}
            disabled={!canCompare && !isComparing}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isComparing
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isComparing ? (
              <>
                <Check className="size-3" aria-hidden="true" />
                {comparedLabel}
              </>
            ) : (
              compareLabel
            )}
          </button>
          <button
            type="button"
            onClick={() => onSelect(product.barcode)}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {viewAnalysisLabel}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
