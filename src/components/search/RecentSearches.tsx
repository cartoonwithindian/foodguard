"use client";

import { Clock, Trash2 } from "lucide-react";

type RecentSearchesProps = {
  title: string;
  clearLabel: string;
  searches: string[];
  onSelect: (search: string) => void;
  onClear: () => void;
};

export function RecentSearches({
  title,
  clearLabel,
  searches,
  onSelect,
  onClear,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="size-3" aria-hidden="true" />
          {clearLabel}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Clock className="size-3 text-muted-foreground" aria-hidden="true" />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
