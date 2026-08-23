"use client";

import { UserAvatar } from "@/components/user-management/user-avatar";
import { UserPill } from "@/components/user-management/user-pill";
import { DemoCaption } from "@/components/demo/demo-caption";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getUserDisplayName } from "@/lib/user/display";
import type { User, UserRole, UserStatus } from "@/types/users";

const ROLE_PILL: Record<UserRole, { bg: string; color: string; label: string }> = {
  SUPER_ADMIN: { bg: "#F5E6D0", color: "#D4A96A", label: "Super Admin" },
  ADMIN: { bg: "#F5E6D0", color: "#D4A96A", label: "Admin" },
  TEAM_LEAD: { bg: "#DBEAFE", color: "#1E3A8A", label: "Team Lead" },
  MEMBER: { bg: "#F5EFE6", color: "#6B5744", label: "Member" },
  GUEST: { bg: "#F5EFE6", color: "#6B5744", label: "Guest" },
  CLIENT_FULL_ACCESS: { bg: "#E8F0FE", color: "#1E4A7A", label: "Full view access" },
};

const STATUS_PILL: Record<UserStatus, { bg: string; color: string }> = {
  ACTIVE: { bg: "#D8F3DC", color: "#2D6A4F" },
  INACTIVE: { bg: "#F5EFE6", color: "#9C8573" },
};

const MOCK_ACTIVITY = [
  { id: "a1", text: "Signed in from Chrome on macOS", at: "2h ago" },
  { id: "a2", text: "Updated project Lumière Penthouse", at: "Yesterday" },
  { id: "a3", text: "Uploaded FF&E Schedule v4.xlsx", at: "3d ago" },
];

export function UserDetailSheet({
  user,
  open,
  onClose,
  onEditRole,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onEditRole?: () => void;
}) {
  const role = user?.roles[0] ?? "MEMBER";
  const roleCfg = ROLE_PILL[role];
  const statusCfg = user ? STATUS_PILL[user.status] : STATUS_PILL.INACTIVE;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="bg-white">
        <SheetHeader className="relative">
          <SheetTitle>{user ? getUserDisplayName(user) : "User"}</SheetTitle>
          <SheetCloseButton onClick={onClose} />
        </SheetHeader>
        <SheetBody className="space-y-5">
          {user && (
            <>
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size={48} />
                <div>
                  <p className="font-semibold text-[#16233D]">{getUserDisplayName(user)}</p>
                  <p className="text-[13px] text-[#5B6B85]">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <UserPill bg={roleCfg.bg} color={roleCfg.color}>
                  {roleCfg.label}
                </UserPill>
                <UserPill bg={statusCfg.bg} color={statusCfg.color}>
                  {user.status === "ACTIVE" ? "Active" : "Inactive"}
                </UserPill>
              </div>
              {onEditRole && user.status === "ACTIVE" && (
                <Button variant="outline" size="sm" onClick={onEditRole}>
                  Edit role
                </Button>
              )}
              <div>
                <p className="mb-2 text-[12px] font-semibold tracking-wide text-[#5B6B85] uppercase">
                  Activity
                </p>
                <DemoCaption className="mb-2" />
                <div className="space-y-2">
                  {MOCK_ACTIVITY.map((a) => (
                    <div key={a.id} className="rounded-lg bg-[#F8FAFB] p-3">
                      <p className="text-[13px] text-[#16233D]">{a.text}</p>
                      <p className="text-[11px] text-[#5B6B85]">{a.at}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
