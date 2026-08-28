"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchFilters, NutritionPreference } from "@/data/search-data";
import { INGREDIENT_PREFERENCES, NUTRITION_PREFERENCES } from "@/data/search-data";

type FilterPanelProps = {
  buttonLabel: string;
  labels: {
    title: string;
    category: string;
    ingredientPreferences: string;
    concernLevel: string;
    nutritionPreferences: string;
    applyButton: string;
    clearAll: string;
    all: string;
    low: string;
    moderate: string;
    high: string;
  };
  categoryLabels: {
    food: string;
    cosmetics: string;
    personalCare: string;
    household: string;
  };
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClear: () => void;
};

export function FilterPanel({
  buttonLabel,
  labels,
  categoryLabels,
  filters,
  onApply,
  onClear,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const categoryItems = [
    { key: "all" as const, label: labels.all },
    { key: "food" as const, label: categoryLabels.food },
    { key: "cosmetics" as const, label: categoryLabels.cosmetics },
    { key: "personal_care" as const, label: categoryLabels.personalCare },
    { key: "household" as const, label: categoryLabels.household },
  ];

  const concernItems = [
    { key: "all" as const, label: labels.all },
    { key: "low" as const, label: labels.low },
    { key: "moderate" as const, label: labels.moderate },
    { key: "high" as const, label: labels.high },
  ];

  const handleApply = () => {
    onApply(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared: SearchFilters = {
      category: "all",
      ingredientPreferences: [],
      concernLevel: "all",
      nutritionPreferences: [],
    };
    setLocalFilters(cleared);
    onClear();
    setIsOpen(false);
  };

  const toggleIngredient = (pref: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      ingredientPreferences: prev.ingredientPreferences.includes(pref)
        ? prev.ingredientPreferences.filter((p) => p !== pref)
        : [...prev.ingredientPreferences, pref],
    }));
  };

  const toggleNutrition = (pref: NutritionPreference) => {
    setLocalFilters((prev) => ({
      ...prev,
      nutritionPreferences: prev.nutritionPreferences.includes(pref)
        ? prev.nutritionPreferences.filter((p) => p !== pref)
        : [...prev.nutritionPreferences, pref],
    }));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {labels.title}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-muted transition-colors"
              >
                <X className="size-5 text-muted-foreground" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {labels.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          category: item.key,
                        }))
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        localFilters.category === item.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {labels.nutritionPreferences}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {NUTRITION_PREFERENCES.map((pref) => (
                    <button
                      key={pref.key}
                      type="button"
                      onClick={() => toggleNutrition(pref.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        localFilters.nutritionPreferences.includes(pref.key)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {labels.ingredientPreferences}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {INGREDIENT_PREFERENCES.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => toggleIngredient(pref)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        localFilters.ingredientPreferences.includes(pref)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {labels.concernLevel}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {concernItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          concernLevel: item.key,
                        }))
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        localFilters.concernLevel === item.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border px-5 py-4 space-y-3">
              <button
                type="button"
                onClick={handleApply}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {labels.applyButton}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {labels.clearAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
