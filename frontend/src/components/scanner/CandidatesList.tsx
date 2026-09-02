"use client";

import { Package, Building2, Barcode } from "lucide-react";
import type { IdentifiedProduct } from "@/types/identification";

type CandidatesListProps = {
  title: string;
  candidates: IdentifiedProduct[];
  pickLabel: string;
  onPick: (product: IdentifiedProduct) => void;
};

export function CandidatesList({ title, candidates, pickLabel, onPick }: CandidatesListProps) {
  if (candidates.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {candidates.map((candidate) => (
        <button
          key={candidate.id || candidate.barcode}
          type="button"
          onClick={() => onPick(candidate)}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
        >
          {candidate.imageUrl ? (
            
            <img
              src={candidate.imageUrl}
              alt={candidate.name}
              className="size-12 shrink-0 rounded-xl object-cover bg-muted"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Package className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{candidate.name}</p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              {candidate.brand && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3" aria-hidden="true" />
                  {candidate.brand}
                </span>
              )}
              {candidate.barcode && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Barcode className="size-3" aria-hidden="true" />
                  {candidate.barcode}
                </span>
              )}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            {pickLabel}
          </span>
        </button>
      ))}
    </div>
  );
}