"use client";

import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/data/mock-data";

type CategoryFilterProps = {
  categories: {
    all: string;
    food: string;
    cosmetics: string;
    personalCare: string;
    household: string;
    healthcare: string;
  };
  active: ProductCategory | "all";
  onChange: (category: ProductCategory | "all") => void;
};

const ITEMS: { key: ProductCategory | "all"; labelKey: keyof CategoryFilterProps["categories"] }[] = [
  { key: "all", labelKey: "all" },
  { key: "food", labelKey: "food" },
  { key: "cosmetics", labelKey: "cosmetics" },
  { key: "personal_care", labelKey: "personalCare" },
  { key: "household", labelKey: "household" },
];

export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {ITEMS.map(({ key, labelKey }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
            active === key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-muted",
          )}
        >
          {categories[labelKey]}
        </button>
      ))}
    </div>
  );
}
