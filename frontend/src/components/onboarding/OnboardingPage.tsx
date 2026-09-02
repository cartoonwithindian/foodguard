"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_LANGUAGE_ID } from "@/data/languages";
import {
  getOnboardingLabels,
  type OnboardingLabels,
} from "@/data/onboarding-labels";
import {
  INITIAL_PROFILE,
  TOTAL_STEPS,
  type UserProfile,
} from "@/data/onboarding-types";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { StepBasicInfo } from "@/components/onboarding/StepBasicInfo";
import { StepBodyInfo } from "@/components/onboarding/StepBodyInfo";
import { StepGoal } from "@/components/onboarding/StepGoal";
import { StepDiet } from "@/components/onboarding/StepDiet";
import { StepAllergies } from "@/components/onboarding/StepAllergies";
import { StepHealth } from "@/components/onboarding/StepHealth";
import { ProfileSummary } from "@/components/onboarding/ProfileSummary";

const LANGUAGE_KEY = "app-preferred-language";

function getInitialLabels(): OnboardingLabels {
  try {
    const lang = sessionStorage.getItem(LANGUAGE_KEY) ?? DEFAULT_LANGUAGE_ID;
    return getOnboardingLabels(lang);
  } catch {
    return getOnboardingLabels(DEFAULT_LANGUAGE_ID);
  }
}

export function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [labels] = useState<OnboardingLabels>(getInitialLabels);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((target: number) => {
    setStep(target);
  }, []);

  const progressLabel = labels.progress
    .replace("{current}", String(Math.min(step, TOTAL_STEPS)))
    .replace("{total}", String(TOTAL_STEPS));

  return (
    <OnboardingLayout>
      <div className="flex flex-1 flex-col gap-6">
        <ProgressIndicator
          currentStep={Math.min(step, TOTAL_STEPS)}
          totalSteps={TOTAL_STEPS}
          label={progressLabel}
        />

        <div className="flex flex-1 flex-col">
          {step === 1 && (
            <StepBasicInfo
              labels={labels.step1}
              navLabels={labels.nav}
              profile={profile}
              onUpdate={updateProfile}
              onBack={() => router.push("/login")}
              onContinue={goNext}
            />
          )}
          {step === 2 && (
            <StepBodyInfo
              labels={labels.step2}
              navLabels={labels.nav}
              profile={profile}
              onUpdate={updateProfile}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {step === 3 && (
            <StepGoal
              labels={labels.step3}
              navLabels={labels.nav}
              profile={profile}
              onUpdate={updateProfile}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {step === 4 && (
            <StepDiet
              labels={labels.step4}
              navLabels={labels.nav}
              profile={profile}
              onUpdate={updateProfile}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {step === 5 && (
            <StepAllergies
              labels={labels.step5}
              navLabels={labels.nav}
              profile={profile}
              onUpdate={updateProfile}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {step === 6 && (
            <StepHealth
              labels={labels.step6}
              navLabels={labels.nav}
              profile={profile}
              onUpdate={updateProfile}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {step === TOTAL_STEPS + 1 && (
            <ProfileSummary
              labels={labels.summary}
              navLabels={labels.nav}
              profile={profile}
              onEdit={goToStep}
              onFinish={() => router.push("/")}
            />
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
