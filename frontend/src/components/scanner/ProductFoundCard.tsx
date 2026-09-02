import { CheckCircle2, Tag, Building2, Barcode, ArrowRight, RefreshCw } from "lucide-react";
import type { ProductAnalysis } from "@/data/product-data";
import { CATEGORY_LABELS } from "@/data/mock-data";

type ProductFoundCardProps = {
  product: ProductAnalysis;
  title: string;
  analyzeButton: string;
  scanAgainButton: string;
  onAnalyze: (barcode: string) => void;
  onScanAgain: () => void;
};

export function ProductFoundCard({
  product,
  title,
  analyzeButton,
  scanAgainButton,
  onAnalyze,
  onScanAgain,
}: ProductFoundCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm dark:border-green-900/50 dark:bg-green-950/40">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50">
          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-green-800 dark:text-green-300 pt-2">{title}</h3>
      </div>
      <div className="rounded-xl border border-green-200 bg-background p-4">
        <h4 className="text-lg font-semibold text-foreground">{product.name}</h4>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Building2 className="size-3.5" aria-hidden="true" />
            {product.brand}
          </span>
          <span className="inline-flex items-center gap-1">
            <Tag className="size-3.5" aria-hidden="true" />
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.barcode && (
            <span className="inline-flex items-center gap-1">
              <Barcode className="size-3.5" aria-hidden="true" />
              {product.barcode}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onAnalyze(product.barcode)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {analyzeButton}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onScanAgain}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {scanAgainButton}
        </button>
      </div>
    </div>
  );
}
