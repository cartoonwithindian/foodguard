"use client";

import { useEffect, useState } from "react";
import { getAdminLabels } from "@/data/admin-labels";
import type {
  AdminUser,
  PlatformStats,
  AssessmentDistribution,
  AnalysisActivityEntry,
  AdminUserEntry,
  ProductEntry,
  IngredientEntry,
  EvidenceEntry,
  DataQualityIssue,
  AnalysisLogEntry,
  SystemHealthEntry,
  AuditLogEntry,
  SystemSetting,
} from "@/data/admin-data";
import { AdminSidebar, type AdminSection } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { PlatformOverview } from "./PlatformOverview";
import { AnalysisActivity } from "./AnalysisActivity";
import { ConcernDistribution } from "./ConcernDistribution";
import { UserManagement } from "./UserManagement";
import { ProductManagement } from "./ProductManagement";
import { IngredientManagement } from "./IngredientManagement";
import { EvidenceManagement } from "./EvidenceManagement";
import { DataQuality } from "./DataQuality";
import { AnalysisLogs } from "./AnalysisLogs";
import { ErrorMonitoring } from "./ErrorMonitoring";
import { AuditLog } from "./AuditLog";
import { SystemSettings } from "./SystemSettings";
import { AdminProfile } from "./AdminProfile";
import { apiUrl } from "@/lib/network/api-url";

type AdminData = {
  admin: AdminUser;
  stats: PlatformStats;
  assessmentDistribution: AssessmentDistribution;
  analysisActivity: AnalysisActivityEntry[];
  users: AdminUserEntry[];
  products: ProductEntry[];
  ingredients: IngredientEntry[];
  evidenceEntries: EvidenceEntry[];
  dataQualityIssues: DataQualityIssue[];
  analysisLogs: AnalysisLogEntry[];
  systemHealth: SystemHealthEntry[];
  auditLog: AuditLogEntry[];
  systemSettings: SystemSetting[];
};

type AdminDashboardProps = {
  lang?: string;
};

export function AdminDashboard({ lang = "en" }: AdminDashboardProps) {
  const labels = getAdminLabels(lang);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch(apiUrl("/api/admin/data"));
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
        }
        const body = await res.json();
        if (!cancelled) {
          setData(body.data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load admin data");
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleNavigate = (section: AdminSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-md">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-destructive text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Failed to load dashboard</h2>
          <p className="text-sm text-muted-foreground">{error ?? "Unknown error"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <div className="hidden lg:flex">
        <AdminSidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          labels={labels.sidebar}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar — mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">
            <AdminSidebar
              activeSection={activeSection}
              onNavigate={handleNavigate}
              labels={labels.sidebar}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          labels={labels.header}
          onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {activeSection === "dashboard" && (
              <>
                <PlatformOverview
                  stats={data.stats}
                  labels={labels.overview}
                />
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <AnalysisActivity
                    entries={data.analysisActivity}
                    labels={labels.analysisActivity}
                  />
                  <ConcernDistribution
                    distribution={data.assessmentDistribution}
                    labels={labels.concernDistribution}
                  />
                </div>
                <ErrorMonitoring
                  health={data.systemHealth}
                  labels={labels.errorMonitoring}
                />
              </>
            )}

            {activeSection === "users" && (
              <UserManagement
                users={data.users}
                labels={labels.userManagement}
              />
            )}

            {activeSection === "products" && (
              <ProductManagement
                products={data.products}
                labels={labels.productManagement}
              />
            )}

            {activeSection === "ingredients" && (
              <IngredientManagement
                ingredients={data.ingredients}
                labels={labels.ingredientManagement}
              />
            )}

            {activeSection === "evidence" && (
              <EvidenceManagement
                entries={data.evidenceEntries}
                labels={labels.evidenceManagement}
              />
            )}

            {activeSection === "analysis_logs" && (
              <AnalysisLogs
                logs={data.analysisLogs}
                labels={labels.analysisLogs}
              />
            )}

            {activeSection === "data_quality" && (
              <DataQuality
                issues={data.dataQualityIssues}
                labels={labels.dataQuality}
              />
            )}

            {activeSection === "system_settings" && (
              <SystemSettings
                settings={data.systemSettings}
                labels={labels.systemSettings}
              />
            )}

            {activeSection === "audit_logs" && (
              <AuditLog
                entries={data.auditLog}
                labels={labels.auditLog}
              />
            )}

            {activeSection === "admin_profile" && (
              <AdminProfile admin={data.admin} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
