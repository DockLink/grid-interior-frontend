"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import * as motion from "framer-motion/client";

import { AuthBrandMark } from "@/components/auth/auth-brand-mark";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LOGIN_T } from "@/components/auth/login-tokens";
import { NAV_ROUTES } from "@/types/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  }

  return (
    <div
      className="flex min-h-svh items-center justify-center px-4 py-12"
      style={{ background: LOGIN_T.surface, fontFamily: "Aptos, Calibri, system-ui, sans-serif" }}
    >
      <AuthCard>
        <AuthBrandMark />
        {sent ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-1 text-[22px] font-bold text-[#16233D]">Check your inbox</h1>
            <p className="mb-6 text-[14px] leading-relaxed text-[#5B6B85]">
              If an account exists for <span className="font-medium text-[#16233D]">{email}</span>,
              we sent a reset link. This demo does not send a real email.
            </p>
            <Alert variant="success">
              <AlertTitle>Reset link ready</AlertTitle>
              <AlertDescription>
                Continue to the demo reset screen to set a new password.
              </AlertDescription>
            </Alert>
            <Link
              href={NAV_ROUTES.resetPassword}
              className="mt-6 flex w-full items-center justify-center rounded-full py-3 text-[15px] font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${LOGIN_T.teal} 0%, ${LOGIN_T.navy} 100%)`,
              }}
            >
              Continue to reset
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="mb-1 text-[22px] font-bold text-[#16233D]">Reset your password</h1>
            <p className="mb-6 text-[14px] leading-relaxed text-[#5B6B85]">
              Enter the email associated with your studio account and we&apos;ll send a reset link.
            </p>
            <form onSubmit={(e) => void handleSubmit(e)}>
              <AuthInput
                id="forgot-email"
                label="Email address"
                type="email"
                placeholder="you@gridinterior.studio"
                value={email}
                onChange={setEmail}
                error={error ?? undefined}
                icon={Mail}
                autoComplete="email"
                disabled={loading}
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
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
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
