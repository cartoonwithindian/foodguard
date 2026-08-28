"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { AuthInput } from "@/components/auth/AuthInput";

type PasswordInputProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  disabled,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      autoComplete={autoComplete}
      disabled={disabled}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
