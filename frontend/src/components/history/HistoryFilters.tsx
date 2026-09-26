"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryLabels } from "@/data/history-labels";
import type { HistoryFilter } from "@/data/history-data";
import { CATEGORIES, DATE_RANGES } from "@/data/history-data";

type HistoryFiltersProps = {
  labels: HistoryLabels["filters"];
  filters: HistoryFilter;
  onApply: (filters: HistoryFilter) => void;
  onClear: () => void;
};

export function HistoryFilters({
  labels,
  filters,
  onApply,
  onClear,
}: HistoryFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HistoryFilter>(filters);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleApply = useCallback(() => {
    onApply(draft);
    setOpen(false);
  }, [draft, onApply]);

  const handleClear = useCallback(() => {
    setDraft({ assessment: "all", category: "all", dateRange: "all" });
    onClear();
    setOpen(false);
  }, [onClear]);

  const assessmentLevels = [
    { value: "all" as const, label: labels.all },
    { value: "high" as const, label: "High Concern" },
    { value: "moderate" as const, label: "Moderate Concern" },
    { value: "low" as const, label: "Low Concern" },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          open
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-card text-foreground hover:border-primary/30",
        )}
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {labels.button}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{labels.button}</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close filters"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Assessment */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{labels.assessment}</p>
            <div className="flex flex-wrap gap-1.5">
              {assessmentLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, assessment: level.value }))}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    draft.assessment === level.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{labels.category}</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, category: cat.value }))}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    draft.category === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{labels.dateRange}</p>
            <div className="flex flex-wrap gap-1.5">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, dateRange: range.value }))}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    draft.dateRange === range.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {labels.clear}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {labels.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
