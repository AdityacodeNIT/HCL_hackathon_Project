import { cn } from "@/lib/utils.js";

export function Alert({ className, variant = "default", children }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "destructive"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-secondary/50 text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
