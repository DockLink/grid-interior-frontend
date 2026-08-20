"use client";

export function HubProgressBar({
  value,
  color = "var(--figma-teal)",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-[var(--figma-gray100)] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3)]">
        <div
          className="h-full rounded-sm transition-all duration-400"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[11px] text-[var(--figma-gray500)]">{value}%</span>
    </div>
  );
}
