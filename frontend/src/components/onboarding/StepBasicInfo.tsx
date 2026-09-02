"use client";

import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

type StepBasicInfoProps = {
  labels: OnboardingLabels["step1"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function StepBasicInfo({
  labels,
  navLabels,
  profile,
  onUpdate,
  onBack,
  onContinue,
}: StepBasicInfoProps) {
  return (
    <>
      <StepHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex flex-1 flex-col gap-5">
        <div>
          <label htmlFor="ob-name" className="mb-1.5 block text-sm font-medium text-foreground">
            {labels.nameLabel}
          </label>
          <input
            id="ob-name"
            type="text"
            placeholder={labels.namePlaceholder}
            value={profile.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="flex h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/30"
          />
        </div>
        <div>
          <label htmlFor="ob-age" className="mb-1.5 block text-sm font-medium text-foreground">
            {labels.ageLabel}
          </label>
          <input
            id="ob-age"
            type="number"
            min={1}
            max={120}
            placeholder={labels.agePlaceholder}
            value={profile.age}
            onChange={(e) => onUpdate({ age: e.target.value })}
            className="flex h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/30"
          />
        </div>
        <div>
          <label htmlFor="ob-gender" className="mb-1.5 block text-sm font-medium text-foreground">
            {labels.genderLabel}
          </label>
          <select
            id="ob-gender"
            value={profile.gender}
            onChange={(e) => onUpdate({ gender: e.target.value })}
            className="flex h-11 w-full appearance-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/30"
          >
            <option value="">{labels.genderPlaceholder}</option>
            {labels.genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <OnboardingNavigation
        backLabel={navLabels.back}
        continueLabel={navLabels.continue}
        showBack={false}
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!profile.name.trim()}
      />
    </>
  );
}
