"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { firebaseLogPageView } from "@/lib/firebase/analytics";

export function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    void firebaseLogPageView(pathname);
  }, [pathname]);

  return null;
}