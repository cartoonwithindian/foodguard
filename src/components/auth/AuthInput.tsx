import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthInputProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  rightElement,
  autoComplete,
  disabled,
}: AuthInputProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            rightElement && "pr-12",
            error
              ? "border-red-400 focus:ring-red-400/30"
              : "border-border hover:border-primary/30",
          )}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
