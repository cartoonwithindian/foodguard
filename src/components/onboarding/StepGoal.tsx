"use client";

import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

type StepGoalProps = {
  labels: OnboardingLabels["step3"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function StepGoal({
  labels,
  navLabels,
  profile,
  onUpdate,
  onBack,
  onContinue,
}: StepGoalProps) {
  return (
    <>
      <StepHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex flex-1 flex-col gap-3">
        {labels.options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.goal === opt.value}
            onSelect={() => onUpdate({ goal: opt.value as UserProfile["goal"] })}
          />
        ))}
      </div>
      <OnboardingNavigation
        backLabel={navLabels.back}
        continueLabel={navLabels.continue}
        showBack
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!profile.goal}
      />
    </>
  );
}
