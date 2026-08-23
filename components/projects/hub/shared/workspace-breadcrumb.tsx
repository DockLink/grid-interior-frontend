"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";

export function WorkspaceBreadcrumb({
  items,
  onBack,
}: {
  items: string[];
  onBack: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onBack}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mb-4 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] transition-colors duration-150"
      style={{ color: hover ? "var(--figma-teal)" : "var(--figma-gray500)" }}
    >
      <MaterialIcon name="arrow_back" outlined size={16} />
      {items.join(" / ")}
    </button>
  );
}
