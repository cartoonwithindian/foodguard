"use client";

import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile, DietaryPreference } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { MultiSelectCard } from "@/components/onboarding/MultiSelectCard";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

type StepDietProps = {
  labels: OnboardingLabels["step4"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function StepDiet({
  labels,
  navLabels,
  profile,
  onUpdate,
  onBack,
  onContinue,
}: StepDietProps) {
  const toggle = (value: DietaryPreference) => {
    const current = profile.dietaryPreferences;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onUpdate({ dietaryPreferences: next });
  };

  return (
    <>
      <StepHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex flex-1 flex-col gap-2.5">
        {labels.options.map((opt) => (
          <MultiSelectCard
            key={opt.value}
            label={opt.label}
            selected={profile.dietaryPreferences.includes(
              opt.value as DietaryPreference,
            )}
            onSelect={() => toggle(opt.value as DietaryPreference)}
          />
        ))}
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
