"use client";

import type { OnboardingLabels } from "@/data/onboarding-labels";
import type { UserProfile } from "@/data/onboarding-types";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

const GOAL_MAP: Record<string, string> = {
  lose: "Lose Weight",
  gain: "Gain Weight",
  maintain: "Maintain Weight",
  general: "General Healthy Choices",
};

const ACTIVITY_MAP: Record<string, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
};

const DIET_MAP: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
  non_vegetarian: "Non-Vegetarian",
  jain: "Jain",
  no_preference: "No Preference",
  other: "Other",
};

const ALLERGY_MAP: Record<string, string> = {
  milk: "Milk / Dairy",
  eggs: "Eggs",
  peanuts: "Peanuts",
  tree_nuts: "Tree Nuts",
  soy: "Soy",
  gluten: "Gluten",
  fish: "Fish",
  shellfish: "Shellfish",
  other: "Other",
};

const HEALTH_MAP: Record<string, string> = {
  diabetes: "Diabetes",
  high_blood_pressure: "High Blood Pressure",
  high_cholesterol: "High Cholesterol",
  sensitive_skin: "Sensitive Skin",
  none: "None",
  prefer_not_to_say: "Prefer not to say",
};

type ProfileSummaryProps = {
  labels: OnboardingLabels["summary"];
  navLabels: OnboardingLabels["nav"];
  profile: UserProfile;
  onEdit: (step: number) => void;
  onFinish: () => void;
};

export function ProfileSummary({
  labels,
  navLabels,
  profile,
  onEdit,
  onFinish,
}: ProfileSummaryProps) {
  const rows: { label: string; value: string; editStep: number }[] = [];

  if (profile.goal) {
    rows.push({
      label: labels.goalLabel,
      value: GOAL_MAP[profile.goal] ?? profile.goal,
      editStep: 3,
    });
  }

  if (profile.dietaryPreferences.length > 0) {
    rows.push({
      label: labels.dietLabel,
      value: profile.dietaryPreferences
        .map((d) => DIET_MAP[d] ?? d)
        .join(", "),
      editStep: 4,
    });
  }

  const allergyValues = [
    ...profile.allergies.map((a) => ALLERGY_MAP[a] ?? a),
    ...profile.customAllergies,
  ];
  if (allergyValues.length > 0) {
    rows.push({
      label: labels.allergiesLabel,
      value: allergyValues.join(", "),
      editStep: 5,
    });
  }

  if (profile.activityLevel) {
    rows.push({
      label: labels.activityLabel,
      value: ACTIVITY_MAP[profile.activityLevel] ?? profile.activityLevel,
      editStep: 2,
    });
  }

  if (profile.healthConsiderations.length > 0) {
    rows.push({
      label: labels.healthLabel,
      value: profile.healthConsiderations
        .map((h) => HEALTH_MAP[h] ?? h)
        .join(", "),
      editStep: 6,
    });
  }

  return (
    <>
      <StepHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex flex-1 flex-col gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {row.value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.editStep)}
              className="shrink-0 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {labels.editButton}
            </button>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No preferences selected.
          </p>
        )}
      </div>
      <OnboardingNavigation
        backLabel={navLabels.back}
        continueLabel={navLabels.finish}
        showBack
        isLast
        onBack={() => onEdit(6)}
        onContinue={onFinish}
      />
    </>
  );
}
