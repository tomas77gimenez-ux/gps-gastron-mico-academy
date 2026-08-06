import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, desc, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-soft">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold leading-[1.1] sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 text-muted-foreground leading-relaxed">{desc}</p>}
    </div>
  );
}
