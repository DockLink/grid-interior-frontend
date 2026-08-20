"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Shield } from "lucide-react";
import { toast } from "sonner";

import { useUserPreferences } from "@/components/providers/user-preferences-provider";
import { UserAvatar } from "@/components/user-management/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useUploadFile } from "@/hooks/use-upload-file";
import { authApiClient } from "@/lib/api/authenticated-client";
import { ROLE_LABEL, toSidebarRole } from "@/lib/navigation/sidebar-role";
import { normalizeUserFields } from "@/lib/user/display";
import type { User } from "@/types/users";

export function ProfileSettingsSection() {
  const { user, primaryRole, refreshUser } = useAuth();
  const { preferences, savePreferences } = useUserPreferences();
  const { uploadFile } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    const normalized = normalizeUserFields(user);
    setFirstName(normalized.first_name);
    setLastName(normalized.last_name);
  }, [user]);

  if (!user || !primaryRole) return null;

  const roleLabel = ROLE_LABEL[toSidebarRole(primaryRole)];
  const normalized = normalizeUserFields(user);
  const profileDirty =
    firstName !== normalized.first_name || lastName !== normalized.last_name;

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await authApiClient<User>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploadingAvatar(true);
    try {
      const { token } = await uploadFile(file);
      await savePreferences({ avatar_file_id: token });
      await refreshUser();
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    try {
      await savePreferences({ avatar_file_id: null });
      await refreshUser();
      toast.success("Avatar removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove avatar");
    }
  }

  return (
    <section className="rounded-2xl border border-[#E4E9F0] bg-white p-7">
      <h2 className="mb-1 text-[22px] font-bold text-[#16233D]">My Profile</h2>
      <p className="mb-6 text-[14px] text-[#5B6B85]">Manage your personal information.</p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <UserAvatar user={user} size={72} avatarFileId={preferences.avatar_file_id} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleAvatarChange(e)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? "Uploading…" : "Change photo"}
            </Button>
            {preferences.avatar_file_id ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleRemoveAvatar()}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <ProfileRow
            icon={<Mail size={15} className="text-[#5B6B85]" />}
            label="Email"
            value={user.email}
          />
          <ProfileRow
            icon={<Shield size={15} className="text-[#5B6B85]" />}
            label="Role"
            value={roleLabel}
          />

          {profileDirty ? (
            <Button
              type="button"
              disabled={savingProfile}
              onClick={() => void handleSaveProfile()}
              className="h-10 rounded-full bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFB] px-3 py-2.5">
      {icon}
      <span className="w-16 text-[12px] font-medium tracking-wide text-[#5B6B85] uppercase">
        {label}
      </span>
      <span className="flex-1 truncate text-[13px] text-[#16233D]">{value}</span>
    </div>
  );
}
