import { Hand } from "lucide-react";
import type { DashboardLabels } from "@/data/dashboard-labels";

type WelcomeSectionProps = {
  labels: DashboardLabels["greeting"];
  userName: string;
};

export function WelcomeSection({ labels, userName }: WelcomeSectionProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {labels.welcomeBack.replace("{name}", userName)}
        <Hand className="ml-2 inline-block size-6 text-primary sm:size-7" aria-hidden="true" />
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {labels.subtitle}
      </p>
    </div>
  );
}
