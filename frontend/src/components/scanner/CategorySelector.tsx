"use client";

import { UtensilsCrossed, Sparkles, Droplets, Home, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/data/mock-data";

type CategorySelectorProps = {
  title: string;
  description: string;
  categories: {
    food: string;
    cosmetics: string;
    personalCare: string;
    household: string;
    other: string;
  };
  onSelect: (category: ProductCategory) => void;
};

const CATEGORY_ITEMS: {
  key: ProductCategory;
  labelKey: keyof CategorySelectorProps["categories"];
  Icon: typeof UtensilsCrossed;
}[] = [
  { key: "food", labelKey: "food", Icon: UtensilsCrossed },
  { key: "cosmetics", labelKey: "cosmetics", Icon: Sparkles },
  { key: "personal_care", labelKey: "personalCare", Icon: Droplets },
  { key: "household", labelKey: "household", Icon: Home },
  { key: "other", labelKey: "other", Icon: HelpCircle },
];

export function CategorySelector({
  title,
  description,
  categories,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORY_ITEMS.map(({ key, labelKey, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-foreground">{categories[labelKey]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
