import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const variantStyles = {
  default: "bg-primary/20 text-primary",
  secondary: "bg-secondary/20 text-secondary",
  destructive: "bg-destructive/20 text-destructive",
  outline: "border border-border text-foreground",
  success: "bg-green-500/20 text-green-500",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
