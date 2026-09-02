"use client";

import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile, HealthConsideration } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { MultiSelectCard } from "@/components/onboarding/MultiSelectCard";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

type StepHealthProps = {
  labels: OnboardingLabels["step6"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function StepHealth({
  labels,
  navLabels,
  profile,
  onUpdate,
  onBack,
  onContinue,
}: StepHealthProps) {
  const toggle = (value: HealthConsideration) => {
    const current = profile.healthConsiderations;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onUpdate({ healthConsiderations: next });
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
              selected={profile.healthConsiderations.includes(
                opt.value as HealthConsideration,
              )}
              onSelect={() => toggle(opt.value as HealthConsideration)}
            />
          ))}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          {labels.disclaimer}
        </div>
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
