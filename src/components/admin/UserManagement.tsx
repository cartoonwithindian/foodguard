"use client";

import { useState } from "react";
import { Search, Eye, Ban, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUserEntry, UserStatus } from "@/data/admin-data";
import type { AdminLabels } from "@/data/admin-labels";

type UserManagementProps = {
  users: AdminUserEntry[];
  labels: AdminLabels["userManagement"];
};

const STATUS_STYLES: Record<UserStatus, { dot: string; text: string; bg: string }> = {
  active: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  suspended: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  inactive: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50" },
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "active",
  suspended: "suspended",
  inactive: "inactive",
};

export function UserManagement({ users, labels }: UserManagementProps) {
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.search}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.user}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.email}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.registrationDate}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.totalScans}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.lastActivity}
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                {labels.columns.status}
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                {labels.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => {
              const statusStyle = STATUS_STYLES[user.status];
              const statusKey = STATUS_LABELS[user.status];
              const statusLabel = statusKey === "active" ? labels.active : statusKey === "suspended" ? labels.suspended : labels.inactive;
              return (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {user.registrationDate}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-foreground">
                    {user.totalScans}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {user.lastActivity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                        statusStyle.bg,
                        statusStyle.text,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", statusStyle.dot)} aria-hidden="true" />
                      {statusLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={labels.view}
                        title={labels.view}
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-700"
                        aria-label={labels.suspend}
                        title={labels.suspend}
                      >
                        <Ban className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(user.id)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-700"
                        aria-label={labels.delete}
                        title={labels.delete}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-semibold text-foreground">
              {labels.deleteConfirm}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{labels.deleteMessage}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {labels.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
