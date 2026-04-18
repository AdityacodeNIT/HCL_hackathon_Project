import { cn } from "@/lib/utils.js";

export function Badge({ className, variant = "default", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        variant === "secondary"
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary/15 text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
