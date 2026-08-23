import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export function MaterialIcon({
  name,
  outlined = false,
  className,
  size = 18,
  style,
}: {
  name: string;
  outlined?: boolean;
  className?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(outlined ? "material-icons-outlined" : "material-icons", className)}
      style={{ fontSize: size, lineHeight: 1, ...style }}
      aria-hidden
    >
      {name}
    </span>
  );
}
