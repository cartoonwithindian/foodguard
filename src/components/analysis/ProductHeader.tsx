import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import type { ProductCategory } from "@/data/mock-data";
import { CATEGORY_LABELS } from "@/data/mock-data";

type ProductHeaderProps = {
  name: string;
  brand: string;
  category: ProductCategory;
  barcode: string;
  scanDate: string;
  imageUrl?: string;
  backButton: string;
  scanDateLabel: string;
};

export function ProductHeader({
  name,
  brand,
  category,
  barcode,
  scanDate,
  imageUrl,
  backButton,
  scanDateLabel,
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/scan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backButton}
      </Link>
      <div className="flex gap-4">
        {imageUrl && (
          <div className="size-20 shrink-0 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
            
            <img
              src={imageUrl}
              alt={name}
              className="size-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {brand} · {CATEGORY_LABELS[category]}
          </p>
          {barcode && (
            <p className="text-xs text-muted-foreground font-mono">{barcode}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="size-3" aria-hidden="true" />
            {scanDateLabel}: {scanDate}
          </div>
        </div>
      </div>
    </div>
  );
}
