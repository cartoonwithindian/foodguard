import type { ReactNode } from "react";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6 pt-8 sm:px-6 sm:pt-10 md:max-w-lg">
        {children}
      </div>
    </div>
  );
}
