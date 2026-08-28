"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const PUBLIC_ROUTES = ["/login", "/auth", "/onboarding", "/welcome"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, isPublic, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
