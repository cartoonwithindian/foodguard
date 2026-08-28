"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { firebaseGetProfile, firebaseSaveProfile } from "@/lib/firebase/db";
import { firebaseUpdateDisplayName } from "@/lib/firebase/auth";
import { ProfileHeader } from "./ProfileHeader";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { GoalsSection } from "./GoalsSection";
import { ProductPreferencesSection } from "./ProductPreferencesSection";
import { AnalysisPreferencesSection } from "./AnalysisPreferencesSection";
import { LanguageSection } from "./LanguageSection";
import { PrivacySection } from "./PrivacySection";
import { SecuritySection } from "./SecuritySection";
import { AccountActionsSection } from "./AccountActionsSection";
import {
  MOCK_PROFILE,
  MOCK_GOAL,
  MOCK_GOAL_PREFS,
  MOCK_PRODUCT_PREFS,
  MOCK_ANALYSIS_PREFS,
  MOCK_PRIVACY,
  MOCK_SECURITY,
  type UserProfile,
  type UserGoal,
  type GoalSubPreference,
  type ProductPreference,
  type AnalysisPreference,
  type PrivacySettings,
} from "@/data/profile-data";
import { getProfileLabels } from "@/data/profile-labels";

type ProfilePageProps = {
  lang?: string;
};

export function ProfilePage({ lang = "en" }: ProfilePageProps) {
  const router = useRouter();
  const t = getProfileLabels(lang);
  const { firebaseMode, firebaseUser, logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [goal, setGoal] = useState<UserGoal>(MOCK_GOAL);
  const [goalPrefs, setGoalPrefs] = useState<GoalSubPreference[]>(MOCK_GOAL_PREFS);
  const [productPrefs, setProductPrefs] = useState<ProductPreference[]>(MOCK_PRODUCT_PREFS);
  const [analysisPrefs, setAnalysisPrefs] = useState<AnalysisPreference[]>(MOCK_ANALYSIS_PREFS);
  const [privacy, setPrivacy] = useState<PrivacySettings>(MOCK_PRIVACY);
  const [language, setLanguage] = useState(lang);

  useEffect(() => {
    if (!firebaseMode || !firebaseUser) return;
    let cancelled = false;
    void firebaseGetProfile(firebaseUser.uid).then((fbProfile) => {
      if (cancelled || !fbProfile) return;
      setProfile((prev) => ({
        ...prev,
        id: fbProfile.id,
        name: fbProfile.name || prev.name,
        email: fbProfile.email || firebaseUser.email || prev.email,
        memberSince: fbProfile.memberSince || prev.memberSince,
      }));
      if (fbProfile.language === "hi" || fbProfile.language === "en") {
        setLanguage(fbProfile.language);
        sessionStorage.setItem("app-preferred-language", fbProfile.language);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [firebaseMode, firebaseUser]);

  const handleSaveProfile = useCallback(
    (updated: UserProfile) => {
      setProfile(updated);
      if (firebaseMode && firebaseUser) {
        void firebaseSaveProfile(firebaseUser.uid, {
          name: updated.name,
          email: updated.email,
        });
        void firebaseUpdateDisplayName(updated.name);
      }
    },
    [firebaseMode, firebaseUser],
  );

  const handleSaveGoals = useCallback((newGoal: UserGoal, newPrefs: GoalSubPreference[]) => {
    setGoal(newGoal);
    setGoalPrefs(newPrefs);
  }, []);

  const handleSaveProductPrefs = useCallback((prefs: ProductPreference[]) => {
    setProductPrefs(prefs);
  }, []);

  const handleSaveAnalysisPrefs = useCallback((prefs: AnalysisPreference[]) => {
    setAnalysisPrefs(prefs);
  }, []);

  const handleSavePrivacy = useCallback((settings: PrivacySettings) => {
    setPrivacy(settings);
  }, []);

  const handleLanguageChange = useCallback(
    (langId: string) => {
      setLanguage(langId);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("app-preferred-language", langId);
      }
      if (firebaseMode && firebaseUser) {
        void firebaseSaveProfile(firebaseUser.uid, { language: langId });
      }
    },
    [firebaseMode, firebaseUser],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5 text-foreground" aria-hidden="true" />
          </button>
          <Settings className="size-5 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-base font-semibold text-foreground">{t.header.title}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4 sm:space-y-5 sm:px-6">
        <ProfileHeader
          profile={profile}
          editProfileLabel={t.header.editProfile}
        />

        <PersonalInfoSection
          profile={profile}
          labels={t.personalInfo}
          onSave={handleSaveProfile}
        />

        <GoalsSection
          initialGoal={goal}
          initialPrefs={goalPrefs}
          labels={t.goals}
          onSave={handleSaveGoals}
        />

        <ProductPreferencesSection
          initialPrefs={productPrefs}
          labels={t.productPreferences}
          onSave={handleSaveProductPrefs}
        />

        <AnalysisPreferencesSection
          initialPrefs={analysisPrefs}
          labels={t.analysisPreferences}
          onSave={handleSaveAnalysisPrefs}
        />

        <LanguageSection
          currentLanguage={language}
          labels={t.language}
          onChange={handleLanguageChange}
        />

        <PrivacySection
          initial={privacy}
          labels={t.privacy}
          onSave={handleSavePrivacy}
        />

        <SecuritySection
          info={MOCK_SECURITY}
          labels={t.security}
        />

        <AccountActionsSection
          labels={t.accountActions}
          onLogout={() => {
            logout();
            router.push("/");
          }}
          onDeleteAccount={() => {}}
        />
      </main>
    </div>
  );
}
