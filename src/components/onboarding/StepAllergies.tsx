"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile, Allergen } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { MultiSelectCard } from "@/components/onboarding/MultiSelectCard";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

type StepAllergiesProps = {
  labels: OnboardingLabels["step5"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function StepAllergies({
  labels,
  navLabels,
  profile,
  onUpdate,
  onBack,
  onContinue,
}: StepAllergiesProps) {
  const [customInput, setCustomInput] = useState("");

  const toggle = (value: Allergen) => {
    const current = profile.allergies;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onUpdate({ allergies: next });
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !profile.customAllergies.includes(trimmed)) {
      onUpdate({ customAllergies: [...profile.customAllergies, trimmed] });
      setCustomInput("");
    }
  };

  const removeCustom = (item: string) => {
    onUpdate({
      customAllergies: profile.customAllergies.filter((v) => v !== item),
    });
  };

  return (
    <>
      <StepHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          {labels.options.map((opt) => (
            <MultiSelectCard
              key={opt.value}
              label={opt.label}
              selected={profile.allergies.includes(opt.value as Allergen)}
              onSelect={() => toggle(opt.value as Allergen)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={labels.addPlaceholder}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            className="flex h-10 flex-1 rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/30"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            {labels.addButton}
          </button>
        </div>

        {profile.customAllergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.customAllergies.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeCustom(item)}
                  className="rounded-full p-0.5 hover:bg-primary/10"
                  aria-label={`Remove ${item}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">{labels.note}</p>
      </div>
      <OnboardingNavigation
        backLabel={navLabels.back}
        continueLabel={navLabels.continue}
        skipLabel={labels.skip}
        showBack
        showSkip
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onContinue}
      />
    </>
  );
}
