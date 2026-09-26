"use client";

import { User, Camera } from "lucide-react";
import type { UserProfile } from "@/data/profile-data";

type ProfileHeaderProps = {
  profile: UserProfile;
  editProfileLabel: string;
  onEdit?: () => void;
};

export function ProfileHeader({ profile, editProfileLabel, onEdit }: ProfileHeaderProps) {
  const memberDate = new Date(profile.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <User className="size-8 text-primary" aria-hidden="true" />
          </div>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted"
            aria-label="Change avatar"
          >
            <Camera className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground truncate">{profile.email}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
              {profile.accountStatus === "active" ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-muted-foreground">
              Member since {memberDate}
            </span>
          </div>
        </div>

        {/* Edit button */}
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {editProfileLabel}
        </button>
      </div>
    </div>
  );
}
