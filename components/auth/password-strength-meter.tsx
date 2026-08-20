"use client";

import { LOGIN_T } from "@/components/auth/login-tokens";

export function PasswordStrengthMeter({ password }: { password: string }) {
  function calcStrength(pw: string) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  const strength = calcStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#E4E9F0", "#FF6B6B", "#FFAA3B", "#0FA8A0", "#2FBE6B"];
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i <= strength ? colors[strength] : LOGIN_T.border }}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-medium" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  );
}
