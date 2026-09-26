"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SocialLoginButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function SocialLoginButton({
  label,
  icon,
  onClick,
  disabled,
  className,
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-colors",
        "hover:border-primary/30 hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}
