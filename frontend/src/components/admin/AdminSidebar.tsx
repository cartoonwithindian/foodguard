"use client";

import {
  LayoutDashboard,
  Users,
  Package,
  FlaskConical,
  BookOpen,
  ScrollText,
  BarChart3,
  Settings,
  History,
  UserCog,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminLabels } from "@/data/admin-labels";

export type AdminSection =
  | "dashboard"
  | "users"
  | "products"
  | "ingredients"
  | "evidence"
  | "analysis_logs"
  | "data_quality"
  | "system_settings"
  | "audit_logs"
  | "admin_profile";

type AdminSidebarProps = {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  labels: AdminLabels["sidebar"];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const NAV_ITEMS: { section: AdminSection; icon: typeof LayoutDashboard; labelKey: keyof AdminLabels["sidebar"] }[] = [
  { section: "dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { section: "users", icon: Users, labelKey: "users" },
  { section: "products", icon: Package, labelKey: "products" },
  { section: "ingredients", icon: FlaskConical, labelKey: "ingredients" },
  { section: "evidence", icon: BookOpen, labelKey: "evidence" },
  { section: "analysis_logs", icon: ScrollText, labelKey: "analysisLogs" },
  { section: "data_quality", icon: BarChart3, labelKey: "dataQuality" },
  { section: "system_settings", icon: Settings, labelKey: "systemSettings" },
  { section: "audit_logs", icon: History, labelKey: "auditLogs" },
  { section: "admin_profile", icon: UserCog, labelKey: "adminProfile" },
];

export function AdminSidebar({
  activeSection,
  onNavigate,
  labels,
  collapsed = false,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">
            FoodSafe
          </span>
        )}
        {collapsed && (
          <span className="mx-auto text-sm font-bold tracking-tight text-foreground">
            FS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.section;
          return (
            <button
              key={item.section}
              type="button"
              onClick={() => onNavigate(item.section)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? labels[item.labelKey] : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{labels[item.labelKey]}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border px-2 py-3">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? labels.logout : undefined}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{labels.logout}</span>}
        </button>
      </div>
    </aside>
  );
}
