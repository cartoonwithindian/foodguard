"use client";

import { Mail, Shield } from "lucide-react";
import type { AdminUser, AdminRole } from "@/data/admin-data";

type AdminProfileProps = {
  admin: AdminUser;
};

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  data_admin: "Data Admin",
  content_reviewer: "Content Reviewer",
  support_admin: "Support Admin",
};

export function AdminProfile({ admin }: AdminProfileProps) {
  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-foreground">Admin Profile</h2>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {admin.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{admin.name}</h3>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden="true" />
                {admin.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="size-3.5" aria-hidden="true" />
                {ROLE_LABELS[admin.role]}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {ROLE_LABELS[admin.role]}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <p className="mt-1 text-sm font-medium text-emerald-700">Active</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">Permissions</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {admin.role === "super_admin"
                ? "Full Access"
                : admin.role === "data_admin"
                  ? "Data Management"
                  : admin.role === "content_reviewer"
                    ? "Review Only"
                    : "Support Access"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Role-based access control is enforced. Permissions are determined by your assigned role and cannot be modified from this interface.
          </p>
        </div>
      </div>
    </section>
  );
}
