"use client";

import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { UnitSelector } from "@/components/onboarding/UnitSelector";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

type StepBodyInfoProps = {
  labels: OnboardingLabels["step2"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function StepBodyInfo({
  labels,
  navLabels,
  profile,
  onUpdate,
  onBack,
  onContinue,
}: StepBodyInfoProps) {
  return (
    <>
      <StepHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex flex-1 flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {labels.heightLabel}
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min={1}
              placeholder={labels.heightPlaceholder}
              value={profile.height}
              onChange={(e) => onUpdate({ height: e.target.value })}
              className="flex h-11 flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/30"
            />
            <div className="w-28">
              <UnitSelector
                options={[
                  { value: "cm", label: "cm" },
                  { value: "ft", label: "ft & in" },
                ]}
                selected={profile.heightUnit}
                onChange={(v) => onUpdate({ heightUnit: v as "cm" | "ft" })}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {labels.weightLabel}
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              min={1}
              placeholder={labels.weightPlaceholder}
              value={profile.weight}
              onChange={(e) => onUpdate({ weight: e.target.value })}
              className="flex h-11 flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/30"
            />
            <div className="w-28">
              <UnitSelector
                options={[
                  { value: "kg", label: "kg" },
                  { value: "lb", label: "lb" },
                ]}
                selected={profile.weightUnit}
                onChange={(v) => onUpdate({ weightUnit: v as "kg" | "lb" })}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {labels.activityLabel}
          </label>
          <div className="flex flex-col gap-2">
            {labels.activityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ activityLevel: opt.value as UserProfile["activityLevel"] })}
                className={`flex h-11 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  profile.activityLevel === opt.value
                    ? "border-primary bg-primary/8 text-foreground shadow-[0_0_0_1px_rgba(22,101,52,0.12)]"
                    : "border-border bg-card text-foreground hover:border-primary/35 hover:bg-muted/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <OnboardingNavigation
        backLabel={navLabels.back}
        continueLabel={navLabels.continue}
        showBack
        onBack={onBack}
        onContinue={onContinue}
      />
    </>
  );
}
