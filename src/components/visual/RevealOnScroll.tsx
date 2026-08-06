import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Progressive-enhancement scroll reveal.
 * Content is visible by default (SSR / no-JS safe); JS only hides it
 * when it is *below* the viewport, then reveals it once.
 */
export function RevealOnScroll({ children, delay = 0, className = "", as = "div" }: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    // Already in view on load → never animate.
    if (rect.top < window.innerHeight * 0.92) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.setTimeout(() => setState("shown"), delay);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    // Safety net: never leave content invisible.
    const failsafe = window.setTimeout(() => setState("shown"), 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay]);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      data-reveal={state === "idle" ? undefined : state}
    >
      {children}
    </Tag>
  );
}
