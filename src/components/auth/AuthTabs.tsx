import { cn } from "@/lib/utils";

type AuthTab = "login" | "signup";

type AuthTabsProps = {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  loginLabel: string;
  signupLabel: string;
};

export function AuthTabs({
  activeTab,
  onTabChange,
  loginLabel,
  signupLabel,
}: AuthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Authentication"
      className="flex rounded-xl bg-muted p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "login"}
        aria-controls="auth-form"
        onClick={() => onTabChange("login")}
        className={cn(
          "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          activeTab === "login"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {loginLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "signup"}
        aria-controls="auth-form"
        onClick={() => onTabChange("signup")}
        className={cn(
          "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          activeTab === "signup"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {signupLabel}
      </button>
    </div>
  );
}

export type { AuthTab };
