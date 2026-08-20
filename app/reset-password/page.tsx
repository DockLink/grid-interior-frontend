"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

import { AuthBrandMark } from "@/components/auth/auth-brand-mark";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LOGIN_T } from "@/components/auth/login-tokens";
import { NAV_ROUTES } from "@/types/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
    window.setTimeout(() => router.replace(NAV_ROUTES.login), 1400);
  }

  return (
    <div
      className="flex min-h-svh items-center justify-center px-4 py-12"
      style={{ background: LOGIN_T.surface, fontFamily: "Aptos, Calibri, system-ui, sans-serif" }}
    >
      <AuthCard>
        <AuthBrandMark />
        <h1 className="mb-1 text-[22px] font-bold text-[#16233D]">Set a new password</h1>
        <p className="mb-6 text-[14px] leading-relaxed text-[#5B6B85]">
          Choose a strong password you haven&apos;t used before.
        </p>
        {done ? (
          <Alert variant="success">
            <AlertDescription>Password updated. Redirecting to sign in…</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <AuthInput
              id="new-password"
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={setPassword}
              icon={Lock}
              autoComplete="new-password"
              disabled={loading}
            />
            <PasswordStrengthMeter password={password} />
            <AuthInput
              id="confirm-password"
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={setConfirm}
              icon={Lock}
              index={1}
              autoComplete="new-password"
              disabled={loading}
              error={error ?? undefined}
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-semibold text-white disabled:opacity-80"
              style={{
                background: `linear-gradient(135deg, ${LOGIN_T.teal} 0%, ${LOGIN_T.navy} 100%)`,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}
        <Link
          href={NAV_ROUTES.login}
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5B6B85] hover:text-[#0FA8A0]"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </AuthCard>
    </div>
  );
}
