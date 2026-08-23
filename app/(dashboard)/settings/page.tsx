"use client";

import { useMemo, useState } from "react";
import { KeyRound, Palette, ShieldCheck, SlidersHorizontal, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { AppearanceSettingsSection } from "@/components/settings/appearance-settings-section";
import { PreferencesSettingsSection } from "@/components/settings/preferences-settings-section";
import { ProfileSettingsSection } from "@/components/settings/profile-settings-section";
import { SecuritySettingsSection } from "@/components/settings/security-settings-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isSuperAdminRole } from "@/lib/navigation/sidebar-role";
import { cn } from "@/lib/utils";

type SettingsSection = "profile" | "preferences" | "sessions" | "appearance";

const SETTINGS_NAV: {
  id: SettingsSection;
  label: string;
  icon: typeof UserIcon;
  superAdminOnly?: boolean;
}[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "sessions", label: "Sessions", icon: ShieldCheck },
  { id: "appearance", label: "Appearance", icon: Palette, superAdminOnly: true },
];

export default function SettingsPage() {
  const { user, primaryRole } = useAuth();
  const isSuperAdmin = isSuperAdminRole(primaryRole);
  const [section, setSection] = useState<SettingsSection>("profile");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validationError = useMemo(() => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (confirmPassword && newPassword !== confirmPassword)
      return "New password and confirmation do not match.";
    return null;
  }, [newPassword, confirmPassword]);

  const canSubmit =
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    !validationError &&
    !submitting;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await authApiClient("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      toast.success("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  const visibleNav = SETTINGS_NAV.filter((n) => !n.superAdminOnly || isSuperAdmin);

  return (
    <div className="-mx-4 -mt-6 flex min-h-[calc(100vh-72px)] gap-0 md:-mx-8 md:-mt-7">
      <aside className="w-[200px] shrink-0 border-r border-[#E4E9F0] bg-white px-3 pt-8 pb-6">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-widest text-[#5B6B85] uppercase">
          Settings
        </p>
        <nav className="space-y-0.5">
          {visibleNav.map((item) => {
            const active = section === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                  active ? "bg-[rgba(15,168,160,0.08)] text-[#0FA8A0]" : "text-[#5B6B85] hover:bg-[#F8FAFB]",
                )}
              >
                {active ? (
                  <span className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-[#0FA8A0]" />
                ) : null}
                <Icon size={16} color={active ? "#0FA8A0" : "#8A9BB5"} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 px-6 py-8 md:px-8">
        {section === "profile" ? (
          <div className="max-w-[760px] space-y-5">
            <ProfileSettingsSection />
            <section className="rounded-2xl border border-[#E4E9F0] bg-white p-7">
              <div className="mb-4 flex items-center gap-2">
                <KeyRound size={16} className="text-[#0FA8A0]" />
                <h2 className="text-[15px] font-semibold text-[#16233D]">Change password</h2>
              </div>
              <p className="mb-4 text-[13px] text-[#5B6B85]">
                Enter a new password below. You will stay signed in on this device.
              </p>
              <form onSubmit={(e) => void handleChangePassword(e)} className="grid max-w-xl gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="new-password">New password</Label>
                  <PasswordInput
                    id="new-password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="At least 8 characters"
                    className="h-10"
                  />
                  <PasswordStrengthMeter password={newPassword} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <PasswordInput
                    id="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Re-enter new password"
                    className="h-10"
                  />
                </div>
                <div className="sm:col-span-2">
                  {(validationError || error) && (
                    <p className="mb-3 text-[13px] text-[#FF6B6B]">{validationError ?? error}</p>
                  )}
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="h-10 rounded-full bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
                  >
                    {submitting ? "Updating…" : "Update password"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        ) : null}
        {section === "preferences" ? <PreferencesSettingsSection /> : null}
        {section === "sessions" ? (
          <div className="max-w-[760px]">
            <h2 className="mb-1 text-[22px] font-bold text-[#16233D]">Sessions</h2>
            <p className="mb-6 text-[14px] text-[#5B6B85]">
              Review devices signed in to your account and revoke unused sessions.
            </p>
            <SecuritySettingsSection />
          </div>
        ) : null}
        {section === "appearance" && isSuperAdmin ? <AppearanceSettingsSection /> : null}
      </div>
    </div>
  );
}
