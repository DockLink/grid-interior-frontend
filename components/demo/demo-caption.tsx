import { cn } from "@/lib/utils";

export function DemoCaption({
  children = "Demo data — not connected to the API.",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[11px] font-medium tracking-wide text-[#5B6B85]", className)}>
      {children}
    </p>
  );
}
