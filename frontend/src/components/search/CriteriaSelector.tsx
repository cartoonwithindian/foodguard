"use client";

import { useState } from "react";
import { Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CRITERIA_OPTIONS, type UserCriteria, type NutritionPreference } from "@/data/search-data";

type CriteriaSelectorProps = {
  title: string;
  subtitle: string;
  findButton: string;
  avoidPlaceholder: string;
  preferPlaceholder: string;
  customPlaceholder: string;
  onFind: (criteria: UserCriteria) => void;
};

export function CriteriaSelector({
  title,
  subtitle,
  findButton,
  avoidPlaceholder,
  preferPlaceholder,
  customPlaceholder,
  onFind,
}: CriteriaSelectorProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [avoidInput, setAvoidInput] = useState("");
  const [avoidList, setAvoidList] = useState<string[]>([]);
  const [preferInput, setPreferInput] = useState("");
  const [preferList, setPreferList] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");

  const toggleCriteria = (key: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const addAvoid = () => {
    const trimmed = avoidInput.trim();
    if (trimmed && !avoidList.includes(trimmed)) {
      setAvoidList((prev) => [...prev, trimmed]);
      setAvoidInput("");
    }
  };

  const removeAvoid = (item: string) => {
    setAvoidList((prev) => prev.filter((i) => i !== item));
  };

  const addPrefer = () => {
    const trimmed = preferInput.trim();
    if (trimmed && !preferList.includes(trimmed)) {
      setPreferList((prev) => [...prev, trimmed]);
      setPreferInput("");
    }
  };

  const removePrefer = (item: string) => {
    setPreferList((prev) => prev.filter((i) => i !== item));
  };

  const handleFind = () => {
    const nutritionPrefs: NutritionPreference[] = selectedCriteria.filter(
      (c): c is NutritionPreference =>
        ["lower_sugar", "lower_sodium", "lower_saturated_fat", "higher_protein", "higher_fibre"].includes(c),
    );

    const ingredientPrefs = selectedCriteria.filter(
      (c) => !["lower_sugar", "lower_sodium", "lower_saturated_fat", "higher_protein", "higher_fibre"].includes(c),
    );

    onFind({
      nutritionPreferences: nutritionPrefs,
      ingredientPreferences: ingredientPrefs as UserCriteria["ingredientPreferences"],
      avoidIngredients: avoidList,
      preferIngredients: preferList,
      customCriteria: customText,
    });
  };

  const hasSelection =
    selectedCriteria.length > 0 ||
    avoidList.length > 0 ||
    preferList.length > 0 ||
    customText.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Target className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Criteria chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CRITERIA_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggleCriteria(opt.key)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selectedCriteria.includes(opt.key)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/30 hover:bg-muted/50",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Avoid ingredients */}
      {(selectedCriteria.includes("avoid_ingredient") || avoidList.length > 0) && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Avoid Ingredients</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={avoidInput}
              onChange={(e) => setAvoidInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAvoid();
                }
              }}
              placeholder={avoidPlaceholder}
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={addAvoid}
              disabled={!avoidInput.trim()}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {avoidList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {avoidList.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeAvoid(item)}
                    className="rounded-full p-0.5 hover:bg-red-100"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prefer ingredients */}
      {(selectedCriteria.includes("prefer_specific") || preferList.length > 0) && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Prefer Ingredients</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={preferInput}
              onChange={(e) => setPreferInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPrefer();
                }
              }}
              placeholder={preferPlaceholder}
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={addPrefer}
              disabled={!preferInput.trim()}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {preferList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {preferList.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removePrefer(item)}
                    className="rounded-full p-0.5 hover:bg-green-100"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom criteria */}
      {selectedCriteria.includes("custom") && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Custom Criteria</p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={customPlaceholder}
            rows={2}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      )}

      {/* Find button */}
      <button
        type="button"
        onClick={handleFind}
        disabled={!hasSelection}
        className={cn(
          "w-full rounded-xl px-5 py-3 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          hasSelection
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {findButton}
      </button>
    </div>
  );
}
