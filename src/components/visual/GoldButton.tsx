import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "ghost";
  size?: "md" | "lg";
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = "gold", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "shine inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight",
        "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
        "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        size === "lg" ? "h-12 px-7 text-[0.95rem]" : "h-10 px-5 text-sm",
        variant === "gold"
          ? "bg-primary text-primary-foreground glow-gold hover:bg-primary-hover"
          : "hairline bg-transparent text-foreground hover:border-border-strong hover:bg-secondary/60",
        className,
      )}
      {...props}
    />
  ),
);
GoldButton.displayName = "GoldButton";
