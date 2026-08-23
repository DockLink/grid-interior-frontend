import { LOGIN_T } from "@/components/auth/login-tokens";
import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className,
  width = 480,
}: {
  children: React.ReactNode;
  className?: string;
  width?: number;
}) {
  return (
    <div
      className={cn("w-full rounded-2xl border bg-white p-8 sm:p-10", className)}
      style={{
        maxWidth: width,
        borderColor: LOGIN_T.border,
        boxShadow: LOGIN_T.shadow,
      }}
    >
      {children}
    </div>
  );
}
