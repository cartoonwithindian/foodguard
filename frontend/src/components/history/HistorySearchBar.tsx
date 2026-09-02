"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type HistorySearchBarProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

export function HistorySearchBar({
  placeholder,
  value,
  onChange,
  onSearch,
}: HistorySearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
