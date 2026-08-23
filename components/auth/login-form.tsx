"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as motion from "framer-motion/client";
import { Eye, EyeOff, Layers, Loader2, Lock, Mail } from "lucide-react";

import { AuthInput } from "@/components/auth/auth-input";
import { LOGIN_T } from "@/components/auth/login-tokens";
import { useAuth } from "@/hooks/use-auth";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { getPrimaryRole } from "@/lib/auth/rbac";
import { resolveGuestLandingRoute } from "@/lib/navigation/guest-landing";
import { resolveHomeRoute } from "@/lib/navigation/home-route";
import { isGuestRole } from "@/lib/user/guest";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/types/api";
import { NAV_ROUTES } from "@/types/navigation";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!email) next.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Password must be at least 6 characters";
    return next;
  };

  const redirectAfterLogin = async () => {
    if (isAuthDisabled()) {
      router.replace(NAV_ROUTES.superAdminDashboard);
      return;
    }

    const session = useAuthStore.getState().session;
    const roles = session?.user.roles ?? [];
    const role = roles.length ? getPrimaryRole(roles) : null;

    if (isGuestRole(roles)) {
      const route = await resolveGuestLandingRoute(roles);
      router.replace(route);
      return;
    }

    router.replace(
      role
        ? resolveHomeRoute(role, session?.user.preferences)
        : NAV_ROUTES.adminDashboard,
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      setFormError(null);
      setShakeKey((key) => key + 1);
      return;
    }

    setErrors({});
    setFormError(null);

    try {
      await login(email.trim(), password);
      await redirectAfterLogin();
    } catch (error) {
      setShakeKey((key) => key + 1);
      if (error instanceof ApiError) {
        setFormError(error.message);
        return;
      }
      setFormError(error instanceof Error ? error.message : "Unable to sign in");
    }
  };

  const shakeVariants = {
    shake: { x: [-4, 4, -4, 4, 0], transition: { duration: 0.3 } },
    idle: { x: 0 },
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-10 flex items-center gap-2.5">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${LOGIN_T.teal}, ${LOGIN_T.navy})`,
          }}
        >
          <Layers className="size-4 text-white" aria-hidden />
        </div>
        <span className="text-[15px] font-semibold text-[#16233D]">Grid Interior</span>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.22 }}
        className="mb-1.5 text-[28px] leading-tight font-bold text-[#16233D]"
      >
        Welcome back
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.22 }}
        className="mb-8 text-[14px] leading-relaxed text-[#5B6B85]"
      >
        Sign in to your studio workspace to manage projects, timelines, and team tasks.
      </motion.p>

      <motion.form
        key={shakeKey}
        variants={shakeVariants}
        animate={shakeKey > 0 ? "shake" : "idle"}
        onSubmit={handleSubmit}
        noValidate
        className="w-full"
      >
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          placeholder="you@gridinteior.studio"
          value={email}
          onChange={setEmail}
          error={errors.email}
          icon={Mail}
          index={0}
          autoComplete="email"
          disabled={isLoading}
        />
        <AuthInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={errors.password}
          icon={Lock}
          index={1}
          autoComplete="current-password"
          disabled={isLoading}
          rightSlot={
            !errors.password ? (
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="text-[#5B6B85] transition-colors hover:text-[#0FA8A0]"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            ) : undefined
          }
        />

        <div className="-mt-2 mb-6 flex justify-end">
          <Link
            href={NAV_ROUTES.forgotPassword}
            className="text-[13px] font-medium text-[#0FA8A0] transition-colors hover:text-[#0B9990]"
          >
            Forgot password?
          </Link>
        </div>

        {formError ? (
          <p className="mb-4 text-[13px] text-[#FF6B6B]" role="alert">
            {formError}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : undefined}
          whileTap={!isLoading ? { scale: 0.97 } : undefined}
          transition={{ duration: 0.15 }}
          className="flex w-full items-center justify-center gap-2.5 rounded-full py-3 text-[15px] font-semibold text-white transition-opacity disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${LOGIN_T.teal} 0%, ${LOGIN_T.navy} 100%)`,
            opacity: isLoading ? 0.85 : 1,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-[18px] animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </motion.form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E4E9F0]" />
        <span className="text-[12px] text-[#5B6B85]">internal access only</span>
        <div className="h-px flex-1 bg-[#E4E9F0]" />
      </div>

      <p className="text-center text-[12px] leading-relaxed text-[#5B6B85]">
        Don&apos;t have an account?{" "}
        <span className="font-medium text-[#16233D]">Contact your studio admin</span> to
        request access.
      </p>
    </div>
  );
}
