"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { searchProductCandidates } from "@/lib/resolve-product";
import type { ProductResolution } from "@/types/identification";

type NameSearchFormProps = {
  title: string;
  placeholder: string;
  searchButton: string;
  searching: string;
  onResult: (resolution: ProductResolution) => void;
};

const DEBOUNCE_MS = 450;

export function NameSearchForm({
  title,
  placeholder,
  searchButton,
  searching,
  onResult,
}: NameSearchFormProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const runSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      setErrorMsg(null);
      setIsSearching(true);
      try {
        const resolution = await searchProductCandidates(q);
        // Cancellation guard: a newer query supersedes this result.
        if (queryRef.current !== q) return;
        onResult(resolution);
      } catch {
        setErrorMsg("We couldn't search right now. Please check your connection and try again.");
      } finally {
        if (queryRef.current === q) setIsSearching(false);
      }
    },
    [onResult],
  );

  const handleSearch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const q = query.trim();
    if (!q || isSearching) return;
    void runSearch(q);
  }, [query, isSearching, runSearch]);

  const handleInput = useCallback(
    (value: string) => {
      setQuery(value);
      queryRef.current = value.trim();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (value.trim()) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          if (!isSearching) {
            const q = value.trim();
            queryRef.current = q;
            void runSearch(q);
          }
        }, DEBOUNCE_MS);
      }
    },
    [isSearching, runSearch],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              {searching}
            </span>
          ) : (
            <>
              <Search className="size-4" aria-hidden="true" />
              {searchButton}
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}